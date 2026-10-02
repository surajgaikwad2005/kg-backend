"use client";
import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus, ArrowLeft, PlusCircle, Upload, BrainCircuit,
} from "lucide-react";
import { useToast } from "@/src/components/ui/Toast";
import { useConfirm } from "@/src/components/ui/ConfirmModal";
import { useApp } from "@/src/context/AppContext";
import {
  useRuleTables,
  useDeleteTable,
  useSeedRuleMarkdown,
} from './_queries/useSymbolicAi';
import { RuleCard } from './_components/RuleCard';
import { RuleCardSkeleton } from './_components/RuleCardSkeleton';
import { UploadRuleModal } from './_components/UploadRuleModal';
import { EquipmentConfigModal } from './_components/EquipmentConfigModal';
import { CreateRuleModal } from './_components/CreateRuleModal';
import { CreateTableView } from './_components/CreateTableView';

export default function SymbolicAIPage() {
  return (
    <Suspense>
      <SymbolicAIContent />
    </Suspense>
  );
}

function SymbolicAIContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success: toastSuccess } = useToast();
  const { openConfirm } = useConfirm();
  const { plantCode } = useApp();

  const viewMode = searchParams.get('view') || 'library';
  const ruleName = searchParams.get('rule') || '';
  const setViewMode = (mode, name) => {
    const params = new URLSearchParams(searchParams.toString());
    if (mode === 'library') { params.delete('view'); params.delete('rule'); }
    else {
      params.set('view', mode);
      if (name) params.set('rule', name);
    }
    router.replace(`?${params.toString()}`);
  };
  // Locally-created rules that have not been pushed to the backend yet. Backend
  // rules come from the query below and are merged in for display.
  const [localRules, setLocalRules] = useState([]);

  const { data: dashboardNames = [], isLoading: isLoadingTables } = useRuleTables(plantCode);
  const deleteTableMutation = useDeleteTable(plantCode);
  const seedRuleMarkdown = useSeedRuleMarkdown(plantCode);

  const ruleHistory = useMemo(() => {
    const backendRules = dashboardNames.map((name) => ({
      id: `backend-${name}`,
      name,
      markdown: `# ${name}\n*System synchronized rule base. Click to edit or expand.*`,
      date: 'Remote System',
      fileName: null,
      isBackend: true,
    }));
    const unique = backendRules.filter((br) => !localRules.some((lr) => lr.name === br.name));
    return [...localRules, ...unique];
  }, [dashboardNames, localRules]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRulesDropdown, setShowRulesDropdown] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [equipmentModalData, setEquipmentModalData] = useState(null);

  const dropdownRef = useRef(null);

  // The old `if (!plantCode) return; fetchTables();` effect is gone —
  // `enabled: !!plantCode` inside useRuleTables covers the same hydration race
  // (plantCode arrives asynchronously from localStorage) declaratively, and no
  // request is scheduled until it resolves.

  useEffect(() => {
    if (!showRulesDropdown) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowRulesDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showRulesDropdown]);

  const deleteRule = async (id, e) => {
    e.stopPropagation();
    const rule = ruleHistory.find(r => r.id === id);
    if (rule?.isBackend) {
      const ok = await openConfirm(`Table '${rule.name}' will be permanently removed from the backend.`, { title: 'Delete table?', confirmLabel: 'Delete' });
      if (!ok) return;
      try {
        // The mutation invalidates the table list itself — no manual refetch.
        const res = await deleteTableMutation.mutateAsync(rule.name);
        toastSuccess('Table deleted', res?.message);
      } catch {
        // Surfaced by the global mutation-error toast.
      }
    } else {
      setLocalRules(prev => prev.filter(r => r.id !== id));
      toastSuccess('Rule removed', `'${rule.name}' was removed.`);
    }
  };

  const applyNewRule = (name, markdown) => {
    setShowUploadModal(false);
    setShowEquipmentModal(false);
    setEquipmentModalData(null);
    // Seed the detail route's cache entry directly. This replaces the
    // hand-written stashPendingMarkdown module: the [slug] page's useRuleMarkdown
    // now finds fresh data already in cache and renders with no request at all.
    seedRuleMarkdown(name, markdown);
    router.push(`/symbolic-ai/${encodeURIComponent(name)}`);
  };

  const handleUploadConfig = (tableName, tableData, file) => {
    setShowUploadModal(false);
    setEquipmentModalData({ tableName, tableData, file: file || null });
    setShowEquipmentModal(true);
  };

  const handleCreateConfirm = (name) => {
    setShowCreateModal(false);
    setViewMode('create', name);
  };

  const handleStoreKnowledge = () => {
    router.push(`/symbolic-ai/${encodeURIComponent(ruleName)}`);
  };

  return (<>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-surface border-b border-border shrink-0 gap-3">
          <div className="flex items-center gap-2">
            {viewMode === 'create' && (
              <button
                onClick={() => setViewMode('library')}
                className="flex items-center justify-center w-9 h-9 bg-surface-2 border border-border hover:bg-surface hover:shadow-card rounded-xl transition-all duration-200 group cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-text-muted group-hover:-translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Select Rules dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowRulesDropdown(p => !p)}
                className="flex items-center gap-2 px-4 py-2 bg-text-primary text-surface rounded-xl text-caption font-black uppercase tracking-wider hover:opacity-90 transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Select Rules
              </button>

              {showRulesDropdown && (
                <div className="absolute right-0 mt-2 w-52 bg-surface rounded-2xl shadow-modal border border-border z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-1.5 space-y-0.5">
                    <button
                      onClick={() => { setShowCreateModal(true); setShowRulesDropdown(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-surface-2 rounded-xl transition-colors group cursor-pointer"
                    >
                      <div className="p-2 bg-highlight/10 text-highlight rounded-lg group-hover:bg-highlight group-hover:text-white transition-colors shrink-0">
                        <PlusCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-caption font-black text-text-primary">Create Rule</p>
                        <p className="text-2xs font-medium text-text-muted">Build manual logic</p>
                      </div>
                    </button>
                    <button
                      onClick={() => { setShowUploadModal(true); setShowRulesDropdown(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-surface-2 rounded-xl transition-colors group cursor-pointer"
                    >
                      <div className="p-2 bg-brand-muted text-brand rounded-lg group-hover:bg-brand group-hover:text-white transition-colors shrink-0">
                        <Upload className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-caption font-black text-text-primary">Upload Rules</p>
                        <p className="text-2xs font-medium text-text-muted">Excel or CSV source</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modals */}
        {showUploadModal && (
          <UploadRuleModal
            onClose={() => setShowUploadModal(false)}
            onConfig={handleUploadConfig}
          />
        )}
        {showEquipmentModal && equipmentModalData && (
          <EquipmentConfigModal
            tableName={equipmentModalData.tableName}
            tableData={equipmentModalData.tableData}
            file={equipmentModalData.file}
            onClose={() => { setShowEquipmentModal(false); setEquipmentModalData(null); }}
            onSuccess={applyNewRule}
          />
        )}
        {showCreateModal && (
          <CreateRuleModal
            onClose={() => setShowCreateModal(false)}
            onConfirm={handleCreateConfirm}
          />
        )}

        {/* Main content */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto thin-scrollbar min-h-0">
          {viewMode === 'create' ? (
            <CreateTableView ruleName={ruleName} onStoreKnowledge={handleStoreKnowledge} />

          ) : isLoadingTables && ruleHistory.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <RuleCardSkeleton key={i} />
              ))}
            </div>

          ) : ruleHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-24 animate-in fade-in duration-500">
              <div className="w-16 h-16 rounded-3xl bg-surface-2 border border-border flex items-center justify-center mb-5">
                <BrainCircuit className="w-8 h-8 text-text-subtle" />
              </div>
              <h3 className="text-body font-black text-text-primary uppercase tracking-tight">No rule bases yet</h3>
              <p className="mt-2 text-caption font-medium text-text-muted max-w-sm">
                Create a rule manually or upload an Excel/CSV source to build your first symbolic intelligence base.
              </p>
              <button
                onClick={() => setShowRulesDropdown(true)}
                className="mt-6 flex items-center gap-2 px-4 py-2 bg-text-primary text-surface rounded-xl text-caption font-black uppercase tracking-wider hover:opacity-90 transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Select Rules
              </button>
            </div>

          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
              {ruleHistory.map(rule => (
                <RuleCard
                  key={rule.id}
                  rule={rule}
                  isLoading={false}
                  onOpen={() => router.push(`/symbolic-ai/${encodeURIComponent(rule.name)}`)}
                  onDelete={e => deleteRule(rule.id, e)}
                />
              ))}
            </div>
          )}
        </div>
    </>
  );
}
