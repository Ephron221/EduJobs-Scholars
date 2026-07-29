import express from 'express';
import {
  createMessage,
  getMessages,
  updateMessageStatus,
  deleteMessage
} from '../controllers/contact.controller';
import { protect, adminOnly, staffOnly } from '../middleware/auth';

const router = express.Router();

// Public route to submit a contact message
router.post('/', createMessage);

// Protected routes
router.use(protect);

router.get('/', staffOnly, getMessages);
router.patch('/:id', staffOnly, updateMessageStatus);
router.delete('/:id', adminOnly, deleteMessage); // Only admin can delete

export default router;
