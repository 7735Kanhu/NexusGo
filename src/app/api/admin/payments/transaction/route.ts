import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { Payment } from '@/lib/models/Payment';
import { PaymentTransaction } from '@/lib/models/PaymentTransaction';
import { DeliveryBoy } from '@/lib/models/DeliveryBoy';
import { Delivery } from '@/lib/models/Delivery';
import { Advance } from '@/lib/models/Advance';
import { Expense } from '@/lib/models/Expense';
import { IncentiveRule } from '@/lib/models/IncentiveRule';
import { logAudit } from '@/lib/audit';

async function getOrCreatePayment(deliveryBoyId: string, month: string) {
  let payment = await Payment.findOne({ deliveryBoyId, month });
  if (payment) return payment;

  const driver = await DeliveryBoy.findById(deliveryBoyId);
  if (!driver) return null;

  const monthlyDeliveries = await Delivery.find({
    deliveryBoyId: driver._id,
    date: { $regex: `^${month}` },
    status: 'SUCCESSFUL',
  });
  const totalSuccessfulDeliveries = monthlyDeliveries.length;
  const commRate = driver.defaultCommission || 13;
  const isSalary = driver.paymentType === 'SALARY';
  const grossCommission = isSalary
    ? (driver.monthlySalary || 15000)
    : totalSuccessfulDeliveries * commRate;

  const incentiveRules = await IncentiveRule.find({ isActive: true }).sort({ minDeliveries: -1 });
  let calculatedBonus = 0;
  for (const rule of incentiveRules) {
    if (totalSuccessfulDeliveries >= rule.minDeliveries) {
      calculatedBonus = rule.bonusAmount;
      break;
    }
  }

  const monthlyAdvances = await Advance.find({
    deliveryBoyId: driver._id,
    date: { $regex: `^${month}` },
  });
  const advancesSum = monthlyAdvances.reduce((acc: number, a: any) => acc + (a.amount || 0), 0);

  const monthlyExpenses = await Expense.find({
    relatedDeliveryBoyId: driver._id,
    date: { $regex: `^${month}` },
  });
  const approvedExpensesSum = monthlyExpenses.reduce((acc: number, e: any) => acc + (e.amount || 0), 0);

  const netPayable = grossCommission + calculatedBonus + approvedExpensesSum - advancesSum;

  try {
    payment = await Payment.create({
      deliveryBoyId: driver._id,
      month,
      totalSuccessfulDeliveries,
      commissionRate: commRate,
      grossCommission,
      bonus: calculatedBonus,
      approvedExpenses: approvedExpensesSum,
      advances: advancesSum,
      deductions: 0,
      netPayable,
      alreadyPaid: 0,
      remaining: Math.max(0, netPayable),
      status: 'PENDING',
    });
  } catch (err: any) {
    // Fallback if record was created concurrently
    payment = await Payment.findOne({ deliveryBoyId: driver._id, month });
  }

  return payment;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { paymentId, deliveryBoyId, month, amount, paymentMethod, transactionId, reference, notes } = await req.json();

    const payAmount = Number(amount);
    if (!payAmount || payAmount <= 0) {
      return NextResponse.json({ error: 'Valid payment amount is required' }, { status: 400 });
    }

    let payment = null;
    if (paymentId && mongoose.Types.ObjectId.isValid(paymentId)) {
      payment = await Payment.findById(paymentId);
    }

    if (!payment && deliveryBoyId && month) {
      payment = await getOrCreatePayment(deliveryBoyId, month);
    }

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment summary record not found for the specified driver and month' },
        { status: 404 }
      );
    }

    // Record individual transaction
    const tx = await PaymentTransaction.create({
      paymentId: payment._id,
      deliveryBoyId: payment.deliveryBoyId,
      date: new Date().toISOString().split('T')[0],
      amount: payAmount,
      paymentMethod: paymentMethod || 'UPI',
      transactionId: transactionId || '',
      reference: reference || '',
      notes: notes || '',
    });

    // Update payment rollup
    payment.alreadyPaid = (payment.alreadyPaid || 0) + payAmount;
    payment.remaining = Math.max(0, payment.netPayable - payment.alreadyPaid);
    payment.status = payment.alreadyPaid >= payment.netPayable ? 'PAID' : 'PARTIALLY_PAID';
    await payment.save();

    await logAudit({
      action: 'RECORD_PAYMENT_TRANSACTION',
      details: `Paid ₹${payAmount} via ${paymentMethod || 'UPI'} for Payment ID ${payment._id}`,
      newValue: tx.toObject(),
    });

    return NextResponse.json({
      success: true,
      message: `Payment transaction of ₹${payAmount} recorded successfully.`,
      transaction: tx,
      payment,
    });
  } catch (error: any) {
    console.error('Payment transaction error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

