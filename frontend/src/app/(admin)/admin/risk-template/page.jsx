"use client";
import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus, ArrowLeft, PlusCircle, Upload, ShieldAlert,
} from "lucide-react";
import { useToast } from "@/src/components/ui/Toast";
import { useConfirm } from "@/src/components/ui/ConfirmModal";
import { useApp } from "@/src/context/AppContext";
import {
  useRiskTemplates,
  useDeleteRiskTemplate,
  useSeedRiskTemplateMarkdown,
} from './_queries/useRiskTemplate';
import { RiskTemplateCard } from './_components/RiskTemplateCard';
import { RiskTemplateCardSkeleton } from './_components/RiskTemplateCardSkeleton';
import { UploadRiskTemplateModal } from './_components/UploadRiskTemplateModal';
import { EquipmentConfigModal } from './_components/EquipmentConfigModal';
import { CreateRiskTemplateModal } from './_components/CreateRiskTemplateModal';
import { CreateTableView } from './_components/CreateTableView';

export default function RiskTemplatePage() {
  return (
    <Suspense>
      <RiskTemplateContent />
    </Suspense>
  );
}

function RiskTemplateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success: toastSuccess } = useToast();
  const { openConfirm } = useConfirm();
  const { plantCode } = useApp();

  const viewMode = searchParams.get('view') || 'library';
  const templateName = searchParams.get('template') || searchParams.get('rule') || '';
  const setViewMode = (mode, name) => {
    const params = new URLSearchParams(searchParams.toString());
    if (mode === 'library') {
      params.delete('view');
      params.delete('template');
      params.delete('rule');
    } else {
      params.set('view', mode);
      if (name) params.set('template', name);
    }
    router.replace(`?${params.toString()}`);
  };

  const [localTemplates, setLocalTemplates] = useState([]);

  const { data: remoteNames = [], isLoading: isLoadingTemplates } = useRiskTemplates(plantCode);
  const deleteTemplateMutation = useDeleteRiskTemplate(plantCode);
  const seedTemplateMarkdown = useSeedRiskTemplateMarkdown(plantCode);

  const templateHistory = useMemo(() => {
    const backendTemplates = remoteNames.map((name) => ({
      id: `backend-${name}`,
      name,
      markdown: `# ${name}\n*System synchronized risk template base. Click to edit or expand.*`,
      date: 'Remote System',
      fileName: null,
      isBackend: true,
    }));
    const unique = backendTemplates.filter((bt) => !localTemplates.some((lt) => lt.name === bt.name));
    return [...localTemplates, ...unique];
  }, [remoteNames, localTemplates]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [equipmentModalData, setEquipmentModalData] = useState(null);

  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!showDropdown) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showDropdown]);

  const deleteTemplateItem = async (id, e) => {
    e.stopPropagation();
    const item = templateHistory.find(r => r.id === id);
    if (item?.isBackend) {
      const ok = await openConfirm(`Template '${item.name}' will be permanently removed.`, { title: 'Delete template?', confirmLabel: 'Delete' });
      if (!ok) return;
      try {
        const res = await deleteTemplateMutation.mutateAsync(item.name);
        toastSuccess('Template deleted', res?.message);
      } catch {
        // Surfaced by global mutation error toast
      }
    } else {
      setLocalTemplates(prev => prev.filter(r => r.id !== id));
      toastSuccess('Template removed', `'${item.name}' was removed.`);
    }
  };

  const applyNewTemplate = (name, markdown) => {
    setShowUploadModal(false);
    setShowEquipmentModal(false);
    setEquipmentModalData(null);
    seedTemplateMarkdown(name, markdown);
    router.push(`/admin/risk-template/${encodeURIComponent(name)}`);
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
    router.push(`/admin/risk-template/${encodeURIComponent(templateName)}`);
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
        {/* Select Templates dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(p => !p)}
            className="flex items-center gap-2 px-4 py-2 bg-text-primary text-surface rounded-xl text-caption font-black uppercase tracking-wider hover:opacity-90 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Select Templates
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-surface rounded-2xl shadow-modal border border-border z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-1.5 space-y-0.5">
                <button
                  onClick={() => { setShowCreateModal(true); setShowDropdown(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-surface-2 rounded-xl transition-colors group cursor-pointer"
                >
                  <div className="p-2 bg-highlight/10 text-highlight rounded-lg group-hover:bg-highlight group-hover:text-white transition-colors shrink-0">
                    <PlusCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-caption font-black text-text-primary">Create Template</p>
                    <p className="text-2xs font-medium text-text-muted">Build manual logic</p>
                  </div>
                </button>
                <button
                  onClick={() => { setShowUploadModal(true); setShowDropdown(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-surface-2 rounded-xl transition-colors group cursor-pointer"
                >
                  <div className="p-2 bg-brand-muted text-brand rounded-lg group-hover:bg-brand group-hover:text-white transition-colors shrink-0">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-caption font-black text-text-primary">Upload Templates</p>
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
      <UploadRiskTemplateModal
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
        onSuccess={applyNewTemplate}
      />
    )}
    {showCreateModal && (
      <CreateRiskTemplateModal
        onClose={() => setShowCreateModal(false)}
        onConfirm={handleCreateConfirm}
      />
    )}

    {/* Main content */}
    <div className="flex-1 p-6 md:p-8 overflow-y-auto thin-scrollbar min-h-0">
      {viewMode === 'create' ? (
        <CreateTableView ruleName={templateName} onStoreKnowledge={handleStoreKnowledge} />

      ) : isLoadingTemplates && templateHistory.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <RiskTemplateCardSkeleton key={i} />
          ))}
        </div>

      ) : templateHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-24 animate-in fade-in duration-500">
          <div className="w-16 h-16 rounded-3xl bg-surface-2 border border-border flex items-center justify-center mb-5">
            <ShieldAlert className="w-8 h-8 text-text-subtle" />
          </div>
          <h3 className="text-body font-black text-text-primary uppercase tracking-tight">No risk templates yet</h3>
          <p className="mt-2 text-caption font-medium text-text-muted max-w-sm">
            Create a risk template manually or upload an Excel/CSV source to build your first risk ontology base.
          </p>
          <button
            onClick={() => setShowDropdown(true)}
            className="mt-6 flex items-center gap-2 px-4 py-2 bg-text-primary text-surface rounded-xl text-caption font-black uppercase tracking-wider hover:opacity-90 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Select Templates
          </button>
        </div>

      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
          {templateHistory.map(item => (
            <RiskTemplateCard
              key={item.id}
              template={item}
              isLoading={false}
              onOpen={() => router.push(`/admin/risk-template/${encodeURIComponent(item.name)}`)}
              onDelete={e => deleteTemplateItem(item.id, e)}
            />
          ))}
        </div>
      )}
    </div>
  </>);
}
