// 'use client'

// import { useState, useEffect } from 'react'
// import Link from 'next/link'
// import { useRouter } from 'next/navigation'
// import ProtectedRoute from '@/components/ProtectedRoute'
// import PaidHistoryClient from './PaidHistoryClient'
// import {
//   ShieldCheck,
//   ArrowLeft,
//   ReceiptText,
//   Users,
//   Wallet,
//   CalendarDays,
//   TrendingUp,
// } from 'lucide-react'

// export default function PaidHistoryPage() {
//   const router = useRouter()
//   const [currentUser, setCurrentUser] = useState<any>(null)
//   const [paidBills, setPaidBills] = useState<any[]>([])
//   const [allUsers, setAllUsers] = useState<any[]>([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     const savedUser = sessionStorage.getItem('netbill_session_user')
//     if (savedUser) {
//       try {
//         const user = JSON.parse(savedUser)
//         setCurrentUser(user)

//         const role = user.role?.toLowerCase()
//         // শুধু admin বা accounts হলে এই পেজে থাকতে পারবে, অন্য রোল হলে ড্যাশবোর্ডে পাঠিয়ে দেবে
//         if (role !== 'admin' && role !== 'accounts') {
//           router.replace('/')
//           return
//         }

//         fetchData(user)
//       } catch (e) {
//         console.error(e)
//         router.replace('/')
//       }
//     } else {
//       router.replace('/')
//     }
//     setLoading(false)
//   }, [router])

//   const fetchData = async (user: any) => {
//     try {
//       const params = new URLSearchParams()
//       params.set('role', user.role)
//       params.set('userId', user.user_id)
//       params.set('userName', user.name)

//       const res = await fetch(`/api/bills?${params.toString()}`)
//       const data = await res.json()

//       if (res.ok && data.bills) {
//         const paid = data.bills.filter(
//           (b: any) => b.status?.toLowerCase() === 'paid'
//         )
//         setPaidBills(paid)
//       }

//       const userRes = await fetch('/api/users')
//       if (userRes.ok) {
//         const userData = await userRes.json()
//         setAllUsers(Array.isArray(userData) ? userData : userData.users || [])
//       }
//     } catch (error) {
//       console.error('Failed to load paid history data:', error)
//     }
//   }

//   const formatLocalDate = (date: Date) => {
//     const year = date.getFullYear()
//     const month = String(date.getMonth() + 1).padStart(2, '0')
//     const day = String(date.getDate()).padStart(2, '0')
//     return `${year}-${month}-${day}`
//   }

//   const today = new Date()
//   const todayStr = formatLocalDate(today)

//   const yesterdayDate = new Date(today)
//   yesterdayDate.setDate(yesterdayDate.getDate() - 1)
//   const yesterdayStr = formatLocalDate(yesterdayDate)

//   let totalCollected = 0
//   let todayCollected = 0
//   let yesterdayCollected = 0

//   const supportTodayMap: Record<string, number> = {}
//   const dateWiseMap: Record<string, number> = {}

//   paidBills.forEach((bill: any) => {
//     const amount = Number(bill.amount) || 0
//     totalCollected += amount

//     let billDateOnly = todayStr
//     if (bill.paid_at) {
//       billDateOnly = formatLocalDate(new Date(bill.paid_at))
//     } else if (bill.date) {
//       billDateOnly = formatLocalDate(new Date(bill.date))
//     }

//     if (billDateOnly === todayStr) {
//       todayCollected += amount
//       const creator = bill.created_by || 'Unknown Support'
//       supportTodayMap[creator] = (supportTodayMap[creator] || 0) + amount
//     }

//     if (billDateOnly === yesterdayStr) {
//       yesterdayCollected += amount
//     }

//     dateWiseMap[billDateOnly] = (dateWiseMap[billDateOnly] || 0) + amount
//   })

//   const supportTodayList = Object.entries(supportTodayMap).map(
//     ([name, amount]) => ({ name, amount })
//   )

//   const chartData = Object.keys(dateWiseMap)
//     .sort()
//     .map((date) => ({
//       date,
//       amount: dateWiseMap[date],
//     }))

//   const supportUsers = allUsers.filter(
//     (u: any) =>
//       u.role === 'support' || u.role === 'admin' || u.role === 'manager'
//   )

//   const formatMoney = (amount: number) =>
//     `৳ ${amount.toLocaleString('en-IN', {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     })}`

//   return (
//     <ProtectedRoute>
//       <main className="min-h-screen overflow-hidden bg-[#F1F5F9] text-[#0F172A]">
//         <div className="relative mx-auto max-w-[1500px] space-y-6 px-4 py-6 sm:px-6 md:py-8 lg:px-10">
          
//           {/* Header */}
//           <header className="relative overflow-hidden rounded-[24px] border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
//             <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
//               <div className="space-y-4">
//                 <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-teal-800">
//                   <span className="relative flex h-2 w-2">
//                     <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
//                     <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-600" />
//                   </span>
//                   Logged in as: {currentUser?.name} ({currentUser?.role})
//                 </div>

//                 <div>
//                   <h1 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl text-slate-900 ">
//                     Paid Bill <span className="text-teal-600">History & Ledger</span>
//                   </h1>
//                   <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 font-medium">
//                     Review and audit all successfully settled subscriber payments, daily collection summaries, and support performance metrics.
//                   </p>
//                 </div>
//               </div>

//               <Link
//                 href="/"
//                 className="inline-flex shrink-0 items-center justify-center gap-2.5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-slate-800 active:scale-95 lg:self-center"
//               >
//                 <ArrowLeft size={16} className="text-teal-400" />
//                 Back to Dashboard
//               </Link>
//             </div>
//           </header>

//           {/* Metric Cards */}
//           <section className="space-y-4">
//             <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
//               <article className="relative overflow-hidden rounded-[20px] border border-slate-200/80 bg-white p-6 shadow-sm">
//                 <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-teal-500 to-emerald-600" />
//                 <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Today's Paid Collections</p>
//                 <div className="mt-4 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
//                   {formatMoney(todayCollected)}
//                 </div>
//                 <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 font-semibold">
//                   <span>{todayStr}</span>
//                   <span className="text-teal-600 font-bold">Paid Records</span>
//                 </div>
//               </article>

//               <article className="relative overflow-hidden rounded-[20px] border border-slate-200/80 bg-white p-6 shadow-sm">
//                 <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-indigo-500 to-slate-700" />
//                 <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Yesterday's Paid Collections</p>
//                 <div className="mt-4 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
//                   {formatMoney(yesterdayCollected)}
//                 </div>
//                 <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 font-semibold">
//                   <span>{yesterdayStr}</span>
//                   <span className="text-teal-600 font-bold">Paid Records</span>
//                 </div>
//               </article>

//               <article className="relative overflow-hidden rounded-[20px] border border-slate-200/80 bg-white p-6 shadow-sm">
//                 <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-500 to-teal-600" />
//                 <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Lifetime Paid Bills</p>
//                 <div className="mt-4 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
//                   {formatMoney(totalCollected)}
//                 </div>
//                 <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 font-semibold">
//                   <span>{paidBills.length} total paid records</span>
//                   <span className="text-teal-600 font-bold">Paid Records</span>
//                 </div>
//               </article>
//             </div>
//           </section>

//           {/* Main Client Component */}
//           <section className="rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
//             <div className="mb-6 flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
//               <div>
//                 <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
//                   <ReceiptText size={20} className="text-teal-600" />
//                   Paid Transactions & Analytics Ledger
//                 </h2>
//                 <p className="text-xs text-slate-500 font-medium">
//                   Detailed listing and graphical summary of all cleared bill payments.
//                 </p>
//               </div>

//               <div className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-700 font-bold">
//                 <Users size={15} className="text-teal-600" />
//                 {supportUsers.length} Active Support Staff
//               </div>
//             </div>

//             <PaidHistoryClient
//               initialBills={paidBills}
//               chartData={chartData}
//               supportTodayList={supportTodayList}
//               supportUsers={supportUsers}
//             />
//           </section>

//         </div>
//       </main>
//     </ProtectedRoute>
//   )
// }


// 'use client'

// import { useState, useEffect } from 'react'
// import Link from 'next/link'
// import { useRouter } from 'next/navigation'
// import ProtectedRoute from '@/components/ProtectedRoute'
// import PaidHistoryClient from './PaidHistoryClient'
// import {
//   ShieldCheck,
//   ArrowLeft,
//   ReceiptText,
//   Users,
//   Wallet,
//   CalendarDays,
//   TrendingUp,
// } from 'lucide-react'

// export default function PaidHistoryPage() {
//   const router = useRouter()
//   const [currentUser, setCurrentUser] = useState<any>(null)
//   const [paidBills, setPaidBills] = useState<any[]>([])
//   const [allUsers, setAllUsers] = useState<any[]>([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     const savedUser = sessionStorage.getItem('netbill_session_user')
//     if (savedUser) {
//       try {
//         const user = JSON.parse(savedUser)
//         setCurrentUser(user)

//         const role = user.role?.toLowerCase()
//         if (role !== 'admin' && role !== 'accounts') {
//           router.replace('/')
//           return
//         }

//         fetchData(user)
//       } catch (e) {
//         console.error(e)
//         router.replace('/')
//       }
//     } else {
//       router.replace('/')
//     }
//     setLoading(false)
//   }, [router])

//   const fetchData = async (user: any) => {
//     try {
//       const params = new URLSearchParams()
//       params.set('role', user.role)
//       params.set('userId', user.user_id)
//       params.set('userName', user.name)

//       const res = await fetch(`/api/bills?${params.toString()}`)
//       const data = await res.json()

//       if (res.ok && data.bills) {
//         const paid = data.bills.filter(
//           (b: any) => b.status?.toLowerCase() === 'paid'
//         )
//         setPaidBills(paid)
//       }

//       const userRes = await fetch('/api/users')
//       if (userRes.ok) {
//         const userData = await userRes.json()
//         setAllUsers(Array.isArray(userData) ? userData : userData.users || [])
//       }
//     } catch (error) {
//       console.error('Failed to load paid history data:', error)
//     }
//   }

//   const formatLocalDate = (date: Date) => {
//     const year = date.getFullYear()
//     const month = String(date.getMonth() + 1).padStart(2, '0')
//     const day = String(date.getDate()).padStart(2, '0')
//     return `${year}-${month}-${day}`
//   }

//   const today = new Date()
//   const todayStr = formatLocalDate(today)

//   const yesterdayDate = new Date(today)
//   yesterdayDate.setDate(yesterdayDate.getDate() - 1)
//   const yesterdayStr = formatLocalDate(yesterdayDate)

//   let totalCollected = 0
//   let todayCollected = 0
//   let yesterdayCollected = 0

//   const supportTodayMap: Record<string, number> = {}
//   const dateWiseMap: Record<string, number> = {}

//   paidBills.forEach((bill: any) => {
//     const amount = Number(bill.amount) || 0
//     totalCollected += amount

//     let billDateOnly = todayStr
//     if (bill.paid_at) {
//       billDateOnly = formatLocalDate(new Date(bill.paid_at))
//     } else if (bill.date) {
//       billDateOnly = formatLocalDate(new Date(bill.date))
//     }

//     if (billDateOnly === todayStr) {
//       todayCollected += amount
//       const creator = bill.created_by || 'Unknown Support'
//       supportTodayMap[creator] = (supportTodayMap[creator] || 0) + amount
//     }

//     if (billDateOnly === yesterdayStr) {
//       yesterdayCollected += amount
//     }

//     dateWiseMap[billDateOnly] = (dateWiseMap[billDateOnly] || 0) + amount
//   })

//   const supportTodayList = Object.entries(supportTodayMap).map(
//     ([name, amount]) => ({ name, amount })
//   )

//   const chartData = Object.keys(dateWiseMap)
//     .sort()
//     .map((date) => ({
//       date,
//       amount: dateWiseMap[date],
//     }))

//   const supportUsers = allUsers.filter(
//     (u: any) =>
//       u.role === 'support' || u.role === 'admin' || u.role === 'manager'
//   )

//   const formatMoney = (amount: number) =>
//     `৳ ${amount.toLocaleString('en-IN', {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     })}`

//   return (
//     <ProtectedRoute>
//       <main className="min-h-screen overflow-hidden bg-[#F8FAFC] text-[#0F172A] antialiased" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif' }}>
//         <div className="relative mx-auto max-w-[1500px] space-y-6 px-4 py-6 sm:px-6 md:py-8 lg:px-10">
          
//           {/* Header */}
//           <header className="relative overflow-hidden rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
//             <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
//               <div className="space-y-3">
//                 <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50/80 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-teal-800">
//                   <span className="relative flex h-2 w-2">
//                     <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
//                     <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-600" />
//                   </span>
//                   Logged in as: {currentUser?.name} ({currentUser?.role})
//                 </div>

//                 <div>
//                   <h1 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl text-slate-900">
//                     Paid Bill <span className="text-teal-600 font-extrabold">History & Ledger</span>
//                   </h1>
//                   <p className="mt-1.5 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-500 font-normal">
//                     Review and audit all successfully settled subscriber payments, daily collection summaries, and support performance metrics.
//                   </p>
//                 </div>
//               </div>

//               <Link
//                 href="/"
//                 className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs sm:text-sm font-semibold tracking-wide text-white shadow-xs transition-all hover:bg-slate-800 active:scale-95 lg:self-center"
//               >
//                 <ArrowLeft size={16} className="text-teal-400" />
//                 Back to Dashboard
//               </Link>
//             </div>
//           </header>

//           {/* Metric Cards */}
//           <section className="space-y-4">
//             <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
//               <article className="relative overflow-hidden rounded-[20px] border border-slate-200/80 bg-white p-6 shadow-xs">
//                 <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-teal-500 to-emerald-600" />
//                 <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Today's Paid Collections</p>
//                 <div className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl tabular-nums">
//                   {formatMoney(todayCollected)}
//                 </div>
//                 <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500 font-medium">
//                   <span className="tracking-wide">{todayStr}</span>
//                   <span className="text-teal-600 font-bold uppercase tracking-wider text-[10px]">Verified</span>
//                 </div>
//               </article>

//               <article className="relative overflow-hidden rounded-[20px] border border-slate-200/80 bg-white p-6 shadow-xs">
//                 <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-indigo-500 to-slate-700" />
//                 <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Yesterday's Paid Collections</p>
//                 <div className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl tabular-nums">
//                   {formatMoney(yesterdayCollected)}
//                 </div>
//                 <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500 font-medium">
//                   <span className="tracking-wide">{yesterdayStr}</span>
//                   <span className="text-indigo-600 font-bold uppercase tracking-wider text-[10px]">Settled</span>
//                 </div>
//               </article>

//               <article className="relative overflow-hidden rounded-[20px] border border-slate-200/80 bg-white p-6 shadow-xs">
//                 <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-500 to-teal-600" />
//                 <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Lifetime Paid Bills</p>
//                 <div className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl tabular-nums">
//                   {formatMoney(totalCollected)}
//                 </div>
//                 <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500 font-medium">
//                   <span className="tracking-wide">{paidBills.length} total records</span>
//                   <span className="text-blue-600 font-bold uppercase tracking-wider text-[10px]">Lifetime</span>
//                 </div>
//               </article>
//             </div>
//           </section>

//           {/* Main Client Component */}
//           <section className="rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-xs sm:p-6">
//             <div className="mb-6 flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
//               <div>
//                 <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
//                   <ReceiptText size={20} className="text-teal-600" />
//                   Paid Transactions & Analytics Ledger
//                 </h2>
//                 <p className="text-xs text-slate-500 font-normal mt-0.5">
//                   Detailed listing and graphical summary of all cleared bill payments.
//                 </p>
//               </div>

//               <div className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-700 font-semibold">
//                 <Users size={15} className="text-teal-600" />
//                 {supportUsers.length} Active Support Staff
//               </div>
//             </div>

//             <PaidHistoryClient
//               initialBills={paidBills}
//               chartData={chartData}
//               supportTodayList={supportTodayList}
//               supportUsers={supportUsers}
//             />
//           </section>

//         </div>
//       </main>
//     </ProtectedRoute>
//   )
// }











// ==========3rd=================






// 'use client'

// import { useState, useEffect } from 'react'
// import Link from 'next/link'
// import { useRouter } from 'next/navigation'
// import ProtectedRoute from '@/components/ProtectedRoute'
// import PaidHistoryClient from './PaidHistoryClient'
// import {
//   ShieldCheck,
//   ArrowLeft,
//   ReceiptText,
//   Users,
//   Wallet,
//   CalendarDays,
//   TrendingUp,
// } from 'lucide-react'

// export default function PaidHistoryPage() {
//   const router = useRouter()
//   const [currentUser, setCurrentUser] = useState<any>(null)
//   const [paidBills, setPaidBills] = useState<any[]>([])
//   const [allUsers, setAllUsers] = useState<any[]>([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     const savedUser = sessionStorage.getItem('netbill_session_user')
//     if (savedUser) {
//       try {
//         const user = JSON.parse(savedUser)
//         setCurrentUser(user)

//         const role = user.role?.toLowerCase()
//         if (role !== 'admin' && role !== 'accounts') {
//           router.replace('/')
//           return
//         }

//         fetchData(user)
//       } catch (e) {
//         console.error(e)
//         router.replace('/')
//       }
//     } else {
//       router.replace('/')
//     }
//   }, [router])

//   const fetchData = async (user: any) => {
//     try {
//       const params = new URLSearchParams()
//       params.set('role', user.role)
//       params.set('userId', user.user_id)
//       params.set('userName', user.name)

//       // ১. একসাথেই বিল এবং ইউজার্স ফেচ করা
//       const [billsRes, usersRes] = await Promise.all([
//         fetch(`/api/bills?${params.toString()}`),
//         fetch('/api/users')
//       ])

//       const billsData = await billsRes.json()
//       if (billsRes.ok && billsData.bills) {
//         const paid = billsData.bills.filter(
//           (b: any) => b.status?.toLowerCase() === 'paid'
//         )
//         setPaidBills(paid)
//       }

//       if (usersRes.ok) {
//         const usersData = await usersRes.json()
//         // API রেসপন্স অ্যারে হোক বা অবজেক্ট, সঠিকভাবে সেট করা
//         const userList = Array.isArray(usersData) ? usersData : (usersData.users || usersData.data || [])
//         setAllUsers(userList)
//       }
//     } catch (error) {
//       console.error('Failed to load paid history data:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const formatLocalDate = (date: Date) => {
//     const year = date.getFullYear()
//     const month = String(date.getMonth() + 1).padStart(2, '0')
//     const day = String(date.getDate()).padStart(2, '0')
//     return `${year}-${month}-${day}`
//   }

//   const today = new Date()
//   const todayStr = formatLocalDate(today)

//   const yesterdayDate = new Date(today)
//   yesterdayDate.setDate(yesterdayDate.getDate() - 1)
//   const yesterdayStr = formatLocalDate(yesterdayDate)

//   let totalCollected = 0
//   let todayCollected = 0
//   let yesterdayCollected = 0

//   const supportTodayMap: Record<string, number> = {}
//   const dateWiseMap: Record<string, number> = {}

//   paidBills.forEach((bill: any) => {
//     const amount = Number(bill.amount) || 0
//     totalCollected += amount

//     let billDateOnly = todayStr
//     if (bill.paid_at) {
//       billDateOnly = formatLocalDate(new Date(bill.paid_at))
//     } else if (bill.date) {
//       billDateOnly = formatLocalDate(new Date(bill.date))
//     }

//     if (billDateOnly === todayStr) {
//       todayCollected += amount
//       const creator = bill.created_by || 'Unknown Support'
//       supportTodayMap[creator] = (supportTodayMap[creator] || 0) + amount
//     }

//     if (billDateOnly === yesterdayStr) {
//       yesterdayCollected += amount
//     }

//     dateWiseMap[billDateOnly] = (dateWiseMap[billDateOnly] || 0) + amount
//   })

//   const supportTodayList = Object.entries(supportTodayMap).map(
//     ([name, amount]) => ({ name, amount })
//   )

//   // এখানে সাপোর্ট বা সিস্টেমের ইউজারদের ফিল্টার করা হচ্ছে যা ড্রপডাউনে দেখাবে
//   const supportUsers = allUsers.filter(
//     (u: any) => {
//       const r = u.role?.toLowerCase()
//       return r === 'support' || r === 'admin' || r === 'manager' || r === 'accounts'
//     }
//   )

//   const formatMoney = (amount: number) =>
//     `৳ ${amount.toLocaleString('en-IN', {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     })}`

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] text-slate-600 font-semibold text-sm">
//         Loading Paid History Ledger...
//       </div>
//     )
//   }

//   return (
//     <ProtectedRoute>
//       <main className="min-h-screen overflow-hidden bg-[#F8FAFC] text-[#0F172A] antialiased" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif' }}>
//         <div className="relative mx-auto max-w-[1500px] space-y-6 px-4 py-6 sm:px-6 md:py-8 lg:px-10">
          
//           {/* Header */}
//           <header className="relative overflow-hidden rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
//             <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
//               <div className="space-y-3">
//                 <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50/80 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-teal-800">
//                   <span className="relative flex h-2 w-2">
//                     <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
//                     <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-600" />
//                   </span>
//                   Logged in as: {currentUser?.name} ({currentUser?.role})
//                 </div>

//                 <div>
//                   <h1 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl text-slate-900">
//                     Paid Bill <span className="text-teal-600 font-extrabold">History & Ledger</span>
//                   </h1>
//                   <p className="mt-1.5 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-500 font-normal">
//                     Review and audit all successfully settled subscriber payments, daily collection summaries, and support performance metrics.
//                   </p>
//                 </div>
//               </div>

//               <Link
//                 href="/"
//                 className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs sm:text-sm font-semibold tracking-wide text-white shadow-xs transition-all hover:bg-slate-800 active:scale-95 lg:self-center"
//               >
//                 <ArrowLeft size={16} className="text-teal-400" />
//                 Back to Dashboard
//               </Link>
//             </div>
//           </header>

//           {/* Metric Cards */}
//           <section className="space-y-4">
//             <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
//               <article className="relative overflow-hidden rounded-[20px] border border-slate-200/80 bg-white p-6 shadow-xs">
//                 <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-teal-500 to-emerald-600" />
//                 <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Today's Paid Collections</p>
//                 <div className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl tabular-nums">
//                   {formatMoney(todayCollected)}
//                 </div>
//                 <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500 font-medium">
//                   <span className="tracking-wide">{todayStr}</span>
//                   <span className="text-teal-600 font-bold uppercase tracking-wider text-[10px]">Verified</span>
//                 </div>
//               </article>

//               <article className="relative overflow-hidden rounded-[20px] border border-slate-200/80 bg-white p-6 shadow-xs">
//                 <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-indigo-500 to-slate-700" />
//                 <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Yesterday's Paid Collections</p>
//                 <div className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl tabular-nums">
//                   {formatMoney(yesterdayCollected)}
//                 </div>
//                 <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500 font-medium">
//                   <span className="tracking-wide">{yesterdayStr}</span>
//                   <span className="text-indigo-600 font-bold uppercase tracking-wider text-[10px]">Settled</span>
//                 </div>
//               </article>

//               <article className="relative overflow-hidden rounded-[20px] border border-slate-200/80 bg-white p-6 shadow-xs">
//                 <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-500 to-teal-600" />
//                 <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Lifetime Paid Bills</p>
//                 <div className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl tabular-nums">
//                   {formatMoney(totalCollected)}
//                 </div>
//                 <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500 font-medium">
//                   <span className="tracking-wide">{paidBills.length} total records</span>
//                   <span className="text-blue-600 font-bold uppercase tracking-wider text-[10px]">Lifetime</span>
//                 </div>
//               </article>
//             </div>
//           </section>

//           {/* Main Client Component */}
//           <section className="rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-xs sm:p-6">
//             <div className="mb-6 flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
//               <div>
//                 <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
//                   <ReceiptText size={20} className="text-teal-600" />
//                   Paid Transactions & Analytics Ledger
//                 </h2>
//                 <p className="text-xs text-slate-500 font-normal mt-0.5">
//                   Detailed listing and graphical summary of all cleared bill payments.
//                 </p>
//               </div>

//               <div className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-700 font-semibold">
//                 <Users size={15} className="text-teal-600" />
//                 {supportUsers.length} Active System Staff
//               </div>
//             </div>

//             <PaidHistoryClient
//               initialBills={paidBills}
//               chartData={chartData}
//               supportTodayList={supportTodayList}
//               supportUsers={supportUsers}
//             />
//           </section>

//         </div>
//       </main>
//     </ProtectedRoute>
//   )
// }






// 'use client'

// import { useState, useEffect } from 'react'
// import Link from 'next/link'
// import { useRouter } from 'next/navigation'
// import ProtectedRoute from '@/components/ProtectedRoute'
// import PaidHistoryClient from './PaidHistoryClient'
// import {
//   ShieldCheck,
//   ArrowLeft,
//   ReceiptText,
//   Users,
// } from 'lucide-react'

// export default function PaidHistoryPage() {
//   const router = useRouter()
//   const [currentUser, setCurrentUser] = useState<any>(null)
//   const [paidBills, setPaidBills] = useState<any[]>([])
//   const [allUsers, setAllUsers] = useState<any[]>([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     const savedUser = sessionStorage.getItem('netbill_session_user')
//     if (savedUser) {
//       try {
//         const user = JSON.parse(savedUser)
//         setCurrentUser(user)

//         const role = user.role?.toLowerCase()
//         if (role !== 'admin' && role !== 'accounts') {
//           router.replace('/')
//           return
//         }

//         fetchData(user)
//       } catch (e) {
//         console.error(e)
//         router.replace('/')
//       }
//     } else {
//       router.replace('/')
//     }
//   }, [router])

//   const fetchData = async (user: any) => {
//     try {
//       const params = new URLSearchParams()
//       params.set('role', user.role)
//       params.set('userId', user.user_id)
//       params.set('userName', user.name)

//       const [billsRes, usersRes] = await Promise.all([
//         fetch(`/api/bills?${params.toString()}`),
//         fetch('/api/users')
//       ])

//       const billsData = await billsRes.json()
//       if (billsRes.ok && billsData.bills) {
//         const paid = billsData.bills.filter(
//           (b: any) => b.status?.toLowerCase() === 'paid'
//         )
//         setPaidBills(paid)
//       }

//       if (usersRes.ok) {
//         const usersData = await usersRes.json()
//         // API থেকে ইউজার ডাটা যেকোনো ফরম্যাটেই আসুক না কেন তা রিকভার করা
//         const userList = Array.isArray(usersData) 
//           ? usersData 
//           : (usersData.users || usersData.data || usersData.allUsers || [])
//         setAllUsers(userList)
//       }
//     } catch (error) {
//       console.error('Failed to load paid history data:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const formatLocalDate = (date: Date) => {
//     const year = date.getFullYear()
//     const month = String(date.getMonth() + 1).padStart(2, '0')
//     const day = String(date.getDate()).padStart(2, '0')
//     return `${year}-${month}-${day}`
//   }

//   const today = new Date()
//   const todayStr = formatLocalDate(today)

//   const yesterdayDate = new Date(today)
//   yesterdayDate.setDate(yesterdayDate.getDate() - 1)
//   const yesterdayStr = formatLocalDate(yesterdayDate)

//   let totalCollected = 0
//   let todayCollected = 0
//   let yesterdayCollected = 0

//   const supportTodayMap: Record<string, number> = {}
//   const dateWiseMap: Record<string, number> = {}

//   paidBills.forEach((bill: any) => {
//     const amount = Number(bill.amount) || 0
//     totalCollected += amount

//     let billDateOnly = todayStr
//     if (bill.paid_at) {
//       billDateOnly = formatLocalDate(new Date(bill.paid_at))
//     } else if (bill.date) {
//       billDateOnly = formatLocalDate(new Date(bill.date))
//     }

//     if (billDateOnly === todayStr) {
//       todayCollected += amount
//       const creator = bill.created_by || 'Unknown Support'
//       supportTodayMap[creator] = (supportTodayMap[creator] || 0) + amount
//     }

//     if (billDateOnly === yesterdayStr) {
//       yesterdayCollected += amount
//     }

//     dateWiseMap[billDateOnly] = (dateWiseMap[billDateOnly] || 0) + amount
//   })

//   const supportTodayList: { name: string; amount: number }[] = Object.entries(supportTodayMap).map(
//     ([name, amount]) => ({ name, amount })
//   )

//   const chartData: { date: string; amount: number }[] = Object.keys(dateWiseMap)
//     .sort()
//     .map((date) => ({
//       date,
//       amount: dateWiseMap[date],
//     }))

//   // 🔥 ফলব্যাক: API থেকে ইউজার না আসলে বিলের মধ্যে থাকা created_by নামগুলো দিয়ে সাপোর্ট লিস্ট বানিয়ে নেওয়া
//   let supportUsers = allUsers.filter(
//     (u: any) => {
//       const r = u.role?.toLowerCase()
//       return r === 'support' || r === 'admin' || r === 'manager' || r === 'accounts'
//     }
//   )

//   if (supportUsers.length === 0) {
//     const uniqueCreators = Array.from(new Set(paidBills.map((b: any) => b.created_by).filter(Boolean)))
//     supportUsers = uniqueCreators.map((name, idx) => ({ id: idx + 1, name, role: 'support' }))
//   }

//   const formatMoney = (amount: number) =>
//     `৳ ${amount.toLocaleString('en-IN', {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2,
//     })}`

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] text-slate-600 font-semibold text-sm">
//         Loading Paid History Ledger...
//       </div>
//     )
//   }

//   return (
//     <ProtectedRoute>
//       <main className="min-h-screen overflow-hidden bg-[#F8FAFC] text-[#0F172A] antialiased" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif' }}>
//         <div className="relative mx-auto max-w-[1500px] space-y-6 px-4 py-6 sm:px-6 md:py-8 lg:px-10">
          
//           {/* Header */}
//           <header className="relative overflow-hidden rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
//             <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
//               <div className="space-y-3">
//                 <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50/80 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-teal-800">
//                   <span className="relative flex h-2 w-2">
//                     <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
//                     <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-600" />
//                   </span>
//                   Logged in as: {currentUser?.name} ({currentUser?.role})
//                 </div>

//                 <div>
//                   <h1 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl text-slate-900">
//                     Paid Bill <span className="text-teal-600 font-extrabold">History & Ledger</span>
//                   </h1>
//                   <p className="mt-1.5 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-500 font-normal">
//                     Review and audit all successfully settled subscriber payments, daily collection summaries, and support performance metrics.
//                   </p>
//                 </div>
//               </div>

//               <Link
//                 href="/"
//                 className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs sm:text-sm font-semibold tracking-wide text-white shadow-xs transition-all hover:bg-slate-800 active:scale-95 lg:self-center"
//               >
//                 <ArrowLeft size={16} className="text-teal-400" />
//                 Back to Dashboard
//               </Link>
//             </div>
//           </header>

//           {/* Metric Cards */}
//           <section className="space-y-4">
//             <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
//               <article className="relative overflow-hidden rounded-[20px] border border-slate-200/80 bg-white p-6 shadow-xs">
//                 <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-teal-500 to-emerald-600" />
//                 <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Today's Paid Collections</p>
//                 <div className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl tabular-nums">
//                   {formatMoney(todayCollected)}
//                 </div>
//                 <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500 font-medium">
//                   <span className="tracking-wide">{todayStr}</span>
//                   <span className="text-teal-600 font-bold uppercase tracking-wider text-[10px]">Verified</span>
//                 </div>
//               </article>

//               <article className="relative overflow-hidden rounded-[20px] border border-slate-200/80 bg-white p-6 shadow-xs">
//                 <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-indigo-500 to-slate-700" />
//                 <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Yesterday's Paid Collections</p>
//                 <div className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl tabular-nums">
//                   {formatMoney(yesterdayCollected)}
//                 </div>
//                 <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500 font-medium">
//                   <span className="tracking-wide">{yesterdayStr}</span>
//                   <span className="text-indigo-600 font-bold uppercase tracking-wider text-[10px]">Settled</span>
//                 </div>
//               </article>

//               <article className="relative overflow-hidden rounded-[20px] border border-slate-200/80 bg-white p-6 shadow-xs">
//                 <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-500 to-teal-600" />
//                 <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Lifetime Paid Bills</p>
//                 <div className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl tabular-nums">
//                   {formatMoney(totalCollected)}
//                 </div>
//                 <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500 font-medium">
//                   <span className="tracking-wide">{paidBills.length} total records</span>
//                   <span className="text-blue-600 font-bold uppercase tracking-wider text-[10px]">Lifetime</span>
//                 </div>
//               </article>
//             </div>
//           </section>

//           {/* Main Client Component */}
//           <section className="rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-xs sm:p-6">
//             <div className="mb-6 flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
//               <div>
//                 <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
//                   <ReceiptText size={20} className="text-teal-600" />
//                   Paid Transactions & Analytics Ledger
//                 </h2>
//                 <p className="text-xs text-slate-500 font-normal mt-0.5">
//                   Detailed listing and graphical summary of all cleared bill payments.
//                 </p>
//               </div>

//               <div className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-700 font-semibold">
//                 <Users size={15} className="text-teal-600" />
//                 {supportUsers.length} Active System Staff
//               </div>
//             </div>

//             <PaidHistoryClient
//               initialBills={paidBills}
//               chartData={chartData}
//               supportTodayList={supportTodayList}
//               supportUsers={supportUsers}
//             />
//           </section>

//         </div>
//       </main>
//     </ProtectedRoute>
//   )
// }



'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import PaidHistoryClient from './PaidHistoryClient'
import {
  ArrowLeft,
  ReceiptText,
  Users,
} from 'lucide-react'

export default function PaidHistoryPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [paidBills, setPaidBills] = useState<any[]>([])
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = sessionStorage.getItem('netbill_session_user')
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        setCurrentUser(user)

        const role = user.role?.toLowerCase()
        if (role !== 'admin' && role !== 'accounts') {
          router.replace('/')
          return
        }

        fetchData(user)
      } catch (e) {
        console.error(e)
        router.replace('/')
      }
    } else {
      router.replace('/')
    }
  }, [router])

  const fetchData = async (user: any) => {
    try {
      const params = new URLSearchParams()
      params.set('role', user.role)
      params.set('userId', user.user_id)
      params.set('userName', user.name)

      const [billsRes, usersRes] = await Promise.all([
        fetch(`/api/bills?${params.toString()}`),
        fetch('/api/users')
      ])

      const billsData = await billsRes.json()
      if (billsRes.ok && billsData.bills) {
        const paid = billsData.bills.filter(
          (b: any) => b.status?.toLowerCase() === 'paid'
        )
        setPaidBills(paid)
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        const userList = Array.isArray(usersData) 
          ? usersData 
          : (usersData.users || usersData.data || usersData.allUsers || [])
        setAllUsers(userList)
      }
    } catch (error) {
      console.error('Failed to load paid history data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const today = new Date()
  const todayStr = formatLocalDate(today)

  const yesterdayDate = new Date(today)
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterdayStr = formatLocalDate(yesterdayDate)

  let totalCollected = 0
  let todayCollected = 0
  let yesterdayCollected = 0

  const supportTodayMap: Record<string, number> = {}
  const dateWiseMap: Record<string, number> = {}

  paidBills.forEach((bill: any) => {
    const amount = Number(bill.amount) || 0
    totalCollected += amount

    let billDateOnly = todayStr
    if (bill.paid_at) {
      billDateOnly = formatLocalDate(new Date(bill.paid_at))
    } else if (bill.date) {
      billDateOnly = formatLocalDate(new Date(bill.date))
    }

    if (billDateOnly === todayStr) {
      todayCollected += amount
      const creator = bill.created_by || 'Unknown Support'
      supportTodayMap[creator] = (supportTodayMap[creator] || 0) + amount
    }

    if (billDateOnly === yesterdayStr) {
      yesterdayCollected += amount
    }

    dateWiseMap[billDateOnly] = (dateWiseMap[billDateOnly] || 0) + amount
  })

  const supportTodayList: { name: string; amount: number }[] = Object.entries(supportTodayMap).map(
    ([name, amount]) => ({ name, amount })
  )

  const chartData: { date: string; amount: number }[] = Object.keys(dateWiseMap)
    .sort()
    .map((date) => ({
      date,
      amount: dateWiseMap[date],
    }))

  let supportUsers = allUsers.filter(
    (u: any) => {
      const r = u.role?.toLowerCase()
      return r === 'support' || r === 'admin' || r === 'manager' || r === 'accounts'
    }
  )

  if (supportUsers.length === 0) {
    const uniqueCreators = Array.from(new Set(paidBills.map((b: any) => b.created_by).filter(Boolean)))
    supportUsers = uniqueCreators.map((name, idx) => ({ id: idx + 1, name, role: 'support' }))
  }

  const formatMoney = (amount: number) =>
    `৳ ${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-on-surface-variant font-label-lg">
        Loading Paid History Ledger...
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen overflow-hidden bg-surface text-on-surface">
        <div className="relative mx-auto max-w-[1500px] space-y-6 px-4 py-6 sm:px-6 md:py-8 lg:px-10">
          
          {/* Header */}
          <header className="relative overflow-hidden rounded-[24px] border border-outline-variant bg-surface-container-lowest p-6 shadow-xs sm:p-8">
            <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-secondary-container bg-secondary-container px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-on-secondary-container">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                  </span>
                  Logged in as: {currentUser?.name} ({currentUser?.role})
                </div>

                <div>
                  <h1 className="font-headline-lg sm:text-3xl lg:text-4xl text-on-surface">
                    Paid Bill <span className="text-primary font-extrabold">History & Ledger</span>
                  </h1>
                  <p className="mt-1.5 max-w-2xl font-body-md text-on-surface-variant font-normal">
                    Review and audit all successfully settled subscriber payments, daily collection summaries, and support performance metrics.
                  </p>
                </div>
              </div>

              <Link
                href="/"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-inverse-surface px-5 py-2.5 font-label-lg text-inverse-on-surface shadow-xs transition-all hover:opacity-90 active:scale-95 lg:self-center"
              >
                <ArrowLeft size={16} className="text-primary-fixed" />
                Back to Dashboard
              </Link>
            </div>
          </header>

          {/* Metric Cards */}
          <section className="space-y-4">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              <article className="relative overflow-hidden rounded-[20px] border border-outline-variant bg-surface-container-lowest p-6 shadow-xs">
                <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-primary to-emerald-600" />
                <p className="font-label-md uppercase tracking-wider text-secondary">Today's Paid Collections</p>
                <div className="mt-3 font-headline-lg text-on-surface sm:text-3xl font-data-mono">
                  {formatMoney(todayCollected)}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-outline-variant pt-3 font-body-sm text-secondary font-medium">
                  <span className="tracking-wide">{todayStr}</span>
                  <span className="text-primary font-bold uppercase tracking-wider text-[10px]">Verified</span>
                </div>
              </article>

              <article className="relative overflow-hidden rounded-[20px] border border-outline-variant bg-surface-container-lowest p-6 shadow-xs">
                <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-tertiary to-inverse-surface" />
                <p className="font-label-md uppercase tracking-wider text-secondary">Yesterday's Paid Collections</p>
                <div className="mt-3 font-headline-lg text-on-surface sm:text-3xl font-data-mono">
                  {formatMoney(yesterdayCollected)}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-outline-variant pt-3 font-body-sm text-secondary font-medium">
                  <span className="tracking-wide">{yesterdayStr}</span>
                  <span className="text-tertiary font-bold uppercase tracking-wider text-[10px]">Settled</span>
                </div>
              </article>

              <article className="relative overflow-hidden rounded-[20px] border border-outline-variant bg-surface-container-lowest p-6 shadow-xs">
                <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-tertiary to-primary" />
                <p className="font-label-md uppercase tracking-wider text-secondary">Total Lifetime Paid Bills</p>
                <div className="mt-3 font-headline-lg text-on-surface sm:text-3xl font-data-mono">
                  {formatMoney(totalCollected)}
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-outline-variant pt-3 font-body-sm text-secondary font-medium">
                  <span className="tracking-wide">{paidBills.length} total records</span>
                  <span className="text-tertiary font-bold uppercase tracking-wider text-[10px]">Lifetime</span>
                </div>
              </article>
            </div>
          </section>

          {/* Main Client Component */}
          <section className="rounded-[24px] border border-outline-variant bg-surface-container-lowest p-4 shadow-xs sm:p-6">
            <div className="mb-6 flex flex-col gap-2 border-b border-outline-variant pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-headline-md sm:text-lg text-on-surface flex items-center gap-2">
                  <ReceiptText size={20} className="text-primary" />
                  Paid Transactions & Analytics Ledger
                </h2>
                <p className="font-body-sm text-on-surface-variant font-normal mt-0.5">
                  Detailed listing and graphical summary of all cleared bill payments.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 self-start rounded-xl border border-outline-variant bg-surface-container-low px-3.5 py-2 font-label-lg text-on-surface font-semibold">
                <Users size={15} className="text-primary" />
                {supportUsers.length} Active System Staff
              </div>
            </div>

            <PaidHistoryClient
              initialBills={paidBills}
              chartData={chartData}
              supportTodayList={supportTodayList}
              supportUsers={supportUsers}
            />
          </section>

        </div>
      </main>
    </ProtectedRoute>
  )
}