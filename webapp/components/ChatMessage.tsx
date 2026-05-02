import React from 'react';

export default function ChatMessage({ role, content }: { role: 'user' | 'assistant', content: string }) {
  const isUser = role === 'user';
  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg p-3 text-sm shadow-sm ${
          isUser
            ? 'bg-eldRed text-white rounded-br-none'
            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
        }`}
      >
        {content}
      </div>
    </div>
  );
}
