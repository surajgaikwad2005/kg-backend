/**
 * pipelineRun.utils.js
 * Pure presentation helpers for CDM pipeline runs, shared by the expanded run
 * modal and its minimized dock so the two can never disagree about what a
 * status looks like or how far along a run is.
 *
 * Module scope on purpose (rule 22): none of this depends on props or state.
 */

/** The stages the Data Source Integration flow triggers, in display order. */
export const PIPELINE_ROWS = [
    { key: 'pnid', label: 'P&ID Extraction', icon: '📐' },
    { key: 'docs', label: 'Document Processing', icon: '📄' },
    { key: 'ts', label: 'Timeseries Metadata', icon: '📈' },
    { key: 'sap', label: 'SAP Data Processing', icon: '🏭' },
];

export const PIPELINE_STAGE_KEYS = PIPELINE_ROWS.map((r) => r.key);

const STATUS_PRESENTATION = {
    completed: {
        label: 'Completed',
        text: 'text-success',
        bar: 'bg-gradient-to-r from-success/80 to-success shadow-md shadow-success/30',
    },
    failed: {
        label: 'Failed',
        text: 'text-danger',
        bar: 'bg-gradient-to-r from-danger/80 to-danger shadow-md shadow-danger/30',
    },
    cancelled: {
        label: 'Cancelled',
        text: 'text-text-muted',
        bar: 'bg-gradient-to-r from-text-subtle/60 to-text-muted',
    },
    partial: {
        label: 'Partial',
        text: 'text-warning',
        bar: 'bg-gradient-to-r from-warning/80 to-warning shadow-md shadow-warning/30',
    },
    interrupted: {
        label: 'Interrupted',
        text: 'text-warning',
        bar: 'bg-gradient-to-r from-warning/80 to-warning shadow-md shadow-warning/30',
    },
    running: {
        label: 'Running',
        text: 'text-brand',
        bar: 'bg-gradient-to-r from-brand/80 to-brand shadow-md shadow-brand/40',
    },
    queued: { label: 'Queued', text: 'text-warning', bar: 'bg-surface-2' },
    idle: { label: 'Waiting', text: 'text-text-muted', bar: 'bg-surface-2' },
};

const FALLBACK_PRESENTATION = STATUS_PRESENTATION.idle;

/** Colour/label tokens for a status. Unknown statuses degrade to "Waiting". */
export const statusPresentation = (status) => STATUS_PRESENTATION[status] ?? FALLBACK_PRESENTATION;

/**
 * Server-reported progress for one run, as a 0–100 number, or null when the
 * backend hasn't given us anything to show.
 *
 * Order matters. `progress_percent` is the server's own monotonic figure and
 * always wins. Failing that, a weighted roll-up of `stages[]` is still real
 * server data. Returning null (rather than inventing a number, which is what the
 * old `Math.random()` bar did) is what lets the UI show an honest indeterminate
 * state instead of a fake percentage.
 */
export function derivePipelineProgress(run) {
    if (!run) return null;

    if (Number.isFinite(run.progressPercent)) return clampPercent(run.progressPercent);

    const stages = Array.isArray(run.stages) ? run.stages : null;
    if (!stages || stages.length === 0) return null;

    let weighted = 0;
    let totalWeight = 0;
    let sawProgress = false;

    for (const s of stages) {
        const weight = Number.isFinite(s?.weight) ? s.weight : 1;
        totalWeight += weight;

        const pct = stagePercent(s);
        if (pct !== null) {
            sawProgress = true;
            weighted += weight * pct;
        }
    }

    if (!sawProgress || totalWeight === 0) return null;
    return clampPercent(weighted / totalWeight);
}

/** One stage's own completion as 0–100, or null if it reports nothing usable. */
function stagePercent(stage) {
    if (Number.isFinite(stage?.progress_percent)) return clampPercent(stage.progress_percent);

    const status = String(stage?.status ?? '').toLowerCase();
    if (status === 'completed' || status === 'skipped') return 100;
    if (status === 'failed' || status === 'cancelled') return 0;

    if (Number.isFinite(stage?.items_total) && stage.items_total > 0 && Number.isFinite(stage?.items_done)) {
        return clampPercent((stage.items_done / stage.items_total) * 100);
    }
    return null;
}

const clampPercent = (n) => Math.max(0, Math.min(100, Math.round(n)));

/**
 * Whether the progress bar should animate as an indeterminate stripe rather than
 * fill to a percentage: either the backend told us it can't measure this run
 * (`is_determinate: false`) or it gave us no progress figure at all.
 */
export const isIndeterminate = (run) =>
    run?.status === 'running' && (run?.isDeterminate === false || derivePipelineProgress(run) === null);

/** Short "3 of 8 files" style caption, or null when file counts are unknown. */
export function fileCaption(run) {
    const total = run?.filesTotal;
    if (!Number.isFinite(total) || total <= 0) return null;
    const done = Number.isFinite(run?.filesDone) ? run.filesDone : null;
    return done === null ? `${total} file${total === 1 ? '' : 's'}` : `${done} of ${total} files`;
}
