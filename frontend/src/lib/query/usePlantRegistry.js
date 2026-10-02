'use client';

/**
 * usePlantRegistry — TanStack Query hooks for the plant registry (Phase 0.11).
 *
 * This lives in src/lib/query rather than a feature `_queries/` folder because
 * the registry is infrastructure, not a feature: `plantCode` is the key
 * dimension of every plant-scoped query in the app, and the registry list feeds
 * app-wide chrome (PlantSwitcher, PlantIdSelector, PlantCodeBanner).
 *
 * Note these keys are NOT plant-scoped — this IS the plant list.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { plantCodeIdService } from '@/src/services/plant-id/plantCodeIdService';
import { queryKeys } from './keys';

const selectPlantList = (res) => res?.plant_ids ?? [];

/**
 * The registered plant list.
 *
 * Replaces a `fetchedOnce` ref that fetched exactly once per provider mount and
 * never again. `staleTime` expresses the same intent — the registry rarely
 * changes — but unlike the ref it eventually expires, so a plant created in
 * another tab shows up instead of requiring a reload.
 */
export function usePlantsQuery() {
    return useQuery({
        queryKey: queryKeys.plants.list(),
        queryFn: () => plantCodeIdService.getPlantIds(),
        select: selectPlantList,
        staleTime: 5 * 60_000,
    });
}

/** Cascade-purge impact preview, read when the delete modal opens. */
export function usePurgePreview(plantCodeId, { enabled = true } = {}) {
    return useQuery({
        queryKey: queryKeys.plants.purgePreview(plantCodeId),
        queryFn: () => plantCodeIdService.getPurgePreview(plantCodeId),
        enabled: !!plantCodeId && enabled,
    });
}

/** Register a new plant. */
export function useCreatePlant() {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Could not create plant' },
        mutationFn: ({ plantCodeId, label, industry }) =>
            plantCodeIdService.createPlantId(plantCodeId, label, industry),
        // Replaces a manual `setPlants(prev => [...prev, plant_id])` append.
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.plants.list() });
        },
    });
}

/**
 * Delete a plant, optionally cascading.
 *
 * Deleting a plant must evict that plant's ENTIRE cache, not just remove it from
 * the list: every namespace keys on plantCode, so leftover entries would survive
 * as data for an id the backend no longer knows. `removeQueries` with the
 * plant's own key prefix is not enough on its own — each domain root has to be
 * cleared, which is what the loop below does.
 */
export function useDeletePlant() {
    const queryClient = useQueryClient();
    return useMutation({
        meta: { errorTitle: 'Could not delete plant' },
        mutationFn: ({ plantCodeId, cascade = false, confirm = null }) =>
            plantCodeIdService.deletePlantId(plantCodeId, { cascade, confirm }),
        onSuccess: (_data, { plantCodeId }) => {
            // Pure localStorage cleanup helper — no network, safe to call here.
            plantCodeIdService.clearPlantLocalStorage(plantCodeId);

            void queryClient.invalidateQueries({ queryKey: queryKeys.plants.list() });
            queryClient.removeQueries({ queryKey: queryKeys.plants.purgePreview(plantCodeId) });

            // Every plant-scoped namespace puts plantCode second, so removing
            // [<domain>, plantCode] clears that domain's entire subtree for the
            // deleted plant.
            ['domain-config', 'decision-template', 'asset-config', 'knowledge-graph', 'symbolic-ai']
                .forEach((domain) => queryClient.removeQueries({ queryKey: [domain, plantCodeId] }));
        },
    });
}
