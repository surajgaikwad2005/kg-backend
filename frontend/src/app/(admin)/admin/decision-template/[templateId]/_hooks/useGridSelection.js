'use client';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { largestFreeRect, rectContains } from '../_lib/gridSelection';

/**
 * Owns the grid's drag-to-size + right-click-to-assign interaction:
 *   - mousedown on an empty cell starts a drag anchor.
 *   - mouseenter over other empty cells while dragging grows/shrinks the
 *     live rectangle, stopping at the first already-occupied cell.
 *   - mouseup (anywhere) settles the drag into `selection` — sized, but the
 *     Assign Feature menu does NOT open yet (a plain click is just a 1x1
 *     drag with zero movement, so it settles a 1x1 selection the same way).
 *   - right-click (contextmenu) is what actually opens the menu: on a cell
 *     already inside the current `selection` it reuses that rect; on any
 *     other empty cell it starts a fresh 1x1 selection there and opens on
 *     it. Right-clicking a cell that's inside an ALREADY-OPEN menu's
 *     selection toggles it closed instead (same target = close, not reopen).
 *     Keyboard users reach the same event via Shift+F10 / the Menu key on a
 *     focused cell (browsers dispatch a real `contextmenu` for that). Touch
 *     has no right-click equivalent, so GridCanvas also renders a small
 *     tap-friendly "Assign" button on a settled selection that calls
 *     `openMenu` directly — same entry point, just a different trigger.
 * A settled selection (menu open or not) stays until resolved (a widget type
 * is chosen) or cancelled (click-away / Escape).
 */
export function useGridSelection(occupiedCells) {
    const [dragAnchor, setDragAnchor] = useState(null);
    const [dragCursor, setDragCursor] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [selection, setSelection] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

    const liveRect = useMemo(() => {
        if (!isDragging || !dragAnchor || !dragCursor) return null;
        return largestFreeRect(dragAnchor, dragCursor, occupiedCells);
    }, [isDragging, dragAnchor, dragCursor, occupiedCells]);

    const startDrag = useCallback((row, col) => {
        if (menuOpen) return; // resolve or cancel the open menu first
        setDragAnchor({ row, col });
        setDragCursor({ row, col });
        setIsDragging(true);
    }, [menuOpen]);

    const growDrag = useCallback((row, col) => {
        if (!isDragging) return;
        setDragCursor({ row, col });
    }, [isDragging]);

    const finalizeDrag = useCallback(() => {
        if (dragAnchor && dragCursor) {
            setSelection(largestFreeRect(dragAnchor, dragCursor, occupiedCells));
        }
        setIsDragging(false);
        setDragAnchor(null);
        setDragCursor(null);
    }, [dragAnchor, dragCursor, occupiedCells]);

    useEffect(() => {
        if (!isDragging) return;
        window.addEventListener('mouseup', finalizeDrag);
        return () => window.removeEventListener('mouseup', finalizeDrag);
    }, [isDragging, finalizeDrag]);

    /**
     * Opens the Assign Feature menu — reuses the current selection if the
     * target cell falls inside it, otherwise starts a fresh 1x1 selection.
     * Toggle: if the menu is already open on a selection that contains this
     * cell, closes it instead (right-clicking the same block again = off).
     */
    const openMenu = useCallback((row, col) => {
        if (menuOpen && selection && rectContains(selection, row, col)) {
            setMenuOpen(false);
            setSelection(null);
            return;
        }
        setSelection((prev) => (prev && rectContains(prev, row, col) ? prev : { rowStart: row, rowEnd: row, colStart: col, colEnd: col }));
        setMenuOpen(true);
    }, [menuOpen, selection]);

    const cancelSelection = useCallback(() => {
        setSelection(null);
        setMenuOpen(false);
        setIsDragging(false);
        setDragAnchor(null);
        setDragCursor(null);
    }, []);

    const resolveSelection = useCallback(() => {
        setSelection(null);
        setMenuOpen(false);
    }, []);

    return {
        activeRect: selection || liveRect,
        selection,
        menuOpen,
        startDrag,
        growDrag,
        openMenu,
        cancelSelection,
        resolveSelection,
    };
}
