'use client';
import React, { useState, useMemo, useRef } from 'react';
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

// Sorting Types
type SortField = 'ticket_id' | 'user_id' | 'category' | 'support_agent' | 'date' | 'description' | 'amount' | 'status' | null;
type SortOrder = 'asc' | 'desc';

// Column Management Types
type ColumnKey = 
  | 'ticket_id' 
  | 'user_id' 
  | 'category' 
  | 'support_agent' 
  | 'date' 
  | 'description' 
  | 'amount' 
  | 'status';

interface ColumnConfig {
  key: ColumnKey;
  label: string;
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { key: 'ticket_id', label: 'Ticket ID' },
  { key: 'user_id', label: 'User ID' },
  { key: 'category', label: 'Category' },
  { key: 'support_agent', label: 'Support Staff' },
  { key: 'date', label: 'Date' },
  { key: 'description', label: 'Description' },
  { key: 'amount', label: 'Amount' },
  { key: 'status', label: 'Status' },
];

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

  // Table Section Ref for Smooth Scrolling
  const tableSectionRef = useRef<HTMLDivElement>(null);

  const scrollToTable = () => {
    if (tableSectionRef.current) {
      tableSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Sorting States
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Column Customization States
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
  const [hiddenColumns, setHiddenColumns] = useState<Record<ColumnKey, boolean>>({
    ticket_id: true,
    user_id: true,
    category: true,
    support_agent: true,
    date: true,
    description: true,
    amount: true,
    status: true,
  });
  const [isColumnCustomizerOpen, setIsColumnCustomizerOpen] = useState(false);

  // Drag and Drop States for Table Headers
  const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedColumnIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedColumnIndex === null || draggedColumnIndex === targetIndex) return;

    const newCols = [...columns];
    const [movedCol] = newCols.splice(draggedColumnIndex, 1);
    newCols.splice(targetIndex, 0, movedCol);

    setColumns(newCols);
    setDraggedColumnIndex(null);
  };

  const handleToggleColumnVisibility = (key: ColumnKey) => {
    setHiddenColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const renderSortIcon = (field: SortField) => {
    return (
      <span className="material-symbols-outlined text-[13px] text-secondary/70 inline-flex align-middle ml-0.5">
        {sortField === field
          ? sortOrder === 'asc'
            ? 'arrow_drop_up'
            : 'arrow_drop_down'
          : 'unfold_more'}
      </span>
    );
  };

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

  // Filter & Sort Logic
  const filteredBills = useMemo(() => {
    const result = bills.filter((b) => {
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

    if (sortField) {
      result.sort((a, b) => {
        let valA: any;
        let valB: any;

        if (sortField === 'support_agent') {
          valA = String(a.created_by || '').toLowerCase();
          valB = String(b.created_by || '').toLowerCase();
        } else if (sortField === 'category') {
          valA = String(getCategoryName(a) || '').toLowerCase();
          valB = String(getCategoryName(b) || '').toLowerCase();
        } else {
          valA = a[sortField as keyof Bill];
          valB = b[sortField as keyof Bill];
        }

        if (sortField === 'amount') {
          valA = Number(valA) || 0;
          valB = Number(valB) || 0;
        } else if (sortField === 'ticket_id' || sortField === 'user_id' || sortField === 'status') {
          valA = String(valA || '').toLowerCase();
          valB = String(valB || '').toLowerCase();
        } else if (sortField === 'date') {
          valA = new Date(valA || '').getTime();
          valB = new Date(valB || '').getTime();
        } else {
          valA = String(valA || '').toLowerCase();
          valB = String(valB || '').toLowerCase();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [bills, search, statusFilter, categoryFilter, categories, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredBills.length / pageSize));
  const paginatedBills = filteredBills.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getStatusBadge = (status: string) => {
    // switch (status) {
    //   case 'Paid':
    //     return (
    //       <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
    //         <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
    //         Paid
    //       </span>
    //     );
    //   case 'Pending':
    //     return (
    //       <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
    //         <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
    //         Pending
    //       </span>
    //     );
    //   case 'Approved':
    //     return (
    //       <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
    //         <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
    //         Approved
    //       </span>
    //     );
    //   case 'Rejected':
    //     return (
    //       <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
    //         <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
    //         Rejected
    //       </span>
    //     );
    //   default:
    //     return null;
    // }
    switch (status) {
  case 'Paid':
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
        Paid
      </span>
    );
  case 'Pending':
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
        Pending
      </span>
    );
  case 'Approved':
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-teal-400" />
        Approved
      </span>
    );
  case 'Rejected':
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 dark:bg-rose-400" />
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

  // Render Header Cell with Drag & Drop + Sorting
  const renderHeaderCell = (colKey: ColumnKey, index: number) => {
    const innerContent = (() => {
      switch (colKey) {
        case 'ticket_id':
          return <>Ticket ID {renderSortIcon('ticket_id')}</>;
        case 'user_id':
          return <>User ID {renderSortIcon('user_id')}</>;
        case 'category':
          return <>Category {renderSortIcon('category')}</>;
        case 'support_agent':
          return <>Support Staff {renderSortIcon('support_agent')}</>;
        case 'date':
          return <>Date {renderSortIcon('date')}</>;
        case 'description':
          return <>Description {renderSortIcon('description')}</>;
        case 'amount':
          return <>Amount {renderSortIcon('amount')}</>;
        case 'status':
          return <>Status {renderSortIcon('status')}</>;
        default:
          return null;
      }
    })();

    return (
      <th
        key={colKey}
        draggable
        onDragStart={(e) => handleDragStart(e, index)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, index)}
        onClick={() => handleSort(colKey as SortField)}
        className="px-3 font-semibold select-none cursor-grab active:cursor-grabbing hover:bg-surface-container transition-colors cursor-pointer hover:text-on-surface"
        title="Drag to reorder column"
      >
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-xs text-secondary/50 cursor-grab">drag_indicator</span>
          <span>{innerContent}</span>
        </div>
      </th>
    );
  };

  // Render Cell Content based on Column Key
  const renderCellContent = (colKey: ColumnKey, bill: Bill) => {
    switch (colKey) {
      case 'ticket_id':
        return (
          <td key={colKey} className="px-4 font-data-mono font-bold text-teal-700">
            <a
              href={`http://139.162.2.178/tms/dotproject/index.php?m=ticketsmith&a=view&ticket=${bill.ticket_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer hover:text-teal-900 hover:underline"
            >
              #{bill.ticket_id}
            </a>
          </td>
        );
      case 'user_id':
        return (
          <td key={colKey} className="px-3 font-data-mono text-secondary">
            {bill.user_id}
          </td>
        );
      case 'category':
        return (
          <td key={colKey} className="px-3">
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
        );
      case 'support_agent':
        return (
          // <td key={colKey} className="px-3">
          //   <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 font-medium text-[11px] border border-teal-200">
          //     <span className="material-symbols-outlined text-xs">
          //       person
          //     </span>
          //     <span className="truncate max-w-[120px]">
          //       {bill.created_by || 'Support Staff'}
          //     </span>
          //   </span>
          // </td>
          <td key={colKey} className="px-3">
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 font-medium text-[11px] border border-teal-200 dark:border-teal-800/60">
        <span className="material-symbols-outlined text-xs">
          person
        </span>
        <span className="truncate max-w-[120px]">
          {bill.created_by || 'Support Staff'}
        </span>
      </span>
    </td>

    
        );
      case 'date':
        return (
          <td key={colKey} className="px-3 text-secondary font-data-mono">
            {bill.date}
          </td>
        );
      case 'description':
        return (
          <td key={colKey} className="px-3 max-w-xs truncate text-on-surface">
            {bill.description}
          </td>
        );
      case 'amount':
        return (
          <td key={colKey} className="px-3 font-data-mono font-bold text-on-surface">
            ৳{(bill.amount || 0).toLocaleString()}
          </td>
        );
      case 'status':
        return (
          <td key={colKey} className="px-3">
            {getStatusBadge(bill.status)}
          </td>
        );
      default:
        return null;
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
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {isAdmin && (
            // <button
            //   type="button"
            //   onClick={() => setIsCategoryModalOpen(true)}
            //   className="group inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-teal-50 hover:border-teal-200 transition-all duration-200 cursor-pointer"
            // >
            //   <span className="material-symbols-outlined text-[18px] text-teal-600 group-hover:scale-110 transition-transform">
            //     tune
            //   </span>

            //   <span className="text-xs font-semibold text-slate-600 group-hover:text-teal-700">
            //     Manage Categories
            //   </span>

            //   <span className="material-symbols-outlined text-[15px] text-slate-400 group-hover:text-teal-500 transition-colors">
            //     chevron_right
            //   </span>
            // </button>
            <button
  type="button"
  onClick={() => setIsCategoryModalOpen(true)}
  className="group inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:border-teal-200 dark:hover:border-teal-800/60 transition-all duration-200 cursor-pointer"
>
  <span className="material-symbols-outlined text-[18px] text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
    tune
  </span>

  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
    Manage Categories
  </span>

  <span className="material-symbols-outlined text-[15px] text-slate-400 dark:text-slate-500 group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors">
    chevron_right
  </span>
</button>

          )}
         
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

      {/* KPI Stats Cards with Click Filters & Smooth Scroll */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Bills Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => {
            setStatusFilter('ALL');
            setCurrentPage(1);
            scrollToTable();
          }}
          className={`bg-surface-container-lowest p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${statusFilter === 'ALL'
            ? 'border-teal-600 ring-1 ring-teal-600/30 bg-teal-50/20'
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
            <span className="text-xl sm:text-2xl font-bold text-on-surface font-data-mono block">
              {stats?.totalBills || 0}
            </span>
            <span className="text-[11px] sm:text-xs text-secondary flex items-center gap-0.5 mt-0.5 font-data-mono">
              <span>৳</span>
              <span>{(stats?.totalVolumeTk || 0).toLocaleString()}</span>
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
            scrollToTable();
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
            <span className="text-xl sm:text-2xl font-bold text-amber-600 font-data-mono block">
              {stats?.pendingBills || 0}
            </span>
            <span className="text-[11px] sm:text-xs text-secondary block mt-0.5 font-data-mono">
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
            scrollToTable();
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
            <span className="text-xl sm:text-2xl font-bold text-teal-600 font-data-mono block">
              {stats?.approvedBills || 0}
            </span>
            <span className="text-[11px] sm:text-xs text-secondary block mt-0.5 font-data-mono">
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
            scrollToTable();
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
            <span className="text-xl sm:text-2xl font-bold text-emerald-600 font-data-mono block">
              {stats?.paidBills ?? 0}
            </span>
            <span className="text-[11px] sm:text-xs text-secondary block mt-0.5 font-data-mono">
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
            scrollToTable();
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
            <span className="text-xl sm:text-2xl font-bold text-rose-600 font-data-mono block">
              {stats?.rejectedBills || 0}
            </span>
            <span className="text-[11px] sm:text-xs text-secondary block mt-0.5 font-data-mono">
              ৳{(stats?.rejectedVolumeTk || 0).toLocaleString()}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Graphs / Charts */}
      {stats && <AmountCharts stats={stats} />}

      {/* Bills Table Container with Ref attached */}
      <div ref={tableSectionRef} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-xs flex flex-col scroll-mt-6">
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

            {/* Column Visibility Toggle Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsColumnCustomizerOpen(!isColumnCustomizerOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer shadow-xs ${
                  isColumnCustomizerOpen
                    ? 'bg-teal-50 text-teal-700 border-teal-500'
                    : 'bg-surface text-on-surface border-outline-variant/40 hover:border-teal-600'
                }`}
                title="Toggle columns visibility & reorder"
              >
                <span className="material-symbols-outlined text-[12px] text-teal-600">view_column</span>
                <span>Columns</span>
              </button>

              {/* Column Customizer Dropdown Popover */}
              <AnimatePresence>
                {isColumnCustomizerOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 bg-surface-container-lowest p-3.5 rounded-xl border border-outline-variant/30 shadow-xl z-30 flex flex-col gap-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-teal-600 text-base">tune</span>
                        <h3 className="font-bold text-on-surface uppercase tracking-wider text-[11px]">
                          Show / Hide Columns
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsColumnCustomizerOpen(false)}
                        className="text-secondary hover:text-on-surface cursor-pointer p-0.5"
                      >
                        <span className="material-symbols-outlined text-base">close</span>
                      </button>
                    </div>

                    <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1">
                      {columns.map((col) => (
                        <label 
                          key={col.key} 
                          className="flex items-center justify-between p-1.5 rounded-lg hover:bg-surface border border-transparent hover:border-outline-variant/30 cursor-pointer select-none"
                        >
                          <span className="font-medium text-on-surface text-xs" title={col.label}>
                            {col.label}
                          </span>
                          <input
                            type="checkbox"
                            checked={hiddenColumns[col.key]}
                            onChange={() => handleToggleColumnVisibility(col.key)}
                            className="accent-teal-600 rounded cursor-pointer w-4 h-4"
                          />
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead>
              <tr className="bg-surface-container-low text-secondary uppercase tracking-wider h-10">
                {columns.map((col, index) => 
                  hiddenColumns[col.key] ? renderHeaderCell(col.key, index) : null
                )}
                <th className="px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {paginatedBills.length === 0 ? (
                <tr>
                  <td colSpan={columns.filter(c => hiddenColumns[c.key]).length + 1} className="py-10 text-center text-secondary">
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
                    {columns.map((col) => 
                      hiddenColumns[col.key] ? renderCellContent(col.key, bill) : null
                    )}
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
  <div className="flex items-center justify-between p-3 bg-surface-bright border-t border-outline-variant/20 text-xs">
    <span className="text-secondary">
      Page <span className="font-semibold text-foreground">{currentPage}</span> of {totalPages}
    </span>
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        className="px-3 py-1 rounded-full bg-outline-variant/10 text-secondary hover:bg-outline-variant/20 disabled:opacity-30 transition-all cursor-pointer font-medium"
      >
        ← Prev
      </button>
      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        className="px-3 py-1 rounded-full bg-outline-variant/10 text-secondary hover:bg-outline-variant/20 disabled:opacity-30 transition-all cursor-pointer font-medium"
      >
        Next →
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




// ======================2nd with calender all filter  ====================




// 'use client';
// import React, { useState, useMemo, useRef } from 'react';
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

// // Sorting Types
// type SortField = 'ticket_id' | 'user_id' | 'category' | 'support_agent' | 'date' | 'description' | 'amount' | 'status' | null;
// type SortOrder = 'asc' | 'desc';

// // Column Management Types
// type ColumnKey = 
//   | 'ticket_id' 
//   | 'user_id' 
//   | 'category' 
//   | 'support_agent' 
//   | 'date' 
//   | 'description' 
//   | 'amount' 
//   | 'status';

// interface ColumnConfig {
//   key: ColumnKey;
//   label: string;
// }

// const DEFAULT_COLUMNS: ColumnConfig[] = [
//   { key: 'ticket_id', label: 'Ticket ID' },
//   { key: 'user_id', label: 'User ID' },
//   { key: 'category', label: 'Category' },
//   { key: 'support_agent', label: 'Support Staff' },
//   { key: 'date', label: 'Date' },
//   { key: 'description', label: 'Description' },
//   { key: 'amount', label: 'Amount' },
//   { key: 'status', label: 'Status' },
// ];

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

//   // Helper to get Current Year-Month in YYYY-MM format
//   const getCurrentYearMonth = () => {
//     const now = new Date();
//     const year = now.getFullYear();
//     const month = String(now.getMonth() + 1).padStart(2, '0');
//     return `${year}-${month}`;
//   };

//   // Month Filter State (Default is Running/Current Month)
//   const [selectedMonth, setSelectedMonth] = useState(getCurrentYearMonth());

//   // Table Section Ref for Smooth Scrolling
//   const tableSectionRef = useRef<HTMLDivElement>(null);

//   const scrollToTable = () => {
//     if (tableSectionRef.current) {
//       tableSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
//     }
//   };

//   // Sorting States
//   const [sortField, setSortField] = useState<SortField>(null);
//   const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

//   // Column Customization States
//   const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
//   const [hiddenColumns, setHiddenColumns] = useState<Record<ColumnKey, boolean>>({
//     ticket_id: true,
//     user_id: true,
//     category: true,
//     support_agent: true,
//     date: true,
//     description: true,
//     amount: true,
//     status: true,
//   });
//   const [isColumnCustomizerOpen, setIsColumnCustomizerOpen] = useState(false);

//   // Drag and Drop States for Table Headers
//   const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(null);

//   const handleDragStart = (e: React.DragEvent, index: number) => {
//     setDraggedColumnIndex(index);
//     e.dataTransfer.effectAllowed = 'move';
//   };

//   const handleDragOver = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.dataTransfer.dropEffect = 'move';
//   };

//   const handleDrop = (e: React.DragEvent, targetIndex: number) => {
//     e.preventDefault();
//     if (draggedColumnIndex === null || draggedColumnIndex === targetIndex) return;

//     const newCols = [...columns];
//     const [movedCol] = newCols.splice(draggedColumnIndex, 1);
//     newCols.splice(targetIndex, 0, movedCol);

//     setColumns(newCols);
//     setDraggedColumnIndex(null);
//   };

//   const handleToggleColumnVisibility = (key: ColumnKey) => {
//     setHiddenColumns((prev) => ({ ...prev, [key]: !prev[key] }));
//   };

//   const handleSort = (field: SortField) => {
//     if (sortField === field) {
//       setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
//     } else {
//       setSortField(field);
//       setSortOrder('asc');
//     }
//   };

//   const renderSortIcon = (field: SortField) => {
//     return (
//       <span className="material-symbols-outlined text-[13px] text-secondary/70 inline-flex align-middle ml-0.5">
//         {sortField === field
//           ? sortOrder === 'asc'
//             ? 'arrow_drop_up'
//             : 'arrow_drop_down'
//           : 'unfold_more'}
//       </span>
//     );
//   };

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

//   // Helper to extract YYYY-MM from bill date
//   const getBillYearMonth = (dateStr: string): string => {
//     if (!dateStr) return '';
//     const d = new Date(dateStr);
//     if (isNaN(d.getTime())) {
//       // Fallback string matching if format is YYYY-MM-DD
//       return dateStr.substring(0, 7);
//     }
//     const year = d.getFullYear();
//     const month = String(d.getMonth() + 1).padStart(2, '0');
//     return `${year}-${month}`;
//   };

//   // Dynamic KPI Stats calculation according to Selected Month
//   const dynamicStats = useMemo(() => {
//     const monthBills = bills.filter((b) => getBillYearMonth(b.date) === selectedMonth);

//     const totalBills = monthBills.length;
//     const totalVolumeTk = monthBills.reduce((acc, b) => acc + (Number(b.amount) || 0), 0);

//     const pendingBillsList = monthBills.filter((b) => (b.status || '').toLowerCase() === 'pending');
//     const approvedBillsList = monthBills.filter((b) => (b.status || '').toLowerCase() === 'approved');
//     const paidBillsList = monthBills.filter((b) => (b.status || '').toLowerCase() === 'paid');
//     const rejectedBillsList = monthBills.filter((b) => (b.status || '').toLowerCase() === 'rejected');

//     return {
//       totalBills,
//       totalVolumeTk,
//       pendingBills: pendingBillsList.length,
//       pendingVolumeTk: pendingBillsList.reduce((acc, b) => acc + (Number(b.amount) || 0), 0),
//       approvedBills: approvedBillsList.length,
//       approvedVolumeTk: approvedBillsList.reduce((acc, b) => acc + (Number(b.amount) || 0), 0),
//       paidBills: paidBillsList.length,
//       paidVolumeTk: paidBillsList.reduce((acc, b) => acc + (Number(b.amount) || 0), 0),
//       rejectedBills: rejectedBillsList.length,
//       rejectedVolumeTk: rejectedBillsList.reduce((acc, b) => acc + (Number(b.amount) || 0), 0),
//     };
//   }, [bills, selectedMonth]);

//   // Filter & Sort Logic based strictly on Selected Month
//   const filteredBills = useMemo(() => {
//     const result = bills.filter((b) => {
//       const matchesSearch =
//         !search ||
//         (b.ticket_id || '').toLowerCase().includes(search.toLowerCase()) ||
//         (b.user_id || '').toLowerCase().includes(search.toLowerCase()) ||
//         (b.description || '').toLowerCase().includes(search.toLowerCase()) ||
//         (b.created_by || '').toLowerCase().includes(search.toLowerCase());

//       const matchesStatus =
//         statusFilter === 'ALL' ||
//         (b.status || '').toUpperCase() === statusFilter.toUpperCase();

//       // Category Filter Matching
//       let matchesCategory = categoryFilter === 'ALL';
//       if (!matchesCategory) {
//         const billCatId = getBillCategoryId(b);
//         const categoryName = getCategoryName(b).toLowerCase();
//         const selectedCategoryObj = categories.find(
//           (c) => String(c.id) === String(categoryFilter)
//         );

//         matchesCategory =
//           billCatId === String(categoryFilter).trim() ||
//           Boolean(
//             selectedCategoryObj &&
//             categoryName === selectedCategoryObj.name.toLowerCase()
//           );
//       }

//       // Exact Month Filter Logic (Shudhu selected month er bill filter hobe)
//       const billYM = getBillYearMonth(b.date);
//       const matchesMonthFilter = selectedMonth ? billYM === selectedMonth : true;

//       return matchesSearch && matchesStatus && matchesCategory && matchesMonthFilter;
//     });

//     if (sortField) {
//       result.sort((a, b) => {
//         let valA: any;
//         let valB: any;

//         if (sortField === 'support_agent') {
//           valA = String(a.created_by || '').toLowerCase();
//           valB = String(b.created_by || '').toLowerCase();
//         } else if (sortField === 'category') {
//           valA = String(getCategoryName(a) || '').toLowerCase();
//           valB = String(getCategoryName(b) || '').toLowerCase();
//         } else {
//           valA = a[sortField as keyof Bill];
//           valB = b[sortField as keyof Bill];
//         }

//         if (sortField === 'amount') {
//           valA = Number(valA) || 0;
//           valB = Number(valB) || 0;
//         } else if (sortField === 'ticket_id' || sortField === 'user_id' || sortField === 'status') {
//           valA = String(valA || '').toLowerCase();
//           valB = String(valB || '').toLowerCase();
//         } else if (sortField === 'date') {
//           valA = new Date(valA || '').getTime();
//           valB = new Date(valB || '').getTime();
//         } else {
//           valA = String(valA || '').toLowerCase();
//           valB = String(valB || '').toLowerCase();
//         }

//         if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
//         if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
//         return 0;
//       });
//     }

//     return result;
//   }, [bills, search, statusFilter, categoryFilter, categories, selectedMonth, sortField, sortOrder]);

//   const totalPages = Math.max(1, Math.ceil(filteredBills.length / pageSize));
//   const paginatedBills = filteredBills.slice(
//     (currentPage - 1) * pageSize,
//     currentPage * pageSize
//   );

//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case 'Paid':
//         return (
//           <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
//             <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
//             Paid
//           </span>
//         );
//       case 'Pending':
//         return (
//           <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
//             <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
//             Pending
//           </span>
//         );
//       case 'Approved':
//         return (
//           <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
//             <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
//             Approved
//           </span>
//         );
//       case 'Rejected':
//         return (
//           <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
//             <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
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

//   // Render Header Cell with Drag & Drop + Sorting
//   const renderHeaderCell = (colKey: ColumnKey, index: number) => {
//     const innerContent = (() => {
//       switch (colKey) {
//         case 'ticket_id':
//           return <>Ticket ID {renderSortIcon('ticket_id')}</>;
//         case 'user_id':
//           return <>User ID {renderSortIcon('user_id')}</>;
//         case 'category':
//           return <>Category {renderSortIcon('category')}</>;
//         case 'support_agent':
//           return <>Support Staff {renderSortIcon('support_agent')}</>;
//         case 'date':
//           return <>Date {renderSortIcon('date')}</>;
//         case 'description':
//           return <>Description {renderSortIcon('description')}</>;
//         case 'amount':
//           return <>Amount {renderSortIcon('amount')}</>;
//         case 'status':
//           return <>Status {renderSortIcon('status')}</>;
//         default:
//           return null;
//       }
//     })();

//     return (
//       <th
//         key={colKey}
//         draggable
//         onDragStart={(e) => handleDragStart(e, index)}
//         onDragOver={handleDragOver}
//         onDrop={(e) => handleDrop(e, index)}
//         onClick={() => handleSort(colKey as SortField)}
//         className="px-3 font-semibold select-none cursor-grab active:cursor-grabbing hover:bg-surface-container transition-colors cursor-pointer hover:text-on-surface"
//         title="Drag to reorder column"
//       >
//         <div className="flex items-center gap-1">
//           <span className="material-symbols-outlined text-xs text-secondary/50 cursor-grab">drag_indicator</span>
//           <span>{innerContent}</span>
//         </div>
//       </th>
//     );
//   };

//   // Render Cell Content based on Column Key
//   const renderCellContent = (colKey: ColumnKey, bill: Bill) => {
//     switch (colKey) {
//       case 'ticket_id':
//         return (
//           <td key={colKey} className="px-4 font-data-mono font-bold text-teal-700">
//             <a
//               href={`http://139.162.2.178/tms/dotproject/index.php?m=ticketsmith&a=view&ticket=${bill.ticket_id}`}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="cursor-pointer hover:text-teal-900 hover:underline"
//             >
//               #{bill.ticket_id}
//             </a>
//           </td>
//         );
//       case 'user_id':
//         return (
//           <td key={colKey} className="px-3 font-data-mono text-secondary">
//             {bill.user_id}
//           </td>
//         );
//       case 'category':
//         return (
//           <td key={colKey} className="px-3">
//             <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg
//               bg-gradient-to-r from-primary/10 via-primary/5 to-transparent
//               text-primary font-semibold text-[11px]
//               border border-primary/15
//               shadow-sm shadow-primary/5
//               whitespace-nowrap">
//               <span className="w-1.5 h-1.5 rounded-full bg-primary" />
//               {getCategoryName(bill)}
//             </span>
//           </td>
//         );
//       case 'support_agent':
//         return (
//           <td key={colKey} className="px-3">
//             <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 font-medium text-[11px] border border-teal-200">
//               <span className="material-symbols-outlined text-xs">
//                 person
//               </span>
//               <span className="truncate max-w-[120px]">
//                 {bill.created_by || 'Support Staff'}
//               </span>
//             </span>
//           </td>
//         );
//       case 'date':
//         return (
//           <td key={colKey} className="px-3 text-secondary font-data-mono">
//             {bill.date}
//           </td>
//         );
//       case 'description':
//         return (
//           <td key={colKey} className="px-3 max-w-xs truncate text-on-surface">
//             {bill.description}
//           </td>
//         );
//       case 'amount':
//         return (
//           <td key={colKey} className="px-3 font-data-mono font-bold text-on-surface">
//             ৳{(bill.amount || 0).toLocaleString()}
//           </td>
//         );
//       case 'status':
//         return (
//           <td key={colKey} className="px-3">
//             {getStatusBadge(bill.status)}
//           </td>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="flex flex-col gap-5 w-full">
//       {/* Top Header Banner */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 shadow-xs">
//         <div>
//           <h1 className="text-xl font-bold text-on-surface tracking-tight">
//             Billing Overview
//           </h1>
//           <p className="text-xs text-secondary mt-0.5 flex flex-wrap items-center gap-2">
//             <span>
//               Active operator:{' '}
//               <span className="font-semibold text-teal-700">
//                 {currentUser?.name}
//               </span>{' '}
//               ({currentUser?.role?.toUpperCase()})
//             </span>
//           </p>
//         </div>

//         <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
//           {/* Calendar Month Selector */}
//           <div className="relative flex items-center gap-2 bg-surface border border-outline-variant/40 hover:border-teal-600 rounded-xl px-3 py-1.5 shadow-xs transition-colors group cursor-pointer">
//             <span className="material-symbols-outlined text-teal-600 text-base pointer-events-none">
//               calendar_month
//             </span>
//             <span className="text-xs text-on-surface font-semibold pointer-events-none">
//               {selectedMonth ? new Date(selectedMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' }) : 'Select Month'}
//             </span>
//             <input
//               type="month"
//               value={selectedMonth}
//               onChange={(e) => {
//                 setSelectedMonth(e.target.value);
//                 setCurrentPage(1);
//               }}
//               className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
//               title="Select Month"
//             />
//           </div>

//           {isAdmin && (
//             <button
//               type="button"
//               onClick={() => setIsCategoryModalOpen(true)}
//               className="group inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-teal-50 hover:border-teal-200 transition-all duration-200 cursor-pointer"
//             >
//               <span className="material-symbols-outlined text-[18px] text-teal-600 group-hover:scale-110 transition-transform">
//                 tune
//               </span>

//               <span className="text-xs font-semibold text-slate-600 group-hover:text-teal-700">
//                 Manage Categories
//               </span>

//               <span className="material-symbols-outlined text-[15px] text-slate-400 group-hover:text-teal-500 transition-colors">
//                 chevron_right
//               </span>
//             </button>
//           )}
         
//           <button
//             type="button"
//             onClick={onOpenCreateBill}
//             className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium text-xs transition-colors shadow-xs cursor-pointer"
//           >
//             <span className="material-symbols-outlined text-base">add</span>
//             <span>Create Bill</span>
//           </button>
//         </div>
//       </div>

//       {/* Dynamic KPI Stats Cards (Selected Month onushare dynamically count update hobe) */}
//       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
//         {/* Total Bills Card */}
//         <motion.div
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           onClick={() => {
//             setStatusFilter('ALL');
//             setCurrentPage(1);
//             scrollToTable();
//           }}
//           className={`bg-surface-container-lowest p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${statusFilter === 'ALL'
//             ? 'border-teal-600 ring-1 ring-teal-600/30 bg-teal-50/20'
//             : 'border-outline-variant/30 hover:border-teal-500/60 hover:shadow-sm'
//             } shadow-xs flex flex-col justify-between`}
//         >
//           <div className="flex items-center justify-between">
//             <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
//               {currentUser?.role === 'support' ? 'Your Bills' : 'Total Bills'}
//             </span>
//             <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
//               <span className="material-symbols-outlined text-base">
//                 receipt_long
//               </span>
//             </div>
//           </div>
          
//           <div className="mt-2">
//             <span className="text-xl sm:text-2xl font-bold text-on-surface font-data-mono block">
//               {dynamicStats.totalBills}
//             </span>
//             <span className="text-[11px] sm:text-xs text-secondary flex items-center gap-0.5 mt-0.5 font-data-mono">
//               <span>৳</span>
//               <span>{dynamicStats.totalVolumeTk.toLocaleString()}</span>
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
//             scrollToTable();
//           }}
//           className={`bg-surface-container-lowest p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${statusFilter === 'Pending'
//             ? 'border-amber-500 ring-1 ring-amber-500/30 bg-amber-50/30'
//             : 'border-outline-variant/30 hover:border-amber-500/60 hover:shadow-sm'
//             } shadow-xs flex flex-col justify-between`}
//         >
//           <div className="flex items-center justify-between">
//             <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
//               {currentUser?.role === 'support' ? 'Your Pending' : 'Pending'}
//             </span>
//             <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
//               <span className="material-symbols-outlined text-base">
//                 pending_actions
//               </span>
//             </div>
//           </div>
        
//           <div className="mt-2">
//             <span className="text-xl sm:text-2xl font-bold text-amber-600 font-data-mono block">
//               {dynamicStats.pendingBills}
//             </span>
//             <span className="text-[11px] sm:text-xs text-secondary block mt-0.5 font-data-mono">
//               ৳{dynamicStats.pendingVolumeTk.toLocaleString()}
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
//             scrollToTable();
//           }}
//           className={`bg-surface-container-lowest p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${statusFilter === 'Approved'
//             ? 'border-teal-500 ring-1 ring-teal-500/30 bg-teal-50/30'
//             : 'border-outline-variant/30 hover:border-teal-500/60 hover:shadow-sm'
//             } shadow-xs flex flex-col justify-between`}
//         >
//           <div className="flex items-center justify-between">
//             <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
//               {currentUser?.role === 'support' ? 'Your Approved' : 'Approved'}
//             </span>
//             <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
//               <span className="material-symbols-outlined text-base">
//                 verified
//               </span>
//             </div>
//           </div>
          
//           <div className="mt-2">
//             <span className="text-xl sm:text-2xl font-bold text-teal-600 font-data-mono block">
//               {dynamicStats.approvedBills}
//             </span>
//             <span className="text-[11px] sm:text-xs text-secondary block mt-0.5 font-data-mono">
//               ৳{dynamicStats.approvedVolumeTk.toLocaleString()}
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
//             scrollToTable();
//           }}
//           className={`bg-surface-container-lowest p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${statusFilter === 'Paid'
//             ? 'border-emerald-500 ring-1 ring-emerald-500/30 bg-emerald-50/30'
//             : 'border-outline-variant/30 hover:border-emerald-500/60 hover:shadow-sm'
//             } shadow-xs flex flex-col justify-between`}
//         >
//           <div className="flex items-center justify-between">
//             <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
//               {currentUser?.role === 'support' ? 'Your Paid' : 'Paid & Cleared'}
//             </span>
//             <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
//               <span className="material-symbols-outlined text-base">
//                 payments
//               </span>
//             </div>
//           </div>
          
//           <div className="mt-2">
//             <span className="text-xl sm:text-2xl font-bold text-emerald-600 font-data-mono block">
//               {dynamicStats.paidBills}
//             </span>
//             <span className="text-[11px] sm:text-xs text-secondary block mt-0.5 font-data-mono">
//               ৳{dynamicStats.paidVolumeTk.toLocaleString()}
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
//             scrollToTable();
//           }}
//           className={`bg-surface-container-lowest p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${statusFilter === 'Rejected'
//             ? 'border-rose-500 ring-1 ring-rose-500/30 bg-rose-50/30'
//             : 'border-outline-variant/30 hover:border-rose-500/60 hover:shadow-sm'
//             } shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1`}
//         >
//           <div className="flex items-center justify-between">
//             <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
//               {currentUser?.role === 'support' ? 'Your Rejected' : 'Rejected'}
//             </span>
//             <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
//               <span className="material-symbols-outlined text-base">
//                 cancel
//               </span>
//             </div>
//           </div>
         
//           <div className="mt-2">
//             <span className="text-xl sm:text-2xl font-bold text-rose-600 font-data-mono block">
//               {dynamicStats.rejectedBills}
//             </span>
//             <span className="text-[11px] sm:text-xs text-secondary block mt-0.5 font-data-mono">
//               ৳{dynamicStats.rejectedVolumeTk.toLocaleString()}
//             </span>
//           </div>
//         </motion.div>
//       </div>

//       {/* Graphs / Charts */}
//       {stats && <AmountCharts stats={stats} />}

//       {/* Bills Table Container */}
//       <div ref={tableSectionRef} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-xs flex flex-col scroll-mt-6">
//         {/* Toolbar */}
//         <div className="p-3.5 bg-surface-bright flex flex-col sm:flex-row items-center justify-between gap-2.5 border-b border-outline-variant/20">
//           <div className="relative w-full sm:w-80">
//             <span className="material-symbols-outlined absolute left-2.5 top-2 text-secondary text-base">
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
//               className="w-full pl-8 pr-3 py-1.5 bg-surface text-on-surface text-xs rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600"
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
//                 className="bg-surface text-on-surface text-xs rounded-lg border border-outline-variant/40 px-2.5 py-1.5 focus:outline-none cursor-pointer"
//               >
//                 <option value="ALL">All Categories</option>
//                 {categories.map((cat) => (
//                   <option key={cat.id} value={String(cat.id)}>
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
//               className="bg-surface text-on-surface text-xs rounded-lg border border-outline-variant/40 px-2.5 py-1.5 focus:outline-none cursor-pointer"
//             >
//               <option value="ALL">All Statuses</option>
//               <option value="Pending">Pending</option>
//               <option value="Approved">Approved</option>
//               <option value="Paid">Paid (Cleared)</option>
//               <option value="Rejected">Rejected</option>
//             </select>

//             {/* Column Visibility Toggle Button */}
//             <div className="relative">
//               <button
//                 type="button"
//                 onClick={() => setIsColumnCustomizerOpen(!isColumnCustomizerOpen)}
//                 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer shadow-xs ${
//                   isColumnCustomizerOpen
//                     ? 'bg-teal-50 text-teal-700 border-teal-500'
//                     : 'bg-surface text-on-surface border-outline-variant/40 hover:border-teal-600'
//                 }`}
//                 title="Toggle columns visibility & reorder"
//               >
//                 <span className="material-symbols-outlined text-[12px] text-teal-600">view_column</span>
//                 <span>Columns</span>
//               </button>

//               {/* Column Customizer Dropdown Popover */}
//               <AnimatePresence>
//                 {isColumnCustomizerOpen && (
//                   <motion.div
//                     initial={{ opacity: 0, y: 8, scale: 0.96 }}
//                     animate={{ opacity: 1, y: 0, scale: 1 }}
//                     exit={{ opacity: 0, y: 8, scale: 0.96 }}
//                     transition={{ duration: 0.15 }}
//                     className="absolute right-0 mt-2 w-64 bg-surface-container-lowest p-3.5 rounded-xl border border-outline-variant/30 shadow-xl z-30 flex flex-col gap-2.5 text-xs"
//                   >
//                     <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
//                       <div className="flex items-center gap-1.5">
//                         <span className="material-symbols-outlined text-teal-600 text-base">tune</span>
//                         <h3 className="font-bold text-on-surface uppercase tracking-wider text-[11px]">
//                           Show / Hide Columns
//                         </h3>
//                       </div>
//                       <button
//                         type="button"
//                         onClick={() => setIsColumnCustomizerOpen(false)}
//                         className="text-secondary hover:text-on-surface cursor-pointer p-0.5"
//                       >
//                         <span className="material-symbols-outlined text-base">close</span>
//                       </button>
//                     </div>

//                     <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1">
//                       {columns.map((col) => (
//                         <label 
//                           key={col.key} 
//                           className="flex items-center justify-between p-1.5 rounded-lg hover:bg-surface border border-transparent hover:border-outline-variant/30 cursor-pointer select-none"
//                         >
//                           <span className="font-medium text-on-surface text-xs" title={col.label}>
//                             {col.label}
//                           </span>
//                           <input
//                             type="checkbox"
//                             checked={hiddenColumns[col.key]}
//                             onChange={() => handleToggleColumnVisibility(col.key)}
//                             className="accent-teal-600 rounded cursor-pointer w-4 h-4"
//                           />
//                         </label>
//                       ))}
//                     </div>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>
//           </div>
//         </div>

//         {/* Table */}
//         <div className="overflow-x-auto">
//           <table className="w-full text-left text-xs min-w-[750px]">
//             <thead>
//               <tr className="bg-surface-container-low text-secondary uppercase tracking-wider h-10">
//                 {columns.map((col, index) => 
//                   hiddenColumns[col.key] ? renderHeaderCell(col.key, index) : null
//                 )}
//                 <th className="px-4 font-semibold text-right">Action</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-outline-variant/20">
//               {paginatedBills.length === 0 ? (
//                 <tr>
//                   <td colSpan={columns.filter(c => hiddenColumns[c.key]).length + 1} className="py-10 text-center text-secondary">
//                     <div className="flex flex-col items-center justify-center gap-2">
//                       <span className="material-symbols-outlined text-4xl text-secondary">
//                         search_off
//                       </span>
//                       <span className="text-sm font-medium">
//                         No bills found for the selected month/filters.
//                       </span>
//                     </div>
//                   </td>
//                 </tr>
//               ) : (
//                 paginatedBills.map((bill) => (
//                   <tr
//                     key={bill.id}
//                     className="hover:bg-surface-container-low/60 transition-colors h-12"
//                   >
//                     {columns.map((col) => 
//                       hiddenColumns[col.key] ? renderCellContent(col.key, bill) : null
//                     )}
//                     <td className="px-4 text-right">
//                       <button
//                         type="button"
//                         onClick={() => onViewDetails(bill)}
//                         className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-medium transition-colors cursor-pointer"
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
//           <div className="flex items-center justify-between p-3 bg-surface-bright border-t border-outline-variant/20 text-xs">
//             <span className="text-secondary">
//               Page <span className="font-semibold text-foreground">{currentPage}</span> of {totalPages}
//             </span>
//             <div className="flex items-center gap-1.5">
//               <button
//                 type="button"
//                 disabled={currentPage === 1}
//                 onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//                 className="px-3 py-1 rounded-full bg-outline-variant/10 text-secondary hover:bg-outline-variant/20 disabled:opacity-30 transition-all cursor-pointer font-medium"
//               >
//                 ← Prev
//               </button>
//               <button
//                 type="button"
//                 disabled={currentPage === totalPages}
//                 onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
//                 className="px-3 py-1 rounded-full bg-outline-variant/10 text-secondary hover:bg-outline-variant/20 disabled:opacity-30 transition-all cursor-pointer font-medium"
//               >
//                 Next →
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Admin Category Management Modal */}
//       <AnimatePresence>
//         {isCategoryModalOpen && isAdmin && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.95 }}
//               className="bg-surface-container-lowest w-full max-w-md rounded-xl border border-outline-variant/30 shadow-lg p-5 flex flex-col gap-4"
//             >
//               <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
//                 <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
//                   <span className="material-symbols-outlined text-[18px] text-teal-600 group-hover:scale-110 transition-transform">
//                     tune
//                   </span>
//                   Manage Categories
//                 </h3>
//                 <button
//                   type="button"
//                   onClick={() => setIsCategoryModalOpen(false)}
//                   className="text-secondary hover:text-on-surface cursor-pointer"
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
//                   className="flex-1 px-3 py-1.5 text-xs bg-surface border border-outline-variant/40 rounded-lg focus:outline-none focus:border-teal-600"
//                 />
//                 <button
//                   type="submit"
//                   disabled={isSubmitting || !newCatName.trim()}
//                   className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium cursor-pointer"
//                 >
//                   Add
//                 </button>
//               </form>

//               {/* Category List */}
//               <div className="max-h-60 overflow-y-auto divide-y divide-outline-variant/20 border border-outline-variant/30 rounded-lg">
//                 {categories.length === 0 ? (
//                   <div className="p-4 text-center text-xs text-secondary">
//                     No categories created yet.
//                   </div>
//                 ) : (
//                   categories.map((cat) => (
//                     <div
//                       key={cat.id}
//                       className="p-2.5 flex items-center justify-between gap-2 hover:bg-surface-container-low"
//                     >
//                       {editingCatId === cat.id ? (
//                         <div className="flex items-center gap-1.5 flex-1">
//                           <input
//                             type="text"
//                             value={editingCatName}
//                             onChange={(e) => setEditingCatName(e.target.value)}
//                             className="flex-1 px-2 py-1 text-xs bg-surface border border-outline-variant/40 rounded focus:outline-none"
//                           />
//                           <button
//                             type="button"
//                             onClick={() => handleUpdateCategory(cat.id)}
//                             disabled={isSubmitting}
//                             className="text-teal-600 hover:text-teal-700 text-xs font-bold px-1.5"
//                           >
//                             Save
//                           </button>
//                           <button
//                             type="button"
//                             onClick={() => setEditingCatId(null)}
//                             className="text-secondary hover:text-on-surface text-xs px-1.5"
//                           >
//                             Cancel
//                           </button>
//                         </div>
//                       ) : (
//                         <>
//                           <span className="text-xs font-medium text-on-surface">
//                             {cat.name}
//                           </span>
//                           <div className="flex items-center gap-1">
//                             <button
//                               type="button"
//                               onClick={() => {
//                                 setEditingCatId(cat.id);
//                                 setEditingCatName(cat.name);
//                               }}
//                               className="text-secondary hover:text-teal-600 p-1 cursor-pointer"
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
//                               className="text-secondary hover:text-rose-600 p-1 cursor-pointer"
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
//                   className="px-4 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-medium rounded-lg cursor-pointer"
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





// ==============3rd===================











// 'use client';
// import React, { useState, useMemo, useRef } from 'react';
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

// // Sorting Types
// type SortField = 'ticket_id' | 'user_id' | 'category' | 'support_agent' | 'date' | 'description' | 'amount' | 'status' | null;
// type SortOrder = 'asc' | 'desc';

// // Column Management Types
// type ColumnKey = 
//   | 'ticket_id' 
//   | 'user_id' 
//   | 'category' 
//   | 'support_agent' 
//   | 'date' 
//   | 'description' 
//   | 'amount' 
//   | 'status';

// interface ColumnConfig {
//   key: ColumnKey;
//   label: string;
// }

// const DEFAULT_COLUMNS: ColumnConfig[] = [
//   { key: 'ticket_id', label: 'Ticket ID' },
//   { key: 'user_id', label: 'User ID' },
//   { key: 'category', label: 'Category' },
//   { key: 'support_agent', label: 'Support Staff' },
//   { key: 'date', label: 'Date' },
//   { key: 'description', label: 'Description' },
//   { key: 'amount', label: 'Amount' },
//   { key: 'status', label: 'Status' },
// ];

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

//   // Helper to get Current Year-Month in YYYY-MM format
//   const getCurrentYearMonth = () => {
//     const now = new Date();
//     const year = now.getFullYear();
//     const month = String(now.getMonth() + 1).padStart(2, '0');
//     return `${year}-${month}`;
//   };

//   // Month Filter State (Default is Running/Current Month)
//   const [selectedMonth, setSelectedMonth] = useState(getCurrentYearMonth());

//   // Table Section Ref for Smooth Scrolling
//   const tableSectionRef = useRef<HTMLDivElement>(null);

//   const scrollToTable = () => {
//     if (tableSectionRef.current) {
//       tableSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
//     }
//   };

//   // Sorting States
//   const [sortField, setSortField] = useState<SortField>(null);
//   const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

//   // Column Customization States
//   const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
//   const [hiddenColumns, setHiddenColumns] = useState<Record<ColumnKey, boolean>>({
//     ticket_id: true,
//     user_id: true,
//     category: true,
//     support_agent: true,
//     date: true,
//     description: true,
//     amount: true,
//     status: true,
//   });
//   const [isColumnCustomizerOpen, setIsColumnCustomizerOpen] = useState(false);

//   // Drag and Drop States for Table Headers
//   const [draggedColumnIndex, setDraggedColumnIndex] = useState<number | null>(null);

//   const handleDragStart = (e: React.DragEvent, index: number) => {
//     setDraggedColumnIndex(index);
//     e.dataTransfer.effectAllowed = 'move';
//   };

//   const handleDragOver = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.dataTransfer.dropEffect = 'move';
//   };

//   const handleDrop = (e: React.DragEvent, targetIndex: number) => {
//     e.preventDefault();
//     if (draggedColumnIndex === null || draggedColumnIndex === targetIndex) return;

//     const newCols = [...columns];
//     const [movedCol] = newCols.splice(draggedColumnIndex, 1);
//     newCols.splice(targetIndex, 0, movedCol);

//     setColumns(newCols);
//     setDraggedColumnIndex(null);
//   };

//   const handleToggleColumnVisibility = (key: ColumnKey) => {
//     setHiddenColumns((prev) => ({ ...prev, [key]: !prev[key] }));
//   };

//   const handleSort = (field: SortField) => {
//     if (sortField === field) {
//       setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
//     } else {
//       setSortField(field);
//       setSortOrder('asc');
//     }
//   };

//   const renderSortIcon = (field: SortField) => {
//     return (
//       <span className="material-symbols-outlined text-[13px] text-secondary/70 inline-flex align-middle ml-0.5">
//         {sortField === field
//           ? sortOrder === 'asc'
//             ? 'arrow_drop_up'
//             : 'arrow_drop_down'
//           : 'unfold_more'}
//       </span>
//     );
//   };

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

//   // Helper to extract YYYY-MM from bill date
//   const getBillYearMonth = (dateStr: string): string => {
//     if (!dateStr) return '';
//     const d = new Date(dateStr);
//     if (isNaN(d.getTime())) {
//       return dateStr.substring(0, 7);
//     }
//     const year = d.getFullYear();
//     const month = String(d.getMonth() + 1).padStart(2, '0');
//     return `${year}-${month}`;
//   };

//   // Dynamic KPI Stats calculation
//   // NOTE: Pending bills bypass month check to show total pending bills across ALL months
//   const dynamicStats = useMemo(() => {
//     const allPendingBills = bills.filter((b) => (b.status || '').toLowerCase() === 'pending');

//     const monthBills = bills.filter((b) => getBillYearMonth(b.date) === selectedMonth);
//     const approvedBillsList = monthBills.filter((b) => (b.status || '').toLowerCase() === 'approved');
//     const paidBillsList = monthBills.filter((b) => (b.status || '').toLowerCase() === 'paid');
//     const rejectedBillsList = monthBills.filter((b) => (b.status || '').toLowerCase() === 'rejected');

//     // Total bills inside overview stats = All Pending Bills + Selected Month's Non-Pending Bills
//     const effectiveTotalCount = allPendingBills.length + approvedBillsList.length + paidBillsList.length + rejectedBillsList.length;
//     const effectiveTotalTk = 
//       allPendingBills.reduce((acc, b) => acc + (Number(b.amount) || 0), 0) +
//       approvedBillsList.reduce((acc, b) => acc + (Number(b.amount) || 0), 0) +
//       paidBillsList.reduce((acc, b) => acc + (Number(b.amount) || 0), 0) +
//       rejectedBillsList.reduce((acc, b) => acc + (Number(b.amount) || 0), 0);

//     return {
//       totalBills: effectiveTotalCount,
//       totalVolumeTk: effectiveTotalTk,
//       pendingBills: allPendingBills.length,
//       pendingVolumeTk: allPendingBills.reduce((acc, b) => acc + (Number(b.amount) || 0), 0),
//       approvedBills: approvedBillsList.length,
//       approvedVolumeTk: approvedBillsList.reduce((acc, b) => acc + (Number(b.amount) || 0), 0),
//       paidBills: paidBillsList.length,
//       paidVolumeTk: paidBillsList.reduce((acc, b) => acc + (Number(b.amount) || 0), 0),
//       rejectedBills: rejectedBillsList.length,
//       rejectedVolumeTk: rejectedBillsList.reduce((acc, b) => acc + (Number(b.amount) || 0), 0),
//     };
//   }, [bills, selectedMonth]);

//   // Filter & Sort Logic:
//   // Pending Bills will ALWAYS be included regardless of selected Month.
//   // Other statuses (Approved, Paid, Rejected) will strictly follow selected Month.
//   const filteredBills = useMemo(() => {
//     const result = bills.filter((b) => {
//       const matchesSearch =
//         !search ||
//         (b.ticket_id || '').toLowerCase().includes(search.toLowerCase()) ||
//         (b.user_id || '').toLowerCase().includes(search.toLowerCase()) ||
//         (b.description || '').toLowerCase().includes(search.toLowerCase()) ||
//         (b.created_by || '').toLowerCase().includes(search.toLowerCase());

//       const matchesStatus =
//         statusFilter === 'ALL' ||
//         (b.status || '').toUpperCase() === statusFilter.toUpperCase();

//       // Category Filter Matching
//       let matchesCategory = categoryFilter === 'ALL';
//       if (!matchesCategory) {
//         const billCatId = getBillCategoryId(b);
//         const categoryName = getCategoryName(b).toLowerCase();
//         const selectedCategoryObj = categories.find(
//           (c) => String(c.id) === String(categoryFilter)
//         );

//         matchesCategory =
//           billCatId === String(categoryFilter).trim() ||
//           Boolean(
//             selectedCategoryObj &&
//             categoryName === selectedCategoryObj.name.toLowerCase()
//           );
//       }

//       // Pending Bypass Logic:
//       const isPending = (b.status || '').toLowerCase() === 'pending';
//       const billYM = getBillYearMonth(b.date);

//       // Pending hole shob month ashbe, baki sob status-e month match thakte hobe
//       const matchesMonthFilter = isPending || billYM === selectedMonth;

//       return matchesSearch && matchesStatus && matchesCategory && matchesMonthFilter;
//     });

//     if (sortField) {
//       result.sort((a, b) => {
//         let valA: any;
//         let valB: any;

//         if (sortField === 'support_agent') {
//           valA = String(a.created_by || '').toLowerCase();
//           valB = String(b.created_by || '').toLowerCase();
//         } else if (sortField === 'category') {
//           valA = String(getCategoryName(a) || '').toLowerCase();
//           valB = String(getCategoryName(b) || '').toLowerCase();
//         } else {
//           valA = a[sortField as keyof Bill];
//           valB = b[sortField as keyof Bill];
//         }

//         if (sortField === 'amount') {
//           valA = Number(valA) || 0;
//           valB = Number(valB) || 0;
//         } else if (sortField === 'ticket_id' || sortField === 'user_id' || sortField === 'status') {
//           valA = String(valA || '').toLowerCase();
//           valB = String(b.status || '').toLowerCase();
//         } else if (sortField === 'date') {
//           valA = new Date(valA || '').getTime();
//           valB = new Date(valB || '').getTime();
//         } else {
//           valA = String(valA || '').toLowerCase();
//           valB = String(valB || '').toLowerCase();
//         }

//         if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
//         if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
//         return 0;
//       });
//     }

//     return result;
//   }, [bills, search, statusFilter, categoryFilter, categories, selectedMonth, sortField, sortOrder]);

//   const totalPages = Math.max(1, Math.ceil(filteredBills.length / pageSize));
//   const paginatedBills = filteredBills.slice(
//     (currentPage - 1) * pageSize,
//     currentPage * pageSize
//   );

//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case 'Paid':
//         return (
//           <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
//             <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
//             Paid
//           </span>
//         );
//       case 'Pending':
//         return (
//           <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
//             <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
//             Pending
//           </span>
//         );
//       case 'Approved':
//         return (
//           <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
//             <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
//             Approved
//           </span>
//         );
//       case 'Rejected':
//         return (
//           <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
//             <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
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

//   // Render Header Cell with Drag & Drop + Sorting
//   const renderHeaderCell = (colKey: ColumnKey, index: number) => {
//     const innerContent = (() => {
//       switch (colKey) {
//         case 'ticket_id':
//           return <>Ticket ID {renderSortIcon('ticket_id')}</>;
//         case 'user_id':
//           return <>User ID {renderSortIcon('user_id')}</>;
//         case 'category':
//           return <>Category {renderSortIcon('category')}</>;
//         case 'support_agent':
//           return <>Support Staff {renderSortIcon('support_agent')}</>;
//         case 'date':
//           return <>Date {renderSortIcon('date')}</>;
//         case 'description':
//           return <>Description {renderSortIcon('description')}</>;
//         case 'amount':
//           return <>Amount {renderSortIcon('amount')}</>;
//         case 'status':
//           return <>Status {renderSortIcon('status')}</>;
//         default:
//           return null;
//       }
//     })();

//     return (
//       <th
//         key={colKey}
//         draggable
//         onDragStart={(e) => handleDragStart(e, index)}
//         onDragOver={handleDragOver}
//         onDrop={(e) => handleDrop(e, index)}
//         onClick={() => handleSort(colKey as SortField)}
//         className="px-3 font-semibold select-none cursor-grab active:cursor-grabbing hover:bg-surface-container transition-colors cursor-pointer hover:text-on-surface"
//         title="Drag to reorder column"
//       >
//         <div className="flex items-center gap-1">
//           <span className="material-symbols-outlined text-xs text-secondary/50 cursor-grab">drag_indicator</span>
//           <span>{innerContent}</span>
//         </div>
//       </th>
//     );
//   };

//   // Render Cell Content based on Column Key
//   const renderCellContent = (colKey: ColumnKey, bill: Bill) => {
//     switch (colKey) {
//       case 'ticket_id':
//         return (
//           <td key={colKey} className="px-4 font-data-mono font-bold text-teal-700">
//             <a
//               href={`http://139.162.2.178/tms/dotproject/index.php?m=ticketsmith&a=view&ticket=${bill.ticket_id}`}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="cursor-pointer hover:text-teal-900 hover:underline"
//             >
//               #{bill.ticket_id}
//             </a>
//           </td>
//         );
//       case 'user_id':
//         return (
//           <td key={colKey} className="px-3 font-data-mono text-secondary">
//             {bill.user_id}
//           </td>
//         );
//       case 'category':
//         return (
//           <td key={colKey} className="px-3">
//             <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg
//               bg-gradient-to-r from-primary/10 via-primary/5 to-transparent
//               text-primary font-semibold text-[11px]
//               border border-primary/15
//               shadow-sm shadow-primary/5
//               whitespace-nowrap">
//               <span className="w-1.5 h-1.5 rounded-full bg-primary" />
//               {getCategoryName(bill)}
//             </span>
//           </td>
//         );
//       case 'support_agent':
//         return (
//           <td key={colKey} className="px-3">
//             <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 font-medium text-[11px] border border-teal-200">
//               <span className="material-symbols-outlined text-xs">
//                 person
//               </span>
//               <span className="truncate max-w-[120px]">
//                 {bill.created_by || 'Support Staff'}
//               </span>
//             </span>
//           </td>
//         );
//       case 'date':
//         return (
//           <td key={colKey} className="px-3 text-secondary font-data-mono">
//             {bill.date}
//           </td>
//         );
//       case 'description':
//         return (
//           <td key={colKey} className="px-3 max-w-xs truncate text-on-surface">
//             {bill.description}
//           </td>
//         );
//       case 'amount':
//         return (
//           <td key={colKey} className="px-3 font-data-mono font-bold text-on-surface">
//             ৳{(bill.amount || 0).toLocaleString()}
//           </td>
//         );
//       case 'status':
//         return (
//           <td key={colKey} className="px-3">
//             {getStatusBadge(bill.status)}
//           </td>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="flex flex-col gap-5 w-full">
//       {/* Top Header Banner */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 shadow-xs">
//         <div>
//           <h1 className="text-xl font-bold text-on-surface tracking-tight">
//             Billing Overview
//           </h1>
//           <p className="text-xs text-secondary mt-0.5 flex flex-wrap items-center gap-2">
//             <span>
//               Active operator:{' '}
//               <span className="font-semibold text-teal-700">
//                 {currentUser?.name}
//               </span>{' '}
//               ({currentUser?.role?.toUpperCase()})
//             </span>
//           </p>
//         </div>

//         <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
//           {/* Calendar Month Selector */}
//           <div className="relative flex items-center gap-2 bg-surface border border-outline-variant/40 hover:border-teal-600 rounded-xl px-3 py-1.5 shadow-xs transition-colors group cursor-pointer">
//             <span className="material-symbols-outlined text-teal-600 text-base pointer-events-none">
//               calendar_month
//             </span>
//             <span className="text-xs text-on-surface font-semibold pointer-events-none">
//               {selectedMonth ? new Date(selectedMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' }) : 'Select Month'}
//             </span>
//             <input
//               type="month"
//               value={selectedMonth}
//               onChange={(e) => {
//                 setSelectedMonth(e.target.value);
//                 setCurrentPage(1);
//               }}
//               className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
//               title="Select Month"
//             />
//           </div>

//           {isAdmin && (
//             <button
//               type="button"
//               onClick={() => setIsCategoryModalOpen(true)}
//               className="group inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-teal-50 hover:border-teal-200 transition-all duration-200 cursor-pointer"
//             >
//               <span className="material-symbols-outlined text-[18px] text-teal-600 group-hover:scale-110 transition-transform">
//                 tune
//               </span>

//               <span className="text-xs font-semibold text-slate-600 group-hover:text-teal-700">
//                 Manage Categories
//               </span>

//               <span className="material-symbols-outlined text-[15px] text-slate-400 group-hover:text-teal-500 transition-colors">
//                 chevron_right
//               </span>
//             </button>
//           )}
         
//           <button
//             type="button"
//             onClick={onOpenCreateBill}
//             className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium text-xs transition-colors shadow-xs cursor-pointer"
//           >
//             <span className="material-symbols-outlined text-base">add</span>
//             <span>Create Bill</span>
//           </button>
//         </div>
//       </div>

//       {/* KPI Stats Cards */}
//       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
//         {/* Total Bills Card */}
//         <motion.div
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           onClick={() => {
//             setStatusFilter('ALL');
//             setCurrentPage(1);
//             scrollToTable();
//           }}
//           className={`bg-surface-container-lowest p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${statusFilter === 'ALL'
//             ? 'border-teal-600 ring-1 ring-teal-600/30 bg-teal-50/20'
//             : 'border-outline-variant/30 hover:border-teal-500/60 hover:shadow-sm'
//             } shadow-xs flex flex-col justify-between`}
//         >
//           <div className="flex items-center justify-between">
//             <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
//               {currentUser?.role === 'support' ? 'Your Bills' : 'Total Bills'}
//             </span>
//             <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
//               <span className="material-symbols-outlined text-base">
//                 receipt_long
//               </span>
//             </div>
//           </div>
          
//           <div className="mt-2">
//             <span className="text-xl sm:text-2xl font-bold text-on-surface font-data-mono block">
//               {dynamicStats.totalBills}
//             </span>
//             <span className="text-[11px] sm:text-xs text-secondary flex items-center gap-0.5 mt-0.5 font-data-mono">
//               <span>৳</span>
//               <span>{dynamicStats.totalVolumeTk.toLocaleString()}</span>
//             </span>
//           </div>
//         </motion.div>

//         {/* Pending Card (Displays ALL Pending Bills across all months) */}
//         <motion.div
//           initial={{ opacity: 0, y: 10 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.04 }}
//           onClick={() => {
//             setStatusFilter('Pending');
//             setCurrentPage(1);
//             scrollToTable();
//           }}
//           className={`bg-surface-container-lowest p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${statusFilter === 'Pending'
//             ? 'border-amber-500 ring-1 ring-amber-500/30 bg-amber-50/30'
//             : 'border-outline-variant/30 hover:border-amber-500/60 hover:shadow-sm'
//             } shadow-xs flex flex-col justify-between`}
//         >
//           <div className="flex items-center justify-between">
//             <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
//               {currentUser?.role === 'support' ? 'Your Pending' : 'Pending'}
//             </span>
//             <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
//               <span className="material-symbols-outlined text-base">
//                 pending_actions
//               </span>
//             </div>
//           </div>
        
//           <div className="mt-2">
//             <span className="text-xl sm:text-2xl font-bold text-amber-600 font-data-mono block">
//               {dynamicStats.pendingBills}
//             </span>
//             <span className="text-[11px] sm:text-xs text-secondary block mt-0.5 font-data-mono">
//               ৳{dynamicStats.pendingVolumeTk.toLocaleString()}
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
//             scrollToTable();
//           }}
//           className={`bg-surface-container-lowest p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${statusFilter === 'Approved'
//             ? 'border-teal-500 ring-1 ring-teal-500/30 bg-teal-50/30'
//             : 'border-outline-variant/30 hover:border-teal-500/60 hover:shadow-sm'
//             } shadow-xs flex flex-col justify-between`}
//         >
//           <div className="flex items-center justify-between">
//             <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
//               {currentUser?.role === 'support' ? 'Your Approved' : 'Approved'}
//             </span>
//             <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
//               <span className="material-symbols-outlined text-base">
//                 verified
//               </span>
//             </div>
//           </div>
          
//           <div className="mt-2">
//             <span className="text-xl sm:text-2xl font-bold text-teal-600 font-data-mono block">
//               {dynamicStats.approvedBills}
//             </span>
//             <span className="text-[11px] sm:text-xs text-secondary block mt-0.5 font-data-mono">
//               ৳{dynamicStats.approvedVolumeTk.toLocaleString()}
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
//             scrollToTable();
//           }}
//           className={`bg-surface-container-lowest p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${statusFilter === 'Paid'
//             ? 'border-emerald-500 ring-1 ring-emerald-500/30 bg-emerald-50/30'
//             : 'border-outline-variant/30 hover:border-emerald-500/60 hover:shadow-sm'
//             } shadow-xs flex flex-col justify-between`}
//         >
//           <div className="flex items-center justify-between">
//             <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
//               {currentUser?.role === 'support' ? 'Your Paid' : 'Paid & Cleared'}
//             </span>
//             <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
//               <span className="material-symbols-outlined text-base">
//                 payments
//               </span>
//             </div>
//           </div>
          
//           <div className="mt-2">
//             <span className="text-xl sm:text-2xl font-bold text-emerald-600 font-data-mono block">
//               {dynamicStats.paidBills}
//             </span>
//             <span className="text-[11px] sm:text-xs text-secondary block mt-0.5 font-data-mono">
//               ৳{dynamicStats.paidVolumeTk.toLocaleString()}
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
//             scrollToTable();
//           }}
//           className={`bg-surface-container-lowest p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer ${statusFilter === 'Rejected'
//             ? 'border-rose-500 ring-1 ring-rose-500/30 bg-rose-50/30'
//             : 'border-outline-variant/30 hover:border-rose-500/60 hover:shadow-sm'
//             } shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1`}
//         >
//           <div className="flex items-center justify-between">
//             <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
//               {currentUser?.role === 'support' ? 'Your Rejected' : 'Rejected'}
//             </span>
//             <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
//               <span className="material-symbols-outlined text-base">
//                 cancel
//               </span>
//             </div>
//           </div>
         
//           <div className="mt-2">
//             <span className="text-xl sm:text-2xl font-bold text-rose-600 font-data-mono block">
//               {dynamicStats.rejectedBills}
//             </span>
//             <span className="text-[11px] sm:text-xs text-secondary block mt-0.5 font-data-mono">
//               ৳{dynamicStats.rejectedVolumeTk.toLocaleString()}
//             </span>
//           </div>
//         </motion.div>
//       </div>

//       {/* Graphs / Charts */}
//       {stats && <AmountCharts stats={stats} />}

//       {/* Bills Table Container */}
//       <div ref={tableSectionRef} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-xs flex flex-col scroll-mt-6">
//         {/* Toolbar */}
//         <div className="p-3.5 bg-surface-bright flex flex-col sm:flex-row items-center justify-between gap-2.5 border-b border-outline-variant/20">
//           <div className="relative w-full sm:w-80">
//             <span className="material-symbols-outlined absolute left-2.5 top-2 text-secondary text-base">
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
//               className="w-full pl-8 pr-3 py-1.5 bg-surface text-on-surface text-xs rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600"
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
//                 className="bg-surface text-on-surface text-xs rounded-lg border border-outline-variant/40 px-2.5 py-1.5 focus:outline-none cursor-pointer"
//               >
//                 <option value="ALL">All Categories</option>
//                 {categories.map((cat) => (
//                   <option key={cat.id} value={String(cat.id)}>
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
//               className="bg-surface text-on-surface text-xs rounded-lg border border-outline-variant/40 px-2.5 py-1.5 focus:outline-none cursor-pointer"
//             >
//               <option value="ALL">All Statuses</option>
//               <option value="Pending">Pending</option>
//               <option value="Approved">Approved</option>
//               <option value="Paid">Paid (Cleared)</option>
//               <option value="Rejected">Rejected</option>
//             </select>

//             {/* Column Visibility Toggle Button */}
//             <div className="relative">
//               <button
//                 type="button"
//                 onClick={() => setIsColumnCustomizerOpen(!isColumnCustomizerOpen)}
//                 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer shadow-xs ${
//                   isColumnCustomizerOpen
//                     ? 'bg-teal-50 text-teal-700 border-teal-500'
//                     : 'bg-surface text-on-surface border-outline-variant/40 hover:border-teal-600'
//                 }`}
//                 title="Toggle columns visibility & reorder"
//               >
//                 <span className="material-symbols-outlined text-[12px] text-teal-600">view_column</span>
//                 <span>Columns</span>
//               </button>

//               {/* Column Customizer Dropdown Popover */}
//               <AnimatePresence>
//                 {isColumnCustomizerOpen && (
//                   <motion.div
//                     initial={{ opacity: 0, y: 8, scale: 0.96 }}
//                     animate={{ opacity: 1, y: 0, scale: 1 }}
//                     exit={{ opacity: 0, y: 8, scale: 0.96 }}
//                     transition={{ duration: 0.15 }}
//                     className="absolute right-0 mt-2 w-64 bg-surface-container-lowest p-3.5 rounded-xl border border-outline-variant/30 shadow-xl z-30 flex flex-col gap-2.5 text-xs"
//                   >
//                     <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
//                       <div className="flex items-center gap-1.5">
//                         <span className="material-symbols-outlined text-teal-600 text-base">tune</span>
//                         <h3 className="font-bold text-on-surface uppercase tracking-wider text-[11px]">
//                           Show / Hide Columns
//                         </h3>
//                       </div>
//                       <button
//                         type="button"
//                         onClick={() => setIsColumnCustomizerOpen(false)}
//                         className="text-secondary hover:text-on-surface cursor-pointer p-0.5"
//                       >
//                         <span className="material-symbols-outlined text-base">close</span>
//                       </button>
//                     </div>

//                     <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1">
//                       {columns.map((col) => (
//                         <label 
//                           key={col.key} 
//                           className="flex items-center justify-between p-1.5 rounded-lg hover:bg-surface border border-transparent hover:border-outline-variant/30 cursor-pointer select-none"
//                         >
//                           <span className="font-medium text-on-surface text-xs" title={col.label}>
//                             {col.label}
//                           </span>
//                           <input
//                             type="checkbox"
//                             checked={hiddenColumns[col.key]}
//                             onChange={() => handleToggleColumnVisibility(col.key)}
//                             className="accent-teal-600 rounded cursor-pointer w-4 h-4"
//                           />
//                         </label>
//                       ))}
//                     </div>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>
//           </div>
//         </div>

//         {/* Table */}
//         <div className="overflow-x-auto">
//           <table className="w-full text-left text-xs min-w-[750px]">
//             <thead>
//               <tr className="bg-surface-container-low text-secondary uppercase tracking-wider h-10">
//                 {columns.map((col, index) => 
//                   hiddenColumns[col.key] ? renderHeaderCell(col.key, index) : null
//                 )}
//                 <th className="px-4 font-semibold text-right">Action</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-outline-variant/20">
//               {paginatedBills.length === 0 ? (
//                 <tr>
//                   <td colSpan={columns.filter(c => hiddenColumns[c.key]).length + 1} className="py-10 text-center text-secondary">
//                     <div className="flex flex-col items-center justify-center gap-2">
//                       <span className="material-symbols-outlined text-4xl text-secondary">
//                         search_off
//                       </span>
//                       <span className="text-sm font-medium">
//                         No bills found for the selected month/filters.
//                       </span>
//                     </div>
//                   </td>
//                 </tr>
//               ) : (
//                 paginatedBills.map((bill) => (
//                   <tr
//                     key={bill.id}
//                     className="hover:bg-surface-container-low/60 transition-colors h-12"
//                   >
//                     {columns.map((col) => 
//                       hiddenColumns[col.key] ? renderCellContent(col.key, bill) : null
//                     )}
//                     <td className="px-4 text-right">
//                       <button
//                         type="button"
//                         onClick={() => onViewDetails(bill)}
//                         className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-medium transition-colors cursor-pointer"
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
//           <div className="flex items-center justify-between p-3 bg-surface-bright border-t border-outline-variant/20 text-xs">
//             <span className="text-secondary">
//               Page <span className="font-semibold text-foreground">{currentPage}</span> of {totalPages}
//             </span>
//             <div className="flex items-center gap-1.5">
//               <button
//                 type="button"
//                 disabled={currentPage === 1}
//                 onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//                 className="px-3 py-1 rounded-full bg-outline-variant/10 text-secondary hover:bg-outline-variant/20 disabled:opacity-30 transition-all cursor-pointer font-medium"
//               >
//                 ← Prev
//               </button>
//               <button
//                 type="button"
//                 disabled={currentPage === totalPages}
//                 onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
//                 className="px-3 py-1 rounded-full bg-outline-variant/10 text-secondary hover:bg-outline-variant/20 disabled:opacity-30 transition-all cursor-pointer font-medium"
//               >
//                 Next →
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Admin Category Management Modal */}
//       <AnimatePresence>
//         {isCategoryModalOpen && isAdmin && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               exit={{ opacity: 0, scale: 0.95 }}
//               className="bg-surface-container-lowest w-full max-w-md rounded-xl border border-outline-variant/30 shadow-lg p-5 flex flex-col gap-4"
//             >
//               <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
//                 <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
//                   <span className="material-symbols-outlined text-[18px] text-teal-600 group-hover:scale-110 transition-transform">
//                     tune
//                   </span>
//                   Manage Categories
//                 </h3>
//                 <button
//                   type="button"
//                   onClick={() => setIsCategoryModalOpen(false)}
//                   className="text-secondary hover:text-on-surface cursor-pointer"
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
//                   className="flex-1 px-3 py-1.5 text-xs bg-surface border border-outline-variant/40 rounded-lg focus:outline-none focus:border-teal-600"
//                 />
//                 <button
//                   type="submit"
//                   disabled={isSubmitting || !newCatName.trim()}
//                   className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium cursor-pointer"
//                 >
//                   Add
//                 </button>
//               </form>

//               {/* Category List */}
//               <div className="max-h-60 overflow-y-auto divide-y divide-outline-variant/20 border border-outline-variant/30 rounded-lg">
//                 {categories.length === 0 ? (
//                   <div className="p-4 text-center text-xs text-secondary">
//                     No categories created yet.
//                   </div>
//                 ) : (
//                   categories.map((cat) => (
//                     <div
//                       key={cat.id}
//                       className="p-2.5 flex items-center justify-between gap-2 hover:bg-surface-container-low"
//                     >
//                       {editingCatId === cat.id ? (
//                         <div className="flex items-center gap-1.5 flex-1">
//                           <input
//                             type="text"
//                             value={editingCatName}
//                             onChange={(e) => setEditingCatName(e.target.value)}
//                             className="flex-1 px-2 py-1 text-xs bg-surface border border-outline-variant/40 rounded focus:outline-none"
//                           />
//                           <button
//                             type="button"
//                             onClick={() => handleUpdateCategory(cat.id)}
//                             disabled={isSubmitting}
//                             className="text-teal-600 hover:text-teal-700 text-xs font-bold px-1.5"
//                           >
//                             Save
//                           </button>
//                           <button
//                             type="button"
//                             onClick={() => setEditingCatId(null)}
//                             className="text-secondary hover:text-on-surface text-xs px-1.5"
//                           >
//                             Cancel
//                           </button>
//                         </div>
//                       ) : (
//                         <>
//                           <span className="text-xs font-medium text-on-surface">
//                             {cat.name}
//                           </span>
//                           <div className="flex items-center gap-1">
//                             <button
//                               type="button"
//                               onClick={() => {
//                                 setEditingCatId(cat.id);
//                                 setEditingCatName(cat.name);
//                               }}
//                               className="text-secondary hover:text-teal-600 p-1 cursor-pointer"
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
//                               className="text-secondary hover:text-rose-600 p-1 cursor-pointer"
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
//                   className="px-4 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-medium rounded-lg cursor-pointer"
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