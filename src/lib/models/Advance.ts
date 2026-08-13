import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdvance extends Document {
  deliveryBoyId: mongoose.Types.ObjectId;
  amount: number;
  date: string;
  reason?: string;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'UPI';
  reference?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdvanceSchema: Schema = new Schema(
  {
    deliveryBoyId: { type: Schema.Types.ObjectId, ref: 'DeliveryBoy', required: true },
    amount: { type: Number, required: true },
    date: { type: String, required: true },
    reason: { type: String, default: '' },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'BANK_TRANSFER', 'UPI'],
      default: 'CASH',
    },
    reference: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Advance: Model<IAdvance> =
  mongoose.models.Advance || mongoose.model<IAdvance>('Advance', AdvanceSchema);
