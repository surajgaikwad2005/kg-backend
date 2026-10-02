'use client';
import { useCallback } from 'react';
import { useApp } from '@/src/context/AppContext';
import { useDeveloperAccess } from '@/src/context/DeveloperAccessContext';
import {
    useSchedulerHealthQuery,
    useSchedulesQuery,
    useCreateScheduleMutation,
    useUpdateScheduleMutation,
    useDeleteScheduleMutation,
    useToggleScheduleMutation,
    useReloadSchedulesMutation,
} from '../_queries/useSchedulerQueries';

/** Data + mutations for the hidden Developer Options Scheduler tab. */
export function useScheduler() {
    const { plantCode } = useApp();
    const { hasAccess } = useDeveloperAccess();

    const healthQuery = useSchedulerHealthQuery(hasAccess);
    const schedulesQuery = useSchedulesQuery(plantCode, hasAccess);

    const createMutation = useCreateScheduleMutation(plantCode);
    const updateMutation = useUpdateScheduleMutation(plantCode);
    const deleteMutation = useDeleteScheduleMutation(plantCode);
    const toggleMutation = useToggleScheduleMutation(plantCode);
    const reloadMutation = useReloadSchedulesMutation(plantCode);

    const schedules = schedulesQuery.data ?? [];
    const loading = schedulesQuery.isLoading || (healthQuery.isLoading && !healthQuery.data);
    const online = !schedulesQuery.isError;
    const schedulerRunning = healthQuery.data ? Boolean(healthQuery.data.scheduler_running) : null;
    const reloading = reloadMutation.isPending;

    const actioningId = toggleMutation.isPending
        ? toggleMutation.variables?.schedule?.id
        : (deleteMutation.isPending ? deleteMutation.variables : null);

    const create = useCallback(
        (job) => createMutation.mutateAsync(job),
        [createMutation]
    );

    const update = useCallback(
        (scheduleId, job) => updateMutation.mutateAsync({ scheduleId, job }),
        [updateMutation]
    );

    const remove = useCallback(
        (schedule) => deleteMutation.mutateAsync(schedule.id),
        [deleteMutation]
    );

    const toggleEnabled = useCallback(
        (schedule) => toggleMutation.mutateAsync({ schedule, enable: !schedule.enabled }),
        [toggleMutation]
    );

    const reload = useCallback(
        () => reloadMutation.mutateAsync(),
        [reloadMutation]
    );

    return {
        plantCode,
        schedules,
        loading,
        online,
        schedulerRunning,
        reloading,
        actioningId,
        refresh: schedulesQuery.refetch,
        create,
        update,
        remove,
        toggleEnabled,
        reload,
    };
}
