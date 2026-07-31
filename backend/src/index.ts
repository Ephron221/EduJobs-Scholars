import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/database';

// Routes
import authRoutes from './routes/auth.routes';
import universityRoutes from './routes/university.routes';
import programRoutes from './routes/program.routes';
import jobRoutes from './routes/job.routes';
import applicationRoutes from './routes/application.routes';
import userRoutes from './routes/user.routes';
import notificationRoutes from './routes/notification.routes';
import guidanceRoutes from './routes/guidance.routes';
import statsRoutes from './routes/stats.routes';
import studentRoutes from './routes/student.routes';
import contactRoutes from './routes/contact.routes';
import heroImageRoutes from './routes/heroImage.routes';
import successStoryRoutes from './routes/successStory.routes';
import aiRoutes from './routes/ai.routes';
import whatsappRoutes from './routes/whatsapp.routes';
import serviceRoutes from './routes/service.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// Connect to MongoDB
connectDB();

// Simple request logger for debugging API routing issues
app.use((req, _res, next) => {
  try {
    console.log('HTTP', req.method, req.originalUrl, 'Auth:', !!req.headers.authorization);
  } catch (e) {
    // ignore
  }
  next();
});

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://edujobscholars.vercel.app',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL.replace(/\/$/, '')] : []),
];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Multer error handler for file upload validation
app.use((err: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'File is too large. Max size is 20 MB.'
      : err.message || 'File upload error';
    return res.status(400).json({ message });
  }

  if (err instanceof Error && err.message.includes('File type not supported')) {
    return res.status(400).json({ message: err.message });
  }

  next(err);
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/guidance', guidanceRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/hero-images', heroImageRoutes);
app.use('/api/success-stories', successStoryRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/services', serviceRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'EduJobs Scholars API running', timestamp: new Date() });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? err.message : undefined });
});

// Only listen when running locally — Vercel serverless handles this automatically
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`\n🚀 EduJobs Scholars API running on port ${PORT}`);
    console.log(`📚 Environment: ${process.env.NODE_ENV}`);
  });
}

export default app;
