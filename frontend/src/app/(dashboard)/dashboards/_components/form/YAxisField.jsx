import React from 'react';
import ModalMetricInput from '../ModalMetricInput';
import CustomLogicMetricInput from '../CustomLogicMetricInput';
import MultiSelectField from '../MultiSelectField';

const MODE_BTN = (active) =>
  `px-2 py-0.5 text-[9px] font-bold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
    active
      ? 'bg-surface text-text-primary shadow-sm'
      : 'text-text-muted hover:text-text-primary'
  }`;

export default function YAxisField({
  visibility,
  yAxisMode,
  setYAxisMode,
  yAxisSelected,
  setYAxisSelected,
  yAxisMulti,
  setYAxisMulti,
  customLogicSelected,
  setCustomLogicSelected,
  customLogicOptions,
  getAvailableMetricsFor,
  formulaSectionRef,
  formulaInputRef,
  setEditingLogicId,
  setExpressionName,
  setExpressionDescription,
  setFormula,
  setPendingMultiSelectTarget,
  onEditCustomLogic,
  onDeleteCustomLogic,
}) {
  const handleCreateNew = (target) => {
    if (setEditingLogicId) setEditingLogicId(null);
    if (setExpressionName) setExpressionName('');
    if (setExpressionDescription) setExpressionDescription('');
    if (setFormula) setFormula('');
    if (setPendingMultiSelectTarget) setPendingMultiSelectTarget(target);
    formulaSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => formulaInputRef.current?.focus(), 400);
  };

  if (!visibility.showY) return null;

  const modeToggle = (
    <div className="flex bg-surface-2 p-0.5 rounded-lg border border-border">
      <button onClick={() => setYAxisMode('default')} className={MODE_BTN(yAxisMode === 'default')}>Default</button>
      <button onClick={() => setYAxisMode('custom')} className={MODE_BTN(yAxisMode === 'custom')}>Custom</button>
    </div>
  );

  if (!visibility.multiY) {
    return (
      <div className="col-span-1">
        <div className="flex items-center justify-between gap-1 mb-1.5 min-w-0">
          <div className="text-[11px] font-semibold text-text-secondary flex items-center gap-1 whitespace-nowrap shrink-0">
            Y-axis <span className="text-[9px] text-danger font-bold">required</span>
          </div>
          {modeToggle}
        </div>
        {yAxisMode === 'default' ? (
          <ModalMetricInput
            value={yAxisSelected}
            onChange={setYAxisSelected}
            metricsList={getAvailableMetricsFor('yAxis')}
            placeholder="Select standard Y-axis"
          />
        ) : (
          <CustomLogicMetricInput
            value={customLogicSelected}
            onChange={(val) => {
              if (val === 'CREATE_NEW') {
                setCustomLogicSelected('');
                handleCreateNew('customLogicSelected');
              } else {
                setCustomLogicSelected(val);
              }
            }}
            metricsList={customLogicOptions}
            placeholder="Search custom formula..."
            idKey="id"
            labelKey="label"
            onEdit={onEditCustomLogic}
            onDelete={onDeleteCustomLogic}
          />
        )}
      </div>
    );
  }

  return (
    <div className="col-span-2">
      <div className="flex items-center justify-between gap-1 mb-1.5 min-w-0">
        <div className="text-[11px] font-semibold text-text-secondary flex items-center gap-1 whitespace-nowrap shrink-0">
          Y-axis <span className="text-[9px] text-brand font-bold">multiple</span>
        </div>
        {modeToggle}
      </div>
      {yAxisMode === 'default' ? (
        <MultiSelectField
          label=""
          items={yAxisMulti}
          setItems={setYAxisMulti}
          list={getAvailableMetricsFor('yAxisMulti')}
          placeholder="Add standard Y-axis metric..."
        />
      ) : (
        <MultiSelectField
          label=""
          items={yAxisMulti}
          setItems={(newItems) => {
            if (newItems.includes('CREATE_NEW')) {
              handleCreateNew('yAxisMulti');
            } else {
              setYAxisMulti(newItems);
            }
          }}
          list={[
            { id: 'CREATE_NEW', label: 'Create New Custom Logic...' },
            ...customLogicOptions
              .filter(item => item.id !== 'CREATE_NEW' && !yAxisMulti.includes(item.id))
              .map(item => ({
                id: item.id,
                label: item.label || item.name || item.id,
                description: item.description || `Formula: ${item.formula}`,
                isCustom: true,
              })),
          ]}
          placeholder="Add custom logic metric..."
          onEdit={onEditCustomLogic}
          onDelete={onDeleteCustomLogic}
        />
      )}
    </div>
  );
}
