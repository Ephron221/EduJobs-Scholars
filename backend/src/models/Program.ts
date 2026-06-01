import mongoose, { Document, Schema } from 'mongoose';

export interface IProgram extends Document {
  universityId: mongoose.Types.ObjectId;
  name: string;
  requirements: string;
  deadline: Date;
  applicationLink: string;
  fieldOfStudy: string;
  duration: string;
  tuitionFee: string;
  level: 'undergraduate' | 'postgraduate' | 'diploma' | 'certificate';
  fundingType: 'scholarship' | 'partial_scholarship' | 'study_loan' | 'self_sponsored';
  createdAt: Date;
}

const ProgramSchema = new Schema<IProgram>({
  universityId: { type: Schema.Types.ObjectId, ref: 'University', required: true },
  name: { type: String, required: true, trim: true },
  requirements: { type: String, required: true },
  deadline: { type: Date, required: true },
  applicationLink: { type: String, required: true },
  fieldOfStudy: { type: String, required: true },
  duration: { type: String, required: true },
  tuitionFee: { type: String, default: 'Not specified' },
  level: { type: String, enum: ['undergraduate', 'postgraduate', 'diploma', 'certificate'], default: 'undergraduate' },
  fundingType: {
    type: String,
    enum: ['scholarship', 'partial_scholarship', 'study_loan', 'self_sponsored'],
    default: 'self_sponsored',
  },
}, { timestamps: true });

ProgramSchema.index({ name: 'text', fieldOfStudy: 'text', requirements: 'text' });

export default mongoose.model<IProgram>('Program', ProgramSchema);
