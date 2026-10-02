'use client';
import { useState } from 'react';
import { Boxes } from 'lucide-react';
import { useScheduler } from './_hooks/useScheduler';
import { SchedulerToolbar } from './_components/SchedulerToolbar';
import { SchedulerTable } from './_components/SchedulerTable';
import { ScheduleFormModal } from './_components/ScheduleFormModal';
import { ScheduleDetailModal } from './_components/ScheduleDetailModal';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { useConfirm } from '@/src/components/ui/ConfirmModal';

export default function SchedulerPage() {
    const {
        plantCode, schedules, loading, online, schedulerRunning, reloading, actioningId,
        refresh, create, update, remove, toggleEnabled, reload,
    } = useScheduler();
    const { openConfirm } = useConfirm();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [viewingId, setViewingId] = useState(null);

    if (!plantCode) {
        return (
            <div className="px-6 py-4">
                <EmptyState
                    icon={<Boxes className="w-10 h-10 text-text-subtle" strokeWidth={1.5} />}
                    title="Select a plant"
                    description="Pick a plant from the header switcher to manage its scheduled jobs."
                />
            </div>
        );
    }

    const openCreate = () => {
        setEditingSchedule(null);
        setIsFormOpen(true);
    };

    const openEdit = (schedule) => {
        setEditingSchedule(schedule);
        setIsFormOpen(true);
    };

    const handleSubmit = (job) => (editingSchedule ? update(editingSchedule.id, job) : create(job));

    const handleDelete = async (schedule) => {
        const ok = await openConfirm(
            `Delete "${schedule.job_name}"? This cannot be undone.`,
            { title: 'Delete Schedule?', confirmLabel: 'Yes, Delete', cancelLabel: 'Cancel' },
        );
        if (ok) remove(schedule);
    };

    return (
        <div className="pb-6">
            <SchedulerToolbar
                online={online}
                schedulerRunning={schedulerRunning}
                reloading={reloading}
                onReload={reload}
                onCreateClick={openCreate}
            />
            <SchedulerTable
                schedules={schedules}
                loading={loading}
                online={online}
                actioningId={actioningId}
                onRetry={refresh}
                onView={(schedule) => setViewingId(schedule.id)}
                onEdit={openEdit}
                onToggle={toggleEnabled}
                onDelete={handleDelete}
            />
            <ScheduleFormModal
                open={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSubmit={handleSubmit}
                schedule={editingSchedule}
            />
            <ScheduleDetailModal
                open={Boolean(viewingId)}
                onClose={() => setViewingId(null)}
                scheduleId={viewingId}
            />
        </div>
    );
}
