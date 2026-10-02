'use client';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Sparkles, Eraser, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/src/components/ui/Toast';
import { GRID_TEMPLATE_COLS_CLASS } from '../_lib/gridConfig';
import { rectContains } from '../_lib/gridSelection';
import { useGridSelection } from '../_hooks/useGridSelection';
import { GridWidgetCard } from './GridWidgetCard';
import { EmptyGridCell } from './EmptyGridCell';
import { GridSelectionOverlay } from './GridSelectionOverlay';
import { AssignFeaturePopover } from './AssignFeaturePopover';
import { GridSizeControl } from './GridSizeControl';

export function GridCanvas({ widgets, gridSize, onResize, onClear, occupiedCells, placedTypeIds, onAssign, onRemove, widgetCatalog }) {
    const toast = useToast();
    const containerRef = useRef(null);
    const { rows, cols } = gridSize;

    const {
        activeRect, selection, menuOpen,
        startDrag, growDrag, openMenu, cancelSelection, resolveSelection,
    } = useGridSelection(occupiedCells);

    // Click-away or Escape cancels a settled selection (menu open or not).
    useEffect(() => {
        if (!selection) return;
        function onDocMouseDown(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) cancelSelection();
        }
        function onKeyDown(e) {
            if (e.key === 'Escape') cancelSelection();
        }
        document.addEventListener('mousedown', onDocMouseDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', onDocMouseDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [selection, cancelSelection]);

    const handleContextMenu = useCallback((e, row, col) => {
        e.preventDefault();
        openMenu(row, col);
    }, [openMenu]);

    const handleSelectType = useCallback((type) => {
        if (!selection) return;
        const { rowStart, rowEnd, colStart, colEnd } = selection;
        const result = onAssign(rowStart, colStart, rowEnd - rowStart + 1, colEnd - colStart + 1, type);
        if (result?.ok) {
            resolveSelection();
        } else {
            toast.error(result?.reason || 'Could not assign this feature here.');
        }
    }, [selection, onAssign, resolveSelection, toast]);

    const cells = useMemo(() => {
        const list = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const key = `${r}-${c}`;
                const anchorWidget = widgets.find((w) => w.row === r && w.col === c);
                if (anchorWidget) {
                    list.push({ key, kind: 'widget', widget: anchorWidget });
                } else if (!occupiedCells.has(key)) {
                    const hidden = Boolean(activeRect && rectContains(activeRect, r, c));
                    list.push({ key, kind: 'empty', row: r, col: c, hidden });
                }
                // else: covered by another widget's span — nothing to render here
            }
        }
        return list;
    }, [widgets, occupiedCells, activeRect, rows, cols]);

    // Shared anchor placement for both the tap-to-assign button and the
    // popover — both sit at the selection's bottom-right cell, flipped
    // toward the grid's interior near an edge so they never render offscreen.
    const anchorAlign = selection && selection.colEnd >= cols - 2 ? 'right' : 'left';
    const anchorOpenUp = selection && selection.rowEnd >= rows - 1;

    return (
        <div ref={containerRef} className="overflow-x-auto thin-scrollbar pb-2">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <p className="text-xs text-text-secondary min-w-0">
                    Drag across empty blocks to size a placement, then right-click (or tap Assign) to pick a feature.
                </p>
                <div className="flex items-center gap-2 shrink-0 ml-auto">
                    {widgetCatalog.list.length > 0 && (
                        <span
                            className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border ${
                                placedTypeIds.size === widgetCatalog.list.length
                                    ? 'text-success bg-success/10 border-success/20'
                                    : 'text-text-secondary bg-surface border-border'
                            }`}
                            title="Features placed in this category"
                        >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {placedTypeIds.size}/{widgetCatalog.list.length} placed
                        </span>
                    )}
                    {widgets.length > 0 && (
                        <button
                            type="button"
                            onClick={onClear}
                            aria-label="Clear all placed features from this category"
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-danger bg-danger/10 border border-danger/20 rounded-lg hover:bg-danger/20 transition-colors duration-fast cursor-pointer whitespace-nowrap"
                        >
                            <Eraser className="w-3.5 h-3.5" />
                            Clear
                        </button>
                    )}
                    <GridSizeControl rows={rows} cols={cols} onResize={onResize} />
                </div>
            </div>
            {/* 8rem row height — kept compact for the common 1x1 case; larger
                custom selections just span more rows/cols of the same track.
                Column count is per-category and user-adjustable (GridSizeControl),
                so the container's grid-cols-N class must come from the same
                literal lookup map Tailwind's JIT needs (see gridConfig.js). */}
            <div className={`relative grid ${GRID_TEMPLATE_COLS_CLASS[cols]} auto-rows-[8rem] gap-4 min-w-220 select-none`}>
                {cells.map((cell) =>
                    cell.kind === 'widget' ? (
                        <GridWidgetCard key={cell.key} widget={cell.widget} onRemove={onRemove} widgetTypeMap={widgetCatalog.map} />
                    ) : (
                        <EmptyGridCell
                            key={cell.key}
                            row={cell.row}
                            col={cell.col}
                            hidden={cell.hidden}
                            onMouseDown={startDrag}
                            onMouseEnter={growDrag}
                            onContextMenu={handleContextMenu}
                        />
                    )
                )}

                {activeRect && (
                    <GridSelectionOverlay
                        row={activeRect.rowStart}
                        col={activeRect.colStart}
                        rowSpan={activeRect.rowEnd - activeRect.rowStart + 1}
                        colSpan={activeRect.colEnd - activeRect.colStart + 1}
                        pending={Boolean(selection)}
                    />
                )}

                {/* Settled but not yet confirmed — right-click opens the menu
                    directly on the grid; this button is the tap-friendly
                    equivalent for touch (no right-click gesture) and doubles
                    as a visible mouse-accessible affordance too. */}
                {selection && !menuOpen && (
                    <div
                        className="relative"
                        style={{ gridRowStart: selection.rowEnd + 1, gridColumnStart: selection.colEnd + 1 }}
                    >
                        <button
                            type="button"
                            onClick={() => openMenu(selection.rowEnd, selection.colEnd)}
                            onContextMenu={(e) => { e.preventDefault(); openMenu(selection.rowEnd, selection.colEnd); }}
                            aria-label="Assign a feature to this selection"
                            className={`absolute z-30 flex items-center gap-1.5 px-3 py-2 bg-brand text-white rounded-lg text-xs font-bold shadow-lg hover:bg-brand-hover transition-colors duration-fast cursor-pointer whitespace-nowrap animate-time-selector-in
                                ${anchorAlign === 'right' ? 'right-0' : 'left-0'}
                                ${anchorOpenUp ? 'bottom-full mb-2' : 'top-full mt-2'}`}
                        >
                            <Sparkles className="w-3.5 h-3.5" /> Assign Feature
                        </button>
                    </div>
                )}

                {menuOpen && selection && (
                    <div
                        className="relative"
                        style={{ gridRowStart: selection.rowEnd + 1, gridColumnStart: selection.colEnd + 1 }}
                    >
                        <AssignFeaturePopover
                            onSelect={handleSelectType}
                            placedTypeIds={placedTypeIds}
                            align={anchorAlign}
                            openUp={anchorOpenUp}
                            widgetTypes={widgetCatalog.list}
                            sizeLabel={`${selection.rowEnd - selection.rowStart + 1} x ${selection.colEnd - selection.colStart + 1}`}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
