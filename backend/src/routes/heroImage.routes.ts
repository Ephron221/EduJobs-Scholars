import { Router } from 'express';
import {
  getHeroImages,
  createHeroImage,
  updateHeroImage,
  deleteHeroImage,
} from '../controllers/heroImage.controller';
import { protect, adminOnly } from '../middleware/auth';
import { uploadImage } from '../middleware/upload';

const router = Router();

router.get('/', getHeroImages);
router.post('/', protect, adminOnly, uploadImage.single('image'), createHeroImage);
router.put('/:id', protect, adminOnly, uploadImage.single('image'), updateHeroImage);
router.delete('/:id', protect, adminOnly, deleteHeroImage);

export default router;