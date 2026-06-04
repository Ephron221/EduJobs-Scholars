import { Request, Response } from 'express';
import path from 'path';
import University from '../models/University';
import Program from '../models/Program';
import { AuthRequest } from '../middleware/auth';
import { deleteUploadedFile } from '../utils/uploadPath';
import { getFileUrl } from '../utils/fileHelper';

export const getUniversities = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, country, featured, fundingType, page = 1, limit = 12 } = req.query;
    const query: Record<string, unknown> = {};
    if (search) query.$text = { $search: search as string };
    if (country) query.country = { $regex: country as string, $options: 'i' };
    if (featured === 'true') query.featured = true;
    if (typeof fundingType === 'string' && fundingType) {
      const universityIds = await Program.distinct('universityId', { fundingType });
      query._id = { $in: universityIds };
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [universities, total] = await Promise.all([
      University.find(query).sort({ featured: -1, createdAt: -1 }).skip(skip).limit(Number(limit)),
      University.countDocuments(query),
    ]);
    res.json({ universities, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get universities', error });
  }
};

export const getUniversityById = async (req: Request, res: Response): Promise<void> => {
  try {
    const university = await University.findById(req.params.id);
    if (!university) { res.status(404).json({ message: 'University not found' }); return; }
    res.json({ university });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get university', error });
  }
};

export const createUniversity = async (req: Request, res: Response): Promise<void> => {
  try {
    const university = await University.create(req.body);
    res.status(201).json({ message: 'University created successfully', university });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create university', error });
  }
};

export const updateUniversity = async (req: Request, res: Response): Promise<void> => {
  try {
    const university = await University.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!university) { res.status(404).json({ message: 'University not found' }); return; }
    res.json({ message: 'University updated successfully', university });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update university', error });
  }
};

export const deleteUniversity = async (req: Request, res: Response): Promise<void> => {
  try {
    const university = await University.findByIdAndDelete(req.params.id);
    if (!university) { res.status(404).json({ message: 'University not found' }); return; }
    res.json({ message: 'University deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete university', error });
  }
};

// ─── Upload handlers ──────────────────────────────────────────────────────────

export const uploadUniversityFiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const university = await University.findById(id);
    if (!university) { res.status(404).json({ message: 'University not found' }); return; }

    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) {
      res.status(400).json({ message: 'No files uploaded' });
      return;
    }

    const newImages: string[] = [];
    const newDocuments: { name: string; url: string; uploadedAt: Date }[] = [];

    for (const file of files) {
      const isPdf = file.mimetype === 'application/pdf';
      const url = getFileUrl(file, isPdf);

      if (isPdf) {
        if (url) newDocuments.push({ name: file.originalname, url, uploadedAt: new Date() });
      } else {
        if (url) newImages.push(url);
      }
    }

    if (newImages.length > 0) university.images.push(...newImages);
    if (newDocuments.length > 0) university.documents.push(...newDocuments);
    await university.save();

    res.json({ message: 'Files uploaded successfully', images: newImages, documents: newDocuments, university });
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload files', error });
  }
};

export const deleteUniversityFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { fileUrl, type } = req.body as { fileUrl: string; type: 'image' | 'document' };

    const university = await University.findById(id);
    if (!university) { res.status(404).json({ message: 'University not found' }); return; }

    // Remove from DB
    if (type === 'image') {
      university.images = university.images.filter((img: string) => img !== fileUrl);
    } else {
      university.documents = university.documents.filter((doc: { url: string }) => doc.url !== fileUrl);
    }
    await university.save();

    deleteUploadedFile(fileUrl);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete file', error });
  }
};
