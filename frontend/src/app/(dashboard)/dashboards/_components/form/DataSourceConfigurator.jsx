import React from 'react';
import ModalMetricInput from '../ModalMetricInput';
import CustomLogicMetricInput from '../CustomLogicMetricInput';
import MultiSelectField from '../MultiSelectField';
import YAxisField from './YAxisField';

export default function DataSourceConfigurator({
  visibility,
  xAxisSelected,
  setXAxisSelected,
  xAxisList,
  yAxisMode,
  setYAxisMode,
  yAxisSelected,
  setYAxisSelected,
  yAxisMulti,
  setYAxisMulti,
  customLogicSelected,
  setCustomLogicSelected,
  customLogicOptions,
  secondaryYAxisMode,
  setSecondaryYAxisMode,
  secondaryYAxisSelected,
  setSecondaryYAxisSelected,
  secondaryCustomLogicSelected,
  setSecondaryCustomLogicSelected,
  lineTag,
  setLineTag,
  columnTag,
  setColumnTag,
  valueTag,
  setValueTag,
  valueTagMode,
  setValueTagMode,
  valueCustomLogicSelected,
  setValueCustomLogicSelected,
  columnsMulti,
  setColumnsMulti,
  getAvailableMetricsFor,
  formulaSectionRef,
  formulaInputRef,
  setEditingLogicId,
  setExpressionName,
  setExpressionDescription,
  setFormula,
  onEditCustomLogic,
  onDeleteCustomLogic,
  setPendingMultiSelectTarget
}) {
  const modeBtnClass = (active) =>
    `px-2 py-0.5 text-[9px] font-bold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
      active
        ? 'bg-surface text-text-primary shadow-sm'
        : 'text-text-muted hover:text-text-primary'
    }`;

  const handleCreateNew = (target, clearFn) => {
    if (clearFn) clearFn('');
    if (setEditingLogicId) setEditingLogicId(null);
    if (setExpressionName) setExpressionName('');
    if (setExpressionDescription) setExpressionDescription('');
    if (setFormula) setFormula('');
    if (setPendingMultiSelectTarget) setPendingMultiSelectTarget(target);
    formulaSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => formulaInputRef.current?.focus(), 400);
  };

  return (
    <div className="py-2 border-b border-border/50">
      <label className="block text-[10px] font-bold text-text-muted tracking-[0.12em] uppercase mb-2">Data Source</label>
      <div className="flex flex-col gap-3">

        {visibility.showX && (
          <div>
            <div className="flex items-center justify-between h-7 mb-1.5">
              <div className="text-[11.5px] font-semibold text-text-secondary flex items-center gap-1.5">
                X-axis <span className="text-[10px] text-danger font-bold">required</span>
              </div>
            </div>
            <ModalMetricInput
              value={xAxisSelected}
              onChange={setXAxisSelected}
              metricsList={getAvailableMetricsFor('xAxis', xAxisList)}
              placeholder="Select X-axis"
            />
          </div>
        )}

        <YAxisField
          visibility={visibility}
          yAxisMode={yAxisMode}
          setYAxisMode={setYAxisMode}
          yAxisSelected={yAxisSelected}
          setYAxisSelected={setYAxisSelected}
          yAxisMulti={yAxisMulti}
          setYAxisMulti={setYAxisMulti}
          customLogicSelected={customLogicSelected}
          setCustomLogicSelected={setCustomLogicSelected}
          customLogicOptions={customLogicOptions}
          getAvailableMetricsFor={getAvailableMetricsFor}
          formulaSectionRef={formulaSectionRef}
          formulaInputRef={formulaInputRef}
          setEditingLogicId={setEditingLogicId}
          setExpressionName={setExpressionName}
          setExpressionDescription={setExpressionDescription}
          setFormula={setFormula}
          setPendingMultiSelectTarget={setPendingMultiSelectTarget}
          onEditCustomLogic={onEditCustomLogic}
          onDeleteCustomLogic={onDeleteCustomLogic}
        />

        {visibility.showSecY && (
          <div className="col-span-1">
            <div className="flex items-center justify-between gap-1 mb-1.5 min-w-0">
              <div className="text-[11px] font-semibold text-text-secondary flex items-center gap-1 whitespace-nowrap shrink-0">
                Sec Y-axis <span className="text-[9px] text-text-subtle font-medium">opt</span>
              </div>
              <div className="flex bg-surface-2 p-0.5 rounded-lg border border-border shrink-0">
                <button onClick={() => setSecondaryYAxisMode('default')} className={modeBtnClass(secondaryYAxisMode === 'default')}>Default</button>
                <button onClick={() => setSecondaryYAxisMode('custom')} className={modeBtnClass(secondaryYAxisMode === 'custom')}>Custom</button>
              </div>
            </div>
            {secondaryYAxisMode === 'default' ? (
              <ModalMetricInput
                value={secondaryYAxisSelected}
                onChange={setSecondaryYAxisSelected}
                metricsList={getAvailableMetricsFor('secYAxis')}
                placeholder="Add second metric..."
              />
            ) : (
              <CustomLogicMetricInput
                value={secondaryCustomLogicSelected}
                onChange={(val) => {
                  if (val === 'CREATE_NEW') {
                    handleCreateNew('secondaryCustomLogicSelected', setSecondaryCustomLogicSelected);
                  } else {
                    setSecondaryCustomLogicSelected(val);
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
        )}

        {visibility.showLineTag && (
          <div>
            <div className="flex items-center justify-between h-7 mb-1.5">
              <div className="text-[11.5px] font-semibold text-text-secondary flex items-center gap-1.5">
                Line Tag <span className="text-[10px] text-danger font-bold">required</span>
              </div>
            </div>
            <ModalMetricInput
              value={lineTag}
              onChange={setLineTag}
              metricsList={getAvailableMetricsFor('line')}
              placeholder="Select line tag..."
            />
          </div>
        )}

        {visibility.showColumnTag && (
          <div>
            <div className="flex items-center justify-between h-7 mb-1.5">
              <div className="text-[11.5px] font-semibold text-text-secondary flex items-center gap-1.5">
                Column Tag <span className="text-[10px] text-danger font-bold">required</span>
              </div>
            </div>
            <ModalMetricInput
              value={columnTag}
              onChange={setColumnTag}
              metricsList={getAvailableMetricsFor('column')}
              placeholder="Select column tag..."
            />
          </div>
        )}

        {visibility.showValue && (
          <div className="col-span-1">
            <div className="flex items-center justify-between gap-1 mb-1.5 min-w-0">
              <div className="text-[11px] font-semibold text-text-secondary flex items-center gap-1 whitespace-nowrap shrink-0">
                Value <span className="text-[9px] text-danger font-bold">required</span>
              </div>
              <div className="flex bg-surface-2 p-0.5 rounded-lg border border-border shrink-0">
                <button onClick={() => setValueTagMode('default')} className={modeBtnClass(valueTagMode === 'default')}>Default</button>
                <button onClick={() => setValueTagMode('custom')} className={modeBtnClass(valueTagMode === 'custom')}>Custom</button>
              </div>
            </div>
            {valueTagMode === 'default' ? (
              <ModalMetricInput
                value={valueTag}
                onChange={setValueTag}
                metricsList={getAvailableMetricsFor('value')}
                placeholder="Select Value"
              />
            ) : (
              <CustomLogicMetricInput
                value={valueCustomLogicSelected}
                onChange={(val) => {
                  if (val === 'CREATE_NEW') {
                    handleCreateNew('valueCustomLogicSelected', setValueCustomLogicSelected);
                  } else {
                    setValueCustomLogicSelected(val);
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
        )}

        {visibility.showColumns && (
          <MultiSelectField
            label="Columns"
            items={columnsMulti}
            setItems={setColumnsMulti}
            list={getAvailableMetricsFor('columnsMulti')}
            placeholder="Add table column..."
          />
        )}
      </div>
    </div>
  );
}
