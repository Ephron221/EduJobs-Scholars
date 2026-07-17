import { Router } from 'express';
import { register, login, getMe, updateProfile, changePassword, forgotPassword, resetPassword, verifyAccount, resendOTP, verifyResetCode, googleLogin } from '../controllers/auth.controller';
import { protect } from '../middleware/auth';
import { uploadImage } from '../middleware/upload';
import { registerValidation, loginValidation } from '../middleware/validate';
import { rateLimit } from '../middleware/rateLimit';
import { Request, Response, NextFunction } from 'express';

const router = Router();
const authLimiter = rateLimit(15 * 60 * 1000, 10);
const otpLimiter = rateLimit(15 * 60 * 1000, 5);

const handleUpload = (req: Request, res: Response, next: NextFunction) => {
  // Wrap multer single upload and log useful debugging information
  uploadImage.single('avatar')(req, res, (err) => {
    // Log content-type and a short header snapshot to diagnose client issues
    try {
      console.log('handleUpload: headers snapshot', {
        'content-type': req.headers['content-type'],
        origin: req.headers.origin,
        length: req.headers['content-length'],
      });
    } catch (e) {
      // ignore logging errors
    }

    if (err) {
      console.error('Avatar upload error:', err);
      // If multer provided a file, log its info to help debug validation failures
      if ((req as any).file) {
        const f = (req as any).file;
        console.error('Uploaded file info:', { originalname: f.originalname, mimetype: f.mimetype, size: f.size });
      }
      return res.status(400).json({ message: err.message || 'File upload failed' });
    }

    // Log success when a file is present
    if ((req as any).file) {
      const f = (req as any).file;
      console.log('handleUpload: received file', { originalname: f.originalname, mimetype: f.mimetype, size: f.size });
    }

    next();
  });
};

router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, handleUpload, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/forgot-password', otpLimiter, forgotPassword);
router.post('/reset-password', otpLimiter, resetPassword);
router.post('/verify-account', otpLimiter, verifyAccount);
router.post('/resend-otp', otpLimiter, resendOTP);
router.post('/verify-reset-code', otpLimiter, verifyResetCode);
router.post('/google-login', authLimiter, googleLogin);

export default router;
