/**
 * Grid dimensions for the layout designer are per-category and
 * user-adjustable (see GridSizeControl) — DEFAULT_GRID_SIZE is only the
 * starting size for a category that hasn't been resized yet, not a global
 * fixed grid. MIN/MAX bound the resize stepper UI.
 */
export const DEFAULT_GRID_SIZE = { rows: 5, cols: 5 };
export const GRID_SIZE_BOUNDS = { minRows: 1, maxRows: 10, minCols: 1, maxCols: 12 };

/**
 * Tailwind's grid-column/row utilities only compile if the literal class
 * string appears in source — these lookup maps let us pick a span/start
 * dynamically at runtime while keeping every possible class name literally
 * present here for the JIT scanner to find. Every entry MUST be written out
 * by hand (not built via a template-literal loop) — a computed string like
 * `` `col-span-${n}` `` inside a loop never appears as literal source text,
 * so Tailwind would silently fail to generate that class's CSS.
 */
export const COL_SPAN_CLASS = {
    1: 'col-span-1',
    2: 'col-span-2',
    3: 'col-span-3',
    4: 'col-span-4',
    5: 'col-span-5',
    6: 'col-span-6',
    7: 'col-span-7',
    8: 'col-span-8',
    9: 'col-span-9',
    10: 'col-span-10',
    11: 'col-span-11',
    12: 'col-span-12',
};

export const ROW_SPAN_CLASS = {
    1: 'row-span-1',
    2: 'row-span-2',
    3: 'row-span-3',
    4: 'row-span-4',
    5: 'row-span-5',
    6: 'row-span-6',
    7: 'row-span-[7]',
    8: 'row-span-[8]',
    9: 'row-span-[9]',
    10: 'row-span-[10]',
};

export const COL_START_CLASS = {
    1: 'col-start-1',
    2: 'col-start-2',
    3: 'col-start-3',
    4: 'col-start-4',
    5: 'col-start-5',
    6: 'col-start-6',
    7: 'col-start-7',
    8: 'col-start-8',
    9: 'col-start-9',
    10: 'col-start-10',
    11: 'col-start-11',
    12: 'col-start-12',
    13: 'col-start-13',
};

export const ROW_START_CLASS = {
    1: 'row-start-1',
    2: 'row-start-2',
    3: 'row-start-3',
    4: 'row-start-4',
    5: 'row-start-5',
    6: 'row-start-6',
    7: 'row-start-[7]',
    8: 'row-start-[8]',
    9: 'row-start-[9]',
    10: 'row-start-[10]',
    11: 'row-start-[11]',
};

/** The grid container's explicit column-track count — driven by each
 *  category's chosen `cols`. Rows stay implicit (`auto-rows-[8rem]` on the
 *  container) since the designer never needs a fixed row template. */
export const GRID_TEMPLATE_COLS_CLASS = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    7: 'grid-cols-7',
    8: 'grid-cols-8',
    9: 'grid-cols-9',
    10: 'grid-cols-10',
    11: 'grid-cols-11',
    12: 'grid-cols-12',
};
