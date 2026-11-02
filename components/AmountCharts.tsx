

'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { DashboardStats } from '@/lib/types';

interface AmountChartsProps {
  stats: DashboardStats;
}

export default function AmountCharts({ stats }: AmountChartsProps) {
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  const approvedTk = stats.approvedVolumeTk || 0;
  const paidTk = stats.paidVolumeTk || 0;
  const pendingTk = stats.pendingVolumeTk || 0;
  const rejectedTk = stats.rejectedVolumeTk || 0;

  // Paid ke bad diye shudhu active status gulo diye pie chart er total volume dhorchi
  const chartTotalTk = approvedTk + pendingTk + rejectedTk || 1;

  const approvedPct = Math.round((approvedTk / chartTotalTk) * 100) || 0;
  const paidPct = Math.round((paidTk / (stats.totalVolumeTk || 1)) * 100) || 0;
  const pendingPct = Math.round((pendingTk / chartTotalTk) * 100) || 0;
  const rejectedPct = Math.round((rejectedTk / chartTotalTk) * 100) || 0;

  // Donut chart calculations (circumference = 2 * PI * r = 2 * 3.14159 * 42 = 263.89)
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  const approvedStroke = (approvedTk / chartTotalTk) * circumference;
  const pendingStroke = (pendingTk / chartTotalTk) * circumference;
  const rejectedStroke = (rejectedTk / chartTotalTk) * circumference;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-md">
      {/* 1. Donut Pie Chart Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 shadow-xs flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-600" />
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Amount (TK) Distribution
            </h3>
          </div>
          <span className="text-xs font-mono text-secondary px-2 py-0.5 rounded bg-surface-container">
            Total: ৳{stats.totalVolumeTk.toLocaleString()}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-2">
          {/* SVG Pie/Donut Chart */}
          <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 110 110">
              {/* Background ring */}
              <circle
                cx="55"
                cy="55"
                r={radius}
                fill="transparent"
                stroke="#e2e8f0"
                strokeWidth="14"
              />

              {/* Approved segment (Teal) */}
              {approvedTk > 0 && (
                <circle
                  cx="55"
                  cy="55"
                  r={radius}
                  fill="transparent"
                  stroke="#0d9488"
                  strokeWidth={hoveredSlice === 'approved' ? '18' : '14'}
                  strokeDasharray={`${approvedStroke} ${circumference}`}
                  strokeDashoffset="0"
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredSlice('approved')}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
              )}

              {/* Pending segment (Amber) */}
              {pendingTk > 0 && (
                <circle
                  cx="55"
                  cy="55"
                  r={radius}
                  fill="transparent"
                  stroke="#f59e0b"
                  strokeWidth={hoveredSlice === 'pending' ? '18' : '14'}
                  strokeDasharray={`${pendingStroke} ${circumference}`}
                  strokeDashoffset={-approvedStroke}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredSlice('pending')}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
              )}

              {/* Rejected segment (Rose) */}
              {rejectedTk > 0 && (
                <circle
                  cx="55"
                  cy="55"
                  r={radius}
                  fill="transparent"
                  stroke="#f43f5e"
                  strokeWidth={hoveredSlice === 'rejected' ? '18' : '14'}
                  strokeDasharray={`${rejectedStroke} ${circumference}`}
                  strokeDashoffset={-(approvedStroke + pendingStroke)}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredSlice('rejected')}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
              )}
            </svg>

            {/* Centered Donut Stat */}
            <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-[10px] uppercase font-bold text-secondary tracking-wider">
                {hoveredSlice ? hoveredSlice.toUpperCase() : 'APPROVED'}
              </span>
              <span className="text-xl font-bold font-data-mono text-teal-700">
                {hoveredSlice === 'pending'
                  ? `${pendingPct}%`
                  : hoveredSlice === 'rejected'
                    ? `${rejectedPct}%`
                    : `${approvedPct}%`}
              </span>
              <span className="text-[11px] font-mono text-secondary">
                ৳
                {hoveredSlice === 'pending'
                  ? pendingTk.toLocaleString()
                  : hoveredSlice === 'rejected'
                    ? rejectedTk.toLocaleString()
                    : approvedTk.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Clean minimal Legend */}
          <div className="flex flex-col gap-2.5 w-full max-w-[200px]">

            <div
              onMouseEnter={() => setHoveredSlice('approved')}
              onMouseLeave={() => setHoveredSlice(null)}
              className={`p-2 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${hoveredSlice === 'approved'
                  ? 'bg-teal-50 dark:bg-teal-950/40'
                  : 'bg-surface-container-low dark:bg-surface-container-high/40'
                }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-teal-600 dark:bg-teal-500 shrink-0" />
                <span className="text-xs font-semibold text-on-surface dark:text-slate-200">Approved</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold font-data-mono text-teal-700 dark:text-teal-400">
                  ৳{approvedTk.toLocaleString()}
                </span>
                <span className="text-[10px] text-secondary dark:text-slate-400 block">{approvedPct}%</span>
              </div>
            </div>

            <div
              onMouseEnter={() => setHoveredSlice('pending')}
              onMouseLeave={() => setHoveredSlice(null)}
              className={`p-2 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${hoveredSlice === 'pending'
                  ? 'bg-amber-50 dark:bg-amber-950/40'
                  : 'bg-surface-container-low dark:bg-surface-container-high/40'
                }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-amber-500 shrink-0" />
                <span className="text-xs font-semibold text-on-surface dark:text-slate-200">Pending</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold font-data-mono text-amber-700 dark:text-amber-400">
                  ৳{pendingTk.toLocaleString()}
                </span>
                <span className="text-[10px] text-secondary dark:text-slate-400 block">{pendingPct}%</span>
              </div>
            </div>

            <div
              onMouseEnter={() => setHoveredSlice('rejected')}
              onMouseLeave={() => setHoveredSlice(null)}
              className={`p-2 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${hoveredSlice === 'rejected'
                  ? 'bg-rose-50 dark:bg-rose-950/40'
                  : 'bg-surface-container-low dark:bg-surface-container-high/40'
                }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-rose-500 shrink-0" />
                <span className="text-xs font-semibold text-on-surface dark:text-slate-200">Rejected</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold font-data-mono text-rose-700 dark:text-rose-400">
                  ৳{rejectedTk.toLocaleString()}
                </span>
                <span className="text-[10px] text-secondary dark:text-slate-400 block">{rejectedPct}%</span>
              </div>
            </div>


          </div>
        </div>
      </motion.div>

      {/* 2. Amount Volume Comparison Bar Graph */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 shadow-xs flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-teal-600" />
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Volume Breakdown (TK)
            </h3>
          </div>
          <span className="text-xs text-secondary font-medium">Real-time Metrics</span>
        </div>

        <div className="flex flex-col gap-4 my-2">
          {/* Approved Bar */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-teal-800 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-teal-600">verified</span>
                <span>Approved Volume</span>
              </span>
              <span className="font-data-mono font-bold text-on-surface">
                ৳{approvedTk.toLocaleString()} ({Math.round((approvedTk / (stats.totalVolumeTk || 1)) * 100)}%)
              </span>
            </div>
            <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.round((approvedTk / (stats.totalVolumeTk || 1)) * 100)}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full bg-teal-600 rounded-full"
              />
            </div>
          </div>

          {/* Paid Bar */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-800 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-emerald-600">payments</span>
                <span>Paid & Cleared Volume</span>
              </span>
              <span className="font-data-mono font-bold text-on-surface">
                ৳{paidTk.toLocaleString()} ({paidPct}%)
              </span>
            </div>
            <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${paidPct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.05 }}
                className="h-full bg-emerald-600 rounded-full"
              />
            </div>
          </div>

          {/* Pending Bar */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-amber-800 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-amber-500">pending</span>
                <span>Pending Approval</span>
              </span>
              <span className="font-data-mono font-bold text-on-surface">
                ৳{pendingTk.toLocaleString()} ({Math.round((pendingTk / (stats.totalVolumeTk || 1)) * 100)}%)
              </span>
            </div>
            <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.round((pendingTk / (stats.totalVolumeTk || 1)) * 100)}%` }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
                className="h-full bg-amber-500 rounded-full"
              />
            </div>
          </div>

          {/* Rejected Bar */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-rose-800 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-rose-500">cancel</span>
                <span>Rejected Volume</span>
              </span>
              <span className="font-data-mono font-bold text-on-surface">
                ৳{rejectedTk.toLocaleString()} ({Math.round((rejectedTk / (stats.totalVolumeTk || 1)) * 100)}%)
              </span>
            </div>
            <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.round((rejectedTk / (stats.totalVolumeTk || 1)) * 100)}%` }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
                className="h-full bg-rose-500 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Mini stats summary */}
        <div className="pt-3 border-t border-outline-variant/30 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div>
            <span className="text-secondary text-[11px] block">Approved Bills</span>
            <span className="font-bold text-teal-700">{stats.approvedBills}</span>
          </div>
          <div>
            <span className="text-secondary text-[11px] block">Paid Bills</span>
            <span className="font-bold text-emerald-600">{stats.paidBills ?? 0}</span>
          </div>
          <div>
            <span className="text-secondary text-[11px] block">Pending Bills</span>
            <span className="font-bold text-amber-600">{stats.pendingBills}</span>
          </div>
          <div>
            <span className="text-secondary text-[11px] block">Rejected Bills</span>
            <span className="font-bold text-rose-600">{stats.rejectedBills}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}