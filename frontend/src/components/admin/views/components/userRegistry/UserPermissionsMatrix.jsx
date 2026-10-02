'use client';

import React from 'react';
import { Check, ShieldAlert, Users } from 'lucide-react';

const ACTIONS = [
    { key: 'view', label: 'View' },
    { key: 'update', label: 'Update' },
    { key: 'create', label: 'Create' },
    { key: 'delete', label: 'Delete' },
];

export function UserPermissionsMatrix({
    users = [],
    features = [],
    permissionsMap = {},
    onTogglePermission,
    isLoading = false,
    error = null,
    onRetry,
}) {
    if (error) {
        return (
            <div className="bg-surface border border-danger/30 rounded-2xl p-8 text-center space-y-4 shadow-lg">
                <div className="w-12 h-12 rounded-full bg-danger/10 text-danger flex items-center justify-center mx-auto">
                    <ShieldAlert size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-text-primary">Failed to load permissions matrix</h3>
                    <p className="text-sm text-text-muted mt-1 max-w-md mx-auto">{error}</p>
                </div>
                {onRetry && (
                    <button
                        type="button"
                        onClick={onRetry}
                        className="bg-brand text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-brand-hover transition-colors cursor-pointer"
                    >
                        Try Again
                    </button>
                )}
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xl">
                <div className="p-6 border-b border-border bg-surface-2 flex items-center justify-between">
                    <div className="h-6 w-32 bg-surface rounded animate-pulse" />
                    <div className="h-6 w-64 bg-surface rounded animate-pulse" />
                </div>
                <div className="p-6 space-y-6">
                    {Array.from({ length: 5 }).map((_, rowIndex) => (
                        <div key={`skel-row-${rowIndex}`} className="flex items-center gap-6">
                            <div className="w-40 h-5 bg-surface-2 rounded animate-pulse shrink-0" />
                            <div className="flex-1 grid grid-cols-12 gap-4">
                                {Array.from({ length: 12 }).map((_, colIndex) => (
                                    <div
                                        key={`skel-cell-${colIndex}`}
                                        className="w-5 h-5 bg-surface-2 rounded-md animate-pulse justify-self-center"
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (users.length === 0 || features.length === 0) {
        return (
            <div className="bg-surface border border-border rounded-2xl p-12 text-center shadow-xl space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-surface-2 text-text-muted flex items-center justify-center mx-auto">
                    <Users size={24} />
                </div>
                <h3 className="text-lg font-bold text-text-primary">No data to display</h3>
                <p className="text-sm text-text-muted max-w-md mx-auto">
                    {users.length === 0
                        ? 'Select at least one user from the "FILTER USERS" dropdown to view permissions.'
                        : 'Select at least one feature from the "SELECT FEATURE" dropdown.'}
                </p>
            </div>
        );
    }

    return (
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[720px]">
                    <thead>
                        {/* Top Header: USER + Feature Columns */}
                        <tr className="border-b border-border bg-surface-2/60 text-xs font-bold text-text-muted uppercase tracking-wider">
                            <th className="py-4 px-6 min-w-[200px] w-1/4 align-bottom">
                                USER
                            </th>
                            {features.map((feature) => (
                                <th
                                    key={feature.id}
                                    colSpan={ACTIONS.length}
                                    className="py-3 px-4 text-center border-l border-border/60 uppercase tracking-wider font-bold text-text-primary"
                                >
                                    {feature.label}
                                </th>
                            ))}
                        </tr>

                        {/* Sub-Header: View, Update, Create, Delete */}
                        <tr className="border-b border-border bg-surface-2/30 text-xs font-semibold text-text-muted">
                            <th className="py-2 px-6" />
                            {features.map((feature) => (
                                <React.Fragment key={`subhead-${feature.id}`}>
                                    {ACTIONS.map((action, actionIdx) => (
                                        <th
                                            key={`sub-${feature.id}-${action.key}`}
                                            className={`py-3 px-3 text-center min-w-[72px] align-middle ${
                                                actionIdx === 0 ? 'border-l border-border/60' : ''
                                            }`}
                                        >
                                            <span className="text-text-secondary font-semibold text-xs tracking-tight whitespace-nowrap block text-center">
                                                {action.label}
                                            </span>
                                        </th>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-border/60 text-sm">
                        {users.map((user) => (
                            <tr
                                key={user.id}
                                className="hover:bg-surface-2/40 transition-colors group"
                            >
                                {/* User Name */}
                                <td className="py-4 px-6 font-semibold text-text-primary whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-brand-muted text-brand flex items-center justify-center text-xs font-bold shrink-0">
                                            {(user.name || 'U').slice(0, 2).toUpperCase()}
                                        </div>
                                        <div className="truncate">
                                            <div className="font-bold text-text-primary truncate">
                                                {user.name}
                                            </div>
                                            {user.email && (
                                                <div className="text-xs text-text-muted truncate font-normal">
                                                    {user.email}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>

                                {/* Checkbox Matrix Cells */}
                                {features.map((feature) => (
                                    <React.Fragment key={`row-${user.id}-${feature.id}`}>
                                        {ACTIONS.map((action, actionIdx) => {
                                            const isChecked =
                                                permissionsMap[String(user.id)]?.[String(feature.id)]?.[action.key] ?? false;
                                            return (
                                                <td
                                                    key={`cell-${user.id}-${feature.id}-${action.key}`}
                                                    className={`py-4 px-3 text-center align-middle min-w-[72px] ${
                                                        actionIdx === 0 ? 'border-l border-border/60' : ''
                                                    }`}
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            onTogglePermission(user.id, feature.id, action.key)
                                                        }
                                                        className={`mx-auto w-5 h-5 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                                                            isChecked
                                                                ? 'bg-brand border border-brand text-white shadow-xs scale-100'
                                                                : 'bg-surface border border-border text-transparent hover:border-brand/50 hover:bg-surface-2'
                                                        }`}
                                                        aria-label={`${user.name} - ${feature.label} ${action.label}`}
                                                        aria-checked={isChecked}
                                                        role="checkbox"
                                                    >
                                                        {isChecked && <Check size={13} strokeWidth={3} />}
                                                    </button>
                                                </td>
                                            );
                                        })}
                                    </React.Fragment>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default UserPermissionsMatrix;
