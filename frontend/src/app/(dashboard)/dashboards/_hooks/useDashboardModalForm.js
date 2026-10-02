'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useToast } from '@/src/components/ui/Toast';
import { useConfirm } from '@/src/components/ui/ConfirmModal';
import { getFieldVisibility, buildDashboardPayload, filterAvailableMetrics } from '../_components/helpers';
import { useVisualChartPreview } from '../_queries/useDashboardQueries';
import { useCustomLogicHandlers } from './useCustomLogicHandlers';
import { useEquipmentMetrics } from './useEquipmentMetrics';
import { useFormValidation } from './useFormValidation';
import { useFormResetEffect } from './useFormResetEffect';
import { useApp } from '@/src/context/AppContext';

export function useDashboardModalForm({ initialValues = {}, modalChartCategories }) {
    const routeParams = useParams();
    const dashboardId = initialValues.dashboardId || initialValues.dashboard_id || routeParams?.id || '';
    const { warning: toastWarning } = useToast();
    const { openConfirm } = useConfirm();
    const { plantId } = useApp();
    const plantCode = plantId?.id || 'cdm_copy';

    const equipmentSectionRef = useRef(null);
    const equipmentInputRef = useRef(null);
    const formulaSectionRef = useRef(null);
    const formulaInputRef = useRef(null);

    const [mTitle, setMTitle] = useState(initialValues.mTitle ?? '');
    const [chartType, setChartType] = useState(initialValues.chartType ?? '');
    const initialCategory = (() => {
        if (!initialValues.chartType || !modalChartCategories) return '';
        const foundCat = modalChartCategories.find(cat =>
            cat.types.some(t => t.id === initialValues.chartType)
        );
        return foundCat ? foundCat.label : '';
    })();
    const [chartTypeSelected, setChartTypeSelected] = useState(initialCategory);
    const [selectedEquipment, setSelectedEquipment] = useState(initialValues.selectedEquipment ?? '');
    const [xAxisSelected, setXAxisSelected] = useState(initialValues.xAxisSelected ?? '');
    const [secondaryYAxisSelected, setSecondaryYAxisSelected] = useState(initialValues.secondaryYAxisSelected ?? '');
    const [lineTag, setLineTag] = useState(initialValues.lineTag ?? '');
    const [columnTag, setColumnTag] = useState(initialValues.columnTag ?? '');
    const [yAxisMulti, setYAxisMulti] = useState(initialValues.yAxisMulti ?? []);
    const [columnsMulti, setColumnsMulti] = useState(initialValues.columnsMulti ?? []);
    const [yAxisMode, setYAxisMode] = useState(initialValues.yAxisMode ?? 'default');
    const [yAxisSelected, setYAxisSelected] = useState(initialValues.yAxisSelected ?? '');
    const [customLogicList, setCustomLogicList] = useState(initialValues.customLogicList ?? []);
    const [customLogicSelected, setCustomLogicSelected] = useState(initialValues.customLogicSelected ?? '');
    const [secondaryYAxisMode, setSecondaryYAxisMode] = useState('default');
    const [secondaryCustomLogicSelected, setSecondaryCustomLogicSelected] = useState('');
    const [valueTag, setValueTag] = useState(initialValues.valueTag ?? '');
    const [valueTagMode, setValueTagMode] = useState(initialValues.valueTagMode ?? 'default');
    const [valueCustomLogicSelected, setValueCustomLogicSelected] = useState(initialValues.valueCustomLogicSelected ?? '');
    const formatForInput = (val) => {
        if (!val) return '';
        const tForm = String(val).replace(' ', 'T');
        return tForm.slice(0, 16);
    };

    const initialTimePreset = (() => {
        if (initialValues.timePreset) return initialValues.timePreset;
        if (initialValues.customStart && initialValues.customStart !== '') return 'custom';
        return '9h';
    })();

    const [timePreset, setTimePreset] = useState(initialTimePreset);
    const [isLive, setIsLive] = useState(initialValues.isLive ?? true);
    const [customStart, setCustomStart] = useState(formatForInput(initialValues.customStart));
    const [customEnd, setCustomEnd] = useState(formatForInput(initialValues.customEnd));
    const [interval, setInterval] = useState(initialValues.interval ?? null);
    const [aggregation, setAggregation] = useState(initialValues.aggregation ?? null);
    const [formula, setFormula] = useState(initialValues.formula ?? '');
    const [expressionName, setExpressionName] = useState(initialValues.expressionName ?? '');
    const [expressionDescription, setExpressionDescription] = useState(initialValues.expressionDescription ?? '');
    const [editingLogicId, setEditingLogicId] = useState(null);
    const [pendingMultiSelectTarget, setPendingMultiSelectTarget] = useState(null);
    const [availableTags, setAvailableTags] = useState([]);

    // Synchronize form states ONCE per visual when opening edit visual drawer
    const lastInitializedIdRef = useRef(null);

    useEffect(() => {
        if (!initialValues || Object.keys(initialValues).length === 0) return;

        const currentId = initialValues._initKey || initialValues.id || initialValues.editingVisualId;
        if (!currentId) return;

        if (lastInitializedIdRef.current !== currentId) {
            lastInitializedIdRef.current = currentId;

            if (initialValues.mTitle !== undefined) setMTitle(initialValues.mTitle);
            if (initialValues.chartType !== undefined) {
                setChartType(initialValues.chartType);
                if (modalChartCategories) {
                    const foundCat = modalChartCategories.find(cat =>
                        cat.types.some(t => t.id === initialValues.chartType)
                    );
                    if (foundCat) setChartTypeSelected(foundCat.label);
                }
            }
            if (initialValues.selectedEquipment !== undefined) setSelectedEquipment(initialValues.selectedEquipment);
            if (initialValues.xAxisSelected !== undefined) setXAxisSelected(initialValues.xAxisSelected);
            if (initialValues.yAxisSelected !== undefined) setYAxisSelected(initialValues.yAxisSelected);
            if (initialValues.yAxisMulti !== undefined) setYAxisMulti(initialValues.yAxisMulti);
            if (initialValues.valueTag !== undefined) setValueTag(initialValues.valueTag);
            if (initialValues.lineTag !== undefined) setLineTag(initialValues.lineTag);
            if (initialValues.columnTag !== undefined) setColumnTag(initialValues.columnTag);
            if (initialValues.columnsMulti !== undefined) setColumnsMulti(initialValues.columnsMulti);
            if (initialValues.aggregation !== undefined) setAggregation(initialValues.aggregation);
            if (initialValues.interval !== undefined) setInterval(initialValues.interval);
            if (initialValues.isLive !== undefined) setIsLive(initialValues.isLive);
        }
    }, [initialValues, modalChartCategories]);

    const visibility = getFieldVisibility(chartType);
    const prevChartTypeRef = useRef(chartType);

    useFormResetEffect({
        chartType, setYAxisSelected, setYAxisMulti, setValueTag, setLineTag, setColumnTag, setColumnsMulti
    });

    const { isFormValid, isConfigValid } = useFormValidation({
        mTitle, chartType, chartTypeSelected, selectedEquipment, xAxisSelected, yAxisSelected,
        customLogicSelected, yAxisMulti, lineTag, columnTag, valueTag, columnsMulti, visibility,
        yAxisMode, valueTagMode, valueCustomLogicSelected, interval, aggregation, secondaryYAxisMode
    });

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    const { equipmentList, xAxisList, metricsList } = useEquipmentMetrics(selectedEquipment, dashboardId, setCustomLogicList);

    const buildPayload = () => buildDashboardPayload({
        chartType, timePreset, customStart, customEnd, aggregation, interval, mTitle,
        xAxisSelected, yAxisMode, yAxisSelected, yAxisMulti, customLogicSelected, customLogicList,
        secondaryYAxisMode, secondaryYAxisSelected, secondaryCustomLogicSelected,
        valueTag, valueTagMode, valueCustomLogicSelected, lineTag, columnTag, columnsMulti, visibility, formula,
        isLive,
    });

    const buildBackendPayload = () => {
        const p = buildPayload();
        return {
            visual_type: p.visual_type,
            is_live: isLive,
            start_time: p.start_time,
            end_time: p.end_time,
            aggregation: p.aggregation || null,
            interval: p.interval || null,
            logic_configuration: p.logic_configuration || {},
            visual_config: { ...p.visual_config, equipment: selectedEquipment, time_preset: timePreset, is_live: isLive },
            dashboard_id: dashboardId,
        };
    };

    // The full config-derived payload becomes the query key verbatim — no
    // hand-maintained dependency array to keep in sync with buildBackendPayload
    // (that 20-item array + eslint-disable used to be exactly this hazard: a
    // key that silently omits a value the fetch closes over).
    const previewQuery = useVisualChartPreview(
        plantCode,
        isConfigValid ? buildBackendPayload() : null,
        { enabled: isConfigValid },
    );

    const { data: previewData, error: previewError } = useMemo(() => {
        if (previewQuery.isError) {
            return { data: null, error: previewQuery.error?.message || 'Failed to fetch preview.' };
        }
        const result = previewQuery.data;
        if (!result) {
            // Nothing has resolved yet for the current config. EditDashboardModal
            // seeds `initialValues.previewData` with the visual's already-saved
            // chart so the panel isn't blank while the fresh render is in
            // flight — `isLoadingPreview` (checked first by the caller) still
            // shows a spinner over it, so this is never visually ambiguous.
            return { data: initialValues.previewData ?? null, error: null };
        }
        const hasData = result?.success && result?.data && (
            result.data.datasets?.length > 0 || result.data.data?.length > 0 ||
            result.data.value !== undefined || result.data.columns?.length > 0
        );
        return hasData
            ? { data: result.data, error: null }
            : { data: result?.data || null, error: result?.message || null };
    }, [previewQuery.data, previewQuery.isError, previewQuery.error, initialValues.previewData]);

    const isLoadingPreview = previewQuery.isFetching;

    const handlePreviewActualData = () => {
        if (!isConfigValid) return;
        previewQuery.refetch();
    };

    const { handleEditCustomLogic, handleDeleteCustomLogic, handleSaveFormula } = useCustomLogicHandlers({
        customLogicList, setCustomLogicList, customLogicSelected, setCustomLogicSelected,
        secondaryCustomLogicSelected, setSecondaryCustomLogicSelected, editingLogicId, setEditingLogicId,
        expressionName, setExpressionName, expressionDescription, setExpressionDescription, formula, setFormula,
        selectedEquipment, pendingMultiSelectTarget, setPendingMultiSelectTarget, setYAxisMulti, setValueCustomLogicSelected,
        formulaSectionRef, formulaInputRef, openConfirm, toastWarning,
    });

    const selectedChartMeta = useMemo(
        () => modalChartCategories?.flatMap(c => c.types).find(t => t.id === chartType),
        [modalChartCategories, chartType]
    );

    const getAvailableMetricsFor = (key, baseList = metricsList) =>
        filterAvailableMetrics(key, baseList, { xAxisSelected, yAxisMode, yAxisSelected, yAxisMulti, secondaryYAxisMode, secondaryYAxisSelected, lineTag, columnTag, valueTagMode, valueTag, valueCustomLogicSelected, columnsMulti });

    const customLogicOptions = [{ id: 'CREATE_NEW', name: 'Create New Custom Logic...', label: 'Create New Custom Logic...' }, ...customLogicList];

    return {
        equipmentSectionRef, equipmentInputRef, formulaSectionRef, formulaInputRef,
        mTitle, setMTitle, chartType, setChartType, chartTypeSelected, setChartTypeSelected,
        selectedEquipment, setSelectedEquipment, xAxisSelected, setXAxisSelected,
        secondaryYAxisSelected, setSecondaryYAxisSelected, lineTag, setLineTag, columnTag, setColumnTag,
        yAxisMulti, setYAxisMulti, columnsMulti, setColumnsMulti, yAxisMode, setYAxisMode,
        yAxisSelected, setYAxisSelected, customLogicList, setCustomLogicList,
        customLogicSelected, setCustomLogicSelected, secondaryYAxisMode, setSecondaryYAxisMode,
        secondaryCustomLogicSelected, setSecondaryCustomLogicSelected, valueTag, setValueTag,
        valueTagMode, setValueTagMode, valueCustomLogicSelected, setValueCustomLogicSelected,
        timePreset, setTimePreset, isLive, setIsLive, customStart, setCustomStart, customEnd, setCustomEnd,
        interval, setInterval, aggregation, setAggregation, formula, setFormula,
        expressionName, setExpressionName, expressionDescription, setExpressionDescription,
        editingLogicId, setEditingLogicId, pendingMultiSelectTarget, setPendingMultiSelectTarget,
        equipmentList, xAxisList, metricsList, availableTags, previewData, isLoadingPreview, previewError,
        visibility, isFormValid, isConfigValid, selectedChartMeta, customLogicOptions, getAvailableMetricsFor,
        buildPayload, buildBackendPayload, handlePreviewActualData, handleEditCustomLogic, handleDeleteCustomLogic, handleSaveFormula,
    };
}
