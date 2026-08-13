'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { formatDate } from '@/lib/utils';
import { FolderLock, ShieldAlert, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

export default function DocumentManagementPage() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/delivery-boys');
      const json = await res.json();
      if (res.ok) setDrivers(json.drivers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Driver Document Management</h1>
          <p className="text-sm text-slate-500">
            Aadhaar, PAN, Driving Licence, RC & document expiry warnings
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-xs">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading document vault...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Delivery Boy</th>
                    <th className="py-3 px-4">Aadhaar Number</th>
                    <th className="py-3 px-4">PAN Number</th>
                    <th className="py-3 px-4">Driving Licence</th>
                    <th className="py-3 px-4">Licence Expiry</th>
                    <th className="py-3 px-4">Expiry Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {drivers.map((d) => {
                    const expiry = d.driving?.licenceExpiry;
                    let statusClass = 'bg-emerald-100 text-emerald-800';
                    let statusText = 'Valid Document';

                    if (expiry) {
                      const expDate = new Date(expiry);
                      const now = new Date();
                      const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
                      if (diffDays < 0) {
                        statusClass = 'bg-rose-100 text-rose-800';
                        statusText = 'EXPIRED!';
                      } else if (diffDays <= 90) {
                        statusClass = 'bg-amber-100 text-amber-800';
                        statusText = `Expiring in ${diffDays} days`;
                      }
                    }

                    return (
                      <tr key={d._id} className="hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <strong className="text-slate-900 block">{d.fullName}</strong>
                          <span className="font-mono text-[10px] text-slate-400">{d.deliveryBoyId}</span>
                        </td>
                        <td className="py-3 px-4 font-mono">{d.kyc?.aadhaarNumber || '-'}</td>
                        <td className="py-3 px-4 font-mono">{d.kyc?.panNumber || '-'}</td>
                        <td className="py-3 px-4 font-mono">{d.driving?.licenceNumber || '-'}</td>
                        <td className="py-3 px-4">{formatDate(expiry)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusClass}`}>
                            {statusText}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
