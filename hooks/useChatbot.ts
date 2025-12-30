"use client";

import { useState, useCallback } from 'react';
import { chatbotAPI, ChatResponse } from '../lib/chatbot-api';

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  sourceDocuments?: any[];
}

export interface UseChatbotReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  isConnected: boolean;
  checkConnection: () => Promise<void>;
}

export const useChatbot = (): UseChatbotReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Xin chào anh/chi, Em là chatbot AI của Eco Bắc Giang. Em có thể giúp anh/chị tìm hiểu về dự án, sản phẩm, kỹ thuật canh tác hữu cơ và nhiều thông tin khác. Anh/chị muốn biết gì?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    // Thêm tin nhắn của user
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response: ChatResponse = await chatbotAPI.sendMessage(messageText);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.response || 'Xin lỗi, tôi không thể trả lời câu hỏi này.',
        isUser: false,
        timestamp: new Date(),
        sourceDocuments: response.source_documents
      };

      setMessages(prev => [...prev, botMessage]);
      setIsConnected(true);
    } catch (err) {
      console.error('Error sending message:', err);
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi gửi tin nhắn';
      setError(errorMessage);
      
      const errorBotMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: errorMessage,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorBotMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: '1',
        text: 'Xin chào! Tôi là chatbot AI của Eco Bắc Giang. Tôi có thể giúp bạn tìm hiểu về dự án, sản phẩm, kỹ thuật canh tác hữu cơ và nhiều thông tin khác. Bạn muốn biết gì?',
        isUser: false,
        timestamp: new Date()
      }
    ]);
    setError(null);
  }, []);

  const checkConnection = useCallback(async () => {
    try {
      const isConnected = await chatbotAPI.testConnection();
      setIsConnected(isConnected);
      if (!isConnected) {
        setError('Không thể kết nối với chatbot API');
      } else {
        setError(null);
      }
    } catch (err) {
      setIsConnected(false);
      setError('Không thể kết nối với chatbot API');
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    isConnected,
    checkConnection
  };
};
