import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom';
import moment from 'moment';
import { useAuth, useUser } from '@clerk/clerk-react';
import api from '../api/axios';

const RecentMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const user = useUser();
    const { getToken } = useAuth();

    const fetchRecentMessages = useCallback(async () => {
        try {
            // setLoading(true);
            setError(null);
            
            const token = await getToken();
            console.log('Fetching recent messages...');
            
            // Try the correct endpoint for recent messages
            const { data } = await api.get('/api/user/recent-messages', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            console.log('Recent messages API response:', data);
            
            if (data.success && data.messages) {
                console.log('Recent messages received:', data.messages);
                
                // Handle the nested structure from the API
                // The API returns messages with lastMessage property
                const actualMessages = data.messages.map(item => item.lastMessage || item);
                console.log('Extracted actual messages:', actualMessages);
                
                // Safe processing of messages
                const validMessages = actualMessages.filter(message => {
                    if (!message || !message.from_user_id) {
                        console.warn('Invalid message structure:', message);
                        return false;
                    }
                    
                    // Only show messages from other users, not from current user
                    const senderId = typeof message.from_user_id === 'string' 
                        ? message.from_user_id 
                        : message.from_user_id._id;
                    
                    if (senderId === user.id) {
                        return false; // Skip messages from current user
                    }
                    
                    return true;
                });
                
                console.log('Valid messages after filtering:', validMessages);
                
                const groupedMessages = validMessages.reduce((acc, message) => {
                    try {
                        // Safe extraction of sender ID
                        const senderId = typeof message.from_user_id === 'string' 
                            ? message.from_user_id 
                            : message.from_user_id._id;
                            
                        if (!senderId) {
                            console.warn('No sender ID found for message:', message);
                            return acc;
                        }
                        
                        if (!acc[senderId] || new Date(message.createdAt) > new Date(acc[senderId].createdAt)) {
                            acc[senderId] = message;
                        }
                        return acc;
                    } catch (error) {
                        console.error('Error processing message:', error, message);
                        return acc;
                    }
                }, {});
                
                console.log('Grouped messages:', groupedMessages);
                
                const sortedMessages = Object.values(groupedMessages).sort((a, b) => {
                    try {
                        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
                        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
                        return dateB - dateA;
                    } catch (error) {
                        console.error('Error sorting messages:', error);
                        return 0;
                    }
                });
                
                console.log('Final sorted messages:', sortedMessages);
                setMessages(sortedMessages);
            } else {
                console.error('Failed to fetch recent messages:', data.message);
                setError(data.message || 'Failed to fetch messages');
            }
        } catch (error) {
            console.error('Error fetching recent messages:', error);
            setError(error.message || 'Failed to load messages');
        } finally {
            setLoading(false);
        }
    }, [getToken, user.id]);

    useEffect(() => {
        if (user) {
            console.log('User authenticated, fetching recent messages...');
            fetchRecentMessages();
            const interval = setInterval(fetchRecentMessages, 30000);
            return () => clearInterval(interval);
        }
    }, [user, fetchRecentMessages]);

    const getSenderInfo = (message) => {
        try {
            if (typeof message.from_user_id === 'string') {
                return { id: message.from_user_id, name: 'Unknown User', picture: null };
            }
            
            if (message.from_user_id && typeof message.from_user_id === 'object') {
                return {
                    id: message.from_user_id._id || message.from_user_id.id,
                    name: message.from_user_id.full_name || message.from_user_id.username || 'Unknown User',
                    picture: message.from_user_id.profile_picture
                };
            }
            
            return { id: null, name: 'Unknown User', picture: null };
        } catch (error) {
            console.error('Error getting sender info:', error);
            return { id: null, name: 'Unknown User', picture: null };
        }
    };

    const getMessagePreview = (message) => {
        if (message.media_type === 'image') {
            return '📷 Image';
        }
        return message.text ? (message.text.length > 30 ? `${message.text.substring(0, 30)}...` : message.text) : 'Media';
    };

    // Show loading state
    if (loading && messages.length === 0) {
        return (
            <div className='bg-white mx-w-xs mt-4 p-4 min-h-20 rounded-md shadow text-xs text-slate-800'>
                <h3 className='font-semibold text-slate-800 mb-4'>Recent Messages</h3>
                <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
                    <span className="ml-2 text-gray-500">Loading...</span>
                </div>
            </div>
        );
    }

    // Show error state
    if (error && messages.length === 0) {
        return (
            <div className='bg-white mx-w-xs mt-4 p-4 min-h-20 rounded-md shadow text-xs text-slate-800'>
                <h3 className='font-semibold text-slate-800 mb-4'>Recent Messages</h3>
                <div className="text-center py-4">
                    <p className="text-red-500 text-xs mb-2">{error}</p>
                    <button 
                        onClick={fetchRecentMessages}
                        className="px-3 py-1 bg-indigo-500 text-white text-xs rounded hover:bg-indigo-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className='bg-white mx-w-xs mt-4 p-4 min-h-20 rounded-md shadow text-xs text-slate-800'>
            <div className="flex items-center justify-between mb-4">
                <h3 className='font-semibold text-slate-800'>Recent Messages</h3>
                <button 
                    onClick={fetchRecentMessages}
                    disabled={loading}
                    className="text-indigo-500 hover:text-indigo-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                    title="Refresh messages"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>
            <div className="flex flex-col max-h-56 overflow-y-scroll no-scrollbar">
                {messages.length === 0 ? (
                    <div className="text-center py-4">
                        <p className="text-gray-500 text-xs">No recent messages</p>
                        <p className="text-gray-400 text-xs mt-1">Start conversations to see them here</p>
                        <Link 
                            to="/connections" 
                            className="inline-block mt-2 px-3 py-1 bg-indigo-500 text-white text-xs rounded hover:bg-indigo-600 transition-colors"
                        >
                            Find People
                        </Link>
                    </div>
                ) : (
                    messages.map((message, index) => {
                        try {
                            const senderInfo = getSenderInfo(message);
                            
                            if (!senderInfo.id) {
                                return null;
                            }
                            
                            return (
                                <Link 
                                    to={`/messages/${senderInfo.id}`} 
                                    key={`${senderInfo.id}-${index}`} 
                                    className='flex items-start gap-2 p-2 hover:bg-slate-100 rounded transition-colors'
                                >
                                    {senderInfo.picture ? (
                                        <img 
                                            src={senderInfo.picture} 
                                            className='w-8 h-8 rounded-full object-cover' 
                                            alt={senderInfo.name}
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <DefaultAvatar 
                                        size={32} 
                                        className={`w-8 h-8 ${senderInfo.picture ? 'hidden' : 'flex'}`}
                                    />

                                    <div className="w-full min-w-0">
                                        <div className="flex justify-between items-start">
                                            <p className='font-medium truncate'>{senderInfo.name}</p>
                                            <p className='text-slate-400 text-[10px] whitespace-nowrap ml-2'>
                                                {message.createdAt ? moment(message.createdAt).fromNow() : 'Now'}
                                            </p>
                                        </div>

                                        <div className="flex justify-between items-center mt-1">
                                            <p className='text-gray-500 truncate'>{getMessagePreview(message)}</p>

                                            {!message.seen && (
                                                <span className='bg-indigo-500 text-white w-4 h-4 flex items-center justify-center rounded-full text-[10px] flex-shrink-0'>
                                                    1
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            );
                        } catch (error) {
                            console.error('Error rendering message item:', error, message);
                            return null;
                        }
                    }).filter(Boolean)
                )}
            </div>
        </div>
    );
};

export default RecentMessages;
