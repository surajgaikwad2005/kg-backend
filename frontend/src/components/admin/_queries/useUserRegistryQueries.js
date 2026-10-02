import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/src/lib/query';
import {
    getUsers,
    signup,
    deleteUser,
    updateUserRole,
    updateUserGroup,
    getGroupMembers,
    getFeatureList,
    viewPermissions,
    updatePermissionsConfig,
} from '@/src/services/user-registry/user-registry';

/**
 * Response shape is `{ success, message, data: { total, users } }`, but some
 * backends wrap it differently — handle both (api-data/user-registry.json).
 */
const selectUserList = (res) => {
    const data = res?.data?.users || res?.data || res?.users || res || [];
    return Array.isArray(data) ? data : [];
};

/** Fetch paginated / full list of registered users */
export function useUsersQuery(params = {}) {
    return useQuery({
        queryKey: queryKeys.users.list(),
        queryFn: () => getUsers(params),
        select: selectUserList,
    });
}

/** Signup / create a new user */
export function useSignupMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Could not create user' },
        mutationFn: signup,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
        },
    });
}

/** Delete a user by ID */
export function useDeleteUserMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Could not delete user' },
        mutationFn: deleteUser,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
        },
    });
}

/** Update user role */
export function useUpdateUserRoleMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Could not update user role' },
        mutationFn: updateUserRole,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
        },
    });
}

/** Update user group assignment */
export function useUpdateUserGroupMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Could not update user group' },
        mutationFn: updateUserGroup,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.users.all() });
        },
    });
}

// Backward-compatible export aliases for legacy modal/card consumers
export const useSignupUser = useSignupMutation;
export const useUpdateUserGroup = useUpdateUserGroupMutation;

/** Format snake_case or camelCase feature keys into human readable labels */
const formatFeatureLabel = (key) => {
    if (!key) return '';
    return String(key)
        .replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .replace(/^./, (str) => str.toUpperCase());
};

/** Select & deduplicate users across groups from groupMembers endpoint */
const selectGroupMembersData = (res) => {
    let rawData = res;
    if (rawData && typeof rawData === 'object' && rawData.data && typeof rawData.data === 'object' && !Array.isArray(rawData.data)) {
        rawData = rawData.data;
    }
    if (!rawData || typeof rawData !== 'object' || Array.isArray(rawData)) {
        rawData = {};
    }

    const userMap = new Map();

    Object.entries(rawData).forEach(([groupName, members]) => {
        if (Array.isArray(members)) {
            members.forEach((member) => {
                const memId = member?.id || member?.userId || member?.user_id;
                if (!memId) return;
                const strId = String(memId);
                const existing = userMap.get(strId);
                if (existing) {
                    if (!existing.groups.includes(groupName)) {
                        existing.groups.push(groupName);
                    }
                } else {
                    userMap.set(strId, {
                        id: strId,
                        name: member.name || member.username || member.email || 'Unnamed User',
                        email: member.email || '',
                        groups: [groupName],
                    });
                }
            });
        }
    });

    return {
        groupsMap: rawData,
        usersList: Array.from(userMap.values()),
    };
};

/** Fetch group members grouped by application security groups */
export function useGroupMembersQuery(plantCodeId) {
    return useQuery({
        queryKey: queryKeys.users.groupMembers(plantCodeId),
        queryFn: () => getGroupMembers(plantCodeId),
        enabled: !!plantCodeId,
        select: selectGroupMembersData,
    });
}

/** Select & format feature list from featureList endpoint */
const selectFeatureListData = (res) => {
    let rawFeatures = res;
    if (rawFeatures && typeof rawFeatures === 'object' && Array.isArray(rawFeatures.data)) {
        rawFeatures = rawFeatures.data;
    }
    if (!Array.isArray(rawFeatures)) {
        rawFeatures = [];
    }

    const featuresList = rawFeatures.map((item) => {
        const key = typeof item === 'object' && item !== null ? (item.id || item.key || item.name) : String(item);
        const label = typeof item === 'object' && item !== null ? (item.label || item.name || key) : formatFeatureLabel(key);
        return {
            // The view-permissions endpoint always echoes feature keys lowercased
            // (e.g. "modelFactory" -> "modelfactory") regardless of the casing this
            // endpoint returns them in, so the id is normalized to lowercase here —
            // the single place feature ids enter the app — to keep it the matrixMap
            // key built in selectPermissionsViewData below. Label keeps original casing.
            id: String(key).toLowerCase(),
            label,
        };
    });

    return {
        rawFeatures,
        featuresList,
    };
};

/** Fetch feature list for permission matrix */
export function useFeatureListQuery(plantCodeId) {
    return useQuery({
        queryKey: queryKeys.users.featureList(plantCodeId),
        queryFn: () => getFeatureList(plantCodeId),
        enabled: !!plantCodeId,
        select: selectFeatureListData,
    });
}

/** Select & translate 2D boolean matrices from viewPermissions endpoint into matrixMap */
const selectPermissionsViewData = (res) => {
    let data = res;
    if (data && typeof data === 'object' && data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
        data = data.data;
    }

    const userList = Array.isArray(data?.users) ? data.users : [];
    const featureList = Array.isArray(data?.features) ? data.features : [];
    const permsObj = data?.permissions || {};

    const vMatrix = Array.isArray(permsObj.v) ? permsObj.v : [];
    const cMatrix = Array.isArray(permsObj.c) ? permsObj.c : [];
    const mMatrix = Array.isArray(permsObj.m) ? permsObj.m : [];
    const dMatrix = Array.isArray(permsObj.d) ? permsObj.d : [];

    const matrixMap = {};

    userList.forEach((uId, uIdx) => {
        const uKey = String(uId);
        matrixMap[uKey] = {};
        featureList.forEach((fId, fIdx) => {
            // Lowercased to match the feature ids from useFeatureListQuery, which are
            // normalized the same way for the same reason (see selectFeatureListData).
            const fKey = String(fId).toLowerCase();
            matrixMap[uKey][fKey] = {
                view: Boolean(vMatrix[uIdx]?.[fIdx]),
                create: Boolean(cMatrix[uIdx]?.[fIdx]),
                update: Boolean(mMatrix[uIdx]?.[fIdx]),
                delete: Boolean(dMatrix[uIdx]?.[fIdx]),
            };
        });
    });

    return {
        raw: data,
        matrixMap,
    };
};

/** Fetch permission matrix for specific selected users and features */
export function usePermissionsViewQuery({ plantCodeId, users = [], features = [] }) {
    return useQuery({
        queryKey: queryKeys.users.permissionsView(plantCodeId, users, features),
        queryFn: () => viewPermissions({ users, features, plant_code_id: plantCodeId }),
        enabled: !!plantCodeId && users.length > 0 && features.length > 0,
        select: selectPermissionsViewData,
    });
}

/** Update permission matrices for specified users and features */
export function useUpdatePermissionsMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Could not update permissions' },
        mutationFn: updatePermissionsConfig,
        onSuccess: (_, variables) => {
            void queryClient.invalidateQueries({
                queryKey: ['users', variables.plant_code_id, 'permissions-view'],
            });
        },
    });
}
