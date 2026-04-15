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
