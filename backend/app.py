# backend/app.py

import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI, OpenAIError

load_dotenv()
app = Flask(__name__)
CORS(app)

# --- Configuration ---
MAX_HISTORY_MSGS = 20 # Max number of messages (e.g., 10 turns) to keep in history
                      # Adjust this based on desired context length vs token cost

# --- Initialize OpenAI Client (Keep as before) ---
client = None
openai_api_key = os.getenv("OPENAI_API_KEY")
if openai_api_key:
    try:
        client = OpenAI(api_key=openai_api_key)
        print("OpenAI client initialized successfully.")
    except Exception as e:
        print(f"Error initializing OpenAI client: {e}")
else:
    print("ERROR: OPENAI_API_KEY environment variable not found. OpenAI client not initialized.")

# --- System Prompt (Keep your refined version) ---
try:
    with open('prompt.txt', 'r') as f:
        SYSTEM_PROMPT = f.read()
except Exception as e:
    print('Error reading system prompt file: ', e)

@app.route('/api/dialogue', methods=['POST'])
def handle_dialogue():
    """Handles incoming conversation history, validates it, limits length, and gets the next Socratic response."""

    if not client:
        return jsonify({"error": "OpenAI client not initialized. Check API key."}), 503

    try:
        data = request.get_json()

        # --- Basic Input Validation ---
        if not data:
            print("Error: Invalid/Empty JSON received")
            return jsonify({"error": "Invalid JSON request body"}), 400

        conversation_history = data.get('history')

        if not conversation_history or not isinstance(conversation_history, list):
            print(f"Error: Missing or invalid 'history' type: {type(conversation_history)}")
            return jsonify({"error": "Missing or invalid 'history' list in request body"}), 400

        # Optional: Deeper validation of history structure (can impact performance)
        # Consider validating the first/last few messages instead of all if needed
        # for i, msg in enumerate(conversation_history):
        #     if not isinstance(msg, dict) or 'role' not in msg or 'content' not in msg:
        #         print(f"Error: Invalid message structure at index {i}")
        #         return jsonify({"error": "Invalid message structure in 'history'"}), 400
        #     if msg['role'] not in ['user', 'assistant']:
        #         print(f"Error: Invalid role '{msg['role']}' at index {i}")
        #         return jsonify({"error": f"Invalid role '{msg['role']}' in 'history'"}), 400

        # --- History Length Limit ---
        if len(conversation_history) > MAX_HISTORY_MSGS:
            print(f"History truncated from {len(conversation_history)} to {MAX_HISTORY_MSGS} messages.")
            # Keep only the most recent messages
            conversation_history = conversation_history[-MAX_HISTORY_MSGS:]

        print(f"Processing history length: {len(conversation_history)}")

        # --- Construct messages for OpenAI (as before) ---
        messages_for_openai = [
            {"role": "system", "content": SYSTEM_PROMPT}
        ]
        # Add the (potentially truncated) history
        messages_for_openai.extend(conversation_history)


        # --- Call OpenAI API (as before) ---
        try:
            print(f"Sending {len(messages_for_openai)} messages to OpenAI.")
            completion = client.chat.completions.create(
                model="gpt-4-turbo", # Or your chosen model
                messages=messages_for_openai,
                temperature=0.7,
                max_tokens=100 # Adjust if needed
            )
            ai_response = completion.choices[0].message.content.strip()
            print(f"Received from OpenAI: '{ai_response}'")

            return jsonify({"response": ai_response})

        # (Keep existing OpenAIError and other exception handling)
        except OpenAIError as e:
            print(f"OpenAI API Error: {e}")
            # Consider logging the full error e for diagnostics
            return jsonify({"error": f"Error communicating with AI service."}), 502 # Avoid sending detailed API errors to frontend
        except Exception as e:
            print(f"Unexpected error during OpenAI call: {e}")
            # Consider logging the full error e
            return jsonify({"error": "An unexpected error occurred while processing your request."}), 500

    except Exception as e:
        print(f"Error handling request / JSON parsing: {e}")
        # Consider logging the full error e
        return jsonify({"error": "An internal server error occurred"}), 500

# (Keep __main__ block as before)
if __name__ == '__main__':
    # Note: debug=True should be False in a production deployment environment variable
    # Gunicorn doesn't use this block directly when running 'app:app'
    app.run(debug=True, port=5000)
