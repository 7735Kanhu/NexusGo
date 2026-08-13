'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { formatCurrency, formatDate } from '@/lib/utils';
import Papa from 'papaparse';
import {
  PackageCheck,
  Plus,
  Upload,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Filter,
  FileSpreadsheet,
  AlertTriangle,
  X,
} from 'lucide-react';

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [driverFilter, setDriverFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Single Delivery Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newParcel, setNewParcel] = useState({
    parcelId: '',
    deliveryBoyId: '',
    date: new Date().toISOString().split('T')[0],
    customerName: '',
    customerPhone: '',
    address: '',
    area: 'Noida Sector 62',
    pincode: '201301',
    codAmount: 0,
    status: 'SUCCESSFUL',
    remarks: '',
  });

  // Bulk Import Modal
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkPreview, setBulkPreview] = useState<any>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        status: statusFilter,
        date: dateFilter,
        deliveryBoyId: driverFilter,
        search: searchQuery,
      });
      const res = await fetch(`/api/admin/deliveries?${query.toString()}`);
      const json = await res.json();
      if (res.ok) {
        setDeliveries(json.deliveries || []);
      }
    } catch (err) {
      console.error('Fetch deliveries error:', err);
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
      console.error('Fetch drivers error:', err);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  useEffect(() => {
    fetchDeliveries();
  }, [statusFilter, dateFilter, driverFilter]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    try {
      const res = await fetch('/api/admin/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newParcel),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to add delivery');

      setShowAddModal(false);
      setNewParcel({
        parcelId: '',
        deliveryBoyId: '',
        date: new Date().toISOString().split('T')[0],
        customerName: '',
        customerPhone: '',
        address: '',
        area: 'Noida Sector 62',
        pincode: '201301',
        codAmount: 0,
        status: 'SUCCESSFUL',
        remarks: '',
      });
      fetchDeliveries();
    } catch (err: any) {
      setModalError(err.message || 'Error adding delivery');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setBulkFile(file);
      parseCSV(file);
    }
  };

  const parseCSV = (file: File) => {
    setBulkLoading(true);
    setModalError('');
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const res = await fetch('/api/admin/deliveries/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'VALIDATE_ONLY',
              rows: results.data,
            }),
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || 'Validation failed');
          setBulkPreview(json);
        } catch (err: any) {
          setModalError(err.message || 'CSV parse error');
        } finally {
          setBulkLoading(false);
        }
      },
    });
  };

  const confirmBulkImport = async () => {
    if (!bulkPreview || !bulkPreview.rows) return;
    setBulkLoading(true);
    try {
      const res = await fetch('/api/admin/deliveries/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CONFIRM_IMPORT',
          rows: bulkPreview.rows,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Import failed');

      alert(json.message);
      setShowBulkModal(false);
      setBulkPreview(null);
      setBulkFile(null);
      fetchDeliveries();
    } catch (err: any) {
      setModalError(err.message || 'Bulk import failed');
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Deliveries Management</h1>
            <p className="text-sm text-slate-500">
              Track single parcels, COD amounts, rates (₹18 / ₹13) & bulk CSV upload
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBulkModal(true)}
              className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
            >
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Bulk Import CSV</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Single Delivery</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              {['ALL', 'SUCCESSFUL', 'FAILED', 'REATTEMPT', 'ASSIGNED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    statusFilter === st
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Date Filter */}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50"
            />

            {/* Driver Filter */}
            <select
              value={driverFilter}
              onChange={(e) => setDriverFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50"
            >
              <option value="ALL">All Active Drivers</option>
              {drivers.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.fullName} ({d.deliveryBoyId})
                </option>
              ))}
            </select>

            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Parcel ID, Customer, Area..."
                className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Deliveries Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-xs">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading deliveries list...</div>
          ) : deliveries.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <PackageCheck className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-700">No Deliveries Found</p>
              <p className="text-slate-400 text-xs">Try selecting another date or filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Parcel ID</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Assigned Driver</th>
                    <th className="py-3 px-4">Customer & Area</th>
                    <th className="py-3 px-4">COD Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Company Rate</th>
                    <th className="py-3 px-4">Driver Comm.</th>
                    <th className="py-3 px-4">Gross Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {deliveries.map((d) => {
                    const isSuccess = d.status === 'SUCCESSFUL';
                    return (
                      <tr key={d._id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{d.parcelId}</td>
                        <td className="py-3 px-4 text-slate-500">{formatDate(d.date)}</td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">
                            {d.deliveryBoyId?.fullName || 'Unassigned'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {d.deliveryBoyId?.deliveryBoyId || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-900 block">{d.customerName || 'Customer'}</span>
                          <span className="text-[10px] text-slate-400 block">{d.area || '-'}</span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {d.codAmount > 0 ? formatCurrency(d.codAmount) : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              d.status === 'SUCCESSFUL'
                                ? 'bg-emerald-100 text-emerald-800'
                                : d.status === 'FAILED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {d.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {isSuccess ? formatCurrency(d.companyRate) : '₹0'}
                        </td>
                        <td className="py-3 px-4 font-bold text-indigo-700">
                          {isSuccess ? formatCurrency(d.driverCommission) : '₹0'}
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-700">
                          {isSuccess ? formatCurrency(d.grossMargin) : '₹0'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL 1: ADD SINGLE DELIVERY */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-base">Add Single Delivery Parcel</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalError && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold">
                  {modalError}
                </div>
              )}

              <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Parcel ID (Unique) *</label>
                  <input
                    type="text"
                    required
                    value={newParcel.parcelId}
                    onChange={(e) => setNewParcel({ ...newParcel, parcelId: e.target.value })}
                    placeholder="e.g. NX-PARCEL-9988"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Assign Delivery Boy</label>
                    <select
                      value={newParcel.deliveryBoyId}
                      onChange={(e) => setNewParcel({ ...newParcel, deliveryBoyId: e.target.value })}
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
                    <label className="block font-semibold text-slate-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={newParcel.date}
                      onChange={(e) => setNewParcel({ ...newParcel, date: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Customer Name</label>
                    <input
                      type="text"
                      value={newParcel.customerName}
                      onChange={(e) => setNewParcel({ ...newParcel, customerName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Customer Phone</label>
                    <input
                      type="text"
                      value={newParcel.customerPhone}
                      onChange={(e) => setNewParcel({ ...newParcel, customerPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Status</label>
                    <select
                      value={newParcel.status}
                      onChange={(e) => setNewParcel({ ...newParcel, status: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                    >
                      <option value="SUCCESSFUL">SUCCESSFUL (₹18 / ₹13)</option>
                      <option value="FAILED">FAILED (₹0 Commission)</option>
                      <option value="REATTEMPT">REATTEMPT</option>
                      <option value="ASSIGNED">ASSIGNED</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">COD Amount (₹)</label>
                    <input
                      type="number"
                      value={newParcel.codAmount}
                      onChange={(e) => setNewParcel({ ...newParcel, codAmount: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 shadow-md shadow-emerald-600/30"
                >
                  Save Parcel Delivery Record
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: BULK CSV IMPORT */}
        {showBulkModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  Bulk Import Deliveries via CSV / Excel
                </h3>
                <button
                  onClick={() => {
                    setShowBulkModal(false);
                    setBulkPreview(null);
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalError && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-semibold">
                  {modalError}
                </div>
              )}

              <div className="space-y-3 text-xs">
                <p className="text-slate-500">
                  Upload a CSV file containing columns: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">parcelId</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">deliveryBoyId</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">status</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">area</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">codAmount</code>.
                </p>

                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileChange}
                  className="w-full p-2 border border-dashed border-slate-300 rounded-xl text-xs bg-slate-50 cursor-pointer"
                />

                {bulkLoading && (
                  <div className="text-center p-4 text-emerald-600 font-bold">Validating file content...</div>
                )}

                {/* Validation Statistics Preview */}
                {bulkPreview && bulkPreview.summary && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900">Validation Statistics Summary</h4>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 bg-white rounded-lg border border-slate-200">
                        <span className="text-slate-500 block">Total Rows</span>
                        <strong className="text-slate-900 text-sm">{bulkPreview.summary.totalRows}</strong>
                      </div>
                      <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                        <span className="text-emerald-700 block">Valid Deliveries</span>
                        <strong className="text-emerald-700 text-sm">{bulkPreview.summary.validRows}</strong>
                      </div>
                      <div className="p-2 bg-rose-50 rounded-lg border border-rose-200">
                        <span className="text-rose-700 block">Duplicates/Invalid</span>
                        <strong className="text-rose-700 text-sm">
                          {bulkPreview.summary.duplicateCount + bulkPreview.summary.invalidCount}
                        </strong>
                      </div>
                    </div>

                    <button
                      onClick={confirmBulkImport}
                      disabled={bulkLoading || bulkPreview.summary.validRows === 0}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md shadow-emerald-600/30 text-xs transition-all disabled:opacity-50 mt-2"
                    >
                      Confirm & Import {bulkPreview.summary.validRows} Parcels
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
