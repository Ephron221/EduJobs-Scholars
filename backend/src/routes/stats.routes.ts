import { Router } from 'express';
import { getDashboardStats, getRecentActivity } from '../controllers/stats.controller';
import { protect, staffOnly } from '../middleware/auth';

const router = Router();

router.get('/dashboard', protect, staffOnly, getDashboardStats);
router.get('/activity', protect, staffOnly, getRecentActivity);

export default router;
