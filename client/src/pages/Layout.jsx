import React, { useState, useCallback } from 'react'
import Sidebar from '../components/Sidebar'
import Loading from '../components/Loading'
import { Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useSelector } from 'react-redux'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useSelector((state) => state.user.value);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  // Show loading while user data is being fetched
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loading />
      </div>
    );
  }

  return (
    <div className='w-full h-screen flex'>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex-1 bg-slate-50 overflow-hidden">
        <Outlet />
      </div>
      
      {/* Mobile menu button */}
      {sidebarOpen ? (
        <X 
          className='absolute top-3 right-3 p-2 z-50 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden cursor-pointer hover:bg-gray-50 transition-colors' 
          onClick={closeSidebar} 
        />
      ) : (
        <Menu 
          className='absolute top-3 right-3 p-2 z-50 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden cursor-pointer hover:bg-gray-50 transition-colors' 
          onClick={toggleSidebar} 
        />
      )}
    </div>
  )
}

export default Layout
