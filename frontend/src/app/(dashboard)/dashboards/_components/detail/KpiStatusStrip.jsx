'use client';

import React from 'react';
import { AnimatePresence } from 'framer-motion';
import KpiCardItem from './KpiCardItem';

export default function KpiStatusStrip({
  summaryVisuals,
  itemsPerRow = 'auto',
  kpiStyle = 'unified',
  editMode = false,
  onEdit,
  onDelete,
  onMove
}) {
  if (!summaryVisuals || summaryVisuals.length === 0) return null;

  const gridColumnsStyle = {
    gridTemplateColumns: itemsPerRow === 'auto'
      ? 'repeat(auto-fit, minmax(260px, 1fr))'
      : `repeat(${itemsPerRow}, minmax(0, 1fr))`
  };

  const isFloating = kpiStyle === 'floating';

  return (
    <div className="flex flex-col w-full mb-4">
      <div
        className={
          isFloating
            ? 'grid gap-4 w-full'
            : 'grid gap-[1px] bg-border border border-border rounded-xl shadow-sm overflow-hidden w-full'
        }
        style={gridColumnsStyle}
      >
        <AnimatePresence mode="popLayout">
          {summaryVisuals.map((visual, idx) => (
            <KpiCardItem
              key={visual.id || idx}
              visual={visual}
              idx={idx}
              total={summaryVisuals.length}
              isFloating={isFloating}
              editMode={editMode}
              onEdit={onEdit}
              onDelete={onDelete}
              onMove={onMove}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
