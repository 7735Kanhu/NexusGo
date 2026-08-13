import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { IncentiveRule } from '@/lib/models/IncentiveRule';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    await connectDB();
    const rules = await IncentiveRule.find({}).sort({ minDeliveries: 1 });
    return NextResponse.json({ success: true, rules });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.minDeliveries || body.bonusAmount === undefined) {
      return NextResponse.json({ error: 'Min Deliveries and Bonus Amount are required' }, { status: 400 });
    }

    const rule = await IncentiveRule.create({
      minDeliveries: Number(body.minDeliveries),
      bonusAmount: Number(body.bonusAmount),
      description: body.description || `${body.minDeliveries}+ deliveries bonus`,
      isActive: body.isActive !== undefined ? body.isActive : true,
    });

    await logAudit({
      action: 'ADD_INCENTIVE_RULE',
      details: `Added bonus incentive rule (${body.minDeliveries} deliveries -> ₹${body.bonusAmount} bonus)`,
      newValue: rule.toObject(),
    });

    return NextResponse.json({
      success: true,
      message: 'Incentive rule created successfully',
      rule,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
