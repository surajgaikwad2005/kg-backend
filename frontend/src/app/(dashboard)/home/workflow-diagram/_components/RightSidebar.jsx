"use client";
import React from "react";
import { Layers, Sparkles, Save, Download, Trash2, Loader2 } from "lucide-react";
import { useSidebarState } from "../_hooks/useSidebarState";
import { PaletteTab } from "./sidebar/PaletteTab";
import { AiGeneratorTab } from "./sidebar/AiGeneratorTab";
import { PreviewModal } from "./sidebar/PreviewModal";
import FileMapperModal from "./FileMapperModal";

export default function RightSidebar({
  onExport,
  onClear,
  onSave,
  onLoad,
  isSaving,
}) {
  const state = useSidebarState({ onLoad, isSaving });

  return (
    <aside className="w-72 bg-surface text-text-primary flex flex-col h-full z-10 shadow-xl border-l border-border shrink-0">
      {/* Pill tab switcher */}
      <div className="px-3 pt-3 pb-2 border-b border-border bg-surface shrink-0">
        <div className="flex bg-surface-2 rounded-xl p-1 gap-1">
          <button
            onClick={() => state.setActiveTab("palette")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              state.activeTab === "palette"
                ? "bg-surface text-text-primary shadow-sm ring-1 ring-border"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Palette
          </button>
          <button
            onClick={() => state.setActiveTab("create")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              state.activeTab === "create"
                ? "bg-surface text-text-primary shadow-sm ring-1 ring-border"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Create
          </button>
        </div>
      </div>

      {state.activeTab === "palette" ? (
        <PaletteTab {...state} onLoad={onLoad} />
      ) : (
        <AiGeneratorTab {...state} />
      )}

      {/* Footer Actions (Save, Export, Clear) are shown when in palette tab, matching previous logic */}
      {state.activeTab === "palette" && (
        <div className="px-3 py-3 border-t border-border bg-surface shrink-0">
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={onSave}
              disabled={isSaving}
              aria-busy={isSaving}
              title="Save Diagram"
              className="flex flex-col items-center justify-center gap-1.5 py-3 bg-success/10 hover:bg-success/20 disabled:bg-surface-2 border border-success/20 hover:border-success/40 disabled:border-border text-success disabled:text-text-muted rounded-xl font-black text-[8px] uppercase tracking-widest transition-all cursor-pointer active:scale-95 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isSaving ? "Saving" : "Save"}</span>
            </button>
            <button
              onClick={onExport}
              title="Export JSON"
              className="flex flex-col items-center justify-center gap-1.5 py-3 bg-brand/10 hover:bg-brand/20 border border-brand/20 hover:border-brand/40 text-brand rounded-xl font-black text-[8px] uppercase tracking-widest transition-all cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={onClear}
              title="Clear Canvas"
              className="flex flex-col items-center justify-center gap-1.5 py-3 bg-danger/10 hover:bg-danger/20 border border-danger/20 hover:border-danger/40 text-danger rounded-xl font-black text-[8px] uppercase tracking-widest transition-all cursor-pointer active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      )}

      <FileMapperModal
        isOpen={state.isFileModalOpen}
        onClose={() => state.setIsFileModalOpen(false)}
        onSubmit={state.handleBatchGenerate}
        isProcessing={state.isBatchProcessing}
        provider={state.provider}
        setProvider={state.setProvider}
        jobProgress={state.jobProgress}
      />

      <PreviewModal
        showPreviewModal={state.showPreviewModal}
        setShowPreviewModal={state.setShowPreviewModal}
        plantCode={state.plantCode}
        previewData={state.previewData}
        isPreviewLoading={state.isPreviewLoading}
        searchTerm={state.searchTerm}
        setSearchTerm={state.setSearchTerm}
      />
    </aside>
  );
}
