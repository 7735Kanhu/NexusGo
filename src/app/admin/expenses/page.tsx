'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Receipt, Plus, Search, Filter } from 'lucide-react';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newExpense, setNewExpense] = useState({
    category: 'FUEL',
    amount: 500,
    date: new Date().toISOString().split('T')[0],
    description: '',
    relatedDeliveryBoyId: '',
    notes: '',
  });

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/expenses');
      const json = await res.json();
      if (res.ok) setExpenses(json.expenses || []);
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
    fetchExpenses();
    fetchDrivers();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to record expense');

      setShowAddModal(false);
      setNewExpense({
        category: 'FUEL',
        amount: 500,
        date: new Date().toISOString().split('T')[0],
        description: '',
        relatedDeliveryBoyId: '',
        notes: '',
      });
      fetchExpenses();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Expenses Management</h1>
            <p className="text-sm text-slate-500">
              Categorized business & driver operational expenses (Fuel, Toll, Repair, Parking, Office)
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Business Expense</span>
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-xs">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading business expenses...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Related Driver</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {expenses.map((e) => (
                    <tr key={e._id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-500">{formatDate(e.date)}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px]">
                          {e.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">{e.description || '-'}</td>
                      <td className="py-3 px-4">{e.relatedDeliveryBoyId?.fullName || 'General Business'}</td>
                      <td className="py-3 px-4 text-right font-black text-rose-600 text-sm">
                        {formatCurrency(e.amount)}
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
              <h3 className="font-bold text-slate-900 text-base">Record Business Expense</h3>
              <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expense Category *</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="FUEL">FUEL</option>
                    <option value="PARKING">PARKING</option>
                    <option value="TOLL">TOLL</option>
                    <option value="VEHICLE_REPAIR">VEHICLE REPAIR</option>
                    <option value="OFFICE">OFFICE</option>
                    <option value="MOBILE">MOBILE</option>
                    <option value="SALARY">SALARY</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    placeholder="e.g. Scooter fuel / Thermal receipt paper"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Related Delivery Boy (Optional)</label>
                  <select
                    value={newExpense.relatedDeliveryBoyId}
                    onChange={(e) => setNewExpense({ ...newExpense, relatedDeliveryBoyId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  >
                    <option value="">General Business Expense</option>
                    {drivers.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.fullName} ({d.deliveryBoyId})
                      </option>
                    ))}
                  </select>
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
                    Save Expense
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
