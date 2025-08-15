import express from 'express';
import { protect } from '../middlewares/auth.js';
import { acceptConectionRequest, discoverUsers, followUser, getUserConections, getUserData, getUserProfiles, sendConectionRequest, unFollowUser, updateUserData } from '../controllers/userController.js';
import { upload } from '../configs/multer.js';

const userRouter = express.Router();

userRouter.get('/data', protect, getUserData);
userRouter.post('/update', upload.fields([{name: 'profile', maxCount: 1}, {name: 'cover', maxCount: 1}]) , protect, updateUserData);
userRouter.post('/discover', protect, discoverUsers);
userRouter.post('/follow', protect, followUser);
userRouter.post('/unfollow', protect, unFollowUser);
userRouter.post('/connect', protect, sendConectionRequest);
userRouter.post('/accept', protect, acceptConectionRequest);
userRouter.get('/connections', protect, getUserConections);

userRouter.post('/profiles', getUserProfiles);


export default userRouter;