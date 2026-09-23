'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { DashboardStats } from '@/lib/types';

interface AmountChartsProps {
  stats: DashboardStats;
}

export default function AmountCharts({ stats }: AmountChartsProps) {
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  const totalTk = stats.totalVolumeTk || 1;
  const approvedTk = stats.approvedVolumeTk || 0;
  const pendingTk = stats.pendingVolumeTk || 0;
  const rejectedTk = stats.rejectedVolumeTk || 0;

  const approvedPct = Math.round((approvedTk / totalTk) * 100) || 0;
  const pendingPct = Math.round((pendingTk / totalTk) * 100) || 0;
  const rejectedPct = Math.round((rejectedTk / totalTk) * 100) || 0;

  // Donut chart calculations (circumference = 2 * PI * r = 2 * 3.14159 * 42 = 263.89)
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  const approvedStroke = (approvedTk / totalTk) * circumference;
  const pendingStroke = (pendingTk / totalTk) * circumference;
  const rejectedStroke = (rejectedTk / totalTk) * circumference;

  const pendingOffset = circumference - approvedStroke;
  const rejectedOffset = circumference - (approvedStroke + pendingStroke);

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
              className={`p-2 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                hoveredSlice === 'approved' ? 'bg-teal-50' : 'bg-surface-container-low'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-teal-600 shrink-0" />
                <span className="text-xs font-semibold text-on-surface">Approved</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold font-data-mono text-teal-700">
                  ৳{approvedTk.toLocaleString()}
                </span>
                <span className="text-[10px] text-secondary block">{approvedPct}%</span>
              </div>
            </div>

            <div
              onMouseEnter={() => setHoveredSlice('pending')}
              onMouseLeave={() => setHoveredSlice(null)}
              className={`p-2 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                hoveredSlice === 'pending' ? 'bg-amber-50' : 'bg-surface-container-low'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-amber-500 shrink-0" />
                <span className="text-xs font-semibold text-on-surface">Pending</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold font-data-mono text-amber-700">
                  ৳{pendingTk.toLocaleString()}
                </span>
                <span className="text-[10px] text-secondary block">{pendingPct}%</span>
              </div>
            </div>

            <div
              onMouseEnter={() => setHoveredSlice('rejected')}
              onMouseLeave={() => setHoveredSlice(null)}
              className={`p-2 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                hoveredSlice === 'rejected' ? 'bg-rose-50' : 'bg-surface-container-low'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-rose-500 shrink-0" />
                <span className="text-xs font-semibold text-on-surface">Rejected</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold font-data-mono text-rose-700">
                  ৳{rejectedTk.toLocaleString()}
                </span>
                <span className="text-[10px] text-secondary block">{rejectedPct}%</span>
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
                ৳{approvedTk.toLocaleString()} ({approvedPct}%)
              </span>
            </div>
            <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${approvedPct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full bg-teal-600 rounded-full"
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
                ৳{pendingTk.toLocaleString()} ({pendingPct}%)
              </span>
            </div>
            <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pendingPct}%` }}
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
                ৳{rejectedTk.toLocaleString()} ({rejectedPct}%)
              </span>
            </div>
            <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${rejectedPct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
                className="h-full bg-rose-500 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Mini stats summary */}
        <div className="pt-3 border-t border-outline-variant/30 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <span className="text-secondary text-[11px] block">Approved Bills</span>
            <span className="font-bold text-teal-700">{stats.approvedBills}</span>
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
