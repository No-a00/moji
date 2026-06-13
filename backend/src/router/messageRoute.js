import express from 'express'

import {
    sendDicrectMessage,
    sendGroupMessage
} from '../controllers/messageContoller.js'
import { CheckFriendShip, checkGroupMembership } from '../middlewares/friendMiddlewares.js';
import upload from '../utils/upload.js';

const router = express.Router();
router.post('/direct',CheckFriendShip,sendDicrectMessage);
router.post('/group',checkGroupMembership,sendGroupMessage);

router.post('/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Vui lòng chọn ảnh" });
        }
        // Trả về url của ảnh để frontend gọi tiếp vào /direct hoặc /group
        const imgUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        return res.status(200).json({ imgUrl });
    } catch (error) {
        console.error("Lỗi upload:", error);
        return res.status(500).json({ message: "Lỗi khi upload ảnh" });
    }
});

import { unsendMessage, editMessage, reactToMessage } from '../controllers/messageContoller.js';

router.delete('/:id/unsend', unsendMessage);
router.put('/:id/edit', editMessage);
router.post('/:id/react', reactToMessage);

export default router;