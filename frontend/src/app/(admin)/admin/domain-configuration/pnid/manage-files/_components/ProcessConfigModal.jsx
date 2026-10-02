'use client';

/**
 * ProcessConfigModal — configure a processing run: define the drawing usable
 * area (crop), pick LLM vs No-LLM, choose the model, and preview the resulting
 * pipeline. Pure presentation; selection state is owned by the parent.
 */import React from 'react';
import { X, Sparkles, BrainCircuit, Play, Loader2, AlertTriangle, RefreshCw, FileText } from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';
import { Skeleton } from '@/src/components/ui/Skeleton';
import CropPreview from '@/src/app/(admin)/admin/domain-configuration/pnid/manage-files/_components/CropPreview';
import { LLM_OPTIONS, PROVIDER_MAP } from '@/src/app/(admin)/admin/domain-configuration/pnid/manage-files/_lib/constants';

function PipelinePreview({ processMode, hasLineList, selectedLlm }) {
    const Step = ({ active, num, title, desc, tone }) => {
        const tones = {
            brand: 'bg-brand text-white shadow-sm shadow-brand/30 border border-brand',
            purple: 'bg-highlight text-white shadow-sm shadow-highlight/30 border border-highlight',
            emerald: 'bg-success text-white shadow-sm shadow-success/30 border border-success',
        };
        const activeClass = active ? tones[tone] : 'bg-surface-2 border border-border text-text-subtle opacity-60';
        return (
            <div className="flex items-start gap-4">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-black text-[10px] transition-all z-10 ${activeClass}`}>
                    {num}
                </div>
                <div className="pt-1 flex-1 min-w-0">
                    <p className={`text-xs font-black uppercase tracking-wider truncate ${active ? 'text-text-primary' : 'text-text-subtle line-through opacity-60'}`}>{title}</p>
                    {desc && <p className={`text-[10px] font-bold uppercase tracking-wider truncate mt-0.5 ${active ? 'text-text-subtle' : 'text-text-muted opacity-50'}`}>{desc}</p>}
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 rounded-3xl bg-surface-2/50 border border-border relative">
            <div className="absolute top-10 left-[37px] bottom-10 w-[2px] bg-border" />
            <div className="space-y-6 relative">
                <Step active={true} num="1" title="OCR Scanning" desc="Text detection & parsing" tone="brand" />
                <Step 
                    active={processMode === 'llm' && !hasLineList} 
                    num="2" 
                    title="Semantic Extraction" 
                    desc={processMode === 'llm' && !hasLineList ? (selectedLlm ? `via ${selectedLlm}` : 'Select a model') : (hasLineList ? 'Skipped (Line list present)' : 'Skipped (No-LLM Mode)')} 
                    tone="purple" 
                />
                <Step 
                    active={true} 
                    num="3" 
                    title="Data Alignment" 
                    desc="Comparison & normalization" 
                    tone="emerald" 
                />
            </div>
        </div>
    );
}

export default function ProcessConfigModal({
    open, onClose, totalSelected, hasLineList,
    previewImageSrc, isPreviewLoading, cropBoxCoordinates, onCropChange,
    previewError, previewTargetFileName, onRetryPreview,
    processMode, setProcessMode, selectedLlm, setSelectedLlm, onStart,
}) {
    const startDisabled = !processMode || (processMode === 'llm' && !hasLineList && !selectedLlm);

    return (
        <Modal open={open} onClose={onClose} size="full" className="max-w-6xl border border-border flex flex-col max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center py-4 px-6 lg:px-8 border-b border-border shrink-0 bg-surface z-10 relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 blur-[80px] rounded-full pointer-events-none -mr-20 -mt-20" />
                    <div>
                        <h3 id="process-config-modal-title" className="text-xl font-black text-text-primary uppercase tracking-tight">Process Configuration</h3>
                        <p className="text-[11px] font-bold text-text-muted mt-1 tracking-wide flex items-center gap-2">
                            <span>Processing <span className="text-brand font-black">{totalSelected}</span> selected file(s)</span>
                            {hasLineList && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-border" />
                                    <span className="text-success font-black">Line list detected → /extract skipped.</span>
                                </>
                            )}
                        </p>
                    </div>
                    <button onClick={onClose} aria-label="Close" className="p-2 bg-surface hover:bg-surface-2 border border-border rounded-xl text-text-subtle hover:text-text-primary transition-all cursor-pointer shadow-sm active:scale-95 z-10">
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-canvas/30 space-y-8">
                    
                    {/* Usable area / Drawing Preview */}
                    {previewImageSrc ? (
                        <div className="animate-in fade-in duration-300">
                            <h4 className="text-[11px] font-black text-text-subtle uppercase tracking-widest flex items-center justify-between mb-3">
                                <span className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                                    Define Drawing Usable Area
                                </span>
                                {cropBoxCoordinates ? (
                                    <span className="px-3 py-1 rounded-lg bg-brand-muted border border-brand/20 text-[10px] text-brand font-black uppercase tracking-widest shadow-sm">
                                        Box: {Math.round(cropBoxCoordinates.x1)},{Math.round(cropBoxCoordinates.y1)} → {Math.round(cropBoxCoordinates.x2)},{Math.round(cropBoxCoordinates.y2)}
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-bold text-text-subtle uppercase tracking-widest border border-dashed border-border px-3 py-1 rounded-lg">
                                        Drag on image to crop (Optional)
                                    </span>
                                )}
                            </h4>
                            <div className="bg-surface border border-border shadow-sm rounded-2xl overflow-hidden min-h-[400px]">
                                <CropPreview imageSrc={previewImageSrc} onCropChange={onCropChange} />
                            </div>
                        </div>
                    ) : isPreviewLoading ? (
                        <div className="border border-border rounded-2xl bg-surface p-6 shadow-sm space-y-4 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <Loader2 className="w-4 h-4 animate-spin text-brand" />
                                    <span className="text-xs font-black uppercase tracking-wider text-text-primary">Generating drawing preview…</span>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Converting PDF Page</span>
                            </div>
                            <div className="h-[280px] rounded-xl overflow-hidden relative">
                                <Skeleton className="w-full h-full rounded-xl" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center pointer-events-none">
                                    <FileText className="w-8 h-8 text-text-subtle/30 animate-pulse" />
                                    <p className="text-xs font-bold text-text-subtle">Rendering first page for crop box definition…</p>
                                </div>
                            </div>
                        </div>
                    ) : previewError ? (
                        <div className="border border-warning/30 bg-warning/5 dark:bg-warning/10 rounded-2xl p-5 shadow-sm space-y-3 animate-in fade-in duration-300">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3.5 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-warning/15 border border-warning/30 flex items-center justify-center shrink-0 text-warning mt-0.5 shadow-sm">
                                        <AlertTriangle size={20} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="text-xs font-black text-text-primary uppercase tracking-wider">
                                                Drawing Preview Unavailable
                                            </h4>
                                            <span className="px-2 py-0.5 rounded-md bg-warning/20 text-warning text-[10px] font-black uppercase tracking-wider">
                                                Crop Box Optional
                                            </span>
                                        </div>
                                        <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                                            {previewError.toLowerCase().includes('file not found') ? (
                                                <>
                                                    The server could not locate the preview file on disk (<span className="font-semibold text-text-primary font-mono text-[11px]">{previewError}</span>). You can still proceed with the extraction run without defining a crop area, or retry generating the preview.
                                                </>
                                            ) : (
                                                <>
                                                    Preview generation returned: <span className="font-semibold text-text-primary">{previewError}</span>. Extraction run will process the full drawing by default.
                                                </>
                                            )}
                                        </p>
                                        {previewTargetFileName && (
                                            <p className="text-[11px] text-text-muted mt-1.5 flex items-center gap-1.5">
                                                <span className="font-bold uppercase tracking-wider text-[10px]">Target Document:</span>
                                                <span className="font-mono text-text-secondary font-semibold truncate">{previewTargetFileName}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {onRetryPreview && (
                                    <button
                                        type="button"
                                        onClick={onRetryPreview}
                                        aria-label="Retry loading drawing preview"
                                        className="px-3.5 py-2 rounded-xl bg-surface hover:bg-surface-2 border border-border text-text-secondary hover:text-text-primary text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm shrink-0 active:scale-95 hover:border-brand/30"
                                    >
                                        <RefreshCw size={13} />
                                        Retry
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : null}

                    {/* Mode selection */}
                    <div>
                        <h4 className="text-[11px] font-black text-text-subtle uppercase tracking-widest flex items-center gap-2 mb-3">
                            <BrainCircuit size={14} className="text-highlight" /> Processing Strategy
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => setProcessMode('llm')}
                                className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-all cursor-pointer text-left relative overflow-hidden ${
                                    processMode === 'llm' ? 'border-brand bg-brand-muted/30 shadow-sm' : 'border-border hover:border-brand/40 bg-surface'
                                }`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 z-10 transition-colors ${processMode === 'llm' ? 'bg-brand text-white shadow-md' : 'bg-surface-2 border border-border text-text-subtle'}`}>
                                    <Sparkles size={20} />
                                </div>
                                <div className="z-10">
                                    <span className={`block font-black uppercase tracking-wider text-sm ${processMode === 'llm' ? 'text-brand' : 'text-text-primary'}`}>LLM Vision Pipeline</span>
                                    <span className="text-[10px] font-bold text-text-subtle uppercase tracking-wider mt-0.5 block">High accuracy extraction</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setProcessMode('no-llm')}
                                className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-all cursor-pointer text-left relative overflow-hidden ${
                                    processMode === 'no-llm' ? 'border-highlight bg-highlight/10 shadow-sm' : 'border-border hover:border-highlight/40 bg-surface'
                                }`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 z-10 transition-colors ${processMode === 'no-llm' ? 'bg-highlight text-white shadow-md' : 'bg-surface-2 border border-border text-text-subtle'}`}>
                                    <BrainCircuit size={20} />
                                </div>
                                <div className="z-10">
                                    <span className={`block font-black uppercase tracking-wider text-sm ${processMode === 'no-llm' ? 'text-highlight' : 'text-text-primary'}`}>No LLM</span>
                                    <span className="text-[10px] font-bold text-text-subtle uppercase tracking-wider mt-0.5 block">Text-based pattern matching</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Model picker */}
                    {processMode === 'llm' && !hasLineList && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <h4 className="text-[11px] font-black text-text-subtle uppercase tracking-widest flex items-center justify-between mb-3">
                                <span className="flex items-center gap-2"><Sparkles size={14} className="text-brand" /> Intelligence Model</span>
                                {selectedLlm && <span className="text-[9px] px-2 py-0.5 bg-brand-muted text-brand rounded-full border border-brand/20">Provider: {PROVIDER_MAP[selectedLlm]}</span>}
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {LLM_OPTIONS.map((model) => (
                                    <button
                                        key={model}
                                        onClick={() => setSelectedLlm(model)}
                                        className={`px-4 py-3 rounded-xl font-black text-[11px] uppercase tracking-wider border transition-all cursor-pointer truncate ${
                                            selectedLlm === model ? 'border-brand bg-brand text-white shadow-md' : 'border-border text-text-muted hover:border-brand/40 bg-surface hover:bg-surface-2'
                                        }`}
                                        title={model}
                                    >
                                        {model}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pipeline Preview */}
                    {/* {processMode && (
                        <div className="animate-in fade-in duration-300">
                            <h4 className="text-[11px] font-black text-text-subtle uppercase tracking-widest mb-3">Execution Pipeline</h4>
                            <PipelinePreview processMode={processMode} hasLineList={hasLineList} selectedLlm={selectedLlm} />
                        </div>
                    )} */}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border bg-surface shrink-0 flex items-center justify-end gap-3 z-10 relative">
                    <button onClick={onClose} className="px-6 py-3.5 rounded-xl hover:bg-surface-2 border border-transparent hover:border-border text-text-muted hover:text-text-primary font-black text-xs uppercase tracking-wider transition-colors cursor-pointer">Cancel</button>
                    <button
                        disabled={startDisabled}
                        onClick={onStart}
                        className="px-8 py-3.5 rounded-xl bg-text-primary hover:bg-brand text-surface hover:text-white font-black text-xs uppercase tracking-wider shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer group"
                    >
                        <Play size={13} className="group-hover:translate-x-0.5 transition-transform" /> Start Extraction Run
                    </button>
                </div>
        </Modal>
    );
}
