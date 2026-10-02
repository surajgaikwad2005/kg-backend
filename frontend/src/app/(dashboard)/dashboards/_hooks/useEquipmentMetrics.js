import { useEffect, useMemo } from 'react';
import { useEquipmentList, useEquipmentTags } from '../_queries/useDashboardQueries';
import { useApp } from '@/src/context/AppContext';

// Doesn't depend on props/state — module scope per CLAUDE.md rule 22.
const X_AXIS_LIST = [{ id: 'time', label: 'Time', name: 'Time' }];

export function useEquipmentMetrics(selectedEquipment, dashboardId, setCustomLogicList) {
  const { plantId } = useApp();
  const plantCode = plantId?.id || 'cdm_copy';

  const equipmentQuery = useEquipmentList(plantCode, dashboardId);
  const equipmentList = useMemo(() => {
    const res = equipmentQuery.data;
    return Array.isArray(res) ? res : (res?.data || res?.equipment || []);
  }, [equipmentQuery.data]);

  const tagsQuery = useEquipmentTags(plantCode, selectedEquipment, dashboardId);
  const metricsList = useMemo(() => {
    if (!selectedEquipment) return [];
    const res = tagsQuery.data;
    const rawTags = res?.data?.tags || res?.tags || (Array.isArray(res?.data) ? res.data : []);
    return rawTags.map((t, idx) => ({
      id: t.id || t.value || `tag_${idx}`,
      label: t.label || t.id || t.value || `Tag ${idx}`,
      unit: t.unit || '',
      dataType: t.dataType || 'FLOAT',
      description: t.description || '',
    }));
  }, [selectedEquipment, tagsQuery.data]);

  // Resets any in-progress custom logic draft whenever the equipment/dashboard
  // context changes — independent of whether the tags fetch itself succeeds,
  // same as the pre-migration effect (it ran this synchronously, not inside
  // the fetch's .then()).
  useEffect(() => {
    setCustomLogicList(prev => prev.filter(p => p.id === 'attached_logic_id'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEquipment, dashboardId, setCustomLogicList]);

  return { equipmentList, xAxisList: X_AXIS_LIST, metricsList };
}
