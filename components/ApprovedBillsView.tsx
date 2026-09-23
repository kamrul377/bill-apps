'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Bill } from '@/lib/types';

interface ApprovedBillsViewProps {
  bills: Bill[];
  onViewDetails: (bill: Bill) => void;
  onPrintSlip: (bill: Bill) => void;
  onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function ApprovedBillsView({
  bills,
  onViewDetails,
  onPrintSlip,
  onShowToast,
}: ApprovedBillsViewProps) {
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Only Approved Bills
  const approvedBills = bills.filter((b) => b.status === 'Approved');

  const filteredBills = approvedBills.filter((b) => {
    const matchesSearch =
      !search ||
      b.ticket_id.toLowerCase().includes(search.toLowerCase()) ||
      b.user_id.toLowerCase().includes(search.toLowerCase()) ||
      b.description.toLowerCase().includes(search.toLowerCase());

    const billDate = new Date(b.date);
    const matchesStart = !startDate || billDate >= new Date(startDate);
    const matchesEnd = !endDate || billDate <= new Date(endDate);

    return matchesSearch && matchesStart && matchesEnd;
  });

  const totalAmountTk = filteredBills.reduce(
    (sum, b) => sum + (Number(b.amount) || 0),
    0
  );

  const totalPages = Math.max(1, Math.ceil(filteredBills.length / pageSize));
  const paginatedBills = filteredBills.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleExportCSV = () => {
    window.open('/api/bills/export', '_blank');
    if (onShowToast) {
      onShowToast('Downloading approved bills CSV audit ledger...', 'info');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-4 w-full"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-on-surface">Approved Bills Ledger</h1>
          <p className="text-xs text-secondary mt-0.5">
            Cleared bills ready for financial reconciliation and invoicing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-xs">
            <span className="text-secondary mr-1">Approved Total:</span>
            <strong className="text-teal-800 font-data-mono font-bold">
              ৳{totalAmountTk.toLocaleString()} ({filteredBills.length})
            </strong>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-xs overflow-hidden flex flex-col">
        <div className="p-3 bg-surface-bright flex flex-col md:flex-row items-center justify-between gap-3 border-b border-outline-variant/20 text-xs">
          <div className="relative w-full md:w-72">
            <span className="material-symbols-outlined absolute left-2.5 top-2 text-secondary text-base">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search Ticket, User ID, or description..."
              className="w-full pl-8 pr-3 py-1.5 bg-surface text-on-surface rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-secondary font-medium">Date Range:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-surface px-2 py-1 rounded-lg border border-outline-variant/40 focus:outline-none font-mono"
            />
            <span className="text-secondary">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-surface px-2 py-1 rounded-lg border border-outline-variant/40 focus:outline-none font-mono"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-surface-container-low text-secondary uppercase tracking-wider h-9">
                <th className="px-4 font-semibold">Ticket ID</th>
                <th className="px-3 font-semibold">User ID</th>
                <th className="px-3 font-semibold">Approval Date</th>
                <th className="px-3 font-semibold">Description</th>
                <th className="px-3 font-semibold">Amount (TK)</th>
                <th className="px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {paginatedBills.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-secondary">
                    No approved bills found.
                  </td>
                </tr>
              ) : (
                paginatedBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-surface-container-low/60 transition-colors h-14">
                    <td className="px-4 font-data-mono font-bold text-teal-700">
                      {bill.ticket_id}
                    </td>
                    <td className="px-3 font-data-mono text-secondary">
                      {bill.user_id}
                    </td>
                    <td className="px-3 text-secondary font-data-mono">
                      {bill.date}
                    </td>
                    <td className="px-3 max-w-sm truncate text-on-surface">
                      {bill.description}
                    </td>
                    <td className="px-3 font-data-mono font-bold text-on-surface">
                      ৳{bill.amount.toLocaleString()}
                    </td>
                    <td className="px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onPrintSlip(bill)}
                          className="px-2.5 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-700 font-medium transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">print</span>
                          <span>Slip</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onViewDetails(bill)}
                          className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-medium transition-colors cursor-pointer"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Minimal Pagination */}
        {totalPages > 1 && (
          <div className="p-3 bg-surface-bright flex items-center justify-between text-xs border-t border-outline-variant/20">
            <span className="text-secondary">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded border border-outline-variant/40 disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded border border-outline-variant/40 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
