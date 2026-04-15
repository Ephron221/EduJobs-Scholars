import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import Student from './models/Student';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/edujobs_scholars';

const seedStudents = async () => {
  try {
    const rawData = fs.readFileSync(path.join(__dirname, '../students53.json'), 'utf-8');
    const studentsData = JSON.parse(rawData);

    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for student seeding...');

    // Clear existing students
    await Student.deleteMany({});
    console.log('Existing students cleared.');

    // Seed students
    for (let student of studentsData) {
      if (student._id && student._id.$oid) {
        student._id = new mongoose.Types.ObjectId(student._id.$oid);
      }
      if (student.dateOfBirth && student.dateOfBirth.$date) {
        student.dateOfBirth = new Date(student.dateOfBirth.$date);
      }
      if (student.admissionDate && student.admissionDate.$date) {
        student.admissionDate = new Date(student.admissionDate.$date);
      }
      if (student.createdAt && student.createdAt.$date) {
        student.createdAt = new Date(student.createdAt.$date);
      }
      if (student.updatedAt && student.updatedAt.$date) {
        student.updatedAt = new Date(student.updatedAt.$date);
      }
      await Student.create(student);
    }
    
    console.log(`Successfully seeded ${studentsData.length} students!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding students:', error);
    process.exit(1);
  }
};

seedStudents();
