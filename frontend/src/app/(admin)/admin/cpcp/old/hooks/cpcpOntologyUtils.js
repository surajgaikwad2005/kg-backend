export const SEED_COLUMNS = [
    { key: 'has_redundancy', label: 'has_redundancy' },
    { key: 'has_bypass', label: 'has_bypass' },
    { key: 'has_safety', label: 'has_safety' },
    { key: 'control_critical', label: 'control_critical' },
];

export const SEED_EQUIPMENT = [
    { tag: 'F-309', description: '', attributes: { has_redundancy: 'Y', has_bypass: 'N' } },
    { tag: 'C-201', description: '', attributes: {} },
    { tag: 'C-202', description: '', attributes: {} },
    { tag: 'E-305', description: '', attributes: {} },
    { tag: 'E-306', description: '', attributes: {} },
    { tag: 'E-307', description: '', attributes: {} },
    { tag: 'E-308', description: '', attributes: {} },
    { tag: 'V-104', description: '', attributes: {} },
    { tag: 'V-105', description: '', attributes: {} },
];

export const slugify = (label) =>
    String(label || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');

export const normalizeFlag = (v) => {
    const s = String(v ?? '').trim().toLowerCase();
    if (['y', 'yes', 'true', '1'].includes(s)) return 'Y';
    if (['n', 'no', 'false', '0'].includes(s)) return 'N';
    return '';
};

export function normalizeColumns(data) {
    const raw = Array.isArray(data?.columns) ? data.columns : Array.isArray(data?.attributes) ? data.attributes : null;
    if (!raw) return null;
    return raw
        .map((c) => {
            if (typeof c === 'string') return { key: slugify(c), label: c };
            const label = c.label ?? c.name ?? c.key ?? '';
            return { key: c.key ?? slugify(label), label: String(label) };
        })
        .filter((c) => c.key && c.label);
}

let draftCounter = 0;
export function equipmentToRow(item = {}, columns = []) {
    const tag = item.Tag ?? item.tag ?? item.equipment_tag ?? item.equipmentTag ?? item.id ?? '';
    const src = item.attributes ?? item;
    const attributes = {};
    columns.forEach(({ key }) => {
        attributes[key] = normalizeFlag(src?.[key]);
    });
    return {
        key: tag ? `eq-${tag}` : `draft-${++draftCounter}`,
        tag: String(tag),
        description: item['Equipment Description'] ?? item.description ?? item.equipment_description ?? item.equipmentDescription ?? '',
        attributes,
        isEditing: false,
        isSaving: false,
        isDeleting: false,
        status: item.status || 'AI Pending',
        pageNumber: item['page number'] ?? item.page_number ?? item.pageNumber ?? '',
    };
}
