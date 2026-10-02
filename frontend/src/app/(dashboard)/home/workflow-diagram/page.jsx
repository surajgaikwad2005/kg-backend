'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import { Workflow, Loader2 } from 'lucide-react';
import { WorkflowDataProvider } from '@/src/context/workflow-management/WorkflowContext';

const WorkflowCanvas = dynamic(() => import('./_components/WorkflowCanvas'), {
    ssr: false,
    loading: () => (
        <div className="flex-1 flex items-center justify-center bg-surface">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-brand animate-spin" />
                <p className="text-caption font-bold text-text-muted uppercase tracking-widest">Loading Canvas...</p>
            </div>
        </div>
    ),
});

export default function WorkflowDiagramPage() {
    return (
        <WorkflowDataProvider>
            <>
                {/* Header */}
                <header className="h-14 border-b border-border flex items-center justify-between px-5 bg-surface z-30 shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-brand/10 border border-brand/20 rounded-lg">
                                <Workflow className="w-5 h-5 text-brand" />
                            </div>
                            <div>
                                <h1 className="text-body-sm font-black text-text-primary tracking-tight uppercase">
                                    Workflow Diagram Builder
                                </h1>
                                <p className="text-2xs text-text-muted font-bold tracking-widest uppercase">
                                    Industrial P&ID Canvas
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 text-label text-text-muted">
                            {[
                                { key: 'Scroll', action: 'zoom' },
                                { key: 'Drag',   action: 'pan' },
                                { key: 'Click→Click', action: 'connect' },
                                { key: 'Dbl-click',   action: 'rename' },
                            ].map(({ key, action }) => (
                                <span key={action} className="hidden md:flex items-center gap-1.5">
                                    <kbd className="bg-surface-2 border border-border text-text-secondary px-1.5 py-0.5 rounded text-2xs font-mono font-semibold">
                                        {key}
                                    </kbd>
                                    <span className="text-text-subtle">{action}</span>
                                </span>
                            ))}
                        </div>
                    </header>

                    <div className="flex-1 flex overflow-hidden">
                        <WorkflowCanvas />
                    </div>
            </>
        </WorkflowDataProvider>
    );
}
