import { resolveAndCompactLayout } from './layoutCompaction';

export function createGridDragHandlers({ editMode, tempVisuals, setTempVisuals, setDraggingId }) {
  const startDragging = (e, visualId, gridContainerRef) => {
    e.preventDefault();
    if (!editMode) return;

    const grid = gridContainerRef.current?.querySelector('.dashboard-grid');
    const card = e.currentTarget.closest('.visual-card') || e.currentTarget.closest('[id^="visual-card-"]');
    if (!grid || !card) return;

    setDraggingId(visualId);

    const gridRect = grid.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();

    const clickOffsetX = e.clientX - cardRect.left;
    const clickOffsetY = e.clientY - cardRect.top;

    const gap = 1;
    const colWidth = (gridRect.width - (11 * gap)) / 12;
    const rowHeight = 140;

    const visual = tempVisuals.find((v) => v.id === visualId);
    if (!visual) return;

    const handleMouseMove = (moveEvent) => {
      const mouseX = moveEvent.clientX - gridRect.left - clickOffsetX;
      const mouseY = moveEvent.clientY - gridRect.top - clickOffsetY;

      let col = Math.round(mouseX / (colWidth + gap)) + 1;
      let row = Math.round(mouseY / (rowHeight + gap)) + 1;

      const colSpan = visual.grid?.colSpan || 6;
      col = Math.max(Math.min(col, 13 - colSpan), 1);
      row = Math.max(row, 1);

      setTempVisuals((prev) => {
        const updated = prev.map((v) => {
          if (v.id === visualId) {
            return {
              ...v,
              grid: {
                ...v.grid,
                colStart: col,
                rowStart: row,
                colSpan: v.grid?.colSpan || 6,
                rowSpan: v.grid?.rowSpan || 2,
              },
            };
          }
          return v;
        });
        return resolveAndCompactLayout(updated, visualId);
      });
    };

    const handleMouseUp = () => {
      setDraggingId(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const startResizing = (e, visualId, gridContainerRef) => {
    e.preventDefault();
    e.stopPropagation();
    if (!editMode) return;

    const grid = gridContainerRef.current?.querySelector('.dashboard-grid');
    const card = e.currentTarget.closest('.visual-card');
    if (!grid || !card) return;

    const startX = e.clientX;
    const startY = e.clientY;

    const visual = tempVisuals.find((v) => v.id === visualId);
    if (!visual) return;

    const startColSpan = visual.grid?.colSpan || 6;
    const startRowSpan = visual.grid?.rowSpan || 2;

    const gridRect = grid.getBoundingClientRect();
    const gap = 1;
    const colWidth = (gridRect.width - (11 * gap)) / 12;
    const rowHeight = 140;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      const colChange = Math.round(deltaX / (colWidth + gap));
      const rowChange = Math.round(deltaY / (rowHeight + gap));

      let newColSpan = startColSpan + colChange;
      let newRowSpan = startRowSpan + rowChange;

      const startCol = visual.grid?.colStart || 1;
      newColSpan = Math.max(Math.min(newColSpan, 13 - startCol), 1);
      newRowSpan = Math.max(newRowSpan, 1);

      setTempVisuals((prev) => {
        const updated = prev.map((v) => {
          if (v.id === visualId) {
            return {
              ...v,
              grid: {
                ...v.grid,
                colSpan: newColSpan,
                rowSpan: newRowSpan,
              },
            };
          }
          return v;
        });
        return resolveAndCompactLayout(updated, visualId);
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return { startDragging, startResizing };
}
