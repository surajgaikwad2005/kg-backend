'use client';

import React from 'react';
import GetMiniChart from '../widgets/getMiniChart';

export default function DynamicPreviewBox({ isLoadingPreview, previewError, livePreviewWsConfig, isConfigValid }) {
  return (
    <div className="flex flex-col gap-2.5 mt-2 pt-2">
      <div className="flex items-center justify-between">
        <span className="block text-[10px] font-bold text-text-muted tracking-[0.12em] uppercase">
          Dynamic Preview
        </span>
        {isLoadingPreview && (
          <span className="text-[10px] text-brand font-semibold animate-pulse">
            Loading preview...
          </span>
        )}
      </div>
      <div className="border border-border bg-surface-2 rounded-xl p-3 h-48 flex items-center justify-center relative overflow-hidden shadow-inner">
        {isLoadingPreview ? (
          <div className="flex items-center gap-2 text-text-muted text-xs font-medium">
            <span className="w-4 h-4 rounded-full border-2 border-brand border-t-transparent animate-spin" />
            Fetching chart preview...
          </div>
        ) : previewError ? (
          <div className="text-xs text-red-500 font-medium px-4 text-center">
            {previewError}
          </div>
        ) : !isConfigValid ? (
          <div className="text-xs text-text-muted font-medium px-4 text-center">
            Select equipment and tags to generate a preview.
          </div>
        ) : (!livePreviewWsConfig?.chartData || Object.keys(livePreviewWsConfig.chartData).length === 0) ? (
          <div className="text-xs text-text-muted font-medium px-4 text-center">
            No data available for the selected configuration.
          </div>
        ) : (
          <GetMiniChart ws={livePreviewWsConfig} uid="preview" isDragging={false} />
        )}
      </div>
    </div>
  );
}
