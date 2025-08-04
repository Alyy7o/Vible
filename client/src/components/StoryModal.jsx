import { ArrowLeft, Sparkle, TextIcon, Upload } from 'lucide-react';
import React, { useState } from 'react'
import toast from 'react-hot-toast';

const StoryModal = ({setShowModal, fetchStories}) => {

    const bgColors = [
        '#60a5fa', // blue
        '#f87171', // red
        '#fbbf24', // yellow
        '#34d399', // green
        '#a78bfa', // purple
        '#f472b6', // pink
        '#facc15', // amber
        '#8b5cf6', // indigo
        '#f59e0b', // orange
        '#c084fc', // violet
        '#22c55e', // lime
        '#e879f9', // fuchsia
        ];

    const [mode, setMode] = useState('text');
    const [text, setText] = useState("");
    const [media, setMedia] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [background, setBackground] = useState(bgColors[0]);

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
                    mode === 'media' && previewUrl && (
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

            <div className="flex gap-2 mt-4">
                <button onClick={() => {setMode('text'); setMedia(null); setPreviewUrl(null); }} className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg cursor-pointer ${mode === 'text' ? 'bg-white text-black' : 'bg-zinc-800'} `}>
                    <TextIcon size={18} /> Text
                </button>

                <label className={`flex-1 flex items-center justify-center gap-2 p-2 rounded cursor-pointer ${mode === 'media' ? 'bg-white text-black' : 'bg-zinc-800'} `}>
                    <input type="file" accept="image/*,video/*" className='hidden' onChange={(e) => {handleMediaUpload(e); setMode('media')} } /> 
                    <Upload size={18} /> Photo/Video
                </label>
            </div>

            <button onClick={() => toast.promise(handleCreateStory(), {
                loading: 'Saving...',
                success: <p>Story Added</p>,
                error: e => <p>{e.message}</p>,
            })} className='flex items-center justify-center w-full gap-2 text-white py-3 mt-4 rounded bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition cursor-pointer'>
                <Sparkle size={18}/> Create Story
            </button>
        </div>
    </div>
  )
}

export default StoryModal
