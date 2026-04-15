import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'admin' | 'jobseeker';
  savedOpportunities: { id: string; type: 'university' | 'job' }[];
  isActive: boolean;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  isVerified: boolean;
  verificationCode?: string;
  verificationExpire?: Date;
  googleId?: string;
  avatar?: string;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { 
    type: String, 
    required: function(this: any) { return !this.googleId; },
    minlength: 6 
  },
  googleId: { type: String, unique: true, sparse: true },
  avatar: String,
  role: { type: String, enum: ['student', 'admin', 'jobseeker'], default: 'student' },
  savedOpportunities: [{
    id: { type: String },
    type: { type: String, enum: ['university', 'job'] }
  }],
  isActive: { type: Boolean, default: true },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  isVerified: { type: Boolean, default: false },
  verificationCode: String,
  verificationExpire: Date,
}, { timestamps: true });

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete (ret as any).password;
    return ret;
  }
});

export default mongoose.model<IUser>('User', UserSchema);
