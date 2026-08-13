import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Delivery } from '@/lib/models/Delivery';
import { CompanySetting } from '@/lib/models/CompanySetting';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const status = searchParams.get('status');
    const deliveryBoyId = searchParams.get('deliveryBoyId');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '200');

    const query: any = {};
    if (date) {
      query.date = date;
    }
    if (status && status !== 'ALL') {
      query.status = status;
    }
    if (deliveryBoyId && deliveryBoyId !== 'ALL') {
      query.deliveryBoyId = deliveryBoyId;
    }
    if (search) {
      query.$or = [
        { parcelId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerPhone: { $regex: search, $options: 'i' } },
        { area: { $regex: search, $options: 'i' } },
      ];
    }

    const deliveries = await Delivery.find(query)
      .populate('deliveryBoyId', 'deliveryBoyId fullName phone photo')
      .sort({ createdAt: -1 })
      .limit(limit);

    return NextResponse.json({
      success: true,
      count: deliveries.length,
      deliveries,
    });
  } catch (error: any) {
    console.error('Fetch deliveries error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.parcelId) {
      return NextResponse.json({ error: 'Parcel ID is required' }, { status: 400 });
    }

    const cleanParcelId = body.parcelId.trim().toUpperCase();

    // Prevent duplicate Parcel ID
    const existing = await Delivery.findOne({ parcelId: cleanParcelId });
    if (existing) {
      return NextResponse.json(
        { error: `Parcel ID '${cleanParcelId}' already exists in the system!` },
        { status: 400 }
      );
    }

    // Get current rates from settings
    const settings = (await CompanySetting.findOne()) || { companyRate: 18, driverCommission: 13 };
    const companyRate = settings.companyRate || 18;
    const driverCommission = settings.driverCommission || 13;

    // Rules: ONLY SUCCESSFUL deliveries generate company revenue and driver commission!
    const isSuccessful = body.status === 'SUCCESSFUL';
    const finalCompanyRate = isSuccessful ? companyRate : 0;
    const finalDriverCommission = isSuccessful ? driverCommission : 0;
    const grossMargin = isSuccessful ? (finalCompanyRate - finalDriverCommission) : 0;

    const newDelivery = await Delivery.create({
      ...body,
      parcelId: cleanParcelId,
      date: body.date || new Date().toISOString().split('T')[0],
      codAmount: Number(body.codAmount || 0),
      companyRate: finalCompanyRate,
      driverCommission: finalDriverCommission,
      grossMargin: grossMargin,
    });

    await logAudit({
      action: 'CREATE_DELIVERY',
      details: `Created parcel delivery ${newDelivery.parcelId} (Status: ${newDelivery.status})`,
      newValue: newDelivery.toObject(),
    });

    return NextResponse.json({
      success: true,
      message: 'Delivery record created successfully',
      delivery: newDelivery,
    });
  } catch (error: any) {
    console.error('Create delivery error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
