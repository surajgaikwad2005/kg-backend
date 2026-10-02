'use client';
import { AlertCircle, Eye, Pencil, Play, Pause, Trash2 } from 'lucide-react';
import { DataTable } from '@/src/components/ui/DataTable';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { Badge } from '@/src/components/ui/Badge';
import { ActionsMenuButton } from '@/src/components/ui/ActionsMenuButton';

function fmtDate(value) {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
}

function buildColumns({ actioningId, onView, onEdit, onToggle, onDelete }) {
    return [
        { key: 'job_name', label: 'Job Name' },
        { key: 'cron_expression', label: 'Cron Schedule', cellClassName: 'font-mono' },
        {
            key: 'target',
            label: 'Target',
            render: (row) => (
                <span className="font-mono text-[11px] flex items-center gap-1.5">
                    <span className="text-text-subtle">{row.method}</span>
                    <span className="truncate max-w-56 inline-block align-bottom" title={row.url}>{row.url}</span>
                </span>
            ),
        },
        {
            key: 'enabled',
            label: 'Status',
            render: (row) => (
                <Badge variant={row.enabled ? 'success' : 'critical'}>
                    {row.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
            ),
        },
        {
            key: 'last_status',
            label: 'Last Run',
            render: (row) =>
                row.last_status ? (
                    <Badge variant={row.last_status === 'success' ? 'success' : 'critical'} dot={false}>
                        {row.last_status}
                    </Badge>
                ) : (
                    <span className="text-text-subtle">—</span>
                ),
        },
        {
            key: 'last_triggered_at',
            label: 'Last Triggered',
            render: (row) => fmtDate(row.last_triggered_at) ?? <span className="text-text-subtle">—</span>,
        },
        {
            key: 'actions',
            label: '',
            className: 'w-10',
            cellClassName: 'text-right',
            render: (row) => (
                <ActionsMenuButton
                    actions={[
                        { label: 'View', icon: <Eye className="w-3.5 h-3.5" />, onClick: () => onView(row) },
                        { label: 'Edit', icon: <Pencil className="w-3.5 h-3.5" />, onClick: () => onEdit(row) },
                        row.enabled
                            ? { label: 'Disable', icon: <Pause className="w-3.5 h-3.5" />, onClick: () => onToggle(row), loading: actioningId === row.id }
                            : { label: 'Enable', icon: <Play className="w-3.5 h-3.5" />, onClick: () => onToggle(row), loading: actioningId === row.id },
                        { label: 'Delete', icon: <Trash2 className="w-3.5 h-3.5" />, onClick: () => onDelete(row), danger: true, loading: actioningId === row.id },
                    ]}
                />
            ),
        },
    ];
}

export function SchedulerTable({ schedules, loading, online, actioningId, onRetry, onView, onEdit, onToggle, onDelete }) {
    if (!loading && !online) {
        return (
            <div className="px-6 py-4">
                <EmptyState
                    icon={<AlertCircle className="w-10 h-10 text-danger" strokeWidth={1.5} />}
                    title="Backend Offline"
                    action={
                        <button
                            type="button"
                            onClick={onRetry}
                            className="text-sm font-semibold text-brand hover:underline cursor-pointer"
                        >
                            Retry
                        </button>
                    }
                />
            </div>
        );
    }

    const columns = buildColumns({ actioningId, onView, onEdit, onToggle, onDelete });

    return (
        <div className="px-6 py-4">
            <DataTable
                columns={columns}
                rows={schedules}
                loading={loading}
                onRowClick={onView}
                emptyTitle="No scheduled jobs"
                emptyDescription="Create a schedule to get started."
            />
        </div>
    );
}
