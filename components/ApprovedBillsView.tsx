'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Bill, User } from '@/lib/types';
import ConfirmModal from './ConfirmModal';

interface ApprovedBillsViewProps {
  bills: Bill[];
  currentUser?: User;
  onViewDetails: (bill: Bill) => void;
  onPrintSlip: (bill: Bill) => void;
  onPayBill?: (
    ticketId: string,
    paymentDetails: { paymentMethod: string; paymentNote?: string; paidBy?: string }
  ) => Promise<void>;
  onBatchPayBills?: (
    ticketIds: string[],
    paymentDetails: { paymentMethod: string; paymentNote?: string; paidBy?: string }
  ) => Promise<void>;
  onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function ApprovedBillsView({
  bills,
  currentUser,
  onViewDetails,
  onPrintSlip,
  onPayBill,
  onBatchPayBills,
  onShowToast,
}: ApprovedBillsViewProps) {
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSupportAgent, setSelectedSupportAgent] = useState('ALL');
  const [statusTab, setStatusTab] = useState<'ALL' | 'UNPAID' | 'PAID'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Selection for Batch Payment (Accounts)
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
  const [isBatchPayOpen, setIsBatchPayOpen] = useState(false);

  // Single Bill Payment State
  const [billToPay, setBillToPay] = useState<Bill | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentNote, setPaymentNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Only Approved and Paid bills are part of this ledger
  const ledgerBills = useMemo(
    () => bills.filter((b) => b.status === 'Approved' || b.status === 'Paid'),
    [bills]
  );

  const unpaidCount = useMemo(
    () => ledgerBills.filter((b) => b.status === 'Approved').length,
    [ledgerBills]
  );
  const paidCount = useMemo(
    () => ledgerBills.filter((b) => b.status === 'Paid').length,
    [ledgerBills]
  );

  // Unique support staff list with stats
  const supportAgentsList = useMemo(() => {
    const map = new Map<string, { name: string; count: number; totalTk: number }>();
    for (const b of ledgerBills) {
      const name = b.created_by?.trim() || 'Unknown Support';
      const existing = map.get(name) || { name, count: 0, totalTk: 0 };
      existing.count += 1;
      existing.totalTk += Number(b.amount) || 0;
      map.set(name, existing);
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [ledgerBills]);

  // Filter bills
  const filteredBills = useMemo(() => {
    return ledgerBills.filter((b) => {
      // Tab filter
      if (statusTab === 'UNPAID' && b.status !== 'Approved') return false;
      if (statusTab === 'PAID' && b.status !== 'Paid') return false;

      // Support agent dropdown filter
      if (selectedSupportAgent !== 'ALL') {
        const creator = (b.created_by || '').toLowerCase();
        if (!creator.includes(selectedSupportAgent.toLowerCase())) {
          return false;
        }
      }

      // Search matching support name, ticket id, user id, description, paid by
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const ticketMatch = b.ticket_id.toLowerCase().includes(q);
        const userMatch = b.user_id.toLowerCase().includes(q);
        const descMatch = b.description.toLowerCase().includes(q);
        const supportMatch = (b.created_by || '').toLowerCase().includes(q);
        const paidByMatch = (b.paid_by || '').toLowerCase().includes(q);
        if (!ticketMatch && !userMatch && !descMatch && !supportMatch && !paidByMatch) {
          return false;
        }
      }

      // Date range filter
      if (startDate || endDate) {
        const billDate = new Date(b.date);
        if (startDate && billDate < new Date(startDate)) return false;
        if (endDate && billDate > new Date(endDate)) return false;
      }

      return true;
    });
  }, [ledgerBills, statusTab, selectedSupportAgent, search, startDate, endDate]);

  const totalAmountTk = useMemo(
    () => filteredBills.reduce((sum, b) => sum + (Number(b.amount) || 0), 0),
    [filteredBills]
  );

  const totalPages = Math.max(1, Math.ceil(filteredBills.length / pageSize));
  const paginatedBills = useMemo(
    () => filteredBills.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredBills, currentPage, pageSize]
  );

  // Eligible unpaid bills for selection in the current filtered list
  const eligibleUnpaidBills = useMemo(
    () => filteredBills.filter((b) => b.status === 'Approved'),
    [filteredBills]
  );

  const handleSelectAllUnpaid = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTicketIds(eligibleUnpaidBills.map((b) => b.ticket_id));
    } else {
      setSelectedTicketIds([]);
    }
  };

  const handleToggleSelect = (ticketId: string) => {
    setSelectedTicketIds((prev) =>
      prev.includes(ticketId) ? prev.filter((id) => id !== ticketId) : [...prev, ticketId]
    );
  };

  const handleConfirmSinglePayment = async () => {
    if (!billToPay || !onPayBill) return;
    setIsProcessing(true);
    try {
      await onPayBill(billToPay.ticket_id, {
        paymentMethod,
        paymentNote: paymentNote.trim() || undefined,
        paidBy: currentUser?.name || 'Accounts Staff',
      });
      if (onShowToast) {
        onShowToast(`Bill ${billToPay.ticket_id} has been marked as Paid!`, 'success');
      }
      setSelectedTicketIds((prev) => prev.filter((id) => id !== billToPay.ticket_id));
      setBillToPay(null);
      setPaymentNote('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmBatchPayment = async () => {
    if (selectedTicketIds.length === 0 || !onBatchPayBills) return;
    setIsProcessing(true);
    try {
      await onBatchPayBills(selectedTicketIds, {
        paymentMethod,
        paymentNote: paymentNote.trim() || undefined,
        paidBy: currentUser?.name || 'Accounts Staff',
      });
      if (onShowToast) {
        onShowToast(`${selectedTicketIds.length} bills have been marked as Paid!`, 'success');
      }
      setSelectedTicketIds([]);
      setIsBatchPayOpen(false);
      setPaymentNote('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportCSV = () => {
    const params = new URLSearchParams({ status: statusTab === 'PAID' ? 'Paid' : 'Approved' });
    if (currentUser?.role) params.set('role', currentUser.role);
    if (currentUser?.user_id) params.set('userId', currentUser.user_id);
    if (currentUser?.name) params.set('userName', currentUser.name);

    const link = document.createElement('a');
    link.href = `/api/bills/export?${params.toString()}`;
    link.download = `NetBill_Ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (onShowToast) {
      onShowToast('Downloading bills CSV audit ledger...', 'info');
    }
  };

  const isAccountsOrAdmin = currentUser?.role === 'accounts' || currentUser?.role === 'admin';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-4 w-full"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest p-4 sm:p-5 rounded-xl border border-outline-variant/30 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-on-surface">Accounts & Ledger</h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Disbursement
            </span>
          </div>
          <p className="text-xs text-secondary mt-0.5">
            Accounts Clearance: Disburse approved bills, record payments, and track payout audit records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-xs">
            <span className="text-secondary mr-1">Filtered Total:</span>
            <strong className="text-teal-800 font-data-mono font-bold">
              ৳{totalAmountTk.toLocaleString()} ({filteredBills.length})
            </strong>
          </div>

          {isAccountsOrAdmin && selectedTicketIds.length > 0 && onBatchPayBills && (
            <button
              type="button"
              onClick={() => setIsBatchPayOpen(true)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">payments</span>
              <span>Pay Selected ({selectedTicketIds.length})</span>
            </button>
          )}

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

      {/* Tabs: All / Unpaid / Paid */}
      <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-1 text-xs">
        <button
          type="button"
          onClick={() => {
            setStatusTab('ALL');
            setCurrentPage(1);
          }}
          className={`px-3 py-1.5 rounded-t-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
            statusTab === 'ALL'
              ? 'bg-surface-container-lowest text-teal-700 border-b-2 border-teal-600 shadow-xs'
              : 'text-secondary hover:text-on-surface'
          }`}
        >
          <span>All Ledger Bills</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700 font-bold">
            {ledgerBills.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatusTab('UNPAID');
            setCurrentPage(1);
          }}
          className={`px-3 py-1.5 rounded-t-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
            statusTab === 'UNPAID'
              ? 'bg-surface-container-lowest text-amber-700 border-b-2 border-amber-600 shadow-xs'
              : 'text-secondary hover:text-on-surface'
          }`}
        >
          <span>Awaiting Payment</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
            {unpaidCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setStatusTab('PAID');
            setCurrentPage(1);
          }}
          className={`px-3 py-1.5 rounded-t-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
            statusTab === 'PAID'
              ? 'bg-surface-container-lowest text-emerald-700 border-b-2 border-emerald-600 shadow-xs'
              : 'text-secondary hover:text-on-surface'
          }`}
        >
          <span>Paid & Cleared</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
            {paidCount}
          </span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-xs overflow-hidden flex flex-col">
        <div className="p-3 bg-surface-bright flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-outline-variant/20 text-xs">
          {/* Search by support name or ticket */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-secondary text-base pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search Support Staff Name, Ticket #, Subscriber ID, description..."
              className="w-full pl-8 pr-8 py-2 bg-surface text-on-surface rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600 font-medium placeholder:text-secondary/70"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2 text-secondary hover:text-on-surface p-0.5 rounded cursor-pointer"
                title="Clear search"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>

          {/* Support Staff Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-secondary font-medium whitespace-nowrap hidden lg:inline">
              Support Staff:
            </span>
            <select
              value={selectedSupportAgent}
              onChange={(e) => {
                setSelectedSupportAgent(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-surface px-2.5 py-2 rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600 font-medium text-xs text-on-surface cursor-pointer w-full md:w-auto"
            >
              <option value="ALL">All Support Staff ({ledgerBills.length})</option>
              {supportAgentsList.map((agent) => (
                <option key={agent.name} value={agent.name}>
                  {agent.name} ({agent.count} bills · ৳{agent.totalTk.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-surface px-2 py-1.5 rounded-lg border border-outline-variant/40 focus:outline-none font-mono text-xs"
              title="Start Date"
            />
            <span className="text-secondary">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-surface px-2 py-1.5 rounded-lg border border-outline-variant/40 focus:outline-none font-mono text-xs"
              title="End Date"
            />
          </div>
        </div>

        {/* Filter Summary & Quick Reset */}
        {(selectedSupportAgent !== 'ALL' || search || startDate || endDate) && (
          <div className="px-3 py-2 bg-surface flex items-center justify-between text-xs border-b border-outline-variant/20">
            <span className="text-teal-700 font-medium">
              Filtered Result: <strong>{filteredBills.length}</strong> bills matching criteria (৳{totalAmountTk.toLocaleString()})
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedSupportAgent('ALL');
                setSearch('');
                setStartDate('');
                setEndDate('');
                setCurrentPage(1);
              }}
              className="text-secondary hover:text-rose-600 hover:bg-rose-50 px-2 py-0.5 rounded transition-colors font-medium cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead>
              <tr className="bg-surface-container-low text-secondary uppercase tracking-wider h-10">
                {isAccountsOrAdmin && (
                  <th className="px-4 w-10">
                    <input
                      type="checkbox"
                      checked={
                        eligibleUnpaidBills.length > 0 &&
                        eligibleUnpaidBills.every((b) => selectedTicketIds.includes(b.ticket_id))
                      }
                      onChange={handleSelectAllUnpaid}
                      className="accent-emerald-600 rounded cursor-pointer"
                      title="Select all unpaid bills"
                      aria-label="Select all unpaid bills"
                    />
                  </th>
                )}
                <th className="px-3 font-semibold">Ticket ID</th>
                <th className="px-3 font-semibold">User ID</th>
                <th className="px-3 font-semibold">Support Staff</th>
                <th className="px-3 font-semibold">Date</th>
                <th className="px-3 font-semibold">Status</th>
                <th className="px-3 font-semibold">Description</th>
                <th className="px-3 font-semibold">Amount (TK)</th>
                <th className="px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {paginatedBills.length === 0 ? (
                <tr>
                  <td colSpan={isAccountsOrAdmin ? 9 : 8} className="py-12 text-center text-secondary">
                    <span className="material-symbols-outlined text-3xl text-teal-600 mb-1 block">
                      search_off
                    </span>
                    No bills found matching your current filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedBills.map((bill) => {
                  const isPaid = bill.status === 'Paid';

                  return (
                    <tr
                      key={bill.id}
                      className={`hover:bg-surface-container-low/60 transition-colors h-14 ${
                        selectedTicketIds.includes(bill.ticket_id) ? 'bg-emerald-50/50' : ''
                      }`}
                    >
                      {isAccountsOrAdmin && (
                        <td className="px-4">
                          {!isPaid ? (
                            <input
                              type="checkbox"
                              checked={selectedTicketIds.includes(bill.ticket_id)}
                              onChange={() => handleToggleSelect(bill.ticket_id)}
                              className="accent-emerald-600 rounded cursor-pointer"
                              aria-label={`Select ticket ${bill.ticket_id}`}
                            />
                          ) : (
                            <span
                              className="material-symbols-outlined text-emerald-600 text-base"
                              title="Bill is Paid"
                            >
                              task_alt
                            </span>
                          )}
                        </td>
                      )}
                      <td className="px-3 font-data-mono font-bold text-teal-700">
                        {bill.ticket_id}
                      </td>
                      <td className="px-3 font-data-mono text-secondary">
                        {bill.user_id}
                      </td>
                      <td className="px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 font-medium text-[11px] border border-teal-200">
                          <span className="material-symbols-outlined text-xs">person</span>
                          <span className="truncate max-w-[120px]">
                            {bill.created_by || 'Support Staff'}
                          </span>
                        </span>
                      </td>
                      <td className="px-3 text-secondary font-data-mono">
                        {bill.date}
                      </td>
                      <td className="px-3 whitespace-nowrap">
                        {isPaid ? (
                          <div className="flex flex-col">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 w-fit">
                              <span className="material-symbols-outlined text-xs">check_circle</span>
                              <span>PAID</span>
                            </span>
                            {bill.paid_by && (
                              <span className="text-[10px] text-emerald-700 mt-0.5 truncate max-w-[120px]" title={`Paid by ${bill.paid_by}`}>
                                By: {bill.paid_by}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300 w-fit">
                            <span className="material-symbols-outlined text-xs">schedule</span>
                            <span>Awaiting Pay</span>
                          </span>
                        )}
                      </td>
                      <td className="px-3 max-w-xs truncate text-on-surface">
                        {bill.description}
                      </td>
                      <td className="px-3 font-data-mono font-bold text-on-surface">
                        ৳{bill.amount.toLocaleString()}
                      </td>
                      <td className="px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Accounts Pay Action */}
                          {isAccountsOrAdmin && !isPaid && onPayBill && (
                            <button
                              type="button"
                              onClick={() => {
                                setBillToPay(bill);
                                setPaymentMethod('Cash');
                                setPaymentNote('');
                              }}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                              title="Disburse / Mark Bill as Paid"
                            >
                              <span className="material-symbols-outlined text-sm">payments</span>
                              <span>Pay Bill</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => onPrintSlip(bill)}
                            className="px-2.5 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-700 font-medium transition-colors flex items-center gap-1 cursor-pointer"
                            title="Generate Slip / Voucher"
                          >
                            <span className="material-symbols-outlined text-sm">print</span>
                            <span className="hidden sm:inline">Slip</span>
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Minimal Pagination */}
        {totalPages > 1 && (
          <div className="p-3 bg-surface-bright flex items-center justify-between text-xs border-t border-outline-variant/20">
            <span className="text-secondary">
              Page {currentPage} of {totalPages} ({filteredBills.length} total)
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded border border-outline-variant/40 disabled:opacity-40 cursor-pointer hover:bg-surface"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded border border-outline-variant/40 disabled:opacity-40 cursor-pointer hover:bg-surface"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Single Payment Modal */}
      <ConfirmModal
        isOpen={!!billToPay}
        title="Disburse & Mark Bill as Paid"
        confirmText="Confirm Payment (PAID)"
        confirmVariant="primary"
        isLoading={isProcessing}
        onClose={() => setBillToPay(null)}
        onConfirm={handleConfirmSinglePayment}
      >
        {billToPay && (
          <div className="flex flex-col gap-3 text-xs">
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span className="text-secondary font-medium">Ticket ID:</span>
                <span className="font-mono font-bold text-teal-800">{billToPay.ticket_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary font-medium">Subscriber / User ID:</span>
                <span className="font-mono font-semibold text-on-surface">{billToPay.user_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary font-medium">Support Staff:</span>
                <span className="font-semibold text-teal-700">{billToPay.created_by || 'Support Staff'}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-emerald-200">
                <span className="text-on-surface font-bold">Disbursement Amount:</span>
                <span className="text-base font-data-mono font-bold text-emerald-800">
                  ৳{billToPay.amount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-secondary uppercase text-[11px]">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="p-2 bg-surface rounded-lg border border-outline-variant/40 focus:outline-none focus:border-emerald-600 text-xs text-on-surface"
              >
                <option value="Cash">Cash at Counter</option>
                <option value="Bank Transfer">Bank Transfer / EFT</option>
                <option value="bKash / Nagad">Mobile Banking (bKash / Nagad)</option>
                <option value="Cheque">Bank Cheque</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-secondary uppercase text-[11px]">
                Voucher / Payment Reference Note (Optional)
              </label>
              <input
                type="text"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="e.g. Voucher #V-9042, TxID 8X9J21..."
                className="p-2 bg-surface rounded-lg border border-outline-variant/40 focus:outline-none focus:border-emerald-600 text-xs"
              />
            </div>
          </div>
        )}
      </ConfirmModal>

      {/* Batch Payment Modal */}
      <ConfirmModal
        isOpen={isBatchPayOpen}
        title="Batch Disburse & Mark as Paid"
        confirmText={`Confirm Payment for ${selectedTicketIds.length} Bills`}
        confirmVariant="primary"
        isLoading={isProcessing}
        onClose={() => setIsBatchPayOpen(false)}
        onConfirm={handleConfirmBatchPayment}
      >
        <div className="flex flex-col gap-3 text-xs">
          <p className="text-secondary">
            You are processing payment for <strong>{selectedTicketIds.length}</strong> selected bills.
            All will be updated to status <strong className="text-emerald-700">PAID</strong> under Accounts Ledger.
          </p>

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-secondary uppercase text-[11px]">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="p-2 bg-surface rounded-lg border border-outline-variant/40 focus:outline-none focus:border-emerald-600 text-xs text-on-surface"
            >
              <option value="Cash">Cash at Counter</option>
              <option value="Bank Transfer">Bank Transfer / EFT</option>
              <option value="bKash / Nagad">Mobile Banking (bKash / Nagad)</option>
              <option value="Cheque">Bank Cheque</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-secondary uppercase text-[11px]">
              Batch Reference / Voucher Note
            </label>
            <input
              type="text"
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              placeholder="e.g. Batch Clearance Ledger Slip #44..."
              className="p-2 bg-surface rounded-lg border border-outline-variant/40 focus:outline-none focus:border-emerald-600 text-xs"
            />
          </div>
        </div>
      </ConfirmModal>
    </motion.div>
  );
}
