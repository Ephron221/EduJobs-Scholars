import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary';

// Use local storage for development, Cloudinary for production
const USE_CLOUDINARY = process.env.NODE_ENV === 'production' || process.env.CLOUDINARY_CLOUD_NAME;

// Cloudinary storage configuration for images
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

// Cloudinary storage configuration for documents
const docCloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'edujobs-scholars/documents',
    resource_type: 'raw',
    format: async (_req: any, file: Express.Multer.File) => 'pdf',
  } as any,
});

// Cloudinary storage configuration for mixed uploads
const mixedCloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: (_req: any, file: Express.Multer.File) => {
      const isPdf = file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf';
      return isPdf ? 'edujobs-scholars/documents' : 'edujobs-scholars/images';
    },
    resource_type: (req: any, file: Express.Multer.File) => {
      const isPdf = file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf';
      return isPdf ? 'raw' : 'auto';
    },
    format: async (_req: any, file: Express.Multer.File) => {
      const ext = path.extname(file.originalname).slice(1).toLowerCase();
      const isPdf = ext === 'pdf' || file.mimetype === 'application/pdf';
      if (isPdf) return 'pdf';
      return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) ? ext : 'jpg';
    },
  } as any,
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

const mixedFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const imageAllowed = /jpeg|jpg|png|gif|webp/i;
  const isPdf = path.extname(file.originalname).toLowerCase() === '.pdf' && file.mimetype === 'application/pdf';
  const isImage = imageAllowed.test(path.extname(file.originalname)) && imageAllowed.test(file.mimetype);
  if (isPdf || isImage) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, png, gif, webp) or PDF files are allowed'));
  }
};

// Select storage based on environment
const imageStorage = USE_CLOUDINARY ? imageCloudinaryStorage : multer.memoryStorage();
const docStorage = USE_CLOUDINARY ? docCloudinaryStorage : multer.memoryStorage();
const mixedStorage = USE_CLOUDINARY ? mixedCloudinaryStorage : multer.memoryStorage();

export const uploadImage = multer({ 
  storage: imageStorage, 
  fileFilter: imageFilter, 
  limits: { fileSize: 5 * 1024 * 1024 } 
});

export const uploadDoc = multer({ 
  storage: docStorage, 
  fileFilter: docFilter, 
  limits: { fileSize: 20 * 1024 * 1024 } 
});

export const uploadMixed = multer({ 
  storage: mixedStorage, 
  fileFilter: mixedFilter, 
  limits: { fileSize: 20 * 1024 * 1024 } 
});
