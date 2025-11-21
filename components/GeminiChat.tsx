import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, Loader2 } from 'lucide-react';
import { ChatMessage, Game } from '../types';
import { chatWithGemini } from '../services/geminiService';

interface GeminiChatProps {
  games: Game[];
  isDarkMode: boolean;
}

export const GeminiChat: React.FC<GeminiChatProps> = ({ games, isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'model', text: "Hi there! I'm AIni. Looking for a specific type of game or need a recommendation?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Prepare history for API
    const historyForApi = messages.map(m => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.text }]
    }));

    const responseText = await chatWithGemini(historyForApi, userMsg.text, games);

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText || "I'm speechless!"
    };

    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 group ${
          isOpen ? 'bg-rose-500 rotate-90' : (isDarkMode ? 'bg-[#66c0f4] hover:bg-[#4faed4]' : 'bg-blue-600 hover:bg-blue-700')
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Bot className={`w-6 h-6 ${isDarkMode ? 'text-[#171a21]' : 'text-white'}`} />
        )}
        {!isOpen && (
          <span className="absolute -top-2 -left-2 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-sky-500"></span>
          </span>
        )}
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-24 right-6 z-40 w-80 sm:w-96 border rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 origin-bottom-right flex flex-col ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        } ${isDarkMode ? 'bg-[#171a21] border-[#2a475e]' : 'bg-white border-gray-200'}`}
        style={{ maxHeight: '600px', height: 'calc(100vh - 120px)' }}
      >
        {/* Header */}
        <div className={`${isDarkMode ? 'bg-[#2a475e]' : 'bg-blue-600'} p-4 flex items-center gap-3`}>
          <div className="bg-white/20 p-2 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white">AIni Assistant</h3>
            <p className="text-indigo-100 text-xs">Powered by Gemini AI</p>
          </div>
        </div>

        {/* Messages */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isDarkMode ? 'bg-[#1b2838]' : 'bg-gray-50'}`}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? (isDarkMode ? 'bg-[#66c0f4] text-[#171a21] rounded-tr-none font-medium' : 'bg-blue-600 text-white rounded-tr-none')
                    : (isDarkMode ? 'bg-[#3d4450] text-[#c7d5e0] rounded-tl-none' : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none')
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className={`${isDarkMode ? 'bg-[#3d4450]' : 'bg-white shadow-sm border border-gray-100'} p-3 rounded-2xl rounded-tl-none flex items-center gap-2`}>
                <Loader2 className={`w-4 h-4 animate-spin ${isDarkMode ? 'text-[#66c0f4]' : 'text-blue-600'}`} />
                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>AIni is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className={`p-3 border-t ${isDarkMode ? 'bg-[#171a21] border-[#2a475e]' : 'bg-white border-gray-200'}`}>
          <div className="relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about games..."
              className={`w-full rounded-xl py-3 pl-4 pr-12 border focus:outline-none focus:ring-1 text-sm
                ${isDarkMode 
                  ? 'bg-[#2a475e] text-white placeholder-gray-400 border-[#3d4450] focus:border-[#66c0f4] focus:ring-[#66c0f4]' 
                  : 'bg-gray-100 text-gray-900 placeholder-gray-500 border-gray-200 focus:border-blue-500 focus:ring-blue-500'}`}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? 'text-[#66c0f4] hover:text-white' : 'text-blue-600 hover:text-blue-800'}`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};