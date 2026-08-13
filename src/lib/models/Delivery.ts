import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDelivery extends Document {
  parcelId: string;
  deliveryBoyId?: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  customerName?: string;
  customerPhone?: string;
  address?: string;
  area?: string;
  pincode?: string;
  codAmount: number;
  status: 'ASSIGNED' | 'OUT_FOR_DELIVERY' | 'SUCCESSFUL' | 'FAILED' | 'REATTEMPT';
  deliveryTime?: string;
  remarks?: string;
  companyRate: number;
  driverCommission: number;
  grossMargin: number;
  createdAt: Date;
  updatedAt: Date;
}

const DeliverySchema: Schema = new Schema(
  {
    parcelId: { type: String, required: true, unique: true, trim: true },
    deliveryBoyId: { type: Schema.Types.ObjectId, ref: 'DeliveryBoy' },
    date: { type: String, required: true, index: true },
    customerName: { type: String, default: '' },
    customerPhone: { type: String, default: '' },
    address: { type: String, default: '' },
    area: { type: String, default: '' },
    pincode: { type: String, default: '' },
    codAmount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['ASSIGNED', 'OUT_FOR_DELIVERY', 'SUCCESSFUL', 'FAILED', 'REATTEMPT'],
      default: 'ASSIGNED',
    },
    deliveryTime: { type: String, default: '' },
    remarks: { type: String, default: '' },
    companyRate: { type: Number, default: 18 },
    driverCommission: { type: Number, default: 13 },
    grossMargin: { type: Number, default: 5 },
  },
  { timestamps: true }
);

export const Delivery: Model<IDelivery> =
  mongoose.models.Delivery || mongoose.model<IDelivery>('Delivery', DeliverySchema);
