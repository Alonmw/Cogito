// frontend-web/script.js
// Reverted to state after history/dynamic URL, before keyboard scroll fixes

const chatbox = document.getElementById('chatbox');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const loadingIndicator = document.getElementById('loadingIndicator');
const clearButton = document.getElementById('clearButton');

// --- Configuration ---
const PRODUCTION_FRONTEND_HOSTNAME = "socratic-questioner.vercel.app"; // Your production Vercel domain
const PRODUCTION_BACKEND_URL = "https://socratic-questioner.onrender.com/api/dialogue"; // Your Production Render backend API URL
const STAGING_BACKEND_URL = "https://socratic-questioner-dev.onrender.com/api/dialogue"; // Your Render STAGING backend API URL

// Determine backend URL based on where the frontend is running
let backendUrl;
if (window.location.hostname === PRODUCTION_FRONTEND_HOSTNAME) {
    backendUrl = PRODUCTION_BACKEND_URL;
    console.log("Using PRODUCTION backend URL:", backendUrl);
} else {
    // Assume any other hostname (like Vercel previews) uses staging
    backendUrl = STAGING_BACKEND_URL;
    console.log("Using STAGING backend URL:", backendUrl);
}
// --- End Configuration ---

// Conversation History Array
let conversationHistory = []; // Stores { role: 'user' | 'assistant', content: '...' }

// Function to scroll chatbox to the bottom
function scrollToBottom(triggerSource = 'unknown') {
    // Simple scroll to bottom
    // console.log(`ScrollToBottom called by: ${triggerSource}. H: ${chatbox.scrollHeight}`); // Optional log
    chatbox.scrollTop = chatbox.scrollHeight;
}

// Function to add a message to the chatbox AND history
function addMessage(text, senderRole) { // senderRole should be 'user' or 'assistant'
    const messageElement = document.createElement('p');
    messageElement.textContent = text;
    messageElement.classList.add('message', senderRole === 'assistant' ? 'ai' : 'user');
    chatbox.appendChild(messageElement);

    // Add to history
    if (conversationHistory.length === 0 && senderRole === 'assistant') {
         conversationHistory.push({ role: senderRole, content: text });
    } else if (conversationHistory.length > 0 && conversationHistory[conversationHistory.length - 1].content !== text) {
        conversationHistory.push({ role: senderRole, content: text });
    } else if (senderRole === 'user'){
         conversationHistory.push({ role: senderRole, content: text });
    }

    // Scroll to bottom whenever a new message is added
    // Use setTimeout to ensure it happens after DOM update/paint
    setTimeout(() => scrollToBottom('addMessage'), 0);
}

// Function to display the initial AI message and add to history
function addInitialMessage() {
    const initialMessage = "Greetings. I do not have answers, only questions. Shall we think something through together?";
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
    setTimeout(() => scrollToBottom('sendMessage Indicator'), 0);

    try {
        console.log(`Fetching from: ${backendUrl}`);
        const response = await fetch(backendUrl, { // Use the dynamic variable
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ history: conversationHistory }),
        });

        // (Error handling remains the same)
        if (!response.ok) {
             const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
             console.error('Error from backend:', response.status, errorData);
             const errorElement = document.createElement('p');
             errorElement.textContent = `Error: ${errorData.error || response.statusText}`;
             errorElement.classList.add('message', 'ai'); errorElement.style.color = 'red';
             chatbox.appendChild(errorElement);
             setTimeout(() => scrollToBottom('sendMessage Error OK'), 0);
             return;
        }
        const data = await response.json();
        if (data.response) {
             addMessage(data.response, 'assistant');
        } else if (data.error) {
             console.error('Error in backend response:', data.error);
             const errorElement = document.createElement('p');
             errorElement.textContent = `Error: ${data.error}`;
             errorElement.classList.add('message', 'ai'); errorElement.style.color = 'red';
             chatbox.appendChild(errorElement);
             setTimeout(() => scrollToBottom('sendMessage Error Payload'), 0);
        }
    } catch (error) {
        console.error('Error during fetch operation:', error);
         const errorElement = document.createElement('p');
         const errorHint = error instanceof TypeError ? " (Possible CORS or Network issue)" : "";
         errorElement.textContent = `Error: Failed to get response from backend. Check browser console.${errorHint}`;
         errorElement.classList.add('message', 'ai'); errorElement.style.color = 'red';
         chatbox.appendChild(errorElement);
         setTimeout(() => scrollToBottom('sendMessage Catch'), 0);
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

// --- Event Listeners ---
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', function(event) { if (event.key === 'Enter') { event.preventDefault(); sendMessage(); } });
clearButton.addEventListener('click', () => { addInitialMessage(); });

// --- REMOVED: Scroll attempt on Input Focus listener ---
// --- REMOVED: Visual Viewport Resize Listener ---
// --- REMOVED: Dynamic Viewport Height (--vh) Calculation ---


// --- Initial Setup ---
document.addEventListener('DOMContentLoaded', addInitialMessage);

