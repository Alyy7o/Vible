import React, { useState, useEffect } from 'react';
import { MessageSquare, User, Clock, Check, CheckCheck, X } from 'lucide-react';
import './NotificationAnimations.css';

const MessageNotification = ({ message, sender, receiver, timestamp, isRead, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setIsVisible(true);
  }, []);

  const formatTime = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return messageTime.toLocaleDateString();
  };

  const getReadStatusIcon = () => {
    if (isRead) {
      return <CheckCheck className="w-4 h-4 text-blue-500" />;
    }
    return <Check className="w-4 h-4 text-gray-400" />;
  };

  const getMessagePreview = () => {
    if (message.media_type === 'image') {
      return '📷 Image';
    }
    return message.text?.length > 50 
      ? `${message.text.substring(0, 50)}...` 
      : message.text || 'Message';
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300); // Wait for exit animation
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm ${
      isVisible ? 'notification-enter' : 'notification-exit'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900">New Message</p>
            <p className="text-xs text-gray-500">from {sender?.full_name || 'Unknown'}</p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
        >
          <X size={16} />
        </button>
      </div>

      {/* Message Content */}
      <div className="mb-3">
        <p className="text-sm text-gray-700 mb-2">{getMessagePreview()}</p>
        
        {/* Image preview if it's an image message */}
        {message.media_type === 'image' && message.media_url && (
          <div className="relative">
            <img 
              src={message.media_url} 
              alt="Message preview" 
              className="w-full h-20 object-cover rounded-md"
            />
            <div className="absolute inset-0 bg-black bg-opacity-10 rounded-md"></div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{formatTime(timestamp)}</span>
        </div>
        
        <div className="flex items-center gap-1">
          {getReadStatusIcon()}
          <span>{isRead ? 'Read' : 'Delivered'}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button 
          onClick={() => {
            // Navigate to chat
            window.location.href = `/messages/${sender?._id}`;
          }}
          className="flex-1 bg-indigo-500 text-white text-xs py-2 px-3 rounded-md hover:bg-indigo-600 transition-colors font-medium"
        >
          Reply
        </button>
        <button 
          onClick={handleClose}
          className="flex-1 bg-gray-100 text-gray-700 text-xs py-2 px-3 rounded-md hover:bg-gray-200 transition-colors font-medium"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default MessageNotification; 