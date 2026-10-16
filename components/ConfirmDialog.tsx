// 'use client';

// import React from 'react';

// interface ConfirmDialogProps {
//     isOpen: boolean;
//     title: string;
//     message: string;
//     onConfirm: () => void;
//     onCancel: () => void;
// }

// export default function ConfirmDialog({
//     isOpen,
//     title,
//     message,
//     onConfirm,
//     onCancel,
// }: ConfirmDialogProps) {
//     if (!isOpen) return null;

//     return (
//         <div
//             onClick={onCancel}
//             className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in p-4"
//         >
//             <div
//                 onClick={(e) => e.stopPropagation()}
//                 className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-2xl transition-all duration-300 animate-in zoom-in-95 border border-slate-100"
//             >
//                 <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4">
//                     <span className="material-symbols-outlined text-2xl">warning</span>
//                 </div>

//                 <h3 className="text-center text-base font-bold text-slate-800">{title}</h3>
//                 <p className="mt-2 text-center text-xs text-slate-500 leading-relaxed">{message}</p>

//                 <div className="mt-6 flex items-center justify-center gap-3">
//                     <button
//                         onClick={onCancel}
//                         className="w-full rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
//                     >
//                         Cancel
//                     </button>
//                     <button
//                         onClick={onConfirm}
//                         className="w-full rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-rose-700 shadow-md transition cursor-pointer"
//                     >
//                         Yes, Delete
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// }




'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
    onCancel: () => void;
}

export default function ConfirmDialog({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async () => {
        try {
            setIsLoading(true);
            await onConfirm();
        } catch (error) {
            console.error('Confirmation action failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop Animation */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => !isLoading && onCancel()}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
                    />

                    {/* Modal Box Animation */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white p-6 text-left shadow-2xl border border-slate-100"
                    >
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4 shadow-sm">
                            <span className="material-symbols-outlined text-2xl">warning</span>
                        </div>

                        <h3 className="text-center text-base font-bold text-slate-800">{title}</h3>
                        <p className="mt-2 text-center text-xs text-slate-500 leading-relaxed">{message}</p>

                        <div className="mt-6 flex items-center justify-center gap-3">
                            <button
                                type="button"
                                disabled={isLoading}
                                onClick={onCancel}
                                className="w-full rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isLoading}
                                onClick={handleConfirm}
                                className="w-full rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-rose-700 shadow-md transition cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <motion.span
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                            className="material-symbols-outlined text-base"
                                        >
                                            progress_activity
                                        </motion.span>
                                        <span>Deleting...</span>
                                    </>
                                ) : (
                                    <span>Yes, Delete</span>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}