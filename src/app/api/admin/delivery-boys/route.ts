import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { DeliveryBoy } from '@/lib/models/DeliveryBoy';
import { Delivery } from '@/lib/models/Delivery';
import { Attendance } from '@/lib/models/Attendance';
import { logAudit } from '@/lib/audit';
import { sendDriverWelcomeEmail } from '@/lib/email';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const query: any = {};
    if (status && status !== 'ALL') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { deliveryBoyId: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const drivers = await DeliveryBoy.find(query).sort({ createdAt: -1 });

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Enrich drivers with today's & monthly delivery/earnings stats
    const enrichedDrivers = await Promise.all(
      drivers.map(async (driver) => {
        // Today's deliveries
        const todayDeliveries = await Delivery.find({
          deliveryBoyId: driver._id,
          date: todayStr,
          status: 'SUCCESSFUL',
        });
        const todayDeliveriesCount = todayDeliveries.length;

        // Monthly deliveries
        const monthlyDeliveries = await Delivery.find({
          deliveryBoyId: driver._id,
          date: { $regex: `^${monthPrefix}` },
          status: 'SUCCESSFUL',
        });
        const monthlyDeliveriesCount = monthlyDeliveries.length;

        // Calculate earnings based on paymentType (COMMISSION vs SALARY)
        const isSalary = driver.paymentType === 'SALARY';
        const monthlyEarnings = isSalary
          ? (driver.monthlySalary || 15000)
          : monthlyDeliveriesCount * (driver.defaultCommission || 13);
        
        const todayEarnings = isSalary
          ? Number(((driver.monthlySalary || 15000) / 26).toFixed(2))
          : todayDeliveriesCount * (driver.defaultCommission || 13);

        // Attendance status for today
        const todayAttendance = await Attendance.findOne({
          deliveryBoyId: driver._id,
          date: todayStr,
        });

        // Average Daily Deliveries this month
        const daysInMonthSoFar = Math.max(1, now.getDate());
        const avgDailyDeliveriesThisMonth = Number((monthlyDeliveriesCount / daysInMonthSoFar).toFixed(1));

        return {
          ...driver.toObject(),
          todayDeliveriesCount,
          todayEarnings,
          monthlyDeliveriesCount,
          monthlyEarnings,
          avgDailyDeliveriesThisMonth,
          todayAttendanceStatus: todayAttendance ? todayAttendance.status : 'NOT_MARKED',
        };
      })
    );

    return NextResponse.json({
      success: true,
      drivers: enrichedDrivers,
    });
  } catch (error: any) {
    console.error('Fetch delivery boys error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.fullName || !body.phone) {
      return NextResponse.json({ error: 'Full Name and Mobile Phone are required' }, { status: 400 });
    }

    // Auto-generate deliveryBoyId if not provided
    let deliveryBoyId = body.deliveryBoyId;
    if (!deliveryBoyId) {
      const count = await DeliveryBoy.countDocuments();
      deliveryBoyId = `DEL-${101 + count}`;
    }

    // Auto-generate fhrId if not provided
    let fhrId = body.fhrId;
    if (!fhrId) {
      fhrId = `FHR-${deliveryBoyId.replace('DEL-', '')}`;
    }

    // Check duplicate ID
    const existing = await DeliveryBoy.findOne({
      $or: [{ deliveryBoyId }, { fhrId }],
    });
    if (existing) {
      return NextResponse.json(
        { error: `Delivery Boy ID (${deliveryBoyId}) or FHRID (${fhrId}) already exists` },
        { status: 400 }
      );
    }

    const newDriver = await DeliveryBoy.create({
      ...body,
      deliveryBoyId,
      fhrId,
      joiningDate: body.joiningDate || new Date().toISOString().split('T')[0],
      defaultCommission: body.defaultCommission || 13,
      status: body.status || 'ACTIVE',
    });

    await logAudit({
      action: 'CREATE_DELIVERY_BOY',
      details: `Registered new delivery boy ${newDriver.fullName} (Employee FHRID: ${newDriver.fhrId}, System ID: ${newDriver.deliveryBoyId})`,
      newValue: newDriver.toObject(),
    });

    // Send onboarding welcome email if email address is provided
    let emailStatus = null;
    if (newDriver.email) {
      emailStatus = await sendDriverWelcomeEmail({
        driverName: newDriver.fullName,
        driverEmail: newDriver.email,
        deliveryBoyId: newDriver.deliveryBoyId,
        fhrId: newDriver.fhrId,
        phone: newDriver.phone,
        paymentType: newDriver.paymentType,
        defaultCommission: newDriver.defaultCommission,
        monthlySalary: newDriver.monthlySalary,
        joiningDate: newDriver.joiningDate,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Delivery Boy registered successfully',
      driver: newDriver,
      emailStatus,
    });
  } catch (error: any) {
    console.error('Register delivery boy error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
