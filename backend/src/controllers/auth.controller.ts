import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import sendEmail from '../utils/sendEmail';
import { OAuth2Client } from 'google-auth-library';
import { getJwtSecret } from '../config/env';
import { getFileUrl } from '../utils/fileHelper';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const OTP_LENGTH = 6;
const OTP_CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const generateOtp = (): string => {
  let otp = '';
  for (let i = 0; i < OTP_LENGTH; i += 1) {
    otp += OTP_CHARACTERS[crypto.randomInt(0, OTP_CHARACTERS.length)];
  }
  return otp;
};

const normalizeOtp = (otp: string): string => otp.trim().toUpperCase();
const hashOtp = (otp: string): string => crypto.createHash('sha256').update(`${getJwtSecret()}:${normalizeOtp(otp)}`).digest('hex');

const generateToken = (id: string): string => {
  return jwt.sign({ id }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  } as jwt.SignOptions);
};

const isDevelopment = process.env.NODE_ENV === 'development';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'Email already registered' });
      return;
    }

    const allowedRoles = ['student', 'jobseeker'];
    const assignedRole = allowedRoles.includes(role) ? role : 'student';
    
    // Generate verification code
    const verificationCode = generateOtp();
    const verificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({ 
      name, 
      email, 
      password, 
      role: assignedRole, 
      verificationCode: hashOtp(verificationCode),
      verificationExpire,
      isVerified: false 
    });

    // Send verification email
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="display: inline-block; background-color: #0ea5e9; color: white; padding: 10px 20px; border-radius: 8px; font-weight: bold; font-size: 24px;">EJ</div>
          <h1 style="color: #0f172a; margin-top: 10px;">EduJobs Scholars</h1>
        </div>
        <h2 style="color: #0ea5e9; text-align: center;">Welcome to EduJobs Scholars!</h2>
        <p>Hello ${user.name},</p>
        <p>Thank you for registering. Please use the following 6-character code to verify your account:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #f8fafc; color: #0ea5e9; padding: 20px; border-radius: 12px; border: 2px dashed #0ea5e9; font-size: 32px; font-weight: bold; letter-spacing: 8px; display: inline-block;">
            ${verificationCode}
          </div>
        </div>
        <p style="color: #64748b; font-size: 14px; text-align: center;">This code will expire in 24 hours.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b; text-align: center;">&copy; 2024 EduJobs Scholars. All rights reserved.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Verify your EduJobs Scholars Account',
        message: `Your verification code is: ${verificationCode}`,
        html
      });
    } catch (emailError) {
      console.error('Verification email failed to send:', emailError);
    }

    const token = generateToken(user._id.toString());
    res.status(201).json({ 
      message: 'Account created. Please verify your email.', 
      token, 
      user,
      needsVerification: true 
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }
    if (!user.isActive) {
      res.status(403).json({ message: 'Account is disabled. Contact admin.' });
      return;
    }
    if (!user.isVerified) {
      res.status(401).json({ 
        message: 'Please verify your email to continue.', 
        needsVerification: true,
        email: user.email 
      });
      return;
    }
    const token = generateToken(user._id.toString());
    const userObj = user.toJSON();
    res.json({ message: 'Login successful', token, user: userObj });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get user', error });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email } = req.body;
    const updateFields: { name?: string; email?: string; avatar?: string } = {};

    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (req.file) {
      const avatarUrl = getFileUrl(req.file, false);
      if (!avatarUrl) {
        console.error('updateProfile: failed to get file URL', { file: req.file });
        res.status(400).json({ message: 'Profile image upload failed. Please try another image.' });
        return;
      }
      updateFields.avatar = avatarUrl;
    }

    // Debug logging to diagnose runtime errors during profile update
    console.log('updateProfile: user', { id: req.user?._id, email: req.user?.email });
    console.log('updateProfile: file', req.file);
    console.log('updateProfile: updateFields', updateFields);

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ message: 'Failed to update profile', error: error instanceof Error ? error.message : String(error) });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user?._id).select('+password');
    if (!user || !(await user.comparePassword(currentPassword))) {
      res.status(400).json({ message: 'Current password is incorrect' });
      return;
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to change password', error });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // In production, we don't want to reveal if an email is in use or not
      res.status(200).json({ message: 'If an account exists, a verification code has been sent.' });
      return;
    }

    const otp = generateOtp();

    user.resetPasswordToken = hashOtp(otp);

    // Set expire
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.save();

    const message = `Your password reset code is: ${otp}. It is valid for 10 minutes.`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="display: inline-block; background-color: #0ea5e9; color: white; padding: 10px 20px; border-radius: 8px; font-weight: bold; font-size: 24px;">EJ</div>
          <h1 style="color: #0f172a; margin-top: 10px;">EduJobs Scholars</h1>
        </div>
        <h2 style="color: #0ea5e9; text-align: center;">Verification Code</h2>
        <p>Hello ${user.name},</p>
        <p>You are receiving this email because you (or someone else) has requested the reset of a password for your EduJobs Scholars account.</p>
        <p>Use the following 6-character code to verify your request. This code is valid for 10 minutes.</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #f8fafc; color: #0ea5e9; padding: 20px; border-radius: 12px; border: 2px dashed #0ea5e9; font-size: 32px; font-weight: bold; letter-spacing: 8px; display: inline-block;">
            ${otp}
          </div>
        </div>
        <p style="color: #64748b; font-size: 14px; text-align: center;">If you did not request this, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b; text-align: center;">&copy; 2024 EduJobs Scholars. All rights reserved.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your EduJobs Scholars Verification Code',
        message,
        html,
      });

      res.status(200).json({ message: 'If an account exists, a verification code has been sent.' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      console.error('Password reset email failed to send:', err);
      res.status(500).json({
        message: isDevelopment
          ? `Email could not be sent: ${err instanceof Error ? err.message : 'Unknown email error'}`
          : 'Email could not be sent',
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error in forgotPassword', error });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp, password } = req.body;

    const user = await User.findOne({
      email,
      resetPasswordToken: hashOtp(otp),
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired verification code' });
      return;
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: 'Password reset successful', success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error in resetPassword', error });
  }
};

export const verifyAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ 
      email, 
      verificationCode: hashOtp(code),
      verificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired verification code' });
      return;
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationExpire = undefined;
    await user.save();

    const token = generateToken(user._id.toString());
    res.json({ message: 'Account verified successfully', token, user });
  } catch (error) {
    res.status(500).json({ message: 'Error in verifyAccount', error });
  }
};

export const resendOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, type } = req.body; // type: 'verification' or 'reset'
    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      res.json({ message: 'If an account exists, a new code has been sent.' });
      return;
    }

    const otp = generateOtp();
    const expiry = new Date(Date.now() + (type === 'verification' ? 24 * 60 * 60 * 1000 : 10 * 60 * 1000));

    if (type === 'verification') {
      user.verificationCode = hashOtp(otp);
      user.verificationExpire = expiry;
    } else {
      user.resetPasswordToken = hashOtp(otp);
      user.resetPasswordExpire = expiry;
    }

    await user.save();

    const subject = type === 'verification' ? 'Verify your EduJobs Scholars Account' : 'Your EduJobs Scholars reset code';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="display: inline-block; background-color: #0ea5e9; color: white; padding: 10px 20px; border-radius: 8px; font-weight: bold; font-size: 24px;">EJ</div>
          <h1 style="color: #0f172a; margin-top: 10px;">EduJobs Scholars</h1>
        </div>
        <h2 style="color: #0ea5e9; text-align: center;">${type === 'verification' ? 'Account Verification' : 'Password Reset Code'}</h2>
        <p>Hello ${user.name},</p>
        <p>Use the following 6-character code for your request:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #f8fafc; color: #0ea5e9; padding: 20px; border-radius: 12px; border: 2px dashed #0ea5e9; font-size: 32px; font-weight: bold; letter-spacing: 8px; display: inline-block;">
            ${otp}
          </div>
        </div>
        <p style="color: #64748b; font-size: 14px; text-align: center;">This code will expire in ${type === 'verification' ? '24 hours' : '10 minutes'}.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b; text-align: center;">&copy; 2024 EduJobs Scholars. All rights reserved.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject,
        message: `Your code is: ${otp}`,
        html
      });

      res.json({ message: 'New code sent to your email.' });
    } catch (err) {
      if (type === 'verification') {
        user.verificationCode = undefined;
        user.verificationExpire = undefined;
      } else {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
      }
      await user.save();

      console.error('OTP email failed to send:', err);
      res.status(500).json({
        message: isDevelopment
          ? `Email could not be sent: ${err instanceof Error ? err.message : 'Unknown email error'}`
          : 'Email could not be sent',
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error in resendOTP', error });
  }
};

export const verifyResetCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ 
      email, 
      resetPasswordToken: hashOtp(otp),
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired verification code' });
      return;
    }

    res.json({ message: 'Code verified', success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error in verifyResetCode', error });
  }
};

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idToken, role } = req.body;
    
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      res.status(400).json({ message: 'Invalid Google token' });
      return;
    }

    const { sub, email, name, picture } = payload;

    // Check if user exists with googleId or email
    let user = await User.findOne({ 
      $or: [
        { googleId: sub },
        { email: email.toLowerCase() }
      ]
    });

    if (user) {
      // If user exists but doesn't have googleId, update it
      if (!user.googleId) {
        user.googleId = sub;
        user.avatar = picture;
        user.isVerified = true; // Google accounts are verified
        await user.save();
      }
    } else {
      // Create new user
      const allowedRoles = ['student', 'jobseeker'];
      const assignedRole = allowedRoles.includes(role) ? role : 'student';

      user = await User.create({
        name,
        email: email.toLowerCase(),
        googleId: sub,
        avatar: picture,
        role: assignedRole,
        isVerified: true, // Google accounts are verified
      });
    }

    const token = generateToken(user._id.toString());
    res.status(200).json({
      message: 'Google login successful',
      token,
      user
    });
  } catch (error: any) {
    console.error('Google Auth Error:', error.message || error);
    res.status(500).json({ message: 'Google authentication failed', error: error.message || 'Server error' });
  }
};
