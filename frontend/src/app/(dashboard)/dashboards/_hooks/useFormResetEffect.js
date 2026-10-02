import { useEffect, useRef } from 'react';
import { getFieldVisibility } from '../_components/helpers';

export function useFormResetEffect({
  chartType,
  setYAxisSelected,
  setYAxisMulti,
  setValueTag,
  setLineTag,
  setColumnTag,
  setColumnsMulti,
}) {
  const prevChartTypeRef = useRef(chartType);

  useEffect(() => {
    if (!chartType) return;
    if (prevChartTypeRef.current !== chartType) {
      prevChartTypeRef.current = chartType;
      const currentVis = getFieldVisibility(chartType);

      if (!currentVis.showY || currentVis.multiY) {
        setYAxisSelected('');
      }
      if (!currentVis.showY || !currentVis.multiY) {
        setYAxisMulti([]);
      }
      if (!currentVis.showValue) {
        setValueTag('');
      }
      if (!currentVis.showLineTag) {
        setLineTag('');
      }
      if (!currentVis.showColumnTag) {
        setColumnTag('');
      }
      if (!currentVis.showColumns) {
        setColumnsMulti([]);
      }
    }
  }, [chartType, setYAxisSelected, setYAxisMulti, setValueTag, setLineTag, setColumnTag, setColumnsMulti]);
}
