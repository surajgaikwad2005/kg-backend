import { apiClient } from '../apiClient';

export const CPCP_API_PREFIX = '/api/cpcp';

export async function getOperatingOutcomes(plantCode) {
    const json = await apiClient.get(`${CPCP_API_PREFIX}/operatingOutcomes`, { params: { plant_code_id: plantCode } });
    return json?.data || json;
}

export async function createTemplate(plantCode, data) {
    const json = await apiClient.post(`${CPCP_API_PREFIX}/createTemplate`, { ...data, plant_code_id: plantCode });
    return json?.data || json;
}

export async function getEquipments(plantCode) {
    const json = await apiClient.get(`${CPCP_API_PREFIX}/equipments`, { params: { plant_code_id: plantCode } });
    return json?.data || json;
}

export async function getEquipmentFlow(plantCode, fromEquipment, toEquipment) {
    const json = await apiClient.get(`${CPCP_API_PREFIX}/equipmentFlow`, {
        params: { plant_code_id: plantCode, from_equipment: fromEquipment, to_equipment: toEquipment }
    });
    return json?.data || json;
}

export async function saveEquipmentFlowConfiguration(plantCode, data) {
    const json = await apiClient.post(`${CPCP_API_PREFIX}/equipmentFlowConfiguration`, { ...data, plant_code_id: plantCode });
    return json?.data || json;
}

export async function saveProductionRiskConfiguration(data) {
    const json = await apiClient.post(`${CPCP_API_PREFIX}/productionRiskConfiguration`, data);
    return json?.data || json;
}

export async function getParallelGroups(plantCode) {
    const json = await apiClient.get(`${CPCP_API_PREFIX}/parallelGroups`, { params: { plant_code_id: plantCode } });
    return json?.data || json;
}

export async function getDesignIntents(plantCode) {
    const json = await apiClient.get(`${CPCP_API_PREFIX}/designIntents`, { params: { plant_code_id: plantCode } });
    return json?.data || json;
}

export async function saveParallelGroupsConfiguration(data) {
    const json = await apiClient.post(`${CPCP_API_PREFIX}/parallelGroupsConfiguration`, data);
    return json?.data || json;
}

export async function getElementTypes(plantCode) {
    const json = await apiClient.get(`${CPCP_API_PREFIX}/elementTypes`, { params: { plant_code_id: plantCode } });
    return json?.data || json;
}

export async function saveSeriesCapacityChain(data) {
    const json = await apiClient.post(`${CPCP_API_PREFIX}/seriesCapacityChain`, data);
    return json?.data || json;
}

export async function getMembershipTypes(plantCode) {
    const json = await apiClient.get(`${CPCP_API_PREFIX}/membershipTypes`, { params: { plant_code_id: plantCode } });
    return json?.data || json;
}

export async function getLoadShareModels(plantCode) {
    const json = await apiClient.get(`${CPCP_API_PREFIX}/loadShareModels`, { params: { plant_code_id: plantCode } });
    return json?.data || json;
}

export async function fetchDerivedPathMetrics(plantCode, data) {
    const json = await apiClient.post(`${CPCP_API_PREFIX}/derivedPathMetrics`, { ...data, plant_code_id: plantCode });
    return json?.data || json;
}

export async function saveRepairRestorationAssumptions(plantCode, data) {
    const json = await apiClient.post(`${CPCP_API_PREFIX}/repairRestorationAssumptions`, { ...data, plant_code_id: plantCode });
    return json?.data || json;
}

export async function saveAlternateRoutes(plantCode, data) {
    const json = await apiClient.post(`${CPCP_API_PREFIX}/alternateRoutes`, { ...data, plant_code_id: plantCode });
    return json?.data || json;
}

export const cpcpService = {
    getOperatingOutcomes,
    createTemplate,
    getEquipments,
    getEquipmentFlow,
    saveEquipmentFlowConfiguration,
    saveProductionRiskConfiguration,
    getParallelGroups,
    getDesignIntents,
    saveParallelGroupsConfiguration,
    getElementTypes,
    getMembershipTypes,
    saveSeriesCapacityChain,
    getLoadShareModels,
    fetchDerivedPathMetrics,
    saveRepairRestorationAssumptions,
    saveAlternateRoutes
};
