import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useVisualChartPreview } from '../../_queries/useDashboardQueries';
import { formatTime } from '../_components/helpers';
import { useApp } from '@/src/context/AppContext';

export function useDashboardMonitor() {
  const router = useRouter();
  const { plantId } = useApp();
  const plantCode = plantId?.id || 'cdm_copy';

  const [title, setTitle]           = useState('Dashboard');
  const [chartType, setChartType]   = useState('area');
  const [metricA, setMetricA]       = useState('');
  const [metricB, setMetricB]       = useState('');
  const [interval, setInterval]     = useState('5m');
  const [timePreset, setTimePreset] = useState('9h');
  const [tags, setTags]             = useState([]);

  const [metricsList, setMetricsList]     = useState([]);
  const [colorScheme, setColorScheme]     = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);

  // Read URL params on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const p = new URLSearchParams(window.location.search);
    const t = p.get('title');      if (t)  setTitle(decodeURIComponent(t));
    const ct = p.get('chartType'); if (ct) setChartType(ct);
    const ma = p.get('metricA');   if (ma) setMetricA(ma);
    const mb = p.get('metricB');   if (mb) setMetricB(mb);
    const iv = p.get('interval');  if (iv) setInterval(iv);
    const tp = p.get('timePreset'); if (tp) setTimePreset(tp);
    const tg = p.get('tags');       if (tg) setTags(tg.split(',').filter(Boolean));
  }, []);

  // Fetch available metrics
  useEffect(() => {
    setMetricsList([]); // TODO: Use real endpoint for metrics if needed
  }, []);

  const previewPayload = useMemo(() => {
    if (!metricA) return null;
    return { metric: metricA, metric2: metricB || null, aggregation: 'avg', interval };
  }, [metricA, metricB, interval]);

  const previewQuery = useVisualChartPreview(plantCode, previewPayload, { enabled: !!metricA });
  const isLoading = previewQuery.isFetching;

  const { chartData, stats, metricALabel, metricBLabel } = useMemo(() => {
    const d = previewQuery.data;
    if (!d || !previewPayload || (d.statusCode !== 200 && !d.seriesA)) {
      return { chartData: [], stats: { a: null, b: null }, metricALabel: '', metricBLabel: '' };
    }
    const seriesA = d.seriesA || [];
    const merged = seriesA.map((pt, i) => ({
      label: formatTime(pt.ts, interval),
      a: pt.value,
      b: d.seriesB?.[i]?.value ?? null,
      min_a: pt.min,
      max_a: pt.max,
    }));
    return {
      chartData: merged,
      stats: { a: d.statsA, b: d.statsB },
      metricALabel: d.labelA || '',
      metricBLabel: d.labelB || (!metricB ? '' : ''),
    };
  }, [previewQuery.data, previewPayload, interval, metricB]);

  const handleRefresh = () => {
    previewQuery.refetch();
  };

  const handleEditSave = ({ title: t, chartType: ct, metricA: ma, metricB: mb, interval: iv, timePreset: tp, tags: tg }) => {
    setTitle(t); setChartType(ct); setMetricA(ma); setMetricB(mb);
    setInterval(iv); setTimePreset(tp); setTags(tg || []);
    setShowEditModal(false);
  };

  return {
    router,
    title, setTitle,
    chartType, setChartType,
    metricA, setMetricA,
    metricB, setMetricB,
    interval, setInterval,
    timePreset, setTimePreset,
    tags, setTags,
    chartData,
    stats,
    metricALabel,
    metricBLabel,
    isLoading,
    metricsList, setMetricsList,
    colorScheme, setColorScheme,
    showEditModal, setShowEditModal,
    handleRefresh, handleEditSave,
  };
}
