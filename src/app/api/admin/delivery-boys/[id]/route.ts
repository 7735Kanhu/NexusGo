import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { DeliveryBoy } from '@/lib/models/DeliveryBoy';
import { Delivery } from '@/lib/models/Delivery';
import { Attendance } from '@/lib/models/Attendance';
import { Advance } from '@/lib/models/Advance';
import { Expense } from '@/lib/models/Expense';
import { Payment } from '@/lib/models/Payment';
import { logAudit } from '@/lib/audit';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const driver = await DeliveryBoy.findById(id);
    if (!driver) {
      return NextResponse.json({ error: 'Delivery Boy not found' }, { status: 404 });
    }

    // Fetch related records for Driver Profile 360
    const deliveries = await Delivery.find({ deliveryBoyId: driver._id }).sort({ date: -1 }).limit(100);
    const attendances = await Attendance.find({ deliveryBoyId: driver._id }).sort({ date: -1 }).limit(60);
    const advances = await Advance.find({ deliveryBoyId: driver._id }).sort({ date: -1 });
    const expenses = await Expense.find({ relatedDeliveryBoyId: driver._id }).sort({ date: -1 });
    const payments = await Payment.find({ deliveryBoyId: driver._id }).sort({ month: -1 });

    // Financial calculations
    const totalDeliveries = deliveries.length;
    const successfulDeliveries = deliveries.filter((d) => d.status === 'SUCCESSFUL').length;
    const failedDeliveries = deliveries.filter((d) => d.status === 'FAILED').length;
    const successRate = totalDeliveries > 0 ? Number(((successfulDeliveries / totalDeliveries) * 100).toFixed(2)) : 0;

    const totalCommission = successfulDeliveries * (driver.defaultCommission || 13);
    const totalBonuses = payments.reduce((acc, p) => acc + (p.bonus || 0), 0);
    const totalAdvances = advances.reduce((acc, a) => acc + (a.amount || 0), 0);
    const totalApprovedExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
    const totalPaid = payments.reduce((acc, p) => acc + (p.alreadyPaid || 0), 0);

    // Ledger Net Balance formula: (Commission + Bonuses + Expenses) - (Advances + Paid)
    const netEarnings = totalCommission + totalBonuses + totalApprovedExpenses;
    const pendingAmount = netEarnings - (totalAdvances + totalPaid);

    // Monthly calculations
    const now = new Date();
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthlyDeliveriesList = deliveries.filter(
      (d) => d.date && d.date.startsWith(monthPrefix) && d.status === 'SUCCESSFUL'
    );
    const monthlySuccessful = monthlyDeliveriesList.length;
    const daysInMonthSoFar = Math.max(1, now.getDate());
    const avgDailyDeliveriesThisMonth = Number((monthlySuccessful / daysInMonthSoFar).toFixed(1));

    return NextResponse.json({
      success: true,
      data: {
        driver,
        performance: {
          totalDeliveries,
          successfulDeliveries,
          failedDeliveries,
          successRate,
          monthlySuccessful,
          avgDailyDeliveriesThisMonth,
          totalCommission,
          totalBonuses,
          totalApprovedExpenses,
          totalAdvances,
          totalPaid,
          pendingAmount,
        },
        deliveries,
        attendances,
        advances,
        expenses,
        payments,
      },
    });
  } catch (error: any) {
    console.error('Fetch driver detail error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const existing = await DeliveryBoy.findById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Delivery Boy not found' }, { status: 404 });
    }

    const updated = await DeliveryBoy.findByIdAndUpdate(id, body, { new: true });

    await logAudit({
      action: 'UPDATE_DELIVERY_BOY',
      details: `Updated profile/status of delivery boy ${existing.fullName} (ID: ${existing.deliveryBoyId})`,
      oldValue: existing.toObject(),
      newValue: updated?.toObject(),
    });

    return NextResponse.json({
      success: true,
      message: 'Delivery Boy updated successfully',
      driver: updated,
    });
  } catch (error: any) {
    console.error('Update driver error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
