'use client';
import { createContext, useContext, useCallback, useMemo, useEffect } from 'react';
import { usePlantsQuery, useCreatePlant } from '@/src/lib/query/usePlantRegistry';
import { useApp } from './AppContext';
import { toUiIndustry } from '@/src/lib/industry';

/**
 * Single shared source of truth for the plant registry list, so every plant
 * dropdown in the app (header PlantSwitcher, admin PlantIdSelector, the
 * PlantCodeBanner) reads the same data instead of each holding its own stale
 * copy.
 *
 * The list is now a TanStack Query cache entry; this provider is a thin
 * pass-through that keeps `usePlants()`'s existing shape so no consumer had to
 * change. What went away: a `fetchedOnce` ref (fetch-once-per-mount, never
 * again) and a manual `setPlants(prev => [...prev, plant_id])` append after
 * create — the create mutation invalidates the list instead.
 *
 * This provider deliberately does NOT live in the root layout: it drives a
 * query that fetches on mount, and the root layout also wraps the
 * unauthenticated login page, which would guarantee a 401 before sign-in. It is
 * mounted in the (dashboard) and (admin) shells instead.
 */
const PlantsContext = createContext(null);

export function PlantsProvider({ children }) {
  const { data: plants = [], isLoading, error, refetch } = usePlantsQuery();
  const { plantId, plantCode, industry, setIndustry, setPlantId } = useApp();
  const createPlantMutation = useCreatePlant();
  const { mutateAsync: createPlantAsync } = createPlantMutation;

  // Auto-sync industry whenever plants list loads or when plantCode changes
  useEffect(() => {
    if (!plants || plants.length === 0 || !plantCode) return;
    const matching = plants.find((p) => p.id === plantCode || p.plant_code_id === plantCode);
    if (matching?.industry) {
      const uiInd = toUiIndustry(matching.industry);
      if (uiInd && uiInd !== industry) {
        setIndustry(uiInd);
      }
      if (plantId && (!plantId.industry || !plantId.name) && (matching.industry || matching.name)) {
        setPlantId(matching);
      }
    }
  }, [plants, plantCode, industry, setIndustry, setPlantId, plantId]);

  const refresh = useCallback(() => refetch().then((r) => r.data ?? []), [refetch]);

  const createPlant = useCallback(async (plantCodeId, label, industry) => {
    const { plant_id } = await createPlantAsync({ plantCodeId, label, industry });
    return plant_id;
  }, [createPlantAsync]);

  /**
   * Drop a deleted plant from the list.
   *
   * Kept for call-site compatibility (PlantSwitcher and PlantIdSelector both
   * call it right after their own delete completes). It is now an invalidation
   * rather than a local filter, so the list re-reads canonical state instead of
   * diverging from it. Callers that use `useDeletePlant` directly get this for
   * free and do not need to call it at all.
   */
  const removePlant = useCallback(() => { refetch(); }, [refetch]);

  const value = useMemo(() => ({
    plants,
    loading: isLoading,
    error: error ? (error.message || 'Failed to load plants') : null,
    refresh,
    createPlant,
    removePlant,
  }), [plants, isLoading, error, refresh, createPlant, removePlant]);

  return <PlantsContext.Provider value={value}>{children}</PlantsContext.Provider>;
}

export function usePlants() {
  const ctx = useContext(PlantsContext);
  if (!ctx) throw new Error('usePlants must be used within PlantsProvider');
  return ctx;
}
