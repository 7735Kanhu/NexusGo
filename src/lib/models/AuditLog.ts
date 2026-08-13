import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
  action: string;
  adminEmail: string;
  timestamp: Date;
  ipAddress?: string;
  oldValue?: any;
  newValue?: any;
  details?: string;
}

const AuditLogSchema: Schema = new Schema({
  action: { type: String, required: true },
  adminEmail: { type: String, default: 'admin@nexusgo.com' },
  timestamp: { type: Date, default: Date.now },
  ipAddress: { type: String, default: '127.0.0.1' },
  oldValue: { type: Schema.Types.Mixed },
  newValue: { type: Schema.Types.Mixed },
  details: { type: String, default: '' },
});

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
