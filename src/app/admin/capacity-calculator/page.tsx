'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { formatCurrency } from '@/lib/utils';
import { Gauge, Users, DollarSign, TrendingUp } from 'lucide-react';

export default function CapacityCalculatorPage() {
  const [target, setTarget] = useState(330);
  const [driverCommission, setDriverCommission] = useState(13);
  const [activeDrivers, setActiveDrivers] = useState(8);

  const deliveriesPerDriver = activeDrivers > 0 ? Number((target / activeDrivers).toFixed(2)) : 0;
  const approxDailyDriverEarning = Number((deliveriesPerDriver * driverCommission).toFixed(2));
  const approxMonthlyDriverEarning = Number((approxDailyDriverEarning * 26).toFixed(2));

  const scenarios = [7, 8, 9, 10, 11, 12].map((cnt) => {
    const perDriver = Number((target / cnt).toFixed(2));
    const dailyEarning = Number((perDriver * driverCommission).toFixed(2));
    const monthlyEarning = Number((dailyEarning * 26).toFixed(2));
    return { cnt, perDriver, dailyEarning, monthlyEarning };
  });

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Driver Capacity & Workload Calculator</h1>
          <p className="text-sm text-slate-500">
            Calculate parcel distribution per delivery boy and estimated driver daily/monthly earnings
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
            <Gauge className="w-4 h-4 text-emerald-600" />
            Capacity Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Daily Target (Parcels)</label>
              <input
                type="number"
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-900"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Active Delivery Boys Fleet Count</label>
              <input
                type="number"
                value={activeDrivers}
                onChange={(e) => setActiveDrivers(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-emerald-700"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Driver Commission Rate (₹)</label>
              <input
                type="number"
                value={driverCommission}
                onChange={(e) => setDriverCommission(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-indigo-700"
              />
            </div>
          </div>
        </div>

        {/* Current Calculation Card */}
        <div className="bg-emerald-950 text-white p-6 rounded-2xl border border-emerald-900 shadow-xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Workload & Driver Earning Summary ({activeDrivers} Active Delivery Boys)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-emerald-900/60 rounded-xl border border-emerald-800">
              <span className="text-emerald-300 text-xs block font-medium">Deliveries Per Driver / Day</span>
              <strong className="text-2xl font-black text-white">{deliveriesPerDriver} Parcels</strong>
            </div>
            <div className="p-4 bg-emerald-900/60 rounded-xl border border-emerald-800">
              <span className="text-emerald-300 text-xs block font-medium">Approx Daily Driver Earning</span>
              <strong className="text-2xl font-black text-emerald-300">
                {formatCurrency(approxDailyDriverEarning)}
              </strong>
            </div>
            <div className="p-4 bg-emerald-900/60 rounded-xl border border-emerald-800">
              <span className="text-emerald-300 text-xs block font-medium">Approx Monthly Earning (26 Days)</span>
              <strong className="text-2xl font-black text-emerald-300">
                {formatCurrency(approxMonthlyDriverEarning)}
              </strong>
            </div>
          </div>
        </div>

        {/* Preset Fleet Size Comparison Matrix */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-900">
            Comparative Workforce Scenarios (Daily Target: {target} Parcels)
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-slate-600 font-bold">
              <tr>
                <th className="py-3 px-4">Active Drivers</th>
                <th className="py-3 px-4">Workload / Driver</th>
                <th className="py-3 px-4">Driver Daily Earning</th>
                <th className="py-3 px-4">Driver Monthly Earning (26 Days)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {scenarios.map((sc) => (
                <tr
                  key={sc.cnt}
                  className={`hover:bg-slate-50 ${sc.cnt === activeDrivers ? 'bg-emerald-50 font-bold' : ''}`}
                >
                  <td className="py-3 px-4 font-bold text-slate-900">{sc.cnt} Drivers</td>
                  <td className="py-3 px-4 text-emerald-700">{sc.perDriver} parcels / day</td>
                  <td className="py-3 px-4 text-slate-900">{formatCurrency(sc.dailyEarning)} / day</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{formatCurrency(sc.monthlyEarning)} / month</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
