'use client';

import React from 'react';
import { BarChart2 } from 'lucide-react';
import VisualCard from './VisualCard';
import { Skeleton } from '@/src/components/ui/Skeleton';

function SkeletonWidgetCard() {
  return (
    <div className="col-span-12 sm:col-span-6 row-span-2 relative bg-surface border border-border rounded-xl p-4 flex flex-col justify-between overflow-hidden shadow-sm min-h-[280px]">
      <div className="absolute inset-0 -translate-x-full animate-[skeleton-shimmer_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-border/40 to-transparent pointer-events-none" />
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-36 rounded" />
          <Skeleton className="h-3 w-24 rounded" />
        </div>
        <Skeleton className="h-5 w-16 rounded" />
      </div>
      <div className="flex-1 my-3 rounded-lg bg-surface-2/50 flex items-center justify-center relative overflow-hidden">
        <Skeleton className="w-full h-full rounded-lg" />
      </div>
    </div>
  );
}

export default function DashboardGrid({
  gridVisuals,
  editMode,
  startDragging,
  startResizing,
  openEditVisualDrawer,
  handleDeleteVisual,
  gridContainerRef,
  draggingId,
  isLoading = false,
}) {
  return (
    <div
      className={`dashboard-grid grid grid-cols-12 auto-rows-[140px] gap-px bg-border border border-border rounded-xl min-h-[500px] overflow-hidden mb-12 relative transition-all ${editMode
          ? 'bg-[radial-gradient(#cbd5e1_1.2px,transparent_1.2px)] dark:bg-[radial-gradient(#334155_1.2px,transparent_1.2px)] bg-[size:8.333%_140px]'
          : ''
        }`}
    >
      {isLoading ? (
        <>
          <SkeletonWidgetCard />
          <SkeletonWidgetCard />
        </>
      ) : gridVisuals.length === 0 ? (
        <div className="col-span-12 row-span-4 flex flex-col items-center justify-center p-12 text-center bg-surface h-full min-h-[480px]">
          <BarChart2 className="w-12 h-12 text-text-muted mb-4 opacity-50 stroke-[1.5]" />
          <div className="text-sm font-bold text-text-primary">No visual cards found</div>
          <p className="text-xs text-text-muted mt-1.5 max-w-xs leading-relaxed font-medium">
            This dashboard section does not have any visual charts yet. Click "Add Visual" to configure the first pane.
          </p>
        </div>
      ) : (
        gridVisuals.map((visual, index) => (
          <VisualCard
            key={visual.id}
            visual={visual}
            index={index}
            editMode={editMode}
            startDragging={startDragging}
            startResizing={startResizing}
            onEdit={() => openEditVisualDrawer(visual)}
            onDelete={() => handleDeleteVisual(visual.id)}
            gridContainerRef={gridContainerRef}
            draggingId={draggingId}
          />
        ))
      )}
    </div>
  );
}
