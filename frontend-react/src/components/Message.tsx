// src/components/Message.tsx
import React from 'react';

// Define the structure of a message object
export interface MessageData {
  role: 'user' | 'assistant'; // Roles recognized by OpenAI & for styling
  content: string;
}

interface MessageProps {
  message: MessageData;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const { role, content } = message;
  const isUser = role === 'user';

  // Base classes for all messages
  const baseClasses = "mb-3 py-2 px-4 rounded-lg max-w-[85%] lg:max-w-[75%] shadow-sm break-words";

  // Conditional classes based on role
  const roleClasses = isUser
    ? "bg-blue-100 dark:bg-blue-800 text-gray-900 dark:text-gray-100 ml-auto rounded-br-none" // User message styles (align right)
    : "bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100 mr-auto rounded-bl-none"; // AI message styles (align left)

  return (
    <div className={`${baseClasses} ${roleClasses}`}>
      {/* Render content - consider using a markdown renderer later if needed */}
      {/* For now, render text directly, preserving whitespace */}
      <p className="whitespace-pre-wrap">{content}</p>
    </div>
  );
};

export default Message;
