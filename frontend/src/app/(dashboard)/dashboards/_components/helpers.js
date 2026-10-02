/**
 * helpers.js
 * Utility functions for date formatting and data transformation.
 */

export function getVisualProps(v) {
  if (!v) return { id: '', title: '', type: 'line', data: {}, equipment: 'CP-CC-0001', isLive: true, grid: null };

  const id = v.id || v.visual_id || '';
  const title = v.title || v.name || v.visual_name || v.visual_config?.title || v.saved_chart?.title || 'Untitled Visual';
  const type = (
    v.type ||
    v.chartType ||
    v.visual_type ||
    v.visual_config?.data?.type ||
    v.visual_config?.type ||
    'line'
  ).toLowerCase();
  const data = v.chartData || v.data || v.visual_config?.data || v.visual_config || v.saved_chart?.data || {};
  const equipment = v.equipment_id || v.equipment || data.equipment_id || 'CP-CC-0001';
  const isLive = v.is_live ?? v.isLive ?? true;

  return {
    id,
    title,
    type,
    chartType: type,
    data,
    chartData: data,
    equipment,
    isLive,
    grid: v.grid || null,
  };
}

export function timeAgo(iso) {
  if (!iso) return 'recently';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export function formatTime(ts, interval) {
  const d = new Date(ts);
  if (!interval || interval.endsWith('d')) return `${d.getMonth() + 1}/${d.getDate()}`;
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function dashboardMonitorUrl(ws) {
  const p = new URLSearchParams({
    id: ws.id,
    title: ws.name,
    chartType: ws.chartType || 'area',
    interval: ws.interval || '5m',
    timePreset: ws.timePreset || '9h',
  });
  if (ws.metricA) p.set('metricA', ws.metricA);
  if (ws.metricB) p.set('metricB', ws.metricB);
  return `/dashboards/monitor?${p.toString()}`;
}

export function transformChartResponse(apiResponse) {
  const chart = apiResponse?.data;
  if (!chart?.labels?.x?.values?.length) return [];
  return chart.labels.x.values.map((timestamp, index) => {
    const point = {
      label: timestamp,
    };
    chart.datasets.forEach((dataset, dsIndex) => {
      point[`series_${dsIndex}`] = dataset.data[index];
    });
    return point;
  });
}

export function prepareChartData(ws) {
  const chartPayload = ws?.chartData || ws?.data || ws;
  const timestamps = chartPayload?.labels?.x?.values || [];
  const datasets = chartPayload?.datasets || [];

  if (!timestamps.length) return [];

  return timestamps.map((timestamp, index) => {
    const formattedTime = timestamp?.includes(' ') ? timestamp.split(' ')[1] : timestamp;
    const row = { name: formattedTime, rawTimestamp: timestamp };

    datasets.forEach((dataset, idx) => {
      const seriesKey = dataset.tag || dataset.label || `series_${dataset.id || idx}`;
      const dataArray = dataset.data || dataset.values || [];
      row[seriesKey] = dataArray[index] ?? null;
    });

    return row;
  });
}

export function formatDateTime(date) {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function getTimeRange(timePreset) {
  const end = new Date();
  const start = new Date();
  switch (timePreset) {
    case '1h': start.setHours(end.getHours() - 1); break;
    case '3h': start.setHours(end.getHours() - 3); break;
    case '9h': start.setHours(end.getHours() - 9); break;
    case '24h': start.setHours(end.getHours() - 24); break;
    case '7d': start.setDate(end.getDate() - 7); break;
    case '30d': start.setDate(end.getDate() - 30); break;
    default: start.setHours(end.getHours() - 1);
  }
  return { start_time: formatDateTime(start), end_time: formatDateTime(end) };
}

export function getFieldVisibility(type) {
  const config = { showX: false, showY: false, multiY: false, showSecY: false, showValue: false, showLineTag: false, showColumnTag: false, showColumns: false };
  const lower = String(type || '').toLowerCase();
  switch (lower) {
    case 'line':
    case 'area':
      config.showX = true; config.showY = true; config.showSecY = true; break;
    case 'stacked_area':
    case 'stackedarea':
    case 'multi_line':
      config.showX = true; config.showY = true; config.multiY = true; break;
    case 'combo':
      config.showX = true; config.showLineTag = true; config.showColumnTag = true; break;
    case 'column':
    case 'bar':
    case 'threshold_line':
    case 'min_max_band':
      config.showX = true; config.showY = true; break;
    case 'kpi':
    case 'kpi_card':
    case 'gauge':
    case 'heatmap':
      config.showValue = true; break;
    case 'table':
      config.showColumns = true; break;
    default:
      config.showX = true; config.showY = true; break;
  }
  return config;
}

import { buildDashboardPayload, filterAvailableMetrics } from './payloadHelpers';
export { buildDashboardPayload, filterAvailableMetrics };

export function extractEquipmentFromTags(tags) {
  if (!tags || !tags.length) return '';
  for (const tag of tags) {
    if (typeof tag !== 'string') continue;
    const parts = tag.split('_');
    if (parts.length >= 2) {
      if (/^[A-Z0-9]+$/i.test(parts[0]) && /^[A-Z0-9]+$/i.test(parts[1])) {
        return `${parts[0]}_${parts[1]}`;
      }
    }
  }
  return '';
}
