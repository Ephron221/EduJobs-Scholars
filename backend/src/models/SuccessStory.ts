import mongoose, { Document, Schema } from 'mongoose';

export interface ISuccessStory extends Document {
  type: string; 
  fullName: string;
  profileImage: string;
  howTheyKnow: string; // Changed from howTheyKnew
  howHelped: string;
  university?: string;
  jobTitle?: string;
  country: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const SuccessStorySchema = new Schema<ISuccessStory>({
  type: { type: String, required: true },
  fullName: { type: String, required: true },
  profileImage: { type: String, required: true },
  howTheyKnow: { type: String, required: true },
  howHelped: { type: String, required: true },
  university: { type: String },
  jobTitle: { type: String },
  country: { type: String },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model<ISuccessStory>('SuccessStory', SuccessStorySchema);