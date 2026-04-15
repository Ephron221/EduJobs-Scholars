import mongoose, { Document, Schema } from 'mongoose';

export interface IUniversity extends Document {
  name: string;
  country: string;
  website: string;
  description: string;
  logoUrl: string;
  featured: boolean;
  images: string[];      // uploaded image paths/URLs
  documents: { name: string; url: string; uploadedAt: Date }[];  // uploaded PDFs
  createdAt: Date;
}

const UniversitySchema = new Schema<IUniversity>({
  name: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
  website: { type: String, required: true },
  description: { type: String, required: true },
  logoUrl: { type: String, default: '' },
  featured: { type: Boolean, default: false },
  images: [{ type: String }],
  documents: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

UniversitySchema.index({ name: 'text', country: 'text', description: 'text' });

export default mongoose.model<IUniversity>('University', UniversitySchema);
