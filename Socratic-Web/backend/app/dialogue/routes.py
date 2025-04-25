# backend/app/dialogue/routes.py
# v3: Added optional Firebase token verification

from flask import Blueprint, request, jsonify, current_app
from openai import OpenAIError
from ..auth.utils import verify_token # <-- Import the verification utility

dialogue_bp = Blueprint('dialogue', __name__, url_prefix='/api')

@dialogue_bp.route('/dialogue', methods=['POST'])
def handle_dialogue():
    """Handles incoming conversation history (verifying token if present)
       and gets the next Socratic response."""

    # --- Verify Firebase Token (Optional) ---
    decoded_token = verify_token() # Attempt to verify token from header
    current_user_id = decoded_token.get('uid') if decoded_token else None
    user_log_id = f"user ID: {current_user_id}" if current_user_id else "guest user"
    # Use UID for OpenAI user parameter if available, otherwise a generic identifier
    openai_user_param = str(current_user_id) if current_user_id else f"guest_session_{request.remote_addr}" # Example guest ID

    current_app.logger.info(f"Dialogue request received from {user_log_id}")
    # --- End Token Verification ---


    # Access extensions and config via current_app proxy
    client = current_app.openai_client
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

            completion = client.chat.completions.create(
                model=current_app.config.get('OPENAI_MODEL', 'gpt-4-turbo'),
                messages=messages_for_openai,
                temperature=current_app.config.get('OPENAI_TEMPERATURE', 0.7),
                max_tokens=current_app.config.get('OPENAI_MAX_TOKENS', 100),
                user=openai_user_param # Pass verified UID or guest identifier
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

