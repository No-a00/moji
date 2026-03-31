import express from 'express';
import { createConversation,getConversation,getMessages } from '../controllers/convarsationControllers.js';

import {CheckFriendShip} from '../middlewares/friendMiddlewares.js'

const router  = express.Router();

router.post('/',CheckFriendShip,createConversation);
router.get('/',getConversation);
router.get('/:id/messages',getMessages);

export default router;
