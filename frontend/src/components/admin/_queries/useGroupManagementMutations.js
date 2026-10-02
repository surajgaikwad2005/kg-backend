'use client';

/**
 * useGroupManagementMutations — group creation + user-to-group assignment
 * (Phase 8).
 *
 * Neither endpoint takes a plant code — these are global admin operations, so
 * rule 0 does not apply here. Both mutations invalidate `queryKeys.users.list()`:
 * GROUP_MANAGEMENT exposes no "list groups" endpoint (only POST /admin/groups),
 * so the group list Phase 9's UsersView will eventually render is derived from
 * the same user records these actions mutate.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/src/lib/query';
import { createGroup, assignUserToGroup } from '@/src/services/group-management/groupManagementService';

export function useCreateGroup() {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Create group failed' },
        mutationFn: createGroup,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.users.list() });
        },
    });
}

export function useAssignUserToGroup() {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Assign failed' },
        mutationFn: assignUserToGroup,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.users.list() });
        },
    });
}
