'use client';
import React, { useState, useCallback, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import WorkflowBuilder from './components/WorkflowBuilder';
import CreateTemplateModal from './components/CreateTemplateModal';
import { WorkflowsTable } from './components/WorkflowsTable';
import { DecisionTemplateTabs } from './components/DecisionTemplateTabs';
import { LibraryComingSoon } from './components/LibraryComingSoon';
import { useWorkflows } from './hooks/useWorkflows';
import { Plus, Search, ChevronDown, AlertCircle, RefreshCw } from 'lucide-react';

export default function DecisionTemplatePage() {
    return (
        <Suspense>
            <DecisionTemplateContent />
        </Suspense>
    );
}

function DecisionTemplateContent() {
    const router = useRouter();
    const urlSearchParams = useSearchParams();
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => { setIsMounted(true); }, []);

    const {
        workflows, loading, error, selectedWorkflow, setSelectedWorkflow, fetchWorkflows,
        deleteWorkflow, loadWorkflowForEdit, editLoadingId, deletingId, noPlantSelected,
    } = useWorkflows();

    const [builderMounted, setBuilderMounted] = useState(false);
    const [builderVisible, setBuilderVisible] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [templateName, setTemplateName] = useState('');
    const [templateClass, setTemplateClass] = useState('');
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const searchQuery = urlSearchParams.get('q') || '';
    const setSearchQuery = (val) => {
        const params = new URLSearchParams(urlSearchParams.toString());
        if (val) params.set('q', val); else params.delete('q');
        router.replace(`?${params.toString()}`);
    };

    const activeTab = urlSearchParams.get('tab') || 'template';
    const setActiveTab = useCallback((tab) => {
        const params = new URLSearchParams(urlSearchParams.toString());
        if (tab && tab !== 'template') params.set('tab', tab); else params.delete('tab');
        router.replace(`?${params.toString()}`);
    }, [router, urlSearchParams]);

    const openBuilder = useCallback(() => {
        setBuilderMounted(true);
        requestAnimationFrame(() => requestAnimationFrame(() => setBuilderVisible(true)));
    }, []);

    const closeBuilder = useCallback(() => {
        setBuilderVisible(false);
        setTimeout(() => {
            setBuilderMounted(false);
            setSelectedWorkflow(null);
            setTemplateName('');
            setTemplateClass('');
        }, 300);
    }, [setSelectedWorkflow]);

    const openModal = useCallback(() => {
        setIsModalOpen(true);
        requestAnimationFrame(() => requestAnimationFrame(() => setIsModalVisible(true)));
    }, []);

    const closeModal = useCallback(() => {
        setIsModalVisible(false);
        setTimeout(() => {
            setIsModalOpen(false);
            setTemplateName('');
            setTemplateClass('');
        }, 200);
    }, []);

    const handleCreateConfirm = useCallback(() => {
        setIsModalVisible(false);
        setTimeout(() => {
            setIsModalOpen(false);
            openBuilder();
        }, 200);
    }, [openBuilder]);

    const handleEditWorkflow = useCallback(async (wf) => {
        setOpenDropdownId(null);
        // Fetch the canonical saved workflow first — the row from the list may
        // only be a summary, and opening the builder off it directly risks
        // Save overwriting the real workflow with an empty canvas.
        const canonical = await loadWorkflowForEdit(wf);
        if (!canonical) return;

        setSelectedWorkflow(canonical);
        setTemplateName(canonical.template_name || wf.template_name || '');
        setTemplateClass(canonical.template_class || wf.template_class || '');
        openBuilder();
    }, [loadWorkflowForEdit, setSelectedWorkflow, openBuilder]);

    const filteredWorkflows = useMemo(() => {
        if (!searchQuery) return workflows;
        const q = searchQuery.toLowerCase();
        return workflows.filter((wf) =>
            wf.template_name?.toLowerCase().includes(q) ||
            wf.template_class?.toLowerCase().includes(q) ||
            String(wf.template_id ?? '').toLowerCase().includes(q)
        );
    }, [searchQuery, workflows]);

    if (!isMounted) return null;

    return (
        <>
            {/* Tabs */}
            <DecisionTemplateTabs activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="flex-1 overflow-y-auto thin-scrollbar p-6 md:p-8">
                <div className="max-w-7xl mx-auto space-y-6 pb-12">

                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-text-primary">Decision Templates</h1>
                            <p className="text-sm text-text-secondary mt-1">
                                Manage, version, and track decision workflow templates.
                            </p>
                        </div>
                        {activeTab === 'template' && (
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={openModal}
                                    className="flex items-center gap-2 bg-brand text-white px-4 py-2.5 rounded-lg hover:bg-brand-hover active:bg-brand-hover font-semibold text-sm transition-colors cursor-pointer shadow-sm shadow-brand/20"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create Template
                                </button>
                            </div>
                        )}
                    </div>

                    {activeTab === 'library' ? (
                        <LibraryComingSoon />
                    ) : (
                        <>
                            {/* Filter Bar */}
                            <div className="flex flex-col sm:flex-row gap-3 items-center bg-surface border border-border p-2 rounded-xl">
                                <div className="relative flex-1 min-w-0 w-full">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, class, or ID..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-surface text-text-primary placeholder:text-text-secondary transition-all"
                                    />
                                </div>
                                <button className="flex items-center gap-2 w-full sm:w-auto px-3 py-2 text-sm border border-border rounded-lg text-text-secondary hover:bg-border/30 transition-colors cursor-pointer shrink-0">
                                    All Classes <ChevronDown className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Error Banner */}
                            {error && !loading && (
                                <div className="flex items-center gap-4 bg-danger/10 border border-danger/20 rounded-xl p-4">
                                    <AlertCircle className="w-5 h-5 text-danger shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-danger">Failed to load workflows</p>
                                        <p className="text-xs text-danger/80 mt-0.5 truncate">{error}</p>
                                    </div>
                                    <button
                                        onClick={fetchWorkflows}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-danger/10 text-danger hover:bg-danger/20 rounded-lg transition-colors cursor-pointer shrink-0"
                                    >
                                        <RefreshCw className="w-3 h-3" /> Retry
                                    </button>
                                </div>
                            )}

                            {/* Workflows Table */}
                            <WorkflowsTable
                                workflows={filteredWorkflows}
                                loading={loading}
                                noPlantSelected={noPlantSelected}
                                openDropdownId={openDropdownId}
                                setOpenDropdownId={setOpenDropdownId}
                                onEdit={handleEditWorkflow}
                                onDelete={deleteWorkflow}
                                onCreateClick={openModal}
                                editLoadingId={editLoadingId}
                                deletingId={deletingId}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Create Template Modal */}
            {isModalOpen && (
                <CreateTemplateModal
                    templateName={templateName}
                    setTemplateName={setTemplateName}
                    templateClass={templateClass}
                    setTemplateClass={setTemplateClass}
                    onConfirm={handleCreateConfirm}
                    onClose={closeModal}
                    visible={isModalVisible}
                />
            )}

            {/* Builder Overlay — slides in over the page content, not over the Sidebar/PageHeader (those live in layout.jsx) */}
            {builderMounted && (
                <div
                    className={`absolute inset-0 z-50 transition-all duration-300 ease-out ${builderVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
                >
                    <WorkflowBuilder
                        onClose={closeBuilder}
                        onSaved={fetchWorkflows}
                        templateName={templateName}
                        templateClass={templateClass}
                        initialData={selectedWorkflow}
                        templateId={selectedWorkflow?.template_id}
                    />
                </div>
            )}
        </>
    );
}
