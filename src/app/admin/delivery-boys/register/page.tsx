'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import {
  UserPlus,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Upload,
  Loader2,
  FileText,
  Image as ImageIcon,
  Check,
} from 'lucide-react';

export default function RegisterDeliveryBoyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});

  const [formData, setFormData] = useState({
    deliveryBoyId: '',
    fhrId: '',
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
      licenceDocument: '',
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
    monthlySalary: 15000,
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

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    section: string,
    field: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadKey = `${section}.${field}`;
    setUploading((prev) => ({ ...prev, [uploadKey]: true }));

    try {
      const data = new FormData();
      data.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'File upload failed');

      handleChange(section, field, json.url);
    } catch (err: any) {
      alert(`Upload Error: ${err.message || 'Failed to upload file'}`);
    } finally {
      setUploading((prev) => ({ ...prev, [uploadKey]: false }));
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
            <p className="text-sm text-slate-500">Create driver profile, FHRID, Cloudinary documents & payout setup</p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Manual Driver IDs & Personal Info */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-600" />
              1. Driver Identifiers & Personal Info
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  FHRID (Manual Delivery Boy ID) *
                </label>
                <input
                  type="text"
                  value={formData.fhrId}
                  onChange={(e) => handleChange('root', 'fhrId', e.target.value)}
                  placeholder="e.g. FHR-101 / FHR-2026-09"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold text-emerald-800 bg-emerald-50/50"
                />
                <span className="text-[10px] text-slate-400">Manual company internal FHR ID number</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  System Delivery Boy ID
                </label>
                <input
                  type="text"
                  value={formData.deliveryBoyId}
                  onChange={(e) => handleChange('root', 'deliveryBoyId', e.target.value)}
                  placeholder="Auto-generated if left blank (e.g. DEL-101)"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>

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

              {/* Cloudinary Photo Upload */}
              <div className="sm:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Driver Photo (Cloudinary Upload)
                </label>
                <div className="flex items-center gap-4">
                  <img
                    src={formData.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                    alt="Driver Thumbnail"
                    className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-500 shadow-sm"
                  />
                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-sm">
                      {uploading['root.photo'] ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                          <span>Uploading to Cloudinary...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-emerald-400" />
                          <span>Upload Photo to Cloudinary</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploading['root.photo']}
                        onChange={(e) => handleFileUpload(e, 'root', 'photo')}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="text"
                      value={formData.photo}
                      onChange={(e) => handleChange('root', 'photo', e.target.value)}
                      placeholder="Or paste image URL directly"
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-[11px] bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: KYC Documents */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              2. KYC Documents & Cloudinary Uploads
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Aadhaar Number
                </label>
                <input
                  type="text"
                  value={formData.kyc.aadhaarNumber}
                  onChange={(e) => handleChange('kyc', 'aadhaarNumber', e.target.value)}
                  placeholder="12 digit Aadhaar"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />

                {/* Aadhaar Cloudinary Upload */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Aadhaar Card Document</span>
                    {formData.kyc.aadhaarDocument && (
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Uploaded
                      </span>
                    )}
                  </div>
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition-all w-full justify-center">
                    {uploading['kyc.aadhaarDocument'] ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        <span>Choose Aadhaar Image / PDF</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      disabled={uploading['kyc.aadhaarDocument']}
                      onChange={(e) => handleFileUpload(e, 'kyc', 'aadhaarDocument')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  PAN Number
                </label>
                <input
                  type="text"
                  value={formData.kyc.panNumber}
                  onChange={(e) => handleChange('kyc', 'panNumber', e.target.value)}
                  placeholder="10 digit PAN"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                />

                {/* PAN Cloudinary Upload */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">PAN Card Document</span>
                    {formData.kyc.panDocument && (
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Uploaded
                      </span>
                    )}
                  </div>
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition-all w-full justify-center">
                    {uploading['kyc.panDocument'] ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        <span>Choose PAN Image / PDF</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      disabled={uploading['kyc.panDocument']}
                      onChange={(e) => handleFileUpload(e, 'kyc', 'panDocument')}
                      className="hidden"
                    />
                  </label>
                </div>
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

              {/* Driving Licence Cloudinary Upload */}
              <div className="sm:col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Driving Licence Document Upload</span>
                  {formData.driving.licenceDocument && (
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Licence Document Uploaded
                    </span>
                  )}
                </div>
                <label className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition-all w-full justify-center">
                  {uploading['driving.licenceDocument'] ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                      <span>Uploading Licence to Cloudinary...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-slate-500" />
                      <span>Choose Licence Image / Document File</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    disabled={uploading['driving.licenceDocument']}
                    onChange={(e) => handleFileUpload(e, 'driving', 'licenceDocument')}
                    className="hidden"
                  />
                </label>
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

          {/* Section 5: Payout Structure & Status */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              5. Payout Structure & Status
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Type *
                </label>
                <select
                  value={formData.paymentType}
                  onChange={(e) => handleChange('root', 'paymentType', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 bg-emerald-50"
                >
                  <option value="COMMISSION">Commission Base (₹ / Parcel)</option>
                  <option value="SALARY">Salary Base (Fixed Monthly Salary)</option>
                </select>
              </div>

              {formData.paymentType === 'COMMISSION' ? (
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
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fixed Monthly Salary (₹ / Month)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-bold">₹</span>
                    <input
                      type="number"
                      value={formData.monthlySalary}
                      onChange={(e) => handleChange('root', 'monthlySalary', Number(e.target.value))}
                      placeholder="e.g. 15000"
                      className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-emerald-700"
                    />
                  </div>
                </div>
              )}

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

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-medium">
              {formData.paymentType === 'COMMISSION' ? (
                <span>Driver will earn <strong className="text-emerald-700">₹{formData.defaultCommission}</strong> per successful parcel delivered.</span>
              ) : (
                <span>Driver will earn a fixed base salary of <strong className="text-emerald-700">₹{(formData.monthlySalary || 0).toLocaleString('en-IN')}</strong> per month (~₹{Math.round((formData.monthlySalary || 0) / 26)}/day).</span>
              )}
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
