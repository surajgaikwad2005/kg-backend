export const CHART_TYPES = [
  { id: 'line', label: 'Line', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}><path d="M3 3v18h18" /><polyline points="7 14 11 10 14 13 21 6" /></svg> },
  { id: 'bar', label: 'Bar', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}><rect x="3" y="12" width="4" height="9" /><rect x="10" y="6" width="4" height="15" /><rect x="17" y="9" width="4" height="12" /></svg> },
  { id: 'area', label: 'Area', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}><path d="M3 17l5-7 4 4 5-6 4 4v6H3z" /></svg> },
  { id: 'table', label: 'Table', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M3 15h18M9 3v18M15 3v18" /></svg> },
  { id: 'gauge', label: 'Gauge', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}><path d="M3 12a9 9 0 0 1 18 0" /><path d="M12 12l4-3" /></svg> },
  { id: 'kpi', label: 'KPI Card', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M7 12h10" /></svg> },
  { id: 'heatmap', label: 'Heatmap', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg> },
  { id: 'threshold', label: 'Threshold', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}><path d="M12 2 2 22h20L12 2z" /><path d="M12 9v5M12 17h.01" /></svg> },
  { id: 'scatter', label: 'Scatter', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 13, height: 13 }}><circle cx="7" cy="17" r="1.5" /><circle cx="12" cy="11" r="1.5" /><circle cx="17" cy="14" r="1.5" /><circle cx="10" cy="6" r="1.5" /><circle cx="19" cy="7" r="1.5" /><circle cx="5" cy="10" r="1.5" /></svg> },
  { id: 'kpigrid', label: 'KPI Grid', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}><rect x="3" y="4" width="8" height="6" rx="1" /><rect x="13" y="4" width="8" height="6" rx="1" /><rect x="3" y="14" width="8" height="6" rx="1" /><rect x="13" y="14" width="8" height="6" rx="1" /></svg> },
];

export const COLOR_SCHEMES = [
  'linear-gradient(135deg,#2563EB 50%,#10B981 50%)',
  'linear-gradient(135deg,#6D28D9 50%,#F59E0B 50%)',
  'linear-gradient(135deg,#0EA5E9 50%,#F43F5E 50%)',
  'linear-gradient(135deg,#14B8A6 50%,#FB923C 50%)',
  'linear-gradient(135deg,#0F172A 50%,#94A3B8 50%)',
  'linear-gradient(135deg,#EC4899 50%,#8B5CF6 50%)',
];

export const SCHEME_COLORS = [
  { a: '#2563EB', b: '#10B981' },
  { a: '#6D28D9', b: '#F59E0B' },
  { a: '#0EA5E9', b: '#F43F5E' },
  { a: '#14B8A6', b: '#FB923C' },
  { a: '#0F172A', b: '#94A3B8' },
  { a: '#EC4899', b: '#8B5CF6' },
];
