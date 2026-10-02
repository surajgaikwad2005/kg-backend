import { useQuery, useMutation } from '@tanstack/react-query';
import {
    getOperatingOutcomes,
    getEquipments,
    getEquipmentFlow,
    createTemplate,
    saveEquipmentFlowConfiguration
} from '@/src/services/cpcp/cpcpService';

export function useOperatingOutcomesQuery(plantCode, options = {}) {
    return useQuery({
        queryKey: ['cpcp', 'operatingOutcomes', plantCode],
        queryFn: () => getOperatingOutcomes(plantCode),
        enabled: Boolean(plantCode),
        ...options,
    });
}

export function useEquipmentsQuery(plantCode, options = {}) {
    return useQuery({
        queryKey: ['cpcp', 'equipments', plantCode],
        queryFn: () => getEquipments(plantCode),
        enabled: Boolean(plantCode),
        ...options,
    });
}

export function useEquipmentFlowQuery(plantCode, fromEquipment, toEquipment, options = {}) {
    return useQuery({
        queryKey: ['cpcp', 'equipmentFlow', plantCode, fromEquipment, toEquipment],
        queryFn: () => getEquipmentFlow(plantCode, fromEquipment, toEquipment),
        enabled: Boolean(plantCode && fromEquipment && toEquipment),
        ...options,
    });
}

export function useCreateTemplateMutation() {
    return useMutation({
        mutationFn: ({ plantCode, data }) => createTemplate(plantCode, data),
    });
}

export function useSaveEquipmentFlowMutation() {
    return useMutation({
        mutationFn: ({ plantCode, data }) => saveEquipmentFlowConfiguration(plantCode, data),
    });
}
