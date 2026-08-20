'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Settings, Save, CheckCircle2, AlertCircle, Building } from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [setting, setSetting] = useState({
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

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/settings');
      const json = await res.json();
      if (res.ok && json.setting) {
        setSetting(json.setting);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(setting),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update settings');

      setMessage('Company rates and settings saved successfully!');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      alert(err.message || 'Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings & Rates Config</h1>
            <p className="text-sm text-slate-500">
              Configure business model rates (₹18 Company / ₹13 Driver), targets, and receipt details
            </p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>

        {message && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Business Model & Payment Rates */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              1. Business Rates & Target Config
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Company Revenue Rate (₹ / Parcel) *
                </label>
                <input
                  type="number"
                  required
                  value={setting.companyRate}
                  onChange={(e) => setSetting({ ...setting, companyRate: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-emerald-700 text-sm"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Driver Commission Rate (₹ / Parcel) *
                </label>
                <input
                  type="number"
                  required
                  value={setting.driverCommission}
                  onChange={(e) => setSetting({ ...setting, driverCommission: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-indigo-700 text-sm"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Daily Company Target Parcels *
                </label>
                <input
                  type="number"
                  required
                  value={setting.dailyTarget}
                  onChange={(e) => setSetting({ ...setting, dailyTarget: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900 text-sm"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Monthly Operating Days *
                </label>
                <input
                  type="number"
                  required
                  value={setting.operatingDaysPerMonth}
                  onChange={(e) => setSetting({ ...setting, operatingDaysPerMonth: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900 text-sm"
                />
              </div>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 font-semibold text-xs">
              Configured Gross Margin: ₹{setting.companyRate - setting.driverCommission} / successful delivery
            </div>
          </div>

          {/* Company Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              2. Company Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={setting.companyName}
                  onChange={(e) => setSetting({ ...setting, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">GST Number</label>
                <input
                  type="text"
                  value={setting.gstNo}
                  onChange={(e) => setSetting({ ...setting, gstNo: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Hub Address</label>
                <input
                  type="text"
                  value={setting.companyAddress}
                  onChange={(e) => setSetting({ ...setting, companyAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Receipt Customization */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              3. Receipt Customization
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Receipt Header Text</label>
                <input
                  type="text"
                  value={setting.receiptHeader}
                  onChange={(e) => setSetting({ ...setting, receiptHeader: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Receipt Footer Text</label>
                <input
                  type="text"
                  value={setting.receiptFooter}
                  onChange={(e) => setSetting({ ...setting, receiptFooter: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 text-sm transition-all"
          >
            {saving ? 'Saving Changes...' : 'Save & Update All System Settings'}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
