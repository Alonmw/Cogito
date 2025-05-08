# backend/app/dialogue/routes.py
# v5: Added logic to save conversation history for authenticated users

from flask import Blueprint, request, jsonify, current_app
from openai import OpenAIError
from ..auth.utils import verify_token
# --- Import DB and Models ---
from ..extensions import db
from ..models import User, Conversation, Message
from datetime import datetime, timezone, timedelta
# --- End Imports ---

dialogue_bp = Blueprint('dialogue', __name__, url_prefix='/api')

# --- Helper Function: Get or Create User ---
def get_or_create_user(firebase_uid: str, email: str | None = None, display_name: str | None = None) -> User:
    """Finds a user by firebase_uid or creates a new one."""
    user = db.session.scalars(db.select(User).filter_by(firebase_uid=firebase_uid)).first()
    if not user:
        current_app.logger.info(f"Creating new user record for firebase_uid: {firebase_uid}")
        user = User(
            firebase_uid=firebase_uid,
            email=email, # Store email if available from token
            display_name=display_name # Store name if available from token
        )
        db.session.add(user)
        # We need to commit here so the user has an ID before creating a conversation
        # Consider potential race conditions or transaction management later
        try:
            db.session.commit()
            current_app.logger.info(f"Successfully created user with ID: {user.id}")
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Failed to create user record for {firebase_uid}: {e}", exc_info=True)
            raise # Re-raise exception to indicate failure
    return user
# --- End Helper ---


@dialogue_bp.route('/dialogue', methods=['POST'])
def handle_dialogue():
    """Handles incoming conversation history, gets AI response,
       and saves history for authenticated, verified users."""

    # --- Verify Firebase Token (Optional) ---
    decoded_token = verify_token()
    current_user_id = decoded_token.get('uid') if decoded_token else None
    user_log_id = f"user ID: {current_user_id}" if current_user_id else "guest user"
    openai_user_param = str(current_user_id) if current_user_id else f"guest_session_{request.remote_addr}"
    is_verified_user = decoded_token and decoded_token.get('email_verified', False) if decoded_token else False

    # --- Get User Record if Authenticated ---
    db_user: User | None = None
    if current_user_id and is_verified_user: # Only get/create for verified users
        try:
            user_email = decoded_token.get('email')
            user_name = decoded_token.get('name')
            db_user = get_or_create_user(current_user_id, user_email, user_name)
        except Exception:
            # Handle case where user creation failed (logged in helper)
            return jsonify({"error": "Could not process user information."}), 500
    # --- End Get User Record ---

    current_app.logger.info(f"Dialogue request received from {user_log_id} (Verified: {is_verified_user})")

    # Access extensions and config
    client = current_app.openai_client
    system_prompt = current_app.system_prompt
    max_history = current_app.config.get('MAX_HISTORY_MSGS', 20)

    if not client: # Check OpenAI client
        # ... (error handling remains the same) ...
        current_app.logger.error(f"OpenAI client not initialized for request from {user_log_id}")
        return jsonify({"error": "OpenAI client not initialized. Check API key."}), 503

    try:
        data = request.get_json()
        if not data: # Check JSON body
            # ... (error handling remains the same) ...
            current_app.logger.warning(f"Invalid JSON received from {user_log_id}")
            return jsonify({"error": "Invalid JSON request body"}), 400

        # Get history from request (expecting oldest message first)
        conversation_history = data.get('history')
        if not conversation_history or not isinstance(conversation_history, list): # Check history format
             # ... (error handling remains the same) ...
            current_app.logger.warning(f"Missing/invalid history from {user_log_id}. Type: {type(conversation_history)}")
            return jsonify({"error": "Missing or invalid 'history' list in request body"}), 400

        # Extract the latest user message from the received history
        latest_user_message_content = None
        if conversation_history and conversation_history[-1].get('role') == 'user':
            latest_user_message_content = conversation_history[-1].get('content')

        # Truncate history *before* adding system prompt for OpenAI call
        if len(conversation_history) > max_history:
            current_app.logger.info(f"History truncated for {user_log_id} from {len(conversation_history)} to {max_history} messages.")
            # Keep the most recent 'max_history' messages
            conversation_history_for_openai = conversation_history[-max_history:]
        else:
            conversation_history_for_openai = conversation_history

        messages_for_openai = [{"role": "system", "content": system_prompt}]
        messages_for_openai.extend(conversation_history_for_openai)

        # --- Call OpenAI ---
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

        except OpenAIError as e: # Handle OpenAI errors
            # ... (error handling remains the same) ...
            current_app.logger.error(f"OpenAI API Error for {user_log_id}: {e}", exc_info=True)
            return jsonify({"error": "Error communicating with AI service."}), 502
        except Exception as e: # Handle other unexpected errors during call
            # ... (error handling remains the same) ...
            current_app.logger.error(f"Unexpected error during OpenAI call for {user_log_id}: {e}", exc_info=True)
            return jsonify({"error": "An unexpected error occurred while processing your request."}), 500
        # --- End OpenAI Call ---


        # --- Save History (Only for authenticated and verified users) ---
        if db_user and latest_user_message_content and ai_response_content:
            try:
                # Find the most recent conversation for the user or create a new one
                # Simple logic: Create new if last update was > 1 hour ago
                conversation = db.session.scalars(
                    db.select(Conversation)
                    .filter_by(user_id=db_user.id)
                    .order_by(Conversation.updated_at.desc())
                ).first()

                time_threshold = datetime.now(timezone.utc) - timedelta(hours=1)

                if not conversation or conversation.updated_at < time_threshold:
                    current_app.logger.info(f"Creating new conversation for user {db_user.id}")
                    conversation = Conversation(user_id=db_user.id, title=latest_user_message_content[:80]) # Use first part of message as title
                    db.session.add(conversation)
                    # Need to flush to get conversation.id for messages
                    db.session.flush()
                else:
                    current_app.logger.info(f"Appending to existing conversation {conversation.id} for user {db_user.id}")

                # Save user message
                user_msg_record = Message(
                    conversation_id=conversation.id,
                    role='user',
                    content=latest_user_message_content,
                    # Timestamp is handled by default
                )
                db.session.add(user_msg_record)

                # Save assistant message
                assistant_msg_record = Message(
                    conversation_id=conversation.id,
                    role='assistant',
                    content=ai_response_content,
                    # Timestamp is handled by default
                )
                db.session.add(assistant_msg_record)

                # Update conversation timestamp (onupdate handles this, but explicit doesn't hurt)
                conversation.updated_at = datetime.now(timezone.utc)

                db.session.commit()
                current_app.logger.info(f"Successfully saved messages to conversation {conversation.id} for user {db_user.id}")

            except Exception as e:
                db.session.rollback()
                current_app.logger.error(f"Failed to save conversation history for {user_log_id}: {e}", exc_info=True)
                # Don't fail the whole request, just log the error. User still gets the response.
        # --- End Save History ---

        # Return the AI response regardless of save success/failure
        return jsonify({"response": ai_response_content})

    except Exception as e: # Handle request parsing errors
        # ... (error handling remains the same) ...
        current_app.logger.error(f"Error handling request / JSON parsing for {user_log_id}: {e}", exc_info=True)
        return jsonify({"error": "An internal server error occurred"}), 500

