'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  User,
  Phone,
  ShieldCheck,
  CreditCard,
  Building,
  PackageCheck,
  CalendarCheck,
  HandCoins,
  Receipt,
  Banknote,
  TrendingUp,
  ArrowLeft,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export default function DeliveryBoyProfilePage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DELIVERIES' | 'ATTENDANCE' | 'LEDGER' | 'ADVANCES' | 'DOCS'>('OVERVIEW');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/delivery-boys/${id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load driver profile');
      setData(json.data);
    } catch (err: any) {
      setError(err.message || 'Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8 text-center text-slate-400">Loading Delivery Boy 360° Profile...</div>
      </AdminLayout>
    );
  }

  if (error || !data) {
    return (
      <AdminLayout>
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 space-y-3">
          <p>{error || 'Driver profile not found.'}</p>
          <button onClick={() => router.back()} className="px-4 py-2 bg-slate-900 text-white text-xs rounded-xl font-bold">
            Back to Directory
          </button>
        </div>
      </AdminLayout>
    );
  }

  const { driver, performance, deliveries, attendances, advances, expenses, payments } = data;

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12">
        {/* Top Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {driver.fullName} ({driver.fhrId || driver.deliveryBoyId})
            </h1>
            <p className="text-sm text-slate-500">Delivery Boy 360° Profile & Financial Ledger</p>
          </div>
        </div>

        {/* Profile Card Summary */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={driver.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
              alt={driver.fullName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-extrabold text-slate-900">{driver.fullName}</h2>
                <span className="font-mono text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                  FHRID: {driver.fhrId || driver.deliveryBoyId}
                </span>
                {driver.fhrId && driver.fhrId !== driver.deliveryBoyId && (
                  <span className="font-mono text-[11px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                    ID: {driver.deliveryBoyId}
                  </span>
                )}
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    driver.status === 'ACTIVE'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {driver.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                +91 {driver.phone} • {driver.driving?.vehicleType || 'Bike'} ({driver.driving?.vehicleNumber || '-'})
              </p>
              <p className="text-xs text-slate-500 font-medium">
                Joined: {formatDate(driver.joiningDate)} • Payout: <strong className="text-emerald-700">{driver.paymentType === 'SALARY' ? `Fixed Salary ₹${(driver.monthlySalary || 15000).toLocaleString('en-IN')}/month` : `Commission ₹${driver.defaultCommission}/successful parcel`}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div className="text-right">
              <span className="text-slate-500 block">Pending Net Balance</span>
              <strong className="text-xl font-black text-emerald-700">
                {formatCurrency(performance.pendingAmount)}
              </strong>
            </div>
          </div>
        </div>

        {/* PERFORMANCE KPI CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
            <span className="text-slate-500 block">Total Deliveries</span>
            <strong className="text-lg text-slate-900">{performance.totalDeliveries}</strong>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
            <span className="text-slate-500 block">Successful Parcels</span>
            <strong className="text-lg text-emerald-700">{performance.successfulDeliveries}</strong>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
            <span className="text-slate-500 block">Avg. Daily (This Month)</span>
            <strong className="text-lg text-indigo-700">{performance.avgDailyDeliveriesThisMonth || 0} / day</strong>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
            <span className="text-slate-500 block">Success Rate</span>
            <strong className="text-lg text-blue-600">{performance.successRate}%</strong>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
            <span className="text-slate-500 block">Total Commission</span>
            <strong className="text-lg text-slate-900">{formatCurrency(performance.totalCommission)}</strong>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs space-y-1">
            <span className="text-slate-500 block">Advances Taken</span>
            <strong className="text-lg text-rose-600">{formatCurrency(performance.totalAdvances)}</strong>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          {[
            { id: 'OVERVIEW', label: 'Full Overview' },
            { id: 'DELIVERIES', label: `Deliveries (${deliveries.length})` },
            { id: 'ATTENDANCE', label: `Attendance (${attendances.length})` },
            { id: 'LEDGER', label: 'Financial Ledger' },
            { id: 'ADVANCES', label: `Advances (${advances.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal & Emergency */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                Personal Information
              </h3>
              <div className="space-y-2">
                <p><strong className="text-slate-500">Email Address:</strong> {driver.email || '-'}</p>
                <p><strong className="text-slate-500">Date of Birth:</strong> {formatDate(driver.dob)}</p>
                <p><strong className="text-slate-500">Address:</strong> {driver.address || '-'}</p>
                <p><strong className="text-slate-500">Emergency Contact:</strong> {driver.emergencyContact || '-'}</p>
              </div>
            </div>

            {/* KYC & Driving */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                KYC & Driving Info
              </h3>
              <div className="space-y-2">
                <p><strong className="text-slate-500">Aadhaar:</strong> {driver.kyc?.aadhaarNumber || '-'}</p>
                <p><strong className="text-slate-500">PAN Number:</strong> {driver.kyc?.panNumber || '-'}</p>
                <p><strong className="text-slate-500">Driving Licence:</strong> {driver.driving?.licenceNumber || '-'}</p>
                <p><strong className="text-slate-500">Licence Expiry:</strong> {formatDate(driver.driving?.licenceExpiry)}</p>
              </div>
            </div>

            {/* Bank Information */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs md:col-span-2">
              <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                Bank & UPI Settlement Info
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-slate-400 block">Bank Name</span>
                  <strong className="text-slate-900">{driver.bank?.bankName || '-'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Account Number</span>
                  <strong className="text-slate-900 font-mono">{driver.bank?.accountNumber || '-'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">IFSC Code</span>
                  <strong className="text-slate-900 font-mono">{driver.bank?.ifsc || '-'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">UPI ID</span>
                  <strong className="text-emerald-700 font-mono">{driver.bank?.upiId || '-'}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DELIVERIES */}
        {activeTab === 'DELIVERIES' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-900">
              Delivery History ({deliveries.length} Records)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 font-bold">
                  <tr>
                    <th className="py-2.5 px-4">Parcel ID</th>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Customer & Area</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Commission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deliveries.map((d: any) => (
                    <tr key={d._id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{d.parcelId}</td>
                      <td className="py-2.5 px-4">{formatDate(d.date)}</td>
                      <td className="py-2.5 px-4">
                        <span className="font-semibold block">{d.customerName || 'Customer'}</span>
                        <span className="text-slate-400 text-[10px]">{d.area}</span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            d.status === 'SUCCESSFUL'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-bold text-emerald-700">
                        {d.status === 'SUCCESSFUL' ? formatCurrency(d.driverCommission) : '₹0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: FINANCIAL LEDGER */}
        {activeTab === 'LEDGER' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-2">
              Driver Financial Ledger - {driver.fullName}
            </h3>
            <div className="space-y-2 font-mono">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">
                  + Base Payout ({driver.paymentType === 'SALARY' ? `Fixed Monthly Salary ₹${(driver.monthlySalary || 15000).toLocaleString('en-IN')}` : `${performance.successfulDeliveries} Parcels × ₹${driver.defaultCommission || 13}`}):
                </span>
                <strong className="text-emerald-700">
                  {formatCurrency(driver.paymentType === 'SALARY' ? (driver.monthlySalary || 15000) : performance.totalCommission)}
                </strong>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">+ Total Approved Bonuses:</span>
                <strong className="text-emerald-700">{formatCurrency(performance.totalBonuses)}</strong>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">+ Total Reimbursed Expenses:</span>
                <strong className="text-emerald-700">{formatCurrency(performance.totalApprovedExpenses)}</strong>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 text-rose-600">
                <span>- Total Advances Deducted:</span>
                <strong>- {formatCurrency(performance.totalAdvances)}</strong>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 text-rose-600">
                <span>- Total Payouts Already Paid:</span>
                <strong>- {formatCurrency(performance.totalPaid)}</strong>
              </div>
              <div className="flex justify-between py-3 bg-emerald-50 px-4 rounded-xl text-emerald-900 font-extrabold text-sm">
                <span>NET REMAINING UNPAID BALANCE:</span>
                <span>{formatCurrency(performance.pendingAmount)}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ADVANCES */}
        {activeTab === 'ADVANCES' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-900">
              Cash Advances Logged ({advances.length})
            </div>
            <div className="divide-y divide-slate-100">
              {advances.map((a: any) => (
                <div key={a._id} className="p-4 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900 block">{a.reason || 'Cash Advance'}</span>
                    <span className="text-slate-400 text-[11px]">
                      {formatDate(a.date)} • {a.paymentMethod} • Ref: {a.reference || '-'}
                    </span>
                  </div>
                  <span className="font-extrabold text-rose-600 text-sm">
                    - {formatCurrency(a.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
