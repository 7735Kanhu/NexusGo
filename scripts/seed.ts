import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Admin } from '../src/lib/models/Admin';
import { DeliveryBoy } from '../src/lib/models/DeliveryBoy';
import { Delivery } from '../src/lib/models/Delivery';
import { Attendance } from '../src/lib/models/Attendance';
import { Payment } from '../src/lib/models/Payment';
import { PaymentTransaction } from '../src/lib/models/PaymentTransaction';
import { Advance } from '../src/lib/models/Advance';
import { Expense } from '../src/lib/models/Expense';
import { IncentiveRule } from '../src/lib/models/IncentiveRule';
import { CompanySetting } from '../src/lib/models/CompanySetting';
import { AuditLog } from '../src/lib/models/AuditLog';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://kanhu2551996_db_user:7AXLCXvpMISg4d5k@cluster0.gbqvq6i.mongodb.net/';

async function seed() {
  console.log('🌱 Starting NexusGo Database Seeding...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB.');

  // Clear existing collections
  await Admin.deleteMany({});
  await DeliveryBoy.deleteMany({});
  await Delivery.deleteMany({});
  await Attendance.deleteMany({});
  await Payment.deleteMany({});
  await PaymentTransaction.deleteMany({});
  await Advance.deleteMany({});
  await Expense.deleteMany({});
  await IncentiveRule.deleteMany({});
  await CompanySetting.deleteMany({});
  await AuditLog.deleteMany({});

  console.log('Cleared existing collections.');

  // 1. Create Admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await Admin.create({
    name: 'Owner Admin',
    email: 'admin@nexusgo.com',
    password: hashedPassword,
    role: 'ADMIN',
  });
  console.log(`✅ Admin created: ${admin.email} (Password: admin123)`);

  // 2. Create Company Settings
  const companySetting = await CompanySetting.create({
    companyName: 'NexusGo Logistics',
    companyRate: 18,
    driverCommission: 13,
    dailyTarget: 330,
    operatingDaysPerMonth: 26,
    companyAddress: 'Plot 42, NexusGo Logistics Hub, Sector 62, Noida, UP - 201301',
    companyPhone: '+91 98765 00000',
    companyEmail: 'admin@nexusgo.com',
    gstNo: '07AAAAA0000A1Z5',
    receiptHeader: 'NexusGo Logistics Delivery Payout Statement',
    receiptFooter: 'Thank you for your dedicated service to NexusGo!',
  });
  console.log(`✅ Company settings initialized (Rate: ₹18, Driver: ₹13, Target: 330)`);

  // 3. Create Incentive Rules
  await IncentiveRule.create([
    {
      minDeliveries: 40,
      bonusAmount: 0,
      description: 'Standard Daily Target (40 successful deliveries)',
      isActive: true,
    },
    {
      minDeliveries: 45,
      bonusAmount: 100,
      description: 'Daily Incentive Tier 1 (45+ successful deliveries)',
      isActive: true,
    },
    {
      minDeliveries: 50,
      bonusAmount: 200,
      description: 'Daily Incentive Tier 2 (50+ successful deliveries)',
      isActive: true,
    },
  ]);
  console.log(`✅ Incentive rules created.`);

  // 4. Create 9 Delivery Boys (8 regular + 1 backup/reliever)
  const driversData = [
    {
      deliveryBoyId: 'DEL-101',
      fullName: 'Rahul Kumar',
      phone: '9811122334',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      dob: '1995-04-12',
      address: 'H-12, Sector 15, Noida',
      emergencyContact: '9811100000 (Father)',
      joiningDate: '2024-01-10',
      kyc: {
        aadhaarNumber: '4532 9812 1109',
        panNumber: 'ABCDE1234F',
        aadhaarDocument: 'aadhaar_rahul.pdf',
        panDocument: 'pan_rahul.pdf',
      },
      driving: {
        licenceNumber: 'DL-1420180012345',
        licenceExpiry: '2028-11-20',
        licenceDocument: 'dl_rahul.pdf',
        vehicleNumber: 'UP-16-AB-1234',
        vehicleType: 'Hero Splendor (Bike)',
      },
      bank: {
        accountHolderName: 'Rahul Kumar',
        bankName: 'HDFC Bank',
        accountNumber: '50100234567890',
        ifsc: 'HDFC0000123',
        upiId: 'rahulkumar@okaxis',
      },
      paymentType: 'COMMISSION',
      defaultCommission: 13,
      status: 'ACTIVE',
    },
    {
      deliveryBoyId: 'DEL-102',
      fullName: 'Vikram Singh',
      phone: '9822233445',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      dob: '1993-08-22',
      address: 'B-45, Mayur Vihar, Delhi',
      emergencyContact: '9822200000 (Wife)',
      joiningDate: '2024-01-15',
      kyc: {
        aadhaarNumber: '7812 4512 8890',
        panNumber: 'BCDEF2345G',
      },
      driving: {
        licenceNumber: 'DL-1420170098765',
        licenceExpiry: '2027-05-15',
        vehicleNumber: 'DL-3S-CA-9876',
        vehicleType: 'Honda Activa (Scooter)',
      },
      bank: {
        accountHolderName: 'Vikram Singh',
        bankName: 'State Bank of India',
        accountNumber: '30491234567',
        ifsc: 'SBIN0004567',
        upiId: 'vikramsingh@upi',
      },
      paymentType: 'COMMISSION',
      defaultCommission: 13,
      status: 'ACTIVE',
    },
    {
      deliveryBoyId: 'DEL-103',
      fullName: 'Amit Sharma',
      phone: '9833344556',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      dob: '1997-12-05',
      address: 'Sector 22, Gurgaon',
      emergencyContact: '9833300000 (Brother)',
      joiningDate: '2024-02-01',
      kyc: {
        aadhaarNumber: '9988 7766 5544',
        panNumber: 'CDEFG3456H',
      },
      driving: {
        licenceNumber: 'HR-2620190054321',
        licenceExpiry: '2029-01-10',
        vehicleNumber: 'HR-26-DQ-5432',
        vehicleType: 'TVS Passion (Bike)',
      },
      bank: {
        accountHolderName: 'Amit Sharma',
        bankName: 'ICICI Bank',
        accountNumber: '1029384756',
        ifsc: 'ICIC0001029',
        upiId: 'amitsharma@icici',
      },
      paymentType: 'COMMISSION',
      defaultCommission: 13,
      status: 'ACTIVE',
    },
    {
      deliveryBoyId: 'DEL-104',
      fullName: 'Rajesh Patel',
      phone: '9844455667',
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
      dob: '1992-03-18',
      address: 'Indirapuram, Ghaziabad',
      emergencyContact: '9844400000 (Wife)',
      joiningDate: '2024-02-10',
      kyc: {
        aadhaarNumber: '1122 3344 5566',
        panNumber: 'DEFGH4567I',
      },
      driving: {
        licenceNumber: 'UP-1420160087654',
        licenceExpiry: '2026-10-30',
        vehicleNumber: 'UP-14-EF-8765',
        vehicleType: 'TVS Jupiter (Scooter)',
      },
      bank: {
        accountHolderName: 'Rajesh Patel',
        bankName: 'Axis Bank',
        accountNumber: '918273645019',
        ifsc: 'UTIB0000918',
        upiId: 'rajeshpatel@axisbank',
      },
      paymentType: 'COMMISSION',
      defaultCommission: 13,
      status: 'ACTIVE',
    },
    {
      deliveryBoyId: 'DEL-105',
      fullName: 'Suresh Yadav',
      phone: '9855566778',
      photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
      dob: '1996-06-30',
      address: 'Laxmi Nagar, Delhi',
      emergencyContact: '9855500000 (Father)',
      joiningDate: '2024-03-01',
      kyc: {
        aadhaarNumber: '3344 5566 7788',
        panNumber: 'EFGHI5678J',
      },
      driving: {
        licenceNumber: 'DL-0720180034567',
        licenceExpiry: '2028-04-14',
        vehicleNumber: 'DL-7S-BR-3456',
        vehicleType: 'Bajaj Pulsar (Bike)',
      },
      bank: {
        accountHolderName: 'Suresh Yadav',
        bankName: 'Punjab National Bank',
        accountNumber: '019283746501',
        ifsc: 'PUNB0019200',
        upiId: 'sureshyadav@pnb',
      },
      paymentType: 'COMMISSION',
      defaultCommission: 13,
      status: 'ACTIVE',
    },
    {
      deliveryBoyId: 'DEL-106',
      fullName: 'Manoj Verma',
      phone: '9866677889',
      photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
      dob: '1994-11-14',
      address: 'NIT Sector 3, Faridabad',
      emergencyContact: '9866600000 (Mother)',
      joiningDate: '2024-03-15',
      kyc: {
        aadhaarNumber: '5566 7788 9900',
        panNumber: 'FGHIJ6789K',
      },
      driving: {
        licenceNumber: 'HR-5120170065432',
        licenceExpiry: '2027-08-08',
        vehicleNumber: 'HR-51-BZ-6543',
        vehicleType: 'Hero HF Deluxe (Bike)',
      },
      bank: {
        accountHolderName: 'Manoj Verma',
        bankName: 'Kotak Mahindra Bank',
        accountNumber: '4837261504',
        ifsc: 'KKBK0004837',
        upiId: 'manojverma@kotak',
      },
      paymentType: 'COMMISSION',
      defaultCommission: 13,
      status: 'ACTIVE',
    },
    {
      deliveryBoyId: 'DEL-107',
      fullName: 'Deepak Verma',
      phone: '9877788990',
      photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
      dob: '1998-09-02',
      address: 'Sector 12, Noida',
      emergencyContact: '9877700000 (Brother)',
      joiningDate: '2024-04-01',
      kyc: {
        aadhaarNumber: '7788 9900 1122',
        panNumber: 'GHIJK7890L',
      },
      driving: {
        licenceNumber: 'UP-1620200011223',
        licenceExpiry: '2030-02-28',
        vehicleNumber: 'UP-16-CG-1122',
        vehicleType: 'Suzuki Access (Scooter)',
      },
      bank: {
        accountHolderName: 'Deepak Verma',
        bankName: 'Bank of Baroda',
        accountNumber: '293847561029',
        ifsc: 'BARB0NOIDAX',
        upiId: 'deepakverma@barodampay',
      },
      paymentType: 'COMMISSION',
      defaultCommission: 13,
      status: 'ACTIVE',
    },
    {
      deliveryBoyId: 'DEL-108',
      fullName: 'Sanjay Gupta',
      phone: '9888899001',
      photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
      dob: '1995-01-25',
      address: 'Shahdara, Delhi',
      emergencyContact: '9888800000 (Father)',
      joiningDate: '2024-04-15',
      kyc: {
        aadhaarNumber: '8899 0011 2233',
        panNumber: 'HIJKL8901M',
      },
      driving: {
        licenceNumber: 'DL-0520190088776',
        licenceExpiry: '2029-06-18',
        vehicleNumber: 'DL-5S-AZ-8877',
        vehicleType: 'Honda Shine (Bike)',
      },
      bank: {
        accountHolderName: 'Sanjay Gupta',
        bankName: 'Union Bank of India',
        accountNumber: '584736291048',
        ifsc: 'UBIN0584736',
        upiId: 'sanjaygupta@unionbank',
      },
      paymentType: 'COMMISSION',
      defaultCommission: 13,
      status: 'ACTIVE',
    },
    {
      deliveryBoyId: 'DEL-109',
      fullName: 'Rakesh Mishra (Reliever)',
      phone: '9899900112',
      photo: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=300&q=80',
      dob: '1996-07-19',
      address: 'Sector 63, Noida',
      emergencyContact: '9899900000 (Brother)',
      joiningDate: '2024-05-01',
      kyc: {
        aadhaarNumber: '9900 1122 3344',
        panNumber: 'IJKLM9012N',
      },
      driving: {
        licenceNumber: 'UP-1620210044556',
        licenceExpiry: '2031-09-12',
        vehicleNumber: 'UP-16-DH-4455',
        vehicleType: 'TVS Apache (Reliever Bike)',
      },
      bank: {
        accountHolderName: 'Rakesh Mishra',
        bankName: 'Canara Bank',
        accountNumber: '192837465029',
        ifsc: 'CNRB0001928',
        upiId: 'rakeshmishra@canara',
      },
      paymentType: 'COMMISSION',
      defaultCommission: 13,
      status: 'ACTIVE',
    },
  ];

  const createdDrivers = await DeliveryBoy.insertMany(driversData);
  console.log(`✅ Created 9 Delivery Boys (8 Regular + 1 Backup/Reliever).`);

  // Today date format
  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // 5. Attendance for Today & Recent Days
  for (const driver of createdDrivers) {
    await Attendance.create({
      deliveryBoyId: driver._id,
      date: todayStr,
      status: 'PRESENT',
      loginTime: '08:30 AM',
      logoutTime: '06:45 PM',
      remarks: 'On duty regular shift',
    });
  }
  console.log(`✅ Marked today's attendance for all 9 drivers as PRESENT.`);

  // 6. Deliveries for Today (Target: 330 Parcels)
  // 8 active drivers do ~41 parcels each = 328, plus reliever 2 = 330 total successful deliveries!
  const areas = ['Noida Sector 62', 'Noida Sector 18', 'Mayur Vihar Ph 1', 'Indirapuram', 'Laxmi Nagar', 'Faridabad Sec 15', 'Gurgaon Sec 21', 'Shahdara Delhi'];
  let parcelCounter = 1001;

  const deliveriesToInsert = [];

  for (let i = 0; i < createdDrivers.length; i++) {
    const driver = createdDrivers[i];
    // Driver 0-7 get 41 successful deliveries each; driver 8 gets 2 successful deliveries -> Total 8 * 41 + 2 = 330 Successful Deliveries!
    const targetSuccess = i < 8 ? 41 : 2;
    const failedCount = i < 8 ? 2 : 1; // a few failed parcels
    const reattemptCount = i < 4 ? 1 : 0;

    // Successful parcels
    for (let s = 0; s < targetSuccess; s++) {
      const pId = `NX-PARCEL-${parcelCounter++}`;
      deliveriesToInsert.push({
        parcelId: pId,
        deliveryBoyId: driver._id,
        date: todayStr,
        customerName: `Customer ${pId}`,
        customerPhone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
        address: `House #${s + 10}, Block B, ${areas[s % areas.length]}`,
        area: areas[s % areas.length],
        pincode: '201301',
        codAmount: (s % 3 === 0) ? (s * 120 + 250) : 0,
        status: 'SUCCESSFUL',
        deliveryTime: '02:15 PM',
        remarks: 'Delivered smoothly',
        companyRate: 18,
        driverCommission: 13,
        grossMargin: 5,
      });
    }

    // Failed parcels
    for (let f = 0; f < failedCount; f++) {
      const pId = `NX-PARCEL-${parcelCounter++}`;
      deliveriesToInsert.push({
        parcelId: pId,
        deliveryBoyId: driver._id,
        date: todayStr,
        customerName: `Customer ${pId}`,
        customerPhone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
        address: `Flat #${f + 100}, Tower C, ${areas[f % areas.length]}`,
        area: areas[f % areas.length],
        pincode: '201301',
        codAmount: 450,
        status: 'FAILED',
        deliveryTime: '04:30 PM',
        remarks: 'Customer refused parcel / Address untraceable',
        companyRate: 18,
        driverCommission: 0,
        grossMargin: 0,
      });
    }

    // Reattempt parcels
    for (let r = 0; r < reattemptCount; r++) {
      const pId = `NX-PARCEL-${parcelCounter++}`;
      deliveriesToInsert.push({
        parcelId: pId,
        deliveryBoyId: driver._id,
        date: todayStr,
        customerName: `Customer ${pId}`,
        customerPhone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
        address: `Plot #${r + 5}, Sector 14, ${areas[r % areas.length]}`,
        area: areas[r % areas.length],
        pincode: '201301',
        codAmount: 890,
        status: 'REATTEMPT',
        deliveryTime: '05:00 PM',
        remarks: 'Door locked, customer asked for evening reattempt',
        companyRate: 18,
        driverCommission: 0,
        grossMargin: 0,
      });
    }
  }

  await Delivery.insertMany(deliveriesToInsert);
  console.log(`✅ Created ${deliveriesToInsert.length} deliveries for today (Exact 330 Successful Deliveries reaching target!).`);

  // 7. Seed past month deliveries to show realistic monthly revenue & net profit
  const prevMonthStr = '2026-07';
  const samplePastDeliveries = [];
  let pastParcelCounter = 5001;

  for (let d = 1; d <= 26; d++) {
    const dayStr = `2026-07-${String(d).padStart(2, '0')}`;
    for (const driver of createdDrivers) {
      // ~36 deliveries per day for 9 drivers = 324/day
      for (let p = 0; p < 36; p++) {
        samplePastDeliveries.push({
          parcelId: `NX-JULY-${pastParcelCounter++}`,
          deliveryBoyId: driver._id,
          date: dayStr,
          customerName: `July Cust ${pastParcelCounter}`,
          customerPhone: '+91 9811223344',
          area: 'Noida Hub',
          codAmount: (p % 2 === 0) ? 350 : 0,
          status: 'SUCCESSFUL',
          companyRate: 18,
          driverCommission: 13,
          grossMargin: 5,
        });
      }
    }
  }

  await Delivery.insertMany(samplePastDeliveries);
  console.log(`✅ Created ${samplePastDeliveries.length} past month deliveries for historical analytics.`);

  // 8. Create Sample Advances
  await Advance.create([
    {
      deliveryBoyId: createdDrivers[0]._id, // Rahul Kumar
      amount: 1000,
      date: todayStr,
      reason: 'Emergency Medical Advance',
      paymentMethod: 'CASH',
      reference: 'ADV-1001',
      notes: 'Approved by Admin for family medical emergency',
    },
    {
      deliveryBoyId: createdDrivers[1]._id, // Vikram Singh
      amount: 500,
      date: todayStr,
      reason: 'Vehicle Fuel Advance',
      paymentMethod: 'UPI',
      reference: 'ADV-1002',
      notes: 'Fuel topup advance',
    },
  ]);
  console.log(`✅ Sample advances logged.`);

  // 9. Create Sample Business Expenses
  await Expense.create([
    {
      date: todayStr,
      category: 'FUEL',
      amount: 1200,
      description: 'Hub Generator & Backup Scooter Fuel',
      relatedDeliveryBoyId: createdDrivers[0]._id,
      notes: 'Bill #FL-8821',
    },
    {
      date: todayStr,
      category: 'PARKING',
      amount: 150,
      description: 'Logistics Park Parking Token',
      notes: 'Monthly parking pass snippet',
    },
    {
      date: todayStr,
      category: 'TOLL',
      amount: 350,
      description: 'Fastag Highway Toll for Express Parcels',
      notes: 'Delhi-Noida Tollway',
    },
    {
      date: todayStr,
      category: 'OFFICE',
      amount: 450,
      description: 'Thermal Receipt Paper Rolls & Packaging Tape',
      notes: 'Stationery expense',
    },
  ]);
  console.log(`✅ Sample business expenses logged.`);

  // 10. Sample Monthly Payments
  // For Rahul Kumar for July 2026: 936 deliveries * ₹13 = ₹12,168 + Bonus ₹500 - Advance ₹1000 = ₹11,668 Net Payable
  const rahulJulyPayment = await Payment.create({
    deliveryBoyId: createdDrivers[0]._id,
    month: prevMonthStr,
    totalSuccessfulDeliveries: 936,
    commissionRate: 13,
    grossCommission: 12168,
    bonus: 500,
    approvedExpenses: 200,
    advances: 1000,
    deductions: 0,
    netPayable: 11868,
    alreadyPaid: 11868,
    remaining: 0,
    status: 'PAID',
  });

  await PaymentTransaction.create({
    paymentId: rahulJulyPayment._id,
    deliveryBoyId: createdDrivers[0]._id,
    date: '2026-08-01',
    amount: 11868,
    paymentMethod: 'BANK_TRANSFER',
    transactionId: 'TXN-9988776655',
    reference: 'SALARY-JULY-RAHUL',
    notes: 'Full payment settled for July 2026',
  });

  console.log(`✅ Sample payout settled for July 2026.`);

  // 11. Initial Audit Log
  await AuditLog.create([
    {
      action: 'SYSTEM_INIT',
      adminEmail: 'admin@nexusgo.com',
      details: 'Initialized NexusGo Delivery Management System database with default rates (Company: ₹18, Driver: ₹13, Target: 330)',
      ipAddress: '127.0.0.1',
    },
    {
      action: 'SEED_DELIVERY_BOYS',
      adminEmail: 'admin@nexusgo.com',
      details: 'Registered initial 9 delivery boys workforce (8 regular + 1 backup reliever).',
      ipAddress: '127.0.0.1',
    },
  ]);
  console.log(`✅ Initial audit log entries generated.`);

  console.log('\n🎉 Database Seeding Completed Successfully!');
  console.log('----------------------------------------------------');
  console.log('Login URL: /admin/login');
  console.log('Admin Email: admin@nexusgo.com');
  console.log('Admin Password: admin123');
  console.log('Company Rate: ₹18');
  console.log('Driver Rate: ₹13');
  console.log('Daily Target: 330');
  console.log('Active Delivery Boys: 9');
  console.log('----------------------------------------------------');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
