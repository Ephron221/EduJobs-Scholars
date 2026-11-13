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
  status: 'admitted' | 'active' | 'pending' | 'suspended' | 'graduated' | 'rejected' | 'not_admitted' | string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  documents: {
    name: string;
    url: string;
    category: 'nationalId' | 'passportPhoto' | 'diploma' | 'other';
    uploadedAt: Date;
  }[];
  admissionDecision?: string;
  decisionRemarks?: string;
  decisionSentAt?: Date;
  decisionSentBy?: string;
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
      enum: ['admitted', 'active', 'pending', 'suspended', 'graduated', 'rejected', 'not_admitted', 'Not Admitted / Not Accepted', 'Rejected', 'Admitted'],
      default: 'pending',
    },
    guardianName: { type: String, trim: true, default: '' },
    guardianPhone: { type: String, trim: true, default: '' },
    guardianEmail: { type: String, trim: true, default: '' },
    documents: [{
      name: { type: String, required: true },
      url: { type: String, required: true },
      category: { type: String, enum: ['nationalId', 'passportPhoto', 'diploma', 'other'], default: 'other' },
      uploadedAt: { type: Date, default: Date.now },
    }],
    admissionDecision: { type: String, default: 'Admitted' },
    decisionRemarks: { type: String, default: '' },
    decisionSentAt: { type: Date },
    decisionSentBy: { type: String, default: '' },
  },
  { timestamps: true }
);

StudentSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

StudentSchema.pre('findOneAndUpdate', async function () {
  const update = this.getUpdate() as Record<string, any> | null;
  const password = update?.password || update?.$set?.password;
  if (!password || password.startsWith('$2a$') || password.startsWith('$2b$')) return;
  const hashed = await bcrypt.hash(password, 12);
  if (update?.$set?.password) {
    update.$set.password = hashed;
  } else if (update) {
    update.password = hashed;
  }
});

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
    delete (ret as any).password;
    return ret;
  },
});

export default mongoose.model<IStudent>('Student', StudentSchema);
