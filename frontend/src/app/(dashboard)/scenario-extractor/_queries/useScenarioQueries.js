import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApp } from '@/src/context/AppContext';
import { configurationService } from '@/src/services/scenario-extractor/configurationService';

export function useScenarioList() {
    const { plantCode } = useApp();
    return useQuery({
        queryKey: ['scenario-list', plantCode],
        queryFn: () => configurationService.getScenarioList(plantCode),
        enabled: !!plantCode
    });
}

export function useScenarioDetail(scenarioId) {
    const { plantCode } = useApp();
    return useQuery({
        queryKey: ['scenario-detail', plantCode, scenarioId],
        queryFn: () => configurationService.getScenarioDetail(plantCode, scenarioId),
        enabled: !!plantCode && !!scenarioId
    });
}

export function useCreateScenario() {
    const { plantCode } = useApp();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => configurationService.createScenario(plantCode, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['scenario-list', plantCode] });
        }
    });
}

export function useModifyScenario() {
    const { plantCode } = useApp();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload) => configurationService.modifyScenario(plantCode, payload),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['scenario-list', plantCode] });
            queryClient.invalidateQueries({
                queryKey: ['scenario-detail', plantCode, variables.scenario_id]
            });
        }
    });
}

export function useDeleteScenario() {
    const { plantCode } = useApp();
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (scenarioId) => configurationService.deleteScenario(plantCode, scenarioId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['scenario-list', plantCode] });
        }
    });
}
