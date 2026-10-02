'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { listPnidComponents } from '@/src/services/cpcp/diagram/diagramService';
import { parseGeneratedSvg } from '@/src/app/(dashboard)/home/workflow-diagram/_utils/SvgParser';
import { COMPONENT_CATALOG } from '@/src/app/(dashboard)/home/workflow-diagram/_components/IndustrialSvgs';
import { useApp } from '@/src/context/AppContext';
import {
    findBackendComponent,
    findCatalogEntry,
    formatEquipmentId,
} from '../_utils/equipmentIdentity';

/**
 * This panel always parses generated components with a hardcoded
 * `status: 'normal'`, so the status-LED circle they draw (fill resolves to
 * `[[STATUS_COLOR]]` -> the "normal" green, see SvgParser.js) never reflects
 * real equipment health here — it would just be a permanently-green dot.
 * Strip it so the drawing shows the component only, not a fake status.
 */
const STATUS_LED_COLOR = '#10b981';
const STATUS_LED_PATTERN = new RegExp(
    `<circle\\b[^>]*?fill="${STATUS_LED_COLOR}"[^>]*?(?:/>|>[\\s\\S]*?</circle>)`,
    'gi'
);

function stripStatusLed(markup) {
    return markup.replace(STATUS_LED_PATTERN, '');
}

/**
 * useEquipmentGraphic
 * Resolves the real drawing for the equipment node this page was opened from —
 * the same SVG the P&ID canvas renders for that node, not a stand-in.
 *
 * Resolution order:
 *   1. GET /components (CPCP Configuration) — the plant's generated P&ID
 *      component library. `code` is compiled to SVG markup by `parseGeneratedSvg`,
 *      exactly as WorkflowContext/EquipmentNode do on the canvas.
 *   2. COMPONENT_CATALOG — the built-in equipment shipped with the palette, for
 *      nodes placed from it (`suction_scrubber`, `check_valve`, …).
 *   3. null — the caller renders an empty state rather than a fake box.
 *
 * @param {{componentType?: string, label?: string}} node
 */
export function useEquipmentGraphic({ componentType, label }) {
    const { plantCode } = useApp();
    const [components, setComponents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reloadToken, setReloadToken] = useState(0);

    const refetch = useCallback(() => setReloadToken((n) => n + 1), []);

    useEffect(() => {
        let alive = true;
        setLoading(true);
        setError(null);

        listPnidComponents(plantCode)
            .then((res) => {
                if (!alive) return;
                setComponents(Array.isArray(res) ? res : []);
            })
            .catch((err) => {
                if (!alive) return;
                setComponents([]);
                setError(err?.message || 'Component library unavailable');
            })
            .finally(() => { if (alive) setLoading(false); });

        return () => { alive = false; };
    }, [plantCode, reloadToken]);

    /**
     * The compiled drawing plus the metadata that came with it. Parsing is not
     * cheap (the P&ID source is compiled from JSX), so it is memoized against
     * the fetched library rather than repeated on every render.
     */
    const graphic = useMemo(() => {
        const backend = findBackendComponent(components, { componentType, label });
        if (backend?.code) {
            const parsed = parseGeneratedSvg(backend.code, { status: 'normal', label: '' });
            if (parsed?.svgMarkup) {
                return {
                    source: 'plant',
                    name: backend.name,
                    description: backend.description || '',
                    viewBox: parsed.defaultViewBox,
                    markup: stripStatusLed(parsed.svgMarkup),
                    render: null,
                };
            }
        }

        const builtIn = findCatalogEntry(COMPONENT_CATALOG, { componentType, label });
        if (builtIn) {
            return {
                source: 'library',
                name: builtIn.entry.label || formatEquipmentId(componentType),
                description: builtIn.entry.desc || '',
                viewBox: builtIn.entry.viewBox,
                markup: null,
                // Built-in entries are React components, not markup strings.
                render: () => builtIn.entry.render('normal', ''),
            };
        }

        return null;
    }, [components, componentType, label]);

    return { graphic, loading, error, refetch };
}
