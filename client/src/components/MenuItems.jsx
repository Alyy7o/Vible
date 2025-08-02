import React from 'react'
import { menuItemsData } from '../assets/assets'
import { NavLink } from 'react-router-dom'

function MenuItems({setSidebarOpen}) {
  return (
    <div className='px-6 font-medium text-gray-600 space-y-1'>
      {
        menuItemsData.map(({to, label, Icon}) => (
            <NavLink key={to} to={to} end={to === '/'} className={({isActive}) => `flex items-center gap-3 px-3.5 py-2 rounded-xl ${isActive ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50'} `}>
                <Icon className='w-5 h-5' />
                {label}
            </NavLink>
        ))
      }
    </div>
  )
}

export default MenuItems
