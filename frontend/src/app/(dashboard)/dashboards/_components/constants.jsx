import React from 'react';

export const C = {
  inkNavy: '#0F172A',
  ink2: '#1E293B',
  accent: '#2563EB',
  blue700: '#1D4ED8',
  canvas: '#F8F9FA',
  surface: '#FFFFFF',
  surface2: '#F1F5F9',
  border: '#E2E8F0',
  border2: '#CBD5E1',
  divider: '#F1F5F9',
  slate: '#64748B',
  slate2: '#94A3B8',
  slate3: '#CBD5E1',
  success: '#10B981',
  successBg: 'rgba(16,185,129,0.12)',
  danger: '#F43F5E',
  fontSans: '"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
  fontMono: '"JetBrains Mono","SF Mono",ui-monospace,Menlo,Consolas,monospace',
};

export const SCHEME_COLORS = [
  { a: '#2563EB', b: '#10B981' },
  { a: '#6D28D9', b: '#F59E0B' },
  { a: '#0EA5E9', b: '#F43F5E' },
  { a: '#14B8A6', b: '#FB923C' },
  { a: '#0F172A', b: '#94A3B8' },
  { a: '#EC4899', b: '#8B5CF6' },
];

export const COLOR_SCHEMES = [
  'linear-gradient(135deg,#2563EB 50%,#10B981 50%)',
  'linear-gradient(135deg,#6D28D9 50%,#F59E0B 50%)',
  'linear-gradient(135deg,#0EA5E9 50%,#F43F5E 50%)',
  'linear-gradient(135deg,#14B8A6 50%,#FB923C 50%)',
  'linear-gradient(135deg,#0F172A 50%,#94A3B8 50%)',
  'linear-gradient(135deg,#EC4899 50%,#8B5CF6 50%)',
];

export const TAG_PALETTES = [
  { bg: 'rgba(37,99,235,0.10)', color: '#1D4ED8' },
  { bg: 'rgba(245,158,11,0.14)', color: '#B45309' },
  { bg: 'rgba(244,63,94,0.10)', color: '#BE123C' },
  { bg: 'rgba(16,185,129,0.14)', color: '#047857' },
  { bg: 'rgba(139,92,246,0.14)', color: '#6D28D9' },
  { bg: 'rgba(14,165,233,0.14)', color: '#0369A1' },
  { bg: 'rgba(148,163,184,0.18)', color: '#475569' },
];

export const AVATARS = [
  { initials: 'KU', bg: 'linear-gradient(135deg,#2563EB,#4F46E5)' },
  { initials: 'AB', bg: 'linear-gradient(135deg,#10B981,#0EA5E9)' },
  { initials: 'RN', bg: 'linear-gradient(135deg,#F59E0B,#EF4444)' },
  { initials: 'PR', bg: 'linear-gradient(135deg,#8B5CF6,#EC4899)' },
  { initials: 'VK', bg: 'linear-gradient(135deg,#475569,#0F172A)' },
];

export const STATUSES = [
  { label: 'Live', dotColor: '#22C55E', dotGlow: 'rgba(34,197,94,0.22)', textColor: '#047857' },
  { label: 'Live', dotColor: '#22C55E', dotGlow: 'rgba(34,197,94,0.22)', textColor: '#047857' },
  { label: 'Anomaly', dotColor: '#F59E0B', dotGlow: 'rgba(245,158,11,0.22)', textColor: '#B45309' },
  { label: 'Live', dotColor: '#22C55E', dotGlow: 'rgba(34,197,94,0.22)', textColor: '#047857' },
  { label: 'Inactive', dotColor: '#CBD5E1', dotGlow: null, textColor: '#64748B' },
];

export const DUMMY_DASHBOARDS = [
  { id: 'dash_1', name: 'CDU Operations', backendName: 'cdu_operations', tags: ['CDU1', 'feed_rate', 'outlet_temp', 'TI_101'], updatedAt: new Date(Date.now() - 15 * 60000).toISOString(), type: 'personal', chartCount: 5, chartType: 'area', metricA: 'unit.CDU1.feed_rate', metricB: 'unit.CDU1.TI_101', interval: '5m', timePreset: '9h' },
  { id: 'dash_2', name: 'Furnace Monitoring', backendName: 'furnace_monitoring', tags: ['FUR1', 'temp', 'pressure', 'flow'], updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(), type: 'shared', chartCount: 8, chartType: 'line', metricA: 'unit.FUR1.TIC_201', metricB: '', interval: '10m', timePreset: '24h' },
  { id: 'dash_3', name: 'Refinery Overview', backendName: 'refinery_overview', tags: ['REF', 'production', 'efficiency'], updatedAt: new Date(Date.now() - 86400000).toISOString(), type: 'personal', chartCount: 12, chartType: 'bar', metricA: 'unit.REF.throughput', metricB: 'unit.REF.efficiency', interval: '1h', timePreset: '7d' },
  { id: 'dash_4', name: 'Pressure Safety', backendName: 'pressure_safety', tags: ['PSV1', 'pressure', 'alarm'], updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(), type: 'shared', chartCount: 3, chartType: 'threshold_line', metricA: 'unit.PSV1.pressure', metricB: '', interval: '1m', timePreset: '1h' },
  { id: 'dash_5', name: 'Energy Consumption', backendName: 'energy_consumption', tags: ['ENG', 'power', 'steam', 'cooling'], updatedAt: new Date(Date.now() - 7 * 86400000).toISOString(), type: 'personal', chartCount: 6, chartType: 'gauge', metricA: 'unit.ENG.power', metricB: '', interval: '30m', timePreset: '7d' },
];

export const MODAL_CHART_CATEGORIES = [
  {
    label: 'Trends', types: [
      { id: 'line', label: 'Line', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M3 3v18h18" /><polyline points="7 14 11 10 14 13 21 6" /></svg> },
      { id: 'area', label: 'Area', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M3 17l5-7 4 4 5-6 4 4v6H3z" /></svg> },
      { id: 'stacked_area', label: 'Stacked Area', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M3 18l4-3 4 2 4-4 4 2" /><path d="M3 12l4-2 4 1 4-3 4 2" /></svg> },
      { id: 'combo', label: 'Combo', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><rect x="3" y="14" width="4" height="7" /><rect x="10" y="10" width="4" height="11" /><path d="M17 8l4-5" /><path d="M3 9l4-3 4 3" /></svg> },
    ]
  },
  {
    label: 'Comparison', types: [
      // { id: 'bar', label: 'Bar', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><rect x="3" y="12" width="4" height="9" /><rect x="10" y="6" width="4" height="15" /><rect x="17" y="9" width="4" height="12" /></svg> },
      { id: 'column', label: 'Column', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><rect x="4" y="9" width="4" height="12" /><rect x="10" y="4" width="4" height="17" /><rect x="16" y="7" width="4" height="14" /></svg> },
    ]
  },
  {
    label: 'KPI', types: [
      { id: 'kpi_card', label: 'KPI Card', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M7 12h10" /></svg> },
      { id: 'gauge', label: 'Gauge', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M3 12a9 9 0 0 1 18 0" /><path d="M12 12l4-3" /></svg> },
    ]
  },
  {
    label: 'Monitoring', types: [
      { id: 'table', label: 'Table', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M3 15h18M9 3v18M15 3v18" /></svg> },
    ]
  },
  {
    label: 'Advanced', types: [
      // { id: 'heatmap', label: 'Heatmap', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg> },
      { id: 'threshold_line', label: 'Threshold Line', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M3 14l4-5 4 4 4-6 4 4" /><line x1="3" y1="7" x2="21" y2="7" strokeDasharray="3 2" /></svg> },
      { id: 'min_max_band', label: 'Min-Max Band', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><path d="M3 16l4-2 4 3 4-2 4 1" /><path d="M3 8l4 2 4-2 4 2 4-2" /><line x1="3" y1="8" x2="3" y2="16" strokeWidth={1} /><line x1="21" y1="8" x2="21" y2="16" strokeWidth={1} /></svg> },
    ]
  },
];

export const PREVIEW_SERIES = [
  { key: 'series_0', label: 'Pressure' },
  { key: 'series_1', label: 'Temperature' },
  { key: 'series_2', label: 'Flow' },
];

export const PREVIEW_DUMMY_DATA = [
  { label: '00:00', series_0: 42, series_1: 28, series_2: 35 },
  { label: '02:00', series_0: 55, series_1: 35, series_2: 40 },
  { label: '04:00', series_0: 48, series_1: 42, series_2: 38 },
  { label: '06:00', series_0: 62, series_1: 38, series_2: 45 },
  { label: '08:00', series_0: 71, series_1: 45, series_2: 52 },
  { label: '10:00', series_0: 58, series_1: 52, series_2: 47 },
  { label: '12:00', series_0: 83, series_1: 41, series_2: 58 },
  { label: '14:00', series_0: 65, series_1: 60, series_2: 55 },
  { label: '16:00', series_0: 74, series_1: 55, series_2: 62 },
  { label: '18:00', series_0: 88, series_1: 48, series_2: 70 },
  { label: '20:00', series_0: 72, series_1: 63, series_2: 61 },
  { label: '22:00', series_0: 60, series_1: 44, series_2: 50 },
];

export const CHART_TYPE_TAG_SUGGESTIONS = {
  line: ['CDU1', 'CDU2', 'FUR1', 'time-series', 'trend', 'temp'],
  area: ['CDU1', 'CDU2', 'feed_rate', 'time-series', 'trend'],
  stacked_area: ['CDU1', 'CDU2', 'FUR1', 'stacked', 'comparison'],
  combo: ['CDU1', 'FUR1', 'dual-axis', 'mixed', 'ENG'],
  multi_line: ['CDU1', 'CDU2', 'FUR1', 'FUR2', 'multi', 'all-units'],
  bar: ['CDU', 'FUR', 'comparison', 'period', 'weekly'],
  column: ['CDU', 'FUR', 'comparison', 'vertical', 'monthly'],
  kpi: ['ENG', 'power', 'kpi', 'threshold', 'alarm'],
  gauge: ['REF', 'efficiency', 'health', 'gauge'],
  table: ['all', 'monitoring', 'logs', 'tabular', 'raw'],
  scatter: ['CDU1', 'CDU2', 'correlation', 'scatter', 'xy'],
  heatmap: ['ENG', 'cooling', 'density', 'heatmap', 'pattern'],
  threshold_line: ['PSV1', 'PSV2', 'threshold', 'alarm', 'critical'],
  min_max_band: ['CDU1', 'CDU2', 'variance', 'band', 'range'],
};

export const TIME_PRESETS = [
  { label: 'Last 1h', value: '1h' },
  { label: 'Last 3h', value: '3h' },
  { label: 'Last 9h', value: '9h' },
  { label: 'Last 24h', value: '24h' },
  { label: 'Last 7d', value: '7d' },
  { label: 'Last 30d', value: '30d' },
  { label: 'Custom', value: 'custom' },
];

export const AGGREGATION_TYPES = [
  { label: 'Average', value: 'avg' },
  { label: 'Sum', value: 'sum' },
  { label: 'Minimum', value: 'min' },
  { label: 'Maximum', value: 'max' },
];
