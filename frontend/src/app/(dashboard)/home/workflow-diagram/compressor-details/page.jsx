'use client';
import React, { Suspense } from 'react';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { CompressorDetailsView } from './_components/CompressorDetailsView';

/**
 * Compressor Details — live board for one compressor train.
 *
 * Data flow (all real, all through services → /api proxy):
 *   GET  /p1/dashboard/equipmentList         → the asset this ?train= maps to
 *   GET  /p1/dashboard/equipment/{id}/tags   → its signals, labels and units
 *   POST /p1/dashboard/createVisual          → samples for the shared time window
 *
 * `CompressorDetailsView` reads the URL via `useSearchParams`, so it must sit
 * behind a Suspense boundary in the App Router.
 */

function BoardFallback() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6" aria-busy="true" aria-label="Loading compressor board">
            <Skeleton className="h-16 w-full rounded-lg" />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Skeleton delay={0.1} className="h-64 rounded-lg lg:col-span-2" />
                <Skeleton delay={0.2} className="h-64 rounded-lg" />
            </div>
            <Skeleton delay={0.3} className="h-48 w-full rounded-lg" />
        </div>
    );
}

export default function CompressorDetailsPage() {
    return (
        <Suspense fallback={<BoardFallback />}>
            <CompressorDetailsView />
        </Suspense>
    );
}
