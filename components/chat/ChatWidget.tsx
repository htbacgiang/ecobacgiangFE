"use client";

import React, { useState, useEffect } from 'react';
import ChatButton from './ChatButton';
import ChatInterface from './ChatInterface';
import { useChatbot } from '../../hooks/useChatbot';
import useAuth from '../../hooks/useAuth';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const { user } = useAuth();
  const userAvatar = user?.avatar;

  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    isConnected,
    checkConnection
  } = useChatbot();

  // Kiểm tra kết nối khi component mount
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  // Đếm tin nhắn chưa đọc
  useEffect(() => {
    if (!isOpen && messages.length > 1) {
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage.isUser) {
        setUnreadCount(prev => prev + 1);
      }
    }
  }, [messages, isOpen]);

  // Reset unread count khi mở chat
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) setIsMinimized(false);
      return next;
    });
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleSendMessage = async (message: string) => {
    await sendMessage(message);
  };

  return (
    <>
      <ChatButton
        isOpen={isOpen}
        onToggle={handleToggle}
        unreadCount={unreadCount}
      />
      
      <ChatInterface
        isOpen={isOpen}
        onToggle={handleToggle}
        isMinimized={isMinimized}
        onMinimize={handleMinimize}
        messages={messages}
        isLoading={isLoading}
        error={error}
        onSendMessage={handleSendMessage}
        isConnected={isConnected}
        onClearMessages={clearMessages}
        userAvatar={userAvatar}
      />
    </>
  );
};

export default ChatWidget;
