import { Request, Response } from 'express';
import Guidance from '../models/Guidance';

export const getGuidance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, category, featured } = req.query;
    const query: Record<string, unknown> = {};
    if (search) query.$text = { $search: search as string };
    if (category) query.category = category;
    if (featured === 'true') query.featured = true;
    const guidance = await Guidance.find(query).sort({ featured: -1, createdAt: -1 });
    res.json({ guidance });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get guidance', error });
  }
};

export const getGuidanceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const guidance = await Guidance.findById(req.params.id);
    if (!guidance) { res.status(404).json({ message: 'Guidance not found' }); return; }
    res.json({ guidance });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get guidance', error });
  }
};

export const createGuidance = async (req: Request, res: Response): Promise<void> => {
  try {
    const guidance = await Guidance.create(req.body);
    res.status(201).json({ message: 'Guidance created successfully', guidance });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create guidance', error });
  }
};

export const updateGuidance = async (req: Request, res: Response): Promise<void> => {
  try {
    const guidance = await Guidance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!guidance) { res.status(404).json({ message: 'Guidance not found' }); return; }
    res.json({ message: 'Guidance updated successfully', guidance });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update guidance', error });
  }
};

export const deleteGuidance = async (req: Request, res: Response): Promise<void> => {
  try {
    await Guidance.findByIdAndDelete(req.params.id);
    res.json({ message: 'Guidance deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete guidance', error });
  }
};
