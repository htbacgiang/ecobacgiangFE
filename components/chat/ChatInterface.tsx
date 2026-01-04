"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, X, Minimize2, Maximize2 } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  sourceDocuments?: any[];
}

interface ChatInterfaceProps {
  isOpen: boolean;
  onToggle: () => void;
  isMinimized: boolean;
  onMinimize: () => void;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  onSendMessage: (message: string) => void;
  isConnected: boolean;
  onClearMessages: () => void;
  userAvatar?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  isOpen,
  onToggle,
  isMinimized,
  onMinimize,
  messages,
  isLoading,
  error,
  onSendMessage,
  isConnected,
  onClearMessages,
  userAvatar
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    const messageToSend = inputMessage;
    setInputMessage('');
    await onSendMessage(messageToSend);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed bottom-24 right-4 md:bottom-24 md:right-6 z-[10000] transition-all duration-300 ${
        isMinimized ? 'h-16' : 'h-[70vh] max-h-[600px]'
      } w-[calc(100vw-2rem)] max-w-sm md:w-96 chat-container bg-white/95 rounded-xl shadow-2xl border border-gray-200 flex flex-col`}
    >
      {/* Header */}
      <div className="chat-header text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">Eco Bắc Giang AI</h3>
            <p className="text-xs text-green-100">Hỗ trợ 24/7</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {/* Connection Status */}
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-400' : 'bg-red-400'
          }`} title={isConnected ? 'Đã kết nối' : 'Mất kết nối'} />
          
          <button
            onClick={onMinimize}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onToggle}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mx-4 mt-2 rounded-lg text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                {error}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[80%] ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.isUser
                      ? 'bg-green-600 ml-2'
                      : 'bg-green-600 mr-2'
                  } overflow-hidden`}>
                    {message.isUser ? (
                      userAvatar ? (
                        <img
                          src={userAvatar}
                          alt="User avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-4 h-4 text-white" />
                      )
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`${
                    message.isUser
                      ? 'chat-user-message text-white'
                      : 'chat-bot-message text-gray-800'
                  } rounded-lg p-3 shadow-sm`}>
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.isUser ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                    
                    {/* Source Documents */}
                    {message.sourceDocuments && message.sourceDocuments.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Nguồn tham khảo:</p>
                        <div className="space-y-1">
                          {message.sourceDocuments.slice(0, 2).map((doc, index) => (
                            <div key={index} className="text-xs bg-gray-100 p-2 rounded">
                              <p className="text-gray-600 truncate">
                                {doc.content}...
                              </p>
                              {doc.metadata && doc.metadata.source && (
                                <p className="text-gray-400 mt-1">
                                  Từ: {doc.metadata.source}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-green-500" />
                      <span className="text-sm text-gray-600">Đang suy nghĩ...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập câu hỏi của bạn..."
                className="chat-input flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="chat-send-btn px-4 py-2 text-white rounded-lg flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">
                Nhấn Enter để gửi, Shift+Enter để xuống dòng
              </p>
              <button
                onClick={onClearMessages}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Xóa lịch sử chat
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatInterface;
