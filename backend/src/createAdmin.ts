import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edujobs_scholars';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'esront21@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!';

const createAdmin = async () => {
  try {
    await mongoose.connect(MONGODB_URI);

    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL }).select('+password');
    if (existingAdmin) {
      existingAdmin.name = existingAdmin.name || 'EduJobs Admin';
      existingAdmin.password = ADMIN_PASSWORD;
      existingAdmin.role = 'admin';
      existingAdmin.isVerified = true;
      existingAdmin.isActive = true;
      await existingAdmin.save();
    } else {
      await User.create({
        name: 'EduJobs Admin',
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'admin',
        isVerified: true,
        isActive: true,
      });
    }

    console.log(`Admin ready: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to create admin:', error);
    process.exit(1);
  }
};

createAdmin();
