// 'use client';

// import React, { useState, useEffect, useMemo } from 'react';
// import { ClientInfo, POC } from '@/types/client';
// import ConfirmDialog from '@/components/ConfirmDialog';
// import ClientDetailsModal from '@/components/ClientDetailsModal';

// export default function ClientInfoPage() {
//     const [clients, setClients] = useState<ClientInfo[]>([]);
//     const [pocs, setPocs] = useState<POC[]>([]);
//     const [isLoading, setIsLoading] = useState(true);

//     // Controls & Filters
//     const [searchQuery, setSearchQuery] = useState('');
//     const [statusFilter, setStatusFilter] = useState<'All' | 'Connected' | 'Disconnected'>('All');
//     const [pocFilter, setPocFilter] = useState<string>('All');
//     const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'clientId'>('newest');
//     const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

//     // Pagination State
//     const [currentPage, setCurrentPage] = useState(1);
//     const itemsPerPage = 20;

//     // Modal Controls
//     const [isClientModalOpen, setIsClientModalOpen] = useState(false);
//     const [isPocModalOpen, setIsPocModalOpen] = useState(false);
//     const [selectedClientForView, setSelectedClientForView] = useState<ClientInfo | null>(null);
//     const [editingClient, setEditingClient] = useState<ClientInfo | null>(null);

//     // Custom Confirm Delete Dialog State
//     const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

//     const [copied, setCopied] = useState(false);

//     type ToastType = 'success' | 'error';

//     const [toast, setToast] = useState<{
//         show: boolean;
//         message: string;
//         type: ToastType;
//     }>({
//         show: false,
//         message: '',
//         type: 'success',
//     });

//     const showToast = (message: string, type: ToastType = 'success') => {
//         setToast({
//             show: true,
//             message,
//             type,
//         });

//         setTimeout(() => {
//             setToast((prev) => ({
//                 ...prev,
//                 show: false,
//             }));
//         }, 3000);
//     };


//     // Form State
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

//     const [pocForm, setPocForm] = useState({
//         name: '',
//         phone: '',
//         designation: '',
//     });

//     // Load Initial Data from Aiven MySQL DB via API Routes
//     useEffect(() => {
//         const fetchInitialData = async () => {
//             setIsLoading(true);
//             try {
//                 const [pocsRes, clientsRes] = await Promise.all([
//                     fetch('/api/pocs'),
//                     fetch('/api/clients'),
//                 ]);

//                 if (pocsRes.ok) {
//                     const pocsData = await pocsRes.json();
//                     setPocs(pocsData);
//                 }

//                 if (clientsRes.ok) {
//                     const clientsData = await clientsRes.json();
//                     setClients(clientsData);
//                 }
//             } catch (error) {
//                 console.error("Error fetching data from database:", error);
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchInitialData();
//     }, []);

//     // Copy client info
//     const handleCopyClientInfo = (client: any) => {
//         const pocInfo = pocs.find((p) => p.id.toString() === client.pocId?.toString());
//         const pocText = pocInfo ? `${pocInfo.name}` : client.pocName || 'N/A';

//         const textToCopy = `Client ID : ${client.clientId || 'N/A'}
// Client Name : ${client.clientName || 'N/A'}
// Phone : ${client.clientPhone || 'N/A'}
// Primary IP & ONU : ${client.primaryIp || 'N/A'} (ONU: ${client.primaryOnu || 'N/A'})
// Secondary IP & ONU : ${client.secondaryIp || 'N/A'} (ONU: ${client.secondaryOnu || 'N/A'})
// Location : ${client.location || 'N/A'}
// POC : ${pocText}`;

//         navigator.clipboard.writeText(textToCopy);
//         setCopied(true);
//         setTimeout(() => setCopied(false), 2000);
//     };

//     // Filter & Sort Logic
//     const filteredClients = useMemo(() => {
//         return clients
//             .filter((client) => {
//                 const q = searchQuery.toLowerCase().trim();
//                 const matchesSearch =
//                     !q ||
//                     client.clientId?.toLowerCase().includes(q) ||
//                     client.clientName?.toLowerCase().includes(q) ||
//                     (client.clientPhone && client.clientPhone.toLowerCase().includes(q)) ||
//                     client.primaryIp?.toLowerCase().includes(q) ||
//                     client.location?.toLowerCase().includes(q) ||
//                     (client.pocName && client.pocName.toLowerCase().includes(q));

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

//     // Reset page to 1 on filter change
//     useEffect(() => {
//         setCurrentPage(1);
//     }, [searchQuery, statusFilter, pocFilter, sortBy]);

//     // Paginated Slice
//     const totalPages = Math.ceil(filteredClients.length / itemsPerPage) || 1;
//     const paginatedClients = useMemo(() => {
//         const start = (currentPage - 1) * itemsPerPage;
//         return filteredClients.slice(start, start + itemsPerPage);
//     }, [filteredClients, currentPage]);

//     // Open Edit Modal
//     const handleOpenEditModal = (client: ClientInfo, e?: React.MouseEvent) => {
//         if (e) e.stopPropagation();
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

//     // Open Add Modal
//     const handleOpenAddModal = () => {
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

//     // Trigger Delete
//     const triggerDelete = (id: string, e?: React.MouseEvent) => {
//         if (e) e.stopPropagation();
//         setDeleteTargetId(id);
//     };

//     // Delete Action (Aiven MySQL API)
//     const confirmDelete = async () => {
//         if (!deleteTargetId) return;

//         const idToDelete = deleteTargetId;

//         try {
//             const res = await fetch(`/api/clients/${idToDelete}`, {
//                 method: 'DELETE',
//             });

//             const data = await res.json().catch(() => null);

//             if (!res.ok) {
//                 showToast(
//                     data?.error || 'Failed to delete client.',
//                     'error'
//                 );
//                 return;
//             }

//             // Immediately remove from UI
//             setClients((prev) =>
//                 prev.filter(
//                     (client) =>
//                         client.id.toString() !== idToDelete.toString()
//                 )
//             );

//             if (
//                 selectedClientForView?.id.toString() ===
//                 idToDelete.toString()
//             ) {
//                 setSelectedClientForView(null);
//             }

//             showToast('Client deleted successfully!', 'success');

//         } catch (error) {
//             console.error('Error deleting client:', error);
//             showToast('Failed to delete client.', 'error');

//         } finally {
//             setDeleteTargetId(null);
//         }
//     };


//     // Save POC (Aiven MySQL API)
//     const handleAddPoc = async (e: React.FormEvent) => {
//         e.preventDefault();

//         if (!pocForm.name.trim()) {
//             showToast('POC name is required!', 'error');
//             return;
//         }

//         try {
//             const res = await fetch('/api/pocs', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     name: pocForm.name.trim(),
//                 }),
//             });

//             const data = await res.json();

//             if (!res.ok) {
//                 showToast(
//                     data?.error || 'Failed to add POC.',
//                     'error'
//                 );
//                 return;
//             }

//             // Immediately add POC to UI
//             setPocs((prev) => [data, ...prev]);

//             setPocForm({
//                 name: '',
//                 phone: '',
//                 designation: '',
//             });

//             setIsPocModalOpen(false);

//             showToast('POC added successfully!', 'success');

//         } catch (error) {
//             console.error('Error saving POC:', error);
//             showToast('Database request failed.', 'error');
//         }
//     };



//     // Save / Update Client (Aiven MySQL API)
//     const handleSaveClient = async (e: React.FormEvent) => {
//         e.preventDefault();

//         if (!clientForm.clientId.trim() || !clientForm.clientName.trim()) {
//             showToast('Client ID and Name are required!', 'error');
//             return;
//         }

//         const selectedPoc = pocs.find(
//             (p) => p.id.toString() === clientForm.pocId.toString()
//         );

//         try {
//             const url = editingClient
//                 ? `/api/clients/${editingClient.id}`
//                 : '/api/clients';

//             const method = editingClient ? 'PUT' : 'POST';

//             const res = await fetch(url, {
//                 method,
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     ...clientForm,
//                     pocName: selectedPoc?.name || 'N/A',
//                 }),
//             });

//             const data = await res.json();

//             if (!res.ok) {
//                 showToast(
//                     data?.error || 'Failed to save client.',
//                     'error'
//                 );
//                 return;
//             }

//             // IMPORTANT:
//             // API থেকে আসা complete joined client object সরাসরি UI state-এ বসানো হচ্ছে
//             if (editingClient) {
//                 setClients((prev) =>
//                     prev.map((client) =>
//                         client.id.toString() === editingClient.id.toString()
//                             ? data
//                             : client
//                     )
//                 );

//                 showToast('Client updated successfully!', 'success');
//             } else {
//                 setClients((prev) => [data, ...prev]);

//                 // New client automatically first page-এ দেখাবে
//                 setCurrentPage(1);

//                 showToast('Client added successfully!', 'success');
//             }

//             // Close modal
//             setIsClientModalOpen(false);

//             // Clear editing state
//             setEditingClient(null);

//         } catch (error) {
//             console.error('Error saving client:', error);
//             showToast('Database request failed.', 'error');
//         }
//     };



//     return (

//         <div className="min-h-screen bg-slate-900/5 text-slate-800 p-3 sm:p-6 lg:p-8">
//             <div className="max-w-7xl mx-auto space-y-6">

//                 {/* Header */}
//                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
//                     <div>
//                         <div className="flex items-center gap-2">
//                             <span className="material-symbols-outlined text-teal-600 text-2xl">hub</span>
//                             <h1 className="text-xl font-bold text-slate-900 tracking-tight">Client Directory</h1>
//                         </div>
//                         <p className="text-xs text-slate-500 mt-0.5">Manage network connections and client profiles</p>
//                     </div>

//                     <div className="flex items-center gap-2.5">
//                         <button
//                             onClick={() => setIsPocModalOpen(true)}
//                             className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
//                         >
//                             <span className="material-symbols-outlined text-base">person_add</span>
//                             Add POC
//                         </button>
//                         <button
//                             onClick={handleOpenAddModal}
//                             className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition shadow-sm hover:shadow flex items-center gap-1.5 cursor-pointer"
//                         >
//                             <span className="material-symbols-outlined text-base">add_circle</span>
//                             New Client Entry
//                         </button>
//                     </div>
//                 </div>

//                 {/* Stats Summary Cards */}
//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                     <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
//                         <div>
//                             <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Clients</p>
//                             <h3 className="text-2xl font-black text-slate-800 mt-1">{clients.length}</h3>
//                         </div>
//                         <div className="h-10 w-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center font-bold">
//                             <span className="material-symbols-outlined">lan</span>
//                         </div>
//                     </div>

//                     <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
//                         <div>
//                             <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Connected</p>
//                             <h3 className="text-2xl font-black text-emerald-600 mt-1">
//                                 {clients.filter((c) => c.status === 'Connected').length}
//                             </h3>
//                         </div>
//                         <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
//                             <span className="material-symbols-outlined">check_circle</span>
//                         </div>
//                     </div>

//                     <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
//                         <div>
//                             <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Disconnected</p>
//                             <h3 className="text-2xl font-black text-rose-600 mt-1">
//                                 {clients.filter((c) => c.status === 'Disconnected').length}
//                             </h3>
//                         </div>
//                         <div className="h-10 w-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center font-bold">
//                             <span className="material-symbols-outlined">power_off</span>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Filter Controls */}
//                 <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
//                         <div className="lg:col-span-5 relative">
//                             <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-lg">search</span>
//                             <input
//                                 type="text"
//                                 value={searchQuery}
//                                 onChange={(e) => setSearchQuery(e.target.value)}
//                                 placeholder="Search Client ID, Name, Phone, Location..."
//                                 className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
//                             />
//                         </div>

//                         <div className="lg:col-span-2">
//                             <select
//                                 value={statusFilter}
//                                 onChange={(e) => setStatusFilter(e.target.value as any)}
//                                 className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl"
//                             >
//                                 <option value="All">All Statuses</option>
//                                 <option value="Connected">Connected</option>
//                                 <option value="Disconnected">Disconnected</option>
//                             </select>
//                         </div>

//                         <div className="lg:col-span-2">
//                             <select
//                                 value={pocFilter}
//                                 onChange={(e) => setPocFilter(e.target.value)}
//                                 className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl"
//                             >
//                                 <option value="All">All POCs</option>
//                                 {pocs.map((p) => (
//                                     <option key={p.id} value={p.id.toString()}>
//                                         {p.name}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>

//                         <div className="lg:col-span-2">
//                             <select
//                                 value={sortBy}
//                                 onChange={(e) => setSortBy(e.target.value as any)}
//                                 className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl"
//                             >
//                                 <option value="newest">Sort: Newest First</option>
//                                 <option value="oldest">Sort: Oldest First</option>
//                                 <option value="name">Sort: Client Name</option>
//                                 <option value="clientId">Sort: Client ID</option>
//                             </select>
//                         </div>

//                         <div className="lg:col-span-1 flex items-center justify-end gap-1 bg-slate-100 p-1 rounded-xl">
//                             <button
//                                 onClick={() => setViewMode('table')}
//                                 className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${viewMode === 'table' ? 'bg-white shadow-2xs text-teal-700 font-bold' : 'text-slate-500'}`}
//                             >
//                                 <span className="material-symbols-outlined text-base">table_rows</span>
//                             </button>
//                             <button
//                                 onClick={() => setViewMode('grid')}
//                                 className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${viewMode === 'grid' ? 'bg-white shadow-2xs text-teal-700 font-bold' : 'text-slate-500'}`}
//                             >
//                                 <span className="material-symbols-outlined text-base">grid_view</span>
//                             </button>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Content Section */}
//                 {isLoading ? (
//                     <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
//                         <p className="text-xs text-teal-600 font-medium">Loading data from Aiven Database...</p>
//                     </div>
//                 ) : paginatedClients.length === 0 ? (
//                     <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
//                         <p className="text-xs text-slate-400">No client records found.</p>
//                     </div>
//                 ) : viewMode === 'table' ? (
//                     <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
//                         <div className="overflow-x-auto">
//                             <table className="w-full text-left border-collapse">
//                                 <thead>
//                                     <tr className="bg-slate-50/80 border-b border-slate-200/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
//                                         <th className="py-3.5 px-4">Client Details</th>
//                                         <th className="py-3.5 px-4">Phone</th>
//                                         <th className="py-3.5 px-4">Primary Link</th>
//                                         <th className="py-3.5 px-4">Secondary Link</th>
//                                         <th className="py-3.5 px-4">Location</th>
//                                         <th className="py-3.5 px-4">POC Name</th>
//                                         <th className="py-3.5 px-4">Status</th>
//                                         <th className="py-3.5 px-4 text-right">Actions</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="divide-y divide-slate-100 text-xs">
//                                     {paginatedClients.map((client) => (
//                                         <tr
//                                             key={client.id}
//                                             onClick={() => setSelectedClientForView(client)}
//                                             className="hover:bg-slate-50/80 transition cursor-pointer"
//                                         >
//                                             <td className="py-3 px-4">
//                                                 <div className="font-semibold text-slate-800">{client.clientName}</div>
//                                                 <div className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-500 border">
//                                                     {client.clientId}
//                                                 </div>
//                                             </td>
//                                             <td className="py-3 px-4 font-mono text-slate-700">
//                                                 {client.clientPhone || '-'}
//                                             </td>
//                                             <td className="py-3 px-4 font-mono">
//                                                 <div className="text-slate-700 font-medium">IP: {client.primaryIp || '-'}</div>
//                                                 <div className="text-[10px] text-slate-400">ONU: {client.primaryOnu || '-'}</div>
//                                             </td>
//                                             <td className="py-3 px-4 font-mono">
//                                                 <div className="text-slate-700 font-medium">IP: {client.secondaryIp || '-'}</div>
//                                                 <div className="text-[10px] text-slate-400">ONU: {client.secondaryOnu || '-'}</div>
//                                             </td>
//                                             <td className="py-3 px-4 text-slate-600 max-w-[150px]">
//                                                 <div className="truncate font-medium text-slate-700" title={client.location}>
//                                                     {client.location || '-'}
//                                                 </div>
//                                             </td>
//                                             <td className="py-3 px-4 text-slate-700 font-medium max-w-[120px]">
//                                                 <div className="truncate">{client.pocName || '-'}</div>
//                                             </td>
//                                             <td className="py-3 px-4">
//                                                 <span
//                                                     className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${client.status === 'Connected'
//                                                         ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
//                                                         : 'bg-rose-50 text-rose-700 border border-rose-200'
//                                                         }`}
//                                                 >
//                                                     {client.status}
//                                                 </span>
//                                             </td>
//                                             <td className="py-3 px-4 text-right whitespace-nowrap">
//                                                 <div className="flex items-center justify-end gap-1">
//                                                     <button
//                                                         onClick={(e) => handleOpenEditModal(client, e)}
//                                                         className="p-1.5 hover:bg-teal-50 rounded-lg text-slate-500 hover:text-teal-700 transition"
//                                                     >
//                                                         <span className="material-symbols-outlined text-base">edit</span>
//                                                     </button>
//                                                     <button
//                                                         onClick={(e) => triggerDelete(client.id.toString(), e)}
//                                                         className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-500 hover:text-rose-600 transition"
//                                                     >
//                                                         <span className="material-symbols-outlined text-base">delete</span>
//                                                     </button>
//                                                 </div>
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>
//                 ) : (
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                         {paginatedClients.map((client) => (
//                             <div
//                                 key={client.id}
//                                 onClick={() => setSelectedClientForView(client)}
//                                 className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition space-y-3 cursor-pointer"
//                             >
//                                 <div className="flex items-start justify-between">
//                                     <div>
//                                         <h3 className="font-bold text-slate-800 text-sm">{client.clientName}</h3>
//                                         <div className="flex items-center gap-1.5 mt-1">
//                                             <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-500 border">
//                                                 {client.clientId}
//                                             </span>
//                                             {client.clientPhone && (
//                                                 <span className="inline-block px-1.5 py-0.5 rounded bg-teal-50 font-mono text-[10px] text-teal-700 border border-teal-100">
//                                                     {client.clientPhone}
//                                                 </span>
//                                             )}
//                                         </div>
//                                     </div>
//                                     <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
//                                         {client.status}
//                                     </span>
//                                 </div>
//                                 <div className="text-xs space-y-1 text-slate-600">
//                                     <div className="truncate font-medium">Location: {client.location || 'N/A'}</div>
//                                     <div className="truncate font-medium">POC: {client.pocName || 'N/A'}</div>
//                                 </div>
//                                 <div className="flex justify-end gap-2 pt-2 border-t">
//                                     <button
//                                         onClick={(e) => handleOpenEditModal(client, e)}
//                                         className="px-2.5 py-1 text-xs bg-slate-100 rounded-lg"
//                                     >
//                                         Edit
//                                     </button>
//                                     <button
//                                         onClick={(e) => triggerDelete(client.id.toString(), e)}
//                                         className="px-2.5 py-1 text-xs bg-rose-50 text-rose-600 rounded-lg"
//                                     >
//                                         Delete
//                                     </button>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 )}

//                 {/* Pagination Bar */}
//                 {totalPages > 1 && (
//                     <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-200/80">
//                         <p className="text-xs text-slate-500">
//                             Showing <span className="font-semibold text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
//                             <span className="font-semibold text-slate-700">
//                                 {Math.min(currentPage * itemsPerPage, filteredClients.length)}
//                             </span>{' '}
//                             of <span className="font-semibold text-slate-700">{filteredClients.length}</span> clients
//                         </p>
//                         <div className="flex items-center gap-1">
//                             <button
//                                 disabled={currentPage === 1}
//                                 onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//                                 className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
//                             >
//                                 Previous
//                             </button>
//                             {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//                                 <button
//                                     key={page}
//                                     onClick={() => setCurrentPage(page)}
//                                     className={`px-3 py-1.5 text-xs font-semibold rounded-xl cursor-pointer ${currentPage === page ? 'bg-teal-600 text-white' : 'text-slate-600 hover:bg-slate-50'
//                                         }`}
//                                 >
//                                     {page}
//                                 </button>
//                             ))}
//                             <button
//                                 disabled={currentPage === totalPages}
//                                 onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
//                                 className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
//                             >
//                                 Next
//                             </button>
//                         </div>
//                     </div>
//                 )}

//             </div>

//             {/* --- MODALS --- */}
//             <ClientDetailsModal
//                 client={selectedClientForView}
//                 onClose={() => setSelectedClientForView(null)}
//                 onEdit={(client) => handleOpenEditModal(client)}
//             />

//             <ConfirmDialog
//                 isOpen={!!deleteTargetId}
//                 title="Delete Client Record?"
//                 message="Are you sure you want to remove this client? This action cannot be undone."
//                 onConfirm={confirmDelete}
//                 onCancel={() => setDeleteTargetId(null)}
//             />

//             {/* Add / Edit Client Modal */}
//             {isClientModalOpen && (
//                 <div
//                     onClick={() => setIsClientModalOpen(false)}
//                     className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in p-4"
//                 >
//                     <div
//                         onClick={(e) => e.stopPropagation()}
//                         className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white shadow-xl transition-all duration-300 animate-in zoom-in-95 max-h-[90vh] flex flex-col border border-slate-100"
//                     >
//                         <div className="flex justify-between items-center px-6 py-5 bg-white border-b border-slate-100">
//                             <div className="flex items-center gap-3">
//                                 <div className="h-10 w-10 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center">
//                                     <span className="material-symbols-outlined text-xl">
//                                         {editingClient ? 'edit_note' : 'person_add'}
//                                     </span>
//                                 </div>
//                                 <div>
//                                     <h2 className="text-base font-bold text-slate-800 tracking-tight">
//                                         {editingClient ? 'Edit Client Record' : 'New Client Registration'}
//                                     </h2>
//                                     <p className="text-[11px] text-slate-400 font-medium">
//                                         {editingClient ? 'Update connection & contact details' : 'Fill in client info to add to network'}
//                                     </p>
//                                 </div>
//                             </div>
//                             <button
//                                 onClick={() => setIsClientModalOpen(false)}
//                                 className="h-8 w-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition cursor-pointer"
//                             >
//                                 ✕
//                             </button>
//                         </div>

//                         <form onSubmit={handleSaveClient} className="overflow-y-auto p-6 space-y-5 custom-scrollbar">
//                             <div className="space-y-3">
//                                 <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600 border-b border-slate-100 pb-1.5">
//                                     <span className="material-symbols-outlined text-base">badge</span>
//                                     Basic Information
//                                 </div>

//                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
//                                     <div>
//                                         <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
//                                             Client ID <span className="text-rose-500">*</span>
//                                         </label>
//                                         <input
//                                             type="text"
//                                             required
//                                             value={clientForm.clientId}
//                                             onChange={(e) => setClientForm({ ...clientForm, clientId: e.target.value })}
//                                             className="w-full text-xs p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
//                                             placeholder="CLI-2001"
//                                         />
//                                     </div>

//                                     <div className="md:col-span-2">
//                                         <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
//                                             Client Name <span className="text-rose-500">*</span>
//                                         </label>
//                                         <input
//                                             type="text"
//                                             required
//                                             value={clientForm.clientName}
//                                             onChange={(e) => setClientForm({ ...clientForm, clientName: e.target.value })}
//                                             className="w-full text-xs p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
//                                             placeholder="Apex Software Ltd."
//                                         />
//                                     </div>

//                                     <div>
//                                         <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
//                                             Client Phone
//                                         </label>
//                                         <input
//                                             type="text"
//                                             value={clientForm.clientPhone}
//                                             onChange={(e) => setClientForm({ ...clientForm, clientPhone: e.target.value })}
//                                             className="w-full text-xs p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
//                                             placeholder="+88017xxxxxxxx"
//                                         />
//                                     </div>

//                                     <div className="md:col-span-2">
//                                         <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
//                                             Connection Status
//                                         </label>
//                                         <div className="relative flex items-center">
//                                             <span className="absolute left-3 pointer-events-none flex items-center">
//                                                 <span
//                                                     className={`h-2.5 w-2.5 rounded-full ${clientForm.status === 'Connected' ? 'bg-emerald-500' : 'bg-rose-500'
//                                                         }`}
//                                                 ></span>
//                                             </span>
//                                             <select
//                                                 value={clientForm.status}
//                                                 onChange={(e) =>
//                                                     setClientForm({ ...clientForm, status: e.target.value as 'Connected' | 'Disconnected' })
//                                                 }
//                                                 className={`w-full text-xs pl-8 pr-3 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition font-bold ${clientForm.status === 'Connected' ? 'text-emerald-700' : 'text-rose-600'
//                                                     }`}
//                                             >
//                                                 <option value="Connected" className="text-emerald-700 font-medium">
//                                                     Connected
//                                                 </option>
//                                                 <option value="Disconnected" className="text-rose-600 font-medium">
//                                                     Disconnected
//                                                 </option>
//                                             </select>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>

//                             <div className="space-y-3">
//                                 <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600 border-b border-slate-100 pb-1.5">
//                                     <span className="material-symbols-outlined text-base">router</span>
//                                     Network Configurations
//                                 </div>

//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100">
//                                     <div className="space-y-2">
//                                         <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Primary Connection</span>
//                                         <div>
//                                             <label className="block text-[10px] text-slate-500 mb-0.5 font-medium">Primary IP</label>
//                                             <input
//                                                 type="text"
//                                                 value={clientForm.primaryIp}
//                                                 onChange={(e) => setClientForm({ ...clientForm, primaryIp: e.target.value })}
//                                                 className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
//                                                 placeholder="103.145.220.10"
//                                             />
//                                         </div>
//                                         <div>
//                                             <label className="block text-[10px] text-slate-500 mb-0.5 font-medium">Primary ONU MAC/SN</label>
//                                             <input
//                                                 type="text"
//                                                 value={clientForm.primaryOnu}
//                                                 onChange={(e) => setClientForm({ ...clientForm, primaryOnu: e.target.value })}
//                                                 className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
//                                                 placeholder="HWTC12345678"
//                                             />
//                                         </div>
//                                     </div>

//                                     <div className="space-y-2">
//                                         <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Backup Connection</span>
//                                         <div>
//                                             <label className="block text-[10px] text-slate-500 mb-0.5 font-medium">Secondary IP</label>
//                                             <input
//                                                 type="text"
//                                                 value={clientForm.secondaryIp}
//                                                 onChange={(e) => setClientForm({ ...clientForm, secondaryIp: e.target.value })}
//                                                 className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
//                                                 placeholder="103.145.220.11"
//                                             />
//                                         </div>
//                                         <div>
//                                             <label className="block text-[10px] text-slate-500 mb-0.5 font-medium">Secondary ONU MAC/SN</label>
//                                             <input
//                                                 type="text"
//                                                 value={clientForm.secondaryOnu}
//                                                 onChange={(e) => setClientForm({ ...clientForm, secondaryOnu: e.target.value })}
//                                                 className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
//                                                 placeholder="ZTE78901234"
//                                             />
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>

//                             <div className="space-y-3">
//                                 <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600 border-b border-slate-100 pb-1.5">
//                                     <span className="material-symbols-outlined text-base">location_on</span>
//                                     Location & Contact
//                                 </div>

//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
//                                     <div>
//                                         <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
//                                             Point of Contact (POC)
//                                         </label>
//                                         <select
//                                             value={clientForm.pocId}
//                                             onChange={(e) => setClientForm({ ...clientForm, pocId: e.target.value })}
//                                             className="w-full text-xs p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
//                                         >
//                                             <option value="">Select Point of Contact...</option>
//                                             {pocs.map((poc) => (
//                                                 <option key={poc.id} value={poc.id.toString()}>
//                                                     {poc.name}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     </div>

//                                     <div>
//                                         <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
//                                             Location Address
//                                         </label>
//                                         <input
//                                             type="text"
//                                             value={clientForm.location}
//                                             onChange={(e) => setClientForm({ ...clientForm, location: e.target.value })}
//                                             className="w-full text-xs p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
//                                             placeholder="Floor 4, Building B, Agrabad C/A"
//                                         />
//                                     </div>

//                                     <div className="md:col-span-2">
//                                         <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
//                                             Description / Remarks
//                                         </label>
//                                         <textarea
//                                             rows={2}
//                                             value={clientForm.description}
//                                             onChange={(e) => setClientForm({ ...clientForm, description: e.target.value })}
//                                             className="w-full text-xs p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
//                                             placeholder="Additional notes about connectivity or setup..."
//                                         />
//                                     </div>
//                                 </div>
//                             </div>

//                             <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
//                                 <button
//                                     type="button"
//                                     onClick={() => setIsClientModalOpen(false)}
//                                     className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     type="submit"
//                                     className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition cursor-pointer flex items-center gap-1.5"
//                                 >
//                                     <span className="material-symbols-outlined text-base">check</span>
//                                     {editingClient ? 'Update Client' : 'Save Client'}
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             {/* Add / Edit POC Modal */}
//             {isPocModalOpen && (
//                 <div
//                     onClick={() => setIsPocModalOpen(false)}
//                     className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in p-4"
//                 >
//                     <div
//                         onClick={(e) => e.stopPropagation()}
//                         className="w-full max-w-sm transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-300 animate-in zoom-in-95 border border-slate-100 flex flex-col"
//                     >
//                         <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-slate-100">
//                             <div className="flex items-center gap-2.5">
//                                 <div className="h-9 w-9 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
//                                     <span className="material-symbols-outlined text-lg">hub</span>
//                                 </div>
//                                 <div>
//                                     <h2 className="text-sm font-bold text-slate-800 tracking-tight">
//                                         Add Point of Connection
//                                     </h2>
//                                     <p className="text-[10px] text-slate-400 font-medium">POC Details</p>
//                                 </div>
//                             </div>
//                             <button
//                                 onClick={() => setIsPocModalOpen(false)}
//                                 className="h-7 w-7 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition cursor-pointer text-xs"
//                             >
//                                 ✕
//                             </button>
//                         </div>

//                         <form onSubmit={handleAddPoc} className="p-5 space-y-4">
//                             <div>
//                                 <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
//                                     POC Name <span className="text-rose-500">*</span>
//                                 </label>
//                                 <div className="relative flex items-center">
//                                     <span className="absolute left-3 text-slate-400 pointer-events-none flex items-center">
//                                         <span className="material-symbols-outlined text-base">link</span>
//                                     </span>
//                                     <input
//                                         type="text"
//                                         required
//                                         autoFocus
//                                         value={pocForm.name}
//                                         onChange={(e) => setPocForm({ ...pocForm, name: e.target.value })}
//                                         className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition font-medium text-slate-800"
//                                         placeholder="e.g. Agrabad POP Connection"
//                                     />
//                                 </div>
//                             </div>

//                             <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
//                                 <button
//                                     type="button"
//                                     onClick={() => setIsPocModalOpen(false)}
//                                     className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     type="submit"
//                                     className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition cursor-pointer flex items-center gap-1"
//                                 >
//                                     <span className="material-symbols-outlined text-base">check</span>
//                                     Save POC
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}

//         </div>
//     );
// }

// 'use client';

// import React, { useState, useEffect, useMemo } from 'react';
// import { ClientInfo, POC } from '@/types/client';
// import ConfirmDialog from '@/components/ConfirmDialog';
// import ClientDetailsModal from '@/components/ClientDetailsModal';

// export default function ClientInfoPage() {
//     const [clients, setClients] = useState<ClientInfo[]>([]);
//     const [pocs, setPocs] = useState<POC[]>([]);
//     const [isLoading, setIsLoading] = useState(true);

//     // Controls & Filters
//     const [searchQuery, setSearchQuery] = useState('');
//     const [statusFilter, setStatusFilter] =
//         useState<'All' | 'Connected' | 'Disconnected'>('All');
//     const [pocFilter, setPocFilter] = useState<string>('All');
//     const [sortBy, setSortBy] =
//         useState<'newest' | 'oldest' | 'name' | 'clientId'>('newest');
//     const [viewMode, setViewMode] =
//         useState<'table' | 'grid'>('table');

//     // Pagination
//     const [currentPage, setCurrentPage] = useState(1);
//     const itemsPerPage = 20;

//     // Modals
//     const [isClientModalOpen, setIsClientModalOpen] = useState(false);
//     const [isPocModalOpen, setIsPocModalOpen] = useState(false);
//     const [selectedClientForView, setSelectedClientForView] =
//         useState<ClientInfo | null>(null);
//     const [editingClient, setEditingClient] =
//         useState<ClientInfo | null>(null);

//     // Delete
//     const [deleteTargetId, setDeleteTargetId] =
//         useState<string | null>(null);

//     const [copied, setCopied] = useState(false);

//     // Toast
//     type ToastType = 'success' | 'error';

//     const [toast, setToast] = useState<{
//         show: boolean;
//         message: string;
//         type: ToastType;
//     }>({
//         show: false,
//         message: '',
//         type: 'success',
//     });

//     const showToast = (
//         message: string,
//         type: ToastType = 'success'
//     ) => {
//         setToast({
//             show: true,
//             message,
//             type,
//         });

//         setTimeout(() => {
//             setToast((prev) => ({
//                 ...prev,
//                 show: false,
//             }));
//         }, 3000);
//     };

//     // Client Form
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

//     // POC Form
//     const [pocForm, setPocForm] = useState({
//         name: '',
//         phone: '',
//         designation: '',
//     });

//     // --------------------------------------------------
//     // Load Data
//     // --------------------------------------------------
//     useEffect(() => {
//         const fetchInitialData = async () => {
//             setIsLoading(true);

//             try {
//                 const [pocsRes, clientsRes] = await Promise.all([
//                     fetch('/api/pocs', {
//                         cache: 'no-store',
//                     }),
//                     fetch('/api/clients', {
//                         cache: 'no-store',
//                     }),
//                 ]);

//                 if (pocsRes.ok) {
//                     const pocsData = await pocsRes.json();

//                     const normalizedPocs =
//                         Array.isArray(pocsData)
//                             ? pocsData
//                             : pocsData?.pocs || pocsData?.data || [];

//                     setPocs(normalizedPocs);
//                 }

//                 if (clientsRes.ok) {
//                     const clientsData = await clientsRes.json();

//                     const normalizedClients =
//                         Array.isArray(clientsData)
//                             ? clientsData
//                             : clientsData?.clients ||
//                             clientsData?.data ||
//                             [];

//                     setClients(normalizedClients);
//                 }
//             } catch (error) {
//                 console.error(
//                     'Error fetching data from database:',
//                     error
//                 );

//                 showToast(
//                     'Failed to load client information.',
//                     'error'
//                 );
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         fetchInitialData();
//     }, []);

//     // --------------------------------------------------
//     // Copy Client Information
//     // --------------------------------------------------
//     const handleCopyClientInfo = async (client: ClientInfo) => {
//         const pocInfo = pocs.find(
//             (p) =>
//                 p.id.toString() ===
//                 client.pocId?.toString()
//         );

//         const pocText = pocInfo
//             ? pocInfo.name
//             : client.pocName || 'N/A';

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

//             showToast(
//                 'Client information copied!',
//                 'success'
//             );

//             setTimeout(() => {
//                 setCopied(false);
//             }, 2000);
//         } catch (error) {
//             console.error(
//                 'Failed to copy client information:',
//                 error
//             );

//             showToast(
//                 'Failed to copy client information.',
//                 'error'
//             );
//         }
//     };

//     // --------------------------------------------------
//     // Filter & Sort
//     // --------------------------------------------------
//     const filteredClients = useMemo(() => {
//         return clients
//             .filter((client) => {
//                 const q = searchQuery
//                     .toLowerCase()
//                     .trim();

//                 const matchesSearch =
//                     !q ||
//                     client.clientId
//                         ?.toLowerCase()
//                         .includes(q) ||
//                     client.clientName
//                         ?.toLowerCase()
//                         .includes(q) ||
//                     client.clientPhone
//                         ?.toLowerCase()
//                         .includes(q) ||
//                     client.primaryIp
//                         ?.toLowerCase()
//                         .includes(q) ||
//                     client.location
//                         ?.toLowerCase()
//                         .includes(q) ||
//                     client.pocName
//                         ?.toLowerCase()
//                         .includes(q);

//                 const matchesStatus =
//                     statusFilter === 'All' ||
//                     client.status === statusFilter;

//                 const matchesPoc =
//                     pocFilter === 'All' ||
//                     client.pocId?.toString() ===
//                     pocFilter;

//                 return (
//                     matchesSearch &&
//                     matchesStatus &&
//                     matchesPoc
//                 );
//             })
//             .sort((a, b) => {
//                 if (sortBy === 'newest') {
//                     return Number(b.id) - Number(a.id);
//                 }

//                 if (sortBy === 'oldest') {
//                     return Number(a.id) - Number(b.id);
//                 }

//                 if (sortBy === 'name') {
//                     return (
//                         a.clientName || ''
//                     ).localeCompare(
//                         b.clientName || ''
//                     );
//                 }

//                 if (sortBy === 'clientId') {
//                     return (
//                         a.clientId || ''
//                     ).localeCompare(
//                         b.clientId || ''
//                     );
//                 }

//                 return 0;
//             });
//     }, [
//         clients,
//         searchQuery,
//         statusFilter,
//         pocFilter,
//         sortBy,
//     ]);

//     // Reset pagination when filters change
//     useEffect(() => {
//         setCurrentPage(1);
//     }, [
//         searchQuery,
//         statusFilter,
//         pocFilter,
//         sortBy,
//     ]);

//     // --------------------------------------------------
//     // Pagination
//     // --------------------------------------------------
//     const totalPages =
//         Math.ceil(
//             filteredClients.length /
//             itemsPerPage
//         ) || 1;

//     const paginatedClients = useMemo(() => {
//         const start =
//             (currentPage - 1) *
//             itemsPerPage;

//         return filteredClients.slice(
//             start,
//             start + itemsPerPage
//         );
//     }, [
//         filteredClients,
//         currentPage,
//     ]);

//     // --------------------------------------------------
//     // Open Edit Modal
//     // --------------------------------------------------
//     const handleOpenEditModal = (
//         client: ClientInfo,
//         e?: React.MouseEvent
//     ) => {
//         if (e) {
//             e.stopPropagation();
//         }

//         setEditingClient(client);

//         setClientForm({
//             clientId: client.clientId || '',
//             clientName: client.clientName || '',
//             clientPhone: client.clientPhone || '',
//             primaryIp: client.primaryIp || '',
//             primaryOnu: client.primaryOnu || '',
//             secondaryIp:
//                 client.secondaryIp || '',
//             secondaryOnu:
//                 client.secondaryOnu || '',
//             location: client.location || '',
//             pocId:
//                 client.pocId?.toString() || '',
//             status:
//                 client.status || 'Connected',
//             description:
//                 client.description || '',
//         });

//         setIsClientModalOpen(true);
//     };

//     // --------------------------------------------------
//     // Open Add Modal
//     // --------------------------------------------------
//     const handleOpenAddModal = () => {
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

//     // --------------------------------------------------
//     // Trigger Delete
//     // --------------------------------------------------
//     const triggerDelete = (
//         id: string,
//         e?: React.MouseEvent
//     ) => {
//         if (e) {
//             e.stopPropagation();
//         }

//         setDeleteTargetId(id);
//     };

//     // --------------------------------------------------
//     // Delete Client
//     // --------------------------------------------------
//     const confirmDelete = async () => {
//         if (!deleteTargetId) {
//             return;
//         }

//         const idToDelete =
//             deleteTargetId;

//         try {
//             const res = await fetch(
//                 `/api/clients/${idToDelete}`,
//                 {
//                     method: 'DELETE',
//                 }
//             );

//             const data =
//                 await res.json().catch(
//                     () => null
//                 );

//             if (!res.ok) {
//                 showToast(
//                     data?.error ||
//                     'Failed to delete client.',
//                     'error'
//                 );
//                 return;
//             }

//             setClients((prev) =>
//                 prev.filter(
//                     (client) =>
//                         client.id
//                             .toString() !==
//                         idToDelete.toString()
//                 )
//             );

//             if (
//                 selectedClientForView?.id
//                     .toString() ===
//                 idToDelete.toString()
//             ) {
//                 setSelectedClientForView(null);
//             }

//             showToast(
//                 'Client deleted successfully!',
//                 'success'
//             );
//         } catch (error) {
//             console.error(
//                 'Error deleting client:',
//                 error
//             );

//             showToast(
//                 'Failed to delete client.',
//                 'error'
//             );
//         } finally {
//             setDeleteTargetId(null);
//         }
//     };

//     // --------------------------------------------------
//     // Add POC
//     // --------------------------------------------------
//     const handleAddPoc = async (
//         e: React.FormEvent
//     ) => {
//         e.preventDefault();

//         if (!pocForm.name.trim()) {
//             showToast(
//                 'POC name is required!',
//                 'error'
//             );
//             return;
//         }

//         try {
//             const res = await fetch(
//                 '/api/pocs',
//                 {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type':
//                             'application/json',
//                     },
//                     body: JSON.stringify({
//                         name:
//                             pocForm.name.trim(),
//                     }),
//                 }
//             );

//             const data =
//                 await res.json();

//             if (!res.ok) {
//                 showToast(
//                     data?.error ||
//                     'Failed to add POC.',
//                     'error'
//                 );
//                 return;
//             }

//             const newPoc =
//                 data?.poc ||
//                 data?.data ||
//                 data;

//             setPocs((prev) => [
//                 newPoc,
//                 ...prev,
//             ]);

//             setPocForm({
//                 name: '',
//                 phone: '',
//                 designation: '',
//             });

//             setIsPocModalOpen(false);

//             showToast(
//                 'POC added successfully!',
//                 'success'
//             );
//         } catch (error) {
//             console.error(
//                 'Error saving POC:',
//                 error
//             );

//             showToast(
//                 'Database request failed.',
//                 'error'
//             );
//         }
//     };

//     // --------------------------------------------------
//     // Save / Update Client
//     // --------------------------------------------------
//     const handleSaveClient = async (
//         e: React.FormEvent
//     ) => {
//         e.preventDefault();

//         if (
//             !clientForm.clientId.trim() ||
//             !clientForm.clientName.trim()
//         ) {
//             showToast(
//                 'Client ID and Name are required!',
//                 'error'
//             );
//             return;
//         }

//         const selectedPoc =
//             pocs.find(
//                 (p) =>
//                     p.id.toString() ===
//                     clientForm.pocId.toString()
//             );

//         try {
//             const url = editingClient
//                 ? `/api/clients/${editingClient.id}`
//                 : '/api/clients';

//             const method = editingClient
//                 ? 'PUT'
//                 : 'POST';

//             const res = await fetch(
//                 url,
//                 {
//                     method,
//                     headers: {
//                         'Content-Type':
//                             'application/json',
//                     },
//                     body: JSON.stringify({
//                         ...clientForm,
//                         pocName:
//                             selectedPoc?.name ||
//                             'N/A',
//                     }),
//                 }
//             );

//             const data =
//                 await res.json();

//             if (!res.ok) {
//                 showToast(
//                     data?.error ||
//                     'Failed to save client.',
//                     'error'
//                 );
//                 return;
//             }

//             const savedClient =
//                 data?.client ||
//                 data?.data ||
//                 data;

//             if (editingClient) {
//                 setClients((prev) =>
//                     prev.map((client) =>
//                         client.id
//                             .toString() ===
//                             editingClient.id
//                                 .toString()
//                             ? savedClient
//                             : client
//                     )
//                 );

//                 showToast(
//                     'Client updated successfully!',
//                     'success'
//                 );
//             } else {
//                 setClients((prev) => [
//                     savedClient,
//                     ...prev,
//                 ]);

//                 setCurrentPage(1);

//                 showToast(
//                     'Client added successfully!',
//                     'success'
//                 );
//             }

//             setIsClientModalOpen(false);
//             setEditingClient(null);
//         } catch (error) {
//             console.error(
//                 'Error saving client:',
//                 error
//             );

//             showToast(
//                 'Database request failed.',
//                 'error'
//             );
//         }
//     };

//     return (
//         <div className="min-h-screen bg-slate-900/5 text-slate-800 p-3 sm:p-6 lg:p-8">

//             {/* Toast */}
//             {toast.show && (
//                 <div
//                     className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 min-w-[280px] max-w-[400px] px-4 py-3 rounded-xl shadow-2xl border ${toast.type === 'success'
//                         ? 'bg-white border-emerald-200 text-emerald-700'
//                         : 'bg-white border-red-200 text-red-700'
//                         }`}
//                 >
//                     <span className="material-symbols-outlined text-xl">
//                         {toast.type === 'success'
//                             ? 'check_circle'
//                             : 'error'}
//                     </span>

//                     <div className="flex-1">
//                         <p className="text-sm font-semibold">
//                             {toast.message}
//                         </p>
//                     </div>

//                     <button
//                         type="button"
//                         onClick={() =>
//                             setToast(
//                                 (prev) => ({
//                                     ...prev,
//                                     show: false,
//                                 })
//                             )
//                         }
//                         className="text-slate-400 hover:text-slate-700 cursor-pointer"
//                     >
//                         <span className="material-symbols-outlined text-lg">
//                             close
//                         </span>
//                     </button>
//                 </div>
//             )}

//             <div className="max-w-7xl mx-auto space-y-6">

//                 {/* Header */}
//                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
//                     <div>
//                         <div className="flex items-center gap-2">
//                             <span className="material-symbols-outlined text-teal-600 text-2xl">
//                                 hub
//                             </span>

//                             <h1 className="text-xl font-bold text-slate-900 tracking-tight">
//                                 Client Directory
//                             </h1>
//                         </div>

//                         <p className="text-xs text-slate-500 mt-0.5">
//                             Manage network connections and client profiles
//                         </p>
//                     </div>

//                     <div className="flex items-center gap-2.5">
//                         <button
//                             onClick={() =>
//                                 setIsPocModalOpen(true)
//                             }
//                             className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
//                         >
//                             <span className="material-symbols-outlined text-base">
//                                 person_add
//                             </span>
//                             Add POC
//                         </button>

//                         <button
//                             onClick={
//                                 handleOpenAddModal
//                             }
//                             className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition shadow-sm hover:shadow flex items-center gap-1.5 cursor-pointer"
//                         >
//                             <span className="material-symbols-outlined text-base">
//                                 add_circle
//                             </span>
//                             New Client Entry
//                         </button>
//                     </div>
//                 </div>

//                 {/* Stats */}
//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

//                     <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
//                         <div>
//                             <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
//                                 Total Clients
//                             </p>

//                             <h3 className="text-2xl font-black text-slate-800 mt-1">
//                                 {clients.length}
//                             </h3>
//                         </div>

//                         <div className="h-10 w-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center font-bold">
//                             <span className="material-symbols-outlined">
//                                 lan
//                             </span>
//                         </div>
//                     </div>

//                     <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
//                         <div>
//                             <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
//                                 Connected
//                             </p>

//                             <h3 className="text-2xl font-black text-emerald-600 mt-1">
//                                 {
//                                     clients.filter(
//                                         (c) =>
//                                             c.status ===
//                                             'Connected'
//                                     ).length
//                                 }
//                             </h3>
//                         </div>

//                         <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
//                             <span className="material-symbols-outlined">
//                                 check_circle
//                             </span>
//                         </div>
//                     </div>

//                     <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
//                         <div>
//                             <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
//                                 Disconnected
//                             </p>

//                             <h3 className="text-2xl font-black text-rose-600 mt-1">
//                                 {
//                                     clients.filter(
//                                         (c) =>
//                                             c.status ===
//                                             'Disconnected'
//                                     ).length
//                                 }
//                             </h3>
//                         </div>

//                         <div className="h-10 w-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center font-bold">
//                             <span className="material-symbols-outlined">
//                                 power_off
//                             </span>
//                         </div>
//                     </div>

//                 </div>

//                 {/* Filters */}
//                 <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">

//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">

//                         <div className="lg:col-span-5 relative">
//                             <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-lg">
//                                 search
//                             </span>

//                             <input
//                                 type="text"
//                                 value={
//                                     searchQuery
//                                 }
//                                 onChange={(e) =>
//                                     setSearchQuery(
//                                         e.target
//                                             .value
//                                     )
//                                 }
//                                 placeholder="Search Client ID, Name, Phone, Location..."
//                                 className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
//                             />
//                         </div>

//                         <div className="lg:col-span-2">
//                             <select
//                                 value={
//                                     statusFilter
//                                 }
//                                 onChange={(e) =>
//                                     setStatusFilter(
//                                         e.target
//                                             .value as
//                                         | 'All'
//                                         | 'Connected'
//                                         | 'Disconnected'
//                                     )
//                                 }
//                                 className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl"
//                             >
//                                 <option value="All">
//                                     All Statuses
//                                 </option>

//                                 <option value="Connected">
//                                     Connected
//                                 </option>

//                                 <option value="Disconnected">
//                                     Disconnected
//                                 </option>
//                             </select>
//                         </div>

//                         <div className="lg:col-span-2">
//                             <select
//                                 value={
//                                     pocFilter
//                                 }
//                                 onChange={(e) =>
//                                     setPocFilter(
//                                         e.target
//                                             .value
//                                     )
//                                 }
//                                 className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl"
//                             >
//                                 <option value="All">
//                                     All POCs
//                                 </option>

//                                 {pocs.map(
//                                     (poc) => (
//                                         <option
//                                             key={
//                                                 poc.id
//                                             }
//                                             value={poc.id.toString()}
//                                         >
//                                             {
//                                                 poc.name
//                                             }
//                                         </option>
//                                     )
//                                 )}
//                             </select>
//                         </div>

//                         <div className="lg:col-span-2">
//                             <select
//                                 value={sortBy}
//                                 onChange={(e) =>
//                                     setSortBy(
//                                         e.target
//                                             .value as
//                                         | 'newest'
//                                         | 'oldest'
//                                         | 'name'
//                                         | 'clientId'
//                                     )
//                                 }
//                                 className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl"
//                             >
//                                 <option value="newest">
//                                     Sort: Newest First
//                                 </option>

//                                 <option value="oldest">
//                                     Sort: Oldest First
//                                 </option>

//                                 <option value="name">
//                                     Sort: Client Name
//                                 </option>

//                                 <option value="clientId">
//                                     Sort: Client ID
//                                 </option>
//                             </select>
//                         </div>

//                         <div className="lg:col-span-1 flex items-center justify-end gap-1 bg-slate-100 p-1 rounded-xl">

//                             <button
//                                 onClick={() =>
//                                     setViewMode(
//                                         'table'
//                                     )
//                                 }
//                                 className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${viewMode ===
//                                     'table'
//                                     ? 'bg-white shadow-2xs text-teal-700 font-bold'
//                                     : 'text-slate-500'
//                                     }`}
//                             >
//                                 <span className="material-symbols-outlined text-base">
//                                     table_rows
//                                 </span>
//                             </button>

//                             <button
//                                 onClick={() =>
//                                     setViewMode(
//                                         'grid'
//                                     )
//                                 }
//                                 className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${viewMode ===
//                                     'grid'
//                                     ? 'bg-white shadow-2xs text-teal-700 font-bold'
//                                     : 'text-slate-500'
//                                     }`}
//                             >
//                                 <span className="material-symbols-outlined text-base">
//                                     grid_view
//                                 </span>
//                             </button>

//                         </div>

//                     </div>

//                 </div>

//                 {/* Content */}
//                 {isLoading ? (
//                     <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
//                         <p className="text-xs text-teal-600 font-medium">
//                             Loading data from Aiven Database...
//                         </p>
//                     </div>
//                 ) : paginatedClients.length ===
//                     0 ? (
//                     <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80">
//                         <p className="text-xs text-slate-400">
//                             No client records found.
//                         </p>
//                     </div>
//                 ) : viewMode ===
//                     'table' ? (
//                     <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">

//                         <div className="overflow-x-auto">
//                             <table className="w-full text-left border-collapse">

//                                 <thead>
//                                     <tr className="bg-slate-50/80 border-b border-slate-200/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
//                                         <th className="py-3.5 px-4">
//                                             Client Details
//                                         </th>

//                                         <th className="py-3.5 px-4">
//                                             Phone
//                                         </th>

//                                         <th className="py-3.5 px-4">
//                                             Primary Link
//                                         </th>

//                                         <th className="py-3.5 px-4">
//                                             Secondary Link
//                                         </th>

//                                         <th className="py-3.5 px-4">
//                                             Location
//                                         </th>

//                                         <th className="py-3.5 px-4">
//                                             POC Name
//                                         </th>

//                                         <th className="py-3.5 px-4">
//                                             Status
//                                         </th>

//                                         <th className="py-3.5 px-4 text-right">
//                                             Actions
//                                         </th>
//                                     </tr>
//                                 </thead>

//                                 <tbody className="divide-y divide-slate-100 text-xs">

//                                     {paginatedClients.map(
//                                         (client) => (
//                                             <tr
//                                                 key={
//                                                     client.id
//                                                 }
//                                                 onClick={() =>
//                                                     setSelectedClientForView(
//                                                         client
//                                                     )
//                                                 }
//                                                 className="hover:bg-slate-50/80 transition cursor-pointer"
//                                             >

//                                                 <td className="py-3 px-4">
//                                                     <div className="font-semibold text-slate-800">
//                                                         {
//                                                             client.clientName
//                                                         }
//                                                     </div>

//                                                     <div className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-500 border">
//                                                         {
//                                                             client.clientId
//                                                         }
//                                                     </div>
//                                                 </td>

//                                                 <td className="py-3 px-4 font-mono text-slate-700">
//                                                     {
//                                                         client.clientPhone ||
//                                                         '-'
//                                                     }
//                                                 </td>

//                                                 <td className="py-3 px-4 font-mono">
//                                                     <div className="text-slate-700 font-medium">
//                                                         IP:{' '}
//                                                         {
//                                                             client.primaryIp ||
//                                                             '-'
//                                                         }
//                                                     </div>

//                                                     <div className="text-[10px] text-slate-400">
//                                                         ONU:{' '}
//                                                         {
//                                                             client.primaryOnu ||
//                                                             '-'
//                                                         }
//                                                     </div>
//                                                 </td>

//                                                 <td className="py-3 px-4 font-mono">
//                                                     <div className="text-slate-700 font-medium">
//                                                         IP:{' '}
//                                                         {
//                                                             client.secondaryIp ||
//                                                             '-'
//                                                         }
//                                                     </div>

//                                                     <div className="text-[10px] text-slate-400">
//                                                         ONU:{' '}
//                                                         {
//                                                             client.secondaryOnu ||
//                                                             '-'
//                                                         }
//                                                     </div>
//                                                 </td>

//                                                 <td className="py-3 px-4 text-slate-600 max-w-[150px]">
//                                                     <div
//                                                         className="truncate font-medium text-slate-700"
//                                                         title={
//                                                             client.location ||
//                                                             ''
//                                                         }
//                                                     >
//                                                         {
//                                                             client.location ||
//                                                             '-'
//                                                         }
//                                                     </div>
//                                                 </td>

//                                                 <td className="py-3 px-4 text-slate-700 font-medium max-w-[120px]">
//                                                     <div className="truncate">
//                                                         {
//                                                             client.pocName ||
//                                                             '-'
//                                                         }
//                                                     </div>
//                                                 </td>

//                                                 <td className="py-3 px-4">
//                                                     <span
//                                                         className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${client.status ===
//                                                             'Connected'
//                                                             ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
//                                                             : 'bg-rose-50 text-rose-700 border border-rose-200'
//                                                             }`}
//                                                     >
//                                                         {
//                                                             client.status
//                                                         }
//                                                     </span>
//                                                 </td>

//                                                 <td className="py-3 px-4 text-right whitespace-nowrap">
//                                                     <div className="flex items-center justify-end gap-1">

//                                                         <button
//                                                             onClick={(
//                                                                 e
//                                                             ) =>
//                                                                 handleOpenEditModal(
//                                                                     client,
//                                                                     e
//                                                                 )
//                                                             }
//                                                             className="p-1.5 hover:bg-teal-50 rounded-lg text-slate-500 hover:text-teal-700 transition"
//                                                         >
//                                                             <span className="material-symbols-outlined text-base">
//                                                                 edit
//                                                             </span>
//                                                         </button>

//                                                         <button
//                                                             onClick={(
//                                                                 e
//                                                             ) =>
//                                                                 triggerDelete(
//                                                                     client.id.toString(),
//                                                                     e
//                                                                 )
//                                                             }
//                                                             className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-500 hover:text-rose-600 transition"
//                                                         >
//                                                             <span className="material-symbols-outlined text-base">
//                                                                 delete
//                                                             </span>
//                                                         </button>

//                                                     </div>
//                                                 </td>

//                                             </tr>
//                                         )
//                                     )}

//                                 </tbody>
//                             </table>
//                         </div>

//                     </div>
//                 ) : (
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

//                         {paginatedClients.map(
//                             (client) => (
//                                 <div
//                                     key={
//                                         client.id
//                                     }
//                                     onClick={() =>
//                                         setSelectedClientForView(
//                                             client
//                                         )
//                                     }
//                                     className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition space-y-3 cursor-pointer"
//                                 >

//                                     <div className="flex items-start justify-between">

//                                         <div>
//                                             <h3 className="font-bold text-slate-800 text-sm">
//                                                 {
//                                                     client.clientName
//                                                 }
//                                             </h3>

//                                             <div className="flex items-center gap-1.5 mt-1">

//                                                 <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-500 border">
//                                                     {
//                                                         client.clientId
//                                                     }
//                                                 </span>

//                                                 {client.clientPhone && (
//                                                     <span className="inline-block px-1.5 py-0.5 rounded bg-teal-50 font-mono text-[10px] text-teal-700 border border-teal-100">
//                                                         {
//                                                             client.clientPhone
//                                                         }
//                                                     </span>
//                                                 )}

//                                             </div>
//                                         </div>

//                                         <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
//                                             {
//                                                 client.status
//                                             }
//                                         </span>

//                                     </div>

//                                     <div className="text-xs space-y-1 text-slate-600">
//                                         <div className="truncate font-medium">
//                                             Location:{' '}
//                                             {
//                                                 client.location ||
//                                                 'N/A'
//                                             }
//                                         </div>

//                                         <div className="truncate font-medium">
//                                             POC:{' '}
//                                             {
//                                                 client.pocName ||
//                                                 'N/A'
//                                             }
//                                         </div>
//                                     </div>

//                                     <div className="flex justify-end gap-2 pt-2 border-t">

//                                         <button
//                                             onClick={(
//                                                 e
//                                             ) =>
//                                                 handleOpenEditModal(
//                                                     client,
//                                                     e
//                                                 )
//                                             }
//                                             className="px-2.5 py-1 text-xs bg-slate-100 rounded-lg"
//                                         >
//                                             Edit
//                                         </button>

//                                         <button
//                                             onClick={(
//                                                 e
//                                             ) =>
//                                                 triggerDelete(
//                                                     client.id.toString(),
//                                                     e
//                                                 )
//                                             }
//                                             className="px-2.5 py-1 text-xs bg-rose-50 text-rose-600 rounded-lg"
//                                         >
//                                             Delete
//                                         </button>

//                                     </div>

//                                 </div>
//                             )
//                         )}

//                     </div>
//                 )}

//                 {/* Pagination */}
//                 {totalPages > 1 && (
//                     <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-200/80">

//                         <p className="text-xs text-slate-500">
//                             Showing{' '}
//                             <span className="font-semibold text-slate-700">
//                                 {(currentPage -
//                                     1) *
//                                     itemsPerPage +
//                                     1}
//                             </span>{' '}
//                             to{' '}
//                             <span className="font-semibold text-slate-700">
//                                 {Math.min(
//                                     currentPage *
//                                     itemsPerPage,
//                                     filteredClients.length
//                                 )}
//                             </span>{' '}
//                             of{' '}
//                             <span className="font-semibold text-slate-700">
//                                 {
//                                     filteredClients.length
//                                 }
//                             </span>{' '}
//                             clients
//                         </p>

//                         <div className="flex items-center gap-1">

//                             <button
//                                 disabled={
//                                     currentPage ===
//                                     1
//                                 }
//                                 onClick={() =>
//                                     setCurrentPage(
//                                         (prev) =>
//                                             Math.max(
//                                                 prev -
//                                                 1,
//                                                 1
//                                             )
//                                     )
//                                 }
//                                 className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
//                             >
//                                 Previous
//                             </button>

//                             {Array.from(
//                                 {
//                                     length: totalPages,
//                                 },
//                                 (_, i) =>
//                                     i + 1
//                             ).map(
//                                 (page) => (
//                                     <button
//                                         key={page}
//                                         onClick={() =>
//                                             setCurrentPage(
//                                                 page
//                                             )
//                                         }
//                                         className={`px-3 py-1.5 text-xs font-semibold rounded-xl cursor-pointer ${currentPage ===
//                                             page
//                                             ? 'bg-teal-600 text-white'
//                                             : 'text-slate-600 hover:bg-slate-50'
//                                             }`}
//                                     >
//                                         {page}
//                                     </button>
//                                 )
//                             )}

//                             <button
//                                 disabled={
//                                     currentPage ===
//                                     totalPages
//                                 }
//                                 onClick={() =>
//                                     setCurrentPage(
//                                         (prev) =>
//                                             Math.min(
//                                                 prev +
//                                                 1,
//                                                 totalPages
//                                             )
//                                     )
//                                 }
//                                 className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
//                             >
//                                 Next
//                             </button>

//                         </div>
//                     </div>
//                 )}

//             </div>

//             {/* Client Details Modal */}
//             <ClientDetailsModal
//                 client={
//                     selectedClientForView
//                 }
//                 onClose={() =>
//                     setSelectedClientForView(
//                         null
//                     )
//                 }
//                 onEdit={(client) =>
//                     handleOpenEditModal(
//                         client
//                     )
//                 }
//             />

//             {/* Confirm Delete */}
//             <ConfirmDialog
//                 isOpen={!!deleteTargetId}
//                 title="Delete Client Record?"
//                 message="Are you sure you want to remove this client? This action cannot be undone."
//                 onConfirm={
//                     confirmDelete
//                 }
//                 onCancel={() =>
//                     setDeleteTargetId(
//                         null
//                     )
//                 }
//             />

//             {/* Add / Edit Client Modal */}
//             {isClientModalOpen && (
//                 <div
//                     onClick={() =>
//                         setIsClientModalOpen(
//                             false
//                         )
//                     }
//                     className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in p-4"
//                 >
//                     <div
//                         onClick={(e) =>
//                             e.stopPropagation()
//                         }
//                         className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white shadow-xl transition-all duration-300 animate-in zoom-in-95 max-h-[90vh] flex flex-col border border-slate-100"
//                     >

//                         <div className="flex justify-between items-center px-6 py-5 bg-white border-b border-slate-100">

//                             <div className="flex items-center gap-3">

//                                 <div className="h-10 w-10 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center">
//                                     <span className="material-symbols-outlined text-xl">
//                                         {editingClient
//                                             ? 'edit_note'
//                                             : 'person_add'}
//                                     </span>
//                                 </div>

//                                 <div>
//                                     <h2 className="text-base font-bold text-slate-800 tracking-tight">
//                                         {editingClient
//                                             ? 'Edit Client Record'
//                                             : 'New Client Registration'}
//                                     </h2>

//                                     <p className="text-[11px] text-slate-400 font-medium">
//                                         {editingClient
//                                             ? 'Update connection & contact details'
//                                             : 'Fill in client info to add to network'}
//                                     </p>
//                                 </div>

//                             </div>

//                             <button
//                                 onClick={() =>
//                                     setIsClientModalOpen(
//                                         false
//                                     )
//                                 }
//                                 className="h-8 w-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition cursor-pointer"
//                             >
//                                 ✕
//                             </button>

//                         </div>

//                         <form
//                             onSubmit={
//                                 handleSaveClient
//                             }
//                             className="overflow-y-auto p-6 space-y-5 custom-scrollbar"
//                         >

//                             {/* Basic Information */}
//                             <div className="space-y-3">

//                                 <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600 border-b border-slate-100 pb-1.5">
//                                     <span className="material-symbols-outlined text-base">
//                                         badge
//                                     </span>
//                                     Basic Information
//                                 </div>

//                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">

//                                     <div>
//                                         <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
//                                             Client ID{' '}
//                                             <span className="text-rose-500">
//                                                 *
//                                             </span>
//                                         </label>

//                                         <input
//                                             type="text"
//                                             required
//                                             value={
//                                                 clientForm.clientId
//                                             }
//                                             onChange={(
//                                                 e
//                                             ) =>
//                                                 setClientForm(
//                                                     {
//                                                         ...clientForm,
//                                                         clientId:
//                                                             e
//                                                                 .target
//                                                                 .value,
//                                                     }
//                                                 )
//                                             }
//                                             className="w-full text-xs p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
//                                             placeholder="CLI-2001"
//                                         />
//                                     </div>

//                                     <div className="md:col-span-2">

//                                         <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
//                                             Client Name{' '}
//                                             <span className="text-rose-500">
//                                                 *
//                                             </span>
//                                         </label>

//                                         <input
//                                             type="text"
//                                             required
//                                             value={
//                                                 clientForm.clientName
//                                             }
//                                             onChange={(
//                                                 e
//                                             ) =>
//                                                 setClientForm(
//                                                     {
//                                                         ...clientForm,
//                                                         clientName:
//                                                             e
//                                                                 .target
//                                                                 .value,
//                                                     }
//                                                 )
//                                             }
//                                             className="w-full text-xs p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
//                                             placeholder="Apex Software Ltd."
//                                         />
//                                     </div>

//                                     <div>

//                                         <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
//                                             Client Phone
//                                         </label>

//                                         <input
//                                             type="text"
//                                             value={
//                                                 clientForm.clientPhone
//                                             }
//                                             onChange={(
//                                                 e
//                                             ) =>
//                                                 setClientForm(
//                                                     {
//                                                         ...clientForm,
//                                                         clientPhone:
//                                                             e
//                                                                 .target
//                                                                 .value,
//                                                     }
//                                                 )
//                                             }
//                                             className="w-full text-xs p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
//                                             placeholder="+88017xxxxxxxx"
//                                         />
//                                     </div>

//                                     <div className="md:col-span-2">

//                                         <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
//                                             Connection Status
//                                         </label>

//                                         <div className="relative flex items-center">

//                                             <span className="absolute left-3 pointer-events-none flex items-center">

//                                                 <span
//                                                     className={`h-2.5 w-2.5 rounded-full ${clientForm.status ===
//                                                         'Connected'
//                                                         ? 'bg-emerald-500'
//                                                         : 'bg-rose-500'
//                                                         }`}
//                                                 ></span>

//                                             </span>

//                                             <select
//                                                 value={
//                                                     clientForm.status
//                                                 }
//                                                 onChange={(
//                                                     e
//                                                 ) =>
//                                                     setClientForm(
//                                                         {
//                                                             ...clientForm,
//                                                             status:
//                                                                 e
//                                                                     .target
//                                                                     .value as
//                                                                 | 'Connected'
//                                                                 | 'Disconnected',
//                                                         }
//                                                     )
//                                                 }
//                                                 className={`w-full text-xs pl-8 pr-3 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition font-bold ${clientForm.status ===
//                                                     'Connected'
//                                                     ? 'text-emerald-700'
//                                                     : 'text-rose-600'
//                                                     }`}
//                                             >
//                                                 <option value="Connected">
//                                                     Connected
//                                                 </option>

//                                                 <option value="Disconnected">
//                                                     Disconnected
//                                                 </option>
//                                             </select>

//                                         </div>
//                                     </div>

//                                 </div>
//                             </div>

//                             {/* Network */}
//                             <div className="space-y-3">

//                                 <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600 border-b border-slate-100 pb-1.5">
//                                     <span className="material-symbols-outlined text-base">
//                                         router
//                                     </span>
//                                     Network Configurations
//                                 </div>

//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100">

//                                     <div className="space-y-2">

//                                         <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
//                                             Primary Connection
//                                         </span>

//                                         <div>
//                                             <label className="block text-[10px] text-slate-500 mb-0.5 font-medium">
//                                                 Primary IP
//                                             </label>

//                                             <input
//                                                 type="text"
//                                                 value={
//                                                     clientForm.primaryIp
//                                                 }
//                                                 onChange={(
//                                                     e
//                                                 ) =>
//                                                     setClientForm(
//                                                         {
//                                                             ...clientForm,
//                                                             primaryIp:
//                                                                 e
//                                                                     .target
//                                                                     .value,
//                                                         }
//                                                     )
//                                                 }
//                                                 className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
//                                                 placeholder="103.145.220.10"
//                                             />
//                                         </div>

//                                         <div>
//                                             <label className="block text-[10px] text-slate-500 mb-0.5 font-medium">
//                                                 Primary ONU MAC/SN
//                                             </label>

//                                             <input
//                                                 type="text"
//                                                 value={
//                                                     clientForm.primaryOnu
//                                                 }
//                                                 onChange={(
//                                                     e
//                                                 ) =>
//                                                     setClientForm(
//                                                         {
//                                                             ...clientForm,
//                                                             primaryOnu:
//                                                                 e
//                                                                     .target
//                                                                     .value,
//                                                         }
//                                                     )
//                                                 }
//                                                 className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
//                                                 placeholder="HWTC12345678"
//                                             />
//                                         </div>

//                                     </div>

//                                     <div className="space-y-2">

//                                         <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
//                                             Backup Connection
//                                         </span>

//                                         <div>
//                                             <label className="block text-[10px] text-slate-500 mb-0.5 font-medium">
//                                                 Secondary IP
//                                             </label>

//                                             <input
//                                                 type="text"
//                                                 value={
//                                                     clientForm.secondaryIp
//                                                 }
//                                                 onChange={(
//                                                     e
//                                                 ) =>
//                                                     setClientForm(
//                                                         {
//                                                             ...clientForm,
//                                                             secondaryIp:
//                                                                 e
//                                                                     .target
//                                                                     .value,
//                                                         }
//                                                     )
//                                                 }
//                                                 className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
//                                                 placeholder="103.145.220.11"
//                                             />
//                                         </div>

//                                         <div>
//                                             <label className="block text-[10px] text-slate-500 mb-0.5 font-medium">
//                                                 Secondary ONU MAC/SN
//                                             </label>

//                                             <input
//                                                 type="text"
//                                                 value={
//                                                     clientForm.secondaryOnu
//                                                 }
//                                                 onChange={(
//                                                     e
//                                                 ) =>
//                                                     setClientForm(
//                                                         {
//                                                             ...clientForm,
//                                                             secondaryOnu:
//                                                                 e
//                                                                     .target
//                                                                     .value,
//                                                         }
//                                                     )
//                                                 }
//                                                 className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
//                                                 placeholder="ZTE78901234"
//                                             />
//                                         </div>

//                                     </div>

//                                 </div>
//                             </div>

//                             {/* Location */}
//                             <div className="space-y-3">

//                                 <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600 border-b border-slate-100 pb-1.5">
//                                     <span className="material-symbols-outlined text-base">
//                                         location_on
//                                     </span>
//                                     Location & Contact
//                                 </div>

//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">

//                                     <div>

//                                         <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
//                                             Point of Contact (POC)
//                                         </label>

//                                         <select
//                                             value={
//                                                 clientForm.pocId
//                                             }
//                                             onChange={(
//                                                 e
//                                             ) =>
//                                                 setClientForm(
//                                                     {
//                                                         ...clientForm,
//                                                         pocId:
//                                                             e
//                                                                 .target
//                                                                 .value,
//                                                     }
//                                                 )
//                                             }
//                                             className="w-full text-xs p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
//                                         >
//                                             <option value="">
//                                                 Select Point of Contact...
//                                             </option>

//                                             {pocs.map(
//                                                 (
//                                                     poc
//                                                 ) => (
//                                                     <option
//                                                         key={
//                                                             poc.id
//                                                         }
//                                                         value={poc.id.toString()}
//                                                     >
//                                                         {
//                                                             poc.name
//                                                         }
//                                                     </option>
//                                                 )
//                                             )}
//                                         </select>

//                                     </div>

//                                     <div>

//                                         <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
//                                             Location Address
//                                         </label>

//                                         <input
//                                             type="text"
//                                             value={
//                                                 clientForm.location
//                                             }
//                                             onChange={(
//                                                 e
//                                             ) =>
//                                                 setClientForm(
//                                                     {
//                                                         ...clientForm,
//                                                         location:
//                                                             e
//                                                                 .target
//                                                                 .value,
//                                                     }
//                                                 )
//                                             }
//                                             className="w-full text-xs p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
//                                             placeholder="Floor 4, Building B, Agrabad C/A"
//                                         />
//                                     </div>

//                                     <div className="md:col-span-2">

//                                         <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
//                                             Description / Remarks
//                                         </label>

//                                         <textarea
//                                             rows={2}
//                                             value={
//                                                 clientForm.description
//                                             }
//                                             onChange={(
//                                                 e
//                                             ) =>
//                                                 setClientForm(
//                                                     {
//                                                         ...clientForm,
//                                                         description:
//                                                             e
//                                                                 .target
//                                                                 .value,
//                                                     }
//                                                 )
//                                             }
//                                             className="w-full text-xs p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
//                                             placeholder="Additional notes about connectivity or setup..."
//                                         />

//                                     </div>

//                                 </div>
//                             </div>

//                             {/* Buttons */}
//                             <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">

//                                 <button
//                                     type="button"
//                                     onClick={() =>
//                                         setIsClientModalOpen(
//                                             false
//                                         )
//                                     }
//                                     className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
//                                 >
//                                     Cancel
//                                 </button>

//                                 <button
//                                     type="submit"
//                                     className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition cursor-pointer flex items-center gap-1.5"
//                                 >
//                                     <span className="material-symbols-outlined text-base">
//                                         check
//                                     </span>

//                                     {editingClient
//                                         ? 'Update Client'
//                                         : 'Save Client'}
//                                 </button>

//                             </div>

//                         </form>
//                     </div>
//                 </div>
//             )}

//             {/* POC Modal */}
//             {isPocModalOpen && (
//                 <div
//                     onClick={() =>
//                         setIsPocModalOpen(false)
//                     }
//                     className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in p-4"
//                 >
//                     <div
//                         onClick={(e) =>
//                             e.stopPropagation()
//                         }
//                         className="w-full max-w-sm transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-300 animate-in zoom-in-95 border border-slate-100 flex flex-col"
//                     >

//                         <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-slate-100">

//                             <div className="flex items-center gap-2.5">

//                                 <div className="h-9 w-9 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
//                                     <span className="material-symbols-outlined text-lg">
//                                         hub
//                                     </span>
//                                 </div>

//                                 <div>
//                                     <h2 className="text-sm font-bold text-slate-800 tracking-tight">
//                                         Add Point of Connection
//                                     </h2>

//                                     <p className="text-[10px] text-slate-400 font-medium">
//                                         POC Details
//                                     </p>
//                                 </div>

//                             </div>

//                             <button
//                                 onClick={() =>
//                                     setIsPocModalOpen(
//                                         false
//                                     )
//                                 }
//                                 className="h-7 w-7 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition cursor-pointer text-xs"
//                             >
//                                 ✕
//                             </button>

//                         </div>

//                         <form
//                             onSubmit={
//                                 handleAddPoc
//                             }
//                             className="p-5 space-y-4"
//                         >

//                             <div>

//                                 <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
//                                     POC Name{' '}
//                                     <span className="text-rose-500">
//                                         *
//                                     </span>
//                                 </label>

//                                 <div className="relative flex items-center">

//                                     <span className="absolute left-3 text-slate-400 pointer-events-none flex items-center">
//                                         <span className="material-symbols-outlined text-base">
//                                             link
//                                         </span>
//                                     </span>

//                                     <input
//                                         type="text"
//                                         required
//                                         autoFocus
//                                         value={
//                                             pocForm.name
//                                         }
//                                         onChange={(
//                                             e
//                                         ) =>
//                                             setPocForm(
//                                                 {
//                                                     ...pocForm,
//                                                     name:
//                                                         e
//                                                             .target
//                                                             .value,
//                                                 }
//                                             )
//                                         }
//                                         className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition font-medium text-slate-800"
//                                         placeholder="e.g. Agrabad POP Connection"
//                                     />

//                                 </div>

//                             </div>

//                             <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">

//                                 <button
//                                     type="button"
//                                     onClick={() =>
//                                         setIsPocModalOpen(
//                                             false
//                                         )
//                                     }
//                                     className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
//                                 >
//                                     Cancel
//                                 </button>

//                                 <button
//                                     type="submit"
//                                     className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition cursor-pointer flex items-center gap-1"
//                                 >
//                                     <span className="material-symbols-outlined text-base">
//                                         check
//                                     </span>

//                                     Save POC
//                                 </button>

//                             </div>

//                         </form>
//                     </div>
//                 </div>
//             )}

//         </div>
//     );
// }



// ===============3rd===============

'use client';

import React, {
    useState,
    useEffect,
    useMemo,
} from 'react';

import {
    ClientInfo,
    POC,
} from '@/types/client';

import ConfirmDialog from '@/components/ConfirmDialog';
import ClientDetailsModal from '@/components/ClientDetailsModal';

export default function ClientInfoPage() {
    // --------------------------------------------------
    // Data
    // --------------------------------------------------
    const [clients, setClients] = useState<ClientInfo[]>(
        []
    );

    const [pocs, setPocs] = useState<POC[]>(
        []
    );

    const [isLoading, setIsLoading] =
        useState(true);

    // --------------------------------------------------
    // Controls & Filters
    // --------------------------------------------------
    const [searchQuery, setSearchQuery] =
        useState('');

    const [statusFilter, setStatusFilter] =
        useState<
            'All' | 'Connected' | 'Disconnected'
        >('All');

    const [pocFilter, setPocFilter] =
        useState<string>('All');

    const [sortBy, setSortBy] =
        useState<
            'newest' |
            'oldest' |
            'name' |
            'clientId'
        >('newest');

    const [viewMode, setViewMode] =
        useState<'table' | 'grid'>(
            'table'
        );

    // --------------------------------------------------
    // Pagination
    // --------------------------------------------------
    const [currentPage, setCurrentPage] =
        useState(1);

    const itemsPerPage = 20;

    // --------------------------------------------------
    // Client Modals
    // --------------------------------------------------
    const [
        isClientModalOpen,
        setIsClientModalOpen,
    ] = useState(false);

    const [
        selectedClientForView,
        setSelectedClientForView,
    ] = useState<ClientInfo | null>(
        null
    );

    const [
        editingClient,
        setEditingClient,
    ] = useState<ClientInfo | null>(
        null
    );

    // --------------------------------------------------
    // POC Modals
    // --------------------------------------------------
    const [
        isPocModalOpen,
        setIsPocModalOpen,
    ] = useState(false);

    const [
        isPocManagementOpen,
        setIsPocManagementOpen,
    ] = useState(false);

    const [
        editingPoc,
        setEditingPoc,
    ] = useState<POC | null>(null);

    // --------------------------------------------------
    // Delete
    // --------------------------------------------------
    const [
        deleteTargetId,
        setDeleteTargetId,
    ] = useState<string | null>(null);

    const [
        deletePocTargetId,
        setDeletePocTargetId,
    ] = useState<string | null>(null);

    // --------------------------------------------------
    // Copy
    // --------------------------------------------------
    const [copied, setCopied] =
        useState(false);

    // --------------------------------------------------
    // Toast
    // --------------------------------------------------
    type ToastType =
        | 'success'
        | 'error'
        | 'warning';

    const [toast, setToast] = useState<{
        show: boolean;
        message: string;
        type: ToastType;
    }>({
        show: false,
        message: '',
        type: 'success',
    });

    const showToast = (
        message: string,
        type: ToastType = 'success'
    ) => {
        setToast({
            show: true,
            message,
            type,
        });

        setTimeout(() => {
            setToast((prev) => ({
                ...prev,
                show: false,
            }));
        }, 3000);
    };

    // --------------------------------------------------
    // Client Form
    // --------------------------------------------------
    const [
        clientForm,
        setClientForm,
    ] = useState({
        clientId: '',
        clientName: '',
        clientPhone: '',
        primaryIp: '',
        primaryOnu: '',
        secondaryIp: '',
        secondaryOnu: '',
        location: '',
        pocId: '',
        status:
            'Connected' as
            | 'Connected'
            | 'Disconnected',
        description: '',
    });

    // --------------------------------------------------
    // POC Form
    // --------------------------------------------------
    const [
        pocForm,
        setPocForm,
    ] = useState({
        name: '',
        phone: '',
        designation: '',
    });

    // ==================================================
    // LOAD DATA
    // ==================================================
    useEffect(() => {
        const fetchInitialData =
            async () => {
                setIsLoading(true);

                try {
                    const [
                        pocsRes,
                        clientsRes,
                    ] =
                        await Promise.all([
                            fetch(
                                '/api/pocs',
                                {
                                    cache: 'no-store',
                                }
                            ),
                            fetch(
                                '/api/clients',
                                {
                                    cache: 'no-store',
                                }
                            ),
                        ]);

                    // ------------------------------
                    // POCs
                    // ------------------------------
                    if (pocsRes.ok) {
                        const pocsData =
                            await pocsRes.json();

                        const normalizedPocs =
                            Array.isArray(
                                pocsData
                            )
                                ? pocsData
                                : pocsData?.pocs ||
                                pocsData?.data ||
                                [];

                        setPocs(
                            normalizedPocs
                        );
                    }

                    // ------------------------------
                    // Clients
                    // ------------------------------
                    if (
                        clientsRes.ok
                    ) {
                        const clientsData =
                            await clientsRes.json();

                        const normalizedClients =
                            Array.isArray(
                                clientsData
                            )
                                ? clientsData
                                : clientsData?.clients ||
                                clientsData?.data ||
                                [];

                        setClients(
                            normalizedClients
                        );
                    }
                } catch (error) {
                    console.error(
                        'Error fetching data from database:',
                        error
                    );

                    showToast(
                        'Failed to load client information.',
                        'error'
                    );
                } finally {
                    setIsLoading(false);
                }
            };

        fetchInitialData();
    }, []);

    // ==================================================
    // COPY CLIENT INFORMATION
    // ==================================================
    const handleCopyClientInfo =
        async (
            client: ClientInfo
        ) => {
            const pocInfo =
                pocs.find(
                    (p) =>
                        p.id.toString() ===
                        client.pocId?.toString()
                );

            const pocText = pocInfo
                ? pocInfo.name
                : client.pocName ||
                'N/A';

            const textToCopy = `Client ID : ${client.clientId || 'N/A'
                }
Client Name : ${client.clientName || 'N/A'
                }
Phone : ${client.clientPhone || 'N/A'
                }
Primary IP & ONU : ${client.primaryIp || 'N/A'
                } (ONU: ${client.primaryOnu || 'N/A'
                })
Secondary IP & ONU : ${client.secondaryIp || 'N/A'
                } (ONU: ${client.secondaryOnu || 'N/A'
                })
Location : ${client.location || 'N/A'
                }
POC : ${pocText}`;

            try {
                await navigator.clipboard.writeText(
                    textToCopy
                );

                setCopied(true);

                showToast(
                    'Client information copied!',
                    'success'
                );

                setTimeout(() => {
                    setCopied(false);
                }, 2000);
            } catch (error) {
                console.error(
                    'Failed to copy client information:',
                    error
                );

                showToast(
                    'Failed to copy client information.',
                    'error'
                );
            }
        };

    // ==================================================
    // FILTER & SORT
    // ==================================================
    const filteredClients =
        useMemo(() => {
            return clients
                .filter((client) => {
                    const q =
                        searchQuery
                            .toLowerCase()
                            .trim();

                    const matchesSearch =
                        !q ||
                        client.clientId
                            ?.toLowerCase()
                            .includes(q) ||
                        client.clientName
                            ?.toLowerCase()
                            .includes(q) ||
                        client.clientPhone
                            ?.toLowerCase()
                            .includes(q) ||
                        client.primaryIp
                            ?.toLowerCase()
                            .includes(q) ||
                        client.location
                            ?.toLowerCase()
                            .includes(q) ||
                        client.pocName
                            ?.toLowerCase()
                            .includes(q);

                    const matchesStatus =
                        statusFilter ===
                        'All' ||
                        client.status ===
                        statusFilter;

                    const matchesPoc =
                        pocFilter ===
                        'All' ||
                        client.pocId?.toString() ===
                        pocFilter;

                    return (
                        matchesSearch &&
                        matchesStatus &&
                        matchesPoc
                    );
                })
                .sort((a, b) => {
                    if (
                        sortBy ===
                        'newest'
                    ) {
                        return (
                            Number(b.id) -
                            Number(a.id)
                        );
                    }

                    if (
                        sortBy ===
                        'oldest'
                    ) {
                        return (
                            Number(a.id) -
                            Number(b.id)
                        );
                    }

                    if (
                        sortBy ===
                        'name'
                    ) {
                        return (
                            a.clientName ||
                            ''
                        ).localeCompare(
                            b.clientName ||
                            ''
                        );
                    }

                    if (
                        sortBy ===
                        'clientId'
                    ) {
                        return (
                            a.clientId ||
                            ''
                        ).localeCompare(
                            b.clientId ||
                            ''
                        );
                    }

                    return 0;
                });
        }, [
            clients,
            searchQuery,
            statusFilter,
            pocFilter,
            sortBy,
        ]);

    // ==================================================
    // RESET PAGINATION
    // ==================================================
    useEffect(() => {
        setCurrentPage(1);
    }, [
        searchQuery,
        statusFilter,
        pocFilter,
        sortBy,
    ]);

    // ==================================================
    // PAGINATION
    // ==================================================
    const totalPages =
        Math.ceil(
            filteredClients.length /
            itemsPerPage
        ) || 1;

    const paginatedClients =
        useMemo(() => {
            const start =
                (currentPage - 1) *
                itemsPerPage;

            return filteredClients.slice(
                start,
                start + itemsPerPage
            );
        }, [
            filteredClients,
            currentPage,
        ]);

    // ==================================================
    // OPEN EDIT CLIENT
    // ==================================================
    const handleOpenEditModal = (
        client: ClientInfo,
        e?: React.MouseEvent
    ) => {
        if (e) {
            e.stopPropagation();
        }

        setSelectedClientForView(
            null
        );

        setEditingClient(client);

        setClientForm({
            clientId:
                client.clientId ||
                '',
            clientName:
                client.clientName ||
                '',
            clientPhone:
                client.clientPhone ||
                '',
            primaryIp:
                client.primaryIp ||
                '',
            primaryOnu:
                client.primaryOnu ||
                '',
            secondaryIp:
                client.secondaryIp ||
                '',
            secondaryOnu:
                client.secondaryOnu ||
                '',
            location:
                client.location ||
                '',
            pocId:
                client.pocId?.toString() ||
                '',
            status:
                client.status ||
                'Connected',
            description:
                client.description ||
                '',
        });

        setIsClientModalOpen(
            true
        );
    };

    // ==================================================
    // OPEN ADD CLIENT
    // ==================================================
    const handleOpenAddModal =
        () => {
            setSelectedClientForView(
                null
            );

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
                status:
                    'Connected',
                description: '',
            });

            setIsClientModalOpen(
                true
            );
        };

    // ==================================================
    // DELETE CLIENT TRIGGER
    // ==================================================
    const triggerDelete = (
        id: string,
        e?: React.MouseEvent
    ) => {
        if (e) {
            e.stopPropagation();
        }

        setDeleteTargetId(id);
    };

    // ==================================================
    // DELETE CLIENT
    // ==================================================
    const confirmDelete =
        async () => {
            if (
                !deleteTargetId
            ) {
                return;
            }

            const idToDelete =
                deleteTargetId;

            try {
                const res =
                    await fetch(
                        `/api/clients/${idToDelete}`,
                        {
                            method: 'DELETE',
                        }
                    );

                const data =
                    await res
                        .json()
                        .catch(
                            () =>
                                null
                        );

                if (!res.ok) {
                    showToast(
                        data?.error ||
                        'Failed to delete client.',
                        'error'
                    );

                    return;
                }

                setClients(
                    (prev) =>
                        prev.filter(
                            (
                                client
                            ) =>
                                client.id
                                    .toString() !==
                                idToDelete.toString()
                        )
                );

                if (
                    selectedClientForView?.id
                        .toString() ===
                    idToDelete.toString()
                ) {
                    setSelectedClientForView(
                        null
                    );
                }

                showToast(
                    'Client deleted successfully!',
                    'error'
                );
            } catch (error) {
                console.error(
                    'Error deleting client:',
                    error
                );

                showToast(
                    'Failed to delete client.',
                    'error'
                );
            } finally {
                setDeleteTargetId(
                    null
                );
            }
        };

    // ==================================================
    // OPEN ADD POC
    // ==================================================
    const handleOpenAddPoc =
        () => {
            setIsPocManagementOpen(
                false
            );

            setEditingPoc(null);

            setPocForm({
                name: '',
                phone: '',
                designation: '',
            });

            setIsPocModalOpen(
                true
            );
        };

    // ==================================================
    // OPEN EDIT POC
    // ==================================================
    const handleEditPoc = (
        poc: POC
    ) => {
        setIsPocManagementOpen(
            false
        );

        setEditingPoc(poc);

        setPocForm({
            name: poc.name || '',
            phone: '',
            designation: '',
        });

        setIsPocModalOpen(
            true
        );
    };

    // ==================================================
    // SAVE / UPDATE POC
    // ==================================================
    const handleSavePoc =
        async (
            e: React.FormEvent
        ) => {
            e.preventDefault();

            if (
                !pocForm.name.trim()
            ) {
                showToast(
                    'POC name is required!',
                    'error'
                );

                return;
            }

            try {
                const url =
                    editingPoc
                        ? `/api/pocs/${editingPoc.id}`
                        : '/api/pocs';

                const method =
                    editingPoc
                        ? 'PUT'
                        : 'POST';

                const res =
                    await fetch(url, {
                        method,
                        headers: {
                            'Content-Type':
                                'application/json',
                        },
                        body: JSON.stringify(
                            {
                                name: pocForm.name.trim(),
                            }
                        ),
                    });

                const data =
                    await res
                        .json()
                        .catch(
                            () =>
                                null
                        );

                if (!res.ok) {
                    showToast(
                        data?.error ||
                        `Failed to ${editingPoc
                            ? 'update'
                            : 'add'
                        } POC.`,
                        'error'
                    );

                    return;
                }

                const savedPoc =
                    data?.poc ||
                    data?.data ||
                    data;

                if (
                    editingPoc
                ) {
                    setPocs(
                        (prev) =>
                            prev.map(
                                (
                                    poc
                                ) =>
                                    poc.id.toString() ===
                                        editingPoc.id.toString()
                                        ? savedPoc
                                        : poc
                            )
                    );

                    setClients(
                        (prev) =>
                            prev.map(
                                (
                                    client
                                ) =>
                                    client.pocId?.toString() ===
                                        editingPoc.id.toString()
                                        ? {
                                            ...client,
                                            pocName:
                                                savedPoc.name,
                                        }
                                        : client
                            )
                    );

                    showToast(
                        'POC updated successfully!',
                        'warning'
                    );
                } else {
                    setPocs(
                        (prev) => [
                            savedPoc,
                            ...prev,
                        ]
                    );

                    showToast(
                        'POC added successfully!',
                        'success'
                    );
                }

                setPocForm({
                    name: '',
                    phone: '',
                    designation: '',
                });

                setEditingPoc(
                    null
                );

                setIsPocModalOpen(
                    false
                );
            } catch (error) {
                console.error(
                    'Error saving POC:',
                    error
                );

                showToast(
                    'Database request failed.',
                    'error'
                );
            }
        };

    // ==================================================
    // DELETE POC
    // ==================================================
    const confirmDeletePoc =
        async () => {
            if (
                !deletePocTargetId
            ) {
                return;
            }

            const id =
                deletePocTargetId;

            try {
                const res =
                    await fetch(
                        `/api/pocs/${id}`,
                        {
                            method: 'DELETE',
                        }
                    );

                const data =
                    await res
                        .json()
                        .catch(
                            () =>
                                null
                        );

                if (!res.ok) {
                    showToast(
                        data?.error ||
                        'Failed to delete POC.',
                        'error'
                    );

                    return;
                }

                setPocs(
                    (prev) =>
                        prev.filter(
                            (
                                poc
                            ) =>
                                poc.id.toString() !==
                                id.toString()
                        )
                );

                setClients(
                    (prev) =>
                        prev.map(
                            (
                                client
                            ) =>
                                client.pocId?.toString() ===
                                    id.toString()
                                    ? {
                                        ...client,
                                        pocId:
                                            null,
                                        pocName:
                                            '',
                                    }
                                    : client
                        )
                );

                if (
                    pocFilter ===
                    id.toString()
                ) {
                    setPocFilter(
                        'All'
                    );
                }

                showToast(
                    'POC deleted successfully!',
                    'error'
                );
            } catch (error) {
                console.error(
                    'Error deleting POC:',
                    error
                );

                showToast(
                    'Failed to delete POC.',
                    'error'
                );
            } finally {
                setDeletePocTargetId(
                    null
                );
            }
        };

    // ==================================================
    // SAVE / UPDATE CLIENT
    // ==================================================
    const handleSaveClient =
        async (
            e: React.FormEvent
        ) => {
            e.preventDefault();

            if (
                !clientForm.clientId.trim() ||
                !clientForm.clientName.trim()
            ) {
                showToast(
                    'Client ID and Name are required!',
                    'error'
                );

                return;
            }

            const selectedPoc =
                pocs.find(
                    (p) =>
                        p.id.toString() ===
                        clientForm.pocId.toString()
                );

            try {
                const url =
                    editingClient
                        ? `/api/clients/${editingClient.id}`
                        : '/api/clients';

                const method =
                    editingClient
                        ? 'PUT'
                        : 'POST';

                const res =
                    await fetch(url, {
                        method,
                        headers: {
                            'Content-Type':
                                'application/json',
                        },
                        body: JSON.stringify(
                            {
                                ...clientForm,
                                pocName:
                                    selectedPoc?.name ||
                                    '',
                            }
                        ),
                    });

                const data =
                    await res
                        .json()
                        .catch(
                            () =>
                                null
                        );

                if (!res.ok) {
                    showToast(
                        data?.error ||
                        'Failed to save client.',
                        'error'
                    );

                    return;
                }

                const apiClient =
                    data?.client ||
                    data?.data ||
                    data;

                const savedClient = {
                    ...apiClient,
                    pocName:
                        selectedPoc?.name ||
                        apiClient?.pocName ||
                        '',
                };

                if (
                    editingClient
                ) {
                    setClients(
                        (prev) =>
                            prev.map(
                                (
                                    client
                                ) =>
                                    client.id.toString() ===
                                        editingClient.id.toString()
                                        ? savedClient
                                        : client
                            )
                    );

                    showToast(
                        'Client updated successfully!',
                        'warning'
                    );
                } else {
                    setClients(
                        (prev) => [
                            savedClient,
                            ...prev,
                        ]
                    );

                    setCurrentPage(
                        1
                    );

                    showToast(
                        'Client added successfully!',
                        'success'
                    );
                }

                setIsClientModalOpen(
                    false
                );

                setEditingClient(
                    null
                );
            } catch (error) {
                console.error(
                    'Error saving client:',
                    error
                );

                showToast(
                    'Database request failed.',
                    'error'
                );
            }
        };

    // ==================================================
    // UI
    // ==================================================
    return (
        <div className="min-h-screen bg-slate-900/5 text-slate-800 p-3 sm:p-6 lg:p-8">

            {/* ==================================================
                TOAST
            ================================================== */}
            {toast.show && (
                <div
                    className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 min-w-[280px] max-w-[400px] px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-right-5 fade-in ${toast.type ===
                        'success'
                        ? 'bg-emerald-50/95 border-emerald-200 text-emerald-700'
                        : toast.type ===
                            'warning'
                            ? 'bg-orange-50/95 border-orange-200 text-orange-700'
                            : 'bg-red-50/95 border-red-200 text-red-700'
                        }`}
                >
                    <span
                        className={`material-symbols-outlined text-xl ${toast.type ===
                            'success'
                            ? 'text-emerald-600'
                            : toast.type ===
                                'warning'
                                ? 'text-orange-600'
                                : 'text-red-600'
                            }`}
                    >
                        {toast.type ===
                            'success'
                            ? 'check_circle'
                            : toast.type ===
                                'warning'
                                ? 'edit'
                                : 'delete'}
                    </span>

                    <div className="flex-1">
                        <p className="text-sm font-semibold">
                            {
                                toast.message
                            }
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            setToast(
                                (
                                    prev
                                ) => ({
                                    ...prev,
                                    show: false,
                                })
                            )
                        }
                        className="text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">
                            close
                        </span>
                    </button>
                </div>
            )}

            <div className="max-w-7xl mx-auto space-y-6">

                {/* ==================================================
                    HEADER
                ================================================== */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 transition-all duration-300 hover:shadow-sm">

                    <div>

                        <div className="flex items-center gap-2">

                            <span className="material-symbols-outlined text-teal-600 text-2xl transition-transform duration-300 hover:rotate-12">
                                hub
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    window.location.reload()
                                }
                                className="text-xl font-bold text-slate-900 tracking-tight cursor-pointer hover:text-teal-600 transition-colors duration-200 text-left"
                                title="Reload Client Directory"
                            >
                                Client Directory
                            </button>

                        </div>

                        <p className="text-xs text-slate-500 mt-0.5">
                            Manage network connections and client profiles
                        </p>

                    </div>

                    <div className="flex items-center gap-2.5">

                        {/* Manage POC */}
                        <button
                            type="button"
                            onClick={() =>
                                setIsPocManagementOpen(
                                    true
                                )
                            }
                            className="group px-4 py-2.5 bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-700 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 border border-slate-200 hover:border-teal-200 hover:shadow-sm active:scale-[0.98]"
                        >
                            <span className="material-symbols-outlined text-base transition-transform duration-200 group-hover:rotate-12">
                                manage_accounts
                            </span>

                            Manage POC
                        </button>

                        {/* New Client */}
                        <button
                            type="button"
                            onClick={
                                handleOpenAddModal
                            }
                            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
                        >
                            <span className="material-symbols-outlined text-base">
                                add_circle
                            </span>

                            New Client Entry
                        </button>

                    </div>
                </div>

                {/* ==================================================
                    STATS
                ================================================== */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                    {/* Total */}
                    <div className="group bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">

                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Total Clients
                            </p>

                            <h3 className="text-2xl font-black text-slate-800 mt-1">
                                {
                                    clients.length
                                }
                            </h3>
                        </div>

                        <div className="h-10 w-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center font-bold transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                            <span className="material-symbols-outlined">
                                lan
                            </span>
                        </div>

                    </div>

                    {/* Connected */}
                    <div className="group bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">

                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Connected
                            </p>

                            <h3 className="text-2xl font-black text-emerald-600 mt-1">
                                {
                                    clients.filter(
                                        (
                                            c
                                        ) =>
                                            c.status ===
                                            'Connected'
                                    ).length
                                }
                            </h3>
                        </div>

                        <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold transition-transform duration-300 group-hover:scale-110">
                            <span className="material-symbols-outlined">
                                check_circle
                            </span>
                        </div>

                    </div>

                    {/* Disconnected */}
                    <div className="group bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">

                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Disconnected
                            </p>

                            <h3 className="text-2xl font-black text-rose-600 mt-1">
                                {
                                    clients.filter(
                                        (
                                            c
                                        ) =>
                                            c.status ===
                                            'Disconnected'
                                    ).length
                                }
                            </h3>
                        </div>

                        <div className="h-10 w-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center font-bold transition-transform duration-300 group-hover:scale-110">
                            <span className="material-symbols-outlined">
                                power_off
                            </span>
                        </div>

                    </div>

                </div>

                {/* ==================================================
                    FILTERS
                ================================================== */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 transition-all duration-300 hover:shadow-sm">

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">

                        {/* Search */}
                        <div className="lg:col-span-5 relative group">

                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg transition-colors duration-200 group-focus-within:text-teal-600">
                                search
                            </span>

                            <input
                                type="text"
                                value={
                                    searchQuery
                                }
                                onChange={(
                                    e
                                ) =>
                                    setSearchQuery(
                                        e
                                            .target
                                            .value
                                    )
                                }
                                placeholder="Search Client ID, Name, Phone, Location..."
                                className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all duration-200"
                            />

                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSearchQuery(
                                            ''
                                        )
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 cursor-pointer transition-colors"
                                >
                                    <span className="material-symbols-outlined text-base">
                                        close
                                    </span>
                                </button>
                            )}

                        </div>

                        {/* Status */}
                        <div className="lg:col-span-2 relative">

                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-teal-500 text-base pointer-events-none z-10">
                                circle
                            </span>

                            <select
                                value={
                                    statusFilter
                                }
                                onChange={(
                                    e
                                ) =>
                                    setStatusFilter(
                                        e
                                            .target
                                            .value as
                                        | 'All'
                                        | 'Connected'
                                        | 'Disconnected'
                                    )
                                }
                                className="appearance-none w-full pl-9 pr-9 py-2.5 text-xs font-semibold bg-slate-50/70 border border-slate-200 rounded-xl cursor-pointer hover:bg-white hover:border-teal-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all duration-200"
                            >
                                <option value="All">
                                    All Statuses
                                </option>

                                <option value="Connected">
                                    ● Connected
                                </option>

                                <option value="Disconnected">
                                    ● Disconnected
                                </option>
                            </select>

                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">
                                expand_more
                            </span>

                        </div>

                        {/* POC */}
                        <div className="lg:col-span-2 relative">

                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-teal-500 text-base pointer-events-none z-10">
                                group
                            </span>

                            <select
                                value={
                                    pocFilter
                                }
                                onChange={(
                                    e
                                ) =>
                                    setPocFilter(
                                        e
                                            .target
                                            .value
                                    )
                                }
                                className="appearance-none w-full pl-9 pr-9 py-2.5 text-xs font-semibold bg-slate-50/70 border border-slate-200 rounded-xl cursor-pointer hover:bg-white hover:border-teal-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all duration-200"
                            >
                                <option value="All">
                                    All POCs
                                </option>

                                {pocs.map(
                                    (
                                        poc
                                    ) => (
                                        <option
                                            key={
                                                poc.id
                                            }
                                            value={poc.id.toString()}
                                        >
                                            {
                                                poc.name
                                            }
                                        </option>
                                    )
                                )}
                            </select>

                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">
                                expand_more
                            </span>

                        </div>

                        {/* Sort */}
                        <div className="lg:col-span-2 relative">

                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-teal-500 text-base pointer-events-none z-10">
                                sort
                            </span>

                            <select
                                value={
                                    sortBy
                                }
                                onChange={(
                                    e
                                ) =>
                                    setSortBy(
                                        e
                                            .target
                                            .value as
                                        | 'newest'
                                        | 'oldest'
                                        | 'name'
                                        | 'clientId'
                                    )
                                }
                                className="appearance-none w-full pl-9 pr-9 py-2.5 text-xs font-semibold bg-slate-50/70 border border-slate-200 rounded-xl cursor-pointer hover:bg-white hover:border-teal-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-all duration-200"
                            >
                                <option value="newest">
                                    Sort: Newest First
                                </option>

                                <option value="oldest">
                                    Sort: Oldest First
                                </option>

                                <option value="name">
                                    Sort: Client Name
                                </option>

                                <option value="clientId">
                                    Sort: Client ID
                                </option>
                            </select>

                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">
                                expand_more
                            </span>

                        </div>

                        {/* View Mode */}
                        <div className="lg:col-span-1 flex items-center justify-end gap-1 bg-slate-100 p-1 rounded-xl">

                            <button
                                type="button"
                                onClick={() =>
                                    setViewMode(
                                        'table'
                                    )
                                }
                                className={`flex-1 p-1.5 rounded-lg text-xs transition-all duration-200 cursor-pointer ${viewMode ===
                                    'table'
                                    ? 'bg-white shadow-sm text-teal-700 font-bold scale-[1.02]'
                                    : 'text-slate-500 hover:text-teal-600 hover:bg-white/60'
                                    }`}
                                title="Table View"
                            >
                                <span className="material-symbols-outlined text-base">
                                    table_rows
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setViewMode(
                                        'grid'
                                    )
                                }
                                className={`flex-1 p-1.5 rounded-lg text-xs transition-all duration-200 cursor-pointer ${viewMode ===
                                    'grid'
                                    ? 'bg-white shadow-sm text-teal-700 font-bold scale-[1.02]'
                                    : 'text-slate-500 hover:text-teal-600 hover:bg-white/60'
                                    }`}
                                title="Grid View"
                            >
                                <span className="material-symbols-outlined text-base">
                                    grid_view
                                </span>
                            </button>

                        </div>

                    </div>

                </div>

                {/* ==================================================
                    CONTENT
                ================================================== */}
                {isLoading ? (
                    <div className="bg-white rounded-2xl p-16 text-center border border-slate-200/80 animate-in fade-in duration-300">

                        <div className="h-10 w-10 mx-auto rounded-full border-4 border-teal-100 border-t-teal-600 animate-spin"></div>

                        <p className="text-xs text-teal-600 font-medium mt-4">
                            Loading data from Aiven Database...
                        </p>

                    </div>
                ) : paginatedClients.length ===
                    0 ? (
                    <div className="bg-white rounded-2xl p-16 text-center border border-slate-200/80 animate-in fade-in duration-300">

                        <div className="h-14 w-14 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl">
                                search_off
                            </span>
                        </div>

                        <p className="text-sm font-semibold text-slate-600 mt-4">
                            No client records found.
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                            Try changing your search or filters.
                        </p>

                    </div>
                ) : viewMode ===
                    'table' ? (

                    /* ==================================================
                       TABLE
                    ================================================== */
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">

                        <div className="overflow-x-auto">

                            <table className="w-full text-left border-collapse">

                                <thead>
                                    <tr className="bg-slate-50/80 border-b border-slate-200/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">

                                        <th className="py-3.5 px-4">
                                            Client Details
                                        </th>

                                        <th className="py-3.5 px-4">
                                            Phone
                                        </th>

                                        <th className="py-3.5 px-4">
                                            Primary Link
                                        </th>

                                        <th className="py-3.5 px-4">
                                            Secondary Link
                                        </th>

                                        <th className="py-3.5 px-4">
                                            Location
                                        </th>

                                        <th className="py-3.5 px-4">
                                            POC Name
                                        </th>

                                        <th className="py-3.5 px-4">
                                            Status
                                        </th>

                                        <th className="py-3.5 px-4 text-right">
                                            Actions
                                        </th>

                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100 text-xs">

                                    {paginatedClients.map(
                                        (
                                            client,
                                            index
                                        ) => (
                                            <tr
                                                key={
                                                    client.id
                                                }
                                                onClick={() =>
                                                    setSelectedClientForView(
                                                        client
                                                    )
                                                }
                                                className="group hover:bg-teal-50/30 transition-all duration-200 cursor-pointer animate-in fade-in"
                                                style={{
                                                    animationDelay: `${Math.min(
                                                        index *
                                                        25,
                                                        300
                                                    )}ms`,
                                                }}
                                            >

                                                {/* Client */}
                                                <td className="py-3 px-4">

                                                    <div className="flex items-center gap-2">

                                                        <div className="h-8 w-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
                                                            <span className="material-symbols-outlined text-base">
                                                                person
                                                            </span>
                                                        </div>

                                                        <div>

                                                            <div className="font-semibold text-slate-800">
                                                                {
                                                                    client.clientName
                                                                }
                                                            </div>

                                                            <div className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-500 border">
                                                                {
                                                                    client.clientId
                                                                }
                                                            </div>

                                                        </div>

                                                    </div>

                                                </td>

                                                {/* Phone */}
                                                <td className="py-3 px-4 font-mono text-slate-700">
                                                    {
                                                        client.clientPhone ||
                                                        '-'
                                                    }
                                                </td>

                                                {/* Primary */}
                                                <td className="py-3 px-4 font-mono">

                                                    <div className="text-slate-700 font-medium">
                                                        IP:{' '}
                                                        {
                                                            client.primaryIp ||
                                                            '-'
                                                        }
                                                    </div>

                                                    <div className="text-[10px] text-slate-400">
                                                        ONU:{' '}
                                                        {
                                                            client.primaryOnu ||
                                                            '-'
                                                        }
                                                    </div>

                                                </td>

                                                {/* Secondary */}
                                                <td className="py-3 px-4 font-mono">

                                                    <div className="text-slate-700 font-medium">
                                                        IP:{' '}
                                                        {
                                                            client.secondaryIp ||
                                                            '-'
                                                        }
                                                    </div>

                                                    <div className="text-[10px] text-slate-400">
                                                        ONU:{' '}
                                                        {
                                                            client.secondaryOnu ||
                                                            '-'
                                                        }
                                                    </div>

                                                </td>

                                                {/* Location */}
                                                <td className="py-3 px-4 text-slate-600 max-w-[150px]">

                                                    <div
                                                        className="truncate font-medium text-slate-700"
                                                        title={
                                                            client.location ||
                                                            ''
                                                        }
                                                    >
                                                        {
                                                            client.location ||
                                                            '-'
                                                        }
                                                    </div>

                                                </td>

                                                {/* POC */}
                                                <td className="py-3 px-4 text-slate-700 font-medium max-w-[120px]">

                                                    <div className="truncate">
                                                        {
                                                            client.pocName ||
                                                            '-'
                                                        }
                                                    </div>

                                                </td>

                                                {/* Status */}
                                                <td className="py-3 px-4">

                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all duration-200 ${client.status ===
                                                            'Connected'
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                            }`}
                                                    >

                                                        <span
                                                            className={`h-1.5 w-1.5 rounded-full ${client.status ===
                                                                'Connected'
                                                                ? 'bg-emerald-500 animate-pulse'
                                                                : 'bg-rose-500'
                                                                }`}
                                                        />

                                                        {
                                                            client.status
                                                        }

                                                    </span>

                                                </td>

                                                {/* Actions */}
                                                <td className="py-3 px-4 text-right whitespace-nowrap">

                                                    <div className="flex items-center justify-end gap-1.5">

                                                        {/* Edit */}
                                                        <button
                                                            type="button"
                                                            onClick={(
                                                                e
                                                            ) =>
                                                                handleOpenEditModal(
                                                                    client,
                                                                    e
                                                                )
                                                            }
                                                            title="Edit Client"
                                                            className="p-2 rounded-lg text-slate-500 bg-slate-50 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 border border-transparent transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
                                                        >
                                                            <span className="material-symbols-outlined text-base">
                                                                edit
                                                            </span>
                                                        </button>

                                                        {/* Delete */}
                                                        <button
                                                            type="button"
                                                            onClick={(
                                                                e
                                                            ) =>
                                                                triggerDelete(
                                                                    client.id.toString(),
                                                                    e
                                                                )
                                                            }
                                                            title="Delete Client"
                                                            className="p-2 rounded-lg text-slate-500 bg-slate-50 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-transparent transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
                                                        >
                                                            <span className="material-symbols-outlined text-base">
                                                                delete
                                                            </span>
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>
                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                ) : (

                    /* ==================================================
                       GRID
                    ================================================== */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-300">

                        {paginatedClients.map(
                            (
                                client,
                                index
                            ) => (
                                <div
                                    key={
                                        client.id
                                    }
                                    onClick={() =>
                                        setSelectedClientForView(
                                            client
                                        )
                                    }
                                    className="group bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 space-y-3 cursor-pointer animate-in fade-in slide-in-from-bottom-2"
                                    style={{
                                        animationDelay: `${Math.min(
                                            index *
                                            40,
                                            300
                                        )}ms`,
                                    }}
                                >

                                    <div className="flex items-start justify-between">

                                        <div className="flex items-start gap-3">

                                            <div className="h-9 w-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                                                <span className="material-symbols-outlined text-base">
                                                    person
                                                </span>
                                            </div>

                                            <div>

                                                <h3 className="font-bold text-slate-800 text-sm">
                                                    {
                                                        client.clientName
                                                    }
                                                </h3>

                                                <div className="flex items-center gap-1.5 mt-1">

                                                    <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-500 border">
                                                        {
                                                            client.clientId
                                                        }
                                                    </span>

                                                </div>

                                            </div>

                                        </div>

                                        <span
                                            className={`px-2 py-1 rounded-full text-[10px] font-bold ${client.status ===
                                                'Connected'
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : 'bg-rose-50 text-rose-700'
                                                }`}
                                        >
                                            {
                                                client.status
                                            }
                                        </span>

                                    </div>

                                    <div className="text-xs space-y-1.5 text-slate-600">

                                        <div className="truncate font-medium">
                                            Phone:{' '}
                                            {
                                                client.clientPhone ||
                                                'N/A'
                                            }
                                        </div>

                                        <div className="truncate font-medium">
                                            Location:{' '}
                                            {
                                                client.location ||
                                                'N/A'
                                            }
                                        </div>

                                        <div className="truncate font-medium">
                                            POC:{' '}
                                            {
                                                client.pocName ||
                                                'N/A'
                                            }
                                        </div>

                                        <div className="font-mono text-[10px] text-slate-400">
                                            Primary:{' '}
                                            {
                                                client.primaryIp ||
                                                'N/A'
                                            }
                                        </div>

                                    </div>

                                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">

                                        <button
                                            type="button"
                                            onClick={(
                                                e
                                            ) =>
                                                handleOpenEditModal(
                                                    client,
                                                    e
                                                )
                                            }
                                            className="px-3 py-1.5 text-xs bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={(
                                                e
                                            ) =>
                                                triggerDelete(
                                                    client.id.toString(),
                                                    e
                                                )
                                            }
                                            className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95"
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>
                            )
                        )}

                    </div>
                )}

                {/* ==================================================
                    PAGINATION
                ================================================== */}
                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white px-4 py-3 rounded-2xl border border-slate-200/80">

                        <p className="text-xs text-slate-500">

                            Showing{' '}

                            <span className="font-semibold text-slate-700">
                                {(currentPage -
                                    1) *
                                    itemsPerPage +
                                    1}
                            </span>{' '}

                            to{' '}

                            <span className="font-semibold text-slate-700">
                                {Math.min(
                                    currentPage *
                                    itemsPerPage,
                                    filteredClients.length
                                )}
                            </span>{' '}

                            of{' '}

                            <span className="font-semibold text-slate-700">
                                {
                                    filteredClients.length
                                }
                            </span>{' '}

                            clients

                        </p>

                        <div className="flex items-center gap-1">

                            <button
                                type="button"
                                disabled={
                                    currentPage ===
                                    1
                                }
                                onClick={() =>
                                    setCurrentPage(
                                        (
                                            prev
                                        ) =>
                                            Math.max(
                                                prev -
                                                1,
                                                1
                                            )
                                    )
                                }
                                className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer transition-all duration-200"
                            >
                                Previous
                            </button>

                            {Array.from(
                                {
                                    length: totalPages,
                                },
                                (
                                    _,
                                    i
                                ) =>
                                    i + 1
                            ).map(
                                (
                                    page
                                ) => (
                                    <button
                                        type="button"
                                        key={
                                            page
                                        }
                                        onClick={() =>
                                            setCurrentPage(
                                                page
                                            )
                                        }
                                        className={`px-3 py-1.5 text-xs font-semibold rounded-xl cursor-pointer transition-all duration-200 ${currentPage ===
                                            page
                                            ? 'bg-teal-600 text-white shadow-sm scale-105'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-teal-600'
                                            }`}
                                    >
                                        {
                                            page
                                        }
                                    </button>
                                )
                            )}

                            <button
                                type="button"
                                disabled={
                                    currentPage ===
                                    totalPages
                                }
                                onClick={() =>
                                    setCurrentPage(
                                        (
                                            prev
                                        ) =>
                                            Math.min(
                                                prev +
                                                1,
                                                totalPages
                                            )
                                    )
                                }
                                className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer transition-all duration-200"
                            >
                                Next
                            </button>

                        </div>

                    </div>
                )}

            </div>

            {/* ==================================================
                CLIENT DETAILS MODAL
            ================================================== */}
            <ClientDetailsModal
                client={
                    selectedClientForView
                }
                onClose={() =>
                    setSelectedClientForView(
                        null
                    )
                }
                onEdit={(client) =>
                    handleOpenEditModal(
                        client
                    )
                }
            />

            {/* ==================================================
                DELETE CLIENT CONFIRM
            ================================================== */}
            <ConfirmDialog
                isOpen={
                    !!deleteTargetId
                }
                title="Delete Client Record?"
                message="Are you sure you want to remove this client? This action cannot be undone."
                onConfirm={
                    confirmDelete
                }
                onCancel={() =>
                    setDeleteTargetId(
                        null
                    )
                }
            />

            {/* ==================================================
                DELETE POC CONFIRM
            ================================================== */}
            <ConfirmDialog
                isOpen={
                    !!deletePocTargetId
                }
                title="Delete POC?"
                message="Are you sure you want to delete this POC? Clients using this POC will keep their records, but the POC assignment will be removed."
                onConfirm={
                    confirmDeletePoc
                }
                onCancel={() =>
                    setDeletePocTargetId(
                        null
                    )
                }
            />

            {/* ==================================================
                CLIENT ADD / EDIT MODAL
            ================================================== */}
            {isClientModalOpen && (
                <div
                    onClick={() =>
                        setIsClientModalOpen(
                            false
                        )
                    }
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in p-4"
                >

                    <div
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                        className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-300 animate-in zoom-in-95 max-h-[90vh] flex flex-col border border-slate-100"
                    >

                        {/* Header */}
                        <div className="flex justify-between items-center px-6 py-5 bg-white border-b border-slate-100">

                            <div className="flex items-center gap-3">

                                <div className="h-10 w-10 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-xl">
                                        {editingClient
                                            ? 'edit_note'
                                            : 'person_add'}
                                    </span>
                                </div>

                                <div>

                                    <h2 className="text-base font-bold text-slate-800 tracking-tight">
                                        {editingClient
                                            ? 'Edit Client Record'
                                            : 'New Client Registration'}
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
                                onClick={() =>
                                    setIsClientModalOpen(
                                        false
                                    )
                                }
                                className="h-8 w-8 rounded-full bg-slate-50 hover:bg-red-50 hover:text-red-500 text-slate-400 flex items-center justify-center transition-all duration-200 cursor-pointer hover:rotate-90"
                            >
                                <span className="material-symbols-outlined text-lg">
                                    close
                                </span>
                            </button>

                        </div>

                        <form
                            onSubmit={
                                handleSaveClient
                            }
                            className="overflow-y-auto p-6 space-y-5 custom-scrollbar"
                        >

                            {/* Basic Information */}
                            <div className="space-y-3">

                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600 border-b border-slate-100 pb-1.5">

                                    <span className="material-symbols-outlined text-base">
                                        badge
                                    </span>

                                    Basic Information

                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">

                                    {/* Client ID */}
                                    <div>

                                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                                            Client ID{' '}
                                            <span className="text-rose-500">
                                                *
                                            </span>
                                        </label>

                                        <input
                                            type="text"
                                            required
                                            value={
                                                clientForm.clientId
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                setClientForm(
                                                    {
                                                        ...clientForm,
                                                        clientId:
                                                            e
                                                                .target
                                                                .value,
                                                    }
                                                )
                                            }
                                            className="w-full text-xs p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all duration-200"
                                            placeholder="CLI-2001"
                                        />

                                    </div>

                                    {/* Client Name */}
                                    <div className="md:col-span-2">

                                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                                            Client Name{' '}
                                            <span className="text-rose-500">
                                                *
                                            </span>
                                        </label>

                                        <input
                                            type="text"
                                            required
                                            value={
                                                clientForm.clientName
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                setClientForm(
                                                    {
                                                        ...clientForm,
                                                        clientName:
                                                            e
                                                                .target
                                                                .value,
                                                    }
                                                )
                                            }
                                            className="w-full text-xs p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all duration-200"
                                            placeholder="Apex Software Ltd."
                                        />

                                    </div>

                                    {/* Phone */}
                                    <div>

                                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                                            Client Phone
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                clientForm.clientPhone
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                setClientForm(
                                                    {
                                                        ...clientForm,
                                                        clientPhone:
                                                            e
                                                                .target
                                                                .value,
                                                    }
                                                )
                                            }
                                            className="w-full text-xs p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all duration-200"
                                            placeholder="+88017xxxxxxxx"
                                        />

                                    </div>

                                    {/* Status */}
                                    <div className="md:col-span-2">

                                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                                            Connection Status
                                        </label>

                                        <div className="relative">

                                            <span
                                                className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none h-2.5 w-2.5 rounded-full ${clientForm.status ===
                                                    'Connected'
                                                    ? 'bg-emerald-500'
                                                    : 'bg-rose-500'
                                                    }`}
                                            />

                                            <select
                                                value={
                                                    clientForm.status
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    setClientForm(
                                                        {
                                                            ...clientForm,
                                                            status:
                                                                e
                                                                    .target
                                                                    .value as
                                                                | 'Connected'
                                                                | 'Disconnected',
                                                        }
                                                    )
                                                }
                                                className={`appearance-none w-full text-xs pl-8 pr-9 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl cursor-pointer focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all duration-200 font-bold ${clientForm.status ===
                                                    'Connected'
                                                    ? 'text-emerald-700'
                                                    : 'text-rose-600'
                                                    }`}
                                            >

                                                <option value="Connected">
                                                    Connected
                                                </option>

                                                <option value="Disconnected">
                                                    Disconnected
                                                </option>

                                            </select>

                                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">
                                                expand_more
                                            </span>

                                        </div>

                                    </div>

                                </div>

                            </div>

                            {/* Network */}
                            <div className="space-y-3">

                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600 border-b border-slate-100 pb-1.5">

                                    <span className="material-symbols-outlined text-base">
                                        router
                                    </span>

                                    Network Configurations

                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100">

                                    {/* Primary */}
                                    <div className="space-y-2">

                                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                                            Primary Connection
                                        </span>

                                        <div>

                                            <label className="block text-[10px] text-slate-500 mb-0.5 font-medium">
                                                Primary IP
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    clientForm.primaryIp
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    setClientForm(
                                                        {
                                                            ...clientForm,
                                                            primaryIp:
                                                                e
                                                                    .target
                                                                    .value,
                                                        }
                                                    )
                                                }
                                                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all duration-200"
                                                placeholder="103.145.220.10"
                                            />

                                        </div>

                                        <div>

                                            <label className="block text-[10px] text-slate-500 mb-0.5 font-medium">
                                                Primary ONU MAC/SN
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    clientForm.primaryOnu
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    setClientForm(
                                                        {
                                                            ...clientForm,
                                                            primaryOnu:
                                                                e
                                                                    .target
                                                                    .value,
                                                        }
                                                    )
                                                }
                                                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all duration-200"
                                                placeholder="HWTC12345678"
                                            />

                                        </div>

                                    </div>

                                    {/* Secondary */}
                                    <div className="space-y-2">

                                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                                            Backup Connection
                                        </span>

                                        <div>

                                            <label className="block text-[10px] text-slate-500 mb-0.5 font-medium">
                                                Secondary IP
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    clientForm.secondaryIp
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    setClientForm(
                                                        {
                                                            ...clientForm,
                                                            secondaryIp:
                                                                e
                                                                    .target
                                                                    .value,
                                                        }
                                                    )
                                                }
                                                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all duration-200"
                                                placeholder="103.145.220.11"
                                            />

                                        </div>

                                        <div>

                                            <label className="block text-[10px] text-slate-500 mb-0.5 font-medium">
                                                Secondary ONU MAC/SN
                                            </label>

                                            <input
                                                type="text"
                                                value={
                                                    clientForm.secondaryOnu
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    setClientForm(
                                                        {
                                                            ...clientForm,
                                                            secondaryOnu:
                                                                e
                                                                    .target
                                                                    .value,
                                                        }
                                                    )
                                                }
                                                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all duration-200"
                                                placeholder="ZTE78901234"
                                            />

                                        </div>

                                    </div>

                                </div>

                            </div>

                            {/* Location */}
                            <div className="space-y-3">

                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-600 border-b border-slate-100 pb-1.5">

                                    <span className="material-symbols-outlined text-base">
                                        location_on
                                    </span>

                                    Location & Contact

                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">

                                    {/* POC */}
                                    <div>

                                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                                            Point of Contact (POC)
                                        </label>

                                        <div className="relative">

                                            <select
                                                value={
                                                    clientForm.pocId
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    setClientForm(
                                                        {
                                                            ...clientForm,
                                                            pocId:
                                                                e
                                                                    .target
                                                                    .value,
                                                        }
                                                    )
                                                }
                                                className="appearance-none w-full text-xs p-2.5 pr-9 bg-slate-50/80 border border-slate-200 rounded-xl cursor-pointer focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all duration-200"
                                            >

                                                <option value="">
                                                    Select Point of Contact...
                                                </option>

                                                {pocs.map(
                                                    (
                                                        poc
                                                    ) => (
                                                        <option
                                                            key={
                                                                poc.id
                                                            }
                                                            value={poc.id.toString()}
                                                        >
                                                            {
                                                                poc.name
                                                            }
                                                        </option>
                                                    )
                                                )}

                                            </select>

                                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-base pointer-events-none">
                                                expand_more
                                            </span>

                                        </div>

                                    </div>

                                    {/* Location */}
                                    <div>

                                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                                            Location Address
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                clientForm.location
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                setClientForm(
                                                    {
                                                        ...clientForm,
                                                        location:
                                                            e
                                                                .target
                                                                .value,
                                                    }
                                                )
                                            }
                                            className="w-full text-xs p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all duration-200"
                                            placeholder="Floor 4, Building B, Agrabad C/A"
                                        />

                                    </div>

                                    {/* Description */}
                                    <div className="md:col-span-2">

                                        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                                            Description / Remarks
                                        </label>

                                        <textarea
                                            rows={2}
                                            value={
                                                clientForm.description
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                setClientForm(
                                                    {
                                                        ...clientForm,
                                                        description:
                                                            e
                                                                .target
                                                                .value,
                                                    }
                                                )
                                            }
                                            className="w-full text-xs p-2.5 bg-slate-50/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all duration-200 resize-none"
                                            placeholder="Additional notes about connectivity or setup..."
                                        />

                                    </div>

                                </div>

                            </div>

                            {/* Buttons */}
                            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsClientModalOpen(
                                            false
                                        )
                                    }
                                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all duration-200 cursor-pointer"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className={`px-5 py-2.5 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.98] flex items-center gap-1.5 ${editingClient
                                        ? 'bg-orange-500 hover:bg-orange-600'
                                        : 'bg-teal-600 hover:bg-teal-700'
                                        }`}
                                >

                                    <span className="material-symbols-outlined text-base">
                                        {editingClient
                                            ? 'save'
                                            : 'check'}
                                    </span>

                                    {editingClient
                                        ? 'Update Client'
                                        : 'Save Client'}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

            {/* ==================================================
                POC MANAGEMENT MODAL
            ================================================== */}
            {isPocManagementOpen && (
                <div
                    onClick={() =>
                        setIsPocManagementOpen(
                            false
                        )
                    }
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                >

                    <div
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200"
                    >

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">

                            <div className="flex items-center gap-3">

                                <div className="h-10 w-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
                                    <span className="material-symbols-outlined">
                                        manage_accounts
                                    </span>
                                </div>

                                <div>

                                    <h2 className="text-base font-bold text-slate-800">
                                        POC Management
                                    </h2>

                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        Add, edit or delete Point of Connections
                                    </p>

                                </div>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setIsPocManagementOpen(
                                        false
                                    )
                                }
                                className="h-8 w-8 rounded-full bg-slate-50 hover:bg-red-50 hover:text-red-500 text-slate-400 flex items-center justify-center transition-all duration-200 cursor-pointer hover:rotate-90"
                            >
                                <span className="material-symbols-outlined text-lg">
                                    close
                                </span>
                            </button>

                        </div>

                        {/* List */}
                        <div className="p-5">

                            {pocs.length ===
                                0 ? (
                                <div className="text-center py-10">

                                    <div className="h-14 w-14 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-2xl">
                                            person_off
                                        </span>
                                    </div>

                                    <p className="text-sm font-semibold text-slate-600 mt-3">
                                        No POC found
                                    </p>

                                    <p className="text-xs text-slate-400 mt-1">
                                        Add your first Point of Connection.
                                    </p>

                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[420px] overflow-y-auto custom-scrollbar pr-1">

                                    {pocs.map(
                                        (
                                            poc
                                        ) => (
                                            <div
                                                key={
                                                    poc.id
                                                }
                                                className="group flex items-center justify-between gap-3 p-3 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-teal-200 hover:shadow-sm transition-all duration-200"
                                            >

                                                <div className="flex items-center gap-3 min-w-0">

                                                    <div className="h-10 w-10 shrink-0 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                                                        <span className="material-symbols-outlined text-lg">
                                                            hub
                                                        </span>
                                                    </div>

                                                    <div className="min-w-0">

                                                        <p className="text-xs font-bold text-slate-800 truncate">
                                                            {
                                                                poc.name
                                                            }
                                                        </p>

                                                        <p className="text-[10px] text-slate-400 mt-0.5">
                                                            POC ID:{' '}
                                                            {
                                                                poc.id
                                                            }
                                                        </p>

                                                    </div>

                                                </div>

                                                <div className="flex items-center gap-1.5 shrink-0">

                                                    {/* Edit */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleEditPoc(
                                                                poc
                                                            )
                                                        }
                                                        title="Edit POC"
                                                        className="h-9 w-9 rounded-xl bg-orange-50 border border-orange-100 text-orange-500 hover:bg-orange-100 hover:border-orange-200 hover:text-orange-600 flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
                                                    >
                                                        <span className="material-symbols-outlined text-base">
                                                            edit
                                                        </span>
                                                    </button>

                                                    {/* Delete */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setDeletePocTargetId(
                                                                poc.id.toString()
                                                            )
                                                        }
                                                        title="Delete POC"
                                                        className="h-9 w-9 rounded-xl bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 hover:border-red-200 hover:text-red-600 flex items-center justify-center transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95"
                                                    >
                                                        <span className="material-symbols-outlined text-base">
                                                            delete
                                                        </span>
                                                    </button>

                                                </div>

                                            </div>
                                        )
                                    )}

                                </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between gap-2 mt-5 pt-4 border-t border-slate-100">

                                <p className="text-[11px] text-slate-400">
                                    Total POCs:{' '}
                                    <span className="font-bold text-slate-600">
                                        {
                                            pocs.length
                                        }
                                    </span>
                                </p>

                                <div className="flex items-center gap-2">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setIsPocManagementOpen(
                                                false
                                            )
                                        }
                                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all duration-200 cursor-pointer"
                                    >
                                        Close
                                    </button>

                                    <button
                                        type="button"
                                        onClick={
                                            handleOpenAddPoc
                                        }
                                        className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm hover:shadow-md active:scale-[0.98]"
                                    >
                                        <span className="material-symbols-outlined text-base">
                                            add
                                        </span>

                                        Add POC
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>
            )}

            {/* ==================================================
                ADD / EDIT POC MODAL
            ================================================== */}
            {isPocModalOpen && (
                <div
                    onClick={() =>
                        setIsPocModalOpen(
                            false
                        )
                    }
                    className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                >

                    <div
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                        className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200"
                    >

                        {/* Header */}
                        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">

                            <div className="flex items-center gap-3">

                                <div
                                    className={`h-10 w-10 rounded-2xl flex items-center justify-center ${editingPoc
                                        ? 'bg-orange-50 text-orange-600'
                                        : 'bg-teal-50 text-teal-600'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-xl">
                                        {editingPoc
                                            ? 'edit'
                                            : 'hub'}
                                    </span>
                                </div>

                                <div>

                                    <h2 className="text-sm font-bold text-slate-800">
                                        {editingPoc
                                            ? 'Edit Point of Connection'
                                            : 'Add Point of Connection'}
                                    </h2>

                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                        {editingPoc
                                            ? 'Update POC information'
                                            : 'Create a new POC'}
                                    </p>

                                </div>

                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setIsPocModalOpen(
                                        false
                                    );
                                    setEditingPoc(
                                        null
                                    );
                                }}
                                className="h-8 w-8 rounded-full bg-slate-50 hover:bg-red-50 hover:text-red-500 text-slate-400 flex items-center justify-center transition-all duration-200 cursor-pointer hover:rotate-90"
                            >
                                <span className="material-symbols-outlined text-lg">
                                    close
                                </span>
                            </button>

                        </div>

                        {/* Form */}
                        <form
                            onSubmit={
                                handleSavePoc
                            }
                            className="p-6 space-y-5"
                        >

                            <div>

                                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                                    POC Name{' '}
                                    <span className="text-red-500">
                                        *
                                    </span>
                                </label>

                                <div className="relative">

                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">
                                        hub
                                    </span>

                                    <input
                                        type="text"
                                        required
                                        autoFocus
                                        value={
                                            pocForm.name
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setPocForm(
                                                {
                                                    ...pocForm,
                                                    name:
                                                        e
                                                            .target
                                                            .value,
                                                }
                                            )
                                        }
                                        className="w-full text-xs pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200"
                                        placeholder="e.g. Agrabad POP Connection"
                                    />

                                </div>

                            </div>

                            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">

                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsPocModalOpen(
                                            false
                                        );
                                        setEditingPoc(
                                            null
                                        );
                                    }}
                                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all duration-200 cursor-pointer"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className={`px-5 py-2.5 text-white rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md active:scale-[0.98] flex items-center gap-1.5 ${editingPoc
                                        ? 'bg-orange-500 hover:bg-orange-600'
                                        : 'bg-teal-600 hover:bg-teal-700'
                                        }`}
                                >

                                    <span className="material-symbols-outlined text-base">
                                        {editingPoc
                                            ? 'save'
                                            : 'check'}
                                    </span>

                                    {editingPoc
                                        ? 'Update POC'
                                        : 'Save POC'}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
}