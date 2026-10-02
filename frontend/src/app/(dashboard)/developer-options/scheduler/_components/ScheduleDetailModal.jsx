'use client';
import { AlertCircle } from 'lucide-react';
import { Modal, ModalBody, ModalFooter } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { useApp } from '@/src/context/AppContext';
import { useDeveloperAccess } from '@/src/context/DeveloperAccessContext';
import { useScheduleDetailQuery } from '../_queries/useSchedulerQueries';

const ROW_LABEL = 'text-[10px] font-bold text-text-muted uppercase tracking-wider';
const CODE_BLOCK =
    'w-full px-4 py-3 rounded-lg bg-canvas border border-border text-text-primary text-xs font-mono whitespace-pre-wrap break-all';

function fmtDate(value) {
    if (!value) return '—';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
}

/** Read-only detail view — fetches schedule detail using TanStack Query. */
export function ScheduleDetailModal({ open, onClose, scheduleId }) {
    const { plantCode } = useApp();
    const { hasAccess } = useDeveloperAccess();

    const {
        data: schedule,
        isLoading,
        isError,
        error,
    } = useScheduleDetailQuery(plantCode, scheduleId, open && hasAccess);

    return (
        <Modal open={open} onClose={onClose} title="Schedule Detail" size="lg">
            <ModalBody className="space-y-5">
                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} delay={i * 0.05} className="h-4 w-full" />
                        ))}
                    </div>
                ) : isError ? (
                    <div className="flex items-center gap-2 text-danger text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error?.message || 'Could not load schedule detail.'}
                    </div>
                ) : schedule ? (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className={ROW_LABEL}>Job Name</p>
                                <p className="text-sm font-semibold text-text-primary">{schedule.job_name}</p>
                            </div>
                            <div className="space-y-1">
                                <p className={ROW_LABEL}>Status</p>
                                <Badge variant={schedule.enabled ? 'success' : 'critical'}>
                                    {schedule.enabled ? 'Enabled' : 'Disabled'}
                                </Badge>
                            </div>
                            <div className="space-y-1">
                                <p className={ROW_LABEL}>Cron Expression</p>
                                <p className="text-sm font-mono text-text-primary">{schedule.cron_expression}</p>
                            </div>
                            <div className="space-y-1">
                                <p className={ROW_LABEL}>Method</p>
                                <p className="text-sm font-mono text-text-primary">{schedule.method}</p>
                            </div>
                            <div className="col-span-2 space-y-1">
                                <p className={ROW_LABEL}>URL</p>
                                <p className="text-sm font-mono text-text-primary break-all">{schedule.url}</p>
                            </div>
                            <div className="space-y-1">
                                <p className={ROW_LABEL}>Execution Count</p>
                                <p className="text-sm text-text-primary">{schedule.execution_count ?? 0}</p>
                            </div>
                            <div className="space-y-1">
                                <p className={ROW_LABEL}>Next Run</p>
                                <p className="text-sm text-text-primary">{fmtDate(schedule.next_run_time)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className={ROW_LABEL}>Last Triggered</p>
                                <p className="text-sm text-text-primary">{fmtDate(schedule.last_triggered_at)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className={ROW_LABEL}>Last Status</p>
                                {schedule.last_status ? (
                                    <Badge variant={schedule.last_status === 'success' ? 'success' : 'critical'} dot={false}>
                                        {schedule.last_status}
                                        {schedule.last_response_code ? ` (${schedule.last_response_code})` : ''}
                                    </Badge>
                                ) : (
                                    <p className="text-sm text-text-subtle">—</p>
                                )}
                            </div>
                            {schedule.last_error && (
                                <div className="col-span-2 space-y-1">
                                    <p className={ROW_LABEL}>Last Error</p>
                                    <p className="text-sm text-danger">{schedule.last_error}</p>
                                </div>
                            )}
                            <div className="space-y-1">
                                <p className={ROW_LABEL}>Created</p>
                                <p className="text-sm text-text-primary">{fmtDate(schedule.created_at)}</p>
                            </div>
                            <div className="space-y-1">
                                <p className={ROW_LABEL}>Updated</p>
                                <p className="text-sm text-text-primary">{fmtDate(schedule.updated_at)}</p>
                            </div>
                        </div>

                        <div>
                            <p className={`${ROW_LABEL} mb-2`}>Payload</p>
                            <pre className={CODE_BLOCK}>{JSON.stringify(schedule.payload ?? {}, null, 2)}</pre>
                        </div>
                        <div>
                            <p className={`${ROW_LABEL} mb-2`}>Headers</p>
                            <pre className={CODE_BLOCK}>{JSON.stringify(schedule.headers ?? {}, null, 2)}</pre>
                        </div>
                    </>
                ) : null}
            </ModalBody>
            <ModalFooter>
                <Button variant="outline" onClick={onClose}>Close</Button>
            </ModalFooter>
        </Modal>
    );
}
