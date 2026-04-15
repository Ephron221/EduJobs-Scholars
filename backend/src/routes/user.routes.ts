import { Router } from 'express';
import {
  getUsers, getUserById, updateUser, deleteUser,
  toggleUserStatus, saveOpportunity, unsaveOpportunity, getSavedOpportunities
} from '../controllers/user.controller';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/', protect, adminOnly, getUsers);
router.get('/saved', protect, getSavedOpportunities);
router.get('/:id', protect, adminOnly, getUserById);
router.put('/:id', protect, adminOnly, updateUser);
router.delete('/:id', protect, adminOnly, deleteUser);
router.patch('/:id/toggle-status', protect, adminOnly, toggleUserStatus);
router.post('/save-opportunity', protect, saveOpportunity);
router.delete('/unsave-opportunity/:oppId', protect, unsaveOpportunity);

export default router;
