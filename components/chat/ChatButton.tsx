"use client";

import React from 'react';
import { MessageCircle, X } from 'lucide-react';

interface ChatButtonProps {
  isOpen: boolean;
  onToggle: () => void;
  unreadCount?: number;
}

const ChatButton: React.FC<ChatButtonProps> = ({ 
  isOpen, 
  onToggle, 
  unreadCount = 0 
}) => {
  return (
    <button
      onClick={onToggle}
      className={`fixed bottom-20 md:bottom-6 right-6 z-[10000] w-14 h-14 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 ${
        isOpen 
          ? 'bg-red-500 hover:bg-red-600' 
          : 'bg-green-500 hover:bg-green-600'
      } flex items-center justify-center text-white`}
      aria-label={isOpen ? 'Đóng chat' : 'Mở chat'}
    >
      {isOpen ? (
        <X className="w-6 h-6" />
      ) : (
        <div className="relative">
          <MessageCircle className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      )}
    </button>
  );
};

export default ChatButton;
