'use client';

import React from 'react';
// ─── TOP-LEVEL IMPORTS (was: require() inside render — caused re-execution on every keystroke) ───
import { useDashboardModalForm } from '../../_hooks/useDashboardModalForm';
import { MODAL_CHART_CATEGORIES } from '../constants';
import VisualTypeSelector from '../form/VisualTypeSelector';
import EquipmentSelector from '../form/EquipmentSelector';
import DataSourceConfigurator from '../form/DataSourceConfigurator';
import TimePresetSelector from '../form/TimePresetSelector';
import BucketIntervalSelector from '../form/BucketIntervalSelector';
import AggregationSelector from '../form/AggregationSelector';
import FormulaBuilder from '../form/FormulaBuilder';
import DynamicPreviewBox from './DynamicPreviewBox';

export default function VisualForm({
  drawerTitle,
  setDrawerTitle,
  drawerVisualType,
  setDrawerVisualType,
  drawerMetricIndex,
  handleMetricChange,
  drawerAggregation,
  setDrawerAggregation,
  previewWsConfig,
  isTitleAutoFilled,
  onFormInstance,
  editingVisual,
}) {
  const initialValues = React.useMemo(() => {
    const vId = editingVisual?.id || editingVisual?.visual_id || 'new_visual';
    const initKey = `${vId}_${editingVisual ? 'edit' : 'create'}`;

    if (!editingVisual) {
      return {
        _initKey: initKey,
        id: vId,
        mTitle: drawerTitle || 'Untitled Visual',
        chartType: drawerVisualType || 'line',
        aggregation: drawerAggregation || 'avg',
      };
    }

    const cfg = editingVisual.visual_config?.data || editingVisual.visual_config || editingVisual.chartData || editingVisual.data || {};

    const eq = editingVisual.equipment_id || editingVisual.equipment || cfg.equipment_id || '';
    const xAxis = editingVisual.x_axis || cfg.labels?.x?.label || cfg.x_axis || 'time';

    // Extract y_axis tags
    let yAxisSel = '';
    let yAxisMulti = [];
    if (Array.isArray(editingVisual.y_axis) && editingVisual.y_axis.length > 0) {
      yAxisSel = editingVisual.y_axis[0];
      yAxisMulti = editingVisual.y_axis;
    } else if (typeof editingVisual.y_axis === 'string' && editingVisual.y_axis) {
      yAxisSel = editingVisual.y_axis;
      yAxisMulti = [editingVisual.y_axis];
    } else if (cfg.datasets && Array.isArray(cfg.datasets) && cfg.datasets.length > 0) {
      yAxisSel = cfg.datasets[0].tag || cfg.datasets[0].id || '';
      yAxisMulti = cfg.datasets.map((d) => d.tag || d.id).filter(Boolean);
    }

    // Extract value_tag
    const valTag = editingVisual.value_tag || cfg.value_tag || (cfg.datasets && cfg.datasets[0]?.tag) || '';

    // Extract line_tags & column_tags
    const lineTag = Array.isArray(editingVisual.line_tags) && editingVisual.line_tags.length > 0
      ? editingVisual.line_tags[0]
      : (typeof editingVisual.line_tags === 'string' ? editingVisual.line_tags : '');

    const columnTag = Array.isArray(editingVisual.column_tags) && editingVisual.column_tags.length > 0
      ? editingVisual.column_tags[0]
      : (typeof editingVisual.column_tags === 'string' ? editingVisual.column_tags : '');

    const columnsMulti = Array.isArray(editingVisual.columns) ? editingVisual.columns : (editingVisual.columns ? [editingVisual.columns] : []);

    return {
      _initKey: initKey,
      id: vId,
      mTitle: editingVisual.title || editingVisual.name || editingVisual.visual_name || drawerTitle || 'Untitled Visual',
      chartType: editingVisual.type || editingVisual.chartType || editingVisual.visual_type || drawerVisualType || 'line',
      selectedEquipment: eq,
      xAxisSelected: xAxis,
      yAxisSelected: yAxisSel,
      yAxisMulti: yAxisMulti,
      valueTag: valTag,
      lineTag: lineTag,
      columnTag: columnTag,
      columnsMulti: columnsMulti,
      aggregation: editingVisual.aggregation || drawerAggregation || 'avg',
      interval: editingVisual.interval || null,
      isLive: editingVisual.is_live ?? true,
      customStart: editingVisual.start_time || '',
      customEnd: editingVisual.end_time || '',
    };
  }, [editingVisual]);

  const f = useDashboardModalForm({
    initialValues,
    modalChartCategories: MODAL_CHART_CATEGORIES
  });

  // ─── Share form instance via ref (no state update — no parent re-render on keystrokes) ───
  // onFormInstance just writes to a ref in the parent, so this is safe to call every render
  // but we guard with useRef to avoid calling it when f hasn't semantically changed.
  const fRef = React.useRef(f);
  fRef.current = f;
  React.useLayoutEffect(() => {
    if (onFormInstance) onFormInstance(fRef.current);
  });

  // ─── Sync back to parent ONLY when type / aggregation change (not on every keystroke) ───
  // mTitle sync is removed: the parent reads it from formInstanceRef at save time.
  React.useEffect(() => {
    if (f.chartType !== drawerVisualType) setDrawerVisualType(f.chartType);
  }, [f.chartType]);

  React.useEffect(() => {
    if (f.aggregation !== drawerAggregation) setDrawerAggregation(f.aggregation);
  }, [f.aggregation]);

  const livePreviewWsConfig = React.useMemo(() => {
    const existingChartData = editingVisual?.chartData || editingVisual?.data || editingVisual?.visual_config?.data || editingVisual?.visual_config;
    const dataObj = f.previewData || existingChartData || previewWsConfig?.chartData || previewWsConfig?.data || {};

    return {
      id: 'preview',
      name: f.mTitle || drawerTitle || editingVisual?.title || 'Preview Chart',
      chartType: f.chartType || drawerVisualType || editingVisual?.type || 'line',
      type: f.chartType || drawerVisualType || editingVisual?.type || 'line',
      chartData: dataObj,
      data: dataObj,
      is_live: f.isLive ?? editingVisual?.is_live ?? true,
    };
  }, [f.previewData, f.mTitle, f.chartType, f.isLive, drawerTitle, drawerVisualType, previewWsConfig, editingVisual]);

  return (
    <div className="flex flex-col gap-4 text-xs text-text-primary pb-2">
      {/* Visual Name */}
      <div className="flex flex-col gap-2">
        <label className="block text-[10px] font-bold text-text-muted tracking-[0.12em] uppercase">Visual Name</label>
        <input 
          value={f.mTitle} 
          onChange={e => f.setMTitle(e.target.value)} 
          placeholder="e.g. CDU Operations Monitor" 
          className="w-full h-8 px-2.5 border border-border rounded-md text-xs font-semibold text-text-primary bg-surface-2 outline-none focus:border-brand focus:ring-[2px] focus:ring-brand/10 transition-all" 
        />
      </div>

      <VisualTypeSelector 
        chartType={f.chartType} 
        setChartType={f.setChartType} 
        setChartTypeSelected={f.setChartTypeSelected} 
        equipmentSectionRef={f.equipmentSectionRef} 
        equipmentInputRef={f.equipmentInputRef} 
        modalChartCategories={MODAL_CHART_CATEGORIES} 
      />

      {f.chartType && (
        <div className="flex flex-col gap-4 border-t border-border pt-4">
          <EquipmentSelector 
            ref={f.equipmentInputRef} 
            selectedEquipment={f.selectedEquipment} 
            setSelectedEquipment={f.setSelectedEquipment} 
            equipmentList={f.equipmentList} 
          />

          <DataSourceConfigurator 
            visibility={f.visibility} 
            xAxisSelected={f.xAxisSelected} 
            setXAxisSelected={f.setXAxisSelected} 
            xAxisList={f.xAxisList} 
            yAxisMode={f.yAxisMode} 
            setYAxisMode={f.setYAxisMode} 
            yAxisSelected={f.yAxisSelected} 
            setYAxisSelected={f.setYAxisSelected} 
            yAxisMulti={f.yAxisMulti} 
            setYAxisMulti={f.setYAxisMulti} 
            customLogicSelected={f.customLogicSelected} 
            setCustomLogicSelected={f.setCustomLogicSelected} 
            customLogicOptions={f.customLogicOptions} 
            secondaryYAxisMode={f.secondaryYAxisMode} 
            setSecondaryYAxisMode={f.setSecondaryYAxisMode} 
            secondaryYAxisSelected={f.secondaryYAxisSelected} 
            setSecondaryYAxisSelected={f.setSecondaryYAxisSelected} 
            secondaryCustomLogicSelected={f.secondaryCustomLogicSelected} 
            setSecondaryCustomLogicSelected={f.setSecondaryCustomLogicSelected} 
            lineTag={f.lineTag} 
            setLineTag={f.setLineTag} 
            columnTag={f.columnTag} 
            setColumnTag={f.setColumnTag} 
            valueTag={f.valueTag} 
            setValueTag={f.setValueTag} 
            valueTagMode={f.valueTagMode} 
            setValueTagMode={f.setValueTagMode} 
            valueCustomLogicSelected={f.valueCustomLogicSelected} 
            setValueCustomLogicSelected={f.setValueCustomLogicSelected} 
            columnsMulti={f.columnsMulti} 
            setColumnsMulti={f.setColumnsMulti} 
            getAvailableMetricsFor={f.getAvailableMetricsFor} 
            formulaSectionRef={f.formulaSectionRef} 
            formulaInputRef={f.formulaInputRef} 
            setFormula={f.setFormula} 
            setEditingLogicId={f.setEditingLogicId} 
            setExpressionName={f.setExpressionName} 
            setExpressionDescription={f.setExpressionDescription} 
            onEditCustomLogic={f.handleEditCustomLogic} 
            onDeleteCustomLogic={f.handleDeleteCustomLogic} 
            setPendingMultiSelectTarget={f.setPendingMultiSelectTarget} 
          />
          
          {f.chartType && !['table', 'heatmap'].includes(f.chartType) && f.chartTypeSelected !== 'KPI' && (
            <BucketIntervalSelector 
              interval={f.interval} 
              setInterval={f.setInterval} 
              timePreset={f.timePreset} 
              customStart={f.customStart} 
              customEnd={f.customEnd} 
            />
          )}
          
          {f.chartType && f.chartType !== 'table' && (
            <AggregationSelector 
              aggregation={f.aggregation} 
              setAggregation={f.setAggregation} 
            />
          )}

          {(f.yAxisMode === 'custom' || f.secondaryYAxisMode === 'custom' || f.valueTagMode === 'custom') && (
            <FormulaBuilder 
              formulaSectionRef={f.formulaSectionRef} 
              formulaInputRef={f.formulaInputRef} 
              editingLogicId={f.editingLogicId} 
              expressionName={f.expressionName} 
              setExpressionName={f.setExpressionName} 
              expressionDescription={f.expressionDescription} 
              setExpressionDescription={f.setExpressionDescription} 
              formula={f.formula} 
              setFormula={f.setFormula} 
              availableTags={f.metricsList} 
              onSaveFormula={f.handleSaveFormula} 
            />
          )}
        </div>
      )}

      {/* Dynamic Preview */}
      <DynamicPreviewBox
        isLoadingPreview={f.isLoadingPreview}
        previewError={f.previewError}
        livePreviewWsConfig={livePreviewWsConfig}
        isConfigValid={f.isConfigValid}
      />
    </div>
  );
}
