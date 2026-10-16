
// 'use client';
// import React, {
//     useState,
//     useEffect,
//     useMemo,
//     useRef,
// } from 'react';
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
//     const [isClientSaving, setIsClientSaving] = useState(false);

//     // --------------------------------------------------
//     // Controls & Filters
//     // --------------------------------------------------
//     const [searchQuery, setSearchQuery] = useState('');
//     const [statusFilter, setStatusFilter] = useState<'All' | 'Connected' | 'Disconnected'>('All');
//     const [pocFilter, setPocFilter] = useState<string>('All');
//     const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'clientId'>('newest');
//     const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

//     // --------------------------------------------------
//     // Pagination
//     // --------------------------------------------------
//     const [currentPage, setCurrentPage] = useState(1);
//     const itemsPerPage = 20;

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
//     // Delete
//     // --------------------------------------------------
//     const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
//     const [deletePocTargetId, setDeletePocTargetId] = useState<string | null>(null);

//     // --------------------------------------------------
//     // Copy
//     // --------------------------------------------------
//     const [copied, setCopied] = useState(false);

//     // --------------------------------------------------
//     // Toast Handling (Fixed Double Toast Trigger)
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
//     // LOAD DATA
//     // ==================================================
//     useEffect(() => {
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
//                 console.error('Error fetching data from database:', error);
//                 showToast('Failed to load client information.', 'error');
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchInitialData();
//     }, []);

//     // ==================================================
//     // COPY CLIENT INFORMATION
//     // ==================================================
//     const handleCopyClientInfo = async (client: ClientInfo) => {
//         const pocInfo = pocs.find((p) => p.id.toString() === client.pocId?.toString());
//         const pocText = pocInfo ? pocInfo.name : client.pocName || 'N/A';

//         const textToCopy = `Client ID : ${client.clientId || 'N/A'}
// Client Name : ${client.clientName || 'N/A'}
// Phone : ${client.clientPhone || 'N/A'}
// Primary IP & ONU : ${client.primaryIp || 'N/A'} (ONU: ${client.primaryOnu || 'N/A'})
// Secondary IP & ONU : ${client.secondaryIp || 'N/A'} (ONU: ${client.secondaryOnu || 'N/A'})
// Location : ${client.location || 'N/A'}
// POC : ${pocText}`;

//         try {
//             await navigator.clipboard.writeText(textToCopy);
//             setCopied(true);
//             showToast('Client information copied!', 'success');
//             setTimeout(() => setCopied(false), 2000);
//         } catch (error) {
//             console.error('Failed to copy client information:', error);
//             showToast('Failed to copy client information.', 'error');
//         }
//     };

//     // ==================================================
//     // FILTER & SORT
//     // ==================================================
//     const filteredClients = useMemo(() => {
//         return clients
//             .filter((client) => {
//                 const q = searchQuery.toLowerCase().trim();
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
//     }, [clients, searchQuery, statusFilter, pocFilter, sortBy]);

//     useEffect(() => {
//         setCurrentPage(1);
//     }, [searchQuery, statusFilter, pocFilter, sortBy]);

//     // ==================================================
//     // PAGINATION
//     // ==================================================
//     const totalPages = Math.ceil(filteredClients.length / itemsPerPage) || 1;

//     const paginatedClients = useMemo(() => {
//         const start = (currentPage - 1) * itemsPerPage;
//         return filteredClients.slice(start, start + itemsPerPage);
//     }, [filteredClients, currentPage]);

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
//         setDeleteTargetId(id);
//     };

//     const confirmDelete = async () => {
//         if (!deleteTargetId) return;

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
//                 showToast('Client updated successfully!', 'warning');
//             } else {
//                 setClients((prev) => [savedClient, ...prev]);
//                 setCurrentPage(1);
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
//             <div className="min-h-screen bg-slate-900/5 text-slate-800 p-3 sm:p-6 lg:p-8">
//                 {/* ==================================================
//                     PREMIUM SINGLE TOAST NOTIFICATION
//                 ================================================== */}
//                 <AnimatePresence mode="wait">
//                     {toast.show && (
//                         <motion.div
//                             key={toast.message}
//                             initial={{ opacity: 0, y: 30, scale: 0.95 }}
//                             animate={{ opacity: 1, y: 0, scale: 1 }}
//                             exit={{ opacity: 0, y: 20, scale: 0.95 }}
//                             transition={{ duration: 0.2, ease: "easeOut" }}
//                             className={`fixed bottom-6 right-6 z-[9999] max-w-sm w-full flex items-center gap-3.5 p-4 rounded-2xl border shadow-xl backdrop-blur-2xl ${toast.type === 'success'
//                                 ? 'bg-white/95 border-emerald-500/30 text-emerald-950 shadow-emerald-500/10'
//                                 : toast.type === 'warning'
//                                     ? 'bg-white/95 border-amber-500/30 text-amber-950 shadow-amber-500/10'
//                                     : 'bg-white/95 border-rose-500/30 text-rose-950 shadow-rose-500/10'
//                                 }`}
//                         >
//                             <div
//                                 className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 shadow-sm ${toast.type === 'success'
//                                     ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/20'
//                                     : toast.type === 'warning'
//                                         ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/20'
//                                         : 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-rose-500/20'
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
//                                 <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
//                                     {toast.type === 'success'
//                                         ? 'Success'
//                                         : toast.type === 'warning'
//                                             ? 'Updated'
//                                             : 'Error'}
//                                 </p>
//                                 <p className="text-xs font-semibold text-slate-800 leading-tight mt-0.5 truncate">
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
//                                 className="flex items-center justify-center w-7 h-7 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-all shrink-0"
//                                 aria-label="Close notification"
//                             >
//                                 <span className="material-symbols-outlined text-[16px]">
//                                     close
//                                 </span>
//                             </button>
//                         </motion.div>
//                     )}
//                 </AnimatePresence>

//                 <div className="max-w-7xl mx-auto space-y-6">
//                     {/* ==================================================
//                         MODERN HEADER SECTION
//                     ================================================== */}
//                     <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl p-6 sm:p-7 rounded-3xl shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-md">
//                         <div className="absolute -right-10 -top-10 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
//                         <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

//                         <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
//                             <div className="flex items-center gap-4">
//                                 <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/20 shrink-0">
//                                     <span className="material-symbols-outlined text-2xl">
//                                         hub
//                                     </span>
//                                 </div>

//                                 <div>
//                                     <div className="flex items-center gap-2.5">
//                                         <button
//                                             type="button"
//                                             onClick={() => window.location.reload()}
//                                             className="text-2xl font-black text-slate-900 tracking-tight cursor-pointer hover:text-teal-600 transition-colors duration-200 text-left"
//                                             title="Reload Client Directory"
//                                         >
//                                             Client Directory
//                                         </button>
//                                         <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-teal-700 bg-teal-50 border border-teal-200/60 rounded-full">
//                                             Live
//                                         </span>
//                                     </div>
//                                     <p className="text-xs font-medium text-slate-500 mt-0.5">
//                                         Manage network connections, client profiles, and active configurations
//                                     </p>
//                                 </div>
//                             </div>

//                             <div className="flex items-center gap-3">
//                                 <motion.button
//                                     type="button"
//                                     whileHover={{ scale: 1.02 }}
//                                     whileTap={{ scale: 0.98 }}
//                                     onClick={() => setIsPocManagementOpen(true)}
//                                     className="group px-4 py-2.5 bg-slate-50 hover:bg-teal-50/60 text-slate-700 hover:text-teal-700 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 border border-slate-200/80 hover:border-teal-200 shadow-2xs hover:shadow-xs"
//                                 >
//                                     <span className="material-symbols-outlined text-lg text-slate-500 group-hover:text-teal-600 transition-colors">
//                                         manage_accounts
//                                     </span>
//                                     Manage POC
//                                 </motion.button>

//                                 <motion.button
//                                     type="button"
//                                     whileHover={{ scale: 1.02 }}
//                                     whileTap={{ scale: 0.98 }}
//                                     onClick={handleOpenAddModal}
//                                     className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs font-semibold transition-all duration-300 shadow-md shadow-teal-600/20 hover:shadow-lg hover:shadow-teal-600/30 flex items-center gap-2 cursor-pointer"
//                                 >
//                                     <span className="material-symbols-outlined text-lg">
//                                         add_circle
//                                     </span>
//                                     New Client Entry
//                                 </motion.button>
//                             </div>
//                         </div>
//                     </div>

//                     {/* ==================================================
//                         MODERN & LIGHT INTERACTIVE STATS CARDS
//                     ================================================== */}
//                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                         {/* Total Clients Card */}
//                         <motion.div
//                             whileHover={{ y: -4, scale: 1.01 }}
//                             whileTap={{ scale: 0.98 }}
//                             onClick={() => setStatusFilter('All')}
//                             className={`relative overflow-hidden p-5 rounded-3xl cursor-pointer transition-all duration-300 group border ${statusFilter === 'All'
//                                 ? 'bg-gradient-to-br from-teal-500/10 via-white to-slate-50 border-teal-500/40 shadow-md shadow-teal-500/10 ring-2 ring-teal-500/30'
//                                 : 'bg-white/90 backdrop-blur-md text-slate-800 border-slate-200/70 hover:border-teal-200 shadow-xs hover:shadow-md'
//                                 }`}
//                         >
//                             {statusFilter === 'All' && (
//                                 <div className="absolute -right-8 -top-8 w-28 h-28 bg-teal-400/20 rounded-full blur-2xl pointer-events-none" />
//                             )}

//                             <div className="flex items-center justify-between relative z-10">
//                                 <div>
//                                     <div className="flex items-center gap-1.5">
//                                         <p className={`text-[11px] font-bold uppercase tracking-wider ${statusFilter === 'All' ? 'text-teal-700' : 'text-slate-400'
//                                             }`}>
//                                             Total Clients
//                                         </p>
//                                         {statusFilter === 'All' && (
//                                             <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
//                                         )}
//                                     </div>
//                                     <h3 className={`text-3xl font-black mt-1 ${statusFilter === 'All' ? 'text-teal-800' : 'text-slate-800'
//                                         }`}>
//                                         {clients.length}
//                                     </h3>
//                                 </div>

//                                 <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${statusFilter === 'All'
//                                     ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30'
//                                     : 'bg-slate-100 text-slate-600 group-hover:bg-teal-50 group-hover:text-teal-600'
//                                     }`}>
//                                     <span className="material-symbols-outlined text-2xl">
//                                         lan
//                                     </span>
//                                 </div>
//                             </div>

//                             <div className="mt-4 relative z-10">
//                                 <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-100">
//                                     <div className={`h-full rounded-full transition-all duration-500 ${statusFilter === 'All' ? 'bg-teal-500 w-full' : 'bg-slate-300 w-full'
//                                         }`} />
//                                 </div>
//                                 <p className={`text-[10px] font-medium mt-1.5 flex items-center justify-between ${statusFilter === 'All' ? 'text-teal-600 font-bold' : 'text-slate-400'
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
//                                 ? 'bg-gradient-to-br from-emerald-500/10 via-white to-slate-50 border-emerald-500/40 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-500/30'
//                                 : 'bg-white/90 backdrop-blur-md text-slate-800 border-slate-200/70 hover:border-emerald-200 shadow-xs hover:shadow-md'
//                                 }`}
//                         >
//                             {statusFilter === 'Connected' && (
//                                 <div className="absolute -right-8 -top-8 w-28 h-28 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
//                             )}

//                             <div className="flex items-center justify-between relative z-10">
//                                 <div>
//                                     <div className="flex items-center gap-1.5">
//                                         <p className={`text-[11px] font-bold uppercase tracking-wider ${statusFilter === 'Connected' ? 'text-emerald-700' : 'text-slate-400'
//                                             }`}>
//                                             Connected
//                                         </p>
//                                         <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
//                                     </div>
//                                     <h3 className={`text-3xl font-black mt-1 ${statusFilter === 'Connected' ? 'text-emerald-800' : 'text-emerald-600'
//                                         }`}>
//                                         {clients.filter((c) => c.status === 'Connected').length}
//                                     </h3>
//                                 </div>

//                                 <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${statusFilter === 'Connected'
//                                     ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
//                                     : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white'
//                                     }`}>
//                                     <span className="material-symbols-outlined text-2xl">
//                                         check_circle
//                                     </span>
//                                 </div>
//                             </div>

//                             <div className="mt-4 relative z-10">
//                                 <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-100">
//                                     <div
//                                         className="h-full rounded-full bg-emerald-500 transition-all duration-500"
//                                         style={{
//                                             width: clients.length
//                                                 ? `${(clients.filter((c) => c.status === 'Connected').length / clients.length) * 100}%`
//                                                 : '0%',
//                                         }}
//                                     />
//                                 </div>
//                                 <p className={`text-[10px] font-medium mt-1.5 flex items-center justify-between ${statusFilter === 'Connected' ? 'text-emerald-700 font-bold' : 'text-slate-400'
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
//                                 ? 'bg-gradient-to-br from-rose-500/10 via-white to-slate-50 border-rose-500/40 shadow-md shadow-rose-500/10 ring-2 ring-rose-500/30'
//                                 : 'bg-white/90 backdrop-blur-md text-slate-800 border-slate-200/70 hover:border-rose-200 shadow-xs hover:shadow-md'
//                                 }`}
//                         >
//                             {statusFilter === 'Disconnected' && (
//                                 <div className="absolute -right-8 -top-8 w-28 h-28 bg-rose-400/20 rounded-full blur-2xl pointer-events-none" />
//                             )}

//                             <div className="flex items-center justify-between relative z-10">
//                                 <div>
//                                     <div className="flex items-center gap-1.5">
//                                         <p className={`text-[11px] font-bold uppercase tracking-wider ${statusFilter === 'Disconnected' ? 'text-rose-700' : 'text-slate-400'
//                                             }`}>
//                                             Disconnected
//                                         </p>
//                                         {clients.filter((c) => c.status === 'Disconnected').length > 0 && (
//                                             <span className="h-2 w-2 rounded-full bg-rose-500 animate-bounce" />
//                                         )}
//                                     </div>
//                                     <h3 className={`text-3xl font-black mt-1 ${statusFilter === 'Disconnected' ? 'text-rose-800' : 'text-rose-600'
//                                         }`}>
//                                         {clients.filter((c) => c.status === 'Disconnected').length}
//                                     </h3>
//                                 </div>

//                                 <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${statusFilter === 'Disconnected'
//                                     ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
//                                     : 'bg-rose-50 text-rose-600 group-hover:bg-rose-500 group-hover:text-white'
//                                     }`}>
//                                     <span className="material-symbols-outlined text-2xl">
//                                         power_off
//                                     </span>
//                                 </div>
//                             </div>

//                             <div className="mt-4 relative z-10">
//                                 <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-100">
//                                     <div
//                                         className="h-full rounded-full bg-rose-500 transition-all duration-500"
//                                         style={{
//                                             width: clients.length
//                                                 ? `${(clients.filter((c) => c.status === 'Disconnected').length / clients.length) * 100}%`
//                                                 : '0%',
//                                         }}
//                                     />
//                                 </div>
//                                 <p className={`text-[10px] font-medium mt-1.5 flex items-center justify-between ${statusFilter === 'Disconnected' ? 'text-rose-700 font-bold' : 'text-slate-400'
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
//                         MODERN FILTER BAR SECTION
//                     ================================================== */}
//                     <div className="bg-white/80 backdrop-blur-xl p-3.5 rounded-3xl border border-slate-100 shadow-xs transition-all duration-300 hover:shadow-sm">
//                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
//                             <div className="lg:col-span-5 relative group">
//                                 <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg transition-colors duration-200 group-focus-within:text-teal-600">
//                                     search
//                                 </span>
//                                 <input
//                                     type="text"
//                                     value={searchQuery}
//                                     onChange={(e) => setSearchQuery(e.target.value)}
//                                     placeholder="Search Client ID, Name, Phone, Location..."
//                                     className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50/80 border border-slate-200/70 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
//                                 />
//                                 {searchQuery && (
//                                     <button
//                                         type="button"
//                                         onClick={() => setSearchQuery('')}
//                                         className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 cursor-pointer transition-colors"
//                                     >
//                                         <span className="material-symbols-outlined text-base">close</span>
//                                     </button>
//                                 )}
//                             </div>

//                             <div className="lg:col-span-2 relative">
//                                 <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-600 text-base pointer-events-none z-10">
//                                     tune
//                                 </span>
//                                 <select
//                                     value={statusFilter}
//                                     onChange={(e) => setStatusFilter(e.target.value as 'All' | 'Connected' | 'Disconnected')}
//                                     className="appearance-none w-full pl-10 pr-9 py-2.5 text-xs font-semibold bg-slate-50/80 border border-slate-200/70 rounded-2xl cursor-pointer hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
//                                 >
//                                     <option value="All">All Statuses</option>
//                                     <option value="Connected">Connected Only</option>
//                                     <option value="Disconnected">Disconnected Only</option>
//                                 </select>
//                                 <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">
//                                     unfold_more
//                                 </span>
//                             </div>

//                             <div className="lg:col-span-2 relative">
//                                 <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-600 text-base pointer-events-none z-10">
//                                     group
//                                 </span>
//                                 <select
//                                     value={pocFilter}
//                                     onChange={(e) => setPocFilter(e.target.value)}
//                                     className="appearance-none w-full pl-10 pr-9 py-2.5 text-xs font-semibold bg-slate-50/80 border border-slate-200/70 rounded-2xl cursor-pointer hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
//                                 >
//                                     <option value="All">All POCs</option>
//                                     {pocs.map((poc) => (
//                                         <option key={poc.id} value={poc.id.toString()}>
//                                             {poc.name}
//                                         </option>
//                                     ))}
//                                 </select>
//                                 <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">
//                                     unfold_more
//                                 </span>
//                             </div>

//                             <div className="lg:col-span-2 relative">
//                                 <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-600 text-base pointer-events-none z-10">
//                                     sort
//                                 </span>
//                                 <select
//                                     value={sortBy}
//                                     onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'name' | 'clientId')}
//                                     className="appearance-none w-full pl-10 pr-9 py-2.5 text-xs font-semibold bg-slate-50/80 border border-slate-200/70 rounded-2xl cursor-pointer hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
//                                 >
//                                     <option value="newest">Newest First</option>
//                                     <option value="oldest">Oldest First</option>
//                                     <option value="name">Client Name</option>
//                                     <option value="clientId">Client ID</option>
//                                 </select>
//                                 <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">
//                                     unfold_more
//                                 </span>
//                             </div>

//                             <div className="lg:col-span-1 flex items-center justify-end gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/50">
//                                 <button
//                                     type="button"
//                                     onClick={() => setViewMode('table')}
//                                     className={`flex-1 py-1.5 rounded-xl text-xs flex items-center justify-center transition-all duration-200 cursor-pointer ${viewMode === 'table'
//                                         ? 'bg-white shadow-xs text-teal-700 font-bold'
//                                         : 'text-slate-400 hover:text-slate-700'
//                                         }`}
//                                     title="Table View"
//                                 >
//                                     <span className="material-symbols-outlined text-base">table_rows</span>
//                                 </button>
//                                 <button
//                                     type="button"
//                                     onClick={() => setViewMode('grid')}
//                                     className={`flex-1 py-1.5 rounded-xl text-xs flex items-center justify-center transition-all duration-200 cursor-pointer ${viewMode === 'grid'
//                                         ? 'bg-white shadow-xs text-teal-700 font-bold'
//                                         : 'text-slate-400 hover:text-slate-700'
//                                         }`}
//                                     title="Grid View"
//                                 >
//                                     <span className="material-symbols-outlined text-base">grid_view</span>
//                                 </button>
//                             </div>
//                         </div>
//                     </div>

//                     {/* ==================================================
//                         CONTENT
//                     ================================================== */}
//                     {isLoading ? (
//                         <div className="bg-white rounded-2xl p-16 text-center border border-slate-200/80 animate-in fade-in duration-300">
//                             <div className="h-10 w-10 mx-auto rounded-full border-4 border-teal-100 border-t-teal-600 animate-spin"></div>
//                             <p className="text-xs text-teal-600 font-medium mt-4">
//                                 Loading data from Aiven Database...
//                             </p>
//                         </div>
//                     ) : paginatedClients.length === 0 ? (
//                         <div className="bg-white rounded-2xl p-16 text-center border border-slate-200/80 animate-in fade-in duration-300">
//                             <div className="h-14 w-14 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
//                                 <span className="material-symbols-outlined text-2xl">search_off</span>
//                             </div>
//                             <p className="text-sm font-semibold text-slate-600 mt-4">No client records found.</p>
//                             <p className="text-xs text-slate-400 mt-1">Try changing your search or filters.</p>
//                         </div>
//                     ) : viewMode === 'table' ? (
//                         <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
//                             <div className="overflow-x-auto">
//                                 <table className="w-full text-left border-collapse">
//                                     <thead>
//                                         <tr className="bg-slate-50/80 border-b border-slate-200/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
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
//                                     <tbody className="divide-y divide-slate-100 text-xs">
//                                         {paginatedClients.map((client, index) => (
//                                             <tr
//                                                 key={client.id}
//                                                 onClick={() => setSelectedClientForView(client)}
//                                                 className="group hover:bg-teal-50/30 transition-all duration-200 cursor-pointer animate-in fade-in"
//                                                 style={{
//                                                     animationDelay: `${Math.min(index * 25, 300)}ms`,
//                                                 }}
//                                             >
//                                                 <td className="py-3 px-4">
//                                                     <div className="flex items-center gap-2">
//                                                         <div className="h-8 w-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
//                                                             <span className="material-symbols-outlined text-base">
//                                                                 person
//                                                             </span>
//                                                         </div>
//                                                         <div>
//                                                             <div className="font-semibold text-slate-800">
//                                                                 {client.clientName}
//                                                             </div>
//                                                             <div className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-500 border">
//                                                                 {client.clientId}
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </td>
//                                                 <td className="py-3 px-4 font-mono text-slate-700">
//                                                     {client.clientPhone || '-'}
//                                                 </td>
//                                                 <td className="py-3 px-4 font-mono">
//                                                     <div className="text-slate-700 font-medium">
//                                                         IP: {client.primaryIp || '-'}
//                                                     </div>
//                                                     <div className="text-[10px] text-slate-400">
//                                                         ONU: {client.primaryOnu || '-'}
//                                                     </div>
//                                                 </td>
//                                                 <td className="py-3 px-4 font-mono">
//                                                     <div className="text-slate-700 font-medium">
//                                                         IP: {client.secondaryIp || '-'}
//                                                     </div>
//                                                     <div className="text-[10px] text-slate-400">
//                                                         ONU: {client.secondaryOnu || '-'}
//                                                     </div>
//                                                 </td>
//                                                 <td className="py-3 px-4 text-slate-600 max-w-[150px]">
//                                                     <div
//                                                         className="truncate font-medium text-slate-700"
//                                                         title={client.location || ''}
//                                                     >
//                                                         {client.location || '-'}
//                                                     </div>
//                                                 </td>
//                                                 <td className="py-3 px-4 text-slate-700 font-medium max-w-[120px]">
//                                                     <div className="truncate">{client.pocName || '-'}</div>
//                                                 </td>
//                                                 <td className="py-3 px-4">
//                                                     <span
//                                                         className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all duration-200 ${client.status === 'Connected'
//                                                             ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
//                                                             : 'bg-rose-50 text-rose-700 border border-rose-200'
//                                                             }`}
//                                                     >
//                                                         <span
//                                                             className={`h-1.5 w-1.5 rounded-full ${client.status === 'Connected'
//                                                                 ? 'bg-emerald-500 animate-pulse'
//                                                                 : 'bg-rose-500'
//                                                                 }`}
//                                                         />
//                                                         {client.status}
//                                                     </span>
//                                                 </td>
//                                                 <td className="py-3 px-4 text-right whitespace-nowrap">
//                                                     <div className="flex items-center justify-end gap-1.5">
//                                                         <button
//                                                             type="button"
//                                                             onClick={(e) => handleOpenEditModal(client, e)}
//                                                             title="Edit Client"
//                                                             className="p-2 rounded-lg text-slate-500 bg-slate-50 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 border border-transparent transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
//                                                         >
//                                                             <span className="material-symbols-outlined text-base">
//                                                                 edit
//                                                             </span>
//                                                         </button>
//                                                         <button
//                                                             type="button"
//                                                             onClick={(e) => triggerDelete(client.id.toString(), e)}
//                                                             title="Delete Client"
//                                                             className="p-2 rounded-lg text-slate-500 bg-slate-50 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-transparent transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
//                                                         >
//                                                             <span className="material-symbols-outlined text-base">
//                                                                 delete
//                                                             </span>
//                                                         </button>
//                                                     </div>
//                                                 </td>
//                                             </tr>
//                                         ))}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </div>
//                     ) : (
//                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-300">
//                             {paginatedClients.map((client, index) => (
//                                 <div
//                                     key={client.id}
//                                     onClick={() => setSelectedClientForView(client)}
//                                     className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 space-y-3 cursor-pointer animate-in fade-in slide-in-from-bottom-2"
//                                     style={{
//                                         animationDelay: `${Math.min(index * 40, 300)}ms`,
//                                     }}
//                                 >
//                                     <div className="flex items-start justify-between">
//                                         <div className="flex items-start gap-3">
//                                             <div className="h-9 w-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
//                                                 <span className="material-symbols-outlined text-base">person</span>
//                                             </div>
//                                             <div>
//                                                 <h3 className="font-bold text-slate-800 text-sm">{client.clientName}</h3>
//                                                 <div className="flex items-center gap-1.5 mt-1">
//                                                     <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-500 border">
//                                                         {client.clientId}
//                                                     </span>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                         <span
//                                             className={`px-2 py-1 rounded-full text-[10px] font-bold ${client.status === 'Connected'
//                                                 ? 'bg-emerald-50 text-emerald-700'
//                                                 : 'bg-rose-50 text-rose-700'
//                                                 }`}
//                                         >
//                                             {client.status}
//                                         </span>
//                                     </div>

//                                     <div className="text-xs space-y-1.5 text-slate-600">
//                                         <div className="truncate font-medium">Phone: {client.clientPhone || 'N/A'}</div>
//                                         <div className="truncate font-medium">Location: {client.location || 'N/A'}</div>
//                                         <div className="truncate font-medium">POC: {client.pocName || 'N/A'}</div>
//                                         <div className="font-mono text-[10px] text-slate-400">
//                                             Primary: {client.primaryIp || 'N/A'}
//                                         </div>
//                                     </div>

//                                     <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
//                                         <button
//                                             type="button"
//                                             onClick={(e) => handleOpenEditModal(client, e)}
//                                             className="px-3 py-1.5 text-xs bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
//                                         >
//                                             Edit
//                                         </button>
//                                         <button
//                                             type="button"
//                                             onClick={(e) => triggerDelete(client.id.toString(), e)}
//                                             className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
//                                         >
//                                             Delete
//                                         </button>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     )}

//                     {/* ==================================================
//                         PAGINATION
//                     ================================================== */}
//                     {totalPages > 1 && (
//                         <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white px-4 py-3 rounded-2xl border border-slate-200/80">
//                             <p className="text-xs text-slate-500">
//                                 Showing{' '}
//                                 <span className="font-semibold text-slate-700">
//                                     {(currentPage - 1) * itemsPerPage + 1}
//                                 </span>{' '}
//                                 to{' '}
//                                 <span className="font-semibold text-slate-700">
//                                     {Math.min(currentPage * itemsPerPage, filteredClients.length)}
//                                 </span>{' '}
//                                 of <span className="font-semibold text-slate-700">{filteredClients.length}</span> clients
//                             </p>

//                             <div className="flex items-center gap-1">
//                                 <button
//                                     type="button"
//                                     disabled={currentPage === 1}
//                                     onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//                                     className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer transition-all duration-200"
//                                 >
//                                     Previous
//                                 </button>

//                                 {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//                                     <button
//                                         type="button"
//                                         key={page}
//                                         onClick={() => setCurrentPage(page)}
//                                         className={`px-3 py-1.5 text-xs font-semibold rounded-xl cursor-pointer transition-all duration-200 ${currentPage === page
//                                             ? 'bg-teal-600 text-white shadow-sm scale-105'
//                                             : 'text-slate-600 hover:bg-slate-50 hover:text-teal-600'
//                                             }`}
//                                     >
//                                         {page}
//                                     </button>
//                                 ))}

//                                 <button
//                                     type="button"
//                                     disabled={currentPage === totalPages}
//                                     onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
//                                     className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer transition-all duration-200"
//                                 >
//                                     Next
//                                 </button>
//                             </div>
//                         </div>
//                     )}
//                 </div>

//                 {/* ==================================================
//                     CLIENT DETAILS MODAL
//                 ================================================== */}
//                 <ClientDetailsModal
//                     client={selectedClientForView}
//                     onClose={() => setSelectedClientForView(null)}
//                     onEdit={(client) => handleOpenEditModal(client)}
//                 />

//                 {/* ==================================================
//                     DELETE CLIENT CONFIRM
//                 ================================================== */}
//                 <ConfirmDialog
//                     isOpen={!!deleteTargetId}
//                     title="Delete Client Record?"
//                     message="Are you sure you want to remove this client? This action cannot be undone."
//                     onConfirm={confirmDelete}
//                     onCancel={() => setDeleteTargetId(null)}
//                 />

//                 {/* ==================================================
//                     DELETE POC CONFIRM
//                 ================================================== */}
//                 <ConfirmDialog
//                     isOpen={!!deletePocTargetId}
//                     title="Delete POC?"
//                     message="Are you sure you want to delete this POC? Clients using this POC will keep their records, but the POC assignment will be removed."
//                     onConfirm={confirmDeletePoc}
//                     onCancel={() => setDeletePocTargetId(null)}
//                 />

//                 {/* ==================================================
//                     RE-DESIGNED ANIMATED CLIENT ADD / EDIT MODAL
//                 ================================================== */}
//                 <AnimatePresence>
//                     {isClientModalOpen && (
//                         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//                             <motion.div
//                                 initial={{ opacity: 0 }}
//                                 animate={{ opacity: 1 }}
//                                 exit={{ opacity: 0 }}
//                                 transition={{ duration: 0.2 }}
//                                 onClick={() => !isClientSaving && setIsClientModalOpen(false)}
//                                 className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
//                             />

//                             <motion.div
//                                 initial={{ opacity: 0, scale: 0.95, y: 15 }}
//                                 animate={{ opacity: 1, scale: 1, y: 0 }}
//                                 exit={{ opacity: 0, scale: 0.95, y: 15 }}
//                                 transition={{ duration: 0.25, ease: 'easeOut' }}
//                                 className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white/95 backdrop-blur-xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]"
//                             >
//                                 <div className="flex justify-between items-center px-6 py-5 bg-white/80 border-b border-slate-100">
//                                     <div className="flex items-center gap-3">
//                                         <div className="h-10 w-10 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center">
//                                             <span className="material-symbols-outlined text-xl">
//                                                 {editingClient ? 'edit_note' : 'person_add'}
//                                             </span>
//                                         </div>
//                                         <div>
//                                             <h2 className="text-base font-bold text-slate-800 tracking-tight">
//                                                 {editingClient ? 'Edit Client Record' : 'New Client Registration'}
//                                             </h2>
//                                             <p className="text-[11px] text-slate-400 font-medium">
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
//                                         className="h-8 w-8 rounded-full bg-slate-50 hover:bg-red-50 hover:text-red-500 text-slate-400 flex items-center justify-center transition-all duration-200 cursor-pointer hover:rotate-90 disabled:opacity-50"
//                                     >
//                                         <span className="material-symbols-outlined text-lg">close</span>
//                                     </button>
//                                 </div>

//                                 <form onSubmit={handleSaveClient} className="overflow-y-auto p-6 space-y-6 custom-scrollbar">
//                                     {/* Basic Information */}
//                                     <motion.div
//                                         initial={{ opacity: 0, x: -10 }}
//                                         animate={{ opacity: 1, x: 0 }}
//                                         transition={{ delay: 0.05 }}
//                                         className="space-y-4"
//                                     >
//                                         <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 text-teal-600">
//                                             <div className="p-2 bg-teal-50 rounded-xl">
//                                                 <span className="material-symbols-outlined text-lg leading-none">badge</span>
//                                             </div>
//                                             <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
//                                                 Basic Information
//                                             </h3>
//                                         </div>

//                                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                             <div>
//                                                 <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
//                                                     Client ID <span className="text-rose-500">*</span>
//                                                 </label>
//                                                 <input
//                                                     type="text"
//                                                     required
//                                                     value={clientForm.clientId}
//                                                     onChange={(e) =>
//                                                         setClientForm({ ...clientForm, clientId: e.target.value })
//                                                     }
//                                                     placeholder="CLI-2001"
//                                                     className="w-full text-xs p-3 bg-slate-50/60 border border-slate-200/80 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
//                                                 />
//                                             </div>

//                                             <div className="md:col-span-2">
//                                                 <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
//                                                     Client Name <span className="text-rose-500">*</span>
//                                                 </label>
//                                                 <input
//                                                     type="text"
//                                                     required
//                                                     value={clientForm.clientName}
//                                                     onChange={(e) =>
//                                                         setClientForm({ ...clientForm, clientName: e.target.value })
//                                                     }
//                                                     placeholder="Apex Software Ltd."
//                                                     className="w-full text-xs p-3 bg-slate-50/60 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
//                                                 />
//                                             </div>

//                                             <div>
//                                                 <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
//                                                     Client Phone
//                                                 </label>
//                                                 <input
//                                                     type="text"
//                                                     value={clientForm.clientPhone}
//                                                     onChange={(e) =>
//                                                         setClientForm({ ...clientForm, clientPhone: e.target.value })
//                                                     }
//                                                     placeholder="+88017xxxxxxxx"
//                                                     className="w-full text-xs p-3 bg-slate-50/60 border border-slate-200/80 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
//                                                 />
//                                             </div>

//                                             <div className="md:col-span-2">
//                                                 <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
//                                                     Connection Status
//                                                 </label>
//                                                 <div className="relative">
//                                                     <span
//                                                         className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none h-2.5 w-2.5 rounded-full transition-colors duration-300 ${clientForm.status === 'Connected'
//                                                             ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
//                                                             : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
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
//                                                         className={`appearance-none w-full text-xs pl-8 pr-10 py-3 bg-slate-50/60 border border-slate-200/80 rounded-xl cursor-pointer focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200 font-bold ${clientForm.status === 'Connected'
//                                                             ? 'text-emerald-700'
//                                                             : 'text-rose-600'
//                                                             }`}
//                                                     >
//                                                         <option value="Connected">Connected</option>
//                                                         <option value="Disconnected">Disconnected</option>
//                                                     </select>
//                                                     <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">
//                                                         unfold_more
//                                                     </span>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </motion.div>

//                                     {/* Network Configurations */}
//                                     <motion.div
//                                         initial={{ opacity: 0, x: -10 }}
//                                         animate={{ opacity: 1, x: 0 }}
//                                         transition={{ delay: 0.1 }}
//                                         className="space-y-4"
//                                     >
//                                         <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 text-teal-600">
//                                             <div className="p-2 bg-teal-50 rounded-xl">
//                                                 <span className="material-symbols-outlined text-lg leading-none">router</span>
//                                             </div>
//                                             <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
//                                                 Network Configurations
//                                             </h3>
//                                         </div>

//                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
//                                             <div className="space-y-3 p-3 bg-white/80 rounded-xl border border-slate-100 shadow-sm">
//                                                 <span className="inline-block text-[10px] font-bold uppercase text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md tracking-wider">
//                                                     Primary Connection
//                                                 </span>
//                                                 <div>
//                                                     <label className="block text-[10px] text-slate-500 mb-1 font-medium">
//                                                         Primary IP
//                                                     </label>
//                                                     <input
//                                                         type="text"
//                                                         value={clientForm.primaryIp}
//                                                         onChange={(e) =>
//                                                             setClientForm({ ...clientForm, primaryIp: e.target.value })
//                                                         }
//                                                         placeholder="103.145.220.10"
//                                                         className="w-full text-xs p-2.5 bg-slate-50/50 border border-slate-200/80 rounded-lg font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
//                                                     />
//                                                 </div>
//                                                 <div>
//                                                     <label className="block text-[10px] text-slate-500 mb-1 font-medium">
//                                                         Primary ONU MAC/SN
//                                                     </label>
//                                                     <input
//                                                         type="text"
//                                                         value={clientForm.primaryOnu}
//                                                         onChange={(e) =>
//                                                             setClientForm({ ...clientForm, primaryOnu: e.target.value })
//                                                         }
//                                                         placeholder="HWTC12345678"
//                                                         className="w-full text-xs p-2.5 bg-slate-50/50 border border-slate-200/80 rounded-lg font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
//                                                     />
//                                                 </div>
//                                             </div>

//                                             <div className="space-y-3 p-3 bg-white/80 rounded-xl border border-slate-100 shadow-sm">
//                                                 <span className="inline-block text-[10px] font-bold uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md tracking-wider">
//                                                     Backup Connection
//                                                 </span>
//                                                 <div>
//                                                     <label className="block text-[10px] text-slate-500 mb-1 font-medium">
//                                                         Secondary IP
//                                                     </label>
//                                                     <input
//                                                         type="text"
//                                                         value={clientForm.secondaryIp}
//                                                         onChange={(e) =>
//                                                             setClientForm({ ...clientForm, secondaryIp: e.target.value })
//                                                         }
//                                                         placeholder="103.145.220.11"
//                                                         className="w-full text-xs p-2.5 bg-slate-50/50 border border-slate-200/80 rounded-lg font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
//                                                     />
//                                                 </div>
//                                                 <div>
//                                                     <label className="block text-[10px] text-slate-500 mb-1 font-medium">
//                                                         Secondary ONU MAC/SN
//                                                     </label>
//                                                     <input
//                                                         type="text"
//                                                         value={clientForm.secondaryOnu}
//                                                         onChange={(e) =>
//                                                             setClientForm({ ...clientForm, secondaryOnu: e.target.value })
//                                                         }
//                                                         placeholder="ZTE78901234"
//                                                         className="w-full text-xs p-2.5 bg-slate-50/50 border border-slate-200/80 rounded-lg font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
//                                                     />
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </motion.div>

//                                     {/* Location & Contact */}
//                                     <motion.div
//                                         initial={{ opacity: 0, x: -10 }}
//                                         animate={{ opacity: 1, x: 0 }}
//                                         transition={{ delay: 0.15 }}
//                                         className="space-y-4"
//                                     >
//                                         <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 text-teal-600">
//                                             <div className="p-2 bg-teal-50 rounded-xl">
//                                                 <span className="material-symbols-outlined text-lg leading-none">location_on</span>
//                                             </div>
//                                             <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
//                                                 Location & Contact
//                                             </h3>
//                                         </div>

//                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                             <div>
//                                                 <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
//                                                     Point of Contact (POC)
//                                                 </label>
//                                                 <div className="relative">
//                                                     <select
//                                                         value={clientForm.pocId}
//                                                         onChange={(e) =>
//                                                             setClientForm({ ...clientForm, pocId: e.target.value })
//                                                         }
//                                                         className="appearance-none w-full text-xs p-3 pr-10 bg-slate-50/60 border border-slate-200/80 rounded-xl cursor-pointer focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
//                                                     >
//                                                         <option value="">Select Point of Contact...</option>
//                                                         {pocs.map((poc) => (
//                                                             <option key={poc.id} value={poc.id.toString()}>
//                                                                 {poc.name}
//                                                             </option>
//                                                         ))}
//                                                     </select>
//                                                     <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">
//                                                         unfold_more
//                                                     </span>
//                                                 </div>
//                                             </div>

//                                             <div>
//                                                 <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
//                                                     Location Address
//                                                 </label>
//                                                 <input
//                                                     type="text"
//                                                     value={clientForm.location}
//                                                     onChange={(e) =>
//                                                         setClientForm({ ...clientForm, location: e.target.value })
//                                                     }
//                                                     placeholder="Floor 4, Building B, Agrabad C/A"
//                                                     className="w-full text-xs p-3 bg-slate-50/60 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
//                                                 />
//                                             </div>

//                                             <div className="md:col-span-2">
//                                                 <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
//                                                     Description / Remarks
//                                                 </label>
//                                                 <textarea
//                                                     rows={2}
//                                                     value={clientForm.description}
//                                                     onChange={(e) =>
//                                                         setClientForm({ ...clientForm, description: e.target.value })
//                                                     }
//                                                     placeholder="Additional notes about connectivity or setup..."
//                                                     className="w-full text-xs p-3 bg-slate-50/60 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200 resize-none"
//                                                 />
//                                             </div>
//                                         </div>
//                                     </motion.div>

//                                     {/* Action Buttons */}
//                                     <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
//                                         <motion.button
//                                             type="button"
//                                             whileHover={{ scale: 1.02 }}
//                                             whileTap={{ scale: 0.98 }}
//                                             onClick={() => setIsClientModalOpen(false)}
//                                             disabled={isClientSaving}
//                                             className="px-5 py-2.5 rounded-xl border border-slate-200/80 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all duration-200 cursor-pointer disabled:opacity-50"
//                                         >
//                                             Cancel
//                                         </motion.button>

//                                         <motion.button
//                                             type="submit"
//                                             disabled={isClientSaving}
//                                             whileHover={{ scale: isClientSaving ? 1 : 1.02 }}
//                                             whileTap={{ scale: isClientSaving ? 1 : 0.97 }}
//                                             className={`relative overflow-hidden px-6 py-2.5 text-white rounded-xl text-xs font-semibold shadow-md transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 min-w-[130px] ${editingClient
//                                                 ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-orange-500/25'
//                                                 : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:shadow-teal-500/25'
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

//                 {/* ==================================================
//                     POC MANAGEMENT MODAL
//                 ================================================== */}
//                 {isPocManagementOpen && (
//                     <div
//                         onClick={() => setIsPocManagementOpen(false)}
//                         className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
//                     >
//                         <div
//                             onClick={(e) => e.stopPropagation()}
//                             className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200"
//                         >
//                             <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
//                                 <div className="flex items-center gap-3">
//                                     <div className="h-10 w-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
//                                         <span className="material-symbols-outlined">manage_accounts</span>
//                                     </div>
//                                     <div>
//                                         <h2 className="text-base font-bold text-slate-800">POC Management</h2>
//                                         <p className="text-[11px] text-slate-400 mt-0.5">
//                                             Add, edit or delete Point of Connections
//                                         </p>
//                                     </div>
//                                 </div>

//                                 <button
//                                     type="button"
//                                     onClick={() => setIsPocManagementOpen(false)}
//                                     className="h-8 w-8 rounded-full bg-slate-50 hover:bg-red-50 hover:text-red-500 text-slate-400 flex items-center justify-center transition-all duration-200 cursor-pointer hover:rotate-90"
//                                 >
//                                     <span className="material-symbols-outlined text-lg">close</span>
//                                 </button>
//                             </div>

//                             <div className="p-5">
//                                 {pocs.length === 0 ? (
//                                     <div className="text-center py-10">
//                                         <div className="h-14 w-14 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
//                                             <span className="material-symbols-outlined text-2xl">person_off</span>
//                                         </div>
//                                         <p className="text-sm font-semibold text-slate-600 mt-3">No POC found</p>
//                                         <p className="text-xs text-slate-400 mt-1">Add your first Point of Connection.</p>
//                                     </div>
//                                 ) : (
//                                     <div className="space-y-2 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
//                                         {pocs.map((poc) => (
//                                             <div
//                                                 key={poc.id}
//                                                 className="group flex items-center justify-between gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-teal-200 hover:shadow-sm transition-all duration-200"
//                                             >
//                                                 <div className="flex items-center gap-3 min-w-0">
//                                                     <div className="h-10 w-10 shrink-0 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
//                                                         <span className="material-symbols-outlined text-lg">hub</span>
//                                                     </div>
//                                                     <div className="min-w-0">
//                                                         <p className="text-xs font-bold text-slate-800 truncate">{poc.name}</p>
//                                                         <p className="text-[10px] text-slate-400 mt-0.5">POC ID: {poc.id}</p>
//                                                     </div>
//                                                 </div>

//                                                 <div className="flex items-center gap-1.5 shrink-0">
//                                                     <button
//                                                         type="button"
//                                                         onClick={() => handleEditPoc(poc)}
//                                                         title="Edit POC"
//                                                         className="h-9 w-9 rounded-xl bg-orange-50 border border-orange-100 text-orange-500 hover:bg-orange-100 hover:border-orange-200 hover:text-orange-600 flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
//                                                     >
//                                                         <span className="material-symbols-outlined text-base">edit</span>
//                                                     </button>
//                                                     <button
//                                                         type="button"
//                                                         onClick={() => setDeletePocTargetId(poc.id.toString())}
//                                                         title="Delete POC"
//                                                         className="h-9 w-9 rounded-xl bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 hover:border-red-200 hover:text-red-600 flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
//                                                     >
//                                                         <span className="material-symbols-outlined text-base">delete</span>
//                                                     </button>
//                                                 </div>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 )}

//                                 <div className="flex items-center justify-between gap-2 mt-5 pt-4 border-t border-slate-100">
//                                     <p className="text-[11px] text-slate-400">
//                                         Total POCs: <span className="font-bold text-slate-600">{pocs.length}</span>
//                                     </p>

//                                     <div className="flex items-center gap-2">
//                                         <button
//                                             type="button"
//                                             onClick={() => setIsPocManagementOpen(false)}
//                                             className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all duration-200 cursor-pointer"
//                                         >
//                                             Close
//                                         </button>
//                                         <button
//                                             type="button"
//                                             onClick={handleOpenAddPoc}
//                                             className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm hover:shadow-md active:scale-[0.98]"
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

//                 {/* ==================================================
//                     ADD / EDIT POC MODAL
//                 ================================================== */}
//                 {isPocModalOpen && (
//                     <div
//                         onClick={() => setIsPocModalOpen(false)}
//                         className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
//                     >
//                         <div
//                             onClick={(e) => e.stopPropagation()}
//                             className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200"
//                         >
//                             <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
//                                 <div className="flex items-center gap-3">
//                                     <div
//                                         className={`h-10 w-10 rounded-2xl flex items-center justify-center ${editingPoc ? 'bg-orange-50 text-orange-600' : 'bg-teal-50 text-teal-600'
//                                             }`}
//                                     >
//                                         <span className="material-symbols-outlined text-xl">
//                                             {editingPoc ? 'edit' : 'hub'}
//                                         </span>
//                                     </div>
//                                     <div>
//                                         <h2 className="text-sm font-bold text-slate-800">
//                                             {editingPoc ? 'Edit Point of Connection' : 'Add Point of Connection'}
//                                         </h2>
//                                         <p className="text-[10px] text-slate-400 mt-0.5">
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
//                                     className="h-8 w-8 rounded-full bg-slate-50 hover:bg-red-50 hover:text-red-500 text-slate-400 flex items-center justify-center transition-all duration-200 cursor-pointer hover:rotate-90"
//                                 >
//                                     <span className="material-symbols-outlined text-lg">close</span>
//                                 </button>
//                             </div>

//                             <form onSubmit={handleSavePoc} className="p-6 space-y-5">
//                                 <div>
//                                     <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
//                                         POC Name <span className="text-red-500">*</span>
//                                     </label>
//                                     <div className="relative">
//                                         <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">
//                                             hub
//                                         </span>
//                                         <input
//                                             type="text"
//                                             required
//                                             autoFocus
//                                             value={pocForm.name}
//                                             onChange={(e) => setPocForm({ ...pocForm, name: e.target.value })}
//                                             className="w-full text-xs pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
//                                             placeholder="e.g. Agrabad POP Connection"
//                                         />
//                                     </div>
//                                 </div>

//                                 <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
//                                     <button
//                                         type="button"
//                                         onClick={() => {
//                                             setIsPocModalOpen(false);
//                                             setEditingPoc(null);
//                                         }}
//                                         className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all duration-200 cursor-pointer"
//                                     >
//                                         Cancel
//                                     </button>

//                                     <button
//                                         type="submit"
//                                         className={`px-5 py-2.5 text-white rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md active:scale-[0.98] flex items-center gap-1.5 ${editingPoc ? 'bg-orange-500 hover:bg-orange-600' : 'bg-teal-600 hover:bg-teal-700'
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

















// ==============2nd=============















// 'use client';
// import React, {
//     useState,
//     useEffect,
//     useMemo,
//     useRef,
// } from 'react';
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
//     const itemsPerPage = 30; // Updated to 30 items per page

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
//     // LOAD DATA
//     // ==================================================
//     useEffect(() => {
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

//     // ==================================================
//     // DEBOUNCE SEARCH (Load on Search Trigger)
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
//         setDeleteTargetId(id);
//     };

//     const confirmDelete = async () => {
//         if (!deleteTargetId) return;

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
//                 showToast('Client updated successfully!', 'warning');
//             } else {
//                 setClients((prev) => [savedClient, ...prev]);
//                 setCurrentPage(1);
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
//             <div className="min-h-screen bg-slate-900/5 text-slate-800 p-3 sm:p-6 lg:p-8">
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
//                             className={`fixed bottom-6 right-6 z-[9999] max-w-sm w-full flex items-center gap-3.5 p-4 rounded-2xl border shadow-xl backdrop-blur-2xl ${toast.type === 'success'
//                                 ? 'bg-white/95 border-emerald-500/30 text-emerald-950 shadow-emerald-500/10'
//                                 : toast.type === 'warning'
//                                     ? 'bg-white/95 border-amber-500/30 text-amber-950 shadow-amber-500/10'
//                                     : 'bg-white/95 border-rose-500/30 text-rose-950 shadow-rose-500/10'
//                                 }`}
//                         >
//                             <div
//                                 className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 shadow-sm ${toast.type === 'success'
//                                     ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/20'
//                                     : toast.type === 'warning'
//                                         ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/20'
//                                         : 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-rose-500/20'
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
//                                 <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
//                                     {toast.type === 'success'
//                                         ? 'Success'
//                                         : toast.type === 'warning'
//                                             ? 'Updated'
//                                             : 'Error'}
//                                 </p>
//                                 <p className="text-xs font-semibold text-slate-800 leading-tight mt-0.5 truncate">
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
//                                 className="flex items-center justify-center w-7 h-7 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-all shrink-0"
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
//                     <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl p-6 sm:p-7 rounded-3xl shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-md">
//                         <div className="absolute -right-10 -top-10 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
//                         <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

//                         <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
//                             <div className="flex items-center gap-4">
//                                 <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/20 shrink-0">
//                                     <span className="material-symbols-outlined text-2xl">
//                                         hub
//                                     </span>
//                                 </div>

//                                 <div>
//                                     <div className="flex items-center gap-2.5">
//                                         <button
//                                             type="button"
//                                             onClick={() => window.location.reload()}
//                                             className="text-2xl font-black text-slate-900 tracking-tight cursor-pointer hover:text-teal-600 transition-colors duration-200 text-left"
//                                         >
//                                             Client Directory
//                                         </button>
//                                         <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-teal-700 bg-teal-50 border border-teal-200/60 rounded-full">
//                                             Live
//                                         </span>
//                                     </div>
//                                     <p className="text-xs font-medium text-slate-500 mt-0.5">
//                                         Manage network connections, client profiles, and active configurations
//                                     </p>
//                                 </div>
//                             </div>

//                             <div className="flex items-center gap-3">
//                                 <motion.button
//                                     type="button"
//                                     whileHover={{ scale: 1.02 }}
//                                     whileTap={{ scale: 0.98 }}
//                                     onClick={() => setIsPocManagementOpen(true)}
//                                     className="group px-4 py-2.5 bg-slate-50 hover:bg-teal-50/60 text-slate-700 hover:text-teal-700 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 border border-slate-200/80 hover:border-teal-200 shadow-2xs hover:shadow-xs"
//                                 >
//                                     <span className="material-symbols-outlined text-lg text-slate-500 group-hover:text-teal-600 transition-colors">
//                                         manage_accounts
//                                     </span>
//                                     Manage POC
//                                 </motion.button>

//                                 <motion.button
//                                     type="button"
//                                     whileHover={{ scale: 1.02 }}
//                                     whileTap={{ scale: 0.98 }}
//                                     onClick={handleOpenAddModal}
//                                     className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs font-semibold transition-all duration-300 shadow-md shadow-teal-600/20 hover:shadow-lg hover:shadow-teal-600/30 flex items-center gap-2 cursor-pointer"
//                                 >
//                                     <span className="material-symbols-outlined text-lg">
//                                         add_circle
//                                     </span>
//                                     New Client Entry
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
//                                 ? 'bg-gradient-to-br from-teal-500/10 via-white to-slate-50 border-teal-500/40 shadow-md shadow-teal-500/10 ring-2 ring-teal-500/30'
//                                 : 'bg-white/90 backdrop-blur-md text-slate-800 border-slate-200/70 hover:border-teal-200 shadow-xs hover:shadow-md'
//                                 }`}
//                         >
//                             {statusFilter === 'All' && (
//                                 <div className="absolute -right-8 -top-8 w-28 h-28 bg-teal-400/20 rounded-full blur-2xl pointer-events-none" />
//                             )}

//                             <div className="flex items-center justify-between relative z-10">
//                                 <div>
//                                     <div className="flex items-center gap-1.5">
//                                         <p className={`text-[11px] font-bold uppercase tracking-wider ${statusFilter === 'All' ? 'text-teal-700' : 'text-slate-400'
//                                             }`}>
//                                             Total Clients
//                                         </p>
//                                         {statusFilter === 'All' && (
//                                             <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
//                                         )}
//                                     </div>
//                                     <h3 className={`text-3xl font-black mt-1 ${statusFilter === 'All' ? 'text-teal-800' : 'text-slate-800'
//                                         }`}>
//                                         {clients.length}
//                                     </h3>
//                                 </div>

//                                 <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${statusFilter === 'All'
//                                     ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30'
//                                     : 'bg-slate-100 text-slate-600 group-hover:bg-teal-50 group-hover:text-teal-600'
//                                     }`}>
//                                     <span className="material-symbols-outlined text-2xl">
//                                         lan
//                                     </span>
//                                 </div>
//                             </div>

//                             <div className="mt-4 relative z-10">
//                                 <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-100">
//                                     <div className={`h-full rounded-full transition-all duration-500 ${statusFilter === 'All' ? 'bg-teal-500 w-full' : 'bg-slate-300 w-full'
//                                         }`} />
//                                 </div>
//                                 <p className={`text-[10px] font-medium mt-1.5 flex items-center justify-between ${statusFilter === 'All' ? 'text-teal-600 font-bold' : 'text-slate-400'
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
//                                 ? 'bg-gradient-to-br from-emerald-500/10 via-white to-slate-50 border-emerald-500/40 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-500/30'
//                                 : 'bg-white/90 backdrop-blur-md text-slate-800 border-slate-200/70 hover:border-emerald-200 shadow-xs hover:shadow-md'
//                                 }`}
//                         >
//                             {statusFilter === 'Connected' && (
//                                 <div className="absolute -right-8 -top-8 w-28 h-28 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
//                             )}

//                             <div className="flex items-center justify-between relative z-10">
//                                 <div>
//                                     <div className="flex items-center gap-1.5">
//                                         <p className={`text-[11px] font-bold uppercase tracking-wider ${statusFilter === 'Connected' ? 'text-emerald-700' : 'text-slate-400'
//                                             }`}>
//                                             Connected
//                                         </p>
//                                         <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
//                                     </div>
//                                     <h3 className={`text-3xl font-black mt-1 ${statusFilter === 'Connected' ? 'text-emerald-800' : 'text-emerald-600'
//                                         }`}>
//                                         {clients.filter((c) => c.status === 'Connected').length}
//                                     </h3>
//                                 </div>

//                                 <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${statusFilter === 'Connected'
//                                     ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
//                                     : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white'
//                                     }`}>
//                                     <span className="material-symbols-outlined text-2xl">
//                                         check_circle
//                                     </span>
//                                 </div>
//                             </div>

//                             <div className="mt-4 relative z-10">
//                                 <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-100">
//                                     <div
//                                         className="h-full rounded-full bg-emerald-500 transition-all duration-500"
//                                         style={{
//                                             width: clients.length
//                                                 ? `${(clients.filter((c) => c.status === 'Connected').length / clients.length) * 100}%`
//                                                 : '0%',
//                                         }}
//                                     />
//                                 </div>
//                                 <p className={`text-[10px] font-medium mt-1.5 flex items-center justify-between ${statusFilter === 'Connected' ? 'text-emerald-700 font-bold' : 'text-slate-400'
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
//                                 ? 'bg-gradient-to-br from-rose-500/10 via-white to-slate-50 border-rose-500/40 shadow-md shadow-rose-500/10 ring-2 ring-rose-500/30'
//                                 : 'bg-white/90 backdrop-blur-md text-slate-800 border-slate-200/70 hover:border-rose-200 shadow-xs hover:shadow-md'
//                                 }`}
//                         >
//                             {statusFilter === 'Disconnected' && (
//                                 <div className="absolute -right-8 -top-8 w-28 h-28 bg-rose-400/20 rounded-full blur-2xl pointer-events-none" />
//                             )}

//                             <div className="flex items-center justify-between relative z-10">
//                                 <div>
//                                     <div className="flex items-center gap-1.5">
//                                         <p className={`text-[11px] font-bold uppercase tracking-wider ${statusFilter === 'Disconnected' ? 'text-rose-700' : 'text-slate-400'
//                                             }`}>
//                                             Disconnected
//                                         </p>
//                                         {clients.filter((c) => c.status === 'Disconnected').length > 0 && (
//                                             <span className="h-2 w-2 rounded-full bg-rose-500 animate-bounce" />
//                                         )}
//                                     </div>
//                                     <h3 className={`text-3xl font-black mt-1 ${statusFilter === 'Disconnected' ? 'text-rose-800' : 'text-rose-600'
//                                         }`}>
//                                         {clients.filter((c) => c.status === 'Disconnected').length}
//                                     </h3>
//                                 </div>

//                                 <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${statusFilter === 'Disconnected'
//                                     ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
//                                     : 'bg-rose-50 text-rose-600 group-hover:bg-rose-500 group-hover:text-white'
//                                     }`}>
//                                     <span className="material-symbols-outlined text-2xl">
//                                         power_off
//                                     </span>
//                                 </div>
//                             </div>

//                             <div className="mt-4 relative z-10">
//                                 <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-100">
//                                     <div
//                                         className="h-full rounded-full bg-rose-500 transition-all duration-500"
//                                         style={{
//                                             width: clients.length
//                                                 ? `${(clients.filter((c) => c.status === 'Disconnected').length / clients.length) * 100}%`
//                                                 : '0%',
//                                         }}
//                                     />
//                                 </div>
//                                 <p className={`text-[10px] font-medium mt-1.5 flex items-center justify-between ${statusFilter === 'Disconnected' ? 'text-rose-700 font-bold' : 'text-slate-400'
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
//                     <div className="bg-white/80 backdrop-blur-xl p-3.5 rounded-3xl border border-slate-100 shadow-xs transition-all duration-300 hover:shadow-sm">
//                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
//                             {/* Search Input with Dynamic Indicator */}
//                             <div className="lg:col-span-5 relative group">
//                                 <span className={`material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-lg transition-colors duration-200 ${isSearching ? 'text-teal-600 animate-spin' : 'text-slate-400 group-focus-within:text-teal-600'
//                                     }`}>
//                                     {isSearching ? 'progress_activity' : 'search'}
//                                 </span>
//                                 <input
//                                     type="text"
//                                     value={searchQuery}
//                                     onChange={(e) => setSearchQuery(e.target.value)}
//                                     placeholder="Search Client ID, Name, Phone, Location..."
//                                     className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50/80 border border-slate-200/70 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
//                                 />
//                                 {searchQuery && (
//                                     <button
//                                         type="button"
//                                         onClick={() => setSearchQuery('')}
//                                         className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 cursor-pointer transition-colors"
//                                     >
//                                         <span className="material-symbols-outlined text-base">close</span>
//                                     </button>
//                                 )}
//                             </div>

//                             {/* Status Select */}
//                             <div className="lg:col-span-2 relative">
//                                 <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-600 text-base pointer-events-none z-10">
//                                     tune
//                                 </span>
//                                 <select
//                                     value={statusFilter}
//                                     onChange={(e) => setStatusFilter(e.target.value as 'All' | 'Connected' | 'Disconnected')}
//                                     className="appearance-none w-full pl-10 pr-9 py-2.5 text-xs font-semibold bg-slate-50/80 border border-slate-200/70 rounded-2xl cursor-pointer hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
//                                 >
//                                     <option value="All">All Statuses</option>
//                                     <option value="Connected">Connected Only</option>
//                                     <option value="Disconnected">Disconnected Only</option>
//                                 </select>
//                                 <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">
//                                     unfold_more
//                                 </span>
//                             </div>

//                             {/* POC Select */}
//                             <div className="lg:col-span-2 relative">
//                                 <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-600 text-base pointer-events-none z-10">
//                                     group
//                                 </span>
//                                 <select
//                                     value={pocFilter}
//                                     onChange={(e) => setPocFilter(e.target.value)}
//                                     className="appearance-none w-full pl-10 pr-9 py-2.5 text-xs font-semibold bg-slate-50/80 border border-slate-200/70 rounded-2xl cursor-pointer hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
//                                 >
//                                     <option value="All">All POCs</option>
//                                     {pocs.map((poc) => (
//                                         <option key={poc.id} value={poc.id.toString()}>
//                                             {poc.name}
//                                         </option>
//                                     ))}
//                                 </select>
//                                 <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">
//                                     unfold_more
//                                 </span>
//                             </div>

//                             {/* Sort Select */}
//                             <div className="lg:col-span-2 relative">
//                                 <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-600 text-base pointer-events-none z-10">
//                                     sort
//                                 </span>
//                                 <select
//                                     value={sortBy}
//                                     onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'name' | 'clientId')}
//                                     className="appearance-none w-full pl-10 pr-9 py-2.5 text-xs font-semibold bg-slate-50/80 border border-slate-200/70 rounded-2xl cursor-pointer hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
//                                 >
//                                     <option value="newest">Newest First</option>
//                                     <option value="oldest">Oldest First</option>
//                                     <option value="name">Client Name</option>
//                                     <option value="clientId">Client ID</option>
//                                 </select>
//                                 <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">
//                                     unfold_more
//                                 </span>
//                             </div>

//                             {/* View Switcher */}
//                             <div className="lg:col-span-1 flex items-center justify-end gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/50">
//                                 <button
//                                     type="button"
//                                     onClick={() => setViewMode('table')}
//                                     className={`flex-1 py-1.5 rounded-xl text-xs flex items-center justify-center transition-all duration-200 cursor-pointer ${viewMode === 'table'
//                                         ? 'bg-white shadow-xs text-teal-700 font-bold'
//                                         : 'text-slate-400 hover:text-slate-700'
//                                         }`}
//                                     title="Table View"
//                                 >
//                                     <span className="material-symbols-outlined text-base">table_rows</span>
//                                 </button>
//                                 <button
//                                     type="button"
//                                     onClick={() => setViewMode('grid')}
//                                     className={`flex-1 py-1.5 rounded-xl text-xs flex items-center justify-center transition-all duration-200 cursor-pointer ${viewMode === 'grid'
//                                         ? 'bg-white shadow-xs text-teal-700 font-bold'
//                                         : 'text-slate-400 hover:text-slate-700'
//                                         }`}
//                                     title="Grid View"
//                                 >
//                                     <span className="material-symbols-outlined text-base">grid_view</span>
//                                 </button>
//                             </div>
//                         </div>
//                     </div>

//                     {/* ==================================================
//                         CONTENT AREA
//                     ================================================== */}
//                     {isLoading ? (
//                         <div className="bg-white rounded-2xl p-16 text-center border border-slate-200/80">
//                             <div className="h-10 w-10 mx-auto rounded-full border-4 border-teal-100 border-t-teal-600 animate-spin"></div>
//                             <p className="text-xs text-teal-600 font-medium mt-4">
//                                 Loading client directory...
//                             </p>
//                         </div>
//                     ) : paginatedClients.length === 0 ? (
//                         <div className="bg-white rounded-2xl p-16 text-center border border-slate-200/80">
//                             <div className="h-14 w-14 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
//                                 <span className="material-symbols-outlined text-2xl">search_off</span>
//                             </div>
//                             <p className="text-sm font-semibold text-slate-600 mt-4">No client records found.</p>
//                             <p className="text-xs text-slate-400 mt-1">Try changing your search or filters.</p>
//                         </div>
//                     ) : viewMode === 'table' ? (
//                         <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
//                             <div className="overflow-x-auto">
//                                 <table className="w-full text-left border-collapse">
//                                     <thead>
//                                         <tr className="bg-slate-50/80 border-b border-slate-200/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
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

//                                     <tbody className="divide-y divide-slate-200/80 text-xs">
//                                         {paginatedClients.map((client, index) => (
//                                             <tr
//                                                 key={client.id}
//                                                 onClick={() => setSelectedClientForView(client)}
//                                                 className={`group transition-colors duration-150 cursor-pointer ${index % 2 === 0
//                                                     ? 'bg-white hover:bg-teal-100/50'
//                                                     : 'bg-slate-100/70 hover:bg-teal-100/50'
//                                                     }`}
//                                             >
//                                                 <td className="py-3.5 px-4">
//                                                     <div className="flex items-center gap-2.5">
//                                                         <div className="h-8 w-8 rounded-xl bg-teal-100/80 text-teal-700 font-bold flex items-center justify-center shrink-0 shadow-2xs">
//                                                             <span className="material-symbols-outlined text-base">
//                                                                 person
//                                                             </span>
//                                                         </div>
//                                                         <div>
//                                                             <div className="font-bold text-slate-900">
//                                                                 {client.clientName}
//                                                             </div>
//                                                             <div className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-slate-200/70 font-mono text-[10px] text-slate-700 font-semibold border border-slate-300/60">
//                                                                 {client.clientId}
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </td>
//                                                 <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
//                                                     {client.clientPhone || '-'}
//                                                 </td>
//                                                 <td className="py-3.5 px-4 font-mono">
//                                                     <div className="text-slate-800 font-bold">
//                                                         IP: {client.primaryIp || '-'}
//                                                     </div>
//                                                     <div className="text-[10px] text-slate-500 font-medium">
//                                                         ONU: {client.primaryOnu || '-'}
//                                                     </div>
//                                                 </td>
//                                                 <td className="py-3.5 px-4 font-mono">
//                                                     <div className="text-slate-800 font-bold">
//                                                         IP: {client.secondaryIp || '-'}
//                                                     </div>
//                                                     <div className="text-[10px] text-slate-500 font-medium">
//                                                         ONU: {client.secondaryOnu || '-'}
//                                                     </div>
//                                                 </td>
//                                                 <td className="py-3.5 px-4 text-slate-700 max-w-[150px]">
//                                                     <div
//                                                         className="truncate font-semibold text-slate-800"
//                                                         title={client.location || ''}
//                                                     >
//                                                         {client.location || '-'}
//                                                     </div>
//                                                 </td>
//                                                 <td className="py-3.5 px-4 text-slate-800 font-semibold max-w-[120px]">
//                                                     <div className="truncate">{client.pocName || '-'}</div>
//                                                 </td>
//                                                 <td className="py-3.5 px-4">
//                                                     <span
//                                                         className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-2xs ${client.status === 'Connected'
//                                                             ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
//                                                             : 'bg-rose-100 text-rose-800 border border-rose-300'
//                                                             }`}
//                                                     >
//                                                         <span
//                                                             className={`h-2 w-2 rounded-full ${client.status === 'Connected'
//                                                                 ? 'bg-emerald-600 animate-pulse'
//                                                                 : 'bg-rose-600'
//                                                                 }`}
//                                                         />
//                                                         {client.status}
//                                                     </span>
//                                                 </td>
//                                                 <td className="py-3.5 px-4 text-right whitespace-nowrap">
//                                                     <div className="flex items-center justify-end gap-1.5">
//                                                         <button
//                                                             type="button"
//                                                             onClick={(e) => handleOpenEditModal(client, e)}
//                                                             title="Edit Client"
//                                                             className="p-2 rounded-lg text-slate-700 bg-white hover:bg-orange-100 hover:text-orange-700 hover:border-orange-300 border border-slate-300/80 transition-all duration-200 cursor-pointer shadow-2xs"
//                                                         >
//                                                             <span className="material-symbols-outlined text-base">
//                                                                 edit
//                                                             </span>
//                                                         </button>
//                                                         <button
//                                                             type="button"
//                                                             onClick={(e) => triggerDelete(client.id.toString(), e)}
//                                                             title="Delete Client"
//                                                             className="p-2 rounded-lg text-slate-700 bg-white hover:bg-rose-100 hover:text-rose-700 hover:border-rose-300 border border-slate-300/80 transition-all duration-200 cursor-pointer shadow-2xs"
//                                                         >
//                                                             <span className="material-symbols-outlined text-base">
//                                                                 delete
//                                                             </span>
//                                                         </button>
//                                                     </div>
//                                                 </td>
//                                             </tr>
//                                         ))}
//                                     </tbody>

//                                 </table>
//                             </div>
//                         </div>
//                     ) : (
//                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                             {paginatedClients.map((client) => (
//                                 <div
//                                     key={client.id}
//                                     onClick={() => setSelectedClientForView(client)}
//                                     className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 space-y-3 cursor-pointer"
//                                 >
//                                     <div className="flex items-start justify-between">
//                                         <div className="flex items-start gap-3">
//                                             <div className="h-9 w-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
//                                                 <span className="material-symbols-outlined text-base">person</span>
//                                             </div>
//                                             <div>
//                                                 <h3 className="font-bold text-slate-800 text-sm">{client.clientName}</h3>
//                                                 <div className="flex items-center gap-1.5 mt-1">
//                                                     <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-500 border">
//                                                         {client.clientId}
//                                                     </span>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                         <span
//                                             className={`px-2 py-1 rounded-full text-[10px] font-bold ${client.status === 'Connected'
//                                                 ? 'bg-emerald-50 text-emerald-700'
//                                                 : 'bg-rose-50 text-rose-700'
//                                                 }`}
//                                         >
//                                             {client.status}
//                                         </span>
//                                     </div>

//                                     <div className="text-xs space-y-1.5 text-slate-600">
//                                         <div className="truncate font-medium">Phone: {client.clientPhone || 'N/A'}</div>
//                                         <div className="truncate font-medium">Location: {client.location || 'N/A'}</div>
//                                         <div className="truncate font-medium">POC: {client.pocName || 'N/A'}</div>
//                                         <div className="font-mono text-[10px] text-slate-400">
//                                             Primary: {client.primaryIp || 'N/A'}
//                                         </div>
//                                     </div>

//                                     <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
//                                         <button
//                                             type="button"
//                                             onClick={(e) => handleOpenEditModal(client, e)}
//                                             className="px-3 py-1.5 text-xs bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
//                                         >
//                                             Edit
//                                         </button>
//                                         <button
//                                             type="button"
//                                             onClick={(e) => triggerDelete(client.id.toString(), e)}
//                                             className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
//                                         >
//                                             Delete
//                                         </button>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     )}

//                     {/* ==================================================
//                         NEW MODERN & ULTRA-PREMIUM PAGINATION BAR
//                     ================================================== */}
//                     {totalPages > 1 && (
//                         <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-4 rounded-3xl border border-slate-100 shadow-xs">
//                             {/* Showing Info */}
//                             <div className="flex items-center gap-2">
//                                 <div className="h-8 w-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
//                                     <span className="material-symbols-outlined text-sm">auto_stories</span>
//                                 </div>
//                                 <p className="text-xs text-slate-500">
//                                     Showing <span className="font-bold text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
//                                     <span className="font-bold text-slate-800">
//                                         {Math.min(currentPage * itemsPerPage, filteredClients.length)}
//                                     </span>{' '}
//                                     of <span className="font-bold text-teal-700">{filteredClients.length}</span> clients (30 per page)
//                                 </p>
//                             </div>

//                             {/* Pagination Controls */}
//                             <div className="flex items-center gap-1.5">
//                                 {/* First Page */}
//                                 <button
//                                     type="button"
//                                     disabled={currentPage === 1}
//                                     onClick={() => setCurrentPage(1)}
//                                     className="p-2 rounded-xl text-slate-500 hover:bg-teal-50 hover:text-teal-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500 cursor-pointer transition-all duration-200"
//                                     title="First Page"
//                                 >
//                                     <span className="material-symbols-outlined text-sm">first_page</span>
//                                 </button>

//                                 {/* Prev Page */}
//                                 <button
//                                     type="button"
//                                     disabled={currentPage === 1}
//                                     onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//                                     className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200/80 text-slate-600 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-slate-200/80 cursor-pointer transition-all duration-200 flex items-center gap-1"
//                                 >
//                                     <span className="material-symbols-outlined text-sm">chevron_left</span>
//                                     <span>Prev</span>
//                                 </button>

//                                 {/* Page Numbers */}
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
//                                                         <span className="px-1 text-slate-400 text-xs font-bold">...</span>
//                                                     )}
//                                                     <motion.button
//                                                         type="button"
//                                                         whileHover={{ scale: 1.05 }}
//                                                         whileTap={{ scale: 0.95 }}
//                                                         onClick={() => setCurrentPage(page)}
//                                                         className={`min-w-[34px] h-[34px] text-xs font-bold rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-center ${currentPage === page
//                                                             ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-600/20'
//                                                             : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
//                                                             }`}
//                                                     >
//                                                         {page}
//                                                     </motion.button>
//                                                 </React.Fragment>
//                                             );
//                                         })}
//                                 </div>

//                                 {/* Next Page */}
//                                 <button
//                                     type="button"
//                                     disabled={currentPage === totalPages}
//                                     onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
//                                     className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200/80 text-slate-600 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-slate-200/80 cursor-pointer transition-all duration-200 flex items-center gap-1"
//                                 >
//                                     <span>Next</span>
//                                     <span className="material-symbols-outlined text-sm">chevron_right</span>
//                                 </button>

//                                 {/* Last Page */}
//                                 <button
//                                     type="button"
//                                     disabled={currentPage === totalPages}
//                                     onClick={() => setCurrentPage(totalPages)}
//                                     className="p-2 rounded-xl text-slate-500 hover:bg-teal-50 hover:text-teal-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500 cursor-pointer transition-all duration-200"
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
//                                 className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
//                             />

//                             <motion.div
//                                 initial={{ opacity: 0, scale: 0.95, y: 15 }}
//                                 animate={{ opacity: 1, scale: 1, y: 0 }}
//                                 exit={{ opacity: 0, scale: 0.95, y: 15 }}
//                                 transition={{ duration: 0.25, ease: 'easeOut' }}
//                                 className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white/95 backdrop-blur-xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]"
//                             >
//                                 <div className="flex justify-between items-center px-6 py-5 bg-white/80 border-b border-slate-100">
//                                     <div className="flex items-center gap-3">
//                                         <div className="h-10 w-10 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center">
//                                             <span className="material-symbols-outlined text-xl">
//                                                 {editingClient ? 'edit_note' : 'person_add'}
//                                             </span>
//                                         </div>
//                                         <div>
//                                             <h2 className="text-base font-bold text-slate-800 tracking-tight">
//                                                 {editingClient ? 'Edit Client Record' : 'New Client Registration'}
//                                             </h2>
//                                             <p className="text-[11px] text-slate-400 font-medium">
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
//                                         className="h-8 w-8 rounded-full bg-slate-50 hover:bg-red-50 hover:text-red-500 text-slate-400 flex items-center justify-center transition-all duration-200 cursor-pointer hover:rotate-90 disabled:opacity-50"
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
//                                         <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 text-teal-600">
//                                             <div className="p-2 bg-teal-50 rounded-xl">
//                                                 <span className="material-symbols-outlined text-lg leading-none">badge</span>
//                                             </div>
//                                             <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
//                                                 Basic Information
//                                             </h3>
//                                         </div>

//                                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                             <div>
//                                                 <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
//                                                     Client ID <span className="text-rose-500">*</span>
//                                                 </label>
//                                                 <input
//                                                     type="text"
//                                                     required
//                                                     value={clientForm.clientId}
//                                                     onChange={(e) =>
//                                                         setClientForm({ ...clientForm, clientId: e.target.value })
//                                                     }
//                                                     placeholder="CLI-2001"
//                                                     className="w-full text-xs p-3 bg-slate-50/60 border border-slate-200/80 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
//                                                 />
//                                             </div>

//                                             <div className="md:col-span-2">
//                                                 <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
//                                                     Client Name <span className="text-rose-500">*</span>
//                                                 </label>
//                                                 <input
//                                                     type="text"
//                                                     required
//                                                     value={clientForm.clientName}
//                                                     onChange={(e) =>
//                                                         setClientForm({ ...clientForm, clientName: e.target.value })
//                                                     }
//                                                     placeholder="Apex Software Ltd."
//                                                     className="w-full text-xs p-3 bg-slate-50/60 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
//                                                 />
//                                             </div>

//                                             <div>
//                                                 <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
//                                                     Client Phone
//                                                 </label>
//                                                 <input
//                                                     type="text"
//                                                     value={clientForm.clientPhone}
//                                                     onChange={(e) =>
//                                                         setClientForm({ ...clientForm, clientPhone: e.target.value })
//                                                     }
//                                                     placeholder="+88017xxxxxxxx"
//                                                     className="w-full text-xs p-3 bg-slate-50/60 border border-slate-200/80 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
//                                                 />
//                                             </div>

//                                             <div className="md:col-span-2">
//                                                 <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
//                                                     Connection Status
//                                                 </label>
//                                                 <div className="relative">
//                                                     <span
//                                                         className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none h-2.5 w-2.5 rounded-full transition-colors duration-300 ${clientForm.status === 'Connected'
//                                                             ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
//                                                             : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
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
//                                                         className={`appearance-none w-full text-xs pl-8 pr-10 py-3 bg-slate-50/60 border border-slate-200/80 rounded-xl cursor-pointer focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200 font-bold ${clientForm.status === 'Connected'
//                                                             ? 'text-emerald-700'
//                                                             : 'text-rose-600'
//                                                             }`}
//                                                     >
//                                                         <option value="Connected">Connected</option>
//                                                         <option value="Disconnected">Disconnected</option>
//                                                     </select>
//                                                     <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">
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
//                                         <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 text-teal-600">
//                                             <div className="p-2 bg-teal-50 rounded-xl">
//                                                 <span className="material-symbols-outlined text-lg leading-none">router</span>
//                                             </div>
//                                             <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
//                                                 Network Configurations
//                                             </h3>
//                                         </div>

//                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
//                                             <div className="space-y-3 p-3 bg-white/80 rounded-xl border border-slate-100 shadow-sm">
//                                                 <span className="inline-block text-[10px] font-bold uppercase text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md tracking-wider">
//                                                     Primary Connection
//                                                 </span>
//                                                 <div>
//                                                     <label className="block text-[10px] text-slate-500 mb-1 font-medium">
//                                                         Primary IP
//                                                     </label>
//                                                     <input
//                                                         type="text"
//                                                         value={clientForm.primaryIp}
//                                                         onChange={(e) =>
//                                                             setClientForm({ ...clientForm, primaryIp: e.target.value })
//                                                         }
//                                                         placeholder="103.145.220.10"
//                                                         className="w-full text-xs p-2.5 bg-slate-50/50 border border-slate-200/80 rounded-lg font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
//                                                     />
//                                                 </div>
//                                                 <div>
//                                                     <label className="block text-[10px] text-slate-500 mb-1 font-medium">
//                                                         Primary ONU MAC/SN
//                                                     </label>
//                                                     <input
//                                                         type="text"
//                                                         value={clientForm.primaryOnu}
//                                                         onChange={(e) =>
//                                                             setClientForm({ ...clientForm, primaryOnu: e.target.value })
//                                                         }
//                                                         placeholder="HWTC12345678"
//                                                         className="w-full text-xs p-2.5 bg-slate-50/50 border border-slate-200/80 rounded-lg font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
//                                                     />
//                                                 </div>
//                                             </div>

//                                             <div className="space-y-3 p-3 bg-white/80 rounded-xl border border-slate-100 shadow-sm">
//                                                 <span className="inline-block text-[10px] font-bold uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md tracking-wider">
//                                                     Backup Connection
//                                                 </span>
//                                                 <div>
//                                                     <label className="block text-[10px] text-slate-500 mb-1 font-medium">
//                                                         Secondary IP
//                                                     </label>
//                                                     <input
//                                                         type="text"
//                                                         value={clientForm.secondaryIp}
//                                                         onChange={(e) =>
//                                                             setClientForm({ ...clientForm, secondaryIp: e.target.value })
//                                                         }
//                                                         placeholder="103.145.220.11"
//                                                         className="w-full text-xs p-2.5 bg-slate-50/50 border border-slate-200/80 rounded-lg font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
//                                                     />
//                                                 </div>
//                                                 <div>
//                                                     <label className="block text-[10px] text-slate-500 mb-1 font-medium">
//                                                         Secondary ONU MAC/SN
//                                                     </label>
//                                                     <input
//                                                         type="text"
//                                                         value={clientForm.secondaryOnu}
//                                                         onChange={(e) =>
//                                                             setClientForm({ ...clientForm, secondaryOnu: e.target.value })
//                                                         }
//                                                         placeholder="ZTE78901234"
//                                                         className="w-full text-xs p-2.5 bg-slate-50/50 border border-slate-200/80 rounded-lg font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
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
//                                         <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 text-teal-600">
//                                             <div className="p-2 bg-teal-50 rounded-xl">
//                                                 <span className="material-symbols-outlined text-lg leading-none">location_on</span>
//                                             </div>
//                                             <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
//                                                 Location & Contact
//                                             </h3>
//                                         </div>

//                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                             <div>
//                                                 <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
//                                                     Point of Contact (POC)
//                                                 </label>
//                                                 <div className="relative">
//                                                     <select
//                                                         value={clientForm.pocId}
//                                                         onChange={(e) =>
//                                                             setClientForm({ ...clientForm, pocId: e.target.value })
//                                                         }
//                                                         className="appearance-none w-full text-xs p-3 pr-10 bg-slate-50/60 border border-slate-200/80 rounded-xl cursor-pointer focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
//                                                     >
//                                                         <option value="">Select Point of Contact...</option>
//                                                         {pocs.map((poc) => (
//                                                             <option key={poc.id} value={poc.id.toString()}>
//                                                                 {poc.name}
//                                                             </option>
//                                                         ))}
//                                                     </select>
//                                                     <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">
//                                                         unfold_more
//                                                     </span>
//                                                 </div>
//                                             </div>

//                                             <div>
//                                                 <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
//                                                     Location Address
//                                                 </label>
//                                                 <input
//                                                     type="text"
//                                                     value={clientForm.location}
//                                                     onChange={(e) =>
//                                                         setClientForm({ ...clientForm, location: e.target.value })
//                                                     }
//                                                     placeholder="Floor 4, Building B, Agrabad C/A"
//                                                     className="w-full text-xs p-3 bg-slate-50/60 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
//                                                 />
//                                             </div>

//                                             <div className="md:col-span-2">
//                                                 <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
//                                                     Description / Remarks
//                                                 </label>
//                                                 <textarea
//                                                     rows={2}
//                                                     value={clientForm.description}
//                                                     onChange={(e) =>
//                                                         setClientForm({ ...clientForm, description: e.target.value })
//                                                     }
//                                                     placeholder="Additional notes about connectivity or setup..."
//                                                     className="w-full text-xs p-3 bg-slate-50/60 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200 resize-none"
//                                                 />
//                                             </div>
//                                         </div>
//                                     </motion.div>

//                                     <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
//                                         <motion.button
//                                             type="button"
//                                             whileHover={{ scale: 1.02 }}
//                                             whileTap={{ scale: 0.98 }}
//                                             onClick={() => setIsClientModalOpen(false)}
//                                             disabled={isClientSaving}
//                                             className="px-5 py-2.5 rounded-xl border border-slate-200/80 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all duration-200 cursor-pointer disabled:opacity-50"
//                                         >
//                                             Cancel
//                                         </motion.button>

//                                         <motion.button
//                                             type="submit"
//                                             disabled={isClientSaving}
//                                             whileHover={{ scale: isClientSaving ? 1 : 1.02 }}
//                                             whileTap={{ scale: isClientSaving ? 1 : 0.97 }}
//                                             className={`relative overflow-hidden px-6 py-2.5 text-white rounded-xl text-xs font-semibold shadow-md transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 min-w-[130px] ${editingClient
//                                                 ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-orange-500/25'
//                                                 : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:shadow-teal-500/25'
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
//                         className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
//                     >
//                         <div
//                             onClick={(e) => e.stopPropagation()}
//                             className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
//                         >
//                             <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
//                                 <div className="flex items-center gap-3">
//                                     <div className="h-10 w-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
//                                         <span className="material-symbols-outlined">manage_accounts</span>
//                                     </div>
//                                     <div>
//                                         <h2 className="text-base font-bold text-slate-800">POC Management</h2>
//                                         <p className="text-[11px] text-slate-400 mt-0.5">
//                                             Add, edit or delete Point of Connections
//                                         </p>
//                                     </div>
//                                 </div>

//                                 <button
//                                     type="button"
//                                     onClick={() => setIsPocManagementOpen(false)}
//                                     className="h-8 w-8 rounded-full bg-slate-50 hover:bg-red-50 hover:text-red-500 text-slate-400 flex items-center justify-center transition-all duration-200 cursor-pointer hover:rotate-90"
//                                 >
//                                     <span className="material-symbols-outlined text-lg">close</span>
//                                 </button>
//                             </div>

//                             <div className="p-5">
//                                 {pocs.length === 0 ? (
//                                     <div className="text-center py-10">
//                                         <div className="h-14 w-14 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
//                                             <span className="material-symbols-outlined text-2xl">person_off</span>
//                                         </div>
//                                         <p className="text-sm font-semibold text-slate-600 mt-3">No POC found</p>
//                                         <p className="text-xs text-slate-400 mt-1">Add your first Point of Connection.</p>
//                                     </div>
//                                 ) : (
//                                     <div className="space-y-2 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
//                                         {pocs.map((poc) => (
//                                             <div
//                                                 key={poc.id}
//                                                 className="group flex items-center justify-between gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-teal-200 hover:shadow-sm transition-all duration-200"
//                                             >
//                                                 <div className="flex items-center gap-3 min-w-0">
//                                                     <div className="h-10 w-10 shrink-0 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
//                                                         <span className="material-symbols-outlined text-lg">hub</span>
//                                                     </div>
//                                                     <div className="min-w-0">
//                                                         <p className="text-xs font-bold text-slate-800 truncate">{poc.name}</p>
//                                                         <p className="text-[10px] text-slate-400 mt-0.5">POC ID: {poc.id}</p>
//                                                     </div>
//                                                 </div>

//                                                 <div className="flex items-center gap-1.5 shrink-0">
//                                                     <button
//                                                         type="button"
//                                                         onClick={() => handleEditPoc(poc)}
//                                                         title="Edit POC"
//                                                         className="h-9 w-9 rounded-xl bg-orange-50 border border-orange-100 text-orange-500 hover:bg-orange-100 hover:border-orange-200 hover:text-orange-600 flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
//                                                     >
//                                                         <span className="material-symbols-outlined text-base">edit</span>
//                                                     </button>
//                                                     <button
//                                                         type="button"
//                                                         onClick={() => setDeletePocTargetId(poc.id.toString())}
//                                                         title="Delete POC"
//                                                         className="h-9 w-9 rounded-xl bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 hover:border-red-200 hover:text-red-600 flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
//                                                     >
//                                                         <span className="material-symbols-outlined text-base">delete</span>
//                                                     </button>
//                                                 </div>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 )}

//                                 <div className="flex items-center justify-between gap-2 mt-5 pt-4 border-t border-slate-100">
//                                     <p className="text-[11px] text-slate-400">
//                                         Total POCs: <span className="font-bold text-slate-600">{pocs.length}</span>
//                                     </p>

//                                     <div className="flex items-center gap-2">
//                                         <button
//                                             type="button"
//                                             onClick={() => setIsPocManagementOpen(false)}
//                                             className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all duration-200 cursor-pointer"
//                                         >
//                                             Close
//                                         </button>
//                                         <button
//                                             type="button"
//                                             onClick={handleOpenAddPoc}
//                                             className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm hover:shadow-md active:scale-[0.98]"
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
//                         className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
//                     >
//                         <div
//                             onClick={(e) => e.stopPropagation()}
//                             className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100"
//                         >
//                             <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
//                                 <div className="flex items-center gap-3">
//                                     <div
//                                         className={`h-10 w-10 rounded-2xl flex items-center justify-center ${editingPoc ? 'bg-orange-50 text-orange-600' : 'bg-teal-50 text-teal-600'
//                                             }`}
//                                     >
//                                         <span className="material-symbols-outlined text-xl">
//                                             {editingPoc ? 'edit' : 'hub'}
//                                         </span>
//                                     </div>
//                                     <div>
//                                         <h2 className="text-sm font-bold text-slate-800">
//                                             {editingPoc ? 'Edit Point of Connection' : 'Add Point of Connection'}
//                                         </h2>
//                                         <p className="text-[10px] text-slate-400 mt-0.5">
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
//                                     className="h-8 w-8 rounded-full bg-slate-50 hover:bg-red-50 hover:text-red-500 text-slate-400 flex items-center justify-center transition-all duration-200 cursor-pointer hover:rotate-90"
//                                 >
//                                     <span className="material-symbols-outlined text-lg">close</span>
//                                 </button>
//                             </div>

//                             <form onSubmit={handleSavePoc} className="p-6 space-y-5">
//                                 <div>
//                                     <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
//                                         POC Name <span className="text-red-500">*</span>
//                                     </label>
//                                     <div className="relative">
//                                         <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">
//                                             hub
//                                         </span>
//                                         <input
//                                             type="text"
//                                             required
//                                             autoFocus
//                                             value={pocForm.name}
//                                             onChange={(e) => setPocForm({ ...pocForm, name: e.target.value })}
//                                             className="w-full text-xs pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
//                                             placeholder="e.g. Agrabad POP Connection"
//                                         />
//                                     </div>
//                                 </div>

//                                 <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
//                                     <button
//                                         type="button"
//                                         onClick={() => {
//                                             setIsPocModalOpen(false);
//                                             setEditingPoc(null);
//                                         }}
//                                         className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all duration-200 cursor-pointer"
//                                     >
//                                         Cancel
//                                     </button>

//                                     <button
//                                         type="submit"
//                                         className={`px-5 py-2.5 text-white rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md active:scale-[0.98] flex items-center gap-1.5 ${editingPoc ? 'bg-orange-500 hover:bg-orange-600' : 'bg-teal-600 hover:bg-teal-700'
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








// ==================3rd with log=====================


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
    // Controls & Filters
    // --------------------------------------------------
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Connected' | 'Disconnected'>('All');
    const [pocFilter, setPocFilter] = useState<string>('All');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'clientId'>('newest');
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

    // --------------------------------------------------
    // Pagination (Per page 30 Clients)
    // --------------------------------------------------
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 30; // Updated to 30 items per page

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
    type ToastType = 'success' | 'error' | 'warning';

    const [toast, setToast] = useState<{
        show: boolean;
        message: string;
        type: ToastType;
    }>({
        show: false,
        message: '',
        type: 'success',
    });

    const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

    const showToast = (message: string, type: ToastType = 'success') => {
        if (toastTimerRef.current) {
            clearTimeout(toastTimerRef.current);
        }

        setToast({
            show: true,
            message,
            type,
        });

        toastTimerRef.current = setTimeout(() => {
            setToast((prev) => ({
                ...prev,
                show: false,
            }));
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

            // sessionStorage থেকে ইউজার ডাটা রিড করা
            const storedUser = sessionStorage.getItem('netbill_session_user');
            if (storedUser) {
                try {
                    // যদি ডাটাটি JSON অবজেক্ট হয় (যেমন: { name: 'Rahim', email: '...' })
                    const userData = JSON.parse(storedUser);
                    loggedInUser = userData.name || userData.email || userData.username || storedUser;
                } catch {
                    // যদি সরাসরি স্ট্রিং (যেমন: শুধু নাম বা ইমেইল) সেভ করা থাকে
                    loggedInUser = storedUser;
                }
            }

            await fetch('/api/logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    clientId,
                    clientName,
                    details,
                    performedBy: loggedInUser, // ডাইনামিক ইউজারের নাম পাস হলো
                }),
            });
        } catch (err) {
            console.error('Failed to record activity log:', err);
        }
    };

    // ==================================================
    // LOAD DATA
    // ==================================================
    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);

            try {
                const [pocsRes, clientsRes] = await Promise.all([
                    fetch('/api/pocs', { cache: 'no-store' }),
                    fetch('/api/clients', { cache: 'no-store' }),
                ]);

                if (pocsRes.ok) {
                    const pocsData = await pocsRes.json();
                    const normalizedPocs = Array.isArray(pocsData)
                        ? pocsData
                        : pocsData?.pocs || pocsData?.data || [];
                    setPocs(normalizedPocs);
                }

                if (clientsRes.ok) {
                    const clientsData = await clientsRes.json();
                    const normalizedClients = Array.isArray(clientsData)
                        ? clientsData
                        : clientsData?.clients || clientsData?.data || [];
                    setClients(normalizedClients);
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

    // ==================================================
    // DEBOUNCE SEARCH (Load on Search Trigger)
    // ==================================================
    useEffect(() => {
        setIsSearching(true);
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
            setIsSearching(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // ==================================================
    // FILTER & SORT
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
                if (sortBy === 'newest') return Number(b.id) - Number(a.id);
                if (sortBy === 'oldest') return Number(a.id) - Number(b.id);
                if (sortBy === 'name') return (a.clientName || '').localeCompare(b.clientName || '');
                if (sortBy === 'clientId') return (a.clientId || '').localeCompare(b.clientId || '');
                return 0;
            });
    }, [clients, debouncedSearchQuery, statusFilter, pocFilter, sortBy]);

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchQuery, statusFilter, pocFilter, sortBy]);

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

            // Record Log for Delete
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

                // Record Log for Update
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

                // Record Log for Create
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
            <div className="min-h-screen bg-slate-900/5 text-slate-800 p-3 sm:p-6 lg:p-8">
                {/* ==================================================
                    PREMIUM TOAST NOTIFICATION
                ================================================== */}
                <AnimatePresence mode="wait">
                    {toast.show && (
                        <motion.div
                            key={toast.message}
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className={`fixed bottom-6 right-6 z-[9999] max-w-sm w-full flex items-center gap-3.5 p-4 rounded-2xl border shadow-xl backdrop-blur-2xl ${toast.type === 'success'
                                ? 'bg-white/95 border-emerald-500/30 text-emerald-950 shadow-emerald-500/10'
                                : toast.type === 'warning'
                                    ? 'bg-white/95 border-amber-500/30 text-amber-950 shadow-amber-500/10'
                                    : 'bg-white/95 border-rose-500/30 text-rose-950 shadow-rose-500/10'
                                }`}
                        >
                            <div
                                className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 shadow-sm ${toast.type === 'success'
                                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/20'
                                    : toast.type === 'warning'
                                        ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/20'
                                        : 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-rose-500/20'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    {toast.type === 'success'
                                        ? 'check_circle'
                                        : toast.type === 'warning'
                                            ? 'edit'
                                            : 'error'}
                                </span>
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    {toast.type === 'success'
                                        ? 'Success'
                                        : toast.type === 'warning'
                                            ? 'Updated'
                                            : 'Error'}
                                </p>
                                <p className="text-xs font-semibold text-slate-800 leading-tight mt-0.5 truncate">
                                    {toast.message}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setToast((prev) => ({
                                        ...prev,
                                        show: false,
                                    }))
                                }
                                className="flex items-center justify-center w-7 h-7 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-all shrink-0"
                            >
                                <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="max-w-7xl mx-auto space-y-6">
                    {/* ==================================================
                        HEADER SECTION
                    ================================================== */}
                    <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl p-6 sm:p-7 rounded-3xl shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-md">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/20 shrink-0">
                                    <span className="material-symbols-outlined text-2xl">
                                        hub
                                    </span>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2.5">
                                        <button
                                            type="button"
                                            onClick={() => window.location.reload()}
                                            className="text-2xl font-black text-slate-900 tracking-tight cursor-pointer hover:text-teal-600 transition-colors duration-200 text-left"
                                        >
                                            Client Directory
                                        </button>
                                        <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-teal-700 bg-teal-50 border border-teal-200/60 rounded-full">
                                            Live
                                        </span>
                                    </div>
                                    <p className="text-xs font-medium text-slate-500 mt-0.5">
                                        Manage network connections, client profiles, and active configurations
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Link
                                    href="/client-info/system-log"
                                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border border-slate-200/80"
                                >
                                    <span className="material-symbols-outlined text-base">history</span>
                                    System Logs
                                </Link>

                                <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setIsPocManagementOpen(true)}
                                    className="group px-4 py-2.5 bg-slate-50 hover:bg-teal-50/60 text-slate-700 hover:text-teal-700 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 border border-slate-200/80 hover:border-teal-200 shadow-2xs hover:shadow-xs"
                                >
                                    <span className="material-symbols-outlined text-lg text-slate-500 group-hover:text-teal-600 transition-colors">
                                        manage_accounts
                                    </span>
                                    Manage POC
                                </motion.button>

                                <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleOpenAddModal}
                                    className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs font-semibold transition-all duration-300 shadow-md shadow-teal-600/20 hover:shadow-lg hover:shadow-teal-600/30 flex items-center gap-2 cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-lg">
                                        add_circle
                                    </span>
                                    New Client Entry
                                </motion.button>
                            </div>
                        </div>
                    </div>

                    {/* ==================================================
                        INTERACTIVE STATS CARDS
                    ================================================== */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Total Clients Card */}
                        <motion.div
                            whileHover={{ y: -4, scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setStatusFilter('All')}
                            className={`relative overflow-hidden p-5 rounded-3xl cursor-pointer transition-all duration-300 group border ${statusFilter === 'All'
                                ? 'bg-gradient-to-br from-teal-500/10 via-white to-slate-50 border-teal-500/40 shadow-md shadow-teal-500/10 ring-2 ring-teal-500/30'
                                : 'bg-white/90 backdrop-blur-md text-slate-800 border-slate-200/70 hover:border-teal-200 shadow-xs hover:shadow-md'
                                }`}
                        >
                            {statusFilter === 'All' && (
                                <div className="absolute -right-8 -top-8 w-28 h-28 bg-teal-400/20 rounded-full blur-2xl pointer-events-none" />
                            )}

                            <div className="flex items-center justify-between relative z-10">
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <p className={`text-[11px] font-bold uppercase tracking-wider ${statusFilter === 'All' ? 'text-teal-700' : 'text-slate-400'
                                            }`}>
                                            Total Clients
                                        </p>
                                        {statusFilter === 'All' && (
                                            <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
                                        )}
                                    </div>
                                    <h3 className={`text-3xl font-black mt-1 ${statusFilter === 'All' ? 'text-teal-800' : 'text-slate-800'
                                        }`}>
                                        {clients.length}
                                    </h3>
                                </div>

                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${statusFilter === 'All'
                                    ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30'
                                    : 'bg-slate-100 text-slate-600 group-hover:bg-teal-50 group-hover:text-teal-600'
                                    }`}>
                                    <span className="material-symbols-outlined text-2xl">
                                        lan
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 relative z-10">
                                <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-100">
                                    <div className={`h-full rounded-full transition-all duration-500 ${statusFilter === 'All' ? 'bg-teal-500 w-full' : 'bg-slate-300 w-full'
                                        }`} />
                                </div>
                                <p className={`text-[10px] font-medium mt-1.5 flex items-center justify-between ${statusFilter === 'All' ? 'text-teal-600 font-bold' : 'text-slate-400'
                                    }`}>
                                    <span>{statusFilter === 'All' ? '● Showing All Clients' : 'Click to show all'}</span>
                                    <span className="material-symbols-outlined text-xs group-hover:translate-x-0.5 transition-transform">
                                        arrow_forward
                                    </span>
                                </p>
                            </div>
                        </motion.div>

                        {/* Connected Links Card */}
                        <motion.div
                            whileHover={{ y: -4, scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setStatusFilter('Connected')}
                            className={`relative overflow-hidden p-5 rounded-3xl cursor-pointer transition-all duration-300 group border ${statusFilter === 'Connected'
                                ? 'bg-gradient-to-br from-emerald-500/10 via-white to-slate-50 border-emerald-500/40 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-500/30'
                                : 'bg-white/90 backdrop-blur-md text-slate-800 border-slate-200/70 hover:border-emerald-200 shadow-xs hover:shadow-md'
                                }`}
                        >
                            {statusFilter === 'Connected' && (
                                <div className="absolute -right-8 -top-8 w-28 h-28 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
                            )}

                            <div className="flex items-center justify-between relative z-10">
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <p className={`text-[11px] font-bold uppercase tracking-wider ${statusFilter === 'Connected' ? 'text-emerald-700' : 'text-slate-400'
                                            }`}>
                                            Connected
                                        </p>
                                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    </div>
                                    <h3 className={`text-3xl font-black mt-1 ${statusFilter === 'Connected' ? 'text-emerald-800' : 'text-emerald-600'
                                        }`}>
                                        {clients.filter((c) => c.status === 'Connected').length}
                                    </h3>
                                </div>

                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${statusFilter === 'Connected'
                                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                                    : 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white'
                                    }`}>
                                    <span className="material-symbols-outlined text-2xl">
                                        check_circle
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 relative z-10">
                                <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-100">
                                    <div
                                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                        style={{
                                            width: clients.length
                                                ? `${(clients.filter((c) => c.status === 'Connected').length / clients.length) * 100}%`
                                                : '0%',
                                        }}
                                    />
                                </div>
                                <p className={`text-[10px] font-medium mt-1.5 flex items-center justify-between ${statusFilter === 'Connected' ? 'text-emerald-700 font-bold' : 'text-slate-400'
                                    }`}>
                                    <span>
                                        {clients.length
                                            ? Math.round((clients.filter((c) => c.status === 'Connected').length / clients.length) * 100)
                                            : 0}% Active Rate
                                    </span>
                                    <span className="material-symbols-outlined text-xs group-hover:translate-x-0.5 transition-transform">
                                        filter_alt
                                    </span>
                                </p>
                            </div>
                        </motion.div>

                        {/* Disconnected Card */}
                        <motion.div
                            whileHover={{ y: -4, scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setStatusFilter('Disconnected')}
                            className={`relative overflow-hidden p-5 rounded-3xl cursor-pointer transition-all duration-300 group border ${statusFilter === 'Disconnected'
                                ? 'bg-gradient-to-br from-rose-500/10 via-white to-slate-50 border-rose-500/40 shadow-md shadow-rose-500/10 ring-2 ring-rose-500/30'
                                : 'bg-white/90 backdrop-blur-md text-slate-800 border-slate-200/70 hover:border-rose-200 shadow-xs hover:shadow-md'
                                }`}
                        >
                            {statusFilter === 'Disconnected' && (
                                <div className="absolute -right-8 -top-8 w-28 h-28 bg-rose-400/20 rounded-full blur-2xl pointer-events-none" />
                            )}

                            <div className="flex items-center justify-between relative z-10">
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <p className={`text-[11px] font-bold uppercase tracking-wider ${statusFilter === 'Disconnected' ? 'text-rose-700' : 'text-slate-400'
                                            }`}>
                                            Disconnected
                                        </p>
                                        {clients.filter((c) => c.status === 'Disconnected').length > 0 && (
                                            <span className="h-2 w-2 rounded-full bg-rose-500 animate-bounce" />
                                        )}
                                    </div>
                                    <h3 className={`text-3xl font-black mt-1 ${statusFilter === 'Disconnected' ? 'text-rose-800' : 'text-rose-600'
                                        }`}>
                                        {clients.filter((c) => c.status === 'Disconnected').length}
                                    </h3>
                                </div>

                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${statusFilter === 'Disconnected'
                                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                                    : 'bg-rose-50 text-rose-600 group-hover:bg-rose-500 group-hover:text-white'
                                    }`}>
                                    <span className="material-symbols-outlined text-2xl">
                                        power_off
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 relative z-10">
                                <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-100">
                                    <div
                                        className="h-full rounded-full bg-rose-500 transition-all duration-500"
                                        style={{
                                            width: clients.length
                                                ? `${(clients.filter((c) => c.status === 'Disconnected').length / clients.length) * 100}%`
                                                : '0%',
                                        }}
                                    />
                                </div>
                                <p className={`text-[10px] font-medium mt-1.5 flex items-center justify-between ${statusFilter === 'Disconnected' ? 'text-rose-700 font-bold' : 'text-slate-400'
                                    }`}>
                                    <span>
                                        {clients.length
                                            ? Math.round((clients.filter((c) => c.status === 'Disconnected').length / clients.length) * 100)
                                            : 0}% Down Rate
                                    </span>
                                    <span className="material-symbols-outlined text-xs group-hover:translate-x-0.5 transition-transform">
                                        filter_alt
                                    </span>
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* ==================================================
                        FILTER BAR WITH LAZY SEARCH INDICATOR
                    ================================================== */}
                    <div className="bg-white/80 backdrop-blur-xl p-3.5 rounded-3xl border border-slate-100 shadow-xs transition-all duration-300 hover:shadow-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
                            {/* Search Input with Dynamic Indicator */}
                            <div className="lg:col-span-5 relative group">
                                <span className={`material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-lg transition-colors duration-200 ${isSearching ? 'text-teal-600 animate-spin' : 'text-slate-400 group-focus-within:text-teal-600'
                                    }`}>
                                    {isSearching ? 'progress_activity' : 'search'}
                                </span>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search Client ID, Name, Phone, Location..."
                                    className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50/80 border border-slate-200/70 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 cursor-pointer transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-base">close</span>
                                    </button>
                                )}
                            </div>

                            {/* Status Select */}
                            <div className="lg:col-span-2 relative">
                                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-600 text-base pointer-events-none z-10">
                                    tune
                                </span>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as 'All' | 'Connected' | 'Disconnected')}
                                    className="appearance-none w-full pl-10 pr-9 py-2.5 text-xs font-semibold bg-slate-50/80 border border-slate-200/70 rounded-2xl cursor-pointer hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
                                >
                                    <option value="All">All Statuses</option>
                                    <option value="Connected">Connected Only</option>
                                    <option value="Disconnected">Disconnected Only</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">
                                    unfold_more
                                </span>
                            </div>

                            {/* POC Select */}
                            <div className="lg:col-span-2 relative">
                                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-600 text-base pointer-events-none z-10">
                                    group
                                </span>
                                <select
                                    value={pocFilter}
                                    onChange={(e) => setPocFilter(e.target.value)}
                                    className="appearance-none w-full pl-10 pr-9 py-2.5 text-xs font-semibold bg-slate-50/80 border border-slate-200/70 rounded-2xl cursor-pointer hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
                                >
                                    <option value="All">All POCs</option>
                                    {pocs.map((poc) => (
                                        <option key={poc.id} value={poc.id.toString()}>
                                            {poc.name}
                                        </option>
                                    ))}
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">
                                    unfold_more
                                </span>
                            </div>

                            {/* Sort Select */}
                            <div className="lg:col-span-2 relative">
                                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-teal-600 text-base pointer-events-none z-10">
                                    sort
                                </span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'name' | 'clientId')}
                                    className="appearance-none w-full pl-10 pr-9 py-2.5 text-xs font-semibold bg-slate-50/80 border border-slate-200/70 rounded-2xl cursor-pointer hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="name">Client Name</option>
                                    <option value="clientId">Client ID</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">
                                    unfold_more
                                </span>
                            </div>

                            {/* View Switcher */}
                            <div className="lg:col-span-1 flex items-center justify-end gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/50">
                                <button
                                    type="button"
                                    onClick={() => setViewMode('table')}
                                    className={`flex-1 py-1.5 rounded-xl text-xs flex items-center justify-center transition-all duration-200 cursor-pointer ${viewMode === 'table'
                                        ? 'bg-white shadow-xs text-teal-700 font-bold'
                                        : 'text-slate-400 hover:text-slate-700'
                                        }`}
                                    title="Table View"
                                >
                                    <span className="material-symbols-outlined text-base">table_rows</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('grid')}
                                    className={`flex-1 py-1.5 rounded-xl text-xs flex items-center justify-center transition-all duration-200 cursor-pointer ${viewMode === 'grid'
                                        ? 'bg-white shadow-xs text-teal-700 font-bold'
                                        : 'text-slate-400 hover:text-slate-700'
                                        }`}
                                    title="Grid View"
                                >
                                    <span className="material-symbols-outlined text-base">grid_view</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ==================================================
                        CONTENT AREA
                    ================================================== */}
                    {isLoading ? (
                        <div className="bg-white rounded-2xl p-16 text-center border border-slate-200/80">
                            <div className="h-10 w-10 mx-auto rounded-full border-4 border-teal-100 border-t-teal-600 animate-spin"></div>
                            <p className="text-xs text-teal-600 font-medium mt-4">
                                Loading client directory...
                            </p>
                        </div>
                    ) : paginatedClients.length === 0 ? (
                        <div className="bg-white rounded-2xl p-16 text-center border border-slate-200/80">
                            <div className="h-14 w-14 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl">search_off</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-600 mt-4">No client records found.</p>
                            <p className="text-xs text-slate-400 mt-1">Try changing your search or filters.</p>
                        </div>
                    ) : viewMode === 'table' ? (
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/80 border-b border-slate-200/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                            <th className="py-3.5 px-4">Client Details</th>
                                            <th className="py-3.5 px-4">Phone</th>
                                            <th className="py-3.5 px-4">Primary Link</th>
                                            <th className="py-3.5 px-4">Secondary Link</th>
                                            <th className="py-3.5 px-4">Location</th>
                                            <th className="py-3.5 px-4">POC Name</th>
                                            <th className="py-3.5 px-4">Status</th>
                                            <th className="py-3.5 px-4 text-right">Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-200/80 text-xs">
                                        {paginatedClients.map((client, index) => (
                                            <tr
                                                key={client.id}
                                                onClick={() => setSelectedClientForView(client)}
                                                className={`group transition-colors duration-150 cursor-pointer ${index % 2 === 0
                                                    ? 'bg-white hover:bg-teal-100/50'
                                                    : 'bg-slate-100/70 hover:bg-teal-100/50'
                                                    }`}
                                            >
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="h-8 w-8 rounded-xl bg-teal-100/80 text-teal-700 font-bold flex items-center justify-center shrink-0 shadow-2xs">
                                                            <span className="material-symbols-outlined text-base">
                                                                person
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900">
                                                                {client.clientName}
                                                            </div>
                                                            <div className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-slate-200/70 font-mono text-[10px] text-slate-700 font-semibold border border-slate-300/60">
                                                                {client.clientId}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                                                    {client.clientPhone || '-'}
                                                </td>
                                                <td className="py-3.5 px-4 font-mono">
                                                    <div className="text-slate-800 font-bold">
                                                        IP: {client.primaryIp || '-'}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 font-medium">
                                                        ONU: {client.primaryOnu || '-'}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 font-mono">
                                                    <div className="text-slate-800 font-bold">
                                                        IP: {client.secondaryIp || '-'}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 font-medium">
                                                        ONU: {client.secondaryOnu || '-'}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 text-slate-700 max-w-[150px]">
                                                    <div
                                                        className="truncate font-semibold text-slate-800"
                                                        title={client.location || ''}
                                                    >
                                                        {client.location || '-'}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 text-slate-800 font-semibold max-w-[120px]">
                                                    <div className="truncate">{client.pocName || '-'}</div>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold shadow-2xs ${client.status === 'Connected'
                                                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                                                            }`}
                                                    >
                                                        <span
                                                            className={`h-2 w-2 rounded-full ${client.status === 'Connected'
                                                                ? 'bg-emerald-600 animate-pulse'
                                                                : 'bg-rose-600'
                                                                }`}
                                                        />
                                                        {client.status}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => handleOpenEditModal(client, e)}
                                                            title="Edit Client"
                                                            className="p-2 rounded-lg text-slate-700 bg-white hover:bg-orange-100 hover:text-orange-700 hover:border-orange-300 border border-slate-300/80 transition-all duration-200 cursor-pointer shadow-2xs"
                                                        >
                                                            <span className="material-symbols-outlined text-base">
                                                                edit
                                                            </span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => triggerDelete(client.id.toString(), e)}
                                                            title="Delete Client"
                                                            className="p-2 rounded-lg text-slate-700 bg-white hover:bg-rose-100 hover:text-rose-700 hover:border-rose-300 border border-slate-300/80 transition-all duration-200 cursor-pointer shadow-2xs"
                                                        >
                                                            <span className="material-symbols-outlined text-base">
                                                                delete
                                                            </span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>

                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {paginatedClients.map((client) => (
                                <div
                                    key={client.id}
                                    onClick={() => setSelectedClientForView(client)}
                                    className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 space-y-3 cursor-pointer"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className="h-9 w-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                                                <span className="material-symbols-outlined text-base">person</span>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 text-sm">{client.clientName}</h3>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-500 border">
                                                        {client.clientId}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <span
                                            className={`px-2 py-1 rounded-full text-[10px] font-bold ${client.status === 'Connected'
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : 'bg-rose-50 text-rose-700'
                                                }`}
                                        >
                                            {client.status}
                                        </span>
                                    </div>

                                    <div className="text-xs space-y-1.5 text-slate-600">
                                        <div className="truncate font-medium">Phone: {client.clientPhone || 'N/A'}</div>
                                        <div className="truncate font-medium">Location: {client.location || 'N/A'}</div>
                                        <div className="truncate font-medium">POC: {client.pocName || 'N/A'}</div>
                                        <div className="font-mono text-[10px] text-slate-400">
                                            Primary: {client.primaryIp || 'N/A'}
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                                        <button
                                            type="button"
                                            onClick={(e) => handleOpenEditModal(client, e)}
                                            className="px-3 py-1.5 text-xs bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => triggerDelete(client.id.toString(), e)}
                                            className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ==================================================
                        NEW MODERN & ULTRA-PREMIUM PAGINATION BAR
                    ================================================== */}
                    {totalPages > 1 && (
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/80 backdrop-blur-xl p-4 rounded-3xl border border-slate-100 shadow-xs">
                            {/* Showing Info */}
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-sm">auto_stories</span>
                                </div>
                                <p className="text-xs text-slate-500">
                                    Showing <span className="font-bold text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                                    <span className="font-bold text-slate-800">
                                        {Math.min(currentPage * itemsPerPage, filteredClients.length)}
                                    </span>{' '}
                                    of <span className="font-bold text-teal-700">{filteredClients.length}</span> clients (30 per page)
                                </p>
                            </div>

                            {/* Pagination Controls */}
                            <div className="flex items-center gap-1.5">
                                {/* First Page */}
                                <button
                                    type="button"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(1)}
                                    className="p-2 rounded-xl text-slate-500 hover:bg-teal-50 hover:text-teal-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500 cursor-pointer transition-all duration-200"
                                    title="First Page"
                                >
                                    <span className="material-symbols-outlined text-sm">first_page</span>
                                </button>

                                {/* Prev Page */}
                                <button
                                    type="button"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                    className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200/80 text-slate-600 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-slate-200/80 cursor-pointer transition-all duration-200 flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                                    <span>Prev</span>
                                </button>

                                {/* Page Numbers */}
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
                                                    {showEllipsis && (
                                                        <span className="px-1 text-slate-400 text-xs font-bold">...</span>
                                                    )}
                                                    <motion.button
                                                        type="button"
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => setCurrentPage(page)}
                                                        className={`min-w-[34px] h-[34px] text-xs font-bold rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-center ${currentPage === page
                                                            ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-600/20'
                                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                                            }`}
                                                    >
                                                        {page}
                                                    </motion.button>
                                                </React.Fragment>
                                            );
                                        })}
                                </div>

                                {/* Next Page */}
                                <button
                                    type="button"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                    className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200/80 text-slate-600 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-slate-200/80 cursor-pointer transition-all duration-200 flex items-center gap-1"
                                >
                                    <span>Next</span>
                                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                                </button>

                                {/* Last Page */}
                                <button
                                    type="button"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(totalPages)}
                                    className="p-2 rounded-xl text-slate-500 hover:bg-teal-50 hover:text-teal-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500 cursor-pointer transition-all duration-200"
                                    title="Last Page"
                                >
                                    <span className="material-symbols-outlined text-sm">last_page</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* MODALS & DIALOGS */}
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
                    message="Are you sure you want to delete this POC? Clients using this POC will keep their records, but the POC assignment will be removed."
                    onConfirm={confirmDeletePoc}
                    onCancel={() => setDeletePocTargetId(null)}
                />

                {/* CLIENT ADD/EDIT MODAL */}
                <AnimatePresence>
                    {isClientModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                onClick={() => !isClientSaving && setIsClientModalOpen(false)}
                                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                            />

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                                transition={{ duration: 0.25, ease: 'easeOut' }}
                                className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white/95 backdrop-blur-xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]"
                            >
                                <div className="flex justify-between items-center px-6 py-5 bg-white/80 border-b border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center">
                                            <span className="material-symbols-outlined text-xl">
                                                {editingClient ? 'edit_note' : 'person_add'}
                                            </span>
                                        </div>
                                        <div>
                                            <h2 className="text-base font-bold text-slate-800 tracking-tight">
                                                {editingClient ? 'Edit Client Record' : 'New Client Registration'}
                                            </h2>
                                            <p className="text-[11px] text-slate-400 font-medium">
                                                {editingClient
                                                    ? 'Update connection & contact details'
                                                    : 'Fill in client info to add to network'}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        disabled={isClientSaving}
                                        onClick={() => setIsClientModalOpen(false)}
                                        className="h-8 w-8 rounded-full bg-slate-50 hover:bg-red-50 hover:text-red-500 text-slate-400 flex items-center justify-center transition-all duration-200 cursor-pointer hover:rotate-90 disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined text-lg">close</span>
                                    </button>
                                </div>

                                <form onSubmit={handleSaveClient} className="overflow-y-auto p-6 space-y-6 custom-scrollbar">
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.05 }}
                                        className="space-y-4"
                                    >
                                        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 text-teal-600">
                                            <div className="p-2 bg-teal-50 rounded-xl">
                                                <span className="material-symbols-outlined text-lg leading-none">badge</span>
                                            </div>
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                                Basic Information
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                                    Client ID <span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={clientForm.clientId}
                                                    onChange={(e) =>
                                                        setClientForm({ ...clientForm, clientId: e.target.value })
                                                    }
                                                    placeholder="CLI-2001"
                                                    className="w-full text-xs p-3 bg-slate-50/60 border border-slate-200/80 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                                    Client Name <span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={clientForm.clientName}
                                                    onChange={(e) =>
                                                        setClientForm({ ...clientForm, clientName: e.target.value })
                                                    }
                                                    placeholder="Apex Software Ltd."
                                                    className="w-full text-xs p-3 bg-slate-50/60 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                                    Client Phone
                                                </label>
                                                <input
                                                    type="text"
                                                    value={clientForm.clientPhone}
                                                    onChange={(e) =>
                                                        setClientForm({ ...clientForm, clientPhone: e.target.value })
                                                    }
                                                    placeholder="+88017xxxxxxxx"
                                                    className="w-full text-xs p-3 bg-slate-50/60 border border-slate-200/80 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                                    Connection Status
                                                </label>
                                                <div className="relative">
                                                    <span
                                                        className={`absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none h-2.5 w-2.5 rounded-full transition-colors duration-300 ${clientForm.status === 'Connected'
                                                            ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                                                            : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                                                            }`}
                                                    />
                                                    <select
                                                        value={clientForm.status}
                                                        onChange={(e) =>
                                                            setClientForm({
                                                                ...clientForm,
                                                                status: e.target.value as 'Connected' | 'Disconnected',
                                                            })
                                                        }
                                                        className={`appearance-none w-full text-xs pl-8 pr-10 py-3 bg-slate-50/60 border border-slate-200/80 rounded-xl cursor-pointer focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200 font-bold ${clientForm.status === 'Connected'
                                                            ? 'text-emerald-700'
                                                            : 'text-rose-600'
                                                            }`}
                                                    >
                                                        <option value="Connected">Connected</option>
                                                        <option value="Disconnected">Disconnected</option>
                                                    </select>
                                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">
                                                        unfold_more
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="space-y-4"
                                    >
                                        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 text-teal-600">
                                            <div className="p-2 bg-teal-50 rounded-xl">
                                                <span className="material-symbols-outlined text-lg leading-none">router</span>
                                            </div>
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                                Network Configurations
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                            <div className="space-y-3 p-3 bg-white/80 rounded-xl border border-slate-100 shadow-sm">
                                                <span className="inline-block text-[10px] font-bold uppercase text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md tracking-wider">
                                                    Primary Connection
                                                </span>
                                                <div>
                                                    <label className="block text-[10px] text-slate-500 mb-1 font-medium">
                                                        Primary IP
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={clientForm.primaryIp}
                                                        onChange={(e) =>
                                                            setClientForm({ ...clientForm, primaryIp: e.target.value })
                                                        }
                                                        placeholder="103.145.220.10"
                                                        className="w-full text-xs p-2.5 bg-slate-50/50 border border-slate-200/80 rounded-lg font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] text-slate-500 mb-1 font-medium">
                                                        Primary ONU MAC/SN
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={clientForm.primaryOnu}
                                                        onChange={(e) =>
                                                            setClientForm({ ...clientForm, primaryOnu: e.target.value })
                                                        }
                                                        placeholder="HWTC12345678"
                                                        className="w-full text-xs p-2.5 bg-slate-50/50 border border-slate-200/80 rounded-lg font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-3 p-3 bg-white/80 rounded-xl border border-slate-100 shadow-sm">
                                                <span className="inline-block text-[10px] font-bold uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md tracking-wider">
                                                    Backup Connection
                                                </span>
                                                <div>
                                                    <label className="block text-[10px] text-slate-500 mb-1 font-medium">
                                                        Secondary IP
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={clientForm.secondaryIp}
                                                        onChange={(e) =>
                                                            setClientForm({ ...clientForm, secondaryIp: e.target.value })
                                                        }
                                                        placeholder="103.145.220.11"
                                                        className="w-full text-xs p-2.5 bg-slate-50/50 border border-slate-200/80 rounded-lg font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] text-slate-500 mb-1 font-medium">
                                                        Secondary ONU MAC/SN
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={clientForm.secondaryOnu}
                                                        onChange={(e) =>
                                                            setClientForm({ ...clientForm, secondaryOnu: e.target.value })
                                                        }
                                                        placeholder="ZTE78901234"
                                                        className="w-full text-xs p-2.5 bg-slate-50/50 border border-slate-200/80 rounded-lg font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.15 }}
                                        className="space-y-4"
                                    >
                                        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 text-teal-600">
                                            <div className="p-2 bg-teal-50 rounded-xl">
                                                <span className="material-symbols-outlined text-lg leading-none">location_on</span>
                                            </div>
                                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                                Location & Contact
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                                    Point of Contact (POC)
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        value={clientForm.pocId}
                                                        onChange={(e) =>
                                                            setClientForm({ ...clientForm, pocId: e.target.value })
                                                        }
                                                        className="appearance-none w-full text-xs p-3 pr-10 bg-slate-50/60 border border-slate-200/80 rounded-xl cursor-pointer focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
                                                    >
                                                        <option value="">Select Point of Contact...</option>
                                                        {pocs.map((poc) => (
                                                            <option key={poc.id} value={poc.id.toString()}>
                                                                {poc.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">
                                                        unfold_more
                                                    </span>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                                    Location Address
                                                </label>
                                                <input
                                                    type="text"
                                                    value={clientForm.location}
                                                    onChange={(e) =>
                                                        setClientForm({ ...clientForm, location: e.target.value })
                                                    }
                                                    placeholder="Floor 4, Building B, Agrabad C/A"
                                                    className="w-full text-xs p-3 bg-slate-50/60 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                                    Description / Remarks
                                                </label>
                                                <textarea
                                                    rows={2}
                                                    value={clientForm.description}
                                                    onChange={(e) =>
                                                        setClientForm({ ...clientForm, description: e.target.value })
                                                    }
                                                    placeholder="Additional notes about connectivity or setup..."
                                                    className="w-full text-xs p-3 bg-slate-50/60 border border-slate-200/80 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200 resize-none"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>

                                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                        <motion.button
                                            type="button"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setIsClientModalOpen(false)}
                                            disabled={isClientSaving}
                                            className="px-5 py-2.5 rounded-xl border border-slate-200/80 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all duration-200 cursor-pointer disabled:opacity-50"
                                        >
                                            Cancel
                                        </motion.button>

                                        <motion.button
                                            type="submit"
                                            disabled={isClientSaving}
                                            whileHover={{ scale: isClientSaving ? 1 : 1.02 }}
                                            whileTap={{ scale: isClientSaving ? 1 : 0.97 }}
                                            className={`relative overflow-hidden px-6 py-2.5 text-white rounded-xl text-xs font-semibold shadow-md transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 min-w-[130px] ${editingClient
                                                ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:shadow-orange-500/25'
                                                : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:shadow-teal-500/25'
                                                } disabled:opacity-80`}
                                        >
                                            <AnimatePresence mode="wait">
                                                {isClientSaving ? (
                                                    <motion.div
                                                        key="loading"
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.8 }}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <motion.span
                                                            animate={{ rotate: 360 }}
                                                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                                            className="material-symbols-outlined text-base"
                                                        >
                                                            progress_activity
                                                        </motion.span>
                                                        <span>{editingClient ? 'Updating...' : 'Saving...'}</span>
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key="static"
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.8 }}
                                                        className="flex items-center gap-1.5"
                                                    >
                                                        <span className="material-symbols-outlined text-base">
                                                            {editingClient ? 'save' : 'check'}
                                                        </span>
                                                        <span>{editingClient ? 'Update Client' : 'Save Client'}</span>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* POC MANAGEMENT MODAL */}
                {isPocManagementOpen && (
                    <div
                        onClick={() => setIsPocManagementOpen(false)}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
                        >
                            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
                                        <span className="material-symbols-outlined">manage_accounts</span>
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-slate-800">POC Management</h2>
                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                            Add, edit or delete Point of Connections
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setIsPocManagementOpen(false)}
                                    className="h-8 w-8 rounded-full bg-slate-50 hover:bg-red-50 hover:text-red-500 text-slate-400 flex items-center justify-center transition-all duration-200 cursor-pointer hover:rotate-90"
                                >
                                    <span className="material-symbols-outlined text-lg">close</span>
                                </button>
                            </div>

                            <div className="p-5">
                                {pocs.length === 0 ? (
                                    <div className="text-center py-10">
                                        <div className="h-14 w-14 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-2xl">person_off</span>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-600 mt-3">No POC found</p>
                                        <p className="text-xs text-slate-400 mt-1">Add your first Point of Connection.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">
                                        {pocs.map((poc) => (
                                            <div
                                                key={poc.id}
                                                className="group flex items-center justify-between gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-teal-200 hover:shadow-sm transition-all duration-200"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="h-10 w-10 shrink-0 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                                                        <span className="material-symbols-outlined text-lg">hub</span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-slate-800 truncate">{poc.name}</p>
                                                        <p className="text-[10px] text-slate-400 mt-0.5">POC ID: {poc.id}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEditPoc(poc)}
                                                        title="Edit POC"
                                                        className="h-9 w-9 rounded-xl bg-orange-50 border border-orange-100 text-orange-500 hover:bg-orange-100 hover:border-orange-200 hover:text-orange-600 flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
                                                    >
                                                        <span className="material-symbols-outlined text-base">edit</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeletePocTargetId(poc.id.toString())}
                                                        title="Delete POC"
                                                        className="h-9 w-9 rounded-xl bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 hover:border-red-200 hover:text-red-600 flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
                                                    >
                                                        <span className="material-symbols-outlined text-base">delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center justify-between gap-2 mt-5 pt-4 border-t border-slate-100">
                                    <p className="text-[11px] text-slate-400">
                                        Total POCs: <span className="font-bold text-slate-600">{pocs.length}</span>
                                    </p>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsPocManagementOpen(false)}
                                            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all duration-200 cursor-pointer"
                                        >
                                            Close
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleOpenAddPoc}
                                            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm hover:shadow-md active:scale-[0.98]"
                                        >
                                            <span className="material-symbols-outlined text-base">add</span>
                                            Add POC
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ADD / EDIT POC MODAL */}
                {isPocModalOpen && (
                    <div
                        onClick={() => setIsPocModalOpen(false)}
                        className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
                    >
                        <div
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100"
                        >
                            <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`h-10 w-10 rounded-2xl flex items-center justify-center ${editingPoc ? 'bg-orange-50 text-orange-600' : 'bg-teal-50 text-teal-600'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-xl">
                                            {editingPoc ? 'edit' : 'hub'}
                                        </span>
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-800">
                                            {editingPoc ? 'Edit Point of Connection' : 'Add Point of Connection'}
                                        </h2>
                                        <p className="text-[10px] text-slate-400 mt-0.5">
                                            {editingPoc ? 'Update POC information' : 'Create a new POC'}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsPocModalOpen(false);
                                        setEditingPoc(null);
                                    }}
                                    className="h-8 w-8 rounded-full bg-slate-50 hover:bg-red-50 hover:text-red-500 text-slate-400 flex items-center justify-center transition-all duration-200 cursor-pointer hover:rotate-90"
                                >
                                    <span className="material-symbols-outlined text-lg">close</span>
                                </button>
                            </div>

                            <form onSubmit={handleSavePoc} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                                        POC Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">
                                            hub
                                        </span>
                                        <input
                                            type="text"
                                            required
                                            autoFocus
                                            value={pocForm.name}
                                            onChange={(e) => setPocForm({ ...pocForm, name: e.target.value })}
                                            className="w-full text-xs pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
                                            placeholder="e.g. Agrabad POP Connection"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsPocModalOpen(false);
                                            setEditingPoc(null);
                                        }}
                                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all duration-200 cursor-pointer"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className={`px-5 py-2.5 text-white rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md active:scale-[0.98] flex items-center gap-1.5 ${editingPoc ? 'bg-orange-500 hover:bg-orange-600' : 'bg-teal-600 hover:bg-teal-700'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-base">
                                            {editingPoc ? 'save' : 'check'}
                                        </span>
                                        {editingPoc ? 'Update POC' : 'Save POC'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}