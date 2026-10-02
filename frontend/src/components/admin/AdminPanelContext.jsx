'use client';
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as cdm from '@/src/services/domain-configuration/common';
import { useApp } from '@/src/context/AppContext';
import { useAdminNavState }         from './hooks/useAdminNavState';
import { useSourceLifecycle }       from './hooks/useSourceLifecycle';
import { usePipelineOrchestration } from './hooks/usePipelineOrchestration';
import { usePnidFormState }         from './hooks/usePnidFormState';
import { useDocsFormState }         from './hooks/useDocsFormState';
import { useTsFormState }           from './hooks/useTsFormState';
import { useSapFormState }          from './hooks/useSapFormState';
import { useAdminPersistence }      from './hooks/useAdminPersistence';
import { useAdminContextValues }    from './hooks/useAdminContextValues';
import { useContextRowPersistence } from './hooks/useContextRowPersistence';

const AdminNavContext    = createContext(null);
const AdminEntityContext = createContext(null);
const AdminFormContext   = createContext(null);
const AdminPanelContext  = createContext(null);

export function useAdminNav() {
    const ctx = useContext(AdminNavContext);
    if (!ctx) throw new Error('useAdminNav must be used within AdminPanelProvider');
    return ctx;
}
export function useAdminEntities() {
    const ctx = useContext(AdminEntityContext);
    if (!ctx) throw new Error('useAdminEntities must be used within AdminPanelProvider');
    return ctx;
}
export function useAdminForm() {
    const ctx = useContext(AdminFormContext);
    if (!ctx) throw new Error('useAdminForm must be used within AdminPanelProvider');
    return ctx;
}
export const usePnidForm = useAdminForm;
export const useDocsForm = useAdminForm;
export const useTsForm = useAdminForm;
export const useSapForm = useAdminForm;

export function useAdminPanel() {
    const ctx = useContext(AdminPanelContext);
    if (!ctx) throw new Error('useAdminPanel must be used within an AdminPanelProvider');
    return ctx;
}

export function AdminPanelProvider({ initialView = 'welcome', onViewChange, children }) {
    const { industry: selectedIndustry, industryCode, setIndustry: setSelectedIndustry, plantId: selectedPlantId, setPlantId } = useApp();
    const setSelectedPlantId = (plant) => {
        setPlantId(plant);
        try { localStorage.setItem('admin_plant_id', JSON.stringify(plant)); } catch { /* ignore */ }
    };

    // ── Shared / entity state that doesn't belong to a domain hook ────────────
    const [isDecisionContextDone, setIsDecisionContextDone] = useState(false);
    const [selectedSource, setSelectedSource]               = useState(null);
    const [users, setUsers]                                 = useState([]);
    const [rules, setRules]                                 = useState([]);
    const [isAddUserModalOpen, setIsAddUserModalOpen]       = useState(false);
    const [isDataSourcesDone, setIsDataSourcesDone]         = useState(false);
    const [isIncrementalModalOpen, setIsIncrementalModalOpen] = useState(false);
    const [incrementalStage, setIncrementalStage]           = useState(null);
    const [incrementalStatus, setIncrementalStatus]         = useState('idle');

    const _persistReady = useRef(false);
    // commitDataRef lets the pipeline hook read the latest form state inside async
    // commit functions without needing form hooks to be called first.
    const commitDataRef = useRef({});

    // ── Domain hooks ──────────────────────────────────────────────────────────
    const nav       = useAdminNavState({ initialView, onViewChange, setIsDecisionContextDone });
    const lifecycle = useSourceLifecycle({ selectedPlantId });
    const contextRowPersistence = useContextRowPersistence();
    const pipeline  = usePipelineOrchestration({
        selectedPlantId, industryCode,
        configuredSources: lifecycle.configuredSources,
        committedSources:  lifecycle.committedSources,
        setCommittedSources: lifecycle.setCommittedSources,
        markCommittedAt:   lifecycle.markCommittedAt,
        markSourceFailed:  lifecycle.markSourceFailed,
        setView:           nav.setView,
        simulateContextProgress: nav.simulateContextProgress,
        setIsProgressModalOpen:  nav.setIsProgressModalOpen,
        setProgress:             nav.setProgress,
        setProgressModalTitle:   nav.setProgressModalTitle,
        setProgressModalSubtitle: nav.setProgressModalSubtitle,
        commitDataRef,
    });
    const pnid = usePnidFormState({
        selectedPlantId, view: nav.view,
        pipelineStatuses:    pipeline.pipelineStatuses,
        configuredSources:   lifecycle.configuredSources,
        setConfiguredSources: lifecycle.setConfiguredSources,
        markSourceFailed:    lifecycle.markSourceFailed,
        setIsConfigModalOpen: nav.setIsConfigModalOpen,
        setConfigStep:       nav.setConfigStep,
        _persistReady,
    });
    const docs = useDocsFormState({
        selectedPlantId, view: nav.view,
        pipelineStatuses: pipeline.pipelineStatuses,
        _persistReady,
    });
    const ts = useTsFormState({
        selectedPlantId, view: nav.view,
        pipelineStatuses: pipeline.pipelineStatuses,
        _persistReady,
    });
    const sap = useSapFormState({
        selectedPlantId, view: nav.view,
        pipelineStatuses: pipeline.pipelineStatuses,
        _persistReady,
    });
    useAdminPersistence({
        _persistReady,
        setPnidFiles:       pnid.setPnidFiles,
        setDocFiles:        docs.setDocFiles,
        setTsMetadataFiles: ts.setTsMetadataFiles,
        setTsValuesFiles:   ts.setTsValuesFiles,
        setSapFiles:        sap.setSapFiles,
    });

    // Keep commitDataRef current so pipeline commit functions read fresh values
    commitDataRef.current = {
        equipmentPidData:       pnid.equipmentPidData,
        equipmentConnectivityData: pnid.equipmentConnectivityData,
        pidData:                pnid.pidData,
        docDataByCategory:      docs.docDataByCategory,
        setDocDataByCategory:   docs.setDocDataByCategory,
        uploadedDocSubtypes:    docs.uploadedDocSubtypes,
        uploadedDocFileNames:   docs.uploadedDocFileNames,
        tsData:                 ts.tsData,
        sapData:                sap.sapData,
        sapTables:              sap.sapTables,
        sapColumnMappings:      sap.sapColumnMappings,
    };

    // ── Rule handlers (need lifecycle.setDeleteConfirm + nav.setView) ─────────
    const handleAddRule = () => setRules(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9), equipment: '', issue: '', rule: '', cause: '', action: '',
    }]);
    const handleUpdateRule = (id, field, value) =>
        setRules(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
    const handleDeleteRule = (id) => {
        lifecycle.setDeleteConfirm({
            open: true,
            title: 'Delete Rule',
            message: 'Are you sure you want to delete this rule? This action cannot be undone.',
            onConfirm: () => {
                setRules(prev => prev.filter(r => r.id !== id));
                lifecycle.setDeleteConfirm(prev => ({ ...prev, open: false }));
            },
        });
    };
    const handleSaveRules = () => { nav.setView('welcome'); nav.setActiveTab('dashboard'); };
    const handleSourceClick = (type) => { setSelectedSource(type); nav.setIsConfigModalOpen(true); };

    const customHandleDeleteSource = (id) => {
        const source = lifecycle.configuredSources.find(s => s.id === id);
        lifecycle.setDeleteConfirm({
            open: true,
            title: 'Delete Source',
            message: 'Are you sure you want to remove this configured source? This action cannot be undone.',
            onConfirm: () => {
                lifecycle.setConfiguredSources(prev => prev.filter(s => s.id !== id));
                if (source && source.type === 'Documents') {
                    const deletedFiles = source.filesMeta?.map(f => f.name) || [];
                    const builtinTypes = docs.effectiveDocCategories.flatMap(c => c.types);
                    const customSubs = Object.values(docs.docCategorySubtypes || {}).flat();
                    const allTypes = [...builtinTypes, ...customSubs];
                    
                    allTypes.forEach(dt => {
                        if (source.name.includes(dt.label)) {
                            docs.setUploadedDocFileNames(prev => {
                                const current = prev[dt.key] || [];
                                const updated = current.filter(f => !deletedFiles.includes(f));
                                return { ...prev, [dt.key]: updated };
                            });
                            const hasOthers = lifecycle.configuredSources.some(s => s.id !== id && s.type === 'Documents' && s.name.includes(dt.label));
                            if (!hasOthers) docs.setUploadedDocSubtypes(prev => prev.filter(sub => sub.key !== dt.key));
                        }
                    });
                } else if (source && source.type === 'P&ID') {
                    const deletedFiles = source.filesMeta?.map(f => f.name) || [];
                    pnid.setUploadedPnidFileNames(prev => prev.filter(f => !deletedFiles.includes(f)));
                }
                lifecycle.setDeleteConfirm(prev => ({ ...prev, open: false }));
            },
        });
    };

    // ── Stable handler refs (same pattern as before) ─────────────────────────
    const _h = useRef({});
    _h.current = {
        handleSourceClick, handleAddRule, handleUpdateRule, handleDeleteRule, handleSaveRules,
        startProgress:          nav.startProgress,
        handleDoneProgress:     nav.handleDoneProgress,
        triggerPipeline:        pipeline.triggerPipeline,
        cancelRun:              pipeline.cancelRun,
        retryRun:               pipeline.retryRun,
        performPnidUpload:      pnid.performPnidUpload,
        markSourceFailed:       lifecycle.markSourceFailed,
        handleDeleteSource:     customHandleDeleteSource,
        commitPidContext:       pipeline.commitPidContext,
        commitDocsContext:      pipeline.commitDocsContext,
        commitTsContext:        pipeline.commitTsContext,
        commitSapContext:       pipeline.commitSapContext,
        validateTsMetadataFile: ts.validateTsMetadataFile,
        validateTsValuesFile:   ts.validateTsValuesFile,
        handleAddSapTable:      sap.handleAddSapTable,
        markProcessed:          lifecycle.markProcessed,
        markValidated:          lifecycle.markValidated,
        unmarkProcessed:        lifecycle.unmarkProcessed,
        unmarkValidated:        lifecycle.unmarkValidated,
        invalidateConnectorState: lifecycle.invalidateConnectorState,
    };
    const stable = useMemo(() => ({
        handleSourceClick:      (...a) => _h.current.handleSourceClick(...a),
        startProgress:          (...a) => _h.current.startProgress(...a),
        handleDoneProgress:     (...a) => _h.current.handleDoneProgress(...a),
        handleAddRule:          (...a) => _h.current.handleAddRule(...a),
        handleUpdateRule:       (...a) => _h.current.handleUpdateRule(...a),
        handleDeleteRule:       (...a) => _h.current.handleDeleteRule(...a),
        handleSaveRules:        (...a) => _h.current.handleSaveRules(...a),
        triggerPipeline:        (...a) => _h.current.triggerPipeline(...a),
        cancelRun:              (...a) => _h.current.cancelRun(...a),
        retryRun:               (...a) => _h.current.retryRun(...a),
        performPnidUpload:      (...a) => _h.current.performPnidUpload(...a),
        markSourceFailed:       (...a) => _h.current.markSourceFailed(...a),
        handleDeleteSource:     (...a) => _h.current.handleDeleteSource(...a),
        commitPidContext:       (...a) => _h.current.commitPidContext(...a),
        commitDocsContext:      (...a) => _h.current.commitDocsContext(...a),
        commitTsContext:        (...a) => _h.current.commitTsContext(...a),
        commitSapContext:       (...a) => _h.current.commitSapContext(...a),
        validateTsMetadataFile: (...a) => _h.current.validateTsMetadataFile(...a),
        validateTsValuesFile:   (...a) => _h.current.validateTsValuesFile(...a),
        handleAddSapTable:      (...a) => _h.current.handleAddSapTable(...a),
        markProcessed:          (...a) => _h.current.markProcessed(...a),
        markValidated:          (...a) => _h.current.markValidated(...a),
        unmarkProcessed:        (...a) => _h.current.unmarkProcessed(...a),
        unmarkValidated:        (...a) => _h.current.unmarkValidated(...a),
        invalidateConnectorState: (...a) => _h.current.invalidateConnectorState(...a),
    }), []);

    // ── Context value assembly ─────────────────────────────────────────────────
    const { navValue, entityValue, formValue, mergedValue } = useAdminContextValues({
        nav, lifecycle, pipeline, pnid, docs, ts, sap, stable, contextRowPersistence,
        selectedPlantId, setSelectedPlantId,
        selectedSource, setSelectedSource,
        selectedIndustry, setSelectedIndustry,
        users, setUsers, rules, setRules,
        isDecisionContextDone, setIsDecisionContextDone,
        isAddUserModalOpen, setIsAddUserModalOpen,
        isDataSourcesDone, setIsDataSourcesDone,
        isIncrementalModalOpen, setIsIncrementalModalOpen,
        incrementalStage, setIncrementalStage, incrementalStatus, setIncrementalStatus,
    });

    return (
        <AdminNavContext.Provider value={navValue}>
            <AdminEntityContext.Provider value={entityValue}>
                <AdminFormContext.Provider value={formValue}>
                    <AdminPanelContext.Provider value={mergedValue}>
                        {children}
                    </AdminPanelContext.Provider>
                </AdminFormContext.Provider>
            </AdminEntityContext.Provider>
        </AdminNavContext.Provider>
    );
}
