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

// Always create local directories in development as a fallback
if (process.env.NODE_ENV !== 'production') {
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
    try {
      const isPdf = file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf';
      const filename = safeFilename(file);
      return {
        folder: isPdf ? 'edujobs-scholars/documents' : 'edujobs-scholars/images',
        resource_type: isPdf ? 'raw' : 'auto',
        public_id: isPdf ? filename : filename.replace(/\.[^.]+$/, ''),
      };
    } catch (err) {
      console.error('Cloudinary storage params error:', err);
      throw err;
    }
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
  const allowedExts = /jpeg|jpg|png|gif|webp|svg|pdf/i;
  const isAllowed = allowedExts.test(path.extname(file.originalname)) || allowedExts.test(file.mimetype);
  
  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error('File type not supported. Please upload JPG, PNG, GIF, WebP, SVG, or PDF.'));
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
