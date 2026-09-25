'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Bill } from '@/lib/types';
import Logo from './Logo';

interface BillVoucherModalProps {
  bill: Bill | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BillVoucherModal({
  bill,
  isOpen,
  onClose,
}: BillVoucherModalProps) {
  if (!isOpen || !bill) return null;

  const baseAmount = bill.amount;
  // const vatAmount = Math.round(baseAmount * 0.05 * 100) / 100;
  const vatAmount = 0;
  const totalWithVat = baseAmount + vatAmount;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white text-slate-900 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden p-6 border border-slate-200 my-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div id="printable-voucher" className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start justify-between border-b pb-3 border-slate-200">
            <div className="flex items-center gap-2.5">
              <Logo className="h-8 w-8" />
              <div>
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                  FnF Online Operations
                </h2>
                <p className="text-[11px] text-slate-500 font-mono">
                  Official Service Voucher
                </p>
              </div>
            </div>
            <div className="text-right">
              <span
                className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold uppercase border ${bill.status === 'Paid'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-teal-50 text-teal-700 border-teal-200'
                  }`}
              >
                {bill.status === 'Paid' ? 'PAID & CLEARED' : `${bill.status} VOUCHER`}
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                REF #{bill.ticket_id}
              </p>
            </div>
          </div>

          {/* Meta Grid */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="block text-[10px] uppercase text-slate-500 font-semibold">
                Subscriber ID
              </span>
              <span className="font-mono font-bold text-slate-900">
                {bill.user_id}
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-slate-500 font-semibold">
                Billing Date
              </span>
              <span className="font-mono text-slate-900">
                {bill.date}
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-slate-500 font-semibold">
                Ticket ID
              </span>
              <span className="font-mono font-bold text-teal-700">
                {bill.ticket_id}
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase text-slate-500 font-semibold">
                Authorized By
              </span>
              <span className="text-slate-900 text-xs truncate block">
                {bill.created_by || 'Staff'}
              </span>
            </div>
          </div>

          {bill.status === 'Paid' && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs flex flex-col gap-1">
              <div className="flex items-center justify-between font-bold text-emerald-800">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  <span>ACCOUNTS PAYMENT RECEIPT</span>
                </span>
                <span className="font-mono">{bill.payment_method || 'Cash'}</span>
              </div>
              <div className="flex justify-between text-emerald-900 text-[11px]">
                <span>Disbursed By: <strong>{bill.paid_by || 'Accounts Staff'}</strong></span>
                {bill.paid_at && (
                  <span className="font-mono">{new Date(bill.paid_at).toLocaleDateString()}</span>
                )}
              </div>
              {bill.payment_note && (
                <p className="text-[11px] text-emerald-800 pt-0.5 border-t border-emerald-200">
                  Ref Note: {bill.payment_note}
                </p>
              )}
            </div>
          )}

          {/* Line Item Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-600 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2 px-3">Description</th>
                  <th className="py-2 px-3 text-right">Amount (TK)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2.5 px-3 text-slate-800">
                    <p className="font-medium">{bill.description}</p>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                    ৳{baseAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 text-slate-500">VAT (0%)</td>
                  <td className="py-1.5 px-3 text-right font-mono text-slate-600">
                    ৳{vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr className="bg-slate-50 font-bold">
                  <td className="py-2.5 px-3 text-slate-900">Total Payable (TK)</td>
                  <td className="py-2.5 px-3 text-right font-mono text-sm text-teal-700">
                    ৳{totalWithVat.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 print:hidden">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">print</span>
              <span>Print Slip</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
