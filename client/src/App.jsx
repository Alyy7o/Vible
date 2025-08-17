
import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Feed from './pages/Feed'
import Messages from './pages/Messages'
import ChatBox from './pages/ChatBox'
import Connections from './pages/Connections'
import Discover from './pages/Discover'
import Profile from './pages/Profile'
import CreatePost from './pages/CreatePost'
import Layout from './pages/Layout'
import { useUser, useAuth } from '@clerk/clerk-react'
import {Toaster} from 'react-hot-toast'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { fetchUser } from './features/user/userSlice'


function App() {
  const { user } = useUser();
  const {getToken} = useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      if(user){
        const token = await getToken();
        dispatch(fetchUser(token));
          // console.log('App Token received:', token); 
      // try {
      //   const token = await getToken();
      //   const response = await dispatch(fetchUser(token)).unwrap();
      //   console.log('User data received:', response);
      // } catch (error) {
      //   console.error('Error fetching user:', {
      //     message: error.message,
      //     stack: error.stack,
      //     response: error.response
      //   });
      // }
    }
    }
    fetchData();
  }, [user, getToken, dispatch ])

  return (
    <>
    <Toaster />
      <Routes>
        <Route path="/" element={ !user ? <Login /> : <Layout />}>
          <Route index element={<Feed />} />
          <Route path="messages" element={<Messages />} />
          <Route path="messages/:userId" element={<ChatBox />} />
          <Route path="connections" element={<Connections />} />
          <Route path="discover" element={<Discover />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/:profileId" element={<Profile />} />
          <Route path="create-post" element={<CreatePost />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
