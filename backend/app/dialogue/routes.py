# backend/app/dialogue/routes.py
# Updated to allow optional JWT for guest access

from flask import Blueprint, request, jsonify, current_app
from openai import OpenAIError
# --- Import JWT Required decorator and identity getter ---
from flask_jwt_extended import jwt_required, get_jwt_identity # Keep both imports

dialogue_bp = Blueprint('dialogue', __name__, url_prefix='/api')

# --- Apply OPTIONAL JWT protection ---
@dialogue_bp.route('/dialogue', methods=['POST'])
@jwt_required(optional=True) # Changed to optional=True
# --- End JWT protection change ---
def handle_dialogue():
    """Handles incoming conversation history (for guests or logged-in users)
       and gets the next Socratic response."""

    # --- Get User Identity (will be None if no valid JWT is present) ---
    current_user_id = get_jwt_identity()
    if current_user_id:
        current_app.logger.info(f"Dialogue request received from user ID: {current_user_id}")
    else:
        current_app.logger.info("Dialogue request received from guest user.")
    # --- End User Identity ---

    # Access extensions and config via current_app proxy
    client = current_app.openai_client
    system_prompt = current_app.system_prompt
    max_history = current_app.config.get('MAX_HISTORY_MSGS', 20)

    # Log appropriately based on user type
    user_log_id = f"user ID: {current_user_id}" if current_user_id else "guest user"

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
            current_app.logger.warning(f"Missing/invalid history from {user_log_id}. Type: {type(conversation_history)}")
            return jsonify({"error": "Missing or invalid 'history' list in request body"}), 400

        if len(conversation_history) > max_history:
            current_app.logger.info(f"History truncated for {user_log_id} from {len(conversation_history)} to {max_history} messages.")
            conversation_history = conversation_history[-max_history:]

        current_app.logger.debug(f"Processing history length {len(conversation_history)} for {user_log_id}")

        messages_for_openai = [{"role": "system", "content": system_prompt}]
        messages_for_openai.extend(conversation_history)

        try:
            current_app.logger.debug(f"Sending {len(messages_for_openai)} messages to OpenAI for {user_log_id}.")
            # For OpenAI tracking/moderation, you might want to pass a unique but anonymous ID for guests
            openai_user_param = str(current_user_id) if current_user_id else "guest_user_session_placeholder" # Example

            completion = client.chat.completions.create(
                model=current_app.config.get('OPENAI_MODEL', 'gpt-4-turbo'),
                messages=messages_for_openai,
                temperature=current_app.config.get('OPENAI_TEMPERATURE', 0.7),
                max_tokens=current_app.config.get('OPENAI_MAX_TOKENS', 100),
                user=openai_user_param # Pass user ID or guest identifier to OpenAI API
            )
            ai_response = completion.choices[0].message.content.strip()
            current_app.logger.info(f"Received OpenAI response for {user_log_id}")

            return jsonify({"response": ai_response})

        except OpenAIError as e:
            current_app.logger.error(f"OpenAI API Error for {user_log_id}: {e}", exc_info=True)
            return jsonify({"error": "Error communicating with AI service."}), 502
        except Exception as e:
            current_app.logger.error(f"Unexpected error during OpenAI call for {user_log_id}: {e}", exc_info=True)
            return jsonify({"error": "An unexpected error occurred while processing your request."}), 500

    except Exception as e:
        current_app.logger.error(f"Error handling request / JSON parsing for {user_log_id}: {e}", exc_info=True)
        return jsonify({"error": "An internal server error occurred"}), 500

