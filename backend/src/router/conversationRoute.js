import express from 'express';
import { createConversation,getConversation,getMessages, markAsSeen, updateTheme, updateWallpaper, togglePinMessage, togglePinConversation, markAsUnread, toggleMute, toggleArchive } from '../controllers/convarsationControllers.js';

import {CheckFriendShip} from '../middlewares/friendMiddlewares.js'

const router  = express.Router();

router.post('/',CheckFriendShip,createConversation);
router.get('/',getConversation);
router.get('/:id/messages',getMessages);
router.post('/:id/seen', markAsSeen);
router.put('/:id/theme', updateTheme);
router.put('/:id/wallpaper', updateWallpaper);
router.post('/:id/pin', togglePinMessage);
router.put('/:id/unread', markAsUnread);
router.put('/:id/mute', toggleMute);
router.put('/:id/archive', toggleArchive);
router.put('/:id/pin-chat', togglePinConversation);

export default router;
