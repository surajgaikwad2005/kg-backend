'use client';

import React, { useMemo, useState } from 'react';
import DetailToolbar from './DetailToolbar';
import KpiStatusStrip from './KpiStatusStrip';
import DashboardGrid from './DashboardGrid';
import { getVisualProps } from '../helpers';
import { resolveAndCompactLayout } from '../../_hooks/layoutCompaction';

export default function DetailView({
  activeGroup,
  editMode,
  tempVisuals,
  handleToggleEditMode,
  handleSaveLayout,
  startDragging,
  startResizing,
  openAddVisualDrawer,
  openEditVisualDrawer,
  handleDeleteVisual,
  setActiveGroupId,
  gridContainerRef,
  draggingId,
  handleResetLayout,
  handleMoveSummaryVisual,
  isLoading = false,
}) {
  // Lifted columns configuration state
  const [itemsPerRow, setItemsPerRow] = useState('auto');
  // Toggle between showing KPIs in unified strip (flat) or floating cards (gaps/colors)
  const [kpiStyle, setKpiStyle] = useState('unified'); // 'unified' | 'floating'

  // Compute visuals list based on edit mode buffer
  const visualsList = useMemo(() => {
    if (!activeGroup) return [];
    return editMode ? tempVisuals : (activeGroup.visuals || []);
  }, [activeGroup, editMode, tempVisuals]);

  // Helper to determine if visual is KPI/Gauge summary widget
  const isSummaryVisual = (v) => {
    const t = getVisualProps(v).type;
    return t === 'kpi' || t === 'kpi_card' || t === 'kpigrid' || t === 'gauge';
  };

  // KPIs & circular gauge summary widgets (top strip)
  const summaryVisuals = useMemo(() => {
    return visualsList.filter(isSummaryVisual);
  }, [visualsList]);

  // Rest of chart visuals displayed in lower 12-column grid
  // Always run layout compaction so visuals never overlap — even in view mode
  const gridVisuals = useMemo(() => {
    const raw = visualsList.filter((v) => !isSummaryVisual(v));
    // Deep clone to avoid mutating source data during compaction
    const cloned = JSON.parse(JSON.stringify(raw));
    return resolveAndCompactLayout(cloned, null).filter((v) => !isSummaryVisual(v));
  }, [visualsList]);

  return (
    <div className="flex flex-col gap-4">
      {/* Dynamic Detail Actions toolbar */}
      <DetailToolbar
        activeGroup={activeGroup}
        editMode={editMode}
        handleToggleEditMode={handleToggleEditMode}
        handleSaveLayout={handleSaveLayout}
        openAddVisualDrawer={openAddVisualDrawer}
        setActiveGroupId={setActiveGroupId}
        itemsPerRow={itemsPerRow}
        setItemsPerRow={setItemsPerRow}
        kpiStyle={kpiStyle}
        setKpiStyle={setKpiStyle}
        handleResetLayout={handleResetLayout}
      />

      {/* KPI Stats Strip */}
      <KpiStatusStrip 
        summaryVisuals={summaryVisuals} 
        itemsPerRow={itemsPerRow}
        kpiStyle={kpiStyle}
        editMode={editMode}
        onEdit={openEditVisualDrawer}
        onDelete={handleDeleteVisual}
        onMove={handleMoveSummaryVisual}
      />

      {/* 12-Column Widgets Grid layout */}
      <DashboardGrid
        gridVisuals={gridVisuals}
        editMode={editMode}
        startDragging={startDragging}
        startResizing={startResizing}
        openEditVisualDrawer={openEditVisualDrawer}
        handleDeleteVisual={handleDeleteVisual}
        gridContainerRef={gridContainerRef}
        draggingId={draggingId}
        isLoading={isLoading}
      />
    </div>
  );
}
