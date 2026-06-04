import { Response } from 'express';
import HeroImage from '../models/HeroImage';
import { AuthRequest } from '../middleware/auth';
import { getFileUrl } from '../utils/fileHelper';

export const getHeroImages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const images = await HeroImage.find({ isActive: true }).sort({ order: 1 });
    res.json({ images });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get hero images', error });
  }
};

export const createHeroImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { altText, category = 'graduation', university, country, order } = req.body;
    if (!req.file) {
      res.status(400).json({ message: 'Image file is required' });
      return;
    }

    const imageUrl = getFileUrl(req.file, false);
    const image = await HeroImage.create({
      imageUrl,
      altText,
      category,
      university,
      country,
      order: order ? Number(order) : 0,
    });
    res.status(201).json({ message: 'Hero image created', image });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create hero image', error });
  }
};

export const updateHeroImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const updateData: Record<string, unknown> = { ...req.body };
    if (req.file) {
      updateData.imageUrl = getFileUrl(req.file, false);
    }

    const image = await HeroImage.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!image) { res.status(404).json({ message: 'Hero image not found' }); return; }
    res.json({ message: 'Hero image updated', image });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update hero image', error });
  }
};

export const deleteHeroImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const image = await HeroImage.findByIdAndDelete(req.params.id);
    if (!image) { res.status(404).json({ message: 'Hero image not found' }); return; }
    res.json({ message: 'Hero image deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete hero image', error });
  }
};