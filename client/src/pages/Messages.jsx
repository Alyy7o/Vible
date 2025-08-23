import React, { useEffect, useState } from 'react'
import { Eye, MessageSquare, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useAuth } from '@clerk/clerk-react'
import api from '../api/axios'
import moment from 'moment'

const Messages = () => {
  const navigate = useNavigate();
  const { connections } = useSelector((state) => state.connections);
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchRecentMessages = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        
        const { data } = await api.get('/api/message/recent', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (data.success) {
          setRecentMessages(data.messages || []);
        }
      } catch (error) {
        console.error('Failed to fetch recent messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentMessages();
  }, [getToken]);

  const getLastMessage = (userId) => {
    const message = recentMessages.find(msg => 
      msg._id === userId || 
      msg.lastMessage?.from_user_id?._id === userId || 
      msg.lastMessage?.to_user_id?._id === userId
    );
    return message?.lastMessage;
  };

  const getOtherUser = (connection) => {
    return connection;
  };

  if (loading) {
    return (
      <div className="min-h-screen relative bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen relative bg-slate-50'>
      <div className="max-w-6xl mx-auto p-6">
        {/* Title */}
        <div className="mb-8">
          <h1 className='text-3xl font-bold text-slate-900 mb-2'>Messages</h1>
          <p className='text-slate-600'>Talk to your friends and family</p>
        </div>

        {/* Connected users */}
        <div className="flex flex-col gap-3">
          {connections.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No connections yet</h3>
              <p className="text-gray-500">Start following people to begin messaging them</p>
            </div>
          ) : (
            connections.map((user) => {
              const lastMessage = getLastMessage(user._id);
              const otherUser = getOtherUser(user);
              
              return (
                <div 
                  className="max-w-xl flex flex-wrap gap-5 p-6 bg-white shadow rounded-md hover:shadow-lg transition-shadow cursor-pointer" 
                  key={user._id}
                  onClick={() => navigate(`/messages/${user._id}`)}
                >
                  <img 
                    src={otherUser.profile_picture} 
                    className='rounded-full size-12 mx-auto object-cover' 
                    alt={`${otherUser.full_name}'s profile`}
                  />

                  <div className='flex-1 min-w-0'>
                    <p className='font-medium text-slate-700 truncate'>{otherUser.full_name}</p>
                    <p className='text-slate-500 text-sm'>@{otherUser.username}</p>
                    {otherUser.bio && (
                      <p className='text-sm text-gray-600 truncate mt-1'>{otherUser.bio}</p>
                    )}
                    
                    {/* Last message preview */}
                    {lastMessage && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span className="truncate">
                          {lastMessage.text ? 
                            lastMessage.text.substring(0, 50) + (lastMessage.text.length > 50 ? '...' : '') :
                            lastMessage.media_type === 'image' ? '📷 Image' : 'Media'
                          }
                        </span>
                        <span className="text-xs">
                          {moment(lastMessage.createdAt).fromNow()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 mt-4">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/messages/${user._id}`);
                      }} 
                      className='flex items-center justify-center size-10 text-sm rounded bg-indigo-100 hover:bg-indigo-200 text-indigo-800 active:scale-95 transition cursor-pointer gap-1'
                    >
                      <MessageSquare className='w-4 h-4' />
                    </button>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/profile/${user._id}`);
                      }} 
                      className='flex items-center justify-center size-10 text-sm rounded bg-slate-100 hover:bg-slate-200 text-slate-800 active:scale-95 transition cursor-pointer gap-1'
                    >
                      <Eye className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default Messages
