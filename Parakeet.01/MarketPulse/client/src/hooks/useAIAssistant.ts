import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { ChatMessage, AIAssistantResponse } from '@shared/types';
import { v4 as uuidv4 } from 'uuid';

export const useAIAssistant = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Send message to AI assistant mutation
  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest('POST', '/api/ai/chat', { message });
      return response.json();
    },
    onSuccess: (data: AIAssistantResponse) => {
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        options: data.options,
        products: data.products
      };
      
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    },
    onError: (error) => {
      console.error('AI Assistant error:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }
  });
  
  // Send message to AI assistant
  const sendMessage = useCallback(async (message: ChatMessage) => {
    // Add user message to chat
    setMessages((prevMessages) => [...prevMessages, message]);
    
    // Send message to AI
    mutate(message.content);
  }, [mutate]);
  
  // Clear messages and set initial messages if provided
  const clearMessages = useCallback((initialMessages?: ChatMessage[]) => {
    setMessages(initialMessages || []);
  }, []);
  
  return {
    messages,
    sendMessage,
    clearMessages,
    isLoading
  };
};
