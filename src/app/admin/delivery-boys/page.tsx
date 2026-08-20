'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit,
  FileText,
  Calendar,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MoreVertical,
} from 'lucide-react';

export default function DeliveryBoysListPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const url = `/api/admin/delivery-boys?status=${statusFilter}&search=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url);
      const json = await res.json();
      if (res.ok) {
        setDrivers(json.drivers || []);
      }
    } catch (err) {
      console.error('Fetch drivers error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDrivers();
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;

    try {
      const res = await fetch(`/api/admin/delivery-boys/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchDrivers();
      }
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Delivery Boys Directory</h1>
            <p className="text-sm text-slate-500">
              Manage delivery workforce, documents, earnings, attendance & status
            </p>
          </div>
          <Link
            href="/admin/delivery-boys/register"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-2 self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register New Delivery Boy</span>
          </Link>
        </div>

        {/* Filter & Search Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full md:w-auto">
            {['ALL', 'ACTIVE', 'INACTIVE', 'SUSPENDED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === st
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'ALL' ? 'All Drivers' : st}
              </button>
            ))}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Name, ID, Mobile..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
            />
          </form>
        </div>

        {/* Drivers Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading delivery boys...</div>
          ) : drivers.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-slate-600 font-bold text-sm">No Delivery Boys Found</p>
              <p className="text-slate-400 text-xs">Try adjusting your filters or register a new delivery boy.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">ID & Photo</th>
                    <th className="py-3.5 px-4">Name & Mobile</th>
                    <th className="py-3.5 px-4">Vehicle</th>
                    <th className="py-3.5 px-4">Joining Date</th>
                    <th className="py-3.5 px-4">Today Deliveries</th>
                    <th className="py-3.5 px-4">Monthly Deliveries</th>
                    <th className="py-3.5 px-4">Avg. Daily (This Month)</th>
                    <th className="py-3.5 px-4">Today Earnings</th>
                    <th className="py-3.5 px-4">Monthly Earnings</th>
                    <th className="py-3.5 px-4">Attendance</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {drivers.map((driver) => (
                    <tr key={driver._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={
                              driver.photo ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                            }
                            alt={driver.fullName}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-sm"
                          />
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                              {driver.fhrId ? driver.fhrId : driver.deliveryBoyId}
                            </span>
                            {driver.fhrId && driver.fhrId !== driver.deliveryBoyId && (
                              <span className="font-mono text-[9px] text-slate-400">
                                {driver.deliveryBoyId}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/admin/delivery-boys/${driver._id}`}
                          className="font-bold text-slate-900 hover:text-emerald-600 transition-colors block"
                        >
                          {driver.fullName}
                        </Link>
                        <span className="text-slate-500 text-[11px]">+91 {driver.phone}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {driver.driving?.vehicleType || 'Bike'}
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {driver.driving?.vehicleNumber || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{formatDate(driver.joiningDate)}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {driver.todayDeliveriesCount || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900">
                          {driver.monthlyDeliveriesCount || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          {driver.avgDailyDeliveriesThisMonth || 0} / day
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-700">
                        {formatCurrency(driver.todayEarnings || 0)}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {formatCurrency(driver.monthlyEarnings || 0)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            driver.todayAttendanceStatus === 'PRESENT'
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {driver.todayAttendanceStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            driver.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : driver.status === 'INACTIVE'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {driver.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/delivery-boys/${driver._id}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100"
                            title="View Driver 360 Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => toggleStatus(driver._id, driver.status)}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[10px]"
                          >
                            {driver.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
