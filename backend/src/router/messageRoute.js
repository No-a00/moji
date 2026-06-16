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

router.post('/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Vui lòng chọn tệp" });
        }
        
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        
        return res.status(200).json({ 
            fileUrl,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            fileType: req.file.mimetype
        });
    } catch (error) {
        console.error("Lỗi upload:", error);
        return res.status(500).json({ message: "Lỗi khi upload tệp" });
    }
});

import { unsendMessage, editMessage, reactToMessage } from '../controllers/messageContoller.js';

router.delete('/:id/unsend', unsendMessage);
router.put('/:id/edit', editMessage);
router.post('/:id/react', reactToMessage);

export default router;