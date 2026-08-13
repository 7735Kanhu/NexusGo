import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { CompanySetting } from '@/lib/models/CompanySetting';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const setting = (await CompanySetting.findOne()) || { dailyTarget: 330, driverCommission: 13 };

    const target = Number(searchParams.get('target') || setting.dailyTarget || 330);
    const driverCommission = Number(searchParams.get('driverCommission') || setting.driverCommission || 13);
    const driversCount = Number(searchParams.get('drivers') || 8);

    const requiredDeliveriesPerDriver = driversCount > 0 ? Number((target / driversCount).toFixed(2)) : 0;
    const approxDailyEarning = Number((requiredDeliveriesPerDriver * driverCommission).toFixed(2));
    const approxMonthlyEarning = Number((approxDailyEarning * 26).toFixed(2));

    // Preset comparisons (e.g., 7, 8, 9, 10 drivers)
    const presetScenarios = [7, 8, 9, 10, 12].map((count) => {
      const perDriver = Number((target / count).toFixed(2));
      const dailyEarning = Number((perDriver * driverCommission).toFixed(2));
      const monthlyEarning = Number((dailyEarning * 26).toFixed(2));
      return {
        driverCount: count,
        deliveriesPerDriver: perDriver,
        dailyEarning,
        monthlyEarning,
      };
    });

    return NextResponse.json({
      success: true,
      target,
      driverCommission,
      currentScenario: {
        driverCount: driversCount,
        deliveriesPerDriver: requiredDeliveriesPerDriver,
        approxDailyEarning,
        approxMonthlyEarning,
      },
      scenarios: presetScenarios,
    });
  } catch (error: any) {
    console.error('Capacity calculator error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
