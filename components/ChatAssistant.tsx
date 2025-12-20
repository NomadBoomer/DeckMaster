import React, { useState, useRef, useEffect } from 'react';
import { chatWithAssistant } from '../services/geminiService';

const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput('');
    setLoading(true);

    const newMessages = [...messages, { role: 'user' as const, text: userMsg }];
    setMessages(newMessages);

    try {
        // Convert internal format to Gemini API format
        const history = newMessages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));

        const response = await chatWithAssistant(history, userMsg);
        setMessages([...newMessages, { role: 'model', text: response || '' }]);
    } catch (error) {
        setMessages([...newMessages, { role: 'model', text: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button 
            onClick={() => setIsOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-110 flex items-center justify-center"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
        </button>
      )}

      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 flex flex-col h-[500px] border border-gray-200">
            {/* Header */}
            <div className="bg-blue-600 p-4 rounded-t-2xl flex justify-between items-center text-white">
                <h3 className="font-bold flex items-center gap-2">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                     <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                   </svg>
                   Deck Helper
                </h3>
                <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 rounded p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 scrollbar-hide">
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 text-sm mt-10">
                        Ask me about local codes, material differences, or construction tips!
                    </div>
                )}
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div 
                            className={`max-w-[85%] rounded-lg p-3 text-sm ${
                                m.role === 'user' 
                                ? 'bg-blue-600 text-white rounded-br-none' 
                                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                            }`}
                            dangerouslySetInnerHTML={{ __html: m.text }}
                        />
                    </div>
                ))}
                {loading && (
                     <div className="flex justify-start">
                        <div className="bg-gray-200 rounded-lg p-3 rounded-bl-none animate-pulse">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-200 bg-white rounded-b-2xl">
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type your question..."
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ChatAssistant;