import { ArrowLeft } from 'lucide-react';
import React, { useState } from 'react'

const StoryModal = ({setShowModal, fetchStories}) => {

    const bgColors = ["#f0f4ff", "#e0e7ff", "#c7d2fe", "#a5b4fc", "#818cf8", "#6366f1", "#4f46e5", "#4338ca", "#3730a3", "#312e81"];

    const [mode, setMode] = useState('text');
    const [text, setText] = useState("");
    const [media, setMedia] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [background, setBackground] = useState(bgColors[5]);

    const handleMediaUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setMedia(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    }

    const handleCreateStory = async () => {

    }
  return (
    <div className='fixed inset-0 bg-black/80 min-h-screen backdrop-blur text-white p-4 flex items-center justify-center z-110'>

        <div className="w-full max-w-md">
            <div className="text-center mb-4 flex items-center justify-between">
                <button onClick={() => setShowModal(false)} className='text-white p-2 cursor-pointer'>
                    <ArrowLeft />
                </button>
                <h2 className='text-lg font-semibold'>Create Story</h2>
                <span className='w-10'></span>
            </div>

            <div className="rounded-lg h-96 flex items-center justify-center relative" style={{ backgroundColor: background }}>
                {
                    mode === 'text' && (
                        <textarea className="bg-transparent text-white w-full h-full p-6 text-lg resize-none focus:outline-none" placeholder="What's on your mind?" onChange={(e) => setText(e.target.value)} value={text} />
                    )
                }
                {
                    mode === 'image' && previewUrl && (
                        media?.type.startsWith('image') ? (
                            <img src={previewUrl} className='object-contain max-h-full'/>
                        ) : (
                            <video src={previewUrl} className='object-contain max-h-full' />
                        )
                    )
                }
            </div>

            <div className="flex mt-4 gap-2">
                {bgColors.map((color) => (
                    <button className='w-6 h-6 rounded-full ring cursor-pointer' style={{backgroundColor: color}} key={color} onClick={() => setBackground(color)} />
                ))}
            </div>
        </div>
    </div>
  )
}

export default StoryModal
