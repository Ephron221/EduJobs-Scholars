import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Ensure uploads directories exist
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const IMAGE_DIR = path.join(UPLOADS_DIR, 'images');
const DOC_DIR = path.join(UPLOADS_DIR, 'documents');

[UPLOADS_DIR, IMAGE_DIR, DOC_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Storage for images
const imageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, IMAGE_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

// Storage for documents (PDFs)
const docStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, DOC_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

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

// Mixed storage: route to correct folder based on mimetype
const mixedStorage = multer.diskStorage({
  destination: (_req, file, cb) => {
    const isPdf = file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf';
    cb(null, isPdf ? DOC_DIR : IMAGE_DIR);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

export const uploadImage = multer({ storage: imageStorage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } });
export const uploadDoc = multer({ storage: docStorage, fileFilter: docFilter, limits: { fileSize: 20 * 1024 * 1024 } });
export const uploadMixed = multer({ storage: mixedStorage, fileFilter: mixedFilter, limits: { fileSize: 20 * 1024 * 1024 } });
