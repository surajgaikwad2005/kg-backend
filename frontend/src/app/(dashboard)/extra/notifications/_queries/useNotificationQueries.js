'use client';

/**
 * useNotificationQueries — TanStack Query hooks for the notification /
 * observation / workorder domain (Phase 12).
 *
 * NOT plant-scoped: the notification service takes no plantCode. Keys have no
 * plant segment and queries have no `enabled: !!plantCode` guard. This is a
 * deliberate exception to the usual key convention.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/src/lib/query';
import {
    getAllNotifications,
    matchObservation,
    generateWorkorder,
    generateNotification,
} from '@/src/services/notification/notificationService';

// ── Reads ────────────────────────────────────────────────────────────────

/** All notification records. */
export function useAllNotifications({ enabled = true } = {}) {
    return useQuery({
        queryKey: queryKeys.notifications.list(),
        queryFn: getAllNotifications,
        enabled,
    });
}

// ── Mutations ────────────────────────────────────────────────────────────

/** Match a free-text observation against known notifications. */
export function useMatchObservation() {
    return useMutation({
        meta: { errorTitle: 'Observation match failed' },
        mutationFn: (body) => matchObservation(body),
    });
}

/** Generate (or fetch) a structured notification from an id/observation. */
export function useGenerateNotification() {
    return useMutation({
        meta: { errorTitle: 'Notification generation failed' },
        mutationFn: (body) => generateNotification(body),
    });
}

/** Generate a work order from a notification. */
export function useGenerateWorkorder() {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Work order generation failed' },
        mutationFn: (body) => generateWorkorder(body),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: queryKeys.notifications.list(),
            });
        },
    });
}
