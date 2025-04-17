// frontend-web/script.js

const chatbox = document.getElementById('chatbox');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const loadingIndicator = document.getElementById('loadingIndicator');
const clearButton = document.getElementById('clearButton');

// --- Conversation History Array ---
let conversationHistory = []; // Stores { role: 'user' | 'assistant', content: '...' }

// Function to add a message to the chatbox AND history
function addMessage(text, senderRole) { // senderRole should be 'user' or 'assistant' (for AI)
    const messageElement = document.createElement('p');
    messageElement.textContent = text;
    // Use 'ai' for CSS class, but senderRole ('user'/'assistant') for history
    messageElement.classList.add('message', senderRole === 'assistant' ? 'ai' : 'user');
    chatbox.appendChild(messageElement);
    chatbox.scrollTop = chatbox.scrollHeight;

    // --- Add to history ---
    // Make sure not to add duplicate initial messages if called multiple times
    if (conversationHistory.length === 0 && senderRole === 'assistant') {
         conversationHistory.push({ role: senderRole, content: text });
    } else if (conversationHistory.length > 0 && conversationHistory[conversationHistory.length - 1].content !== text) {
        // Add if it's not the same as the last message (simple check)
        conversationHistory.push({ role: senderRole, content: text });
    } else if (senderRole === 'user'){
         // Always add user message
         conversationHistory.push({ role: senderRole, content: text });
    }
     console.log("History:", conversationHistory); // For debugging
}

// Function to display the initial AI message and add to history
function addInitialMessage() {
    const initialMessage = "Greetings! I'm your socratic partner. If you are willing, shall we examine a question together — not as those who know, but as those who wish to learn?"
     // Clear existing visual chat and history before adding
    chatbox.innerHTML = '';
    conversationHistory = [];
    addMessage(initialMessage, 'assistant'); // Use 'assistant' role for OpenAI
}

// Function to send message history to backend and display response
async function sendMessage() {
    const userText = userInput.value.trim();
    if (userText === '') return;

    // --- Add user message to chatbox AND history ---
    addMessage(userText, 'user');
    userInput.value = ''; // Clear input field

    loadingIndicator.style.display = 'block';
    chatbox.scrollTop = chatbox.scrollHeight;

    try {
        // --- Send the ENTIRE history to the backend ---
        const response = await fetch('https://socratic-questioner.onrender.com/api/dialogue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Send history instead of just the message
            body: JSON.stringify({ history: conversationHistory }),
        });

        // (Error handling remains the same)
        if (!response.ok) {
             const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
             console.error('Error from backend:', response.status, errorData);
             // Use addMessage to display error, but DON'T add backend error to history
             const errorElement = document.createElement('p');
             errorElement.textContent = `Error: ${errorData.error || response.statusText}`;
             errorElement.classList.add('message', 'ai'); // Style as AI message
             errorElement.style.color = 'red'; // Make error visually distinct
             chatbox.appendChild(errorElement);
             chatbox.scrollTop = chatbox.scrollHeight;
             return;
        }

        const data = await response.json();

        // --- Add AI response to chatbox AND history ---
        if (data.response) {
             addMessage(data.response, 'assistant'); // Use 'assistant' role
        } else if (data.error) {
             // Handle specific errors returned in JSON payload
             console.error('Error in backend response:', data.error);
             // Display error, but DON'T add to history
             const errorElement = document.createElement('p');
             errorElement.textContent = `Error: ${data.error}`;
             errorElement.classList.add('message', 'ai');
             errorElement.style.color = 'red';
             chatbox.appendChild(errorElement);
             chatbox.scrollTop = chatbox.scrollHeight;
        }

    } catch (error) {
        console.error('Error during fetch operation:', error);
         // Display error, but DON'T add to history
         const errorElement = document.createElement('p');
         errorElement.textContent = `Error: Failed to get response from backend. Check browser console. (${error.message})`;
         errorElement.classList.add('message', 'ai');
         errorElement.style.color = 'red';
         chatbox.appendChild(errorElement);
         chatbox.scrollTop = chatbox.scrollHeight;
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

// --- Event Listeners ---
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage();
    }
});

// Clear button resets history and adds initial message
clearButton.addEventListener('click', () => {
    addInitialMessage();
});

// --- Initial Setup ---
// Add the initial message when the page loads
document.addEventListener('DOMContentLoaded', addInitialMessage);