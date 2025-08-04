import React, { useEffect, useState } from 'react'
import { assets, dummyPostsData } from '../assets/assets';
import Loading from '../components/Loading';
import StoriesBar from '../components/StoriesBar';
import PostCard from '../components/PostCard';

function Feed() {

  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = async () => {
    setFeed(dummyPostsData);
    setLoading(false);
  }

  useEffect(() => {
    fetchFeed();
  }, []);

  return !loading ? (
    <div className='h-full overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8'>

      {/* Stories and Posts */}

      <div>

        <StoriesBar />
        
        <div className="p-4 space-y-6">
          {feed.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </div>

      {/* Right sidebar */}
      <div className='max-xl:hidden sticky top-2'>
        <div className="max-w-xs bg-white text-xs p-4 rounded-md inline-flex flex-col gap-2 shadow">
          <h3>Sponsered</h3>

          <img src={assets.sponsored_img} className='w-75 h-50 rounded-md' alt="" />
          <p className='text-slate-600'>Email Markiting</p>
          <p className='text-slate-400'>Supercharge your marketing with a powerful, easy to use platform built for results</p>

        </div>
        <h1>Recent Messages</h1>
      </div>
      
    </div>
  ) : <Loading/>
}

export default Feed
