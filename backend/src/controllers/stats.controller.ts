import { Response } from 'express';
import University from '../models/University';
import Job from '../models/Job';
import User from '../models/User';
import StudentApplication from '../models/StudentApplication';
import Program from '../models/Program';
import Notification from '../models/Notification';
import { AuthRequest } from '../middleware/auth';

export const getDashboardStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalUniversities, totalJobs, totalUsers, totalApplications,
      totalPrograms, acceptedCount, rejectedCount, pendingCount,
      recentUsers, recentApplications
    ] = await Promise.all([
      University.countDocuments(),
      Job.countDocuments(),
      User.countDocuments({ role: 'student' }),
      StudentApplication.countDocuments(),
      Program.countDocuments(),
      StudentApplication.countDocuments({ status: 'Accepted' }),
      StudentApplication.countDocuments({ status: 'Rejected' }),
      StudentApplication.countDocuments({ status: { $in: ['Interested', 'Applied', 'Submitted'] } }),
      User.find({ role: 'student' }).sort({ createdAt: -1 }).limit(5).select('name email createdAt'),
      StudentApplication.find().sort({ updatedAt: -1 }).limit(5),
    ]);

    const statusBreakdown = [
      { status: 'Interested', count: await StudentApplication.countDocuments({ status: 'Interested' }) },
      { status: 'Applied', count: await StudentApplication.countDocuments({ status: 'Applied' }) },
      { status: 'Submitted', count: await StudentApplication.countDocuments({ status: 'Submitted' }) },
      { status: 'Accepted', count: acceptedCount },
      { status: 'Rejected', count: rejectedCount },
    ];

    res.json({
      stats: {
        totalUniversities, totalJobs, totalUsers, totalApplications,
        totalPrograms, acceptedCount, rejectedCount, pendingCount,
      },
      statusBreakdown,
      recentUsers,
      recentApplications,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get stats', error });
  }
};

export const getRecentActivity = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [recentApplications, recentNotifications] = await Promise.all([
      StudentApplication.find().sort({ updatedAt: -1 }).limit(10),
      Notification.find().sort({ createdAt: -1 }).limit(10),
    ]);
    res.json({ recentApplications, recentNotifications });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get recent activity', error });
  }
};
