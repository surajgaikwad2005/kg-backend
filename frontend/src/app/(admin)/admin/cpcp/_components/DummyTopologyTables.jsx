'use client';

import { useState } from 'react';
import { SiteParametersTable } from './SiteParametersTable';
import { ParallelGroupsTable } from './ParallelGroupsTable';
import { SeriesCapacityChainTable } from './SeriesCapacityChainTable';

export function DummyTopologyTables() {
    const [isSaved, setIsSaved] = useState(false);
    const [groupsSaved, setGroupsSaved] = useState(false);

    return (
        <div className="flex flex-col gap-8 mb-8">
            <SiteParametersTable onSaved={setIsSaved} />

            {isSaved && (
                <ParallelGroupsTable onSaved={setGroupsSaved} />
            )}

            <SeriesCapacityChainTable />
        </div>
    );
}

