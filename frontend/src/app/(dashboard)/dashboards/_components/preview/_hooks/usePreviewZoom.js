import { useState, useCallback, useEffect } from 'react';

export function usePreviewZoom(data) {
  const [refAreaLeft, setRefAreaLeft] = useState(null);
  const [refAreaRight, setRefAreaRight] = useState(null);
  const [zoomStartIndex, setZoomStartIndex] = useState(0);
  const [zoomEndIndex, setZoomEndIndex] = useState(data.length - 1);

  useEffect(() => {
    setZoomStartIndex(0);
    setZoomEndIndex(data.length - 1);
    setRefAreaLeft(null);
    setRefAreaRight(null);
  }, [data]);

  const zoom = useCallback(() => {
    if (refAreaLeft === refAreaRight || !refAreaLeft || !refAreaRight) {
      setRefAreaLeft(null);
      setRefAreaRight(null);
      return;
    }
    let leftIndex = data.findIndex(d => d.label === refAreaLeft);
    let rightIndex = data.findIndex(d => d.label === refAreaRight);
    if (leftIndex === -1 || rightIndex === -1) { setRefAreaLeft(null); setRefAreaRight(null); return; }
    if (leftIndex > rightIndex) { const t = leftIndex; leftIndex = rightIndex; rightIndex = t; }
    setZoomStartIndex(leftIndex);
    setZoomEndIndex(rightIndex);
    setRefAreaLeft(null);
    setRefAreaRight(null);
  }, [refAreaLeft, refAreaRight, data]);

  useEffect(() => {
    if (!refAreaLeft) return;
    window.addEventListener('mouseup', zoom);
    return () => window.removeEventListener('mouseup', zoom);
  }, [refAreaLeft, zoom]);

  const resetZoom = () => {
    setZoomStartIndex(0);
    setZoomEndIndex(data.length - 1);
    setRefAreaLeft(null);
    setRefAreaRight(null);
  };

  const isZoomed = zoomStartIndex > 0 || zoomEndIndex < data.length - 1;
  const zoomedData = data.slice(zoomStartIndex, zoomEndIndex + 1);
  const dynamicTickInterval = Math.max(0, Math.floor(zoomedData.length / 5));

  const mouseHandlers = {
    onMouseDown: (e) => {
      if (e?.activeLabel) setRefAreaLeft(e.activeLabel);
      if (e?.nativeEvent && typeof e.nativeEvent.preventDefault === 'function') e.nativeEvent.preventDefault();
    },
    onMouseMove: (e) => { if (refAreaLeft && e?.activeLabel) setRefAreaRight(e.activeLabel); },
    onMouseUp: zoom,
  };

  return { refAreaLeft, refAreaRight, zoomStartIndex, isZoomed, zoomedData, dynamicTickInterval, mouseHandlers, resetZoom };
}
