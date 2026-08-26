'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { formatCurrency, formatDate } from '@/lib/utils';
import { FileText, Download, Printer, Filter, Calendar } from 'lucide-react';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('DELIVERY');
  const [month, setMonth] = useState(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/reports?type=${reportType}&month=${month}`);
      const json = await res.json();
      if (res.ok) {
        setReportData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, month]);

  const exportCSV = () => {
    if (!reportData || !reportData.data || !Array.isArray(reportData.data)) return;
    const items = reportData.data;
    if (items.length === 0) return alert('No data to export');

    const headers = Object.keys(items[0]).join(',');
    const rows = items.map((item: any) =>
      Object.values(item)
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NexusGo_${reportType}_Report_${month}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderCellValue = (key: string, val: any) => {
    if (val === null || val === undefined) return '-';

    const k = key.toLowerCase();
    if (typeof val === 'number') {
      if (
        k.includes('revenue') ||
        k.includes('commission') ||
        k.includes('margin') ||
        k.includes('amount') ||
        k.includes('profit') ||
        k.includes('expense') ||
        k.includes('advances')
      ) {
        return <span className="font-bold text-slate-900">{formatCurrency(val)}</span>;
      }
      if (k.includes('rate') || k.includes('percentage')) {
        return <span className="font-bold text-emerald-700">{val}%</span>;
      }
      if (
        k.includes('success') ||
        k.includes('failed') ||
        k.includes('total') ||
        k.includes('parcels') ||
        k.includes('count') ||
        k.includes('monthly')
      ) {
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
              k.includes('success')
                ? 'bg-emerald-100 text-emerald-800'
                : k.includes('failed')
                ? 'bg-rose-100 text-rose-800'
                : 'bg-slate-100 text-slate-800 border border-slate-200'
            }`}
          >
            {val}
          </span>
        );
      }
      return val;
    }

    if (typeof val === 'object') {
      return val.fullName || val.deliveryBoyId || JSON.stringify(val);
    }

    return String(val);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Analytical Reports Hub</h1>
            <p className="text-sm text-slate-500">
              Generate & export financial, delivery, driver performance, attendance, expense & profit reports
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print Report</span>
            </button>
          </div>
        </div>

        {/* Report Selector Tabs */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            {[
              { id: 'DELIVERY', label: 'Delivery Report' },
              { id: 'DRIVER', label: 'Driver Performance' },
              { id: 'EXPENSE', label: 'Expense Report' },
              { id: 'PROFIT', label: 'Profit & Loss' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setReportType(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  reportType === tab.id
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 text-slate-800"
          />
        </div>

        {/* Summary Card */}
        {reportData && reportData.summary && (
          <div className="bg-emerald-900 text-white p-6 rounded-2xl border border-emerald-800 shadow-md">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
              Report Analytical Summary ({month})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              {Object.entries(reportData.summary).map(([k, v]: any) => (
                <div key={k} className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-800">
                  <span className="text-emerald-300 block font-medium capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                  <strong className="text-lg text-white">
                    {typeof v === 'number' && (k.toLowerCase().includes('profit') || k.toLowerCase().includes('revenue') || k.toLowerCase().includes('amount') || k.toLowerCase().includes('commission') || k.toLowerCase().includes('expense') || k.toLowerCase().includes('margin'))
                      ? formatCurrency(v)
                      : String(v)}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-xs">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Generating analytical report...</div>
          ) : !reportData || !reportData.data || reportData.data.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No report records found for this period.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    {Object.keys(reportData.data[0])
                      .filter((h) => !['_id', '__v', 'createdAt', 'updatedAt'].includes(h))
                      .map((h) => (
                        <th key={h} className="py-3 px-4 capitalize font-bold text-slate-700">
                          {h.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {reportData.data.map((row: any, idx: number) => {
                    const keys = Object.keys(row).filter((h) => !['_id', '__v', 'createdAt', 'updatedAt'].includes(h));
                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        {keys.map((key: string, vIdx: number) => (
                          <td key={vIdx} className="py-3 px-4 font-medium">
                            {renderCellValue(key, row[key])}
                          </td>
                        ))}
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
