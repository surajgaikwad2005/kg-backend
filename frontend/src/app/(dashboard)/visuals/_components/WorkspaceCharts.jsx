'use client';

import React from 'react';
import { LaneChart } from '@/src/components/visuals/LaneChart';
import { CombinedChart } from '@/src/components/visuals/CombinedChart';

export function WorkspaceCharts({
  viewMode,
  displayTags,
  LANE_H,
  windowStart,
  clampedEnd,
  showGrid,
  showLabels,
  handleZoom,
  tagMetadata,
  resetZoom,
}) {
  if (viewMode === 'lanes') {
    return (
      <div className="flex flex-col h-full">
        {displayTags.map((tag, idx) => (
          <LaneChart
            key={tag.name}
            tag={tag}
            idx={idx}
            isLast={idx === displayTags.length - 1}
            laneH={LANE_H}
            windowStart={windowStart}
            clampedEnd={clampedEnd}
            showGrid={showGrid}
            showLabels={showLabels}
            onZoom={handleZoom}
            color={tag.color}
            metadata={tagMetadata[tag.name]}
            onDoubleClick={resetZoom}
          />
        ))}
      </div>
    );
  }

  return (
    <CombinedChart
      tagData={displayTags}
      viewMode={viewMode}
      windowStart={windowStart}
      clampedEnd={clampedEnd}
      showGrid={showGrid}
      onZoom={handleZoom}
      onDoubleClick={resetZoom}
    />
  );
}
