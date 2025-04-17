// frontend-web/script.js
// v2: Added scroll-to-bottom on input focus for mobile keyboard

const chatbox = document.getElementById('chatbox');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const loadingIndicator = document.getElementById('loadingIndicator');
const clearButton = document.getElementById('clearButton');

// Conversation History Array
let conversationHistory = []; // Stores { role: 'user' | 'assistant', content: '...' }

// Function to scroll chatbox to the bottom
function scrollToBottom() {
    // Use setTimeout to allow the DOM/layout to potentially update first
    setTimeout(() => {
        chatbox.scrollTop = chatbox.scrollHeight;
    }, 0); // A minimal delay is often enough
}

// Function to add a message to the chatbox AND history
function addMessage(text, senderRole) { // senderRole should be 'user' or 'assistant'
    const messageElement = document.createElement('p');
    messageElement.textContent = text;
    messageElement.classList.add('message', senderRole === 'assistant' ? 'ai' : 'user');
    chatbox.appendChild(messageElement);

    // Add to history (with basic duplicate check logic from previous version)
    if (conversationHistory.length === 0 && senderRole === 'assistant') {
         conversationHistory.push({ role: senderRole, content: text });
    } else if (conversationHistory.length > 0 && conversationHistory[conversationHistory.length - 1].content !== text) {
        conversationHistory.push({ role: senderRole, content: text });
    } else if (senderRole === 'user'){
         conversationHistory.push({ role: senderRole, content: text });
    }
    console.log("History:", conversationHistory); // For debugging

    // Scroll to bottom whenever a new message is added
    scrollToBottom();
}

// Function to display the initial AI message and add to history
function addInitialMessage() {
    const initialMessage = "Hello! What topic is on your mind today?";
    chatbox.innerHTML = ''; // Clear visual chat
    conversationHistory = []; // Clear history array
    addMessage(initialMessage, 'assistant');
}

// Function to send message history to backend and display response
async function sendMessage() {
    const userText = userInput.value.trim();
    if (userText === '') return;

    addMessage(userText, 'user'); // Adds message and scrolls down
    userInput.value = '';

    loadingIndicator.style.display = 'block';
    scrollToBottom(); // Ensure scroll happens even when indicator shows

    try {
        const response = await fetch('https://socratic-questioner.onrender.com/api/dialogue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ history: conversationHistory }),
        });

        if (!response.ok) {
             const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
             console.error('Error from backend:', response.status, errorData);
             const errorElement = document.createElement('p');
             errorElement.textContent = `Error: ${errorData.error || response.statusText}`;
             errorElement.classList.add('message', 'ai');
             errorElement.style.color = 'red';
             chatbox.appendChild(errorElement);
             scrollToBottom(); // Scroll after adding error message
             return;
        }

        const data = await response.json();

        if (data.response) {
             addMessage(data.response, 'assistant'); // Adds message and scrolls down
        } else if (data.error) {
             console.error('Error in backend response:', data.error);
             const errorElement = document.createElement('p');
             errorElement.textContent = `Error: ${data.error}`;
             errorElement.classList.add('message', 'ai');
             errorElement.style.color = 'red';
             chatbox.appendChild(errorElement);
             scrollToBottom(); // Scroll after adding error message
        }

    } catch (error) {
        console.error('Error during fetch operation:', error);
         const errorElement = document.createElement('p');
         errorElement.textContent = `Error: Failed to get response from backend. Check browser console. (${error.message})`;
         errorElement.classList.add('message', 'ai');
         errorElement.style.color = 'red';
         chatbox.appendChild(errorElement);
         scrollToBottom(); // Scroll after adding error message
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

clearButton.addEventListener('click', () => {
    addInitialMessage(); // Resets history and adds initial message (which also scrolls)
});

// --- NEW: Scroll to bottom when input gets focus (for mobile keyboard) ---
userInput.addEventListener('focus', () => {
    // Use a slightly longer timeout to allow keyboard animation/resize to settle
    setTimeout(() => {
        chatbox.scrollTop = chatbox.scrollHeight;
    }, 200); // Adjust delay (ms) if needed
});

// --- Initial Setup ---
document.addEventListener('DOMContentLoaded', addInitialMessage);

