'use client';
import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { TRAIN_META } from '../_utils/trainMeta';

/**
 * useCompressorParams
 * The page's view state (which train, which equipment, which tags are charted)
 * lives in the URL rather than in component state, so a given view is
 * shareable and bookmarkable — Rule 38: context is the cache, the URL is the
 * source of truth.
 *
 * `?train=A|B|RA|RB` — which compressor train is on screen (pre-existing param)
 * `?equipment=<id>`  — overrides the equipment auto-resolved from the train
 * `?tags=a,b,c`      — the tags plotted in the trend panel
 */
export function useCompressorParams() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const rawTrain = searchParams.get('train');
    const train = rawTrain && TRAIN_META[rawTrain] ? rawTrain : 'A';
    const equipmentOverride = searchParams.get('equipment') || null;

    const rawTags = searchParams.get('tags');
    const selectedTags = useMemo(
        () => (rawTags ? rawTags.split(',').map((t) => t.trim()).filter(Boolean) : []),
        [rawTags]
    );

    /** Merge patch into the query string; a null/'' value removes that key. */
    const setParams = useCallback(
        (patch) => {
            const next = new URLSearchParams(searchParams.toString());
            for (const [key, value] of Object.entries(patch)) {
                if (value === null || value === undefined || value === '') next.delete(key);
                else next.set(key, value);
            }
            router.replace(`${pathname}?${next.toString()}`, { scroll: false });
        },
        [pathname, router, searchParams]
    );

    const setTrain = useCallback(
        // The equipment + tag selection belong to the previous train, so clear them.
        (nextTrain) => setParams({ train: nextTrain, equipment: null, tags: null }),
        [setParams]
    );

    const setEquipment = useCallback(
        (equipmentId) => setParams({ equipment: equipmentId, tags: null }),
        [setParams]
    );

    const setSelectedTags = useCallback(
        (tags) => setParams({ tags: tags.length ? tags.join(',') : null }),
        [setParams]
    );

    return { train, equipmentOverride, selectedTags, setTrain, setEquipment, setSelectedTags };
}
