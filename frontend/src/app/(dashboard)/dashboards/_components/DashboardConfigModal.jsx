import React, { useState } from 'react';
import { Modal } from '@/src/components/ui/Modal';
import { useToast } from '@/src/components/ui/Toast';
import { MODAL_CHART_CATEGORIES, TIME_PRESETS } from './constants';
import PreviewChart from './preview/PreviewChart';
import VisualTypeSelector from './form/VisualTypeSelector';
import EquipmentSelector from './form/EquipmentSelector';
import DataSourceConfigurator from './form/DataSourceConfigurator';
import TimePresetSelector from './form/TimePresetSelector';
import BucketIntervalSelector from './form/BucketIntervalSelector';
import AggregationSelector from './form/AggregationSelector';
import FormulaBuilder from './form/FormulaBuilder';
import { useRenderVisualChart, useCreateVisual } from '../_queries/useDashboardQueries';
import { useDashboardModalForm } from '../_hooks/useDashboardModalForm';
import { useApp } from '@/src/context/AppContext';

export default function DashboardConfigModal({ onClose, onCreateDashboard }) {
  const { error: toastError } = useToast();
  const { plantId } = useApp();
  const plantCode = plantId?.id || 'cdm_copy';
  const [isCreating, setIsCreating] = useState(false);

  const { mutateAsync: renderVisualChartAsync } = useRenderVisualChart(plantCode);
  const { mutateAsync: createVisualAsync } = useCreateVisual(plantCode);

  const f = useDashboardModalForm({ initialValues: {}, modalChartCategories: MODAL_CHART_CATEGORIES });

  const handleCreate = async () => {
    if (!f.isFormValid) return;
    setIsCreating(true);
    try {
      const bp = f.buildBackendPayload();
      const renderResult = await renderVisualChartAsync(bp);
      if (!renderResult || (!renderResult.success && !renderResult.data)) throw new Error(renderResult?.message || 'Failed to render visual data before saving');

      const savedChartPayload = {
        ...renderResult,

        visual_config: bp.visual_config,
        logic_configuration: bp.logic_configuration,
        time_preset: f.timePreset,
        interval: f.interval,
        aggregation: f.aggregation,

      };

      const saveResult = await createVisualAsync({ visualName: f.mTitle || 'Untitled Visual', savedChart: savedChartPayload, dashboardId: bp.dashboard_id });
      const visualId = saveResult?.visual_id || saveResult?.id || `vis_${Date.now()}`;
      const savedVisual = saveResult?.workspace?.visuals?.find(v => v.visual_id === visualId) || saveResult || {};
      if (onCreateDashboard) onCreateDashboard({
        id: visualId,
        name: savedVisual.visual_name || f.mTitle || 'Untitled Visual',
        equipment: f.selectedEquipment || 'Unknown System',
        chartType: f.chartType,
        timePreset: f.timePreset,
        time_preset: f.timePreset,
        isLive: f.isLive,
        is_live: f.isLive,
        start_time: savedChartPayload.start_time || f.customStart,
        end_time: savedChartPayload.end_time || f.customEnd,
        interval: f.interval,
        aggregation: f.aggregation,
        tags: [],
        updatedAt: savedVisual.created_at || new Date().toISOString(),
        chartData: savedChartPayload.data || {},
        visual_config: savedChartPayload.visual_config || {},
        logic_configuration: savedChartPayload.logic_configuration || {}
      });
    } catch (error) { toastError('Failed to save visual', error.message || 'An unexpected error occurred.'); }
    finally { setIsCreating(false); onClose(); }
  };

  return (
    <Modal open onClose={onClose} size="full" className="max-w-340 h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0 bg-surface">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-muted text-brand grid place-items-center shrink-0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4.5 h-4.5"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
            </div>
            <div>
              <div id="dashboard-config-modal-title" className="text-title font-extrabold text-text-primary tracking-tight">New Visual</div>
              <div className="text-xs text-text-muted mt-0.5">Choose chart type, metrics, and time window</div>
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
                  <div className="h-full flex flex-col items-center justify-center gap-3 text-text-muted"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-9 h-9 opacity-40"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /></svg><span className="text-xs text-center max-w-40 leading-relaxed">Pick a chart type on the right to see a preview</span></div>
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
              <label className="block text-label font-bold text-text-muted tracking-[0.12em] uppercase mb-2">Visual Name <span className="text-danger">*</span></label>
              <input value={f.mTitle} onChange={e => f.setMTitle(e.target.value)} placeholder="e.g. CDU Operations Monitor" className="w-full h-11.5 px-4 border-[1.5px] border-border rounded-xl text-base font-semibold text-text-primary bg-surface-2 outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/10 transition-all" />
            </div>
            <VisualTypeSelector chartType={f.chartType} setChartType={f.setChartType} setChartTypeSelected={f.setChartTypeSelected} equipmentSectionRef={f.equipmentSectionRef} equipmentInputRef={f.equipmentInputRef} modalChartCategories={MODAL_CHART_CATEGORIES} />
            {f.chartType && (
              <>
                <EquipmentSelector ref={f.equipmentInputRef} selectedEquipment={f.selectedEquipment} setSelectedEquipment={f.setSelectedEquipment} equipmentList={f.equipmentList} />
                <DataSourceConfigurator visibility={f.visibility} xAxisSelected={f.xAxisSelected} setXAxisSelected={f.setXAxisSelected} xAxisList={f.xAxisList} yAxisMode={f.yAxisMode} setYAxisMode={f.setYAxisMode} yAxisSelected={f.yAxisSelected} setYAxisSelected={f.setYAxisSelected} yAxisMulti={f.yAxisMulti} setYAxisMulti={f.setYAxisMulti} customLogicSelected={f.customLogicSelected} setCustomLogicSelected={f.setCustomLogicSelected} customLogicOptions={f.customLogicOptions} secondaryYAxisMode={f.secondaryYAxisMode} setSecondaryYAxisMode={f.setSecondaryYAxisMode} secondaryYAxisSelected={f.secondaryYAxisSelected} setSecondaryYAxisSelected={f.setSecondaryYAxisSelected} secondaryCustomLogicSelected={f.secondaryCustomLogicSelected} setSecondaryCustomLogicSelected={f.setSecondaryCustomLogicSelected} lineTag={f.lineTag} setLineTag={f.setLineTag} columnTag={f.columnTag} setColumnTag={f.setColumnTag} valueTag={f.valueTag} setValueTag={f.setValueTag} valueTagMode={f.valueTagMode} setValueTagMode={f.setValueTagMode} valueCustomLogicSelected={f.valueCustomLogicSelected} setValueCustomLogicSelected={f.setValueCustomLogicSelected} columnsMulti={f.columnsMulti} setColumnsMulti={f.setColumnsMulti} getAvailableMetricsFor={f.getAvailableMetricsFor} formulaSectionRef={f.formulaSectionRef} formulaInputRef={f.formulaInputRef} setFormula={f.setFormula} setEditingLogicId={f.setEditingLogicId} setExpressionName={f.setExpressionName} setExpressionDescription={f.setExpressionDescription} onEditCustomLogic={f.handleEditCustomLogic} onDeleteCustomLogic={f.handleDeleteCustomLogic} setPendingMultiSelectTarget={f.setPendingMultiSelectTarget} />
                <TimePresetSelector timePreset={f.timePreset} setTimePreset={f.setTimePreset} customStart={f.customStart} setCustomStart={f.setCustomStart} customEnd={f.customEnd} setCustomEnd={f.setCustomEnd} timePresets={TIME_PRESETS} isLive={f.isLive} setIsLive={f.setIsLive} />
                {f.chartType && !['table', 'heatmap'].includes(f.chartType) && f.chartTypeSelected !== 'KPI' && <BucketIntervalSelector interval={f.interval} setInterval={f.setInterval} timePreset={f.timePreset} customStart={f.customStart} customEnd={f.customEnd} />}
                {f.chartType && f.chartType !== 'table' && <AggregationSelector aggregation={f.aggregation} setAggregation={f.setAggregation} />}
                {((f.visibility.showY && (!f.visibility.multiY || f.yAxisMode === 'custom')) || (f.visibility.showValue && f.valueTagMode === 'custom')) && (
                  <FormulaBuilder formulaSectionRef={f.formulaSectionRef} formulaInputRef={f.formulaInputRef} editingLogicId={f.editingLogicId} expressionName={f.expressionName} setExpressionName={f.setExpressionName} expressionDescription={f.expressionDescription} setExpressionDescription={f.setExpressionDescription} formula={f.formula} setFormula={f.setFormula} availableTags={f.metricsList} onSaveFormula={f.handleSaveFormula} />
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-3.5 border-t border-border bg-surface-2 shrink-0">
          <div className="flex items-center gap-2.5 text-xs text-text-muted">
            {f.xAxisSelected ? <span className="inline-flex items-center gap-1.5 h-7 px-2.5 bg-success/10 text-success rounded-full text-caption font-bold"><span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />{f.xAxisSelected}</span> : <span className="text-[11.5px] text-text-muted">Select required metrics to continue</span>}
            {f.selectedChartMeta && <span className="inline-flex items-center gap-1.5 h-7 px-2.5 bg-brand-muted text-brand rounded-full text-caption font-bold">{f.selectedChartMeta.icon} {f.selectedChartMeta.label}</span>}
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button onClick={onClose} className="h-10 px-5 border border-border rounded-lg bg-surface text-text-secondary text-body-sm font-semibold cursor-pointer hover:bg-surface-2 transition-colors">Cancel</button>
            <button onClick={handleCreate} disabled={isCreating || !f.isFormValid} aria-busy={isCreating} className={`inline-flex items-center gap-2 h-10 px-5.5 border-none rounded-lg text-body-sm font-bold text-white transition-all ${isCreating || !f.isFormValid ? 'bg-text-subtle cursor-not-allowed text-text-muted' : 'bg-overlay cursor-pointer shadow-[0_4px_14px_rgba(15,23,42,0.24)] hover:bg-overlay-hover'}`}>Create Visual</button>
          </div>
        </div>
    </Modal>
  );
}
