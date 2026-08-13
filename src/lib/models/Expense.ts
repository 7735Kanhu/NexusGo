import mongoose, { Schema, Document, Model } from 'mongoose';

export type ExpenseCategory =
  | 'FUEL'
  | 'PARKING'
  | 'TOLL'
  | 'VEHICLE_REPAIR'
  | 'OFFICE'
  | 'MOBILE'
  | 'SALARY'
  | 'MAINTENANCE'
  | 'OTHER';

export interface IExpense extends Document {
  date: string;
  category: ExpenseCategory;
  amount: number;
  description?: string;
  receipt?: string;
  relatedDeliveryBoyId?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema: Schema = new Schema(
  {
    date: { type: String, required: true, index: true },
    category: {
      type: String,
      enum: [
        'FUEL',
        'PARKING',
        'TOLL',
        'VEHICLE_REPAIR',
        'OFFICE',
        'MOBILE',
        'SALARY',
        'MAINTENANCE',
        'OTHER',
      ],
      required: true,
    },
    amount: { type: Number, required: true },
    description: { type: String, default: '' },
    receipt: { type: String, default: '' },
    relatedDeliveryBoyId: { type: Schema.Types.ObjectId, ref: 'DeliveryBoy' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Expense: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);
