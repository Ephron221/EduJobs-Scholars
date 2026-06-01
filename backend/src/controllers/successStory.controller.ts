import { Response } from 'express';
import SuccessStory from '../models/SuccessStory';
import { AuthRequest } from '../middleware/auth';

export const getSuccessStories = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stories = await SuccessStory.find({ isActive: true }).sort({ order: 1 });
    res.json({ stories });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get success stories', error });
  }
};

export const createSuccessStory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fullName, type, howTheyKnow, howHelped, university, jobTitle, country } = req.body;
    const profileImage = req.file ? `/uploads/images/${req.file.filename}` : undefined;

    const story = await SuccessStory.create({
      fullName,
      type,
      howTheyKnew: howTheyKnow,
      howHelped,
      university,
      jobTitle,
      country,
      profileImage,
    });

    res.status(201).json({ message: 'Success story created', story });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create success story', error });
  }
};

export const updateSuccessStory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const updateData: Record<string, unknown> = {
      ...req.body,
      ...(req.file ? { profileImage: `/uploads/images/${req.file.filename}` } : {}),
    };

    const story = await SuccessStory.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!story) { res.status(404).json({ message: 'Success story not found' }); return; }
    res.json({ message: 'Success story updated', story });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update success story', error });
  }
};

export const deleteSuccessStory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const story = await SuccessStory.findByIdAndDelete(req.params.id);
    if (!story) { res.status(404).json({ message: 'Success story not found' }); return; }
    res.json({ message: 'Success story deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete success story', error });
  }
};