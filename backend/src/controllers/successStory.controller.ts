import { Response } from 'express';
import SuccessStory from '../models/SuccessStory';
import { AuthRequest } from '../middleware/auth';
import { getFileUrl } from '../utils/fileHelper';

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
    const { fullName, type, howTheyKnow, howHelped } = req.body;
    const profileImage = getFileUrl(req.file, false);

    // Validation with safe checks (no .trim() on undefined)
    const errors: string[] = [];
    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) errors.push('Full Name is required');
    if (!type || typeof type !== 'string' || !type.trim()) errors.push('Story Type is required');
    if (!howTheyKnow || typeof howTheyKnow !== 'string' || !howTheyKnow.trim()) errors.push('Discovery story (howTheyKnow) is required');
    if (!howHelped || typeof howHelped !== 'string' || !howHelped.trim()) errors.push('Success story (howHelped) is required');
    if (!profileImage) errors.push('Profile image is required');

    if (errors.length > 0) {
      res.status(400).json({ message: 'Validation failed', errors });
      return;
    }

    const story = await SuccessStory.create({
      fullName: fullName.trim(),
      type: type.trim(),
      howTheyKnow: howTheyKnow.trim(),
      howHelped: howHelped.trim(),
      university: req.body.university || '',
      jobTitle: req.body.jobTitle || '',
      country: req.body.country || 'Rwanda',
      profileImage,
    });

    res.status(201).json({ message: 'Success story created successfully', story });
  } catch (error: any) {
    console.error('SERVER ERROR (createSuccessStory):', error);
    
    // Check if it's a Mongoose validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({ message: 'Database validation failed', errors: messages });
      return;
    }

    res.status(500).json({ 
      message: 'Internal server error while creating story', 
      error: error.message || 'Internal Server Error'
    });
  }
};

export const updateSuccessStory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fullName, type, howTheyKnow, howHelped, university, jobTitle, country } = req.body;
    
    const updateData: any = {};
    if (fullName !== undefined) updateData.fullName = fullName.trim();
    if (type !== undefined) updateData.type = type.trim();
    if (howTheyKnow !== undefined) updateData.howTheyKnow = howTheyKnow.trim();
    if (howHelped !== undefined) updateData.howHelped = howHelped.trim();
    if (university !== undefined) updateData.university = university;
    if (jobTitle !== undefined) updateData.jobTitle = jobTitle;
    if (country !== undefined) updateData.country = country;

    if (req.file) {
      const profileImage = getFileUrl(req.file, false);
      if (profileImage) updateData.profileImage = profileImage;
    }

    const story = await SuccessStory.findByIdAndUpdate(
      req.params.id, 
      { $set: updateData }, 
      { new: true, runValidators: true }
    );

    if (!story) {
      res.status(404).json({ message: 'Success story not found' });
      return;
    }

    res.json({ message: 'Success story updated successfully', story });
  } catch (error: any) {
    console.error('SERVER ERROR (updateSuccessStory):', error);
    res.status(500).json({ 
      message: 'Internal server error while updating story', 
      error: error.message || 'Internal Server Error' 
    });
  }
};

export const deleteSuccessStory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const story = await SuccessStory.findByIdAndDelete(req.params.id);
    if (!story) {
      res.status(404).json({ message: 'Success story not found' });
      return;
    }
    res.json({ message: 'Success story deleted successfully' });
  } catch (error: any) {
    console.error('SERVER ERROR (deleteSuccessStory):', error);
    res.status(500).json({ 
      message: 'Internal server error while deleting story', 
      error: error.message || 'Internal Server Error' 
    });
  }
};