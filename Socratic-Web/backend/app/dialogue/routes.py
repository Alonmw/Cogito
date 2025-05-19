# backend/app/dialogue/routes.py
# v12: Added DELETE /api/history/<id> endpoint

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
    # ... (handle_dialogue logic remains the same as v11) ...
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
    if current_user_id:
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
        incoming_conversation_id = data.get('conversation_id')
        # --- Persona support ---
        incoming_persona_id = data.get('persona_id', current_app.DEFAULT_PERSONA_ID)
        system_prompt_content = current_app.persona_prompts_content.get(
            incoming_persona_id,
            current_app.persona_prompts_content.get(current_app.DEFAULT_PERSONA_ID)
        )
        if not system_prompt_content:
            current_app.logger.error(f"System prompt for persona '{incoming_persona_id}' or default not found.")
            return jsonify({"error": "Internal server error: Persona configuration issue."}), 500
        # --- End persona support ---
        current_app.logger.info(f"POST /dialogue - Incoming conversation_id from payload: {incoming_conversation_id}, persona_id: {incoming_persona_id}")

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

        messages_for_openai = [{"role": "system", "content": system_prompt_content}]
        messages_for_openai.extend(conversation_history_for_openai)

        try:
            completion = client.chat.completions.create(
                model=current_app.config.get('OPENAI_MODEL', 'gpt-4-turbo'),
                messages=messages_for_openai,
                temperature=current_app.config.get('OPENAI_TEMPERATURE', 0.7),
                max_tokens=current_app.config.get('OPENAI_MAX_TOKENS', 256),
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

        active_conversation: Conversation | None = None
        if db_user and latest_user_message_content and ai_response_content:
            try:
                if incoming_conversation_id is not None:
                    current_app.logger.info(
                        f"POST /dialogue - Attempting to use existing conversation_id: {incoming_conversation_id} for user {db_user.id}")
                    active_conversation = db.session.scalars(
                        db.select(Conversation)
                        .filter_by(id=incoming_conversation_id, user_id=db_user.id)
                    ).first()
                    if active_conversation:
                        current_app.logger.info(
                            f"POST /dialogue - Found and will append to existing conversation {active_conversation.id}")
                    else:
                        current_app.logger.warning(
                            f"POST /dialogue - Conversation ID {incoming_conversation_id} not found for user {db_user.id} or invalid. Creating new conversation.")

                if not active_conversation:
                    current_app.logger.info(f"POST /dialogue - Creating new conversation for user {db_user.id}")
                    active_conversation = Conversation(user_id=db_user.id, title=latest_user_message_content[:80], persona_id=incoming_persona_id)
                    db.session.add(active_conversation)
                    db.session.flush()

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

        response_payload = {"response": ai_response_content}
        if active_conversation:
            response_payload["conversation_id"] = active_conversation.id
            response_payload["persona_id"] = active_conversation.persona_id

        return jsonify(response_payload)

    except Exception as e:
        current_app.logger.error(f"POST /dialogue - Error handling request / JSON parsing for {user_log_id}: {e}",
                                 exc_info=True)
        return jsonify({"error": "An internal server error occurred"}), 500


# --- Get Conversation History List (Keep as is) ---
@dialogue_bp.route('/history', methods=['GET'])
def get_history_list():
    # ... (logic remains the same as v9/v10) ...
    decoded_token = verify_token()
    if not decoded_token:
        return jsonify({"error": "Authorization required: Invalid or missing token."}), 401
    firebase_uid = decoded_token.get('uid')
    is_email_verified = decoded_token.get('email_verified', False)
    if not firebase_uid:
        return jsonify({"error": "Invalid token payload."}), 401
    if not is_email_verified:  # Keep email verification for history access
        current_app.logger.warning(f"GET /history - Access denied for unverified user UID: {firebase_uid}")
        return jsonify({"error": "Email verification required to access chat history."}), 403
    user = db.session.scalars(db.select(User).filter_by(firebase_uid=firebase_uid)).first()
    if not user:
        current_app.logger.info(f"GET /history - No user found in DB for UID: {firebase_uid}. Returning empty history.")
        return jsonify({"history": []})
    conversations = db.session.scalars(
        db.select(Conversation)
        .filter_by(user_id=user.id)
        .order_by(Conversation.updated_at.desc())
        .limit(current_app.config.get('MAX_HISTORY_ITEMS', 10))
    ).all()
    history_list = [
        {"id": conv.id, "title": conv.title or f"Conversation from {conv.created_at.strftime('%Y-%m-%d %H:%M')}",
         "updated_at": conv.updated_at.isoformat(), "persona_id": conv.persona_id}
        for conv in conversations
    ]
    current_app.logger.info(
        f"GET /history - Returning {len(history_list)} conversation summaries for user UID: {firebase_uid}")
    return jsonify({"history": history_list})


# --- End Get History List ---


# --- Get Specific Conversation Messages (Keep as is) ---
@dialogue_bp.route('/history/<int:conversation_id>', methods=['GET'])
def get_conversation_messages(conversation_id: int):
    # ... (logic remains the same as v9/v10) ...
    decoded_token = verify_token()
    if not decoded_token:
        return jsonify({"error": "Authorization required: Invalid or missing token."}), 401
    firebase_uid = decoded_token.get('uid')
    is_email_verified = decoded_token.get('email_verified', False)
    if not firebase_uid:
        return jsonify({"error": "Invalid token payload."}), 401
    if not is_email_verified:
        current_app.logger.warning(
            f"GET /history/{conversation_id} - Access denied for unverified user UID: {firebase_uid}")
        return jsonify({"error": "Email verification required to access chat history."}), 403
    user = db.session.scalars(db.select(User).filter_by(firebase_uid=firebase_uid)).first()
    if not user:
        current_app.logger.warning(f"GET /history/{conversation_id} - No user found in DB for UID: {firebase_uid}")
        return jsonify({"error": "User not found."}), 404
    conversation = db.session.scalars(
        db.select(Conversation)
        .filter_by(id=conversation_id, user_id=user.id)
    ).first()
    if not conversation:
        current_app.logger.warning(
            f"GET /history/{conversation_id} - Conversation not found or not owned by user UID: {firebase_uid}")
        return jsonify({"error": "Conversation not found or access denied."}), 404
    messages = db.session.scalars(
        db.select(Message)
        .filter_by(conversation_id=conversation.id)
        .order_by(Message.timestamp.asc())
    ).all()
    message_list = [
        {"role": msg.role, "content": msg.content, "timestamp": msg.timestamp.isoformat()}
        for msg in messages
    ]
    current_app.logger.info(
        f"GET /history/{conversation_id} - Returning {len(message_list)} messages for user UID: {firebase_uid}")
    return jsonify({"messages": message_list, "persona_id": conversation.persona_id})


# --- End Get Specific Conversation ---


# --- NEW: Delete Specific Conversation ---
@dialogue_bp.route('/history/<int:conversation_id>', methods=['DELETE'])
def delete_conversation(conversation_id: int):
    """Deletes a specific conversation and its messages for the authenticated user."""
    decoded_token = verify_token()
    current_app.logger.info(f'token content:  {decoded_token}')
    if not decoded_token:
        current_app.logger.warning(f"DELETE /history/{conversation_id} - Unauthorized: Missing or invalid token.")
        return jsonify({"error": "Authorization required: Invalid or missing token."}), 401

    firebase_uid = decoded_token.get('uid')
    # Email verification might not be strictly necessary for deletion, but ensure user is authenticated
    if not firebase_uid:
        current_app.logger.warning(f"DELETE /history/{conversation_id} - Unauthorized: Invalid token payload.")
        return jsonify({"error": "Invalid token payload."}), 401

    user = db.session.scalars(db.select(User).filter_by(firebase_uid=firebase_uid)).first()
    if not user:
        current_app.logger.warning(f"DELETE /history/{conversation_id} - User not found in DB for UID: {firebase_uid}")
        # Even if user record doesn't exist, the conversation definitely won't belong to them
        return jsonify({"error": "User not found or conversation access denied."}), 403  # Or 404

    conversation_to_delete = db.session.scalars(
        db.select(Conversation)
        .filter_by(id=conversation_id, user_id=user.id)  # Crucial: Ensure user owns the conversation
    ).first()

    if not conversation_to_delete:
        current_app.logger.warning(
            f"DELETE /history/{conversation_id} - Conversation not found or not owned by user UID: {firebase_uid}")
        return jsonify({"error": "Conversation not found or access denied."}), 404

    try:
        current_app.logger.info(
            f"DELETE /history/{conversation_id} - Deleting conversation ID: {conversation_id} for user UID: {firebase_uid}")
        db.session.delete(conversation_to_delete)
        db.session.commit()
        current_app.logger.info(
            f"DELETE /history/{conversation_id} - Successfully deleted conversation ID: {conversation_id}")
        return jsonify({"message": "Conversation deleted successfully."}), 200  # Or 204 No Content
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"DELETE /history/{conversation_id} - Error deleting conversation: {e}", exc_info=True)
        return jsonify({"error": "Failed to delete conversation."}), 500
# --- End Delete Specific Conversation ---

