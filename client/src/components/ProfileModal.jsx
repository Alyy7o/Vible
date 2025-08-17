import React, { useState } from 'react'
import { dummyUserData } from '../assets/assets'
import { Pencil } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../features/user/userSlice';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';

const ProfileModal = ({setShowEdit}) => {

    const user = useSelector((state) => state.user.value);
    const [editForm, setEditForm] = useState({
        username: user.username,
        location: user.location,
        bio: user.bio,
        profile_picture: null,
        cover_photo: null,
        full_name: user.full_name,
    });
    const dispatch = useDispatch();
    const { getToken } = useAuth();

    const handleSaveProfile = async (e) => {
        e.preventDefault();

        try {
          const userData = new FormData();
          const {full_name, username, bio, location, cover_photo, profile_picture} = editForm;

          userData.append('full_name', full_name)
          userData.append('username', username)
          userData.append('bio', bio)
          userData.append('location', location)
          cover_photo && userData.append('cover', cover_photo)
          profile_picture && userData.append('profile', profile_picture)

          const token = await getToken();
          dispatch(updateUser({userData, token}))

          setShowEdit(false);

        } catch (error) {
          toast(error.message)
        }
    }
  return (
    <div className='fixed top-0 bottom-0 left-0 right-0 z-110 h-screen overflow-y-scroll bg-black/50'>
      <div className="max-w-2xl sm:py-6 mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className='text-2xl font-bold text-gray-900 mb-6'>Edit Profile</h1>

          <form className='space-y-4' onSubmit={(e) => {
            handleSaveProfile(e), {loading: "Saving..."}
          }}>
            {/* Profile Pic */}
            <div className="flex flex-col items-start gap-3">
              <label htmlFor="profile_picture" className='block text-sm font-medium text-gray-700 mb-1'>
                Profile Picture
                <input hidden type="file" accept='image/*' id='profile_picture' className='w-full p-3 border border-gray-300 rounded-lg' onChange={(e) => setEditForm({...editForm, profile_picture: e.target.files[0]})}/>

                <div className="group/profile relative">
                  <img src={editForm.profile_picture ? URL.createObjectURL(editForm.profile_picture) : user.profile_picture} className='w-24 h-24 rounded-full object-cover mt-2' alt="" />

                  <div className="absolute hidden group-hover/profile:flex top-0 bottom-0 left-0 right-0 rounded-full bg-black/20 items-center justify-center">
                    <Pencil className='h-5 w-5 text-white' />
                  </div>
                </div>
              </label>
            </div>

            {/* Cover Photo */}
            <div className="flex flex-col items-start gap-3">
              <label htmlFor="cover_photo" className='block text-sm font-medium text-gray-700 mb-1'>
                Cover Photo
                <input hidden type="file" accept='image/*' id='cover_photo' className='w-full p-3 border border-gray-300 rounded-lg' onChange={(e) => setEditForm({...editForm, cover_photo: e.target.files[0]})}/>

                <div className="group/profile relative">
                  <img src={editForm.cover_photo ? URL.createObjectURL(editForm.cover_photo) : user.cover_picture} className='w-80 h-40 rounded-lg bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 object-cover mt-2' alt="" />

                  <div className="absolute hidden group-hover/profile:flex top-0 bottom-0 left-0 right-0 rounded-full bg-black/20 items-center justify-center">
                    <Pencil className='h-5 w-5 text-white' />
                  </div>
                </div>
              </label>
            </div>

            {/* Name and other fields */}
            <div className="">
              <label htmlFor="" className='block text-sm font-medium text-gray-700 mb-1'>
                Name
              </label>
              <input type="text" className='w-full p-3 border border-gray-200 rounded-lg' placeholder='Please enter your full name' onChange={(e) => setEditForm({...editForm, full_name: e.target.value})} value={editForm.full_name} />
            </div>

            <div className="">
              <label htmlFor="" className='block text-sm font-medium text-gray-700 mb-1'>
                Username
              </label>
              <input type="text" className='w-full p-3 border border-gray-200 rounded-lg' placeholder='Please enter a username' onChange={(e) => setEditForm({...editForm, username: e.target.value})} value={editForm.username} />
            </div>
            
            <div className="">
              <label htmlFor="" className='block text-sm font-medium text-gray-700 mb-1'>
                Bio
              </label>
              <textarea rows={3} className='w-full p-3 border border-gray-200 rounded-lg' placeholder='Please enter a short bio' onChange={(e) => setEditForm({...editForm, bio: e.target.value})} value={editForm.bio} />
            </div>
            
            <div className="">
              <label htmlFor="" className='block text-sm font-medium text-gray-700 mb-1'>
                Location
              </label>
              <input type="text" className='w-full p-3 border border-gray-200 rounded-lg' placeholder='Please enter yout location' onChange={(e) => setEditForm({...editForm, location: e.target.value})} value={editForm.location} />
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-6">
              <button type='button' onClick={() => setShowEdit(false)} className='px-4 py-2 border border-gray-300 hover:bg-gray-50 transition cursor-pointer text-gray-700 rounded-lg'>Cancel</button>

              <button type='submit' className='px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition cursor-pointer text-white rounded-lg'>Save Changes</button>
            </div>
          </form>
        </div>
      </div>
      
    </div>
  )
}

export default ProfileModal
