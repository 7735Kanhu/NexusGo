'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { formatCurrency } from '@/lib/utils';
import { Calculator, DollarSign, TrendingUp, Calendar, ArrowRight } from 'lucide-react';

export default function ProfitCalculatorPage() {
  const [companyRate, setCompanyRate] = useState(18);
  const [driverRate, setDriverRate] = useState(13);
  const [dailyDeliveries, setDailyDeliveries] = useState(330);
  const [operatingDays, setOperatingDays] = useState(26);
  const [otherExpenses, setOtherExpenses] = useState(4500);

  // Dynamic Math
  const dailyRevenue = dailyDeliveries * companyRate;
  const dailyDriverCommission = dailyDeliveries * driverRate;
  const dailyGrossMargin = dailyRevenue - dailyDriverCommission;

  const monthlyDeliveries = dailyDeliveries * operatingDays;
  const monthlyRevenue = monthlyDeliveries * companyRate;
  const monthlyDriverCommission = monthlyDeliveries * driverRate;
  const monthlyGrossMargin = monthlyRevenue - monthlyDriverCommission;
  const monthlyNetProfit = monthlyGrossMargin - otherExpenses;

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dedicated Business Profit Calculator</h1>
          <p className="text-sm text-slate-500">
            Interactive financial simulator for daily & monthly delivery gross margin and net profit
          </p>
        </div>

        {/* Input Controls */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-600" />
            Configurable Calculation Inputs
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Rate (Per Parcel ₹)</label>
              <input
                type="number"
                value={companyRate}
                onChange={(e) => setCompanyRate(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-emerald-700"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Driver Commission Rate (₹)</label>
              <input
                type="number"
                value={driverRate}
                onChange={(e) => setDriverRate(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Daily Target Parcels</label>
              <input
                type="number"
                value={dailyDeliveries}
                onChange={(e) => setDailyDeliveries(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Monthly Operating Days</label>
              <input
                type="number"
                value={operatingDays}
                onChange={(e) => setOperatingDays(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-slate-800"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Other Monthly Expenses (Fuel, Office, Repairs ₹)
              </label>
              <input
                type="number"
                value={otherExpenses}
                onChange={(e) => setOtherExpenses(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-rose-600"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Calculation Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Daily Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-sm">DAILY BREAKDOWN ({dailyDeliveries} Parcels)</h3>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                Daily Revenue
              </span>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>Daily Company Revenue ({dailyDeliveries} × ₹{companyRate}):</span>
                <strong className="text-slate-900">{formatCurrency(dailyRevenue)}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 text-indigo-700">
                <span>Driver Commission ({dailyDeliveries} × ₹{driverRate}):</span>
                <strong>- {formatCurrency(dailyDriverCommission)}</strong>
              </div>
              <div className="flex justify-between py-2 bg-emerald-50 px-3 rounded-xl text-emerald-900 font-extrabold text-sm">
                <span>DAILY GROSS MARGIN:</span>
                <span>{formatCurrency(dailyGrossMargin)}</span>
              </div>
            </div>
          </div>

          {/* Monthly Breakdown */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-bold text-slate-100 text-sm">MONTHLY {operatingDays} DAYS PROJECTION</h3>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                {monthlyDeliveries.toLocaleString()} Parcels
              </span>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-300">Company Revenue ({monthlyDeliveries} × ₹{companyRate}):</span>
                <strong className="text-emerald-400">{formatCurrency(monthlyRevenue)}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                <span>Driver Commission ({monthlyDeliveries} × ₹{driverRate}):</span>
                <strong className="text-indigo-400">- {formatCurrency(monthlyDriverCommission)}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                <span>Monthly Gross Margin:</span>
                <strong className="text-emerald-300">{formatCurrency(monthlyGrossMargin)}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800 text-rose-300">
                <span>- Operational Expenses (Fuel/Office):</span>
                <strong>- {formatCurrency(otherExpenses)}</strong>
              </div>

              <div className="flex justify-between py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white px-4 rounded-xl font-extrabold text-base mt-2 shadow-lg">
                <span>ESTIMATED NET PROFIT:</span>
                <span>{formatCurrency(monthlyNetProfit)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
