'use client';
import React from 'react';

/**
 * Purely visual highlight for the in-progress drag-select rectangle or the
 * finalized pending selection (before a widget type is chosen). Rendered as
 * a sibling grid item inside the same CSS grid as the cells, using
 * grid-row/grid-column placement so it lines up without any pixel math.
 * pointer-events-none so drag/hover events keep reaching the cells beneath it.
 */
export function GridSelectionOverlay({ row, col, rowSpan, colSpan, pending }) {
    return (
        <div
            aria-hidden="true"
            className={`pointer-events-none rounded-2xl border-2 transition-colors duration-fast ${
                pending ? 'border-brand bg-brand-muted/60' : 'border-brand/70 border-dashed bg-brand-muted/30'
            }`}
            style={{
                gridRowStart: row + 1,
                gridRowEnd: `span ${rowSpan}`,
                gridColumnStart: col + 1,
                gridColumnEnd: `span ${colSpan}`,
            }}
        />
    );
}
