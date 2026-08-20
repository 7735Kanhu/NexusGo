import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDeliveryBoy extends Document {
  deliveryBoyId: string;
  fhrId?: string;
  fullName: string;
  email?: string;
  photo?: string;
  phone: string;
  dob?: string;
  address?: string;
  emergencyContact?: string;
  joiningDate: string;
  kyc: {
    aadhaarNumber?: string;
    panNumber?: string;
    aadhaarDocument?: string;
    panDocument?: string;
    photoDocument?: string;
  };
  driving: {
    licenceNumber?: string;
    licenceExpiry?: string;
    licenceDocument?: string;
    vehicleNumber?: string;
    vehicleType?: string;
  };
  bank: {
    accountHolderName?: string;
    bankName?: string;
    accountNumber?: string;
    ifsc?: string;
    upiId?: string;
  };
  paymentType: 'COMMISSION' | 'SALARY';
  defaultCommission: number;
  monthlySalary: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryBoySchema: Schema = new Schema(
  {
    deliveryBoyId: { type: String, required: true, unique: true, trim: true },
    fhrId: { type: String, default: '', trim: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, default: '', lowercase: true, trim: true },
    photo: { type: String, default: '' },
    phone: { type: String, required: true, trim: true },
    dob: { type: String, default: '' },
    address: { type: String, default: '' },
    emergencyContact: { type: String, default: '' },
    joiningDate: { type: String, required: true },
    kyc: {
      aadhaarNumber: { type: String, default: '' },
      panNumber: { type: String, default: '' },
      aadhaarDocument: { type: String, default: '' },
      panDocument: { type: String, default: '' },
      photoDocument: { type: String, default: '' },
    },
    driving: {
      licenceNumber: { type: String, default: '' },
      licenceExpiry: { type: String, default: '' },
      licenceDocument: { type: String, default: '' },
      vehicleNumber: { type: String, default: '' },
      vehicleType: { type: String, default: 'Bike' },
    },
    bank: {
      accountHolderName: { type: String, default: '' },
      bankName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      ifsc: { type: String, default: '' },
      upiId: { type: String, default: '' },
    },
    paymentType: { type: String, enum: ['COMMISSION', 'SALARY'], default: 'COMMISSION' },
    defaultCommission: { type: Number, default: 13 },
    monthlySalary: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

export const DeliveryBoy: Model<IDeliveryBoy> =
  mongoose.models.DeliveryBoy || mongoose.model<IDeliveryBoy>('DeliveryBoy', DeliveryBoySchema);
