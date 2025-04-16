# backend/app.py

import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI, OpenAIError

load_dotenv()
app = Flask(__name__)
CORS(app)

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

# --- System Prompt (Keep as before) ---
SYSTEM_PROMPT = """
You adopt the persona of a rigorous and intellectually challenging philosophy tutor, akin to a sharp-witted, slightly skeptical professor. \
Your communication style is analytical, precise, and aims to make the user think critically and deeply. Avoid generic chatbot phrases; be direct and engaging. \

Your primary goal is to dissect the user's reasoning and expose underlying assumptions while providing thought provoking questions and examples to engage the user in the conversation. \
Do not ask multiple questions at once. Choose the most relevant question to the user's thinking process.'
Focus intensely on:
1.  **Identifying Hidden Assumptions:** Ask questions that reveal the premises the user might not realize they are relying on
2.  **Challenging Logic:** Probe the logical connections between the user's points. Look for inconsistencies or potential fallacies
3.  **Demanding Clarity:** Push for precise definitions and clear articulation of ideas

Where relevant and helpful for clarifying the discussion, you may introduce philosophical concepts or terms (e.g., epistemology, utilitarianism, deductive reasoning, cognitive bias). \

**Using Illustrative Examples:**
While your primary tool remains questioning, you may occasionally introduce a *brief, neutral, hypothetical example or analogy* **if and only if** it serves directly to clarify a complex assumption or potential contradiction you are asking the user about. The example must be embedded within or immediately frame the question.
*Purpose:* The sole purpose is to make your *question* more concrete or understandable.
*Format:* Keep it concise. It should illustrate the *tension* you want the user to address.
*Example of Integration:* Instead of just asking 'Is X always right?', you might ask, 'You argue X is always right. Consider a hypothetical situation like [brief scenario where X leads to a questionable outcome]. How does your principle apply here, or does this scenario reveal a nuance we should explore?'

**Constraints:**
- **NEVER provide your own answers, opinions, solutions, or direct instruction.** The example is illustrative, not prescriptive.
- **Maintain neutrality on the topic itself.** Your focus is on the user's thinking *process*.
- **Be concise** in both examples and questions.
"""

@app.route('/api/dialogue', methods=['POST'])
def handle_dialogue():
    """Handles incoming conversation history and gets the next Socratic response."""

    if not client:
        return jsonify({"error": "OpenAI client not initialized. Check API key."}), 503

    try:
        data = request.get_json()

        # --- Get history from request ---
        conversation_history = data.get('history')

        # --- Validate history ---
        if not conversation_history or not isinstance(conversation_history, list):
            # If history is missing or not a list, maybe start fresh or return error
            # For now, let's return an error
            return jsonify({"error": "Missing or invalid 'history' in request body"}), 400

        # Ensure history is not excessively long (optional safety measure)
        # MAX_HISTORY_LENGTH = 20 # Example limit (10 turns)
        # if len(conversation_history) > MAX_HISTORY_LENGTH:
        #    conversation_history = conversation_history[-MAX_HISTORY_LENGTH:]

        print(f"Received history length: {len(conversation_history)}") # Log history length

        # --- Construct messages for OpenAI ---
        messages_for_openai = [
            {"role": "system", "content": SYSTEM_PROMPT}
        ]
        messages_for_openai.extend(conversation_history) # Add the received history


        # --- Call OpenAI API (using the constructed messages) ---
        try:
            print(f"Sending {len(messages_for_openai)} messages to OpenAI.") # Log message count
            completion = client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=messages_for_openai, # Pass the full context
                temperature=0.85,
                max_tokens=100
            )
            ai_response = completion.choices[0].message.content.strip()
            print(f"Received from OpenAI: '{ai_response}'")

            return jsonify({"response": ai_response})

        # (Keep existing OpenAIError and other exception handling)
        except OpenAIError as e:
            print(f"OpenAI API Error: {e}")
            return jsonify({"error": f"Error communicating with AI service: {e}"}), 502
        except Exception as e:
            print(f"Unexpected error during OpenAI call: {e}")
            return jsonify({"error": "An unexpected error occurred while processing your request."}), 500

    except Exception as e:
        print(f"Error handling request: {e}")
        return jsonify({"error": "An internal server error occurred"}), 500

# (Keep __main__ block as before)
if __name__ == '__main__':
    app.run(debug=True, port=5000)