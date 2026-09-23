'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Bill, DashboardStats, User } from '@/lib/types';
import AmountCharts from './AmountCharts';

interface DashboardViewProps {
  bills: Bill[];
  stats: DashboardStats;
  currentUser: User;
  onOpenCreateBill: () => void;
  onViewDetails: (bill: Bill) => void;
}

export default function DashboardView({
  bills,
  stats,
  currentUser,
  onOpenCreateBill,
  onViewDetails,
}: DashboardViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const filteredBills = bills.filter((b) => {
    const matchesSearch =
      !search ||
      b.ticket_id.toLowerCase().includes(search.toLowerCase()) ||
      b.user_id.toLowerCase().includes(search.toLowerCase()) ||
      b.description.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || b.status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredBills.length / pageSize));
  const paginatedBills = filteredBills.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Pending
          </span>
        );
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
            Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Top Header Banner - Clean & Minimal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-on-surface tracking-tight">
            Billing Overview
          </h1>
          <p className="text-xs text-secondary mt-0.5">
            Active operator: <span className="font-semibold text-teal-700">{currentUser.name}</span> ({currentUser.role.toUpperCase()})
          </p>
        </div>

        {currentUser.role !== 'accounts' && (
          <button
            type="button"
            onClick={onOpenCreateBill}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium text-xs transition-colors shadow-xs self-start sm:self-auto cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>Create Bill</span>
          </button>
        )}
      </div>

      {/* KPI Stats Cards - Minimal with subtle animations */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Total Bills</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">receipt_long</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-on-surface font-data-mono">{stats.totalBills}</span>
            <span className="text-xs text-secondary block mt-0.5">৳{stats.totalVolumeTk.toLocaleString()}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Pending</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">pending_actions</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-amber-600 font-data-mono">{stats.pendingBills}</span>
            <span className="text-xs text-secondary block mt-0.5">৳{stats.pendingVolumeTk.toLocaleString()}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">Approved</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">verified</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-teal-600 font-data-mono">{stats.approvedBills}</span>
            <span className="text-xs text-secondary block mt-0.5">৳{stats.approvedVolumeTk.toLocaleString()}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Rejected</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">cancel</span>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-rose-600 font-data-mono">{stats.rejectedBills}</span>
            <span className="text-xs text-secondary block mt-0.5">৳{stats.rejectedVolumeTk.toLocaleString()}</span>
          </div>
        </motion.div>
      </div>

      {/* Visual Graphs / Pie Charts for Amount (TK) */}
      <AmountCharts stats={stats} />

      {/* Bills Table Container */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-xs overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-3.5 bg-surface-bright flex flex-col sm:flex-row items-center justify-between gap-2.5 border-b border-outline-variant/20">
          <div className="relative w-full sm:w-80">
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
              className="w-full pl-8 pr-3 py-1.5 bg-surface text-on-surface text-xs rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-surface text-on-surface text-xs rounded-lg border border-outline-variant/40 px-2.5 py-1.5 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-surface-container-low text-secondary uppercase tracking-wider h-9">
                <th className="px-4 font-semibold">Ticket ID</th>
                <th className="px-3 font-semibold">User ID</th>
                <th className="px-3 font-semibold">Date</th>
                <th className="px-3 font-semibold">Description</th>
                <th className="px-3 font-semibold">Amount</th>
                <th className="px-3 font-semibold">Status</th>
                <th className="px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {paginatedBills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-secondary">
                    No bills found.
                  </td>
                </tr>
              ) : (
                paginatedBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-surface-container-low/60 transition-colors h-12">
                    <td className="px-4 font-data-mono font-bold text-teal-700">
                      {bill.ticket_id}
                    </td>
                    <td className="px-3 font-data-mono text-secondary">
                      {bill.user_id}
                    </td>
                    <td className="px-3 text-secondary font-data-mono">
                      {bill.date}
                    </td>
                    <td className="px-3 max-w-xs truncate text-on-surface">
                      {bill.description}
                    </td>
                    <td className="px-3 font-data-mono font-bold text-on-surface">
                      ৳{bill.amount.toLocaleString()}
                    </td>
                    <td className="px-3">
                      {getStatusBadge(bill.status)}
                    </td>
                    <td className="px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onViewDetails(bill)}
                        className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-medium transition-colors cursor-pointer"
                      >
                        View
                      </button>
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
    </div>
  );
}
