import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPaymentTransaction extends Document {
  paymentId: mongoose.Types.ObjectId;
  deliveryBoyId: mongoose.Types.ObjectId;
  date: string;
  amount: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'UPI';
  transactionId?: string;
  reference?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentTransactionSchema: Schema = new Schema(
  {
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment', required: true },
    deliveryBoyId: { type: Schema.Types.ObjectId, ref: 'DeliveryBoy', required: true },
    date: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'BANK_TRANSFER', 'UPI'],
      default: 'UPI',
    },
    transactionId: { type: String, default: '' },
    reference: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const PaymentTransaction: Model<IPaymentTransaction> =
  mongoose.models.PaymentTransaction ||
  mongoose.model<IPaymentTransaction>('PaymentTransaction', PaymentTransactionSchema);
