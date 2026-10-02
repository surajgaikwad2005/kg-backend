'use client';
import React from 'react';
import { Pause, Play, Trash2, Edit3, MoreVertical } from 'lucide-react';
import { ENV_COLORS } from '../_lib/cronUtils';

export function DeploymentRow({
    dep,
    openMenuId,
    setOpenMenuId,
    setMenuPosition,
    handlePauseUnpause,
    handleRunInference,
    handleOpenEditModal,
    handleDelete,
    menuPosition,
}) {
    const envKey = (dep.environment || 'prod').toLowerCase();
    const envBadgeClass = ENV_COLORS[envKey] || ENV_COLORS.prod;
    const isActive = dep.status === 'active';

    return (
        <tr className="hover:bg-canvas/50 transition-colors group">
            <td className="px-6 py-4 font-bold text-text-primary">
                {dep.deployment_id}
            </td>

            <td className="px-6 py-4 font-semibold text-text-secondary">
                {dep.experiment_id}
            </td>

            <td className="px-6 py-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${envBadgeClass}`}>
                    {dep.environment || 'prod'}
                </span>
            </td>

            <td className="px-6 py-4">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-canvas border border-border">
                    <div className={`h-2 w-2 rounded-full ${isActive ? 'bg-success animate-pulse' : 'bg-text-subtle'}`} />
                    <span className={isActive ? 'text-success' : 'text-text-subtle'}>
                        {dep.status || 'inactive'}
                    </span>
                </span>
            </td>

            <td className="px-6 py-4">
                <code className="font-mono text-xs bg-canvas px-2.5 py-1 rounded border border-border text-text-primary">
                    {dep.cron_schedule || 'N/A'}
                </code>
            </td>

            <td className="px-6 py-4 text-text-muted text-sm font-medium">
                {dep.created_by || 'System'}
            </td>

            {/* Actions Column — 3-Dots Dropdown Pattern */}
            <td className="px-6 py-4 text-right">
                <div className="relative inline-block text-left">
                    <button
                        aria-label="Deployment actions"
                        onClick={e => {
                            e.stopPropagation();
                            if (openMenuId === dep.deployment_id) {
                                setOpenMenuId(null);
                                setMenuPosition(null);
                            } else {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setMenuPosition({ top: rect.bottom + 4, left: rect.right - 160 });
                                setOpenMenuId(dep.deployment_id);
                            }
                        }}
                        className="text-text-subtle hover:text-text-primary p-1.5 rounded-lg hover:bg-surface-2 transition-colors cursor-pointer"
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>

                    {openMenuId === dep.deployment_id && menuPosition && (
                        <div
                            className="fixed z-50 w-44 bg-surface border border-border rounded-xl shadow-xl overflow-hidden py-1"
                            style={{ top: menuPosition.top, left: menuPosition.left }}
                        >
                            <button
                                onClick={e => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    handlePauseUnpause(dep);
                                }}
                                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2.5 cursor-pointer font-medium ${
                                    isActive ? 'text-amber-600 hover:bg-amber-500/10' : 'text-emerald-600 hover:bg-emerald-500/10'
                                }`}
                            >
                                {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                <span>{isActive ? 'Pause' : 'Resume'}</span>
                            </button>

                            <button
                                onClick={e => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    handleOpenEditModal(dep);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-canvas flex items-center gap-2.5 cursor-pointer font-medium"
                            >
                                <Edit3 className="w-4 h-4 text-text-subtle" />
                                <span>Modify</span>
                            </button>

                            <button
                                onClick={e => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    handleDelete(dep);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-danger/10 flex items-center gap-2.5 cursor-pointer font-medium"
                            >
                                <Trash2 className="w-4 h-4 text-danger" />
                                <span>Delete</span>
                            </button>
                        </div>
                    )}
                </div>
            </td>
        </tr>
    );
}
