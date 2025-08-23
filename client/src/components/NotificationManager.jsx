import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import MessageNotification from './MessageNotification';
import './NotificationAnimations.css';

const NotificationManager = () => {
  const [notifications, setNotifications] = useState([]);
  const currentUser = useSelector((state) => state.user.value);

  // Listen for new message notifications
  useEffect(() => {
    const handleNewMessage = (event) => {
      try {
        const message = event.detail;
        
        // Only show notification if it's not from the current user
        // and we're not currently in that chat
        const currentPath = window.location.pathname;
        const isInChat = currentPath.startsWith('/messages/');
        const isCurrentUserMessage = message.from_user_id?._id === currentUser?._id;
        
        if (!isCurrentUserMessage && !isInChat) {
          addNotification(message);
        }
      } catch (error) {
        console.error('Error handling message notification:', error);
      }
    };

    // Add event listener for new messages
    window.addEventListener('newMessage', handleNewMessage);
    
    return () => {
      window.removeEventListener('newMessage', handleNewMessage);
    };
  }, [currentUser]);

  const addNotification = (message) => {
    const notification = {
      id: Date.now() + Math.random(),
      message,
      timestamp: new Date(),
      isRead: false
    };

    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep max 5 notifications

    // Auto-remove notification after 10 seconds
    setTimeout(() => {
      removeNotification(notification.id);
    }, 10000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 notification-stack">
      {notifications.map((notification) => (
        <MessageNotification
          key={notification.id}
          message={notification.message}
          sender={notification.message.from_user_id}
          receiver={notification.message.to_user_id}
          timestamp={notification.timestamp}
          isRead={notification.isRead}
          onClose={() => removeNotification(notification.id)}
          onRead={() => markAsRead(notification.id)}
        />
      ))}
    </div>
  );
};

export default NotificationManager; 