import { useState, useRef, useEffect, useContext } from 'react';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { LanguageContext } from '@/contexts/LanguageContext';
import { ChatMessage } from '@shared/types';
import { translations } from '@/lib/i18n';
import { v4 as uuidv4 } from 'uuid';
import { useLocation } from 'wouter';
import { ProductCard } from './ProductCard';

export const AIChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { language } = useContext(LanguageContext);
  const { sendMessage, isLoading, messages, clearMessages } = useAIAssistant();
  const [, navigate] = useLocation();
  const t = translations[language];

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && messages.length === 0) {
      // Add initial welcome message when opening for the first time
      const initialMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: t.aiWelcomeMessage,
        timestamp: new Date()
      };
      clearMessages([initialMessage]);
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === '') return;
    
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    
    setInputValue('');
    await sendMessage(userMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleOptionClick = (value: string) => {
    if (value.startsWith('product_')) {
      // Navigate to product details
      const productId = value.split('_')[1];
      navigate(`/shop/product/${productId}`);
      setIsOpen(false);
    } else if (value.startsWith('category_')) {
      // Navigate to category
      const categorySlug = value.split('_')[1];
      navigate(`/shop?category=${categorySlug}`);
      setIsOpen(false);
    } else if (value.startsWith('show_')) {
      // Show specific section
      const section = value.split('_')[1];
      navigate(`/shop?section=${section}`);
      setIsOpen(false);
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      {/* Chat toggle button */}
      <div className="fixed bottom-20 right-4 z-50">
        <button
          className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg animate-pulse"
          onClick={toggleChat}
          aria-label={isOpen ? t.closeChat : t.openChat}
          style={{ fontSize: '24px' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10H2V12A10 10 0 0 1 12 2z"></path>
            <path d="M7 15h0"></path>
            <path d="M12 15h0"></path>
            <path d="M17 15h0"></path>
          </svg>
        </button>
      </div>

      {/* Chat overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[70vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center">
                  <i className="ri-robot-line"></i>
                </div>
                <h3 className="ml-2 font-medium">{t.aiAssistant}</h3>
              </div>
              <button 
                className="text-gray-500" 
                onClick={() => setIsOpen(false)}
                aria-label={t.closeChat}
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>

            {/* Chat messages */}
            <div 
              className="flex-1 overflow-y-auto p-4 space-y-4"
              ref={chatContainerRef}
            >
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex items-start max-w-[85%] ${
                    message.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center shrink-0 mt-1">
                      <i className="ri-robot-line"></i>
                    </div>
                  )}
                  <div 
                    className={`${
                      message.role === 'user' 
                        ? 'bg-primary text-white' 
                        : 'ml-2 bg-gray-100 text-gray-800'
                    } rounded-lg p-3 text-sm`}
                  >
                    <p style={{ whiteSpace: 'pre-line' }}>{message.content}</p>
                    
                    {/* Show options if available */}
                    {message.options && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.options.map((option, index) => (
                          <button
                            key={index}
                            className="px-3 py-1.5 bg-white text-primary text-xs rounded-full border border-primary hover:bg-primary/10 transition"
                            onClick={() => handleOptionClick(option.value)}
                          >
                            {option.text}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Show product recommendations if available */}
                    {message.products && message.products.length > 0 && (
                      <div className="mt-3 space-y-3">
                        {message.products.map((product) => (
                          <div key={product.id} className="bg-white p-2 rounded border border-gray-200">
                            <ProductCard product={product} compact />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex items-start max-w-[85%]">
                  <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center shrink-0 mt-1">
                    <i className="ri-robot-line"></i>
                  </div>
                  <div className="ml-2 bg-gray-100 rounded-lg p-3">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-100"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="p-3 border-t">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t.askAboutProducts}
                  className="w-full rounded-full border border-gray-300 py-2 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyUp={handleKeyPress}
                  disabled={isLoading}
                />
                <button
                  className={`absolute right-2 top-2 ${
                    isLoading ? 'text-gray-400' : 'text-secondary'
                  }`}
                  onClick={handleSendMessage}
                  disabled={isLoading}
                  aria-label={t.sendMessage}
                >
                  <i className="ri-send-plane-fill text-lg"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatAssistant;
