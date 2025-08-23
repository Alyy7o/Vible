import React, { useEffect, useRef, useState } from 'react'
import { ImageIcon, SendHorizonal, X, ZoomIn, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage, fetchMessages, resetMessages } from '../features/messages/messagesSlice';
import toast from 'react-hot-toast';

const ChatBox = () => {
  const { messages, loading } = useSelector((state) => state.messages);
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [user, setUser] = useState(null);
  const [localLoading, setLocalLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [messageStatus, setMessageStatus] = useState({});
  const messagesEndRef = useRef(null);
  const dispatch = useDispatch();
  
  const { getToken } = useAuth();
  const { userId } = useParams();
  const navigate = useNavigate();

  const connections = useSelector((state) => state.connections.connections);
  const currentUser = useSelector((state) => state.user.value);

  const fetchUserMessages = async () => {
    try {
      setLocalLoading(true);
      const token = await getToken();
      console.log('Fetching messages for user:', userId);
      const result = await dispatch(fetchMessages({ token, userId }));
      
      if (result.error) {
        toast.error('Failed to load messages');
      }
    } catch (error) {
      console.error('Fetch messages error:', error);
      toast.error('Failed to load messages');
    } finally {
      setLocalLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!image && !text) return;

    try {
      setSending(true);
      const token = await getToken();
      const formData = new FormData();
      formData.append('to_user_id', userId);
      if (text) formData.append('text', text);
      image && formData.append('image', image);

      console.log('Sending message:', { to_user_id: userId, text, hasImage: !!image });

      const { data } = await api.post(
        "/api/message/send",
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
        }
      );

      if (data.success) {
        setText('');
        setImage(null);
        
        console.log('Message sent successfully:', data.message);
        
        // Add message to local state immediately for better UX
        dispatch(addMessage(data.message));
        
        // Show custom success notification
        showMessageNotification(data.message, 'sent');
        
        // Update message status
        setMessageStatus(prev => ({
          ...prev,
          [data.message._id]: 'sent'
        }));
        
      } else {
        throw new Error(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Send message error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const showMessageNotification = (message, status) => {
    const notificationContent = (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {status === 'sent' ? (
            <Check className="w-4 h-4 text-white" />
          ) : (
            <CheckCheck className="w-4 h-4 text-white" />
          )}
          <span className="text-sm font-medium">
            {status === 'sent' ? 'Message sent' : 'Message delivered'}
          </span>
        </div>
        
        {message.media_type === 'image' && (
          <div className="text-xs text-white/80">📷 Image</div>
        )}
        
        {message.text && (
          <div className="text-xs text-white/80 max-w-32 truncate">
            {message.text}
          </div>
        )}
      </div>
    );

    toast.success(notificationContent, {
      duration: 3000,
      position: 'top-right',
      className: 'custom-toast',
      style: {
        background: 'transparent',
        padding: 0,
        margin: 0,
        boxShadow: 'none',
        border: 'none',
      },
    });
  };

  const removeImage = () => {
    setImage(null);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setImage(file);
    }
  };

  const openImagePreview = (imageUrl) => {
    setPreviewImage(imageUrl);
  };

  const closeImagePreview = () => {
    setPreviewImage(null);
  };

  useEffect(() => {
    if (userId) {
      console.log('ChatBox mounted for user:', userId);
      fetchUserMessages();
    }

    // Don't reset messages when leaving - let them persist
    // return () => {
    //   dispatch(resetMessages())
    // }
  }, [userId]);

  useEffect(() => {
    if (connections.length > 0) {
      const foundUser = connections.find(connection => connection._id === userId);
      setUser(foundUser);
      console.log('Found user:', foundUser);
    }
  }, [connections, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Debug logging
  useEffect(() => {
    console.log('=== ChatBox Debug Info ===');
    console.log('Messages in ChatBox:', messages);
    console.log('Messages length:', messages?.length);
    console.log('Current user:', currentUser);
    console.log('Chat user:', user);
    console.log('Loading states:', { localLoading, loading });
    console.log('========================');
  }, [messages, currentUser, user, localLoading, loading]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  const isLoading = localLoading || loading;

  return (
    <>
      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeImagePreview}
        >
          <div className="relative max-w-4xl max-h-full">
            <img 
              src={previewImage} 
              alt="Preview" 
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={closeImagePreview}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <div className='flex flex-col h-screen'>
        {/* Header */}
        <div className="flex items-center gap-2 p-2 md:px-10 xl:pl-42 bg-gradient-to-r from-indigo-50 to-purple-50 border border-b border-gray-300">
          <img src={user.profile_picture} className='size-8 rounded-full object-cover' alt={`${user.full_name}'s profile`} />
          <div className="">
            <p className="font-medium">{user.full_name}</p>
            <p className="text-sm text-gray-500 -mt-1.5">@{user.username}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="p-5 md:px-10 h-full overflow-y-scroll bg-gray-50">
          <div className="space-y-4 max-w-4xl mx-auto">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading messages...</p>
              </div>
            ) : !messages || messages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages
                .toSorted((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                .map((message, index) => {
                  // Debug logging for each message
                  console.log('Rendering message:', message);
                  
                  const isCurrentUser = message.from_user_id && message.from_user_id._id === currentUser?._id;
                  const messageStatus = isCurrentUser ? (message.seen ? 'read' : 'sent') : null;
                  
                  return (
                    <div 
                      className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`} 
                      key={message._id || index}
                    >
                      <div className={`p-3 text-sm max-w-sm rounded-lg shadow ${
                        isCurrentUser ? 'rounded-bl-none bg-indigo-500 text-white' : 'rounded-br-none bg-white text-slate-700'
                      }`}>
                        {/* Image message */}
                        {message.media_type === 'image' && message.media_url && (
                          <div className="relative mb-2">
                            <img 
                              src={message.media_url} 
                              className='w-full max-w-sm rounded-lg cursor-pointer hover:opacity-90 transition-opacity' 
                              alt="Message image"
                              loading="lazy"
                              onClick={() => openImagePreview(message.media_url)}
                            />
                            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 opacity-0 hover:opacity-100 transition-opacity">
                              <ZoomIn size={16} />
                            </div>
                          </div>
                        )}

                        {/* Text message */}
                        {message.text && (
                          <p className="whitespace-pre-wrap">{message.text}</p>
                        )}

                        {/* Message footer with time and status */}
                        <div className="flex items-center justify-between mt-2">
                          <p className={`text-xs ${
                            isCurrentUser ? 'text-indigo-100' : 'text-gray-400'
                          }`}>
                            {message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                          </p>
                          
                          {/* Message status indicator */}
                          {isCurrentUser && (
                            <div className="flex items-center gap-1">
                              {messageStatus === 'read' ? (
                                <CheckCheck className="w-3 h-3 text-blue-300" />
                              ) : (
                                <Check className="w-3 h-3 text-indigo-200" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input message */}
        <div className="px-4 py-3 bg-white border-t border-gray-200">
          <div className="flex items-center gap-3 p-1.5 pl-5 bg-gray-50 w-full max-w-xl mx-auto border border-gray-200 shadow rounded-full">
            
            <input 
              type="text"  
              className="flex-1 outline-none text-slate-700 bg-transparent" 
              placeholder='Type a message...' 
              onKeyDown={e => e.key === 'Enter' && sendMessage()} 
              onChange={(e) => setText(e.target.value)} 
              value={text}
              disabled={sending}
            />

            {/* Image input */}
            <label htmlFor="image" className="cursor-pointer">
              {image ? (
                <div className="relative">
                  <img 
                    src={URL.createObjectURL(image)} 
                    className='h-8 w-8 rounded object-cover' 
                    alt="Selected image"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    <X size={10} />
                  </button>
                </div>
              ) : (
                <ImageIcon className='size-7 text-gray-400 hover:text-indigo-500 transition-colors' />
              )}
              <input 
                type="file" 
                accept='image/*' 
                id='image' 
                hidden 
                onChange={handleImageSelect} 
              />
            </label>

            {/* Send button */}
            <button 
              onClick={sendMessage} 
              disabled={sending || (!image && !text)}
              className={`bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 text-white cursor-pointer p-2 rounded-full transition-all ${
                sending || (!image && !text) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {sending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <SendHorizonal size={18} />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatBox;