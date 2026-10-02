'use client';
import React from 'react';
import {
  LayoutTemplate, ChevronRight, GitBranch, Network, AlertTriangle,
  TrendingUp, BarChart3, Workflow, Gauge, FileSearch, MousePointer2, Type, LayoutGrid
} from 'lucide-react';

const TEMPLATE_META = {
  timeseries: { icon: <TrendingUp className="w-4 h-4" />, label: 'Time Series', desc: 'Monitor signal drift and long-term behavior', color: 'text-success bg-success/10 border-success/20' },
  correlation: { icon: <Network className="w-4 h-4" />, label: 'Correlation', desc: 'Discover relationships between multiple signals', color: 'text-chart-1 bg-chart-1/10 border-chart-1/20' },
  event_detection: { icon: <AlertTriangle className="w-4 h-4" />, label: 'Event Detection', desc: 'Identify deviations and outliers in time series', color: 'text-warning bg-warning/10 border-warning/20' },
  rca: { icon: <GitBranch className="w-4 h-4" />, label: 'RCA', desc: 'Investigate root cause of anomalies and sensor breaches', color: 'text-danger bg-danger/10 border-danger/20' },
  kpi_monitoring: { icon: <Gauge className="w-4 h-4" />, label: 'KPI Monitoring', desc: 'Monitor stability, alarms, availability, oscillation, and process health', color: 'text-brand bg-brand/10 border-brand/20' },
  trend_analysis: { icon: <LayoutGrid className="w-4 h-4" />, label: 'Trend Analysis', desc: 'Monitor signal drift, process behavioral segments, and timeline history', color: 'text-text-primary bg-surface-2 border-border' },
  multi_chart_visualization: { icon: <BarChart3 className="w-4 h-4" />, label: 'Multi Chart', desc: 'Visualize scatter, histogram, and bar charts', color: 'text-chart-2 bg-chart-2/10 border-chart-2/20' },
  multi_chart: { icon: <BarChart3 className="w-4 h-4" />, label: 'Multi Chart', desc: 'Visualize scatter, histogram, and bar charts', color: 'text-chart-2 bg-chart-2/10 border-chart-2/20' },
  anomaly: { icon: <AlertTriangle className="w-4 h-4" />, label: 'Event Detection', desc: 'Identify deviations and outliers in time series', color: 'text-warning bg-warning/10 border-warning/20' },
  trend: { icon: <TrendingUp className="w-4 h-4" />, label: 'Time Series', desc: 'Monitor signal drift and long-term behavior', color: 'text-success bg-success/10 border-success/20' },
  comparison: { icon: <BarChart3 className="w-4 h-4" />, label: 'Data Comparison', desc: 'Compare multiple parameters side by side', color: 'text-brand bg-brand/10 border-brand/20' },
  workflow: { icon: <Workflow className="w-4 h-4" />, label: 'Process Flow', desc: 'Map equipment flow and process dependencies', color: 'text-chart-3 bg-chart-3/10 border-chart-3/20' },
  threshold: { icon: <Gauge className="w-4 h-4" />, label: 'Threshold Analysis', desc: 'Evaluate parameters against operational limits', color: 'text-chart-4 bg-chart-4/10 border-chart-4/20' },
  report: { icon: <FileSearch className="w-4 h-4" />, label: 'Investigation Report', desc: 'Document findings and recommendations', color: 'text-text-secondary bg-surface-2 border-border' },
};

// const DEFAULT_TEMPLATES = [
//   { id: 'timeserie',                clickId: 'timeseries' },
//   { id: 'correlation',               clickId: 'correlation' },
//   { id: 'event_detection',           clickId: 'event_detection' },
//   { id: 'rca',                       clickId: 'rca' },
//   { id: 'multi_chart_visualization', clickId: 'multi_chart' },
//   { id: 'kpi_monitoring',            clickId: 'kpi_monitoring' },
//   { id: 'trend_analysis',            clickId: 'trend_analysis' },
// ];

function buildTemplates(supportedFeatures) {
  if (!supportedFeatures || supportedFeatures.length === 0) return [];

  const list = supportedFeatures.map(feat => {
    const featId = typeof feat === 'string' ? feat : (feat.id || feat.name || '');
    return { id: featId, clickId: featId };
  });

  if (!list.some(t => t.id === 'timeseries')) list.unshift({ id: 'timeseries', clickId: 'timeseries' });
  if (!list.some(t => t.id === 'trend_analysis')) list.push({ id: 'trend_analysis', clickId: 'trend_analysis' });
  return list;
}

export function TemplatesSidebar({ isOpen, onToggle, onTemplateClick, supportedFeatures }) {
  const templates = buildTemplates(supportedFeatures);

  return (
    <div
      className="h-full bg-surface border-r border-border flex flex-col shrink-0 overflow-hidden transition-all duration-300 ease-in-out z-10"
      style={{ width: isOpen ? 260 : 48 }}
    >
      {/* Header toggle */}
      <div className="p-2 border-b border-border shrink-0">
        <button
          onClick={onToggle}
          className="w-full p-2 rounded-lg bg-text-primary text-white flex items-center gap-2 hover:bg-text-primary hover:opacity-90 transition-colors"
        >
          <LayoutTemplate className="w-4 h-4 shrink-0" />
          {isOpen && <span className="text-[11px] font-bold tracking-wide">TEMPLATES</span>}
          <ChevronRight className={`w-3.5 h-3.5 ml-auto shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Template list */}
      <div className="flex-1 overflow-y-auto p-1.5 flex flex-col gap-1">
        {templates.map(tmpl => {
          const meta = TEMPLATE_META[tmpl.id] || { icon: <LayoutTemplate className="w-4 h-4" />, label: tmpl.id, desc: '', color: 'text-text-secondary bg-surface-2 border-border' };
          return (
            <button
              key={tmpl.id}
              onClick={() => onTemplateClick(tmpl.clickId || tmpl.id)}
              title={meta.label}
              className={`flex items-center gap-3 p-2 rounded-lg border transition-all duration-150 hover:shadow-sm ${meta.color} cursor-pointer text-left`}
            >
              <div className="shrink-0">{meta.icon}</div>
              {isOpen && (
                <div className="min-w-0">
                  <div className="text-[12px] font-bold leading-tight truncate">{meta.label}</div>
                  <div className="text-[10px] opacity-60 leading-tight mt-0.5 line-clamp-2">{meta.desc}</div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer tools */}
      <div className="p-1.5 border-t border-border shrink-0 flex flex-col gap-1">
        <button className="p-2 rounded-lg text-text-secondary hover:bg-surface-2 hover:text-text-primary flex items-center gap-2 transition-colors" title="Pointer">
          <MousePointer2 className="w-4 h-4 shrink-0" />
          {isOpen && <span className="text-[11px] font-bold">Pointer</span>}
        </button>
        <button className="p-2 rounded-lg text-text-secondary hover:bg-surface-2 hover:text-text-primary flex items-center gap-2 transition-colors" title="Add Text">
          <Type className="w-4 h-4 shrink-0" />
          {isOpen && <span className="text-[11px] font-bold">Add Text</span>}
        </button>
      </div>
    </div>
  );
}
