"use client";
import React from "react";
import MarkmapComponent from "../_components/MarkmapComponent";
import { Binary, Terminal, Loader2, RefreshCcw, Plus, ArrowLeft, Edit3, Save, PlusCircle, Upload } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { ResponsiveGridLayout, useContainerWidth } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import { PanelHeader } from '../_components/PanelHeader';
import { RiskTemplateChat } from '../_components/RiskTemplateChat';
import { UploadRiskTemplateModal } from '../_components/UploadRiskTemplateModal';
import { EquipmentConfigModal } from '../_components/EquipmentConfigModal';
import { CreateRiskTemplateModal } from '../_components/CreateRiskTemplateModal';
import { CreateTableView } from '../_components/CreateTableView';
import { MarkdownForge } from '../_components/MarkdownForge';
import { useRiskTemplatePage, INITIAL_LAYOUTS } from './_hooks/useRiskTemplatePage';

export default function RiskTemplateDetailPage() {
    const p = useRiskTemplatePage();
    const { width, containerRef, mounted } = useContainerWidth();

    return (<>
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-surface border-b border-border shrink-0 gap-3">
            <div className="flex items-center gap-2">
                <button onClick={p.backAction} className="flex items-center justify-center w-9 h-9 bg-surface-2 border border-border hover:bg-surface hover:shadow-card rounded-xl transition-all duration-200 group cursor-pointer">
                    <ArrowLeft className="w-4 h-4 text-text-muted group-hover:-translate-x-0.5 transition-transform" />
                </button>
            </div>

            <div className="flex items-center gap-2">
                {p.localViewMode === 'details' && (
                    <>
                        <button onClick={p.handleEditToken} className={cn('flex items-center gap-2 px-3.5 py-2 rounded-xl text-caption font-black uppercase tracking-wider transition-all border-2 cursor-pointer', p.isEditing ? 'bg-success border-success text-white hover:opacity-90' : 'bg-surface border-border text-text-primary hover:border-border-strong hover:shadow-card')}>
                            {p.isEditing ? <Save className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                            {p.isEditing ? 'Save Knowledge' : 'Edit Rules'}
                        </button>
                        <button onClick={p.resetToDefault} className="flex items-center gap-2 px-3.5 py-2 bg-surface border-2 border-border rounded-xl text-caption font-black text-text-primary hover:border-border-strong hover:shadow-card transition-all uppercase tracking-wider cursor-pointer">
                            <RefreshCcw className="w-3.5 h-3.5" /> Reset
                        </button>
                    </>
                )}

                <div className="relative" ref={p.dropdownRef}>
                    <button onClick={() => p.setShowRulesDropdown(prev => !prev)} disabled={p.isGenerating} className="flex items-center gap-2 px-4 py-2 bg-text-primary text-surface rounded-xl text-caption font-black uppercase tracking-wider hover:opacity-90 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                        <Plus className="w-4 h-4" /> Select Templates
                    </button>
                    {p.showRulesDropdown && (
                        <div className="absolute right-0 mt-2 w-56 bg-surface rounded-2xl shadow-modal border border-border z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                            <div className="p-1.5 space-y-0.5">
                                <button onClick={() => { p.setShowCreateModal(true); p.setShowRulesDropdown(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-surface-2 rounded-xl transition-colors group cursor-pointer">
                                    <div className="p-2 bg-brand-muted text-brand rounded-lg group-hover:bg-brand group-hover:text-white transition-colors shrink-0"><PlusCircle className="w-4 h-4" /></div>
                                    <div><p className="text-caption font-black text-text-primary">Create Template</p><p className="text-2xs font-medium text-text-muted">Build manual logic</p></div>
                                </button>
                                <button onClick={() => { p.setShowUploadModal(true); p.setShowRulesDropdown(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-surface-2 rounded-xl transition-colors group cursor-pointer">
                                    <div className="p-2 bg-brand-muted text-brand rounded-lg group-hover:bg-brand group-hover:text-white transition-colors shrink-0"><Upload className="w-4 h-4" /></div>
                                    <div><p className="text-caption font-black text-text-primary">Upload Templates</p><p className="text-2xs font-medium text-text-muted">Excel or CSV source</p></div>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Modals */}
        {p.showUploadModal && <UploadRiskTemplateModal onClose={() => p.setShowUploadModal(false)} onConfig={p.handleUploadConfig} />}
        {p.showEquipmentModal && p.equipmentModalData && (
            <EquipmentConfigModal tableName={p.equipmentModalData.tableName} tableData={p.equipmentModalData.tableData} file={p.equipmentModalData.file} onClose={() => { p.setShowEquipmentModal(false); p.setEquipmentModalData(null); }} onSuccess={p.applyNewTemplate} />
        )}
        {p.showCreateModal && <CreateRiskTemplateModal onClose={() => p.setShowCreateModal(false)} onConfirm={p.handleCreateConfirm} />}

        {/* Main content */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto thin-scrollbar min-h-0" ref={containerRef}>
            {mounted && (
                p.localViewMode === 'create' ? (
                    <CreateTableView ruleName={p.createTemplateName} onStoreKnowledge={p.handleStoreKnowledge} />
                ) : (
                    <ResponsiveGridLayout
                        width={width}
                        layouts={INITIAL_LAYOUTS}
                        onLayoutChange={(_, allLayouts) => p.setLayouts(allLayouts)}
                        breakpoints={{ lg: 1200, md: 996 }}
                        cols={{ lg: 12, md: 10 }}
                        rowHeight={100}
                        dragConfig={{ handle: '.drag-handle' }}
                        margin={[24, 24]}
                    >
                        <div key="markmap" className="bg-surface rounded-xl border border-border shadow-card flex flex-col overflow-hidden relative">
                            <PanelHeader title={p.templateName} icon={Terminal} titleClassName="text-body-sm" />
                            <div className="flex-1 p-4 relative min-h-0">
                                <div className={cn('w-full h-full relative rounded-xl border border-border bg-surface-2/30 overflow-hidden transition-opacity', (p.isGenerating || p.loadingNodeOp) && 'opacity-40 grayscale-[0.5]')}>
                                    {p.isEditing ? (
                                        <MarkdownForge tempMarkdown={p.tempMarkdown} onUpdate={p.forgeUpdateNode} onAdd={p.forgeAddNode} onDelete={p.forgeDeleteNode} onAddRoot={() => p.setMarkdown(prev => prev + '\n- New Root Mechanism')} />
                                    ) : (
                                        <MarkmapComponent markdown={p.markdown} ruleKey={p.templateName} fitKey={p.resetKey} onDeleteNode={p.handleDeleteNode} onRenameNode={p.handleRenameNode} />
                                    )}
                                    {(p.isGenerating || p.loadingNodeOp) && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface/20 backdrop-blur-sm z-50">
                                            <div className="w-16 h-16 relative">
                                                <Loader2 className="w-16 h-16 text-brand animate-spin absolute inset-0" />
                                                <Binary className="w-6 h-6 text-brand absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                                            </div>
                                            <p className="mt-4 text-body-sm font-black text-text-primary uppercase tracking-widest">{p.loadingNodeOp ? 'Updating Knowledge…' : 'Processing Data…'}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </ResponsiveGridLayout>
                )
            )}
        </div>

        {p.localViewMode === 'details' && <RiskTemplateChat templateName={p.templateName} onResult={p.setMarkdown} />}
    </>);
}
