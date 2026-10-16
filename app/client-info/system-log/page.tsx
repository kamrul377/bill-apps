'use client';
import React, { useState, useEffect } from 'react';
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

    const filteredLogs = logs.filter((log) => {
        const q = searchQuery.toLowerCase();
        return (
            log.clientName?.toLowerCase().includes(q) ||
            log.clientId?.toLowerCase().includes(q) ||
            log.action?.toLowerCase().includes(q) ||
            log.details?.toLowerCase().includes(q)
        );
    });

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-slate-50/50 text-slate-800 p-4 sm:p-6 lg:p-8">
                <div className="max-w-6xl mx-auto space-y-6">
                    {/* Header Section */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                        <div>
                            <div className="flex items-center gap-2 text-teal-600 text-xs font-bold uppercase tracking-wider mb-1">
                                <span className="material-symbols-outlined text-base">history</span>
                                Audit & Tracking
                            </div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                System Activity Logs
                            </h1>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Track all client creations, modifications, and deletions in real-time.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={fetchLogs}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
                            >
                                <span className={`material-symbols-outlined text-base ${isLoading ? 'animate-spin' : ''}`}>
                                    refresh
                                </span>
                                Refresh
                            </button>
                            <Link
                                href="/client-info"
                                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                            >
                                <span className="material-symbols-outlined text-base">arrow_back</span>
                                Back to Clients
                            </Link>
                        </div>
                    </div>

                    {/* Search & Filter Bar */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
                        <span className="material-symbols-outlined text-slate-400 pl-2">search</span>
                        <input
                            type="text"
                            placeholder="Search by client name, ID, or action type..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                        />
                    </div>

                    {/* Logs Table/List Container */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                        {isLoading ? (
                            <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                                <div className="w-8 h-8 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
                                <p className="text-xs font-medium text-slate-500">Loading activity logs...</p>
                            </div>
                        ) : filteredLogs.length === 0 ? (
                            <div className="py-20 text-center flex flex-col items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-slate-300 text-4xl">folder_off</span>
                                <p className="text-sm font-bold text-slate-700">No activity logs found</p>
                                <p className="text-xs text-slate-400">Actions performed on clients will appear here.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {filteredLogs.map((log) => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                                    >
                                        <div className="flex items-start sm:items-center gap-3.5">
                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-bold ${log.action === 'CREATE_CLIENT'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : log.action === 'UPDATE_CLIENT'
                                                    ? 'bg-amber-100 text-amber-700'
                                                    : 'bg-rose-100 text-rose-700'
                                                }`}>
                                                <span className="material-symbols-outlined text-lg">
                                                    {log.action === 'CREATE_CLIENT' ? 'person_add' : log.action === 'UPDATE_CLIENT' ? 'edit_note' : 'person_remove'}
                                                </span>
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${log.action === 'CREATE_CLIENT'
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                        : log.action === 'UPDATE_CLIENT'
                                                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                        }`}>
                                                        {log.action.replace('_', ' ')}
                                                    </span>
                                                    <span className="font-bold text-slate-800 text-xs">
                                                        {log.clientName}
                                                    </span>
                                                    <span className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-600 border border-slate-200">
                                                        {log.clientId}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-600 mt-1">
                                                    {log.details || 'No additional details provided.'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0 sm:pl-4">
                                            <div className="text-[11px] font-semibold text-slate-700">
                                                {log.createdAt ? (
                                                    new Date(log.createdAt).toLocaleString('en-US', {
                                                        timeZone: 'Asia/Dhaka',
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        second: '2-digit',
                                                        hour12: true,
                                                    })
                                                ) : (
                                                    '-'
                                                )}
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-0.5">
                                                By: <span className="font-medium text-slate-600">{log.performedBy || 'Admin'}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}