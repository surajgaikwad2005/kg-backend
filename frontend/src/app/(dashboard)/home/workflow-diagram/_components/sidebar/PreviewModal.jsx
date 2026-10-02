'use client';
import React from 'react';
import { Sparkles, X, Loader2, Download } from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';
import { getPnidDetailedEquipmentSummaryUrl } from "@/src/services/cpcp/diagram/diagramService";

export function PreviewModal({
  showPreviewModal,
  setShowPreviewModal,
  plantCode,
  previewData,
  isPreviewLoading,
  searchTerm,
  setSearchTerm
}) {
  return (
    <Modal open={showPreviewModal} onClose={() => setShowPreviewModal(false)} size="full" className="max-w-4xl border border-border p-8 max-h-[85vh] flex flex-col text-text-primary">
        <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand/10 text-brand rounded-xl border border-brand/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="preview-modal-title"
                className="text-lg font-black text-text-primary uppercase tracking-tight"
              >
                Detailed Equipment Summary Preview
              </h3>
              <p className="text-xs text-text-muted font-bold uppercase tracking-wider mt-0.5">
                {plantCode} · {previewData.length} Records
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowPreviewModal(false)}
            aria-label="Close"
            className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-2 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isPreviewLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-brand" />
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest animate-pulse">
              Loading preview data...
            </p>
          </div>
        ) : (
          <>
            <div className="flex gap-4 mb-4">
              <label htmlFor="preview-search" className="sr-only">
                Search equipment
              </label>
              <input
                id="preview-search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search equipment tag or details..."
                className="flex-1 px-4 py-3 border border-border rounded-xl bg-surface-2 text-sm focus:ring-2 focus:ring-brand outline-none"
              />
            </div>
            <div className="flex-1 overflow-y-auto border border-border rounded-2xl shadow-inner max-h-[40vh] plant-scrollbar">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-surface-2 border-b border-border sticky top-0">
                    <th className="p-4 text-xs font-black text-text-muted uppercase tracking-wider w-1/4">
                      Equipment Name
                    </th>
                    <th className="p-4 text-xs font-black text-text-muted uppercase tracking-wider w-3/4">
                      Equipment Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface">
                  {previewData
                    .filter((row) => {
                      const term = searchTerm.toLowerCase();
                      return (
                        String(row["equipment name"] || "").toLowerCase().includes(term) ||
                        String(row["equipment details"] || "").toLowerCase().includes(term)
                      );
                    })
                    .map((row, idx) => (
                      <tr
                        key={String(row["equipment name"]) + "-" + idx}
                        className="hover:bg-surface-2/50 transition-colors"
                      >
                        <td className="p-4 text-sm font-bold text-text-primary align-top">
                          {row["equipment name"]}
                        </td>
                        <td className="p-4 text-sm text-text-secondary leading-relaxed">
                          {row["equipment details"]}
                        </td>
                      </tr>
                    ))}
                  {previewData.filter((row) => {
                    const term = searchTerm.toLowerCase();
                    return (
                      String(row["equipment name"] || "").toLowerCase().includes(term) ||
                      String(row["equipment details"] || "").toLowerCase().includes(term)
                    );
                  }).length === 0 && (
                    <tr>
                      <td colSpan={2} className="p-8 text-center text-xs text-text-muted italic">
                        No records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">
          <a
            href={getPnidDetailedEquipmentSummaryUrl(plantCode)}
            download
            className="px-5 py-2.5 bg-brand hover:bg-brand-hover text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 text-center cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Download Excel
          </a>
          <button
            onClick={() => setShowPreviewModal(false)}
            className="px-5 py-2.5 rounded-xl border border-border hover:bg-surface-2 text-text-primary font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
    </Modal>
  );
}
