import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Payment } from '@/lib/models/Payment';
import { DeliveryBoy } from '@/lib/models/DeliveryBoy';
import { Delivery } from '@/lib/models/Delivery';
import { Advance } from '@/lib/models/Advance';
import { Expense } from '@/lib/models/Expense';
import { IncentiveRule } from '@/lib/models/IncentiveRule';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const now = new Date();
    const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const month = searchParams.get('month') || defaultMonth;

    const drivers = await DeliveryBoy.find({ status: 'ACTIVE' }).sort({ deliveryBoyId: 1 });
    const incentiveRules = await IncentiveRule.find({ isActive: true }).sort({ minDeliveries: -1 });

    const results = await Promise.all(
      drivers.map(async (driver) => {
        // 1. Existing payment record for month
        let paymentRecord = await Payment.findOne({
          deliveryBoyId: driver._id,
          month,
        });

        // 2. Compute dynamic stats from DB
        const monthlyDeliveries = await Delivery.find({
          deliveryBoyId: driver._id,
          date: { $regex: `^${month}` },
          status: 'SUCCESSFUL',
        });
        const totalSuccessfulDeliveries = monthlyDeliveries.length;

        const commRate = driver.defaultCommission || 13;
        const grossCommission = totalSuccessfulDeliveries * commRate;

        // Auto calculate bonus based on incentive rules
        let calculatedBonus = 0;
        for (const rule of incentiveRules) {
          if (totalSuccessfulDeliveries >= rule.minDeliveries) {
            calculatedBonus = rule.bonusAmount;
            break;
          }
        }

        // Fetch driver advances for month
        const monthlyAdvances = await Advance.find({
          deliveryBoyId: driver._id,
          date: { $regex: `^${month}` },
        });
        const advancesSum = monthlyAdvances.reduce((acc, a) => acc + (a.amount || 0), 0);

        // Fetch driver expenses for month
        const monthlyExpenses = await Expense.find({
          relatedDeliveryBoyId: driver._id,
          date: { $regex: `^${month}` },
        });
        const approvedExpensesSum = monthlyExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);

        const bonus = paymentRecord ? paymentRecord.bonus : calculatedBonus;
        const deductions = paymentRecord ? paymentRecord.deductions : 0;
        const approvedExpenses = paymentRecord ? paymentRecord.approvedExpenses : approvedExpensesSum;
        const advances = paymentRecord ? paymentRecord.advances : advancesSum;

        const netPayable = grossCommission + bonus + approvedExpenses - advances - deductions;
        const alreadyPaid = paymentRecord ? paymentRecord.alreadyPaid : 0;
        const remaining = netPayable - alreadyPaid;
        const status = alreadyPaid >= netPayable && netPayable > 0 ? 'PAID' : alreadyPaid > 0 ? 'PARTIALLY_PAID' : 'PENDING';

        return {
          driver,
          month,
          totalSuccessfulDeliveries,
          commissionRate: commRate,
          grossCommission,
          bonus,
          approvedExpenses,
          advances,
          deductions,
          netPayable,
          alreadyPaid,
          remaining: Math.max(0, remaining),
          status,
          paymentRecordId: paymentRecord ? paymentRecord._id : null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      month,
      list: results,
    });
  } catch (error: any) {
    console.error('Fetch payments error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { deliveryBoyId, month, bonus, approvedExpenses, advances, deductions } = await req.json();

    if (!deliveryBoyId || !month) {
      return NextResponse.json({ error: 'Delivery Boy ID and month are required' }, { status: 400 });
    }

    const driver = await DeliveryBoy.findById(deliveryBoyId);
    if (!driver) {
      return NextResponse.json({ error: 'Delivery boy not found' }, { status: 404 });
    }

    const monthlyDeliveries = await Delivery.find({
      deliveryBoyId: driver._id,
      date: { $regex: `^${month}` },
      status: 'SUCCESSFUL',
    });
    const totalSuccessfulDeliveries = monthlyDeliveries.length;
    const commRate = driver.defaultCommission || 13;
    const grossCommission = totalSuccessfulDeliveries * commRate;

    const bAmount = Number(bonus || 0);
    const eAmount = Number(approvedExpenses || 0);
    const aAmount = Number(advances || 0);
    const dAmount = Number(deductions || 0);

    const netPayable = grossCommission + bAmount + eAmount - aAmount - dAmount;

    let payment = await Payment.findOne({ deliveryBoyId: driver._id, month });

    if (payment) {
      payment.totalSuccessfulDeliveries = totalSuccessfulDeliveries;
      payment.commissionRate = commRate;
      payment.grossCommission = grossCommission;
      payment.bonus = bAmount;
      payment.approvedExpenses = eAmount;
      payment.advances = aAmount;
      payment.deductions = dAmount;
      payment.netPayable = netPayable;
      payment.remaining = netPayable - payment.alreadyPaid;
      payment.status = payment.alreadyPaid >= netPayable && netPayable > 0 ? 'PAID' : payment.alreadyPaid > 0 ? 'PARTIALLY_PAID' : 'PENDING';
      await payment.save();
    } else {
      payment = await Payment.create({
        deliveryBoyId: driver._id,
        month,
        totalSuccessfulDeliveries,
        commissionRate: commRate,
        grossCommission,
        bonus: bAmount,
        approvedExpenses: eAmount,
        advances: aAmount,
        deductions: dAmount,
        netPayable,
        alreadyPaid: 0,
        remaining: netPayable,
        status: 'PENDING',
      });
    }

    await logAudit({
      action: 'GENERATE_PAYMENT',
      details: `Generated monthly payment calculation for ${driver.fullName} for ${month} (Net Payable: ₹${netPayable})`,
      newValue: payment.toObject(),
    });

    return NextResponse.json({
      success: true,
      message: 'Monthly payment calculated and saved successfully',
      payment,
    });
  } catch (error: any) {
    console.error('Generate payment error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
