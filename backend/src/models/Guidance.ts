import mongoose, { Document, Schema } from 'mongoose';

export interface IGuidance extends Document {
  title: string;
  category: 'university_applications' | 'cv_writing' | 'career_development' | 'interview_prep' | 'scholarships' | 'general';
  content: string;
  resourceLink: string;
  tags: string[];
  readTime: number;
  featured: boolean;
  createdAt: Date;
}

const GuidanceSchema = new Schema<IGuidance>({
  title: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['university_applications', 'cv_writing', 'career_development', 'interview_prep', 'scholarships', 'general'],
    required: true
  },
  content: { type: String, required: true },
  resourceLink: { type: String, default: '' },
  tags: [{ type: String }],
  readTime: { type: Number, default: 5 },
  featured: { type: Boolean, default: false },
}, { timestamps: true });

GuidanceSchema.index({ title: 'text', content: 'text', category: 'text' });

export default mongoose.model<IGuidance>('Guidance', GuidanceSchema);
