'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/src/components/ui/Toast';
import { useApp } from '@/src/context/AppContext';
import {
    useGroupMembersQuery,
    useFeatureListQuery,
    usePermissionsViewQuery,
    useUpdatePermissionsMutation,
} from '@/src/components/admin/_queries/useUserRegistryQueries';

import UserRegistryHeader from './components/userRegistry/UserRegistryHeader';
import UserRegistryFilters from './components/userRegistry/UserRegistryFilters';
import UserPermissionsMatrix from './components/userRegistry/UserPermissionsMatrix';

export function UsersView() {
    const { success: toastSuccess, error: toastError } = useToast();
    const { plantCode } = useApp();

    // Fetch group members and feature list
    const {
        data: groupMembersData,
        isLoading: isGroupMembersLoading,
        error: groupMembersError,
        refetch: refetchGroupMembers,
    } = useGroupMembersQuery(plantCode);

    const {
        data: featureListData,
        isLoading: isFeatureListLoading,
        error: featureListError,
        refetch: refetchFeatureList,
    } = useFeatureListQuery(plantCode);

    const allUsers = useMemo(() => groupMembersData?.usersList || [], [groupMembersData]);
    const allFeatures = useMemo(() => featureListData?.featuresList || [], [featureListData]);

    // User & Feature filter selection state (defaults to empty [], auto-filled to
    // "select all" once each list loads for the first time — see effects below)
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [selectedFeatureIds, setSelectedFeatureIds] = useState([]);

    // Tracks whether the initial "select all" default has already been applied, so
    // a user manually clearing the selection afterward doesn't get overridden again
    const didInitSelectionRef = useRef({ users: false, features: false });

    useEffect(() => {
        if (!didInitSelectionRef.current.users && allUsers.length > 0) {
            setSelectedUserIds(allUsers.map((u) => u.id));
            didInitSelectionRef.current.users = true;
        }
    }, [allUsers]);

    useEffect(() => {
        if (!didInitSelectionRef.current.features && allFeatures.length > 0) {
            setSelectedFeatureIds(allFeatures.map((f) => f.id));
            didInitSelectionRef.current.features = true;
        }
    }, [allFeatures]);

    // Switching plants loads a different user/feature list — re-apply the
    // "select all" default for the new plant instead of keeping the old selection.
    // Skips the initial mount (ref starts equal to plantCode) so it doesn't clobber
    // a selection the effects above already derived from cached query data.
    const prevPlantCodeRef = useRef(plantCode);
    useEffect(() => {
        if (prevPlantCodeRef.current === plantCode) return;
        prevPlantCodeRef.current = plantCode;
        didInitSelectionRef.current = { users: false, features: false };
        setSelectedUserIds([]);
        setSelectedFeatureIds([]);
    }, [plantCode]);

    // Fetch live permissions view for selected users and features
    const {
        data: permissionsViewData,
        isLoading: isPermissionsViewLoading,
        error: permissionsViewError,
        refetch: refetchPermissionsView,
    } = usePermissionsViewQuery({
        plantCodeId: plantCode,
        users: selectedUserIds,
        features: selectedFeatureIds,
    });

    const updatePermissionsMutation = useUpdatePermissionsMutation();

    const isLoading = isGroupMembersLoading || isFeatureListLoading || isPermissionsViewLoading;
    const rawError = groupMembersError || featureListError || permissionsViewError;
    const error = rawError ? (rawError.message || 'Error loading permissions data') : null;

    // Saved vs Current overrides state
    const [savedOverrides, setSavedOverrides] = useState({});
    const [permissionsOverrides, setPermissionsOverrides] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    // Baseline matrix map (from view API response or default)
    const basePermissionsMap = useMemo(() => {
        return permissionsViewData?.matrixMap || {};
    }, [permissionsViewData]);

    // Dynamically compute if there are any UNSAVED changes compared to base API / saved state
    const hasChanges = useMemo(() => {
        if (selectedUserIds.length === 0 || selectedFeatureIds.length === 0) return false;

        const actions = ['view', 'update', 'create', 'delete'];

        for (const uId of selectedUserIds) {
            for (const fId of selectedFeatureIds) {
                const basePerms = basePermissionsMap[uId]?.[fId] || {
                    view: false,
                    update: false,
                    create: false,
                    delete: false,
                };
                const savedFeat = savedOverrides[uId]?.[fId] || {};
                const currentFeat = permissionsOverrides[uId]?.[fId] || {};

                for (const act of actions) {
                    const savedVal = savedFeat[act] ?? basePerms[act] ?? false;
                    const currentVal = currentFeat[act] ?? basePerms[act] ?? false;

                    if (savedVal !== currentVal) {
                        return true; // Change detected!
                    }
                }
            }
        }
        return false; // Unchanged or undone back to baseline
    }, [selectedUserIds, selectedFeatureIds, basePermissionsMap, savedOverrides, permissionsOverrides]);

    // Derived full permissions matrix map (base API matrix + pending local overrides)
    const effectivePermissionsMap = useMemo(() => {
        const matrix = {};
        allUsers.forEach((user) => {
            const uKey = String(user.id);
            matrix[uKey] = {};
            allFeatures.forEach((feat) => {
                const fKey = String(feat.id);
                const basePerms = basePermissionsMap[uKey]?.[fKey] || {
                    view: false,
                    update: false,
                    create: false,
                    delete: false,
                };
                const overridePerms = permissionsOverrides[uKey]?.[fKey] || {};
                matrix[uKey][fKey] = {
                    ...basePerms,
                    ...overridePerms,
                };
            });
        });
        return matrix;
    }, [allUsers, allFeatures, basePermissionsMap, permissionsOverrides]);

    // Single user pill removal callback
    const handleRemoveUser = useCallback((userId) => {
        setSelectedUserIds((prev) => prev.filter((id) => id !== userId));
    }, []);

    // Single feature pill removal callback
    const handleRemoveFeature = useCallback((featureId) => {
        setSelectedFeatureIds((prev) => prev.filter((id) => id !== featureId));
    }, []);

    // Toggle single permission checkbox
    const handleTogglePermission = useCallback((userId, featureId, actionKey) => {
        setPermissionsOverrides((prevOverrides) => {
            const userOverrides = prevOverrides[userId] || {};
            const featureOverrides = userOverrides[featureId] || {};
            const basePerms = basePermissionsMap[userId]?.[featureId] || {
                view: false,
                update: false,
                create: false,
                delete: false,
            };
            const currentVal = featureOverrides[actionKey] ?? basePerms[actionKey] ?? false;

            return {
                ...prevOverrides,
                [userId]: {
                    ...userOverrides,
                    [featureId]: {
                        ...featureOverrides,
                        [actionKey]: !currentVal,
                    },
                },
            };
        });
    }, [basePermissionsMap]);

    // Save changes handler -> PUT /userManagement/config
    const handleSaveChanges = useCallback(async () => {
        if (selectedUserIds.length === 0 || selectedFeatureIds.length === 0) return;
        setIsSaving(true);
        try {
            const v = selectedUserIds.map((uId) =>
                selectedFeatureIds.map((fId) => Boolean(effectivePermissionsMap[uId]?.[fId]?.view))
            );
            const c = selectedUserIds.map((uId) =>
                selectedFeatureIds.map((fId) => Boolean(effectivePermissionsMap[uId]?.[fId]?.create))
            );
            const m = selectedUserIds.map((uId) =>
                selectedFeatureIds.map((fId) => Boolean(effectivePermissionsMap[uId]?.[fId]?.update))
            );
            const d = selectedUserIds.map((uId) =>
                selectedFeatureIds.map((fId) => Boolean(effectivePermissionsMap[uId]?.[fId]?.delete))
            );

            await updatePermissionsMutation.mutateAsync({
                users: selectedUserIds,
                features: selectedFeatureIds,
                permissions: { v, c, m, d },
                plant_code_id: plantCode,
            });

            setSavedOverrides(permissionsOverrides);
            if (toastSuccess) {
                toastSuccess('Permissions updated successfully');
            }
        } catch (err) {
            console.error('Failed to save permissions:', err);
            if (toastError) {
                toastError(err.message || 'Failed to save permissions');
            }
        } finally {
            setIsSaving(false);
        }
    }, [
        selectedUserIds,
        selectedFeatureIds,
        effectivePermissionsMap,
        updatePermissionsMutation,
        plantCode,
        permissionsOverrides,
        toastSuccess,
        toastError,
    ]);

    // Derived filtered users and features for the matrix view
    const displayedUsers = useMemo(
        () => allUsers.filter((u) => selectedUserIds.includes(u.id)),
        [allUsers, selectedUserIds]
    );

    const displayedFeatures = useMemo(
        () => allFeatures.filter((f) => selectedFeatureIds.includes(f.id)),
        [allFeatures, selectedFeatureIds]
    );

    const handleRetry = useCallback(() => {
        void refetchGroupMembers();
        void refetchFeatureList();
        void refetchPermissionsView();
    }, [refetchGroupMembers, refetchFeatureList, refetchPermissionsView]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6 w-full"
        >
            {/* Header */}
            <UserRegistryHeader
                onSave={handleSaveChanges}
                isSaving={isSaving}
                hasChanges={hasChanges}
            />

            {/* Filters Section using application's reusable Select component */}
            <UserRegistryFilters
                allUsers={allUsers}
                selectedUserIds={selectedUserIds}
                onUserChange={setSelectedUserIds}
                onRemoveUser={handleRemoveUser}
                allFeatures={allFeatures}
                selectedFeatureIds={selectedFeatureIds}
                onFeatureChange={setSelectedFeatureIds}
                onRemoveFeature={handleRemoveFeature}
            />

            {/* Permissions Matrix */}
            <UserPermissionsMatrix
                users={displayedUsers}
                features={displayedFeatures}
                permissionsMap={effectivePermissionsMap}
                onTogglePermission={handleTogglePermission}
                isLoading={isLoading}
                error={error}
                onRetry={handleRetry}
            />
        </motion.div>
    );
}

export default UsersView;
