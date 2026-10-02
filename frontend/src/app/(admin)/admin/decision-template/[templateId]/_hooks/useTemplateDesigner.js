'use client';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/src/context/AppContext';
import { useToast } from '@/src/components/ui/Toast';
import { useConfirm } from '@/src/components/ui/ConfirmModal';
import {
    useSnapshotOptions,
    useSnapshotFeatures,
    useSnapshot,
    useWorkflow,
    useUpdateSnapshot,
} from '../../_queries/useDecisionTemplate';
import { buildWidgetCatalog } from '../_lib/widgetCatalog';
import { DEFAULT_GRID_SIZE, GRID_SIZE_BOUNDS } from '../_lib/gridConfig';

/** Where the designer returns to once a save succeeds. */
const TEMPLATE_LIST_PATH = '/admin/decision-template';

let widgetIdCounter = 0;
const nextWidgetId = () => `grid-widget-${Date.now()}-${widgetIdCounter++}`;

function isValidWidgetList(value) {
    return Array.isArray(value) && value.every(
        (w) => w && typeof w.typeId === 'string' && Number.isInteger(w.row) && Number.isInteger(w.col)
            && Number.isInteger(w.rowSpan) && Number.isInteger(w.colSpan)
    );
}

function isValidGridSize(value) {
    return value && Number.isInteger(value.rows) && Number.isInteger(value.cols)
        && value.rows >= GRID_SIZE_BOUNDS.minRows && value.rows <= GRID_SIZE_BOUNDS.maxRows
        && value.cols >= GRID_SIZE_BOUNDS.minCols && value.cols <= GRID_SIZE_BOUNDS.maxCols;
}

/**
 * Normalizes one category's saved entry into { gridSize, widgets }. Accepts
 * both the current shape ({ gridSize, widgets }) and the older bare-array
 * shape (widgets only, from before the grid-size picker existed) — falls
 * back to DEFAULT_GRID_SIZE for the latter. Returns null if neither shape
 * matches (unconfirmed backend payload — see api-data/decision-template.json).
 */
function normalizeCategoryEntry(entry) {
    if (isValidWidgetList(entry)) return { gridSize: DEFAULT_GRID_SIZE, widgets: entry };
    if (entry && isValidWidgetList(entry.widgets)) {
        return { gridSize: isValidGridSize(entry.gridSize) ? entry.gridSize : DEFAULT_GRID_SIZE, widgets: entry.widgets };
    }
    return null;
}

/**
 * Owns the layout-designer's data: which pages (categories) this template's
 * snapshot exposes (snapshotOptionList), the widget palette (snapshotFeatureList),
 * any previously-saved grid layout (viewSnapshot), and the per-category grid
 * size + widget placement — plus persisting it back (configSnapshot).
 */
/** Canonical serialization of the designer's persistable state, used to detect
 *  unsaved changes by comparing against the last loaded/saved snapshot. */
const serializeState = (grids, sizes) => JSON.stringify({ grids, sizes });

export function useTemplateDesigner(templateId) {
    const { plantCode } = useApp();
    const router = useRouter();
    const toast = useToast();
    const { openConfirm } = useConfirm();

    // categories / categoriesLoading / categoriesError / widgetCatalog /
    // templateMeta are all derived from queries below — they are server data,
    // not editable state, so they no longer need useState mirrors.
    const [activeCategory, setActiveCategory] = useState(null);
    const [gridsByCategory, setGridsByCategory] = useState({});
    const [gridSizeByCategory, setGridSizeByCategory] = useState({});
    const [saving, setSaving] = useState(false);
    // Serialized snapshot of the last loaded/saved state — the baseline that
    // `isDirty` compares against. Starts as the empty state so an untouched
    // fresh page never reads as dirty. State (not a ref) so resetting the
    // baseline after a successful save re-renders the header's dirty badge.
    const [savedState, setSavedState] = useState(() => serializeState({}, {}));

    // The [templateId] route segment is always a string — the backend schema
    // (SnapshotViewRequest/WorkflowViewRequest) declares template_id as an
    // integer. Coerce once here and treat a non-numeric segment (malformed
    // URL) as invalid rather than sending a string through unguarded.
    const numericTemplateId = useMemo(() => {
        const n = Number(templateId);
        return Number.isFinite(n) ? n : null;
    }, [templateId]);

    // Four independent queries instead of one Promise.all. Previously a failure
    // in either non-swallowed call rejected the whole chain and blanked the
    // page; now each resolves on its own, so a missing snapshot no longer costs
    // you the widget palette. `enabled` also replaces the manual early-returns:
    // with no plant (or a malformed id) nothing is requested at all.
    // Destructured: useMutation returns a new object each render, so depending
    // on the whole result would defeat saveSnapshot's useCallback (rule 24).
    const { mutateAsync: updateSnapshotAsync } = useUpdateSnapshot(plantCode, numericTemplateId);

    const optionsQuery = useSnapshotOptions(plantCode, numericTemplateId);
    const featuresQuery = useSnapshotFeatures(plantCode);
    const snapshotQuery = useSnapshot(plantCode, numericTemplateId);
    const workflowQuery = useWorkflow(plantCode, numericTemplateId);

    const categories = useMemo(
        () => (Array.isArray(optionsQuery.data) ? optionsQuery.data : []).map((key) => ({ template: key })),
        [optionsQuery.data],
    );

    const widgetCatalog = useMemo(
        () => buildWidgetCatalog(featuresQuery.data?.[0]?.features ?? {}),
        [featuresQuery.data],
    );

    const templateMeta = useMemo(() => {
        const wf = workflowQuery.data;
        if (!wf?.template_name) return null;
        return { template_name: wf.template_name, template_class: wf.template_class };
    }, [workflowQuery.data]);

    const categoriesLoading =
        optionsQuery.isLoading || featuresQuery.isLoading || snapshotQuery.isLoading;

    const categoriesError = useMemo(() => {
        if (plantCode && numericTemplateId === null) return 'Invalid template ID in the URL.';
        // Only the two required reads gate the page. A failed snapshot means
        // "nothing saved yet", and template metadata is decorative.
        const err = optionsQuery.error || featuresQuery.error;
        return err ? (err.message || 'Failed to load categories') : null;
    }, [plantCode, numericTemplateId, optionsQuery.error, featuresQuery.error]);

    // Default to the first category once the list arrives.
    useEffect(() => {
        if (categories.length === 0) return;
        setActiveCategory((prev) => prev || categories[0].template);
    }, [categories]);

    // Seed the editable grid from the saved snapshot. This stays an effect
    // because the grid is USER-EDITABLE state that happens to be initialised
    // from the server — deriving it during render would discard every edit on
    // the next render. Keyed on the query's own data so it re-seeds when the
    // template changes or the snapshot is refetched after a save.
    const savedSnapshot = snapshotQuery.data?.snapshot;
    useEffect(() => {
        if (!savedSnapshot || typeof savedSnapshot !== 'object') return;
        const widgetsByCat = {};
        const sizesByCat = {};
        Object.entries(savedSnapshot).forEach(([key, entry]) => {
            const normalized = normalizeCategoryEntry(entry);
            if (!normalized) return;
            widgetsByCat[key] = normalized.widgets;
            sizesByCat[key] = normalized.gridSize;
        });
        if (Object.keys(widgetsByCat).length > 0) setGridsByCategory(widgetsByCat);
        if (Object.keys(sizesByCat).length > 0) setGridSizeByCategory(sizesByCat);
        // What was just loaded IS the saved state — reset the dirty baseline.
        setSavedState(serializeState(widgetsByCat, sizesByCat));
    }, [savedSnapshot]);

    const activeWidgets = useMemo(
        () => gridsByCategory[activeCategory] || [],
        [gridsByCategory, activeCategory]
    );

    const activeGridSize = useMemo(
        () => gridSizeByCategory[activeCategory] || DEFAULT_GRID_SIZE,
        [gridSizeByCategory, activeCategory]
    );

    const placedTypeIds = useMemo(
        () => new Set(activeWidgets.map((w) => w.typeId)),
        [activeWidgets]
    );

    const occupiedCells = useMemo(() => {
        const map = new Map();
        activeWidgets.forEach((w) => {
            for (let r = w.row; r < w.row + w.rowSpan; r++) {
                for (let c = w.col; c < w.col + w.colSpan; c++) {
                    map.set(`${r}-${c}`, w.id);
                }
            }
        });
        return map;
    }, [activeWidgets]);

    /**
     * Size now comes from the user's own grid selection (drag-select or a
     * single-cell click/right-click in GridCanvas) rather than a fixed
     * per-widget-type default — the caller passes the exact rowSpan/colSpan
     * it already validated as free. Re-checked here anyway since this is the
     * authoritative gate before mutating state.
     */
    const assignWidget = useCallback(
        (row, col, rowSpan, colSpan, widgetType) => {
            if (!activeCategory) return { ok: false, reason: 'Select a category first.' };
            if (placedTypeIds.has(widgetType.id)) {
                return { ok: false, reason: `${widgetType.label} is already placed in this category.` };
            }

            const clampedRowSpan = Math.min(rowSpan, activeGridSize.rows - row);
            const clampedColSpan = Math.min(colSpan, activeGridSize.cols - col);

            for (let r = row; r < row + clampedRowSpan; r++) {
                for (let c = col; c < col + clampedColSpan; c++) {
                    if (occupiedCells.has(`${r}-${c}`)) {
                        return { ok: false, reason: 'Not enough space here for this widget.' };
                    }
                }
            }

            const widget = { id: nextWidgetId(), typeId: widgetType.id, row, col, rowSpan: clampedRowSpan, colSpan: clampedColSpan };
            setGridsByCategory((prev) => ({
                ...prev,
                [activeCategory]: [...(prev[activeCategory] || []), widget],
            }));
            return { ok: true };
        },
        [activeCategory, activeGridSize, occupiedCells, placedTypeIds]
    );

    const removeWidget = useCallback(
        (widgetId) => {
            if (!activeCategory) return;
            setGridsByCategory((prev) => ({
                ...prev,
                [activeCategory]: (prev[activeCategory] || []).filter((w) => w.id !== widgetId),
            }));
        },
        [activeCategory]
    );

    /**
     * Changes the active category's grid size. Blocks (rather than silently
     * clipping) a shrink that would leave an already-placed widget outside
     * the new bounds — the user must remove/move it first, so no placement
     * data is silently lost.
     */
    const resizeGrid = useCallback(
        (rows, cols) => {
            if (!activeCategory) return { ok: false, reason: 'Select a category first.' };
            if (!Number.isInteger(rows) || !Number.isInteger(cols)
                || rows < GRID_SIZE_BOUNDS.minRows || rows > GRID_SIZE_BOUNDS.maxRows
                || cols < GRID_SIZE_BOUNDS.minCols || cols > GRID_SIZE_BOUNDS.maxCols) {
                return {
                    ok: false,
                    reason: `Rows must be ${GRID_SIZE_BOUNDS.minRows}-${GRID_SIZE_BOUNDS.maxRows} and columns ${GRID_SIZE_BOUNDS.minCols}-${GRID_SIZE_BOUNDS.maxCols}.`,
                };
            }

            const outOfBounds = activeWidgets.some((w) => w.row + w.rowSpan > rows || w.col + w.colSpan > cols);
            if (outOfBounds) {
                return { ok: false, reason: 'Some placed widgets would fall outside this size — remove or move them first.' };
            }

            setGridSizeByCategory((prev) => ({ ...prev, [activeCategory]: { rows, cols } }));
            return { ok: true };
        },
        [activeCategory, activeWidgets]
    );

    const activeCounts = useMemo(() => {
        const counts = {};
        Object.entries(gridsByCategory).forEach(([key, widgets]) => {
            counts[key] = widgets.length;
        });
        return counts;
    }, [gridsByCategory]);

    const isDirty = useMemo(
        () => serializeState(gridsByCategory, gridSizeByCategory) !== savedState,
        [gridsByCategory, gridSizeByCategory, savedState]
    );

    // Warn before a full page unload (close/refresh/external nav) with unsaved
    // layout changes. In-app route changes can't be intercepted this way in the
    // App Router — the header's unsaved badge covers that visibility gap.
    useEffect(() => {
        if (!isDirty) return;
        const onBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', onBeforeUnload);
        return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }, [isDirty]);

    /** Clears every placed widget from the active category (grid size kept),
     *  after confirmation. Local-only until Save Template persists it. */
    const clearCategory = useCallback(() => {
        if (!activeCategory || activeWidgets.length === 0) return;
        openConfirm({
            title: 'Clear this layout?',
            message: `Remove all ${activeWidgets.length} placed feature${activeWidgets.length === 1 ? '' : 's'} from "${activeCategory}"? Nothing is saved until you press Save Template.`,
            confirmLabel: 'Clear',
            onConfirm: () => {
                setGridsByCategory((prev) => ({ ...prev, [activeCategory]: [] }));
            },
        });
    }, [activeCategory, activeWidgets.length, openConfirm]);

    const saveSnapshot = useCallback(async () => {
        if (!plantCode || numericTemplateId === null || saving) return;
        setSaving(true);
        try {
            const categoryKeys = new Set([...Object.keys(gridsByCategory), ...Object.keys(gridSizeByCategory)]);
            const payload = Object.fromEntries(
                Array.from(categoryKeys).map((key) => [
                    key,
                    { gridSize: gridSizeByCategory[key] || DEFAULT_GRID_SIZE, widgets: gridsByCategory[key] || [] },
                ])
            );
            await updateSnapshotAsync(payload);
            // Current state is now the persisted state — reset the dirty baseline
            // before navigating so the beforeunload guard doesn't consider it dirty.
            setSavedState(serializeState(gridsByCategory, gridSizeByCategory));
            toast.success('Layout saved', 'The snapshot layout has been saved successfully.');
            // Back to the template list on success. `saving` is intentionally left
            // true here so the button stays disabled/"Saving…" until this route
            // unmounts, instead of flickering back to an enabled state mid-navigation.
            router.push(TEMPLATE_LIST_PATH);
        } catch {
            // Surfaced by the global mutation-error toast (meta.errorTitle:
            // 'Save Failed'); only the local saving flag needs resetting.
            setSaving(false);
        }
    }, [plantCode, numericTemplateId, gridsByCategory, gridSizeByCategory, saving, toast, router, updateSnapshotAsync]);

    return {
        categories,
        categoriesLoading,
        categoriesError,
        activeCategory,
        setActiveCategory,
        activeWidgets,
        activeGridSize,
        resizeGrid,
        occupiedCells,
        placedTypeIds,
        assignWidget,
        removeWidget,
        activeCounts,
        widgetCatalog,
        templateMeta,
        saving,
        saveSnapshot,
        isDirty,
        clearCategory,
        noPlantSelected: !plantCode,
    };
}
