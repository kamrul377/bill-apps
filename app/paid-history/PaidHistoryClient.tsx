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
//   'rounded-[22px] border border-outline-variant bg-surface-container-lowest p-6 shadow-xs'

// const inputClass =
//   'w-full rounded-xl border border-outline-variant bg-surface-container-low px-4 py-2.5 font-body-md text-on-surface outline-none transition-all placeholder:text-secondary focus:border-primary focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/10 font-bold'

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
//       selectedSupport.toLowerCase()

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
//         <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

//           {/* Support Staff Breakdown */}
//           <div className={`${panelClass} flex flex-col justify-between `}>
//             <div>
//               <div className="flex items-start justify-between gap-3 mb-4 ">
//                 <div>
//                   <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-md uppercase tracking-widest bg-secondary-container text-on-secondary-container border border-outline-variant">
//                     <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
//                     Performance
//                   </span>
//                   <h3 className="mt-3 font-headline-sm text-on-surface">
//                     Support Staff Collections
//                   </h3>
//                   <p className="font-body-sm text-on-surface-variant font-normal mt-0.5">
//                     Today's total paid collections per staff
//                   </p>
//                 </div>
//                 <div className="rounded-2xl bg-secondary-container p-3 text-on-secondary-container border border-outline-variant">
//                   <Users size={18} />
//                 </div>
//               </div>
//             </div>



//             <div className="mt-4 max-h-72 flex-1 space-y-3 overflow-y-auto pr-1.5">
//               {supportTodayList.length > 0 ? (
//                 supportTodayList
//                   .slice()
//                   .sort((a, b) => b.amount - a.amount)
//                   .map((item) => {
//                     return (
//                       <div
//                         key={item.name}
//                         className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
//                       >
//                         {/* Staff information and total paid */}
//                         <div className="flex items-center justify-between gap-3">
//                           <div className="flex min-w-0 items-center gap-3">
//                             <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-teal-100 bg-teal-50 text-sm font-bold text-teal-700">
//                               {item.name.substring(0, 2).toUpperCase()}
//                             </div>

//                             <div className="min-w-0">
//                               <p className="truncate text-sm font-bold text-slate-800">
//                                 {item.name}
//                               </p>
//                               <p className="mt-1 text-xs text-slate-500">
//                                 Total Paid Today
//                               </p>
//                             </div>
//                           </div>

//                           <div className="shrink-0 text-right">
//                             <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
//                               <span className="inline-flex items-center gap-1">
//                                 <CheckCircle2 size={12} />
//                                 Paid
//                               </span>
//                             </p>
//                             <p className="font-mono text-base font-bold tabular-nums text-slate-800">
//                               {money(item.amount)}
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     )
//                   })
//               ) : (
//                 <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
//                   <div className="mb-3 flex size-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400">
//                     <UserRound size={22} />
//                   </div>

//                   <p className="text-sm font-semibold text-slate-700">
//                     No payments recorded today
//                   </p>
//                   <p className="mt-1 text-xs text-slate-500">
//                     Support staff payment records will appear here.
//                   </p>
//                 </div>
//               )}
//             </div>




//           </div>

//           {/* Date-wise Chart */}
//           <div className={`${panelClass} min-w-0 lg:col-span-2 flex flex-col justify-between`}>
//             <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center mb-4">
//               <div>
//                 <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-md uppercase tracking-widest bg-tertiary-container text-tertiary border border-outline-variant">
//                   <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
//                   Analytics
//                 </span>
//                 <h3 className="mt-3 font-headline-sm text-on-surface flex items-center gap-2">
//                   <ChartNoAxesCombined size={18} className="text-tertiary" />
//                   Day-Wise Paid Bill Trend
//                 </h3>
//               </div>

//               {/* Modern Segmented Control */}
//               <div className="inline-flex items-center gap-1 rounded-xl bg-surface-container p-1 border border-outline-variant">
//                 <button
//                   type="button"
//                   onClick={() => setChartType('area')}
//                   className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-label-lg transition-all ${chartType === 'area'
//                     ? 'bg-surface-bright text-on-surface shadow-xs font-black'
//                     : 'text-secondary hover:text-on-surface'
//                     }`}
//                 >
//                   <Activity size={14} className={chartType === 'area' ? 'text-primary' : ''} />
//                   Area Chart
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setChartType('bar')}
//                   className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-label-lg transition-all ${chartType === 'bar'
//                     ? 'bg-surface-bright text-on-surface shadow-xs font-black'
//                     : 'text-secondary hover:text-on-surface'
//                     }`}
//                 >
//                   <ChartNoAxesCombined size={14} className={chartType === 'bar' ? 'text-primary' : ''} />
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
//                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
//                       <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
//                       <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
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
//                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
//                       <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
//                       <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
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
//                 <div className="flex h-full items-center justify-center font-body-md text-secondary font-medium">
//                   No graphical metrics available yet.
//                 </div>
//               )}
//             </div>
//           </div>

//         </div>

//         {/* Filters Toolbar */}
//         <div className={panelClass}>
//           <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
//             <h3 className="flex items-center gap-2 font-headline-sm text-on-surface">
//               <Filter size={16} className="text-primary" />
//               Filter Paid Records
//             </h3>
//             {hasActiveFilters && (
//               <button
//                 type="button"
//                 onClick={resetFilters}
//                 className="inline-flex items-center gap-1.5 font-label-lg text-error hover:opacity-80 transition-opacity"
//               >
//                 <RotateCcw size={13} />
//                 Reset all filters
//               </button>
//             )}
//           </div>

//           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
//             <div>
//               <label className="mb-1.5 block font-label-md uppercase tracking-wider text-secondary">
//                 Search Ticket / User ID
//               </label>
//               <div className="relative">
//                 <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary" />
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
//               <label className="mb-1.5 block font-label-md uppercase tracking-wider text-secondary">
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
//               <label className="mb-1.5 block font-label-md uppercase tracking-wider text-secondary">
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
//               <label className="mb-1.5 block font-label-md uppercase tracking-wider text-secondary">
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
//         <div className="overflow-hidden rounded-[22px] border border-outline-variant bg-surface-container-lowest shadow-xs">
//           <div className="flex flex-col justify-between gap-4 border-b border-outline-variant p-6 sm:flex-row sm:items-center">
//             <div>
//               <h3 className="font-headline-md text-on-surface">
//                 Paid Bills Ledger ({filteredBills.length})
//               </h3>
//               <p className="font-body-sm text-on-surface-variant font-normal mt-0.5">Showing successful verified transactions</p>
//             </div>

//             <div className="rounded-2xl border border-secondary-container bg-secondary-container/50 px-4 py-2.5 text-right">
//               <span className="font-label-md uppercase tracking-widest text-on-secondary-container block">Filtered Total Paid</span>
//               <span className="font-headline-md text-on-secondary-container tabular-nums font-data-mono">{money(filteredTotal)}</span>
//             </div>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full min-w-[1050px] border-collapse text-left">
//               <thead>
//                 <tr className="border-b border-outline-variant bg-surface-container-low font-label-md uppercase tracking-wider text-secondary">
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
//               <tbody className="divide-y divide-outline-variant font-body-md font-medium">
//                 {filteredBills.length > 0 ? (
//                   filteredBills.map((bill, index) => (
//                     <tr key={bill.id ?? index} className="hover:bg-surface-container-low transition-colors">
//                       <td className="px-6 py-4">
//                         <div className="font-bold text-on-surface">{bill.ticket_id || '—'}</div>
//                         <div className="font-body-sm text-secondary font-normal mt-0.5">Sub: {bill.user_id || '—'}</div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className="inline-flex rounded-lg border border-outline-variant bg-surface-container px-2.5 py-1 font-label-md text-on-surface">
//                           {bill.category_name || 'General'}
//                         </span>
//                       </td>
//                       <td className="max-w-[220px] truncate px-6 py-4 text-on-surface-variant" title={bill.description}>
//                         {bill.description || '—'}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className="font-black text-primary tabular-nums font-data-mono">{money(Number(bill.amount) || 0)}</span>
//                       </td>
//                       <td className="px-6 py-4 font-bold text-on-surface whitespace-nowrap">
//                         {bill.created_by || 'Support'}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <span className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-low px-2.5 py-1 font-label-md text-on-surface">
//                           {bill.payment_method || 'Cash'}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 text-secondary whitespace-nowrap">
//                         {bill.paid_at ? new Date(bill.paid_at).toLocaleString() : bill.date ? new Date(bill.date).toLocaleDateString() : '—'}
//                       </td>
//                       <td className="px-6 py-4 font-bold text-on-surface whitespace-nowrap">
//                         {bill.paid_by || 'Accounts Staff'}
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan={8} className="px-6 py-14 text-center text-secondary font-semibold">
//                       No matching paid bills record found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           <div className="flex flex-col sm:flex-row items-center justify-between border-t border-outline-variant bg-surface-container-low px-6 py-3.5 font-body-sm text-secondary font-semibold gap-2">
//             <span>Showing {filteredBills.length} of {initialBills.length} records</span>
//             <span className="inline-flex items-center gap-1 text-primary font-bold">
//               <CheckCircle2 size={13} /> Verified Paid Logs
//             </span>
//           </div>
//         </div>

//       </div>
//     </ProtectedRoute>
//   )
// }





// ===========2nd==================









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
  'rounded-[22px] border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 p-6 shadow-xs'

const inputClass =
  'w-full rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-low dark:bg-slate-800 px-4 py-2.5 font-body-md text-on-surface dark:text-slate-100 outline-none transition-all placeholder:text-secondary dark:placeholder:text-slate-400 focus:border-primary dark:focus:border-teal-500 focus:bg-surface-container-lowest dark:focus:bg-slate-800/80 focus:ring-2 focus:ring-primary/10 font-bold'

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
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-md uppercase tracking-widest bg-secondary-container dark:bg-slate-800 text-on-secondary-container dark:text-slate-300 border border-outline-variant dark:border-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-teal-400"></span>
                    Performance
                  </span>
                  <h3 className="mt-3 font-headline-sm text-on-surface dark:text-slate-100">
                    Support Staff Collections
                  </h3>
                  <p className="font-body-sm text-on-surface-variant dark:text-slate-400 font-normal mt-0.5">
                    Today's total paid collections per staff
                  </p>
                </div>
                <div className="rounded-2xl bg-secondary-container dark:bg-slate-800 p-3 text-on-secondary-container dark:text-slate-300 border border-outline-variant dark:border-slate-700">
                  <Users size={18} />
                </div>
              </div>
            </div>

            <div className="mt-4 max-h-72 flex-1 space-y-3 overflow-y-auto pr-1.5">
              {supportTodayList.length > 0 ? (
                supportTodayList
                  .slice()
                  .sort((a, b) => b.amount - a.amount)
                  .map((item) => {
                    return (
                      <div
                        key={item.name}
                        className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4 shadow-sm"
                      >
                        {/* Staff information and total paid */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-teal-100 dark:border-teal-900 bg-teal-50 dark:bg-teal-950/60 text-sm font-bold text-teal-700 dark:text-teal-300">
                              {item.name.substring(0, 2).toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-200">
                                {item.name}
                              </p>
                              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Total Paid Today
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                              <span className="inline-flex items-center gap-1">
                                <CheckCircle2 size={12} />
                                Paid
                              </span>
                            </p>
                            <p className="font-mono text-base font-bold tabular-nums text-slate-800 dark:text-slate-100">
                              {money(item.amount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })
              ) : (
                <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-5 text-center">
                  <div className="mb-3 flex size-11 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500">
                    <UserRound size={22} />
                  </div>

                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    No payments recorded today
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Support staff payment records will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Date-wise Chart */}
          <div className={`${panelClass} min-w-0 lg:col-span-2 flex flex-col justify-between`}>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center mb-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-md uppercase tracking-widest bg-tertiary-container dark:bg-slate-800 text-tertiary dark:text-blue-300 border border-outline-variant dark:border-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary dark:bg-blue-400"></span>
                  Analytics
                </span>
                <h3 className="mt-3 font-headline-sm text-on-surface dark:text-slate-100 flex items-center gap-2">
                  <ChartNoAxesCombined size={18} className="text-tertiary dark:text-blue-400" />
                  Day-Wise Paid Bill Trend
                </h3>
              </div>

              {/* Modern Segmented Control */}
              <div className="inline-flex items-center gap-1 rounded-xl bg-surface-container dark:bg-slate-800 p-1 border border-outline-variant dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setChartType('area')}
                  className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-label-lg transition-all ${chartType === 'area'
                    ? 'bg-surface-bright dark:bg-slate-700 text-on-surface dark:text-slate-100 shadow-xs font-black'
                    : 'text-secondary dark:text-slate-400 hover:text-on-surface dark:hover:text-slate-200'
                    }`}
                >
                  <Activity size={14} className={chartType === 'area' ? 'text-primary dark:text-teal-400' : ''} />
                  Area Chart
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('bar')}
                  className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-label-lg transition-all ${chartType === 'bar'
                    ? 'bg-surface-bright dark:bg-slate-700 text-on-surface dark:text-slate-100 shadow-xs font-black'
                    : 'text-secondary dark:text-slate-400 hover:text-on-surface dark:hover:text-slate-200'
                    }`}
                >
                  <ChartNoAxesCombined size={14} className={chartType === 'bar' ? 'text-primary dark:text-teal-400' : ''} />
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
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
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
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
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
                <div className="flex h-full items-center justify-center font-body-md text-secondary dark:text-slate-400 font-medium">
                  No graphical metrics available yet.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Filters Toolbar */}
        <div className={panelClass}>
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <h3 className="flex items-center gap-2 font-headline-sm text-on-surface dark:text-slate-100">
              <Filter size={16} className="text-primary dark:text-teal-400" />
              Filter Paid Records
            </h3>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 font-label-lg text-error dark:text-rose-400 hover:opacity-80 transition-opacity"
              >
                <RotateCcw size={13} />
                Reset all filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <label className="mb-1.5 block font-label-md uppercase tracking-wider text-secondary dark:text-slate-400">
                Search Ticket / User ID
              </label>
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary dark:text-slate-400" />
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
              <label className="mb-1.5 block font-label-md uppercase tracking-wider text-secondary dark:text-slate-400">
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
              <label className="mb-1.5 block font-label-md uppercase tracking-wider text-secondary dark:text-slate-400">
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
              <label className="mb-1.5 block font-label-md uppercase tracking-wider text-secondary dark:text-slate-400">
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
        <div className="overflow-hidden rounded-[22px] border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 shadow-xs">
          <div className="flex flex-col justify-between gap-4 border-b border-outline-variant dark:border-slate-800 p-6 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-headline-md text-on-surface dark:text-slate-100">
                Paid Bills Ledger ({filteredBills.length})
              </h3>
              <p className="font-body-sm text-on-surface-variant dark:text-slate-400 font-normal mt-0.5">Showing successful verified transactions</p>
            </div>

            <div className="rounded-2xl border border-secondary-container dark:border-slate-800 bg-secondary-container/50 dark:bg-slate-800/60 px-4 py-2.5 text-right">
              <span className="font-label-md uppercase tracking-widest text-on-secondary-container dark:text-slate-300 block">Filtered Total Paid</span>
              <span className="font-headline-md text-on-secondary-container dark:text-slate-100 tabular-nums font-data-mono">{money(filteredTotal)}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] border-collapse text-left">
              <thead>
                <tr className="border-b border-outline-variant dark:border-slate-800 bg-surface-container-low dark:bg-slate-800/50 font-label-md uppercase tracking-wider text-secondary dark:text-slate-400">
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
              <tbody className="divide-y divide-outline-variant dark:divide-slate-800 font-body-md font-medium">
                {filteredBills.length > 0 ? (
                  filteredBills.map((bill, index) => (
                    <tr key={bill.id ?? index} className="hover:bg-surface-container-low dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-on-surface dark:text-slate-100">{bill.ticket_id || '—'}</div>
                        <div className="font-body-sm text-secondary dark:text-slate-400 font-normal mt-0.5">Sub: {bill.user_id || '—'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-lg border border-outline-variant dark:border-slate-700 bg-surface-container dark:bg-slate-800 px-2.5 py-1 font-label-md text-on-surface dark:text-slate-200">
                          {bill.category_name || 'General'}
                        </span>
                      </td>
                      <td className="max-w-[220px] truncate px-6 py-4 text-on-surface-variant dark:text-slate-300" title={bill.description}>
                        {bill.description || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-black text-primary dark:text-teal-400 tabular-nums font-data-mono">{money(Number(bill.amount) || 0)}</span>
                      </td>
                      <td className="px-6 py-4 font-bold text-on-surface dark:text-slate-100 whitespace-nowrap">
                        {bill.created_by || 'Support'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-outline-variant dark:border-slate-700 bg-surface-container-low dark:bg-slate-800 px-2.5 py-1 font-label-md text-on-surface dark:text-slate-200">
                          {bill.payment_method || 'Cash'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-secondary dark:text-slate-400 whitespace-nowrap">
                        {bill.paid_at ? new Date(bill.paid_at).toLocaleString() : bill.date ? new Date(bill.date).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4 font-bold text-on-surface dark:text-slate-100 whitespace-nowrap">
                        {bill.paid_by || 'Accounts Staff'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-14 text-center text-secondary dark:text-slate-400 font-semibold">
                      No matching paid bills record found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-outline-variant dark:border-slate-800 bg-surface-container-low dark:bg-slate-800/40 px-6 py-3.5 font-body-sm text-secondary dark:text-slate-400 font-semibold gap-2">
            <span>Showing {filteredBills.length} of {initialBills.length} records</span>
            <span className="inline-flex items-center gap-1 text-primary dark:text-teal-400 font-bold">
              <CheckCircle2 size={13} /> Verified Paid Logs
            </span>
          </div>
        </div>

      </div>
    </ProtectedRoute>
  )
}