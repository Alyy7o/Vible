import fs from 'fs';
import imageKit from '../configs/imageKit.js';
import Message from '../models/Message.js';

// create an empty object to stores server side event connections
const connections = {};

export const sseController = (req, res) => {
    const {userId} = req.params;
    console.log("New client connected: ", userId)

    // set SSE headers
    res.setHeader('Content-Type', 'text/event-stream'),
    res.setHeader('Cache-Control', 'no-cache'),
    res.setHeader('Connection', 'keep-alive'),
    res.setHeader('Access-control-allow-origin', '*'),

    // Add client response object to connections object
    connections[userId] = res

    // send an initail event to client
    res.write('log: Connected to SS stream\n\n');

    // Handle client disconnection
    req.on('close', () => {
        // remove client responce from connection object
        delete connections[userId];
        console.log('Client disconnected');
    })
}

// send message
export const sendMessage = async (req, res) => {
    try {
        const {userId} = req.auth();
        const {to_user_id, text} = req.body;
        const image = req.file;

        let media_url = '';
        let message_type = image ? 'image' : 'text';

        if(message_type === 'image'){
            try {
                const fileBuffer = fs.readFileSync(image.path);
                const response = await imageKit.upload({
                    file: fileBuffer,
                    fileName: image.originalname
                });

                media_url = imageKit.url({
                    path: response.filePath,
                    transformation: [
                        {quality: 'auto'},
                        {format: 'webp'},
                        {width: '1280'},
                    ]
                });

                // Clean up temporary file
                fs.unlinkSync(image.path);
            } catch (uploadError) {
                console.error('Image upload error:', uploadError);
                return res.json({success: false, message: 'Failed to upload image'});
            }
        }

        const message = await Message.create({
            from_user_id: userId,
            to_user_id,
            text: text || '',
            media_type: message_type,
            media_url
        });

        // Populate user data for the response
        const messageWithUserData = await Message.findById(message._id).populate('from_user_id');

        res.json({success: true, message: messageWithUserData});

        // send message to to_user_id using SSE
        if(connections[to_user_id]){
            try {
                const sseData = `data: ${JSON.stringify(messageWithUserData)}\n\n`;
                connections[to_user_id].write(sseData);
                console.log('SSE message sent to:', to_user_id);
            } catch (sseError) {
                console.error('SSE send error:', sseError);
            }
        }
        
    } catch (error) {
        console.error('Send message error:', error);
        res.json({success: false, message: error.message});
    }
}

// Get chat messages
export const getChatMessages = async (req, res) => {
    try {
        const {userId} = req.auth();
        const {to_user_id} = req.body;
        
        if (!to_user_id) {
            return res.json({success: false, message: 'to_user_id is required'});
        }

        const messages = await Message.find({
            $or: [
                {from_user_id: userId, to_user_id},
                {from_user_id: to_user_id, to_user_id: userId},
            ]
        }).populate('from_user_id').sort({createdAt: -1});

        // mark messages as seen
        await Message.updateMany(
            {from_user_id: to_user_id, to_user_id: userId, seen: false}, 
            {seen: true}
        );

        console.log('Fetched messages:', messages.length);
        res.json({success: true, messages});
        
    } catch (error) {
        console.error('Get chat messages error:', error);
        res.json({success: false, message: error.message});
    }
}

// recent chat messages
export const getUserRecentMessages = async (req, res) => {
    try {
        const {userId} = req.auth();
        
        // Get recent messages for the user
        const messages = await Message.aggregate([
            {
                $match: {
                    $or: [
                        {from_user_id: userId},
                        {to_user_id: userId}
                    ]
                }
            },
            {
                $sort: {createdAt: -1}
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ['$from_user_id', userId] },
                            '$to_user_id',
                            '$from_user_id'
                        ]
                    },
                    lastMessage: { $first: '$$ROOT' }
                }
            },
            {
                $sort: { 'lastMessage.createdAt': -1 }
            }
        ]);

        // Populate user data for each message
        const populatedMessages = await Message.populate(messages, [
            { path: 'lastMessage.from_user_id', model: 'User' },
            { path: 'lastMessage.to_user_id', model: 'User' }
        ]);
        
        res.json({success: true, messages: populatedMessages});
        
    } catch (error) {
        console.error('Get recent messages error:', error);
        res.json({success: false, message: error.message});
    }
}