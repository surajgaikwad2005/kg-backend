'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import { LayoutDashboard, Box, FlaskConical, Rocket, Database, GitBranch, MoveRight, RotateCcw, RotateCw, ChevronDown, X, FileCode, Zap, Terminal } from 'lucide-react';

import { Select } from '@/src/components/ui/Select';
import VisualPipelineCanvas from '@/src/components/pipeline-builder/VisualPipelineCanvas';
import PipelineConsole from '@/src/components/pipeline-builder/PipelineConsole';
import { OverviewTab }    from './_tabs/OverviewTab';
import { ModelsTab }      from './_tabs/ModelsTab';
import { ExperimentsTab } from './_tabs/ExperimentsTab';
import { DeploymentsTab } from './_tabs/DeploymentsTab';
import { PipelinesTab }   from './_tabs/PipelinesTab';
import { ArtifactsTab }   from './_tabs/ArtifactsTab';
import { useMLModelPage, DEFAULT_CODE } from './_hooks/useMLModelPage';

const Editor = dynamic(() => import('@monaco-editor/react'), {
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full w-full text-text-muted text-sm">Loading editor…</div>,
});

const NAV_ITEMS = [
    { name: 'Overview',    icon: LayoutDashboard },
    { name: 'Models',      icon: Box },
    { name: 'Pipelines',   icon: GitBranch },
    { name: 'Experiments', icon: FlaskConical },
    { name: 'Deployments', icon: Rocket },
    { name: 'Artifacts',   icon: Database },
];

export default function MLModelDashboard() {
    const p = useMLModelPage();

    return (
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-canvas relative">

            {/* ── Visual Pipeline Builder overlay ─────────────────────────── */}
            {p.isPipelineBuilderOpen && (
                <div className="absolute inset-0 z-50 bg-canvas flex flex-col overflow-hidden">
                    <header className="px-6 py-4 bg-surface border-b border-border flex justify-between items-center shadow-sm z-10">
                        <div className="flex items-center gap-4">
                            <button onClick={() => p.setIsPipelineBuilderOpen(false)} className="text-text-muted hover:text-text-primary p-1 bg-surface-2 rounded-md cursor-pointer">
                                <MoveRight className="w-5 h-5 rotate-180" />
                            </button>
                            <div>
                                <h2 className="text-xl font-bold text-text-primary">Custom Pipeline Builder</h2>
                                <p className="text-sm text-text-muted">Drag and drop nodes to configure your pipeline</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="flex border border-border rounded-lg overflow-hidden">
                                <button onClick={p.handleUndo} disabled={!p.history.length} aria-label="Undo" className={`flex items-center justify-center w-10 h-10 border-r border-border transition-all cursor-pointer ${!p.history.length ? 'opacity-40 cursor-not-allowed bg-surface-2' : 'text-text-secondary hover:bg-surface-2'}`}><RotateCcw className="w-4 h-4" /></button>
                                <button onClick={p.handleRedo} disabled={!p.redoStack.length} aria-label="Redo" className={`flex items-center justify-center w-10 h-10 transition-all cursor-pointer ${!p.redoStack.length ? 'opacity-40 cursor-not-allowed bg-surface-2' : 'text-text-secondary hover:bg-surface-2'}`}><RotateCw className="w-4 h-4" /></button>
                            </div>
                            <button onClick={p.handleVisualTestRun} disabled={p.isTestRunning || !p.nodes.length} aria-busy={p.isTestRunning} className={`flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-base font-medium transition-colors cursor-pointer ${p.isTestRunning || !p.nodes.length ? 'text-text-subtle cursor-not-allowed bg-surface-2' : 'text-text-secondary hover:bg-surface-2'}`}>
                                <Zap className="w-4 h-4 text-warning" />{p.isTestRunning ? 'Running...' : 'Test Run'}
                            </button>
                            <button onClick={p.handleSaveVisualPipeline} disabled={p.isSaving || !p.isRunSuccessful} className={`px-4 py-2 text-white rounded-lg text-base font-medium transition-colors cursor-pointer ${!p.isRunSuccessful || p.isSaving ? 'bg-brand/40 cursor-not-allowed opacity-50' : 'bg-brand hover:bg-brand-hover'}`}>
                                {p.isSaving ? 'Saving...' : 'Save Pipeline'}
                            </button>
                        </div>
                    </header>
                    <VisualPipelineCanvas
                        nodes={p.nodes} setNodes={p.setNodes}
                        edges={p.edges} setEdges={p.setEdges}
                        selectedNodeId={p.selectedNodeId} setSelectedNodeId={p.setSelectedNodeId}
                        tools={p.availableTools.map(t => ({ id: t.id, label: t.name || t.label || t.id, type: t.type || 'transform', description: t.desc || t.description || '', defaultConfig: t.default_config || t.defaultConfig || {}, configSchema: t.config_schema || t.configSchema || {} }))}
                        pushToHistory={p.pushToHistory}
                    />
                    <PipelineConsole isOpen={p.isConsoleOpen} onClose={() => p.setIsConsoleOpen(false)} output={p.testRunOutput} onClear={() => p.setTestRunOutput('')} />
                </div>
            )}

            {/* ── Code Builder overlay ─────────────────────────────────────── */}
            {p.isCodeBuilderOpen && (
                <div className="absolute inset-0 z-50 bg-canvas flex flex-col">
                    <header className="px-6 py-4 bg-surface border-b border-border flex justify-between items-center shadow-sm z-10">
                        <div className="flex items-center gap-4">
                            <button onClick={() => { p.setIsCodeBuilderOpen(false); p.setEditingPipelineId(null); p.setPipelineCode(DEFAULT_CODE); }} className="text-text-muted hover:text-text-primary p-1 bg-surface-2 rounded-md cursor-pointer"><MoveRight className="w-5 h-5 rotate-180" /></button>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-bold text-text-primary leading-tight">Pipeline Code Builder</h2>
                                    <span className="px-2 py-0.5 bg-brand-muted text-brand text-caption font-bold rounded border border-brand/20 uppercase tracking-wider">Experimental</span>
                                </div>
                                <p className="text-sm text-text-muted flex items-center gap-1.5 mt-0.5">
                                    <FileCode className="w-4 h-4 text-brand" /> Custom Python Scripting for Data Logic
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={p.handleTestRun} disabled={p.isTestRunning} aria-busy={p.isTestRunning} className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-base font-medium text-text-secondary hover:bg-surface-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                                <Zap className="w-4 h-4 text-warning" />{p.isTestRunning ? 'Running...' : 'Test Run'}
                            </button>
                            <button onClick={p.handleSaveCodePipeline} disabled={p.isSaving || !p.isRunSuccessful} className="px-6 py-2 bg-brand text-white rounded-lg text-base font-semibold hover:bg-brand-hover transition-all shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                                {p.isSaving ? 'Saving...' : 'Save Pipeline'}
                            </button>
                        </div>
                    </header>

                    <div className="flex-1 flex overflow-hidden bg-surface">
                        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                            <div className="flex-1 flex overflow-hidden min-h-0">
                                <div className="flex-1 relative bg-surface overflow-hidden py-4">
                                    <Editor
                                        height="100%" defaultLanguage="python"
                                        value={p.pipelineCode || ''} onChange={v => p.setPipelineCode(v || '')}
                                        onMount={p.handleEditorDidMount} theme="vs-light"
                                        options={{ minimap: { enabled: false }, fontSize: 15, fontFamily: "'JetBrains Mono', 'Fira Code', 'Roboto Mono', monospace", wordWrap: 'on', lineNumbersMinChars: 3, scrollBeyondLastLine: false, padding: { top: 8 }, tabSize: 4, insertSpaces: true, detectIndentation: false, automaticLayout: true, inlineSuggest: { enabled: true }, suggestOnTriggerCharacters: true, quickSuggestions: { other: true, comments: true, strings: true } }}
                                    />
                                </div>
                            </div>
                            {p.isConsoleOpen && (
                                <div style={{ height: p.consoleHeight }} className="border-t border-border bg-surface flex flex-col relative shrink-0 shadow-card">
                                    <div className="absolute top-0 left-0 right-0 h-1 cursor-row-resize hover:bg-brand transition-colors z-30" onMouseDown={e => { e.preventDefault(); p.setIsResizingConsole(true); }} />
                                    <div className="px-4 py-2 bg-surface-2 border-b border-border flex justify-between items-center shrink-0">
                                        <div className="flex items-center gap-2"><Terminal className="w-4 h-4 text-text-muted" /><span className="text-caption font-bold text-text-secondary uppercase tracking-wider">Console Output</span></div>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => p.setTestRunOutput('')} className="px-2 py-1 text-caption font-bold text-text-muted hover:text-text-primary hover:bg-surface-2 rounded transition-colors cursor-pointer">Clear</button>
                                            <button onClick={() => p.setIsConsoleOpen(false)} aria-label="Close console" className="p-1 text-text-subtle hover:text-text-secondary rounded transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-4 font-mono text-body-sm leading-relaxed thin-scrollbar">
                                        {p.testRunOutput ? (
                                            <div className="whitespace-pre-wrap wrap-break-word">
                                                {(p.testRunOutput || '').split('\n').map((line, i) => {
                                                    let color = 'text-text-secondary';
                                                    if (line.includes('Error') || line.includes('failed')) color = 'text-danger font-semibold';
                                                    if (line.includes('successful') || line.includes('Success')) color = 'text-success font-semibold';
                                                    if (line.includes('Starting')) color = 'text-brand font-medium';
                                                    return <div key={`line-${i}`} className={color}>{line}</div>;
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-text-subtle italic">No output to display. Run a test to see results.</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Config sidebar */}
                        <div className="bg-surface border-l border-border shadow-xl z-20 flex flex-col h-full relative shrink-0" style={{ width: p.sidebarWidth }}>
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 -translate-x-0.75 cursor-col-resize hover:bg-brand/50 z-50 transition-colors flex items-center justify-center group" onMouseDown={e => { e.preventDefault(); p.setIsResizingSidebar(true); }}>
                                <div className={`h-8 w-1 rounded-full transition-colors ${p.isResizingSidebar ? 'bg-brand' : 'bg-border group-hover:bg-brand/60'}`} />
                            </div>
                            <header className="px-5 py-4 border-b border-border flex justify-between items-center bg-surface-2">
                                <div><h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">Properties</h3><p className="text-xs text-text-muted font-medium">Pipeline metadata</p></div>
                            </header>
                            <div className="flex-1 overflow-y-auto p-5 space-y-6 thin-scrollbar">
                                <div className="space-y-4">
                                    <label className="text-caption font-bold text-text-subtle uppercase tracking-widest block">Details</label>
                                    <div className="space-y-1.5 text-sm">
                                        <label className="font-bold text-text-secondary">Pipeline Name</label>
                                        <input type="text" value={p.codeBuilderConfig.pipelineName} onChange={e => p.setCodeBuilderConfig({ ...p.codeBuilderConfig, pipelineName: e.target.value })} className="w-full p-2.5 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all shadow-sm" placeholder="Untitled Pipeline" />
                                    </div>
                                    <div className="space-y-1.5 text-sm">
                                        <label className="font-bold text-text-secondary">Description</label>
                                        <textarea value={p.codeBuilderConfig.description} onChange={e => p.setCodeBuilderConfig({ ...p.codeBuilderConfig, description: e.target.value })} className="w-full p-2.5 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all shadow-sm resize-none h-24" placeholder="demo" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-caption font-bold text-text-subtle uppercase tracking-widest block">Source Links</label>
                                    <div className="space-y-1.5 text-sm">
                                        <label className="font-bold text-text-secondary">Model ID</label>
                                        <Select
                                            value={p.codeBuilderConfig.modelId}
                                            onChange={(v) => p.setCodeBuilderConfig({ ...p.codeBuilderConfig, modelId: v, assetIds: [], tagIds: [] })}
                                            placeholder="Select a Model"
                                            searchable
                                            searchPlaceholder="Search models..."
                                            options={p.modelsList.map(m => ({ value: m.model_id.toString(), label: `${m.model_name} (ID: ${m.model_id})` }))}
                                        />
                                    </div>
                                    <div className="space-y-1.5 text-sm">
                                        <label className="font-bold text-text-secondary">Assets</label>
                                        <div className="relative">
                                            <div className={`w-full p-2.5 bg-surface border border-border rounded-lg outline-none transition-all shadow-sm cursor-pointer flex justify-between items-center ${!p.codeBuilderConfig.modelId ? 'opacity-50 bg-surface-2 pointer-events-none' : ''}`} onClick={() => p.codeBuilderConfig.modelId && p.setIsCodeBuilderAssetDropdownOpen(!p.isCodeBuilderAssetDropdownOpen)}>
                                                <span>{p.codeBuilderConfig.assetIds.length > 0 ? `${p.codeBuilderConfig.assetIds.length} assets selected` : 'Select assets...'}</span>
                                                <ChevronDown className="w-4 h-4 text-text-subtle pointer-events-none" />
                                            </div>
                                            {p.isCodeBuilderAssetDropdownOpen && p.codeBuilderConfig.modelId && (
                                                <div className="absolute top-full left-0 w-full mt-1 bg-surface border border-border rounded-lg shadow-lg z-20 py-1 max-h-48 overflow-y-auto thin-scrollbar">
                                                    {(p.modelsList.find(m => m.model_id.toString() === p.codeBuilderConfig.modelId)?.assets || []).map(asset => (
                                                        <label key={asset} className="flex items-center px-3 py-2 hover:bg-surface-2 cursor-pointer">
                                                            <input type="checkbox" className="rounded border-border text-brand focus:ring-brand mr-3 w-4 h-4 cursor-pointer" checked={p.codeBuilderConfig.assetIds.includes(asset)} onChange={e => p.setCodeBuilderConfig({ ...p.codeBuilderConfig, assetIds: e.target.checked ? [...p.codeBuilderConfig.assetIds, asset] : p.codeBuilderConfig.assetIds.filter(a => a !== asset) })} />
                                                            <span className="text-sm text-text-secondary font-mono">{asset}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 text-sm">
                                        <label className="font-bold text-text-secondary">Tags</label>
                                        <div className="relative">
                                            <div className={`w-full p-2.5 bg-surface border border-border rounded-lg outline-none transition-all shadow-sm cursor-pointer flex justify-between items-center ${p.codeBuilderConfig.assetIds.length === 0 ? 'opacity-50 bg-surface-2 pointer-events-none' : ''}`} onClick={() => p.codeBuilderConfig.assetIds.length > 0 && p.setIsCodeBuilderTagDropdownOpen(!p.isCodeBuilderTagDropdownOpen)}>
                                                <span>{p.codeBuilderConfig.tagIds.length > 0 ? `${p.codeBuilderConfig.tagIds.length} tags selected` : 'Select tags...'}</span>
                                                <ChevronDown className="w-4 h-4 text-text-subtle pointer-events-none" />
                                            </div>
                                            {p.isCodeBuilderTagDropdownOpen && p.codeBuilderConfig.assetIds.length > 0 && (
                                                <div className="absolute top-full left-0 w-full mb-1 bg-surface border border-border rounded-lg shadow-lg z-20 py-1 max-h-48 overflow-y-auto thin-scrollbar">
                                                    {(p.modelsList.find(m => m.model_id.toString() === p.codeBuilderConfig.modelId)?.tags || []).map(tag => (
                                                        <label key={tag} className="flex items-center px-3 py-2 hover:bg-surface-2 cursor-pointer">
                                                            <input type="checkbox" className="rounded border-border text-brand focus:ring-brand mr-3 w-4 h-4 cursor-pointer" checked={p.codeBuilderConfig.tagIds.includes(tag)} onChange={e => p.setCodeBuilderConfig({ ...p.codeBuilderConfig, tagIds: e.target.checked ? [...p.codeBuilderConfig.tagIds, tag] : p.codeBuilderConfig.tagIds.filter(t => t !== tag) })} />
                                                            <span className="text-sm text-text-secondary font-mono">{tag}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 text-sm">
                                        <label className="font-bold text-text-secondary">Test Run Range</label>
                                        <div className="relative">
                                            <div className="w-full p-2.5 bg-surface border border-border rounded-lg outline-none transition-all shadow-sm cursor-pointer flex justify-between items-center" onClick={() => { p.setTempTimeWindow({ start: p.codeBuilderConfig.startDate, end: p.codeBuilderConfig.endDate }); p.setIsCodeBuilderTimeDropdownOpen(!p.isCodeBuilderTimeDropdownOpen); }}>
                                                <span>{p.codeBuilderConfig.startDate && p.codeBuilderConfig.endDate ? `${new Date(p.codeBuilderConfig.startDate).toLocaleDateString()} - ${new Date(p.codeBuilderConfig.endDate).toLocaleDateString()}` : 'Select Time Window'}</span>
                                                <ChevronDown className="w-4 h-4 text-text-subtle pointer-events-none" />
                                            </div>
                                            {p.isCodeBuilderTimeDropdownOpen && (
                                                <div className="absolute top-full right-0 w-80 mb-2 p-5 bg-surface border border-border rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2">
                                                    <h4 className="text-sm font-bold text-text-primary mb-4 pb-3 border-b border-border">Select Time Window</h4>
                                                    <div className="space-y-4 mb-6">
                                                        <div>
                                                            <label className="text-xs font-bold text-text-muted mb-1.5 block">Start Time</label>
                                                            <input type="datetime-local" value={p.tempTimeWindow.start} onChange={e => p.setTempTimeWindow({ ...p.tempTimeWindow, start: e.target.value })} className="w-full p-2.5 bg-surface-2 border border-border rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all text-text-secondary text-sm" />
                                                        </div>
                                                        <div>
                                                            <label className="text-xs font-bold text-text-muted mb-1.5 block">End Time</label>
                                                            <input type="datetime-local" value={p.tempTimeWindow.end} onChange={e => p.setTempTimeWindow({ ...p.tempTimeWindow, end: e.target.value })} className="w-full p-2.5 bg-surface-2 border border-border rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all text-text-secondary text-sm" />
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3 justify-end pt-4 border-t border-border">
                                                        <button onClick={() => p.setIsCodeBuilderTimeDropdownOpen(false)} className="px-4 py-2 bg-surface border border-border rounded-lg text-xs font-bold text-text-secondary hover:bg-surface-2 transition-colors cursor-pointer">Cancel</button>
                                                        <button onClick={() => { p.setCodeBuilderConfig({ ...p.codeBuilderConfig, startDate: p.tempTimeWindow.start, endDate: p.tempTimeWindow.end }); p.setIsCodeBuilderTimeDropdownOpen(false); }} className="px-4 py-2 bg-brand text-white rounded-lg text-xs font-bold hover:bg-brand-hover transition-colors shadow-sm cursor-pointer">Apply window</button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Sub-nav ─────────────────────────────────────────────────── */}
            <div className="bg-surface border-y border-border shrink-0 px-8">
                <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
                    {NAV_ITEMS.map(item => (
                        <button key={item.name} onClick={() => p.setActiveTab(item.name)} className={`flex items-center gap-2 py-4 border-b-2 text-base font-medium whitespace-nowrap transition-colors cursor-pointer ${p.activeTab === item.name ? 'border-brand text-brand' : 'border-transparent text-text-muted hover:text-text-primary hover:border-border'}`}>
                            <item.icon className="w-4 h-4" />{item.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Tab content ─────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-8 thin-scrollbar">
                {p.activeTab === 'Overview'     && <OverviewTab overviewStats={p.overviewStats} isMounted={p.isMounted} />}
                {p.activeTab === 'Models'       && <ModelsTab modelsList={p.modelsList} modelsLoading={p.modelsLoading} modelsError={p.modelsError} assetList={p.assetList} modelOptions={p.modelOptions} modelOptionsLoading={p.modelOptionsLoading} onRefresh={p.fetchModelList} />}
                {p.activeTab === 'Experiments'  && <ExperimentsTab experimentsList={p.experimentsList} isExperimentsLoading={p.isExperimentsLoading} modelsList={p.modelsList} pipelinesList={p.pipelinesList} onRefresh={p.fetchExperimentList} />}
                {p.activeTab === 'Deployments'  && <DeploymentsTab experimentsList={p.experimentsList} />}
                {p.activeTab === 'Pipelines'    && <PipelinesTab pipelinesList={p.pipelinesList} isPipelinesLoading={p.isPipelinesLoading} availableTools={p.availableTools} reconstructFlowchartFromSteps={p.reconstructFlowchartFromSteps} onDeletePipeline={p.handleDeletePipeline} onOpenVisualBuilder={p.handleOpenVisualBuilder} onOpenCodeBuilder={p.handleOpenCodeBuilder} />}
                {p.activeTab === 'Artifacts'    && <ArtifactsTab artifactsList={p.artifactsList} artifactsLoading={p.artifactsLoading} artifactsError={p.artifactsError} assetList={p.assetList} onRefresh={p.fetchArtifactList} />}
            </div>
        </div>
    );
}
