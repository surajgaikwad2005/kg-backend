'use client';
import React from 'react';
import dynamic from 'next/dynamic';
const Editor = dynamic(() => import('@monaco-editor/react'), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full w-full text-text-muted text-body-sm">Loading editor…</div>,
});
import { LayoutDashboard, Box, GitBranch, FlaskConical, MoveRight, RotateCcw, RotateCw, X, Terminal } from 'lucide-react';

import VisualPipelineCanvas from '@/src/components/pipeline-builder/VisualPipelineCanvas';
import PipelineConsole from '@/src/components/pipeline-builder/PipelineConsole';
import { ForecastOverview } from './_components/ForecastOverview';
import { ForecastModels } from './_components/ForecastModels';
import { ForecastPipelines } from './_components/ForecastPipelines';
import { ForecastExperiments } from './_components/ForecastExperiments';
import { useForecastPage } from './_hooks/useForecastPage';

const navItems = [
    { name: 'Overview', icon: LayoutDashboard },
    { name: 'Models', icon: Box },
    { name: 'Pipelines', icon: GitBranch },
    { name: 'Experiments', icon: FlaskConical },
];

export default function ForecastStudio() {
    const p = useForecastPage();

    const pipelineBuilderProps = {
        pipelinesList: p.pipelinesList, isPipelinesLoading: p.isPipelinesLoading, availableTools: p.availableTools,
        reconstructFlowchartFromSteps: p.reconstructFlowchartFromSteps, onDeletePipeline: p.handleDeletePipeline,
        onOpenVisualBuilder: p.handleOpenVisualBuilder, onOpenCodeBuilder: p.handleOpenCodeBuilder, onRefresh: p.fetchPipelineList,
    };

    return (
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-canvas relative">

            {/* Visual Pipeline Builder */}
            {p.isPipelineBuilderOpen && (
                <div className="absolute inset-0 z-50 bg-canvas flex flex-col overflow-hidden">
                    <header className="px-6 py-4 bg-surface border-b border-border flex justify-between items-center shadow-sm z-10">
                        <div className="flex items-center gap-4">
                            <button aria-label="Close pipeline builder" onClick={() => p.setIsPipelineBuilderOpen(false)} className="text-text-muted hover:text-text-primary p-1 bg-surface-2 rounded-md cursor-pointer">
                                <MoveRight className="w-5 h-5 rotate-180" />
                            </button>
                            <div>
                                <h2 className="text-[20px] font-bold text-text-primary">Forecast Pipeline Builder</h2>
                                <p className="text-sm text-text-muted">Drag and drop nodes to configure your pipeline</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="flex border border-border rounded-lg overflow-hidden">
                                <button onClick={p.handleUndo} disabled={!p.history.length} className="flex items-center gap-1.5 px-3 py-2 bg-surface text-text-secondary hover:bg-canvas text-body-sm font-medium disabled:opacity-40 border-r border-border cursor-pointer">
                                    <RotateCcw className="w-3.5 h-3.5" /> Undo
                                </button>
                                <button onClick={p.handleRedo} disabled={!p.redoStack.length} className="flex items-center gap-1.5 px-3 py-2 bg-surface text-text-secondary hover:bg-canvas text-body-sm font-medium disabled:opacity-40 cursor-pointer">
                                    <RotateCw className="w-3.5 h-3.5" /> Redo
                                </button>
                            </div>
                            <button onClick={p.handleVisualTestRun} disabled={p.isTestRunning} aria-busy={p.isTestRunning} className="px-4 py-2 bg-success text-white rounded-lg text-body-sm font-bold hover:bg-success/90 disabled:opacity-50 cursor-pointer">
                                {p.isTestRunning ? 'Running...' : '▶ Test Run'}
                            </button>
                            <button onClick={p.handleSaveVisualPipeline} disabled={p.isSaving} aria-busy={p.isSaving} className="px-4 py-2 bg-brand text-white rounded-lg text-body-sm font-bold hover:bg-brand-hover disabled:opacity-50 cursor-pointer">
                                {p.isSaving ? 'Saving...' : 'Save Pipeline'}
                            </button>
                        </div>
                    </header>
                    <div className="flex-1 overflow-hidden">
                        <VisualPipelineCanvas
                            nodes={p.nodes} setNodes={p.setNodes}
                            edges={p.edges} setEdges={p.setEdges}
                            selectedNodeId={p.selectedNodeId} setSelectedNodeId={p.setSelectedNodeId}
                            availableTools={p.availableTools}
                            modelsList={p.modelsList} assetList={p.assetList}
                            pushToHistory={p.pushToHistory}
                        />
                    </div>
                    {p.isConsoleOpen && (
                        <div style={{ height: p.consoleHeight }} className="border-t border-border flex flex-col bg-overlay text-white overflow-hidden shrink-0">
                            <div className="flex items-center justify-between px-4 py-2 border-b border-overlay-hover cursor-ns-resize" onMouseDown={() => p.setIsResizingConsole(true)}>
                                <div className="flex items-center gap-2"><Terminal className="w-4 h-4 text-success" /><span className="text-body-sm font-bold">Console</span></div>
                                <button aria-label="Close console" onClick={() => p.setIsConsoleOpen(false)} className="text-white/60 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
                            </div>
                            <PipelineConsole output={p.testRunOutput} isRunning={p.isTestRunning} />
                        </div>
                    )}
                </div>
            )}

            {/* Code Builder */}
            {p.isCodeBuilderOpen && (
                <div className="absolute inset-0 z-50 bg-surface flex overflow-hidden">
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <header className="px-6 py-4 bg-surface border-b border-border flex justify-between items-center shadow-sm">
                            <div className="flex items-center gap-4">
                                <button aria-label="Close code builder" onClick={() => p.setIsCodeBuilderOpen(false)} className="text-text-muted hover:text-text-primary p-1 bg-surface-2 rounded-md cursor-pointer">
                                    <MoveRight className="w-5 h-5 rotate-180" />
                                </button>
                                <div>
                                    <h2 className="text-[20px] font-bold text-text-primary">Code Builder</h2>
                                    <p className="text-sm text-text-muted">Write Python preprocessing code for your forecast pipeline</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={p.handleTestRun} disabled={p.isTestRunning} aria-busy={p.isTestRunning} className="px-4 py-2 bg-success text-white rounded-lg text-body-sm font-bold hover:bg-success/90 disabled:opacity-50 cursor-pointer">
                                    {p.isTestRunning ? 'Running...' : '▶ Test Run'}
                                </button>
                                <button onClick={p.handleSaveCodePipeline} disabled={p.isSaving || !p.isRunSuccessful} aria-busy={p.isSaving} className="px-4 py-2 bg-brand text-white rounded-lg text-body-sm font-bold hover:bg-brand-hover disabled:opacity-50 cursor-pointer">
                                    {p.isSaving ? 'Saving...' : 'Save Pipeline'}
                                </button>
                            </div>
                        </header>
                        <div className="flex-1 overflow-hidden">
                            <Editor
                                height="100%"
                                language="python"
                                value={p.pipelineCode}
                                onChange={v => p.setPipelineCode(v || '')}
                                onMount={p.handleEditorDidMount}
                                options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false, automaticLayout: true, inlineSuggest: { enabled: true }, wordWrap: 'on' }}
                            />
                        </div>
                        {p.isConsoleOpen && (
                            <div style={{ height: p.consoleHeight }} className="border-t border-overlay-hover flex flex-col bg-overlay text-white overflow-hidden shrink-0">
                                <div className="flex items-center justify-between px-4 py-2 border-b border-overlay-hover cursor-ns-resize" onMouseDown={() => p.setIsResizingConsole(true)}>
                                    <div className="flex items-center gap-2"><Terminal className="w-4 h-4 text-success" /><span className="text-body-sm font-bold">Console</span></div>
                                    <button aria-label="Close console" onClick={() => p.setIsConsoleOpen(false)} className="text-white/60 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
                                </div>
                                <PipelineConsole output={p.testRunOutput} isRunning={p.isTestRunning} />
                            </div>
                        )}
                    </div>
                    <div style={{ width: p.sidebarWidth }} className="border-l border-border bg-canvas flex flex-col overflow-hidden shrink-0">
                        <div className="cursor-col-resize w-1 absolute top-0 bottom-0 bg-transparent hover:bg-brand/60 transition-colors" style={{ left: `calc(100% - ${p.sidebarWidth}px - 2px)` }} onMouseDown={() => p.setIsResizingSidebar(true)} />
                        <div className="p-4 border-b border-border bg-surface">
                            <h3 className="text-sm font-bold text-text-primary mb-3">Pipeline Configuration</h3>
                            <div className="space-y-3">
                                <div>
                                    <label htmlFor="forecast-code-pipeline-name" className="text-caption font-bold text-text-muted uppercase tracking-wider">Pipeline Name</label>
                                    <input id="forecast-code-pipeline-name" type="text" className="mt-1 w-full px-3 py-2 border border-border rounded-lg text-body-sm" value={p.codeBuilderConfig.pipelineName || ''} onChange={e => p.setCodeBuilderConfig(prev => ({ ...prev, pipelineName: e.target.value }))} placeholder="e.g. Forecast_Pipeline" />
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            <p className="text-xs text-text-subtle text-center mt-8">Configure tags and time range for your test run.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="bg-surface border-b border-border px-8 shrink-0">
                <nav className="flex items-center gap-1">
                    {navItems.map(item => (
                        <button key={item.name} onClick={() => p.setActiveTab(item.name)} className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${p.activeTab === item.name ? 'border-brand text-brand' : 'border-transparent text-text-muted hover:text-text-primary hover:border-border-strong'}`}>
                            <item.icon className={`w-4 h-4 ${p.activeTab === item.name ? 'text-brand' : 'text-text-subtle'}`} />
                            {item.name}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
                {p.activeTab === 'Overview' && <ForecastOverview kpis={p.overviewStats} />}
                {p.activeTab === 'Models' && <ForecastModels plantCode={p.plantCode} modelsList={p.modelsList} modelsLoading={p.modelsLoading} modelsError={p.modelsError} assetList={p.assetList} modelOptions={p.modelOptions} modelOptionsLoading={p.modelOptionsLoading} onRefresh={p.fetchModelList} />}
                {p.activeTab === 'Pipelines' && <ForecastPipelines {...pipelineBuilderProps} />}
                {p.activeTab === 'Experiments' && <ForecastExperiments plantCode={p.plantCode} experimentsList={p.experimentsList} isExperimentsLoading={p.isExperimentsLoading} modelsList={p.modelsList} pipelinesList={p.pipelinesList} onRefresh={p.fetchExperimentList} />}
            </div>
        </div>
    );
}
