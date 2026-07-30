import { Request, Response } from 'express';
import Guidance from '../models/Guidance';

export const getGuidance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, category, featured, page = 1, limit = 12 } = req.query;
    const query: Record<string, unknown> = {};
    if (search) query.$text = { $search: search as string };
    if (category) query.category = category;
    if (featured === 'true') query.featured = true;

    const skip = (Number(page) - 1) * Number(limit);
    const [guidance, total] = await Promise.all([
      Guidance.find(query).sort({ featured: -1, createdAt: -1 }).skip(skip).limit(Number(limit)),
      Guidance.countDocuments(query),
    ]);

    res.json({
      guidance,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get guidance', error });
  }
};

export const getGuidanceStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [total, university, cv, career, interview, scholarships, general] = await Promise.all([
      Guidance.countDocuments(),
      Guidance.countDocuments({ category: 'university_applications' }),
      Guidance.countDocuments({ category: 'cv_writing' }),
      Guidance.countDocuments({ category: 'career_development' }),
      Guidance.countDocuments({ category: 'interview_prep' }),
      Guidance.countDocuments({ category: 'scholarships' }),
      Guidance.countDocuments({ category: 'general' }),
    ]);

    res.json({
      total,
      university_applications: university,
      cv_writing: cv,
      career_development: career,
      interview_prep: interview,
      scholarships,
      general
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get guidance stats', error });
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
