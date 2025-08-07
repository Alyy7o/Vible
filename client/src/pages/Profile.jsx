import React, { useEffect, useState } from 'react'
import { dummyPostsData, dummyUserData } from '../assets/assets'
import { useUser } from '@clerk/clerk-react'
import { useParams } from 'react-router-dom';
import Loading from '../components/Loading';

const Profile = () => {

  const {profileId} = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [showEdit, setShowEdit] = useState('false');

  const fetchUser = async () => {
    setUser(dummyUserData);
    setPosts(dummyPostsData);
  }

  useEffect(() => {
    fetchUser();
  }, [])

  return user ? (
    <div className="relative h-full p-6 overflow-y-scroll bg-gray-50">
      <div className="max-w-3xl mx-auto">
        {/* Profile Card */}
        <div className="shadow overflow-hidden rounded-2xl bg-white ">
          {/* Cover Photo */}
          <div className="h-40 md:h-56 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200">
            {
              user.cover_photo &&
              <img 
              src={user.cover_photo} 
              alt="cover" 
              className="w-full h-full object-cover rounded-lg"
              />
            }
          </div>
          
          {/* Profile Image */}
          <div className="absolute -bottom-20 left-4 md:left-10">
            <img 
              src={clerkUser?.imageUrl || user.profile_picture} 
              alt="profile" 
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white"
            />
          </div>
        </div>

        {/* Profile Info */}
        <div className="mt-24 md:mt-28 ml-4 md:ml-10">
          <h1 className="text-2xl md:text-3xl font-bold">
            {clerkUser?.fullName || user.full_name}
          </h1>
          <p className="text-gray-600">@{clerkUser?.username || user.username}</p>
          <p className="mt-4 text-gray-700 max-w-2xl">
            {user.bio}
          </p>

          <div className="flex gap-6 mt-6">
            <div>
              <span className="font-semibold">{user.followers}</span>
              <span className="text-gray-600 ml-2">Followers</span>
            </div>
            <div>
              <span className="font-semibold">{user.following}</span>
              <span className="text-gray-600 ml-2">Following</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <Loading />
  )
}

export default Profile
