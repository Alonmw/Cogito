// frontend-web/script.js
// v5: Use dynamic --vh CSS variable AND VisualViewport API for scroll fix

const chatbox = document.getElementById('chatbox');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const loadingIndicator = document.getElementById('loadingIndicator');
const clearButton = document.getElementById('clearButton');

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
    // Use the initial message you set
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
        // Ensure this URL points to your deployed backend
        const backendUrl = 'https://socratic-questioner.onrender.com/api/dialogue';
        const response = await fetch(backendUrl, {
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
         errorElement.textContent = `Error: Failed to get response from backend. Check browser console. (${error.message})`;
         errorElement.classList.add('message', 'ai'); errorElement.style.color = 'red';
         chatbox.appendChild(errorElement);
         setTimeout(() => scrollToBottom('sendMessage Catch'), 0);
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

// --- Event Listeners ---
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') { event.preventDefault(); sendMessage(); }
});
clearButton.addEventListener('click', () => { addInitialMessage(); });

// --- Scroll attempt on Input Focus ---
// Keep this as a potential quick trigger, but rely more on VisualViewport
userInput.addEventListener('focus', () => {
    const focusScrollDelay = 150;
    console.log(`Input focused. Scheduling scroll in ${focusScrollDelay}ms.`);
    setTimeout(() => scrollToBottom('inputFocus'), focusScrollDelay);
});

// --- Visual Viewport Resize Listener ---
// Debounced function to scroll to bottom on resize
const handleViewportResize = debounce(() => {
    console.log('VisualViewport resize detected (debounced). Scheduling scroll.');
    // Use a short delay after the debounced event fires to allow layout reflow
    setTimeout(() => scrollToBottom('viewportResize'), 100); // Delay might need tuning
}, 150); // Debounce wait time

// Check if VisualViewport API is supported
if (window.visualViewport) {
    console.log("VisualViewport API supported. Adding resize listener.");
    window.visualViewport.addEventListener('resize', handleViewportResize);
} else {
    console.log("VisualViewport API not supported. Relying on focus/addMessage scroll.");
    // Optionally add a fallback window resize listener here, but it's less reliable
    // window.addEventListener('resize', handleViewportResize); // Less accurate
}

// --- Dynamic Viewport Height (--vh) Calculation ---
// Keep this code you added
function setViewportHeight() {
  // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
  let vh = window.innerHeight * 0.01;
  // Then we set the value in the --vh custom property to the root of the document
  document.documentElement.style.setProperty('--vh', `${vh}px`);
  console.log(`Dynamic --vh set to: ${vh}px`); // Log the value
}
// Listen to resize and orientationchange events
window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', setViewportHeight);
// Initial calculation
setViewportHeight();


// --- Initial Setup ---
document.addEventListener('DOMContentLoaded', addInitialMessage);

