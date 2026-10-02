import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Modal } from '@/src/components/ui/Modal';
import { useVisualChartPreview } from '../../_queries/useDashboardQueries';
import { useApp } from '@/src/context/AppContext';
import { MonitorChart } from './MonitorChart';
import { MonitorConfigPanel } from './MonitorConfigPanel';
import { formatTime } from './helpers';
import { MODAL_CHART_CATEGORIES, SCHEME_COLORS } from './constants';

export function MonitorEditModal({ config, metricsList, onClose, onSave }) {
  const { plantId } = useApp();
  const plantCode = plantId?.id || 'cdm_copy';

  const [title, setTitle]           = useState(config.title || '');
  const [chartType, setChartType]   = useState(config.chartType || 'area');
  const [metricA, setMetricA]       = useState(config.metricA || '');
  const [metricB, setMetricB]       = useState(config.metricB || '');
  const [interval, setInterval]     = useState(config.interval || '5m');
  const [timePreset, setTimePreset] = useState(config.timePreset || '9h');
  const [tags, setTags]             = useState(config.tags || []);
  const [tagInput, setTagInput]     = useState('');
  const [tagDropdownOpen, setTagDropdownOpen] = useState(false);
  const tagDropdownRef              = useRef(null);
  const [colorScheme, setColorScheme] = useState(0);
  const [showGrid, setShowGrid]     = useState(true);
  const [showLegend, setShowLegend] = useState(true);

  const colors = SCHEME_COLORS[colorScheme];

  const previewPayload = useMemo(() => {
    if (!metricA) return null;
    return { metric: metricA, metric2: metricB || null, aggregation: 'avg', interval };
  }, [metricA, metricB, interval]);

  const previewQuery = useVisualChartPreview(plantCode, previewPayload, { enabled: !!metricA });
  const isLoadingPreview = previewQuery.isFetching;

  const { previewData, previewStats, previewLabelA, previewLabelB } = useMemo(() => {
    const d = previewQuery.data;
    if (!d || (d.statusCode !== 200 && !d.seriesA)) {
      return { previewData: [], previewStats: { a: null, b: null }, previewLabelA: '', previewLabelB: '' };
    }
    const seriesA = d.seriesA || [];
    const merged = seriesA.map((pt, i) => ({ label: formatTime(pt.ts, interval), a: pt.value, b: d.seriesB?.[i]?.value ?? null }));
    return {
      previewData: merged,
      previewStats: { a: d.statsA, b: d.statsB },
      previewLabelA: d.labelA || '',
      previewLabelB: d.labelB || (!metricB ? '' : ''),
    };
  }, [previewQuery.data, interval, metricB]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const close = e => { if (tagDropdownRef.current && !tagDropdownRef.current.contains(e.target)) setTagDropdownOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const addTag = e => {
    if (e.key === 'Enter' && tagInput.trim()) { setTags(prev => [...new Set([...prev, tagInput.trim()])]); setTagInput(''); setTagDropdownOpen(false); }
  };
  const selectedChartMeta = MODAL_CHART_CATEGORIES.flatMap(c => c.types).find(t => t.id === chartType);

  const handleSave = () => {
    onSave({ title, chartType, metricA, metricB, interval, timePreset, tags });
  };

  return (
    <Modal open onClose={onClose} size="full" className="w-[92vw] max-w-325 h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-[14px_22px] border-b border-border shrink-0 bg-surface">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[10px] bg-brand-muted/20 text-brand grid place-items-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </div>
            <div>
              <div className="text-[15px] font-extrabold text-text-primary">Edit Dashboard</div>
              <div className="text-[11.5px] text-text-secondary mt-0.5">Adjust config and preview changes live</div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 grid place-items-center bg-surface-2 border-none rounded-lg text-text-secondary cursor-pointer hover:bg-surface-3 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} className="w-3.5 h-3.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Left: live chart preview */}
          <div className="flex-[0_0_57%] flex flex-col bg-canvas border-r border-border overflow-hidden">
            <div className="p-[14px_20px] border-b border-border bg-surface shrink-0">
              <input value={title} onChange={e => setTitle(e.target.value)}
                className="text-[17px] font-bold text-text-primary border-none outline-none bg-transparent w-full tracking-[-0.01em]"
                placeholder="Dashboard title..." />
              <div className="text-[11.5px] text-text-secondary mt-0.5">
                {previewLabelA || (metricA ? 'Loading…' : 'Select a metric')}
                {previewLabelB ? ` vs. ${previewLabelB}` : ''}
                {previewStats?.a && <span className="ml-1.5">· avg <b className="text-text-primary">{previewStats.a.avg}</b> · peak <b className="text-text-primary">{previewStats.a.max}</b></span>}
              </div>
            </div>
            <div className="flex-1 p-4 min-h-0 flex flex-col">
              <div className="bg-surface rounded-[14px] border border-border flex-1 p-[14px_12px] flex flex-col min-h-0">
                <div className="flex-1 min-h-0">
                  <MonitorChart data={previewData} chartType={chartType} colors={colors} isLoading={isLoadingPreview}
                    interval={interval} stats={previewStats} metricALabel={previewLabelA} metricBLabel={previewLabelB} height="100%" />
                </div>
              </div>
            </div>
            {previewStats?.a && (
              <div className="p-[10px_20px] border-t border-border bg-surface flex gap-[22px] shrink-0">
                {[['Min', previewStats.a.min?.toFixed(2)], ['Avg', previewStats.a.avg], ['Max', previewStats.a.max?.toFixed(2)], ['Count', previewStats.a.count], ['Unit', previewStats.a.unit]].map(([l, v]) => (
                  <div key={l}>
                    <div className="text-[9px] font-bold tracking-[0.10em] uppercase text-text-subtle">{l}</div>
                    <div className="text-[12.5px] font-bold text-text-primary font-mono mt-0.5">{v ?? '—'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: config panel */}
          <MonitorConfigPanel
            chartType={chartType} setChartType={setChartType}
            metricA={metricA} setMetricA={setMetricA}
            metricB={metricB} setMetricB={setMetricB}
            metricsList={metricsList}
            timePreset={timePreset} setTimePreset={setTimePreset}
            interval={interval} setInterval={setInterval}
            tags={tags} setTags={setTags}
            tagInput={tagInput} setTagInput={setTagInput}
            tagDropdownOpen={tagDropdownOpen} setTagDropdownOpen={setTagDropdownOpen}
            tagDropdownRef={tagDropdownRef} addTag={addTag}
            selectedChartMeta={selectedChartMeta}
            colorScheme={colorScheme} setColorScheme={setColorScheme}
            showGrid={showGrid} setShowGrid={setShowGrid}
            showLegend={showLegend} setShowLegend={setShowLegend}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-[12px_22px] border-t border-border bg-canvas shrink-0">
          <div className="text-xs text-text-secondary flex items-center gap-2.5">
            {metricA
              ? <span className="inline-flex items-center gap-1.5 h-[26px] px-2.5 bg-success/15 text-success rounded-full text-[10.5px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" /> {metricA}
                </span>
              : <span className="text-text-subtle text-[11.5px]">Select a metric to preview</span>}
            {selectedChartMeta && <span className="inline-flex items-center gap-1.5 h-[26px] px-2.5 bg-brand-muted/20 text-brand rounded-full text-[10.5px] font-bold">{selectedChartMeta.icon} {selectedChartMeta.label}</span>}
          </div>
          <div className="flex items-center gap-2.5">
            <button onClick={onClose} className="h-[38px] px-[18px] border border-border rounded-[9px] bg-surface text-text-primary text-[12.5px] font-semibold cursor-pointer hover:bg-surface-2 transition-colors">Cancel</button>
            <button onClick={handleSave}
              className="inline-flex items-center gap-2 h-[38px] px-5 border-none rounded-[9px] bg-text-primary text-surface text-[12.5px] font-bold cursor-pointer shadow-[0_4px_14px_rgba(15,23,42,0.22)] hover:opacity-90 transition-opacity">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-[13px] h-[13px]"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
              Save Changes
            </button>
          </div>
        </div>
    </Modal>
  );
}
