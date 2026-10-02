'use client';
import React, { useState, useMemo } from 'react';
import { Search, Tag } from 'lucide-react';

export function EquipmentTable({ currentFileEquipment = [] }) {
    const [search, setSearch] = useState('');

    const filtered = useMemo(() => {
        if (!search.trim()) return currentFileEquipment;
        const q = search.toLowerCase().trim();
        return currentFileEquipment.filter(eq => {
            const tag = (eq.pid_tag || eq.equipment_id || eq.normalized_asset || '').toLowerCase();
            const type = (eq.equipment_type || '').toLowerCase();
            const desc = (eq.description || '').toLowerCase();
            return tag.includes(q) || type.includes(q) || desc.includes(q);
        });
    }, [currentFileEquipment, search]);

    return (
        <div>
            {/* Header info bar */}
            <div className="px-6 py-3 bg-warning/10 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-warning font-semibold">
                    <Tag size={14} className="shrink-0" />
                    <span>
                        No connectivity (From → To) extracted for this file. <strong>{currentFileEquipment.length}</strong> equipment tag(s) detected:
                    </span>
                </div>
                {currentFileEquipment.length > 8 && (
                    <div className="relative w-full sm:w-64">
                        <Search size={13} className="absolute left-2.5 top-2.5 text-text-subtle pointer-events-none" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Filter tags..."
                            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:border-brand"
                        />
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="overflow-auto max-h-[420px]">
                <table className="w-full text-left text-sm border-collapse">
                    <thead className="sticky top-0 z-10 bg-surface-2 border-b border-border select-none">
                        <tr className="text-text-muted text-caption uppercase tracking-wider font-bold">
                            <th className="w-12 px-4 py-3 text-center">#</th>
                            <th className="px-6 py-3 font-bold">Tag / Equipment ID</th>
                            <th className="px-6 py-3 font-bold">Type</th>
                            <th className="px-6 py-3 font-bold">Description</th>
                            <th className="px-6 py-3 font-bold">Source File</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-text-secondary">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-10 text-center text-text-subtle text-xs italic">
                                    No equipment tags matched &quot;{search}&quot;.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((eq, i) => {
                                const tag = eq.pid_tag || eq.equipment_id || eq.normalized_asset || '';
                                return (
                                    <tr key={eq.pid_uid || `${tag}-${i}`} className="hover:bg-surface-2/60 transition-colors">
                                        <td className="px-4 py-2.5 text-center font-mono text-caption text-text-subtle">{i + 1}</td>
                                        <td className="px-6 py-2.5 font-mono text-xs font-semibold text-text-primary">
                                            {tag || <span className="text-text-subtle font-sans italic">—</span>}
                                        </td>
                                        <td className="px-6 py-2.5 text-xs">
                                            {eq.equipment_type ? (
                                                <span className="px-2 py-0.5 rounded bg-surface-2 text-text-secondary text-caption font-medium border border-border">
                                                    {eq.equipment_type}
                                                </span>
                                            ) : (
                                                <span className="text-text-subtle italic text-caption">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-2.5 text-xs text-text-muted">
                                            {eq.description || <span className="text-text-subtle italic text-caption">—</span>}
                                        </td>
                                        <td className="px-6 py-2.5 text-caption font-mono text-text-subtle truncate max-w-xs" title={eq.source_file}>
                                            {eq.source_file || <span className="italic">—</span>}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
