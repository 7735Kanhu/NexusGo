'use client';

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Banknote,
  Calculator,
  Printer,
  CheckCircle2,
  DollarSign,
  Send,
  X,
  CreditCard,
  FileText,
} from 'lucide-react';

export default function PaymentsPage() {
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [paymentsList, setPaymentsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Settlement Transaction Modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedDriverPay, setSelectedDriverPay] = useState<any>(null);
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState<'CASH' | 'BANK_TRANSFER' | 'UPI'>('UPI');
  const [txId, setTxId] = useState('');
  const [notes, setNotes] = useState('');
  const [payLoading, setPayLoading] = useState(false);

  // Printable Receipt Modal
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/payments?month=${selectedMonth}`);
      const json = await res.json();
      if (res.ok) {
        setPaymentsList(json.list || []);
      }
    } catch (err) {
      console.error('Fetch payments error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [selectedMonth]);

  const openPayModal = (item: any) => {
    setSelectedDriverPay(item);
    setPayAmount(item.remaining > 0 ? item.remaining : item.netPayable);
    setTxId(`TXN-${Date.now().toString().slice(-8)}`);
    setShowPayModal(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriverPay) return;
    setPayLoading(true);

    try {
      const res = await fetch('/api/admin/payments/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: selectedDriverPay.paymentRecordId,
          deliveryBoyId: selectedDriverPay.driver._id,
          month: selectedMonth,
          amount: payAmount,
          paymentMethod: payMethod,
          transactionId: txId,
          notes,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Payment failed');

      alert(json.message);
      setShowPayModal(false);
      fetchPayments();
    } catch (err: any) {
      alert(err.message || 'Error processing payment');
    } finally {
      setPayLoading(false);
    }
  };

  const openReceipt = (item: any) => {
    setReceiptData(item);
    setShowReceiptModal(true);
  };

  const printReceipt = () => {
    window.print();
  };

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Driver Payroll & Monthly Payments</h1>
            <p className="text-sm text-slate-500">
              Net Payable = (Successful Parcels × ₹13) + Bonus + Expenses - Advances - Deductions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-white shadow-sm"
            />
          </div>
        </div>

        {/* Payments Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-slate-500 text-xs font-semibold">Total Monthly Gross Commission</span>
            <p className="text-2xl font-extrabold text-slate-900">
              {formatCurrency(
                paymentsList.reduce((acc, p) => acc + (p.grossCommission || 0), 0)
              )}
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-slate-500 text-xs font-semibold">Total Net Payable</span>
            <p className="text-2xl font-extrabold text-emerald-700">
              {formatCurrency(
                paymentsList.reduce((acc, p) => acc + (p.netPayable || 0), 0)
              )}
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-slate-500 text-xs font-semibold">Total Remaining Unpaid</span>
            <p className="text-2xl font-extrabold text-amber-600">
              {formatCurrency(
                paymentsList.reduce((acc, p) => acc + (p.remaining || 0), 0)
              )}
            </p>
          </div>
        </div>

        {/* Payments List Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-xs">
          {loading ? (
            <div className="p-8 text-center text-slate-400">Calculating monthly payouts...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Delivery Boy</th>
                    <th className="py-3 px-4">Payout Type</th>
                    <th className="py-3 px-4">Successful Parcels</th>
                    <th className="py-3 px-4">Gross Earnings</th>
                    <th className="py-3 px-4">Bonus</th>
                    <th className="py-3 px-4">Approved Exp.</th>
                    <th className="py-3 px-4">Advances</th>
                    <th className="py-3 px-4">Deductions</th>
                    <th className="py-3 px-4">Net Payable</th>
                    <th className="py-3 px-4">Paid</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {paymentsList.map((item) => {
                    const isSalary = item.driver?.paymentType === 'SALARY';
                    return (
                      <tr key={item.driver._id} className="hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <strong className="text-slate-900 block">{item.driver.fullName}</strong>
                          <span className="font-mono text-[10px] text-slate-400">
                            {item.driver.deliveryBoyId}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isSalary
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isSalary ? 'FIXED SALARY' : 'COMMISSION'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {item.totalSuccessfulDeliveries} Parcels
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {formatCurrency(item.grossCommission)}
                        </td>
                      <td className="py-3 px-4 text-emerald-700 font-bold">
                        +{formatCurrency(item.bonus)}
                      </td>
                      <td className="py-3 px-4 text-emerald-700 font-bold">
                        +{formatCurrency(item.approvedExpenses)}
                      </td>
                      <td className="py-3 px-4 text-rose-600 font-bold">
                        -{formatCurrency(item.advances)}
                      </td>
                      <td className="py-3 px-4 text-rose-600 font-bold">
                        -{formatCurrency(item.deductions)}
                      </td>
                      <td className="py-3 px-4 font-black text-emerald-700 text-sm">
                        {formatCurrency(item.netPayable)}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {formatCurrency(item.alreadyPaid)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'PARTIALLY_PAID'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openReceipt(item)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                            title="Print Payment Receipt"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openPayModal(item)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px]"
                          >
                            Settle Payment
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              </table>
            </div>
          )}
        </div>

        {/* MODAL 1: SETTLE PAYMENT TRANSACTION */}
        {showPayModal && selectedDriverPay && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-base">
                  Record Payout: {selectedDriverPay.driver.fullName}
                </h3>
                <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                  <div className="flex justify-between text-slate-700">
                    <span>Net Payable:</span>
                    <strong>{formatCurrency(selectedDriverPay.netPayable)}</strong>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Already Paid:</span>
                    <strong>{formatCurrency(selectedDriverPay.alreadyPaid)}</strong>
                  </div>
                  <div className="flex justify-between text-emerald-900 font-extrabold border-t border-emerald-200 pt-1">
                    <span>Remaining Balance:</span>
                    <span>{formatCurrency(selectedDriverPay.remaining)}</span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount to Pay Now (₹) *</label>
                  <input
                    type="number"
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                    <option value="BANK_TRANSFER">Bank IMPS / NEFT Transfer</option>
                    <option value="CASH">Hand Cash Payment</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Transaction Ref / ID</label>
                  <input
                    type="text"
                    value={txId}
                    onChange={(e) => setTxId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={payLoading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md shadow-emerald-600/30 transition-all"
                >
                  {payLoading ? 'Processing...' : 'Confirm & Save Payment Record'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: PRINTABLE PAYMENT RECEIPT */}
        {showReceiptModal && receiptData && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 printable-receipt">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center">
                    NG
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">NexusGo Logistics</h3>
                    <p className="text-[10px] text-slate-500">Official Delivery Driver Payout Receipt</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="text-slate-400 hover:text-slate-600 no-print"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Driver & Statement Header */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block">Driver Name</span>
                  <strong className="text-slate-900 text-sm">{receiptData.driver.fullName}</strong>
                  <span className="block text-[11px] text-slate-500 font-mono">
                    ID: {receiptData.driver.deliveryBoyId}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block">Month / Date</span>
                  <strong className="text-slate-900 text-sm">{receiptData.month}</strong>
                  <span className="block text-[11px] text-emerald-700 font-bold">
                    Status: {receiptData.status}
                  </span>
                </div>
              </div>

              {/* Financial Calculation Itemization */}
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Successful Deliveries:</span>
                  <strong>{receiptData.totalSuccessfulDeliveries} Parcels</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>Commission Rate:</span>
                  <strong>₹{receiptData.commissionRate} / parcel</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 font-bold text-slate-900">
                  <span>Gross Commission:</span>
                  <span>{formatCurrency(receiptData.grossCommission)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-700">
                  <span>+ Performance Bonus:</span>
                  <span>+{formatCurrency(receiptData.bonus)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-700">
                  <span>+ Approved Expenses:</span>
                  <span>+{formatCurrency(receiptData.approvedExpenses)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 text-rose-600">
                  <span>- Cash Advances Deducted:</span>
                  <span>-{formatCurrency(receiptData.advances)}</span>
                </div>
                <div className="flex justify-between py-2 bg-emerald-900 text-white px-3 rounded-lg font-extrabold text-sm mt-2">
                  <span>NET PAYABLE AMOUNT:</span>
                  <span>{formatCurrency(receiptData.netPayable)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between no-print pt-2">
                <button
                  onClick={printReceipt}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
