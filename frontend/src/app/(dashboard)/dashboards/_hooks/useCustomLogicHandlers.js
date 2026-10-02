import {
  useCreateExpression,
  useModifyExpression,
  useDeleteExpression,
} from '../_queries/useDashboardQueries';
import { useApp } from '@/src/context/AppContext';

export function useCustomLogicHandlers({
  customLogicList,
  setCustomLogicList,
  customLogicSelected,
  setCustomLogicSelected,
  secondaryCustomLogicSelected,
  setSecondaryCustomLogicSelected,
  editingLogicId,
  setEditingLogicId,
  expressionName,
  setExpressionName,
  expressionDescription,
  setExpressionDescription,
  formula,
  setFormula,
  selectedEquipment,
  pendingMultiSelectTarget,
  setPendingMultiSelectTarget,
  setYAxisMulti,
  setValueCustomLogicSelected,
  formulaSectionRef,
  formulaInputRef,
  openConfirm,
  toastWarning,
}) {
  const { plantId } = useApp();
  const plantCode = plantId?.id || 'cdm_copy';

  const { mutateAsync: createExpressionAsync } = useCreateExpression(plantCode);
  const { mutateAsync: modifyExpressionAsync } = useModifyExpression(plantCode);
  const { mutateAsync: deleteExpressionAsync } = useDeleteExpression(plantCode);

  const handleEditCustomLogic = (id) => {
    const item = customLogicList.find(l => l.id === id);
    if (item) {
      setEditingLogicId(id);
      setExpressionName(item.label || item.name || '');
      setExpressionDescription(item.description || '');
      setFormula(item.formula || '');
      formulaSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => formulaInputRef.current?.focus(), 400);
    }
  };

  const handleDeleteCustomLogic = async (id) => {
    const ok = await openConfirm('This custom logic will be removed.', { title: 'Delete custom logic?', confirmLabel: 'Delete' });
    if (!ok) return;
    try {
      if (typeof id === 'number' || (typeof id === 'string' && id.startsWith('expressionid_'))) {
        const numericId = parseInt(String(id).replace('expressionid_', ''), 10);
        if (!isNaN(numericId)) {
          await deleteExpressionAsync(numericId);
        }
      }
    } catch (e) {
      // Best-effort backend delete — the mutation is meta.silent, and local
      // removal below proceeds regardless so an already-detached draft is
      // never stuck in the UI over a backend hiccup.
    }
    setCustomLogicList(prev => prev.filter(l => l.id !== id));
    if (customLogicSelected === id) setCustomLogicSelected('');
    if (secondaryCustomLogicSelected === id) setSecondaryCustomLogicSelected('');
    if (editingLogicId === id) { setEditingLogicId(null); setExpressionName(''); setExpressionDescription(''); setFormula(''); }
  };

  const handleSaveFormula = async (customCron, customEquipment, customIsLive) => {
    if (!expressionName || !formula) { toastWarning('Missing fields', 'Please enter a name and formula.'); return; }
    const isUpdating = !!editingLogicId;
    let backendId = editingLogicId || `CUSTOM_LOGIC_${Date.now()}`;
    const cronSchedule = customCron || '*/5 * * * *';
    const equipment = customEquipment || selectedEquipment || 'CP-CO-0001';
    const isLiveVal = customIsLive !== false;

    try {
      if (isUpdating) {
        const numericId = parseInt(String(editingLogicId).replace('expressionid_', ''), 10);
        await modifyExpressionAsync({
          expression_id: !isNaN(numericId) ? numericId : editingLogicId,
          expression_name: expressionName,
          expression: formula,
          description: expressionDescription || '',
          cron_schedule: cronSchedule,
          equipment: equipment,
          plant_code_id: plantCode,
          is_live: isLiveVal,
        });
      } else {
        const res = await createExpressionAsync({
          expression_name: expressionName,
          expression: formula,
          description: expressionDescription || '',
          created_by: 'user',
          cron_schedule: cronSchedule,
          equipment: equipment,
          plant_code_id: plantCode,
          is_live: isLiveVal,
        });
        if (res?.data?.expression_id) {
          backendId = `expressionid_${res.data.expression_id}`;
        }
      }
    } catch (err) {
      // Best-effort, same as handleDeleteCustomLogic above: the global
      // mutation-error toast (meta.errorTitle) already surfaced this — the
      // custom-logic draft still attaches locally so an in-progress visual
      // edit isn't lost over a backend hiccup.
    }

    const upd = {
      id: backendId,
      name: expressionName,
      label: expressionName,
      description: expressionDescription,
      formula,
      cron_schedule: cronSchedule,
      equipment,
      is_live: isLiveVal,
    };

    if (isUpdating) {
      setCustomLogicList(prev => prev.map(item => item.id === editingLogicId ? { ...item, ...upd } : item));
    } else {
      setCustomLogicList(prev => [...prev, upd]);
      if (pendingMultiSelectTarget === 'yAxisMulti') setYAxisMulti(prev => [...prev, backendId]);
      else if (pendingMultiSelectTarget === 'valueCustomLogicSelected') setValueCustomLogicSelected(backendId);
      else if (pendingMultiSelectTarget === 'secondaryCustomLogicSelected') setSecondaryCustomLogicSelected(backendId);
      else setCustomLogicSelected(backendId);
      setPendingMultiSelectTarget(null);
    }
    setEditingLogicId(null); setExpressionName(''); setExpressionDescription(''); setFormula('');
  };

  return { handleEditCustomLogic, handleDeleteCustomLogic, handleSaveFormula };
}

