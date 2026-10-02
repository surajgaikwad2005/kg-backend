'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';

export default function CombinedPipelineProgress({ pipeline, stepCount }) {
    const [progress, setProgress] = useState(0);

    const activeFile = pipeline.compareStatus === 'running' ? 'Aligning Data' 
                     : pipeline.extractStatus === 'running' ? pipeline.extractCurrentFile 
                     : pipeline.currentFile;

    useEffect(() => {
        let targetProgress = 0;
        
        if (pipeline.compareStatus === 'done') {
            targetProgress = 100;
        } else if (pipeline.compareStatus === 'running') {
            // Compare & Clean range: 91% - 100%
            targetProgress = 95;
        } else if (pipeline.extractStatus === 'done') {
            // Extract complete: 90%
            targetProgress = 90;
        } else if (pipeline.extractStatus === 'skipped') {
            // Extract skipped: jump straight to 90% (end of extract range)
            targetProgress = 90;
        } else if (pipeline.extractStatus === 'running') {
            // Extract range: 56% - 90%
            const extractItems = pipeline.extractProgress?.length || 0;
            targetProgress = Math.min(88, 56 + extractItems * 6);
        } else if (pipeline.jobStatus === 'done') {
            // OCR complete: 55%
            targetProgress = pipeline.extractStatus === 'skipped' ? 90 : 55;
        } else if (pipeline.jobStatus === 'running' || pipeline.jobStatus === 'queued') {
            // OCR range: 0% - 55%
            const ocrItems = pipeline.jobProgress?.length || 0;
            targetProgress = Math.min(50, 10 + ocrItems * 6);
        }

        const interval = setInterval(() => {
            setProgress(prev => {
                if (targetProgress >= 100) return 100;
                if (prev < targetProgress) {
                    return Math.min(prev + (Math.random() * 2 + 0.5), targetProgress);
                }
                return prev;
            });
        }, 200);

        return () => clearInterval(interval);
    }, [
        pipeline.jobStatus,
        pipeline.extractStatus,
        pipeline.compareStatus,
        pipeline.jobProgress?.length,
        pipeline.extractProgress?.length,
        stepCount
    ]);

    const isError = pipeline.jobStatus === 'error' || pipeline.extractStatus === 'error' || pipeline.compareStatus === 'error' || pipeline.compareStatus === 'blocked';
    const isDone = pipeline.compareStatus === 'done';
    const isActive = pipeline.jobStatus === 'queued' || pipeline.jobStatus === 'running' || pipeline.extractStatus === 'running' || pipeline.compareStatus === 'running';

    const getErrorText = () => {
        if (pipeline.jobStatus === 'error') return pipeline.jobError;
        if (pipeline.extractStatus === 'error') return pipeline.extractError;
        if (pipeline.compareStatus === 'error') return pipeline.compareError;
        if (pipeline.compareStatus === 'blocked') return pipeline.compareError;
        return 'An unknown error occurred.';
    }

    return (
        <div className="bg-surface rounded-[32px] border border-border shadow-card overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[11px] font-black text-text-subtle uppercase tracking-widest flex items-center gap-2">
                        {isDone ? (
                            <><span className="w-2 h-2 rounded-full bg-success" /> Processing Complete</>
                        ) : isError ? (
                            <><span className="w-2 h-2 rounded-full bg-danger" /> Processing Failed</>
                        ) : (
                            <><span className="w-2 h-2 rounded-full bg-brand animate-pulse" /> Processing Files</>
                        )}
                    </h3>
                    <span className="text-3xl font-black text-text-primary tracking-tighter">
                        {Math.round(progress)}<span className="text-lg text-text-subtle">%</span>
                    </span>
                </div>

                {/* Progress Bar */}
                <div className="h-4 bg-surface-2 rounded-full overflow-hidden mb-6 border border-border">
                    <div 
                        style={{ '--progress': `${progress}%` }}
                        className={`h-full transition-all duration-300 ease-out w-[var(--progress)] ${isError ? 'bg-danger' : isDone ? 'bg-success' : 'bg-brand relative overflow-hidden'}`}
                    >
                        {isActive && !isError && (
                            <div className="absolute inset-0 bg-white/20 animate-[pulse_1s_ease-in-out_infinite]" />
                        )}
                    </div>
                </div>

                {/* Status Text */}
                <div className="flex items-center gap-3 text-sm font-bold text-text-secondary">
                    {isActive ? (
                        <>
                            <Loader2 size={16} className="animate-spin text-brand shrink-0" />
                            <span className="truncate">
                                {pipeline.jobStatus === 'running' && 'Scanning documents... '}
                                {pipeline.extractStatus === 'running' && 'Extracting engineering data... '}
                                {pipeline.compareStatus === 'running' && 'Comparing and aligning extracted data... '}
                                {activeFile && <span className="text-text-subtle font-medium ml-1">({activeFile})</span>}
                            </span>
                        </>
                    ) : isDone ? (
                        <>
                            <CheckCircle2 size={16} className="text-success shrink-0" />
                            <span className="text-success">All files processed successfully!</span>
                        </>
                    ) : isError ? (
                        <>
                            <AlertCircle size={16} className="text-danger shrink-0" />
                            <span className="text-danger truncate">{getErrorText()}</span>
                        </>
                    ) : (
                        <span className="text-text-subtle">Waiting to start...</span>
                    )}
                </div>

                {(isError || isDone) && (
                    <div className="mt-6 flex justify-end items-center gap-3">
                        {isError && (
                            <button
                                type="button"
                                onClick={pipeline.retry}
                                title="Retry extraction run with same configuration"
                                className="px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-brand/20 cursor-pointer active:scale-95 flex items-center gap-2"
                            >
                                <RotateCcw size={13} /> Retry
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={pipeline.resetPipeline}
                            className="px-6 py-2.5 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border text-text-primary text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer active:scale-95"
                        >
                            {isDone ? 'Close' : 'Dismiss'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
