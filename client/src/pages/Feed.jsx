import React, { useEffect, useState, useCallback } from 'react'
import { assets } from '../assets/assets';
import Loading from '../components/Loading';
import StoriesBar from '../components/StoriesBar';
import PostCard from '../components/PostCard';
import RecentMessages from '../components/RecentMessages';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

function Feed() {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const fetchFeed = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      const { data } = await api.get("/api/post/feed", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setFeed(data.posts);
      } else {
        throw new Error(data.message || 'Failed to fetch feed');
      }
    } catch (error) {
      console.error('Feed fetch error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load feed';
      setError(errorMessage);
      
      // Auto-retry on network errors (max 3 attempts)
      if (retryCount < 3 && !error.response) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchFeed();
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  }, [getToken, retryCount]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const handleRetry = () => {
    setRetryCount(0);
    fetchFeed();
  };

  // Show loading state
  if (loading && feed.length === 0) {
    return <Loading />;
  }

  // Show error state
  if (error && feed.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Failed to load feed</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='h-full overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8'>
      {/* Stories and Posts */}
      <div>
        <StoriesBar />
        
        <div className="p-4 space-y-6">
          {loading && feed.length > 0 && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <p className="text-gray-500 mt-2">Loading more posts...</p>
            </div>
          )}
          
          {feed.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
          
          {feed.length === 0 && !loading && !error && (
            <div className="text-center py-8">
              <p className="text-gray-500">No posts to show. Start following people to see their posts!</p>
            </div>
          )}
        </div>
      </div>

      {/* Right sidebar */}
      <div className='max-xl:hidden sticky top-2'>
        <div className="max-w-xs bg-white text-xs p-4 rounded-md inline-flex flex-col gap-2 shadow">
          <h3>Sponsored</h3>
          <img src={assets.sponsored_img} className='w-75 h-50 rounded-md' alt="Sponsored content" />
          <p className='text-slate-600'>Email Marketing</p>
          <p className='text-slate-400'>Supercharge your marketing with a powerful, easy to use platform built for results</p>
        </div>
        <RecentMessages />
      </div>
    </div>
  );
}

export default Feed
