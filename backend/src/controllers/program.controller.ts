import { Request, Response } from 'express';
import Program from '../models/Program';

export const getPrograms = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, fieldOfStudy, level, page = 1, limit = 12 } = req.query;
    const query: Record<string, unknown> = {};
    if (search) query.$text = { $search: search as string };
    if (fieldOfStudy) query.fieldOfStudy = { $regex: fieldOfStudy as string, $options: 'i' };
    if (level) query.level = level;
    const skip = (Number(page) - 1) * Number(limit);
    const [programs, total] = await Promise.all([
      Program.find(query).populate('universityId', 'name country logoUrl').sort({ deadline: 1 }).skip(skip).limit(Number(limit)),
      Program.countDocuments(query),
    ]);
    res.json({ programs, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get programs', error });
  }
};

export const getProgramsByUniversity = async (req: Request, res: Response): Promise<void> => {
  try {
    const programs = await Program.find({ universityId: req.params.universityId }).sort({ deadline: 1 });
    res.json({ programs });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get programs', error });
  }
};

export const getProgramById = async (req: Request, res: Response): Promise<void> => {
  try {
    const program = await Program.findById(req.params.id).populate('universityId', 'name country logoUrl website');
    if (!program) { res.status(404).json({ message: 'Program not found' }); return; }
    res.json({ program });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get program', error });
  }
};

export const createProgram = async (req: Request, res: Response): Promise<void> => {
  try {
    const program = await Program.create(req.body);
    res.status(201).json({ message: 'Program created successfully', program });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create program', error });
  }
};

export const updateProgram = async (req: Request, res: Response): Promise<void> => {
  try {
    const program = await Program.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!program) { res.status(404).json({ message: 'Program not found' }); return; }
    res.json({ message: 'Program updated successfully', program });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update program', error });
  }
};

export const deleteProgram = async (req: Request, res: Response): Promise<void> => {
  try {
    const program = await Program.findByIdAndDelete(req.params.id);
    if (!program) { res.status(404).json({ message: 'Program not found' }); return; }
    res.json({ message: 'Program deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete program', error });
  }
};
