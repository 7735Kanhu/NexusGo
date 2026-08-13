import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPayment extends Document {
  deliveryBoyId: mongoose.Types.ObjectId;
  month: string; // YYYY-MM
  totalSuccessfulDeliveries: number;
  commissionRate: number;
  grossCommission: number;
  bonus: number;
  approvedExpenses: number;
  advances: number;
  deductions: number;
  netPayable: number;
  alreadyPaid: number;
  remaining: number;
  status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID';
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema(
  {
    deliveryBoyId: { type: Schema.Types.ObjectId, ref: 'DeliveryBoy', required: true },
    month: { type: String, required: true, index: true },
    totalSuccessfulDeliveries: { type: Number, default: 0 },
    commissionRate: { type: Number, default: 13 },
    grossCommission: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    approvedExpenses: { type: Number, default: 0 },
    advances: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netPayable: { type: Number, default: 0 },
    alreadyPaid: { type: Number, default: 0 },
    remaining: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['PENDING', 'PARTIALLY_PAID', 'PAID'],
      default: 'PENDING',
    },
  },
  { timestamps: true }
);

PaymentSchema.index({ deliveryBoyId: 1, month: 1 }, { unique: true });

export const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
