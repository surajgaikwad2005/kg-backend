import { Workflow, Bell, FileText, BarChart3, Gauge, Table2, Image as ImageIcon, LayoutGrid } from 'lucide-react';

/**
 * Visual metadata (icon/gradient/badge) keyed by the EXACT feature key the
 * backend returns from GET snapshotFeatureList — name/description come from
 * that response; only the look-and-feel below is client-side, since the
 * backend has no concept of icons or grid spans. `gradientClass`/`badgeClass`
 * are full literal Tailwind strings (not composed at runtime) so the JIT
 * scanner can find them.
 *
 * Grid footprint (rows/cols span) is no longer part of a widget's identity —
 * it's chosen per placement via GridCanvas's drag-to-size selection (see
 * _lib/gridSelection.js), so every entry here is purely look-and-feel.
 */
export const WIDGET_VISUALS = {
    flowchart_field: {
        icon: Workflow,
        gradientClass: 'bg-gradient-to-br from-brand to-brand/70',
        badgeClass: 'bg-brand/10 text-brand',
    },
    system_alerts_field: {
        icon: Bell,
        gradientClass: 'bg-gradient-to-br from-danger to-danger/70',
        badgeClass: 'bg-danger/10 text-danger',
    },
    text_field: {
        icon: FileText,
        gradientClass: 'bg-gradient-to-br from-success to-success/70',
        badgeClass: 'bg-success/10 text-success',
    },
    chart_field: {
        icon: BarChart3,
        gradientClass: 'bg-gradient-to-br from-warning to-warning/70',
        badgeClass: 'bg-warning/10 text-warning',
    },
    kpi_field: {
        icon: Gauge,
        gradientClass: 'bg-gradient-to-br from-highlight to-highlight/70',
        badgeClass: 'bg-highlight/10 text-highlight',
    },
    table_field: {
        icon: Table2,
        gradientClass: 'bg-gradient-to-br from-info to-info/70',
        badgeClass: 'bg-info/10 text-info',
    },
    image_field: {
        icon: ImageIcon,
        gradientClass: 'bg-gradient-to-br from-chart-5 to-chart-5/70',
        badgeClass: 'bg-chart-5/10 text-chart-5',
    },
};

/** Used for any feature key the backend adds later that isn't in WIDGET_VISUALS yet. */
const DEFAULT_VISUAL = {
    icon: LayoutGrid,
    gradientClass: 'bg-gradient-to-br from-text-subtle to-text-subtle/70',
    badgeClass: 'bg-surface-2 text-text-secondary',
};

/**
 * Merges the backend's snapshotFeatureList `features` object with the visual
 * metadata above into the { list, map } shape the grid designer components
 * expect (id/label/description/icon/gradientClass/badgeClass).
 */
export function buildWidgetCatalog(features) {
    const list = Object.entries(features || {}).map(([key, feature]) => {
        const visual = WIDGET_VISUALS[key] || DEFAULT_VISUAL;
        return {
            id: key,
            label: feature?.name || key,
            description: feature?.description || '',
            ...visual,
        };
    });

    const map = list.reduce((acc, type) => {
        acc[type.id] = type;
        return acc;
    }, {});

    return { list, map };
}
