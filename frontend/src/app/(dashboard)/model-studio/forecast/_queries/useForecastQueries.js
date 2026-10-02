'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/src/lib/query/keys';
import {
    getForecastOverview,
    getForecastModelList,
    getForecastAssetList,
    getForecastModelOptions,
    getForecastAssetTags,
    createForecastModel,
    modifyForecastModel,
    deleteForecastModel,
    getForecastPipelineList,
    getForecastPipelineDetails,
    getForecastAvailableTools,
    uploadForecastPipeline,
    updateForecastPipeline,
    deleteForecastPipeline,
    uploadForecastWorkflow,
    updateForecastWorkflow,
    runForecastWorkflow,
    runForecastPipeline,
} from '@/src/services/model-studio/forecast/forecastService';
import {
    getForecastExperimentList,
    getForecastExperimentDetails,
    getForecastModelParams,
    createForecastExperiment,
    updateForecastExperiment,
    deleteForecastExperiment,
} from '@/src/services/model-studio/forecast/forecastExperimentService';

// ── Overview & Model Registry ───────────────────────────────────────────────

export function useForecastOverviewQuery(plantCode) {
    return useQuery({
        queryKey: queryKeys.modelStudio.forecast.overview(plantCode),
        queryFn: () => getForecastOverview(plantCode),
        enabled: !!plantCode,
    });
}

export function useForecastModelListQuery(plantCode) {
    return useQuery({
        queryKey: queryKeys.modelStudio.forecast.models(plantCode),
        queryFn: () => getForecastModelList(plantCode),
        enabled: !!plantCode,
    });
}

export function useForecastAssetListQuery(plantCode) {
    return useQuery({
        queryKey: queryKeys.modelStudio.forecast.assetList(plantCode),
        queryFn: () => getForecastAssetList(plantCode),
        enabled: !!plantCode,
    });
}

export function useForecastModelOptionsQuery(plantCode) {
    return useQuery({
        queryKey: queryKeys.modelStudio.forecast.modelOptions(plantCode),
        queryFn: () => getForecastModelOptions(plantCode),
        enabled: !!plantCode,
    });
}

export function useForecastAssetTagsQuery(plantCode, assetId) {
    return useQuery({
        queryKey: queryKeys.modelStudio.forecast.assetTags(plantCode, assetId),
        queryFn: () => getForecastAssetTags(plantCode, assetId),
        enabled: !!plantCode && !!assetId,
    });
}

export function useCreateForecastModelMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, payload }) => createForecastModel(plantCode, payload),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.forecast.models(plantCode) });
        },
    });
}

export function useModifyForecastModelMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, payload }) => modifyForecastModel(plantCode, payload),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.forecast.models(plantCode) });
        },
    });
}

export function useDeleteForecastModelMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, modelId }) => deleteForecastModel(plantCode, modelId),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.forecast.models(plantCode) });
        },
    });
}

// ── Pipelines ───────────────────────────────────────────────────────────────

export function useForecastPipelineListQuery(plantCode) {
    return useQuery({
        queryKey: queryKeys.modelStudio.forecast.pipelines(plantCode),
        queryFn: () => getForecastPipelineList(plantCode),
        enabled: !!plantCode,
    });
}

export function useForecastPipelineDetailsQuery(plantCode, pipelineId) {
    return useQuery({
        queryKey: queryKeys.modelStudio.forecast.pipelineDetail(plantCode, pipelineId),
        queryFn: () => getForecastPipelineDetails(plantCode, pipelineId),
        enabled: !!plantCode && !!pipelineId,
    });
}

export function useForecastAvailableToolsQuery(plantCode) {
    return useQuery({
        queryKey: queryKeys.modelStudio.forecast.availableTools(plantCode),
        queryFn: () => getForecastAvailableTools(plantCode),
        enabled: !!plantCode,
    });
}

export function useUploadForecastPipelineMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, body }) => uploadForecastPipeline(plantCode, body),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.forecast.pipelines(plantCode) });
        },
    });
}

export function useUpdateForecastPipelineMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, pipelineId, body }) => updateForecastPipeline(plantCode, pipelineId, body),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.forecast.pipelines(plantCode) });
        },
    });
}

export function useDeleteForecastPipelineMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, pipelineId }) => deleteForecastPipeline(plantCode, pipelineId),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.forecast.pipelines(plantCode) });
        },
    });
}

export function useUploadForecastWorkflowMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, body }) => uploadForecastWorkflow(plantCode, body),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.forecast.pipelines(plantCode) });
        },
    });
}

export function useUpdateForecastWorkflowMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, pipelineId, body }) => updateForecastWorkflow(plantCode, pipelineId, body),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.forecast.pipelines(plantCode) });
        },
    });
}

export function useRunForecastWorkflowMutation() {
    return useMutation({
        mutationFn: ({ plantCode, body }) => runForecastWorkflow(plantCode, body),
    });
}

export function useRunForecastPipelineMutation() {
    return useMutation({
        mutationFn: ({ plantCode, body }) => runForecastPipeline(plantCode, body),
    });
}

// ── Experiments ─────────────────────────────────────────────────────────────

export function useForecastExperimentListQuery(plantCode) {
    return useQuery({
        queryKey: queryKeys.modelStudio.forecast.experiments(plantCode),
        queryFn: () => getForecastExperimentList(plantCode),
        enabled: !!plantCode,
    });
}

export function useForecastExperimentDetailsQuery(plantCode, experimentId) {
    return useQuery({
        queryKey: queryKeys.modelStudio.forecast.experimentDetail(plantCode, experimentId),
        queryFn: () => getForecastExperimentDetails(plantCode, experimentId),
        enabled: !!plantCode && !!experimentId,
    });
}

export function useForecastModelParamsQuery(plantCode, modelId) {
    return useQuery({
        queryKey: queryKeys.modelStudio.forecast.modelParams(plantCode, modelId),
        queryFn: () => getForecastModelParams(plantCode, modelId),
        enabled: !!plantCode && !!modelId,
    });
}

export function useCreateForecastExperimentMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, payload }) => createForecastExperiment(plantCode, payload),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.forecast.experiments(plantCode) });
        },
    });
}

export function useUpdateForecastExperimentMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, experimentId, payload }) => updateForecastExperiment(plantCode, experimentId, payload),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.forecast.experiments(plantCode) });
        },
    });
}

export function useDeleteForecastExperimentMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ plantCode, experimentId }) => deleteForecastExperiment(plantCode, experimentId),
        onSuccess: (_data, { plantCode }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.modelStudio.forecast.experiments(plantCode) });
        },
    });
}
