



'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';

interface ActivityLog {
    id: number;
    action: 'CREATE_CLIENT' | 'UPDATE_CLIENT' | 'DELETE_CLIENT';
    clientId: string;
    clientName: string;
    details: string | null;
    performedBy: string;
    createdAt: string | null;
}

export default function SystemLogPage() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [actionFilter, setActionFilter] = useState<string>('All');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 30;

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/logs', { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setLogs(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Failed to fetch system logs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    // Filter and Search Logic
    const filteredLogs = useMemo(() => {
        return logs.filter((log) => {
            const q = searchQuery.toLowerCase().trim();
            const searchableText = [
                log.clientName,
                log.clientId,
                log.action,
                log.details,
                log.performedBy,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            const matchesSearch = !q || searchableText.includes(q);
            const matchesAction = actionFilter === 'All' || log.action === actionFilter;

            return matchesSearch && matchesAction;
        });
    }, [logs, searchQuery, actionFilter]);

    // Reset pagination on search or filter change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, actionFilter]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
    const paginatedLogs = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredLogs.slice(start, start + itemsPerPage);
    }, [filteredLogs, currentPage, itemsPerPage]);

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 p-3 sm:p-6 lg:p-8 transition-colors duration-200">
                <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                        <div>
                            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-wider mb-1">
                                <span className="material-symbols-outlined text-base">history</span>
                                Audit & Tracking
                            </div>
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                                System Activity Logs
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                Track all client creations, modifications, and deletions in real-time.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                            <button
                                onClick={fetchLogs}
                                className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                            >
                                <span className={`material-symbols-outlined text-base ${isLoading ? 'animate-spin' : ''}`}>
                                    refresh
                                </span>
                                Refresh
                            </button>
                            <Link
                                href="/client-info"
                                className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                            >
                                <span className="material-symbols-outlined text-base">arrow_back</span>
                                Back
                            </Link>
                        </div>
                    </div>

                    {/* Search & Action Filter Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                        {/* Search Input */}
                        <div className="sm:col-span-8 relative flex items-center">
                            <span className="material-symbols-outlined absolute left-3.5 text-slate-400 text-base">search</span>
                            <input
                                type="text"
                                placeholder="Search by client name, ID, details, or admin name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-9 py-2.5 text-xs bg-slate-50/80 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:bg-white dark:focus:bg-slate-800/90 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 text-slate-400 hover:text-rose-500 cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                            )}
                        </div>

                        {/* Action Type Filter */}
                        <div className="sm:col-span-4 relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-teal-600 dark:text-teal-400 text-base pointer-events-none">
                                filter_list
                            </span>
                            <select
                                value={actionFilter}
                                onChange={(e) => setActionFilter(e.target.value)}
                                className="appearance-none w-full pl-9 pr-8 py-2.5 text-xs font-semibold bg-slate-50/80 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl cursor-pointer hover:bg-white dark:hover:bg-slate-800/90 focus:bg-white dark:focus:bg-slate-800/90 focus:outline-none focus:ring-2 focus:ring-teal-500/25 transition-all"
                            >
                                <option value="All" className="bg-white dark:bg-slate-900">All Actions (Add/Update/Delete)</option>
                                <option value="CREATE_CLIENT" className="bg-white dark:bg-slate-900">Create / Add</option>
                                <option value="UPDATE_CLIENT" className="bg-white dark:bg-slate-900">Update / Edit</option>
                                <option value="DELETE_CLIENT" className="bg-white dark:bg-slate-900">Delete</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">
                                unfold_more
                            </span>
                        </div>
                    </div>

                    {/* Logs List Container */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
                        {isLoading ? (
                            <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                                <div className="w-8 h-8 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Loading activity logs...</p>
                            </div>
                        ) : paginatedLogs.length === 0 ? (
                            <div className="py-20 text-center flex flex-col items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-slate-300 dark:text-slate-700 text-4xl">folder_off</span>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">No activity logs found</p>
                                <p className="text-xs text-slate-400">Try changing your search keywords or action filter.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {paginatedLogs.map((log) => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                                    >
                                        <div className="flex items-start gap-3 min-w-0">
                                            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shrink-0 font-bold ${log.action === 'CREATE_CLIENT'
                                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                                                : log.action === 'UPDATE_CLIENT'
                                                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                                                    : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                                                }`}>
                                                <span className="material-symbols-outlined text-base sm:text-lg">
                                                    {log.action === 'CREATE_CLIENT' ? 'person_add' : log.action === 'UPDATE_CLIENT' ? 'edit_note' : 'person_remove'}
                                                </span>
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider ${log.action === 'CREATE_CLIENT'
                                                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50'
                                                        : log.action === 'UPDATE_CLIENT'
                                                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50'
                                                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50'
                                                        }`}>
                                                        {log.action.replace('_', ' ')}
                                                    </span>
                                                    <span className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate max-w-[180px] sm:max-w-xs">
                                                        {log.clientName}
                                                    </span>
                                                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                        {log.clientId}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 break-words">
                                                    {log.details || 'No additional details provided.'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex md:flex-col items-center md:items-end justify-between pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 shrink-0 text-left md:text-right">
                                            <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                                {log.createdAt ? (
                                                    new Date(log.createdAt).toLocaleString('en-US', {
                                                        timeZone: 'Asia/Dhaka',
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        hour12: true,
                                                    })
                                                ) : (
                                                    '-'
                                                )}
                                            </div>
                                            <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                                                By: <span className="font-bold text-slate-700 dark:text-slate-300">{log.performedBy || 'Admin'}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Pagination Bar (30 items per page) */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Showing <span className="font-bold text-slate-800 dark:text-slate-200">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                    {Math.min(currentPage * itemsPerPage, filteredLogs.length)}
                                </span>{' '}
                                of <span className="font-bold text-teal-700 dark:text-teal-400">{filteredLogs.length}</span> logs (30 per page)
                            </p>

                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(1)}
                                    className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-teal-50 dark:hover:bg-slate-800 hover:text-teal-600 dark:hover:text-teal-400 disabled:opacity-30 cursor-pointer transition-all"
                                    title="First Page"
                                >
                                    <span className="material-symbols-outlined text-sm">first_page</span>
                                </button>

                                <button
                                    type="button"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-slate-800 hover:text-teal-700 dark:hover:text-teal-400 disabled:opacity-30 cursor-pointer transition-all flex items-center gap-0.5"
                                >
                                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                                    <span>Prev</span>
                                </button>

                                <div className="flex items-center gap-1 px-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                                        .filter(
                                            (page) =>
                                                page === 1 ||
                                                page === totalPages ||
                                                (page >= currentPage - 1 && page <= currentPage + 1)
                                        )
                                        .map((page, index, array) => {
                                            const showEllipsis = index > 0 && page - array[index - 1] > 1;
                                            return (
                                                <React.Fragment key={page}>
                                                    {showEllipsis && <span className="px-1 text-slate-400 text-xs">...</span>}
                                                    <button
                                                        type="button"
                                                        onClick={() => setCurrentPage(page)}
                                                        className={`min-w-[32px] h-[32px] text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center justify-center ${currentPage === page
                                                            ? 'bg-teal-600 text-white shadow-sm'
                                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                            }`}
                                                    >
                                                        {page}
                                                    </button>
                                                </React.Fragment>
                                            );
                                        })}
                                </div>

                                <button
                                    type="button"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-slate-800 hover:text-teal-700 dark:hover:text-teal-400 disabled:opacity-30 cursor-pointer transition-all flex items-center gap-0.5"
                                >
                                    <span>Next</span>
                                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                                </button>

                                <button
                                    type="button"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(totalPages)}
                                    className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-teal-50 dark:hover:bg-slate-800 hover:text-teal-600 dark:hover:text-teal-400 disabled:opacity-30 cursor-pointer transition-all"
                                    title="Last Page"
                                >
                                    <span className="material-symbols-outlined text-sm">last_page</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}