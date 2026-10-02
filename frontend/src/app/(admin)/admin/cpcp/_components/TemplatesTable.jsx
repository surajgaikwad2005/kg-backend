'use client';

import { FileText, Clock, Plus } from 'lucide-react';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { StatusBadge } from './StatusBadge';

function SkeletonRows() {
    return Array.from({ length: 4 }).map((_, i) => (
        <tr key={i} className="border-b border-border/60 last:border-0" aria-busy="true">
            <td className="px-6 py-5">
                <div className="flex items-center gap-3.5">
                    <Skeleton delay={i * 0.06} className="w-10 h-10 rounded-xl shrink-0" />
                    <Skeleton delay={i * 0.06 + 0.02} className="h-4 w-48 rounded" />
                </div>
            </td>
            <td className="px-6 py-5"><Skeleton delay={i * 0.06 + 0.04} className="h-4 w-28 rounded" /></td>
            <td className="px-6 py-5"><Skeleton delay={i * 0.06 + 0.06} className="h-4 w-24 rounded" /></td>
            <td className="px-6 py-5"><Skeleton delay={i * 0.06 + 0.08} className="h-6 w-20 rounded-full" /></td>
        </tr>
    ));
}

export function TemplatesTable({ templates, loading, onRowClick, onCreateClick }) {
    return (
        <div className="bg-surface rounded-2xl shadow-sm border border-border/60 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-canvas/60 border-b border-border text-[11px] uppercase tracking-wider font-semibold text-text-muted">
                            <th className="px-6 py-5 whitespace-nowrap">Template Name</th>
                            <th className="px-6 py-5 whitespace-nowrap">Created By</th>
                            <th className="px-6 py-5 whitespace-nowrap">Date</th>
                            <th className="px-6 py-5 whitespace-nowrap">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 text-sm">
                        {loading ? (
                            <SkeletonRows />
                        ) : templates.length === 0 ? (
                            <tr>
                                <td colSpan={4}>
                                    <EmptyState
                                        icon={<FileText className="w-8 h-8" />}
                                        title="No CPCP templates yet"
                                        description="Create your first Consequence-of-Constrained-Path template to define an operational scope."
                                        action={
                                            <button
                                                onClick={onCreateClick}
                                                className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer"
                                            >
                                                <Plus className="w-4 h-4" /> New Template
                                            </button>
                                        }
                                    />
                                </td>
                            </tr>
                        ) : (
                            templates.map((template) => (
                                <tr
                                    key={template.id}
                                    onClick={() => onRowClick(template)}
                                    className="group hover:bg-brand-muted/40 cursor-pointer transition-colors"
                                >
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center text-text-muted group-hover:bg-brand-muted group-hover:text-brand transition-colors shrink-0">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <span className="font-semibold text-text-primary group-hover:text-brand transition-colors">
                                                {template.cpcpName || 'Untitled Template'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap text-text-secondary font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-surface-2 flex items-center justify-center text-[11px] text-text-muted font-bold shrink-0">
                                                {template.createdBy.charAt(0)}
                                            </div>
                                            {template.createdBy}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap text-text-muted">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 opacity-60" />
                                            {template.date}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 whitespace-nowrap">
                                        <StatusBadge status={template.status} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
