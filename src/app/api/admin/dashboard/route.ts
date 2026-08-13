import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { CompanySetting } from '@/lib/models/CompanySetting';
import { Delivery } from '@/lib/models/Delivery';
import { DeliveryBoy } from '@/lib/models/DeliveryBoy';
import { Expense } from '@/lib/models/Expense';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Fetch settings
    let setting = await CompanySetting.findOne();
    if (!setting) {
      setting = await CompanySetting.create({});
    }

    const companyRate = setting.companyRate || 18;
    const driverCommissionRate = setting.driverCommission || 13;
    const dailyTarget = setting.dailyTarget || 330;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // 1. Active Delivery Boys count
    const activeDeliveryBoysCount = await DeliveryBoy.countDocuments({ status: 'ACTIVE' });

    // 2. Today's Deliveries Breakdown
    const todayDeliveries = await Delivery.find({ date: todayStr });

    let todaySuccessfulCount = 0;
    let todayPendingCount = 0; // Assigned / Out for delivery / Reattempt
    let todayFailedCount = 0;

    todayDeliveries.forEach((d) => {
      if (d.status === 'SUCCESSFUL') {
        todaySuccessfulCount++;
      } else if (d.status === 'FAILED') {
        todayFailedCount++;
      } else {
        todayPendingCount++;
      }
    });

    // Today financial metrics (Only SUCCESSFUL parcels generate revenue & commission!)
    const todayCompanyRevenue = todaySuccessfulCount * companyRate;
    const todayDriverCommission = todaySuccessfulCount * driverCommissionRate;
    const todayGrossProfit = todayCompanyRevenue - todayDriverCommission;

    // Today Expenses
    const todayExpensesDocs = await Expense.find({ date: todayStr });
    const todayExpenses = todayExpensesDocs.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    // 3. Monthly Deliveries Breakdown
    const monthlyDeliveries = await Delivery.find({ date: { $regex: `^${monthPrefix}` } });
    const monthlySuccessfulCount = monthlyDeliveries.filter((d) => d.status === 'SUCCESSFUL').length;

    const monthlyRevenue = monthlySuccessfulCount * companyRate;
    const monthlyDriverCommission = monthlySuccessfulCount * driverCommissionRate;

    // Monthly Expenses
    const monthlyExpensesDocs = await Expense.find({ date: { $regex: `^${monthPrefix}` } });
    const monthlyExpenses = monthlyExpensesDocs.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    const monthlyNetProfit = monthlyRevenue - monthlyDriverCommission - monthlyExpenses;

    // 4. Target Tracker Math
    const targetProgressPercentage = Number(((todaySuccessfulCount / dailyTarget) * 100).toFixed(2));
    const remainingTarget = Math.max(0, dailyTarget - todaySuccessfulCount);

    // Driver workload split math: 330 / active delivery boys
    const deliveriesPerDriver = activeDeliveryBoysCount > 0
      ? Number((dailyTarget / activeDeliveryBoysCount).toFixed(2))
      : 0;

    // Warning logic: if current time is past 2 PM and target percentage is under 50%
    const currentHour = now.getHours();
    const isPaceLow = currentHour >= 14 && targetProgressPercentage < 50;

    // 5. Chart Data (Last 7 Days)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];

      const dayDeliveries = await Delivery.find({ date: dStr, status: 'SUCCESSFUL' });
      const count = dayDeliveries.length;
      const rev = count * companyRate;
      const comm = count * driverCommissionRate;
      const gross = rev - comm;

      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      chartData.push({
        date: dStr,
        day: dayName,
        successful: count,
        revenue: rev,
        commission: comm,
        grossProfit: gross,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        settings: {
          companyRate,
          driverCommission: driverCommissionRate,
          dailyTarget,
        },
        kpis: {
          todayTarget: dailyTarget,
          successfulDeliveries: todaySuccessfulCount,
          pendingDeliveries: todayPendingCount,
          failedDeliveries: todayFailedCount,
          activeDeliveryBoys: activeDeliveryBoysCount,
          todayCompanyRevenue,
          todayDriverCommission,
          todayExpenses,
          todayGrossProfit,
          monthlyRevenue,
          monthlyExpenses,
          monthlyNetProfit,
        },
        targetTracker: {
          target: dailyTarget,
          successful: todaySuccessfulCount,
          percentage: targetProgressPercentage,
          remaining: remainingTarget,
          activeDrivers: activeDeliveryBoysCount,
          deliveriesPerDriver,
          isPaceLow,
        },
        chartData,
      },
    });
  } catch (error: any) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
