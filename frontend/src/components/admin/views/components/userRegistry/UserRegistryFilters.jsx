'use client';

import React, { useMemo } from 'react';
import { MultiSelectDropdown } from '@/src/components/ui/MultiSelectDropdown';

export function UserRegistryFilters({
    allUsers = [],
    selectedUserIds = [],
    onUserChange,
    onRemoveUser,

    allFeatures = [],
    selectedFeatureIds = [],
    onFeatureChange,
    onRemoveFeature,
}) {
    const userOptions = useMemo(
        () => allUsers.map((u) => ({ value: u.id, label: u.name })),
        [allUsers]
    );

    const featureOptions = useMemo(
        () => allFeatures.map((f) => ({ value: f.id, label: f.label })),
        [allFeatures]
    );

    return (
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* FILTER USERS */}
                <MultiSelectDropdown
                    label="FILTER USERS"
                    options={userOptions}
                    value={selectedUserIds}
                    onChange={onUserChange}
                    onRemoveItem={onRemoveUser}
                    placeholder="None selected"
                    searchable={true}
                    showPills={true}
                />

                {/* FILTER FEATURES */}
                <MultiSelectDropdown
                    label="SELECT FEATURE"
                    options={featureOptions}
                    value={selectedFeatureIds}
                    onChange={onFeatureChange}
                    onRemoveItem={onRemoveFeature}
                    placeholder="None selected"
                    searchable={false}
                    showPills={true}
                />
            </div>
        </div>
    );
}

export default UserRegistryFilters;
