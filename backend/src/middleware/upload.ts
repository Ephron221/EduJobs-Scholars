import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import dotenv from 'dotenv';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';

dotenv.config();

const hasCloudinaryConfig = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

// In production, we MUST use Cloudinary. Local storage will fail on Vercel.
const USE_CLOUDINARY = process.env.NODE_ENV === 'production' || hasCloudinaryConfig;

const uploadRoot = path.join(process.cwd(), 'uploads');
const imageDir = path.join(uploadRoot, 'images');
const documentDir = path.join(uploadRoot, 'documents');

// ONLY create local directories if NOT in production (Development fallback)
if (process.env.NODE_ENV !== 'production' && !hasCloudinaryConfig) {
  if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });
  if (!fs.existsSync(documentDir)) fs.mkdirSync(documentDir, { recursive: true });
}

const safeFilename = (file: Express.Multer.File): string => {
  const ext = path.extname(file.originalname).toLowerCase();
  const base = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]/gi, '-').slice(0, 40) || 'upload';
  return `${Date.now()}-${Math.round(Math.random() * 1e9)}-${base}${ext}`;
};

// Mixed Cloudinary storage handles both PDFs and Images
const mixedCloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (_req: any, file: Express.Multer.File) => {
    const isPdf = file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf';
    return {
      folder: isPdf ? 'edujobs-scholars/documents' : 'edujobs-scholars/images',
      resource_type: isPdf ? 'raw' : 'auto',
      public_id: safeFilename(file).split('.')[0], // Cloudinary adds extension
    };
  },
});

// Local storage configuration (Only for local dev)
const mixedLocalStorage = multer.diskStorage({
  destination: (_req, file, cb) => {
    const isPdf = file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf';
    cb(null, isPdf ? documentDir : imageDir);
  },
  filename: (_req, file, cb) => cb(null, safeFilename(file)),
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedExts = /jpeg|jpg|png|gif|webp|pdf/i;
  const isAllowed = allowedExts.test(path.extname(file.originalname)) || allowedExts.test(file.mimetype);
  
  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error('File type not supported. Please upload images or PDFs.'));
  }
};

const storage = USE_CLOUDINARY ? mixedCloudinaryStorage : mixedLocalStorage;

export const uploadMixed = multer({ 
  storage: storage, 
  fileFilter: fileFilter, 
  limits: { fileSize: 20 * 1024 * 1024 } 
});

// Alias for backwards compatibility
export const uploadImage = uploadMixed;
export const uploadDoc = uploadMixed;
