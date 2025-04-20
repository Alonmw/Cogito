// src/components/InputArea.tsx
import React, { useState } from 'react';

interface InputAreaProps {
  onSendMessage: (message: string) => void; // Function to call when sending
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue(''); // Clear input after sending
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) { // Send on Enter, allow Shift+Enter for newline
      event.preventDefault();
      handleSubmit(event as any); // Submit form
    }
  };


  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border-t border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center flex-shrink-0"
    >
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown} // Add keydown listener
        placeholder="Type your message here..."
        className="flex-grow p-2 border border-gray-400 dark:border-gray-600 rounded-lg mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
      />
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out disabled:opacity-50"
        disabled={!inputValue.trim()} // Disable button if input is empty
      >
        Send
      </button>
    </form>
  );
};

export default InputArea;
