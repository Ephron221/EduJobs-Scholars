import mongoose, { Document, Schema } from 'mongoose';

export interface ISuccessStory extends Document {
  type: 'student' | 'worker';
  fullName: string;
  profileImage: string;
  howTheyKnew: string;
  howHelped: string;
  university?: string; // For students
  jobTitle?: string; // For workers
  country: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const SuccessStorySchema = new Schema<ISuccessStory>({
  type: { type: String, enum: ['student', 'worker'], required: true },
  fullName: { type: String, required: true },
  profileImage: { type: String, required: true },
  howTheyKnew: { type: String, required: true },
  howHelped: { type: String, required: true },
  university: { type: String },
  jobTitle: { type: String },
  country: { type: String },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model<ISuccessStory>('SuccessStory', SuccessStorySchema);