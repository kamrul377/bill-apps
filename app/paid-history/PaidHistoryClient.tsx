// 'use client'

// import { useState } from 'react'
// import ProtectedRoute from '@/components/ProtectedRoute'
// import { motion, AnimatePresence } from 'motion/react'
// import {
//   ResponsiveContainer,
//   AreaChart,
//   Area,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
// } from 'recharts'
// import {
//   Users,
//   Search,
//   CalendarDays,
//   Wallet,
//   ChartNoAxesCombined,
//   Activity,
//   TrendingUp,
//   ReceiptText,
//   CreditCard,
//   Filter,
//   RotateCcw,
//   CheckCircle2,
//   UserRound,
//   Clock3,
// } from 'lucide-react'

// interface PaidHistoryClientProps {
//   initialBills: any[]
//   chartData: any[]
//   supportTodayList: { name: string; amount: number }[]
//   supportUsers: any[]
// }

// const panelClass =
//   'rounded-[20px] border border-slate-200 bg-slate-50/60 p-5 shadow-sm'

// const inputClass =
//   'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 font-semibold'

// const money = (value: number) =>
//   `৳ ${value.toLocaleString('en-IN', {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   })}`

// export default function PaidHistoryClient({
//   initialBills,
//   chartData,
//   supportTodayList,
//   supportUsers,
// }: PaidHistoryClientProps) {
//   const [searchTerm, setSearchTerm] = useState('')
//   const [methodFilter, setMethodFilter] = useState('All')
//   const [selectedSupport, setSelectedSupport] = useState('All')
//   const [selectedDate, setSelectedDate] = useState('')
//   const [chartType, setChartType] = useState<'area' | 'bar'>('area')

//   const filteredBills = initialBills.filter((bill) => {
//     const search = searchTerm.toLowerCase()

//     const matchesSearch =
//       String(bill.ticket_id ?? '').toLowerCase().includes(search) ||
//       String(bill.user_id ?? '').toLowerCase().includes(search) ||
//       String(bill.description ?? '').toLowerCase().includes(search) ||
//       String(bill.created_by ?? '').toLowerCase().includes(search)

//     const matchesMethod =
//       methodFilter === 'All' || bill.payment_method === methodFilter

//     const matchesSupport =
//       selectedSupport === 'All' ||
//       String(bill.created_by ?? '').toLowerCase() ===
//         selectedSupport.toLowerCase()

//     let billDateOnly = ''

//     if (bill.paid_at) {
//       billDateOnly = new Date(bill.paid_at).toISOString().split('T')[0]
//     } else if (bill.date) {
//       billDateOnly = new Date(bill.date).toISOString().split('T')[0]
//     }

//     const matchesDate = !selectedDate || billDateOnly === selectedDate

//     return matchesSearch && matchesMethod && matchesSupport && matchesDate
//   })

//   const filteredTotal = filteredBills.reduce(
//     (acc, bill) => acc + (Number(bill.amount) || 0),
//     0
//   )

//   const resetFilters = () => {
//     setSearchTerm('')
//     setMethodFilter('All')
//     setSelectedSupport('All')
//     setSelectedDate('')
//   }

//   const hasActiveFilters =
//     searchTerm !== '' ||
//     methodFilter !== 'All' ||
//     selectedSupport !== 'All' ||
//     selectedDate !== ''

//   return (
//     <ProtectedRoute>
//       <div className="space-y-6">
        
//         {/* Support Staff & Graph Section */}
//         <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          
//           {/* Support Staff Breakdown */}
//           <div className={`${panelClass} flex flex-col`}>
//             <div className="flex items-start justify-between gap-3 mb-4">
//               <div>
//                 <span className="text-[10px] font-black uppercase tracking-widest text-teal-700 bg-teal-100 px-2 py-0.5 rounded-md">
//                   Performance
//                 </span>
//                 <h3 className="mt-2 text-base font-black text-slate-900">
//                   Support Staff Collections
//                 </h3>
//                 <p className="text-xs text-slate-500 font-medium">
//                   Today's total paid collections per staff
//                 </p>
//               </div>
//               <div className="rounded-xl bg-teal-100 p-2.5 text-teal-800">
//                 <Users size={18} />
//               </div>
//             </div>

//             <div className="mt-2 max-h-64 flex-1 space-y-2.5 overflow-y-auto pr-1">
//               {supportTodayList.length > 0 ? (
//                 supportTodayList
//                   .slice()
//                   .sort((a, b) => b.amount - a.amount)
//                   .map((item, index) => {
//                     const maxAmount = Math.max(
//                       ...supportTodayList.map((staff) => staff.amount),
//                       1
//                     )
//                     const percentage = (item.amount / maxAmount) * 100

//                     return (
//                       <div
//                         key={item.name}
//                         className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs"
//                       >
//                         <div className="flex items-center justify-between gap-3">
//                           <div className="flex min-w-0 items-center gap-2.5">
//                             <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
//                               {item.name.substring(0, 2).toUpperCase()}
//                             </div>
//                             <span className="truncate text-xs font-bold text-slate-800">
//                               {item.name}
//                             </span>
//                           </div>
//                           <span className="shrink-0 text-xs font-black text-teal-700">
//                             {money(item.amount)}
//                           </span>
//                         </div>
//                         <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-100">
//                           <div
//                             className="h-full rounded-full bg-teal-600"
//                             style={{ width: `${percentage}%` }}
//                           />
//                         </div>
//                       </div>
//                     )
//                   })
//               ) : (
//                 <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-4 text-center">
//                   <UserRound size={22} className="text-slate-400 mb-1" />
//                   <p className="text-xs font-bold text-slate-700">No collections recorded today</p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Date-wise Chart */}
//           <div className={`${panelClass} min-w-0 lg:col-span-2 flex flex-col justify-between`}>
//             <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center mb-4">
//               <div>
//                 <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
//                   Analytics
//                 </span>
//                 <h3 className="mt-2 text-base font-black text-slate-900 flex items-center gap-2">
//                   <ChartNoAxesCombined size={18} className="text-indigo-600" />
//                   Day-Wise Paid Bill Trend
//                 </h3>
//               </div>

//               <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
//                 <button
//                   type="button"
//                   onClick={() => setChartType('area')}
//                   className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
//                     chartType === 'area'
//                       ? 'bg-slate-900 text-white shadow-xs'
//                       : 'text-slate-600 hover:text-slate-900'
//                   }`}
//                 >
//                   Area Chart
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setChartType('bar')}
//                   className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
//                     chartType === 'bar'
//                       ? 'bg-slate-900 text-white shadow-xs'
//                       : 'text-slate-600 hover:text-slate-900'
//                   }`}
//                 >
//                   Bar Chart
//                 </button>
//               </div>
//             </div>

//             <div className="h-56 min-w-0 sm:h-60">
//               {chartData.length > 0 ? (
//                 <ResponsiveContainer width="100%" height="100%">
//                   {chartType === 'area' ? (
//                     <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
//                       <defs>
//                         <linearGradient id="paidAreaGrad" x1="0" y1="0" x2="0" y2="1">
//                           <stop offset="0%" stopColor="#0d9488" stopOpacity={0.35} />
//                           <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
//                         </linearGradient>
//                       </defs>
//                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
//                       <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
//                       <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
//                       <Tooltip
//                         contentStyle={{
//                           backgroundColor: '#0F172A',
//                           borderRadius: '12px',
//                           color: '#fff',
//                           fontSize: '12px',
//                           border: 'none',
//                         }}
//                         formatter={(val: any) => [money(Number(val) || 0), 'Paid Total']}
//                       />
//                       <Area type="monotone" dataKey="amount" stroke="#0d9488" strokeWidth={2.5} fill="url(#paidAreaGrad)" />
//                     </AreaChart>
//                   ) : (
//                     <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
//                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
//                       <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
//                       <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
//                       <Tooltip
//                         contentStyle={{
//                           backgroundColor: '#0F172A',
//                           borderRadius: '12px',
//                           color: '#fff',
//                           fontSize: '12px',
//                           border: 'none',
//                         }}
//                         formatter={(val: any) => [money(Number(val) || 0), 'Paid Total']}
//                       />
//                       <Bar dataKey="amount" fill="#0d9488" radius={[4, 4, 0, 0]} />
//                     </BarChart>
//                   )}
//                 </ResponsiveContainer>
//               ) : (
//                 <div className="flex h-full items-center justify-center text-xs text-slate-400 font-semibold">
//                   No graphical metrics available yet.
//                 </div>
//               )}
//             </div>
//           </div>

//         </div>

//         {/* Filters Toolbar */}
//         <div className={panelClass}>
//           <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
//             <h3 className="flex items-center gap-2 text-sm font-black text-slate-900">
//               <Filter size={16} className="text-teal-600" />
//               Filter Paid Records
//             </h3>
//             {hasActiveFilters && (
//               <button
//                 type="button"
//                 onClick={resetFilters}
//                 className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700"
//               >
//                 <RotateCcw size={13} />
//                 Reset all filters
//               </button>
//             )}
//           </div>

//           <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
//             <div>
//               <label className="mb-1.5 block text-[11px] font-bold text-slate-600">
//                 Search Ticket / User ID
//               </label>
//               <div className="relative">
//                 <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
//                 <input
//                   type="text"
//                   placeholder="Search..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className={`${inputClass} pl-10`}
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="mb-1.5 block text-[11px] font-bold text-slate-600">
//                 Support Staff
//               </label>
//               <select
//                 value={selectedSupport}
//                 onChange={(e) => setSelectedSupport(e.target.value)}
//                 className={inputClass}
//               >
//                 <option value="All">All Support Staff</option>
//                 {supportUsers.map((user) => (
//                   <option key={user.id} value={user.name}>
//                     {user.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="mb-1.5 block text-[11px] font-bold text-slate-600">
//                 Paid Date
//               </label>
//               <input
//                 type="date"
//                 value={selectedDate}
//                 onChange={(e) => setSelectedDate(e.target.value)}
//                 className={inputClass}
//               />
//             </div>

//             <div>
//               <label className="mb-1.5 block text-[11px] font-bold text-slate-600">
//                 Payment Method
//               </label>
//               <select
//                 value={methodFilter}
//                 onChange={(e) => setMethodFilter(e.target.value)}
//                 className={inputClass}
//               >
//                 <option value="All">All Methods</option>
//                 <option value="Cash">Cash</option>
//                 <option value="bKash">bKash</option>
//                 <option value="Nagad">Nagad</option>
//                 <option value="Bank">Bank</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Transactions Table */}
//         <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-xs">
//           <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
//             <div>
//               <h3 className="text-base font-black text-slate-900">
//                 Paid Bills Ledger ({filteredBills.length})
//               </h3>
//               <p className="text-xs text-slate-500 font-medium">Showing successful verified transactions</p>
//             </div>

//             <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-right">
//               <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 block">Filtered Total Paid</span>
//               <span className="text-sm font-black text-teal-700">{money(filteredTotal)}</span>
//             </div>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[1050px] border-collapse text-left">
//               <thead>
//                 <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-black uppercase tracking-wider text-slate-600">
//                   <th className="px-5 py-3.5">Ticket / User ID</th>
//                   <th className="px-5 py-3.5">Category</th>
//                   <th className="px-5 py-3.5">Description</th>
//                   <th className="px-5 py-3.5">Amount</th>
//                   <th className="px-5 py-3.5">Created By</th>
//                   <th className="px-5 py-3.5">Method</th>
//                   <th className="px-5 py-3.5">Paid Date</th>
//                   <th className="px-5 py-3.5">Settled By</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100 text-xs">
//                 {filteredBills.length > 0 ? (
//                   filteredBills.map((bill, index) => (
//                     <tr key={bill.id ?? index} className="hover:bg-slate-50/70 transition-colors">
//                       <td className="px-5 py-3.5">
//                         <div className="font-extrabold text-slate-900">{bill.ticket_id || '—'}</div>
//                         <div className="text-[11px] text-slate-500 font-medium">Sub: {bill.user_id || '—'}</div>
//                       </td>
//                       <td className="px-5 py-3.5">
//                         <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700">
//                           {bill.category_name || 'General'}
//                         </span>
//                       </td>
//                       <td className="max-w-[220px] truncate px-5 py-3.5 text-slate-600 font-medium" title={bill.description}>
//                         {bill.description || '—'}
//                       </td>
//                       <td className="px-5 py-3.5">
//                         <span className="font-black text-teal-700">{money(Number(bill.amount) || 0)}</span>
//                       </td>
//                       <td className="px-5 py-3.5 font-bold text-slate-700">
//                         {bill.created_by || 'Support'}
//                       </td>
//                       <td className="px-5 py-3.5">
//                         <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-700">
//                           {bill.payment_method || 'Cash'}
//                         </span>
//                       </td>
//                       <td className="px-5 py-3.5 text-slate-600 font-medium">
//                         {bill.paid_at ? new Date(bill.paid_at).toLocaleString() : bill.date ? new Date(bill.date).toLocaleDateString() : '—'}
//                       </td>
//                       <td className="px-5 py-3.5 font-bold text-slate-800">
//                         {bill.paid_by || 'Accounts Staff'}
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan={8} className="px-5 py-12 text-center text-slate-400 font-bold">
//                       No matching paid bills record found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3 text-xs text-slate-500 font-semibold">
//             <span>Showing {filteredBills.length} of {initialBills.length} records</span>
//             <span className="inline-flex items-center gap-1 text-teal-700">
//               <CheckCircle2 size={13} /> Verified Paid Logs
//             </span>
//           </div>
//         </div>

//       </div>
//     </ProtectedRoute>
//   )
// }



// 'use client'

// import { useState } from 'react'
// import ProtectedRoute from '@/components/ProtectedRoute'
// import { motion, AnimatePresence } from 'motion/react'
// import {
//   ResponsiveContainer,
//   AreaChart,
//   Area,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
// } from 'recharts'
// import {
//   Users,
//   Search,
//   CalendarDays,
//   Wallet,
//   ChartNoAxesCombined,
//   Activity,
//   TrendingUp,
//   ReceiptText,
//   CreditCard,
//   Filter,
//   RotateCcw,
//   CheckCircle2,
//   UserRound,
//   Clock3,
// } from 'lucide-react'

// interface PaidHistoryClientProps {
//   initialBills: any[]
//   chartData: any[]
//   supportTodayList: { name: string; amount: number }[]
//   supportUsers: any[]
// }

// const panelClass =
//   'rounded-[22px] border border-slate-200/80 bg-white p-6 shadow-xs'

// const inputClass =
//   'w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/10 font-semibold'

// const money = (value: number) =>
//   `৳ ${value.toLocaleString('en-IN', {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   })}`

// export default function PaidHistoryClient({
//   initialBills,
//   chartData,
//   supportTodayList,
//   supportUsers,
// }: PaidHistoryClientProps) {
//   const [searchTerm, setSearchTerm] = useState('')
//   const [methodFilter, setMethodFilter] = useState('All')
//   const [selectedSupport, setSelectedSupport] = useState('All')
//   const [selectedDate, setSelectedDate] = useState('')
//   const [chartType, setChartType] = useState<'area' | 'bar'>('area')

//   const filteredBills = initialBills.filter((bill) => {
//     const search = searchTerm.toLowerCase()

//     const matchesSearch =
//       String(bill.ticket_id ?? '').toLowerCase().includes(search) ||
//       String(bill.user_id ?? '').toLowerCase().includes(search) ||
//       String(bill.description ?? '').toLowerCase().includes(search) ||
//       String(bill.created_by ?? '').toLowerCase().includes(search)

//     const matchesMethod =
//       methodFilter === 'All' || bill.payment_method === methodFilter

//     const matchesSupport =
//       selectedSupport === 'All' ||
//       String(bill.created_by ?? '').toLowerCase() ===
//         selectedSupport.toLowerCase()

//     let billDateOnly = ''

//     if (bill.paid_at) {
//       billDateOnly = new Date(bill.paid_at).toISOString().split('T')[0]
//     } else if (bill.date) {
//       billDateOnly = new Date(bill.date).toISOString().split('T')[0]
//     }

//     const matchesDate = !selectedDate || billDateOnly === selectedDate

//     return matchesSearch && matchesMethod && matchesSupport && matchesDate
//   })

//   const filteredTotal = filteredBills.reduce(
//     (acc, bill) => acc + (Number(bill.amount) || 0),
//     0
//   )

//   const resetFilters = () => {
//     setSearchTerm('')
//     setMethodFilter('All')
//     setSelectedSupport('All')
//     setSelectedDate('')
//   }

//   const hasActiveFilters =
//     searchTerm !== '' ||
//     methodFilter !== 'All' ||
//     selectedSupport !== 'All' ||
//     selectedDate !== ''

//   return (
//     <ProtectedRoute>
//       <div className="space-y-6 antialiased" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif' }}>
        
//         {/* Support Staff & Graph Section */}
//         <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
//           {/* Support Staff Breakdown */}
//           <div className={`${panelClass} flex flex-col justify-between`}>
//             <div>
//               <div className="flex items-start justify-between gap-3 mb-4">
//                 <div>
//                   <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest bg-teal-50 text-teal-700 border border-teal-200/60">
//                     <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
//                     Performance
//                   </span>
//                   <h3 className="mt-3 text-base font-black tracking-tight text-slate-900">
//                     Support Staff Collections
//                   </h3>
//                   <p className="text-xs text-slate-500 font-normal mt-0.5">
//                     Today's total paid collections per staff
//                   </p>
//                 </div>
//                 <div className="rounded-2xl bg-teal-50 p-3 text-teal-700 border border-teal-100">
//                   <Users size={18} />
//                 </div>
//               </div>
//             </div>

//             <div className="mt-4 max-h-64 flex-1 space-y-3 overflow-y-auto pr-1">
//               {supportTodayList.length > 0 ? (
//                 supportTodayList
//                   .slice()
//                   .sort((a, b) => b.amount - a.amount)
//                   .map((item, index) => {
//                     const maxAmount = Math.max(
//                       ...supportTodayList.map((staff) => staff.amount),
//                       1
//                     )
//                     const percentage = (item.amount / maxAmount) * 100

//                     return (
//                       <div
//                         key={item.name}
//                         className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 transition-all hover:bg-slate-50"
//                       >
//                         <div className="flex items-center justify-between gap-3">
//                           <div className="flex min-w-0 items-center gap-3">
//                             <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white shadow-xs">
//                               {item.name.substring(0, 2).toUpperCase()}
//                             </div>
//                             <span className="truncate text-xs font-bold text-slate-800">
//                               {item.name}
//                             </span>
//                           </div>
//                           <span className="shrink-0 text-xs font-black tracking-tight text-teal-700 tabular-nums">
//                             {money(item.amount)}
//                           </span>
//                         </div>
//                         <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200/60">
//                           <div
//                             className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 transition-all duration-500"
//                             style={{ width: `${percentage}%` }}
//                           />
//                         </div>
//                       </div>
//                     )
//                   })
//               ) : (
//                 <div className="flex h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/30 p-4 text-center">
//                   <UserRound size={24} className="text-slate-400 mb-2" />
//                   <p className="text-xs font-bold text-slate-700">No collections recorded today</p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Date-wise Chart */}
//           <div className={`${panelClass} min-w-0 lg:col-span-2 flex flex-col justify-between`}>
//             <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center mb-4">
//               <div>
//                 <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest bg-indigo-50 text-indigo-700 border border-indigo-200/60">
//                   <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
//                   Analytics
//                 </span>
//                 <h3 className="mt-3 text-base font-black tracking-tight text-slate-900 flex items-center gap-2">
//                   <ChartNoAxesCombined size={18} className="text-indigo-600" />
//                   Day-Wise Paid Bill Trend
//                 </h3>
//               </div>

//               {/* Modern Segmented Control for Charts */}
//               <div className="inline-flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200/60">
//                 <button
//                   type="button"
//                   onClick={() => setChartType('area')}
//                   className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold tracking-wide transition-all ${
//                     chartType === 'area'
//                       ? 'bg-white text-slate-900 shadow-xs font-black'
//                       : 'text-slate-500 hover:text-slate-900'
//                   }`}
//                 >
//                   <Activity size={14} className={chartType === 'area' ? 'text-teal-600' : ''} />
//                   Area Chart
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setChartType('bar')}
//                   className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold tracking-wide transition-all ${
//                     chartType === 'bar'
//                       ? 'bg-white text-slate-900 shadow-xs font-black'
//                       : 'text-slate-500 hover:text-slate-900'
//                   }`}
//                 >
//                   <ChartNoAxesCombined size={14} className={chartType === 'bar' ? 'text-teal-600' : ''} />
//                   Bar Chart
//                 </button>
//               </div>
//             </div>

//             <div className="h-60 min-w-0 sm:h-64 mt-2">
//               {chartData.length > 0 ? (
//                 <ResponsiveContainer width="100%" height="100%">
//                   {chartType === 'area' ? (
//                     <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
//                       <defs>
//                         <linearGradient id="paidAreaGrad" x1="0" y1="0" x2="0" y2="1">
//                           <stop offset="0%" stopColor="#0d9488" stopOpacity={0.3} />
//                           <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
//                         </linearGradient>
//                       </defs>
//                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
//                       <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
//                       <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
//                       <Tooltip
//                         contentStyle={{
//                           backgroundColor: '#0F172A',
//                           borderRadius: '14px',
//                           color: '#fff',
//                           fontSize: '12px',
//                           border: 'none',
//                           boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
//                         }}
//                         formatter={(val: any) => [money(Number(val) || 0), 'Paid Total']}
//                       />
//                       <Area type="monotone" dataKey="amount" stroke="#0d9488" strokeWidth={3} fill="url(#paidAreaGrad)" />
//                     </AreaChart>
//                   ) : (
//                     <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
//                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
//                       <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
//                       <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
//                       <Tooltip
//                         contentStyle={{
//                           backgroundColor: '#0F172A',
//                           borderRadius: '14px',
//                           color: '#fff',
//                           fontSize: '12px',
//                           border: 'none',
//                           boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
//                         }}
//                         formatter={(val: any) => [money(Number(val) || 0), 'Paid Total']}
//                       />
//                       <Bar dataKey="amount" fill="#0d9488" radius={[6, 6, 0, 0]} />
//                     </BarChart>
//                   )}
//                 </ResponsiveContainer>
//               ) : (
//                 <div className="flex h-full items-center justify-center text-xs text-slate-400 font-medium">
//                   No graphical metrics available yet.
//                 </div>
//               )}
//             </div>
//           </div>

//         </div>

//         {/* Filters Toolbar */}
//         <div className={panelClass}>
//           <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
//             <h3 className="flex items-center gap-2 text-sm font-black tracking-tight text-slate-900">
//               <Filter size={16} className="text-teal-600" />
//               Filter Paid Records
//             </h3>
//             {hasActiveFilters && (
//               <button
//                 type="button"
//                 onClick={resetFilters}
//                 className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
//               >
//                 <RotateCcw size={13} />
//                 Reset all filters
//               </button>
//             )}
//           </div>

//           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
//             <div>
//               <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
//                 Search Ticket / User ID
//               </label>
//               <div className="relative">
//                 <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
//                 <input
//                   type="text"
//                   placeholder="Search records..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className={`${inputClass} pl-10`}
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
//                 Support Staff
//               </label>
//               <select
//                 value={selectedSupport}
//                 onChange={(e) => setSelectedSupport(e.target.value)}
//                 className={inputClass}
//               >
//                 <option value="All">All Support Staff</option>
//                 {supportUsers.map((user) => (
//                   <option key={user.id} value={user.name}>
//                     {user.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
//                 Paid Date
//               </label>
//               <input
//                 type="date"
//                 value={selectedDate}
//                 onChange={(e) => setSelectedDate(e.target.value)}
//                 className={inputClass}
//               />
//             </div>

//             <div>
//               <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
//                 Payment Method
//               </label>
//               <select
//                 value={methodFilter}
//                 onChange={(e) => setMethodFilter(e.target.value)}
//                 className={inputClass}
//               >
//                 <option value="All">All Methods</option>
//                 <option value="Cash">Cash</option>
//                 <option value="bKash">bKash</option>
//                 <option value="Nagad">Nagad</option>
//                 <option value="Bank">Bank</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Transactions Table */}
//         <div className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-xs">
//           <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center">
//             <div>
//               <h3 className="text-base font-black tracking-tight text-slate-900">
//                 Paid Bills Ledger ({filteredBills.length})
//               </h3>
//               <p className="text-xs text-slate-500 font-normal mt-0.5">Showing successful verified transactions</p>
//             </div>

//             <div className="rounded-2xl border border-teal-200/80 bg-teal-50/50 px-4 py-2.5 text-right">
//               <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-800 block">Filtered Total Paid</span>
//               <span className="text-sm sm:text-base font-black tracking-tight text-teal-700 tabular-nums">{money(filteredTotal)}</span>
//             </div>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[1050px] border-collapse text-left">
//               <thead>
//                 <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-black uppercase tracking-wider text-slate-500">
//                   <th className="px-6 py-4">Ticket / User ID</th>
//                   <th className="px-6 py-4">Category</th>
//                   <th className="px-6 py-4">Description</th>
//                   <th className="px-6 py-4">Amount</th>
//                   <th className="px-6 py-4">Created By</th>
//                   <th className="px-6 py-4">Method</th>
//                   <th className="px-6 py-4">Paid Date</th>
//                   <th className="px-6 py-4">Settled By</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100 text-xs font-medium">
//                 {filteredBills.length > 0 ? (
//                   filteredBills.map((bill, index) => (
//                     <tr key={bill.id ?? index} className="hover:bg-slate-50/60 transition-colors">
//                       <td className="px-6 py-4">
//                         <div className="font-extrabold text-slate-900">{bill.ticket_id || '—'}</div>
//                         <div className="text-[11px] text-slate-400 font-normal mt-0.5">Sub: {bill.user_id || '—'}</div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className="inline-flex rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">
//                           {bill.category_name || 'General'}
//                         </span>
//                       </td>
//                       <td className="max-w-[220px] truncate px-6 py-4 text-slate-600" title={bill.description}>
//                         {bill.description || '—'}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className="font-black text-teal-700 tabular-nums">{money(Number(bill.amount) || 0)}</span>
//                       </td>
//                       <td className="px-6 py-4 font-bold text-slate-700 whitespace-nowrap">
//                         {bill.created_by || 'Support'}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-700">
//                           {bill.payment_method || 'Cash'}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
//                         {bill.paid_at ? new Date(bill.paid_at).toLocaleString() : bill.date ? new Date(bill.date).toLocaleDateString() : '—'}
//                       </td>
//                       <td className="px-6 py-4 font-bold text-slate-800 whitespace-nowrap">
//                         {bill.paid_by || 'Accounts Staff'}
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan={8} className="px-6 py-14 text-center text-slate-400 font-semibold">
//                       No matching paid bills record found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-3.5 text-xs text-slate-500 font-semibold gap-2">
//             <span>Showing {filteredBills.length} of {initialBills.length} records</span>
//             <span className="inline-flex items-center gap-1 text-teal-700 font-bold">
//               <CheckCircle2 size={13} /> Verified Paid Logs
//             </span>
//           </div>
//         </div>

//       </div>
//     </ProtectedRoute>
//   )
// }












// ===============3rd====================












// 'use client'

// import { useState } from 'react'
// import ProtectedRoute from '@/components/ProtectedRoute'
// import { motion, AnimatePresence } from 'motion/react'
// import {
//   ResponsiveContainer,
//   AreaChart,
//   Area,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
// } from 'recharts'
// import {
//   Users,
//   Search,
//   CalendarDays,
//   Wallet,
//   ChartNoAxesCombined,
//   Activity,
//   TrendingUp,
//   ReceiptText,
//   CreditCard,
//   Filter,
//   RotateCcw,
//   CheckCircle2,
//   UserRound,
//   Clock3,
// } from 'lucide-react'

// interface PaidHistoryClientProps {
//   initialBills: any[]
//   chartData: any[]
//   supportTodayList: { name: string; amount: number }[]
//   supportUsers: any[]
// }

// const panelClass =
//   'rounded-[22px] border border-slate-200/80 bg-white p-6 shadow-xs'

// const inputClass =
//   'w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/10 font-semibold'

// const money = (value: number) =>
//   `৳ ${value.toLocaleString('en-IN', {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   })}`

// export default function PaidHistoryClient({
//   initialBills,
//   chartData,
//   supportTodayList,
//   supportUsers,
// }: PaidHistoryClientProps) {
//   const [searchTerm, setSearchTerm] = useState('')
//   const [methodFilter, setMethodFilter] = useState('All')
//   const [selectedSupport, setSelectedSupport] = useState('All')
//   const [selectedDate, setSelectedDate] = useState('')
//   const [chartType, setChartType] = useState<'area' | 'bar'>('area')

//   const filteredBills = initialBills.filter((bill) => {
//     const search = searchTerm.toLowerCase()

//     const matchesSearch =
//       String(bill.ticket_id ?? '').toLowerCase().includes(search) ||
//       String(bill.user_id ?? '').toLowerCase().includes(search) ||
//       String(bill.description ?? '').toLowerCase().includes(search) ||
//       String(bill.created_by ?? '').toLowerCase().includes(search)

//     const matchesMethod =
//       methodFilter === 'All' || bill.payment_method === methodFilter

//     const matchesSupport =
//       selectedSupport === 'All' ||
//       String(bill.created_by ?? '').toLowerCase() ===
//         selectedSupport.toLowerCase()

//     let billDateOnly = ''

//     if (bill.paid_at) {
//       billDateOnly = new Date(bill.paid_at).toISOString().split('T')[0]
//     } else if (bill.date) {
//       billDateOnly = new Date(bill.date).toISOString().split('T')[0]
//     }

//     const matchesDate = !selectedDate || billDateOnly === selectedDate

//     return matchesSearch && matchesMethod && matchesSupport && matchesDate
//   })

//   const filteredTotal = filteredBills.reduce(
//     (acc, bill) => acc + (Number(bill.amount) || 0),
//     0
//   )

//   const resetFilters = () => {
//     setSearchTerm('')
//     setMethodFilter('All')
//     setSelectedSupport('All')
//     setSelectedDate('')
//   }

//   const hasActiveFilters =
//     searchTerm !== '' ||
//     methodFilter !== 'All' ||
//     selectedSupport !== 'All' ||
//     selectedDate !== ''

//   return (
//     <ProtectedRoute>
//       <div className="space-y-6 antialiased" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif' }}>
        
//         {/* Support Staff & Graph Section */}
//         <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
//           {/* Support Staff Breakdown */}
//           <div className={`${panelClass} flex flex-col justify-between`}>
//             <div>
//               <div className="flex items-start justify-between gap-3 mb-4">
//                 <div>
//                   <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest bg-teal-50 text-teal-700 border border-teal-200/60">
//                     <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
//                     Performance
//                   </span>
//                   <h3 className="mt-3 text-base font-black tracking-tight text-slate-900">
//                     Support Staff Collections
//                   </h3>
//                   <p className="text-xs text-slate-500 font-normal mt-0.5">
//                     Today's total paid collections per staff
//                   </p>
//                 </div>
//                 <div className="rounded-2xl bg-teal-50 p-3 text-teal-700 border border-teal-100">
//                   <Users size={18} />
//                 </div>
//               </div>
//             </div>

//             <div className="mt-4 max-h-64 flex-1 space-y-3 overflow-y-auto pr-1">
//               {supportTodayList.length > 0 ? (
//                 supportTodayList
//                   .slice()
//                   .sort((a, b) => b.amount - a.amount)
//                   .map((item, index) => {
//                     const maxAmount = Math.max(
//                       ...supportTodayList.map((staff) => staff.amount),
//                       1
//                     )
//                     const percentage = (item.amount / maxAmount) * 100

//                     return (
//                       <div
//                         key={item.name}
//                         className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 transition-all hover:bg-slate-50"
//                       >
//                         <div className="flex items-center justify-between gap-3">
//                           <div className="flex min-w-0 items-center gap-3">
//                             <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white shadow-xs">
//                               {item.name.substring(0, 2).toUpperCase()}
//                             </div>
//                             <span className="truncate text-xs font-bold text-slate-800">
//                               {item.name}
//                             </span>
//                           </div>
//                           <span className="shrink-0 text-xs font-black tracking-tight text-teal-700 tabular-nums">
//                             {money(item.amount)}
//                           </span>
//                         </div>
//                         <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200/60">
//                           <div
//                             className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 transition-all duration-500"
//                             style={{ width: `${percentage}%` }}
//                           />
//                         </div>
//                       </div>
//                     )
//                   })
//               ) : (
//                 <div className="flex h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/30 p-4 text-center">
//                   <UserRound size={24} className="text-slate-400 mb-2" />
//                   <p className="text-xs font-bold text-slate-700">No collections recorded today</p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Date-wise Chart */}
//           <div className={`${panelClass} min-w-0 lg:col-span-2 flex flex-col justify-between`}>
//             <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center mb-4">
//               <div>
//                 <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest bg-indigo-50 text-indigo-700 border border-indigo-200/60">
//                   <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
//                   Analytics
//                 </span>
//                 <h3 className="mt-3 text-base font-black tracking-tight text-slate-900 flex items-center gap-2">
//                   <ChartNoAxesCombined size={18} className="text-indigo-600" />
//                   Day-Wise Paid Bill Trend
//                 </h3>
//               </div>

//               {/* Modern Segmented Control for Charts */}
//               <div className="inline-flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200/60">
//                 <button
//                   type="button"
//                   onClick={() => setChartType('area')}
//                   className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold tracking-wide transition-all ${
//                     chartType === 'area'
//                       ? 'bg-white text-slate-900 shadow-xs font-black'
//                       : 'text-slate-500 hover:text-slate-900'
//                   }`}
//                 >
//                   <Activity size={14} className={chartType === 'area' ? 'text-teal-600' : ''} />
//                   Area Chart
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setChartType('bar')}
//                   className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold tracking-wide transition-all ${
//                     chartType === 'bar'
//                       ? 'bg-white text-slate-900 shadow-xs font-black'
//                       : 'text-slate-500 hover:text-slate-900'
//                   }`}
//                 >
//                   <ChartNoAxesCombined size={14} className={chartType === 'bar' ? 'text-teal-600' : ''} />
//                   Bar Chart
//                 </button>
//               </div>
//             </div>

//             <div className="h-60 min-w-0 sm:h-64 mt-2">
//               {chartData.length > 0 ? (
//                 <ResponsiveContainer width="100%" height="100%">
//                   {chartType === 'area' ? (
//                     <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
//                       <defs>
//                         <linearGradient id="paidAreaGrad" x1="0" y1="0" x2="0" y2="1">
//                           <stop offset="0%" stopColor="#0d9488" stopOpacity={0.3} />
//                           <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
//                         </linearGradient>
//                       </defs>
//                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
//                       <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
//                       <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
//                       <Tooltip
//                         contentStyle={{
//                           backgroundColor: '#0F172A',
//                           borderRadius: '14px',
//                           color: '#fff',
//                           fontSize: '12px',
//                           border: 'none',
//                           boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
//                         }}
//                         formatter={(val: any) => [money(Number(val) || 0), 'Paid Total']}
//                       />
//                       <Area type="monotone" dataKey="amount" stroke="#0d9488" strokeWidth={3} fill="url(#paidAreaGrad)" />
//                     </AreaChart>
//                   ) : (
//                     <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
//                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
//                       <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
//                       <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
//                       <Tooltip
//                         contentStyle={{
//                           backgroundColor: '#0F172A',
//                           borderRadius: '14px',
//                           color: '#fff',
//                           fontSize: '12px',
//                           border: 'none',
//                           boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
//                         }}
//                         formatter={(val: any) => [money(Number(val) || 0), 'Paid Total']}
//                       />
//                       <Bar dataKey="amount" fill="#0d9488" radius={[6, 6, 0, 0]} />
//                     </BarChart>
//                   )}
//                 </ResponsiveContainer>
//               ) : (
//                 <div className="flex h-full items-center justify-center text-xs text-slate-400 font-medium">
//                   No graphical metrics available yet.
//                 </div>
//               )}
//             </div>
//           </div>

//         </div>

//         {/* Filters Toolbar */}
//         <div className={panelClass}>
//           <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
//             <h3 className="flex items-center gap-2 text-sm font-black tracking-tight text-slate-900">
//               <Filter size={16} className="text-teal-600" />
//               Filter Paid Records
//             </h3>
//             {hasActiveFilters && (
//               <button
//                 type="button"
//                 onClick={resetFilters}
//                 className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
//               >
//                 <RotateCcw size={13} />
//                 Reset all filters
//               </button>
//             )}
//           </div>

//           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
//             <div>
//               <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
//                 Search Ticket / User ID
//               </label>
//               <div className="relative">
//                 <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
//                 <input
//                   type="text"
//                   placeholder="Search records..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className={`${inputClass} pl-10`}
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
//                 Support Staff
//               </label>
//               <select
//                 value={selectedSupport}
//                 onChange={(e) => setSelectedSupport(e.target.value)}
//                 className={inputClass}
//               >
//                 <option value="All">All Support Staff</option>
//                 {supportUsers.map((user) => (
//                   <option key={user.id ?? user.name} value={user.name}>
//                     {user.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
//                 Paid Date
//               </label>
//               <input
//                 type="date"
//                 value={selectedDate}
//                 onChange={(e) => setSelectedDate(e.target.value)}
//                 className={inputClass}
//               />
//             </div>

//             <div>
//               <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
//                 Payment Method
//               </label>
//               <select
//                 value={methodFilter}
//                 onChange={(e) => setMethodFilter(e.target.value)}
//                 className={inputClass}
//               >
//                 <option value="All">All Methods</option>
//                 <option value="Cash">Cash</option>
//                 <option value="bKash">bKash</option>
//                 <option value="Nagad">Nagad</option>
//                 <option value="Bank">Bank</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Transactions Table */}
//         <div className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-xs">
//           <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center">
//             <div>
//               <h3 className="text-base font-black tracking-tight text-slate-900">
//                 Paid Bills Ledger ({filteredBills.length})
//               </h3>
//               <p className="text-xs text-slate-500 font-normal mt-0.5">Showing successful verified transactions</p>
//             </div>

//             <div className="rounded-2xl border border-teal-200/80 bg-teal-50/50 px-4 py-2.5 text-right">
//               <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-800 block">Filtered Total Paid</span>
//               <span className="text-sm sm:text-base font-black tracking-tight text-teal-700 tabular-nums">{money(filteredTotal)}</span>
//             </div>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[1050px] border-collapse text-left">
//               <thead>
//                 <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-black uppercase tracking-wider text-slate-500">
//                   <th className="px-6 py-4">Ticket / User ID</th>
//                   <th className="px-6 py-4">Category</th>
//                   <th className="px-6 py-4">Description</th>
//                   <th className="px-6 py-4">Amount</th>
//                   <th className="px-6 py-4">Created By</th>
//                   <th className="px-6 py-4">Method</th>
//                   <th className="px-6 py-4">Paid Date</th>
//                   <th className="px-6 py-4">Settled By</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100 text-xs font-medium">
//                 {filteredBills.length > 0 ? (
//                   filteredBills.map((bill, index) => (
//                     <tr key={bill.id ?? index} className="hover:bg-slate-50/60 transition-colors">
//                       <td className="px-6 py-4">
//                         <div className="font-extrabold text-slate-900">{bill.ticket_id || '—'}</div>
//                         <div className="text-[11px] text-slate-400 font-normal mt-0.5">Sub: {bill.user_id || '—'}</div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className="inline-flex rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">
//                           {bill.category_name || 'General'}
//                         </span>
//                       </td>
//                       <td className="max-w-[220px] truncate px-6 py-4 text-slate-600" title={bill.description}>
//                         {bill.description || '—'}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className="font-black text-teal-700 tabular-nums">{money(Number(bill.amount) || 0)}</span>
//                       </td>
//                       <td className="px-6 py-4 font-bold text-slate-700 whitespace-nowrap">
//                         {bill.created_by || 'Support'}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-700">
//                           {bill.payment_method || 'Cash'}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
//                         {bill.paid_at ? new Date(bill.paid_at).toLocaleString() : bill.date ? new Date(bill.date).toLocaleDateString() : '—'}
//                       </td>
//                       <td className="px-6 py-4 font-bold text-slate-800 whitespace-nowrap">
//                         {bill.paid_by || 'Accounts Staff'}
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan={8} className="px-6 py-14 text-center text-slate-400 font-semibold">
//                       No matching paid bills record found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-3.5 text-xs text-slate-500 font-semibold gap-2">
//             <span>Showing {filteredBills.length} of {initialBills.length} records</span>
//             <span className="inline-flex items-center gap-1 text-teal-700 font-bold">
//               <CheckCircle2 size={13} /> Verified Paid Logs
//             </span>
//           </div>
//         </div>

//       </div>
//     </ProtectedRoute>
//   )
// }










// 'use client'

// import { useState } from 'react'
// import ProtectedRoute from '@/components/ProtectedRoute'
// import {
//   ResponsiveContainer,
//   AreaChart,
//   Area,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
// } from 'recharts'
// import {
//   Users,
//   Search,
//   ChartNoAxesCombined,
//   Activity,
//   ReceiptText,
//   Filter,
//   RotateCcw,
//   CheckCircle2,
//   UserRound,
// } from 'lucide-react'

// interface ChartDataType {
//   date: string
//   amount: number
// }

// interface PaidHistoryClientProps {
//   initialBills: any[]
//   chartData: ChartDataType[]
//   supportTodayList: { name: string; amount: number }[]
//   supportUsers: any[]
// }

// const panelClass =
//   'rounded-[22px] border border-slate-200/80 bg-white p-6 shadow-xs'

// const inputClass =
//   'w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/10 font-semibold'

// const money = (value: number) =>
//   `৳ ${value.toLocaleString('en-IN', {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   })}`

// export default function PaidHistoryClient({
//   initialBills,
//   chartData,
//   supportTodayList,
//   supportUsers,
// }: PaidHistoryClientProps) {
//   const [searchTerm, setSearchTerm] = useState('')
//   const [methodFilter, setMethodFilter] = useState('All')
//   const [selectedSupport, setSelectedSupport] = useState('All')
//   const [selectedDate, setSelectedDate] = useState('')
//   const [chartType, setChartType] = useState<'area' | 'bar'>('area')

//   const filteredBills = initialBills.filter((bill) => {
//     const search = searchTerm.toLowerCase()

//     const matchesSearch =
//       String(bill.ticket_id ?? '').toLowerCase().includes(search) ||
//       String(bill.user_id ?? '').toLowerCase().includes(search) ||
//       String(bill.description ?? '').toLowerCase().includes(search) ||
//       String(bill.created_by ?? '').toLowerCase().includes(search)

//     const matchesMethod =
//       methodFilter === 'All' || bill.payment_method === methodFilter

//     const matchesSupport =
//       selectedSupport === 'All' ||
//       String(bill.created_by ?? '').toLowerCase() ===
//         selectedSupport.toLowerCase()

//     let billDateOnly = ''

//     if (bill.paid_at) {
//       billDateOnly = new Date(bill.paid_at).toISOString().split('T')[0]
//     } else if (bill.date) {
//       billDateOnly = new Date(bill.date).toISOString().split('T')[0]
//     }

//     const matchesDate = !selectedDate || billDateOnly === selectedDate

//     return matchesSearch && matchesMethod && matchesSupport && matchesDate
//   })

//   const filteredTotal = filteredBills.reduce(
//     (acc, bill) => acc + (Number(bill.amount) || 0),
//     0
//   )

//   const resetFilters = () => {
//     setSearchTerm('')
//     setMethodFilter('All')
//     setSelectedSupport('All')
//     setSelectedDate('')
//   }

//   const hasActiveFilters =
//     searchTerm !== '' ||
//     methodFilter !== 'All' ||
//     selectedSupport !== 'All' ||
//     selectedDate !== ''

//   return (
//     <ProtectedRoute>
//       <div className="space-y-6 antialiased" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif' }}>
        
//         {/* Support Staff & Graph Section */}
//         <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
//           {/* Support Staff Breakdown */}
//           <div className={`${panelClass} flex flex-col justify-between`}>
//             <div>
//               <div className="flex items-start justify-between gap-3 mb-4">
//                 <div>
//                   <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest bg-teal-50 text-teal-700 border border-teal-200/60">
//                     <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
//                     Performance
//                   </span>
//                   <h3 className="mt-3 text-base font-black tracking-tight text-slate-900">
//                     Support Staff Collections
//                   </h3>
//                   <p className="text-xs text-slate-500 font-normal mt-0.5">
//                     Today's total paid collections per staff
//                   </p>
//                 </div>
//                 <div className="rounded-2xl bg-teal-50 p-3 text-teal-700 border border-teal-100">
//                   <Users size={18} />
//                 </div>
//               </div>
//             </div>

//             <div className="mt-4 max-h-64 flex-1 space-y-3 overflow-y-auto pr-1">
//               {supportTodayList.length > 0 ? (
//                 supportTodayList
//                   .slice()
//                   .sort((a, b) => b.amount - a.amount)
//                   .map((item) => {
//                     const maxAmount = Math.max(
//                       ...supportTodayList.map((staff) => staff.amount),
//                       1
//                     )
//                     const percentage = (item.amount / maxAmount) * 100

//                     return (
//                       <div
//                         key={item.name}
//                         className="rounded-2xl border border-slate-100 bg-slate-50/50 p-3.5 transition-all hover:bg-slate-50"
//                       >
//                         <div className="flex items-center justify-between gap-3">
//                           <div className="flex min-w-0 items-center gap-3">
//                             <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white shadow-xs">
//                               {item.name.substring(0, 2).toUpperCase()}
//                             </div>
//                             <span className="truncate text-xs font-bold text-slate-800">
//                               {item.name}
//                             </span>
//                           </div>
//                           <span className="shrink-0 text-xs font-black tracking-tight text-teal-700 tabular-nums">
//                             {money(item.amount)}
//                           </span>
//                         </div>
//                         <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200/60">
//                           <div
//                             className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 transition-all duration-500"
//                             style={{ width: `${percentage}%` }}
//                           />
//                         </div>
//                       </div>
//                     )
//                   })
//               ) : (
//                 <div className="flex h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/30 p-4 text-center">
//                   <UserRound size={24} className="text-slate-400 mb-2" />
//                   <p className="text-xs font-bold text-slate-700">No collections recorded today</p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Date-wise Chart */}
//           <div className={`${panelClass} min-w-0 lg:col-span-2 flex flex-col justify-between`}>
//             <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center mb-4">
//               <div>
//                 <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest bg-indigo-50 text-indigo-700 border border-indigo-200/60">
//                   <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
//                   Analytics
//                 </span>
//                 <h3 className="mt-3 text-base font-black tracking-tight text-slate-900 flex items-center gap-2">
//                   <ChartNoAxesCombined size={18} className="text-indigo-600" />
//                   Day-Wise Paid Bill Trend
//                 </h3>
//               </div>

//               {/* Modern Segmented Control for Charts */}
//               <div className="inline-flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200/60">
//                 <button
//                   type="button"
//                   onClick={() => setChartType('area')}
//                   className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold tracking-wide transition-all ${
//                     chartType === 'area'
//                       ? 'bg-white text-slate-900 shadow-xs font-black'
//                       : 'text-slate-500 hover:text-slate-900'
//                   }`}
//                 >
//                   <Activity size={14} className={chartType === 'area' ? 'text-teal-600' : ''} />
//                   Area Chart
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setChartType('bar')}
//                   className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold tracking-wide transition-all ${
//                     chartType === 'bar'
//                       ? 'bg-white text-slate-900 shadow-xs font-black'
//                       : 'text-slate-500 hover:text-slate-900'
//                   }`}
//                 >
//                   <ChartNoAxesCombined size={14} className={chartType === 'bar' ? 'text-teal-600' : ''} />
//                   Bar Chart
//                 </button>
//               </div>
//             </div>

//             <div className="h-60 min-w-0 sm:h-64 mt-2">
//               {chartData.length > 0 ? (
//                 <ResponsiveContainer width="100%" height="100%">
//                   {chartType === 'area' ? (
//                     <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
//                       <defs>
//                         <linearGradient id="paidAreaGrad" x1="0" y1="0" x2="0" y2="1">
//                           <stop offset="0%" stopColor="#0d9488" stopOpacity={0.3} />
//                           <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
//                         </linearGradient>
//                       </defs>
//                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
//                       <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
//                       <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
//                       <Tooltip
//                         contentStyle={{
//                           backgroundColor: '#0F172A',
//                           borderRadius: '14px',
//                           color: '#fff',
//                           fontSize: '12px',
//                           border: 'none',
//                           boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
//                         }}
//                         formatter={(val: any) => [money(Number(val) || 0), 'Paid Total']}
//                       />
//                       <Area type="monotone" dataKey="amount" stroke="#0d9488" strokeWidth={3} fill="url(#paidAreaGrad)" />
//                     </AreaChart>
//                   ) : (
//                     <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
//                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
//                       <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
//                       <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
//                       <Tooltip
//                         contentStyle={{
//                           backgroundColor: '#0F172A',
//                           borderRadius: '14px',
//                           color: '#fff',
//                           fontSize: '12px',
//                           border: 'none',
//                           boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
//                         }}
//                         formatter={(val: any) => [money(Number(val) || 0), 'Paid Total']}
//                       />
//                       <Bar dataKey="amount" fill="#0d9488" radius={[6, 6, 0, 0]} />
//                     </BarChart>
//                   )}
//                 </ResponsiveContainer>
//               ) : (
//                 <div className="flex h-full items-center justify-center text-xs text-slate-400 font-medium">
//                   No graphical metrics available yet.
//                 </div>
//               )}
//             </div>
//           </div>

//         </div>

//         {/* Filters Toolbar */}
//         <div className={panelClass}>
//           <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
//             <h3 className="flex items-center gap-2 text-sm font-black tracking-tight text-slate-900">
//               <Filter size={16} className="text-teal-600" />
//               Filter Paid Records
//             </h3>
//             {hasActiveFilters && (
//               <button
//                 type="button"
//                 onClick={resetFilters}
//                 className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
//               >
//                 <RotateCcw size={13} />
//                 Reset all filters
//               </button>
//             )}
//           </div>

//           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
//             <div>
//               <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
//                 Search Ticket / User ID
//               </label>
//               <div className="relative">
//                 <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
//                 <input
//                   type="text"
//                   placeholder="Search records..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className={`${inputClass} pl-10`}
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
//                 Support Staff
//               </label>
//               <select
//                 value={selectedSupport}
//                 onChange={(e) => setSelectedSupport(e.target.value)}
//                 className={inputClass}
//               >
//                 <option value="All">All Support Staff</option>
//                 {supportUsers.map((user) => (
//                   <option key={user.id ?? user.name} value={user.name}>
//                     {user.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
//                 Paid Date
//               </label>
//               <input
//                 type="date"
//                 value={selectedDate}
//                 onChange={(e) => setSelectedDate(e.target.value)}
//                 className={inputClass}
//               />
//             </div>

//             <div>
//               <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">
//                 Payment Method
//               </label>
//               <select
//                 value={methodFilter}
//                 onChange={(e) => setMethodFilter(e.target.value)}
//                 className={inputClass}
//               >
//                 <option value="All">All Methods</option>
//                 <option value="Cash">Cash</option>
//                 <option value="bKash">bKash</option>
//                 <option value="Nagad">Nagad</option>
//                 <option value="Bank">Bank</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Transactions Table */}
//         <div className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-xs">
//           <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center">
//             <div>
//               <h3 className="text-base font-black tracking-tight text-slate-900">
//                 Paid Bills Ledger ({filteredBills.length})
//               </h3>
//               <p className="text-xs text-slate-500 font-normal mt-0.5">Showing successful verified transactions</p>
//             </div>

//             <div className="rounded-2xl border border-teal-200/80 bg-teal-50/50 px-4 py-2.5 text-right">
//               <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-800 block">Filtered Total Paid</span>
//               <span className="text-sm sm:text-base font-black tracking-tight text-teal-700 tabular-nums">{money(filteredTotal)}</span>
//             </div>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[1050px] border-collapse text-left">
//               <thead>
//                 <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-black uppercase tracking-wider text-slate-500">
//                   <th className="px-6 py-4">Ticket / User ID</th>
//                   <th className="px-6 py-4">Category</th>
//                   <th className="px-6 py-4">Description</th>
//                   <th className="px-6 py-4">Amount</th>
//                   <th className="px-6 py-4">Created By</th>
//                   <th className="px-6 py-4">Method</th>
//                   <th className="px-6 py-4">Paid Date</th>
//                   <th className="px-6 py-4">Settled By</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100 text-xs font-medium">
//                 {filteredBills.length > 0 ? (
//                   filteredBills.map((bill, index) => (
//                     <tr key={bill.id ?? index} className="hover:bg-slate-50/60 transition-colors">
//                       <td className="px-6 py-4">
//                         <div className="font-extrabold text-slate-900">{bill.ticket_id || '—'}</div>
//                         <div className="text-[11px] text-slate-400 font-normal mt-0.5">Sub: {bill.user_id || '—'}</div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className="inline-flex rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">
//                           {bill.category_name || 'General'}
//                         </span>
//                       </td>
//                       <td className="max-w-[220px] truncate px-6 py-4 text-slate-600" title={bill.description}>
//                         {bill.description || '—'}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className="font-black text-teal-700 tabular-nums">{money(Number(bill.amount) || 0)}</span>
//                       </td>
//                       <td className="px-6 py-4 font-bold text-slate-700 whitespace-nowrap">
//                         {bill.created_by || 'Support'}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-700">
//                           {bill.payment_method || 'Cash'}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
//                         {bill.paid_at ? new Date(bill.paid_at).toLocaleString() : bill.date ? new Date(bill.date).toLocaleDateString() : '—'}
//                       </td>
//                       <td className="px-6 py-4 font-bold text-slate-800 whitespace-nowrap">
//                         {bill.paid_by || 'Accounts Staff'}
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan={8} className="px-6 py-14 text-center text-slate-400 font-semibold">
//                       No matching paid bills record found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-3.5 text-xs text-slate-500 font-semibold gap-2">
//             <span>Showing {filteredBills.length} of {initialBills.length} records</span>
//             <span className="inline-flex items-center gap-1 text-teal-700 font-bold">
//               <CheckCircle2 size={13} /> Verified Paid Logs
//             </span>
//           </div>
//         </div>

//       </div>
//     </ProtectedRoute>
//   )
// }





















'use client'

import { useState } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import {
  Users,
  Search,
  ChartNoAxesCombined,
  Activity,
  Filter,
  RotateCcw,
  CheckCircle2,
  UserRound,
} from 'lucide-react'

interface ChartDataType {
  date: string
  amount: number
}

interface PaidHistoryClientProps {
  initialBills: any[]
  chartData: ChartDataType[]
  supportTodayList: { name: string; amount: number }[]
  supportUsers: any[]
}

const panelClass =
  'rounded-[22px] border border-outline-variant bg-surface-container-lowest p-6 shadow-xs'

const inputClass =
  'w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-2.5 font-body-md text-on-surface outline-none transition-all placeholder:text-secondary focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/10 font-bold'

const money = (value: number) =>
  `৳ ${value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

export default function PaidHistoryClient({
  initialBills,
  chartData,
  supportTodayList,
  supportUsers,
}: PaidHistoryClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [methodFilter, setMethodFilter] = useState('All')
  const [selectedSupport, setSelectedSupport] = useState('All')
  const [selectedDate, setSelectedDate] = useState('')
  const [chartType, setChartType] = useState<'area' | 'bar'>('area')

  const filteredBills = initialBills.filter((bill) => {
    const search = searchTerm.toLowerCase()

    const matchesSearch =
      String(bill.ticket_id ?? '').toLowerCase().includes(search) ||
      String(bill.user_id ?? '').toLowerCase().includes(search) ||
      String(bill.description ?? '').toLowerCase().includes(search) ||
      String(bill.created_by ?? '').toLowerCase().includes(search)

    const matchesMethod =
      methodFilter === 'All' || bill.payment_method === methodFilter

    const matchesSupport =
      selectedSupport === 'All' ||
      String(bill.created_by ?? '').toLowerCase() ===
        selectedSupport.toLowerCase()

    let billDateOnly = ''

    if (bill.paid_at) {
      billDateOnly = new Date(bill.paid_at).toISOString().split('T')[0]
    } else if (bill.date) {
      billDateOnly = new Date(bill.date).toISOString().split('T')[0]
    }

    const matchesDate = !selectedDate || billDateOnly === selectedDate

    return matchesSearch && matchesMethod && matchesSupport && matchesDate
  })

  const filteredTotal = filteredBills.reduce(
    (acc, bill) => acc + (Number(bill.amount) || 0),
    0
  )

  const resetFilters = () => {
    setSearchTerm('')
    setMethodFilter('All')
    setSelectedSupport('All')
    setSelectedDate('')
  }

  const hasActiveFilters =
    searchTerm !== '' ||
    methodFilter !== 'All' ||
    selectedSupport !== 'All' ||
    selectedDate !== ''

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        
        {/* Support Staff & Graph Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          
          {/* Support Staff Breakdown */}
          <div className={`${panelClass} flex flex-col justify-between`}>
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-md uppercase tracking-widest bg-secondary-container text-on-secondary-container border border-outline-variant">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    Performance
                  </span>
                  <h3 className="mt-3 font-headline-sm text-on-surface">
                    Support Staff Collections
                  </h3>
                  <p className="font-body-sm text-on-surface-variant font-normal mt-0.5">
                    Today's total paid collections per staff
                  </p>
                </div>
                <div className="rounded-2xl bg-secondary-container p-3 text-on-secondary-container border border-outline-variant">
                  <Users size={18} />
                </div>
              </div>
            </div>

            <div className="mt-4 max-h-64 flex-1 space-y-3 overflow-y-auto pr-1">
              {supportTodayList.length > 0 ? (
                supportTodayList
                  .slice()
                  .sort((a, b) => b.amount - a.amount)
                  .map((item) => {
                    const maxAmount = Math.max(
                      ...supportTodayList.map((staff) => staff.amount),
                      1
                    )
                    const percentage = (item.amount / maxAmount) * 100

                    return (
                      <div
                        key={item.name}
                        className="rounded-2xl border border-outline-variant bg-surface-container-low p-3.5 transition-all hover:bg-surface-container"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-inverse-surface font-label-md text-inverse-on-surface shadow-xs">
                              {item.name.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="truncate font-label-lg text-on-surface font-bold">
                              {item.name}
                            </span>
                          </div>
                          <span className="shrink-0 font-data-mono text-primary font-black tracking-tight">
                            {money(item.amount)}
                          </span>
                        </div>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-container-high">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-emerald-600 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })
              ) : (
                <div className="flex h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-outline-variant bg-surface-container-low p-4 text-center">
                  <UserRound size={24} className="text-secondary mb-2" />
                  <p className="font-body-md text-on-surface font-bold">No collections recorded today</p>
                </div>
              )}
            </div>
          </div>

          {/* Date-wise Chart */}
          <div className={`${panelClass} min-w-0 lg:col-span-2 flex flex-col justify-between`}>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center mb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-md uppercase tracking-widest bg-tertiary-container text-tertiary border border-outline-variant">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                  Analytics
                </span>
                <h3 className="mt-3 font-headline-sm text-on-surface flex items-center gap-2">
                  <ChartNoAxesCombined size={18} className="text-tertiary" />
                  Day-Wise Paid Bill Trend
                </h3>
              </div>

              {/* Modern Segmented Control */}
              <div className="inline-flex items-center gap-1 rounded-xl bg-surface-container p-1 border border-outline-variant">
                <button
                  type="button"
                  onClick={() => setChartType('area')}
                  className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-label-lg transition-all ${
                    chartType === 'area'
                      ? 'bg-surface-bright text-on-surface shadow-xs font-black'
                      : 'text-secondary hover:text-on-surface'
                  }`}
                >
                  <Activity size={14} className={chartType === 'area' ? 'text-primary' : ''} />
                  Area Chart
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('bar')}
                  className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-label-lg transition-all ${
                    chartType === 'bar'
                      ? 'bg-surface-bright text-on-surface shadow-xs font-black'
                      : 'text-secondary hover:text-on-surface'
                  }`}
                >
                  <ChartNoAxesCombined size={14} className={chartType === 'bar' ? 'text-primary' : ''} />
                  Bar Chart
                </button>
              </div>
            </div>

            <div className="h-60 min-w-0 sm:h-64 mt-2">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'area' ? (
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <defs>
                        <linearGradient id="paidAreaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0d9488" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderRadius: '14px',
                          color: '#fff',
                          fontSize: '12px',
                          border: 'none',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
                        }}
                        formatter={(val: any) => [money(Number(val) || 0), 'Paid Total']}
                      />
                      <Area type="monotone" dataKey="amount" stroke="#0d9488" strokeWidth={3} fill="url(#paidAreaGrad)" />
                    </AreaChart>
                  ) : (
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          borderRadius: '14px',
                          color: '#fff',
                          fontSize: '12px',
                          border: 'none',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
                        }}
                        formatter={(val: any) => [money(Number(val) || 0), 'Paid Total']}
                      />
                      <Bar dataKey="amount" fill="#0d9488" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center font-body-md text-secondary font-medium">
                  No graphical metrics available yet.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Filters Toolbar */}
        <div className={panelClass}>
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <h3 className="flex items-center gap-2 font-headline-sm text-on-surface">
              <Filter size={16} className="text-primary" />
              Filter Paid Records
            </h3>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 font-label-lg text-error hover:opacity-80 transition-opacity"
              >
                <RotateCcw size={13} />
                Reset all filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="mb-1.5 block font-label-md uppercase tracking-wider text-secondary">
                Search Ticket / User ID
              </label>
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary" />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block font-label-md uppercase tracking-wider text-secondary">
                Support Staff
              </label>
              <select
                value={selectedSupport}
                onChange={(e) => setSelectedSupport(e.target.value)}
                className={inputClass}
              >
                <option value="All">All Support Staff</option>
                {supportUsers.map((user) => (
                  <option key={user.id ?? user.name} value={user.name}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block font-label-md uppercase tracking-wider text-secondary">
                Paid Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1.5 block font-label-md uppercase tracking-wider text-secondary">
                Payment Method
              </label>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className={inputClass}
              >
                <option value="All">All Methods</option>
                <option value="Cash">Cash</option>
                <option value="bKash">bKash</option>
                <option value="Nagad">Nagad</option>
                <option value="Bank">Bank</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-lowest shadow-xs">
          <div className="flex flex-col justify-between gap-4 border-b border-outline-variant p-6 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-headline-md text-on-surface">
                Paid Bills Ledger ({filteredBills.length})
              </h3>
              <p className="font-body-sm text-on-surface-variant font-normal mt-0.5">Showing successful verified transactions</p>
            </div>

            <div className="rounded-2xl border border-secondary-container bg-secondary-container/50 px-4 py-2.5 text-right">
              <span className="font-label-md uppercase tracking-widest text-on-secondary-container block">Filtered Total Paid</span>
              <span className="font-headline-md text-on-secondary-container tabular-nums font-data-mono">{money(filteredTotal)}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] border-collapse text-left">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low font-label-md uppercase tracking-wider text-secondary">
                  <th className="px-6 py-4">Ticket / User ID</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Created By</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Paid Date</th>
                  <th className="px-6 py-4">Settled By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant font-body-md font-medium">
                {filteredBills.length > 0 ? (
                  filteredBills.map((bill, index) => (
                    <tr key={bill.id ?? index} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-on-surface">{bill.ticket_id || '—'}</div>
                        <div className="font-body-sm text-secondary font-normal mt-0.5">Sub: {bill.user_id || '—'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-lg border border-outline-variant bg-surface-container px-2.5 py-1 font-label-md text-on-surface">
                          {bill.category_name || 'General'}
                        </span>
                      </td>
                      <td className="max-w-[220px] truncate px-6 py-4 text-on-surface-variant" title={bill.description}>
                        {bill.description || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-black text-primary tabular-nums font-data-mono">{money(Number(bill.amount) || 0)}</span>
                      </td>
                      <td className="px-6 py-4 font-bold text-on-surface whitespace-nowrap">
                        {bill.created_by || 'Support'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-low px-2.5 py-1 font-label-md text-on-surface">
                          {bill.payment_method || 'Cash'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-secondary whitespace-nowrap">
                        {bill.paid_at ? new Date(bill.paid_at).toLocaleString() : bill.date ? new Date(bill.date).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4 font-bold text-on-surface whitespace-nowrap">
                        {bill.paid_by || 'Accounts Staff'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-14 text-center text-secondary font-semibold">
                      No matching paid bills record found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-outline-variant bg-surface-container-low px-6 py-3.5 font-body-sm text-secondary font-semibold gap-2">
            <span>Showing {filteredBills.length} of {initialBills.length} records</span>
            <span className="inline-flex items-center gap-1 text-primary font-bold">
              <CheckCircle2 size={13} /> Verified Paid Logs
            </span>
          </div>
        </div>

      </div>
    </ProtectedRoute>
  )
}