// 'use client';
// import React, {
//     useState,
//     useEffect,
//     useMemo,
//     useRef,
// } from 'react';
// import Link from 'next/link';
// import { motion, AnimatePresence } from 'framer-motion';

// import {
//     ClientInfo,
//     POC,
// } from '@/types/client';

// import ConfirmDialog from '@/components/ConfirmDialog';
// import ClientDetailsModal from '@/components/ClientDetailsModal';
// import ProtectedRoute from '@/components/ProtectedRoute';

// export default function ClientInfoPage() {
//     // --------------------------------------------------
//     // Data
//     // --------------------------------------------------
//     const [clients, setClients] = useState<ClientInfo[]>([]);
//     const [pocs, setPocs] = useState<POC[]>([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [isSearching, setIsSearching] = useState(false);
//     const [isClientSaving, setIsClientSaving] = useState(false);

//     // --------------------------------------------------
//     // User Role & Permissions State
//     // --------------------------------------------------
//     const [currentUserRole, setCurrentUserRole] = useState<string>('');

//     // --------------------------------------------------
//     // Controls & Filters
//     // --------------------------------------------------
//     const [searchQuery, setSearchQuery] = useState('');
//     const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
//     const [statusFilter, setStatusFilter] = useState<'All' | 'Connected' | 'Disconnected'>('All');
//     const [pocFilter, setPocFilter] = useState<string>('All');
//     const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'clientId'>('newest');
//     const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

//     // --------------------------------------------------
//     // Pagination (Per page 30 Clients)
//     // --------------------------------------------------
//     const [currentPage, setCurrentPage] = useState(1);
//     const itemsPerPage = 30;

//     // --------------------------------------------------
//     // Client Modals
//     // --------------------------------------------------
//     const [isClientModalOpen, setIsClientModalOpen] = useState(false);
//     const [selectedClientForView, setSelectedClientForView] = useState<ClientInfo | null>(null);
//     const [editingClient, setEditingClient] = useState<ClientInfo | null>(null);

//     // --------------------------------------------------
//     // POC Modals
//     // --------------------------------------------------
//     const [isPocModalOpen, setIsPocModalOpen] = useState(false);
//     const [isPocManagementOpen, setIsPocManagementOpen] = useState(false);
//     const [editingPoc, setEditingPoc] = useState<POC | null>(null);

//     // --------------------------------------------------
//     // Delete Targets
//     // --------------------------------------------------
//     const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
//     const [deletePocTargetId, setDeletePocTargetId] = useState<string | null>(null);

//     // --------------------------------------------------
//     // Toast Notification State
//     // --------------------------------------------------
//     type ToastType = 'success' | 'error' | 'warning';

//     const [toast, setToast] = useState<{
//         show: boolean;
//         message: string;
//         type: ToastType;
//     }>({
//         show: false,
//         message: '',
//         type: 'success',
//     });

//     const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

//     const showToast = (message: string, type: ToastType = 'success') => {
//         if (toastTimerRef.current) {
//             clearTimeout(toastTimerRef.current);
//         }

//         setToast({
//             show: true,
//             message,
//             type,
//         });

//         toastTimerRef.current = setTimeout(() => {
//             setToast((prev) => ({
//                 ...prev,
//                 show: false,
//             }));
//         }, 3000);
//     };

//     // --------------------------------------------------
//     // Client Form State
//     // --------------------------------------------------
//     const [clientForm, setClientForm] = useState({
//         clientId: '',
//         clientName: '',
//         clientPhone: '',
//         primaryIp: '',
//         primaryOnu: '',
//         secondaryIp: '',
//         secondaryOnu: '',
//         location: '',
//         pocId: '',
//         status: 'Connected' as 'Connected' | 'Disconnected',
//         description: '',
//     });

//     // --------------------------------------------------
//     // POC Form State
//     // --------------------------------------------------
//     const [pocForm, setPocForm] = useState({
//         name: '',
//         phone: '',
//         designation: '',
//     });

//     // ==================================================
//     // LOAD USER ROLE & INITIAL DATA
//     // ==================================================
//     useEffect(() => {
//         const storedUser = sessionStorage.getItem('netbill_session_user');
//         if (storedUser) {
//             try {
//                 const userData = JSON.parse(storedUser);
//                 const role = userData.role || userData.designation || userData.type || '';
//                 setCurrentUserRole(role.toLowerCase());
//             } catch {
//                 setCurrentUserRole(storedUser.toLowerCase());
//             }
//         }

//         const fetchInitialData = async () => {
//             setIsLoading(true);

//             try {
//                 const [pocsRes, clientsRes] = await Promise.all([
//                     fetch('/api/pocs', { cache: 'no-store' }),
//                     fetch('/api/clients', { cache: 'no-store' }),
//                 ]);

//                 if (pocsRes.ok) {
//                     const pocsData = await pocsRes.json();
//                     const normalizedPocs = Array.isArray(pocsData)
//                         ? pocsData
//                         : pocsData?.pocs || pocsData?.data || [];
//                     setPocs(normalizedPocs);
//                 }

//                 if (clientsRes.ok) {
//                     const clientsData = await clientsRes.json();
//                     const normalizedClients = Array.isArray(clientsData)
//                         ? clientsData
//                         : clientsData?.clients || clientsData?.data || [];
//                     setClients(normalizedClients);
//                 }
//             } catch (error) {
//                 console.error('Error fetching data:', error);
//                 showToast('Failed to load client information.', 'error');
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchInitialData();
//     }, []);

//     // Helper to check if current user can delete (Admin or Manager only)
//     const canDeleteClient = () => {
//         const role = currentUserRole;
//         // If role contains admin or manager, allow deletion. (Default allow if role not strictly parsed to prevent lockout, or restrict based on rules)
//         if (!role) return true; // fallback if session role is unparsed
//         return role.includes('admin') || role.includes('manager');
//     };

//     // ==================================================
//     // RECORD ACTIVITY LOG HELPER
//     // ==================================================
//     const recordLog = async (
//         action: 'CREATE_CLIENT' | 'UPDATE_CLIENT' | 'DELETE_CLIENT',
//         clientId: string,
//         clientName: string,
//         details: string
//     ) => {
//         try {
//             let loggedInUser = 'Admin';

//             const storedUser = sessionStorage.getItem('netbill_session_user');
//             if (storedUser) {
//                 try {
//                     const userData = JSON.parse(storedUser);
//                     loggedInUser = userData.name || userData.email || userData.username || storedUser;
//                 } catch {
//                     loggedInUser = storedUser;
//                 }
//             }

//             await fetch('/api/logs', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     action,
//                     clientId,
//                     clientName,
//                     details,
//                     performedBy: loggedInUser,
//                 }),
//             });
//         } catch (err) {
//             console.error('Failed to record activity log:', err);
//         }
//     };

//     // ==================================================
//     // DEBOUNCE SEARCH
//     // ==================================================
//     useEffect(() => {
//         setIsSearching(true);
//         const timer = setTimeout(() => {
//             setDebouncedSearchQuery(searchQuery);
//             setIsSearching(false);
//         }, 300);

//         return () => clearTimeout(timer);
//     }, [searchQuery]);

//     // ==================================================
//     // FILTER & SORT
//     // ==================================================
//     const filteredClients = useMemo(() => {
//         return clients
//             .filter((client) => {
//                 const q = debouncedSearchQuery.toLowerCase().trim();
//                 const searchableText = [
//                     client.clientId,
//                     client.clientName,
//                     client.clientPhone,
//                     client.pocName,
//                     client.primaryOnu,
//                     client.primaryIp,
//                     client.secondaryOnu,
//                     client.secondaryIp,
//                     client.location,
//                     client.description,
//                 ]
//                     .filter(Boolean)
//                     .join(' ')
//                     .toLowerCase();

//                 const matchesSearch = !q || searchableText.includes(q);
//                 const matchesStatus = statusFilter === 'All' || client.status === statusFilter;
//                 const matchesPoc = pocFilter === 'All' || client.pocId?.toString() === pocFilter;

//                 return matchesSearch && matchesStatus && matchesPoc;
//             })
//             .sort((a, b) => {
//                 if (sortBy === 'newest') return Number(b.id) - Number(a.id);
//                 if (sortBy === 'oldest') return Number(a.id) - Number(b.id);
//                 if (sortBy === 'name') return (a.clientName || '').localeCompare(b.clientName || '');
//                 if (sortBy === 'clientId') return (a.clientId || '').localeCompare(b.clientId || '');
//                 return 0;
//             });
//     }, [clients, debouncedSearchQuery, statusFilter, pocFilter, sortBy]);

//     useEffect(() => {
//         setCurrentPage(1);
//     }, [debouncedSearchQuery, statusFilter, pocFilter, sortBy]);

//     // ==================================================
//     // PAGINATION
//     // ==================================================
//     const totalPages = Math.ceil(filteredClients.length / itemsPerPage) || 1;

//     const paginatedClients = useMemo(() => {
//         const start = (currentPage - 1) * itemsPerPage;
//         return filteredClients.slice(start, start + itemsPerPage);
//     }, [filteredClients, currentPage, itemsPerPage]);

//     // ==================================================
//     // MODAL OPEN HANDLERS
//     // ==================================================
//     const handleOpenEditModal = (client: ClientInfo, e?: React.MouseEvent) => {
//         if (e) e.stopPropagation();
//         setSelectedClientForView(null);
//         setEditingClient(client);

//         setClientForm({
//             clientId: client.clientId || '',
//             clientName: client.clientName || '',
//             clientPhone: client.clientPhone || '',
//             primaryIp: client.primaryIp || '',
//             primaryOnu: client.primaryOnu || '',
//             secondaryIp: client.secondaryIp || '',
//             secondaryOnu: client.secondaryOnu || '',
//             location: client.location || '',
//             pocId: client.pocId?.toString() || '',
//             status: client.status || 'Connected',
//             description: client.description || '',
//         });

//         setIsClientModalOpen(true);
//     };

//     const handleOpenAddModal = () => {
//         setSelectedClientForView(null);
//         setEditingClient(null);

//         setClientForm({
//             clientId: '',
//             clientName: '',
//             clientPhone: '',
//             primaryIp: '',
//             primaryOnu: '',
//             secondaryIp: '',
//             secondaryOnu: '',
//             location: '',
//             pocId: '',
//             status: 'Connected',
//             description: '',
//         });

//         setIsClientModalOpen(true);
//     };

//     // ==================================================
//     // DELETE CLIENT
//     // ==================================================
//     const triggerDelete = (id: string, e?: React.MouseEvent) => {
//         if (e) e.stopPropagation();
        
//         // Enforce Delete Permission: Only Admin and Manager
//         if (!canDeleteClient()) {
//             showToast('Access Denied: Only Admin and Manager can delete client records.', 'error');
//             return;
//         }

//         setDeleteTargetId(id);
//     };

//     const confirmDelete = async () => {
//         if (!deleteTargetId) return;

//         const targetClient = clients.find((c) => c.id.toString() === deleteTargetId.toString());

//         try {
//             const res = await fetch(`/api/clients/${deleteTargetId}`, { method: 'DELETE' });
//             const data = await res.json().catch(() => null);

//             if (!res.ok) {
//                 showToast(data?.error || 'Failed to delete client.', 'error');
//                 return;
//             }

//             setClients((prev) => prev.filter((client) => client.id.toString() !== deleteTargetId.toString()));
//             if (selectedClientForView?.id.toString() === deleteTargetId.toString()) {
//                 setSelectedClientForView(null);
//             }

//             if (targetClient) {
//                 await recordLog(
//                     'DELETE_CLIENT',
//                     targetClient.clientId,
//                     targetClient.clientName,
//                     `Deleted client profile: ${targetClient.clientName} (${targetClient.clientId})`
//                 );
//             }

//             showToast('Client deleted successfully!', 'error');
//         } catch (error) {
//             console.error('Error deleting client:', error);
//             showToast('Failed to delete client.', 'error');
//         } finally {
//             setDeleteTargetId(null);
//         }
//     };

//     // ==================================================
//     // POC HANDLERS
//     // ==================================================
//     const handleOpenAddPoc = () => {
//         setIsPocManagementOpen(false);
//         setEditingPoc(null);
//         setPocForm({ name: '', phone: '', designation: '' });
//         setIsPocModalOpen(true);
//     };

//     const handleEditPoc = (poc: POC) => {
//         setIsPocManagementOpen(false);
//         setEditingPoc(poc);
//         setPocForm({ name: poc.name || '', phone: '', designation: '' });
//         setIsPocModalOpen(true);
//     };

//     const handleSavePoc = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!pocForm.name.trim()) {
//             showToast('POC name is required!', 'error');
//             return;
//         }

//         try {
//             const url = editingPoc ? `/api/pocs/${editingPoc.id}` : '/api/pocs';
//             const method = editingPoc ? 'PUT' : 'POST';

//             const res = await fetch(url, {
//                 method,
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ name: pocForm.name.trim() }),
//             });

//             const data = await res.json().catch(() => null);

//             if (!res.ok) {
//                 showToast(data?.error || `Failed to ${editingPoc ? 'update' : 'add'} POC.`, 'error');
//                 return;
//             }

//             const savedPoc = data?.poc || data?.data || data;

//             if (editingPoc) {
//                 setPocs((prev) => prev.map((p) => (p.id.toString() === editingPoc.id.toString() ? savedPoc : p)));
//                 setClients((prev) =>
//                     prev.map((client) =>
//                         client.pocId?.toString() === editingPoc.id.toString()
//                             ? { ...client, pocName: savedPoc.name }
//                             : client
//                     )
//                 );
//                 showToast('POC updated successfully!', 'warning');
//             } else {
//                 setPocs((prev) => [savedPoc, ...prev]);
//                 showToast('POC added successfully!', 'success');
//             }

//             setPocForm({ name: '', phone: '', designation: '' });
//             setEditingPoc(null);
//             setIsPocModalOpen(false);
//         } catch (error) {
//             console.error('Error saving POC:', error);
//             showToast('Database request failed.', 'error');
//         }
//     };

//     const confirmDeletePoc = async () => {
//         if (!deletePocTargetId) return;

//         try {
//             const res = await fetch(`/api/pocs/${deletePocTargetId}`, { method: 'DELETE' });
//             const data = await res.json().catch(() => null);

//             if (!res.ok) {
//                 showToast(data?.error || 'Failed to delete POC.', 'error');
//                 return;
//             }

//             setPocs((prev) => prev.filter((poc) => poc.id.toString() !== deletePocTargetId.toString()));
//             setClients((prev) =>
//                 prev.map((client) =>
//                     client.pocId?.toString() === deletePocTargetId.toString()
//                         ? { ...client, pocId: null, pocName: '' }
//                         : client
//                 )
//             );

//             if (pocFilter === deletePocTargetId.toString()) {
//                 setPocFilter('All');
//             }

//             showToast('POC deleted successfully!', 'error');
//         } catch (error) {
//             console.error('Error deleting POC:', error);
//             showToast('Failed to delete POC.', 'error');
//         } finally {
//             setDeletePocTargetId(null);
//         }
//     };

//     // ==================================================
//     // SAVE / UPDATE CLIENT
//     // ==================================================
//     const handleSaveClient = async (e: React.FormEvent) => {
//         e.preventDefault();

//         if (!clientForm.clientId.trim() || !clientForm.clientName.trim()) {
//             showToast('Client ID and Name are required!', 'error');
//             return;
//         }

//         setIsClientSaving(true);

//         const selectedPoc = pocs.find((p) => p.id.toString() === clientForm.pocId.toString());

//         try {
//             const url = editingClient ? `/api/clients/${editingClient.id}` : '/api/clients';
//             const method = editingClient ? 'PUT' : 'POST';

//             const res = await fetch(url, {
//                 method,
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     ...clientForm,
//                     pocName: selectedPoc?.name || '',
//                 }),
//             });

//             const data = await res.json().catch(() => null);

//             if (!res.ok) {
//                 showToast(data?.error || 'Failed to save client.', 'error');
//                 return;
//             }

//             const apiClient = data?.client || data?.data || data;
//             const savedClient = {
//                 ...apiClient,
//                 pocName: selectedPoc?.name || apiClient?.pocName || '',
//             };

//             if (editingClient) {
//                 setClients((prev) =>
//                     prev.map((client) => (client.id.toString() === editingClient.id.toString() ? savedClient : client))
//                 );

//                 await recordLog(
//                     'UPDATE_CLIENT',
//                     savedClient.clientId,
//                     savedClient.clientName,
//                     `Updated client profile details for ${savedClient.clientName}`
//                 );

//                 showToast('Client updated successfully!', 'warning');
//             } else {
//                 setClients((prev) => [savedClient, ...prev]);
//                 setCurrentPage(1);

//                 await recordLog(
//                     'CREATE_CLIENT',
//                     savedClient.clientId,
//                     savedClient.clientName,
//                     `Created new client entry: ${savedClient.clientName} (${savedClient.clientId})`
//                 );

//                 showToast('Client added successfully!', 'success');
//             }

//             setIsClientModalOpen(false);
//             setEditingClient(null);
//         } catch (error) {
//             console.error('Error saving client:', error);
//             showToast('Database request failed.', 'error');
//         } finally {
//             setIsClientSaving(false);
//         }
//     };

//     return (
//         <ProtectedRoute>
//             <div className="min-h-screen bg-surface dark:bg-[#0b0f19] text-on-surface dark:text-slate-100 p-3 sm:p-6 lg:p-8 transition-colors duration-300">
//                 {/* ==================================================
//                     PREMIUM TOAST NOTIFICATION
//                 ================================================== */}
//                 <AnimatePresence mode="wait">
//                     {toast.show && (
//                         <motion.div
//                             key={toast.message}
//                             initial={{ opacity: 0, y: 30, scale: 0.95 }}
//                             animate={{ opacity: 1, y: 0, scale: 1 }}
//                             exit={{ opacity: 0, y: 20, scale: 0.95 }}
//                             transition={{ duration: 0.2, ease: "easeOut" }}
//                             className={`fixed bottom-6 right-6 z-[9999] max-w-sm w-full flex items-center gap-3.5 p-4 rounded-3xl border shadow-xl backdrop-blur-2xl ${toast.type === 'success'
//                                 ? 'bg-surface-bright/95 dark:bg-slate-900/95 border-primary/30 dark:border-primary/40 text-on-surface dark:text-slate-100 shadow-primary/10'
//                                 : toast.type === 'warning'
//                                     ? 'bg-surface-bright/95 dark:bg-slate-900/95 border-amber-500/30 text-on-surface dark:text-slate-100 shadow-amber-500/10'
//                                     : 'bg-surface-bright/95 dark:bg-slate-900/95 border-error/30 text-on-surface dark:text-slate-100 shadow-error/10'
//                                 }`}
//                         >
//                             <div
//                                 className={`flex items-center justify-center w-10 h-10 rounded-2xl shrink-0 shadow-sm ${toast.type === 'success'
//                                     ? 'bg-gradient-to-br from-primary to-primary-container text-on-primary shadow-primary/20'
//                                     : toast.type === 'warning'
//                                         ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/20'
//                                         : 'bg-gradient-to-br from-error to-red-600 text-on-error shadow-error/20'
//                                     }`}
//                             >
//                                 <span className="material-symbols-outlined text-[20px]">
//                                     {toast.type === 'success'
//                                         ? 'check_circle'
//                                         : toast.type === 'warning'
//                                             ? 'edit'
//                                             : 'error'}
//                                 </span>
//                             </div>

//                             <div className="flex-1 min-w-0">
//                                 <p className="font-label-md uppercase tracking-wider text-secondary dark:text-slate-400">
//                                     {toast.type === 'success'
//                                         ? 'Success'
//                                         : toast.type === 'warning'
//                                             ? 'Updated'
//                                             : 'Error'}
//                                 </p>
//                                 <p className="font-body-sm font-semibold text-on-surface dark:text-slate-200 leading-tight mt-0.5 truncate">
//                                     {toast.message}
//                                 </p>
//                             </div>

//                             <button
//                                 type="button"
//                                 onClick={() =>
//                                     setToast((prev) => ({
//                                         ...prev,
//                                         show: false,
//                                     }))
//                                 }
//                                 className="flex items-center justify-center w-7 h-7 rounded-xl text-secondary dark:text-slate-400 hover:text-on-surface dark:hover:text-white hover:bg-surface-container-low dark:hover:bg-slate-800 cursor-pointer transition-all shrink-0"
//                             >
//                                 <span className="material-symbols-outlined text-[16px]">close</span>
//                             </button>
//                         </motion.div>
//                     )}
//                 </AnimatePresence>

//                 <div className="max-w-7xl mx-auto space-y-6">
//                     {/* ==================================================
//                         HEADER SECTION
//                     ================================================== */}
//                     <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-6">
//                         <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

//                             {/* Left: Page Heading */}
//                             <div className="flex min-w-0 items-center gap-4">
//                                 <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-teal-100 bg-teal-50 dark:border-teal-900 dark:bg-teal-950">
//                                     <span className="material-symbols-outlined text-[26px] text-teal-700 dark:text-teal-400">
//                                         hub
//                                     </span>
//                                 </div>

//                                 <div className="min-w-0">
//                                     <div className="flex flex-wrap items-center gap-2.5">
//                                         <button
//                                             type="button"
//                                             onClick={() => window.location.reload()}
//                                             className="text-left text-xl font-bold tracking-tight text-slate-800 transition-colors hover:text-teal-700 dark:text-white dark:hover:text-teal-400 sm:text-2xl"
//                                         >
//                                             Clients Information
//                                         </button>

//                                         <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400">
//                                             <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
//                                             Live
//                                         </span>
//                                     </div>

//                                     <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
//                                         Manage network connections, client profiles, and active configurations.
//                                     </p>
//                                 </div>
//                             </div>

//                             {/* Right: Action Buttons */}
//                             <div className="flex flex-wrap items-center gap-2">
                                
//                                 {/* Back to Home/Dashboard Button */}
//                                 <Link
//                                     href="/"
//                                     className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
//                                 >
//                                     <span className="material-symbols-outlined text-[19px]">
//                                         arrow_back
//                                     </span>
//                                     Back
//                                 </Link>

//                                 <Link
//                                     href="/client-info/system-log"
//                                     className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
//                                 >
//                                     <span className="material-symbols-outlined text-[19px]">
//                                         history
//                                     </span>
//                                     System Logs
//                                 </Link>

//                                 <motion.button
//                                     type="button"
//                                     whileHover={{ y: -1 }}
//                                     whileTap={{ scale: 0.98 }}
//                                     onClick={() => setIsPocManagementOpen(true)}
//                                     className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-600 transition-colors hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-teal-950"
//                                 >
//                                     <span className="material-symbols-outlined text-[19px]">
//                                         manage_accounts
//                                     </span>
//                                     Manage POC
//                                 </motion.button>

//                                 {/* New Client Button: Accessible by Admin, Manager, Support, Accounts */}
//                                 <motion.button
//                                     type="button"
//                                     whileHover={{ y: -1 }}
//                                     whileTap={{ scale: 0.98 }}
//                                     onClick={handleOpenAddModal}
//                                     className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:bg-teal-600 dark:hover:bg-teal-500"
//                                 >
//                                     <span className="material-symbols-outlined text-[19px]">
//                                         add
//                                     </span>
//                                     New Client
//                                 </motion.button>
//                             </div>
//                         </div>
//                     </div>

//                     {/* ==================================================
//                         INTERACTIVE STATS CARDS
//                     ================================================== */}
//                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                         {/* Total Clients Card */}
//                         <motion.div
//                             whileHover={{ y: -4, scale: 1.01 }}
//                             whileTap={{ scale: 0.98 }}
//                             onClick={() => setStatusFilter('All')}
//                             className={`relative overflow-hidden p-5 rounded-3xl cursor-pointer transition-all duration-300 group border ${statusFilter === 'All'
//                                 ? 'bg-gradient-to-br from-primary-container/20 dark:from-teal-950/40 via-surface-bright dark:via-slate-900 to-surface-container-low dark:to-slate-900/60 border-primary/40 shadow-md shadow-primary/10 ring-2 ring-primary/30'
//                                 : 'bg-surface-bright/90 dark:bg-slate-900/90 backdrop-blur-md text-on-surface dark:text-slate-100 border-outline-variant dark:border-slate-800 hover:border-primary/40 shadow-xs hover:shadow-md'
//                                 }`}
//                         >
//                             {statusFilter === 'All' && (
//                                 <div className="absolute -right-8 -top-8 w-28 h-28 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
//                             )}

//                             <div className="flex items-center justify-between relative z-10">
//                                 <div>
//                                     <div className="flex items-center gap-1.5">
//                                         <p className={`font-label-md uppercase tracking-wider ${statusFilter === 'All' ? 'text-primary dark:text-teal-400' : 'text-secondary dark:text-slate-400'
//                                             }`}>
//                                             Total Clients
//                                         </p>
//                                         {statusFilter === 'All' && (
//                                             <span className="h-1.5 w-1.5 rounded-full bg-primary dark:bg-teal-400 animate-pulse" />
//                                         )}
//                                     </div>
//                                     <h3 className={`font-headline-lg text-3xl font-black mt-1 ${statusFilter === 'All' ? 'text-on-primary-fixed-variant dark:text-teal-200' : 'text-on-surface dark:text-white'
//                                         }`}>
//                                         {clients.length}
//                                     </h3>
//                                 </div>

//                                 <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${statusFilter === 'All'
//                                     ? 'bg-primary text-on-primary shadow-md shadow-primary/30'
//                                     : 'bg-surface-container-low dark:bg-slate-800 text-secondary dark:text-slate-300 group-hover:bg-primary/10 group-hover:text-primary dark:group-hover:text-teal-400'
//                                     }`}>
//                                     <span className="material-symbols-outlined text-2xl">
//                                         lan
//                                     </span>
//                                 </div>
//                             </div>

//                             <div className="mt-4 relative z-10">
//                                 <div className="w-full h-1.5 rounded-full overflow-hidden bg-surface-container-low dark:bg-slate-800">
//                                     <div className={`h-full rounded-full transition-all duration-500 ${statusFilter === 'All' ? 'bg-primary w-full' : 'bg-surface-container-highest dark:bg-slate-700 w-full'
//                                         }`} />
//                                 </div>
//                                 <p className={`font-body-sm mt-1.5 flex items-center justify-between ${statusFilter === 'All' ? 'text-primary dark:text-teal-400 font-bold' : 'text-secondary dark:text-slate-400'
//                                     }`}>
//                                     <span>{statusFilter === 'All' ? '● Showing All Clients' : 'Click to show all'}</span>
//                                     <span className="material-symbols-outlined text-xs group-hover:translate-x-0.5 transition-transform">
//                                         arrow_forward
//                                     </span>
//                                 </p>
//                             </div>
//                         </motion.div>

//                         {/* Connected Links Card */}
//                         <motion.div
//                             whileHover={{ y: -4, scale: 1.01 }}
//                             whileTap={{ scale: 0.98 }}
//                             onClick={() => setStatusFilter('Connected')}
//                             className={`relative overflow-hidden p-5 rounded-3xl cursor-pointer transition-all duration-300 group border ${statusFilter === 'Connected'
//                                 ? 'bg-gradient-to-br from-emerald-500/10 dark:from-emerald-950/40 via-surface-bright dark:via-slate-900 to-surface-container-low dark:to-slate-900/60 border-emerald-500/40 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-500/30'
//                                 : 'bg-surface-bright/90 dark:bg-slate-900/90 backdrop-blur-md text-on-surface dark:text-slate-100 border-outline-variant dark:border-slate-800 hover:border-emerald-200 shadow-xs hover:shadow-md'
//                                 }`}
//                         >
//                             {statusFilter === 'Connected' && (
//                                 <div className="absolute -right-8 -top-8 w-28 h-28 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
//                             )}

//                             <div className="flex items-center justify-between relative z-10">
//                                 <div>
//                                     <div className="flex items-center gap-1.5">
//                                         <p className={`font-label-md uppercase tracking-wider ${statusFilter === 'Connected' ? 'text-emerald-700 dark:text-emerald-400' : 'text-secondary dark:text-slate-400'
//                                             }`}>
//                                             Connected
//                                         </p>
//                                         <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
//                                     </div>
//                                     <h3 className={`font-headline-lg text-3xl font-black mt-1 ${statusFilter === 'Connected' ? 'text-emerald-800 dark:text-emerald-300' : 'text-emerald-600 dark:text-emerald-400'
//                                         }`}>
//                                         {clients.filter((c) => c.status === 'Connected').length}
//                                     </h3>
//                                 </div>

//                                 <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${statusFilter === 'Connected'
//                                     ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
//                                     : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white'
//                                     }`}>
//                                     <span className="material-symbols-outlined text-2xl">
//                                         check_circle
//                                     </span>
//                                 </div>
//                             </div>

//                             <div className="mt-4 relative z-10">
//                                 <div className="w-full h-1.5 rounded-full overflow-hidden bg-surface-container-low dark:bg-slate-800">
//                                     <div
//                                         className="h-full rounded-full bg-emerald-500 transition-all duration-500"
//                                         style={{
//                                             width: clients.length
//                                                 ? `${(clients.filter((c) => c.status === 'Connected').length / clients.length) * 100}%`
//                                                 : '0%',
//                                         }}
//                                     />
//                                 </div>
//                                 <p className={`font-body-sm mt-1.5 flex items-center justify-between ${statusFilter === 'Connected' ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-secondary dark:text-slate-400'
//                                     }`}>
//                                     <span>
//                                         {clients.length
//                                             ? Math.round((clients.filter((c) => c.status === 'Connected').length / clients.length) * 100)
//                                             : 0}% Active Rate
//                                     </span>
//                                     <span className="material-symbols-outlined text-xs group-hover:translate-x-0.5 transition-transform">
//                                         filter_alt
//                                     </span>
//                                 </p>
//                             </div>
//                         </motion.div>

//                         {/* Disconnected Card */}
//                         <motion.div
//                             whileHover={{ y: -4, scale: 1.01 }}
//                             whileTap={{ scale: 0.98 }}
//                             onClick={() => setStatusFilter('Disconnected')}
//                             className={`relative overflow-hidden p-5 rounded-3xl cursor-pointer transition-all duration-300 group border ${statusFilter === 'Disconnected'
//                                 ? 'bg-gradient-to-br from-error-container/20 dark:from-rose-950/40 via-surface-bright dark:via-slate-900 to-surface-container-low dark:to-slate-900/60 border-error/40 shadow-md shadow-error/10 ring-2 ring-error/30'
//                                 : 'bg-surface-bright/90 dark:bg-slate-900/90 backdrop-blur-md text-on-surface dark:text-slate-100 border-outline-variant dark:border-slate-800 hover:border-error/40 shadow-xs hover:shadow-md'
//                                 }`}
//                         >
//                             {statusFilter === 'Disconnected' && (
//                                 <div className="absolute -right-8 -top-8 w-28 h-28 bg-error/20 rounded-full blur-2xl pointer-events-none" />
//                             )}

//                             <div className="flex items-center justify-between relative z-10">
//                                 <div>
//                                     <div className="flex items-center gap-1.5">
//                                         <p className={`font-label-md uppercase tracking-wider ${statusFilter === 'Disconnected' ? 'text-on-error-container dark:text-rose-400' : 'text-secondary dark:text-slate-400'
//                                             }`}>
//                                             Disconnected
//                                         </p>
//                                         {clients.filter((c) => c.status === 'Disconnected').length > 0 && (
//                                             <span className="h-2 w-2 rounded-full bg-error animate-bounce" />
//                                         )}
//                                     </div>
//                                     <h3 className={`font-headline-lg text-3xl font-black mt-1 ${statusFilter === 'Disconnected' ? 'text-on-error-container dark:text-rose-300' : 'text-error dark:text-rose-400'
//                                         }`}>
//                                         {clients.filter((c) => c.status === 'Disconnected').length}
//                                     </h3>
//                                 </div>

//                                 <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${statusFilter === 'Disconnected'
//                                     ? 'bg-error text-on-error shadow-md shadow-error/30'
//                                     : 'bg-error-container dark:bg-rose-950/60 text-on-error-container dark:text-rose-400 group-hover:bg-error group-hover:text-on-error'
//                                     }`}>
//                                     <span className="material-symbols-outlined text-2xl">
//                                         power_off
//                                     </span>
//                                 </div>
//                             </div>

//                             <div className="mt-4 relative z-10">
//                                 <div className="w-full h-1.5 rounded-full overflow-hidden bg-surface-container-low dark:bg-slate-800">
//                                     <div
//                                         className="h-full rounded-full bg-error transition-all duration-500"
//                                         style={{
//                                             width: clients.length
//                                                 ? `${(clients.filter((c) => c.status === 'Disconnected').length / clients.length) * 100}%`
//                                                 : '0%',
//                                         }}
//                                     />
//                                 </div>
//                                 <p className={`font-body-sm mt-1.5 flex items-center justify-between ${statusFilter === 'Disconnected' ? 'text-on-error-container dark:text-rose-400 font-bold' : 'text-secondary dark:text-slate-400'
//                                     }`}>
//                                     <span>
//                                         {clients.length
//                                             ? Math.round((clients.filter((c) => c.status === 'Disconnected').length / clients.length) * 100)
//                                             : 0}% Down Rate
//                                     </span>
//                                     <span className="material-symbols-outlined text-xs group-hover:translate-x-0.5 transition-transform">
//                                         filter_alt
//                                     </span>
//                                 </p>
//                             </div>
//                         </motion.div>
//                     </div>

//                     {/* ==================================================
//                         FILTER BAR WITH LAZY SEARCH INDICATOR
//                     ================================================== */}
//                     <div className="bg-surface-bright/90 dark:bg-slate-900/90 backdrop-blur-2xl p-4 rounded-3xl border border-outline-variant/60 dark:border-slate-800/80 shadow-xl shadow-black/5 dark:shadow-black/20 transition-all duration-300">
//                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">

//                             {/* Search Input */}
//                             <div className="lg:col-span-5 relative group">
//                                 <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-teal-500/30 dark:from-teal-500/20 dark:to-emerald-500/20 rounded-2xl blur-sm opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

//                                 <div className="relative flex items-center">
//                                     <span className={`material-symbols-outlined absolute left-3.5 text-base transition-all duration-200 ${isSearching ? 'text-primary dark:text-teal-400 animate-spin' : 'text-secondary dark:text-slate-400 group-focus-within:text-primary dark:group-focus-within:text-teal-400'
//                                         }`}>
//                                         {isSearching ? 'progress_activity' : 'search'}
//                                     </span>
//                                     <input
//                                         type="text"
//                                         value={searchQuery}
//                                         onChange={(e) => setSearchQuery(e.target.value)}
//                                         placeholder="Search Client ID, Name, Phone, Location..."
//                                         className="w-full pl-10 pr-9 py-2.5 text-[11px] font-medium bg-surface-container-low/80 dark:bg-slate-950/80 text-on-surface dark:text-slate-100 placeholder-secondary/60 dark:placeholder-slate-500 border border-outline-variant/60 dark:border-slate-800 rounded-2xl focus:bg-surface-bright dark:focus:bg-slate-900 focus:outline-none focus:border-primary dark:focus:border-teal-500 transition-all duration-200 shadow-inner"
//                                     />
//                                     {searchQuery && (
//                                         <button
//                                             type="button"
//                                             onClick={() => setSearchQuery('')}
//                                             className="absolute right-3 p-1 rounded-full text-secondary dark:text-slate-400 hover:text-error dark:hover:text-rose-400 hover:bg-surface-container dark:hover:bg-slate-800 cursor-pointer transition-colors"
//                                         >
//                                             <span className="material-symbols-outlined text-xs">close</span>
//                                         </button>
//                                     )}
//                                 </div>
//                             </div>

//                             {/* Status Select */}
//                             <div className="lg:col-span-2 relative group">
//                                 <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-primary dark:text-teal-400 text-sm pointer-events-none z-10">
//                                     tune
//                                 </span>
//                                 <select
//                                     value={statusFilter}
//                                     onChange={(e) => setStatusFilter(e.target.value as 'All' | 'Connected' | 'Disconnected')}
//                                     className="appearance-none w-full pl-10 pr-8 py-2.5 text-[11px] font-semibold bg-surface-container-low/80 dark:bg-slate-950/80 text-on-surface dark:text-slate-200 border border-outline-variant/60 dark:border-slate-800 rounded-2xl cursor-pointer hover:bg-surface-bright dark:hover:bg-slate-900 focus:bg-surface-bright dark:focus:bg-slate-900 focus:outline-none focus:border-primary dark:focus:border-teal-500 transition-all duration-200 shadow-inner"
//                                 >
//                                     <option value="All">All Statuses</option>
//                                     <option value="Connected">Connected Only</option>
//                                     <option value="Disconnected">Disconnected Only</option>
//                                 </select>
//                                 <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-secondary dark:text-slate-400 text-sm pointer-events-none transition-transform group-hover:translate-y-[-40%]">
//                                     unfold_more
//                                 </span>
//                             </div>

//                             {/* POC Select */}
//                             <div className="lg:col-span-2 relative group">
//                                 <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-primary dark:text-teal-400 text-sm pointer-events-none z-10">
//                                     group
//                                 </span>
//                                 <select
//                                     value={pocFilter}
//                                     onChange={(e) => setPocFilter(e.target.value)}
//                                     className="appearance-none w-full pl-10 pr-8 py-2.5 text-[11px] font-semibold bg-surface-container-low/80 dark:bg-slate-950/80 text-on-surface dark:text-slate-200 border border-outline-variant/60 dark:border-slate-800 rounded-2xl cursor-pointer hover:bg-surface-bright dark:hover:bg-slate-900 focus:bg-surface-bright dark:focus:bg-slate-900 focus:outline-none focus:border-primary dark:focus:border-teal-500 transition-all duration-200 shadow-inner"
//                                 >
//                                     <option value="All">All POCs</option>
//                                     {pocs.map((poc) => (
//                                         <option key={poc.id} value={poc.id.toString()}>
//                                             {poc.name}
//                                         </option>
//                                     ))}
//                                 </select>
//                                 <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-secondary dark:text-slate-400 text-sm pointer-events-none transition-transform group-hover:translate-y-[-40%]">
//                                     unfold_more
//                                 </span>
//                             </div>

//                             {/* Sort Select */}
//                             <div className="lg:col-span-2 relative group">
//                                 <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-primary dark:text-teal-400 text-sm pointer-events-none z-10">
//                                     sort
//                                 </span>
//                                 <select
//                                     value={sortBy}
//                                     onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'name' | 'clientId')}
//                                     className="appearance-none w-full pl-10 pr-8 py-2.5 text-[11px] font-semibold bg-surface-container-low/80 dark:bg-slate-950/80 text-on-surface dark:text-slate-200 border border-outline-variant/60 dark:border-slate-800 rounded-2xl cursor-pointer hover:bg-surface-bright dark:hover:bg-slate-900 focus:bg-surface-bright dark:focus:bg-slate-900 focus:outline-none focus:border-primary dark:focus:border-teal-500 transition-all duration-200 shadow-inner"
//                                 >
//                                     <option value="newest">Newest First</option>
//                                     <option value="oldest">Oldest First</option>
//                                     <option value="name">Client Name</option>
//                                     <option value="clientId">Client ID</option>
//                                 </select>
//                                 <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-secondary dark:text-slate-400 text-sm pointer-events-none transition-transform group-hover:translate-y-[-40%]">
//                                     unfold_more
//                                 </span>
//                             </div>

//                             {/* View Switcher */}
//                             <div className="lg:col-span-1 flex items-center justify-end gap-1 bg-surface-container-low/80 dark:bg-slate-950/80 p-1 rounded-2xl border border-outline-variant/60 dark:border-slate-800 shadow-inner">
//                                 <button
//                                     type="button"
//                                     onClick={() => setViewMode('table')}
//                                     className={`flex-1 py-2 rounded-xl text-[11px] flex items-center justify-center transition-all duration-200 cursor-pointer ${viewMode === 'table'
//                                         ? 'bg-surface-bright dark:bg-slate-800 shadow-xs text-primary dark:text-teal-300 font-bold scale-105'
//                                         : 'text-secondary dark:text-slate-400 hover:text-on-surface dark:hover:text-white'
//                                         }`}
//                                     title="Table View"
//                                 >
//                                     <span className="material-symbols-outlined text-sm">table_rows</span>
//                                 </button>
//                                 <button
//                                     type="button"
//                                     onClick={() => setViewMode('grid')}
//                                     className={`flex-1 py-2 rounded-xl text-[11px] flex items-center justify-center transition-all duration-200 cursor-pointer ${viewMode === 'grid'
//                                         ? 'bg-surface-bright dark:bg-slate-800 shadow-xs text-primary dark:text-teal-300 font-bold scale-105'
//                                         : 'text-secondary dark:text-slate-400 hover:text-on-surface dark:hover:text-white'
//                                         }`}
//                                     title="Grid View"
//                                 >
//                                     <span className="material-symbols-outlined text-sm">grid_view</span>
//                                 </button>
//                             </div>
//                         </div>
//                     </div>

//                     {/* ==================================================
//                         CONTENT AREA
//                     ================================================== */}
//                     {isLoading ? (
//                         <div className="bg-surface-bright dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-16 text-center border border-outline-variant/60 dark:border-slate-800 shadow-xl">
//                             <div className="h-10 w-10 mx-auto rounded-full border-4 border-secondary-container dark:border-slate-800 border-t-primary animate-spin"></div>
//                             <p className="text-xs font-semibold text-primary dark:text-teal-400 mt-4 tracking-wide">
//                                 Loading client directory...
//                             </p>
//                         </div>
//                     ) : paginatedClients.length === 0 ? (
//                         <div className="bg-surface-bright dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-16 text-center border border-outline-variant/60 dark:border-slate-800 shadow-xl">
//                             <div className="h-14 w-14 mx-auto rounded-2xl bg-surface-container-low dark:bg-slate-800/80 text-secondary dark:text-slate-400 flex items-center justify-center shadow-inner">
//                                 <span className="material-symbols-outlined text-2xl">search_off</span>
//                             </div>
//                             <p className="text-sm font-bold text-on-surface dark:text-white mt-4">No client records found.</p>
//                             <p className="text-xs text-secondary dark:text-slate-400 mt-1">Try changing your search or filters.</p>
//                         </div>
//                     ) : viewMode === 'table' ? (
//                         <div className="bg-surface-bright dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-outline-variant/60 dark:border-slate-800 shadow-xl overflow-hidden">
//                             <div className="overflow-x-auto">
//                                 <table className="w-full text-left border-collapse">
//                                     <thead>
//                                         <tr className="bg-surface-container-low/80 dark:bg-slate-800/80 border-b border-outline-variant/60 dark:border-slate-800 text-[11px] text-secondary dark:text-slate-400 uppercase tracking-wider font-semibold">
//                                             <th className="py-3.5 px-4">Client Details</th>
//                                             <th className="py-3.5 px-4">Phone</th>
//                                             <th className="py-3.5 px-4">Primary Link</th>
//                                             <th className="py-3.5 px-4">Secondary Link</th>
//                                             <th className="py-3.5 px-4">Location</th>
//                                             <th className="py-3.5 px-4">POC Name</th>
//                                             <th className="py-3.5 px-4">Status</th>
//                                             <th className="py-3.5 px-4 text-right">Actions</th>
//                                         </tr>
//                                     </thead>

//                                     <tbody className="divide-y divide-outline-variant/40 dark:divide-slate-800/60 text-xs">
//                                         {paginatedClients.map((client, index) => (
//                                             <tr
//                                                 key={client.id}
//                                                 onClick={() => setSelectedClientForView(client)}
//                                                 className={`group transition-all duration-200 cursor-pointer ${index % 2 === 0
//                                                     ? 'bg-surface-bright dark:bg-slate-900 hover:bg-teal-50/40 dark:hover:bg-slate-800/60'
//                                                     : 'bg-surface-container-low/40 dark:bg-slate-900/50 hover:bg-teal-50/40 dark:hover:bg-slate-800/60'
//                                                     }`}
//                                             >
//                                                 <td className="py-3.5 px-4">
//                                                     <div className="flex items-center gap-3">
//                                                         <div className="h-8 w-8 rounded-xl bg-secondary-container dark:bg-teal-950/80 text-on-secondary-container dark:text-teal-300 font-bold flex items-center justify-center shrink-0 shadow-xs border border-primary/10 dark:border-teal-800/40">
//                                                             <span className="material-symbols-outlined text-base">
//                                                                 person
//                                                             </span>
//                                                         </div>
//                                                         <div>
//                                                             <div className="font-semibold text-on-surface dark:text-white leading-tight">
//                                                                 {client.clientName}
//                                                             </div>
//                                                             <div className="inline-block mt-1 px-1.5 py-0.5 rounded-md bg-surface-container dark:bg-slate-800 font-data-mono text-[10px] text-secondary dark:text-slate-300 font-medium border border-outline-variant/40 dark:border-slate-700">
//                                                                 {client.clientId}
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </td>

//                                                 <td className="py-3.5 px-4 font-data-mono font-medium text-on-surface dark:text-slate-200">
//                                                     {client.clientPhone || '-'}
//                                                 </td>

//                                                 <td className="py-3.5 px-4 font-data-mono">
//                                                     <div className="text-on-surface dark:text-white font-semibold leading-tight">
//                                                         IP: {client.primaryIp || '-'}
//                                                     </div>
//                                                     <div className="text-[11px] text-secondary dark:text-slate-400 font-normal mt-0.5">
//                                                         ONU: {client.primaryOnu || '-'}
//                                                     </div>
//                                                 </td>

//                                                 <td className="py-3.5 px-4 font-data-mono">
//                                                     <div className="text-on-surface dark:text-white font-semibold leading-tight">
//                                                         IP: {client.secondaryIp || '-'}
//                                                     </div>
//                                                     <div className="text-[11px] text-secondary dark:text-slate-400 font-normal mt-0.5">
//                                                         ONU: {client.secondaryOnu || '-'}
//                                                     </div>
//                                                 </td>

//                                                 <td className="py-3.5 px-4 text-on-surface-variant dark:text-slate-300 max-w-[150px]">
//                                                     <div
//                                                         className="truncate font-medium text-on-surface dark:text-slate-200"
//                                                         title={client.location || ''}
//                                                     >
//                                                         {client.location || '-'}
//                                                     </div>
//                                                 </td>

//                                                 <td className="py-3.5 px-4 text-on-surface dark:text-slate-200 font-medium max-w-[120px]">
//                                                     <div className="truncate">{client.pocName || '-'}</div>
//                                                 </td>

//                                                 <td className="py-3.5 px-4">
//                                                     <span
//                                                         className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold shadow-2xs ${client.status === 'Connected'
//                                                             ? 'bg-emerald-50 dark:bg-teal-950/80 text-emerald-700 dark:text-teal-300 border border-emerald-200/60 dark:border-teal-800'
//                                                             : 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800'
//                                                             }`}
//                                                     >
//                                                         <span
//                                                             className={`h-1.5 w-1.5 rounded-full ${client.status === 'Connected'
//                                                                 ? 'bg-emerald-600 dark:bg-teal-400 animate-pulse'
//                                                                 : 'bg-rose-600 dark:bg-rose-500'
//                                                                 }`}
//                                                         />
//                                                         {client.status}
//                                                     </span>
//                                                 </td>

//                                                 <td className="py-3.5 px-4 text-right whitespace-nowrap">
//                                                     <div className="flex items-center justify-end gap-1.5">
//                                                         {/* Edit: Available to Everyone */}
//                                                         <button
//                                                             type="button"
//                                                             onClick={(e) => handleOpenEditModal(client, e)}
//                                                             title="Edit Client"
//                                                             className="p-1.5 rounded-xl text-on-surface dark:text-slate-200 bg-surface-bright dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/50 hover:text-amber-700 dark:hover:text-amber-400 hover:border-amber-300 border border-outline-variant/60 dark:border-slate-700 transition-all duration-200 cursor-pointer shadow-2xs"
//                                                         >
//                                                             <span className="material-symbols-outlined text-sm">
//                                                                 edit
//                                                             </span>
//                                                         </button>

//                                                         {/* Delete: Restricted to Admin and Manager only */}
//                                                         {canDeleteClient() && (
//                                                             <button
//                                                                 type="button"
//                                                                 onClick={(e) => triggerDelete(client.id.toString(), e)}
//                                                                 title="Delete Client"
//                                                                 className="p-1.5 rounded-xl text-on-surface dark:text-slate-200 bg-surface-bright dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-700 dark:hover:text-rose-400 hover:border-rose-300 border border-outline-variant/60 dark:border-slate-700 transition-all duration-200 cursor-pointer shadow-2xs"
//                                                             >
//                                                                 <span className="material-symbols-outlined text-sm">
//                                                                     delete
//                                                                 </span>
//                                                             </button>
//                                                         )}
//                                                     </div>
//                                                 </td>
//                                             </tr>
//                                         ))}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </div>
//                     ) : (
//                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
//                             {paginatedClients.map((client) => (
//                                 <div
//                                     key={client.id}
//                                     onClick={() => setSelectedClientForView(client)}
//                                     className="group bg-surface-bright dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-4.5 border border-outline-variant/60 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 space-y-3 cursor-pointer"
//                                 >
//                                     <div className="flex items-start justify-between">
//                                         <div className="flex items-start gap-3">
//                                             <div className="h-8 w-8 rounded-xl bg-secondary-container dark:bg-teal-950/80 text-on-secondary-container dark:text-teal-300 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-xs border border-primary/10 dark:border-teal-800/40">
//                                                 <span className="material-symbols-outlined text-base">person</span>
//                                             </div>
//                                             <div>
//                                                 <h3 className="font-semibold text-on-surface dark:text-white leading-tight">{client.clientName}</h3>
//                                                 <div className="flex items-center gap-1.5 mt-1">
//                                                     <span className="inline-block px-1.5 py-0.5 rounded-md bg-surface-container dark:bg-slate-800 font-data-mono text-[10px] text-secondary dark:text-slate-300 border border-outline-variant/40 dark:border-slate-700">
//                                                         {client.clientId}
//                                                     </span>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                         <span
//                                             className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${client.status === 'Connected'
//                                                 ? 'bg-emerald-50 dark:bg-teal-950/80 text-emerald-700 dark:text-teal-300 border border-emerald-200/60 dark:border-teal-800'
//                                                 : 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800'
//                                                 }`}
//                                         >
//                                             {client.status}
//                                         </span>
//                                     </div>

//                                     <div className="space-y-1.5 text-on-surface-variant dark:text-slate-300 font-medium">
//                                         <div className="truncate">Phone: <span className="font-data-mono text-on-surface dark:text-slate-200">{client.clientPhone || 'N/A'}</span></div>
//                                         <div className="truncate">Location: <span className="text-on-surface dark:text-slate-200">{client.location || 'N/A'}</span></div>
//                                         <div className="truncate">POC: <span className="text-on-surface dark:text-slate-200">{client.pocName || 'N/A'}</span></div>
//                                         <div className="font-data-mono text-secondary dark:text-slate-400">
//                                             Primary: {client.primaryIp || 'N/A'}
//                                         </div>
//                                     </div>

//                                     <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant/40 dark:border-slate-800">
//                                         <button
//                                             type="button"
//                                             onClick={(e) => handleOpenEditModal(client, e)}
//                                             className="px-3 py-1.5 text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded-xl hover:bg-amber-100 transition-all duration-200 cursor-pointer border border-amber-200/60 dark:border-amber-900/50"
//                                         >
//                                             Edit
//                                         </button>
//                                         {canDeleteClient() && (
//                                             <button
//                                                 type="button"
//                                                 onClick={(e) => triggerDelete(client.id.toString(), e)}
//                                                 className="px-3 py-1.5 text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 rounded-xl hover:bg-rose-100 transition-all duration-200 cursor-pointer border border-rose-200/60 dark:border-rose-900/50"
//                                             >
//                                                 Delete
//                                             </button>
//                                         )}
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     )}

//                     {/* ==================================================
//                         PAGINATION BAR
//                     ================================================== */}
//                     {totalPages > 1 && (
//                         <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-surface-bright/80 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-3xl border border-outline-variant dark:border-slate-800 shadow-xs">
//                             <div className="flex items-center gap-2">
//                                 <div className="h-8 w-8 rounded-xl bg-secondary-container dark:bg-teal-950/80 text-on-secondary-container dark:text-teal-300 flex items-center justify-center">
//                                     <span className="material-symbols-outlined text-sm">auto_stories</span>
//                                 </div>
//                                 <p className="font-body-sm text-secondary dark:text-slate-400">
//                                     Showing <span className="font-bold text-on-surface dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
//                                     <span className="font-bold text-on-surface dark:text-white">
//                                         {Math.min(currentPage * itemsPerPage, filteredClients.length)}
//                                     </span>{' '}
//                                     of <span className="font-bold text-primary dark:text-teal-400">{filteredClients.length}</span> clients (30 per page)
//                                 </p>
//                             </div>

//                             <div className="flex items-center gap-1.5">
//                                 <button
//                                     type="button"
//                                     disabled={currentPage === 1}
//                                     onClick={() => setCurrentPage(1)}
//                                     className="p-2 rounded-xl text-secondary dark:text-slate-400 hover:bg-secondary-container dark:hover:bg-slate-800 hover:text-on-secondary-container dark:hover:text-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-all duration-200"
//                                     title="First Page"
//                                 >
//                                     <span className="material-symbols-outlined text-sm">first_page</span>
//                                 </button>

//                                 <button
//                                     type="button"
//                                     disabled={currentPage === 1}
//                                     onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//                                     className="px-3.5 py-2 font-label-lg rounded-xl border border-outline-variant dark:border-slate-700 text-on-surface-variant dark:text-slate-300 hover:bg-secondary-container dark:hover:bg-slate-800 hover:text-on-secondary-container dark:hover:text-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-all duration-200 flex items-center gap-1"
//                                 >
//                                     <span className="material-symbols-outlined text-sm">chevron_left</span>
//                                     <span>Prev</span>
//                                 </button>

//                                 <div className="flex items-center gap-1 px-1">
//                                     {Array.from({ length: totalPages }, (_, i) => i + 1)
//                                         .filter(
//                                             (page) =>
//                                                 page === 1 ||
//                                                 page === totalPages ||
//                                                 (page >= currentPage - 1 && page <= currentPage + 1)
//                                         )
//                                         .map((page, index, array) => {
//                                             const showEllipsis = index > 0 && page - array[index - 1] > 1;
//                                             return (
//                                                 <React.Fragment key={page}>
//                                                     {showEllipsis && (
//                                                         <span className="px-1 text-secondary dark:text-slate-500 font-bold">...</span>
//                                                     )}
//                                                     <motion.button
//                                                         type="button"
//                                                         whileHover={{ scale: 1.05 }}
//                                                         whileTap={{ scale: 0.95 }}
//                                                         onClick={() => setCurrentPage(page)}
//                                                         className={`min-w-[34px] h-[34px] font-label-lg rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-center ${currentPage === page
//                                                             ? 'bg-gradient-to-r from-primary to-primary-container text-on-primary shadow-md shadow-primary/20'
//                                                             : 'text-on-surface-variant dark:text-slate-300 hover:bg-surface-container dark:hover:bg-slate-800 hover:text-on-surface dark:hover:text-white'
//                                                             }`}
//                                                     >
//                                                         {page}
//                                                     </motion.button>
//                                                 </React.Fragment>
//                                             );
//                                         })}
//                                 </div>

//                                 <button
//                                     type="button"
//                                     disabled={currentPage === totalPages}
//                                     onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
//                                     className="px-3.5 py-2 font-label-lg rounded-xl border border-outline-variant dark:border-slate-700 text-on-surface-variant dark:text-slate-300 hover:bg-secondary-container dark:hover:bg-slate-800 hover:text-on-secondary-container dark:hover:text-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-all duration-200 flex items-center gap-1"
//                                 >
//                                     <span>Next</span>
//                                     <span className="material-symbols-outlined text-sm">chevron_right</span>
//                                 </button>

//                                 <button
//                                     type="button"
//                                     disabled={currentPage === totalPages}
//                                     onClick={() => setCurrentPage(totalPages)}
//                                     className="p-2 rounded-xl text-secondary dark:text-slate-400 hover:bg-secondary-container dark:hover:bg-slate-800 hover:text-on-secondary-container dark:hover:text-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-all duration-200"
//                                     title="Last Page"
//                                 >
//                                     <span className="material-symbols-outlined text-sm">last_page</span>
//                                 </button>
//                             </div>
//                         </div>
//                     )}
//                 </div>

//                 {/* MODALS & DIALOGS */}
//                 <ClientDetailsModal
//                     client={selectedClientForView}
//                     onClose={() => setSelectedClientForView(null)}
//                     onEdit={(client) => handleOpenEditModal(client)}
//                 />

//                 <ConfirmDialog
//                     isOpen={!!deleteTargetId}
//                     title="Delete Client Record?"
//                     message="Are you sure you want to remove this client? This action cannot be undone."
//                     onConfirm={confirmDelete}
//                     onCancel={() => setDeleteTargetId(null)}
//                 />

//                 <ConfirmDialog
//                     isOpen={!!deletePocTargetId}
//                     title="Delete POC?"
//                     message="Are you sure you want to delete this POC? Clients using this POC will keep their records, but the POC assignment will be removed."
//                     onConfirm={confirmDeletePoc}
//                     onCancel={() => setDeletePocTargetId(null)}
//                 />

//                 {/* CLIENT ADD/EDIT MODAL */}
//                 <AnimatePresence>
//                     {isClientModalOpen && (
//                         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//                             <motion.div
//                                 initial={{ opacity: 0 }}
//                                 animate={{ opacity: 1 }}
//                                 exit={{ opacity: 0 }}
//                                 transition={{ duration: 0.2 }}
//                                 onClick={() => !isClientSaving && setIsClientModalOpen(false)}
//                                 className="absolute inset-0 bg-inverse-surface/40 dark:bg-black/60 backdrop-blur-sm"
//                             />

//                             <motion.div
//                                 initial={{ opacity: 0, scale: 0.95, y: 15 }}
//                                 animate={{ opacity: 1, scale: 1, y: 0 }}
//                                 exit={{ opacity: 0, scale: 0.95, y: 15 }}
//                                 transition={{ duration: 0.25, ease: 'easeOut' }}
//                                 className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-surface-bright dark:bg-slate-900 backdrop-blur-xl shadow-2xl border border-outline-variant dark:border-slate-800 flex flex-col max-h-[90vh]"
//                             >
//                                 <div className="flex justify-between items-center px-6 py-5 bg-surface-bright/80 dark:bg-slate-900 border-b border-outline-variant dark:border-slate-800">
//                                     <div className="flex items-center gap-3">
//                                         <div className="h-10 w-10 bg-secondary-container dark:bg-teal-950 text-on-secondary-container dark:text-teal-300 rounded-2xl flex items-center justify-center">
//                                             <span className="material-symbols-outlined text-xl">
//                                                 {editingClient ? 'edit_note' : 'person_add'}
//                                             </span>
//                                         </div>
//                                         <div>
//                                             <h2 className="font-headline-md text-on-surface dark:text-white">
//                                                 {editingClient ? 'Edit Client Record' : 'New Client Registration'}
//                                             </h2>
//                                             <p className="font-body-sm text-secondary dark:text-slate-400">
//                                                 {editingClient
//                                                     ? 'Update connection & contact details'
//                                                     : 'Fill in client info to add to network'}
//                                             </p>
//                                         </div>
//                                     </div>

//                                     <button
//                                         type="button"
//                                         disabled={isClientSaving}
//                                         onClick={() => setIsClientModalOpen(false)}
//                                         className="h-8 w-8 rounded-full bg-surface-container-low dark:bg-slate-800 hover:bg-error-container dark:hover:bg-rose-950 hover:text-on-error-container dark:hover:text-rose-400 text-secondary dark:text-slate-400 flex items-center justify-center transition-all duration-200 cursor-pointer hover:rotate-90 disabled:opacity-50"
//                                     >
//                                         <span className="material-symbols-outlined text-lg">close</span>
//                                     </button>
//                                 </div>

//                                 <form onSubmit={handleSaveClient} className="overflow-y-auto p-6 space-y-6 custom-scrollbar">
//                                     <motion.div
//                                         initial={{ opacity: 0, x: -10 }}
//                                         animate={{ opacity: 1, x: 0 }}
//                                         transition={{ delay: 0.05 }}
//                                         className="space-y-4"
//                                     >
//                                         <div className="flex items-center gap-2.5 pb-2 border-b border-outline-variant dark:border-slate-800 text-primary dark:text-teal-400">
//                                             <div className="p-2 bg-secondary-container dark:bg-teal-950 rounded-xl">
//                                                 <span className="material-symbols-outlined text-lg leading-none">badge</span>
//                                             </div>
//                                             <h3 className="font-label-lg uppercase tracking-wider text-on-surface dark:text-white">
//                                                 Basic Information
//                                             </h3>
//                                         </div>

//                                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                             <div>
//                                                 <label className="block font-label-md uppercase tracking-wider text-secondary dark:text-slate-400 mb-1.5">
//                                                     Client ID <span className="text-error">*</span>
//                                                 </label>
//                                                 <input
//                                                     type="text"
//                                                     required
//                                                     value={clientForm.clientId}
//                                                     onChange={(e) =>
//                                                         setClientForm({ ...clientForm, clientId: e.target.value })
//                                                     }
//                                                     placeholder="CLI-2001"
//                                                     className="w-full font-data-mono p-3 bg-surface-container-low dark:bg-slate-800 text-on-surface dark:text-slate-100 border border-outline-variant dark:border-slate-700 rounded-xl focus:bg-surface-bright dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-teal-500/20 focus:border-primary dark:focus:border-teal-500 transition-all duration-200"
//                                                 />
//                                             </div>

//                                             <div className="md:col-span-2">
//                                                 <label className="block font-label-md uppercase tracking-wider text-secondary dark:text-slate-400 mb-1.5">
//                                                     Client Name <span className="text-error">*</span>
//                                                 </label>
//                                                 <input
//                                                     type="text"
//                                                     required
//                                                     value={clientForm.clientName}
//                                                     onChange={(e) =>
//                                                         setClientForm({ ...clientForm, clientName: e.target.value })
//                                                     }
//                                                     placeholder="Apex Software Ltd."
//                                                     className="w-full font-body-md p-3 bg-surface-container-low dark:bg-slate-800 text-on-surface dark:text-slate-100 border border-outline-variant dark:border-slate-700 rounded-xl focus:bg-surface-bright dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-teal-500/20 focus:border-primary dark:focus:border-teal-500 transition-all duration-200"
//                                                 />
//                                             </div>

//                                             <div>
//                                                 <label className="block font-label-md uppercase tracking-wider text-secondary dark:text-slate-400 mb-1.5">
//                                                     Client Phone
//                                                 </label>
//                                                 <input
//                                                     type="text"
//                                                     value={clientForm.clientPhone}
//                                                     onChange={(e) =>
//                                                         setClientForm({ ...clientForm, clientPhone: e.target.value })
//                                                     }
//                                                     placeholder="+88017xxxxxxxx"
//                                                     className="w-full font-data-mono p-3 bg-surface-container-low dark:bg-slate-800 text-on-surface dark:text-slate-100 border border-outline-variant dark:border-slate-700 rounded-xl focus:bg-surface-bright dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-teal-500/20 focus:border-primary dark:focus:border-teal-500 transition-all duration-200"
//                                                 />
//                                             </div>

//                                             <div className="md:col-span-2">
//                                                 <label className="block font-label-md uppercase tracking-wider text-secondary dark:text-slate-400 mb-1.5">
//                                                     Connection Status
//                                                 </label>
//                                                 <div className="relative">
//                                                     <span
//                                                         className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none h-2.5 w-2.5 rounded-full transition-colors duration-300 ${clientForm.status === 'Connected'
//                                                             ? 'bg-primary dark:bg-teal-400 shadow-[0_0_8px_rgba(13,148,136,0.5)]'
//                                                             : 'bg-error dark:bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
//                                                             }`}
//                                                     />
//                                                     <select
//                                                         value={clientForm.status}
//                                                         onChange={(e) =>
//                                                             setClientForm({
//                                                                 ...clientForm,
//                                                                 status: e.target.value as 'Connected' | 'Disconnected',
//                                                             })
//                                                         }
//                                                         className={`appearance-none w-full font-label-lg pl-8 pr-10 py-3 bg-surface-container-low dark:bg-slate-800 border border-outline-variant dark:border-slate-700 rounded-xl cursor-pointer focus:bg-surface-bright dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 ${clientForm.status === 'Connected'
//                                                             ? 'text-on-secondary-container dark:text-teal-300 font-bold'
//                                                             : 'text-error dark:text-rose-400 font-bold'
//                                                             }`}
//                                                     >
//                                                         <option value="Connected">Connected</option>
//                                                         <option value="Disconnected">Disconnected</option>
//                                                     </select>
//                                                     <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-secondary dark:text-slate-400 text-lg pointer-events-none">
//                                                         unfold_more
//                                                     </span>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </motion.div>

//                                     <motion.div
//                                         initial={{ opacity: 0, x: -10 }}
//                                         animate={{ opacity: 1, x: 0 }}
//                                         transition={{ delay: 0.1 }}
//                                         className="space-y-4"
//                                     >
//                                         <div className="flex items-center gap-2.5 pb-2 border-b border-outline-variant dark:border-slate-800 text-primary dark:text-teal-400">
//                                             <div className="p-2 bg-secondary-container dark:bg-teal-950 rounded-xl">
//                                                 <span className="material-symbols-outlined text-lg leading-none">router</span>
//                                             </div>
//                                             <h3 className="font-label-lg uppercase tracking-wider text-on-surface dark:text-white">
//                                                 Network Configurations
//                                             </h3>
//                                         </div>

//                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface-container-low/50 dark:bg-slate-800/40 p-4 rounded-2xl border border-outline-variant dark:border-slate-800">
//                                             <div className="space-y-3 p-3 bg-surface-bright dark:bg-slate-800 rounded-xl border border-outline-variant dark:border-slate-700 shadow-sm">
//                                                 <span className="inline-block font-label-md uppercase text-on-secondary-container dark:text-teal-300 bg-secondary-container dark:bg-teal-950 px-2 py-0.5 rounded-md tracking-wider">
//                                                     Primary Connection
//                                                 </span>
//                                                 <div>
//                                                     <label className="block font-body-sm text-secondary dark:text-slate-400 mb-1">
//                                                         Primary IP
//                                                     </label>
//                                                     <input
//                                                         type="text"
//                                                         value={clientForm.primaryIp}
//                                                         onChange={(e) =>
//                                                             setClientForm({ ...clientForm, primaryIp: e.target.value })
//                                                         }
//                                                         placeholder="103.145.220.10"
//                                                         className="w-full font-data-mono p-2.5 bg-surface-container-low dark:bg-slate-900 text-on-surface dark:text-slate-100 border border-outline-variant dark:border-slate-700 rounded-lg focus:bg-surface-bright dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
//                                                     />
//                                                 </div>
//                                                 <div>
//                                                     <label className="block font-body-sm text-secondary dark:text-slate-400 mb-1">
//                                                         Primary ONU MAC/SN
//                                                     </label>
//                                                     <input
//                                                         type="text"
//                                                         value={clientForm.primaryOnu}
//                                                         onChange={(e) =>
//                                                             setClientForm({ ...clientForm, primaryOnu: e.target.value })
//                                                         }
//                                                         placeholder="HWTC12345678"
//                                                         className="w-full font-data-mono p-2.5 bg-surface-container-low dark:bg-slate-900 text-on-surface dark:text-slate-100 border border-outline-variant dark:border-slate-700 rounded-lg focus:bg-surface-bright dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
//                                                     />
//                                                 </div>
//                                             </div>

//                                             <div className="space-y-3 p-3 bg-surface-bright dark:bg-slate-800 rounded-xl border border-outline-variant dark:border-slate-700 shadow-sm">
//                                                 <span className="inline-block font-label-md uppercase text-secondary dark:text-slate-400 bg-surface-container dark:bg-slate-700 px-2 py-0.5 rounded-md tracking-wider">
//                                                     Backup Connection
//                                                 </span>
//                                                 <div>
//                                                     <label className="block font-body-sm text-secondary dark:text-slate-400 mb-1">
//                                                         Secondary IP
//                                                     </label>
//                                                     <input
//                                                         type="text"
//                                                         value={clientForm.secondaryIp}
//                                                         onChange={(e) =>
//                                                             setClientForm({ ...clientForm, secondaryIp: e.target.value })
//                                                         }
//                                                         placeholder="103.145.220.11"
//                                                         className="w-full font-data-mono p-2.5 bg-surface-container-low dark:bg-slate-900 text-on-surface dark:text-slate-100 border border-outline-variant dark:border-slate-700 rounded-lg focus:bg-surface-bright dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
//                                                     />
//                                                 </div>
//                                                 <div>
//                                                     <label className="block font-body-sm text-secondary dark:text-slate-400 mb-1">
//                                                         Secondary ONU MAC/SN
//                                                     </label>
//                                                     <input
//                                                         type="text"
//                                                         value={clientForm.secondaryOnu}
//                                                         onChange={(e) =>
//                                                             setClientForm({ ...clientForm, secondaryOnu: e.target.value })
//                                                         }
//                                                         placeholder="ZTE78901234"
//                                                         className="w-full font-data-mono p-2.5 bg-surface-container-low dark:bg-slate-900 text-on-surface dark:text-slate-100 border border-outline-variant dark:border-slate-700 rounded-lg focus:bg-surface-bright dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
//                                                     />
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </motion.div>

//                                     <motion.div
//                                         initial={{ opacity: 0, x: -10 }}
//                                         animate={{ opacity: 1, x: 0 }}
//                                         transition={{ delay: 0.15 }}
//                                         className="space-y-4"
//                                     >
//                                         <div className="flex items-center gap-2.5 pb-2 border-b border-outline-variant dark:border-slate-800 text-primary dark:text-teal-400">
//                                             <div className="p-2 bg-secondary-container dark:bg-teal-950 rounded-xl">
//                                                 <span className="material-symbols-outlined text-lg leading-none">location_on</span>
//                                             </div>
//                                             <h3 className="font-label-lg uppercase tracking-wider text-on-surface dark:text-white">
//                                                 Location & POC
//                                             </h3>
//                                         </div>

//                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                             <div>
//                                                 <label className="block font-label-md uppercase tracking-wider text-secondary dark:text-slate-400 mb-1.5">
//                                                     Point of Connections (POC)
//                                                 </label>
//                                                 <div className="relative">
//                                                     <select
//                                                         value={clientForm.pocId}
//                                                         onChange={(e) =>
//                                                             setClientForm({ ...clientForm, pocId: e.target.value })
//                                                         }
//                                                         className="appearance-none w-full font-label-lg p-3 pr-10 bg-surface-container-low dark:bg-slate-800 text-on-surface dark:text-slate-100 border border-outline-variant dark:border-slate-700 rounded-xl cursor-pointer focus:bg-surface-bright dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
//                                                     >
//                                                         <option value="">Select Point of Connections...</option>
//                                                         {pocs.map((poc) => (
//                                                             <option key={poc.id} value={poc.id.toString()}>
//                                                                 {poc.name}
//                                                             </option>
//                                                         ))}
//                                                     </select>
//                                                     <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-secondary dark:text-slate-400 text-lg pointer-events-none">
//                                                         unfold_more
//                                                     </span>
//                                                 </div>
//                                             </div>

//                                             <div>
//                                                 <label className="block font-label-md uppercase tracking-wider text-secondary dark:text-slate-400 mb-1.5">
//                                                     Location Address
//                                                 </label>
//                                                 <input
//                                                     type="text"
//                                                     value={clientForm.location}
//                                                     onChange={(e) =>
//                                                         setClientForm({ ...clientForm, location: e.target.value })
//                                                     }
//                                                     placeholder="Floor 4, Building B, Agrabad C/A"
//                                                     className="w-full font-body-md p-3 bg-surface-container-low dark:bg-slate-800 text-on-surface dark:text-slate-100 border border-outline-variant dark:border-slate-700 rounded-xl focus:bg-surface-bright dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
//                                                 />
//                                             </div>

//                                             <div className="md:col-span-2">
//                                                 <label className="block font-label-md uppercase tracking-wider text-secondary dark:text-slate-400 mb-1.5">
//                                                     Description / Remarks
//                                                 </label>
//                                                 <textarea
//                                                     rows={2}
//                                                     value={clientForm.description}
//                                                     onChange={(e) =>
//                                                         setClientForm({ ...clientForm, description: e.target.value })
//                                                     }
//                                                     placeholder="Additional notes about connectivity or setup..."
//                                                     className="w-full font-body-md p-3 bg-surface-container-low dark:bg-slate-800 text-on-surface dark:text-slate-100 border border-outline-variant dark:border-slate-700 rounded-xl focus:bg-surface-bright dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 resize-none"
//                                                 />
//                                             </div>
//                                         </div>
//                                     </motion.div>

//                                     <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant dark:border-slate-800">
//                                         <motion.button
//                                             type="button"
//                                             whileHover={{ scale: 1.02 }}
//                                             whileTap={{ scale: 0.98 }}
//                                             onClick={() => setIsClientModalOpen(false)}
//                                             disabled={isClientSaving}
//                                             className="px-5 py-2.5 rounded-xl border border-outline-variant dark:border-slate-700 font-label-lg text-secondary dark:text-slate-300 hover:bg-surface-container-low dark:hover:bg-slate-800 transition-all duration-200 cursor-pointer disabled:opacity-50"
//                                         >
//                                             Cancel
//                                         </motion.button>

//                                         <motion.button
//                                             type="submit"
//                                             disabled={isClientSaving}
//                                             whileHover={{ scale: isClientSaving ? 1 : 1.02 }}
//                                             whileTap={{ scale: isClientSaving ? 1 : 0.97 }}
//                                             className={`relative overflow-hidden px-6 py-2.5 text-on-primary rounded-xl font-label-lg shadow-md transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 min-w-[130px] ${editingClient
//                                                 ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-amber-500/25'
//                                                 : 'bg-gradient-to-r from-primary to-primary-container hover:shadow-primary/25'
//                                                 } disabled:opacity-80`}
//                                         >
//                                             <AnimatePresence mode="wait">
//                                                 {isClientSaving ? (
//                                                     <motion.div
//                                                         key="loading"
//                                                         initial={{ opacity: 0, scale: 0.8 }}
//                                                         animate={{ opacity: 1, scale: 1 }}
//                                                         exit={{ opacity: 0, scale: 0.8 }}
//                                                         className="flex items-center gap-2"
//                                                     >
//                                                         <motion.span
//                                                             animate={{ rotate: 360 }}
//                                                             transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
//                                                             className="material-symbols-outlined text-base"
//                                                         >
//                                                             progress_activity
//                                                         </motion.span>
//                                                         <span>{editingClient ? 'Updating...' : 'Saving...'}</span>
//                                                     </motion.div>
//                                                 ) : (
//                                                     <motion.div
//                                                         key="static"
//                                                         initial={{ opacity: 0, scale: 0.8 }}
//                                                         animate={{ opacity: 1, scale: 1 }}
//                                                         exit={{ opacity: 0, scale: 0.8 }}
//                                                         className="flex items-center gap-1.5"
//                                                     >
//                                                         <span className="material-symbols-outlined text-base">
//                                                             {editingClient ? 'save' : 'check'}
//                                                         </span>
//                                                         <span>{editingClient ? 'Update Client' : 'Save Client'}</span>
//                                                     </motion.div>
//                                                 )}
//                                             </AnimatePresence>
//                                         </motion.button>
//                                     </div>
//                                 </form>
//                             </motion.div>
//                         </div>
//                     )}
//                 </AnimatePresence>

//                 {/* POC MANAGEMENT MODAL */}
//                 {isPocManagementOpen && (
//                     <div
//                         onClick={() => setIsPocManagementOpen(false)}
//                         className="fixed inset-0 z-[60] flex items-center justify-center bg-inverse-surface/40 dark:bg-black/60 backdrop-blur-sm p-4"
//                     >
//                         <div
//                             onClick={(e) => e.stopPropagation()}
//                             className="w-full max-w-lg bg-surface-bright dark:bg-slate-900 rounded-3xl shadow-2xl border border-outline-variant dark:border-slate-800 overflow-hidden"
//                         >
//                             <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant dark:border-slate-800">
//                                 <div className="flex items-center gap-3">
//                                     <div className="h-10 w-10 bg-secondary-container dark:bg-teal-950 text-on-secondary-container dark:text-teal-300 rounded-xl flex items-center justify-center">
//                                         <span className="material-symbols-outlined">manage_accounts</span>
//                                     </div>
//                                     <div>
//                                         <h2 className="font-headline-md text-on-surface dark:text-white">POC Management</h2>
//                                         <p className="font-body-sm text-secondary dark:text-slate-400 mt-0.5">
//                                             Add, edit or delete Point of Connections
//                                         </p>
//                                     </div>
//                                 </div>

//                                 <button
//                                     type="button"
//                                     onClick={() => setIsPocManagementOpen(false)}
//                                     className="h-8 w-8 rounded-full bg-surface-container-low dark:bg-slate-800 hover:bg-error-container dark:hover:bg-rose-950 hover:text-on-error-container dark:hover:text-rose-400 text-secondary dark:text-slate-400 flex items-center justify-center transition-all duration-200 cursor-pointer hover:rotate-90"
//                                 >
//                                     <span className="material-symbols-outlined text-lg">close</span>
//                                 </button>
//                             </div>

//                             <div className="p-5">
//                                 {pocs.length === 0 ? (
//                                     <div className="text-center py-10">
//                                         <div className="h-14 w-14 mx-auto rounded-2xl bg-surface-container-low dark:bg-slate-800 text-secondary dark:text-slate-400 flex items-center justify-center">
//                                             <span className="material-symbols-outlined text-2xl">person_off</span>
//                                         </div>
//                                         <p className="font-headline-sm text-on-surface dark:text-white mt-3">No POC found</p>
//                                         <p className="font-body-sm text-secondary dark:text-slate-400 mt-1">Add your first Point of Connection.</p>
//                                     </div>
//                                 ) : (
//                                     <div className="space-y-2 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
//                                         {pocs.map((poc) => (
//                                             <div
//                                                 key={poc.id}
//                                                 className="group flex items-center justify-between gap-3 p-3 rounded-2xl border border-outline-variant dark:border-slate-800 bg-surface-container-low/60 dark:bg-slate-800/60 hover:bg-surface-bright dark:hover:bg-slate-800 hover:border-primary/40 dark:hover:border-teal-700 hover:shadow-sm transition-all duration-200"
//                                             >
//                                                 <div className="flex items-center gap-3 min-w-0">
//                                                     <div className="h-10 w-10 shrink-0 rounded-xl bg-secondary-container dark:bg-teal-950 text-on-secondary-container dark:text-teal-300 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
//                                                         <span className="material-symbols-outlined text-lg">hub</span>
//                                                     </div>
//                                                     <div className="min-w-0">
//                                                         <p className="font-label-lg text-on-surface dark:text-white truncate">{poc.name}</p>
//                                                         <p className="font-body-sm text-secondary dark:text-slate-400 mt-0.5">POC ID: {poc.id}</p>
//                                                     </div>
//                                                 </div>

//                                                 <div className="flex items-center gap-1.5 shrink-0">
//                                                     <button
//                                                         type="button"
//                                                         onClick={() => handleEditPoc(poc)}
//                                                         title="Edit POC"
//                                                         className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-100 flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
//                                                     >
//                                                         <span className="material-symbols-outlined text-base">edit</span>
//                                                     </button>
//                                                     <button
//                                                         type="button"
//                                                         onClick={() => setDeletePocTargetId(poc.id.toString())}
//                                                         title="Delete POC"
//                                                         className="h-9 w-9 rounded-xl bg-error-container dark:bg-rose-950/50 border border-error/30 dark:border-rose-800 text-on-error-container dark:text-rose-400 hover:bg-red-200 flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
//                                                     >
//                                                         <span className="material-symbols-outlined text-base">delete</span>
//                                                     </button>
//                                                 </div>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 )}

//                                 <div className="flex items-center justify-between gap-2 mt-5 pt-4 border-t border-outline-variant dark:border-slate-800">
//                                     <p className="font-body-sm text-secondary dark:text-slate-400">
//                                         Total POCs: <span className="font-bold text-on-surface dark:text-white">{pocs.length}</span>
//                                     </p>

//                                     <div className="flex items-center gap-2">
//                                         <button
//                                             type="button"
//                                             onClick={() => setIsPocManagementOpen(false)}
//                                             className="px-4 py-2.5 rounded-xl border border-outline-variant dark:border-slate-700 font-label-lg text-secondary dark:text-slate-300 hover:bg-surface-container-low dark:hover:bg-slate-800 transition-all duration-200 cursor-pointer"
//                                         >
//                                             Close
//                                         </button>
//                                         <button
//                                             type="button"
//                                             onClick={handleOpenAddPoc}
//                                             className="px-4 py-2.5 bg-primary hover:bg-primary-container text-on-primary rounded-xl font-label-lg transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm hover:shadow-md active:scale-[0.98]"
//                                         >
//                                             <span className="material-symbols-outlined text-base">add</span>
//                                             Add POC
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* ADD / EDIT POC MODAL */}
//                 {isPocModalOpen && (
//                     <div
//                         onClick={() => setIsPocModalOpen(false)}
//                         className="fixed inset-0 z-[70] flex items-center justify-center bg-inverse-surface/40 dark:bg-black/60 backdrop-blur-sm p-4"
//                     >
//                         <div
//                             onClick={(e) => e.stopPropagation()}
//                             className="w-full max-w-sm overflow-hidden rounded-3xl bg-surface-bright dark:bg-slate-900 shadow-2xl border border-outline-variant dark:border-slate-800"
//                         >
//                             <div className="flex justify-between items-center px-6 py-5 border-b border-outline-variant dark:border-slate-800">
//                                 <div className="flex items-center gap-3">
//                                     <div
//                                         className={`h-10 w-10 rounded-2xl flex items-center justify-center ${editingPoc ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400' : 'bg-secondary-container dark:bg-teal-950 text-on-secondary-container dark:text-teal-300'
//                                             }`}
//                                     >
//                                         <span className="material-symbols-outlined text-xl">
//                                             {editingPoc ? 'edit' : 'hub'}
//                                         </span>
//                                     </div>
//                                     <div>
//                                         <h2 className="font-headline-sm text-on-surface dark:text-white">
//                                             {editingPoc ? 'Edit Point of Connection' : 'Add Point of Connection'}
//                                         </h2>
//                                         <p className="font-body-sm text-secondary dark:text-slate-400 mt-0.5">
//                                             {editingPoc ? 'Update POC information' : 'Create a new POC'}
//                                         </p>
//                                     </div>
//                                 </div>

//                                 <button
//                                     type="button"
//                                     onClick={() => {
//                                         setIsPocModalOpen(false);
//                                         setEditingPoc(null);
//                                     }}
//                                     className="h-8 w-8 rounded-full bg-surface-container-low dark:bg-slate-800 hover:bg-error-container dark:hover:bg-rose-950 hover:text-on-error-container dark:hover:text-rose-400 text-secondary dark:text-slate-400 flex items-center justify-center transition-all duration-200 cursor-pointer hover:rotate-90"
//                                 >
//                                     <span className="material-symbols-outlined text-lg">close</span>
//                                 </button>
//                             </div>

//                             <form onSubmit={handleSavePoc} className="p-6 space-y-5">
//                                 <div>
//                                     <label className="block font-label-md uppercase tracking-wider text-secondary dark:text-slate-400 mb-1.5">
//                                         POC Name <span className="text-error">*</span>
//                                     </label>
//                                     <div className="relative">
//                                         <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary dark:text-slate-400 text-base">
//                                             hub
//                                         </span>
//                                         <input
//                                             type="text"
//                                             required
//                                             autoFocus
//                                             value={pocForm.name}
//                                             onChange={(e) => setPocForm({ ...pocForm, name: e.target.value })}
//                                             className="w-full font-body-md pl-10 pr-3 py-3 bg-surface-container-low dark:bg-slate-800 text-on-surface dark:text-slate-100 border border-outline-variant dark:border-slate-700 rounded-xl focus:bg-surface-bright dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
//                                             placeholder="e.g. Agrabad POP Connection"
//                                         />
//                                     </div>
//                                 </div>

//                                 <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant dark:border-slate-800">
//                                     <button
//                                         type="button"
//                                         onClick={() => {
//                                             setIsPocModalOpen(false);
//                                             setEditingPoc(null);
//                                         }}
//                                         className="px-4 py-2.5 rounded-xl border border-outline-variant dark:border-slate-700 font-label-lg text-secondary dark:text-slate-300 hover:bg-surface-container-low dark:hover:bg-slate-800 transition-all duration-200 cursor-pointer"
//                                     >
//                                         Cancel
//                                     </button>

//                                     <button
//                                         type="submit"
//                                         className={`px-5 py-2.5 text-on-primary rounded-xl font-label-lg shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md active:scale-[0.98] flex items-center gap-1.5 ${editingPoc ? 'bg-amber-600 hover:bg-amber-700' : 'bg-primary hover:bg-primary-container'
//                                             }`}
//                                     >
//                                         <span className="material-symbols-outlined text-base">
//                                             {editingPoc ? 'save' : 'check'}
//                                         </span>
//                                         {editingPoc ? 'Update POC' : 'Save POC'}
//                                     </button>
//                                 </div>
//                             </form>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </ProtectedRoute>
//     );
// }











// =====================2nd=====================================









// 'use client';
// import React, {
//     useState,
//     useEffect,
//     useMemo,
//     useRef,
// } from 'react';
// import Link from 'next/link';
// import { motion, AnimatePresence } from 'framer-motion';

// import {
//     ClientInfo,
//     POC,
// } from '@/types/client';

// import ConfirmDialog from '@/components/ConfirmDialog';
// import ClientDetailsModal from '@/components/ClientDetailsModal';
// import ProtectedRoute from '@/components/ProtectedRoute';

// export default function ClientInfoPage() {
//     // --------------------------------------------------
//     // Data
//     // --------------------------------------------------
//     const [clients, setClients] = useState<ClientInfo[]>([]);
//     const [pocs, setPocs] = useState<POC[]>([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [isSearching, setIsSearching] = useState(false);
//     const [isClientSaving, setIsClientSaving] = useState(false);

//     // --------------------------------------------------
//     // User Role & Permissions State
//     // --------------------------------------------------
//     const [currentUserRole, setCurrentUserRole] = useState<string>('');

//     // --------------------------------------------------
//     // Controls & Filters
//     // --------------------------------------------------
//     const [searchQuery, setSearchQuery] = useState('');
//     const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
//     const [statusFilter, setStatusFilter] = useState<'All' | 'Connected' | 'Disconnected'>('All');
//     const [pocFilter, setPocFilter] = useState<string>('All');
//     const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'clientId'>('newest');
//     const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

//     // --------------------------------------------------
//     // Pagination (Per page 30 Clients)
//     // --------------------------------------------------
//     const [currentPage, setCurrentPage] = useState(1);
//     const itemsPerPage = 30;

//     // --------------------------------------------------
//     // Client Modals
//     // --------------------------------------------------
//     const [isClientModalOpen, setIsClientModalOpen] = useState(false);
//     const [selectedClientForView, setSelectedClientForView] = useState<ClientInfo | null>(null);
//     const [editingClient, setEditingClient] = useState<ClientInfo | null>(null);

//     // --------------------------------------------------
//     // POC Modals
//     // --------------------------------------------------
//     const [isPocModalOpen, setIsPocModalOpen] = useState(false);
//     const [isPocManagementOpen, setIsPocManagementOpen] = useState(false);
//     const [editingPoc, setEditingPoc] = useState<POC | null>(null);

//     // --------------------------------------------------
//     // Delete Targets
//     // --------------------------------------------------
//     const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
//     const [deletePocTargetId, setDeletePocTargetId] = useState<string | null>(null);

//     // --------------------------------------------------
//     // Toast Notification State
//     // --------------------------------------------------
//     type ToastType = 'success' | 'error' | 'warning';

//     const [toast, setToast] = useState<{
//         show: boolean;
//         message: string;
//         type: ToastType;
//     }>({
//         show: false,
//         message: '',
//         type: 'success',
//     });

//     const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

//     const showToast = (message: string, type: ToastType = 'success') => {
//         if (toastTimerRef.current) {
//             clearTimeout(toastTimerRef.current);
//         }

//         setToast({
//             show: true,
//             message,
//             type,
//         });

//         toastTimerRef.current = setTimeout(() => {
//             setToast((prev) => ({
//                 ...prev,
//                 show: false,
//             }));
//         }, 3000);
//     };

//     // --------------------------------------------------
//     // Client Form State
//     // --------------------------------------------------
//     const [clientForm, setClientForm] = useState({
//         clientId: '',
//         clientName: '',
//         clientPhone: '',
//         primaryIp: '',
//         primaryOnu: '',
//         secondaryIp: '',
//         secondaryOnu: '',
//         location: '',
//         pocId: '',
//         status: 'Connected' as 'Connected' | 'Disconnected',
//         description: '',
//     });

//     // --------------------------------------------------
//     // POC Form State
//     // --------------------------------------------------
//     const [pocForm, setPocForm] = useState({
//         name: '',
//         phone: '',
//         designation: '',
//     });

//     // ==================================================
//     // LOAD USER ROLE & INITIAL DATA
//     // ==================================================
//     useEffect(() => {
//         const storedUser = sessionStorage.getItem('netbill_session_user');
//         if (storedUser) {
//             try {
//                 const userData = JSON.parse(storedUser);
//                 const role = userData.role || userData.designation || userData.type || '';
//                 setCurrentUserRole(role.toLowerCase());
//             } catch {
//                 setCurrentUserRole(storedUser.toLowerCase());
//             }
//         }

//         const fetchInitialData = async () => {
//             setIsLoading(true);

//             try {
//                 const [pocsRes, clientsRes] = await Promise.all([
//                     fetch('/api/pocs', { cache: 'no-store' }),
//                     fetch('/api/clients', { cache: 'no-store' }),
//                 ]);

//                 if (pocsRes.ok) {
//                     const pocsData = await pocsRes.json();
//                     const normalizedPocs = Array.isArray(pocsData)
//                         ? pocsData
//                         : pocsData?.pocs || pocsData?.data || [];
//                     setPocs(normalizedPocs);
//                 }

//                 if (clientsRes.ok) {
//                     const clientsData = await clientsRes.json();
//                     const normalizedClients = Array.isArray(clientsData)
//                         ? clientsData
//                         : clientsData?.clients || clientsData?.data || [];
//                     setClients(normalizedClients);
//                 }
//             } catch (error) {
//                 console.error('Error fetching data:', error);
//                 showToast('Failed to load client information.', 'error');
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchInitialData();
//     }, []);

//     // Helper to check if current user can delete (Admin or Manager only)
//     const canDeleteClient = () => {
//         const role = currentUserRole;
//         if (!role) return true;
//         return role.includes('admin') || role.includes('manager');
//     };

//     // ==================================================
//     // RECORD ACTIVITY LOG HELPER
//     // ==================================================
//     const recordLog = async (
//         action: 'CREATE_CLIENT' | 'UPDATE_CLIENT' | 'DELETE_CLIENT',
//         clientId: string,
//         clientName: string,
//         details: string
//     ) => {
//         try {
//             let loggedInUser = 'Admin';

//             const storedUser = sessionStorage.getItem('netbill_session_user');
//             if (storedUser) {
//                 try {
//                     const userData = JSON.parse(storedUser);
//                     loggedInUser = userData.name || userData.email || userData.username || storedUser;
//                 } catch {
//                     loggedInUser = storedUser;
//                 }
//             }

//             await fetch('/api/logs', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     action,
//                     clientId,
//                     clientName,
//                     details,
//                     performedBy: loggedInUser,
//                 }),
//             });
//         } catch (err) {
//             console.error('Failed to record activity log:', err);
//         }
//     };

//     // ==================================================
//     // DEBOUNCE SEARCH
//     // ==================================================
//     useEffect(() => {
//         setIsSearching(true);
//         const timer = setTimeout(() => {
//             setDebouncedSearchQuery(searchQuery);
//             setIsSearching(false);
//         }, 200);

//         return () => clearTimeout(timer);
//     }, [searchQuery]);

//     // ==================================================
//     // FILTER & SORT
//     // ==================================================
//     const filteredClients = useMemo(() => {
//         return clients
//             .filter((client) => {
//                 const q = debouncedSearchQuery.toLowerCase().trim();
//                 const searchableText = [
//                     client.clientId,
//                     client.clientName,
//                     client.clientPhone,
//                     client.pocName,
//                     client.primaryOnu,
//                     client.primaryIp,
//                     client.secondaryOnu,
//                     client.secondaryIp,
//                     client.location,
//                     client.description,
//                 ]
//                     .filter(Boolean)
//                     .join(' ')
//                     .toLowerCase();

//                 const matchesSearch = !q || searchableText.includes(q);
//                 const matchesStatus = statusFilter === 'All' || client.status === statusFilter;
//                 const matchesPoc = pocFilter === 'All' || client.pocId?.toString() === pocFilter;

//                 return matchesSearch && matchesStatus && matchesPoc;
//             })
//             .sort((a, b) => {
//                 if (sortBy === 'newest') return Number(b.id) - Number(a.id);
//                 if (sortBy === 'oldest') return Number(a.id) - Number(b.id);
//                 if (sortBy === 'name') return (a.clientName || '').localeCompare(b.clientName || '');
//                 if (sortBy === 'clientId') return (a.clientId || '').localeCompare(b.clientId || '');
//                 return 0;
//             });
//     }, [clients, debouncedSearchQuery, statusFilter, pocFilter, sortBy]);

//     useEffect(() => {
//         setCurrentPage(1);
//     }, [debouncedSearchQuery, statusFilter, pocFilter, sortBy]);

//     // ==================================================
//     // PAGINATION
//     // ==================================================
//     const totalPages = Math.ceil(filteredClients.length / itemsPerPage) || 1;

//     const paginatedClients = useMemo(() => {
//         const start = (currentPage - 1) * itemsPerPage;
//         return filteredClients.slice(start, start + itemsPerPage);
//     }, [filteredClients, currentPage, itemsPerPage]);

//     // ==================================================
//     // MODAL OPEN HANDLERS
//     // ==================================================
//     const handleOpenEditModal = (client: ClientInfo, e?: React.MouseEvent) => {
//         if (e) e.stopPropagation();
//         setSelectedClientForView(null);
//         setEditingClient(client);

//         setClientForm({
//             clientId: client.clientId || '',
//             clientName: client.clientName || '',
//             clientPhone: client.clientPhone || '',
//             primaryIp: client.primaryIp || '',
//             primaryOnu: client.primaryOnu || '',
//             secondaryIp: client.secondaryIp || '',
//             secondaryOnu: client.secondaryOnu || '',
//             location: client.location || '',
//             pocId: client.pocId?.toString() || '',
//             status: client.status || 'Connected',
//             description: client.description || '',
//         });

//         setIsClientModalOpen(true);
//     };

//     const handleOpenAddModal = () => {
//         setSelectedClientForView(null);
//         setEditingClient(null);

//         setClientForm({
//             clientId: '',
//             clientName: '',
//             clientPhone: '',
//             primaryIp: '',
//             primaryOnu: '',
//             secondaryIp: '',
//             secondaryOnu: '',
//             location: '',
//             pocId: '',
//             status: 'Connected',
//             description: '',
//         });

//         setIsClientModalOpen(true);
//     };

//     // ==================================================
//     // DELETE CLIENT
//     // ==================================================
//     const triggerDelete = (id: string, e?: React.MouseEvent) => {
//         if (e) e.stopPropagation();
        
//         if (!canDeleteClient()) {
//             showToast('Access Denied: Only Admin and Manager can delete client records.', 'error');
//             return;
//         }

//         setDeleteTargetId(id);
//     };

//     const confirmDelete = async () => {
//         if (!deleteTargetId) return;

//         const targetClient = clients.find((c) => c.id.toString() === deleteTargetId.toString());

//         try {
//             const res = await fetch(`/api/clients/${deleteTargetId}`, { method: 'DELETE' });
//             const data = await res.json().catch(() => null);

//             if (!res.ok) {
//                 showToast(data?.error || 'Failed to delete client.', 'error');
//                 return;
//             }

//             setClients((prev) => prev.filter((client) => client.id.toString() !== deleteTargetId.toString()));
//             if (selectedClientForView?.id.toString() === deleteTargetId.toString()) {
//                 setSelectedClientForView(null);
//             }

//             if (targetClient) {
//                 await recordLog(
//                     'DELETE_CLIENT',
//                     targetClient.clientId,
//                     targetClient.clientName,
//                     `Deleted client profile: ${targetClient.clientName} (${targetClient.clientId})`
//                 );
//             }

//             showToast('Client deleted successfully!', 'error');
//         } catch (error) {
//             console.error('Error deleting client:', error);
//             showToast('Failed to delete client.', 'error');
//         } finally {
//             setDeleteTargetId(null);
//         }
//     };

//     // ==================================================
//     // POC HANDLERS
//     // ==================================================
//     const handleOpenAddPoc = () => {
//         setIsPocManagementOpen(false);
//         setEditingPoc(null);
//         setPocForm({ name: '', phone: '', designation: '' });
//         setIsPocModalOpen(true);
//     };

//     const handleEditPoc = (poc: POC) => {
//         setIsPocManagementOpen(false);
//         setEditingPoc(poc);
//         setPocForm({ name: poc.name || '', phone: '', designation: '' });
//         setIsPocModalOpen(true);
//     };

//     const handleSavePoc = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!pocForm.name.trim()) {
//             showToast('POC name is required!', 'error');
//             return;
//         }

//         try {
//             const url = editingPoc ? `/api/pocs/${editingPoc.id}` : '/api/pocs';
//             const method = editingPoc ? 'PUT' : 'POST';

//             const res = await fetch(url, {
//                 method,
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ name: pocForm.name.trim() }),
//             });

//             const data = await res.json().catch(() => null);

//             if (!res.ok) {
//                 showToast(data?.error || `Failed to ${editingPoc ? 'update' : 'add'} POC.`, 'error');
//                 return;
//             }

//             const savedPoc = data?.poc || data?.data || data;

//             if (editingPoc) {
//                 setPocs((prev) => prev.map((p) => (p.id.toString() === editingPoc.id.toString() ? savedPoc : p)));
//                 setClients((prev) =>
//                     prev.map((client) =>
//                         client.pocId?.toString() === editingPoc.id.toString()
//                             ? { ...client, pocName: savedPoc.name }
//                             : client
//                     )
//                 );
//                 showToast('POC updated successfully!', 'warning');
//             } else {
//                 setPocs((prev) => [savedPoc, ...prev]);
//                 showToast('POC added successfully!', 'success');
//             }

//             setPocForm({ name: '', phone: '', designation: '' });
//             setEditingPoc(null);
//             setIsPocModalOpen(false);
//         } catch (error) {
//             console.error('Error saving POC:', error);
//             showToast('Database request failed.', 'error');
//         }
//     };

//     const confirmDeletePoc = async () => {
//         if (!deletePocTargetId) return;

//         try {
//             const res = await fetch(`/api/pocs/${deletePocTargetId}`, { method: 'DELETE' });
//             const data = await res.json().catch(() => null);

//             if (!res.ok) {
//                 showToast(data?.error || 'Failed to delete POC.', 'error');
//                 return;
//             }

//             setPocs((prev) => prev.filter((poc) => poc.id.toString() !== deletePocTargetId.toString()));
//             setClients((prev) =>
//                 prev.map((client) =>
//                     client.pocId?.toString() === deletePocTargetId.toString()
//                         ? { ...client, pocId: null, pocName: '' }
//                         : client
//                 )
//             );

//             if (pocFilter === deletePocTargetId.toString()) {
//                 setPocFilter('All');
//             }

//             showToast('POC deleted successfully!', 'error');
//         } catch (error) {
//             console.error('Error deleting POC:', error);
//             showToast('Failed to delete POC.', 'error');
//         } finally {
//             setDeletePocTargetId(null);
//         }
//     };

//     // ==================================================
//     // SAVE / UPDATE CLIENT
//     // ==================================================
//     const handleSaveClient = async (e: React.FormEvent) => {
//         e.preventDefault();

//         if (!clientForm.clientId.trim() || !clientForm.clientName.trim()) {
//             showToast('Client ID and Name are required!', 'error');
//             return;
//         }

//         setIsClientSaving(true);

//         const selectedPoc = pocs.find((p) => p.id.toString() === clientForm.pocId.toString());

//         try {
//             const url = editingClient ? `/api/clients/${editingClient.id}` : '/api/clients';
//             const method = editingClient ? 'PUT' : 'POST';

//             const res = await fetch(url, {
//                 method,
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({
//                     ...clientForm,
//                     pocName: selectedPoc?.name || '',
//                 }),
//             });

//             const data = await res.json().catch(() => null);

//             if (!res.ok) {
//                 showToast(data?.error || 'Failed to save client.', 'error');
//                 return;
//             }

//             const apiClient = data?.client || data?.data || data;
//             const savedClient = {
//                 ...apiClient,
//                 pocName: selectedPoc?.name || apiClient?.pocName || '',
//             };

//             if (editingClient) {
//                 setClients((prev) =>
//                     prev.map((client) => (client.id.toString() === editingClient.id.toString() ? savedClient : client))
//                 );

//                 await recordLog(
//                     'UPDATE_CLIENT',
//                     savedClient.clientId,
//                     savedClient.clientName,
//                     `Updated client profile details for ${savedClient.clientName}`
//                 );

//                 showToast('Client updated successfully!', 'warning');
//             } else {
//                 setClients((prev) => [savedClient, ...prev]);
//                 setCurrentPage(1);

//                 await recordLog(
//                     'CREATE_CLIENT',
//                     savedClient.clientId,
//                     savedClient.clientName,
//                     `Created new client entry: ${savedClient.clientName} (${savedClient.clientId})`
//                 );

//                 showToast('Client added successfully!', 'success');
//             }

//             setIsClientModalOpen(false);
//             setEditingClient(null);
//         } catch (error) {
//             console.error('Error saving client:', error);
//             showToast('Database request failed.', 'error');
//         } finally {
//             setIsClientSaving(false);
//         }
//     };

//     return (
//         <ProtectedRoute>
//             <div className="min-h-screen bg-surface dark:bg-[#0b0f19] text-on-surface dark:text-slate-100 p-3 sm:p-6 lg:p-8 transition-colors duration-200">
//                 {/* TOAST NOTIFICATION */}
//                 <AnimatePresence mode="wait">
//                     {toast.show && (
//                         <motion.div
//                             key={toast.message}
//                             initial={{ opacity: 0, y: 20 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             exit={{ opacity: 0, y: 10 }}
//                             transition={{ duration: 0.15 }}
//                             className={`fixed bottom-6 right-6 z-[9999] max-w-sm w-full flex items-center gap-3.5 p-4 rounded-2xl border shadow-lg backdrop-blur-xl ${
//                                 toast.type === 'success'
//                                     ? 'bg-surface-bright/95 dark:bg-slate-900/95 border-primary/30 text-on-surface dark:text-slate-100'
//                                     : toast.type === 'warning'
//                                     ? 'bg-surface-bright/95 dark:bg-slate-900/95 border-amber-500/30 text-on-surface dark:text-slate-100'
//                                     : 'bg-surface-bright/95 dark:bg-slate-900/95 border-error/30 text-on-surface dark:text-slate-100'
//                             }`}
//                         >
//                             <div className="flex-1 min-w-0">
//                                 <p className="font-body-sm font-semibold text-on-surface dark:text-slate-200 leading-tight truncate">
//                                     {toast.message}
//                                 </p>
//                             </div>
//                         </motion.div>
//                     )}
//                 </AnimatePresence>

//                 <div className="max-w-7xl mx-auto space-y-6">
//                     {/* HEADER SECTION */}
//                    <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 dark:border-slate-800/80 dark:bg-slate-900/90 p-5 sm:p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-md">
//     {/* Decorative background ambient glows */}
//     <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
//     <div className="absolute -left-12 -bottom-12 h-36 w-36 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

//     <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        
//         {/* Left: Page Heading with Reload on Click */}
//         <div className="flex min-w-0 items-center gap-4">
//             <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-teal-200/60 bg-gradient-to-br from-teal-50 to-teal-100/60 text-teal-700 shadow-inner dark:border-teal-900/60 dark:from-teal-950 dark:to-teal-900/40 dark:text-teal-400">
//                 <span className="material-symbols-outlined text-[26px]">
//                     hub
//                 </span>
//             </div>

//             <div className="min-w-0">
//                 <div className="flex flex-wrap items-center gap-2.5">
//                     <button
//                         type="button"
//                         onClick={() => window.location.reload()}
//                         className="group text-left text-xl font-black tracking-tight text-slate-800 transition-colors hover:text-teal-700 dark:text-white dark:hover:text-teal-400 sm:text-2xl cursor-pointer flex items-center gap-1.5"
//                         title="Click to reload page"
//                     >
//                         <span>Clients Information</span>
//                         <span className="material-symbols-outlined text-base opacity-0 group-hover:opacity-100 transition-opacity text-teal-600 dark:text-teal-400">
//                             refresh
//                         </span>
//                     </button>

//                     <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 shadow-2xs dark:border-emerald-900/60 dark:bg-emerald-950/80 dark:text-emerald-400">
//                         <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
//                         Live
//                     </span>
//                 </div>

//                 <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400 font-medium">
//                     Manage network connections, client profiles, and active configurations.
//                 </p>
//             </div>
//         </div>

//         {/* Right: Action Buttons with Smooth Hover & Pointer Cursors */}
//         <div className="flex flex-wrap items-center gap-2.5">
            
//             {/* Back Button */}
//             <Link
//                 href="/"
//                 className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3.5 text-sm font-semibold text-slate-600 shadow-2xs transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:scale-[1.02] active:scale-[0.98] cursor-pointer dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
//             >
//                 <span className="material-symbols-outlined text-[19px]">
//                     arrow_back
//                 </span>
//                 Back
//             </Link>

//             {/* System Logs Button */}
//             <Link
//                 href="/client-info/system-log"
//                 className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3.5 text-sm font-semibold text-slate-600 shadow-2xs transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 hover:scale-[1.02] active:scale-[0.98] cursor-pointer dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
//             >
//                 <span className="material-symbols-outlined text-[19px]">
//                     history
//                 </span>
//                 System Logs
//             </Link>

//             {/* Manage POC Button */}
//             <button
//                 type="button"
//                 onClick={() => setIsPocManagementOpen(true)}
//                 className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3.5 text-sm font-semibold text-slate-600 shadow-2xs transition-all duration-200 hover:border-teal-200 hover:bg-teal-50/60 hover:text-teal-800 hover:scale-[1.02] active:scale-[0.98] cursor-pointer dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-teal-950/40 dark:hover:text-teal-300"
//             >
//                 <span className="material-symbols-outlined text-[19px]">
//                     manage_accounts
//                 </span>
//                 Manage POC
//             </button>

//             {/* New Client Button */}
//             <button
//                 type="button"
//                 onClick={handleOpenAddModal}
//                 className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 px-4 text-sm font-semibold text-white shadow-md shadow-teal-600/20 transition-all duration-200 hover:from-teal-700 hover:to-teal-800 hover:shadow-lg hover:shadow-teal-600/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:from-teal-600 dark:to-teal-500 dark:hover:from-teal-500 dark:hover:to-teal-400"
//             >
//                 <span className="material-symbols-outlined text-[19px]">
//                     add
//                 </span>
//                 New Client
//             </button>
//         </div>
//     </div>
// </div>

//                     {/* STATS CARDS */}
//                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                         <div
//                             onClick={() => setStatusFilter('All')}
//                             className={`p-5 rounded-2xl cursor-pointer border transition-all duration-150 ${
//                                 statusFilter === 'All'
//                                     ? 'bg-teal-50/60 dark:bg-teal-950/40 border-teal-500 shadow-sm'
//                                     : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-300'
//                             }`}
//                         >
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Clients</p>
//                                     <h3 className="text-3xl font-black mt-1 text-slate-800 dark:text-white">{clients.length}</h3>
//                                 </div>
//                                 <div className="h-12 w-12 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 flex items-center justify-center">
//                                     <span className="material-symbols-outlined text-2xl">lan</span>
//                                 </div>
//                             </div>
//                         </div>

//                         <div
//                             onClick={() => setStatusFilter('Connected')}
//                             className={`p-5 rounded-2xl cursor-pointer border transition-all duration-150 ${
//                                 statusFilter === 'Connected'
//                                     ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-500 shadow-sm'
//                                     : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300'
//                             }`}
//                         >
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Connected</p>
//                                     <h3 className="text-3xl font-black mt-1 text-emerald-700 dark:text-emerald-300">
//                                         {clients.filter((c) => c.status === 'Connected').length}
//                                     </h3>
//                                 </div>
//                                 <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
//                                     <span className="material-symbols-outlined text-2xl">check_circle</span>
//                                 </div>
//                             </div>
//                         </div>

//                         <div
//                             onClick={() => setStatusFilter('Disconnected')}
//                             className={`p-5 rounded-2xl cursor-pointer border transition-all duration-150 ${
//                                 statusFilter === 'Disconnected'
//                                     ? 'bg-rose-50/60 dark:bg-rose-950/40 border-rose-500 shadow-sm'
//                                     : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-300'
//                             }`}
//                         >
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <p className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Disconnected</p>
//                                     <h3 className="text-3xl font-black mt-1 text-rose-700 dark:text-rose-300">
//                                         {clients.filter((c) => c.status === 'Disconnected').length}
//                                     </h3>
//                                 </div>
//                                 <div className="h-12 w-12 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
//                                     <span className="material-symbols-outlined text-2xl">power_off</span>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     {/* FILTER BAR */}
//                     <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
//                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
//                             <div className="lg:col-span-5 relative">
//                                 <span className={`material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-sm ${isSearching ? 'text-teal-600 animate-spin' : 'text-slate-400'}`}>
//                                     {isSearching ? 'progress_activity' : 'search'}
//                                 </span>
//                                 <input
//                                     type="text"
//                                     value={searchQuery}
//                                     onChange={(e) => setSearchQuery(e.target.value)}
//                                     placeholder="Search Client ID, Name, Phone, Location..."
//                                     className="w-full pl-10 pr-9 py-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-teal-500"
//                                 />
//                             </div>

//                             <div className="lg:col-span-2">
//                                 <select
//                                     value={statusFilter}
//                                     onChange={(e) => setStatusFilter(e.target.value as any)}
//                                     className="w-full px-3 py-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-teal-500 cursor-pointer"
//                                 >
//                                     <option value="All">All Statuses</option>
//                                     <option value="Connected">Connected Only</option>
//                                     <option value="Disconnected">Disconnected Only</option>
//                                 </select>
//                             </div>

//                             <div className="lg:col-span-2">
//                                 <select
//                                     value={pocFilter}
//                                     onChange={(e) => setPocFilter(e.target.value)}
//                                     className="w-full px-3 py-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-teal-500 cursor-pointer"
//                                 >
//                                     <option value="All">All POCs</option>
//                                     {pocs.map((poc) => (
//                                         <option key={poc.id} value={poc.id.toString()}>{poc.name}</option>
//                                     ))}
//                                 </select>
//                             </div>

//                             <div className="lg:col-span-2">
//                                 <select
//                                     value={sortBy}
//                                     onChange={(e) => setSortBy(e.target.value as any)}
//                                     className="w-full px-3 py-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-teal-500 cursor-pointer"
//                                 >
//                                     <option value="newest">Newest First</option>
//                                     <option value="oldest">Oldest First</option>
//                                     <option value="name">Client Name</option>
//                                     <option value="clientId">Client ID</option>
//                                 </select>
//                             </div>

//                             <div className="lg:col-span-1 flex items-center justify-end gap-1 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
//                                 <button
//                                     type="button"
//                                     onClick={() => setViewMode('table')}
//                                     className={`flex-1 py-1.5 rounded-lg text-xs flex items-center justify-center cursor-pointer ${viewMode === 'table' ? 'bg-white dark:bg-slate-800 text-teal-600 font-bold shadow-xs' : 'text-slate-400'}`}
//                                 >
//                                     <span className="material-symbols-outlined text-sm">table_rows</span>
//                                 </button>
//                                 <button
//                                     type="button"
//                                     onClick={() => setViewMode('grid')}
//                                     className={`flex-1 py-1.5 rounded-lg text-xs flex items-center justify-center cursor-pointer ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 text-teal-600 font-bold shadow-xs' : 'text-slate-400'}`}
//                                 >
//                                     <span className="material-symbols-outlined text-sm">grid_view</span>
//                                 </button>
//                             </div>
//                         </div>
//                     </div>

//                     {/* CONTENT AREA */}
//                     {isLoading ? (
//                         <div className="bg-white dark:bg-slate-900 rounded-2xl p-16 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
//                             <div className="h-8 w-8 mx-auto rounded-full border-2 border-teal-500 border-t-transparent animate-spin"></div>
//                             <p className="text-xs font-semibold text-teal-600 mt-4">Loading client directory...</p>
//                         </div>
//                     ) : paginatedClients.length === 0 ? (
//                         <div className="bg-white dark:bg-slate-900 rounded-2xl p-16 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
//                             <p className="text-sm font-bold text-slate-800 dark:text-white">No client records found.</p>
//                             <p className="text-xs text-slate-500 mt-1">Try changing your search or filters.</p>
//                         </div>
//                     ) : viewMode === 'table' ? (
//                         <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
//                             <div className="overflow-x-auto">
//                                 <table className="w-full text-left border-collapse">
//                                     <thead>
//                                         <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
//                                             <th className="py-3 px-4">Client Details</th>
//                                             <th className="py-3 px-4">Phone</th>
//                                             <th className="py-3 px-4">Primary Link</th>
//                                             <th className="py-3 px-4">Secondary Link</th>
//                                             <th className="py-3 px-4">Location</th>
//                                             <th className="py-3 px-4">POC Name</th>
//                                             <th className="py-3 px-4">Status</th>
//                                             <th className="py-3 px-4 text-right">Actions</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
//                                         {paginatedClients.map((client) => (
//                                             <tr
//                                                 key={client.id}
//                                                 onClick={() => setSelectedClientForView(client)}
//                                                 className="hover:bg-teal-50/30 dark:hover:bg-slate-800/50 cursor-pointer transition-colors duration-100"
//                                             >
//                                                 <td className="py-3 px-4">
//                                                     <div className="font-semibold text-slate-800 dark:text-white">{client.clientName}</div>
//                                                     <div className="text-[10px] text-slate-400 font-mono mt-0.5">{client.clientId}</div>
//                                                 </td>
//                                                 <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">{client.clientPhone || '-'}</td>
//                                                 <td className="py-3 px-4 font-mono">
//                                                     <div className="text-slate-800 dark:text-slate-200">IP: {client.primaryIp || '-'}</div>
//                                                     <div className="text-[10px] text-slate-400">ONU: {client.primaryOnu || '-'}</div>
//                                                 </td>
//                                                 <td className="py-3 px-4 font-mono">
//                                                     <div className="text-slate-800 dark:text-slate-200">IP: {client.secondaryIp || '-'}</div>
//                                                     <div className="text-[10px] text-slate-400">ONU: {client.secondaryOnu || '-'}</div>
//                                                 </td>
//                                                 <td className="py-3 px-4 text-slate-600 dark:text-slate-300 truncate max-w-[140px]">{client.location || '-'}</td>
//                                                 <td className="py-3 px-4 text-slate-600 dark:text-slate-300 truncate max-w-[120px]">{client.pocName || '-'}</td>
//                                                 <td className="py-3 px-4">
//                                                     <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
//                                                         client.status === 'Connected'
//                                                             ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
//                                                             : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
//                                                     }`}>
//                                                         <span className={`h-1.5 w-1.5 rounded-full ${client.status === 'Connected' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
//                                                         {client.status}
//                                                     </span>
//                                                 </td>
//                                                 <td className="py-3 px-4 text-right">
//                                                     <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
//                                                         <button
//                                                             type="button"
//                                                             onClick={(e) => handleOpenEditModal(client, e)}
//                                                             className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950 cursor-pointer"
//                                                             title="Edit"
//                                                         >
//                                                             <span className="material-symbols-outlined text-sm">edit</span>
//                                                         </button>
//                                                         {canDeleteClient() && (
//                                                             <button
//                                                                 type="button"
//                                                                 onClick={(e) => triggerDelete(client.id.toString(), e)}
//                                                                 className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 cursor-pointer"
//                                                                 title="Delete"
//                                                             >
//                                                                 <span className="material-symbols-outlined text-sm">delete</span>
//                                                             </button>
//                                                         )}
//                                                     </div>
//                                                 </td>
//                                             </tr>
//                                         ))}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </div>
//                     ) : (
//                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
//                             {paginatedClients.map((client) => (
//                                 <div
//                                     key={client.id}
//                                     onClick={() => setSelectedClientForView(client)}
//                                     className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-150 space-y-3 cursor-pointer"
//                                 >
//                                     <div className="flex items-start justify-between">
//                                         <div>
//                                             <h3 className="font-semibold text-slate-800 dark:text-white">{client.clientName}</h3>
//                                             <span className="text-[10px] text-slate-400 font-mono">{client.clientId}</span>
//                                         </div>
//                                         <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
//                                             client.status === 'Connected'
//                                                 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
//                                                 : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
//                                         }`}>
//                                             {client.status}
//                                         </span>
//                                     </div>
//                                     <div className="space-y-1 text-slate-500 dark:text-slate-400">
//                                         <div>Phone: <span className="font-mono text-slate-800 dark:text-slate-200">{client.clientPhone || 'N/A'}</span></div>
//                                         <div>Location: <span className="text-slate-800 dark:text-slate-200">{client.location || 'N/A'}</span></div>
//                                         <div>POC: <span className="text-slate-800 dark:text-slate-200">{client.pocName || 'N/A'}</span></div>
//                                     </div>
//                                     <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
//                                         <button
//                                             type="button"
//                                             onClick={(e) => handleOpenEditModal(client, e)}
//                                             className="px-3 py-1 text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 rounded-lg cursor-pointer"
//                                         >
//                                             Edit
//                                         </button>
//                                         {canDeleteClient() && (
//                                             <button
//                                                 type="button"
//                                                 onClick={(e) => triggerDelete(client.id.toString(), e)}
//                                                 className="px-3 py-1 text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 rounded-lg cursor-pointer"
//                                             >
//                                                 Delete
//                                             </button>
//                                         )}
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     )}

//                     {/* PAGINATION */}
//                     {totalPages > 1 && (
//                         <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
//                             <p className="text-xs text-slate-500">
//                                 Showing <span className="font-bold text-slate-800 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
//                                 <span className="font-bold text-slate-800 dark:text-white">{Math.min(currentPage * itemsPerPage, filteredClients.length)}</span> of{' '}
//                                 <span className="font-bold text-teal-600">{filteredClients.length}</span> clients
//                             </p>
//                             <div className="flex items-center gap-1">
//                                 <button
//                                     type="button"
//                                     disabled={currentPage === 1}
//                                     onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//                                     className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 cursor-pointer"
//                                 >
//                                     Prev
//                                 </button>
//                                 <span className="px-3 text-xs font-bold text-slate-600 dark:text-slate-300">
//                                     {currentPage} / {totalPages}
//                                 </span>
//                                 <button
//                                     type="button"
//                                     disabled={currentPage === totalPages}
//                                     onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
//                                     className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 cursor-pointer"
//                                 >
//                                     Next
//                                 </button>
//                             </div>
//                         </div>
//                     )}
//                 </div>

//                 {/* MODALS */}
//                 <ClientDetailsModal
//                     client={selectedClientForView}
//                     onClose={() => setSelectedClientForView(null)}
//                     onEdit={(client) => handleOpenEditModal(client)}
//                 />

//                 <ConfirmDialog
//                     isOpen={!!deleteTargetId}
//                     title="Delete Client Record?"
//                     message="Are you sure you want to remove this client? This action cannot be undone."
//                     onConfirm={confirmDelete}
//                     onCancel={() => setDeleteTargetId(null)}
//                 />

//                 <ConfirmDialog
//                     isOpen={!!deletePocTargetId}
//                     title="Delete POC?"
//                     message="Are you sure you want to delete this POC?"
//                     onConfirm={confirmDeletePoc}
//                     onCancel={() => setDeletePocTargetId(null)}
//                 />

//                 {/* ADD/EDIT CLIENT MODAL */}
//                 <AnimatePresence>
//                     {isClientModalOpen && (
//                         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//                             <div
//                                 onClick={() => !isClientSaving && setIsClientModalOpen(false)}
//                                 className="absolute inset-0 bg-black/50 backdrop-blur-xs"
//                             />
//                             <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
//                                 <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800">
//                                     <h2 className="text-base font-bold text-slate-800 dark:text-white">
//                                         {editingClient ? 'Edit Client Record' : 'New Client Registration'}
//                                     </h2>
//                                     <button
//                                         type="button"
//                                         disabled={isClientSaving}
//                                         onClick={() => setIsClientModalOpen(false)}
//                                         className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center cursor-pointer"
//                                     >
//                                         <span className="material-symbols-outlined text-sm">close</span>
//                                     </button>
//                                 </div>

//                                 <form onSubmit={handleSaveClient} className="overflow-y-auto p-6 space-y-4">
//                                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                         <div>
//                                             <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Client ID *</label>
//                                             <input
//                                                 type="text"
//                                                 required
//                                                 value={clientForm.clientId}
//                                                 onChange={(e) => setClientForm({ ...clientForm, clientId: e.target.value })}
//                                                 className="w-full p-2.5 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-teal-500"
//                                                 placeholder="CLI-2001"
//                                             />
//                                         </div>
//                                         <div className="md:col-span-2">
//                                             <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Client Name *</label>
//                                             <input
//                                                 type="text"
//                                                 required
//                                                 value={clientForm.clientName}
//                                                 onChange={(e) => setClientForm({ ...clientForm, clientName: e.target.value })}
//                                                 className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-teal-500"
//                                                 placeholder="Apex Software Ltd."
//                                             />
//                                         </div>
//                                         <div>
//                                             <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Phone</label>
//                                             <input
//                                                 type="text"
//                                                 value={clientForm.clientPhone}
//                                                 onChange={(e) => setClientForm({ ...clientForm, clientPhone: e.target.value })}
//                                                 className="w-full p-2.5 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-teal-500"
//                                                 placeholder="+88017xxxxxxxx"
//                                             />
//                                         </div>
//                                         <div className="md:col-span-2">
//                                             <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Status</label>
//                                             <select
//                                                 value={clientForm.status}
//                                                 onChange={(e) => setClientForm({ ...clientForm, status: e.target.value as any })}
//                                                 className="w-full p-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-teal-500"
//                                             >
//                                                 <option value="Connected">Connected</option>
//                                                 <option value="Disconnected">Disconnected</option>
//                                             </select>
//                                         </div>

//                                         <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
//                                             <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
//                                                 <span className="text-xs font-bold text-teal-600 uppercase">Primary Link</span>
//                                                 <input
//                                                     type="text"
//                                                     placeholder="Primary IP"
//                                                     value={clientForm.primaryIp}
//                                                     onChange={(e) => setClientForm({ ...clientForm, primaryIp: e.target.value })}
//                                                     className="w-full p-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
//                                                 />
//                                                 <input
//                                                     type="text"
//                                                     placeholder="Primary ONU MAC/SN"
//                                                     value={clientForm.primaryOnu}
//                                                     onChange={(e) => setClientForm({ ...clientForm, primaryOnu: e.target.value })}
//                                                     className="w-full p-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
//                                                 />
//                                             </div>
//                                             <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
//                                                 <span className="text-xs font-bold text-slate-500 uppercase">Backup Link</span>
//                                                 <input
//                                                     type="text"
//                                                     placeholder="Secondary IP"
//                                                     value={clientForm.secondaryIp}
//                                                     onChange={(e) => setClientForm({ ...clientForm, secondaryIp: e.target.value })}
//                                                     className="w-full p-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
//                                                 />
//                                                 <input
//                                                     type="text"
//                                                     placeholder="Secondary ONU MAC/SN"
//                                                     value={clientForm.secondaryOnu}
//                                                     onChange={(e) => setClientForm({ ...clientForm, secondaryOnu: e.target.value })}
//                                                     className="w-full p-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
//                                                 />
//                                             </div>
//                                         </div>

//                                         <div>
//                                             <label className="block text-xs font-bold uppercase text-slate-500 mb-1">POC</label>
//                                             <select
//                                                 value={clientForm.pocId}
//                                                 onChange={(e) => setClientForm({ ...clientForm, pocId: e.target.value })}
//                                                 className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
//                                             >
//                                                 <option value="">Select POC...</option>
//                                                 {pocs.map((poc) => (
//                                                     <option key={poc.id} value={poc.id.toString()}>{poc.name}</option>
//                                                 ))}
//                                             </select>
//                                         </div>

//                                         <div>
//                                             <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Location</label>
//                                             <input
//                                                 type="text"
//                                                 value={clientForm.location}
//                                                 onChange={(e) => setClientForm({ ...clientForm, location: e.target.value })}
//                                                 className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
//                                                 placeholder="Floor 4, Building B"
//                                             />
//                                         </div>

//                                         <div className="md:col-span-3">
//                                             <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Description</label>
//                                             <textarea
//                                                 rows={2}
//                                                 value={clientForm.description}
//                                                 onChange={(e) => setClientForm({ ...clientForm, description: e.target.value })}
//                                                 className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl resize-none"
//                                                 placeholder="Additional remarks..."
//                                             />
//                                         </div>
//                                     </div>

//                                     <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
//                                         <button
//                                             type="button"
//                                             onClick={() => setIsClientModalOpen(false)}
//                                             className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer"
//                                         >
//                                             Cancel
//                                         </button>
//                                         <button
//                                             type="submit"
//                                             disabled={isClientSaving}
//                                             className="px-5 py-2 text-xs font-semibold bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-50 cursor-pointer"
//                                         >
//                                             {isClientSaving ? 'Saving...' : editingClient ? 'Update Client' : 'Save Client'}
//                                         </button>
//                                     </div>
//                                 </form>
//                             </div>
//                         </div>
//                     )}
//                 </AnimatePresence>

//                 {/* POC MANAGEMENT MODAL */}
//                 {isPocManagementOpen && (
//                     <div onClick={() => setIsPocManagementOpen(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//                         <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
//                             <div className="flex justify-between items-center border-b pb-3 dark:border-slate-800">
//                                 <h3 className="font-bold text-slate-800 dark:text-white">POC Management</h3>
//                                 <button type="button" onClick={() => setIsPocManagementOpen(false)} className="text-slate-400">
//                                     <span className="material-symbols-outlined text-sm">close</span>
//                                 </button>
//                             </div>
//                             <div className="space-y-2 max-h-[350px] overflow-y-auto">
//                                 {pocs.map((poc) => (
//                                     <div key={poc.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
//                                         <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{poc.name}</span>
//                                         <div className="flex items-center gap-1">
//                                             <button type="button" onClick={() => handleEditPoc(poc)} className="p-1 text-amber-600 cursor-pointer">
//                                                 <span className="material-symbols-outlined text-sm">edit</span>
//                                             </button>
//                                             <button type="button" onClick={() => setDeletePocTargetId(poc.id.toString())} className="p-1 text-rose-600 cursor-pointer">
//                                                 <span className="material-symbols-outlined text-sm">delete</span>
//                                             </button>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                             <div className="flex justify-end pt-2">
//                                 <button type="button" onClick={handleOpenAddPoc} className="px-4 py-2 text-xs font-semibold bg-teal-600 text-white rounded-xl cursor-pointer">
//                                     Add POC
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {/* ADD / EDIT POC MODAL */}
//                 {isPocModalOpen && (
//                     <div onClick={() => setIsPocModalOpen(false)} className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
//                         <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
//                             <h3 className="font-bold text-slate-800 dark:text-white">{editingPoc ? 'Edit POC' : 'Add POC'}</h3>
//                             <form onSubmit={handleSavePoc} className="space-y-3">
//                                 <input
//                                     type="text"
//                                     required
//                                     autoFocus
//                                     value={pocForm.name}
//                                     onChange={(e) => setPocForm({ ...pocForm, name: e.target.value })}
//                                     className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl"
//                                     placeholder="POC Name"
//                                 />
//                                 <div className="flex justify-end gap-2">
//                                     <button type="button" onClick={() => setIsPocModalOpen(false)} className="px-3 py-1.5 text-xs rounded-xl border">Cancel</button>
//                                     <button type="submit" className="px-4 py-1.5 text-xs bg-teal-600 text-white rounded-xl">Save</button>
//                                 </div>
//                             </form>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </ProtectedRoute>
//     );
// }














// ======================3rd=========================















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
    // RECORD ACTIVITY LOG HELPER
    // ==================================================
    const recordLog = async (
        action: 'CREATE_CLIENT' | 'UPDATE_CLIENT' | 'DELETE_CLIENT',
        clientId: string,
        clientName: string,
        details: string
    ) => {
        try {
            let loggedInUser = 'Admin';
            const storedUser = sessionStorage.getItem('netbill_session_user');
            if (storedUser) {
                try {
                    const userData = JSON.parse(storedUser);
                    loggedInUser = userData.name || userData.email || userData.username || storedUser;
                } catch {
                    loggedInUser = storedUser;
                }
            }

            await fetch('/api/logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, clientId, clientName, details, performedBy: loggedInUser }),
            });
        } catch (err) {
            console.error('Failed to record activity log:', err);
        }
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
        const targetClient = clients.find((c) => c.id.toString() === deleteTargetId.toString());

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

            if (targetClient) {
                await recordLog(
                    'DELETE_CLIENT',
                    targetClient.clientId,
                    targetClient.clientName,
                    `Deleted client profile: ${targetClient.clientName} (${targetClient.clientId})`
                );
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
                await recordLog(
                    'UPDATE_CLIENT',
                    savedClient.clientId,
                    savedClient.clientName,
                    `Updated client profile details for ${savedClient.clientName}`
                );
                showToast('Client updated successfully!', 'warning');
            } else {
                setClients((prev) => [savedClient, ...prev]);
                setCurrentPage(1);
                await recordLog(
                    'CREATE_CLIENT',
                    savedClient.clientId,
                    savedClient.clientName,
                    `Created new client entry: ${savedClient.clientName} (${savedClient.clientId})`
                );
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