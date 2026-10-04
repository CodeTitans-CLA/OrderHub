import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, default: '' },
  role: { type: String, enum: ['Admin', 'User'], default: 'User' },
  googleSub: { type: String, default: '', index: true },
  picture: { type: String, default: '' },
  sheetName: { type: String, default: '' },
  monthlyTarget: { type: Number, default: 1100 },
  emailVerified: { type: Boolean, default: false },
  verifyTokenHash: { type: String, default: '' },
  verifyExpires: { type: Date, default: null },
  resetTokenHash: { type: String, default: '' },
  resetExpires: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
