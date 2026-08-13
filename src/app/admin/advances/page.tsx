'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { formatCurrency, formatDate } from '@/lib/utils';
import { HandCoins, Plus, Search, Calendar, User } from 'lucide-react';

export default function AdvancesPage() {
  const [advances, setAdvances] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newAdvance, setNewAdvance] = useState({
    deliveryBoyId: '',
    amount: 1000,
    date: new Date().toISOString().split('T')[0],
    reason: '',
    paymentMethod: 'CASH',
    reference: '',
    notes: '',
  });

  const fetchAdvances = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/advances');
      const json = await res.json();
      if (res.ok) setAdvances(json.advances || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await fetch('/api/admin/delivery-boys?status=ACTIVE');
      const json = await res.json();
      if (res.ok) setDrivers(json.drivers || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAdvances();
    fetchDrivers();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/advances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdvance),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to record advance');

      setShowAddModal(false);
      setNewAdvance({
        deliveryBoyId: '',
        amount: 1000,
        date: new Date().toISOString().split('T')[0],
        reason: '',
        paymentMethod: 'CASH',
        reference: '',
        notes: '',
      });
      fetchAdvances();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Advances Management</h1>
            <p className="text-sm text-slate-500">
              Record money given to delivery boys; automatically syncs with financial ledgers
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Record Cash Advance</span>
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-xs">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading advances...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Delivery Boy</th>
                    <th className="py-3 px-4">Reason / Notes</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Ref #</th>
                    <th className="py-3 px-4 text-right">Advance Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {advances.map((a) => (
                    <tr key={a._id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-500">{formatDate(a.date)}</td>
                      <td className="py-3 px-4">
                        <strong className="text-slate-900 block">{a.deliveryBoyId?.fullName || 'Driver'}</strong>
                        <span className="font-mono text-[10px] text-slate-400">
                          {a.deliveryBoyId?.deliveryBoyId || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4">{a.reason || 'Medical / Personal Advance'}</td>
                      <td className="py-3 px-4">{a.paymentMethod}</td>
                      <td className="py-3 px-4 font-mono">{a.reference || '-'}</td>
                      <td className="py-3 px-4 text-right font-black text-rose-600 text-sm">
                        {formatCurrency(a.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Record Cash Advance to Driver</h3>
              <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Delivery Boy *</label>
                  <select
                    required
                    value={newAdvance.deliveryBoyId}
                    onChange={(e) => setNewAdvance({ ...newAdvance, deliveryBoyId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  >
                    <option value="">Select Driver</option>
                    {drivers.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.fullName} ({d.deliveryBoyId})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Advance Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newAdvance.amount}
                    onChange={(e) => setNewAdvance({ ...newAdvance, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reason</label>
                  <input
                    type="text"
                    value={newAdvance.reason}
                    onChange={(e) => setNewAdvance({ ...newAdvance, reason: e.target.value })}
                    placeholder="e.g. Fuel advance / Emergency medical"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold"
                  >
                    Save Advance
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
