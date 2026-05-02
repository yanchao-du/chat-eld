'use client';
import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const history = messages.slice(-10);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history })
      });
      
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: "I don't have that information. Please contact ELD at 1800-225-5353 or visit www.eld.gov.sg" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="w-[100vw] sm:w-[400px] h-[100vh] sm:h-[500px] bg-gray-50 flex flex-col shadow-2xl rounded-t-lg sm:rounded-lg overflow-hidden border border-gray-200 mb-4 transition-all duration-300">
          <div className="bg-eldRed text-white p-4 flex justify-between items-center shadow-sm z-10">
            <span className="font-semibold text-lg">ELD Info Assistant</span>
            <button type="button" onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200 p-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <title>Close Chat</title>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 my-auto p-4">
                <p className="text-sm">Hello! I am ELDBot, your official election information assistant. How can I help you today?</p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <ChatMessage key={i} role={msg.role} content={msg.content} />
              ))
            )}
            {loading && (
              <div className="flex w-full mb-4 justify-start">
                <div className="bg-white border border-gray-200 text-gray-800 rounded-lg rounded-bl-none p-4 shadow-sm flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-10">
            <form onSubmit={handleSend} className="flex gap-2 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about elections..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-eldRed focus:border-transparent text-sm bg-gray-50 text-gray-900"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-eldRed text-white px-4 py-2 rounded-full hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium shadow-sm text-sm"
              >
                Send
              </button>
            </form>
            <div className="text-center mt-2 pb-1 text-[10px] text-gray-400 font-medium tracking-wide uppercase">
              Powered by Claude &middot; For official info: eld.gov.sg
            </div>
          </div>
        </div>
      )}

      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-eldRed rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
          aria-label="Open chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="white">
            <title>Open Chat</title>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}
    </div>
  );
}
