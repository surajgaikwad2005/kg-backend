import React, { useState } from 'react';
import { Modal } from '@/src/components/ui/Modal';
import { MODAL_CHART_CATEGORIES as CONST_CATEGORIES, TIME_PRESETS as CONST_PRESETS } from './constants';
import PreviewChart from './preview/PreviewChart';
import VisualTypeSelector from './form/VisualTypeSelector';
import EquipmentSelector from './form/EquipmentSelector';
import DataSourceConfigurator from './form/DataSourceConfigurator';
import TimePresetSelector from './form/TimePresetSelector';
import BucketIntervalSelector from './form/BucketIntervalSelector';
import AggregationSelector from './form/AggregationSelector';
import FormulaBuilder from './form/FormulaBuilder';
import { useRenderVisualChart, useEditVisual } from '../_queries/useDashboardQueries';
import { useDashboardModalForm } from '../_hooks/useDashboardModalForm';
import { useToast } from '@/src/components/ui/Toast';
import { useApp } from '@/src/context/AppContext';

export function EditDashboardModal({
  dashboard = {},
  onClose,
  onSave,
  modalChartCategories = CONST_CATEGORIES,
  timePresetsDefault = CONST_PRESETS,
}) {
  const { error: toastError } = useToast();
  const { plantId } = useApp();
  const plantCode = plantId?.id || 'cdm_copy';
  const [isSaving, setIsSaving] = useState(false);

  const { mutateAsync: renderVisualChartAsync } = useRenderVisualChart(plantCode);
  const { mutateAsync: editVisualAsync } = useEditVisual(plantCode);

  const existingConfig = {
    x_axis: dashboard?.x_axis,
    y_axis: dashboard?.y_axis,
    secondary_y_axis: dashboard?.secondary_y_axis,
    value_tag: dashboard?.value_tag,
    line_tags: dashboard?.line_tags,
    column_tags: dashboard?.column_tags,
    columns: dashboard?.columns,
    ...(dashboard?.chartData?.visual_config || dashboard?.visual_config || {}),
  };
  const existingLogic = dashboard?.chartData?.logic_configuration || dashboard?.logic_configuration || {};
  // Legacy fallbacks: extract config elements directly from dataset tags/labels if config is empty
  const datasets = dashboard?.chartData?.datasets || dashboard?.data?.datasets || [];
  const fallbackYAxis = datasets.filter(ds => ds.axis !== 'secondary').map(ds => ds.tag || ds.label).filter(Boolean);
  const fallbackSecYAxis = datasets.filter(ds => ds.axis === 'secondary').map(ds => ds.tag || ds.label).filter(Boolean);
  const fallbackXAxis = dashboard?.chartData?.labels?.x?.label || dashboard?.data?.labels?.x?.label || 'Timestamp';

  const initYAxis = existingConfig.y_axis && existingConfig.y_axis.length > 0 ? existingConfig.y_axis : fallbackYAxis;
  const initFormula = existingLogic.formula || '';
  const hasCustomLogic = Boolean(initFormula);
  const isValueChart = ['kpi', 'kpi_card', 'gauge', 'heatmap'].includes(dashboard?.chartType || '');
  const hasValueCustomLogic = isValueChart && hasCustomLogic;
  const f = useDashboardModalForm({
    modalChartCategories,
    initialValues: {
      mTitle: dashboard?.name || '',
      chartType: dashboard?.chartType || '',
      selectedEquipment: dashboard?.equipment || '',
      xAxisSelected: existingConfig.x_axis || fallbackXAxis,
      secondaryYAxisSelected: existingConfig.secondary_y_axis?.[0] || fallbackSecYAxis[0] || '',
      lineTag: existingConfig.line_tags?.[0] || '',
      columnTag: existingConfig.column_tags?.[0] || '',
      yAxisMulti: initYAxis.length > 0 ? initYAxis : [],
      columnsMulti: existingConfig.columns || [],
      yAxisMode: hasCustomLogic && !isValueChart ? 'custom' : 'default',
      yAxisSelected: !hasCustomLogic && initYAxis.length > 0 ? initYAxis[0] : '',
      customLogicList: hasCustomLogic ? [{ id: 'attached_logic_id', name: 'Attached Visual Logic', label: 'Attached Visual Logic', formula: initFormula }] : [],
      customLogicSelected: hasCustomLogic && !isValueChart ? 'attached_logic_id' : '',
      valueTag: existingConfig.value_tag && !hasValueCustomLogic ? String(existingConfig.value_tag) : '',
      valueTagMode: hasValueCustomLogic ? 'custom' : 'default',
      valueCustomLogicSelected: hasValueCustomLogic ? 'attached_logic_id' : '',
      timePreset: dashboard?.time_preset || dashboard?.timePreset || existingConfig.time_preset,
      customStart: dashboard?.start_time || dashboard?.chartData?.start_time || existingConfig.start_time || '',
      customEnd: dashboard?.end_time || dashboard?.chartData?.end_time || existingConfig.end_time || '',
      isLive: dashboard?.is_live == true,
      interval: dashboard.interval,
      aggregation: dashboard?.aggregation || dashboard?.chartData?.aggregation || existingConfig.aggregation,
      formula: initFormula,
      expressionName: hasCustomLogic ? 'Attached Visual Logic' : '',
      previewData: dashboard?.chartData || null,
    },
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const bp = f.buildBackendPayload();
      const renderResult = await renderVisualChartAsync(bp);
      if (!renderResult || (!renderResult.success && !renderResult.data)) {
        throw new Error(renderResult?.message || 'Failed to render visual data before saving');
      }

      const payloadToSave = {
        ...renderResult,
        visual_config: bp.visual_config,
        logic_configuration: bp.logic_configuration,
        time_preset: f.timePreset,
        interval: f.interval,
        aggregation: f.aggregation,
      };

      await editVisualAsync({
        visualId: dashboard.id,
        visualName: f.mTitle || 'Untitled Visual',
        visualConfigPayload: payloadToSave,
        dashboardId: bp.dashboard_id || dashboard.dashboard_id || dashboard.dashboardId,
      });

      if (onSave) {
        onSave({
          ...dashboard,
          name: f.mTitle || 'Untitled Visual',
          equipment: f.selectedEquipment || 'Unknown System',
          chartType: f.chartType,
          timePreset: f.timePreset,
          time_preset: f.timePreset,
          isLive: f.isLive,
          is_live: f.isLive,
          start_time: payloadToSave.start_time || f.customStart,
          end_time: payloadToSave.end_time || f.customEnd,
          interval: f.interval,
          aggregation: f.aggregation,
          updatedAt: new Date().toISOString(),
          chartData: payloadToSave.data || {},
          visual_config: payloadToSave.visual_config || {},
          logic_configuration: payloadToSave.logic_configuration || {}
        });
      }
      onClose();
    } catch (error) {
      toastError('Failed to save visual', error.message || 'An unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} size="full" className="max-w-340 h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0 bg-surface">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-muted text-brand grid place-items-center shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4.5 h-4.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            </div>
            <div>
              <div id="edit-dashboard-modal-title" className="text-title font-extrabold text-text-primary tracking-tight">Edit Visual</div>
              <div className="text-caption text-text-muted mt-0.5">Adjust chart configuration, metrics, and logic</div>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 grid place-items-center bg-surface-2 border-none rounded-lg text-text-secondary cursor-pointer hover:bg-border/50 transition-colors"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="w-3.5 h-3.5"><path d="M18 6 6 18M6 6l12 12" /></svg></button>
        </div>

        <div className="flex flex-1 min-h-0 overflow-hidden">
          <div className="flex-[0_0_44%] flex flex-col bg-surface-2 border-r border-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-surface shrink-0">
              <div>
                <div className="text-xs font-bold text-text-primary">Preview</div>
                <div className="text-caption text-text-muted mt-0.5">{f.chartType ? `${f.selectedChartMeta?.label || f.chartType} — live preview` : 'Select a visualization type to preview'}</div>
              </div>
              {f.isConfigValid && <button onClick={f.handlePreviewActualData} disabled={f.isLoadingPreview} className="h-7 px-3 bg-brand-muted text-brand border border-brand/20 rounded-md text-caption font-bold hover:bg-brand/10 transition-colors flex items-center gap-1.5 cursor-pointer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3 h-3"><path d="M21 12c-2.4 4-5.4 6-9 6s-6.6-2-9-6c2.4-4 5.4-6 9-6s6.6 2 9 6z" /><circle cx="12" cy="12" r="3" /></svg>{f.isLoadingPreview ? 'Loading...' : 'Refresh Data'}</button>}
            </div>
            <div className="flex-1 p-4 min-h-0 flex flex-col">
              <div className="bg-surface rounded-xl border border-border flex-1 p-3 flex flex-col min-h-0 shadow-sm">
                {!f.chartType ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3 text-text-muted"><span className="text-xs text-center max-w-40 leading-relaxed">Pick a chart type on the right to see a preview</span></div>
                ) : f.isLoadingPreview ? (
                  <div className="h-full flex items-center justify-center text-text-muted"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg></div>
                ) : f.isConfigValid && !f.previewData ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3 text-warning bg-warning/5 rounded-xl p-4 border border-dashed border-warning/30"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-7 h-7"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg><span className="text-[12px] font-bold text-center max-w-55 leading-relaxed">{f.previewError || 'No actual backend data found for this configuration. Preview not available.'}</span></div>
                ) : (
                  <PreviewChart chartData={f.previewData} chartType={f.chartType} colors={['#2563EB']} isLoading={f.isLoadingPreview} />
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-2 flex flex-col">
            <div className="py-5 border-b border-border">
              <label className="block text-label font-bold text-text-muted tracking-[0.12em] uppercase mb-2">Visual Name</label>
              <input value={f.mTitle} onChange={e => f.setMTitle(e.target.value)} placeholder="e.g. CDU Operations Monitor" className="w-full h-11.5 px-4 border-[1.5px] border-border rounded-xl text-base font-semibold text-text-primary bg-surface-2 outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all" />
            </div>
            <VisualTypeSelector chartType={f.chartType} setChartType={f.setChartType} setChartTypeSelected={f.setChartTypeSelected} equipmentSectionRef={f.equipmentSectionRef} equipmentInputRef={f.equipmentInputRef} modalChartCategories={modalChartCategories} />
            {f.chartType && (
              <>
                <EquipmentSelector ref={f.equipmentInputRef} selectedEquipment={f.selectedEquipment} setSelectedEquipment={f.setSelectedEquipment} equipmentList={f.equipmentList} />
                <DataSourceConfigurator visibility={f.visibility} xAxisSelected={f.xAxisSelected} setXAxisSelected={f.setXAxisSelected} xAxisList={f.xAxisList} yAxisMode={f.yAxisMode} setYAxisMode={f.setYAxisMode} yAxisSelected={f.yAxisSelected} setYAxisSelected={f.setYAxisSelected} yAxisMulti={f.yAxisMulti} setYAxisMulti={f.setYAxisMulti} customLogicSelected={f.customLogicSelected} setCustomLogicSelected={f.setCustomLogicSelected} customLogicOptions={f.customLogicOptions} secondaryYAxisMode={f.secondaryYAxisMode} setSecondaryYAxisMode={f.setSecondaryYAxisMode} secondaryYAxisSelected={f.secondaryYAxisSelected} setSecondaryYAxisSelected={f.setSecondaryYAxisSelected} secondaryCustomLogicSelected={f.secondaryCustomLogicSelected} setSecondaryCustomLogicSelected={f.setSecondaryCustomLogicSelected} lineTag={f.lineTag} setLineTag={f.setLineTag} columnTag={f.columnTag} setColumnTag={f.setColumnTag} valueTag={f.valueTag} setValueTag={f.setValueTag} valueTagMode={f.valueTagMode} setValueTagMode={f.setValueTagMode} valueCustomLogicSelected={f.valueCustomLogicSelected} setValueCustomLogicSelected={f.setValueCustomLogicSelected} columnsMulti={f.columnsMulti} setColumnsMulti={f.setColumnsMulti} getAvailableMetricsFor={f.getAvailableMetricsFor} formulaSectionRef={f.formulaSectionRef} formulaInputRef={f.formulaInputRef} setFormula={f.setFormula} setEditingLogicId={f.setEditingLogicId} setExpressionName={f.setExpressionName} setExpressionDescription={f.setExpressionDescription} onEditCustomLogic={f.handleEditCustomLogic} onDeleteCustomLogic={f.handleDeleteCustomLogic} setPendingMultiSelectTarget={f.setPendingMultiSelectTarget} />
                <TimePresetSelector timePreset={f.timePreset} setTimePreset={f.setTimePreset} customStart={f.customStart} setCustomStart={f.setCustomStart} customEnd={f.customEnd} setCustomEnd={f.setCustomEnd} timePresets={timePresetsDefault} isLive={f.isLive} setIsLive={f.setIsLive} />
                {f.chartType && !['table', 'heatmap'].includes(f.chartType) && f.chartTypeSelected !== 'KPI' && <BucketIntervalSelector interval={f.interval} setInterval={f.setInterval} timePreset={f.timePreset} customStart={f.customStart} customEnd={f.customEnd} />}
                {f.chartType && f.chartType !== 'table' && <AggregationSelector aggregation={f.aggregation} setAggregation={f.setAggregation} />}
                {((f.visibility.showY && (!f.visibility.multiY || f.yAxisMode === 'custom')) || (f.visibility.showValue && f.valueTagMode === 'custom')) && (
                  <FormulaBuilder formulaSectionRef={f.formulaSectionRef} formulaInputRef={f.formulaInputRef} editingLogicId={f.editingLogicId} expressionName={f.expressionName} setExpressionName={f.setExpressionName} expressionDescription={f.expressionDescription} setExpressionDescription={f.setExpressionDescription} formula={f.formula} setFormula={f.setFormula} availableTags={f.metricsList} onSaveFormula={f.handleSaveFormula} />
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 border-t border-border bg-surface-2 shrink-0">
          <button onClick={onClose} className="h-10 px-5 border border-border rounded-lg bg-surface text-text-secondary text-body-sm font-semibold cursor-pointer hover:bg-surface-2 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={isSaving} aria-busy={isSaving} className={`inline-flex items-center gap-2 h-10 px-5.5 border-none rounded-lg text-body-sm font-bold text-white transition-all ${isSaving ? 'bg-text-subtle cursor-not-allowed text-text-muted' : 'bg-overlay cursor-pointer shadow-[0_4px_14px_rgba(15,23,42,0.24)] hover:bg-overlay-hover'}`}>{isSaving ? 'Saving...' : 'Save Changes'}</button>
        </div>
    </Modal>
  );
}
