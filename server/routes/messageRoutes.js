import express from 'express';
import { protect } from '../middlewares/auth.js';
import { upload } from '../configs/multer.js';
import { getChatMessages, sendMessage, sseController, getUserRecentMessages } from '../controllers/messageController.js';

const messageRouter = express.Router();

messageRouter.get('/:userId', sseController);
messageRouter.post('/send', upload.single('image'), protect, sendMessage);
messageRouter.post('/get', protect, getChatMessages);
messageRouter.get('/recent', protect, getUserRecentMessages);

export default messageRouter;