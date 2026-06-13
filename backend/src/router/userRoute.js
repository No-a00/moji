import express from 'express'
import { authMe, searchUsers, updateProfile } from '../controllers/userControllers.js'
import upload from '../utils/upload.js'

const router = express.Router();

router.get('/search', searchUsers);
router.get('/me', authMe);
router.put('/profile', upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), updateProfile);

export default router;