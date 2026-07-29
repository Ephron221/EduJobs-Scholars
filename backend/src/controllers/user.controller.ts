import { Request, Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const query: Record<string, unknown> = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(query),
    ]);
    res.json({ users, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get users', error });
  }
};

export const getPublicAssistants = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Only return basic info of active assistants
    const assistants = await User.find({ role: 'assistant', isActive: true })
      .select('name email avatar')
      .sort({ name: 1 });
    res.json({ users: assistants });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get assistants', error });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get user', error });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    res.json({ message: 'User updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user', error });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error });
  }
};

export const toggleUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'disabled'} successfully`, user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to toggle user status', error });
  }
};

export const saveOpportunity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, type } = req.body;
    const user = await User.findById(req.user?._id);
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    const exists = user.savedOpportunities.some((o) => o.id === id);
    if (exists) { res.status(400).json({ message: 'Already saved' }); return; }
    user.savedOpportunities.push({ id, type });
    await user.save();
    res.json({ message: 'Opportunity saved', savedOpportunities: user.savedOpportunities });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save opportunity', error });
  }
};

export const unsaveOpportunity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    user.savedOpportunities = user.savedOpportunities.filter((o) => o.id !== req.params.oppId);
    await user.save();
    res.json({ message: 'Opportunity removed', savedOpportunities: user.savedOpportunities });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove opportunity', error });
  }
};

export const getSavedOpportunities = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);
    res.json({ savedOpportunities: user?.savedOpportunities || [] });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get saved opportunities', error });
  }
};

export const getUserStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const [
      totalUsers,
      studentCount,
      jobseekerCount,
      assistantCount,
      adminCount,
      activeCount,
      disabledCount,
      verifiedCount,
      unverifiedCount,
      newThisMonth,
      newLastMonth,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'jobseeker' }),
      User.countDocuments({ role: 'assistant' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
      User.countDocuments({ isVerified: true }),
      User.countDocuments({ isVerified: false }),
      User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      User.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
    ]);

    const growthPercent = newLastMonth > 0
      ? Math.round(((newThisMonth - newLastMonth) / newLastMonth) * 100)
      : newThisMonth > 0 ? 100 : 0;

    res.json({
      totalUsers,
      studentCount,
      jobseekerCount,
      assistantCount,
      adminCount,
      activeCount,
      disabledCount,
      verifiedCount,
      unverifiedCount,
      newThisMonth,
      newLastMonth,
      growthPercent,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get user stats', error });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role } = req.body;
    const allowedRoles = ['student', 'admin', 'jobseeker', 'assistant'];
    if (!role || !allowedRoles.includes(role)) {
      res.status(400).json({ message: 'Invalid role.' });
      return;
    }

    // Prevent admin from demoting themselves
    if (req.user?._id.toString() === req.params.id && role !== 'admin') {
      res.status(403).json({ message: 'You cannot change your own role.' });
      return;
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    res.json({ message: `Role updated to ${role}`, user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user role', error });
  }
};
