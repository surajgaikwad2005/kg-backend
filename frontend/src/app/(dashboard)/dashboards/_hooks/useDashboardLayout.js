'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/src/components/ui/Toast';
import { queryKeys } from '@/src/lib/query';
import { createGridDragHandlers } from './useGridInteraction';
import { resolveAndCompactLayout } from './layoutCompaction';
import { getVisualProps } from '../_components/helpers';

/**
 * Grid layout (drag/resize/reset) is purely local — the backend has no
 * "save layout" endpoint; positions only ever lived in the in-memory
 * dashboards array. Now that the canonical visuals array is the
 * `dashboard.detail` query entry, "saving" a layout means writing the
 * rearranged array back into that cache entry via `setQueryData` — same
 * client-only persistence as before, just targeting the query cache instead
 * of a hand-rolled dashboards array.
 */
export function useDashboardLayout({ plantCode, activeGroupId, activeGroup }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [tempVisuals, setTempVisuals] = useState([]);
  const [draggingId, setDraggingId] = useState(null);

  // Visuals Layout Edit Logic
  const handleToggleEditMode = (enable) => {
    if (enable) {
      if (activeGroup) {
        const initial = JSON.parse(JSON.stringify(activeGroup.visuals || []));
        const compacted = resolveAndCompactLayout(initial, null);
        setTempVisuals(compacted);
      }
      setEditMode(true);
      toast.success('Layout editing active');
    } else {
      setEditMode(false);
      setTempVisuals([]);
    }
  };

  const { startDragging, startResizing } = createGridDragHandlers({
    editMode,
    tempVisuals,
    setTempVisuals,
    setDraggingId,
  });

  const handleSaveLayout = () => {
    queryClient.setQueryData(
      queryKeys.dashboard.detail(plantCode, activeGroupId),
      (prev) => (prev ? { ...prev, visuals: tempVisuals } : prev),
    );
    setEditMode(false);
    toast.success('Grid layout changes saved');
  };

  const handleResetLayout = () => {
    let rowTracker = 1;
    let colTracker = 1;

    const isSummary = (v) => {
      const t = getVisualProps(v).type;
      return t === 'kpi' || t === 'kpi_card' || t === 'kpigrid' || t === 'gauge';
    };

    // Filter and sort only grid visuals so they align starting at row 1
    const sortedGridVisuals = [...tempVisuals]
      .filter((v) => !isSummary(v))
      .sort((a, b) => {
        const aRow = a.grid?.rowStart || 0;
        const bRow = b.grid?.rowStart || 0;
        if (aRow !== bRow) return aRow - bRow;
        return (a.grid?.colStart || 0) - (b.grid?.colStart || 0);
      });

    const summaryVisuals = tempVisuals.filter(isSummary);

    let currentRowMaxSpan = 2;

    const resetGridVisuals = sortedGridVisuals.map((v) => {
      const isLarge = ['table', 'heatmap'].includes(v.type);
      const colSpan = isLarge ? 12 : 6;
      const rowSpan = v.type === 'heatmap' ? 3 : 2;

      if (colTracker + colSpan > 13) {
        colTracker = 1;
        rowTracker += currentRowMaxSpan;
        currentRowMaxSpan = 2; // Reset for next row
      }

      currentRowMaxSpan = Math.max(currentRowMaxSpan, rowSpan);

      const res = {
        ...v,
        grid: {
          colStart: colTracker,
          colSpan,
          rowStart: rowTracker,
          rowSpan
        }
      };

      colTracker += colSpan;
      return res;
    });

    const combined = [...summaryVisuals, ...resetGridVisuals];
    const compacted = resolveAndCompactLayout(combined, null);

    setTempVisuals(compacted);
    toast.success('Grid layout auto-arranged without gaps');
  };

  const handleMoveSummaryVisual = (visualId, direction) => {
    const isSummary = (v) => {
      const t = getVisualProps(v).type;
      return t === 'kpi' || t === 'kpi_card' || t === 'kpigrid' || t === 'gauge';
    };
    const summaryVisuals = tempVisuals.filter(isSummary);
    const idx = summaryVisuals.findIndex(v => v.id === visualId);
    if (idx === -1) return;

    let targetIdx = -1;
    if (direction === 'left' && idx > 0) {
      targetIdx = idx - 1;
    } else if (direction === 'right' && idx < summaryVisuals.length - 1) {
      targetIdx = idx + 1;
    }

    if (targetIdx === -1) return;

    const targetVisualId = summaryVisuals[targetIdx].id;

    // Swap indices in tempVisuals
    const i1 = tempVisuals.findIndex(v => v.id === visualId);
    const i2 = tempVisuals.findIndex(v => v.id === targetVisualId);
    if (i1 === -1 || i2 === -1) return;

    const next = [...tempVisuals];
    const tmp = next[i1];
    next[i1] = next[i2];
    next[i2] = tmp;

    setTempVisuals(next);
  };

  return {
    editMode,
    setEditMode,
    tempVisuals,
    setTempVisuals,
    handleToggleEditMode,
    startDragging,
    startResizing,
    handleSaveLayout,
    draggingId,
    handleResetLayout,
    handleMoveSummaryVisual,
  };
}

export { resolveAndCompactLayout };
