import express from 'express'

import {
    sendDicrectMessage,
    sendGroupMessage
} from '../controllers/messageContoller.js'
import { CheckFriendShip, checkGroupMembership } from '../middlewares/friendMiddlewares.js';

const router = express.Router();
router.post('/direct',CheckFriendShip,sendDicrectMessage);
router.post('/group',checkGroupMembership,sendGroupMessage);
export default router;