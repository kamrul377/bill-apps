// 'use client';
// import React, { useState, useMemo } from 'react';
// import { motion } from 'motion/react';
// import { Bill, User } from '@/lib/types';
// import ConfirmModal from './ConfirmModal';

// interface PendingApprovalViewProps {
//   bills: Bill[];
//   currentUser: User;

//   // IMPORTANT:
//   // Use unique Bill ID instead of Ticket ID
//   onUpdateStatus: (
//     billId: number,
//     status: 'Approved' | 'Rejected',
//     reason?: string
//   ) => Promise<void>;

//   // IMPORTANT:
//   // Batch approve also uses unique Bill IDs
//   onBatchApprove: (billIds: number[]) => Promise<void>;

//   onShowToast?: (
//     msg: string,
//     type?: 'success' | 'error' | 'info'
//   ) => void;
// }

// export default function PendingApprovalView({
//   bills,
//   currentUser,
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
//   const [isBatchConfirmOpen, setIsBatchConfirmOpen] =
//     useState(false);

//   const [isProcessing, setIsProcessing] = useState(false);

//   // Search & Support Agent Filter
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedSupportAgent, setSelectedSupportAgent] =
//     useState('ALL');

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

//   // Filter bills
//   const filteredPendingBills = useMemo(() => {
//     return pendingBills.filter((b) => {
//       // Support agent filter
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

//       // Search
//       if (searchQuery.trim()) {
//         const q = searchQuery.toLowerCase().trim();

//         const ticketMatch =
//           b.ticket_id.toLowerCase().includes(q);

//         const userMatch =
//           b.user_id.toLowerCase().includes(q);

//         const descMatch =
//           b.description.toLowerCase().includes(q);

//         const supportMatch =
//           (b.created_by || '')
//             .toLowerCase()
//             .includes(q);

//         return (
//           ticketMatch ||
//           userMatch ||
//           descMatch ||
//           supportMatch
//         );
//       }

//       return true;
//     });
//   }, [
//     pendingBills,
//     selectedSupportAgent,
//     searchQuery,
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

//   // Toggle using UNIQUE BILL ID
//   const handleToggleSelect = (billId: number) => {
//     setSelectedBillIds((prev) =>
//       prev.includes(billId)
//         ? prev.filter((id) => id !== billId)
//         : [...prev, billId]
//     );
//   };

//   // Single Approve / Reject
//   const handleConfirmSingleAction = async () => {
//     if (!activeBillForAction || !actionType) {
//       return;
//     }

//     setIsProcessing(true);

//     try {
//       // IMPORTANT:
//       // Send bill.id, NOT ticket_id
//       await onUpdateStatus(
//         Number(activeBillForAction.id),
//         actionType,
//         actionType === 'Rejected'
//           ? rejectReason
//           : undefined
//       );

//       if (onShowToast) {
//         onShowToast(
//           `Bill ${activeBillForAction.ticket_id} marked as ${actionType}.`,
//           actionType === 'Approved'
//             ? 'success'
//             : 'error'
//         );
//       }

//       // Remove using unique bill.id
//       setSelectedBillIds((prev) =>
//         prev.filter(
//           (id) =>
//             id !== Number(activeBillForAction.id)
//         )
//       );

//       setActiveBillForAction(null);
//       setActionType(null);
//       setRejectReason('');
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

//       if (onShowToast) {
//         onShowToast(
//           `${selectedBillIds.length} bills approved successfully.`,
//           'success'
//         );
//       }

//       setSelectedBillIds([]);
//       setIsBatchConfirmOpen(false);
//     } finally {
//       setIsProcessing(false);
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

//       {/* Search & Filter */}
//       <div className="bg-surface-container-lowest p-3.5 sm:p-4 rounded-xl border border-outline-variant/30 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between text-xs">
//         <div className="flex flex-col sm:flex-row gap-2.5 flex-1">
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
//               placeholder="Search Support Agent Name, Ticket #, Subscriber ID..."
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

//           <div className="flex items-center gap-2">
//             <span className="text-secondary font-medium whitespace-nowrap hidden sm:inline">
//               Support Staff:
//             </span>

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
//                   {agent.name} ({agent.count} bills · ৳
//                   {agent.totalTk.toLocaleString()})
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {(selectedSupportAgent !== 'ALL' ||
//           searchQuery) && (
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
//                   setSearchQuery('');
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
//           <table className="w-full text-left text-xs min-w-[700px]">
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

//                 <th className="px-3 font-semibold">
//                   Ticket ID
//                 </th>

//                 <th className="px-3 font-semibold">
//                   User ID
//                 </th>

//                 <th className="px-3 font-semibold">
//                   Support Agent
//                 </th>

//                 <th className="px-3 font-semibold">
//                   Date
//                 </th>

//                 <th className="px-3 font-semibold">
//                   Description
//                 </th>

//                 <th className="px-3 font-semibold">
//                   Amount
//                 </th>

//                 <th className="px-4 font-semibold text-right">
//                   Actions
//                 </th>
//               </tr>
//             </thead>

//             <tbody className="divide-y divide-outline-variant/20">
//               {filteredPendingBills.length === 0 ? (
//                 <tr>
//                   <td
//                     colSpan={8}
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
//                           : 'No pending bills match the selected support agent or search query.'}
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

//                     {/* <td className="px-3 font-data-mono font-bold text-teal-700">
//                       {bill.ticket_id}
//                     </td> */}

//                     <td className="px-4 font-data-mono font-bold text-teal-700">
//                       <a
//                         href={`http://139.162.2.178/tms/dotproject/index.php?m=ticketsmith&a=view&ticket=${bill.ticket_id}`}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="cursor-pointer hover:text-teal-900 hover:underline"
//                       >
//                         #{bill.ticket_id}
//                       </a>
//                     </td>


//                     <td className="px-3 font-data-mono text-secondary">
//                       {bill.user_id}
//                     </td>

//                     <td className="px-3">
//                       <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 font-medium text-[11px] border border-teal-200">
//                         <span className="material-symbols-outlined text-xs">
//                           person
//                         </span>

//                         <span className="truncate max-w-[130px]">
//                           {bill.created_by ||
//                             'Support Staff'}
//                         </span>
//                       </span>
//                     </td>

//                     <td className="px-3 text-secondary font-data-mono">
//                       {bill.date}
//                     </td>

//                     <td className="px-3 my-5 max-w-xs truncate text-on-surface">
//                       {bill.description}
//                     </td>

//                     <td className="px-3 font-data-mono font-bold text-on-surface">
//                       ৳{bill.amount.toLocaleString()}
//                     </td>

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
//             ? 'Confirm Approval'
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

// ====================2nd======================


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
    reason?: string
  ) => Promise<void>;

  onBatchApprove: (billIds: number[]) => Promise<void>;

  onShowToast?: (
    msg: string,
    type?: 'success' | 'error' | 'info'
  ) => void;
}

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
  const [isBatchConfirmOpen, setIsBatchConfirmOpen] =
    useState(false);

  const [isProcessing, setIsProcessing] = useState(false);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupportAgent, setSelectedSupportAgent] =
    useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

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

  // Filter only Pending bills
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

  // Filter bills logic
  const filteredPendingBills = useMemo(() => {
    return pendingBills.filter((b) => {
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
  }, [
    pendingBills,
    selectedSupportAgent,
    selectedCategory,
    searchQuery,
    categories,
  ]);

  const filteredTotalTk = useMemo(
    () =>
      filteredPendingBills.reduce(
        (acc, b) => acc + (Number(b.amount) || 0),
        0
      ),
    [filteredPendingBills]
  );

  // Select / unselect all using UNIQUE BILL ID
  const handleSelectAll = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.checked) {
      setSelectedBillIds(
        filteredPendingBills.map((b) => Number(b.id))
      );
    } else {
      setSelectedBillIds([]);
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

  // Single Approve / Reject
  const handleConfirmSingleAction = async () => {
    if (!activeBillForAction || !actionType) {
      return;
    }

    setIsProcessing(true);

    try {
      await onUpdateStatus(
        Number(activeBillForAction.id),
        actionType,
        actionType === 'Rejected'
          ? rejectReason
          : undefined
      );

      if (onShowToast) {
        onShowToast(
          `Bill ${activeBillForAction.ticket_id} marked as ${actionType}.`,
          actionType === 'Approved'
            ? 'success'
            : 'error'
        );
      }

      setSelectedBillIds((prev) =>
        prev.filter(
          (id) =>
            id !== Number(activeBillForAction.id)
        )
      );

      setActiveBillForAction(null);
      setActionType(null);
      setRejectReason('');
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

      if (onShowToast) {
        onShowToast(
          `${selectedBillIds.length} bills approved successfully.`,
          'success'
        );
      }

      setSelectedBillIds([]);
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
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              placeholder="Search Ticket, User, Agent, Category..."
              className="w-full pl-8 pr-8 py-2 bg-surface text-on-surface rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600 font-medium placeholder:text-secondary/70"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() =>
                  setSearchQuery('')
                }
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
              onChange={(e) => setSelectedCategory(e.target.value)}
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
              onChange={(e) =>
                setSelectedSupportAgent(
                  e.target.value
                )
              }
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
          searchQuery) && (
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
                }}
                className="text-secondary hover:text-rose-600 hover:bg-rose-50 px-2 py-1 rounded transition-colors cursor-pointer font-medium"
              >
                Reset
              </button>
            </div>
          )}
      </div>

      {/* Queue Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead>
              <tr className="bg-surface-container-low text-secondary uppercase tracking-wider h-10">
                <th className="px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      filteredPendingBills.length > 0 &&
                      filteredPendingBills.every(
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

                <th className="px-3 font-semibold">
                  Ticket ID
                </th>

                <th className="px-3 font-semibold">
                  User ID
                </th>

                <th className="px-3 font-semibold">
                  Category
                </th>

                <th className="px-3 font-semibold">
                  Support Agent
                </th>

                <th className="px-3 font-semibold">
                  Date
                </th>

                <th className="px-3 font-semibold">
                  Description
                </th>

                <th className="px-3 font-semibold">
                  Amount
                </th>

                <th className="px-4 font-semibold text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-outline-variant/20">
              {filteredPendingBills.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
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
                filteredPendingBills.map((bill) => (
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

                        <span className="truncate max-w-[130px]">
                          {bill.created_by ||
                            'Support Staff'}
                        </span>
                      </span>
                    </td>

                    <td className="px-3 text-secondary font-data-mono">
                      {bill.date}
                    </td>

                    <td className="px-3 my-5 max-w-xs truncate text-on-surface">
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
                            setActiveBillForAction(
                              bill
                            );
                            setActionType(
                              'Approved'
                            );
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
            ? 'Confirm Approval'
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