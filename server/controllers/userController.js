import { format } from "path";
import imageKit from "../configs/imageKit.js";
import User from "../models/User.js";
import fs from 'fs';
import Connection from "../models/Connection.js";
import { connections } from "mongoose";
import Post from "../models/Post.js";
import { inngest } from "../inngest/index.js";


// Get user data from db
export const getUserData = async (req, res) => {
    try {
        const {userId} =  req.auth();
        const user = await User.findById(userId);
        
        if(!user){
            return res.json({success: false, message: "User not found"});
        }
        res.json({success: true, user});
    }
    catch (error) {
        res.json({success: false, message: error.message})
    }
}

// Update user data
export const updateUserData = async (req, res) => {
    try {
        const {userId} = req.auth();
        let {username, full_name, bio, location} = req.body;

        const tempUser = await User.findById(userId);
        !username && (username = tempUser.username);

        if(tempUser.username !== username){
            const user = await User.findOne({username});

            // If new username already present we will not update it
            if(user){
                username = tempUser.username;
            }
        }

        const updateData = {
            username,
            bio,
            location,
            full_name
        }

        const profile = req.files.profile && req.files.profile[0];
        const cover = req.files.cover && req.files.cover[0];

        // handle profile img using imagekit
        if(profile){
            const buffer = fs.readFileSync(profile.path);
            const response = await imageKit.upload({
                file: buffer,
                fileName: profile.originalname,
            })

            const url = imageKit.url({
                path: response.filePath,
                transformation: [
                    {quality: 'auto'},
                    {format: 'webp'},
                    {width: '512'},
                ]
            })
            
            updateData.profile_picture = url;
        }
        
        // handle cover img using imagekit
        if(cover){
            const buffer = fs.readFileSync(cover.path);
            const response = await imageKit.upload({
                file: buffer,
                fileName: profile.originalname,
            })

            const url = imageKit.url({
                path: response.filePath,
                transformation: [
                    {quality: 'auto'},
                    {format: 'webp'},
                    {width: '1280'},
                ]
            })

            updateData.cover_picture = url;
        }

        const user = await User.findByIdAndUpdate(userId, updateData, {new: true});

        res.json({success: true, user, message: "Profile updated successfully!"})
    }
    catch (error) {
        res.json({success: false, message: error.message})
    }
}

// Search user based on username, full_name, email and location
export const discoverUsers = async (req, res) => {
    try {
        const {userId} = req.auth();
        const {input} = req.body;

        const allUsers = await User.find(
            {
                $or: [
                    {username: new RegExp(input, 'i')},
                    {full_name: new RegExp(input, 'i')},
                    {location: new RegExp(input, 'i')},
                    {email: new RegExp(input, 'i')},
                ]
            }
        )

        const fillteredUsers = allUsers.filter(user => user._id !== userId);

        res.json({success: true, users: fillteredUsers});
    }
    catch (error) {
        res.json({success: false, message: error.message})
    }
}

// Follow user
export const followUser = async (req, res) => {
    try {
        const {userId} = req.auth();
        const {id} = req.body;

        const user = await User.findById(userId);

        if(user.following.includes(id)){
            return res.json({success: false, message: "You are already following this user"});
        }

        // increase following of this user
        user.following.push(id);
        await user.save();
        
        // increase follower of other user
        const toUser = await User.findById(id);
        toUser.followers.push(userId);
        await toUser.save();

        res.json({success: true, message: "Now you are following this user"});

    }
    catch (error) {
        res.json({success: false, message: error.message})
    }
}

// Unfollow user
export const unFollowUser = async (req, res) => {
    try {
        const {userId} = req.auth();
        const {id} = req.body;

        // find and decereace following of this user
        const user = await User.findById(userId);
        user.following = user.following.filter(user => user !== id);
        await user.save();
        
        // find and decereace follower of other user
        const toUser = await User.findById(id);
        toUser.followers = toUser.followers.filter(user => user !== userId);
        await toUser.save();

        res.json({success: true, message: "You are no longer following this user"});

    }
    catch (error) {
        res.json({success: false, message: error.message})
    }
}

// Send Conection request
export const sendConectionRequest = async (req, res) => {
    try {
        const {userId} = req.auth();
        const {id} = req.body;

        // user can send only 20 req in 24 hours
        const last24hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const connectionRequests = await Connection.find(
            {
                from_user_id: userId,
                created_at: {$gt: last24hours}
            },
        )

        if(connectionRequests.length >= 20){
            return res.json({success: false, message: "You have sent 20+ connection requests in last 24 hours"});
        }
        
        // Check if users are already connected
        const connection = await Connection.findOne({
            $or: [
                {from_user_id: userId, to_user_id: id},
                {from_user_id: id, to_user_id: userId}
            ]
        })
        
        if(!connection){
            const newConnection = await Connection.create({
                from_user_id: userId,
                to_user_id: id
            });

            // send connection request email
            await inngest.send({
                name: "app/connection-request",
                data: {connectionId: newConnection._id}
            })

            return res.json({success: true, message: "Connection request sent successfully"});
        }
        else if(connection && connection.status === 'accepted'){
            return res.json({success: false, message: "You are already connected"});
        }
        
        return res.json({success: false, message: "Connection request pending"});
    }
    catch (error) {
        res.json({success: false, message: error.message})
    }
}

// Get user Conection request
export const getUserConections = async (req, res) => {
    try {
        const {userId} = req.auth();
        const user = await User.findById(userId).populate('connections followers following');

        const connections = user.connections;
        const followers = user.followers;
        const following = user.following;

        const pendingConnections = (await Connection.find(
            {to_user_id: userId, status: 'pending'}
        ).populate('from_user_id')).map(connection => connection.from_user_id);
        
        res.json({success: true, connections, followers, following, pendingConnections});
    }
    catch (error) {
        res.json({success: false, message: error.message})
    }
}

// Accept Conection request
export const acceptConectionRequest = async (req, res) => {
    try {
        const {userId} = req.auth();
        const {id} = req.body;

        console.log("user id " + id);

        const connection = await User.find({from_user_id: id, to_user_id: userId});

        if(!connection){
            return res.json({success: false, message: "Connection not found"});
        }
        
        const user = await User.findById(userId);
        user.connections.push(id);
        await user.save();

        const toUser = await User.findById(id);
        toUser.connections.push(userId);
        await toUser.save();
        
        connection.status = 'accepted';
        await connection.save();
        
        res.json({success: true, message: "Connection accepted successfully"});
    }
    catch (error) {
        res.json({success: false, message: error.message})
    }
}

// Get user profile
export const getUserProfiles = async (req, res) => {
    try {
        const {profileId} = req.body;
        const profile = await User.findById(profileId);

        if(!profile){
            res.json({success: false, message: "Profile not found"});
        }

        const posts = await Post.find({user: profileId}).populate('user');

        res.json({success: true, message: "Profile found", posts, profile});
    }
    catch (error) {
        res.json({success: false, message: error.message})
    }
}