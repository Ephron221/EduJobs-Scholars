import { Router } from 'express';
import {
  getNotifications, markAsRead, markAllAsRead,
  createAnnouncement, deleteNotification, getUnreadCount,
  getAdminNotifications, updateNotification, getNotificationStats
} from '../controllers/notification.controller';
import { protect, adminOnly, staffOnly } from '../middleware/auth';

const router = Router();

router.get('/', protect, getNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.put('/:id/read', protect, markAsRead);
router.put('/mark-all-read', protect, markAllAsRead);

// Admin & Assistant (Staff) Routes
router.post('/announcement', protect, staffOnly, createAnnouncement);
router.get('/admin', protect, staffOnly, getAdminNotifications);
router.get('/stats', protect, staffOnly, getNotificationStats);
router.put('/:id', protect, staffOnly, updateNotification);
router.delete('/:id', protect, staffOnly, deleteNotification);

export default router;
