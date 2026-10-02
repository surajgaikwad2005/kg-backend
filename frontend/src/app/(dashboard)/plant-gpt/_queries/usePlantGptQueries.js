import { useQuery, useMutation } from '@tanstack/react-query';
import { queryKeys } from '@/src/lib/query/keys';
import { askPlantGpt, getPlantGptInfo } from '@/src/services/plant-gpt/plantGptService';

/**
 * Root info query for PlantGPT (version metadata, non plant-scoped).
 */
export function usePlantGptInfo(options = {}) {
    return useQuery({
        queryKey: queryKeys.plantGpt.info(),
        queryFn: ({ signal }) => getPlantGptInfo({ signal }),
        staleTime: Infinity,
        ...options,
    });
}

/**
 * Mutation for asking PlantGPT a prompt/question turn.
 */
export function useAskPlantGpt(options = {}) {
    return useMutation({
        mutationFn: ({ plantCode, payload, options: callOpts }) =>
            askPlantGpt(plantCode, payload, callOpts),
        ...options,
    });
}
