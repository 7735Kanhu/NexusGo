import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IIncentiveRule extends Document {
  minDeliveries: number;
  bonusAmount: number;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const IncentiveRuleSchema: Schema = new Schema(
  {
    minDeliveries: { type: Number, required: true },
    bonusAmount: { type: Number, required: true },
    description: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const IncentiveRule: Model<IIncentiveRule> =
  mongoose.models.IncentiveRule ||
  mongoose.model<IIncentiveRule>('IncentiveRule', IncentiveRuleSchema);
