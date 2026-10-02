import { formatDateTime, getTimeRange } from './helpers';

export function buildDashboardPayload({
  chartType,
  timePreset,
  customStart,
  customEnd,
  aggregation,
  interval,
  mTitle,
  xAxisSelected,
  yAxisMode,
  yAxisSelected,
  yAxisMulti,
  customLogicSelected,
  customLogicList,
  secondaryYAxisMode,
  secondaryYAxisSelected,
  secondaryCustomLogicSelected,
  valueTag,
  valueTagMode,
  valueCustomLogicSelected,
  lineTag,
  columnTag,
  columnsMulti,
  visibility,
  formula,
  isLive
}) {
  let start_time = null, end_time = null;

  try {
    const savedTz = localStorage.getItem('timeRange');
    if (savedTz) {
      const parsed = JSON.parse(savedTz);
      if (parsed.start) start_time = parsed.start.replace('T', ' ').slice(0, 19);
      if (parsed.end) end_time = parsed.end.replace('T', ' ').slice(0, 19);
    }
  } catch {}

  if (!start_time) {
    if (timePreset === 'custom') {
      start_time = formatDateTime(customStart);
      end_time = formatDateTime(customEnd);
    } else {
      const range = getTimeRange(timePreset);
      start_time = range.start_time;
      end_time = range.end_time;
    }
  }

  let finalYAxis = null;
  let finalLogicConfig = {};

  const addToLogicConfig = (id) => {
    if (!id) return;
    const found = customLogicList?.find(l => String(l.id) === String(id));
    if (found) {
      finalLogicConfig[id] = found.formula;
      finalLogicConfig.formula = found.formula;
    }
  };

  if (visibility.showY) {
    if (visibility.multiY) {
      finalYAxis = yAxisMulti.length ? yAxisMulti.map(id => String(id)) : null;
      if (yAxisMulti.length) {
        yAxisMulti.forEach(id => {
          if (yAxisMode === 'custom') {
            addToLogicConfig(id);
          }
        });
      }
    } else if (yAxisMode === 'default') {
      finalYAxis = yAxisSelected ? [String(yAxisSelected)] : null;
    } else {
      finalYAxis = [customLogicSelected ? String(customLogicSelected) : 'custom_formula_attached'];
      addToLogicConfig(customLogicSelected);
    }
  }

  if (secondaryYAxisMode === 'custom' && secondaryCustomLogicSelected) {
    addToLogicConfig(secondaryCustomLogicSelected);
  }

  if (valueTagMode === 'custom' && valueCustomLogicSelected) {
    addToLogicConfig(valueCustomLogicSelected);
  }

  const backendVisualType = chartType === 'kpi' ? 'kpi_card'
    : chartType === 'threshold' ? 'threshold_line'
      : chartType;

  return {
    visual_type: backendVisualType,
    start_time,
    end_time,
    aggregation,
    interval,
    visual_config: {
      title: mTitle || 'Untitled Visual',
      x_axis: xAxisSelected || null,
      y_axis: finalYAxis,
      secondary_y_axis: secondaryYAxisMode === 'default'
        ? (secondaryYAxisSelected ? [secondaryYAxisSelected] : null)
        : (secondaryCustomLogicSelected ? [String(secondaryCustomLogicSelected)] : null),
      value_tag: valueTagMode === 'default'
        ? (valueTag ? String(valueTag) : null)
        : (valueCustomLogicSelected ? String(valueCustomLogicSelected) : null),
      line_tags: lineTag ? [lineTag] : null,
      column_tags: columnTag ? [columnTag] : null,
      columns: columnsMulti.length ? columnsMulti : null
    },
    logic_configuration: finalLogicConfig
  };
}

export function filterAvailableMetrics(currentFieldKey, baseList, {
  xAxisSelected,
  yAxisMode,
  yAxisSelected,
  yAxisMulti,
  secondaryYAxisMode,
  secondaryYAxisSelected,
  lineTag,
  columnTag,
  valueTagMode,
  valueTag,
  valueCustomLogicSelected,
  columnsMulti
}) {
  const activeSelections = [];
  if (currentFieldKey !== 'xAxis' && xAxisSelected) activeSelections.push(xAxisSelected);
  if (currentFieldKey !== 'yAxis' && yAxisMode === 'default' && yAxisSelected) activeSelections.push(yAxisSelected);
  if (currentFieldKey !== 'yAxisMulti' && yAxisMode === 'default' && yAxisMulti?.length) activeSelections.push(...yAxisMulti);
  if (currentFieldKey !== 'secYAxis' && secondaryYAxisMode === 'default' && secondaryYAxisSelected) activeSelections.push(secondaryYAxisSelected);
  if (currentFieldKey !== 'line' && lineTag) activeSelections.push(lineTag);
  if (currentFieldKey !== 'column' && columnTag) activeSelections.push(columnTag);
  if (currentFieldKey !== 'value' && valueTagMode === 'default' && valueTag) activeSelections.push(valueTag);
  if (currentFieldKey !== 'columnsMulti' && columnsMulti?.length) activeSelections.push(...columnsMulti);
  return baseList.filter(item => !activeSelections.includes(item.id || item));
}
