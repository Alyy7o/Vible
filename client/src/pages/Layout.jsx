import React, {useState} from 'react'
import Sidebar from '../components/Sidebar'
import Loading from '../components/Loading'
import { Outlet } from 'react-router-dom'
import {Menu, X} from 'lucide-react'
import {dummyUserData} from '../assets/assets'
const Layout = () => {

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = dummyUserData;

  return user ? (
    <div className='w-full h-screen flex'>

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <div className="flex-1 bg-slate-50">
        <Outlet />
      </div>
      {
        sidebarOpen ?
        <X className='absolute top-3 right-3 p-2 z-100 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden' onClick={() => setSidebarOpen(false)} />
        : <Menu className='absolute top-3 right-3 p-2 z-100 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden' onClick={() => setSidebarOpen(true)} /> 
      }
    </div>
  ) : (
    <Loading />
  )
}

export default Layout
