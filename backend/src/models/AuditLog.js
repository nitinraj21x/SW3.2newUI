import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action:     { type: String, required: true },
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName:   { type: String, default: '' },
  userRole:   { type: String, default: '' },
  targetId:   { type: mongoose.Schema.Types.Mixed, default: null },
  targetName: { type: String, default: '' },
  detail:     { type: String, default: '' },
  ip:         { type: String, default: '' },
  timestamp:  { type: Date, default: Date.now },
}, { timestamps: false });

auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ action: 1 });

export default mongoose.model('AuditLog', auditLogSchema);
