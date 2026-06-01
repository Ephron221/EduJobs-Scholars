import { Router } from 'express';
import { register, login, getMe, updateProfile, changePassword, forgotPassword, resetPassword, verifyAccount, resendOTP, verifyResetCode, googleLogin } from '../controllers/auth.controller';
import { protect } from '../middleware/auth';
import { uploadImage } from '../middleware/upload';
import { registerValidation, loginValidation } from '../middleware/validate';
import { rateLimit } from '../middleware/rateLimit';

const router = Router();
const authLimiter = rateLimit(15 * 60 * 1000, 10);
const otpLimiter = rateLimit(15 * 60 * 1000, 5);

router.post('/register', authLimiter, registerValidation, register);
router.post('/login', authLimiter, loginValidation, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, uploadImage.single('avatar'), updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/forgot-password', otpLimiter, forgotPassword);
router.post('/reset-password', otpLimiter, resetPassword);
router.post('/verify-account', otpLimiter, verifyAccount);
router.post('/resend-otp', otpLimiter, resendOTP);
router.post('/verify-reset-code', otpLimiter, verifyResetCode);
router.post('/google-login', authLimiter, googleLogin);

export default router;
