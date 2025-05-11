# backend/app/dialogue/routes.py
# v9: Added GET /api/history and GET /api/history/<id> endpoints

from flask import Blueprint, request, jsonify, current_app
from openai import OpenAIError
from ..auth.utils import verify_token
from ..extensions import db
from ..models import User, Conversation, Message  # Ensure models are imported
from datetime import datetime, timezone, timedelta

dialogue_bp = Blueprint('dialogue', __name__, url_prefix='/api')


# --- Helper Function: Get or Create User (Keep as is) ---
def get_or_create_user(firebase_uid: str, email: str | None = None, display_name: str | None = None) -> User | None:
    if not firebase_uid:
        current_app.logger.error("get_or_create_user called with empty or None firebase_uid")
        return None
    user = db.session.scalars(db.select(User).filter_by(firebase_uid=firebase_uid)).first()
    if not user:
        current_app.logger.info(f"Creating new user record for firebase_uid: {firebase_uid}")
        current_app.logger.info(f"User details for creation - Email: {email}, Name: {display_name}")
        user = User(firebase_uid=firebase_uid, email=email, display_name=display_name)
        db.session.add(user)
        try:
            db.session.commit()
            current_app.logger.info(f"Successfully created user with ID: {user.id} for firebase_uid: {firebase_uid}")
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Failed to create user record for {firebase_uid}: {e}", exc_info=True)
            return None
    return user


# --- End Helper ---


@dialogue_bp.route('/dialogue', methods=['POST'])
def handle_dialogue():
    """Handles incoming conversation history, gets AI response,
       and saves history for authenticated users, using conversation_id if provided."""

    decoded_token = verify_token()
    current_app.logger.debug(f"POST /dialogue - Decoded token content: {decoded_token}")

    current_user_id = decoded_token.get('uid') if decoded_token else None
    user_email = decoded_token.get('email') if decoded_token else None
    user_name = (decoded_token.get('name') or decoded_token.get('displayName')) if decoded_token else None
    is_email_verified_in_token = decoded_token and decoded_token.get('email_verified',
                                                                     False) if decoded_token else False

    current_app.logger.debug(
        f"POST /dialogue - Extracted from token - UID: {current_user_id}, Email: {user_email}, Name: {user_name}, Email Verified in Token: {is_email_verified_in_token}")

    user_log_id = f"user ID: {current_user_id}" if current_user_id else "guest user"
    openai_user_param = str(current_user_id) if current_user_id else f"guest_session_{request.remote_addr}"

    db_user: User | None = None
    if current_user_id:  # Process for any authenticated user
        try:
            current_app.logger.debug(f"POST /dialogue - Attempting get_or_create_user with UID: {current_user_id}")
            db_user = get_or_create_user(current_user_id, user_email, user_name)
            if not db_user:
                current_app.logger.error(
                    f"POST /dialogue - get_or_create_user returned None for UID: {current_user_id}")
                return jsonify({"error": "Could not process user information due to a database issue."}), 500
        except Exception as e:
            current_app.logger.error(
                f"POST /dialogue - Exception during get_or_create_user call for UID {current_user_id}: {e}",
                exc_info=True)
            return jsonify({"error": "Could not process user information."}), 500

    current_app.logger.info(
        f"POST /dialogue - Request received from {user_log_id} (DB User ID: {db_user.id if db_user else 'N/A'})")

    client = current_app.openai_client
    system_prompt = current_app.system_prompt
    max_history = current_app.config.get('MAX_HISTORY_MSGS', 20)

    if not client:
        current_app.logger.error(f"POST /dialogue - OpenAI client not initialized for {user_log_id}")
        return jsonify({"error": "OpenAI client not initialized. Check API key."}), 503

    try:
        data = request.get_json()
        if not data:
            current_app.logger.warning(f"POST /dialogue - Invalid JSON received from {user_log_id}")
            return jsonify({"error": "Invalid JSON request body"}), 400

        conversation_history = data.get('history')
        incoming_conversation_id = data.get('conversation_id')  # Expect number or None/undefined
        current_app.logger.info(f"POST /dialogue - Incoming conversation_id from payload: {incoming_conversation_id}")

        if not conversation_history or not isinstance(conversation_history, list):
            current_app.logger.warning(
                f"POST /dialogue - Missing/invalid history from {user_log_id}. Type: {type(conversation_history)}")
            return jsonify({"error": "Missing or invalid 'history' list in request body"}), 400

        latest_user_message_content = None
        if conversation_history and conversation_history[-1].get('role') == 'user':
            latest_user_message_content = conversation_history[-1].get('content')

        if len(conversation_history) > max_history:
            conversation_history_for_openai = conversation_history[-max_history:]
        else:
            conversation_history_for_openai = conversation_history

        messages_for_openai = [{"role": "system", "content": system_prompt}]
        messages_for_openai.extend(conversation_history_for_openai)

        try:
            completion = client.chat.completions.create(
                model=current_app.config.get('OPENAI_MODEL', 'gpt-4-turbo'),
                messages=messages_for_openai,
                temperature=current_app.config.get('OPENAI_TEMPERATURE', 0.7),
                max_tokens=current_app.config.get('OPENAI_MAX_TOKENS', 100),
                user=openai_user_param
            )
            ai_response_content = completion.choices[0].message.content.strip()
            current_app.logger.info(f"POST /dialogue - Received OpenAI response for {user_log_id}")

        except OpenAIError as e:
            current_app.logger.error(f"POST /dialogue - OpenAI API Error for {user_log_id}: {e}", exc_info=True)
            return jsonify({"error": "Error communicating with AI service."}), 502
        except Exception as e:
            current_app.logger.error(f"POST /dialogue - Unexpected error during OpenAI call for {user_log_id}: {e}",
                                     exc_info=True)
            return jsonify({"error": "An unexpected error occurred while processing your request."}), 500

        # --- Logic to find or create conversation ---
        active_conversation: Conversation | None = None
        if db_user and latest_user_message_content and ai_response_content:
            try:
                if incoming_conversation_id is not None:  # Check if ID was explicitly provided
                    current_app.logger.info(
                        f"POST /dialogue - Attempting to use existing conversation_id: {incoming_conversation_id} for user {db_user.id}")
                    active_conversation = db.session.scalars(
                        db.select(Conversation)
                        .filter_by(id=incoming_conversation_id, user_id=db_user.id)  # Ensure user owns it
                    ).first()
                    if active_conversation:
                        current_app.logger.info(
                            f"POST /dialogue - Found and will append to existing conversation {active_conversation.id}")
                    else:
                        current_app.logger.warning(
                            f"POST /dialogue - Conversation ID {incoming_conversation_id} not found for user {db_user.id} or invalid. Creating new conversation.")
                        # Fall through to create a new conversation if ID not found or doesn't belong to user

                # If no valid incoming_conversation_id was used, or if it's a new chat scenario (no ID sent)
                if not active_conversation:
                    current_app.logger.info(f"POST /dialogue - Creating new conversation for user {db_user.id}")
                    active_conversation = Conversation(user_id=db_user.id, title=latest_user_message_content[:80])
                    db.session.add(active_conversation)
                    db.session.flush()  # Need ID for messages

                # Save messages to the active_conversation
                user_msg_record = Message(conversation_id=active_conversation.id, role='user',
                                          content=latest_user_message_content)
                db.session.add(user_msg_record)
                assistant_msg_record = Message(conversation_id=active_conversation.id, role='assistant',
                                               content=ai_response_content)
                db.session.add(assistant_msg_record)
                active_conversation.updated_at = datetime.now(timezone.utc)
                db.session.commit()
                current_app.logger.info(
                    f"POST /dialogue - Saved messages to conversation {active_conversation.id} for user {db_user.id}")

            except Exception as e:
                db.session.rollback()
                current_app.logger.error(f"POST /dialogue - Failed to save history for {user_log_id}: {e}",
                                         exc_info=True)
        # --- End Save History Logic ---

        response_payload = {"response": ai_response_content}
        if active_conversation:
            response_payload["conversation_id"] = active_conversation.id

        return jsonify(response_payload)

    except Exception as e:
        current_app.logger.error(f"POST /dialogue - Error handling request / JSON parsing for {user_log_id}: {e}",
                                 exc_info=True)
        return jsonify({"error": "An internal server error occurred"}), 500


# --- NEW: Get Conversation History List ---
@dialogue_bp.route('/history', methods=['GET'])
def get_history_list():
    """Retrieves a list of conversation summaries for the authenticated user."""
    decoded_token = verify_token()
    if not decoded_token:
        return jsonify({"error": "Authorization required: Invalid or missing token."}), 401

    firebase_uid = decoded_token.get('uid')
    is_email_verified = decoded_token.get('email_verified', False)

    if not firebase_uid:  # Should not happen if token is valid
        return jsonify({"error": "Invalid token payload."}), 401

    # --- Require email verification to access history ---
    if not is_email_verified:
        current_app.logger.warning(f"GET /history - Access denied for unverified user UID: {firebase_uid}")
        return jsonify({"error": "Email verification required to access chat history."}), 403
    # --- End Email Verification Check ---

    user = db.session.scalars(db.select(User).filter_by(firebase_uid=firebase_uid)).first()
    if not user:
        current_app.logger.info(f"GET /history - No user found in DB for UID: {firebase_uid}. Returning empty history.")
        return jsonify({"history": []})  # No user record means no history

    # Get max 10 most recent conversations
    conversations = db.session.scalars(
        db.select(Conversation)
        .filter_by(user_id=user.id)
        .order_by(Conversation.updated_at.desc())
        .limit(current_app.config.get('MAX_HISTORY_ITEMS', 10))
    ).all()

    history_list = [
        {
            "id": conv.id,
            "title": conv.title or f"Conversation from {conv.created_at.strftime('%Y-%m-%d %H:%M')}",
            "updated_at": conv.updated_at.isoformat()  # Send as ISO string
        }
        for conv in conversations
    ]
    current_app.logger.info(
        f"GET /history - Returning {len(history_list)} conversation summaries for user UID: {firebase_uid}")
    return jsonify({"history": history_list})


# --- End Get History List ---


# --- NEW: Get Specific Conversation Messages ---
@dialogue_bp.route('/history/<int:conversation_id>', methods=['GET'])
def get_conversation_messages(conversation_id: int):
    """Retrieves all messages for a specific conversation ID,
       belonging to the authenticated user."""
    decoded_token = verify_token()
    if not decoded_token:
        return jsonify({"error": "Authorization required: Invalid or missing token."}), 401

    firebase_uid = decoded_token.get('uid')
    is_email_verified = decoded_token.get('email_verified', False)

    if not firebase_uid:
        return jsonify({"error": "Invalid token payload."}), 401

    # --- Require email verification to access specific conversation ---
    if not is_email_verified:
        current_app.logger.warning(
            f"GET /history/{conversation_id} - Access denied for unverified user UID: {firebase_uid}")
        return jsonify({"error": "Email verification required to access chat history."}), 403
    # --- End Email Verification Check ---

    user = db.session.scalars(db.select(User).filter_by(firebase_uid=firebase_uid)).first()
    if not user:
        current_app.logger.warning(f"GET /history/{conversation_id} - No user found in DB for UID: {firebase_uid}")
        return jsonify({"error": "User not found."}), 404  # Or 403 if preferred

    conversation = db.session.scalars(
        db.select(Conversation)
        .filter_by(id=conversation_id, user_id=user.id)  # Ensure conversation belongs to user
    ).first()

    if not conversation:
        current_app.logger.warning(
            f"GET /history/{conversation_id} - Conversation not found or not owned by user UID: {firebase_uid}")
        return jsonify({"error": "Conversation not found or access denied."}), 404

    messages = db.session.scalars(
        db.select(Message)
        .filter_by(conversation_id=conversation.id)
        .order_by(Message.timestamp.asc())  # Messages in chronological order
    ).all()

    message_list = [
        {"role": msg.role, "content": msg.content, "timestamp": msg.timestamp.isoformat()}
        for msg in messages
    ]
    current_app.logger.info(
        f"GET /history/{conversation_id} - Returning {len(message_list)} messages for user UID: {firebase_uid}")
    return jsonify({"messages": message_list})
# --- End Get Specific Conversation ---

