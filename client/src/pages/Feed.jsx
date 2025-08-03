import React, { useEffect, useState } from 'react'
import { dummyPostsData } from '../assets/assets';
import Loading from '../components/Loading';
import StoriesBar from '../components/StoriesBar';

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
          List of Posts
        </div>
      </div>

      {/* Right sidebar */}
      <div>
        <div className="">
          <h1>Sponsered</h1>
        </div>
        <h1>Recent Messages</h1>
      </div>
      
    </div>
  ) : <Loading/>
}

export default Feed
