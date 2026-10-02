import { getVisualProps } from '../_components/helpers';

export function resolveAndCompactLayout(visuals, activeId = null) {
  if (!Array.isArray(visuals)) return [];

  const isSummaryVisual = (v) => {
    const t = getVisualProps(v).type;
    return t === 'kpi' || t === 'kpi_card' || t === 'kpigrid' || t === 'gauge';
  };

  const summaryItems = visuals.filter(isSummaryVisual);
  const gridItems = visuals.filter(v => !isSummaryVisual(v));

  // Initialize/guarantee grid properties for gridItems
  gridItems.forEach((v, i) => {
    const typeStr = getVisualProps(v).type;
    const defaultColStart = (i % 2 === 0) ? 1 : 7;
    const defaultRowStart = Math.floor(i / 2) * 2 + 1;
    const defaultColSpan = ['table', 'heatmap'].includes(typeStr) ? 12 : 6;
    const defaultRowSpan = typeStr === 'heatmap' ? 3 : 2;

    if (!v.grid) {
      v.grid = {
        colStart: defaultColStart,
        colSpan: defaultColSpan,
        rowStart: defaultRowStart,
        rowSpan: defaultRowSpan,
      };
    } else {
      v.grid.colStart = v.grid.colStart || defaultColStart;
      v.grid.colSpan = v.grid.colSpan || defaultColSpan;
      v.grid.rowStart = v.grid.rowStart || defaultRowStart;
      v.grid.rowSpan = v.grid.rowSpan || defaultRowSpan;
    }
  });

  const activeVisual = gridItems.find(v => v.id === activeId);

  const intersects = (a, b) => {
    const aColStart = a.grid?.colStart || 1;
    const aColSpan = a.grid?.colSpan || 6;
    const aRowStart = a.grid?.rowStart || 1;
    const aRowSpan = a.grid?.rowSpan || 2;

    const bColStart = b.grid?.colStart || 1;
    const bColSpan = b.grid?.colSpan || 6;
    const bRowStart = b.grid?.rowStart || 1;
    const bRowSpan = b.grid?.rowSpan || 2;

    return (
      aColStart < bColStart + bColSpan &&
      bColStart < aColStart + aColSpan &&
      aRowStart < bRowStart + bRowSpan &&
      bRowStart < aRowStart + aRowSpan
    );
  };

  // Place active visual first (stays fixed at drag/resize position)
  const placed = activeVisual ? [activeVisual] : [];
  
  // Sort remaining visuals by rowStart and colStart so we process top-to-bottom
  const sortedOthers = gridItems
    .filter(v => v.id !== activeId)
    .sort((a, b) => {
      const aRow = a.grid?.rowStart || 1;
      const bRow = b.grid?.rowStart || 1;
      if (aRow !== bRow) return aRow - bRow;
      return (a.grid?.colStart || 1) - (b.grid?.colStart || 1);
    });

  for (const item of sortedOthers) {
    // 1. Resolve collisions by pushing down if it collides with placed items
    let resolved = false;
    while (!resolved) {
      let collision = false;
      for (const other of placed) {
        if (intersects(item, other)) {
          collision = true;
          const otherRowStart = other.grid?.rowStart || 1;
          const otherRowSpan = other.grid?.rowSpan || 2;
          item.grid.rowStart = otherRowStart + otherRowSpan;
          break;
        }
      }
      if (!collision) {
        resolved = true;
      }
    }

    // 2. Compact it upwards as much as possible without colliding
    while (item.grid.rowStart > 1) {
      item.grid.rowStart--;
      let collision = false;
      for (const other of placed) {
        if (intersects(item, other)) {
          collision = true;
          break;
        }
      }
      if (collision) {
        item.grid.rowStart++;
        break;
      }
    }

    placed.push(item);
  }

  // Reflow remaining grid items when no drag is active so no row gaps or awkward empty spots are left
  if (!activeId) {
    let nextRow = 1;
    let nextCol = 1;
    let currentRowMaxSpan = 0;

    placed.forEach((item) => {
      const colSpan = item.grid.colSpan || 6;
      const rowSpan = item.grid.rowSpan || 2;
      const isFullWidth = colSpan >= 12;

      if (isFullWidth) {
        // Full-width items must start on a fresh row at col 1
        if (nextCol !== 1) {
          // Current row has a half-width item on the left — move to next row
          nextRow += currentRowMaxSpan || 2;
          nextCol = 1;
          currentRowMaxSpan = 0;
        } else if (currentRowMaxSpan > 0) {
          // Already placed something above at col 1 — advance row
          nextRow += currentRowMaxSpan;
          currentRowMaxSpan = 0;
        }
        item.grid.colStart = 1;
        item.grid.rowStart = nextRow;
        nextRow += rowSpan;
        nextCol = 1;
        currentRowMaxSpan = 0;
      } else {
        // Half-width: check if a full-width item is about to be placed on this row
        if (nextCol === 1) {
          currentRowMaxSpan = rowSpan;
        } else {
          currentRowMaxSpan = Math.max(currentRowMaxSpan, rowSpan);
        }
        item.grid.colStart = nextCol;
        item.grid.rowStart = nextRow;
        if (nextCol === 1) {
          nextCol = 7;
        } else {
          nextCol = 1;
          nextRow += currentRowMaxSpan;
          currentRowMaxSpan = 0;
        }
      }
    });
  }

  return [...summaryItems, ...placed];
}
