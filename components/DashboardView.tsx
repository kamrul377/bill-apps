'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bill, DashboardStats, User } from '@/lib/types';
import AmountCharts from './AmountCharts';
import ConfirmModal from '@/components/ConfirmModal';

// Category Interface Definition
export interface Category {
  id: number;
  name: string;
}

interface DashboardViewProps {
  bills: Bill[];
  stats: DashboardStats;
  currentUser: User;
  categories?: Category[];
  onOpenCreateBill: () => void;
  onViewDetails: (bill: Bill) => void;
  // Category Management Handlers (Admin Only)
  onCreateCategory?: (name: string) => Promise<void>;
  onUpdateCategory?: (id: number, name: string) => Promise<void>;
  onDeleteCategory?: (id: number) => Promise<void>;
}

export default function DashboardView({
  bills = [],
  stats,
  currentUser,
  categories = [],
  onOpenCreateBill,
  onViewDetails,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
}: DashboardViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  // Category Management Modal State (Admin Only)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [editingCatName, setEditingCatName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] =
    useState(false);

  const canFilterCategory = ['admin', 'manager', 'accounts'].includes(
    currentUser?.role?.toLowerCase() || ''
  );
  const isAdmin = currentUser?.role?.toLowerCase() === 'admin';

  // Helper function to extract Category ID from Bill Object safely
  const getBillCategoryId = (bill: Bill): string => {
    const rawBill = bill as unknown as Record<string, unknown>;
    const catId =
      bill.category_id ??
      rawBill.categoryId ??
      rawBill.category_Id ??
      (typeof rawBill.category === 'object' && rawBill.category !== null
        ? (rawBill.category as { id?: number | string }).id
        : rawBill.category);

    return catId !== undefined && catId !== null ? String(catId).trim() : '';
  };

  // Helper to get Category Name by ID or embedded category_name
  const getCategoryName = (bill: Bill) => {
    const rawBill = bill as unknown as Record<string, unknown>;
    if (rawBill.category_name && typeof rawBill.category_name === 'string') {
      return rawBill.category_name;
    }
    if (typeof rawBill.category === 'object' && rawBill.category !== null) {
      const catObj = rawBill.category as { name?: string };
      if (catObj.name) return catObj.name;
    }

    const catId = getBillCategoryId(bill);

    if (catId) {
      const foundCategory = categories.find(
        (c) => String(c.id).trim() === catId || c.name.toLowerCase() === catId.toLowerCase()
      );
      if (foundCategory) return foundCategory.name;
    }

    if (typeof rawBill.category === 'string' && rawBill.category.trim() !== '') {
      return rawBill.category;
    }

    return 'General';
  };

  // Filter Logic
  const filteredBills = bills.filter((b) => {
    const matchesSearch =
      !search ||
      (b.ticket_id || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.user_id || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.description || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.created_by || '').toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (b.status || '').toUpperCase() === statusFilter.toUpperCase();

    // Category Filter Matching
    let matchesCategory = categoryFilter === 'ALL';
    if (!matchesCategory) {
      const billCatId = getBillCategoryId(b);
      const categoryName = getCategoryName(b).toLowerCase();
      const selectedCategoryObj = categories.find(
        (c) => String(c.id) === String(categoryFilter)
      );

      matchesCategory =
        billCatId === String(categoryFilter).trim() ||
        Boolean(
          selectedCategoryObj &&
          categoryName === selectedCategoryObj.name.toLowerCase()
        );
    }

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalPages = Math.max(1, Math.ceil(filteredBills.length / pageSize));
  const paginatedBills = filteredBills.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Paid
          </span>
        );
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

  // Category Handlers
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !onCreateCategory) return;
    setIsSubmitting(true);
    await onCreateCategory(newCatName.trim());
    setNewCatName('');
    setIsSubmitting(false);
  };

  const handleUpdateCategory = async (id: number) => {
    if (!editingCatName.trim() || !onUpdateCategory) return;
    setIsSubmitting(true);
    await onUpdateCategory(id, editingCatName.trim());
    setEditingCatId(null);
    setEditingCatName('');
    setIsSubmitting(false);
  };

  const handleDeleteCategory = async (id: number): Promise<boolean> => {
    if (!onDeleteCategory) return false;

    setIsSubmitting(true);
    try {
      await onDeleteCategory(id);
      return true;
    } catch (error) {
      console.error('Failed to delete category:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-on-surface tracking-tight">
            Billing Overview
          </h1>
          <p className="text-xs text-secondary mt-0.5 flex flex-wrap items-center gap-2">
            <span>
              Active operator:{' '}
              <span className="font-semibold text-teal-700">
                {currentUser?.name}
              </span>{' '}
              ({currentUser?.role?.toUpperCase()})
            </span>
            {currentUser?.role === 'support' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-50 text-teal-700 font-medium rounded text-[11px] border border-teal-200">
                <span className="material-symbols-outlined text-xs">
                  badge
                </span>
                Individual Ledger: Viewing your submitted bills &amp; personal
                TK volume
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-container text-secondary font-medium rounded text-[11px]">
                <span className="material-symbols-outlined text-xs">
                  corporate_fare
                </span>
                Organization Ledger: Viewing all staff bills &amp; total TK
                volume
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isAdmin && (
            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(true)}
              className="group inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-teal-50 hover:border-teal-200 transition-all duration-200 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px] text-teal-600 group-hover:scale-110 transition-transform">
                tune
              </span>

              <span className="text-xs font-semibold text-slate-600 group-hover:text-teal-700">
                Manage Categories
              </span>

              <span className="material-symbols-outlined text-[15px] text-slate-400 group-hover:text-teal-500 transition-colors">
                chevron_right
              </span>
            </button>
          )}

          {/* {currentUser?.role !== 'accounts' && (
            <button
              type="button"
              onClick={onOpenCreateBill}
              className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium text-xs transition-colors shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">add</span>
              <span>Create Bill</span>
            </button>
          )} */}
          <button
            type="button"
            onClick={onOpenCreateBill}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium text-xs transition-colors shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>Create Bill</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards with Click Filters */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Bills Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => {
            setStatusFilter('ALL');
            setCurrentPage(1);
          }}
          className={`bg-surface-container-lowest p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${statusFilter === 'ALL'
            ? 'border-teal-600 ring-1 ring-teal-600/30 bg-teal-50/2odefault'
            : 'border-outline-variant/30 hover:border-teal-500/60 hover:shadow-sm'
            } shadow-xs flex flex-col justify-between`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
              {currentUser?.role === 'support' ? 'Your Bills' : 'Total Bills'}
            </span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">
                receipt_long
              </span>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-bold text-on-surface font-data-mono">
              {stats?.totalBills || 0}
            </span>
            <span className="text-[11px] sm:text-xs text-secondary block mt-0.5">
              ৳{(stats?.totalVolumeTk || 0).toLocaleString()}
            </span>
          </div>
        </motion.div>

        {/* Pending Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 }}
          onClick={() => {
            setStatusFilter('Pending');
            setCurrentPage(1);
          }}
          className={`bg-surface-container-lowest p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${statusFilter === 'Pending'
            ? 'border-amber-500 ring-1 ring-amber-500/30 bg-amber-50/30'
            : 'border-outline-variant/30 hover:border-amber-500/60 hover:shadow-sm'
            } shadow-xs flex flex-col justify-between`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
              {currentUser?.role === 'support' ? 'Your Pending' : 'Pending'}
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">
                pending_actions
              </span>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-bold text-amber-600 font-data-mono">
              {stats?.pendingBills || 0}
            </span>
            <span className="text-[11px] sm:text-xs text-secondary block mt-0.5">
              ৳{(stats?.pendingVolumeTk || 0).toLocaleString()}
            </span>
          </div>
        </motion.div>

        {/* Approved Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          onClick={() => {
            setStatusFilter('Approved');
            setCurrentPage(1);
          }}
          className={`bg-surface-container-lowest p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${statusFilter === 'Approved'
            ? 'border-teal-500 ring-1 ring-teal-500/30 bg-teal-50/30'
            : 'border-outline-variant/30 hover:border-teal-500/60 hover:shadow-sm'
            } shadow-xs flex flex-col justify-between`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
              {currentUser?.role === 'support' ? 'Your Approved' : 'Approved'}
            </span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">
                verified
              </span>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-bold text-teal-600 font-data-mono">
              {stats?.approvedBills || 0}
            </span>
            <span className="text-[11px] sm:text-xs text-secondary block mt-0.5">
              ৳{(stats?.approvedVolumeTk || 0).toLocaleString()}
            </span>
          </div>
        </motion.div>

        {/* Paid & Cleared Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          onClick={() => {
            setStatusFilter('Paid');
            setCurrentPage(1);
          }}
          className={`bg-surface-container-lowest p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${statusFilter === 'Paid'
            ? 'border-emerald-500 ring-1 ring-emerald-500/30 bg-emerald-50/30'
            : 'border-outline-variant/30 hover:border-emerald-500/60 hover:shadow-sm'
            } shadow-xs flex flex-col justify-between`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              {currentUser?.role === 'support' ? 'Your Paid' : 'Paid & Cleared'}
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">
                payments
              </span>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-bold text-emerald-600 font-data-mono">
              {stats?.paidBills ?? 0}
            </span>
            <span className="text-[11px] sm:text-xs text-secondary block mt-0.5">
              ৳{(stats?.paidVolumeTk ?? 0).toLocaleString()}
            </span>
          </div>
        </motion.div>

        {/* Rejected Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          onClick={() => {
            setStatusFilter('Rejected');
            setCurrentPage(1);
          }}
          className={`bg-surface-container-lowest p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${statusFilter === 'Rejected'
            ? 'border-rose-500 ring-1 ring-rose-500/30 bg-rose-50/30'
            : 'border-outline-variant/30 hover:border-rose-500/60 hover:shadow-sm'
            } shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
              {currentUser?.role === 'support' ? 'Your Rejected' : 'Rejected'}
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">
                cancel
              </span>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-bold text-rose-600 font-data-mono">
              {stats?.rejectedBills || 0}
            </span>
            <span className="text-[11px] sm:text-xs text-secondary block mt-0.5">
              ৳{(stats?.rejectedVolumeTk || 0).toLocaleString()}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Graphs / Charts */}
      {stats && <AmountCharts stats={stats} />}

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
              placeholder="Search Ticket, User ID, Support Agent..."
              className="w-full pl-8 pr-3 py-1.5 bg-surface text-on-surface text-xs rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            {/* Category Filter */}
            {canFilterCategory && (
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-surface text-on-surface text-xs rounded-lg border border-outline-variant/40 px-2.5 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}

            {/* Status Filter */}
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
              <option value="Paid">Paid (Cleared)</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead>
              <tr className="bg-surface-container-low text-secondary uppercase tracking-wider h-10">
                <th className="px-4 font-semibold">Ticket ID</th>
                <th className="px-3 font-semibold">User ID</th>
                <th className="px-3 font-semibold">Category</th>
                <th className="px-3 font-semibold">Support Staff</th>
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
                  <td colSpan={9} className="py-10 text-center text-secondary">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-4xl text-secondary">
                        search_off
                      </span>
                      <span className="text-sm font-medium">
                        No bills found.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedBills.map((bill) => (
                  <tr
                    key={bill.id}
                    className="hover:bg-surface-container-low/60 transition-colors h-12"
                  >
                    <td className="px-4 font-data-mono font-bold text-teal-700">
                      <a
                        href={`http://139.162.2.178/tms/dotproject/index.php?m=ticketsmith&a=view&ticket=${bill.ticket_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="cursor-pointer hover:text-teal-900 hover:underline"
                      >
                        #{bill.ticket_id}
                      </a>
                    </td>
                    <td className="px-3 font-data-mono text-secondary">
                      {bill.user_id}
                    </td>
                    <td className="px-3">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg
                        bg-gradient-to-r from-primary/10 via-primary/5 to-transparent
                        text-primary font-semibold text-[11px]
                        border border-primary/15
                        shadow-sm shadow-primary/5
                        whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {getCategoryName(bill)}
                      </span>
                    </td>
                    <td className="px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 font-medium text-[11px] border border-teal-200">
                        <span className="material-symbols-outlined text-xs">
                          person
                        </span>
                        <span className="truncate max-w-[120px]">
                          {bill.created_by || 'Support Staff'}
                        </span>
                      </span>
                    </td>
                    <td className="px-3 text-secondary font-data-mono">
                      {bill.date}
                    </td>
                    <td className="px-3 max-w-xs truncate text-on-surface">
                      {bill.description}
                    </td>
                    <td className="px-3 font-data-mono font-bold text-on-surface">
                      ৳{(bill.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-3">{getStatusBadge(bill.status)}</td>
                    <td className="px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onViewDetails(bill)}
                        className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-medium transition-colors cursor-pointer"
                      >
                        Details
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
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                className="px-2.5 py-1 rounded border border-outline-variant/40 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Admin Category Management Modal */}
      <AnimatePresence>
        {isCategoryModalOpen && isAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface-container-lowest w-full max-w-md rounded-xl border border-outline-variant/30 shadow-lg p-5 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-teal-600 group-hover:scale-110 transition-transform">
                    tune
                  </span>
                  Manage Categories
                </h3>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="text-secondary hover:text-on-surface cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">
                    close
                  </span>
                </button>
              </div>

              {/* Add New Category Form */}
              <form onSubmit={handleCreateCategory} className="flex gap-2">
                <input
                  type="text"
                  placeholder="New Category Name..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-surface border border-outline-variant/40 rounded-lg focus:outline-none focus:border-teal-600"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !newCatName.trim()}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium cursor-pointer"
                >
                  Add
                </button>
              </form>

              {/* Category List */}
              <div className="max-h-60 overflow-y-auto divide-y divide-outline-variant/20 border border-outline-variant/30 rounded-lg">
                {categories.length === 0 ? (
                  <div className="p-4 text-center text-xs text-secondary">
                    No categories created yet.
                  </div>
                ) : (
                  categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="p-2.5 flex items-center justify-between gap-2 hover:bg-surface-container-low"
                    >
                      {editingCatId === cat.id ? (
                        <div className="flex items-center gap-1.5 flex-1">
                          <input
                            type="text"
                            value={editingCatName}
                            onChange={(e) => setEditingCatName(e.target.value)}
                            className="flex-1 px-2 py-1 text-xs bg-surface border border-outline-variant/40 rounded focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateCategory(cat.id)}
                            disabled={isSubmitting}
                            className="text-teal-600 hover:text-teal-700 text-xs font-bold px-1.5"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCatId(null)}
                            className="text-secondary hover:text-on-surface text-xs px-1.5"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-xs font-medium text-on-surface">
                            {cat.name}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCatId(cat.id);
                                setEditingCatName(cat.name);
                              }}
                              className="text-secondary hover:text-teal-600 p-1 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-sm">
                                edit
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setCategoryToDelete(cat);
                                setIsDeleteCategoryModalOpen(true);
                              }}
                              className="text-secondary hover:text-rose-600 p-1 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-sm">
                                delete
                              </span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-medium rounded-lg cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Category Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteCategoryModalOpen}
        title="Delete Category?"
        message={
          categoryToDelete
            ? `Are you sure you want to delete "${categoryToDelete.name}"? This action cannot be undone.`
            : 'Are you sure you want to delete this category?'
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isSubmitting}
        onClose={() => {
          if (isSubmitting) return;
          setIsDeleteCategoryModalOpen(false);
          setCategoryToDelete(null);
        }}
        onConfirm={async () => {
          if (!categoryToDelete || isSubmitting) return;

          const deleted = await handleDeleteCategory(categoryToDelete.id);
          if (deleted) {
            setIsDeleteCategoryModalOpen(false);
            setCategoryToDelete(null);
          }
        }}
      />
    </div>
  );
}




// ===================with dark mode=====================

// 'use client';
// import React, { useState } from 'react';
// import { motion, AnimatePresence } from 'motion/react';
// import { Bill, DashboardStats, User } from '@/lib/types';
// import AmountCharts from './AmountCharts';
// import ConfirmModal from '@/components/ConfirmModal';

// // Category Interface Definition
// export interface Category {
//   id: number;
//   name: string;
// }

// interface DashboardViewProps {
//   bills: Bill[];
//   stats: DashboardStats;
//   currentUser: User;
//   categories?: Category[];
//   onOpenCreateBill: () => void;
//   onViewDetails: (bill: Bill) => void;
//   // Category Management Handlers (Admin Only)
//   onCreateCategory?: (name: string) => Promise<void>;
//   onUpdateCategory?: (id: number, name: string) => Promise<void>;
//   onDeleteCategory?: (id: number) => Promise<void>;
// }

// export default function DashboardView({
//   bills = [],
//   stats,
//   currentUser,
//   categories = [],
//   onOpenCreateBill,
//   onViewDetails,
//   onCreateCategory,
//   onUpdateCategory,
//   onDeleteCategory,
// }: DashboardViewProps) {
//   const [search, setSearch] = useState('');
//   const [statusFilter, setStatusFilter] = useState('ALL');
//   const [categoryFilter, setCategoryFilter] = useState('ALL');
//   const [currentPage, setCurrentPage] = useState(1);
//   const pageSize = 50;

//   // Category Management Modal State (Admin Only)
//   const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
//   const [newCatName, setNewCatName] = useState('');
//   const [editingCatId, setEditingCatId] = useState<number | null>(null);
//   const [editingCatName, setEditingCatName] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
//   const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] =
//     useState(false);

//   const canFilterCategory = ['admin', 'manager', 'accounts'].includes(
//     currentUser?.role?.toLowerCase() || ''
//   );
//   const isAdmin = currentUser?.role?.toLowerCase() === 'admin';

//   // Helper function to extract Category ID from Bill Object safely
//   const getBillCategoryId = (bill: Bill): string => {
//     const rawBill = bill as unknown as Record<string, unknown>;
//     const catId =
//       bill.category_id ??
//       rawBill.categoryId ??
//       rawBill.category_Id ??
//       (typeof rawBill.category === 'object' && rawBill.category !== null
//         ? (rawBill.category as { id?: number | string }).id
//         : rawBill.category);

//     return catId !== undefined && catId !== null ? String(catId).trim() : '';
//   };

//   // Helper to get Category Name by ID or embedded category_name
//   const getCategoryName = (bill: Bill) => {
//     const rawBill = bill as unknown as Record<string, unknown>;
//     if (rawBill.category_name && typeof rawBill.category_name === 'string') {
//       return rawBill.category_name;
//     }
//     if (typeof rawBill.category === 'object' && rawBill.category !== null) {
//       const catObj = rawBill.category as { name?: string };
//       if (catObj.name) return catObj.name;
//     }

//     const catId = getBillCategoryId(bill);

//     if (catId) {
//       const foundCategory = categories.find(
//         (c) => String(c.id).trim() === catId || c.name.toLowerCase() === catId.toLowerCase()
//       );
//       if (foundCategory) return foundCategory.name;
//     }

//     if (typeof rawBill.category === 'string' && rawBill.category.trim() !== '') {
//       return rawBill.category;
//     }

//     return 'General';
//   };

//   // Filter Logic
//   const filteredBills = bills.filter((b) => {
//     const matchesSearch =
//       !search ||
//       (b.ticket_id || '').toLowerCase().includes(search.toLowerCase()) ||
//       (b.user_id || '').toLowerCase().includes(search.toLowerCase()) ||
//       (b.description || '').toLowerCase().includes(search.toLowerCase()) ||
//       (b.created_by || '').toLowerCase().includes(search.toLowerCase());

//     const matchesStatus =
//       statusFilter === 'ALL' ||
//       (b.status || '').toUpperCase() === statusFilter.toUpperCase();

//     // Category Filter Matching
//     let matchesCategory = categoryFilter === 'ALL';
//     if (!matchesCategory) {
//       const billCatId = getBillCategoryId(b);
//       const categoryName = getCategoryName(b).toLowerCase();
//       const selectedCategoryObj = categories.find(
//         (c) => String(c.id) === String(categoryFilter)
//       );

//       matchesCategory =
//         billCatId === String(categoryFilter).trim() ||
//         Boolean(
//           selectedCategoryObj &&
//           categoryName === selectedCategoryObj.name.toLowerCase()
//         );
//     }

//     return matchesSearch && matchesStatus && matchesCategory;
//   });

//   const totalPages = Math.max(1, Math.ceil(filteredBills.length / pageSize));
//   const paginatedBills = filteredBills.slice(
//     (currentPage - 1) * pageSize,
//     currentPage * pageSize
//   );

//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case 'Paid':
//         return (
//           <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
//             <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
//             Paid
//           </span>
//         );
//       case 'Pending':
//         return (
//           <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
//             <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
//             Pending
//           </span>
//         );
//       case 'Approved':
//         return (
//           <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
//             <span className="w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-teal-400" />
//             Approved
//           </span>
//         );
//       case 'Rejected':
//         return (
//           <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
//             <span className="w-1.5 h-1.5 rounded-full bg-rose-500 dark:bg-rose-400" />
//             Rejected
//           </span>
//         );
//       default:
//         return null;
//     }
//   };

//   // Category Handlers
//   const handleCreateCategory = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!newCatName.trim() || !onCreateCategory) return;
//     setIsSubmitting(true);
//     await onCreateCategory(newCatName.trim());
//     setNewCatName('');
//     setIsSubmitting(false);
//   };

//   const handleUpdateCategory = async (id: number) => {
//     if (!editingCatName.trim() || !onUpdateCategory) return;
//     setIsSubmitting(true);
//     await onUpdateCategory(id, editingCatName.trim());
//     setEditingCatId(null);
//     setEditingCatName('');
//     setIsSubmitting(false);
//   };

//   const handleDeleteCategory = async (id: number): Promise<boolean> => {
//     if (!onDeleteCategory) return false;

//     setIsSubmitting(true);
//     try {
//       await onDeleteCategory(id);
//       return true;
//     } catch (error) {
//       console.error('Failed to delete category:', error);
//       return false;
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="flex flex-col gap-5 w-full">
//       {/* Top Header Banner */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest dark:bg-slate-900 p-5 rounded-xl border border-outline-variant/30 dark:border-slate-800 shadow-xs">
//         <div>
//           <h1 className="text-xl font-bold text-on-surface dark:text-slate-100 tracking-tight">
//             Billing Overview
//           </h1>
//           <p className="text-xs text-secondary dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-2">
//             <span>
//               Active operator:{' '}
//               <span className="font-semibold text-teal-700 dark:text-teal-400">
//                 {currentUser?.name}
//               </span>{' '}
//               ({currentUser?.role?.toUpperCase()})
//             </span>
//             {currentUser?.role === 'support' ? (
//               <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-medium rounded text-[11px] border border-teal-200 dark:border-teal-800">
//                 <span className="material-symbols-outlined text-xs">
//                   badge
//                 </span>
//                 Individual Ledger: Viewing your submitted bills &amp; personal
//                 TK volume
//               </span>
//             ) : (
//               <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-container dark:bg-slate-800 text-secondary dark:text-slate-300 font-medium rounded text-[11px]">
//                 <span className="material-symbols-outlined text-xs">
//                   corporate_fare
//                 </span>
//                 Organization Ledger: Viewing all staff bills &amp; total TK
//                 volume
//               </span>
//             )}
//           </p>
//         </div>

//         <div className="flex items-center gap-2 self-start sm:self-auto">
//           {isAdmin && (
//             <button
//               type="button"
//               onClick={() => setIsCategoryModalOpen(true)}
//               className="group inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:border-teal-200 dark:hover:border-teal-800 transition-all duration-200 cursor-pointer"
//             >
//               <span className="material-symbols-outlined text-[18px] text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
//                 tune
//               </span>

//               <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-teal-700 dark:group-hover:text-teal-300">
//                 Manage Categories
//               </span>

//               <span className="material-symbols-outlined text-[15px] text-slate-400 dark:text-slate-500 group-hover:text-teal-500 transition-colors">
//                 chevron_right
//               </span>
//             </button>
//           )}

//           {currentUser?.role !== 'accounts' && (
//             <button
//               type="button"
//               onClick={onOpenCreateBill}
//               className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-500 text-white px-4 py-2 rounded-lg font-medium text-xs transition-colors shadow-xs cursor-pointer"
//             >
//               <span className="material-symbols-outlined text-base">add</span>
//               <span>Create Bill</span>
//             </button>
//           )}
//         </div>
//       </div>

//       {/* KPI Stats Cards with Click Filters */}
//       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
//         {/* Total Bills Card */}
//         <motion.div
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           onClick={() => {
//             setStatusFilter('ALL');
//             setCurrentPage(1);
//           }}
//           className={`bg-surface-container-lowest dark:bg-slate-900 p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${statusFilter === 'ALL'
//             ? 'border-teal-600 dark:border-teal-500 ring-1 ring-teal-600/30 bg-teal-50/20 dark:bg-teal-950/30'
//             : 'border-outline-variant/30 dark:border-slate-800 hover:border-teal-500/60 hover:shadow-sm'
//             } shadow-xs flex flex-col justify-between`}
//         >
//           <div className="flex items-center justify-between">
//             <span className="text-xs font-semibold text-secondary dark:text-slate-400 uppercase tracking-wider">
//               {currentUser?.role === 'support' ? 'Your Bills' : 'Total Bills'}
//             </span>
//             <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
//               <span className="material-symbols-outlined text-base">
//                 receipt_long
//               </span>
//             </div>
//           </div>
//           <div className="mt-2">
//             <span className="text-xl sm:text-2xl font-bold text-on-surface dark:text-slate-100 font-data-mono">
//               {stats?.totalBills || 0}
//             </span>
//             <span className="text-[11px] sm:text-xs text-secondary dark:text-slate-400 block mt-0.5">
//               ৳{(stats?.totalVolumeTk || 0).toLocaleString()}
//             </span>
//           </div>
//         </motion.div>

//         {/* Pending Card */}
//         <motion.div
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.04 }}
//           onClick={() => {
//             setStatusFilter('Pending');
//             setCurrentPage(1);
//           }}
//           className={`bg-surface-container-lowest dark:bg-slate-900 p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${statusFilter === 'Pending'
//             ? 'border-amber-500 dark:border-amber-400 ring-1 ring-amber-500/30 bg-amber-50/30 dark:bg-amber-950/30'
//             : 'border-outline-variant/30 dark:border-slate-800 hover:border-amber-500/60 hover:shadow-sm'
//             } shadow-xs flex flex-col justify-between`}
//         >
//           <div className="flex items-center justify-between">
//             <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
//               {currentUser?.role === 'support' ? 'Your Pending' : 'Pending'}
//             </span>
//             <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
//               <span className="material-symbols-outlined text-base">
//                 pending_actions
//               </span>
//             </div>
//           </div>
//           <div className="mt-2">
//             <span className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 font-data-mono">
//               {stats?.pendingBills || 0}
//             </span>
//             <span className="text-[11px] sm:text-xs text-secondary dark:text-slate-400 block mt-0.5">
//               ৳{(stats?.pendingVolumeTk || 0).toLocaleString()}
//             </span>
//           </div>
//         </motion.div>

//         {/* Approved Card */}
//         <motion.div
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.08 }}
//           onClick={() => {
//             setStatusFilter('Approved');
//             setCurrentPage(1);
//           }}
//           className={`bg-surface-container-lowest dark:bg-slate-900 p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${statusFilter === 'Approved'
//             ? 'border-teal-500 dark:border-teal-400 ring-1 ring-teal-500/30 bg-teal-50/30 dark:bg-teal-950/30'
//             : 'border-outline-variant/30 dark:border-slate-800 hover:border-teal-500/60 hover:shadow-sm'
//             } shadow-xs flex flex-col justify-between`}
//         >
//           <div className="flex items-center justify-between">
//             <span className="text-xs font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
//               {currentUser?.role === 'support' ? 'Your Approved' : 'Approved'}
//             </span>
//             <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
//               <span className="material-symbols-outlined text-base">
//                 verified
//               </span>
//             </div>
//           </div>
//           <div className="mt-2">
//             <span className="text-xl sm:text-2xl font-bold text-teal-600 dark:text-teal-400 font-data-mono">
//               {stats?.approvedBills || 0}
//             </span>
//             <span className="text-[11px] sm:text-xs text-secondary dark:text-slate-400 block mt-0.5">
//               ৳{(stats?.approvedVolumeTk || 0).toLocaleString()}
//             </span>
//           </div>
//         </motion.div>

//         {/* Paid & Cleared Card */}
//         <motion.div
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.12 }}
//           onClick={() => {
//             setStatusFilter('Paid');
//             setCurrentPage(1);
//           }}
//           className={`bg-surface-container-lowest dark:bg-slate-900 p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${statusFilter === 'Paid'
//             ? 'border-emerald-500 dark:border-emerald-400 ring-1 ring-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/30'
//             : 'border-outline-variant/30 dark:border-slate-800 hover:border-emerald-500/60 hover:shadow-sm'
//             } shadow-xs flex flex-col justify-between`}
//         >
//           <div className="flex items-center justify-between">
//             <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
//               {currentUser?.role === 'support' ? 'Your Paid' : 'Paid & Cleared'}
//             </span>
//             <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
//               <span className="material-symbols-outlined text-base">
//                 payments
//               </span>
//             </div>
//           </div>
//           <div className="mt-2">
//             <span className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-data-mono">
//               {stats?.paidBills ?? 0}
//             </span>
//             <span className="text-[11px] sm:text-xs text-secondary dark:text-slate-400 block mt-0.5">
//               ৳{(stats?.paidVolumeTk ?? 0).toLocaleString()}
//             </span>
//           </div>
//         </motion.div>

//         {/* Rejected Card */}
//         <motion.div
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.16 }}
//           onClick={() => {
//             setStatusFilter('Rejected');
//             setCurrentPage(1);
//           }}
//           className={`bg-surface-container-lowest dark:bg-slate-900 p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${statusFilter === 'Rejected'
//             ? 'border-rose-500 dark:border-rose-400 ring-1 ring-rose-500/30 bg-rose-50/30 dark:bg-rose-950/30'
//             : 'border-outline-variant/30 dark:border-slate-800 hover:border-rose-500/60 hover:shadow-sm'
//             } shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1`}
//         >
//           <div className="flex items-center justify-between">
//             <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
//               {currentUser?.role === 'support' ? 'Your Rejected' : 'Rejected'}
//             </span>
//             <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
//               <span className="material-symbols-outlined text-base">
//                 cancel
//               </span>
//             </div>
//           </div>
//           <div className="mt-2">
//             <span className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400 font-data-mono">
//               {stats?.rejectedBills || 0}
//             </span>
//             <span className="text-[11px] sm:text-xs text-secondary dark:text-slate-400 block mt-0.5">
//               ৳{(stats?.rejectedVolumeTk || 0).toLocaleString()}
//             </span>
//           </div>
//         </motion.div>
//       </div>

//       {/* Graphs / Charts */}
//       {stats && <AmountCharts stats={stats} />}

//       {/* Bills Table Container */}
//       <div className="bg-surface-container-lowest dark:bg-slate-900 rounded-xl border border-outline-variant/30 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col">
//         {/* Toolbar */}
//         <div className="p-3.5 bg-surface-bright dark:bg-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2.5 border-b border-outline-variant/20 dark:border-slate-800">
//           <div className="relative w-full sm:w-80">
//             <span className="material-symbols-outlined absolute left-2.5 top-2 text-secondary dark:text-slate-400 text-base">
//               search
//             </span>
//             <input
//               type="text"
//               value={search}
//               onChange={(e) => {
//                 setSearch(e.target.value);
//                 setCurrentPage(1);
//               }}
//               placeholder="Search Ticket, User ID, Support Agent..."
//               className="w-full pl-8 pr-3 py-1.5 bg-surface dark:bg-slate-900 text-on-surface dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs rounded-lg border border-outline-variant/40 dark:border-slate-700 focus:outline-none focus:border-teal-600 dark:focus:border-teal-500"
//             />
//           </div>

//           <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
//             {/* Category Filter */}
//             {canFilterCategory && (
//               <select
//                 value={categoryFilter}
//                 onChange={(e) => {
//                   setCategoryFilter(e.target.value);
//                   setCurrentPage(1);
//                 }}
//                 className="bg-surface dark:bg-slate-900 text-on-surface dark:text-slate-100 text-xs rounded-lg border border-outline-variant/40 dark:border-slate-700 px-2.5 py-1.5 focus:outline-none cursor-pointer"
//               >
//                 <option value="ALL" className="dark:bg-slate-900">All Categories</option>
//                 {categories.map((cat) => (
//                   <option key={cat.id} value={String(cat.id)} className="dark:bg-slate-900">
//                     {cat.name}
//                   </option>
//                 ))}
//               </select>
//             )}

//             {/* Status Filter */}
//             <select
//               value={statusFilter}
//               onChange={(e) => {
//                 setStatusFilter(e.target.value);
//                 setCurrentPage(1);
//               }}
//               className="bg-surface dark:bg-slate-900 text-on-surface dark:text-slate-100 text-xs rounded-lg border border-outline-variant/40 dark:border-slate-700 px-2.5 py-1.5 focus:outline-none cursor-pointer"
//             >
//               <option value="ALL" className="dark:bg-slate-900">All Statuses</option>
//               <option value="Pending" className="dark:bg-slate-900">Pending</option>
//               <option value="Approved" className="dark:bg-slate-900">Approved</option>
//               <option value="Paid" className="dark:bg-slate-900">Paid (Cleared)</option>
//               <option value="Rejected" className="dark:bg-slate-900">Rejected</option>
//             </select>
//           </div>
//         </div>

//         {/* Table */}
//         <div className="overflow-x-auto">
//           <table className="w-full text-left text-xs min-w-[750px]">
//             <thead>
//               <tr className="bg-surface-container-low dark:bg-slate-800/50 text-secondary dark:text-slate-400 uppercase tracking-wider h-10 border-b border-outline-variant/20 dark:border-slate-800">
//                 <th className="px-4 font-semibold">Ticket ID</th>
//                 <th className="px-3 font-semibold">User ID</th>
//                 <th className="px-3 font-semibold">Category</th>
//                 <th className="px-3 font-semibold">Support Staff</th>
//                 <th className="px-3 font-semibold">Date</th>
//                 <th className="px-3 font-semibold">Description</th>
//                 <th className="px-3 font-semibold">Amount</th>
//                 <th className="px-3 font-semibold">Status</th>
//                 <th className="px-4 font-semibold text-right">Action</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-outline-variant/20 dark:divide-slate-800">
//               {paginatedBills.length === 0 ? (
//                 <tr>
//                   <td colSpan={9} className="py-10 text-center text-secondary dark:text-slate-400">
//                     <div className="flex flex-col items-center justify-center gap-2">
//                       <span className="material-symbols-outlined text-4xl text-secondary dark:text-slate-500">
//                         search_off
//                       </span>
//                       <span className="text-sm font-medium">
//                         No bills found.
//                       </span>
//                     </div>
//                   </td>
//                 </tr>
//               ) : (
//                 paginatedBills.map((bill) => (
//                   <tr
//                     key={bill.id}
//                     className="hover:bg-surface-container-low/60 dark:hover:bg-slate-800/40 transition-colors h-12"
//                   >
//                     <td className="px-4 font-data-mono font-bold text-teal-700 dark:text-teal-400">
//                       <a
//                         href={`http://139.162.2.178/tms/dotproject/index.php?m=ticketsmith&a=view&ticket=${bill.ticket_id}`}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="cursor-pointer hover:text-teal-900 dark:hover:text-teal-300 hover:underline"
//                       >
//                         #{bill.ticket_id}
//                       </a>
//                     </td>
//                     <td className="px-3 font-data-mono text-secondary dark:text-slate-400">
//                       {bill.user_id}
//                     </td>
//                     <td className="px-3">
//                       <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg
//                         bg-gradient-to-r from-primary/10 via-primary/5 to-transparent
//                         text-primary dark:text-teal-300 font-semibold text-[11px]
//                         border border-primary/15 dark:border-teal-800/60
//                         shadow-sm shadow-primary/5
//                         whitespace-nowrap">
//                         <span className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-teal-400" />
//                         {getCategoryName(bill)}
//                       </span>
//                     </td>
//                     <td className="px-3">
//                       <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-medium text-[11px] border border-teal-200 dark:border-teal-800">
//                         <span className="material-symbols-outlined text-xs">
//                           person
//                         </span>
//                         <span className="truncate max-w-[120px]">
//                           {bill.created_by || 'Support Staff'}
//                         </span>
//                       </span>
//                     </td>
//                     <td className="px-3 text-secondary dark:text-slate-400 font-data-mono">
//                       {bill.date}
//                     </td>
//                     <td className="px-3 max-w-xs truncate text-on-surface dark:text-slate-200">
//                       {bill.description}
//                     </td>
//                     <td className="px-3 font-data-mono font-bold text-on-surface dark:text-slate-100">
//                       ৳{(bill.amount || 0).toLocaleString()}
//                     </td>
//                     <td className="px-3">{getStatusBadge(bill.status)}</td>
//                     <td className="px-4 text-right">
//                       <button
//                         type="button"
//                         onClick={() => onViewDetails(bill)}
//                         className="px-2.5 py-1 rounded bg-surface-container dark:bg-slate-800 hover:bg-surface-container-high dark:hover:bg-slate-700 text-on-surface dark:text-slate-200 font-medium transition-colors cursor-pointer"
//                       >
//                         Details
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Minimal Pagination */}
//         {totalPages > 1 && (
//           <div className="p-3 bg-surface-bright dark:bg-slate-800/80 flex items-center justify-between text-xs border-t border-outline-variant/20 dark:border-slate-800">
//             <span className="text-secondary dark:text-slate-400">
//               Page {currentPage} of {totalPages}
//             </span>
//             <div className="flex gap-1">
//               <button
//                 type="button"
//                 disabled={currentPage === 1}
//                 onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//                 className="px-2.5 py-1 rounded border border-outline-variant/40 dark:border-slate-700 text-on-surface dark:text-slate-300 disabled:opacity-40 cursor-pointer hover:bg-surface-container dark:hover:bg-slate-700"
//               >
//                 Previous
//               </button>
//               <button
//                 type="button"
//                 disabled={currentPage === totalPages}
//                 onClick={() =>
//                   setCurrentPage((p) => Math.min(totalPages, p + 1))
//                 }
//                 className="px-2.5 py-1 rounded border border-outline-variant/40 dark:border-slate-700 text-on-surface dark:text-slate-300 disabled:opacity-40 cursor-pointer hover:bg-surface-container dark:hover:bg-slate-700"
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Admin Category Management Modal */}
//       <AnimatePresence>
//         {isCategoryModalOpen && isAdmin && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 dark:bg-black/70 backdrop-blur-xs">
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.95 }}
//               className="bg-surface-container-lowest dark:bg-slate-900 w-full max-w-md rounded-xl border border-outline-variant/30 dark:border-slate-800 shadow-lg p-5 flex flex-col gap-4"
//             >
//               <div className="flex items-center justify-between border-b border-outline-variant/20 dark:border-slate-800 pb-3">
//                 <h3 className="text-base font-bold text-on-surface dark:text-slate-100 flex items-center gap-2">
//                   <span className="material-symbols-outlined text-[18px] text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
//                     tune
//                   </span>
//                   Manage Categories
//                 </h3>
//                 <button
//                   type="button"
//                   onClick={() => setIsCategoryModalOpen(false)}
//                   className="text-secondary dark:text-slate-400 hover:text-on-surface dark:hover:text-slate-200 cursor-pointer"
//                 >
//                   <span className="material-symbols-outlined text-lg">
//                     close
//                   </span>
//                 </button>
//               </div>

//               {/* Add New Category Form */}
//               <form onSubmit={handleCreateCategory} className="flex gap-2">
//                 <input
//                   type="text"
//                   placeholder="New Category Name..."
//                   value={newCatName}
//                   onChange={(e) => setNewCatName(e.target.value)}
//                   className="flex-1 px-3 py-1.5 text-xs bg-surface dark:bg-slate-800 text-on-surface dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-outline-variant/40 dark:border-slate-700 rounded-lg focus:outline-none focus:border-teal-600 dark:focus:border-teal-500"
//                 />
//                 <button
//                   type="submit"
//                   disabled={isSubmitting || !newCatName.trim()}
//                   className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium cursor-pointer"
//                 >
//                   Add
//                 </button>
//               </form>

//               {/* Category List */}
//               <div className="max-h-60 overflow-y-auto divide-y divide-outline-variant/20 dark:divide-slate-800 border border-outline-variant/30 dark:border-slate-800 rounded-lg">
//                 {categories.length === 0 ? (
//                   <div className="p-4 text-center text-xs text-secondary dark:text-slate-400">
//                     No categories created yet.
//                   </div>
//                 ) : (
//                   categories.map((cat) => (
//                     <div
//                       key={cat.id}
//                       className="p-2.5 flex items-center justify-between gap-2 hover:bg-surface-container-low dark:hover:bg-slate-800/60"
//                     >
//                       {editingCatId === cat.id ? (
//                         <div className="flex items-center gap-1.5 flex-1">
//                           <input
//                             type="text"
//                             value={editingCatName}
//                             onChange={(e) => setEditingCatName(e.target.value)}
//                             className="flex-1 px-2 py-1 text-xs bg-surface dark:bg-slate-800 text-on-surface dark:text-slate-100 border border-outline-variant/40 dark:border-slate-700 rounded focus:outline-none"
//                           />
//                           <button
//                             type="button"
//                             onClick={() => handleUpdateCategory(cat.id)}
//                             disabled={isSubmitting}
//                             className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 text-xs font-bold px-1.5"
//                           >
//                             Save
//                           </button>
//                           <button
//                             type="button"
//                             onClick={() => setEditingCatId(null)}
//                             className="text-secondary dark:text-slate-400 hover:text-on-surface dark:hover:text-slate-200 text-xs px-1.5"
//                           >
//                             Cancel
//                           </button>
//                         </div>
//                       ) : (
//                         <>
//                           <span className="text-xs font-medium text-on-surface dark:text-slate-200">
//                             {cat.name}
//                           </span>
//                           <div className="flex items-center gap-1">
//                             <button
//                               type="button"
//                               onClick={() => {
//                                 setEditingCatId(cat.id);
//                                 setEditingCatName(cat.name);
//                               }}
//                               className="text-secondary dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 p-1 cursor-pointer"
//                             >
//                               <span className="material-symbols-outlined text-sm">
//                                 edit
//                               </span>
//                             </button>
//                             <button
//                               type="button"
//                               onClick={() => {
//                                 setCategoryToDelete(cat);
//                                 setIsDeleteCategoryModalOpen(true);
//                               }}
//                               className="text-secondary dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 cursor-pointer"
//                             >
//                               <span className="material-symbols-outlined text-sm">
//                                 delete
//                               </span>
//                             </button>
//                           </div>
//                         </>
//                       )}
//                     </div>
//                   ))
//                 )}
//               </div>

//               <div className="flex justify-end pt-2">
//                 <button
//                   type="button"
//                   onClick={() => setIsCategoryModalOpen(false)}
//                   className="px-4 py-1.5 bg-surface-container dark:bg-slate-800 hover:bg-surface-container-high dark:hover:bg-slate-700 text-on-surface dark:text-slate-200 text-xs font-medium rounded-lg cursor-pointer"
//                 >
//                   Close
//                 </button>
//               </div>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>

//       {/* Category Delete Confirmation Modal */}
//       <ConfirmModal
//         isOpen={isDeleteCategoryModalOpen}
//         title="Delete Category?"
//         message={
//           categoryToDelete
//             ? `Are you sure you want to delete "${categoryToDelete.name}"? This action cannot be undone.`
//             : 'Are you sure you want to delete this category?'
//         }
//         confirmText="Delete"
//         cancelText="Cancel"
//         variant="danger"
//         isLoading={isSubmitting}
//         onClose={() => {
//           if (isSubmitting) return;
//           setIsDeleteCategoryModalOpen(false);
//           setCategoryToDelete(null);
//         }}
//         onConfirm={async () => {
//           if (!categoryToDelete || isSubmitting) return;

//           const deleted = await handleDeleteCategory(categoryToDelete.id);
//           if (deleted) {
//             setIsDeleteCategoryModalOpen(false);
//             setCategoryToDelete(null);
//           }
//         }}
//       />
//     </div>
//   );
// }