'use client';
import React, { Suspense, use } from 'react';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { EquipmentDetailsView } from './_components/EquipmentDetailsView';

/**
 * Equipment Detail — live board for one piece of equipment on the workflow
 * diagram. Opened by clicking a node, so `[id]` is that node's `componentType`
 * and `?label=` is its caption.
 *
 * Data flow (all real, all through services → /api proxy):
 *   GET  /components                          → the node's generated P&ID drawing
 *   GET  /p1/dashboard/equipmentList          → the plant asset this node maps to
 *   GET  /p1/dashboard/equipment/{id}/tags    → its signals, labels and units
 *   POST /p1/dashboard/createVisual           → samples for the shared time window
 *
 * `EquipmentDetailsView` reads the URL via `useSearchParams`, so it must sit
 * behind a Suspense boundary in the App Router.
 */

function BoardFallback() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6" aria-busy="true" aria-label="Loading equipment board">
            <Skeleton className="h-16 w-full rounded-lg" />
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <Skeleton delay={0.1} className="h-64 rounded-lg" />
                <Skeleton delay={0.15} className="h-64 rounded-lg" />
                <Skeleton delay={0.2} className="h-64 rounded-lg" />
            </div>
            <Skeleton delay={0.3} className="h-40 w-full rounded-lg" />
        </div>
    );
}

export default function EquipmentDetailsPage({ params }) {
    // Next.js's App Router already URI-decodes dynamic segments, so `id` here
    // is the literal componentType the diagram encoded — no further decode.
    const { id } = use(params);

    return (
        <Suspense fallback={<BoardFallback />}>
            {/* Keyed so switching between two equipment nodes remounts the board
                with its own persisted layout instead of reusing the previous one. */}
            <EquipmentDetailsView key={id} componentType={id} />
        </Suspense>
    );
}
