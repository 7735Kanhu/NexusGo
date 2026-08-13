import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Advance } from '@/lib/models/Advance';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const deliveryBoyId = searchParams.get('deliveryBoyId');

    const query: any = {};
    if (deliveryBoyId && deliveryBoyId !== 'ALL') {
      query.deliveryBoyId = deliveryBoyId;
    }

    const advances = await Advance.find(query)
      .populate('deliveryBoyId', 'deliveryBoyId fullName phone photo')
      .sort({ date: -1 });

    return NextResponse.json({
      success: true,
      advances,
    });
  } catch (error: any) {
    console.error('Fetch advances error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.deliveryBoyId || !body.amount) {
      return NextResponse.json({ error: 'Delivery Boy and Amount are required' }, { status: 400 });
    }

    const amount = Number(body.amount);
    if (amount <= 0) {
      return NextResponse.json({ error: 'Advance amount must be greater than 0' }, { status: 400 });
    }

    const newAdvance = await Advance.create({
      deliveryBoyId: body.deliveryBoyId,
      amount,
      date: body.date || new Date().toISOString().split('T')[0],
      reason: body.reason || '',
      paymentMethod: body.paymentMethod || 'CASH',
      reference: body.reference || '',
      notes: body.notes || '',
    });

    await logAudit({
      action: 'ADD_ADVANCE',
      details: `Added cash advance of ₹${amount} for Delivery Boy ID ${body.deliveryBoyId}`,
      newValue: newAdvance.toObject(),
    });

    return NextResponse.json({
      success: true,
      message: 'Advance recorded successfully',
      advance: newAdvance,
    });
  } catch (error: any) {
    console.error('Create advance error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
