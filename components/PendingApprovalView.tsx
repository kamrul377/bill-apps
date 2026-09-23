'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Bill, User } from '@/lib/types';
import ConfirmModal from './ConfirmModal';

interface PendingApprovalViewProps {
  bills: Bill[];
  currentUser: User;
  onUpdateStatus: (ticketId: string, status: 'Approved' | 'Rejected', reason?: string) => Promise<void>;
  onBatchApprove: (ticketIds: string[]) => Promise<void>;
  onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function PendingApprovalView({
  bills,
  currentUser,
  onUpdateStatus,
  onBatchApprove,
  onShowToast,
}: PendingApprovalViewProps) {
  const [selectedTicketIds, setSelectedTicketIds] = useState<string[]>([]);
  const [activeBillForAction, setActiveBillForAction] = useState<Bill | null>(null);
  const [actionType, setActionType] = useState<'Approved' | 'Rejected' | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isBatchConfirmOpen, setIsBatchConfirmOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter only Pending bills
  const pendingBills = bills.filter((b) => b.status === 'Pending');
  const pendingTotalTk = pendingBills.reduce((acc, b) => acc + (Number(b.amount) || 0), 0);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTicketIds(pendingBills.map((b) => b.ticket_id));
    } else {
      setSelectedTicketIds([]);
    }
  };

  const handleToggleSelect = (ticketId: string) => {
    setSelectedTicketIds((prev) =>
      prev.includes(ticketId) ? prev.filter((id) => id !== ticketId) : [...prev, ticketId]
    );
  };

  const handleConfirmSingleAction = async () => {
    if (!activeBillForAction || !actionType) return;
    setIsProcessing(true);
    try {
      await onUpdateStatus(
        activeBillForAction.ticket_id,
        actionType,
        actionType === 'Rejected' ? rejectReason : undefined
      );
      if (onShowToast) {
        onShowToast(
          `Bill ${activeBillForAction.ticket_id} marked as ${actionType}.`,
          actionType === 'Approved' ? 'success' : 'error'
        );
      }
      setSelectedTicketIds((prev) => prev.filter((id) => id !== activeBillForAction.ticket_id));
      setActiveBillForAction(null);
      setActionType(null);
      setRejectReason('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmBatchApprove = async () => {
    if (selectedTicketIds.length === 0) return;
    setIsProcessing(true);
    try {
      await onBatchApprove(selectedTicketIds);
      if (onShowToast) {
        onShowToast(`${selectedTicketIds.length} bills approved successfully.`, 'success');
      }
      setSelectedTicketIds([]);
      setIsBatchConfirmOpen(false);
    } finally {
      setIsProcessing(false);
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
          <h1 className="text-xl font-bold text-on-surface">Pending Approvals</h1>
          <p className="text-xs text-secondary mt-0.5">
            Review and clear submitted service charges.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs">
            <span className="text-secondary mr-1">Queue:</span>
            <strong className="text-amber-800 font-data-mono font-bold">
              {pendingBills.length} Bills (৳{pendingTotalTk.toLocaleString()})
            </strong>
          </div>

          {selectedTicketIds.length > 0 && (
            <button
              type="button"
              onClick={() => setIsBatchConfirmOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">done_all</span>
              <span>Approve Selected ({selectedTicketIds.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-surface-container-low text-secondary uppercase tracking-wider h-9">
                <th className="px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      pendingBills.length > 0 && selectedTicketIds.length === pendingBills.length
                    }
                    onChange={handleSelectAll}
                    className="accent-teal-600 rounded cursor-pointer"
                  />
                </th>
                <th className="px-3 font-semibold">Ticket ID</th>
                <th className="px-3 font-semibold">User ID</th>
                <th className="px-3 font-semibold">Date</th>
                <th className="px-3 font-semibold">Description</th>
                <th className="px-3 font-semibold">Amount</th>
                <th className="px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {pendingBills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-secondary">
                    <span className="material-symbols-outlined text-3xl text-teal-600 mb-1 block">
                      check_circle
                    </span>
                    No pending bills awaiting approval.
                  </td>
                </tr>
              ) : (
                pendingBills.map((bill) => (
                  <tr
                    key={bill.id}
                    className={`hover:bg-surface-container-low/60 transition-colors h-14 ${
                      selectedTicketIds.includes(bill.ticket_id) ? 'bg-teal-50/50' : ''
                    }`}
                  >
                    <td className="px-4">
                      <input
                        type="checkbox"
                        checked={selectedTicketIds.includes(bill.ticket_id)}
                        onChange={() => handleToggleSelect(bill.ticket_id)}
                        className="accent-teal-600 rounded cursor-pointer"
                      />
                    </td>
                    <td className="px-3 font-data-mono font-bold text-teal-700">
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
                          onClick={() => {
                            setActiveBillForAction(bill);
                            setActionType('Approved');
                          }}
                          className="px-2.5 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">check</span>
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveBillForAction(bill);
                            setActionType('Rejected');
                            setRejectReason('');
                          }}
                          className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                          <span>Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog for Single Action */}
      <ConfirmModal
        isOpen={!!activeBillForAction}
        title={actionType === 'Approved' ? 'Approve Service Bill' : 'Reject Service Bill'}
        confirmText={actionType === 'Approved' ? 'Confirm Approval' : 'Confirm Rejection'}
        confirmVariant={actionType === 'Approved' ? 'primary' : 'danger'}
        isLoading={isProcessing}
        onClose={() => {
          setActiveBillForAction(null);
          setActionType(null);
        }}
        onConfirm={handleConfirmSingleAction}
      >
        {activeBillForAction && (
          <div className="flex flex-col gap-3 text-xs">
            <p className="text-secondary">
              Are you sure you want to <strong>{actionType?.toLowerCase()}</strong> ticket{' '}
              <strong className="text-on-surface font-mono">{activeBillForAction.ticket_id}</strong> for{' '}
              <strong className="text-teal-700 font-mono">৳{activeBillForAction.amount.toLocaleString()}</strong>?
            </p>

            {actionType === 'Rejected' && (
              <div className="flex flex-col gap-1 mt-1">
                <label className="font-semibold text-secondary uppercase">
                  Rejection Reason (Optional)
                </label>
                <textarea
                  rows={2}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why this charge is rejected..."
                  className="p-2 bg-surface rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600 text-xs resize-none"
                />
              </div>
            )}
          </div>
        )}
      </ConfirmModal>

      {/* Confirmation Dialog for Batch Approve */}
      <ConfirmModal
        isOpen={isBatchConfirmOpen}
        title="Batch Approve Bills"
        confirmText={`Approve All ${selectedTicketIds.length} Bills`}
        confirmVariant="primary"
        isLoading={isProcessing}
        onClose={() => setIsBatchConfirmOpen(false)}
        onConfirm={handleConfirmBatchApprove}
      >
        <p className="text-xs text-secondary">
          You are about to approve <strong>{selectedTicketIds.length}</strong> pending bills at once.
          This will release them directly to Accounts for ledger clearance.
        </p>
      </ConfirmModal>
    </motion.div>
  );
}
