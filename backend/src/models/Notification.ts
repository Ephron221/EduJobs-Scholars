import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId | null;
  isGlobal: boolean;
  title: string;
  message: string;
  type: 'deadline' | 'new_opportunity' | 'status_update' | 'announcement' | 'system';
  isRead: boolean;
  readBy: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  isGlobal: { type: Boolean, default: false },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['deadline', 'new_opportunity', 'status_update', 'announcement', 'system'],
    default: 'system'
  },
  isRead: { type: Boolean, default: false },
  readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

export default mongoose.model<INotification>('Notification', NotificationSchema);
