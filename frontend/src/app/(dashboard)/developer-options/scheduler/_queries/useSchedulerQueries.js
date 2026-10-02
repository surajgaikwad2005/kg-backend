'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/src/lib/query/keys';
import { toast } from '@/src/components/ui/toast/toastApi';
import {
    getSchedulerHealth,
    listSchedules,
    getSchedule,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    enableSchedule,
    disableSchedule,
    reloadSchedules,
} from '@/src/services/developer-options/schedulerService';

/** Scheduler process health — not plant-scoped, staleTime 60s. */
export function useSchedulerHealthQuery(hasAccess = true) {
    return useQuery({
        queryKey: queryKeys.developerOptions.health(),
        queryFn: getSchedulerHealth,
        enabled: Boolean(hasAccess),
        staleTime: 60_000,
    });
}

/** List schedules for the active plant. */
export function useSchedulesQuery(plantCode, hasAccess = true) {
    return useQuery({
        queryKey: queryKeys.developerOptions.schedules.list(plantCode),
        queryFn: () => listSchedules(plantCode),
        enabled: Boolean(hasAccess && plantCode),
    });
}

/** Schedule detail for a single schedule. */
export function useScheduleDetailQuery(plantCode, scheduleId, enabled = true) {
    return useQuery({
        queryKey: queryKeys.developerOptions.schedules.detail(plantCode, scheduleId),
        queryFn: () => getSchedule(plantCode, scheduleId),
        enabled: Boolean(enabled && plantCode && scheduleId),
    });
}

/** Create a new scheduled job. */
export function useCreateScheduleMutation(plantCode) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (job) => createSchedule(plantCode, job),
        onSuccess: (_data, job) => {
            toast.success('Schedule created', `"${job.jobName}" was added to the scheduler.`);
            queryClient.invalidateQueries({ queryKey: queryKeys.developerOptions.schedules.list(plantCode) });
        },
    });
}

/** Update an existing schedule's fields. */
export function useUpdateScheduleMutation(plantCode) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ scheduleId, job }) => updateSchedule(plantCode, scheduleId, job),
        onSuccess: (_data, { scheduleId, job }) => {
            toast.success('Schedule updated', `"${job.jobName}" was updated.`);
            queryClient.invalidateQueries({ queryKey: queryKeys.developerOptions.schedules.list(plantCode) });
            queryClient.invalidateQueries({ queryKey: queryKeys.developerOptions.schedules.detail(plantCode, scheduleId) });
        },
    });
}

/** Permanently delete a schedule. */
export function useDeleteScheduleMutation(plantCode) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (scheduleId) => deleteSchedule(plantCode, scheduleId),
        onSuccess: () => {
            toast.success('Schedule deleted', 'Schedule was removed.');
            queryClient.invalidateQueries({ queryKey: queryKeys.developerOptions.schedules.list(plantCode) });
        },
    });
}

/** Optimistically enable or disable a schedule. */
export function useToggleScheduleMutation(plantCode) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ schedule, enable }) =>
            enable ? enableSchedule(plantCode, schedule.id) : disableSchedule(plantCode, schedule.id),
        onMutate: async ({ schedule, enable }) => {
            const listKey = queryKeys.developerOptions.schedules.list(plantCode);
            await queryClient.cancelQueries({ queryKey: listKey });
            const previousSchedules = queryClient.getQueryData(listKey);

            if (previousSchedules) {
                queryClient.setQueryData(listKey, (old) => {
                    if (!Array.isArray(old)) return old;
                    return old.map((item) =>
                        item.id === schedule.id ? { ...item, enabled: enable } : item
                    );
                });
            }

            return { previousSchedules, listKey };
        },
        onError: (_err, _vars, context) => {
            if (context?.previousSchedules) {
                queryClient.setQueryData(context.listKey, context.previousSchedules);
            }
        },
        onSettled: (_data, _err, _vars, context) => {
            if (context?.listKey) {
                queryClient.invalidateQueries({ queryKey: context.listKey });
            }
        },
        onSuccess: (_data, { schedule, enable }) => {
            if (enable) {
                toast.success('Schedule enabled', `"${schedule.job_name}" was resumed.`);
            } else {
                toast.success('Schedule disabled', `"${schedule.job_name}" was paused.`);
            }
        },
    });
}

/** Reload all schedules from DB into running scheduler process. */
export function useReloadSchedulesMutation(plantCode) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => reloadSchedules(plantCode),
        onSuccess: () => {
            toast.success('Scheduler reloaded', 'All schedules were reloaded from the database.');
            queryClient.invalidateQueries({ queryKey: queryKeys.developerOptions.schedules.list(plantCode) });
            queryClient.invalidateQueries({ queryKey: queryKeys.developerOptions.health() });
        },
    });
}
