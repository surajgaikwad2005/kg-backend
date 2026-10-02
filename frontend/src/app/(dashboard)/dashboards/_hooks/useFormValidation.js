import { useMemo } from 'react';

export function useFormValidation({
  mTitle,
  chartType,
  chartTypeSelected,
  selectedEquipment,
  xAxisSelected,
  yAxisSelected,
  customLogicSelected,
  yAxisMulti,
  lineTag,
  columnTag,
  valueTag,
  columnsMulti,
  visibility,
  yAxisMode,
  valueTagMode,
  valueCustomLogicSelected,
  interval,
  aggregation,
  secondaryYAxisMode,
}) {
  const isFormValid = useMemo(() => {
    if (!mTitle.trim() || !chartType || !selectedEquipment) return false;
    if (visibility.showX && !xAxisSelected) return false;
    if (visibility.showY && !visibility.multiY) {
      if (yAxisMode === 'default' && !yAxisSelected) return false;
      if (yAxisMode === 'custom' && (!customLogicSelected || customLogicSelected === 'CREATE_NEW')) return false;
    }
    if (visibility.showY && visibility.multiY && yAxisMulti.length === 0) return false;
    if (visibility.showLineTag && !lineTag) return false;
    if (visibility.showColumnTag && !columnTag) return false;
    if (visibility.showValue) {
      if (valueTagMode === 'default' && !valueTag) return false;
      if (valueTagMode === 'custom' && (!valueCustomLogicSelected || valueCustomLogicSelected === 'CREATE_NEW')) return false;
    }
    if (visibility.showColumns && columnsMulti.length === 0) return false;
    return true;
  }, [mTitle, chartType, chartTypeSelected, selectedEquipment, xAxisSelected, yAxisSelected, customLogicSelected, yAxisMulti, lineTag, columnTag, valueTag, columnsMulti, visibility, yAxisMode, valueTagMode, valueCustomLogicSelected, interval, aggregation]);

  const isConfigValid = useMemo(() => {
    if (!chartType || !selectedEquipment) return false;
    if (visibility.showX && !xAxisSelected) return false;
    if (visibility.showY && !visibility.multiY) {
      if (yAxisMode === 'default' && !yAxisSelected) return false;
      if (yAxisMode === 'custom' && (!customLogicSelected || customLogicSelected === 'CREATE_NEW')) return false;
    }
    if (visibility.showY && visibility.multiY && yAxisMulti.length === 0) return false;
    if (visibility.showLineTag && !lineTag) return false;
    if (visibility.showColumnTag && !columnTag) return false;
    if (visibility.showValue) {
      if (valueTagMode === 'default' && !valueTag) return false;
      if (valueTagMode === 'custom' && (!valueCustomLogicSelected || valueCustomLogicSelected === 'CREATE_NEW')) return false;
    }
    if (visibility.showColumns && columnsMulti.length === 0) return false;

    const isIntervalRequired = chartType && !['table', 'heatmap'].includes(chartType) && chartTypeSelected !== 'KPI';
    if (isIntervalRequired && !interval) return false;

    const isAggregationRequired = chartType && chartType !== 'table';
    if (isAggregationRequired && !aggregation) return false;

    return true;
  }, [chartType, chartTypeSelected, selectedEquipment, xAxisSelected, yAxisSelected, customLogicSelected, yAxisMulti, lineTag, columnTag, valueTag, columnsMulti, visibility, yAxisMode, secondaryYAxisMode, valueTagMode, valueCustomLogicSelected, interval, aggregation]);

  return { isFormValid, isConfigValid };
}
