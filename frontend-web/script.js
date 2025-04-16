// frontend-web/script.js

const chatbox = document.getElementById('chatbox');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');

// Function to add a message to the chatbox
function addMessage(text, sender) {
    const messageElement = document.createElement('p');
    messageElement.textContent = text;
    messageElement.classList.add('message', sender); // 'user' or 'ai'
    chatbox.appendChild(messageElement);
    // Scroll to the bottom of the chatbox
    chatbox.scrollTop = chatbox.scrollHeight;
}

// Function to send message to backend and display response
async function sendMessage() {
    const userText = userInput.value.trim();

    if (userText === '') {
        return; // Don't send empty messages
    }

    // Display user's message immediately
    addMessage(userText, 'user');
    userInput.value = ''; // Clear input field

    try {
        // Send message to the Flask backend API
        const response = await fetch('http://127.0.0.1:5000/api/dialogue', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userText }), // Send as JSON
        });

        if (!response.ok) {
            // Handle HTTP errors (like 500 Internal Server Error)
            const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
            console.error('Error from backend:', response.status, errorData);
            addMessage(`Error: ${errorData.error || response.statusText}`, 'ai');
            return;
        }

        // Get JSON response from backend
        const data = await response.json();

        // Display AI's response
        if (data.response) {
             addMessage(data.response, 'ai');
        } else if (data.error) {
            // Handle errors returned in JSON payload
            console.error('Error in backend response:', data.error);
            addMessage(`Error: ${data.error}`, 'ai');
        }

    } catch (error) {
        // Handle network errors (e.g., server down)
        console.error('Network error:', error);
        addMessage('Error: Could not connect to the backend.', 'ai');
    }
}

// Event listener for the Send button
sendButton.addEventListener('click', sendMessage);

// Event listener for pressing Enter in the input field
userInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent default form submission
        sendMessage();
    }
});