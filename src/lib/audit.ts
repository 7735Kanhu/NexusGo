import { connectDB } from '@/lib/db';
import { AuditLog } from '@/lib/models/AuditLog';

export async function logAudit(params: {
  action: string;
  adminEmail?: string;
  details?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
}) {
  try {
    await connectDB();
    await AuditLog.create({
      action: params.action,
      adminEmail: params.adminEmail || 'admin@nexusgo.com',
      details: params.details || '',
      oldValue: params.oldValue,
      newValue: params.newValue,
      ipAddress: params.ipAddress || '127.0.0.1',
      timestamp: new Date(),
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}
