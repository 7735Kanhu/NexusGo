'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { formatCurrency } from '@/lib/utils';
import { Award, Plus } from 'lucide-react';

export default function IncentivesPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newRule, setNewRule] = useState({
    minDeliveries: 45,
    bonusAmount: 100,
    description: '45+ successful deliveries bonus',
    isActive: true,
  });

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/incentives');
      const json = await res.json();
      if (res.ok) setRules(json.rules || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/incentives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRule),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to add rule');

      setShowAddModal(false);
      fetchRules();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Driver Incentive & Bonus Rules</h1>
            <p className="text-sm text-slate-500">
              Configure daily milestone bonus tiers (e.g. 45 parcels = ₹100 bonus, 50 parcels = ₹200 bonus)
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Bonus Tier</span>
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-xs">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading incentive rules...</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Milestone Target</th>
                  <th className="py-3 px-4">Bonus Amount</th>
                  <th className="py-3 px-4">Rule Description</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {rules.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {r.minDeliveries} Successful Parcels
                    </td>
                    <td className="py-3 px-4 font-black text-emerald-700 text-sm">
                      {formatCurrency(r.bonusAmount)}
                    </td>
                    <td className="py-3 px-4">{r.description}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Add Incentive Bonus Tier</h3>
              <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Minimum Parcels Target *</label>
                  <input
                    type="number"
                    required
                    value={newRule.minDeliveries}
                    onChange={(e) => setNewRule({ ...newRule, minDeliveries: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bonus Cash Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newRule.bonusAmount}
                    onChange={(e) => setNewRule({ ...newRule, bonusAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={newRule.description}
                    onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
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
                    Save Rule
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
