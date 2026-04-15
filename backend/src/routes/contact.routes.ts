import express from 'express';
import {
  createMessage,
  getMessages,
  updateMessageStatus,
  deleteMessage
} from '../controllers/contact.controller';
import { protect, adminOnly } from '../middleware/auth';

const router = express.Router();

// Public route to submit a contact message
router.post('/', createMessage);

// Admin only routes
router.use(protect);
router.use(adminOnly);

router.route('/')
  .get(getMessages);

router.route('/:id')
  .patch(updateMessageStatus)
  .delete(deleteMessage);

export default router;
