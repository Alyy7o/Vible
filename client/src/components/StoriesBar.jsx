import React, { useState, useEffect, useCallback } from 'react'
import { Plus } from 'lucide-react'
import moment from 'moment'
import StoryModal from './StoryModal';
import StoryView from './StoryView';
import { useAuth } from '@clerk/clerk-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

function StoriesBar() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewStory, setViewStory] = useState(null);
  const { getToken } = useAuth();
  
  const fetchStories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const { data } = await api.get("/api/story/get", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setStories(data.stories || []);
      } else {
        throw new Error(data.message || 'Failed to fetch stories');
      }
    } catch (error) {
      console.error('Stories fetch error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load stories';
      setError(errorMessage);
      
      // Don't show toast for stories errors as they're not critical
      console.warn('Stories loading failed:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const handleStoryClick = useCallback((story) => {
    setViewStory(story);
  }, []);

  const handleModalClose = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleStoryViewClose = useCallback(() => {
    setViewStory(null);
  }, []);

  return (
    <div className='w-screen sm:w-[calc(100vh-240px)] lg:max-w-2xl no-scrollbar overflow-x-auto px-4'>
      <div className="flex gap-4 pb-5">
        {/* Add story card */}
        <div 
          onClick={() => setShowModal(true)} 
          className="rounded-lg shadow-sm min-w-30 max-h-40 max-w-40 aspect-[3/4] cursor-pointer hover:shadow-lg transition-all duration-200 border-2 border-dashed border-indigo-300 bg-gradient-to-b from-indigo-50 to-white"
        >
          <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="size-10 bg-indigo-500 rounded-full flex items-center justify-center mb-3">
              <Plus className='w-5 h-5 text-white'/>
            </div>
            <p className='text-sm font-medium text-slate-700 text-center'>Create Story</p>
          </div>
        </div>
        
        {/* Stories Cards */}
        {loading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="rounded-lg relative shadow min-w-30 max-w-30 max-h-40 bg-gray-200 animate-pulse">
              <div className="absolute size-8 top-3 left-3 z-10 rounded-full bg-gray-300"></div>
              <div className="absolute top-18 left-3 bg-gray-300 h-4 w-20 rounded"></div>
              <div className="absolute bottom-1 right-2 bg-gray-300 h-3 w-12 rounded"></div>
            </div>
          ))
        ) : error ? (
          // Error state - don't show error for stories as they're not critical
          <div className="text-center py-4 text-gray-500 text-sm">
            Stories unavailable
          </div>
        ) : stories.length > 0 ? (
          // Actual stories
          stories.map((story, index) => (
            <div 
              key={story._id || index} 
              onClick={() => handleStoryClick(story)} 
              className="rounded-lg relative shadow min-w-30 max-w-30 max-h-40 cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-to-b from-indigo-300 to-purple-400 hover:from-indigo-500 hover:to-purple-600 active:scale-95"
            >
              <img 
                src={story.user?.profile_picture} 
                alt={`${story.user?.full_name || 'User'}'s profile`} 
                className='absolute size-8 top-3 left-3 z-10 rounded-full ring ring-gray-100 shadow object-cover'
                loading="lazy"
              />
              <p className='absolute top-18 left-3 text-white/60 text-sm truncate max-w-24'>
                {story.content}
              </p>
              <p className='text-white absolute bottom-1 right-2 text-xs z-10'>
                {moment(story.createdAt).fromNow()}
              </p>

              {story.media_type !== 'text' && story.media_url && (
                <div className="absolute inset-0 z-1 rounded-lg overflow-hidden">
                  {story.media_type === 'image' ? (
                    <img 
                      src={story.media_url} 
                      className='w-full h-full object-cover hover:scale-110 transition duration-500 opacity-50 hover:opacity-80'
                      loading="lazy"
                      alt="Story media"
                    />
                  ) : (
                    <video 
                      src={story.media_url} 
                      className='w-full h-full object-cover hover:scale-110 transition duration-500 opacity-50 hover:opacity-80'
                      muted
                      preload="metadata"
                    />
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          // No stories state
          <div className="text-center py-4 text-gray-500 text-sm">
            No stories yet
          </div>
        )}
      </div>

      {/* Add story Modal */}
      {showModal && (
        <StoryModal 
          setShowModal={handleModalClose} 
          fetchStories={fetchStories} 
        />
      )}

      {/* View Story */}
      {viewStory && (
        <StoryView 
          viewStory={viewStory} 
          setViewStory={handleStoryViewClose} 
        />
      )}
    </div>
  )
}

export default StoriesBar
