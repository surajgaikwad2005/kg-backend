/**
 * user-registry.js
 * Pure async functions for the User Registry API — manage users, roles, and groups.
 * Calls the local /api/user-registry/* proxy routes (token injection / 401 handling
 * are managed globally by AuthInterceptor).
 *
 * Contract reference: api-data/user-registry.json
 */
import { apiClient } from '../apiClient';

/**
 * Create a new user (signup).
 */
export async function signup({ username, email, password, role = 'user', group = null }) {
    return apiClient.post('/api/user-registry/signup', { username, email, password, role, group });
}

/**
 * Admin only — list all users.
 */
export async function getUsers() {
    return apiClient.get('/api/user-registry/admin/users');
}

/**
 * Admin only — permanently delete a user.
 */
export async function deleteUser({ email }) {
    return apiClient.del('/api/user-registry/admin/users', { body: { email } });
}

/**
 * Admin only — update a user's role.
 */
export async function updateUserRole({ email, new_role, old_role }) {
    return apiClient.put('/api/user-registry/admin/users/role', { email, new_role, old_role });
}

/**
 * Admin only — update a user's group.
 */
export async function updateUserGroup({ email, new_group, old_group }) {
    return apiClient.put('/api/user-registry/admin/users/group', { email, new_group, old_group });
}

/**
 * Fetch group members grouped by application security groups.
 */
export async function getGroupMembers(plant_code_id, params = {}) {
    return apiClient.get('/api/user-registry/group-members', {
        params: { plant_code_id, ...params },
    });
}

/**
 * Fetch list of features for permission configuration matrix.
 */
export async function getFeatureList(plant_code_id, params = {}) {
    return apiClient.get('/api/user-registry/feature-list', {
        params: { plant_code_id, ...params },
    });
}

/**
 * Fetch permissions matrices for selected users and features.
 */
export async function viewPermissions({ users, features, plant_code_id }) {
    return apiClient.post('/api/user-registry/view-permissions', {
        users,
        features,
        plant_code_id,
    });
}

/**
 * Update permissions matrices for specified users and features.
 */
export async function updatePermissionsConfig({ users, features, permissions, plant_code_id }) {
    return apiClient.put('/api/user-registry/config-permissions', {
        users,
        features,
        permissions,
        plant_code_id,
    });
}


