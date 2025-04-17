// frontend-web/script.js
// v4: Use VisualViewport API for more reliable scroll on keyboard open

const chatbox = document.getElementById('chatbox');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const loadingIndicator = document.getElementById('loadingIndicator');
const clearButton = document.getElementById('clearButton');

// Conversation History Array
let conversationHistory = []; // Stores { role: 'user' | 'assistant', content: '...' }

// --- Debounce Function ---
// Limits how often a function can run. Useful for resize/scroll events.
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
function scrollToBottom() {
    // No timeout needed here, scroll immediately after DOM update
    chatbox.scrollTop = chatbox.scrollHeight;
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
    setTimeout(scrollToBottom, 0);
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
    // Ensure scroll happens even when indicator shows
    // Use setTimeout to ensure it happens after DOM update/paint
    setTimeout(scrollToBottom, 0);


    try {
        const response = await fetch('https://socratic-questioner.onrender.com/api/dialogue', { // Ensure this URL is correct
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ history: conversationHistory }),
        });

        // (Error handling remains the same, but ensure scroll on error display)
        if (!response.ok) {
             const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
             console.error('Error from backend:', response.status, errorData);
             const errorElement = document.createElement('p');
             errorElement.textContent = `Error: ${errorData.error || response.statusText}`;
             errorElement.classList.add('message', 'ai');
             errorElement.style.color = 'red';
             chatbox.appendChild(errorElement);
             setTimeout(scrollToBottom, 0); // Scroll after adding error message
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
             setTimeout(scrollToBottom, 0); // Scroll after adding error message
        }

    } catch (error) {
        console.error('Error during fetch operation:', error);
         const errorElement = document.createElement('p');
         errorElement.textContent = `Error: Failed to get response from backend. Check browser console. (${error.message})`;
         errorElement.classList.add('message', 'ai');
         errorElement.style.color = 'red';
         chatbox.appendChild(errorElement);
         setTimeout(scrollToBottom, 0); // Scroll after adding error message
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

// --- NEW: Visual Viewport Resize Listener ---
// Debounced function to scroll to bottom on resize
const handleViewportResize = debounce(() => {
    console.log('VisualViewport resized, scrolling to bottom.');
    // Add a minimal delay here too, just in case scrollHeight isn't updated instantly
    setTimeout(() => {
        chatbox.scrollTop = chatbox.scrollHeight;
    }, 50); // Short delay after resize event settles
}, 100); // Debounce wait time in ms

// Check if VisualViewport API is supported
if (window.visualViewport) {
    console.log("VisualViewport API supported. Adding resize listener.");
    window.visualViewport.addEventListener('resize', handleViewportResize);
} else {
    console.log("VisualViewport API not supported.");
    // Fallback (optional): could try window resize or keep the focus listener
    // userInput.addEventListener('focus', () => { ... }); // Previous attempt
}


// --- Initial Setup ---
document.addEventListener('DOMContentLoaded', addInitialMessage);

