'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { listEquipment, getTagsByEquipment } from '@/src/services/dashboard/dashboardService';
import { normalizeEquipment, resolveEquipmentForTrain } from '../_utils/trainMeta';

const MAX_DEFAULT_TAGS = 6;

/**
 * useCompressorEquipment
 * Step 1 + 2 of the page's data flow, against the live P1 Dashboard backend:
 *
 *   GET /p1/dashboard/equipmentList          → resolve the train's real asset
 *   GET /p1/dashboard/equipment/{id}/tags    → its real tags, labels and units
 *
 * The train in the URL is matched against the returned equipment (the live list
 * carries "Export Compressor" / "Reinjection Compressor", which is exactly what
 * `?train=` describes); `equipmentOverride` lets the user pin a different asset.
 *
 * @param {string} train
 * @param {string|null} equipmentOverride
 */
export function useCompressorEquipment(train, equipmentOverride) {
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

    const equipment = useMemo(() => {
        if (equipmentOverride) {
            const pinned = equipmentList.find((eq) => eq.id === equipmentOverride);
            if (pinned) return pinned;
        }
        return resolveEquipmentForTrain(equipmentList, train);
    }, [equipmentList, equipmentOverride, train]);

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

    /** Tags charted when the URL carries no explicit `?tags=` selection. */
    const defaultTagIds = useMemo(
        () => tags.slice(0, MAX_DEFAULT_TAGS).map((t) => t.id),
        [tags]
    );

    return {
        equipmentList,
        equipment,
        tags,
        defaultTagIds,
        loading: loadingEquipment || loadingTags,
        error,
        refetch,
    };
}
