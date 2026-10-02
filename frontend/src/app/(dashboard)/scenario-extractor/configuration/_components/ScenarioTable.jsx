'use client';
import React from 'react';
import { useDeleteScenario } from '../../_queries/useScenarioQueries';
import { useConfirm } from '@/src/components/ui/ConfirmModal';
import { Eye, Edit2, Trash2, Tag } from 'lucide-react';

export default function ScenarioTable({ scenarios, onEdit, onViewDetails }) {
    const deleteMutation = useDeleteScenario();
    const { openConfirm } = useConfirm();

    const handleDelete = async (scenario) => {
        const confirmed = await openConfirm({
            title: 'Delete Scenario',
            message: `Are you sure you want to delete scenario "${scenario.scenario_name}"? This action cannot be undone.`,
            confirmLabel: 'Delete',
            cancelLabel: 'Cancel',
            variant: 'danger'
        });

        if (confirmed) {
            deleteMutation.mutate(scenario.scenario_id);
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-border bg-surface-2/45">
                        <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-text-secondary">Scenario ID</th>
                        <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-text-secondary">Name</th>
                        <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-text-secondary">Asset</th>
                        <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-text-secondary">Tags</th>
                        <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-text-secondary">Start Time</th>
                        <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-text-secondary">End Time</th>
                        <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-text-secondary">Threshold</th>
                        <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-text-secondary">Created At</th>
                        <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wider text-text-secondary text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {scenarios.map((sc) => (
                        <tr key={sc.scenario_id} className="hover:bg-surface-2/20 transition-colors">
                            <td className="px-6 py-4 text-body font-bold text-text-primary tabular-nums">
                                {sc.scenario_id}
                            </td>
                            <td className="px-6 py-4 text-body font-black text-text-primary">
                                {sc.scenario_name}
                            </td>
                            <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-surface-2 border border-border-strong/10 text-xs font-semibold text-text-primary">
                                    {sc.asset}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1 max-w-48">
                                    {sc.tags.map((tag) => (
                                        <span key={tag} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-brand/5 border border-brand/10 text-brand text-3xs font-semibold">
                                            <Tag className="w-2.5 h-2.5" />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-xs font-bold text-text-primary">
                                {sc.start_time}
                            </td>
                            <td className="px-6 py-4 text-xs font-bold text-text-primary">
                                {sc.end_time}
                            </td>
                            <td className="px-6 py-4 text-body font-bold text-text-primary tabular-nums">
                                {sc.similarity_threshold}%
                            </td>
                            <td className="px-6 py-4 text-xs font-bold text-text-primary">
                                {sc.created_at}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                    <button
                                        onClick={() => onViewDetails(sc.scenario_id)}
                                        aria-label="View matching scenarios"
                                        className="p-1.5 hover:bg-surface-2 rounded-lg border border-transparent hover:border-border text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onEdit(sc)}
                                        aria-label="Edit scenario"
                                        className="p-1.5 hover:bg-surface-2 rounded-lg border border-transparent hover:border-border text-brand hover:text-brand-hover transition-all cursor-pointer"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(sc)}
                                        aria-label="Delete scenario"
                                        className="p-1.5 hover:bg-danger/10 hover:border-danger/25 rounded-lg border border-transparent text-danger hover:text-danger-hover transition-all cursor-pointer"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {scenarios.length === 0 && (
                        <tr>
                            <td colSpan={8} className="px-6 py-12 text-center text-text-muted">
                                No scenarios configured. Click "Create Scenario" to add a new profile.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
