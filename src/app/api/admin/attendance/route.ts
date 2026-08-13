import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Attendance } from '@/lib/models/Attendance';
import { DeliveryBoy } from '@/lib/models/DeliveryBoy';
import { logAudit } from '@/lib/audit';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const month = searchParams.get('month');

    const drivers = await DeliveryBoy.find({ status: 'ACTIVE' }).sort({ deliveryBoyId: 1 });

    if (month) {
      // Return monthly summary for calendar view
      const attendances = await Attendance.find({
        date: { $regex: `^${month}` },
      });

      return NextResponse.json({
        success: true,
        month,
        drivers,
        attendances,
      });
    }

    // Return daily attendance list
    const attendances = await Attendance.find({ date }).populate('deliveryBoyId');

    const attendanceMap = new Map();
    attendances.forEach((a) => {
      if (a.deliveryBoyId) {
        attendanceMap.set(a.deliveryBoyId._id.toString(), a);
      }
    });

    const result = drivers.map((d) => {
      const existing = attendanceMap.get(d._id.toString());
      return {
        driver: d,
        attendance: existing || {
          deliveryBoyId: d._id,
          date,
          status: 'PRESENT',
          loginTime: '08:30 AM',
          logoutTime: '06:30 PM',
          remarks: '',
        },
      };
    });

    return NextResponse.json({
      success: true,
      date,
      list: result,
    });
  } catch (error: any) {
    console.error('Fetch attendance error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { date, records } = await req.json(); // records: [{ deliveryBoyId, status, loginTime, logoutTime, remarks }]

    if (!date || !Array.isArray(records)) {
      return NextResponse.json({ error: 'Date and records array are required' }, { status: 400 });
    }

    const bulkOps = records.map((r) => ({
      updateOne: {
        filter: { deliveryBoyId: r.deliveryBoyId, date },
        update: {
          $set: {
            status: r.status || 'PRESENT',
            loginTime: r.loginTime || '',
            logoutTime: r.logoutTime || '',
            remarks: r.remarks || '',
          },
        },
        upsert: true,
      },
    }));

    if (bulkOps.length > 0) {
      await Attendance.bulkWrite(bulkOps);
      await logAudit({
        action: 'MARK_ATTENDANCE',
        details: `Marked attendance for ${bulkOps.length} drivers for date ${date}`,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Attendance marked successfully for ${records.length} drivers on ${date}.`,
    });
  } catch (error: any) {
    console.error('Save attendance error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
