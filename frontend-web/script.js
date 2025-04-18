// frontend-web/script.js
// v5: Combine VisualViewport resize and input focus triggers for scroll fix

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
    // No timeout here, let the caller handle delays if needed
    const scrollHeight = chatbox.scrollHeight;
    const scrollTop = chatbox.scrollTop;
    const clientHeight = chatbox.clientHeight;
    console.log(`ScrollToBottom called by: ${triggerSource}. H: ${scrollHeight}, Top: ${scrollTop}, ClientH: ${clientHeight}`);
    chatbox.scrollTop = scrollHeight;
    // Optional: Check after setting
    // requestAnimationFrame(() => {
    //     console.log(`ScrollTop after setting by ${triggerSource}: ${chatbox.scrollTop}`);
    // });
}

// Function to add a message to the chatbox AND history
function addMessage(text, senderRole) { // senderRole should be 'user' or 'assistant'
    const messageElement = document.createElement('p');
    messageElement.textContent = text;
    messageElement.classList.add('message', senderRole === 'assistant' ? 'ai' : 'user');
    chatbox.appendChild(messageElement);

    // Add to history (with basic duplicate check logic)
    // (Keep logic from previous version)
    if (conversationHistory.length === 0 && senderRole === 'assistant') {
         conversationHistory.push({ role: senderRole, content: text });
    } else if (conversationHistory.length > 0 && conversationHistory[conversationHistory.length - 1].content !== text) {
        conversationHistory.push({ role: senderRole, content: text });
    } else if (senderRole === 'user'){
         conversationHistory.push({ role: senderRole, content: text });
    }
    // console.log("History:", conversationHistory); // Optional debugging

    // Scroll to bottom whenever a new message is added
    // Use setTimeout to ensure it happens after DOM update/paint
    setTimeout(() => scrollToBottom('addMessage'), 0);
}

// Function to display the initial AI message and add to history
function addInitialMessage() {
    const initialMessage = "?";
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
    setTimeout(() => scrollToBottom('sendMessage Indicator'), 0); // Ensure scroll happens after indicator shows

    try {
        const response = await fetch('https://socratic-questioner.onrender.com/api/dialogue', { // Ensure this URL is correct
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ history: conversationHistory }),
        });

        // (Error handling remains the same, ensure scroll on error display)
        if (!response.ok) {
             const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
             console.error('Error from backend:', response.status, errorData);
             const errorElement = document.createElement('p');
             errorElement.textContent = `Error: ${errorData.error || response.statusText}`;
             errorElement.classList.add('message', 'ai');
             errorElement.style.color = 'red';
             chatbox.appendChild(errorElement);
             setTimeout(() => scrollToBottom('sendMessage Error OK'), 0);
             return;
        }

        const data = await response.json();

        if (data.response) {
             addMessage(data.response, 'assistant'); // Adds message and scrolls
        } else if (data.error) {
             console.error('Error in backend response:', data.error);
             const errorElement = document.createElement('p');
             errorElement.textContent = `Error: ${data.error}`;
             errorElement.classList.add('message', 'ai');
             errorElement.style.color = 'red';
             chatbox.appendChild(errorElement);
             setTimeout(() => scrollToBottom('sendMessage Error Payload'), 0);
        }

    } catch (error) {
        console.error('Error during fetch operation:', error);
         const errorElement = document.createElement('p');
         errorElement.textContent = `Error: Failed to get response from backend. Check browser console. (${error.message})`;
         errorElement.classList.add('message', 'ai');
         errorElement.style.color = 'red';
         chatbox.appendChild(errorElement);
         setTimeout(() => scrollToBottom('sendMessage Catch'), 0);
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

// --- Scroll attempt on Input Focus ---
userInput.addEventListener('focus', () => {
    const focusScrollDelay = 150; // Shorter delay, maybe focus is reliable enough now?
    console.log(`Input focused. Scheduling scroll in ${focusScrollDelay}ms.`);
    setTimeout(() => scrollToBottom('inputFocus'), focusScrollDelay);
});

// dynamic-vh.js
function setViewportHeight() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Call on load and on resize
window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', setViewportHeight);
setViewportHeight();
// --- Initial Setup ---
document.addEventListener('DOMContentLoaded', addInitialMessage);

