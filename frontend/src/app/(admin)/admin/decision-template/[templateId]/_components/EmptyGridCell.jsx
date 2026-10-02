'use client';
import React from 'react';
import { Plus } from 'lucide-react';
import { COL_START_CLASS, ROW_START_CLASS } from '../_lib/gridConfig';

/**
 * A single unoccupied grid cell. GridCanvas (via useGridSelection) owns all
 * placement/sizing state — this is a dumb cell that only forwards the raw
 * pointer events: mousedown+mouseenter+mouseup (on the window) drives
 * drag-to-size (a plain click is just a drag with zero movement, so it
 * settles a 1x1 selection the same way). Right-click opens the Assign
 * Feature menu for whatever is selected — see useGridSelection's `openMenu`.
 * `hidden` covers a cell already inside the live/settled selection rectangle
 * drawn on top by GridSelectionOverlay — kept mounted (not removed) so it
 * keeps receiving mouseenter if the drag shrinks back over it.
 */
export function EmptyGridCell({ row, col, hidden, onMouseDown, onMouseEnter, onContextMenu }) {
    return (
        <button
            type="button"
            onMouseDown={(e) => { if (e.button === 0) onMouseDown(row, col); }}
            onMouseEnter={() => onMouseEnter(row, col)}
            onContextMenu={(e) => onContextMenu(e, row, col)}
            aria-label="Drag to size a block, then right-click to assign a feature"
            className={`${COL_START_CLASS[col + 1]} ${ROW_START_CLASS[row + 1]} h-full flex items-center justify-center rounded-2xl border-2 border-dashed border-border bg-surface-2/40 text-text-subtle hover:border-brand/50 hover:bg-brand-muted hover:text-brand transition-all duration-base ease-default cursor-pointer ${
                hidden ? 'opacity-0' : ''
            }`}
        >
            <Plus className="w-5 h-5" />
        </button>
    );
}
