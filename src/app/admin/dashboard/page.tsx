'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { formatCurrency } from '@/lib/utils';
import {
  Target,
  PackageCheck,
  Clock,
  AlertTriangle,
  Users,
  TrendingUp,
  DollarSign,
  Receipt,
  Wallet,
  Calendar,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/dashboard');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load dashboard data');
      setData(json.data);
    } catch (err: any) {
      setError(err.message || 'Error loading metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-64 bg-slate-200 rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error || !data) {
    return (
      <AdminLayout>
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 space-y-3">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="w-5 h-5" />
            <span>Dashboard Data Error</span>
          </div>
          <p className="text-sm">{error || 'Could not fetch dashboard analytics.'}</p>
          <button
            onClick={fetchDashboard}
            className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700"
          >
            Retry Loading
          </button>
        </div>
      </AdminLayout>
    );
  }

  const { kpis, targetTracker, chartData, settings } = data;

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Executive Dashboard</h1>
            <p className="text-sm text-slate-500">
              Real-time delivery target tracker, financial metrics & fleet operations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboard}
              className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Refresh Analytics
            </button>
          </div>
        </div>

        {/* Low Pace Alert Banner */}
        {targetTracker.isPaceLow && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-amber-900">Delivery Target Warning Alert</h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Current delivery pace is below schedule to reach today's target of 330 parcels ({targetTracker.successful} / 330 completed). Consider deploying backup drivers.
              </p>
            </div>
          </div>
        )}

        {/* TARGET TRACKER SECTION */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-base">Daily Company Target Progress</h2>
                <p className="text-xs text-slate-500">Target: {targetTracker.target} successful parcels / day</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-600">{targetTracker.percentage}%</span>
              <span className="text-xs text-slate-500 block">Completed Today</span>
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700">
                Deliveries: {targetTracker.successful} / {targetTracker.target}
              </span>
              <span className="text-slate-500">Remaining: {targetTracker.remaining} parcels</span>
            </div>
            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${Math.min(100, targetTracker.percentage)}%` }}
              />
            </div>
          </div>

          {/* Active Drivers Workload Breakdown */}
          <div className="pt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
              <span className="text-slate-500 font-medium block">Active Delivery Boys</span>
              <strong className="text-slate-900 text-base">{targetTracker.activeDrivers} Drivers</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
              <span className="text-slate-500 font-medium block">Required Per Driver</span>
              <strong className="text-emerald-700 text-base">
                {targetTracker.deliveriesPerDriver} parcels / driver
              </strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
              <span className="text-slate-500 font-medium block">Driver Earning Rate</span>
              <strong className="text-slate-900 text-base">₹13 / successful parcel</strong>
            </div>
          </div>
        </div>

        {/* TOP KPI CARDS GRID (12 REQUIRED METRICS) */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Key Performance Indicators (KPIs)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Today Target */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Today&apos;s Target</span>
                <Target className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{kpis.todayTarget}</p>
              <p className="text-[11px] text-slate-400">Fixed Daily Volume</p>
            </div>

            {/* Card 2: Successful Deliveries */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Successful Deliveries</span>
                <PackageCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-extrabold text-emerald-700">{kpis.successfulDeliveries}</p>
              <p className="text-[11px] text-emerald-600 font-medium">Generates ₹18/parcel</p>
            </div>

            {/* Card 3: Pending Deliveries */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Pending Deliveries</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-extrabold text-amber-600">{kpis.pendingDeliveries}</p>
              <p className="text-[11px] text-slate-400">Assigned / Reattempt</p>
            </div>

            {/* Card 4: Failed Deliveries */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Failed Deliveries</span>
                <AlertTriangle className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl font-extrabold text-rose-600">{kpis.failedDeliveries}</p>
              <p className="text-[11px] text-rose-500 font-medium">₹0 Commission</p>
            </div>

            {/* Card 5: Active Delivery Boys */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Active Delivery Boys</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{kpis.activeDeliveryBoys}</p>
              <p className="text-[11px] text-slate-400">8 Regular + 1 Reliever</p>
            </div>

            {/* Card 6: Today Company Revenue */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Today Company Revenue</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{formatCurrency(kpis.todayCompanyRevenue)}</p>
              <p className="text-[11px] text-slate-400">{kpis.successfulDeliveries} × ₹18</p>
            </div>

            {/* Card 7: Today Driver Commission */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Today Driver Commission</span>
                <Wallet className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-2xl font-extrabold text-indigo-700">{formatCurrency(kpis.todayDriverCommission)}</p>
              <p className="text-[11px] text-slate-400">{kpis.successfulDeliveries} × ₹13</p>
            </div>

            {/* Card 8: Today Expenses */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Today Expenses</span>
                <Receipt className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl font-extrabold text-rose-600">{formatCurrency(kpis.todayExpenses)}</p>
              <p className="text-[11px] text-slate-400">Fuel, Toll, Parking</p>
            </div>

            {/* Card 9: Today Gross Profit */}
            <div className="bg-emerald-900 text-white p-4 rounded-2xl border border-emerald-800 shadow-md space-y-1">
              <div className="flex items-center justify-between text-emerald-200 text-xs font-semibold">
                <span>Today Gross Profit</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-extrabold text-emerald-300">{formatCurrency(kpis.todayGrossProfit)}</p>
              <p className="text-[11px] text-emerald-200">₹5 Margin / parcel</p>
            </div>

            {/* Card 10: Monthly Revenue */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Monthly Revenue</span>
                <Calendar className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{formatCurrency(kpis.monthlyRevenue)}</p>
              <p className="text-[11px] text-slate-400">Current Month Total</p>
            </div>

            {/* Card 11: Monthly Expenses */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Monthly Expenses</span>
                <Receipt className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{formatCurrency(kpis.monthlyExpenses)}</p>
              <p className="text-[11px] text-slate-400">Approved Ops Expenses</p>
            </div>

            {/* Card 12: Monthly Net Profit */}
            <div className="bg-gradient-to-br from-emerald-600 to-green-700 text-white p-4 rounded-2xl border border-emerald-500 shadow-md space-y-1">
              <div className="flex items-center justify-between text-emerald-100 text-xs font-semibold">
                <span>Monthly Net Profit</span>
                <TrendingUp className="w-4 h-4 text-emerald-200" />
              </div>
              <p className="text-2xl font-extrabold">{formatCurrency(kpis.monthlyNetProfit)}</p>
              <p className="text-[11px] text-emerald-100">Revenue - Commission - Expenses</p>
            </div>
          </div>
        </div>

        {/* CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Deliveries & Margin Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Weekly Successful Deliveries</h3>
                <p className="text-xs text-slate-500">Parcels completed per day</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                7 Days Trend
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="successful" fill="#16a34a" radius={[6, 6, 0, 0]} name="Successful Parcels" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue & Gross Profit Financial Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Company Revenue vs Gross Profit</h3>
                <p className="text-xs text-slate-500">Financial distribution over last 7 days</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                ₹ Revenue vs Profit
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorGross" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip
                    formatter={(value: any) => formatCurrency(Number(value))}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #cbd5e1' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#16a34a" fillOpacity={1} fill="url(#colorRev)" name="Company Revenue" />
                  <Area type="monotone" dataKey="grossProfit" stroke="#0284c7" fillOpacity={1} fill="url(#colorGross)" name="Gross Profit" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS & SYSTEM MODEL BANNER */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              NexusGo Admin Logistics Rules
            </div>
            <h3 className="text-lg font-bold">Configured Business Rates</h3>
            <p className="text-xs text-slate-300 max-w-xl">
              Company earns <strong className="text-emerald-300">₹18</strong> per successful parcel. Delivery Boy is paid <strong className="text-emerald-300">₹13</strong> per successful parcel. Gross margin is <strong className="text-emerald-300">₹5</strong> per parcel. Failed deliveries generate ₹0.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="/admin/deliveries"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/30"
            >
              Manage Deliveries
            </a>
            <a
              href="/admin/profit-calculator"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all"
            >
              Open Profit Calculator
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
