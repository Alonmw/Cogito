// frontend-web/script.js
// v6: Dynamically set backend URL based on frontend hostname

const chatbox = document.getElementById('chatbox');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const loadingIndicator = document.getElementById('loadingIndicator');
const clearButton = document.getElementById('clearButton');

// --- Configuration ---
const PRODUCTION_FRONTEND_HOSTNAME = "socratic-questioner.vercel.app"; // Your production Vercel domain
const PRODUCTION_BACKEND_URL = "https://socratic-questioner.onrender.com/api/dialogue"; // Your Production Render backend API URL
const STAGING_BACKEND_URL = "https://socratic-questioner-dev.onrender.com/api/dialogue"; // CHANGE THIS to your actual Render STAGING backend API URL

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

// --- Debounce Function ---
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Function to scroll chatbox to the bottom
function scrollToBottom(triggerSource = 'unknown') {
    const scrollHeight = chatbox.scrollHeight;
    const scrollTop = chatbox.scrollTop;
    const clientHeight = chatbox.clientHeight;
    console.log(`ScrollToBottom called by: ${triggerSource}. H: ${scrollHeight}, Top: ${scrollTop}, ClientH: ${clientHeight}`);
    chatbox.scrollTop = scrollHeight;
}

// Function to add a message to the chatbox AND history
function addMessage(text, senderRole) {
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
        // --- Use the dynamically determined backendUrl ---
        console.log(`Fetching from: ${backendUrl}`); // Log which backend is used
        const response = await fetch(backendUrl, { // Use the variable here
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ history: conversationHistory }),
        });

        // (Error handling remains the same)
        if (!response.ok) {
             // Check specifically for CORS errors which might indicate backend CORS isn't set for staging URL
             if (response.status === 0 || !response.ok) { // Status 0 can indicate CORS failure before response
                 try {
                    const errorData = await response.json();
                    console.error('Error from backend:', response.status, errorData);
                    // Display specific error if available
                 } catch (parseError) {
                     // If parsing fails, it might be a CORS issue where response is opaque
                     console.error('CORS or Network Error likely. Status:', response.status, response.statusText);
                     const errorElement = document.createElement('p');
                     errorElement.textContent = `Error: Cannot reach backend. Check CORS config on staging backend or network issues.`;
                     errorElement.classList.add('message', 'ai'); errorElement.style.color = 'red';
                     chatbox.appendChild(errorElement);
                     setTimeout(() => scrollToBottom('sendMessage CORS/Network Error'), 0);
                     return; // Stop further processing
                 }
             }
             // Handle other non-ok responses
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
        // This catch block often catches CORS preflight failures or network errors
        console.error('Error during fetch operation:', error);
         const errorElement = document.createElement('p');
         // Provide a hint about CORS if it's a TypeError (common for CORS issues)
         const errorHint = error instanceof TypeError ? " (Possible CORS or Network issue)" : "";
         errorElement.textContent = `Error: Failed to get response from backend. Check browser console.${errorHint}`;
         errorElement.classList.add('message', 'ai'); errorElement.style.color = 'red';
         chatbox.appendChild(errorElement);
         setTimeout(() => scrollToBottom('sendMessage Catch'), 0);
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

// --- Event Listeners (Keep as before) ---
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', function(event) { if (event.key === 'Enter') { event.preventDefault(); sendMessage(); } });
clearButton.addEventListener('click', () => { addInitialMessage(); });
userInput.addEventListener('focus', () => { const focusScrollDelay = 150; console.log(`Input focused. Scheduling scroll in ${focusScrollDelay}ms.`); setTimeout(() => scrollToBottom('inputFocus'), focusScrollDelay); });

// --- Visual Viewport Resize Listener (Keep as before) ---
const handleViewportResize = debounce(() => { console.log('VisualViewport resize detected (debounced). Scheduling scroll.'); setTimeout(() => scrollToBottom('viewportResize'), 100); }, 150);
if (window.visualViewport) { console.log("VisualViewport API supported. Adding resize listener."); window.visualViewport.addEventListener('resize', handleViewportResize); } else { console.log("VisualViewport API not supported."); }

// --- Dynamic Viewport Height (--vh) Calculation (Keep as before) ---
function setViewportHeight() { let vh = window.innerHeight * 0.01; document.documentElement.style.setProperty('--vh', `${vh}px`); console.log(`Dynamic --vh set to: ${vh}px`); }
window.addEventListener('resize', setViewportHeight); window.addEventListener('orientationchange', setViewportHeight); setViewportHeight();

// --- Initial Setup ---
document.addEventListener('DOMContentLoaded', addInitialMessage);

