import { BadgeCheck, Heart, MessageCircle, Share2 } from 'lucide-react'
import moment from 'moment'
import React, { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '@clerk/clerk-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const PostCard = React.memo(({ post }) => {
    const [likes, setLikes] = useState(post.likes_count);
    const [isLiking, setIsLiking] = useState(false);
    const currentUser = useSelector((state) => state.user.value);
    const { getToken } = useAuth();
    const navigate = useNavigate();

    // Memoize expensive operations
    const postWithHashtags = useMemo(() => {
        return post.content.replace(/#(\w+)/g, '<span class="text-indigo-600">#$1</span>');
    }, [post.content]);

    const formattedDate = useMemo(() => {
        return moment(post.createdAt).fromNow();
    }, [post.createdAt]);

    const isLiked = useMemo(() => {
        return likes.includes(currentUser?._id);
    }, [likes, currentUser?._id]);

    const handleLike = useCallback(async () => {
        if (!currentUser || isLiking) return;
        
        try {
            setIsLiking(true);
            const token = await getToken();
            
            if (!token) {
                toast.error('Authentication required');
                return;
            }

            const { data } = await api.post(
                "/api/post/like",
                { postId: post._id },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (data.success) {
                toast.success(data.message);
                setLikes(prev => {
                    if (prev.includes(currentUser._id)) {
                        return prev.filter(id => id !== currentUser._id);
                    } else {
                        return [...prev, currentUser._id];
                    }
                });
            } else {
                toast.error(data.message || 'Failed to like post');
            }
        } catch (error) {
            console.error('Like error:', error);
            toast.error(error.response?.data?.message || error.message || 'Failed to like post');
        } finally {
            setIsLiking(false);
        }
    }, [currentUser, isLiking, getToken, post._id]);

    const handleUserClick = useCallback(() => {
        navigate(`/profile/${post.user._id}`);
    }, [navigate, post.user._id]);

    if (!currentUser) {
        return null; // Don't render if user is not loaded
    }

    return (
        <div className='bg-white rounded-lg shadow p-4 space-y-4 w-full max-w-2xl'>
            {/* User Info */}
            <div onClick={handleUserClick} className="inline-flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                <img 
                    src={post.user.profile_picture} 
                    className='w-10 h-10 rounded-full shadow object-cover' 
                    alt={`${post.user.full_name}'s profile`}
                    loading="lazy"
                />
                <div className="">
                    <div className="flex items-center space-x-1">
                        <span className="font-medium">{post.user.full_name}</span>
                        <BadgeCheck className='h-4 w-4 text-blue-500' />
                    </div>
                    <div className='text-gray-500 text-sm'>@{post.user.username} · {formattedDate}</div>
                </div>
            </div>

            {/* Content */}
            {post.content && (
                <div 
                    className='text-gray-800 text-sm whitespace-pre-line' 
                    dangerouslySetInnerHTML={{ __html: postWithHashtags }} 
                />
            )}

            {/* Images */}
            {post.image_urls && post.image_urls.length > 0 && (
                <div className={`grid gap-2 ${post.image_urls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {post.image_urls.map((image, index) => (
                        <img 
                            key={index} 
                            src={image} 
                            alt={`Post image ${index + 1}`} 
                            className={`w-full h-48 object-cover rounded-lg ${
                                post.image_urls.length === 1 ? 'h-auto max-h-96' : ''
                            }`}
                            loading="lazy"
                        />
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 text-gray-600 text-sm pt-2 border-t border-gray-300">
                <div className="flex items-center gap-1">
                    <Heart 
                        className={`w-5 h-5 cursor-pointer transition-colors ${
                            isLiked ? 'text-red-500 fill-red-500' : 'hover:text-red-400'
                        }`} 
                        onClick={handleLike}
                        style={{ opacity: isLiking ? 0.6 : 1 }}
                    />
                    <span>{likes.length}</span>
                </div>
                
                <div className="flex items-center gap-1">
                    <MessageCircle className='w-5 h-5 cursor-pointer hover:text-blue-400 transition-colors' />
                    <span>{post.comments_count || 0}</span>
                </div>

                <div className="flex items-center gap-1">
                    <Share2 className='w-5 h-5 cursor-pointer hover:text-green-400 transition-colors' />
                    <span>{post.shares_count || 0}</span>
                </div>
            </div>
        </div>
    );
});

PostCard.displayName = 'PostCard';

export default PostCard
