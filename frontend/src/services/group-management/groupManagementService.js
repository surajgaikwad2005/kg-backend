/**
 * groupManagementService.js
 * Pure async functions for the Group Management admin API — create groups,
 * assign a user to a group, and move a user between groups. Calls the local
 * /api/group-management/* proxy routes (token injection / 401 handling are managed
 * globally by AuthInterceptor).
 *
 * Contract reference: api-data/group-management.json.
 */
import { apiClient } from '../apiClient';

/** Admin only — assign a user to a group. */
export async function assignUserToGroup({ email, group }) {
    return apiClient.post('/api/group-management/assign-group', { email, group });
}

/** Admin only — create a new group. */
export async function createGroup({ group_name }) {
    return apiClient.post('/api/group-management/groups', { group_name });
}
