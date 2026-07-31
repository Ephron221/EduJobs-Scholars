import mongoose, { Document, Schema } from 'mongoose';

export interface IStudentApplication extends Document {
  studentId?: mongoose.Types.ObjectId;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  opportunityId?: any;
  opportunityType: 'university' | 'job' | 'service';
  opportunityName: string;
  status: 'Interested' | 'Applied' | 'Submitted' | 'Accepted' | 'Rejected' | 'In Progress' | 'Resolved';
  notes: string;
  assignedAssistantId?: mongoose.Types.ObjectId;
  resolutionProof?: string;
  isDeletionRequested: boolean;
  deletionReason: string;
  appliedAt: Date;
  updatedAt: Date;
}

const StudentApplicationSchema = new Schema<IStudentApplication>({
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  studentPhone: { type: String, default: '' },
  opportunityId: { type: Schema.Types.String, required: false },
  opportunityType: { type: String, enum: ['university', 'job', 'service'], required: true },
  opportunityName: { type: String, required: true },
  status: {
    type: String,
    enum: ['Interested', 'Applied', 'Submitted', 'Accepted', 'Rejected', 'In Progress', 'Resolved'],
    default: 'Interested'
  },
  notes: { type: String, default: '' },
  assignedAssistantId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  resolutionProof: { type: String, default: '' },
  isDeletionRequested: { type: Boolean, default: false },
  deletionReason: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model<IStudentApplication>('StudentApplication', StudentApplicationSchema);
