'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { UserPlus, ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function RegisterDeliveryBoyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    dob: '1996-05-15',
    address: '',
    emergencyContact: '',
    joiningDate: new Date().toISOString().split('T')[0],
    kyc: {
      aadhaarNumber: '',
      panNumber: '',
      aadhaarDocument: '',
      panDocument: '',
    },
    driving: {
      licenceNumber: '',
      licenceExpiry: '',
      vehicleNumber: '',
      vehicleType: 'Bike',
    },
    bank: {
      accountHolderName: '',
      bankName: '',
      accountNumber: '',
      ifsc: '',
      upiId: '',
    },
    paymentType: 'COMMISSION',
    defaultCommission: 13,
    status: 'ACTIVE',
  });

  const handleChange = (section: string, field: string, value: any) => {
    if (section === 'root') {
      setFormData((prev) => ({ ...prev, [field]: value }));
    } else {
      setFormData((prev: any) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/delivery-boys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to register delivery boy');

      router.push('/admin/delivery-boys');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Register Delivery Boy</h1>
            <p className="text-sm text-slate-500">Create new delivery driver profile & financial setup</p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Personal Information */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              1. Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => handleChange('root', 'fullName', e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => handleChange('root', 'phone', e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleChange('root', 'dob', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Joining Date
                </label>
                <input
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => handleChange('root', 'joiningDate', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('root', 'address', e.target.value)}
                  placeholder="Street, Sector, City"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Emergency Contact
                </label>
                <input
                  type="text"
                  value={formData.emergencyContact}
                  onChange={(e) => handleChange('root', 'emergencyContact', e.target.value)}
                  placeholder="Relation & Phone"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Photo URL
                </label>
                <input
                  type="text"
                  value={formData.photo}
                  onChange={(e) => handleChange('root', 'photo', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: KYC Information */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              2. KYC Documents
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Aadhaar Number
                </label>
                <input
                  type="text"
                  value={formData.kyc.aadhaarNumber}
                  onChange={(e) => handleChange('kyc', 'aadhaarNumber', e.target.value)}
                  placeholder="12 digit Aadhaar"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  PAN Number
                </label>
                <input
                  type="text"
                  value={formData.kyc.panNumber}
                  onChange={(e) => handleChange('kyc', 'panNumber', e.target.value)}
                  placeholder="10 digit PAN"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Driving & Vehicle */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              3. Driving & Vehicle Info
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Driving Licence Number
                </label>
                <input
                  type="text"
                  value={formData.driving.licenceNumber}
                  onChange={(e) => handleChange('driving', 'licenceNumber', e.target.value)}
                  placeholder="DL Number"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Licence Expiry Date
                </label>
                <input
                  type="date"
                  value={formData.driving.licenceExpiry}
                  onChange={(e) => handleChange('driving', 'licenceExpiry', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vehicle Type
                </label>
                <select
                  value={formData.driving.vehicleType}
                  onChange={(e) => handleChange('driving', 'vehicleType', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="Bike">Motorcycle / Bike</option>
                  <option value="Scooter">Scooter / Activa</option>
                  <option value="Electric Scooter">Electric EV Scooter</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Vehicle Registration Number
                </label>
                <input
                  type="text"
                  value={formData.driving.vehicleNumber}
                  onChange={(e) => handleChange('driving', 'vehicleNumber', e.target.value)}
                  placeholder="UP-16-AB-1234"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Bank Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              4. Bank Account Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  value={formData.bank.accountHolderName}
                  onChange={(e) => handleChange('bank', 'accountHolderName', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={formData.bank.bankName}
                  onChange={(e) => handleChange('bank', 'bankName', e.target.value)}
                  placeholder="HDFC / SBI / ICICI"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  value={formData.bank.accountNumber}
                  onChange={(e) => handleChange('bank', 'accountNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={formData.bank.ifsc}
                  onChange={(e) => handleChange('bank', 'ifsc', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  UPI ID
                </label>
                <input
                  type="text"
                  value={formData.bank.upiId}
                  onChange={(e) => handleChange('bank', 'upiId', e.target.value)}
                  placeholder="username@upi"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Financial Payment Rules */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              5. Payout Commission & Status
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Type
                </label>
                <input
                  type="text"
                  disabled
                  value="COMMISSION"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-100 font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Commission Rate (Per Parcel)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">₹</span>
                  <input
                    type="number"
                    value={formData.defaultCommission}
                    onChange={(e) => handleChange('root', 'defaultCommission', Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Initial Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('root', 'status', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 text-sm transition-all"
          >
            {loading ? 'Registering Driver...' : 'Submit & Register Delivery Boy'}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
