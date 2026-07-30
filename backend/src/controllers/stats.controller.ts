import { Response } from 'express';
import University from '../models/University';
import Job from '../models/Job';
import User from '../models/User';
import StudentApplication from '../models/StudentApplication';
import Program from '../models/Program';
import Notification from '../models/Notification';
import Guidance from '../models/Guidance';
import Contact from '../models/Contact';
import SuccessStory from '../models/SuccessStory';
import Student from '../models/Student';
import { AuthRequest } from '../middleware/auth';

export const getDashboardStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalUniversities, totalJobs, totalUsers, totalApplications,
      totalPrograms, acceptedCount, rejectedCount, pendingCount,
      totalGuidance, totalAnnouncements, totalInquiries, totalStories,
      recentUsers, recentApplications
    ] = await Promise.all([
      University.countDocuments(),
      Job.countDocuments(),
      User.countDocuments({ role: 'student' }),
      StudentApplication.countDocuments(),
      Program.countDocuments(),
      StudentApplication.countDocuments({ status: 'Accepted' }),
      StudentApplication.countDocuments({ status: 'Rejected' }),
      StudentApplication.countDocuments({ status: 'In Progress' }),
      Guidance.countDocuments(),
      Notification.countDocuments({ isGlobal: true }),
      Contact.countDocuments({ status: 'pending' }),
      SuccessStory.countDocuments(),
      User.find({ role: 'student' }).sort({ createdAt: -1 }).limit(5).select('name email createdAt'),
      StudentApplication.find().sort({ updatedAt: -1 }).limit(5),
    ]);

    // Dynamic Monthly Trends (Since system start)
    const monthlyTrends = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();

    // Find the oldest record to determine the start of the timeline
    const oldestUser = await User.findOne().sort({ createdAt: 1 }).select('createdAt');
    const systemStartDate = oldestUser ? oldestUser.createdAt : new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Calculate total months to show (at least 6, up to 24 to keep chart readable)
    let startD = new Date(systemStartDate.getFullYear(), systemStartDate.getMonth(), 1);
    let currentD = new Date(now.getFullYear(), now.getMonth(), 1);
    let diffMonths = (currentD.getFullYear() - startD.getFullYear()) * 12 + (currentD.getMonth() - startD.getMonth());

    // Limit to max 12 months for visual clarity, or 6 if very new
    const monthsToShow = Math.max(6, Math.min(12, diffMonths + 1));

    for (let i = monthsToShow - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);

      const [users, applications, universities, jobs, studentRecords] = await Promise.all([
        User.countDocuments({ role: 'student', createdAt: { $gte: start, $lt: end } }),
        StudentApplication.countDocuments({ createdAt: { $gte: start, $lt: end } }),
        University.countDocuments({ createdAt: { $gte: start, $lt: end } }),
        Job.countDocuments({ createdAt: { $gte: start, $lt: end } }),
        Student.countDocuments({ createdAt: { $gte: start, $lt: end } }),
      ]);

      monthlyTrends.push({
        month: `${months[d.getMonth()]} ${d.getFullYear() % 100}`,
        users,
        applications,
        universities,
        jobs,
        studentRecords
      });
    }

    const statusBreakdown = [
      { status: 'Interested', count: await StudentApplication.countDocuments({ status: 'Interested' }) },
      { status: 'Applied', count: await StudentApplication.countDocuments({ status: 'Applied' }) },
      { status: 'Submitted', count: await StudentApplication.countDocuments({ status: 'Submitted' }) },
      { status: 'In Progress', count: pendingCount },
      { status: 'Accepted', count: acceptedCount },
      { status: 'Rejected', count: rejectedCount },
      { status: 'Resolved', count: await StudentApplication.countDocuments({ status: 'Resolved' }) },
    ];

    res.json({
      stats: {
        totalUniversities, totalJobs, totalUsers, totalApplications,
        totalPrograms, acceptedCount, rejectedCount, pendingCount,
        totalGuidance, totalAnnouncements, totalInquiries, totalStories,
      },
      statusBreakdown,
      monthlyTrends,
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
