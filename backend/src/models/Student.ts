import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IStudent extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  registrationNumber: string;
  password: string;
  trackingCode: string;
  dateOfBirth: Date;
  gender: 'Male' | 'Female' | 'Other';
  nationalId: string;
  address: string;
  level: string;
  institution: string;
  admissionDate: Date;
  status: 'active' | 'pending' | 'suspended' | 'graduated';
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  documents: string[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const StudentSchema = new Schema<IStudent>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phoneNumber: { type: String, trim: true, default: '' },
    registrationNumber: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    trackingCode: { type: String, trim: true, default: '' },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    nationalId: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    level: { type: String, required: true, trim: true },
    institution: { type: String, trim: true, default: '' },
    admissionDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['active', 'pending', 'suspended', 'graduated'],
      default: 'pending',
    },
    guardianName: { type: String, trim: true, default: '' },
    guardianPhone: { type: String, trim: true, default: '' },
    guardianEmail: { type: String, trim: true, default: '' },
    documents: [{ type: String }],
  },
  { timestamps: true }
);

// Password hashing removed to keep passwords/PINs in plain text
// StudentSchema.pre('save', async function () {
//   if (!this.isModified('password')) return;
//   this.password = await bcrypt.hash(this.password, 12);
// });

StudentSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
    return bcrypt.compare(candidatePassword, this.password);
  }
  // Plain text fallback if the password is unhashed
  return candidatePassword === this.password;
};

StudentSchema.set('toJSON', {
  transform: (_doc, ret) => {
    return ret;
  },
});

export default mongoose.model<IStudent>('Student', StudentSchema);
