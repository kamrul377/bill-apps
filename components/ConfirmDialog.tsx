'use client';

import React from 'react';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    if (!isOpen) return null;

    return (
        <div
            onClick={onCancel}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in p-4"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-2xl transition-all duration-300 animate-in zoom-in-95 border border-slate-100"
            >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4">
                    <span className="material-symbols-outlined text-2xl">warning</span>
                </div>

                <h3 className="text-center text-base font-bold text-slate-800">{title}</h3>
                <p className="mt-2 text-center text-xs text-slate-500 leading-relaxed">{message}</p>

                <div className="mt-6 flex items-center justify-center gap-3">
                    <button
                        onClick={onCancel}
                        className="w-full rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="w-full rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-rose-700 shadow-md transition cursor-pointer"
                    >
                        Yes, Delete
                    </button>
                </div>
            </div>
        </div>
    );
}