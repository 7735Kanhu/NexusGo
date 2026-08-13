import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Payment } from '@/lib/models/Payment';
import { PaymentTransaction } from '@/lib/models/PaymentTransaction';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { paymentId, deliveryBoyId, month, amount, paymentMethod, transactionId, reference, notes } = await req.json();

    const payAmount = Number(amount);
    if (!payAmount || payAmount <= 0) {
      return NextResponse.json({ error: 'Valid payment amount is required' }, { status: 400 });
    }

    let payment = paymentId ? await Payment.findById(paymentId) : null;
    if (!payment && deliveryBoyId && month) {
      payment = await Payment.findOne({ deliveryBoyId, month });
    }

    if (!payment) {
      return NextResponse.json({ error: 'Payment summary record not found' }, { status: 404 });
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
    payment.alreadyPaid += payAmount;
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
