'use client';

/**
 * TemplateSourceSection — choose the template symbol: crop from a drawing or
 * upload an image, with a live preview of the active/saved symbol.
 */
import React from 'react';
import { Sparkles, Crop, Layers } from 'lucide-react';
import { Select } from '@/src/components/ui/Select';
import { useTemplateMatchingContext } from '@/src/app/(admin)/admin/domain-configuration/pnid/template-matching/_context/TemplateMatchingContext';
import { pnidService } from '@/src/services/domain-configuration/pnid/pnidService';

const savedTemplateUrl = (plantCode, cat) =>
    pnidService.fileUrl(plantCode, `${plantCode}/results/template_match/template_${cat.replace(/[^a-zA-Z0-9_\- ]/g, '')}.png`);
const latestTemplateUrl = (plantCode) => pnidService.fileUrl(plantCode, `${plantCode}/results/template_match/latest_template.png`);

export default function TemplateSourceSection() {
    const {
        templateSource, resetTemplateSource, selectedFileOption, handleFileChange, preprocessedFiles,
        selectedPageNo, handlePageChange, availablePages, isCropMode, setIsCropMode,
        uploadedFile, uploadedFileUrl, handleUploadFileChange,
        savedCropBox3x, selectedSavedTemplateCategory, plantCode, previewCanvasRef,
    } = useTemplateMatchingContext();

    const tabCls = (active) => `flex-1 py-2 text-label font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${active ? 'bg-surface text-brand shadow-sm border border-border' : 'text-text-subtle hover:text-text-secondary'}`;

    return (
        <div className="p-6 border-b border-border space-y-5">
            <h3 className="text-xs font-black text-text-subtle uppercase tracking-widest flex items-center gap-2">
                <Sparkles size={13} className="text-brand" /> 1. Choose Template Symbol
            </h3>

            <div className="flex border border-border rounded-xl overflow-hidden p-0.5 bg-surface-2">
                <button onClick={() => resetTemplateSource('crop')} className={tabCls(templateSource === 'crop')}>Crop from Drawing</button>
                <button onClick={() => resetTemplateSource('upload')} className={tabCls(templateSource === 'upload')}>Upload Image</button>
            </div>

            {templateSource === 'crop' ? (
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-label font-black text-text-subtle uppercase tracking-wider">Reference Drawing</label>
                        <Select
                            value={selectedFileOption}
                            onChange={handleFileChange}
                            options={preprocessedFiles.map((file) => ({ value: file.pdf, label: file.pdf }))}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-label font-black text-text-subtle uppercase tracking-wider">Sheet / Page</label>
                        <Select
                            value={selectedPageNo}
                            onChange={handlePageChange}
                            options={availablePages.map((_, i) => ({ value: i + 1, label: `Page ${i + 1}` }))}
                        />
                    </div>
                    <button onClick={() => setIsCropMode(!isCropMode)} className={`w-full py-3.5 px-4 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${isCropMode ? 'bg-brand border-brand text-white shadow-md' : 'bg-surface border-border hover:bg-surface-2 text-text-secondary'}`}>
                        <Crop size={14} /> {isCropMode ? 'Drag on Drawing' : 'Crop Symbol from Viewer'}
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    <label className="text-label font-black text-text-subtle uppercase tracking-wider">Upload PNG / JPG symbol</label>
                    <div className="border border-dashed border-border rounded-2xl p-4 bg-surface-2 text-center hover:bg-surface-2/70 transition-colors relative cursor-pointer">
                        <input type="file" accept="image/*" onChange={handleUploadFileChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                        <Layers className="w-6 h-6 text-text-subtle mx-auto mb-2" />
                        <p className="text-label font-black text-text-secondary uppercase tracking-wider truncate">{uploadedFile ? uploadedFile.name : 'Choose File'}</p>
                        <p className="text-2xs text-text-subtle mt-1">Accepts images up to 2MB</p>
                    </div>
                </div>
            )}

            {(savedCropBox3x || uploadedFileUrl || selectedSavedTemplateCategory) && (
                <div className="bg-surface-2 border border-border rounded-2xl p-4 flex flex-col items-center justify-center gap-3 animate-in fade-in duration-300">
                    <p className="text-2xs font-black text-text-subtle uppercase tracking-widest self-start">
                        {selectedSavedTemplateCategory ? `Saved Template: ${selectedSavedTemplateCategory}` : 'Active Symbol Preview'}
                    </p>
                    <div className="border border-border rounded-xl overflow-hidden bg-surface p-2 shadow-sm flex items-center justify-center min-h-[120px]">
                        {selectedSavedTemplateCategory && plantCode ? (
                            <img src={savedTemplateUrl(plantCode, selectedSavedTemplateCategory)} alt="Saved Template" className="max-w-[120px] max-h-[120px] object-contain" onError={(e) => { e.currentTarget.src = latestTemplateUrl(plantCode); }} />
                        ) : templateSource === 'crop' ? (
                            <canvas ref={previewCanvasRef} className="max-w-[120px] max-h-[120px] object-contain" />
                        ) : uploadedFileUrl ? (
                            <img src={uploadedFileUrl} alt="Uploaded Template" className="max-w-[120px] max-h-[120px] object-contain" />
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
}
