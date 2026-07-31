import mongoose, { Document, Schema } from 'mongoose';

export interface IService extends Document {
  title: string;
  iconName: string; // e.g. "GraduationCap", "Landmark", etc.
  features: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>({
  title: { type: String, required: true, trim: true },
  iconName: { type: String, required: true, default: 'GraduationCap' },
  features: [{ type: String, required: true }],
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model<IService>('Service', ServiceSchema);
