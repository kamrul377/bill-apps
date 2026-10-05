'use client';

import React, { useEffect, useState } from 'react';

interface POCItem {
    id: string;
    name: string;
}

export default function PocManagement() {
    const [pocs, setPocs] = useState<POCItem[]>([]);

    const [isPocModalOpen, setIsPocModalOpen] = useState<boolean>(false);
    const [editingPocId, setEditingPocId] = useState<string | null>(null);
    const [pocName, setPocName] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);

    // =========================
    // LOAD POC FROM DATABASE
    // =========================
    const fetchPocs = async () => {
        try {
            setLoading(true);

            const response = await fetch('/api/pocs');

            if (!response.ok) {
                throw new Error('Failed to fetch POCs');
            }

            const data = await response.json();

            setPocs(
                data.map((poc: any) => ({
                    id: String(poc.id),
                    name: poc.name,
                }))
            );
        } catch (error) {
            console.error('Error loading POCs:', error);
            alert('Failed to load POC list.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPocs();
    }, []);

    // =========================
    // OPEN ADD MODAL
    // =========================
    const handleOpenAddModal = () => {
        setEditingPocId(null);
        setPocName('');
        setIsPocModalOpen(true);
    };

    // =========================
    // OPEN EDIT MODAL
    // =========================
    const handleOpenEditModal = (poc: POCItem) => {
        setEditingPocId(poc.id);
        setPocName(poc.name);
        setIsPocModalOpen(true);
    };

    // =========================
    // DELETE POC FROM DATABASE
    // =========================
    const handleDeletePoc = async (id: string) => {
        const confirmed = confirm(
            'Are you sure you want to delete this Point of Connection?'
        );

        if (!confirmed) return;

        try {
            const response = await fetch(`/api/pocs/${id}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete POC');
            }

            // Remove from UI after successful DB delete
            setPocs((prev) => prev.filter((p) => p.id !== id));

            alert('POC deleted successfully.');
        } catch (error: any) {
            console.error('Delete POC error:', error);
            alert(error.message || 'Failed to delete POC.');
        }
    };

    // =========================
    // ADD / UPDATE POC
    // =========================
    const handleSavePoc = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedName = pocName.trim();

        if (!trimmedName) {
            alert('Please enter POC name.');
            return;
        }

        try {
            setSaving(true);

            // =========================
            // UPDATE EXISTING POC
            // =========================
            if (editingPocId) {
                const response = await fetch(`/api/pocs/${editingPocId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: trimmedName,
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to update POC');
                }

                // Update UI
                setPocs((prev) =>
                    prev.map((poc) =>
                        poc.id === editingPocId
                            ? {
                                ...poc,
                                name: trimmedName,
                            }
                            : poc
                    )
                );

                alert('POC updated successfully.');
            }

            // =========================
            // ADD NEW POC
            // =========================
            else {
                const response = await fetch('/api/pocs', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: trimmedName,
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Failed to add POC');
                }

                const newPoc: POCItem = {
                    id: String(data.id),
                    name: data.name,
                };

                setPocs((prev) => [...prev, newPoc]);

                alert('POC added successfully.');
            }

            // Reset modal
            setIsPocModalOpen(false);
            setPocName('');
            setEditingPocId(null);
        } catch (error: any) {
            console.error('POC save error:', error);
            alert(error.message || 'Failed to save POC.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-4">
            {/* =========================
                POC LIST
            ========================= */}
            <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-sm font-bold text-slate-800">
                            Point of Connection (POC)
                        </h3>

                        <p className="text-[11px] text-slate-400">
                            Manage connection points
                        </p>
                    </div>

                    <button
                        onClick={handleOpenAddModal}
                        className="px-3 py-1.5 bg-teal-600 text-white text-xs font-semibold rounded-xl hover:bg-teal-700 transition flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                        <span className="material-symbols-outlined text-sm">
                            add
                        </span>

                        Add POC
                    </button>
                </div>

                {/* =========================
                    LOADING
                ========================= */}
                {loading ? (
                    <div className="text-center py-6 text-xs text-slate-400">
                        Loading POCs...
                    </div>
                ) : (
                    <div className="grid gap-2">
                        {pocs.map((poc) => (
                            <div
                                key={poc.id}
                                className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-xl hover:border-slate-300 transition"
                            >
                                <div className="flex items-center gap-2.5">
                                    <span className="material-symbols-outlined text-slate-400 text-base">
                                        hub
                                    </span>

                                    <span className="text-xs font-bold text-slate-800">
                                        {poc.name}
                                    </span>
                                </div>

                                {/* =========================
                                    EDIT + DELETE
                                ========================= */}
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() =>
                                            handleOpenEditModal(poc)
                                        }
                                        className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition cursor-pointer"
                                        title="Edit POC Name"
                                    >
                                        <span className="material-symbols-outlined text-base">
                                            edit
                                        </span>
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleDeletePoc(poc.id)
                                        }
                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                        title="Delete POC"
                                    >
                                        <span className="material-symbols-outlined text-base">
                                            delete
                                        </span>
                                    </button>
                                </div>
                            </div>
                        ))}

                        {pocs.length === 0 && (
                            <div className="text-center py-6 text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                No Point of Connection added yet.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* =========================
                MODAL
            ========================= */}
            {isPocModalOpen && (
                <div
                    onClick={() => {
                        if (!saving) {
                            setIsPocModalOpen(false);
                        }
                    }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in p-4"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-sm transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-300 animate-in zoom-in-95 border border-slate-100 flex flex-col"
                    >
                        {/* HEADER */}
                        <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                                <div className="h-9 w-9 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-lg">
                                        hub
                                    </span>
                                </div>

                                <div>
                                    <h2 className="text-sm font-bold text-slate-800 tracking-tight">
                                        {editingPocId
                                            ? 'Edit POC Name'
                                            : 'Add POC'}
                                    </h2>

                                    <p className="text-[10px] text-slate-400 font-medium">
                                        Point of Connection
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                disabled={saving}
                                onClick={() => setIsPocModalOpen(false)}
                                className="h-7 w-7 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition cursor-pointer text-xs disabled:opacity-50"
                            >
                                ✕
                            </button>
                        </div>

                        {/* FORM */}
                        <form
                            onSubmit={handleSavePoc}
                            className="p-5 space-y-4"
                        >
                            <div>
                                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                                    POC Name{' '}
                                    <span className="text-rose-500">*</span>
                                </label>

                                <div className="relative flex items-center">
                                    <span className="absolute left-3 text-slate-400 pointer-events-none flex items-center">
                                        <span className="material-symbols-outlined text-base">
                                            link
                                        </span>
                                    </span>

                                    <input
                                        type="text"
                                        required
                                        autoFocus
                                        value={pocName}
                                        disabled={saving}
                                        onChange={(e) =>
                                            setPocName(e.target.value)
                                        }
                                        className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition font-medium text-slate-800 disabled:opacity-50"
                                        placeholder="e.g. Agrabad POP Connection"
                                    />
                                </div>
                            </div>

                            {/* FOOTER BUTTONS */}
                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    disabled={saving}
                                    onClick={() =>
                                        setIsPocModalOpen(false)
                                    }
                                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-base">
                                        {saving ? 'hourglass_empty' : 'check'}
                                    </span>

                                    {saving
                                        ? 'Saving...'
                                        : editingPocId
                                            ? 'Update'
                                            : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}