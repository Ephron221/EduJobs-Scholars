import { Router } from 'express';
import { register, login, getMe, updateProfile, changePassword, forgotPassword, resetPassword, verifyAccount, resendOTP, verifyResetCode, googleLogin } from '../controllers/auth.controller';
import { protect } from '../middleware/auth';
import { registerValidation, loginValidation } from '../middleware/validate';

const router = Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-account', verifyAccount);
router.post('/resend-otp', resendOTP);
router.post('/verify-reset-code', verifyResetCode);
router.post('/google-login', googleLogin);

export default router;
