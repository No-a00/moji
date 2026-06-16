import express from 'express'
import { authMe, searchUsers, updateProfile, blockUser, getUserProfile } from '../controllers/userControllers.js'
import upload from '../utils/upload.js'

const router = express.Router();

router.get('/search', searchUsers);
router.get('/me', authMe);
router.put('/profile', upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), updateProfile);
router.get('/profile/:id', getUserProfile);
router.put('/block/:id', blockUser);

export default router;