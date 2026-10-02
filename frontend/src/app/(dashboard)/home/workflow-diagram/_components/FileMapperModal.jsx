"use client";
import React, { useRef } from "react";
import { X, UploadCloud, FileSpreadsheet, Settings2, Database, Loader2 } from "lucide-react";
import { Modal } from "@/src/components/ui/Modal";
import { Select } from "@/src/components/ui/Select";
import { useFileMapper } from "../_hooks/useFileMapper";

export default function FileMapperModal({
  isOpen,
  onClose,
  onSubmit,
  isProcessing,
  provider,
  setProvider,
  jobProgress,
}) {
  const fileInputRef = useRef(null);

  const {
    file,
    setFile,
    headers,
    equipmentCol,
    setEquipmentCol,
    descCol,
    setDescCol,
    modalMode,
    setModalMode,
    sourceCol,
    setSourceCol,
    targetCol,
    setTargetCol,
    labelCol,
    setLabelCol,
    sheets,
    selectedSheet,
    error,
    setError,
    handleSheetChange,
    handleFileChange,
    handleProcess,
  } = useFileMapper({ isOpen, onSubmit });

  return (
    <Modal open={isOpen} onClose={onClose} size="lg" className="overflow-hidden flex flex-col border border-border">
          <div className="p-6 border-b border-border flex justify-between items-center bg-surface-2/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand/10 text-brand rounded-xl">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3
                  id="file-mapper-title"
                  className="text-[18px] font-black text-text-primary tracking-tight"
                >
                  Bulk Component Ingestion
                </h3>
                <p className="text-caption font-bold text-text-muted tracking-wider uppercase mt-0.5">
                  Map Data Columns from File
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2 hover:bg-surface-2 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-text-muted" />
            </button>
          </div>

          <div className="flex border-b border-border bg-surface-2/80 shrink-0">
            {[
              { id: "components", label: "AI Component Builder", color: "brand" },
              { id: "connections", label: "Connections Diagram", color: "success" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setModalMode(tab.id);
                  setError(null);
                }}
                className={`flex-1 py-3 text-caption font-black uppercase tracking-widest transition-all cursor-pointer ${
                  modalMode === tab.id
                    ? `text-${tab.color} border-b-2 border-${tab.color} bg-surface`
                    : "text-text-muted hover:text-text-primary hover:bg-surface-2"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 p-6 space-y-6">
            {error && (
              <div className="p-3 bg-danger/10 border border-danger/20 text-danger rounded-xl text-xs font-medium">
                {error}
              </div>
            )}

            {isProcessing && jobProgress ? (
              <div className="flex flex-col items-center justify-center p-8 bg-brand/5 border border-brand/20 rounded-2xl">
                <h4 className="text-[15px] font-black text-text-primary mb-2">
                  Generating Components
                </h4>
                <p className="text-caption font-bold text-text-muted uppercase tracking-widest mb-6">
                  Processing {jobProgress.processed} of {jobProgress.total_rows} rows
                </p>
                <div className="w-full bg-surface-2 rounded-full h-2 mb-4 overflow-hidden">
                  <div
                    className="bg-brand h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          0,
                          (jobProgress.processed / Math.max(jobProgress.total_rows, 1)) * 100
                        )
                      )}%`,
                    }}
                  />
                </div>
                <div className="flex w-full justify-between mt-2">
                  <div className="flex flex-col items-center p-3 bg-surface border border-border rounded-xl w-[48%] shadow-sm">
                    <span className="text-label font-bold text-text-muted uppercase tracking-wider mb-1">
                      Success
                    </span>
                    <span className="text-[18px] font-black text-success">
                      {jobProgress.success_count}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-surface border border-border rounded-xl w-[48%] shadow-sm">
                    <span className="text-label font-bold text-text-muted uppercase tracking-wider mb-1">
                      Failed
                    </span>
                    <span className="text-[18px] font-black text-danger">
                      {jobProgress.failure_count}
                    </span>
                  </div>
                </div>
                {jobProgress.status === "completed" && (
                  <p className="mt-4 text-caption font-bold text-success bg-success/10 px-3 py-1.5 rounded-full border border-success/20">
                    Job Complete! Finishing up...
                  </p>
                )}
              </div>
            ) : !file ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border hover:border-brand bg-surface-2 hover:bg-brand/5 transition-colors rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer group"
              >
                <UploadCloud className="w-10 h-10 text-text-muted group-hover:text-brand mb-3 transition-colors" />
                <h4 className="text-body font-bold text-text-primary">
                  Click to upload CSV or Excel
                </h4>
                <p className="text-caption text-text-muted mt-1 font-medium">
                  .csv, .xls, .xlsx supported
                </p>
              </div>
            ) : (
              <div className="p-4 bg-brand/5 border border-brand/20 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-6 h-6 text-brand" />
                  <div>
                    <p className="text-body-sm font-bold text-text-primary">{file.name}</p>
                    <p className="text-label font-medium text-brand">
                      {(file.size / 1024).toFixed(1)} KB · {headers.length} columns found
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-caption font-bold text-danger hover:text-danger-hover px-3 py-1.5 bg-surface rounded-lg border border-danger/20 shadow-sm cursor-pointer transition-colors"
                >
                  Remove
                </button>
              </div>
            )}

            {!isProcessing && file && sheets.length > 1 && (
              <div className="p-4 bg-surface-2 border border-border rounded-2xl space-y-2">
                <label
                  htmlFor="sheet-select"
                  className="block text-caption font-black text-text-muted uppercase tracking-widest"
                >
                  Excel Sheet / Page <span className="text-danger">*</span>
                </label>
                <Select
                  id="sheet-select"
                  value={selectedSheet}
                  onChange={handleSheetChange}
                  options={sheets.map((s) => ({ value: s, label: s }))}
                />
              </div>
            )}
            <input
              type="file"
              accept=".csv, .xlsx, .xls"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              aria-label="Upload diagram file"
            />

            {headers.length > 0 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2 mb-2 border-b border-border pb-2">
                  <Settings2 className="w-4 h-4 text-text-muted" />
                  <h4 className="text-[12px] font-black text-text-primary uppercase tracking-widest">
                    Column Mapping
                  </h4>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {modalMode === "components" ? (
                    <>
                      <div>
                        <label
                          htmlFor="equip-col"
                          className="block text-caption font-bold text-text-secondary mb-1.5"
                        >
                          Equipment Name <span className="text-danger">*</span>
                        </label>
                        <Select
                          id="equip-col"
                          value={equipmentCol}
                          onChange={setEquipmentCol}
                          placeholder="Select column..."
                          options={headers.map((h) => ({ value: h, label: h }))}
                          searchable
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="desc-col"
                          className="block text-caption font-bold text-text-secondary mb-1.5"
                        >
                          Description <span className="text-text-muted font-normal">(Optional)</span>
                        </label>
                        <Select
                          id="desc-col"
                          value={descCol}
                          onChange={setDescCol}
                          options={[
                            { value: '', label: 'None' },
                            ...headers.map((h) => ({ value: h, label: h })),
                          ]}
                          searchable
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="model-select"
                          className="block text-caption font-bold text-text-secondary mb-1.5"
                        >
                          Model <span className="text-danger">*</span>
                        </label>
                        <Select
                          id="model-select"
                          value={provider}
                          onChange={setProvider}
                          options={[
                            { value: 'claude', label: 'Claude' },
                            { value: 'google-gemini', label: 'Google Gemini' },
                          ]}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label
                          htmlFor="src-col"
                          className="block text-caption font-bold text-text-secondary mb-1.5"
                        >
                          Source (From) <span className="text-danger">*</span>
                        </label>
                        <Select
                          id="src-col"
                          value={sourceCol}
                          onChange={setSourceCol}
                          placeholder="Select column..."
                          options={headers.map((h) => ({ value: h, label: h }))}
                          searchable
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="tgt-col"
                          className="block text-caption font-bold text-text-secondary mb-1.5"
                        >
                          Target (To) <span className="text-danger">*</span>
                        </label>
                        <Select
                          id="tgt-col"
                          value={targetCol}
                          onChange={setTargetCol}
                          placeholder="Select column..."
                          options={headers.map((h) => ({ value: h, label: h }))}
                          searchable
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="lbl-col"
                          className="block text-caption font-bold text-text-secondary mb-1.5"
                        >
                          Label <span className="text-text-muted font-normal">(Optional)</span>
                        </label>
                        <Select
                          id="lbl-col"
                          value={labelCol}
                          onChange={setLabelCol}
                          options={[
                            { value: '', label: 'None' },
                            ...headers.map((h) => ({ value: h, label: h })),
                          ]}
                          searchable
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border bg-surface-2/50 flex gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing && jobProgress?.status !== "completed"}
              className="flex-1 py-2.5 bg-surface border border-border text-text-secondary rounded-xl font-bold text-[12px] hover:bg-surface-2 disabled:opacity-50 transition-colors shadow-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleProcess}
              disabled={
                !file ||
                (modalMode === "components" ? !equipmentCol : !sourceCol || !targetCol) ||
                isProcessing
              }
              className="flex-1 py-2.5 bg-brand text-white rounded-xl font-black text-[12px] uppercase tracking-wider hover:bg-brand-hover disabled:bg-surface-2 disabled:text-text-muted transition-colors shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                </>
              ) : (
                "Process File"
              )}
            </button>
          </div>
    </Modal>
  );
}
