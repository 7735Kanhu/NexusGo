import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICompanySetting extends Document {
  companyName: string;
  companyRate: number;
  driverCommission: number;
  dailyTarget: number;
  operatingDaysPerMonth: number;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  gstNo?: string;
  receiptHeader?: string;
  receiptFooter?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySettingSchema: Schema = new Schema(
  {
    companyName: { type: String, default: 'NexusGo Logistics' },
    companyRate: { type: Number, default: 18 },
    driverCommission: { type: Number, default: 13 },
    dailyTarget: { type: Number, default: 330 },
    operatingDaysPerMonth: { type: Number, default: 26 },
    companyAddress: { type: String, default: 'Plot 42, Logistics Park, Sector 18, City' },
    companyPhone: { type: String, default: '+91 98765 43210' },
    companyEmail: { type: String, default: 'contact@nexusgo.com' },
    gstNo: { type: String, default: '22AAAAA0000A1Z5' },
    receiptHeader: { type: String, default: 'NexusGo Delivery Payout Receipt' },
    receiptFooter: { type: String, default: 'Thank you for your dedicated logistics service!' },
  },
  { timestamps: true }
);

export const CompanySetting: Model<ICompanySetting> =
  mongoose.models.CompanySetting ||
  mongoose.model<ICompanySetting>('CompanySetting', CompanySettingSchema);
