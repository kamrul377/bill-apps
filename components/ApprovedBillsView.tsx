
// 'use client';
// import React, { useState, useMemo } from 'react';
// import { motion } from 'motion/react';
// import { Bill, User } from '@/lib/types';
// import ConfirmModal from './ConfirmModal';

// interface ApprovedBillsViewProps {
//   bills: Bill[];
//   currentUser?: User;
//   onViewDetails: (bill: Bill) => void;
//   onPrintSlip: (bill: Bill) => void;

//   onPayBill?: (
//     billId: number,
//     paymentDetails: {
//       paymentMethod: string;
//       paymentNote?: string;
//       paidBy?: string;
//     }
//   ) => Promise<void>;

//   onBatchPayBills?: (
//     billIds: number[],
//     paymentDetails: {
//       paymentMethod: string;
//       paymentNote?: string;
//       paidBy?: string;
//     }
//   ) => Promise<void>;

//   onShowToast?: (
//     msg: string,
//     type?: 'success' | 'error' | 'info'
//   ) => void;
// }

// type SortField = 'ticket_id' | 'user_id' | 'date' | 'amount' | 'status' | null;
// type SortOrder = 'asc' | 'desc';

// export default function ApprovedBillsView({
//   bills,
//   currentUser,
//   onViewDetails,
//   onPrintSlip,
//   onPayBill,
//   onBatchPayBills,
//   onShowToast,
// }: ApprovedBillsViewProps) {
//   const [search, setSearch] = useState('');
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');
//   const [selectedSupportAgent, setSelectedSupportAgent] = useState('ALL');
//   const [selectedManager, setSelectedManager] = useState('ALL');
//   const [statusTab, setStatusTab] = useState<'ALL' | 'UNPAID' | 'PAID'>('ALL');
//   const [currentPage, setCurrentPage] = useState(1);

//   const [isSummaryVisible, setIsSummaryVisible] = useState(false);

//   const [sortField, setSortField] = useState<SortField>(null);
//   const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

//   const pageSize = 50;

//   const [selectedBillIds, setSelectedBillIds] = useState<number[]>([]);
//   const [isBatchPayOpen, setIsBatchPayOpen] = useState(false);

//   const [billToPay, setBillToPay] = useState<Bill | null>(null);
//   const [paymentMethod, setPaymentMethod] = useState('Cash');
//   const [paymentNote, setPaymentNote] = useState('');
//   const [isProcessing, setIsProcessing] = useState(false);

//   const ledgerBills = useMemo(
//     () =>
//       bills.filter(
//         (b) => b.status === 'Approved' || b.status === 'Paid'
//       ),
//     [bills]
//   );

//   const unpaidCount = useMemo(
//     () => ledgerBills.filter((b) => b.status === 'Approved').length,
//     [ledgerBills]
//   );

//   const paidCount = useMemo(
//     () => ledgerBills.filter((b) => b.status === 'Paid').length,
//     [ledgerBills]
//   );

//   const supportAgentsList = useMemo(() => {
//     const map = new Map<
//       string,
//       {
//         name: string;
//         totalCount: number;
//         paidCount: number;
//         unpaidCount: number;
//         totalAmount: number;
//         paidAmount: number;
//         unpaidAmount: number;
//       }
//     >();

//     for (const b of ledgerBills) {
//       const name = b.created_by?.trim() || 'Unknown Support';
//       const existing = map.get(name) || {
//         name,
//         totalCount: 0,
//         paidCount: 0,
//         unpaidCount: 0,
//         totalAmount: 0,
//         paidAmount: 0,
//         unpaidAmount: 0,
//       };

//       const amt = Number(b.amount) || 0;
//       existing.totalCount += 1;
//       existing.totalAmount += amt;

//       if (b.status === 'Paid') {
//         existing.paidCount += 1;
//         existing.paidAmount += amt;
//       } else {
//         existing.unpaidCount += 1;
//         existing.unpaidAmount += amt;
//       }

//       map.set(name, existing);
//     }

//     return Array.from(map.values()).sort(
//       (a, b) => b.paidAmount - a.paidAmount
//     );
//   }, [ledgerBills]);

//   const managersList = useMemo(() => {
//     const set = new Set<string>();
//     for (const b of ledgerBills) {
//       if (b.approved_by) {
//         set.add(b.approved_by.trim());
//       }
//     }
//     return Array.from(set).sort();
//   }, [ledgerBills]);

//   const filteredBills = useMemo(() => {
//     const result = ledgerBills.filter((b) => {
//       if (statusTab === 'UNPAID' && b.status !== 'Approved') return false;
//       if (statusTab === 'PAID' && b.status !== 'Paid') return false;

//       if (selectedSupportAgent !== 'ALL') {
//         const creator = (b.created_by || '').toLowerCase();
//         if (!creator.includes(selectedSupportAgent.toLowerCase())) return false;
//       }

//       if (selectedManager !== 'ALL') {
//         const approver = (b.approved_by || '').toLowerCase();
//         if (!approver.includes(selectedManager.toLowerCase())) return false;
//       }

//       if (search.trim()) {
//         const q = search.toLowerCase().trim();
//         const ticketMatch = b.ticket_id.toLowerCase().includes(q);
//         const userMatch = b.user_id.toLowerCase().includes(q);
//         const descMatch = b.description.toLowerCase().includes(q);
//         const supportMatch = (b.created_by || '').toLowerCase().includes(q);
//         const managerMatch = (b.approved_by || '').toLowerCase().includes(q);
//         const paidByMatch = (b.paid_by || '').toLowerCase().includes(q);

//         if (!ticketMatch && !userMatch && !descMatch && !supportMatch && !managerMatch && !paidByMatch) {
//           return false;
//         }
//       }

//       if (startDate || endDate) {
//         const billDate = new Date(b.date);
//         if (startDate && billDate < new Date(startDate)) return false;
//         if (endDate && billDate > new Date(endDate)) return false;
//       }

//       return true;
//     });

//     if (sortField) {
//       result.sort((a, b) => {
//         let valA: any = a[sortField as keyof Bill];
//         let valB: any = b[sortField as keyof Bill];

//         if (sortField === 'amount') {
//           valA = Number(valA) || 0;
//           valB = Number(valB) || 0;
//         } else if (sortField === 'ticket_id' || sortField === 'user_id' || sortField === 'status') {
//           valA = String(valA || '').toLowerCase();
//           valB = String(valB || '').toLowerCase();
//         } else if (sortField === 'date') {
//           valA = new Date(valA || '').getTime();
//           valB = new Date(valB || '').getTime(); // Fixed typo here (b.date instead of valB)
//         }

//         if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
//         if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
//         return 0;
//       });
//     }

//     return result;
//   }, [
//     ledgerBills,
//     statusTab,
//     selectedSupportAgent,
//     selectedManager,
//     search,
//     startDate,
//     endDate,
//     sortField,
//     sortOrder,
//   ]);

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

//   const totalAmountTk = useMemo(
//     () => filteredBills.reduce((sum, b) => sum + (Number(b.amount) || 0), 0),
//     [filteredBills]
//   );

//   const totalPages = Math.max(1, Math.ceil(filteredBills.length / pageSize));

//   const paginatedBills = useMemo(
//     () => filteredBills.slice((currentPage - 1) * pageSize, currentPage * pageSize),
//     [filteredBills, currentPage, pageSize]
//   );

//   const eligibleUnpaidBills = useMemo(
//     () => filteredBills.filter((b) => b.status === 'Approved'),
//     [filteredBills]
//   );

//   const handleSelectAllUnpaid = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.checked) {
//       setSelectedBillIds(eligibleUnpaidBills.map((b) => Number(b.id)));
//     } else {
//       setSelectedBillIds([]);
//     }
//   };

//   const handleToggleSelect = (billId: number) => {
//     setSelectedBillIds((prev) =>
//       prev.includes(billId) ? prev.filter((id) => id !== billId) : [...prev, billId]
//     );
//   };

//   const handleConfirmSinglePayment = async () => {
//     if (!billToPay || !onPayBill) return;
//     setIsProcessing(true);
//     try {
//       await onPayBill(Number(billToPay.id), {
//         paymentMethod,
//         paymentNote: paymentNote.trim() || undefined,
//         paidBy: currentUser?.name || 'Accounts Staff',
//       });
//       setSelectedBillIds((prev) => prev.filter((id) => id !== Number(billToPay.id)));
//       setBillToPay(null);
//       setPaymentNote('');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleConfirmBatchPayment = async () => {
//     if (selectedBillIds.length === 0 || !onBatchPayBills) return;
//     setIsProcessing(true);
//     try {
//       await onBatchPayBills(selectedBillIds, {
//         paymentMethod,
//         paymentNote: paymentNote.trim() || undefined,
//         paidBy: currentUser?.name || 'Accounts Staff',
//       });
//       setSelectedBillIds([]);
//       setIsBatchPayOpen(false);
//       setPaymentNote('');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleExportCSV = () => {
//     const status = 'Paid';
//     const link = document.createElement('a');
//     link.href = `/api/bills/export?status=${encodeURIComponent(status)}`;
//     link.download = `FNFOnline_${status}_Audit_Ledger_${new Date().toISOString().slice(0, 10)}.csv`;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     onShowToast?.(`Downloading ${status} bills CSV...`, 'info');
//   };

//   const isAccountsOrAdmin =
//     currentUser?.role === 'accounts' || currentUser?.role === 'admin';

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
//           <div className="flex items-center gap-2">
//             <h1 className="text-lg sm:text-xl font-bold text-on-surface">
//               Accounts & Ledger
//             </h1>
//             <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
//               Disbursement
//             </span>
//           </div>
//           <p className="text-xs text-secondary mt-0.5">
//             Accounts Clearance: Disburse approved bills, record payments, and track payout audit records.
//           </p>
//         </div>

//         <div className="flex flex-wrap items-center gap-2.5">
//           <div className="px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-xs">
//             <span className="text-secondary mr-1">Filtered Total:</span>
//             <strong className="text-teal-800 font-data-mono font-bold">
//               ৳ {totalAmountTk.toLocaleString()} ({filteredBills.length})
//             </strong>
//           </div>

//           {isAccountsOrAdmin && selectedBillIds.length > 0 && onBatchPayBills && (
//             <button
//               type="button"
//               onClick={() => setIsBatchPayOpen(true)}
//               className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
//             >
//               <span className="material-symbols-outlined text-sm">payments</span>
//               <span>Pay Selected ({selectedBillIds.length})</span>
//             </button>
//           )}

//           <button
//             type="button"
//             onClick={handleExportCSV}
//             className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
//           >
//             <span className="material-symbols-outlined text-sm">download</span>
//             <span>Export CSV</span>
//           </button>
//         </div>
//       </div>

//       {/* Support Staff Summary */}
//       <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-4 shadow-xs">
//         <div
//           onClick={() => setIsSummaryVisible(!isSummaryVisible)}
//           className="flex items-center justify-between cursor-pointer select-none"
//         >
//           <div className="flex items-center gap-2">
//             <span className="material-symbols-outlined text-teal-600 text-lg">
//               account_balance_wallet
//             </span>
//             <h2 className="text-xs font-bold text-on-surface uppercase tracking-wider">
//               Support Staff Payment History Summary
//             </h2>
//           </div>

//           <div className="flex items-center gap-2">
//             <span className="text-[11px] text-secondary font-medium">
//               Total Staff: {supportAgentsList.length}
//             </span>
//             <span className="material-symbols-outlined text-secondary text-sm">
//               {isSummaryVisible ? 'expand_less' : 'expand_more'}
//             </span>
//           </div>
//         </div>

//         {isSummaryVisible && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: 'auto' }}
//             exit={{ opacity: 0, height: 0 }}
//             className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3 pt-3 border-t border-outline-variant/20"
//           >
//             {supportAgentsList.map((agent) => (
//               <div
//                 key={agent.name}
//                 onClick={() => {
//                   setSelectedSupportAgent(agent.name);
//                   setCurrentPage(1);
//                 }}
//                 className={`p-3 rounded-lg border transition-all cursor-pointer ${selectedSupportAgent === agent.name
//                   ? 'bg-teal-50/80 border-teal-500 shadow-xs'
//                   : 'bg-surface hover:bg-surface-container-low border-outline-variant/30'
//                   }`}
//               >
//                 <div className="flex items-center justify-between mb-1.5">
//                   <span className="font-semibold text-xs text-on-surface truncate max-w-[130px]" title={agent.name}>
//                     {agent.name}
//                   </span>
//                   <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-bold">
//                     {agent.totalCount} bills
//                   </span>
//                 </div>

//                 <div className="flex flex-col gap-1 text-[11px]">
//                   <div className="flex justify-between items-center">
//                     <span className="text-emerald-700 font-medium flex items-center gap-1">
//                       <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
//                       Total Paid:
//                     </span>
//                     <span className="font-data-mono font-bold text-emerald-800">
//                       ৳ {agent.paidAmount.toLocaleString()}
//                     </span>
//                   </div>

//                   <div className="flex justify-between items-center">
//                     <span className="text-amber-700 font-medium flex items-center gap-1">
//                       <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
//                       Unpaid:
//                     </span>
//                     <span className="font-data-mono font-semibold text-amber-800">
//                       ৳ {agent.unpaidAmount.toLocaleString()}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </motion.div>
//         )}
//       </div>

//       {/* Status Tabs */}
//       <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-1 text-xs">
//         <button
//           type="button"
//           onClick={() => {
//             setStatusTab('ALL');
//             setCurrentPage(1);
//           }}
//           className={`px-3 py-1.5 rounded-t-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${statusTab === 'ALL'
//             ? 'bg-surface-container-lowest text-teal-700 border-b-2 border-teal-600 shadow-xs'
//             : 'text-secondary hover:text-on-surface'
//             }`}
//         >
//           <span>All Ledger Bills</span>
//           <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700 font-bold">
//             {ledgerBills.length}
//           </span>
//         </button>

//         <button
//           type="button"
//           onClick={() => {
//             setStatusTab('UNPAID');
//             setCurrentPage(1);
//           }}
//           className={`px-3 py-1.5 rounded-t-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${statusTab === 'UNPAID'
//             ? 'bg-surface-container-lowest text-amber-700 border-b-2 border-amber-600 shadow-xs'
//             : 'text-secondary hover:text-on-surface'
//             }`}
//         >
//           <span>Awaiting Payment</span>
//           <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
//             {unpaidCount}
//           </span>
//         </button>

//         <button
//           type="button"
//           onClick={() => {
//             setStatusTab('PAID');
//             setCurrentPage(1);
//           }}
//           className={`px-3 py-1.5 rounded-t-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${statusTab === 'PAID'
//             ? 'bg-surface-container-lowest text-emerald-700 border-b-2 border-emerald-600 shadow-xs'
//             : 'text-secondary hover:text-on-surface'
//             }`}
//         >
//           <span>Paid & Cleared</span>
//           <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold">
//             {paidCount}
//           </span>
//         </button>
//       </div>

//       {/* Filter Toolbar */}
//       <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-xs overflow-hidden flex flex-col">
//         <div className="p-3 bg-surface-bright flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-outline-variant/20 text-xs">
//           <div className="relative flex-1">
//             <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-secondary text-base pointer-events-none">
//               search
//             </span>
//             <input
//               type="text"
//               value={search}
//               onChange={(e) => {
//                 setSearch(e.target.value);
//                 setCurrentPage(1);
//               }}
//               placeholder="Search Support Staff, Manager, Ticket #, Subscriber ID, description..."
//               className="w-full pl-8 pr-8 py-2 bg-surface text-on-surface rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600 font-medium placeholder:text-secondary/70"
//             />
//             {search && (
//               <button
//                 type="button"
//                 onClick={() => setSearch('')}
//                 className="absolute right-2.5 top-2 text-secondary hover:text-on-surface p-0.5 rounded cursor-pointer"
//                 title="Clear search"
//               >
//                 <span className="material-symbols-outlined text-sm">close</span>
//               </button>
//             )}
//           </div>

//           <div className="flex items-center gap-2">
//             <select
//               value={selectedSupportAgent}
//               onChange={(e) => {
//                 setSelectedSupportAgent(e.target.value);
//                 setCurrentPage(1);
//               }}
//               className="bg-surface px-2.5 py-2 rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600 font-medium text-xs text-on-surface cursor-pointer w-full md:w-auto"
//             >
//               <option value="ALL">All Support Staff</option>
//               {supportAgentsList.map((agent) => (
//                 <option key={agent.name} value={agent.name}>
//                   {agent.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="flex items-center gap-2">
//             <select
//               value={selectedManager}
//               onChange={(e) => {
//                 setSelectedManager(e.target.value);
//                 setCurrentPage(1);
//               }}
//               className="bg-surface px-2.5 py-2 rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600 font-medium text-xs text-on-surface cursor-pointer w-full md:w-auto"
//             >
//               <option value="ALL">All Managers (Approved By)</option>
//               {managersList.map((mgr) => (
//                 <option key={mgr} value={mgr}>
//                   Mgr: {mgr}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
//             <input
//               type="date"
//               value={startDate}
//               onChange={(e) => {
//                 setStartDate(e.target.value);
//                 setCurrentPage(1);
//               }}
//               className="bg-surface px-2 py-1.5 rounded-lg border border-outline-variant/40 focus:outline-none font-mono text-xs"
//               title="Start Date"
//             />
//             <span className="text-secondary">-</span>
//             <input
//               type="date"
//               value={endDate}
//               onChange={(e) => {
//                 setEndDate(e.target.value);
//                 setCurrentPage(1);
//               }}
//               className="bg-surface px-2 py-1.5 rounded-lg border border-outline-variant/40 focus:outline-none font-mono text-xs"
//               title="End Date"
//             />
//           </div>
//         </div>

//         {(selectedSupportAgent !== 'ALL' || selectedManager !== 'ALL' || search || startDate || endDate) && (
//           <div className="px-3 py-2 bg-surface flex items-center justify-between text-xs border-b border-outline-variant/20">
//             <span className="text-teal-700 font-medium">
//               Filtered Result: <strong>{filteredBills.length}</strong> bills matching criteria (৳ {totalAmountTk.toLocaleString()})
//             </span>
//             <button
//               type="button"
//               onClick={() => {
//                 setSelectedSupportAgent('ALL');
//                 setSelectedManager('ALL');
//                 setSearch('');
//                 setStartDate('');
//                 setEndDate('');
//                 setCurrentPage(1);
//               }}
//               className="text-secondary hover:text-rose-600 hover:bg-rose-50 px-2 py-0.5 rounded transition-colors font-medium cursor-pointer"
//             >
//               Clear Filters
//             </button>
//           </div>
//         )}

//         {/* Table */}
//         <div className="overflow-x-auto">
//           <table className="w-full text-left text-xs min-w-[760px]">
//             <thead>
//               <tr className="bg-surface-container-low text-secondary uppercase tracking-wider h-10">
//                 {isAccountsOrAdmin && (
//                   <th className="px-4 w-10">
//                     <input
//                       type="checkbox"
//                       checked={
//                         eligibleUnpaidBills.length > 0 &&
//                         eligibleUnpaidBills.every((b) => selectedBillIds.includes(Number(b.id)))
//                       }
//                       onChange={handleSelectAllUnpaid}
//                       className="accent-emerald-600 rounded cursor-pointer"
//                       title="Select all unpaid bills"
//                       aria-label="Select all unpaid bills"
//                     />
//                   </th>
//                 )}

//                 <th
//                   onClick={() => handleSort('ticket_id')}
//                   className="px-3 font-semibold cursor-pointer hover:text-on-surface select-none"
//                 >
//                   Ticket ID {renderSortIcon('ticket_id')}
//                 </th>

//                 <th
//                   onClick={() => handleSort('user_id')}
//                   className="px-3 font-semibold cursor-pointer hover:text-on-surface select-none"
//                 >
//                   User ID {renderSortIcon('user_id')}
//                 </th>

//                 <th className="px-3 font-semibold">Support Staff</th>

//                 <th
//                   onClick={() => handleSort('date')}
//                   className="px-3 font-semibold cursor-pointer hover:text-on-surface select-none"
//                 >
//                   Date {renderSortIcon('date')}
//                 </th>

//                 <th
//                   onClick={() => handleSort('status')}
//                   className="px-3 font-semibold cursor-pointer hover:text-on-surface select-none"
//                 >
//                   Status {renderSortIcon('status')}
//                 </th>

//                 <th className="px-3 font-semibold">Description</th>

//                 <th
//                   onClick={() => handleSort('amount')}
//                   className="px-3 font-semibold cursor-pointer hover:text-on-surface select-none"
//                 >
//                   Amount (TK) {renderSortIcon('amount')}
//                 </th>

//                 <th className="px-4 font-semibold text-right">Actions</th>
//               </tr>
//             </thead>

//             <tbody className="divide-y divide-outline-variant/20">
//               {paginatedBills.length === 0 ? (
//                 <tr>
//                   <td colSpan={isAccountsOrAdmin ? 9 : 8} className="py-12 text-center text-secondary">
//                     <div className="flex flex-col items-center justify-center">
//                       <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
//                         <span className="material-symbols-outlined text-2xl text-slate-400">search_off</span>
//                       </div>
//                       <p className="text-sm font-semibold text-on-surface">No bills found</p>
//                       <p className="mt-1 text-xs text-secondary">No bills match your current filter criteria.</p>
//                     </div>
//                   </td>
//                 </tr>
//               ) : (
//                 paginatedBills.map((bill) => {
//                   const isPaid = bill.status === 'Paid';
//                   const billId = Number(bill.id);

//                   const handleDetailsClick = () => {
//                     const billWithManager = {
//                       ...bill,
//                       approved_by: bill.approved_by || 'Manager',
//                     };
//                     onViewDetails(billWithManager);
//                   };

//                   const handlePrintSlipClick = () => {
//                     const slipBill = {
//                       ...bill,
//                       created_by: bill.approved_by || bill.created_by,
//                     };
//                     onPrintSlip(slipBill);
//                   };

//                   return (
//                     <tr
//                       key={bill.id}
//                       className={`hover:bg-surface-container-low/60 transition-colors h-14 ${selectedBillIds.includes(billId) ? 'bg-emerald-50/50' : ''
//                         }`}
//                     >
//                       {isAccountsOrAdmin && (
//                         <td className="px-4">
//                           {!isPaid ? (
//                             <input
//                               type="checkbox"
//                               checked={selectedBillIds.includes(billId)}
//                               onChange={() => handleToggleSelect(billId)}
//                               className="accent-emerald-600 rounded cursor-pointer"
//                               aria-label={`Select bill ${bill.id}`}
//                             />
//                           ) : (
//                             <span className="material-symbols-outlined text-emerald-600 text-base" title="Bill is Paid">
//                               task_alt
//                             </span>
//                           )}
//                         </td>
//                       )}

//                       <td className="px-3 font-data-mono font-bold text-teal-700">{bill.ticket_id}</td>
//                       <td className="px-3 font-data-mono text-secondary">{bill.user_id}</td>
//                       <td className="px-3">
//                         <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 font-medium text-[11px] border border-teal-200">
//                           <span className="material-symbols-outlined text-xs">person</span>
//                           <span className="truncate max-w-[120px]" title={bill.created_by || 'Support Staff'}>
//                             {bill.created_by || 'Support Staff'}
//                           </span>
//                         </span>
//                       </td>

//                       <td className="px-3 text-secondary font-data-mono">{bill.date}</td>

//                       <td className="px-3 whitespace-nowrap">
//                         <div className="flex flex-col gap-0.5">
//                           {isPaid ? (
//                             <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 w-fit">
//                               <span className="material-symbols-outlined text-xs">check_circle</span>
//                               <span>PAID</span>
//                             </span>
//                           ) : (
//                             <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300 w-fit">
//                               <span className="material-symbols-outlined text-xs">schedule</span>
//                               <span>Awaiting Pay</span>
//                             </span>
//                           )}

//                           {bill.approved_by && (
//                             <span className="text-[10px] text-teal-700 font-medium truncate max-w-[130px]" title={`Approved by: ${bill.approved_by}`}>
//                               Appr By: {bill.approved_by}
//                             </span>
//                           )}

//                           {isPaid && bill.paid_by && (
//                             <span className="text-[10px] text-emerald-700 truncate max-w-[130px]" title={`Paid by ${bill.paid_by}`}>
//                               Paid By: {bill.paid_by}
//                             </span>
//                           )}
//                         </div>
//                       </td>

//                       <td className="px-3 max-w-xs truncate text-on-surface">{bill.description}</td>
//                       <td className="px-3 font-data-mono font-bold text-on-surface">৳ {Number(bill.amount).toLocaleString()}</td>

//                       <td className="px-4 text-right whitespace-nowrap">
//                         <div className="flex items-center justify-end gap-1.5">
//                           {isAccountsOrAdmin && !isPaid && onPayBill && (
//                             <button
//                               type="button"
//                               onClick={() => {
//                                 setBillToPay(bill);
//                                 setPaymentMethod('Cash');
//                                 setPaymentNote('');
//                               }}
//                               className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
//                               title="Disburse / Mark Bill as Paid"
//                             >
//                               <span className="material-symbols-outlined text-sm">payments</span>
//                               <span>Pay Bill</span>
//                             </button>
//                           )}

//                           <button
//                             type="button"
//                             onClick={handlePrintSlipClick}
//                             className="px-2.5 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-700 font-medium transition-colors flex items-center gap-1 cursor-pointer"
//                             title="Generate Slip / Voucher"
//                           >
//                             <span className="material-symbols-outlined text-sm">print</span>
//                             <span className="hidden sm:inline">Slip</span>
//                           </button>

//                           <button
//                             type="button"
//                             onClick={handleDetailsClick}
//                             className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-medium transition-colors cursor-pointer"
//                           >
//                             Details
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>

//         {totalPages > 1 && (
//           <div className="p-3 bg-surface-bright flex items-center justify-between text-xs border-t border-outline-variant/20">
//             <span className="text-secondary">
//               Page {currentPage} of {totalPages} ({filteredBills.length} total)
//             </span>
//             <div className="flex gap-1">
//               <button
//                 type="button"
//                 disabled={currentPage === 1}
//                 onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//                 className="px-2.5 py-1 rounded border border-outline-variant/40 disabled:opacity-40 cursor-pointer hover:bg-surface"
//               >
//                 Previous
//               </button>
//               <button
//                 type="button"
//                 disabled={currentPage === totalPages}
//                 onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
//                 className="px-2.5 py-1 rounded border border-outline-variant/40 disabled:opacity-40 cursor-pointer hover:bg-surface"
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Single Payment Modal */}
//       <ConfirmModal
//         isOpen={!!billToPay}
//         title="Disburse & Mark Bill as Paid"
//         confirmText="Confirm Payment (PAID)"
//         confirmVariant="primary"
//         isLoading={isProcessing}
//         onClose={() => setBillToPay(null)}
//         onConfirm={handleConfirmSinglePayment}
//       >
//         {/* {billToPay && (
//           <div className="flex flex-col gap-3 text-xs">
//             <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex flex-col gap-1.5">
//               <div className="flex justify-between">
//                 <span className="text-secondary font-medium">Bill ID:</span>
//                 <span className="font-mono font-bold text-teal-800">#{billToPay.id}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-secondary font-medium">Ticket ID:</span>
//                 <span className="font-mono font-bold text-teal-800">{billToPay.ticket_id}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-secondary font-medium">Subscriber / User ID:</span>
//                 <span className="font-mono font-semibold text-on-surface">{billToPay.user_id}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-secondary font-medium">Support Staff:</span>
//                 <span className="font-semibold text-teal-700">{billToPay.created_by || 'Support Staff'}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-secondary font-medium">Authorized / Approved By:</span>
//                 <span className="font-semibold text-teal-800">{billToPay.approved_by || 'Manager'}</span>
//               </div>
//               <div className="flex justify-between items-center pt-1 border-t border-emerald-200">
//                 <span className="text-on-surface font-bold">Disbursement Amount:</span>
//                 <span className="text-base font-data-mono font-bold text-emerald-800">
//                   ৳ {Number(billToPay.amount).toLocaleString()}
//                 </span>
//               </div>
//             </div>

//             <div className="flex flex-col gap-1">
//               <label className="font-semibold text-secondary uppercase text-[11px]">Payment Method</label>
//               <select
//                 value={paymentMethod}
//                 onChange={(e) => setPaymentMethod(e.target.value)}
//                 className="p-2 bg-surface rounded-lg border border-outline-variant/40 focus:outline-none focus:border-emerald-600 text-xs text-on-surface"
//               >
//                 <option value="Cash">Cash at Counter</option>
//                 <option value="Bank Transfer">Bank Transfer / EFT</option>
//                 <option value="bKash / Nagad">Mobile Banking (bKash / Nagad)</option>
//                 <option value="Cheque">Bank Cheque</option>
//               </select>
//             </div>

//             <div className="flex flex-col gap-1">
//               <label className="font-semibold text-secondary uppercase text-[11px]">
//                 Voucher / Payment Reference Note (Optional)
//               </label>
//               <input
//                 type="text"
//                 value={paymentNote}
//                 onChange={(e) => setPaymentNote(e.target.value)}
//                 placeholder="e.g. Voucher #V-9042, TxID 8X9J21..."
//                 className="p-2 bg-surface rounded-lg border border-outline-variant/40 focus:outline-none focus:border-emerald-600 text-xs"
//               />
//             </div>
//           </div>
//         )} */}
//         {billToPay && (
//     <div className="flex flex-col gap-3 text-xs">
//         {/* Bill Details Summary Card */}
//         <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900/60 flex flex-col gap-1.5 transition-colors">
//             <div className="flex justify-between">
//                 <span className="text-slate-500 dark:text-slate-400 font-medium">Bill ID:</span>
//                 <span className="font-mono font-bold text-teal-800 dark:text-teal-300">#{billToPay.id}</span>
//             </div>
//             <div className="flex justify-between">
//                 <span className="text-slate-500 dark:text-slate-400 font-medium">Ticket ID:</span>
//                 <span className="font-mono font-bold text-teal-800 dark:text-teal-300">{billToPay.ticket_id}</span>
//             </div>
//             <div className="flex justify-between">
//                 <span className="text-slate-500 dark:text-slate-400 font-medium">Subscriber / User ID:</span>
//                 <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{billToPay.user_id}</span>
//             </div>
//             <div className="flex justify-between">
//                 <span className="text-slate-500 dark:text-slate-400 font-medium">Support Staff:</span>
//                 <span className="font-semibold text-teal-700 dark:text-teal-400">{billToPay.created_by || 'Support Staff'}</span>
//             </div>
//             <div className="flex justify-between">
//                 <span className="text-slate-500 dark:text-slate-400 font-medium">Authorized / Approved By:</span>
//                 <span className="font-semibold text-teal-800 dark:text-teal-300">{billToPay.approved_by || 'Manager'}</span>
//             </div>
//             <div className="flex justify-between items-center pt-2 border-t border-emerald-200 dark:border-emerald-900/60">
//                 <span className="text-slate-800 dark:text-slate-200 font-bold">Disbursement Amount:</span>
//                 <span className="text-base font-mono font-bold text-emerald-800 dark:text-emerald-400">
//                     ৳ {Number(billToPay.amount).toLocaleString()}
//                 </span>
//             </div>
//         </div>

//         {/* Payment Method Select */}
//         <div className="flex flex-col gap-1">
//             <label className="font-semibold text-slate-500 dark:text-slate-400 uppercase text-[11px]">Payment Method</label>
//             <select
//                 value={paymentMethod}
//                 onChange={(e) => setPaymentMethod(e.target.value)}
//                 className="p-2.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 text-xs text-slate-800 dark:text-slate-100 cursor-pointer"
//             >
//                 <option value="Cash">Cash at Counter</option>
//                 <option value="Bank Transfer">Bank Transfer / EFT</option>
//                 <option value="bKash / Nagad">Mobile Banking (bKash / Nagad)</option>
//                 <option value="Cheque">Bank Cheque</option>
//             </select>
//         </div>

//         {/* Voucher Note Input */}
//         <div className="flex flex-col gap-1">
//             <label className="font-semibold text-slate-500 dark:text-slate-400 uppercase text-[11px]">
//                 Voucher / Payment Reference Note (Optional)
//             </label>
//             <input
//                 type="text"
//                 value={paymentNote}
//                 onChange={(e) => setPaymentNote(e.target.value)}
//                 placeholder="e.g. Voucher #V-9042, TxID 8X9J21..."
//                 className="p-2.5 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 text-xs placeholder:text-slate-400 dark:placeholder:text-slate-600"
//             />
//         </div>
//     </div>
// )}
//       </ConfirmModal>

//       {/* Batch Payment Modal */}
//       <ConfirmModal
//         isOpen={isBatchPayOpen}
//         title="Batch Disburse & Mark as Paid"
//         confirmText={`Confirm Payment for ${selectedBillIds.length} Bills`}
//         confirmVariant="primary"
//         isLoading={isProcessing}
//         onClose={() => setIsBatchPayOpen(false)}
//         onConfirm={handleConfirmBatchPayment}
//       >
//         <div className="flex flex-col gap-3 text-xs">
//           <p className="text-secondary">
//             You are processing payment for <strong>{selectedBillIds.length}</strong> selected bills. All will be updated to status{' '}
//             <strong className="text-emerald-700">PAID</strong> under Accounts Ledger.
//           </p>

//           <div className="flex flex-col gap-1">
//             <label className="font-semibold text-secondary uppercase text-[11px]">Payment Method</label>
//             <select
//               value={paymentMethod}
//               onChange={(e) => setPaymentMethod(e.target.value)}
//               className="p-2 bg-surface rounded-lg border border-outline-variant/40 focus:outline-none focus:border-emerald-600 text-xs text-on-surface"
//             >
//               <option value="Cash">Cash at Counter</option>
//               <option value="Bank Transfer">Bank Transfer / EFT</option>
//               <option value="bKash / Nagad">Mobile Banking (bKash / Nagad)</option>
//               <option value="Cheque">Bank Cheque</option>
//             </select>
//           </div>

//           <div className="flex flex-col gap-1">
//             <label className="font-semibold text-secondary uppercase text-[11px]">Batch Reference / Voucher Note</label>
//             <input
//               type="text"
//               value={paymentNote}
//               onChange={(e) => setPaymentNote(e.target.value)}
//               placeholder="e.g. Batch Clearance Ledger Slip #44..."
//               className="p-2 bg-surface rounded-lg border border-outline-variant/40 focus:outline-none focus:border-emerald-600 text-xs"
//             />
//           </div>
//         </div>
//       </ConfirmModal>
//     </motion.div>
//   );
// }



// ====================2nd====================================



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
    billId: number,
    paymentDetails: {
      paymentMethod: string;
      paymentNote?: string;
      paidBy?: string;
    }
  ) => Promise<void>;

  onBatchPayBills?: (
    billIds: number[],
    paymentDetails: {
      paymentMethod: string;
      paymentNote?: string;
      paidBy?: string;
    }
  ) => Promise<void>;

  onShowToast?: (
    msg: string,
    type?: 'success' | 'error' | 'info'
  ) => void;
}

type SortField = 'ticket_id' | 'user_id' | 'support_staff' | 'date' | 'status' | 'description' | 'amount' | null;
type SortOrder = 'asc' | 'desc';

type ColumnKey = 
  | 'ticket_id' 
  | 'user_id' 
  | 'support_staff' 
  | 'date' 
  | 'status' 
  | 'description' 
  | 'amount';

interface ColumnConfig {
  key: ColumnKey;
  label: string;
}

const DEFAULT_COLUMNS: ColumnConfig[] = [
  { key: 'ticket_id', label: 'Ticket ID' },
  { key: 'user_id', label: 'User ID' },
  { key: 'support_staff', label: 'Support Staff' },
  { key: 'date', label: 'Date' },
  { key: 'status', label: 'Status' },
  { key: 'description', label: 'Description' },
  { key: 'amount', label: 'Amount (TK)' },
];

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
  const [selectedManager, setSelectedManager] = useState('ALL');
  const [statusTab, setStatusTab] = useState<'ALL' | 'UNPAID' | 'PAID'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const [isSummaryVisible, setIsSummaryVisible] = useState(false);

  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const pageSize = 50;

  const [selectedBillIds, setSelectedBillIds] = useState<number[]>([]);
  const [isBatchPayOpen, setIsBatchPayOpen] = useState(false);

  const [billToPay, setBillToPay] = useState<Bill | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentNote, setPaymentNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Column Customization States
  const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
  const [hiddenColumns, setHiddenColumns] = useState<Record<ColumnKey, boolean>>({
    ticket_id: true,
    user_id: true,
    support_staff: true,
    date: true,
    status: true,
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

  const ledgerBills = useMemo(
    () =>
      bills.filter(
        (b) => b.status === 'Approved' || b.status === 'Paid'
      ),
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

  const supportAgentsList = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        totalCount: number;
        paidCount: number;
        unpaidCount: number;
        totalAmount: number;
        paidAmount: number;
        unpaidAmount: number;
      }
    >();

    for (const b of ledgerBills) {
      const name = b.created_by?.trim() || 'Unknown Support';
      const existing = map.get(name) || {
        name,
        totalCount: 0,
        paidCount: 0,
        unpaidCount: 0,
        totalAmount: 0,
        paidAmount: 0,
        unpaidAmount: 0,
      };

      const amt = Number(b.amount) || 0;
      existing.totalCount += 1;
      existing.totalAmount += amt;

      if (b.status === 'Paid') {
        existing.paidCount += 1;
        existing.paidAmount += amt;
      } else {
        existing.unpaidCount += 1;
        existing.unpaidAmount += amt;
      }

      map.set(name, existing);
    }

    return Array.from(map.values()).sort(
      (a, b) => b.paidAmount - a.paidAmount
    );
  }, [ledgerBills]);

  const managersList = useMemo(() => {
    const set = new Set<string>();
    for (const b of ledgerBills) {
      if (b.approved_by) {
        set.add(b.approved_by.trim());
      }
    }
    return Array.from(set).sort();
  }, [ledgerBills]);

  const filteredBills = useMemo(() => {
    const result = ledgerBills.filter((b) => {
      if (statusTab === 'UNPAID' && b.status !== 'Approved') return false;
      if (statusTab === 'PAID' && b.status !== 'Paid') return false;

      if (selectedSupportAgent !== 'ALL') {
        const creator = (b.created_by || '').toLowerCase();
        if (!creator.includes(selectedSupportAgent.toLowerCase())) return false;
      }

      if (selectedManager !== 'ALL') {
        const approver = (b.approved_by || '').toLowerCase();
        if (!approver.includes(selectedManager.toLowerCase())) return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const ticketMatch = b.ticket_id.toLowerCase().includes(q);
        const userMatch = b.user_id.toLowerCase().includes(q);
        const descMatch = b.description.toLowerCase().includes(q);
        const supportMatch = (b.created_by || '').toLowerCase().includes(q);
        const managerMatch = (b.approved_by || '').toLowerCase().includes(q);
        const paidByMatch = (b.paid_by || '').toLowerCase().includes(q);

        if (!ticketMatch && !userMatch && !descMatch && !supportMatch && !managerMatch && !paidByMatch) {
          return false;
        }
      }

      if (startDate || endDate) {
        const billDate = new Date(b.date);
        if (startDate && billDate < new Date(startDate)) return false;
        if (endDate && billDate > new Date(endDate)) return false;
      }

      return true;
    });

    if (sortField) {
      result.sort((a, b) => {
        let valA: any = a[sortField as keyof Bill];
        let valB: any = b[sortField as keyof Bill];

        if (sortField === 'amount') {
          valA = Number(valA) || 0;
          valB = Number(valB) || 0;
        } else if (sortField === 'ticket_id' || sortField === 'user_id' || sortField === 'status') {
          valA = String(valA || '').toLowerCase();
          valB = String(valB || '').toLowerCase();
        } else if (sortField === 'date') {
          valA = new Date(valA || '').getTime();
          valB = new Date(valB || '').getTime();
        } else if (sortField === 'support_staff') {
          valA = String(a.created_by || '').toLowerCase();
          valB = String(b.created_by || '').toLowerCase();
        } else if (sortField === 'description') {
          valA = String(a.description || '').toLowerCase();
          valB = String(b.description || '').toLowerCase();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [
    ledgerBills,
    statusTab,
    selectedSupportAgent,
    selectedManager,
    search,
    startDate,
    endDate,
    sortField,
    sortOrder,
  ]);

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

  const totalAmountTk = useMemo(
    () => filteredBills.reduce((sum, b) => sum + (Number(b.amount) || 0), 0),
    [filteredBills]
  );

  const totalPages = Math.max(1, Math.ceil(filteredBills.length / pageSize));

  const paginatedBills = useMemo(
    () => filteredBills.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredBills, currentPage, pageSize]
  );

  const eligibleUnpaidBills = useMemo(
    () => filteredBills.filter((b) => b.status === 'Approved'),
    [filteredBills]
  );

  const handleSelectAllUnpaid = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedBillIds(eligibleUnpaidBills.map((b) => Number(b.id)));
    } else {
      setSelectedBillIds([]);
    }
  };

  const handleToggleSelect = (billId: number) => {
    setSelectedBillIds((prev) =>
      prev.includes(billId) ? prev.filter((id) => id !== billId) : [...prev, billId]
    );
  };

  const handleConfirmSinglePayment = async () => {
    if (!billToPay || !onPayBill) return;
    setIsProcessing(true);
    try {
      await onPayBill(Number(billToPay.id), {
        paymentMethod,
        paymentNote: paymentNote.trim() || undefined,
        paidBy: currentUser?.name || 'Accounts Staff',
      });
      setSelectedBillIds((prev) => prev.filter((id) => id !== Number(billToPay.id)));
      setBillToPay(null);
      setPaymentNote('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmBatchPayment = async () => {
    if (selectedBillIds.length === 0 || !onBatchPayBills) return;
    setIsProcessing(true);
    try {
      await onBatchPayBills(selectedBillIds, {
        paymentMethod,
        paymentNote: paymentNote.trim() || undefined,
        paidBy: currentUser?.name || 'Accounts Staff',
      });
      setSelectedBillIds([]);
      setIsBatchPayOpen(false);
      setPaymentNote('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportCSV = () => {
    const status = 'Paid';
    const link = document.createElement('a');
    link.href = `/api/bills/export?status=${encodeURIComponent(status)}`;
    link.download = `FNFOnline_${status}_Audit_Ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast?.(`Downloading ${status} bills CSV...`, 'info');
  };

  const isAccountsOrAdmin =
    currentUser?.role === 'accounts' || currentUser?.role === 'admin';

  // Render cell content based on column key
  const renderCellContent = (colKey: ColumnKey, bill: Bill) => {
    const isPaid = bill.status === 'Paid';
    switch (colKey) {
      case 'ticket_id':
        return <td key={colKey} className="px-3 font-data-mono font-bold text-teal-700">{bill.ticket_id}</td>;
      case 'user_id':
        return <td key={colKey} className="px-3 font-data-mono text-secondary">{bill.user_id}</td>;
      case 'support_staff':
        return (
          <td key={colKey} className="px-3">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 font-medium text-[11px] border border-teal-200">
              <span className="material-symbols-outlined text-xs">person</span>
              <span className="truncate max-w-[120px]" title={bill.created_by || 'Support Staff'}>
                {bill.created_by || 'Support Staff'}
              </span>
            </span>
          </td>
        );
      case 'date':
        return <td key={colKey} className="px-3 text-secondary font-data-mono">{bill.date}</td>;
      case 'status':
        return (
          <td key={colKey} className="px-3 whitespace-nowrap">
            <div className="flex flex-col gap-0.5">
              {isPaid ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 w-fit">
                  <span className="material-symbols-outlined text-xs">check_circle</span>
                  <span>PAID</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300 w-fit">
                  <span className="material-symbols-outlined text-xs">schedule</span>
                  <span>Awaiting Pay</span>
                </span>
              )}

              {bill.approved_by && (
                <span className="text-[10px] text-teal-700 font-medium truncate max-w-[130px]" title={`Approved by: ${bill.approved_by}`}>
                  Appr By: {bill.approved_by}
                </span>
              )}

              {isPaid && bill.paid_by && (
                <span className="text-[10px] text-emerald-700 truncate max-w-[130px]" title={`Paid by ${bill.paid_by}`}>
                  Paid By: {bill.paid_by}
                </span>
              )}
            </div>
          </td>
        );
      case 'description':
        return <td key={colKey} className="px-3 max-w-xs truncate text-on-surface">{bill.description}</td>;
      case 'amount':
        return <td key={colKey} className="px-3 font-data-mono font-bold text-on-surface">৳{Number(bill.amount).toLocaleString()}</td>;
      default:
        return null;
    }
  };

  // Render header cell with drag and drop capabilities
  const renderHeaderCell = (colKey: ColumnKey, index: number) => {
    const innerContent = (() => {
      switch (colKey) {
        case 'ticket_id':
          return <>Ticket ID {renderSortIcon('ticket_id')}</>;
        case 'user_id':
          return <>User ID {renderSortIcon('user_id')}</>;
        case 'support_staff':
          return <>Support Staff {renderSortIcon('support_staff')}</>;
        case 'date':
          return <>Date {renderSortIcon('date')}</>;
        case 'status':
          return <>Status {renderSortIcon('status')}</>;
        case 'description':
          return <>Description {renderSortIcon('description')}</>;
        case 'amount':
          return <>Amount (TK) {renderSortIcon('amount')}</>;
        default:
          return null;
      }
    })();

    const isSortable = true;

    return (
      <th
        key={colKey}
        draggable
        onDragStart={(e) => handleDragStart(e, index)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, index)}
        onClick={() => handleSort(colKey as SortField)}
        className={`px-3 font-semibold select-none cursor-grab active:cursor-grabbing hover:bg-surface-container transition-colors ${
          isSortable ? 'cursor-pointer hover:text-on-surface' : ''
        }`}
        title="Drag to reorder column"
      >
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-xs text-secondary/50 cursor-grab">drag_indicator</span>
          <span>{innerContent}</span>
        </div>
      </th>
    );
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
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-on-surface">
              Accounts & Ledger
            </h1>
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

          {isAccountsOrAdmin && selectedBillIds.length > 0 && onBatchPayBills && (
            <button
              type="button"
              onClick={() => setIsBatchPayOpen(true)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">payments</span>
              <span>Pay Selected ({selectedBillIds.length})</span>
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

      {/* Support Staff Summary */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-4 shadow-xs">
        <div
          onClick={() => setIsSummaryVisible(!isSummaryVisible)}
          className="flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-teal-600 text-lg">
              account_balance_wallet
            </span>
            <h2 className="text-xs font-bold text-on-surface uppercase tracking-wider">
              Support Staff Payment History Summary
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-secondary font-medium">
              Total Staff: {supportAgentsList.length}
            </span>
            <span className="material-symbols-outlined text-secondary text-sm">
              {isSummaryVisible ? 'expand_less' : 'expand_more'}
            </span>
          </div>
        </div>

        {isSummaryVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-3 pt-3 border-t border-outline-variant/20"
          >
            {supportAgentsList.map((agent) => (
              <div
                key={agent.name}
                onClick={() => {
                  setSelectedSupportAgent(agent.name);
                  setCurrentPage(1);
                }}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${selectedSupportAgent === agent.name
                  ? 'bg-teal-50/80 border-teal-500 shadow-xs'
                  : 'bg-surface hover:bg-surface-container-low border-outline-variant/30'
                  }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-xs text-on-surface truncate max-w-[130px]" title={agent.name}>
                    {agent.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-bold">
                    {agent.totalCount} bills
                  </span>
                </div>

                <div className="flex flex-col gap-1 text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Total Paid:
                    </span>
                    <span className="font-data-mono font-bold text-emerald-800">
                      ৳{agent.paidAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-amber-700 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Unpaid:
                    </span>
                    <span className="font-data-mono font-semibold text-amber-800">
                      ৳{agent.unpaidAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-1 text-xs">
        <button
          type="button"
          onClick={() => {
            setStatusTab('ALL');
            setCurrentPage(1);
          }}
          className={`px-3 py-1.5 rounded-t-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${statusTab === 'ALL'
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
          className={`px-3 py-1.5 rounded-t-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${statusTab === 'UNPAID'
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
          className={`px-3 py-1.5 rounded-t-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${statusTab === 'PAID'
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
              placeholder="Search Support Staff, Manager, Ticket #, Subscriber ID, description..."
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

          <div className="flex items-center gap-2">
            <select
              value={selectedSupportAgent}
              onChange={(e) => {
                setSelectedSupportAgent(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-surface px-2.5 py-2 rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600 font-medium text-xs text-on-surface cursor-pointer w-full md:w-auto"
            >
              <option value="ALL">All Support Staff</option>
              {supportAgentsList.map((agent) => (
                <option key={agent.name} value={agent.name}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedManager}
              onChange={(e) => {
                setSelectedManager(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-surface px-2.5 py-2 rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600 font-medium text-xs text-on-surface cursor-pointer w-full md:w-auto"
            >
              <option value="ALL">All Managers (Approved By)</option>
              {managersList.map((mgr) => (
                <option key={mgr} value={mgr}>
                  Mgr: {mgr}
                </option>
              ))}
            </select>
          </div>

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

        {(selectedSupportAgent !== 'ALL' || selectedManager !== 'ALL' || search || startDate || endDate) && (
          <div className="px-3 py-2 bg-surface flex items-center justify-between text-xs border-b border-outline-variant/20">
            <span className="text-teal-700 font-medium">
              Filtered Result: <strong>{filteredBills.length}</strong> bills matching criteria (৳{totalAmountTk.toLocaleString()})
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedSupportAgent('ALL');
                setSelectedManager('ALL');
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

        {/* Table with Draggable Headers */}
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
                        eligibleUnpaidBills.every((b) => selectedBillIds.includes(Number(b.id)))
                      }
                      onChange={handleSelectAllUnpaid}
                      className="accent-emerald-600 rounded cursor-pointer"
                      title="Select all unpaid bills"
                      aria-label="Select all unpaid bills"
                    />
                  </th>
                )}

                {/* Render Draggable Columns */}
                {columns.map((col, index) => 
                  hiddenColumns[col.key] ? renderHeaderCell(col.key, index) : null
                )}

                <th className="px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-outline-variant/20">
              {paginatedBills.length === 0 ? (
                <tr>
                  <td colSpan={isAccountsOrAdmin ? columns.filter(c => hiddenColumns[c.key]).length + 2 : columns.filter(c => hiddenColumns[c.key]).length + 1} className="py-12 text-center text-secondary">
                    <div className="flex flex-col items-center justify-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                        <span className="material-symbols-outlined text-2xl text-slate-400">search_off</span>
                      </div>
                      <p className="text-sm font-semibold text-on-surface">No bills found</p>
                      <p className="mt-1 text-xs text-secondary">No bills match your current filter criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedBills.map((bill) => {
                  const isPaid = bill.status === 'Paid';
                  const billId = Number(bill.id);

                  const handleDetailsClick = () => {
                    const billWithManager = {
                      ...bill,
                      approved_by: bill.approved_by || 'Manager',
                    };
                    onViewDetails(billWithManager);
                  };

                  const handlePrintSlipClick = () => {
                    const slipBill = {
                      ...bill,
                      created_by: bill.approved_by || bill.created_by,
                    };
                    onPrintSlip(slipBill);
                  };

                  return (
                    <tr
                      key={bill.id}
                      className={`hover:bg-surface-container-low/60 transition-colors h-14 ${selectedBillIds.includes(billId) ? 'bg-emerald-50/50' : ''
                        }`}
                    >
                      {isAccountsOrAdmin && (
                        <td className="px-4">
                          {!isPaid ? (
                            <input
                              type="checkbox"
                              checked={selectedBillIds.includes(billId)}
                              onChange={() => handleToggleSelect(billId)}
                              className="accent-emerald-600 rounded cursor-pointer"
                              aria-label={`Select bill ${bill.id}`}
                            />
                          ) : (
                            <span className="material-symbols-outlined text-emerald-600 text-base" title="Bill is Paid">
                              task_alt
                            </span>
                          )}
                        </td>
                      )}

                      {/* Render columns content corresponding to header order */}
                      {columns.map((col) => 
                        hiddenColumns[col.key] ? renderCellContent(col.key, bill) : null
                      )}

                      <td className="px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
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
                            onClick={handlePrintSlipClick}
                            className="px-2.5 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-700 font-medium transition-colors flex items-center gap-1 cursor-pointer"
                            title="Generate Slip / Voucher"
                          >
                            <span className="material-symbols-outlined text-sm">print</span>
                            <span className="hidden sm:inline">Slip</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleDetailsClick}
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

        {/* {totalPages > 1 && (
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
        )} */}
        {totalPages > 1 && (
  <div className="flex items-center justify-between p-3 bg-surface-bright border-t border-outline-variant/20 text-xs">
    <span className="text-secondary">
      Page <span className="font-semibold text-foreground">{currentPage}</span> of {totalPages} <span className="text-secondary/70">({filteredBills.length} total)</span>
    </span>
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        className="px-3 py-1 rounded-full bg-outline-variant/10 text-secondary hover:bg-outline-variant/20 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer font-medium"
      >
        ← Prev
      </button>
      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        className="px-3 py-1 rounded-full bg-outline-variant/10 text-secondary hover:bg-outline-variant/20 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer font-medium"
      >
        Next →
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
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900/60 flex flex-col gap-1.5 transition-colors">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Bill ID:</span>
                <span className="font-mono font-bold text-teal-800 dark:text-teal-300">#{billToPay.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Ticket ID:</span>
                <span className="font-mono font-bold text-teal-800 dark:text-teal-300">{billToPay.ticket_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Subscriber / User ID:</span>
                <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{billToPay.user_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Support Staff:</span>
                <span className="font-semibold text-teal-700 dark:text-teal-400">{billToPay.created_by || 'Support Staff'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Authorized / Approved By:</span>
                <span className="font-semibold text-teal-800 dark:text-teal-300">{billToPay.approved_by || 'Manager'}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-emerald-200 dark:border-emerald-900/60">
                <span className="text-slate-800 dark:text-slate-200 font-bold">Disbursement Amount:</span>
                <span className="text-base font-mono font-bold text-emerald-800 dark:text-emerald-400">
                  ৳{Number(billToPay.amount).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-slate-500 dark:text-slate-400 uppercase text-[11px]">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="p-2.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 text-xs text-slate-800 dark:text-slate-100 cursor-pointer"
              >
                <option value="Cash">Cash at Counter</option>
                <option value="Bank Transfer">Bank Transfer / EFT</option>
                <option value="bKash / Nagad">Mobile Banking (bKash / Nagad)</option>
                <option value="Cheque">Bank Cheque</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-semibold text-slate-500 dark:text-slate-400 uppercase text-[11px]">
                Voucher / Payment Reference Note (Optional)
              </label>
              <input
                type="text"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="e.g. Voucher #V-9042, TxID 8X9J21..."
                className="p-2.5 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-500 text-xs placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
            </div>
          </div>
        )}
      </ConfirmModal>

      {/* Batch Payment Modal */}
      <ConfirmModal
        isOpen={isBatchPayOpen}
        title="Batch Disburse & Mark as Paid"
        confirmText={`Confirm Payment for ${selectedBillIds.length} Bills`}
        confirmVariant="primary"
        isLoading={isProcessing}
        onClose={() => setIsBatchPayOpen(false)}
        onConfirm={handleConfirmBatchPayment}
      >
        <div className="flex flex-col gap-3 text-xs">
          <p className="text-secondary">
            You are processing payment for <strong>{selectedBillIds.length}</strong> selected bills. All will be updated to status{' '}
            <strong className="text-emerald-700">PAID</strong> under Accounts Ledger.
          </p>

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-secondary uppercase text-[11px]">Payment Method</label>
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
            <label className="font-semibold text-secondary uppercase text-[11px]">Batch Reference / Voucher Note</label>
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