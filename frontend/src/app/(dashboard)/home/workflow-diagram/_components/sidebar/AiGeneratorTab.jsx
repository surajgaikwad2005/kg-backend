import React from 'react';
import {
  Sparkles, Loader2, UploadCloud, X, Play, Plus, Copy, Check, Download, MapPin
} from 'lucide-react';
import { Select } from '@/src/components/ui/Select';
import { parseGeneratedSvg } from "../../_utils/SvgParser";
import { getPnidDetailedEquipmentSummaryUrl } from "@/src/services/cpcp/diagram/diagramService";

// The [[LABEL]] substitution below runs AFTER SvgParser's DOMPurify pass, so
// the user-typed label must be entity-escaped before it is spliced into markup
// that feeds dangerouslySetInnerHTML.
const escapeHtml = (str) =>
  String(str).replace(/[&<>"']/g, (ch) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));

export function AiGeneratorTab({
  provider,
  setProvider,
  aiInput,
  setAiInput,
  aiDesc,
  setAiDesc,
  isGenerating,
  handleGenerate,
  setIsFileModalOpen,
  generatedCode,
  showPreview,
  setShowPreview,
  addAiComponent,
  setGeneratedCode,
  setActiveTab,
  copied,
  copyToClipboard,
  plantCode,
  loadingSummaryStatus,
  summaryStatus,
  handleOpenPreview,
  isGeneratingSummary,
  handleGenerateSummary
}) {
  const previewMarkup = React.useMemo(() => {
    if (!generatedCode) return null;
    return parseGeneratedSvg(generatedCode);
  }, [generatedCode]);

  return (
    <>
      <div className="px-4 pt-3 pb-2 border-b border-border bg-surface shrink-0">
        <h3 className="font-black text-text-primary text-body uppercase tracking-widest">
          AI Generator
        </h3>
        <p className="text-[9px] font-bold text-text-muted mt-0.5 uppercase tracking-wide">
          Design Custom Equipment
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-surface plant-scrollbar">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1 bg-brand rounded-md">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <h3 className="font-black text-text-primary text-[12px] uppercase tracking-widest">
            Create Component
          </h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <label
                htmlFor="provider-select"
                className="text-label font-bold text-text-muted uppercase tracking-widest flex-shrink-0"
              >
                Model
              </label>
              <div className="flex-1 min-w-0">
                <Select
                  id="provider-select"
                  value={provider}
                  onChange={setProvider}
                  options={[
                    { value: 'claude', label: 'Claude' },
                    { value: 'google-gemini', label: 'Google Gemini' },
                  ]}
                />
              </div>
            </div>
            <div className="relative">
              <label htmlFor="equipment-name" className="sr-only">
                Equipment Name
              </label>
              <input
                id="equipment-name"
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Equipment Name (e.g. Centrifugal Pump)"
                className="w-full bg-surface border border-border rounded-lg py-2.5 px-3 text-[12px] font-bold text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-brand/20 focus:border-brand/40 outline-none transition-all"
                onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              />
            </div>
            <label htmlFor="equipment-desc" className="sr-only">
              Visual description
            </label>
            <textarea
              id="equipment-desc"
              value={aiDesc}
              onChange={(e) => setAiDesc(e.target.value)}
              placeholder="Visual description (e.g. horizontal, blue housing...)"
              className="w-full bg-surface border border-border rounded-lg py-2.5 px-3 text-caption text-text-primary placeholder:text-text-muted h-24 focus:ring-2 focus:ring-brand/20 focus:border-brand/40 outline-none transition-all resize-none"
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !aiInput.trim()}
              aria-busy={isGenerating}
              className="w-full py-2.5 bg-brand hover:bg-brand-hover disabled:bg-surface-2 disabled:text-text-muted text-white rounded-lg font-black uppercase tracking-widest text-caption transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {isGenerating ? "Generating..." : "Generate Component"}
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-border" />
              <span className="flex-shrink-0 mx-4 text-text-subtle text-[9px] font-black uppercase tracking-widest">
                OR
              </span>
              <div className="flex-grow border-t border-border" />
            </div>

            <button
              onClick={() => setIsFileModalOpen(true)}
              className="w-full py-2.5 bg-surface border border-border hover:border-brand/40 text-text-primary hover:text-brand rounded-lg font-black uppercase tracking-widest text-caption transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              Upload CSV/Excel
            </button>
          </div>

          {generatedCode && (
            <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-label font-black uppercase tracking-wider transition-all border cursor-pointer ${showPreview ? "bg-surface-2 text-text-primary border-border" : "bg-surface text-text-primary border-border hover:border-brand/40 shadow-sm"}`}
                >
                  {showPreview ? (
                    <X className="w-3.5 h-3.5" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                  {showPreview ? "Close Preview" : "Live Preview"}
                </button>
                <button
                  onClick={() => {
                    addAiComponent(
                      aiInput || "AI Component",
                      generatedCode,
                      aiDesc,
                    );
                    setGeneratedCode("");
                    setShowPreview(false);
                    setAiInput("");
                    setAiDesc("");
                    setActiveTab("palette");
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-brand hover:bg-brand-hover text-white py-2 rounded-lg text-label font-black uppercase tracking-wider shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Save & Add
                </button>
              </div>

              {showPreview && previewMarkup ? (
                <div className="mb-4 border-2 border-dashed border-brand/20 rounded-xl bg-surface-2 p-4 h-[200px] flex flex-col items-center justify-center relative group shadow-inner">
                  <div className="absolute top-2 left-2 text-[8px] font-black text-brand uppercase tracking-widest">
                    Live SVG Preview
                  </div>
                  <svg
                    viewBox={previewMarkup.defaultViewBox}
                    className="w-full h-full max-h-[160px]"
                  >
                    <g
                      dangerouslySetInnerHTML={{
                        __html: previewMarkup.svgMarkup
                          .replace(/\[\[LABEL\]\]/g, escapeHtml(aiInput || "PREVIEW"))
                          .replace(/\[\[STATUS_COLOR\]\]/g, "var(--color-brand)")
                          .replace(/\[\[ANIM_DUR\]\]/g, "2s"),
                      }}
                    />
                  </svg>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-label font-bold text-text-muted uppercase tracking-wider">
                      Generated Code
                    </span>
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-1 text-label font-bold text-brand hover:text-brand-hover transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy Code
                        </>
                      )}
                    </button>
                  </div>
                  <div className="max-h-[250px] overflow-y-auto bg-surface-2 rounded-xl p-4 border border-border shadow-inner text-left plant-scrollbar">
                    <pre className="text-label font-mono text-text-primary whitespace-pre-wrap leading-relaxed">
                      {generatedCode}
                    </pre>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="relative flex items-center py-4">
          <div className="flex-grow border-t border-border" />
          <span className="flex-shrink-0 mx-4 text-text-muted text-[9px] font-black uppercase tracking-widest">
            Detailed Equipment Summary
          </span>
          <div className="flex-grow border-t border-border" />
        </div>

        <div className="pb-4">
          {!plantCode ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 border border-dashed border-border rounded-xl text-center">
              <MapPin className="w-5 h-5 text-text-muted" />
              <p className="text-label text-text-muted italic px-4">
                Select a plant from the top bar to view its equipment summary.
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-xl border border-border bg-surface">
              <div className="flex items-center justify-between gap-1.5 mb-2">
                <span className="text-[9px] font-black text-text-muted uppercase tracking-wider flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{plantCode}</span>
                </span>
                {loadingSummaryStatus ? (
                  <Loader2 className="w-2.5 h-2.5 animate-spin text-brand shrink-0" />
                ) : summaryStatus?.generated ? (
                  <span className="text-[8px] text-success font-extrabold uppercase tracking-wide shrink-0">
                    Generated
                  </span>
                ) : (
                  <span className="text-[8px] text-warning font-extrabold uppercase tracking-wide shrink-0">
                    Not Generated
                  </span>
                )}
              </div>
              {summaryStatus?.generated ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleOpenPreview}
                    className="flex-1 py-1.5 bg-brand hover:bg-brand-hover text-white rounded-lg font-black uppercase tracking-widest text-[8px] transition-all flex items-center justify-center gap-1 shadow-sm cursor-pointer border border-transparent"
                  >
                    Preview
                  </button>
                  <a
                    href={getPnidDetailedEquipmentSummaryUrl(plantCode)}
                    download
                    className="flex-1 py-1.5 bg-surface border border-border hover:bg-surface-2 text-text-primary rounded-lg font-black uppercase tracking-widest text-[8px] transition-all flex items-center justify-center gap-1 shadow-sm text-center cursor-pointer"
                  >
                    <Download className="w-2.5 h-2.5" /> Download
                  </a>
                </div>
              ) : (
                <button
                  onClick={handleGenerateSummary}
                  disabled={isGeneratingSummary || loadingSummaryStatus}
                  aria-busy={isGeneratingSummary}
                  className="w-full py-1.5 bg-brand hover:bg-brand-hover disabled:bg-surface-2 disabled:text-text-muted text-white rounded-lg font-black uppercase tracking-widest text-[8px] transition-all flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                >
                  {isGeneratingSummary ? (
                    <>
                      <Loader2 className="w-2.5 h-2.5 animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-2.5 h-2.5" /> Generate Summary
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
