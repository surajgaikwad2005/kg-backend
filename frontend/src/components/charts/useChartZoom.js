import { useState, useEffect, useCallback } from 'react';

export function useChartZoom(data) {
  const [refAreaLeft, setRefAreaLeft] = useState(null);
  const [refAreaRight, setRefAreaRight] = useState(null);
  const [zoomStartIndex, setZoomStartIndex] = useState(0);
  const [zoomEndIndex, setZoomEndIndex] = useState(data ? data.length - 1 : 0);

  const dataSignature = data ? `${data.length}-${data[0]?.rawTimestamp || data[0]?.label || ''}-${data[data.length - 1]?.rawTimestamp || data[data.length - 1]?.label || ''}` : '';

  useEffect(() => {
    if (data) {
      setZoomStartIndex(0);
      setZoomEndIndex(data.length - 1);
    }
    setRefAreaLeft(null);
    setRefAreaRight(null);
  }, [dataSignature]);

  const zoom = useCallback(() => {
    if (!data || data.length === 0) return;
    if (refAreaLeft === refAreaRight || !refAreaLeft || !refAreaRight) {
      setRefAreaLeft(null);
      setRefAreaRight(null);
      return;
    }

    let leftIndex = data.findIndex(d => d.label === refAreaLeft || d.name === refAreaLeft || d.rawTimestamp === refAreaLeft);
    let rightIndex = data.findIndex(d => d.label === refAreaRight || d.name === refAreaRight || d.rawTimestamp === refAreaRight);

    if (leftIndex === -1 || rightIndex === -1) {
      setRefAreaLeft(null);
      setRefAreaRight(null);
      return;
    }

    if (leftIndex > rightIndex) {
      const temp = leftIndex;
      leftIndex = rightIndex;
      rightIndex = temp;
    }

    setZoomStartIndex(leftIndex);
    setZoomEndIndex(rightIndex);
    setRefAreaLeft(null);
    setRefAreaRight(null);
  }, [refAreaLeft, refAreaRight, data]);

  useEffect(() => {
    if (!refAreaLeft) return;
    window.addEventListener('mouseup', zoom);
    return () => {
      window.removeEventListener('mouseup', zoom);
    };
  }, [refAreaLeft, zoom]);

  const resetZoom = () => {
    if (!data) return;
    setZoomStartIndex(0);
    setZoomEndIndex(data.length - 1);
    setRefAreaLeft(null);
    setRefAreaRight(null);
  };

  const isZoomed = data ? zoomStartIndex > 0 || zoomEndIndex < data.length - 1 : false;
  const zoomedData = data ? data.slice(zoomStartIndex, zoomEndIndex + 1) : [];

  const mouseHandlers = {
    onMouseDown: (e) => {
      if (e) {
        const activeIdx = e.activeTooltipIndex;
        const label = e.activeLabel || (activeIdx !== undefined && data[activeIdx] && (data[activeIdx].rawTimestamp || data[activeIdx].label || data[activeIdx].name));
        if (label) {
          setRefAreaLeft(label);
        }
        if (e.nativeEvent && typeof e.nativeEvent.preventDefault === 'function') {
          e.nativeEvent.preventDefault();
        }
      }
    },
    onMouseMove: (e) => {
      if (refAreaLeft && e) {
        const activeIdx = e.activeTooltipIndex;
        const label = e.activeLabel || (activeIdx !== undefined && data[activeIdx] && (data[activeIdx].rawTimestamp || data[activeIdx].label || data[activeIdx].name));
        if (label) {
          setRefAreaRight(label);
        }
      }
    },
    onMouseUp: zoom,
  };

  return {
    isZoomed,
    zoomedData,
    refAreaLeft,
    refAreaRight,
    mouseHandlers,
    resetZoom
  };
}
