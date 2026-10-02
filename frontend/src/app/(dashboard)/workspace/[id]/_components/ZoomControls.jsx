'use client';
import React from 'react';
import { ZoomOut, ZoomIn, Maximize } from 'lucide-react';
import { useReactFlow, useViewport } from '@xyflow/react';

/**
 * ZoomControls — bottom-right floating zoom bar.
 * Reads viewport zoom level from React Flow context.
 */
export function ZoomControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { zoom } = useViewport();

  return (
    <div className="absolute right-6 bottom-6 bg-surface rounded-lg shadow-lg border border-border p-1 flex items-center gap-1 z-10 h-10">
      <button
        onClick={() => zoomOut()}
        className="p-2 rounded-md text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      <div className="px-2 text-[12px] font-medium text-text-secondary min-w-[44px] text-center">
        {Math.round(zoom * 100)}%
      </div>

      <button
        onClick={() => zoomIn()}
        className="p-2 rounded-md text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors"
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      <div className="w-px h-4 bg-border mx-1" />

      <button
        onClick={() => fitView()}
        className="p-2 rounded-md text-text-secondary hover:bg-surface-2 hover:text-text-primary transition-colors"
      >
        <Maximize className="w-4 h-4" />
      </button>
    </div>
  );
}
