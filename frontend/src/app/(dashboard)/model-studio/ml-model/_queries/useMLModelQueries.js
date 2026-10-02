'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/src/lib/query/keys';
import { getOverviewStats } from '@/src/services/model-studio/ml-model/modelService';
import {
    getModelList,
    getModelOptions,
    getAssetList,
    getAssetTags,
    createModel,
    modifyModel,
    deleteModel,
} from '@/src/services/model-studio/ml-model/modelRegistryService';
import {
    getPipelines,
    getPipeline,
    getAvailableTools,
    uploadPipeline,
    updatePipeline,
    deletePipeline,
} from '@/src/services/model-studio/ml-model/pipelineService';
import {
    getExperimentList,
    getExperimentDetails,
    getModelParams,
    createExperiment,
    deleteExperiment,
} from '@/src/services/model-studio/ml-model/experimentService';
import {
    getDeploymentList,
    createDeployment,
    deleteDeployment,
} from '@/src/services/model-studio/ml-model/deploymentService';
import {
    getArtifactList,
} from '@/src/services/model-studio/ml-model/artifactService';

// ── Overview ────────────────────────────────────────────────────────────────

export function useMLModelOverviewQuery(plantCode) {
    return useQuery({
        queryKey: queryKeys.modelStudio.mlModel.overview(plantCode),
        queryFn: () => getOverviewStats(plantCode),
        enabled: !!plantCode,
    });
}

// ── Models & Registry ───────────────────────────────────────────────────────

export function useMLModelListQuery(plantCode) {
    return useQuery({
        queryKey: queryKeys.modelStudio.mlModel.models(plantCode),
        queryFn: () => getModelList(plantCode),
        enabled: !!plantCode,
    });
}

export function useMLModelOptionsQuery(plantCode) {
    return useQuery({
        queryKey: queryKeys.modelStudio.mlModel.registry(plantCode),
        queryFn: () => getModelOptions(plantCode),
        enabled: !!plantCode,
    });
}

export function useMLAssetListQuery(plantCode) {
    return useQuery({
        queryKey: queryKeys.modelStudio.mlModel.assetList(plantCode),
        queryFn: () => getAssetList(plantCode),
        enabled: !!plantCode,
    });
}

export function useMLAssetTagsQuery(plantCode, assetId) {
    return useQuery({
        queryKey: ['model-studio', 'ml-model', 'asset-tags', plantCode, assetId],
        queryFn: () => getAssetTags(plantCode, assetId),
        enabled: !!plantCode && !!assetId,
    });
}

export function useCreateModelMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, payload }) => createModel(plantCode, payload),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.mlModel.all(plantCode) });
        },
    });
}

export function useModifyModelMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, payload }) => modifyModel(plantCode, payload),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.mlModel.all(plantCode) });
        },
    });
}

export function useDeleteModelMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, modelId }) => deleteModel(plantCode, modelId),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.mlModel.all(plantCode) });
        },
    });
}

// ── Pipelines ───────────────────────────────────────────────────────────────

export function useMLPipelineListQuery(plantCode) {
    return useQuery({
        queryKey: queryKeys.modelStudio.mlModel.pipelines(plantCode),
        queryFn: () => getPipelines(plantCode),
        enabled: !!plantCode,
    });
}

export function useMLPipelineDetailsQuery(plantCode, pipelineId) {
    return useQuery({
        queryKey: queryKeys.modelStudio.mlModel.pipelineDetail(plantCode, pipelineId),
        queryFn: () => getPipeline(plantCode, pipelineId),
        enabled: !!plantCode && !!pipelineId,
    });
}

export function useMLAvailableToolsQuery(plantCode) {
    return useQuery({
        queryKey: queryKeys.modelStudio.mlModel.availableTools(plantCode),
        queryFn: () => getAvailableTools(plantCode),
        enabled: !!plantCode,
    });
}

export function useUploadMLPipelineMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, body }) => uploadPipeline(plantCode, body),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.mlModel.pipelines(plantCode) });
        },
    });
}

export function useUpdateMLPipelineMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, pipelineId, body }) => updatePipeline(plantCode, pipelineId, body),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.mlModel.pipelines(plantCode) });
        },
    });
}

export function useDeleteMLPipelineMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, pipelineId }) => deletePipeline(plantCode, pipelineId),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.mlModel.pipelines(plantCode) });
        },
    });
}

// ── Experiments ─────────────────────────────────────────────────────────────

export function useMLExperimentListQuery(plantCode) {
    return useQuery({
        queryKey: queryKeys.modelStudio.mlModel.experiments(plantCode),
        queryFn: () => getExperimentList(plantCode),
        enabled: !!plantCode,
    });
}

export function useMLExperimentDetailsQuery(plantCode, expId) {
    return useQuery({
        queryKey: queryKeys.modelStudio.mlModel.experimentDetail(plantCode, expId),
        queryFn: () => getExperimentDetails(plantCode, expId),
        enabled: !!plantCode && !!expId,
    });
}

export function useMLModelParamsQuery(plantCode, modelId) {
    return useQuery({
        queryKey: queryKeys.modelStudio.mlModel.modelParams(plantCode, modelId),
        queryFn: () => getModelParams(plantCode, modelId),
        enabled: !!plantCode && !!modelId,
    });
}

export function useCreateMLExperimentMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, payload }) => createExperiment(plantCode, payload),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.mlModel.experiments(plantCode) });
        },
    });
}

export function useDeleteMLExperimentMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, expId }) => deleteExperiment(plantCode, expId),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.mlModel.experiments(plantCode) });
        },
    });
}

// ── Deployments ─────────────────────────────────────────────────────────────

export function useMLDeploymentListQuery(plantCode) {
    return useQuery({
        queryKey: queryKeys.modelStudio.mlModel.deployments(plantCode),
        queryFn: () => getDeploymentList(plantCode),
        enabled: !!plantCode,
    });
}

export function useCreateMLDeploymentMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, payload }) => createDeployment(plantCode, payload),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.mlModel.deployments(plantCode) });
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.mlModel.registry(plantCode) });
        },
    });
}

export function useDeleteMLDeploymentMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, depId }) => deleteDeployment(plantCode, depId),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.mlModel.deployments(plantCode) });
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.mlModel.registry(plantCode) });
        },
    });
}

// ── Artifacts ───────────────────────────────────────────────────────────────

export function useMLArtifactListQuery(plantCode) {
    return useQuery({
        queryKey: queryKeys.modelStudio.mlModel.artifacts(plantCode),
        queryFn: () => getArtifactList(plantCode),
        enabled: !!plantCode,
    });
}
