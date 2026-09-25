// 'use client';

// import React, { useState } from 'react';
// import { motion } from 'motion/react';
// import { Bill, User } from '@/lib/types';

// interface CreateBillViewProps {
//   currentUser: User;
//   recentBills: Bill[];
//   onBillCreated: (bill: Bill) => void;
//   onNavigateToBills: () => void;
//   onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
// }

// export default function CreateBillView({
//   currentUser,
//   recentBills,
//   onBillCreated,
//   onNavigateToBills,
//   onShowToast,
// }: CreateBillViewProps) {
//   const generate6Digit = () => String(Math.floor(100000 + Math.random() * 900000));

//   const [ticketId, setTicketId] = useState('454433');
//   const [userId, setUserId] = useState('');
//   const [amount, setAmount] = useState('');
//   const [date, setDate] = useState('2026-09-23');
//   const [description, setDescription] = useState('');

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);

//     const cleanTicketId = ticketId.trim();
//     const cleanUserId = userId.trim();

//     if (!cleanTicketId) {
//       setError('Ticket ID is required.');
//       return;
//     }

//     if (!/^\d{6}$/.test(cleanTicketId)) {
//       setError('Ticket ID must be exactly a 6-digit number (e.g. 454433).');
//       return;
//     }

//     if (!cleanUserId) {
//       setError('User / Subscriber ID is required.');
//       return;
//     }

//     if (!/^\d{6}$/.test(cleanUserId)) {
//       setError('User / Subscriber ID must be exactly a 6-digit number (e.g. 454433).');
//       return;
//     }

//     const numAmount = parseFloat(amount);
//     if (isNaN(numAmount) || numAmount <= 0) {
//       setError('Amount must be a positive number in TK.');
//       return;
//     }

//     if (!description.trim()) {
//       setError('Please provide a service description.');
//       return;
//     }

//     setLoading(true);

//     try {
//       const res = await fetch('/api/bills', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           ticket_id: cleanTicketId,
//           user_id: cleanUserId,
//           amount: numAmount,
//           description: description.trim(),
//           date,
//           created_by: currentUser.name || currentUser.user_id,
//         }),
//       });

//       const data = await res.json();
//       if (!res.ok) {
//         setError(data.error || 'Failed to create bill.');
//         setLoading(false);
//         return;
//       }

//       onBillCreated(data.bill);
//       if (onShowToast) {
//         onShowToast(`Bill #${data.bill.ticket_id} submitted for approval (Pending).`, 'success');
//       }

//       // Reset form with new auto 6-digit ticket ID
//       setTicketId(generate6Digit());
//       setUserId('');
//       setAmount('');
//       setDescription('');
//     } catch (err) {
//       console.error(err);
//       setError('Connection failure while submitting bill.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 10 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.2 }}
//       className="grid grid-cols-1 lg:grid-cols-3 gap-5 max-w-6xl w-full"
//     >
//       {/* Form Container */}
//       <div className="lg:col-span-2 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-xs flex flex-col gap-4">
//         <div>
//           <h2 className="text-xl font-bold text-on-surface">Create Service Bill</h2>
//           <p className="text-xs text-secondary mt-0.5">
//             Ticket ID and User ID are 6-digit numbers. Bills default to <strong className="text-amber-600 font-semibold">Pending</strong> status.
//           </p>
//         </div>

//         {error && (
//           <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
//             <span className="material-symbols-outlined text-sm">error</span>
//             <span>{error}</span>
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div className="flex flex-col gap-1">
//               <div className="flex items-center justify-between">
//                 <label className="text-xs font-semibold text-secondary uppercase">
//                   Ticket ID (6-digit) *
//                 </label>
//                 <button
//                   type="button"
//                   onClick={() => setTicketId(generate6Digit())}
//                   className="text-[11px] font-medium text-teal-700 hover:text-teal-800 flex items-center gap-0.5 cursor-pointer"
//                   title="Generate random 6-digit ticket number"
//                 >
//                   <span className="material-symbols-outlined text-xs">autorenew</span>
//                   <span>Random 6-digit</span>
//                 </button>
//               </div>
//               <div className="relative">
//                 <input
//                   type="text"
//                   inputMode="numeric"
//                   pattern="[0-9]{6}"
//                   maxLength={6}
//                   required
//                   placeholder="e.g. 454433"
//                   value={ticketId}
//                   onChange={(e) => setTicketId(e.target.value.replace(/\D/g, '').slice(0, 6))}
//                   className="w-full h-9 px-3 bg-surface rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600 font-data-mono text-xs tracking-wider"
//                 />
//                 <span className="absolute right-2.5 top-2.5 text-[10px] text-secondary font-data-mono">
//                   {ticketId.length}/6
//                 </span>
//               </div>
//             </div>

//             <div className="flex flex-col gap-1">
//               <label className="text-xs font-semibold text-secondary uppercase">
//                 Subscriber / User ID (6-digit) *
//               </label>
//               <div className="relative">
//                 <input
//                   type="text"
//                   inputMode="numeric"
//                   pattern="[0-9]{6}"
//                   maxLength={6}
//                   required
//                   placeholder="e.g. 454433"
//                   value={userId}
//                   onChange={(e) => setUserId(e.target.value.replace(/\D/g, '').slice(0, 6))}
//                   className="w-full h-9 px-3 bg-surface rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600 font-data-mono text-xs tracking-wider"
//                 />
//                 <span className="absolute right-2.5 top-2.5 text-[10px] text-secondary font-data-mono">
//                   {userId.length}/6
//                 </span>
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div className="flex flex-col gap-1">
//               <label className="text-xs font-semibold text-secondary uppercase">
//                 Amount (TK) *
//               </label>
//               <div className="relative">
//                 <span className="absolute left-3 top-2 text-xs font-bold text-teal-700">৳</span>
//                 <input
//                   type="number"
//                   step="0.01"
//                   min="1"
//                   required
//                   placeholder="0.00"
//                   value={amount}
//                   onChange={(e) => setAmount(e.target.value)}
//                   className="w-full h-9 pl-8 pr-3 bg-surface rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600 font-data-mono text-xs"
//                 />
//               </div>
//             </div>

//             <div className="flex flex-col gap-1">
//               <label className="text-xs font-semibold text-secondary uppercase">
//                 Date *
//               </label>
//               <input
//                 type="date"
//                 required
//                 value={date}
//                 onChange={(e) => setDate(e.target.value)}
//                 className="h-9 px-3 bg-surface rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600 font-data-mono text-xs cursor-pointer"
//               />
//             </div>
//           </div>

//           <div className="flex flex-col gap-1">
//             <label className="text-xs font-semibold text-secondary uppercase">
//               Description *
//             </label>
//             <textarea
//               rows={3}
//               required
//               placeholder="Provide clear service notes..."
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               className="p-3 bg-surface rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600 text-xs resize-none"
//             />
//           </div>

//           <div className="flex items-center justify-end gap-3 pt-2">
//             <button
//               type="button"
//               onClick={onNavigateToBills}
//               className="px-4 py-2 rounded-lg text-xs font-medium text-secondary hover:bg-surface-container transition-colors cursor-pointer"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs shadow-xs transition-colors disabled:opacity-60 flex items-center gap-1.5 cursor-pointer"
//             >
//               <span className="material-symbols-outlined text-sm">send</span>
//               <span>{loading ? 'Submitting...' : 'Submit Bill'}</span>
//             </button>
//           </div>
//         </form>
//       </div>

//       {/* Recent Submissions Sidebar */}
//       <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 shadow-xs flex flex-col justify-between">
//         <div>
//           <h3 className="text-sm font-bold text-on-surface mb-3">Recent Submissions</h3>
//           <div className="flex flex-col gap-2.5">
//             {recentBills.slice(0, 5).map((b) => (
//               <div
//                 key={b.id}
//                 className="p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/30 flex items-center justify-between text-xs"
//               >
//                 <div>
//                   <span className="font-data-mono font-bold text-teal-700 block">{b.ticket_id}</span>
//                   <span className="text-[11px] text-secondary truncate max-w-[140px] block">
//                     {b.user_id}
//                   </span>
//                 </div>
//                 <div className="text-right">
//                   <span className="font-bold text-on-surface block font-data-mono">
//                     ৳{b.amount.toLocaleString()}
//                   </span>
//                   <span className="text-[10px] font-semibold text-amber-700 uppercase">
//                     {b.status}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         <button
//           type="button"
//           onClick={onNavigateToBills}
//           className="w-full mt-4 py-2 text-center text-xs font-medium text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
//         >
//           View All Bills →
//         </button>
//       </div>
//     </motion.div>
//   );
// }



'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Bill, User } from '@/lib/types';

interface CreateBillViewProps {
  currentUser: User;
  recentBills: Bill[];
  onBillCreated: (bill: Bill) => void;
  onNavigateToBills: () => void;
  onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export default function CreateBillView({
  currentUser,
  recentBills,
  onBillCreated,
  onNavigateToBills,
  onShowToast,
}: CreateBillViewProps) {
  // ম্যানুয়াল এন্ট্রির জন্য ticketId খালি রাখা হয়েছে
  const [ticketId, setTicketId] = useState('');
  const [userId, setUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('2026-09-23');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanTicketId = ticketId.trim();
    const cleanUserId = userId.trim();

    if (!cleanTicketId) {
      setError('Ticket ID is required.');
      return;
    }

    if (!/^\d{6}$/.test(cleanTicketId)) {
      setError('Ticket ID must be exactly a 6-digit number (e.g. 454433).');
      return;
    }

    if (!cleanUserId) {
      setError('User / Subscriber ID is required.');
      return;
    }

    if (!/^\d{6}$/.test(cleanUserId)) {
      setError('User / Subscriber ID must be exactly a 6-digit number (e.g. 454433).');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Amount must be a positive number in TK.');
      return;
    }

    if (!description.trim()) {
      setError('Please provide a service description.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_id: cleanTicketId,
          user_id: cleanUserId,
          amount: numAmount,
          description: description.trim(),
          date,
          created_by: currentUser.name || currentUser.user_id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create bill.');
        setLoading(false);
        return;
      }

      onBillCreated(data.bill);
      if (onShowToast) {
        onShowToast(`Bill #${data.bill.ticket_id} submitted for approval (Pending).`, 'success');
      }

      // বিল সাবমিট হওয়ার পর ফর্ম রিসেট
      setTicketId('');
      setUserId('');
      setAmount('');
      setDescription('');
    } catch (err) {
      console.error(err);
      setError('Connection failure while submitting bill.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-5 max-w-6xl w-full"
    >
      {/* Form Container */}
      <div className="lg:col-span-2 bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 shadow-xs flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Create Service Bill</h2>
          <p className="text-xs text-secondary mt-0.5">
            Ticket ID and User ID are 6-digit numbers. Bills default to <strong className="text-amber-600 font-semibold">Pending</strong> status.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-secondary uppercase">
                Ticket ID (6-digit) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  placeholder="e.g. 454433"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full h-9 px-3 bg-surface rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600 font-data-mono text-xs tracking-wider"
                />
                <span className="absolute right-2.5 top-2.5 text-[10px] text-secondary font-data-mono">
                  {ticketId.length}/6
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-secondary uppercase">
                Subscriber / User ID (6-digit) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  placeholder="e.g. 454433"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full h-9 px-3 bg-surface rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600 font-data-mono text-xs tracking-wider"
                />
                <span className="absolute right-2.5 top-2.5 text-[10px] text-secondary font-data-mono">
                  {userId.length}/6
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-secondary uppercase">
                Amount (TK) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-teal-700">৳</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full h-9 pl-8 pr-3 bg-surface rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600 font-data-mono text-xs"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-secondary uppercase">
                Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-9 px-3 bg-surface rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600 font-data-mono text-xs cursor-pointer"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-secondary uppercase">
              Description *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Provide clear service notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="p-3 bg-surface rounded-lg border border-outline-variant/40 focus:outline-none focus:border-teal-600 text-xs resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onNavigateToBills}
              className="px-4 py-2 rounded-lg text-xs font-medium text-secondary hover:bg-surface-container transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs shadow-xs transition-colors disabled:opacity-60 flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">send</span>
              <span>{loading ? 'Submitting...' : 'Submit Bill'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Recent Submissions Sidebar */}
      <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/30 shadow-xs flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-on-surface mb-3">Recent Submissions</h3>
          <div className="flex flex-col gap-2.5">
            {recentBills.slice(0, 5).map((b) => (
              <div
                key={b.id}
                className="p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/30 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-data-mono font-bold text-teal-700 block">{b.ticket_id}</span>
                  <span className="text-[11px] text-secondary truncate max-w-[140px] block">
                    {b.user_id}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-on-surface block font-data-mono">
                    ৳{b.amount.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-semibold text-amber-700 uppercase">
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onNavigateToBills}
          className="w-full mt-4 py-2 text-center text-xs font-medium text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
        >
          View All Bills →
        </button>
      </div>
    </motion.div>
  );
}