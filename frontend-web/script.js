// frontend-web/script.js
// v3: Increased delay for scroll-on-focus, added logging

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
    }, 0); // Minimal delay after adding message
}

// Function to add a message to the chatbox AND history
function addMessage(text, senderRole) { // senderRole should be 'user' or 'assistant'
    const messageElement = document.createElement('p');
    messageElement.textContent = text;
    messageElement.classList.add('message', senderRole === 'assistant' ? 'ai' : 'user');
    chatbox.appendChild(messageElement);

    // Add to history (with basic duplicate check logic)
    if (conversationHistory.length === 0 && senderRole === 'assistant') {
         conversationHistory.push({ role: senderRole, content: text });
    } else if (conversationHistory.length > 0 && conversationHistory[conversationHistory.length - 1].content !== text) {
        conversationHistory.push({ role: senderRole, content: text });
    } else if (senderRole === 'user'){
         conversationHistory.push({ role: senderRole, content: text });
    }
    // console.log("History:", conversationHistory); // Optional debugging

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

    addMessage(userText, 'user');
    userInput.value = '';

    loadingIndicator.style.display = 'block';
    scrollToBottom();

    try {
        const response = await fetch('https://socratic-questioner.onrender.com/api/dialogue', { // Ensure this URL is correct
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
             scrollToBottom();
             return;
        }

        const data = await response.json();

        if (data.response) {
             addMessage(data.response, 'assistant');
        } else if (data.error) {
             console.error('Error in backend response:', data.error);
             const errorElement = document.createElement('p');
             errorElement.textContent = `Error: ${data.error}`;
             errorElement.classList.add('message', 'ai');
             errorElement.style.color = 'red';
             chatbox.appendChild(errorElement);
             scrollToBottom();
        }

    } catch (error) {
        console.error('Error during fetch operation:', error);
         const errorElement = document.createElement('p');
         errorElement.textContent = `Error: Failed to get response from backend. Check browser console. (${error.message})`;
         errorElement.classList.add('message', 'ai');
         errorElement.style.color = 'red';
         chatbox.appendChild(errorElement);
         scrollToBottom();
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
    addInitialMessage();
});

// --- Scroll to bottom when input gets focus (for mobile keyboard) ---
userInput.addEventListener('focus', () => {
    // *** INCREASED DELAY AND ADDED LOGGING ***
    const focusScrollDelay = 500; // Increased delay to 500ms (adjust if needed)
    console.log(`Input focused. Scheduling scroll in ${focusScrollDelay}ms.`);
    setTimeout(() => {
        console.log(`Executing focus scroll. ScrollTop before: ${chatbox.scrollTop}, ScrollHeight: ${chatbox.scrollHeight}`);
        chatbox.scrollTop = chatbox.scrollHeight;
        console.log(`ScrollTop after: ${chatbox.scrollTop}`);
    }, focusScrollDelay);
});

// --- Initial Setup ---
document.addEventListener('DOMContentLoaded', addInitialMessage);

