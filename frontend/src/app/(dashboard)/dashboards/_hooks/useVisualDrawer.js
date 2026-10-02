'use client';

import { useState, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/src/components/ui/Toast';
import { useConfirm } from '@/src/components/ui/ConfirmModal';
import { queryKeys } from '@/src/lib/query';
import {
  useRenderVisualChart,
  useCreateVisual,
  useEditVisual,
  useDeleteVisual,
} from '../_queries/useDashboardQueries';
import { resolveAndCompactLayout } from './useDashboardLayout';
import { getVisualProps } from '../_components/helpers';

export function useVisualDrawer({
  plantCode,
  activeGroupId,
  activeGroup,
  editMode,
  tempVisuals,
  setTempVisuals,
}) {
  const toast = useToast();
  const { openConfirm } = useConfirm();
  const queryClient = useQueryClient();

  const { mutateAsync: renderVisualChartAsync } = useRenderVisualChart(plantCode);
  const { mutateAsync: createVisualAsync } = useCreateVisual(plantCode);
  const { mutateAsync: editVisualAsync } = useEditVisual(plantCode);
  const { mutateAsync: deleteVisualAsync } = useDeleteVisual(plantCode);

  const [isVisualDrawerOpen, setIsVisualDrawerOpen] = useState(false);
  const [editingVisualId, setEditingVisualId] = useState(null);
  const [editingVisual, setEditingVisual] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [drawerTitle, setDrawerTitle] = useState('');
  const [drawerVisualType, setDrawerVisualType] = useState('line');
  const [drawerMetricIndex, setDrawerMetricIndex] = useState(0);
  const [drawerAggregation, setDrawerAggregation] = useState('avg');
  const isTitleAutoFilled = useRef(true);
  const formInstanceRef = useRef(null);

  // Writes the resolved visuals array straight into the `dashboard.detail`
  // cache entry — the query IS the canonical "current visuals for this
  // dashboard" now, same role the old `dashboardGroups` array played. Also
  // invalidated by the mutation hooks themselves (see _queries), so a
  // background refetch reconciles with the server shortly after.
  const writeVisuals = useCallback((visuals) => {
    queryClient.setQueryData(
      queryKeys.dashboard.detail(plantCode, activeGroupId),
      (prev) => (prev ? { ...prev, visuals } : prev),
    );
  }, [queryClient, plantCode, activeGroupId]);

  const handleFormInstance = (inst) => {
    formInstanceRef.current = inst;
  };

  const handleMetricChange = (idxStr) => {
    const idx = parseInt(idxStr, 10);
    setDrawerMetricIndex(idx);
  };

  const openAddVisualDrawer = () => {
    setEditingVisualId(null);
    setEditingVisual(null);
    setDrawerTitle('');
    setDrawerVisualType('line');
    setDrawerMetricIndex(0);
    setDrawerAggregation('avg');
    isTitleAutoFilled.current = true;
    setIsVisualDrawerOpen(true);
  };

  const openEditVisualDrawer = (visual) => {
    setEditingVisualId(visual.id);
    setEditingVisual(visual);
    setDrawerTitle(visual.title || visual.name || visual.visual_name || '');
    setDrawerVisualType(visual.type || visual.chartType || visual.visual_type || 'line');
    setDrawerMetricIndex(visual.metricIndex || 0);
    setDrawerAggregation(visual.aggregation || 'avg');
    isTitleAutoFilled.current = false;
    setIsVisualDrawerOpen(true);
  };

  const handleSaveVisual = async () => {
    const name = drawerTitle.trim() || 'New Visual';
    if (!activeGroup) return;

    setIsSubmitting(true);

    try {
      const formInst = formInstanceRef.current;
      const backendPayload = formInst ? formInst.buildBackendPayload() : null;

      // Construct dynamic payload passing all form values or null for empty tag selections
      const createPayload = backendPayload ? {
        ...backendPayload,
        dashboard_id: activeGroupId,
      } : {
        visual_type: drawerVisualType,
        start_time: '2024-01-01 00:00:00',
        end_time: '2024-01-01 23:59:59',
        aggregation: drawerAggregation || null,
        interval: null,
        visual_config: {
          title: name,
          x_axis: null,
          y_axis: null,
          secondary_y_axis: null,
          value_tag: null,
          line_tags: null,
          column_tags: null,
          columns: null,
        },
        logic_configuration: {},
        dashboard_id: activeGroupId,
      };

      const equipmentId = backendPayload?.equipment_id || backendPayload?.plant_code_id || '';

      if (editingVisualId) {
        const chartRes = await renderVisualChartAsync(createPayload);
        const chartData = chartRes?.data || chartRes;

        await editVisualAsync({
          visualId: editingVisualId,
          visualName: drawerVisualType || name,
          visualConfigPayload: createPayload,
          dashboardId: activeGroupId,
        });

        const updatedVisuals = (editMode ? tempVisuals : (activeGroup.visuals || [])).map((v) => {
          if (v.id === editingVisualId) {
            return {
              ...v,
              title: name,
              type: drawerVisualType,
              metricIndex: drawerMetricIndex,
              aggregation: drawerAggregation,
              equipment_id: equipmentId || v.equipment_id || '',
              chartData,
              data: chartData,
            };
          }
          return v;
        });

        if (editMode) {
          setTempVisuals(updatedVisuals);
        } else {
          writeVisuals(updatedVisuals);
        }
        toast.success(`Visual "${name}" updated`);
      } else {
        const chartRes = await renderVisualChartAsync(createPayload);
        const chartData = chartRes?.data || chartRes;

        const saveRes = await createVisualAsync({ visualName: name, savedChart: chartRes, dashboardId: activeGroupId });
        const visualId = saveRes?.data?.visual_id || `v_${Date.now()}`;

        const targetVisuals = editMode ? tempVisuals : (activeGroup.visuals || []);

        const newVis = {
          id: visualId,
          title: name,
          type: drawerVisualType,
          metricIndex: drawerMetricIndex,
          aggregation: drawerAggregation,
          equipment_id: equipmentId || '',
          chartData,
          data: chartData,
          grid: {
            colStart: 1,
            colSpan: ['table', 'heatmap'].includes(drawerVisualType) ? 12 : 6,
            rowStart: 1,
            rowSpan: drawerVisualType === 'heatmap' ? 3 : 2,
          },
        };

        const prependedVisuals = [newVis, ...targetVisuals];
        const compacted = resolveAndCompactLayout(prependedVisuals, newVis.id);

        if (editMode) {
          setTempVisuals(compacted);
        } else {
          writeVisuals(compacted);
        }
        toast.success(`Visual "${name}" created successfully`);
      }
      setIsVisualDrawerOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save visual');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVisual = (visualId) => {
    openConfirm({
      title: 'Delete Visual Card?',
      message: 'Are you sure you want to delete this visual card from the dashboard?',
      onConfirm: async () => {
        try {
          await deleteVisualAsync({ visualId, dashboardId: activeGroupId });
        } catch (e) {
          // ignore API error to allow local deletion
        }

        const target = editMode ? tempVisuals : (activeGroup?.visuals || []);
        const filtered = target.filter(v => getVisualProps(v).id !== visualId);
        const compacted = resolveAndCompactLayout(filtered, null);

        if (editMode) {
          setTempVisuals(compacted);
        } else {
          writeVisuals(compacted);
        }
        toast.success('Visual removed');
      }
    });
  };

  return {
    isVisualDrawerOpen,
    setIsVisualDrawerOpen,
    editingVisualId,
    editingVisual,
    isSubmitting,
    drawerTitle,
    setDrawerTitle,
    drawerVisualType,
    setDrawerVisualType,
    drawerMetricIndex,
    setDrawerMetricIndex,
    drawerAggregation,
    setDrawerAggregation,
    isTitleAutoFilled,
    handleFormInstance,
    handleMetricChange,
    openAddVisualDrawer,
    openEditVisualDrawer,
    handleSaveVisual,
    handleDeleteVisual,
  };
}
