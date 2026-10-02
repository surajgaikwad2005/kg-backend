/**
 * trainMeta.js
 * Static identity for each compressor train, plus the hints used to resolve
 * which backend equipment (GET /p1/dashboard/equipmentList) a train maps to.
 *
 * The live equipment list returns entries such as `Export Compressor` and
 * `Reinjection Compressor`, which is exactly what the `?train=` query param
 * describes — so the page can bind itself to real telemetry without asking the
 * user to pick an asset first. `match` is an ordered preference list: the first
 * hint that hits an equipment id/label wins.
 *
 * Module scope per Rule 22 — never re-created on render.
 */

export const TRAIN_IDS = ['A', 'B', 'RA', 'RB'];

export const TRAIN_META = {
    A: {
        short: 'CPCP1',
        pill: 'A',
        label: 'Train A',
        title: 'Export Gas Compressor',
        match: ['export compressor', 'export gas compressor', 'compressor'],
    },
    B: {
        short: 'CPCP2',
        pill: 'B',
        label: 'Train B',
        title: 'Export Gas Compressor',
        match: ['export compressor', 'export gas compressor', 'compressor'],
    },
    RA: {
        short: 'RE-A',
        pill: 'RA',
        label: 'Reinjection Train A',
        title: 'Reinjection Gas Compressor',
        match: ['reinjection compressor', 'reinjection gas compressor', 'compressor'],
    },
    RB: {
        short: 'RE-B',
        pill: 'RB',
        label: 'Reinjection Train B',
        title: 'Reinjection Gas Compressor',
        match: ['reinjection compressor', 'reinjection gas compressor', 'compressor'],
    },
};

/** Safe lookup — an unknown/absent `?train=` falls back to Train A. */
export const getTrainMeta = (train) => TRAIN_META[train] || TRAIN_META.A;

/** Normalize one equipmentList row into `{ id, label }`, tolerating legacy shapes. */
export const normalizeEquipment = (row) => ({
    id: String(row?.id ?? row?.equipment_id ?? row?.value ?? ''),
    label: String(row?.label ?? row?.name ?? row?.id ?? ''),
});

/**
 * Pick the equipment whose id/label best matches an ordered list of hints —
 * the first hint that hits wins, so callers express preference by ordering.
 *
 * Shared by the train board (hints come from TRAIN_META.match) and the single
 * equipment detail page (hints come from the clicked node's label/componentType).
 *
 * @param {{id: string, label: string}[]} equipmentList
 * @param {string[]} hints — lowercase substrings, most specific first
 * @param {{fallbackFirst?: boolean}} [options] — return equipmentList[0] on a
 *        total miss (default true). The detail page passes false: charting an
 *        unrelated asset would be worse than showing nothing.
 * @returns {{id: string, label: string} | null}
 */
export function resolveEquipmentByHints(equipmentList, hints, { fallbackFirst = true } = {}) {
    if (!Array.isArray(equipmentList) || equipmentList.length === 0) return null;

    for (const hint of hints) {
        if (!hint) continue;
        const needle = hint.toLowerCase();
        const hit = equipmentList.find(
            (eq) =>
                eq.id.toLowerCase().includes(needle) ||
                eq.label.toLowerCase().includes(needle)
        );
        if (hit) return hit;
    }
    return fallbackFirst ? equipmentList[0] : null;
}

/**
 * Pick the equipment that best represents `train`.
 * Falls back to the first available equipment so the page still renders real
 * data on plants that don't use the Export/Reinjection naming convention.
 *
 * @param {{id: string, label: string}[]} equipmentList
 * @param {string} train
 * @returns {{id: string, label: string} | null}
 */
export function resolveEquipmentForTrain(equipmentList, train) {
    return resolveEquipmentByHints(equipmentList, getTrainMeta(train).match);
}
