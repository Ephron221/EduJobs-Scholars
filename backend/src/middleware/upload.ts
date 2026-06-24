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

// Determine if we should use Cloudinary or Local Storage
const USE_CLOUDINARY = process.env.NODE_ENV === 'production' ? hasCloudinaryConfig : false;

const uploadRoot = path.join(process.cwd(), 'uploads');
const imageDir = path.join(uploadRoot, 'images');
const documentDir = path.join(uploadRoot, 'documents');

// ONLY create local directories if NOT using Cloudinary (Development)
if (!USE_CLOUDINARY) {
  if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });
  if (!fs.existsSync(documentDir)) fs.mkdirSync(documentDir, { recursive: true });
}

const safeFilename = (file: Express.Multer.File): string => {
  const ext = path.extname(file.originalname).toLowerCase();
  const base = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]/gi, '-').slice(0, 40) || 'upload';
  return `${Date.now()}-${Math.round(Math.random() * 1e9)}-${base}${ext}`;
};

// Cloudinary storage configuration
const imageCloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'edujobs-scholars/images',
    resource_type: 'auto',
    format: async (_req: any, file: Express.Multer.File) => {
      const ext = path.extname(file.originalname).slice(1);
      return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) ? ext : 'jpg';
    },
  } as any,
});

const docCloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'edujobs-scholars/documents',
    resource_type: 'raw',
    format: async (_req: any, file: Express.Multer.File) => 'pdf',
  } as any,
});

const mixedCloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: (_req: any, file: Express.Multer.File) => {
      const isPdf = file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf';
      return isPdf ? 'edujobs-scholars/documents' : 'edujobs-scholars/images';
    },
    resource_type: (_req: any, file: Express.Multer.File) => {
      const isPdf = file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf';
      return isPdf ? 'raw' : 'auto';
    },
  } as any,
});

// Local storage configuration (Only for dev)
const imageLocalStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, imageDir),
  filename: (_req, file, cb) => cb(null, safeFilename(file)),
});

const docLocalStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, documentDir),
  filename: (_req, file, cb) => cb(null, safeFilename(file)),
});

const mixedLocalStorage = multer.diskStorage({
  destination: (_req, file, cb) => {
    const isPdf = file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf';
    cb(null, isPdf ? documentDir : imageDir);
  },
  filename: (_req, file, cb) => cb(null, safeFilename(file)),
});

// File type validators
const imageFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = /jpeg|jpg|png|gif|webp/i;
  if (allowed.test(path.extname(file.originalname)) && allowed.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpg, png, gif, webp)'));
  }
};

const docFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (path.extname(file.originalname).toLowerCase() === '.pdf' || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
};

// Selection logic
const imageStorage = USE_CLOUDINARY ? imageCloudinaryStorage : imageLocalStorage;
const docStorage = USE_CLOUDINARY ? docCloudinaryStorage : docLocalStorage;
const mixedStorage = USE_CLOUDINARY ? mixedCloudinaryStorage : mixedLocalStorage;

export const uploadImage = multer({ storage: imageStorage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } });
export const uploadDoc = multer({ storage: docStorage, fileFilter: docFilter, limits: { fileSize: 20 * 1024 * 1024 } });
export const uploadMixed = multer({ storage: mixedStorage, fileFilter: imageFilter, limits: { fileSize: 20 * 1024 * 1024 } });
