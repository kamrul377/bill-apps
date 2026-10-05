// 'use client';

// import React from 'react';
// import { ClientInfo } from '@/types/client';

// interface ClientDetailsModalProps {
//     client: ClientInfo | null;
//     onClose: () => void;
//     onEdit: (client: ClientInfo) => void;
// }

// export default function ClientDetailsModal({ client, onClose, onEdit }: ClientDetailsModalProps) {
//     if (!client) return null;

//     return (
//         <div
//             onClick={onClose}
//             className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in p-4"
//         >
//             <div
//                 onClick={(e) => e.stopPropagation()}
//                 className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all duration-300 animate-in zoom-in-95 border border-slate-100 space-y-5"
//             >
//                 {/* Header */}
//                 <div className="flex justify-between items-start border-b border-slate-100 pb-4">
//                     <div className="space-y-1">
//                         <span className="text-[10px] uppercase font-bold text-teal-600 tracking-widest bg-teal-50 px-2 py-0.5 rounded-md">
//                             Client Details
//                         </span>
//                         <h2 className="text-lg font-bold text-slate-900">{client.clientName}</h2>
//                         <div className="flex items-center gap-2">
//                             <span className="inline-block px-2 py-0.5 bg-slate-100 font-mono text-[11px] font-medium rounded text-slate-600 border border-slate-200">
//                                 ID: {client.clientId}
//                             </span>
//                             {client.clientPhone && (
//                                 <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-50 text-teal-700 font-mono text-[11px] font-medium rounded border border-teal-100">
//                                     <span className="material-symbols-outlined text-xs">call</span>
//                                     {client.clientPhone}
//                                 </span>
//                             )}
//                         </div>
//                     </div>
//                     <button
//                         onClick={onClose}
//                         className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
//                     >
//                         ✕
//                     </button>
//                 </div>

//                 {/* Content */}
//                 <div className="space-y-3.5 text-xs">
//                     {/* Status & Date */}
//                     <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
//                         <div>
//                             <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status</div>
//                             <span
//                                 className={`inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${client.status === 'Connected'
//                                     ? 'bg-emerald-100 text-emerald-800'
//                                     : 'bg-rose-100 text-rose-800'
//                                     }`}
//                             >
//                                 <span className={`h-1.5 w-1.5 rounded-full ${client.status === 'Connected' ? 'bg-emerald-600' : 'bg-rose-600'}`} />
//                                 {client.status}
//                             </span>
//                         </div>
//                         <div>
//                             <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Created Date</div>
//                             <div className="font-semibold text-slate-700 mt-1">{client.createdAt || 'N/A'}</div>
//                         </div>
//                     </div>

//                     {/* IP Network Details */}
//                     <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 font-mono">
//                         <div>
//                             <div className="text-[10px] uppercase font-bold text-slate-400 font-sans tracking-wider">Primary Link</div>
//                             <div className="text-slate-800 font-bold mt-1">IP: {client.primaryIp || '-'}</div>
//                             <div className="text-slate-500 text-[11px] mt-0.5">ONU: {client.primaryOnu || '-'}</div>
//                         </div>
//                         <div>
//                             <div className="text-[10px] uppercase font-bold text-slate-400 font-sans tracking-wider">Secondary Link</div>
//                             <div className="text-slate-800 font-bold mt-1">IP: {client.secondaryIp || '-'}</div>
//                             <div className="text-slate-500 text-[11px] mt-0.5">ONU: {client.secondaryOnu || '-'}</div>
//                         </div>
//                     </div>

//                     {/* Full Location Text */}
//                     <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
//                         <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Full Location</div>
//                         <div className="text-slate-800 font-medium mt-1 leading-relaxed whitespace-pre-wrap">
//                             {client.location || 'No location address provided.'}
//                         </div>
//                     </div>

//                     {/* POC Info */}
//                     <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
//                         <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">Point of Contact</div>
//                         <div className="text-slate-800 font-semibold mt-1">{client.pocName || 'N/A'}</div>
//                     </div>

//                     {/* Description */}
//                     {client.description && (
//                         <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
//                             <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Description</div>
//                             <div className="text-slate-700 mt-1 leading-relaxed whitespace-pre-wrap">{client.description}</div>
//                         </div>
//                     )}
//                 </div>

//                 {/* Footer Actions */}
//                 <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
//                     <button
//                         onClick={() => {
//                             onClose();
//                             onEdit(client);
//                         }}
//                         className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-teal-700 transition cursor-pointer"
//                     >
//                         Edit Client
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// }
'use client';

import React, { useState } from 'react';
import { ClientInfo } from '@/types/client';

interface ClientDetailsModalProps {
    client: ClientInfo | null;
    onClose: () => void;
    onEdit: (client: ClientInfo) => void;
}

export default function ClientDetailsModal({ client, onClose, onEdit }: ClientDetailsModalProps) {
    const [copied, setCopied] = useState(false);

    if (!client) return null;

    const handleCopyClientInfo = () => {
        const textToCopy = `Client id : ${client.clientId || '-'}
Client Name : ${client.clientName || '-'}
Phone : ${client.clientPhone || '-'}
Primary ip & onu : ${client.primaryIp || '-'} / ${client.primaryOnu || '-'}
Secondary ip & onu : ${client.secondaryIp || '-'} / ${client.secondaryOnu || '-'}
Location : ${client.location || '-'}
POC : ${client.pocName || '-'}`;

        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in p-4"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 shadow-2xl transition-all duration-300 animate-in zoom-in-95 border border-slate-100 space-y-5"
            >
                {/* Header */}
                <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                    <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-teal-600 tracking-widest bg-teal-50 px-2 py-0.5 rounded-md">
                            Client Details
                        </span>
                        <h2 className="text-lg font-bold text-slate-900">{client.clientName}</h2>
                        <div className="flex items-center gap-2">
                            <span className="inline-block px-2 py-0.5 bg-slate-100 font-mono text-[11px] font-medium rounded text-slate-600 border border-slate-200">
                                ID: {client.clientId}
                            </span>
                            {client.clientPhone && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-50 text-teal-700 font-mono text-[11px] font-medium rounded border border-teal-100">
                                    <span className="material-symbols-outlined text-xs">call</span>
                                    {client.clientPhone}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Copy Button in Header */}
                        <button
                            onClick={handleCopyClientInfo}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${copied
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/80'
                                }`}
                            title="Copy Info"
                        >
                            <span className="material-symbols-outlined text-sm">
                                {copied ? 'check_circle' : 'content_copy'}
                            </span>
                            {copied ? 'Copied!' : 'Copy'}
                        </button>

                        <button
                            onClick={onClose}
                            className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-3.5 text-xs">
                    {/* Status & Date */}
                    <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                        <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status</div>
                            <span
                                className={`inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${client.status === 'Connected'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                    }`}
                            >
                                <span className={`h-1.5 w-1.5 rounded-full ${client.status === 'Connected' ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                                {client.status}
                            </span>
                        </div>
                        <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Created Date</div>
                            <div className="font-semibold text-slate-700 mt-1">{client.createdAt || 'N/A'}</div>
                        </div>
                    </div>

                    {/* IP Network Details */}
                    <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 font-mono">
                        <div>
                            <div className="text-[10px] uppercase font-bold text-slate-400 font-sans tracking-wider">Primary Link</div>
                            <div className="text-slate-800 font-bold mt-1">IP: {client.primaryIp || '-'}</div>
                            <div className="text-slate-500 text-[11px] mt-0.5">ONU: {client.primaryOnu || '-'}</div>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase font-bold text-slate-400 font-sans tracking-wider">Secondary Link</div>
                            <div className="text-slate-800 font-bold mt-1">IP: {client.secondaryIp || '-'}</div>
                            <div className="text-slate-500 text-[11px] mt-0.5">ONU: {client.secondaryOnu || '-'}</div>
                        </div>
                    </div>

                    {/* Full Location Text */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Full Location</div>
                        <div className="text-slate-800 font-medium mt-1 leading-relaxed whitespace-pre-wrap">
                            {client.location || 'No location address provided.'}
                        </div>
                    </div>

                    {/* POC Info */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">Point of Contact</div>
                        <div className="text-slate-800 font-semibold mt-1">{client.pocName || 'N/A'}</div>
                    </div>

                    {/* Description */}
                    {client.description && (
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Description</div>
                            <div className="text-slate-700 mt-1 leading-relaxed whitespace-pre-wrap">{client.description}</div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <button
                        onClick={handleCopyClientInfo}
                        className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-base">
                            {copied ? 'check_circle' : 'content_copy'}
                        </span>
                        {copied ? 'Copied to Clipboard!' : 'Copy Info'}
                    </button>

                    <button
                        onClick={() => {
                            onClose();
                            onEdit(client);
                        }}
                        className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-semibold hover:bg-teal-700 transition cursor-pointer"
                    >
                        Edit Client
                    </button>
                </div>
            </div>
        </div>
    );
}