'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Bill } from '@/lib/types';

interface BillDetailModalProps {
  bill: Bill | null;
  isOpen: boolean;
  onClose: () => void;
  onPrintVoucher?: (bill: Bill) => void;
}

export default function BillDetailModal({
  bill,
  isOpen,
  onClose,
  onPrintVoucher,
}: BillDetailModalProps) {
  if (!isOpen || !bill) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">check_circle</span>
            Paid & Cleared
          </span>
        );
      case 'Approved':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
            Approved (Unpaid)
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Pending
          </span>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-surface-container-lowest rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-outline-variant/30 text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 bg-surface-bright flex items-center justify-between border-b border-outline-variant/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">receipt_long</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-on-surface font-mono">
                {bill.ticket_id}
              </h3>
              <span className="text-secondary">{bill.user_id}</span>
            </div>
          </div>
          <button
            className="text-secondary hover:text-on-surface cursor-pointer p-1 rounded hover:bg-surface-container"
            onClick={onClose}
            type="button"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <span className="text-secondary font-semibold uppercase">Status</span>
            {getStatusBadge(bill.status)}
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-surface-container-low border border-outline-variant/20">
            <div>
              <span className="block text-[11px] text-secondary">Amount (TK)</span>
              <span className="text-base font-bold text-teal-800 font-data-mono">
                ৳{bill.amount.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="block text-[11px] text-secondary">Date</span>
              <span className="font-data-mono text-on-surface font-medium">
                {bill.date}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-surface border border-outline-variant/30">
            <span className="text-secondary font-medium">Submitted By (Support):</span>
            <span className="font-semibold text-teal-800">{bill.created_by || 'Support Staff'}</span>
          </div>

          {bill.status === 'Paid' && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex flex-col gap-1.5">
              <div className="flex items-center justify-between font-semibold text-emerald-800">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">payments</span>
                  <span>Payment Disbursed</span>
                </span>
                <span className="text-[11px] font-mono">{bill.payment_method || 'Cash'}</span>
              </div>
              {bill.paid_by && (
                <div className="flex justify-between text-emerald-900 text-[11px]">
                  <span>Disbursed By:</span>
                  <span className="font-semibold">{bill.paid_by}</span>
                </div>
              )}
              {bill.paid_at && (
                <div className="flex justify-between text-emerald-900 text-[11px]">
                  <span>Disbursed At:</span>
                  <span className="font-mono">{new Date(bill.paid_at).toLocaleString()}</span>
                </div>
              )}
              {bill.payment_note && (
                <div className="pt-1 border-t border-emerald-200 text-emerald-900 text-[11px]">
                  <span className="font-medium">Voucher Reference:</span> {bill.payment_note}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <span className="text-secondary font-semibold uppercase text-[11px]">
              Description
            </span>
            <p className="text-on-surface bg-surface p-2.5 rounded-lg border border-outline-variant/30 whitespace-pre-line leading-relaxed">
              {bill.description}
            </p>
          </div>

          {bill.rejection_reason && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <span className="font-bold block">Rejection Reason:</span>
              <span>{bill.rejection_reason}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-surface-bright flex items-center justify-end gap-2 border-t border-outline-variant/20">
          <button
            className="px-3 py-1.5 rounded-lg text-secondary hover:bg-surface-container transition-colors cursor-pointer"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
          <button
            className="px-3.5 py-1.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors flex items-center gap-1.5 shadow-xs font-semibold cursor-pointer"
            onClick={() => onPrintVoucher?.(bill)}
            type="button"
          >
            <span className="material-symbols-outlined text-sm">print</span>
            <span>Print Slip</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
