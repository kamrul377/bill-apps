
// 'use client';
// import React, { useState, useMemo } from 'react';
// import { motion } from 'motion/react';
// import { Bill, User } from '@/lib/types';
// import ConfirmModal from './ConfirmModal';

// // Category Interface Definition
// export interface Category {
//   id: number;
//   name: string;
// }

// interface PendingApprovalViewProps {
//   bills: Bill[];
//   currentUser: User;
//   categories?: Category[];

//   onUpdateStatus: (
//     billId: number,
//     status: 'Approved' | 'Rejected',
//     reason?: string,
//     approvedAmount?: number // partial / full approved amount (only for 'Approved')
//   ) => Promise<void>;

//   onBatchApprove: (billIds: number[]) => Promise<void>;

//   onShowToast?: (
//     msg: string,
//     type?: 'success' | 'error' | 'info'
//   ) => void;
// }

// type SortField = 'ticket_id' | 'user_id' | 'created_by' | 'date' | 'amount' | null;
// type SortOrder = 'asc' | 'desc';

// // Column Management Types
// type ColumnKey = 
//   | 'ticket_id' 
//   | 'user_id' 
//   | 'category' 
//   | 'support_agent' 
//   | 'date' 
//   | 'description' 
//   | 'amount';

// interface ColumnConfig {
//   key: ColumnKey;
//   label: string;
// }

// const DEFAULT_COLUMNS: ColumnConfig[] = [
//   { key: 'ticket_id', label: 'Ticket ID' },
//   { key: 'user_id', label: 'User ID' },
//   { key: 'category', label: 'Category' },
//   { key: 'support_agent', label: 'Support Agent' },
//   { key: 'date', label: 'Date' },
//   { key: 'description', label: 'Description' },
//   { key: 'amount', label: 'Amount' },
// ];

// export default function PendingApprovalView({
//   bills,
//   currentUser,
//   categories = [],
//   onUpdateStatus,
//   onBatchApprove,
//   onShowToast,
// }: PendingApprovalViewProps) {
//   const [selectedBillIds, setSelectedBillIds] = useState<number[]>([]);
//   const [activeBillForAction, setActiveBillForAction] =
//     useState<Bill | null>(null);

//   const [actionType, setActionType] = useState<
//     'Approved' | 'Rejected' | null
//   >(null);

//   const [rejectReason, setRejectReason] = useState('');

//   // Approved amount (manager/admin can approve full or partial amount)
//   const [approvedAmount, setApprovedAmount] = useState('');
//   const [amountError, setAmountError] = useState('');
//   const [isBatchConfirmOpen, setIsBatchConfirmOpen] =
//     useState(false);

//   const [isProcessing, setIsProcessing] = useState(false);

//   // Description preview modal state
//   const [selectedDescriptionBill, setSelectedDescriptionBill] = useState<Bill | null>(null);

//   // Search & Filter States
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedSupportAgent, setSelectedSupportAgent] =
//     useState('ALL');
//   const [selectedCategory, setSelectedCategory] = useState('ALL');

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

//   // Helper function to extract Category ID safely
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

//   // Helper to get Category Name
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

//   // Filter only Pending bills
//   const pendingBills = useMemo(
//     () => bills.filter((b) => b.status === 'Pending'),
//     [bills]
//   );

//   const pendingTotalTk = useMemo(
//     () =>
//       pendingBills.reduce(
//         (acc, b) => acc + (Number(b.amount) || 0),
//         0
//       ),
//     [pendingBills]
//   );

//   // Extract unique support agents
//   const supportAgentsList = useMemo(() => {
//     const map = new Map<
//       string,
//       {
//         name: string;
//         count: number;
//         totalTk: number;
//       }
//     >();

//     for (const b of pendingBills) {
//       const name =
//         b.created_by?.trim() || 'Unknown Support';

//       const existing =
//         map.get(name) || {
//           name,
//           count: 0,
//           totalTk: 0,
//         };

//       existing.count += 1;
//       existing.totalTk += Number(b.amount) || 0;

//       map.set(name, existing);
//     }

//     return Array.from(map.values()).sort(
//       (a, b) => b.count - a.count
//     );
//   }, [pendingBills]);

//   // Filter & Sort bills logic
//   const filteredPendingBills = useMemo(() => {
//     const filtered = pendingBills.filter((b) => {
//       // 1. Support agent filter
//       if (selectedSupportAgent !== 'ALL') {
//         const creator = (
//           b.created_by || ''
//         ).toLowerCase();

//         if (
//           !creator.includes(
//             selectedSupportAgent.toLowerCase()
//           )
//         ) {
//           return false;
//         }
//       }

//       // 2. Category Filter Matching
//       if (selectedCategory !== 'ALL') {
//         const billCatId = getBillCategoryId(b);
//         const categoryName = getCategoryName(b).toLowerCase();
//         const selectedCatObj = categories.find(
//           (c) => String(c.id) === String(selectedCategory)
//         );

//         const isMatch =
//           billCatId === String(selectedCategory).trim() ||
//           Boolean(
//             selectedCatObj &&
//             categoryName === selectedCatObj.name.toLowerCase()
//           ) ||
//           categoryName === selectedCategory.toLowerCase();

//         if (!isMatch) return false;
//       }

//       // 3. Search query (Ticket, User, Description, Support Agent & Category Name)
//       if (searchQuery.trim()) {
//         const q = searchQuery.toLowerCase().trim();

//         const ticketMatch = b.ticket_id.toLowerCase().includes(q);
//         const userMatch = b.user_id.toLowerCase().includes(q);
//         const descMatch = b.description.toLowerCase().includes(q);
//         const supportMatch = (b.created_by || '').toLowerCase().includes(q);
//         const categoryMatch = getCategoryName(b).toLowerCase().includes(q);

//         return (
//           ticketMatch ||
//           userMatch ||
//           descMatch ||
//           supportMatch ||
//           categoryMatch
//         );
//       }

//       return true;
//     });

//     // Apply Sorting
//     if (sortField) {
//       filtered.sort((a, b) => {
//         let valA: any = a[sortField as keyof Bill];
//         let valB: any = b[sortField as keyof Bill];

//         if (sortField === 'amount') {
//           valA = Number(valA) || 0;
//           valB = Number(valB) || 0;
//         } else if (sortField === 'ticket_id' || sortField === 'user_id') {
//           valA = String(valA || '').toLowerCase();
//           valB = String(valB || '').toLowerCase();
//         } else {
//           valA = String(valA || '').toLowerCase();
//           valB = String(valB || '').toLowerCase();
//         }

//         if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
//         if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
//         return 0;
//       });
//     }

//     return filtered;
//   }, [
//     pendingBills,
//     selectedSupportAgent,
//     selectedCategory,
//     searchQuery,
//     categories,
//     sortField,
//     sortOrder,
//   ]);

//   const filteredTotalTk = useMemo(
//     () =>
//       filteredPendingBills.reduce(
//         (acc, b) => acc + (Number(b.amount) || 0),
//         0
//       ),
//     [filteredPendingBills]
//   );

//   // Select / unselect all using UNIQUE BILL ID
//   const handleSelectAll = (
//     e: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     if (e.target.checked) {
//       setSelectedBillIds(
//         filteredPendingBills.map((b) => Number(b.id))
//       );
//     } else {
//       setSelectedBillIds([]);
//     }
//   };

//   // Toggle select using UNIQUE BILL ID
//   const handleToggleSelect = (billId: number) => {
//     setSelectedBillIds((prev) =>
//       prev.includes(billId)
//         ? prev.filter((id) => id !== billId)
//         : [...prev, billId]
//     );
//   };

//   const handleConfirmSingleAction = async () => {
//     if (!activeBillForAction || !actionType) {
//       return;
//     }

//     let finalApprovedAmount: number | undefined;

//     if (actionType === 'Approved') {
//       const billAmount = Number(activeBillForAction.amount) || 0;
//       const parsed = Number(approvedAmount);

//       if (approvedAmount.trim() === '' || Number.isNaN(parsed)) {
//         setAmountError('Please enter a valid amount.');
//         return;
//       }
//       if (parsed <= 0) {
//         setAmountError(
//           'Amount must be greater than 0. To approve nothing, use Reject.'
//         );
//         return;
//       }
//       if (parsed > billAmount) {
//         setAmountError(
//           `Approved amount cannot exceed the billed amount (৳${billAmount.toLocaleString()}).`
//         );
//         return;
//       }
//       finalApprovedAmount = parsed;
//     }

//     setIsProcessing(true);

//     try {
//       await onUpdateStatus(
//         Number(activeBillForAction.id),
//         actionType,
//         actionType === 'Rejected'
//           ? rejectReason
//           : undefined,
//         finalApprovedAmount
//       );

//       setSelectedBillIds((prev) =>
//         prev.filter(
//           (id) =>
//             id !== Number(activeBillForAction.id)
//         )
//       );

//       setActiveBillForAction(null);
//       setActionType(null);
//       setRejectReason('');
//       setApprovedAmount('');
//       setAmountError('');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   // Batch Approve
//   const handleConfirmBatchApprove = async () => {
//     if (selectedBillIds.length === 0) {
//       return;
//     }

//     setIsProcessing(true);

//     try {
//       await onBatchApprove(selectedBillIds);

//       setSelectedBillIds([]);
//       setIsBatchConfirmOpen(false);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   // Helper render for sorting icons
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

//   // Render Table Header Cell
//   const renderHeaderCell = (colKey: ColumnKey, index: number) => {
//     switch (colKey) {
//       case 'ticket_id':
//         return (
//           <th
//             key={colKey}
//             draggable
//             onDragStart={(e) => handleDragStart(e, index)}
//             onDragOver={handleDragOver}
//             onDrop={(e) => handleDrop(e, index)}
//             onClick={() => handleSort('ticket_id')}
//             className="px-3 font-semibold select-none cursor-grab active:cursor-grabbing hover:bg-surface-container transition-colors cursor-pointer hover:text-on-surface"
//             title="Drag to reorder column"
//           >
//             <div className="flex items-center gap-1">
//               <span className="material-symbols-outlined text-xs text-secondary/50 cursor-grab">drag_indicator</span>
//               <span>Ticket ID {renderSortIcon('ticket_id')}</span>
//             </div>
//           </th>
//         );
//       case 'user_id':
//         return (
//           <th
//             key={colKey}
//             draggable
//             onDragStart={(e) => handleDragStart(e, index)}
//             onDragOver={handleDragOver}
//             onDrop={(e) => handleDrop(e, index)}
//             onClick={() => handleSort('user_id')}
//             className="px-3 font-semibold select-none cursor-grab active:cursor-grabbing hover:bg-surface-container transition-colors cursor-pointer hover:text-on-surface"
//             title="Drag to reorder column"
//           >
//             <div className="flex items-center gap-1">
//               <span className="material-symbols-outlined text-xs text-secondary/50 cursor-grab">drag_indicator</span>
//               <span>User ID {renderSortIcon('user_id')}</span>
//             </div>
//           </th>
//         );
//       case 'category':
//         return (
//           <th
//             key={colKey}
//             draggable
//             onDragStart={(e) => handleDragStart(e, index)}
//             onDragOver={handleDragOver}
//             onDrop={(e) => handleDrop(e, index)}
//             className="px-3 font-semibold select-none cursor-grab active:cursor-grabbing hover:bg-surface-container transition-colors"
//             title="Drag to reorder column"
//           >
//             <div className="flex items-center gap-1">
//               <span className="material-symbols-outlined text-xs text-secondary/50 cursor-grab">drag_indicator</span>
//               <span>Category</span>
//             </div>
//           </th>
//         );
//       case 'support_agent':
//         return (
//           <th
//             key={colKey}
//             draggable
//             onDragStart={(e) => handleDragStart(e, index)}
//             onDragOver={handleDragOver}
//             onDrop={(e) => handleDrop(e, index)}
//             onClick={() => handleSort('created_by')}
//             className="px-3 font-semibold select-none cursor-grab active:cursor-grabbing hover:bg-surface-container transition-colors cursor-pointer hover:text-on-surface"
//             title="Drag to reorder column"
//           >
//             <div className="flex items-center gap-1">
//               <span className="material-symbols-outlined text-xs text-secondary/50 cursor-grab">drag_indicator</span>
//               <span>Support Agent {renderSortIcon('created_by')}</span>
//             </div>
//           </th>
//         );
//       case 'date':
//         return (
//           <th
//             key={colKey}
//             draggable
//             onDragStart={(e) => handleDragStart(e, index)}
//             onDragOver={handleDragOver}
//             onDrop={(e) => handleDrop(e, index)}
//             onClick={() => handleSort('date')}
//             className="px-3 font-semibold select-none cursor-grab active:cursor-grabbing hover:bg-surface-container transition-colors cursor-pointer hover:text-on-surface"
//             title="Drag to reorder column"
//           >
//             <div className="flex items-center gap-1">
//               <span className="material-symbols-outlined text-xs text-secondary/50 cursor-grab">drag_indicator</span>
//               <span>Date {renderSortIcon('date')}</span>
//             </div>
//           </th>
//         );
//       case 'description':
//         return (
//           <th
//             key={colKey}
//             draggable
//             onDragStart={(e) => handleDragStart(e, index)}
//             onDragOver={handleDragOver}
//             onDrop={(e) => handleDrop(e, index)}
//             className="px-3 font-semibold select-none cursor-grab active:cursor-grabbing hover:bg-surface-container transition-colors"
//             title="Drag to reorder column"
//           >
//             <div className="flex items-center gap-1">
//               <span className="material-symbols-outlined text-xs text-secondary/50 cursor-grab">drag_indicator</span>
//               <span>Description</span>
//             </div>
//           </th>
//         );
//       case 'amount':
//         return (
//           <th
//             key={colKey}
//             draggable
//             onDragStart={(e) => handleDragStart(e, index)}
//             onDragOver={handleDragOver}
//             onDrop={(e) => handleDrop(e, index)}
//             onClick={() => handleSort('amount')}
//             className="px-3 font-semibold select-none cursor-grab active:cursor-grabbing hover:bg-surface-container transition-colors cursor-pointer hover:text-on-surface"
//             title="Drag to reorder column"
//           >
//             <div className="flex items-center gap-1">
//               <span className="material-symbols-outlined text-xs text-secondary/50 cursor-grab">drag_indicator</span>
//               <span>Amount {renderSortIcon('amount')}</span>
//             </div>
//           </th>
//         );
//       default:
//         return null;
//     }
//   };

//   // Render Cell Content
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
//               <span className="truncate max-w-[130px]">
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
//           <td key={colKey} className="px-3 max-w-xs">
//             <div
//               onClick={() => setSelectedDescriptionBill(bill)}
//               className="truncate text-on-surface cursor-pointer hover:text-teal-700 hover:underline transition-colors flex items-center gap-1"
//               title="Click to view full description"
//             >
//               <span className="truncate">{bill.description}</span>
//             </div>
//           </td>
//         );
//       case 'amount':
//         return (
//           <td key={colKey} className="px-3 font-data-mono font-bold text-on-surface">
//             ৳{bill.amount.toLocaleString()}
//           </td>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.2 }}
//       className="flex flex-col gap-4 w-full"
//     >
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest p-4 sm:p-5 rounded-xl border border-outline-variant/30 shadow-xs">
//         <div>
//           <h1 className="text-lg sm:text-xl font-bold text-on-surface">
//             Pending Approvals
//           </h1>

//           <p className="text-xs text-secondary mt-0.5">
//             Manager Review: Clear or reject submitted
//             service bills before passing to Accounts.
//           </p>
//         </div>

//         <div className="flex flex-wrap items-center gap-2.5">
//           <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs">
//             <span className="text-secondary mr-1">
//               Pending Queue:
//             </span>

//             <strong className="text-amber-800 font-data-mono font-bold">
//               {pendingBills.length} Bills (৳
//               {pendingTotalTk.toLocaleString()})
//             </strong>
//           </div>

//           {/* Column Visibility Toggle Button */}
          
//           <button
//   type="button"
//   onClick={() => setIsColumnCustomizerOpen(!isColumnCustomizerOpen)}
//   className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/50 dark:hover:bg-teal-900/50 text-teal-700 dark:text-teal-300 text-xs font-semibold border border-teal-200 dark:border-teal-800 transition-all duration-200 active:scale-95 cursor-pointer shadow-xs"
//   title="Toggle columns visibility & reorder"
// >
//   <span className="material-symbols-outlined text-[16px]">view_column</span>
//   <span className="hidden sm:inline">Columns</span>
// </button>


//           {selectedBillIds.length > 0 && (
//             <button
//               type="button"
//               onClick={() =>
//                 setIsBatchConfirmOpen(true)
//               }
//               className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
//             >
//               <span className="material-symbols-outlined text-sm">
//                 done_all
//               </span>

//               <span>
//                 Approve Selected (
//                 {selectedBillIds.length})
//               </span>
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Column Visibility Settings Panel */}
//       {isColumnCustomizerOpen && (
//         <motion.div
//           initial={{ opacity: 0, height: 0 }}
//           animate={{ opacity: 1, height: 'auto' }}
//           exit={{ opacity: 0, height: 0 }}
//           className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col gap-3 text-xs"
//         >
//           <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
//             <div className="flex items-center gap-2">
//               <span className="material-symbols-outlined text-teal-600">tune</span>
//               <h3 className="font-bold text-on-surface uppercase tracking-wider text-xs">
//                 Show / Hide Columns
//               </h3>
//             </div>
//             <button
//               type="button"
//               onClick={() => setIsColumnCustomizerOpen(false)}
//               className="text-secondary hover:text-on-surface cursor-pointer"
//             >
//               <span className="material-symbols-outlined text-base">close</span>
//             </button>
//           </div>

//           <p className="text-secondary text-[11px]">
//             Check or uncheck columns to show or hide them. You can also **drag any table header** directly to reorder columns.
//           </p>

//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
//             {columns.map((col) => (
//               <label 
//                 key={col.key} 
//                 className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-outline-variant/30 cursor-pointer truncate"
//               >
//                 <input
//                   type="checkbox"
//                   checked={hiddenColumns[col.key]}
//                   onChange={() => handleToggleColumnVisibility(col.key)}
//                   className="accent-teal-600 rounded cursor-pointer"
//                 />
//                 <span className="font-medium text-on-surface truncate" title={col.label}>
//                   {col.label}
//                 </span>
//               </label>
//             ))}
//           </div>
//         </motion.div>
//       )}

//       {/* Search & Filter Bar */}
//       <div className="bg-surface-container-lowest p-3.5 sm:p-4 rounded-xl border border-outline-variant/30 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between text-xs">
//         <div className="flex flex-col sm:flex-row gap-2.5 flex-1">
//           {/* Search Input */}
//           <div className="relative flex-1">
//             <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-secondary text-base pointer-events-none">
//               search
//             </span>

//             <input
//               type="text"
//               value={searchQuery}
//               onChange={(e) =>
//                 setSearchQuery(e.target.value)
//               }
//               placeholder="Search Ticket, User, Agent, Category..."
//               className="w-full pl-8 pr-8 py-2 bg-surface text-on-surface rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600 font-medium placeholder:text-secondary/70"
//             />

//             {searchQuery && (
//               <button
//                 type="button"
//                 onClick={() =>
//                   setSearchQuery('')
//                 }
//                 className="absolute right-2.5 top-2 text-secondary hover:text-on-surface p-0.5 rounded cursor-pointer"
//                 title="Clear search"
//               >
//                 <span className="material-symbols-outlined text-sm">
//                   close
//                 </span>
//               </button>
//             )}
//           </div>

//           {/* Category Dropdown Filter */}
//           <div className="flex items-center gap-1.5">
//             <select
//               value={selectedCategory}
//               onChange={(e) => setSelectedCategory(e.target.value)}
//               className="bg-surface px-3 py-2 rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600 font-medium text-xs text-on-surface w-full sm:w-auto cursor-pointer"
//             >
//               <option value="ALL">All Categories</option>
//               {categories.length > 0
//                 ? categories.map((cat) => (
//                   <option key={cat.id} value={String(cat.id)}>
//                     {cat.name}
//                   </option>
//                 ))
//                 : Array.from(
//                   new Set(pendingBills.map((b) => getCategoryName(b)))
//                 ).map((catName) => (
//                   <option key={catName} value={catName}>
//                     {catName}
//                   </option>
//                 ))}
//             </select>
//           </div>

//           {/* Support Staff Filter */}
//           <div className="flex items-center gap-1.5">
//             <select
//               value={selectedSupportAgent}
//               onChange={(e) =>
//                 setSelectedSupportAgent(
//                   e.target.value
//                 )
//               }
//               className="bg-surface px-3 py-2 rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600 font-medium text-xs text-on-surface w-full sm:w-auto cursor-pointer"
//             >
//               <option value="ALL">
//                 All Support Staff ({pendingBills.length})
//               </option>

//               {supportAgentsList.map((agent) => (
//                 <option
//                   key={agent.name}
//                   value={agent.name}
//                 >
//                   {agent.name} ({agent.count} · ৳{agent.totalTk.toLocaleString()})
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* Reset Button & Match Status */}
//         {(selectedSupportAgent !== 'ALL' ||
//           selectedCategory !== 'ALL' ||
//           searchQuery ||
//           sortField !== null) && (
//             <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-outline-variant/20">
//               <span className="text-teal-700 font-semibold bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
//                 Matched: {filteredPendingBills.length}{' '}
//                 bills (৳
//                 {filteredTotalTk.toLocaleString()})
//               </span>

//               <button
//                 type="button"
//                 onClick={() => {
//                   setSelectedSupportAgent('ALL');
//                   setSelectedCategory('ALL');
//                   setSearchQuery('');
//                   setSortField(null);
//                   setSortOrder('asc');
//                 }}
//                 className="text-secondary hover:text-rose-600 hover:bg-rose-50 px-2 py-1 rounded transition-colors cursor-pointer font-medium"
//               >
//                 Reset
//               </button>
//             </div>
//           )}
//       </div>

//       {/* Queue Table */}
//       <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-xs overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full text-left text-xs min-w-[750px]">
//             <thead>
//               <tr className="bg-surface-container-low text-secondary uppercase tracking-wider h-10">
//                 <th className="px-4 w-10">
//                   <input
//                     type="checkbox"
//                     checked={
//                       filteredPendingBills.length > 0 &&
//                       filteredPendingBills.every(
//                         (b) =>
//                           selectedBillIds.includes(
//                             Number(b.id)
//                           )
//                       )
//                     }
//                     onChange={handleSelectAll}
//                     className="accent-teal-600 rounded cursor-pointer"
//                     aria-label="Select all bills"
//                   />
//                 </th>

//                 {/* Render Draggable Columns */}
//                 {columns.map((col, index) => 
//                   hiddenColumns[col.key] ? renderHeaderCell(col.key, index) : null
//                 )}

//                 <th className="px-4 font-semibold text-right">
//                   Actions
//                 </th>
//               </tr>
//             </thead>

//             <tbody className="divide-y divide-outline-variant/20">
//               {filteredPendingBills.length === 0 ? (
//                 <tr>
//                   <td
//                     colSpan={columns.filter(c => hiddenColumns[c.key]).length + 2}
//                     className="py-12 text-center text-secondary"
//                   >
//                     <div className="flex flex-col items-center justify-center">
//                       <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
//                         <span className="material-symbols-outlined text-2xl text-slate-400">
//                           search_off
//                         </span>
//                       </div>

//                       <p className="text-sm font-semibold text-on-surface">
//                         No pending bills found
//                       </p>

//                       <p className="mt-1 max-w-md text-xs text-secondary">
//                         {pendingBills.length === 0
//                           ? 'There are currently no pending bills awaiting approval.'
//                           : 'No pending bills match the selected category, support agent or search query.'}
//                       </p>
//                     </div>
//                   </td>
//                 </tr>
//               ) : (
//                 filteredPendingBills.map((bill) => (
//                   <tr
//                     key={bill.id}
//                     className={`hover:bg-surface-container-low/60 transition-colors h-14 ${selectedBillIds.includes(
//                       Number(bill.id)
//                     )
//                       ? 'bg-teal-50/50'
//                       : ''
//                       }`}
//                   >
//                     <td className="px-4">
//                       <input
//                         type="checkbox"
//                         checked={selectedBillIds.includes(
//                           Number(bill.id)
//                         )}
//                         onChange={() =>
//                           handleToggleSelect(
//                             Number(bill.id)
//                           )
//                         }
//                         className="accent-teal-600 rounded cursor-pointer"
//                         aria-label={`Select bill ${bill.id}`}
//                       />
//                     </td>

//                     {/* Render columns content corresponding to header order */}
//                     {columns.map((col) => 
//                       hiddenColumns[col.key] ? renderCellContent(col.key, bill) : null
//                     )}

//                     <td className="px-4 text-right whitespace-nowrap">
//                       <div className="flex items-center justify-end gap-1.5">
//                         <button
//                           type="button"
//                           onClick={() => {
//                             setActiveBillForAction(
//                               bill
//                             );
//                             setActionType(
//                               'Approved'
//                             );
//                             setApprovedAmount(
//                               String(Number(bill.amount) || 0)
//                             );
//                             setAmountError('');
//                           }}
//                           className="px-2.5 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
//                         >
//                           <span className="material-symbols-outlined text-sm">
//                             check
//                           </span>

//                           <span>Approve</span>
//                         </button>

//                         <button
//                           type="button"
//                           onClick={() => {
//                             setActiveBillForAction(
//                               bill
//                             );
//                             setActionType(
//                               'Rejected'
//                             );
//                             setRejectReason('');
//                           }}
//                           className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
//                         >
//                           <span className="material-symbols-outlined text-sm">
//                             close
//                           </span>

//                           <span>Reject</span>
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Full Description Modal */}
//       <ConfirmModal
//         isOpen={!!selectedDescriptionBill}
//         title="Bill Description Details"
//         confirmText="Close"
//         confirmVariant="primary"
//         isLoading={false}
//         onClose={() => setSelectedDescriptionBill(null)}
//         onConfirm={() => setSelectedDescriptionBill(null)}
//       >
//         {selectedDescriptionBill && (
//           <div className="flex flex-col gap-3 text-xs">
//             <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/30 flex flex-col gap-1.5">
//               <div className="flex justify-between">
//                 <span className="text-secondary font-medium">Ticket ID:</span>
//                 <span className="font-mono font-bold text-teal-700">#{selectedDescriptionBill.ticket_id}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-secondary font-medium">Support Staff:</span>
//                 <span className="font-semibold text-on-surface">{selectedDescriptionBill.created_by || 'Support Staff'}</span>
//               </div>
//             </div>

//             <div className="flex flex-col gap-1.5">
//               <label className="font-semibold text-secondary uppercase tracking-wider text-[11px]">
//                 Full Description / Remarks:
//               </label>
//               <div className="p-3 bg-surface rounded-lg border border-outline-variant/40 text-on-surface font-medium whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
//                 {selectedDescriptionBill.description}
//               </div>
//             </div>
//           </div>
//         )}
//       </ConfirmModal>

//       {/* Single Action Modal */}
//       <ConfirmModal
//         isOpen={!!activeBillForAction}
//         title={
//           actionType === 'Approved'
//             ? 'Approve Service Bill'
//             : 'Reject Service Bill'
//         }
//         confirmText={
//           actionType === 'Approved'
//             ? Number(approvedAmount) > 0 &&
//               Number(approvedAmount) <
//               Number(activeBillForAction?.amount || 0)
//               ? 'Confirm Partial Approval'
//               : 'Confirm Approval'
//             : 'Confirm Rejection'
//         }
//         confirmVariant={
//           actionType === 'Approved'
//             ? 'primary'
//             : 'danger'
//         }
//         isLoading={isProcessing}
//         onClose={() => {
//           setActiveBillForAction(null);
//           setActionType(null);
//           setApprovedAmount('');
//           setAmountError('');
//         }}
//         onConfirm={handleConfirmSingleAction}
//       >
//         {activeBillForAction && (
//           <div className="flex flex-col gap-3 text-xs">
//             <p className="text-secondary">
//               Are you sure you want to{' '}
//               <strong>
//                 {actionType?.toLowerCase()}
//               </strong>{' '}
//               ticket{' '}
//               <strong className="text-on-surface font-mono">
//                 {activeBillForAction.ticket_id}
//               </strong>{' '}
//               submitted by{' '}
//               <strong className="text-teal-700">
//                 {activeBillForAction.created_by ||
//                   'Support'}
//               </strong>{' '}
//               for{' '}
//               <strong className="text-teal-700 font-mono">
//                 ৳
//                 {activeBillForAction.amount.toLocaleString()}
//               </strong>
//               ?
//             </p>

//             {actionType === 'Approved' && (
//               <div className="flex flex-col gap-1.5 mt-1">
//                 <label className="font-semibold text-secondary uppercase">
//                   Approved Amount (৳)
//                 </label>

//                 <div className="flex items-center gap-2">
//                   <input
//                     type="number"
//                     min={0}
//                     max={Number(activeBillForAction.amount) || 0}
//                     step="any"
//                     value={approvedAmount}
//                     onChange={(e) => {
//                       setApprovedAmount(e.target.value);
//                       setAmountError('');
//                     }}
//                     className="flex-1 p-2 bg-surface rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600 text-xs font-data-mono font-bold"
//                     placeholder="Enter amount to approve"
//                   />

//                   <button
//                     type="button"
//                     onClick={() => {
//                       setApprovedAmount(
//                         String(Number(activeBillForAction.amount) || 0)
//                       );
//                       setAmountError('');
//                     }}
//                     className="px-2.5 py-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold text-xs border border-teal-200 transition-colors cursor-pointer whitespace-nowrap"
//                   >
//                     Full ৳
//                     {Number(activeBillForAction.amount).toLocaleString()}
//                   </button>
//                 </div>

//                 {amountError ? (
//                   <p className="text-rose-600 font-medium">
//                     {amountError}
//                   </p>
//                 ) : Number(approvedAmount) > 0 &&
//                   Number(approvedAmount) <
//                   Number(activeBillForAction.amount) ? (
//                   <p className="text-amber-700 font-medium">
//                     Partial approval: ৳
//                     {Number(approvedAmount).toLocaleString()} of ৳
//                     {Number(activeBillForAction.amount).toLocaleString()}{' '}
//                     (৳
//                     {(
//                       Number(activeBillForAction.amount) -
//                       Number(approvedAmount)
//                     ).toLocaleString()}{' '}
//                     will not be paid)
//                   </p>
//                 ) : null}
//               </div>
//             )}

//             {actionType === 'Rejected' && (
//               <div className="flex flex-col gap-1 mt-1">
//                 <label className="font-semibold text-secondary uppercase">
//                   Rejection Reason (Optional)
//                 </label>

//                 <textarea
//                   rows={2}
//                   value={rejectReason}
//                   onChange={(e) =>
//                     setRejectReason(e.target.value)
//                   }
//                   placeholder="Explain why this charge is rejected..."
//                   className="p-2 bg-surface rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600 text-xs resize-none"
//                 />
//               </div>
//             )}
//           </div>
//         )}
//       </ConfirmModal>

//       {/* Batch Approve Modal */}
//       <ConfirmModal
//         isOpen={isBatchConfirmOpen}
//         title="Batch Approve Bills"
//         confirmText={`Approve All ${selectedBillIds.length} Bills`}
//         confirmVariant="primary"
//         isLoading={isProcessing}
//         onClose={() =>
//           setIsBatchConfirmOpen(false)
//         }
//         onConfirm={handleConfirmBatchApprove}
//       >
//         <p className="text-xs text-secondary">
//           You are about to approve{' '}
//           <strong>{selectedBillIds.length}</strong>{' '}
//           pending bills at once. This will release them
//           directly to Accounts for ledger clearance.
//         </p>
//       </ConfirmModal>
//     </motion.div>
//   );
// }









// =======================2nd with pagination ============================





'use client';
import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Bill, User } from '@/lib/types';
import ConfirmModal from './ConfirmModal';

// Category Interface Definition
export interface Category {
  id: number;
  name: string;
}

interface PendingApprovalViewProps {
  bills: Bill[];
  currentUser: User;
  categories?: Category[];

  onUpdateStatus: (
    billId: number,
    status: 'Approved' | 'Rejected',
    reason?: string,
    approvedAmount?: number // partial / full approved amount (only for 'Approved')
  ) => Promise<void>;

  onBatchApprove: (billIds: number[]) => Promise<void>;

  onShowToast?: (
    msg: string,
    type?: 'success' | 'error' | 'info'
  ) => void;
}

type SortField = 'ticket_id' | 'user_id' | 'created_by' | 'date' | 'amount' | null;
type SortOrder = 'asc' | 'desc';

// Column Management Types
type ColumnKey = 
  | 'ticket_id' 
  | 'user_id' 
  | 'category' 
  | 'support_agent' 
  | 'date' 
  | 'description' 
  | 'amount';

interface ColumnConfig {
  key: ColumnKey;
  label: string;
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { key: 'ticket_id', label: 'Ticket ID' },
  { key: 'user_id', label: 'User ID' },
  { key: 'category', label: 'Category' },
  { key: 'support_agent', label: 'Support Agent' },
  { key: 'date', label: 'Date' },
  { key: 'description', label: 'Description' },
  { key: 'amount', label: 'Amount' },
];

export default function PendingApprovalView({
  bills,
  currentUser,
  categories = [],
  onUpdateStatus,
  onBatchApprove,
  onShowToast,
}: PendingApprovalViewProps) {
  const [selectedBillIds, setSelectedBillIds] = useState<number[]>([]);
  const [activeBillForAction, setActiveBillForAction] =
    useState<Bill | null>(null);

  const [actionType, setActionType] = useState<
    'Approved' | 'Rejected' | null
  >(null);

  const [rejectReason, setRejectReason] = useState('');

  // Approved amount (manager/admin can approve full or partial amount)
  const [approvedAmount, setApprovedAmount] = useState('');
  const [amountError, setAmountError] = useState('');
  const [isBatchConfirmOpen, setIsBatchConfirmOpen] =
    useState(false);

  const [isProcessing, setIsProcessing] = useState(false);

  // Description preview modal state
  const [selectedDescriptionBill, setSelectedDescriptionBill] = useState<Bill | null>(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupportAgent, setSelectedSupportAgent] =
    useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number | 'ALL'>(10);

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

  // Helper function to extract Category ID safely
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

  // Helper to get Category Name
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

  // Filter only Pending bills[cite: 2]
  const pendingBills = useMemo(
    () => bills.filter((b) => b.status === 'Pending'),
    [bills]
  );

  const pendingTotalTk = useMemo(
    () =>
      pendingBills.reduce(
        (acc, b) => acc + (Number(b.amount) || 0),
        0
      ),
    [pendingBills]
  );

  // Extract unique support agents
  const supportAgentsList = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        count: number;
        totalTk: number;
      }
    >();

    for (const b of pendingBills) {
      const name =
        b.created_by?.trim() || 'Unknown Support';

      const existing =
        map.get(name) || {
          name,
          count: 0,
          totalTk: 0,
        };

      existing.count += 1;
      existing.totalTk += Number(b.amount) || 0;

      map.set(name, existing);
    }

    return Array.from(map.values()).sort(
      (a, b) => b.count - a.count
    );
  }, [pendingBills]);

  // Filter & Sort bills logic
  const filteredPendingBills = useMemo(() => {
    const filtered = pendingBills.filter((b) => {
      // 1. Support agent filter
      if (selectedSupportAgent !== 'ALL') {
        const creator = (
          b.created_by || ''
        ).toLowerCase();

        if (
          !creator.includes(
            selectedSupportAgent.toLowerCase()
          )
        ) {
          return false;
        }
      }

      // 2. Category Filter Matching
      if (selectedCategory !== 'ALL') {
        const billCatId = getBillCategoryId(b);
        const categoryName = getCategoryName(b).toLowerCase();
        const selectedCatObj = categories.find(
          (c) => String(c.id) === String(selectedCategory)
        );

        const isMatch =
          billCatId === String(selectedCategory).trim() ||
          Boolean(
            selectedCatObj &&
            categoryName === selectedCatObj.name.toLowerCase()
          ) ||
          categoryName === selectedCategory.toLowerCase();

        if (!isMatch) return false;
      }

      // 3. Search query (Ticket, User, Description, Support Agent & Category Name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();

        const ticketMatch = b.ticket_id.toLowerCase().includes(q);
        const userMatch = b.user_id.toLowerCase().includes(q);
        const descMatch = b.description.toLowerCase().includes(q);
        const supportMatch = (b.created_by || '').toLowerCase().includes(q);
        const categoryMatch = getCategoryName(b).toLowerCase().includes(q);

        return (
          ticketMatch ||
          userMatch ||
          descMatch ||
          supportMatch ||
          categoryMatch
        );
      }

      return true;
    });

    // Apply Sorting
    if (sortField) {
      filtered.sort((a, b) => {
        let valA: any = a[sortField as keyof Bill];
        let valB: any = b[sortField as keyof Bill];

        if (sortField === 'amount') {
          valA = Number(valA) || 0;
          valB = Number(valB) || 0;
        } else if (sortField === 'ticket_id' || sortField === 'user_id') {
          valA = String(valA || '').toLowerCase();
          valB = String(valB || '').toLowerCase();
        } else {
          valA = String(valA || '').toLowerCase();
          valB = String(valB || '').toLowerCase();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [
    pendingBills,
    selectedSupportAgent,
    selectedCategory,
    searchQuery,
    categories,
    sortField,
    sortOrder,
  ]);

  // Pagination Slicing
  const totalPages = pageSize === 'ALL' ? 1 : Math.max(1, Math.ceil(filteredPendingBills.length / Number(pageSize)));
  const paginatedPendingBills = useMemo(() => {
    if (pageSize === 'ALL') return filteredPendingBills;
    const start = (currentPage - 1) * Number(pageSize);
    return filteredPendingBills.slice(start, start + Number(pageSize));
  }, [filteredPendingBills, currentPage, pageSize]);

  const filteredTotalTk = useMemo(
    () =>
      filteredPendingBills.reduce(
        (acc, b) => acc + (Number(b.amount) || 0),
        0
      ),
    [filteredPendingBills]
  );

  // Select / unselect all using CURRENT PAGE'S PAGINATED BILL IDs only
  const handleSelectAll = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const currentPageIds = paginatedPendingBills.map((b) => Number(b.id));
    if (e.target.checked) {
      setSelectedBillIds((prev) => {
        const combined = new Set([...prev, ...currentPageIds]);
        return Array.from(combined);
      });
    } else {
      setSelectedBillIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    }
  };

  // Toggle select using UNIQUE BILL ID
  const handleToggleSelect = (billId: number) => {
    setSelectedBillIds((prev) =>
      prev.includes(billId)
        ? prev.filter((id) => id !== billId)
        : [...prev, billId]
    );
  };

  const handleConfirmSingleAction = async () => {
    if (!activeBillForAction || !actionType) {
      return;
    }

    let finalApprovedAmount: number | undefined;

    if (actionType === 'Approved') {
      const billAmount = Number(activeBillForAction.amount) || 0;
      const parsed = Number(approvedAmount);

      if (approvedAmount.trim() === '' || Number.isNaN(parsed)) {
        setAmountError('Please enter a valid amount.');
        return;
      }
      if (parsed <= 0) {
        setAmountError(
          'Amount must be greater than 0. To approve nothing, use Reject.'
        );
        return;
      }
      if (parsed > billAmount) {
        setAmountError(
          `Approved amount cannot exceed the billed amount (৳${billAmount.toLocaleString()}).`
        );
        return;
      }
      finalApprovedAmount = parsed;
    }

    setIsProcessing(true);

    try {
      await onUpdateStatus(
        Number(activeBillForAction.id),
        actionType,
        actionType === 'Rejected'
          ? rejectReason
          : undefined,
        finalApprovedAmount
      );

      setSelectedBillIds((prev) =>
        prev.filter(
          (id) =>
            id !== Number(activeBillForAction.id)
        )
      );

      setActiveBillForAction(null);
      setActionType(null);
      setRejectReason('');
      setApprovedAmount('');
      setAmountError('');
    } finally {
      setIsProcessing(false);
    }
  };

  // Batch Approve
  const handleConfirmBatchApprove = async () => {
    if (selectedBillIds.length === 0) {
      return;
    }

    setIsProcessing(true);

    try {
      await onBatchApprove(selectedBillIds);

      setSelectedBillIds([]);
      setIsBatchConfirmOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper render for sorting icons
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

  // Render Table Header Cell
  const renderHeaderCell = (colKey: ColumnKey, index: number) => {
    switch (colKey) {
      case 'ticket_id':
        return (
          <th
            key={colKey}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onClick={() => handleSort('ticket_id')}
            className="px-3 font-semibold select-none cursor-grab active:cursor-grabbing hover:bg-surface-container transition-colors cursor-pointer hover:text-on-surface"
            title="Drag to reorder column"
          >
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-secondary/50 cursor-grab">drag_indicator</span>
              <span>Ticket ID {renderSortIcon('ticket_id')}</span>
            </div>
          </th>
        );
      case 'user_id':
        return (
          <th
            key={colKey}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onClick={() => handleSort('user_id')}
            className="px-3 font-semibold select-none cursor-grab active:cursor-grabbing hover:bg-surface-container transition-colors cursor-pointer hover:text-on-surface"
            title="Drag to reorder column"
          >
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-secondary/50 cursor-grab">drag_indicator</span>
              <span>User ID {renderSortIcon('user_id')}</span>
            </div>
          </th>
        );
      case 'category':
        return (
          <th
            key={colKey}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            className="px-3 font-semibold select-none cursor-grab active:cursor-grabbing hover:bg-surface-container transition-colors"
            title="Drag to reorder column"
          >
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-secondary/50 cursor-grab">drag_indicator</span>
              <span>Category</span>
            </div>
          </th>
        );
      case 'support_agent':
        return (
          <th
            key={colKey}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onClick={() => handleSort('created_by')}
            className="px-3 font-semibold select-none cursor-grab active:cursor-grabbing hover:bg-surface-container transition-colors cursor-pointer hover:text-on-surface"
            title="Drag to reorder column"
          >
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-secondary/50 cursor-grab">drag_indicator</span>
              <span>Support Agent {renderSortIcon('created_by')}</span>
            </div>
          </th>
        );
      case 'date':
        return (
          <th
            key={colKey}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onClick={() => handleSort('date')}
            className="px-3 font-semibold select-none cursor-grab active:cursor-grabbing hover:bg-surface-container transition-colors cursor-pointer hover:text-on-surface"
            title="Drag to reorder column"
          >
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-secondary/50 cursor-grab">drag_indicator</span>
              <span>Date {renderSortIcon('date')}</span>
            </div>
          </th>
        );
      case 'description':
        return (
          <th
            key={colKey}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            className="px-3 font-semibold select-none cursor-grab active:cursor-grabbing hover:bg-surface-container transition-colors"
            title="Drag to reorder column"
          >
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-secondary/50 cursor-grab">drag_indicator</span>
              <span>Description</span>
            </div>
          </th>
        );
      case 'amount':
        return (
          <th
            key={colKey}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onClick={() => handleSort('amount')}
            className="px-3 font-semibold select-none cursor-grab active:cursor-grabbing hover:bg-surface-container transition-colors cursor-pointer hover:text-on-surface"
            title="Drag to reorder column"
          >
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-secondary/50 cursor-grab">drag_indicator</span>
              <span>Amount {renderSortIcon('amount')}</span>
            </div>
          </th>
        );
      default:
        return null;
    }
  };

  // Render Cell Content
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
          //     <span className="truncate max-w-[130px]">
          //       {bill.created_by || 'Support Staff'}
          //     </span>
          //   </span>
          // </td>
          <td key={colKey} className="px-3">
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 font-medium text-[11px] border border-teal-200 dark:border-teal-800/60">
    <span className="material-symbols-outlined text-xs text-teal-700 dark:text-teal-400">
      person
    </span>
    <span className="truncate max-w-[130px]" title={bill.created_by || 'Support Staff'}>
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
          <td key={colKey} className="px-3 max-w-xs">
            <div
              onClick={() => setSelectedDescriptionBill(bill)}
              className="truncate text-on-surface cursor-pointer hover:text-teal-700 hover:underline transition-colors flex items-center gap-1"
              title="Click to view full description"
            >
              <span className="truncate">{bill.description}</span>
            </div>
          </td>
        );
      case 'amount':
        return (
          <td key={colKey} className="px-3 font-data-mono font-bold text-on-surface">
            ৳{bill.amount.toLocaleString()}
          </td>
        );
      default:
        return null;
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest p-4 sm:p-5 rounded-xl border border-outline-variant/30 shadow-xs">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-on-surface">
            Pending Approvals
          </h1>

          <p className="text-xs text-secondary mt-0.5">
            Manager Review: Clear or reject submitted
            service bills before passing to Accounts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs">
            <span className="text-secondary mr-1">
              Pending Queue:
            </span>

            <strong className="text-amber-800 font-data-mono font-bold">
              {pendingBills.length} Bills (৳
              {pendingTotalTk.toLocaleString()})
            </strong>
          </div>

          {/* Column Visibility Toggle Button */}
          <button
            type="button"
            onClick={() => setIsColumnCustomizerOpen(!isColumnCustomizerOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/50 dark:hover:bg-teal-900/50 text-teal-700 dark:text-teal-300 text-xs font-semibold border border-teal-200 dark:border-teal-800 transition-all duration-200 active:scale-95 cursor-pointer shadow-xs"
            title="Toggle columns visibility & reorder"
          >
            <span className="material-symbols-outlined text-[16px]">view_column</span>
            <span className="hidden sm:inline">Columns</span>
          </button>

          {selectedBillIds.length > 0 && (
            <button
              type="button"
              onClick={() =>
                setIsBatchConfirmOpen(true)
              }
              className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">
                done_all
              </span>

              <span>
                Approve Selected (
                {selectedBillIds.length})
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Column Visibility Settings Panel */}
      {isColumnCustomizerOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col gap-3 text-xs"
        >
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-teal-600">tune</span>
              <h3 className="font-bold text-on-surface uppercase tracking-wider text-xs">
                Show / Hide Columns
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsColumnCustomizerOpen(false)}
              className="text-secondary hover:text-on-surface cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>

          <p className="text-secondary text-[11px]">
            Check or uncheck columns to show or hide them. You can also **drag any table header** directly to reorder columns.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {columns.map((col) => (
              <label 
                key={col.key} 
                className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-outline-variant/30 cursor-pointer truncate"
              >
                <input
                  type="checkbox"
                  checked={hiddenColumns[col.key]}
                  onChange={() => handleToggleColumnVisibility(col.key)}
                  className="accent-teal-600 rounded cursor-pointer"
                />
                <span className="font-medium text-on-surface truncate" title={col.label}>
                  {col.label}
                </span>
              </label>
            ))}
          </div>
        </motion.div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-surface-container-lowest p-3.5 sm:p-4 rounded-xl border border-outline-variant/30 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between text-xs">
        <div className="flex flex-col sm:flex-row gap-2.5 flex-1">
          {/* Search Input */}
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-secondary text-base pointer-events-none">
              search
            </span>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search Ticket, User, Agent, Category..."
              className="w-full pl-8 pr-8 py-2 bg-surface text-on-surface rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600 font-medium placeholder:text-secondary/70"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="absolute right-2.5 top-2 text-secondary hover:text-on-surface p-0.5 rounded cursor-pointer"
                title="Clear search"
              >
                <span className="material-symbols-outlined text-sm">
                  close
                </span>
              </button>
            )}
          </div>

          {/* Category Dropdown Filter */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-surface px-3 py-2 rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600 font-medium text-xs text-on-surface w-full sm:w-auto cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {categories.length > 0
                ? categories.map((cat) => (
                  <option key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </option>
                ))
                : Array.from(
                  new Set(pendingBills.map((b) => getCategoryName(b)))
                ).map((catName) => (
                  <option key={catName} value={catName}>
                    {catName}
                  </option>
                ))}
            </select>
          </div>

          {/* Support Staff Filter */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedSupportAgent}
              onChange={(e) => {
                setSelectedSupportAgent(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-surface px-3 py-2 rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600 font-medium text-xs text-on-surface w-full sm:w-auto cursor-pointer"
            >
              <option value="ALL">
                All Support Staff ({pendingBills.length})
              </option>

              {supportAgentsList.map((agent) => (
                <option
                  key={agent.name}
                  value={agent.name}
                >
                  {agent.name} ({agent.count} · ৳{agent.totalTk.toLocaleString()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reset Button & Match Status */}
        {(selectedSupportAgent !== 'ALL' ||
          selectedCategory !== 'ALL' ||
          searchQuery ||
          sortField !== null) && (
            <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-outline-variant/20">
              <span className="text-teal-700 font-semibold bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                Matched: {filteredPendingBills.length}{' '}
                bills (৳
                {filteredTotalTk.toLocaleString()})
              </span>

              <button
                type="button"
                onClick={() => {
                  setSelectedSupportAgent('ALL');
                  setSelectedCategory('ALL');
                  setSearchQuery('');
                  setSortField(null);
                  setSortOrder('asc');
                  setCurrentPage(1);
                }}
                className="text-secondary hover:text-rose-600 hover:bg-rose-50 px-2 py-1 rounded transition-colors cursor-pointer font-medium"
              >
                Reset
              </button>
            </div>
          )}
      </div>

      {/* Queue Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-xs overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead>
              <tr className="bg-surface-container-low text-secondary uppercase tracking-wider h-10">
                <th className="px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      paginatedPendingBills.length > 0 &&
                      paginatedPendingBills.every(
                        (b) =>
                          selectedBillIds.includes(
                            Number(b.id)
                          )
                      )
                    }
                    onChange={handleSelectAll}
                    className="accent-teal-600 rounded cursor-pointer"
                    aria-label="Select all bills"
                  />
                </th>

                {/* Render Draggable Columns */}
                {columns.map((col, index) => 
                  hiddenColumns[col.key] ? renderHeaderCell(col.key, index) : null
                )}

                <th className="px-4 font-semibold text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-outline-variant/20">
              {paginatedPendingBills.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.filter(c => hiddenColumns[c.key]).length + 2}
                    className="py-12 text-center text-secondary"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                        <span className="material-symbols-outlined text-2xl text-slate-400">
                          search_off
                        </span>
                      </div>

                      <p className="text-sm font-semibold text-on-surface">
                        No pending bills found
                      </p>

                      <p className="mt-1 max-w-md text-xs text-secondary">
                        {pendingBills.length === 0
                          ? 'There are currently no pending bills awaiting approval.'
                          : 'No pending bills match the selected category, support agent or search query.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedPendingBills.map((bill) => (
                  <tr
                    key={bill.id}
                    className={`hover:bg-surface-container-low/60 transition-colors h-14 ${selectedBillIds.includes(
                      Number(bill.id)
                    )
                      ? 'bg-teal-50/50'
                      : ''
                      }`}
                  >
                    <td className="px-4">
                      <input
                        type="checkbox"
                        checked={selectedBillIds.includes(
                          Number(bill.id)
                        )}
                        onChange={() =>
                          handleToggleSelect(
                            Number(bill.id)
                          )
                        }
                        className="accent-teal-600 rounded cursor-pointer"
                        aria-label={`Select bill ${bill.id}`}
                      />
                    </td>

                    {/* Render columns content corresponding to header order */}
                    {columns.map((col) => 
                      hiddenColumns[col.key] ? renderCellContent(col.key, bill) : null
                    )}

                    {/* <td className="px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveBillForAction(
                              bill
                            );
                            setActionType(
                              'Approved'
                            );
                            setApprovedAmount(
                              String(Number(bill.amount) || 0)
                            );
                            setAmountError('');
                          }}
                          className="px-2.5 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">
                            check
                          </span>

                          <span>Approve</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveBillForAction(
                              bill
                            );
                            setActionType(
                              'Rejected'
                            );
                            setRejectReason('');
                          }}
                          className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">
                            close
                          </span>

                          <span>Reject</span>
                        </button>
                      </div>
                    </td> */}
                    <td className="px-4 text-right whitespace-nowrap">
  <div className="flex items-center justify-end gap-1.5">
    {/* Approve Button */}
    <button
      type="button"
      onClick={() => {
        setActiveBillForAction(bill);
        setActionType('Approved');
        setApprovedAmount(String(Number(bill.amount) || 0));
        setAmountError('');
      }}
      className="px-2.5 py-1 rounded bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer border border-teal-200/60 dark:border-teal-800/50"
    >
      <span className="material-symbols-outlined text-sm text-teal-600 dark:text-teal-400">
        check
      </span>
      <span>Approve</span>
    </button>

    {/* Reject Button */}
    <button
      type="button"
      onClick={() => {
        setActiveBillForAction(bill);
        setActionType('Rejected');
        setRejectReason('');
      }}
      className="px-2.5 py-1 rounded bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer border border-rose-200/60 dark:border-rose-800/50"
    >
      <span className="material-symbols-outlined text-sm text-rose-600 dark:text-rose-400">
        close
      </span>
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

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-3.5 bg-surface-bright border-t border-outline-variant/20 text-xs gap-3">
          <div className="flex items-center gap-3">
            <span className="text-secondary">
              Showing {filteredPendingBills.length === 0 ? 0 : (currentPage - 1) * (pageSize === 'ALL' ? filteredPendingBills.length : Number(pageSize)) + 1} to {pageSize === 'ALL' ? filteredPendingBills.length : Math.min(filteredPendingBills.length, currentPage * Number(pageSize))} of {filteredPendingBills.length} entries
            </span>

            <div className="flex items-center gap-1.5">
              <span className="text-secondary">Show:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  const val = e.target.value === 'ALL' ? 'ALL' : Number(e.target.value);
                  setPageSize(val);
                  setCurrentPage(1);
                }}
                className="bg-surface text-on-surface text-xs rounded-lg border border-outline-variant/40 px-2 py-1 focus:outline-none cursor-pointer font-medium"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={500}>500</option>
                <option value="ALL">All</option>
              </select>
            </div>
          </div>

          {totalPages > 1 && pageSize !== 'ALL' && (
            <div className="flex items-center gap-1.5">
              <span className="text-secondary mr-2">
                Page <span className="font-semibold text-foreground">{currentPage}</span> of {totalPages}
              </span>
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
          )}
        </div>
      </div>

      {/* Full Description Modal */}
      <ConfirmModal
        isOpen={!!selectedDescriptionBill}
        title="Bill Description Details"
        confirmText="Close"
        confirmVariant="primary"
        isLoading={false}
        onClose={() => setSelectedDescriptionBill(null)}
        onConfirm={() => setSelectedDescriptionBill(null)}
      >
        {selectedDescriptionBill && (
          <div className="flex flex-col gap-3 text-xs">
            <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/30 flex flex-col gap-1.5">
              <div className="flex justify-between">
                <span className="text-secondary font-medium">Ticket ID:</span>
                <span className="font-mono font-bold text-teal-700">#{selectedDescriptionBill.ticket_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary font-medium">Support Staff:</span>
                <span className="font-semibold text-on-surface">{selectedDescriptionBill.created_by || 'Support Staff'}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-secondary uppercase tracking-wider text-[11px]">
                Full Description / Remarks:
              </label>
              <div className="p-3 bg-surface rounded-lg border border-outline-variant/40 text-on-surface font-medium whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
                {selectedDescriptionBill.description}
              </div>
            </div>
          </div>
        )}
      </ConfirmModal>

      {/* Single Action Modal */}
      <ConfirmModal
        isOpen={!!activeBillForAction}
        title={
          actionType === 'Approved'
            ? 'Approve Service Bill'
            : 'Reject Service Bill'
        }
        confirmText={
          actionType === 'Approved'
            ? Number(approvedAmount) > 0 &&
              Number(approvedAmount) <
              Number(activeBillForAction?.amount || 0)
              ? 'Confirm Partial Approval'
              : 'Confirm Approval'
            : 'Confirm Rejection'
        }
        confirmVariant={
          actionType === 'Approved'
            ? 'primary'
            : 'danger'
        }
        isLoading={isProcessing}
        onClose={() => {
          setActiveBillForAction(null);
          setActionType(null);
          setApprovedAmount('');
          setAmountError('');
        }}
        onConfirm={handleConfirmSingleAction}
      >
        {activeBillForAction && (
          <div className="flex flex-col gap-3 text-xs">
            <p className="text-secondary">
              Are you sure you want to{' '}
              <strong>
                {actionType?.toLowerCase()}
              </strong>{' '}
              ticket{' '}
              <strong className="text-on-surface font-mono">
                {activeBillForAction.ticket_id}
              </strong>{' '}
              submitted by{' '}
              <strong className="text-teal-700">
                {activeBillForAction.created_by ||
                  'Support'}
              </strong>{' '}
              for{' '}
              <strong className="text-teal-700 font-mono">
                ৳
                {activeBillForAction.amount.toLocaleString()}
              </strong>
              ?
            </p>

            {actionType === 'Approved' && (
              <div className="flex flex-col gap-1.5 mt-1">
                <label className="font-semibold text-secondary uppercase">
                  Approved Amount (৳)
                </label>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={Number(activeBillForAction.amount) || 0}
                    step="any"
                    value={approvedAmount}
                    onChange={(e) => {
                      setApprovedAmount(e.target.value);
                      setAmountError('');
                    }}
                    className="flex-1 p-2 bg-surface rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600 text-xs font-data-mono font-bold"
                    placeholder="Enter amount to approve"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setApprovedAmount(
                        String(Number(activeBillForAction.amount) || 0)
                      );
                      setAmountError('');
                    }}
                    className="px-2.5 py-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold text-xs border border-teal-200 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Full ৳
                    {Number(activeBillForAction.amount).toLocaleString()}
                  </button>
                </div>

                {amountError ? (
                  <p className="text-rose-600 font-medium">
                    {amountError}
                  </p>
                ) : Number(approvedAmount) > 0 &&
                  Number(approvedAmount) <
                  Number(activeBillForAction.amount) ? (
                  <p className="text-amber-700 font-medium">
                    Partial approval: ৳
                    {Number(approvedAmount).toLocaleString()} of ৳
                    {Number(activeBillForAction.amount).toLocaleString()}{' '}
                    (৳
                    {(
                      Number(activeBillForAction.amount) -
                      Number(approvedAmount)
                    ).toLocaleString()}{' '}
                    will not be paid)
                  </p>
                ) : null}
              </div>
            )}

            {actionType === 'Rejected' && (
              <div className="flex flex-col gap-1 mt-1">
                <label className="font-semibold text-secondary uppercase">
                  Rejection Reason (Optional)
                </label>

                <textarea
                  rows={2}
                  value={rejectReason}
                  onChange={(e) =>
                    setRejectReason(e.target.value)
                  }
                  placeholder="Explain why this charge is rejected..."
                  className="p-2 bg-surface rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600 text-xs resize-none"
                />
              </div>
            )}
          </div>
        )}
      </ConfirmModal>

      {/* Batch Approve Modal */}
      <ConfirmModal
        isOpen={isBatchConfirmOpen}
        title="Batch Approve Bills"
        confirmText={`Approve All ${selectedBillIds.length} Bills`}
        confirmVariant="primary"
        isLoading={isProcessing}
        onClose={() =>
          setIsBatchConfirmOpen(false)
        }
        onConfirm={handleConfirmBatchApprove}
      >
        <p className="text-xs text-secondary">
          You are about to approve{' '}
          <strong>{selectedBillIds.length}</strong>{' '}
          pending bills at once. This will release them
          directly to Accounts for ledger clearance.
        </p>
      </ConfirmModal>
    </motion.div>
  );
}













