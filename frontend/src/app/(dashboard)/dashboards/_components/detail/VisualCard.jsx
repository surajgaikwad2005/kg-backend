'use client';

import React, { useState, useEffect } from 'react';
import { GripVertical, Sliders, Trash2 } from 'lucide-react';
import GetMiniChart from '../widgets/getMiniChart';
import { getVisualProps } from '../helpers';

export default function VisualCard({
  visual,
  index = 0,
  editMode,
  startDragging,
  startResizing,
  onEdit,
  onDelete,
  gridContainerRef,
  draggingId,
}) {
  const vProps = getVisualProps(visual);

  const defaultColStart = (index % 2 === 0) ? 1 : 7;
  const defaultRowStart = Math.floor(index / 2) * 2 + 1;
  const defaultColSpan = ['table', 'heatmap'].includes(vProps.type) ? 12 : 6;
  const defaultRowSpan = vProps.type === 'heatmap' ? 3 : 2;

  const colStart = visual.grid?.colStart || defaultColStart;
  const colSpan = visual.grid?.colSpan || defaultColSpan;
  const rowStart = visual.grid?.rowStart || defaultRowStart;
  const rowSpan = visual.grid?.rowSpan || defaultRowSpan;

  const ws = {
    id: vProps.id,
    name: vProps.title,
    chartType: vProps.type,
    type: vProps.type,
    chartData: vProps.data,
    data: vProps.data,
    is_live: vProps.isLive,
  };

  const isDragging = draggingId === vProps.id;
  const equipmentName = vProps.equipment;

  return (
    <div
      id={`visual-card-${visual.id}`}
      className={`visual-card flex flex-col overflow-hidden relative w-full h-full transition-all duration-150 bg-surface/80 backdrop-blur-md border border-border/60 shadow-panel ${isDragging
        ? 'opacity-40 outline-[1.8px] outline-dashed outline-chart-1 -outline-offset-2 z-20 shadow-lg ring-4 ring-chart-1/20'
        : editMode
          ? 'outline-[1.2px] outline-dashed outline-border hover:outline-chart-1/50 -outline-offset-2 z-10'
          : ''
        }`}
      style={{
        gridColumnStart: colStart,
        gridColumnEnd: `span ${colSpan}`,
        gridRowStart: rowStart,
        gridRowEnd: `span ${rowSpan}`,
      }}
    >
      {/* Visual Card Header */}
      <div className="flex items-center justify-between p-3 select-none bg-surface-2/40 border-b border-border">
        <div className="flex flex-col max-w-[60%] truncate">
          <span className="text-xs font-bold text-text-primary truncate flex items-center gap-2 tracking-wide">
            {/* Neon indicator dot */}
            <span className="w-1.5 h-1.5 rounded-full bg-chart-1 shadow-[0_0_8px_var(--color-chart-1)]"></span>
            {visual.title}
          </span>
          <span className="text-[10px] text-text-muted font-semibold truncate mt-0.5 ml-3.5 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-brand"></span>
            {equipmentName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider bg-surface-2/80 px-2 py-0.5 rounded-md border border-border/80">
            {visual.type} Chart
          </span>
          {editMode && (
            <div
              className="p-1.5 rounded-md hover:bg-surface-2 text-text-muted hover:text-chart-1 cursor-grab active:cursor-grabbing transition-colors"
              onMouseDown={(e) => startDragging(e, visual.id, gridContainerRef)}
              title="Drag to Move"
            >
              <GripVertical size={13} />
            </div>
          )}
          <button
            onClick={onEdit}
            className="p-1.5 rounded-md hover:bg-surface-2 text-text-muted hover:text-chart-1 transition-colors cursor-pointer"
            title="Edit Properties"
            aria-label="Edit Properties"
          >
            <Sliders size={13} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-md hover:bg-danger/10 text-text-muted hover:text-danger transition-colors cursor-pointer"
            title="Delete Visual"
            aria-label="Delete Visual"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="px-2 pb-2 pt-1 flex-1 flex flex-col relative overflow-hidden min-h-0 bg-canvas/20">
        <GetMiniChart ws={ws} uid={visual.id} isDragging={false} />
      </div>

      {/* Tactile diagonal drag-resize corner handle */}
      {editMode && !isDragging && (
        <div
          className="absolute right-0 bottom-0 w-6 h-6 cursor-se-resize z-10 flex items-end justify-end p-1.5 group/resize active:scale-90 transition-all duration-200 pointer-events-auto"
          onMouseDown={(e) => startResizing(e, visual.id, gridContainerRef)}
          title="Resize visual"
        >
          <div className="w-2.5 h-2.5 border-r-[2.5px] border-b-[2.5px] border-border-strong group-hover/resize:border-chart-1 rounded-br-[2px] transition-colors" />
        </div>
      )}
    </div>
  );
}
