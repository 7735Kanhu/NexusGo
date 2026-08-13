'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { formatDate } from '@/lib/utils';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar as CalendarIcon,
  Save,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/attendance?date=${selectedDate}`);
      const json = await res.json();
      if (res.ok) {
        setList(json.list || []);
      }
    } catch (err) {
      console.error('Fetch attendance error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const handleStatusChange = (driverId: string, status: string) => {
    setList((prev) =>
      prev.map((item) => {
        if (item.driver._id === driverId) {
          return {
            ...item,
            attendance: {
              ...item.attendance,
              status,
            },
          };
        }
        return item;
      })
    );
  };

  const handleMarkAll = (status: string) => {
    setList((prev) =>
      prev.map((item) => ({
        ...item,
        attendance: {
          ...item.attendance,
          status,
        },
      }))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const records = list.map((item) => ({
        deliveryBoyId: item.driver._id,
        status: item.attendance.status,
        loginTime: item.attendance.loginTime || '08:30 AM',
        logoutTime: item.attendance.logoutTime || '06:30 PM',
        remarks: item.attendance.remarks || '',
      }));

      const res = await fetch('/api/admin/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          records,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save attendance');

      setMessage(json.message || 'Attendance saved successfully!');
      fetchAttendance();
    } catch (err: any) {
      alert(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance Management</h1>
            <p className="text-sm text-slate-500">
              Daily attendance marking matrix, monthly calendar & driver shift logs
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-white shadow-sm"
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Attendance'}</span>
            </button>
          </div>
        </div>

        {message && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        {/* Quick Mark All Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="font-bold text-slate-700">Quick Mark All Active Drivers:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleMarkAll('PRESENT')}
              className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold hover:bg-emerald-200 transition-colors"
            >
              Mark All Present
            </button>
            <button
              onClick={() => handleMarkAll('ABSENT')}
              className="px-3 py-1.5 rounded-lg bg-rose-100 text-rose-800 font-bold hover:bg-rose-200 transition-colors"
            >
              Mark All Absent
            </button>
            <button
              onClick={() => handleMarkAll('WEEKLY_OFF')}
              className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
            >
              Weekly Off
            </button>
          </div>
        </div>

        {/* Attendance Matrix Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-xs">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Loading attendance data...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Delivery Boy</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Login Time</th>
                    <th className="py-3 px-4">Logout Time</th>
                    <th className="py-3 px-4">Shift Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {list.map((item) => {
                    const { driver, attendance } = item;
                    return (
                      <tr key={driver._id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={driver.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                              alt={driver.fullName}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <strong className="text-slate-900 block">{driver.fullName}</strong>
                              <span className="font-mono text-[10px] text-slate-400">
                                {driver.deliveryBoyId} (+91 {driver.phone})
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={attendance.status}
                            onChange={(e) => handleStatusChange(driver._id, e.target.value)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${
                              attendance.status === 'PRESENT'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : attendance.status === 'ABSENT'
                                ? 'bg-rose-50 text-rose-800 border-rose-300'
                                : 'bg-slate-100 text-slate-700 border-slate-300'
                            }`}
                          >
                            <option value="PRESENT">PRESENT</option>
                            <option value="ABSENT">ABSENT</option>
                            <option value="HALF_DAY">HALF DAY</option>
                            <option value="LEAVE">LEAVE</option>
                            <option value="WEEKLY_OFF">WEEKLY OFF</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={attendance.loginTime || '08:30 AM'}
                            onChange={(e) => {
                              const val = e.target.value;
                              setList((prev) =>
                                prev.map((i) =>
                                  i.driver._id === driver._id
                                    ? { ...i, attendance: { ...i.attendance, loginTime: val } }
                                    : i
                                )
                              );
                            }}
                            className="px-2.5 py-1 border border-slate-200 rounded-lg text-xs font-mono"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={attendance.logoutTime || '06:30 PM'}
                            onChange={(e) => {
                              const val = e.target.value;
                              setList((prev) =>
                                prev.map((i) =>
                                  i.driver._id === driver._id
                                    ? { ...i, attendance: { ...i.attendance, logoutTime: val } }
                                    : i
                                )
                              );
                            }}
                            className="px-2.5 py-1 border border-slate-200 rounded-lg text-xs font-mono"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            value={attendance.remarks || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setList((prev) =>
                                prev.map((i) =>
                                  i.driver._id === driver._id
                                    ? { ...i, attendance: { ...i.attendance, remarks: val } }
                                    : i
                                )
                              );
                            }}
                            placeholder="Optional shift notes..."
                            className="w-full px-2.5 py-1 border border-slate-200 rounded-lg text-xs"
                          />
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
