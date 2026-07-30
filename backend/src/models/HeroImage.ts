import mongoose, { Document, Schema } from 'mongoose';

export interface IHeroImage extends Document {
  imageUrl: string;
  altText: string;
  category: 'graduation' | 'workers';
  university?: string; // For graduation images
  country?: string; // For workers images
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HeroImageSchema = new Schema<IHeroImage>({
  imageUrl: { type: String, required: true },
  altText: { type: String, required: true },
  category: { type: String, required: true },
  university: { type: String },
  country: { type: String },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<IHeroImage>('HeroImage', HeroImageSchema);