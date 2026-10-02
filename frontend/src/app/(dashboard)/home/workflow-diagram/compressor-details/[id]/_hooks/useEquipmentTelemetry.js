'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { listEquipment, getTagsByEquipment } from '@/src/services/dashboard/dashboardService';
import {
    normalizeEquipment,
    resolveEquipmentByHints,
} from '../../_utils/trainMeta';
import { buildEquipmentHints } from '../_utils/equipmentIdentity';

const MAX_DEFAULT_TAGS = 6;

/**
 * useEquipmentTelemetry
 * Binds one workflow node to a real asset on the P1 Dashboard backend:
 *
 *   GET /api/dashboards/equipment-list              → the asset this node names
 *   GET /api/dashboards/equipment/{id}/tags         → its signals, labels, units
 *
 * The train board matches equipment by train hints (`useCompressorEquipment`);
 * here the hints come from the clicked node instead, via `buildEquipmentHints`.
 * Unlike the train board this does NOT fall back to the first equipment in the
 * list — charting an unrelated asset under this node's name would be worse than
 * an honest "not bound" state, so a miss stays a miss.
 *
 * `equipmentOverride` lets the user pin a different asset from the toolbar; it
 * lives in the URL (`?equipment=`) so the binding is shareable.
 *
 * @param {{componentType?: string, label?: string}} node
 * @param {string|null} equipmentOverride
 */
export function useEquipmentTelemetry({ componentType, label }, equipmentOverride) {
    const [equipmentList, setEquipmentList] = useState([]);
    const [tags, setTags] = useState([]);
    const [loadingEquipment, setLoadingEquipment] = useState(true);
    const [loadingTags, setLoadingTags] = useState(false);
    const [error, setError] = useState(null);
    const [reloadToken, setReloadToken] = useState(0);

    const refetch = useCallback(() => setReloadToken((n) => n + 1), []);

    useEffect(() => {
        let alive = true;
        setLoadingEquipment(true);
        setError(null);

        listEquipment()
            .then((res) => {
                if (!alive) return;
                const rows = Array.isArray(res) ? res : res?.data || res?.equipment || [];
                setEquipmentList(rows.map(normalizeEquipment).filter((eq) => eq.id));
            })
            .catch((err) => {
                if (!alive) return;
                setEquipmentList([]);
                setError(err?.message || 'Equipment list unavailable');
            })
            .finally(() => { if (alive) setLoadingEquipment(false); });

        return () => { alive = false; };
    }, [reloadToken]);

    const hints = useMemo(
        () => buildEquipmentHints({ label, componentType }),
        [label, componentType]
    );

    const equipment = useMemo(() => {
        if (equipmentOverride) {
            const pinned = equipmentList.find((eq) => eq.id === equipmentOverride);
            if (pinned) return pinned;
        }
        return resolveEquipmentByHints(equipmentList, hints, { fallbackFirst: false });
    }, [equipmentList, equipmentOverride, hints]);

    const equipmentId = equipment?.id ?? null;

    useEffect(() => {
        if (!equipmentId) { setTags([]); return; }
        let alive = true;
        setLoadingTags(true);

        getTagsByEquipment(equipmentId)
            .then((res) => {
                if (!alive) return;
                const rawTags = res?.data?.tags || res?.tags || (Array.isArray(res?.data) ? res.data : []);
                setTags(
                    rawTags
                        .map((t, idx) => ({
                            id: String(t.id ?? t.value ?? `tag_${idx}`),
                            label: String(t.label ?? t.id ?? `Tag ${idx + 1}`),
                            unit: String(t.unit ?? ''),
                        }))
                        .filter((t) => t.id)
                );
            })
            .catch(() => { if (alive) setTags([]); })
            .finally(() => { if (alive) setLoadingTags(false); });

        return () => { alive = false; };
    }, [equipmentId, reloadToken]);

    /** Charted when the URL carries no explicit `?tags=` selection. */
    const defaultTagIds = useMemo(
        () => tags.slice(0, MAX_DEFAULT_TAGS).map((t) => t.id),
        [tags]
    );

    return {
        equipmentList,
        equipment,
        /** True once the list loaded and nothing in it matched this node. */
        isUnbound: !loadingEquipment && !error && equipmentList.length > 0 && !equipment,
        tags,
        defaultTagIds,
        loading: loadingEquipment || loadingTags,
        error,
        refetch,
    };
}
