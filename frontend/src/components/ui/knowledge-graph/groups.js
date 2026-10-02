import { Cog, FileText, Wrench, AlertTriangle, Tag as TagIcon, File, Home, Layers, GitBranch, Zap, Shield, Activity, Info, Database, Cpu, MapPin, ClipboardList, ListChecks, FileStack, Hammer, Bell } from 'lucide-react';

export const LABEL_GROUP_MAP = {
    Equipment: 1,
    SOP: 2,
    OperatingManual: 3,
    MaintenanceManual: 4,
    DesignSheet: 5,
    Document: 6,
    Plant: 7,
    Subsystem: 8,
    Pipe: 9,
    Valve: 10,
    Instrument: 11,
    LOPC: 12,
    GLOC: 13,
    UPD: 14,
    Vibration: 15,
    Thermography: 16,
    AIF: 17,
    Pump: 18,
    Vessel: 19,
    Exchanger: 20,
    Tank: 21,
    Sensor: 22,
    SENSOR: 22,
    sensor: 22,
    RCA: 23,
    WorkOrder: 24,
    Tag: 25,
    Alert: 26,
    ALERT: 26,
    alert: 26,
    TripEvent: 27,
    Tripevent: 27,
    tripevent: 27,
    TRIPEVENT: 27,
    UpdEvent: 28,
    Updevent: 28,
    updevent: 28,
    UPDEVENT: 28,

    // ── SAP PM Knowledge Graph node types (demo) ──────────────────────────
    // Curated, well-separated colours per type. These override any legacy
    // mapping above for the same key (last definition wins).
    FunctionalLocation: 30,
    Equipment: 31,
    MaintenancePlan: 32,
    MaintenanceItem: 33,
    TaskList: 34,
    TaskListOperation: 35,
    WorkOrder: 36,
    Notification: 37,
};

export const GROUP_CONFIG = {
    1: { color: '#3b82f6', bgClass: 'bg-brand',     dotClass: 'bg-brand',     gradient: 'from-brand to-brand-hover',       ring: 'ring-brand/40',    glow: 'shadow-brand/50',    Icon: Cog,           label: 'Equipment' },
    2: { color: '#10b981', bgClass: 'bg-success',   dotClass: 'bg-success',   gradient: 'from-success to-success/70',     ring: 'ring-success/40',  glow: 'shadow-success/50',  Icon: FileText,      label: 'SOP' },
    3: { color: '#059669', bgClass: 'bg-success',   dotClass: 'bg-success',   gradient: 'from-success to-success/70',     ring: 'ring-success/40',  glow: 'shadow-success/50',  Icon: FileText,      label: 'Operating Manual' },
    4: { color: '#334155', bgClass: 'bg-surface-2', dotClass: 'bg-surface-2', gradient: 'from-surface-2 to-surface-2/70', ring: 'ring-border',     glow: 'shadow-sm',          Icon: Wrench,        label: 'Maintenance Manual' },
    5: { color: '#f97316', bgClass: 'bg-warning',   dotClass: 'bg-warning',   gradient: 'from-warning to-warning/70',     ring: 'ring-warning/40',  glow: 'shadow-warning/50',  Icon: Wrench,        label: 'Design Sheet' },
    6: { color: '#64748b', bgClass: 'bg-surface-2', dotClass: 'bg-surface-2', gradient: 'from-surface-2 to-surface-2/70', ring: 'ring-border',     glow: 'shadow-sm',          Icon: File,          label: 'Document' },
    7: { color: '#f59e0b', bgClass: 'bg-chart-2',   dotClass: 'bg-chart-2',   gradient: 'from-chart-2 to-chart-2/70',     ring: 'ring-chart-2/40',  glow: 'shadow-chart-2/50',  Icon: Home,          label: 'Plant' },
    8: { color: '#8b5cf6', bgClass: 'bg-chart-3',   dotClass: 'bg-chart-3',   gradient: 'from-chart-3 to-chart-3/70',     ring: 'ring-chart-3/40',  glow: 'shadow-chart-3/50',  Icon: Layers,        label: 'Subsystem' },
    9: { color: '#0d9488', bgClass: 'bg-chart-4',   dotClass: 'bg-chart-4',   gradient: 'from-chart-4 to-chart-4/70',     ring: 'ring-chart-4/40',  glow: 'shadow-chart-4/50',  Icon: GitBranch,     label: 'Pipe' },
    10: { color: '#eab308', bgClass: 'bg-chart-5',  dotClass: 'bg-chart-5',   gradient: 'from-chart-5 to-chart-5/70',     ring: 'ring-chart-5/40',  glow: 'shadow-chart-5/50',  Icon: Cog,           label: 'Valve' },
    11: { color: '#0284c7', bgClass: 'bg-info',     dotClass: 'bg-info',      gradient: 'from-info to-info/70',           ring: 'ring-info/40',     glow: 'shadow-info/50',     Icon: Zap,           label: 'Instrument' },
    12: { color: '#ef4444', bgClass: 'bg-danger',   dotClass: 'bg-danger',    gradient: 'from-danger to-danger/70',       ring: 'ring-danger/40',   glow: 'shadow-danger/50',   Icon: Shield,        label: 'LOPC' },
    13: { color: '#db2777', bgClass: 'bg-danger',   dotClass: 'bg-danger',    gradient: 'from-danger to-danger/70',       ring: 'ring-danger/40',   glow: 'shadow-danger/50',   Icon: Shield,        label: 'GLOC' },
    14: { color: '#84cc16', bgClass: 'bg-success',  dotClass: 'bg-success',   gradient: 'from-success to-success/70',     ring: 'ring-success/40',  glow: 'shadow-success/50',  Icon: Shield,        label: 'UPD' },
    15: { color: '#14b8a6', bgClass: 'bg-success',  dotClass: 'bg-success',   gradient: 'from-success to-success/70',     ring: 'ring-success/40',  glow: 'shadow-success/50',  Icon: Activity,      label: 'Vibration' },
    16: { color: '#ea580c', bgClass: 'bg-highlight',dotClass: 'bg-highlight', gradient: 'from-highlight to-highlight-hover', ring: 'ring-highlight/40', glow: 'shadow-highlight/50', Icon: Activity,   label: 'Thermography' },
    17: { color: '#ec4899', bgClass: 'bg-danger',   dotClass: 'bg-danger',    gradient: 'from-danger/70 to-danger',       ring: 'ring-danger/40',   glow: 'shadow-danger/50',   Icon: Info,          label: 'AIF' },
    18: { color: '#2563eb', bgClass: 'bg-brand',    dotClass: 'bg-brand',     gradient: 'from-brand to-brand-hover',       ring: 'ring-brand/40',    glow: 'shadow-brand/50',    Icon: Cog,           label: 'Pump' },
    19: { color: '#10b981', bgClass: 'bg-success',  dotClass: 'bg-success',   gradient: 'from-success to-success/70',     ring: 'ring-success/40',  glow: 'shadow-success/50',  Icon: Layers,        label: 'Vessel' },
    20: { color: '#d97706', bgClass: 'bg-warning',  dotClass: 'bg-warning',   gradient: 'from-warning to-warning/70',     ring: 'ring-warning/40',  glow: 'shadow-warning/50',  Icon: Wrench,        label: 'Exchanger' },
    21: { color: '#9333ea', bgClass: 'bg-warning',  dotClass: 'bg-warning',   gradient: 'from-warning to-warning/70',     ring: 'ring-warning/40',  glow: 'shadow-warning/50',  Icon: Database,      label: 'Tank' },
    22: { color: '#10b981', bgClass: 'bg-surface-2', dotClass: 'bg-surface-2', gradient: 'from-surface-2 to-surface-2/70', ring: 'ring-border',     glow: 'shadow-sm',          Icon: Cpu,           label: 'Sensor' },
    23: { color: '#8b5cf6', bgClass: 'bg-chart-3',  dotClass: 'bg-chart-3',   gradient: 'from-chart-3 to-chart-3/70',     ring: 'ring-chart-3/40',  glow: 'shadow-chart-3/50',  Icon: AlertTriangle, label: 'RCA' },
    24: { color: '#7c3aed', bgClass: 'bg-highlight',dotClass: 'bg-highlight', gradient: 'from-highlight to-highlight-hover', ring: 'ring-highlight/40', glow: 'shadow-highlight/50', Icon: FileText,   label: 'Work Order' },
    25: { color: '#0891b2', bgClass: 'bg-chart-1',  dotClass: 'bg-chart-1',   gradient: 'from-chart-1 to-chart-1/70',     ring: 'ring-chart-1/40',  glow: 'shadow-chart-1/50',  Icon: TagIcon,       label: 'Tag' },
    26: { color: '#94a3b8', bgClass: 'bg-surface-2', dotClass: 'bg-surface-2', gradient: 'from-surface-2 to-surface-2/70', ring: 'ring-border',     glow: 'shadow-sm',          Icon: AlertTriangle, label: 'Alert' },
    27: { color: '#f43f5e', bgClass: 'bg-danger',   dotClass: 'bg-danger',    gradient: 'from-danger to-danger/70',       ring: 'ring-danger/40',   glow: 'shadow-danger/50',   Icon: Activity,      label: 'TripEvent' },
    28: { color: '#a78bfa', bgClass: 'bg-chart-3',  dotClass: 'bg-chart-3',   gradient: 'from-chart-3 to-chart-3/70',     ring: 'ring-chart-3/40',  glow: 'shadow-chart-3/50',  Icon: Zap,           label: 'UpdEvent' },

    // ── SAP PM Knowledge Graph node types (demo) ──────────────────────────
    30: { color: '#2563eb', bgClass: 'bg-brand',    dotClass: 'bg-brand',    gradient: 'from-brand to-brand-hover',      ring: 'ring-brand/40',    glow: 'shadow-brand/50',    Icon: MapPin,        label: 'Functional Location' },
    31: { color: '#16a34a', bgClass: 'bg-success',  dotClass: 'bg-success',  gradient: 'from-success to-success/70',     ring: 'ring-success/40',  glow: 'shadow-success/50',  Icon: Cog,           label: 'Equipment' },
    32: { color: '#7c3aed', bgClass: 'bg-chart-3',  dotClass: 'bg-chart-3',  gradient: 'from-chart-3 to-chart-3/70',     ring: 'ring-chart-3/40',  glow: 'shadow-chart-3/50',  Icon: ClipboardList, label: 'Maintenance Plan' },
    33: { color: '#c026d3', bgClass: 'bg-chart-3',  dotClass: 'bg-chart-3',  gradient: 'from-chart-3 to-chart-3/70',     ring: 'ring-chart-3/40',  glow: 'shadow-chart-3/50',  Icon: ListChecks,    label: 'Maintenance Item' },
    34: { color: '#0891b2', bgClass: 'bg-chart-1',  dotClass: 'bg-chart-1',  gradient: 'from-chart-1 to-chart-1/70',     ring: 'ring-chart-1/40',  glow: 'shadow-chart-1/50',  Icon: FileStack,     label: 'Task List' },
    35: { color: '#f59e0b', bgClass: 'bg-warning',  dotClass: 'bg-warning',  gradient: 'from-warning to-warning/70',     ring: 'ring-warning/40',  glow: 'shadow-warning/50',  Icon: Wrench,        label: 'Task List Operation' },
    36: { color: '#dc2626', bgClass: 'bg-danger',   dotClass: 'bg-danger',   gradient: 'from-danger to-danger/70',       ring: 'ring-danger/40',   glow: 'shadow-danger/50',   Icon: Hammer,        label: 'Work Order' },
    37: { color: '#db2777', bgClass: 'bg-danger',   dotClass: 'bg-danger',   gradient: 'from-danger to-danger/70',       ring: 'ring-danger/40',   glow: 'shadow-danger/50',   Icon: Bell,          label: 'Notification' },
};

export const VIBRANT_PALETTE = [
    '#3b82f6', // Blue
    '#10b981', // Emerald Green
    '#8b5cf6', // Violet Purple
    '#f97316', // Orangealert
    '#ef4444', // Red
    '#f59e0b', // Amber Gold
    '#06b6d4', // Cyan
    '#0d9488', // Teal
    '#ec4899', // Pink
    '#6366f1', // Indigo
    '#84cc16', // Lime
    '#334155', // Dark Slate
    '#9333ea', // Deep Purple
    '#059669', // Dark Emerald
    '#ea580c', // Rust Orange
    '#dc2626', // Crimson
    '#0891b2', // Ocean Teal
    '#db2777', // Rose Pink
    '#64748b', // Slate
];

/** Deterministically hash any dynamic string to a vibrant, distinct color from the palette */
export function getDynamicColor(str) {
    if (!str) return '#64748b';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % VIBRANT_PALETTE.length;
    return VIBRANT_PALETTE[idx];
}

/** Extract primary node type string from any node object format */
export function getNodeType(node) {
    if (!node) return 'Document';
    if (Array.isArray(node.labels) && node.labels.length > 0 && node.labels[0]) {
        return node.labels[0];
    }
    if (typeof node.label === 'string' && node.label) {
        return node.label;
    }
    if (typeof node.type === 'string' && node.type) {
        return node.type;
    }
    if (node.properties?.type) {
        return String(node.properties.type);
    }
    if (node.properties?.entity_type) {
        return String(node.properties.entity_type);
    }
    return 'Document';
}

/** Resolve a node's primary label to its group id (defaults to 6 / Document). */
export const groupOf = (label) => {
    if (!label) return 6;
    if (LABEL_GROUP_MAP[label]) return LABEL_GROUP_MAP[label];
    const clean = String(label).trim();
    if (LABEL_GROUP_MAP[clean]) return LABEL_GROUP_MAP[clean];
    return 6;
};

/** Resolve full visual config (color, icon, label, classes) for any type string or group id */
export function getTypeConfig(labelOrGroup) {
    if (typeof labelOrGroup === 'number' && GROUP_CONFIG[labelOrGroup]) {
        return GROUP_CONFIG[labelOrGroup];
    }
    const label = typeof labelOrGroup === 'string' ? labelOrGroup.trim() : 'Document';

    // 1. Exact match
    let groupId = LABEL_GROUP_MAP[label];
    // 2. UPPER / lower variants
    if (!groupId) groupId = LABEL_GROUP_MAP[label.toUpperCase()] || LABEL_GROUP_MAP[label.toLowerCase()];
    // 3. Full case-insensitive scan (handles TripEvent vs Tripevent, etc.)
    if (!groupId) {
        const lowerLabel = label.toLowerCase();
        const matchKey = Object.keys(LABEL_GROUP_MAP).find(k => k.toLowerCase() === lowerLabel);
        if (matchKey) groupId = LABEL_GROUP_MAP[matchKey];
    }

    if (groupId && GROUP_CONFIG[groupId]) {
        return GROUP_CONFIG[groupId];
    }
    // Dynamic fallback for any unseen custom node type
    const color = getDynamicColor(label);
    return {
        color,
        bgClass: 'bg-brand',
        dotClass: 'bg-brand',
        gradient: 'from-brand to-brand-hover',
        ring: 'ring-brand/40',
        glow: 'shadow-brand/50',
        Icon: TagIcon,
        label: label.replace(/_/g, ' '),
        isDynamic: true,
    };
}

/** Resolve hex color for a group or type */
export const groupColor = (group, label) => {
    if (label) return getTypeConfig(label).color;
    if (typeof group === 'string') return getTypeConfig(group).color;
    return GROUP_CONFIG[group]?.color || GROUP_CONFIG[6].color;
};
