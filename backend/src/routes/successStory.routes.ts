import { Router } from 'express';
import {
  getSuccessStories,
  createSuccessStory,
  updateSuccessStory,
  deleteSuccessStory,
} from '../controllers/successStory.controller';
import { protect, adminOnly } from '../middleware/auth';
import { uploadImage } from '../middleware/upload';

const router = Router();

router.get('/', getSuccessStories);
router.post('/', protect, adminOnly, uploadImage.single('profileImage'), createSuccessStory);
router.put('/:id', protect, adminOnly, uploadImage.single('profileImage'), updateSuccessStory);
router.delete('/:id', protect, adminOnly, deleteSuccessStory);

export default router;