import { Request, Response } from 'express';
import path from 'path';
import Job from '../models/Job';
import { AuthRequest } from '../middleware/auth';
import { deleteUploadedFile } from '../utils/uploadPath';
import { getFileUrl } from '../utils/fileHelper';

export const getJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, type, location, fieldOfStudy, featured, page = 1, limit = 12 } = req.query;
    const query: Record<string, unknown> = {};
    if (search) query.$text = { $search: search as string };
    if (type) query.type = type;
    if (location) query.location = { $regex: location as string, $options: 'i' };
    if (fieldOfStudy) query.fieldOfStudy = { $regex: fieldOfStudy as string, $options: 'i' };
    if (featured === 'true') query.featured = true;
    const skip = (Number(page) - 1) * Number(limit);
    const [jobs, total] = await Promise.all([
      Job.find(query).sort({ featured: -1, postedAt: -1 }).skip(skip).limit(Number(limit)),
      Job.countDocuments(query),
    ]);
    res.json({ jobs, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get jobs', error });
  }
};

export const getJobById = async (req: Request, res: Response): Promise<void> => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) { res.status(404).json({ message: 'Job not found' }); return; }
    res.json({ job });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get job', error });
  }
};

export const createJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const job = await Job.create(req.body);
    res.status(201).json({ message: 'Job posted successfully', job });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create job', error });
  }
};

export const updateJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!job) { res.status(404).json({ message: 'Job not found' }); return; }
    res.json({ message: 'Job updated successfully', job });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update job', error });
  }
};

export const deleteJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) { res.status(404).json({ message: 'Job not found' }); return; }
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete job', error });
  }
};

// ─── Upload handlers ──────────────────────────────────────────────────────────

export const uploadJobFiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);
    if (!job) { res.status(404).json({ message: 'Job not found' }); return; }

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

    if (newImages.length > 0) job.images.push(...newImages);
    if (newDocuments.length > 0) job.documents.push(...newDocuments);
    await job.save();

    res.json({ message: 'Files uploaded successfully', images: newImages, documents: newDocuments, job });
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload files', error });
  }
};

export const deleteJobFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { fileUrl, type } = req.body as { fileUrl: string; type: 'image' | 'document' };

    const job = await Job.findById(id);
    if (!job) { res.status(404).json({ message: 'Job not found' }); return; }

    if (type === 'image') {
      job.images = job.images.filter((img: string) => img !== fileUrl);
    } else {
      job.documents = job.documents.filter((doc: { url: string }) => doc.url !== fileUrl);
    }
    await job.save();

    deleteUploadedFile(fileUrl);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete file', error });
  }
};
