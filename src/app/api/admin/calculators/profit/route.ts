import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { CompanySetting } from '@/lib/models/CompanySetting';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const setting = (await CompanySetting.findOne()) || { companyRate: 18, driverCommission: 13, dailyTarget: 330, operatingDaysPerMonth: 26 };

    const companyRate = Number(searchParams.get('companyRate') || setting.companyRate || 18);
    const driverCommission = Number(searchParams.get('driverCommission') || setting.driverCommission || 13);
    const dailyDeliveries = Number(searchParams.get('dailyDeliveries') || setting.dailyTarget || 330);
    const operatingDays = Number(searchParams.get('operatingDays') || setting.operatingDaysPerMonth || 26);
    const monthlyOtherExpenses = Number(searchParams.get('otherExpenses') || 4500); // fuel, office, maintenance, etc.

    // Dynamic math
    const dailyRevenue = dailyDeliveries * companyRate;
    const dailyDriverCommission = dailyDeliveries * driverCommission;
    const dailyGrossMargin = dailyRevenue - dailyDriverCommission;

    const monthlyDeliveries = dailyDeliveries * operatingDays;
    const monthlyRevenue = monthlyDeliveries * companyRate;
    const monthlyDriverCommission = monthlyDeliveries * driverCommission;
    const monthlyGrossMargin = monthlyRevenue - monthlyDriverCommission;
    const monthlyNetProfit = monthlyGrossMargin - monthlyOtherExpenses;

    return NextResponse.json({
      success: true,
      inputs: {
        companyRate,
        driverCommission,
        dailyDeliveries,
        operatingDays,
        monthlyOtherExpenses,
      },
      daily: {
        revenue: dailyRevenue,
        driverCommission: dailyDriverCommission,
        grossMargin: dailyGrossMargin,
      },
      monthly: {
        totalDeliveries: monthlyDeliveries,
        revenue: monthlyRevenue,
        driverCommission: monthlyDriverCommission,
        grossMargin: monthlyGrossMargin,
        expenses: monthlyOtherExpenses,
        netProfit: monthlyNetProfit,
      },
    });
  } catch (error: any) {
    console.error('Profit calculator error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
