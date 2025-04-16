# backend/app.py

import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI, OpenAIError # <-- Import OpenAI and specific error type

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app) # Initialize CORS

# --- Retrieve OpenAI API key ---
openai_api_key = os.getenv("OPENAI_API_KEY")

# --- Initialize OpenAI Client ---
client = None
if openai_api_key:
    try:
        client = OpenAI(api_key=openai_api_key)
        print("OpenAI client initialized successfully.")
    except Exception as e:
        print(f"Error initializing OpenAI client: {e}")
else:
    print("ERROR: OPENAI_API_KEY environment variable not found. OpenAI client not initialized.")

# --- System Prompt for Socratic Dialogue ---
# This is critical for guiding the AI's behavior. You'll likely tune this.
SYSTEM_PROMPT = """
You are a Socratic partner. Your goal is to help the user explore their own thinking \
through questioning. Do NOT provide answers, opinions, or solutions. \
Focus SOLELY on asking clarifying questions, probing assumptions, exploring reasoning, \
and examining implications. Keep your questions open-ended and concise. \
Example question types:
- "What do you mean by X?"
- "What assumptions are you making?"
- "Why do you think that is the case?"
- "What are the consequences if that is true/false?"
- "Can you elaborate on that point?"
Avoid judgmental language. Be neutral and inquisitive.
"""

# Define the dialogue API endpoint
@app.route('/api/dialogue', methods=['POST'])
def handle_dialogue():
    """Handles incoming messages and gets a Socratic response from OpenAI."""

    # Check if OpenAI client is available
    if not client:
        return jsonify({"error": "OpenAI client not initialized. Check API key."}), 503 # Service Unavailable

    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({"error": "Missing 'message' in request body"}), 400

        user_message = data['message']

        # --- Call OpenAI API ---
        try:
            print(f"Sending to OpenAI: '{user_message}'") # Log what we send
            completion = client.chat.completions.create(
                model="gpt-3.5-turbo", # Or "gpt-4" or other suitable model
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_message}
                ],
                temperature=0.7, # Adjust for creativity vs predictability
                max_tokens=100 # Limit response length
            )

            # Extract the AI's response
            ai_response = completion.choices[0].message.content.strip()
            print(f"Received from OpenAI: '{ai_response}'") # Log what we receive

            return jsonify({"response": ai_response})

        except OpenAIError as e:
            # Handle specific OpenAI API errors
            print(f"OpenAI API Error: {e}")
            return jsonify({"error": f"Error communicating with AI service: {e}"}), 502 # Bad Gateway
        except Exception as e:
             # Handle other unexpected errors during API call
            print(f"Unexpected error during OpenAI call: {e}")
            return jsonify({"error": "An unexpected error occurred while processing your request."}), 500

    except Exception as e:
        # Handle errors in request parsing or other parts of the function
        print(f"Error handling request: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500

# Run the Flask development server
if __name__ == '__main__':
    app.run(debug=True, port=5000)