'use client';

import React from 'react';
import SingleGaugeMeter from './SingleGaugeMeter';
import MultiGaugeGrid from './MultiGaugeGrid';

export default function ModernGaugeWidget({ ws, isMini = false }) {
  const chartPayload = ws?.chartData || ws?.data || ws || {};
  const datasets = chartPayload?.datasets || [];

  if (datasets.length > 1) {
    return <MultiGaugeGrid datasets={datasets} isMini={isMini} />;
  }

  return <SingleGaugeMeter ws={ws} isMini={isMini} />;
}