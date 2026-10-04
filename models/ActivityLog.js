import mongoose from 'mongoose';
const ActivityLogSchema = new mongoose.Schema({
  actorName: { type: String, default: 'Unknown user' },
  actorEmail: { type: String, default: '' },
  role: { type: String, default: '' },
  orderId: { type: String, default: '' },
  rowNumber: Number,
  field: { type: String, default: '' },
  oldValue: { type: String, default: '' },
  newValue: { type: String, default: '' },
  action: { type: String, enum: ['CREATE','UPDATE','DELETE'], default: 'UPDATE' },
  source: { type: String, enum: ['Web App','Google Sheet'], default: 'Web App' },
}, { timestamps: true });
export default mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema);
