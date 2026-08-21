import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Delivery } from '@/lib/models/Delivery';
import { DeliveryBoy } from '@/lib/models/DeliveryBoy';
import { CompanySetting } from '@/lib/models/CompanySetting';
import { logAudit } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { rows, action } = await req.json();

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No data rows provided for bulk import' }, { status: 400 });
    }

    const settings = (await CompanySetting.findOne()) || { companyRate: 18, driverCommission: 13 };
    const companyRate = settings.companyRate || 18;
    const driverCommission = settings.driverCommission || 13;

    // Fetch existing drivers map for fast lookup
    const allDrivers = await DeliveryBoy.find({});
    const driverMap = new Map<string, any>();
    allDrivers.forEach((d) => {
      if (d.deliveryBoyId) driverMap.set(d.deliveryBoyId.toUpperCase(), d._id);
      if (d._id) driverMap.set(d._id.toString().toUpperCase(), d._id);
    });

    // Fetch existing parcel IDs in database
    const existingParcels = await Delivery.find({}, 'parcelId');
    const existingParcelSet = new Set(existingParcels.map((p) => p.parcelId.toUpperCase()));

    const seenInFileSet = new Set<string>();

    const validatedRows: any[] = [];
    let successfulCount = 0;
    let failedStatusCount = 0;
    let duplicateCount = 0;
    let invalidCount = 0;

    const todayStr = new Date().toISOString().split('T')[0];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const parcelId = String(r.parcelId || r['Parcel ID'] || r.ParcelID || '').trim().toUpperCase();
      const driverId = String(r.deliveryBoyId || r['Delivery Boy ID'] || r.DriverID || '').trim().toUpperCase();
      const statusRaw = String(r.status || r['Status'] || 'SUCCESSFUL').trim().toUpperCase();
      const status = ['ASSIGNED', 'OUT_FOR_DELIVERY', 'SUCCESSFUL', 'FAILED', 'REATTEMPT'].includes(statusRaw)
        ? statusRaw
        : 'SUCCESSFUL';

      let isValid = true;
      let errorReason = '';

      if (!parcelId) {
        isValid = false;
        errorReason = 'Missing Parcel ID';
        invalidCount++;
      } else if (existingParcelSet.has(parcelId) || seenInFileSet.has(parcelId)) {
        isValid = false;
        errorReason = 'Duplicate Parcel ID';
        duplicateCount++;
      }

      if (parcelId) {
        seenInFileSet.add(parcelId);
      }

      const driverMongoId = driverMap.get(driverId) || null;

      const isSuccessful = status === 'SUCCESSFUL';
      const fCompanyRate = isSuccessful ? companyRate : 0;
      const fDriverComm = isSuccessful ? driverCommission : 0;
      const fGrossMargin = isSuccessful ? (fCompanyRate - fDriverComm) : 0;

      if (isValid) {
        if (isSuccessful) successfulCount++;
        else failedStatusCount++;
      }

      validatedRows.push({
        parcelId,
        deliveryBoyId: driverMongoId,
        deliveryBoyCode: driverId,
        date: r.date || r['Date'] || todayStr,
        customerName: r.customerName || r['Customer Name'] || '',
        customerPhone: r.customerPhone || r['Phone'] || '',
        area: r.area || r['Area'] || '',
        pincode: r.pincode || r['Pincode'] || '',
        codAmount: Number(r.codAmount || r['COD Amount'] || 0),
        status,
        companyRate: fCompanyRate,
        driverCommission: fDriverComm,
        grossMargin: fGrossMargin,
        isValid,
        errorReason,
      });
    }

    // If request action is 'VALIDATE_ONLY', return statistics preview
    if (action === 'VALIDATE_ONLY') {
      return NextResponse.json({
        success: true,
        summary: {
          totalRows: rows.length,
          validRows: validatedRows.filter((r) => r.isValid).length,
          successfulStatusCount: successfulCount,
          failedStatusCount: failedStatusCount,
          duplicateCount,
          invalidCount,
        },
        rows: validatedRows,
      });
    }

    // If request action is 'CONFIRM_IMPORT', insert valid rows into DB
    const validRowsToInsert = validatedRows
      .filter((r) => r.isValid)
      .map((r) => ({
        parcelId: r.parcelId,
        deliveryBoyId: r.deliveryBoyId,
        date: r.date,
        customerName: r.customerName,
        customerPhone: r.customerPhone,
        area: r.area,
        pincode: r.pincode,
        codAmount: r.codAmount,
        status: r.status,
        companyRate: r.companyRate,
        driverCommission: r.driverCommission,
        grossMargin: r.grossMargin,
      }));

    if (validRowsToInsert.length > 0) {
      await Delivery.insertMany(validRowsToInsert);
      await logAudit({
        action: 'BULK_IMPORT_DELIVERIES',
        details: `Imported ${validRowsToInsert.length} parcels in bulk (Success: ${successfulCount}, Failed: ${failedStatusCount})`,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${validRowsToInsert.length} parcels.`,
      importedCount: validRowsToInsert.length,
    });
  } catch (error: any) {
    console.error('Bulk import error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
