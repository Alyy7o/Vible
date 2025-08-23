
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
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
import { useDispatch } from 'react-redux'
import { fetchUser } from './features/user/userSlice'
import { fetchConnections } from './features/connections/connectionsSlice'
import { addMessage } from './features/messages/messagesSlice'
import Loading from './components/Loading'
import NotificationManager from './components/NotificationManager'

function App() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const pathnameRef = useRef(pathname);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState(null);
  const [initTimeout, setInitTimeout] = useState(null);
  const eventSourceRef = useRef(null);

  // Memoized data fetching function
  const fetchInitialData = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsInitializing(true);
      setError(null);
      
      // Set a timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        console.warn('Initialization timeout - forcing completion');
        setIsInitializing(false);
      }, 10000); // 10 second timeout
      
      setInitTimeout(timeout);
      
      const token = await getToken();
      if (!token) throw new Error('No authentication token');
      
      console.log('Fetching initial data...');
      
      // Fetch data in parallel for better performance
      const results = await Promise.allSettled([
        dispatch(fetchUser(token)),
        dispatch(fetchConnections(token))
      ]);
      
      // Check results
      const userResult = results[0];
      const connectionsResult = results[1];
      
      if (userResult.status === 'rejected') {
        console.error('User fetch failed:', userResult.reason);
      }
      
      if (connectionsResult.status === 'rejected') {
        console.error('Connections fetch failed:', connectionsResult.reason);
      }
      
      console.log('Initial data fetch completed');
      
    } catch (err) {
      console.error('Failed to fetch initial data:', err);
      setError(err.message);
    } finally {
      // Clear timeout and set loading to false
      if (initTimeout) {
        clearTimeout(initTimeout);
        setInitTimeout(null);
      }
      setIsInitializing(false);
    }
  }, [user, getToken, dispatch]);

  // Initialize data when user is loaded
  useEffect(() => {
    if (isLoaded && user) {
      console.log('User loaded, starting initialization...');
      fetchInitialData();
    } else if (isLoaded && !user) {
      console.log('No user, skipping initialization');
      setIsInitializing(false);
    }
  }, [isLoaded, user, fetchInitialData]);

  // Update pathname ref
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  // Setup EventSource for real-time messages
  useEffect(() => {
    if (!user || isInitializing) return;

    const setupEventSource = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        console.log('Setting up EventSource for user:', user.id);
        eventSourceRef.current = new EventSource(
          `${import.meta.env.VITE_BASEURL}/api/message/${user.id}`
        );

        eventSourceRef.current.onmessage = (event) => {
          try {
            console.log('SSE message received:', event.data);
            const message = JSON.parse(event.data);
            
            // Always add the message to Redux store for real-time updates
            dispatch(addMessage(message));
            console.log('Message added to Redux store:', message);
            
            // Trigger notification for new messages (not from current user)
            if (message.from_user_id?._id !== user.id) {
              // Dispatch custom event for notification
              const notificationEvent = new CustomEvent('newMessage', {
                detail: message
              });
              window.dispatchEvent(notificationEvent);
            }
            
          } catch (err) {
            console.error('Failed to parse SSE message:', err);
          }
        };

        eventSourceRef.current.onerror = (err) => {
          console.error('EventSource error:', err);
        };

        eventSourceRef.current.onopen = () => {
          console.log('EventSource connection opened');
        };
      } catch (err) {
        console.error('Failed to setup EventSource:', err);
      }
    };

    setupEventSource();

    // Cleanup EventSource on unmount or user change
    return () => {
      if (eventSourceRef.current) {
        console.log('Closing EventSource connection');
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [user, isInitializing, getToken, dispatch]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (initTimeout) {
        clearTimeout(initTimeout);
      }
    };
  }, [initTimeout]);

  // Show loading while Clerk is initializing or we're fetching data
  if (!isLoaded || isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loading />
          <p className="text-gray-600 mt-4">
            {!isLoaded ? 'Initializing...' : 'Loading your data...'}
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              setIsInitializing(true);
              fetchInitialData();
            }} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster />
      {/* Message Notifications */}
      {user && <NotificationManager />}
      <Routes>
        <Route path="/" element={!user ? <Login /> : <Layout />}>
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
