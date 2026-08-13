import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAttendance extends Document {
  deliveryBoyId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE' | 'WEEKLY_OFF';
  loginTime?: string;
  logoutTime?: string;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema: Schema = new Schema(
  {
    deliveryBoyId: { type: Schema.Types.ObjectId, ref: 'DeliveryBoy', required: true },
    date: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE', 'WEEKLY_OFF'],
      required: true,
      default: 'PRESENT',
    },
    loginTime: { type: String, default: '' },
    logoutTime: { type: String, default: '' },
    remarks: { type: String, default: '' },
  },
  { timestamps: true }
);

AttendanceSchema.index({ deliveryBoyId: 1, date: 1 }, { unique: true });

export const Attendance: Model<IAttendance> =
  mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema);
