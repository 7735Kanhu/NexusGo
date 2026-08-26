import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Delivery } from '@/lib/models/Delivery';
import { DeliveryBoy } from '@/lib/models/DeliveryBoy';
import { Attendance } from '@/lib/models/Attendance';
import { Payment } from '@/lib/models/Payment';
import { Advance } from '@/lib/models/Advance';
import { Expense } from '@/lib/models/Expense';
import { CompanySetting } from '@/lib/models/CompanySetting';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'DELIVERY'; // DELIVERY, DRIVER, ATTENDANCE, PAYMENT, EXPENSE, PROFIT, ADVANCE, LEDGER
    const date = searchParams.get('date');
    const month = searchParams.get('month') || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const driverId = searchParams.get('driverId');

    const setting = (await CompanySetting.findOne()) || { companyRate: 18, driverCommission: 13, dailyTarget: 330 };
    const companyRate = setting.companyRate || 18;
    const driverCommRate = setting.driverCommission || 13;

    if (type === 'DELIVERY') {
      const query: any = {};
      if (date) query.date = date;
      else if (month) query.date = { $regex: `^${month}` };
      if (driverId && driverId !== 'ALL') query.deliveryBoyId = driverId;

      const deliveries = await Delivery.find(query).populate('deliveryBoyId', 'fullName deliveryBoyId').sort({ date: -1 });
      const totalCount = deliveries.length;
      const successfulCount = deliveries.filter((d) => d.status === 'SUCCESSFUL').length;
      const failedCount = deliveries.filter((d) => d.status === 'FAILED').length;
      const totalRevenue = successfulCount * companyRate;
      const totalCommission = successfulCount * driverCommRate;

      // Group deliveries by driver & date for clean daily summary report
      const map = new Map<string, any>();
      deliveries.forEach((d: any) => {
        const driverObj = typeof d.deliveryBoyId === 'object' ? d.deliveryBoyId : null;
        const driverName = driverObj?.fullName || 'Unassigned';
        const driverCode = driverObj?.deliveryBoyId || '-';
        const dateStr = d.date || '';
        const key = `${driverName}_${dateStr}`;

        if (!map.has(key)) {
          map.set(key, {
            driverName,
            driverCode,
            date: dateStr,
            totalParcels: 0,
            successDeliveries: 0,
            failedDeliveries: 0,
            companyRevenue: 0,
            driverCommission: 0,
            grossMargin: 0,
          });
        }

        const item = map.get(key);
        if (d.status === 'SUCCESSFUL') {
          item.successDeliveries += 1;
          item.companyRevenue += Number(d.companyRate || companyRate);
          item.driverCommission += Number(d.driverCommission || driverCommRate);
          item.grossMargin += Number(d.grossMargin || (companyRate - driverCommRate));
        } else {
          item.failedDeliveries += 1;
        }
        item.totalParcels = item.successDeliveries + item.failedDeliveries;
      });

      const reportDataRows = Array.from(map.values());

      return NextResponse.json({
        success: true,
        type: 'DELIVERY',
        summary: { totalCount, successfulCount, failedCount, totalRevenue, totalCommission },
        data: reportDataRows,
      });
    }

    if (type === 'DRIVER') {
      const drivers = await DeliveryBoy.find({ status: 'ACTIVE' });
      const report = await Promise.all(
        drivers.map(async (driver) => {
          const deliveries = await Delivery.find({
            deliveryBoyId: driver._id,
            date: { $regex: `^${month}` },
          });
          const successful = deliveries.filter((d) => d.status === 'SUCCESSFUL').length;
          const failed = deliveries.filter((d) => d.status === 'FAILED').length;
          const totalComm = successful * (driver.defaultCommission || 13);
          const advances = await Advance.find({ deliveryBoyId: driver._id, date: { $regex: `^${month}` } });
          const totalAdvances = advances.reduce((acc, a) => acc + (a.amount || 0), 0);

          return {
            driverId: driver.deliveryBoyId,
            name: driver.fullName,
            phone: driver.phone,
            vehicle: driver.driving?.vehicleType || 'Bike',
            monthlySuccessful: successful,
            monthlyFailed: failed,
            successRate: deliveries.length > 0 ? Number(((successful / deliveries.length) * 100).toFixed(1)) : 0,
            grossCommission: totalComm,
            totalAdvances,
          };
        })
      );

      return NextResponse.json({
        success: true,
        type: 'DRIVER',
        month,
        data: report,
      });
    }

    if (type === 'EXPENSE') {
      const query: any = {};
      if (date) query.date = date;
      else if (month) query.date = { $regex: `^${month}` };

      const expenses = await Expense.find(query).populate('relatedDeliveryBoyId', 'fullName deliveryBoyId').sort({ date: -1 });
      const totalAmount = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);

      const formattedExpenses = expenses.map((e: any) => ({
        date: e.date || '',
        category: e.category || 'General',
        title: e.title || '',
        driverName: e.relatedDeliveryBoyId?.fullName || '-',
        amount: e.amount || 0,
        paymentStatus: e.paymentStatus || 'PAID',
        notes: e.notes || '',
      }));

      return NextResponse.json({
        success: true,
        type: 'EXPENSE',
        summary: { totalAmount },
        data: formattedExpenses,
      });
    }

    if (type === 'PROFIT') {
      const monthQuery = month;
      const deliveries = await Delivery.find({ date: { $regex: `^${monthQuery}` }, status: 'SUCCESSFUL' });
      const successfulCount = deliveries.length;
      const totalRevenue = successfulCount * companyRate;
      const totalCommission = successfulCount * driverCommRate;
      const grossMargin = totalRevenue - totalCommission;

      const expenses = await Expense.find({ date: { $regex: `^${monthQuery}` } });
      const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
      const netProfit = grossMargin - totalExpenses;

      return NextResponse.json({
        success: true,
        type: 'PROFIT',
        month: monthQuery,
        summary: {
          successfulDeliveries: successfulCount,
          companyRevenue: totalRevenue,
          driverCommission: totalCommission,
          grossMargin,
          totalExpenses,
          netProfit,
        },
      });
    }

    // Default return
    return NextResponse.json({
      success: true,
      type,
      message: 'Report generated successfully',
      data: [],
    });
  } catch (error: any) {
    console.error('Reports API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
