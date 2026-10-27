

'use client';
import React, {
    useState,
    useEffect,
    useMemo,
    useRef,
} from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

import {
    ClientInfo,
    POC,
} from '@/types/client';

import ConfirmDialog from '@/components/ConfirmDialog';
import ClientDetailsModal from '@/components/ClientDetailsModal';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ClientInfoPage() {
    // --------------------------------------------------
    // Data
    // --------------------------------------------------
    const [clients, setClients] = useState<ClientInfo[]>([]);
    const [pocs, setPocs] = useState<POC[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [isClientSaving, setIsClientSaving] = useState(false);

    // --------------------------------------------------
    // User Role & Permissions State
    // --------------------------------------------------
    const [currentUserRole, setCurrentUserRole] = useState<string>('');

    // --------------------------------------------------
    // Controls & Filters & Sorting
    // --------------------------------------------------
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Connected' | 'Disconnected'>('All');
    const [pocFilter, setPocFilter] = useState<string>('All');
    
    // Dynamic Sorting State
    const [sortField, setSortField] = useState<string>('id');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

    // --------------------------------------------------
    // Pagination (Per page 30 Clients)
    // --------------------------------------------------
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 30;

    // --------------------------------------------------
    // Client Modals
    // --------------------------------------------------
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [selectedClientForView, setSelectedClientForView] = useState<ClientInfo | null>(null);
    const [editingClient, setEditingClient] = useState<ClientInfo | null>(null);

    // --------------------------------------------------
    // POC Modals
    // --------------------------------------------------
    const [isPocModalOpen, setIsPocModalOpen] = useState(false);
    const [isPocManagementOpen, setIsPocManagementOpen] = useState(false);
    const [editingPoc, setEditingPoc] = useState<POC | null>(null);

    // --------------------------------------------------
    // Delete Targets
    // --------------------------------------------------
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
    const [deletePocTargetId, setDeletePocTargetId] = useState<string | null>(null);

    // --------------------------------------------------
    // Toast Notification State
    // --------------------------------------------------
    const [toast, setToast] = useState<{
        show: boolean;
        message: string;
        type: 'success' | 'error' | 'warning';
    }>({
        show: false,
        message: '',
        type: 'success',
    });

    const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

    const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
        if (toastTimerRef.current) {
            clearTimeout(toastTimerRef.current);
        }

        setToast({ show: true, message, type });

        toastTimerRef.current = setTimeout(() => {
            setToast((prev) => ({ ...prev, show: false }));
        }, 3000);
    };

    // --------------------------------------------------
    // Client Form State
    // --------------------------------------------------
    const [clientForm, setClientForm] = useState({
        clientId: '',
        clientName: '',
        clientPhone: '',
        primaryIp: '',
        primaryOnu: '',
        secondaryIp: '',
        secondaryOnu: '',
        location: '',
        pocId: '',
        status: 'Connected' as 'Connected' | 'Disconnected',
        description: '',
    });

    // --------------------------------------------------
    // POC Form State
    // --------------------------------------------------
    const [pocForm, setPocForm] = useState({
        name: '',
        phone: '',
        designation: '',
    });

    // ==================================================
    // LOAD USER ROLE & INITIAL DATA
    // ==================================================
    useEffect(() => {
        const storedUser = sessionStorage.getItem('netbill_session_user');
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                const role = userData.role || userData.designation || userData.type || '';
                setCurrentUserRole(role.toLowerCase());
            } catch {
                setCurrentUserRole(storedUser.toLowerCase());
            }
        }

        const fetchInitialData = async () => {
            setIsLoading(true);

            try {
                const [pocsRes, clientsRes] = await Promise.all([
                    fetch('/api/pocs', { cache: 'no-store' }),
                    fetch('/api/clients', { cache: 'no-store' }),
                ]);

                if (pocsRes.ok) {
                    const pocsData = await pocsRes.json();
                    setPocs(Array.isArray(pocsData) ? pocsData : pocsData?.pocs || pocsData?.data || []);
                }

                if (clientsRes.ok) {
                    const clientsData = await clientsRes.json();
                    setClients(Array.isArray(clientsData) ? clientsData : clientsData?.clients || clientsData?.data || []);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                showToast('Failed to load client information.', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    const canDeleteClient = () => {
        const role = currentUserRole;
        if (!role) return true;
        return role.includes('admin') || role.includes('manager');
    };

    // ==================================================
    // DEBOUNCE SEARCH
    // ==================================================
    useEffect(() => {
        setIsSearching(true);
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
            setIsSearching(false);
        }, 200);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // ==================================================
    // SORT HANDLER
    // ==================================================
    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // ==================================================
    // FILTER & SORT LOGIC
    // ==================================================
    const filteredClients = useMemo(() => {
        return clients
            .filter((client) => {
                const q = debouncedSearchQuery.toLowerCase().trim();
                const searchableText = [
                    client.clientId,
                    client.clientName,
                    client.clientPhone,
                    client.pocName,
                    client.primaryOnu,
                    client.primaryIp,
                    client.secondaryOnu,
                    client.secondaryIp,
                    client.location,
                    client.description,
                ]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();

                const matchesSearch = !q || searchableText.includes(q);
                const matchesStatus = statusFilter === 'All' || client.status === statusFilter;
                const matchesPoc = pocFilter === 'All' || client.pocId?.toString() === pocFilter;

                return matchesSearch && matchesStatus && matchesPoc;
            })
            .sort((a, b) => {
                let valA: any = '';
                let valB: any = '';

                switch (sortField) {
                    case 'clientName':
                        valA = (a.clientName || '').toLowerCase();
                        valB = (b.clientName || '').toLowerCase();
                        break;
                    case 'clientPhone':
                        valA = (a.clientPhone || '').toLowerCase();
                        valB = (b.clientPhone || '').toLowerCase();
                        break;
                    case 'primaryLink':
                        valA = (a.primaryIp || '').toLowerCase();
                        valB = (b.primaryIp || '').toLowerCase();
                        break;
                    case 'secondaryLink':
                        valA = (a.secondaryIp || '').toLowerCase();
                        valB = (b.secondaryIp || '').toLowerCase();
                        break;
                    case 'location':
                        valA = (a.location || '').toLowerCase();
                        valB = (b.location || '').toLowerCase();
                        break;
                    case 'pocName':
                        valA = (a.pocName || '').toLowerCase();
                        valB = (b.pocName || '').toLowerCase();
                        break;
                    case 'status':
                        valA = (a.status || '').toLowerCase();
                        valB = (b.status || '').toLowerCase();
                        break;
                    case 'id':
                    default:
                        valA = Number(a.id);
                        valB = Number(b.id);
                        break;
                }

                if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
                if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
    }, [clients, debouncedSearchQuery, statusFilter, pocFilter, sortField, sortDirection]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchQuery, statusFilter, pocFilter, sortField, sortDirection]);

    // ==================================================
    // PAGINATION
    // ==================================================
    const totalPages = Math.ceil(filteredClients.length / itemsPerPage) || 1;

    const paginatedClients = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredClients.slice(start, start + itemsPerPage);
    }, [filteredClients, currentPage, itemsPerPage]);

    // ==================================================
    // MODAL OPEN HANDLERS
    // ==================================================
    const handleOpenEditModal = (client: ClientInfo, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setSelectedClientForView(null);
        setEditingClient(client);

        setClientForm({
            clientId: client.clientId || '',
            clientName: client.clientName || '',
            clientPhone: client.clientPhone || '',
            primaryIp: client.primaryIp || '',
            primaryOnu: client.primaryOnu || '',
            secondaryIp: client.secondaryIp || '',
            secondaryOnu: client.secondaryOnu || '',
            location: client.location || '',
            pocId: client.pocId?.toString() || '',
            status: client.status || 'Connected',
            description: client.description || '',
        });

        setIsClientModalOpen(true);
    };

    const handleOpenAddModal = () => {
        setSelectedClientForView(null);
        setEditingClient(null);

        setClientForm({
            clientId: '',
            clientName: '',
            clientPhone: '',
            primaryIp: '',
            primaryOnu: '',
            secondaryIp: '',
            secondaryOnu: '',
            location: '',
            pocId: '',
            status: 'Connected',
            description: '',
        });

        setIsClientModalOpen(true);
    };

    // ==================================================
    // DELETE CLIENT
    // ==================================================
    const triggerDelete = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!canDeleteClient()) {
            showToast('Access Denied: Only Admin and Manager can delete client records.', 'error');
            return;
        }
        setDeleteTargetId(id);
    };

    const confirmDelete = async () => {
        if (!deleteTargetId) return;

        try {
            const res = await fetch(`/api/clients/${deleteTargetId}`, { method: 'DELETE' });
            const data = await res.json().catch(() => null);

            if (!res.ok) {
                showToast(data?.error || 'Failed to delete client.', 'error');
                return;
            }

            setClients((prev) => prev.filter((client) => client.id.toString() !== deleteTargetId.toString()));
            if (selectedClientForView?.id.toString() === deleteTargetId.toString()) {
                setSelectedClientForView(null);
            }

            showToast('Client deleted successfully!', 'error');
        } catch (error) {
            console.error('Error deleting client:', error);
            showToast('Failed to delete client.', 'error');
        } finally {
            setDeleteTargetId(null);
        }
    };

    // ==================================================
    // POC HANDLERS
    // ==================================================
    const handleOpenAddPoc = () => {
        setIsPocManagementOpen(false);
        setEditingPoc(null);
        setPocForm({ name: '', phone: '', designation: '' });
        setIsPocModalOpen(true);
    };

    const handleEditPoc = (poc: POC) => {
        setIsPocManagementOpen(false);
        setEditingPoc(poc);
        setPocForm({ name: poc.name || '', phone: '', designation: '' });
        setIsPocModalOpen(true);
    };

    const handleSavePoc = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pocForm.name.trim()) {
            showToast('POC name is required!', 'error');
            return;
        }

        try {
            const url = editingPoc ? `/api/pocs/${editingPoc.id}` : '/api/pocs';
            const method = editingPoc ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: pocForm.name.trim() }),
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                showToast(data?.error || `Failed to ${editingPoc ? 'update' : 'add'} POC.`, 'error');
                return;
            }

            const savedPoc = data?.poc || data?.data || data;

            if (editingPoc) {
                setPocs((prev) => prev.map((p) => (p.id.toString() === editingPoc.id.toString() ? savedPoc : p)));
                setClients((prev) =>
                    prev.map((client) =>
                        client.pocId?.toString() === editingPoc.id.toString()
                            ? { ...client, pocName: savedPoc.name }
                            : client
                    )
                );
                showToast('POC updated successfully!', 'warning');
            } else {
                setPocs((prev) => [savedPoc, ...prev]);
                showToast('POC added successfully!', 'success');
            }

            setPocForm({ name: '', phone: '', designation: '' });
            setEditingPoc(null);
            setIsPocModalOpen(false);
        } catch (error) {
            console.error('Error saving POC:', error);
            showToast('Database request failed.', 'error');
        }
    };

    const confirmDeletePoc = async () => {
        if (!deletePocTargetId) return;

        try {
            const res = await fetch(`/api/pocs/${deletePocTargetId}`, { method: 'DELETE' });
            const data = await res.json().catch(() => null);

            if (!res.ok) {
                showToast(data?.error || 'Failed to delete POC.', 'error');
                return;
            }

            setPocs((prev) => prev.filter((poc) => poc.id.toString() !== deletePocTargetId.toString()));
            setClients((prev) =>
                prev.map((client) =>
                    client.pocId?.toString() === deletePocTargetId.toString()
                        ? { ...client, pocId: null, pocName: '' }
                        : client
                )
            );

            if (pocFilter === deletePocTargetId.toString()) {
                setPocFilter('All');
            }

            showToast('POC deleted successfully!', 'error');
        } catch (error) {
            console.error('Error deleting POC:', error);
            showToast('Failed to delete POC.', 'error');
        } finally {
            setDeletePocTargetId(null);
        }
    };

    // ==================================================
    // SAVE / UPDATE CLIENT
    // ==================================================
    const handleSaveClient = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!clientForm.clientId.trim() || !clientForm.clientName.trim()) {
            showToast('Client ID and Name are required!', 'error');
            return;
        }

        setIsClientSaving(true);
        const selectedPoc = pocs.find((p) => p.id.toString() === clientForm.pocId.toString());

        try {
            const url = editingClient ? `/api/clients/${editingClient.id}` : '/api/clients';
            const method = editingClient ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...clientForm,
                    pocName: selectedPoc?.name || '',
                }),
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                showToast(data?.error || 'Failed to save client.', 'error');
                return;
            }

            const apiClient = data?.client || data?.data || data;
            const savedClient = {
                ...apiClient,
                pocName: selectedPoc?.name || apiClient?.pocName || '',
            };

            if (editingClient) {
                setClients((prev) =>
                    prev.map((client) => (client.id.toString() === editingClient.id.toString() ? savedClient : client))
                );
                showToast('Client updated successfully!', 'warning');
            } else {
                setClients((prev) => [savedClient, ...prev]);
                setCurrentPage(1);
                showToast('Client added successfully!', 'success');
            }

            setIsClientModalOpen(false);
            setEditingClient(null);
        } catch (error) {
            console.error('Error saving client:', error);
            showToast('Database request failed.', 'error');
        } finally {
            setIsClientSaving(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-surface dark:bg-[#0b0f19] text-on-surface dark:text-slate-100 p-3 sm:p-6 lg:p-8 transition-colors duration-200">
                {/* TOAST NOTIFICATION */}
<AnimatePresence mode="wait">
    {toast.show && (
        <motion.div
            key={toast.message}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-6 right-6 z-[9999] max-w-sm w-full flex items-center gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-2xl bg-white/90 dark:bg-slate-900/95 border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100"
        >
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                toast.type === 'success'
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400'
                    : toast.type === 'warning'
                    ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400'
                    : 'bg-rose-50 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400'
            }`}>
                <span className="material-symbols-outlined text-[20px]">
                    {toast.type === 'success' ? 'check_circle' : toast.type === 'warning' ? 'warning' : 'error'}
                </span>
            </div>

            <div className="flex-1 min-w-0 pr-1">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {toast.type === 'success' ? 'Success' : toast.type === 'warning' ? 'Warning' : 'Error'}
                </p>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-snug mt-0.5 truncate">
                    {toast.message}
                </p>
            </div>

            <button
                type="button"
                onClick={() => setToast((prev) => ({ ...prev, show: false }))}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
            >
                <span className="material-symbols-outlined text-base">close</span>
            </button>
        </motion.div>
    )}
</AnimatePresence>

                <div className="max-w-7xl mx-auto space-y-6">
                    {/* HEADER SECTION WITH GLOW & RELOAD ON CLICK */}
                    <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 dark:border-slate-800/80 dark:bg-slate-900/90 p-5 sm:p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-md">
                        <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
                        <div className="absolute -left-12 -bottom-12 h-36 w-36 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

                        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex min-w-0 items-center gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-teal-200/60 bg-gradient-to-br from-teal-50 to-teal-100/60 text-teal-700 shadow-inner dark:border-teal-900/60 dark:from-teal-950 dark:to-teal-900/40 dark:text-teal-400">
                                    <span className="material-symbols-outlined text-[26px]">hub</span>
                                </div>
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <button
                                            type="button"
                                            onClick={() => window.location.reload()}
                                            className="group text-left text-xl font-black tracking-tight text-slate-800 transition-colors hover:text-teal-700 dark:text-white dark:hover:text-teal-400 sm:text-2xl cursor-pointer flex items-center gap-1.5"
                                            title="Click to reload page"
                                        >
                                            <span>Clients Information</span>
                                            <span className="material-symbols-outlined text-base opacity-0 group-hover:opacity-100 transition-opacity text-teal-600 dark:text-teal-400">
                                                refresh
                                            </span>
                                        </button>
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 shadow-2xs dark:border-emerald-900/60 dark:bg-emerald-950/80 dark:text-emerald-400">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            Live
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400 font-medium">
                                        Manage network connections, client profiles, and active configurations.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5">
                                <Link
                                    href="/"
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3.5 text-sm font-semibold text-slate-600 shadow-2xs transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:scale-[1.02] active:scale-[0.98] cursor-pointer dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                                >
                                    <span className="material-symbols-outlined text-[19px]">arrow_back</span>
                                    Back
                                </Link>

                                <Link
                                    href="/client-info/system-log"
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3.5 text-sm font-semibold text-slate-600 shadow-2xs transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:scale-[1.02] active:scale-[0.98] cursor-pointer dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                                >
                                    <span className="material-symbols-outlined text-[19px]">history</span>
                                    System Logs
                                </Link>

                                <button
                                    type="button"
                                    onClick={() => setIsPocManagementOpen(true)}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3.5 text-sm font-semibold text-slate-600 shadow-2xs transition-all duration-200 hover:border-teal-200 hover:bg-teal-50/60 hover:text-teal-800 hover:scale-[1.02] active:scale-[0.98] cursor-pointer dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-teal-950/40 dark:hover:text-teal-300"
                                >
                                    <span className="material-symbols-outlined text-[19px]">manage_accounts</span>
                                    Manage POC
                                </button>

                                <button
                                    type="button"
                                    onClick={handleOpenAddModal}
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 px-4 text-sm font-semibold text-white shadow-md shadow-teal-600/20 transition-all duration-200 hover:from-teal-700 hover:to-teal-800 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[19px]">add</span>
                                    New Client
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* STATS CARDS */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div
                            onClick={() => setStatusFilter('All')}
                            className={`p-5 rounded-2xl cursor-pointer border transition-all duration-150 ${
                                statusFilter === 'All'
                                    ? 'bg-teal-50/60 dark:bg-teal-950/40 border-teal-500 shadow-sm'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-300'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Clients</p>
                                    <h3 className="text-3xl font-black mt-1 text-slate-800 dark:text-white">{clients.length}</h3>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-2xl">lan</span>
                                </div>
                            </div>
                        </div>

                        <div
                            onClick={() => setStatusFilter('Connected')}
                            className={`p-5 rounded-2xl cursor-pointer border transition-all duration-150 ${
                                statusFilter === 'Connected'
                                    ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-500 shadow-sm'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Connected</p>
                                    <h3 className="text-3xl font-black mt-1 text-emerald-700 dark:text-emerald-300">
                                        {clients.filter((c) => c.status === 'Connected').length}
                                    </h3>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-2xl">check_circle</span>
                                </div>
                            </div>
                        </div>

                        <div
                            onClick={() => setStatusFilter('Disconnected')}
                            className={`p-5 rounded-2xl cursor-pointer border transition-all duration-150 ${
                                statusFilter === 'Disconnected'
                                    ? 'bg-rose-50/60 dark:bg-rose-950/40 border-rose-500 shadow-sm'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-300'
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Disconnected</p>
                                    <h3 className="text-3xl font-black mt-1 text-rose-700 dark:text-rose-300">
                                        {clients.filter((c) => c.status === 'Disconnected').length}
                                    </h3>
                                </div>
                                <div className="h-12 w-12 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-2xl">power_off</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FILTER BAR */}
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
                            <div className="lg:col-span-5 relative">
                                <span className={`material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-sm ${isSearching ? 'text-teal-600 animate-spin' : 'text-slate-400'}`}>
                                    {isSearching ? 'progress_activity' : 'search'}
                                </span>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search Client ID, Name, Phone, Location..."
                                    className="w-full pl-10 pr-9 py-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-teal-500"
                                />
                            </div>

                            <div className="lg:col-span-2">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as any)}
                                    className="w-full px-3 py-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-teal-500 cursor-pointer"
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="Connected">Connected Only</option>
                                    <option value="Disconnected">Disconnected Only</option>
                                </select>
                            </div>

                            <div className="lg:col-span-2">
                                <select
                                    value={pocFilter}
                                    onChange={(e) => setPocFilter(e.target.value)}
                                    className="w-full px-3 py-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-teal-500 cursor-pointer"
                                >
                                    <option value="All">All POCs</option>
                                    {pocs.map((poc) => (
                                        <option key={poc.id} value={poc.id.toString()}>{poc.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="lg:col-span-2">
                                {/* Fallback dropdown or leave empty for sorting via headers */}
                                <div className="text-[11px] text-slate-400 px-2 py-2 italic text-center">
                                    Click headers to sort
                                </div>
                            </div>

                            <div className="lg:col-span-1 flex items-center justify-end gap-1 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setViewMode('table')}
                                    className={`flex-1 py-1.5 rounded-lg text-xs flex items-center justify-center cursor-pointer ${viewMode === 'table' ? 'bg-white dark:bg-slate-800 text-teal-600 font-bold shadow-xs' : 'text-slate-400'}`}
                                >
                                    <span className="material-symbols-outlined text-sm">table_rows</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('grid')}
                                    className={`flex-1 py-1.5 rounded-lg text-xs flex items-center justify-center cursor-pointer ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 text-teal-600 font-bold shadow-xs' : 'text-slate-400'}`}
                                >
                                    <span className="material-symbols-outlined text-sm">grid_view</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* CONTENT AREA */}
                    {isLoading ? (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-16 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
                            <div className="h-8 w-8 mx-auto rounded-full border-2 border-teal-500 border-t-transparent animate-spin"></div>
                            <p className="text-xs font-semibold text-teal-600 mt-4">Loading client directory...</p>
                        </div>
                    ) : paginatedClients.length === 0 ? (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-16 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
                            <p className="text-sm font-bold text-slate-800 dark:text-white">No client records found.</p>
                            <p className="text-xs text-slate-500 mt-1">Try changing your search or filters.</p>
                        </div>
                    ) : viewMode === 'table' ? (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
                                            <th className="py-3 px-3 w-12 text-center">#</th>
                                            <th className="py-3 px-4 cursor-pointer hover:text-teal-600 select-none" onClick={() => handleSort('clientName')}>
                                                <div className="flex items-center gap-1">
                                                    Client Details
                                                    <span className="material-symbols-outlined text-xs">
                                                        {sortField === 'clientName' ? (sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                                                    </span>
                                                </div>
                                            </th>
                                            <th className="py-3 px-4 cursor-pointer hover:text-teal-600 select-none" onClick={() => handleSort('clientPhone')}>
                                                <div className="flex items-center gap-1">
                                                    Phone
                                                    <span className="material-symbols-outlined text-xs">
                                                        {sortField === 'clientPhone' ? (sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                                                    </span>
                                                </div>
                                            </th>
                                            <th className="py-3 px-4 cursor-pointer hover:text-teal-600 select-none" onClick={() => handleSort('primaryLink')}>
                                                <div className="flex items-center gap-1">
                                                    Primary Link
                                                    <span className="material-symbols-outlined text-xs">
                                                        {sortField === 'primaryLink' ? (sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                                                    </span>
                                                </div>
                                            </th>
                                            <th className="py-3 px-4 cursor-pointer hover:text-teal-600 select-none" onClick={() => handleSort('secondaryLink')}>
                                                <div className="flex items-center gap-1">
                                                    Secondary Link
                                                    <span className="material-symbols-outlined text-xs">
                                                        {sortField === 'secondaryLink' ? (sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                                                    </span>
                                                </div>
                                            </th>
                                            <th className="py-3 px-4 cursor-pointer hover:text-teal-600 select-none" onClick={() => handleSort('location')}>
                                                <div className="flex items-center gap-1">
                                                    Location
                                                    <span className="material-symbols-outlined text-xs">
                                                        {sortField === 'location' ? (sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                                                    </span>
                                                </div>
                                            </th>
                                            <th className="py-3 px-4 cursor-pointer hover:text-teal-600 select-none" onClick={() => handleSort('pocName')}>
                                                <div className="flex items-center gap-1">
                                                    POC Name
                                                    <span className="material-symbols-outlined text-xs">
                                                        {sortField === 'pocName' ? (sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                                                    </span>
                                                </div>
                                            </th>
                                            <th className="py-3 px-4 cursor-pointer hover:text-teal-600 select-none" onClick={() => handleSort('status')}>
                                                <div className="flex items-center gap-1">
                                                    Status
                                                    <span className="material-symbols-outlined text-xs">
                                                        {sortField === 'status' ? (sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward') : 'unfold_more'}
                                                    </span>
                                                </div>
                                            </th>
                                            <th className="py-3 px-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                                        {paginatedClients.map((client, index) => {
                                            const serialNumber = (currentPage - 1) * itemsPerPage + index + 1;
                                            return (
                                                <tr
                                                    key={client.id}
                                                    onClick={() => setSelectedClientForView(client)}
                                                    className="hover:bg-teal-50/30 dark:hover:bg-slate-800/50 cursor-pointer transition-colors duration-100"
                                                >
                                                    <td className="py-3 px-3 text-center font-mono text-slate-400 text-[11px]">
                                                        {serialNumber}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="font-semibold text-slate-800 dark:text-white">{client.clientName}</div>
                                                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{client.clientId}</div>
                                                    </td>
                                                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">{client.clientPhone || '-'}</td>
                                                    <td className="py-3 px-4 font-mono">
                                                        <div className="text-slate-800 dark:text-slate-200">IP: {client.primaryIp || '-'}</div>
                                                        <div className="text-[10px] text-slate-400">ONU: {client.primaryOnu || '-'}</div>
                                                    </td>
                                                    <td className="py-3 px-4 font-mono">
                                                        <div className="text-slate-800 dark:text-slate-200">IP: {client.secondaryIp || '-'}</div>
                                                        <div className="text-[10px] text-slate-400">ONU: {client.secondaryOnu || '-'}</div>
                                                    </td>
                                                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 truncate max-w-[140px]">{client.location || '-'}</td>
                                                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 truncate max-w-[120px]">{client.pocName || '-'}</td>
                                                    <td className="py-3 px-4">
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                                            client.status === 'Connected'
                                                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                                        }`}>
                                                            <span className={`h-1.5 w-1.5 rounded-full ${client.status === 'Connected' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                            {client.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => handleOpenEditModal(client, e)}
                                                                className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950 cursor-pointer"
                                                                title="Edit"
                                                            >
                                                                <span className="material-symbols-outlined text-sm">edit</span>
                                                            </button>
                                                            {canDeleteClient() && (
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => triggerDelete(client.id.toString(), e)}
                                                                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 cursor-pointer"
                                                                    title="Delete"
                                                                >
                                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                            {paginatedClients.map((client, index) => {
                                const serialNumber = (currentPage - 1) * itemsPerPage + index + 1;
                                return (
                                    <div
                                        key={client.id}
                                        onClick={() => setSelectedClientForView(client)}
                                        className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-150 space-y-3 cursor-pointer relative"
                                    >
                                        <div className="absolute top-3 right-3 font-mono text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                            #{serialNumber}
                                        </div>
                                        <div className="flex items-start justify-between pr-10">
                                            <div>
                                                <h3 className="font-semibold text-slate-800 dark:text-white">{client.clientName}</h3>
                                                <span className="text-[10px] text-slate-400 font-mono">{client.clientId}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                                client.status === 'Connected'
                                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                            }`}>
                                                {client.status}
                                            </span>
                                        </div>
                                        <div className="space-y-1 text-slate-500 dark:text-slate-400">
                                            <div>Phone: <span className="font-mono text-slate-800 dark:text-slate-200">{client.clientPhone || 'N/A'}</span></div>
                                            <div>Location: <span className="text-slate-800 dark:text-slate-200">{client.location || 'N/A'}</span></div>
                                            <div>POC: <span className="text-slate-800 dark:text-slate-200">{client.pocName || 'N/A'}</span></div>
                                        </div>
                                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                type="button"
                                                onClick={(e) => handleOpenEditModal(client, e)}
                                                className="px-3 py-1 text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 rounded-lg cursor-pointer"
                                            >
                                                Edit
                                            </button>
                                            {canDeleteClient() && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => triggerDelete(client.id.toString(), e)}
                                                    className="px-3 py-1 text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 rounded-lg cursor-pointer"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* PAGINATION */}
                    {totalPages > 1 && (
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <p className="text-xs text-slate-500">
                                Showing <span className="font-bold text-slate-800 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                                <span className="font-bold text-slate-800 dark:text-white">{Math.min(currentPage * itemsPerPage, filteredClients.length)}</span> of{' '}
                                <span className="font-bold text-teal-600">{filteredClients.length}</span> clients
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 cursor-pointer"
                                >
                                    Prev
                                </button>
                                <span className="px-3 text-xs font-bold text-slate-600 dark:text-slate-300">
                                    {currentPage} / {totalPages}
                                </span>
                                <button
                                    type="button"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 cursor-pointer"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* MODALS */}
                <ClientDetailsModal
                    client={selectedClientForView}
                    onClose={() => setSelectedClientForView(null)}
                    onEdit={(client) => handleOpenEditModal(client)}
                />

                <ConfirmDialog
                    isOpen={!!deleteTargetId}
                    title="Delete Client Record?"
                    message="Are you sure you want to remove this client? This action cannot be undone."
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteTargetId(null)}
                />

                <ConfirmDialog
                    isOpen={!!deletePocTargetId}
                    title="Delete POC?"
                    message="Are you sure you want to delete this POC?"
                    onConfirm={confirmDeletePoc}
                    onCancel={() => setDeletePocTargetId(null)}
                />

                {/* ADD/EDIT CLIENT MODAL */}
                <AnimatePresence>
                    {isClientModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div
                                onClick={() => !isClientSaving && setIsClientModalOpen(false)}
                                className="absolute inset-0 bg-black/50 backdrop-blur-xs"
                            />
                            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
                                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                                    <h2 className="text-base font-bold text-slate-800 dark:text-white">
                                        {editingClient ? 'Edit Client Record' : 'New Client Registration'}
                                    </h2>
                                    <button
                                        type="button"
                                        disabled={isClientSaving}
                                        onClick={() => setIsClientModalOpen(false)}
                                        className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center cursor-pointer"
                                    >
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                </div>

                                <form onSubmit={handleSaveClient} className="overflow-y-auto p-6 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Client ID *</label>
                                            <input
                                                type="text"
                                                required
                                                value={clientForm.clientId}
                                                onChange={(e) => setClientForm({ ...clientForm, clientId: e.target.value })}
                                                className="w-full p-2.5 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-teal-500"
                                                placeholder="CLI-2001"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Client Name *</label>
                                            <input
                                                type="text"
                                                required
                                                value={clientForm.clientName}
                                                onChange={(e) => setClientForm({ ...clientForm, clientName: e.target.value })}
                                                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-teal-500"
                                                placeholder="Apex Software Ltd."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Phone</label>
                                            <input
                                                type="text"
                                                value={clientForm.clientPhone}
                                                onChange={(e) => setClientForm({ ...clientForm, clientPhone: e.target.value })}
                                                className="w-full p-2.5 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-teal-500"
                                                placeholder="+88017xxxxxxxx"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Status</label>
                                            <select
                                                value={clientForm.status}
                                                onChange={(e) => setClientForm({ ...clientForm, status: e.target.value as any })}
                                                className="w-full p-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-teal-500"
                                            >
                                                <option value="Connected">Connected</option>
                                                <option value="Disconnected">Disconnected</option>
                                            </select>
                                        </div>

                                        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                                                <span className="text-xs font-bold text-teal-600 uppercase">Primary Link</span>
                                                <input
                                                    type="text"
                                                    placeholder="Primary IP"
                                                    value={clientForm.primaryIp}
                                                    onChange={(e) => setClientForm({ ...clientForm, primaryIp: e.target.value })}
                                                    className="w-full p-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Primary ONU MAC/SN"
                                                    value={clientForm.primaryOnu}
                                                    onChange={(e) => setClientForm({ ...clientForm, primaryOnu: e.target.value })}
                                                    className="w-full p-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                                                />
                                            </div>
                                            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                                                <span className="text-xs font-bold text-slate-500 uppercase">Backup Link</span>
                                                <input
                                                    type="text"
                                                    placeholder="Secondary IP"
                                                    value={clientForm.secondaryIp}
                                                    onChange={(e) => setClientForm({ ...clientForm, secondaryIp: e.target.value })}
                                                    className="w-full p-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Secondary ONU MAC/SN"
                                                    value={clientForm.secondaryOnu}
                                                    onChange={(e) => setClientForm({ ...clientForm, secondaryOnu: e.target.value })}
                                                    className="w-full p-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">POC</label>
                                            <select
                                                value={clientForm.pocId}
                                                onChange={(e) => setClientForm({ ...clientForm, pocId: e.target.value })}
                                                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                                            >
                                                <option value="">Select POC...</option>
                                                {pocs.map((poc) => (
                                                    <option key={poc.id} value={poc.id.toString()}>{poc.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Location</label>
                                            <input
                                                type="text"
                                                value={clientForm.location}
                                                onChange={(e) => setClientForm({ ...clientForm, location: e.target.value })}
                                                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                                                placeholder="Floor 4, Building B"
                                            />
                                        </div>

                                        <div className="md:col-span-3">
                                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Description</label>
                                            <textarea
                                                rows={2}
                                                value={clientForm.description}
                                                onChange={(e) => setClientForm({ ...clientForm, description: e.target.value })}
                                                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl resize-none"
                                                placeholder="Additional remarks..."
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                                        <button
                                            type="button"
                                            onClick={() => setIsClientModalOpen(false)}
                                            className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isClientSaving}
                                            className="px-5 py-2 text-xs font-semibold bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 cursor-pointer"
                                        >
                                            {isClientSaving ? 'Saving...' : editingClient ? 'Update Client' : 'Save Client'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </AnimatePresence>

                {/* POC MANAGEMENT MODAL */}
{isPocManagementOpen && (
    <div onClick={() => setIsPocManagementOpen(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
        <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-teal-600 dark:text-teal-400 text-xl">manage_accounts</span>
                    <h3 className="font-bold text-slate-800 dark:text-white text-base">POC Management</h3>
                </div>
                <button type="button" onClick={() => setIsPocManagementOpen(false)} className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                    <span className="material-symbols-outlined text-sm">close</span>
                </button>
            </div>

            {/* POC Search Input */}
            <div className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    search
                </span>
                <input
                    type="text"
                    id="poc-search-input"
                    placeholder="Search POC by name..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-teal-500"
                    onChange={(e) => {
                        const term = e.target.value.toLowerCase();
                        const listItems = document.querySelectorAll('.poc-item-row');
                        listItems.forEach((item) => {
                            const name = item.getAttribute('data-poc-name') || '';
                            if (name.includes(term)) {
                                (item as HTMLElement).style.display = 'flex';
                            } else {
                                (item as HTMLElement).style.display = 'none';
                            }
                        });
                    }}
                />
            </div>

            {/* POC List */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {pocs.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 py-6">No POCs found.</p>
                ) : (
                    pocs.map((poc, index) => (
                        <div
                            key={poc.id}
                            data-poc-name={(poc.name || '').toLowerCase()}
                            className="poc-item-row flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 transition hover:border-teal-300 dark:hover:border-teal-800"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="font-mono text-[11px] font-bold text-slate-400 bg-white dark:bg-slate-800 h-6 w-6 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                                    {index + 1}
                                </span>
                                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{poc.name}</span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => handleEditPoc(poc)}
                                    className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950 cursor-pointer transition"
                                    title="Edit POC"
                                >
                                    <span className="material-symbols-outlined text-sm">edit</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDeletePocTargetId(poc.id.toString())}
                                    className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 cursor-pointer transition"
                                    title="Delete POC"
                                >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 font-medium">
                    Total POCs: <span className="font-bold text-slate-700 dark:text-slate-300">{pocs.length}</span>
                </span>
                <button
                    type="button"
                    onClick={handleOpenAddPoc}
                    className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-sm transition cursor-pointer"
                >
                    + Add New POC
                </button>
            </div>
        </div>
    </div>
)}

                {/* ADD / EDIT POC MODAL */}
                {isPocModalOpen && (
                    <div onClick={() => setIsPocModalOpen(false)} className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
                        <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
                            <h3 className="font-bold text-slate-800 dark:text-white">{editingPoc ? 'Edit POC' : 'Add POC'}</h3>
                            <form onSubmit={handleSavePoc} className="space-y-3">
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    value={pocForm.name}
                                    onChange={(e) => setPocForm({ ...pocForm, name: e.target.value })}
                                    className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
                                    placeholder="POC Name"
                                />
                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={() => setIsPocModalOpen(false)} className="px-3 py-1.5 text-xs rounded-xl border cursor-pointer">Cancel</button>
                                    <button type="submit" className="px-4 py-1.5 text-xs bg-teal-600 text-white rounded-xl cursor-pointer">Save</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}