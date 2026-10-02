import React from 'react';

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

export const TIME_PRESETS = ['1h', '3h', '9h', '24h', '7d', '30d'];

export const MODAL_CHART_CATEGORIES = [
  { label: 'Trends', types: [
    { id: 'line',         label: 'Line',         icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{width:13,height:13}}><path d="M3 3v18h18"/><polyline points="7 14 11 10 14 13 21 6"/></svg> },
    { id: 'area',         label: 'Area',         icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{width:13,height:13}}><path d="M3 17l5-7 4 4 5-6 4 4v6H3z"/></svg> },
    { id: 'stacked_area', label: 'Stacked Area', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{width:13,height:13}}><path d="M3 18l4-3 4 2 4-4 4 2"/><path d="M3 12l4-2 4 1 4-3 4 2"/></svg> },
    { id: 'combo',        label: 'Combo',        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{width:13,height:13}}><rect x="3" y="14" width="4" height="7"/><rect x="10" y="10" width="4" height="11"/><path d="M3 9l4-3 4 3"/></svg> },
    { id: 'multi_line',   label: 'Multi Line',   icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{width:13,height:13}}><path d="M3 6l18-3"/><path d="M3 12l18-1"/><path d="M3 18l18 2"/></svg> },
  ]},
  { label: 'Comparison', types: [
    { id: 'bar',    label: 'Bar',    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{width:13,height:13}}><rect x="3" y="12" width="4" height="9"/><rect x="10" y="6" width="4" height="15"/><rect x="17" y="9" width="4" height="12"/></svg> },
    { id: 'column', label: 'Column', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{width:13,height:13}}><rect x="4" y="9" width="4" height="12"/><rect x="10" y="4" width="4" height="17"/><rect x="16" y="7" width="4" height="14"/></svg> },
  ]},
  { label: 'KPI', types: [
    { id: 'kpi', label: 'KPI Card', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{width:13,height:13}}><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 12h10"/></svg> },
    { id: 'gauge',    label: 'Gauge',    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{width:13,height:13}}><path d="M3 12a9 9 0 0 1 18 0"/><path d="M12 12l4-3"/></svg> },
  ]},
  { label: 'Monitoring', types: [
    { id: 'table', label: 'Table', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{width:13,height:13}}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg> },
  ]},
  { label: 'Relationships', types: [
    { id: 'scatter', label: 'Scatter', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{width:13,height:13}}><circle cx="7" cy="17" r="1.5"/><circle cx="12" cy="11" r="1.5"/><circle cx="17" cy="14" r="1.5"/><circle cx="10" cy="6" r="1.5"/><circle cx="19" cy="7" r="1.5"/></svg> },
  ]},
  { label: 'Advanced', types: [
    { id: 'heatmap',        label: 'Heatmap',        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{width:13,height:13}}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
    { id: 'threshold_line', label: 'Threshold Line', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{width:13,height:13}}><path d="M3 14l4-5 4 4 4-6 4 4"/><line x1="3" y1="7" x2="21" y2="7" strokeDasharray="3 2"/></svg> },
    { id: 'min_max_band',   label: 'Min/Max Band',   icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{width:13,height:13}}><path d="M3 16l4-2 4 3 4-2 4 1"/><path d="M3 8l4 2 4-2 4 2 4-2"/></svg> },
  ]},
];

export const CHART_TYPE_TAG_SUGGESTIONS = {
  line:['CDU1','CDU2','FUR1','time-series','trend','temp'], area:['CDU1','CDU2','feed_rate','time-series','trend'],
  stacked_area:['CDU1','CDU2','FUR1','stacked','comparison'], combo:['CDU1','FUR1','dual-axis','mixed','ENG'],
  multi_line:['CDU1','CDU2','FUR1','FUR2','multi','all-units'], bar:['CDU','FUR','comparison','period','weekly'],
  column:['CDU','FUR','comparison','vertical','monthly'], kpi:['ENG','power','kpi','threshold','alarm'],
  gauge:['REF','efficiency','health','gauge'], table:['all','monitoring','logs','tabular','raw'],
  scatter:['CDU1','CDU2','correlation','scatter','xy'], heatmap:['ENG','cooling','density','heatmap','pattern'],
  threshold_line:['PSV1','PSV2','threshold','alarm','critical'], min_max_band:['CDU1','CDU2','variance','band','range'],
};
