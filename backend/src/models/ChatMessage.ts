import mongoose, { Document, Schema } from 'mongoose';

export interface IChatMessage extends Document {
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  content: string;
  isRead: boolean;
  pendingDeletion: boolean;
  deletionRequestedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  pendingDeletion: { type: Boolean, default: false },
  deletionRequestedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

// Add index for fast querying of conversations
ChatMessageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

export default mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
