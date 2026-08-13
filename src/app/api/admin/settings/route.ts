import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { CompanySetting } from '@/lib/models/CompanySetting';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    await connectDB();
    let setting = await CompanySetting.findOne();
    if (!setting) {
      setting = await CompanySetting.create({});
    }
    return NextResponse.json({ success: true, setting });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    let setting = await CompanySetting.findOne();
    const oldVal = setting ? setting.toObject() : null;

    if (!setting) {
      setting = await CompanySetting.create(body);
    } else {
      Object.assign(setting, body);
      await setting.save();
    }

    await logAudit({
      action: 'UPDATE_SETTINGS',
      details: `Updated company rates & settings (Company Rate: ₹${setting.companyRate}, Driver Rate: ₹${setting.driverCommission}, Target: ${setting.dailyTarget})`,
      oldValue: oldVal,
      newValue: setting.toObject(),
    });

    return NextResponse.json({
      success: true,
      message: 'Company settings updated successfully',
      setting,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
