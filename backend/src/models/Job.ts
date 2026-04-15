import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
  title: string;
  company: string;
  type: 'job' | 'internship' | 'volunteering' | 'government';
  requirements: string;
  deadline: Date;
  link: string;
  location: string;
  fieldOfStudy: string;
  salary: string;
  description: string;
  featured: boolean;
  postedAt: Date;
  images: string[];     // uploaded image paths/URLs (e.g. company banner/logo)
  documents: { name: string; url: string; uploadedAt: Date }[];  // uploaded PDFs (e.g. job description doc)
}

const JobSchema = new Schema<IJob>({
  title: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  type: { type: String, enum: ['job', 'internship', 'volunteering', 'government'], required: true },
  requirements: { type: String, required: true },
  deadline: { type: Date, required: true },
  link: { type: String, required: true },
  location: { type: String, required: true },
  fieldOfStudy: { type: String, default: 'General' },
  salary: { type: String, default: 'Not specified' },
  description: { type: String, default: '' },
  featured: { type: Boolean, default: false },
  postedAt: { type: Date, default: Date.now },
  images: [{ type: String }],
  documents: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

JobSchema.index({ title: 'text', company: 'text', location: 'text', requirements: 'text' });

export default mongoose.model<IJob>('Job', JobSchema);
