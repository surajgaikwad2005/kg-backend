import { useMemo } from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  useVisualChartPreview,
  useRenderVisualChart,
  useCreateVisual,
} from '../../_queries/useDashboardQueries';
import { SCHEME_COLORS } from '../_components/constants';
import { formatTime } from '../_components/helpers';
import { useApp } from '@/src/context/AppContext';

export function useDashboardCreate() {
  const router = useRouter();
  const { plantId } = useApp();
  const plantCode = plantId?.id || 'cdm_copy';

  const { mutateAsync: renderVisualChartAsync } = useRenderVisualChart(plantCode);
  const { mutateAsync: createVisualAsync } = useCreateVisual(plantCode);

  // Meta
  const [title, setTitle] = useState('Untitled Dashboard');
  const [tags, setTags] = useState(['CDU', 'refinery']);
  const [saveStatus, setSaveStatus] = useState('idle');

  // Chart config
  const [chartType, setChartType] = useState('area');
  const [metricA, setMetricA] = useState('unit.CDU1.feed_rate');
  const [metricB, setMetricB] = useState('unit.CDU1.TI_101');
  const [aggregation, setAggregation] = useState(null);
  const [interval, setInterval] = useState(null);

  const [metricsList, setMetricsList] = useState([]);

  // Display
  const [scaleMode, setScaleMode] = useState('Linear');
  const [showLabels, setShowLabels] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [crosshair, setCrosshair] = useState(true);
  const [autoScale, setAutoScale] = useState(true);
  const [leftAxis, setLeftAxis] = useState(true);
  const [rightAxis, setRightAxis] = useState(true);
  const [lineThickness, setLineThickness] = useState(2.2);
  const [fillOpacity, setFillOpacity] = useState(18);
  const [colorScheme, setColorScheme] = useState(0);
  const [thresholds, setThresholds] = useState([
    { value: 500, color: '#F43F5E', label: 'Critical' },
    { value: 420, color: '#F59E0B', label: 'Warning' },
  ]);

  const colors = SCHEME_COLORS[colorScheme];

  // Read config from URL params
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const p = new URLSearchParams(window.location.search);
    const t = p.get('title'); if (t) setTitle(t);
    const ct = p.get('chartType'); if (ct) setChartType(ct);
    const ma = p.get('metricA'); if (ma) setMetricA(ma);
    const mb = p.get('metricB'); if (mb) setMetricB(mb);
    const iv = p.get('interval'); if (iv) setInterval(iv);
    const tgs = p.get('tags'); if (tgs) setTags(tgs.split(',').filter(Boolean));
  }, []);

  // Fetch available metrics on mount
  useEffect(() => {
    setMetricsList([]); // TODO: Use real endpoint for metrics if needed
  }, []);

  const previewPayload = useMemo(() => {
    if (!metricA || !interval || !aggregation) return null;
    return { metric: metricA, metric2: metricB || null, aggregation, interval };
  }, [metricA, metricB, aggregation, interval]);

  const previewQuery = useVisualChartPreview(plantCode, previewPayload, { enabled: !!previewPayload });
  const isLoadingData = previewQuery.isFetching;

  const { chartData, stats, metricALabel, metricBLabel } = useMemo(() => {
    const d = previewQuery.data;
    if (!d || !previewPayload) {
      return { chartData: [], stats: { a: null, b: null }, metricALabel: 'CDU1 Feed Rate', metricBLabel: 'CDU1 Outlet Temp' };
    }
    const merged = (d.seriesA || []).map((pt, i) => ({
      label: formatTime(pt.ts, interval),
      a: pt.value,
      b: d.seriesB?.[i]?.value ?? null,
      min_a: pt.min,
      max_a: pt.max,
    }));
    return {
      chartData: merged,
      stats: { a: d.statsA, b: d.statsB },
      metricALabel: d.labelA || 'CDU1 Feed Rate',
      metricBLabel: d.labelB || (!metricB ? '' : 'CDU1 Outlet Temp'),
    };
  }, [previewQuery.data, previewPayload, interval, metricB]);

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      const end = new Date();
      const start = new Date(end.getTime() - 9 * 60 * 60 * 1000); // 9 hours ago
      const start_time = start.toISOString().replace('T', ' ').substring(0, 19);
      const end_time = end.toISOString().replace('T', ' ').substring(0, 19);

      const payload = {
        visual_type: chartType === 'kpi' ? 'kpi_card' : chartType === 'threshold' ? 'threshold_line' : chartType,
        start_time,
        end_time,
        aggregation: aggregation || null,
        interval: interval || null,
        logic_configuration: {},
        visual_config: {
          title: title || 'Untitled Visual',
          equipment: 'Unknown',
          x_axis: 'Timestamp',
          y_axis: [metricA],
          secondary_y_axis: metricB ? [metricB] : null,
          columns: null,
          value_tag: null,
          line_tags: null,
          column_tags: null,
          tags,
          thresholds
        }
      };

      const renderResult = await renderVisualChartAsync(payload);
      if (!renderResult || (!renderResult.success && !renderResult.data)) {
        throw new Error(renderResult?.message || 'Failed to render visual data before saving');
      }

      const payloadToSave = {
        ...renderResult,
        visual_config: payload.visual_config,
        logic_configuration: payload.logic_configuration,
        time_preset: 'Custom',
        interval,
        aggregation,
      };

      const d = await createVisualAsync({ visualName: title || 'Untitled Visual', savedChart: payloadToSave });
      if (d && (d.success || d.status_code === 200 || d.statusCode === 200)) {
        setSaveStatus('saved');
        setTimeout(() => router.push('/dashboards'), 1400);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 2500);
      }
    } catch (err) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2500);
    }
  };

  return {
    router,
    title, setTitle,
    tags, setTags,
    saveStatus, setSaveStatus,
    chartType, setChartType,
    metricA, setMetricA,
    metricB, setMetricB,
    aggregation, setAggregation,
    interval, setInterval,
    chartData,
    stats,
    metricALabel,
    metricBLabel,
    metricsList, setMetricsList,
    isLoadingData,
    scaleMode, setScaleMode,
    showLabels, setShowLabels,
    showGrid, setShowGrid,
    showLegend, setShowLegend,
    crosshair, setCrosshair,
    autoScale, setAutoScale,
    leftAxis, setLeftAxis,
    rightAxis, setRightAxis,
    lineThickness, setLineThickness,
    fillOpacity, setFillOpacity,
    colorScheme, setColorScheme,
    thresholds, setThresholds,
    colors,
    handleSave,
  };
}
