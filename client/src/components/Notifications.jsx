import React, { useState } from 'react'
import { dummyUserData } from '../assets/assets'
import { Pencil } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../features/user/userSlice';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

const Notifications = ({t, message}) => {

    const navigate = useNavigate();

  return (
    <div className={`max-w-md  w-full bg-white shadow-lg rounded-lg flex border border-gray-300 hover:scale-105 transition-all`}>
        <div className="flex-1 p-4">
            <h2 className="flex items-center">
                <img src={message.from_user_id.profile_picture} className='size-10 rounded-full flex-shrink-0 mt-0.5' alt="" />
                <div className="ml-3 flex-1">
                    <p className="font-medium text-sm text-gray-700">{message.from_user_id.full_name}</p>
                    <p className="text-sm text-gray-500">{message.text.slice(0, 50)}</p>
                </div>
            </h2>
        </div>
        <div className="flex border-l border-gray-200">
            <button className='p-4 text-indigo-600 font-semibold' 
            onClick={
                () => {
                    navigate(`/messages/${message.from_user_id._id}`);
                    toast.dismiss(t.id)
                    }
                    }>
                    Reply
                    </button>
        </div>
    </div>    
  )
}

export default Notifications
