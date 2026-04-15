import { Router } from 'express';
import {
  getGuidance, getGuidanceById, createGuidance,
  updateGuidance, deleteGuidance
} from '../controllers/guidance.controller';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/', getGuidance);
router.get('/:id', getGuidanceById);
router.post('/', protect, adminOnly, createGuidance);
router.put('/:id', protect, adminOnly, updateGuidance);
router.delete('/:id', protect, adminOnly, deleteGuidance);

export default router;
