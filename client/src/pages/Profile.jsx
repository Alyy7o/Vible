import React, { useEffect, useState } from "react";
import { dummyPostsData, dummyUserData } from "../assets/assets";
import { useUser } from "@clerk/clerk-react";
import { Link, useParams } from "react-router-dom";
import Loading from "../components/Loading";
import UserProfileInfo from "../components/UserProfileInfo";
import PostCard from "../components/PostCard";
import moment from "moment";

const Profile = () => {
  const { user: clerkUser } = useUser();
  const { profileId } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [showEdit, setShowEdit] = useState(false);

  const fetchUser = async () => {
    setUser(dummyUserData);
    setPosts(dummyPostsData);
  };

  useEffect(() => {
    fetchUser();
  }, [profileId]);

  return user ? (
    <div className="relative h-full p-6 overflow-y-scroll bg-gray-50">
      <div className="max-w-3xl mx-auto">
        {/* Profile Card */}
        <div className="shadow overflow-hidden rounded-2xl bg-white ">
          {/* Cover Photo */}
          <div className="h-40 md:h-56 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200">
            {user.cover_photo && (
              <img
                src={user.cover_photo}
                alt="cover"
                className="w-full h-full object-cover rounded-lg"
              />
            )}
          </div>

          {/* User Info */}
          <UserProfileInfo
            user={user}
            posts={posts}
            profileId={profileId}
            setShowEdit={setShowEdit}
          />
        </div>
        {/* Tabs */}
        <div className="mt-6">
          <div className="bg-white rounded-xl shadow p-1 flex max-w-md mx-auto ">
            {["posts", "media", "likes"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`cursor-pointer flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab
                    ? "bg-indigo-600 text-white"
                    : "text-gray-900 hover:text-gary-900"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Posts */}
            {
              activeTab === 'posts' && (
                <div className="mt-6 flex flex-col items-center gap-6">
                  {
                    posts.map((post) => <PostCard key={post._id} post={post}/>)
                  }
                </div>
              )
            }

          {/* Media */}
            {
              activeTab === 'media' && (
                <div className="mt-6 flex flex-wrap max-w-6xl gap-6">
                  {
                    posts.filter((post) => post.image_urls.length > 0).map((post) => (
                      <>
                        {
                          post.image_urls.map((image, index) => (
                            <Link target="_blank" to={image} key={index} className="relative group">
                              <img src={image} key={index} className="w-64 aspect-video object-cover" alt="" />
                              <p className="absolute bottom-0 right-0 text-xs p-1 px-3 backdrop-blur-xl text-white opacity-0 group-hover:opacity-100 transition duration-300">Posted { moment(post.createdAt).fromNow() }</p>
                            </Link>
                          ))
                        }
                      </>
                    ))
                  }
                </div>
              )
            }
        </div>
      </div>
      
      {/* Edit Profile modal */}
            {
              showEdit && <p>show edit</p>
            }
    </div>
  ) : (
    <Loading />
  );
};

export default Profile;
