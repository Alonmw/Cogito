# backend/app/dialogue/routes.py
# v7: Save history for any authenticated user, not just email_verified

from flask import Blueprint, request, jsonify, current_app
from openai import OpenAIError
from ..auth.utils import verify_token
from ..extensions import db
from ..models import User, Conversation, Message  # Ensure models are imported
from datetime import datetime, timezone, timedelta

dialogue_bp = Blueprint('dialogue', __name__, url_prefix='/api')


def get_or_create_user(firebase_uid: str, email: str | None = None, display_name: str | None = None) -> User | None:
    """Finds a user by firebase_uid or creates a new one. Returns None on failure."""
    if not firebase_uid:
        current_app.logger.error("get_or_create_user called with empty or None firebase_uid")
        return None
    user = db.session.scalars(db.select(User).filter_by(firebase_uid=firebase_uid)).first()
    if not user:
        current_app.logger.info(f"Creating new user record for firebase_uid: {firebase_uid}")
        current_app.logger.info(f"User details for creation - Email: {email}, Name: {display_name}")
        user = User(
            firebase_uid=firebase_uid,
            email=email,
            display_name=display_name
        )
        db.session.add(user)
        try:
            db.session.commit()
            current_app.logger.info(f"Successfully created user with ID: {user.id} for firebase_uid: {firebase_uid}")
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Failed to create user record for {firebase_uid}: {e}", exc_info=True)
            return None
    return user


@dialogue_bp.route('/dialogue', methods=['POST'])
def handle_dialogue():
    """Handles incoming conversation history, gets AI response,
       and saves history for authenticated users."""

    decoded_token = verify_token()
    current_app.logger.info(f"Decoded token content: {decoded_token}")

    current_user_id = decoded_token.get('uid') if decoded_token else None
    user_email = decoded_token.get('email') if decoded_token else None
    user_name = (decoded_token.get('name') or decoded_token.get('displayName')) if decoded_token else None
    # We still get email_verified status for logging, but won't use it to block user creation/history saving
    is_email_verified_in_token = decoded_token and decoded_token.get('email_verified',
                                                                     False) if decoded_token else False

    current_app.logger.info(
        f"Extracted from token - UID: {current_user_id}, Email: {user_email}, Name: {user_name}, Email Verified in Token: {is_email_verified_in_token}")

    user_log_id = f"user ID: {current_user_id}" if current_user_id else "guest user"
    openai_user_param = str(current_user_id) if current_user_id else f"guest_session_{request.remote_addr}"

    db_user: User | None = None
    # --- Modified Condition: Save/retrieve user if UID exists, regardless of email_verified status ---
    if current_user_id:
        try:
            current_app.logger.info(
                f"Attempting get_or_create_user with UID: {current_user_id}, Email: {user_email}, Name: {user_name}")
            db_user = get_or_create_user(current_user_id, user_email, user_name)
            if not db_user:
                current_app.logger.error(f"get_or_create_user returned None for UID: {current_user_id}")
                # This error means DB operation failed, so it's a server error
                return jsonify({"error": "Could not process user information due to a database issue."}), 500
        except Exception as e:
            current_app.logger.error(f"Exception during get_or_create_user call for UID {current_user_id}: {e}",
                                     exc_info=True)
            return jsonify({"error": "Could not process user information."}), 500
    # --- End Modified Condition ---

    current_app.logger.info(
        f"Dialogue request received from {user_log_id} (Email Verified in Token: {is_email_verified_in_token}, DB User ID: {db_user.id if db_user else 'N/A'})")

    client = current_app.openai_client
    # ... (rest of the function: OpenAI call, history saving if db_user exists) ...
    system_prompt = current_app.system_prompt
    max_history = current_app.config.get('MAX_HISTORY_MSGS', 20)

    if not client:
        current_app.logger.error(f"OpenAI client not initialized for request from {user_log_id}")
        return jsonify({"error": "OpenAI client not initialized. Check API key."}), 503

    try:
        data = request.get_json()
        if not data:
            current_app.logger.warning(f"Invalid JSON received from {user_log_id}")
            return jsonify({"error": "Invalid JSON request body"}), 400

        conversation_history = data.get('history')
        if not conversation_history or not isinstance(conversation_history, list):
            current_app.logger.warning(
                f"Missing/invalid history from {user_log_id}. Type: {type(conversation_history)}")
            return jsonify({"error": "Missing or invalid 'history' list in request body"}), 400

        latest_user_message_content = None
        if conversation_history and conversation_history[-1].get('role') == 'user':
            latest_user_message_content = conversation_history[-1].get('content')

        if len(conversation_history) > max_history:
            current_app.logger.info(
                f"History truncated for {user_log_id} from {len(conversation_history)} to {max_history} messages.")
            conversation_history_for_openai = conversation_history[-max_history:]
        else:
            conversation_history_for_openai = conversation_history

        messages_for_openai = [{"role": "system", "content": system_prompt}]
        messages_for_openai.extend(conversation_history_for_openai)
        current_app.logger.debug(f"Messages sent to OpenAI: {messages_for_openai}")

        try:
            current_app.logger.debug(f"Sending {len(messages_for_openai)} messages to OpenAI for {user_log_id}.")
            completion = client.chat.completions.create(
                model=current_app.config.get('OPENAI_MODEL', 'gpt-4-turbo'),
                messages=messages_for_openai,
                temperature=current_app.config.get('OPENAI_TEMPERATURE', 0.7),
                max_tokens=current_app.config.get('OPENAI_MAX_TOKENS', 100),
                user=openai_user_param
            )
            ai_response_content = completion.choices[0].message.content.strip()
            current_app.logger.info(f"Received OpenAI response for {user_log_id}")

        except OpenAIError as e:
            current_app.logger.error(f"OpenAI API Error for {user_log_id}: {e}", exc_info=True)
            return jsonify({"error": "Error communicating with AI service."}), 502
        except Exception as e:
            current_app.logger.error(f"Unexpected error during OpenAI call for {user_log_id}: {e}", exc_info=True)
            return jsonify({"error": "An unexpected error occurred while processing your request."}), 500

        # Save history if db_user was successfully retrieved or created
        if db_user and latest_user_message_content and ai_response_content:
            try:
                # ... (conversation and message saving logic remains the same) ...
                conversation = db.session.scalars(
                    db.select(Conversation)
                    .filter_by(user_id=db_user.id)
                    .order_by(Conversation.updated_at.desc())
                ).first()
                time_threshold = datetime.now(timezone.utc) - timedelta(hours=1)
                if not conversation or conversation.updated_at < time_threshold:
                    current_app.logger.info(f"Creating new conversation for user {db_user.id}")
                    conversation = Conversation(user_id=db_user.id, title=latest_user_message_content[:80])
                    db.session.add(conversation)
                    db.session.flush()
                else:
                    current_app.logger.info(
                        f"Appending to existing conversation {conversation.id} for user {db_user.id}")

                user_msg_record = Message(conversation_id=conversation.id, role='user',
                                          content=latest_user_message_content)
                db.session.add(user_msg_record)
                assistant_msg_record = Message(conversation_id=conversation.id, role='assistant',
                                               content=ai_response_content)
                db.session.add(assistant_msg_record)
                conversation.updated_at = datetime.now(timezone.utc)
                db.session.commit()
                current_app.logger.info(
                    f"Successfully saved messages to conversation {conversation.id} for user {db_user.id}")
            except Exception as e:
                db.session.rollback()
                current_app.logger.error(f"Failed to save conversation history for {user_log_id}: {e}", exc_info=True)

        return jsonify({"response": ai_response_content})

    except Exception as e:
        current_app.logger.error(f"Error handling request / JSON parsing for {user_log_id}: {e}", exc_info=True)
        return jsonify({"error": "An internal server error occurred"}), 500

