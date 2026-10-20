
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
          {/* <header className="relative overflow-hidden rounded-[24px] border border-outline-variant bg-surface-container-lowest p-6 shadow-xs sm:p-8">
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
          </header> */}





          <header className="group relative isolate overflow-hidden rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm transition-all duration-300 hover:border-teal-200 sm:px-6">

            {/* Subtle background */}
            <div
              className="pointer-events-none absolute inset-0 -z-10"
              style={{
                background:
                  "radial-gradient(ellipse at top left, rgba(20,184,166,0.07), transparent 55%)",
              }}
            />

            {/* Minimal snowfall */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
            >
              {Array.from({ length: 16 }, (_, i) => (
                <span
                  key={i}
                  className={`paid-snowflake ${i < 10
                    ? "paid-snowflake-default"
                    : "paid-snowflake-hover"
                    }`}
                  style={{
                    left: `${(i * 43 + 11) % 100}%`,
                    top: `${-20 - ((i * 19) % 100)}px`,
                    width: `${2 + (i % 2)}px`,
                    height: `${2 + (i % 2)}px`,
                    animationDuration: `${5 + (i % 4)}s`,
                    animationDelay: `${-((i * 1.17) % 7)}s`,
                    ["--snow-drift" as string]: `${i % 2 ? 12 : -12}px`,
                  } as React.CSSProperties}
                />
              ))}
            </div>

            {/* Top border accent */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-teal-400 via-emerald-400 to-sky-400" />

            <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

              <div className="min-w-0">

                {/* User status */}
                <div className="mb-3 inline-flex max-w-full items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50/80 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  <span className="size-2 shrink-0 rounded-full bg-emerald-500" />
                  <span className="truncate">
                    {currentUser?.name} ({currentUser?.role})
                  </span>
                </div>

                <h1 className="text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">
                  Paid Bill{" "}
                  <span className="text-teal-600">History &amp; Ledger</span>
                </h1>

                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
                  Review settled payments, daily collections, and support performance.
                </p>
              </div>

              <Link
                href="/"
                className="group/back inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 active:scale-95 sm:self-center"
              >
                <ArrowLeft
                  size={16}
                  className="transition-transform group-hover/back:-translate-x-0.5"
                />
                Back to Dashboard
              </Link>

            </div>
          </header>





          {/* Metric Cards */}
          {/* <section className="space-y-4">
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
          </section> */}


          {/* Metric Cards */}
          <section className="space-y-4">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

              {/* Today's Collections */}
              <article
                className="metric-snow-card group relative overflow-hidden rounded-[20px] border border-outline-variant bg-surface-container-lowest p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{
                  "--metric-glow": "rgba(16,185,129,0.09)",
                  "--metric-particle": "#6ee7b7",
                } as React.CSSProperties}
              >
                <div className="metric-snow-layer" aria-hidden="true">
                  {Array.from({ length: 18 }, (_, i) => (
                    <span
                      key={i}
                      className="metric-snowflake"
                      style={{
                        "--x": `${(i * 37 + 11) % 97}%`,
                        "--size": `${2 + (i % 3)}px`,
                        "--duration": `${2.5 + (i % 5) * 0.7}s`,
                        "--delay": `${-((i * 0.73) % 5)}s`,
                        "--drift": `${(i % 2 ? 1 : -1) * (8 + (i % 4) * 5)}px`,
                      } as React.CSSProperties}
                    />
                  ))}
                </div>

                <div className="absolute inset-x-0 top-0 z-[1] h-[3px] bg-gradient-to-r from-primary to-emerald-500" />

                <div className="relative z-[1]">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-label-md uppercase tracking-wider text-secondary">
                      Today's Paid Collections
                    </p>
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-transform duration-300 group-hover:scale-110">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="5" width="18" height="16" rx="2" />
                        <path d="M16 3v4M8 3v4M3 11h18" />
                      </svg>
                    </span>
                  </div>

                  <div className="mt-5 font-headline-lg text-on-surface sm:text-3xl font-data-mono !text-2xl">
                    {formatMoney(todayCollected)}
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-outline-variant pt-4 font-body-sm text-secondary font-medium">
                    <span className="tracking-wide">{todayStr}</span>
                    <span className="text-primary font-bold uppercase tracking-wider text-[10px]">
                      Verified
                    </span>
                  </div>
                </div>
              </article>

              {/* Yesterday's Collections */}
              <article
                className="metric-snow-card group relative overflow-hidden rounded-[20px] border border-outline-variant bg-surface-container-lowest p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{
                  "--metric-glow": "rgba(59,130,246,0.09)",
                  "--metric-particle": "#93c5fd",
                } as React.CSSProperties}
              >
                <div className="metric-snow-layer" aria-hidden="true">
                  {Array.from({ length: 18 }, (_, i) => (
                    <span
                      key={i}
                      className="metric-snowflake"
                      style={{
                        "--x": `${(i * 37 + 11) % 97}%`,
                        "--size": `${2 + (i % 3)}px`,
                        "--duration": `${2.5 + (i % 5) * 0.7}s`,
                        "--delay": `${-((i * 0.73) % 5)}s`,
                        "--drift": `${(i % 2 ? 1 : -1) * (8 + (i % 4) * 5)}px`,
                      } as React.CSSProperties}
                    />
                  ))}
                </div>

                <div className="absolute inset-x-0 top-0 z-[1] h-[3px] bg-gradient-to-r from-tertiary to-blue-500" />

                <div className="relative z-[1]">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-label-md uppercase tracking-wider text-secondary">
                      Yesterday's Paid Collections
                    </p>
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-transform duration-300 group-hover:scale-110">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 7v5l3 2" />
                      </svg>
                    </span>
                  </div>

                  <div className="mt-5 font-headline-lg text-on-surface sm:text-3xl font-data-mono !text-2xl">
                    {formatMoney(yesterdayCollected)}
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-outline-variant pt-4 font-body-sm text-secondary font-medium">
                    <span className="tracking-wide">{yesterdayStr}</span>
                    <span className="text-tertiary font-bold uppercase tracking-wider text-[10px]">
                      Settled
                    </span>
                  </div>
                </div>
              </article>

              {/* Lifetime Collections */}
              <article
                className="metric-snow-card group relative overflow-hidden rounded-[20px] border border-outline-variant bg-surface-container-lowest p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg md:col-span-2 xl:col-span-1"
                style={{
                  "--metric-glow": "rgba(139,92,246,0.09)",
                  "--metric-particle": "#c4b5fd",
                } as React.CSSProperties}
              >
                <div className="metric-snow-layer" aria-hidden="true">
                  {Array.from({ length: 18 }, (_, i) => (
                    <span
                      key={i}
                      className="metric-snowflake"
                      style={{
                        "--x": `${(i * 37 + 11) % 97}%`,
                        "--size": `${2 + (i % 3)}px`,
                        "--duration": `${2.5 + (i % 5) * 0.7}s`,
                        "--delay": `${-((i * 0.73) % 5)}s`,
                        "--drift": `${(i % 2 ? 1 : -1) * (8 + (i % 4) * 5)}px`,
                      } as React.CSSProperties}
                    />
                  ))}
                </div>

                <div className="absolute inset-x-0 top-0 z-[1] h-[3px] bg-gradient-to-r from-tertiary to-primary" />

                <div className="relative z-[1]">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-label-md uppercase tracking-wider text-secondary">
                      Total Lifetime Paid Bills
                    </p>
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition-transform duration-300 group-hover:scale-110">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <ellipse cx="12" cy="5" rx="8" ry="3" />
                        <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
                        <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
                      </svg>
                    </span>
                  </div>

                  <div className="mt-5 font-headline-lg text-on-surface sm:text-3xl font-data-mono !text-2xl">
                    {formatMoney(totalCollected)}
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-outline-variant pt-4 font-body-sm text-secondary font-medium">
                    <span className="tracking-wide">{paidBills.length} total records</span>
                    <span className="text-tertiary font-bold uppercase tracking-wider text-[10px]">
                      Lifetime
                    </span>
                  </div>
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