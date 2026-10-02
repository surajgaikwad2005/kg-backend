'use client';
import { Plus, RotateCw, Wifi, WifiOff, Activity, PauseCircle } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { useConfirm } from '@/src/components/ui/ConfirmModal';

export function SchedulerToolbar({ online, schedulerRunning, reloading, onReload, onCreateClick }) {
    const { openConfirm } = useConfirm();

    const handleReloadClick = async () => {
        const ok = await openConfirm(
            'Are you sure you want to reload all schedules from the database into the running scheduler? This might disrupt currently executing cron jobs.',
            { title: 'Reload Schedules?', confirmLabel: 'Yes, Reload', cancelLabel: 'Cancel', variant: 'warning' },
        );
        if (ok) onReload();
    };

    return (
        <div className="flex items-center justify-between gap-4 px-6 py-4 flex-wrap">
            <div className="flex items-center gap-2">
                <Badge variant={online ? 'success' : 'critical'} dot={false} pulse={false}>
                    {online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                    {online ? 'Online' : 'Offline'}
                </Badge>
                {online && schedulerRunning !== null && (
                    <Badge variant={schedulerRunning ? 'info' : 'warning'} dot={false} pulse={false}>
                        {schedulerRunning ? <Activity className="w-3 h-3" /> : <PauseCircle className="w-3 h-3" />}
                        {schedulerRunning ? 'Scheduler Running' : 'Scheduler Stopped'}
                    </Badge>
                )}
            </div>

            <div className="flex items-center gap-3">
                <Button
                    variant="dangerOutline"
                    size="sm"
                    onClick={handleReloadClick}
                    isPending={reloading}
                    aria-busy={reloading}
                >
                    <RotateCw className={`w-3.5 h-3.5 ${reloading ? 'animate-spin' : ''}`} />
                    Reload Schedules
                </Button>
                <Button variant="primary" size="sm" onClick={onCreateClick}>
                    <Plus className="w-3.5 h-3.5" />
                    Create Schedule
                </Button>
            </div>
        </div>
    );
}
