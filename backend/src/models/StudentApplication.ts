import mongoose, { Document, Schema } from 'mongoose';

export interface IStudentApplication extends Document {
  studentId: mongoose.Types.ObjectId;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  opportunityId: mongoose.Types.ObjectId;
  opportunityType: 'university' | 'job';
  opportunityName: string;
  status: 'Interested' | 'Applied' | 'Submitted' | 'Accepted' | 'Rejected';
  notes: string;
  appliedAt: Date;
  updatedAt: Date;
}

const StudentApplicationSchema = new Schema<IStudentApplication>({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  studentPhone: { type: String, default: '' },
  opportunityId: { type: Schema.Types.ObjectId, required: false },
  opportunityType: { type: String, enum: ['university', 'job'], required: true },
  opportunityName: { type: String, required: true },
  status: {
    type: String,
    enum: ['Interested', 'Applied', 'Submitted', 'Accepted', 'Rejected'],
    default: 'Interested'
  },
  notes: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model<IStudentApplication>('StudentApplication', StudentApplicationSchema);
