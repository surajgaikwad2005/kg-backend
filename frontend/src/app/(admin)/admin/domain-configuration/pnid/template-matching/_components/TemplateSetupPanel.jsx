'use client';

/**
 * TemplateSetupPanel — the Setup tab: alerts, template source, tag config, saved
 * library, a pre-flight checklist of what's still missing, and the run button.
 */
import React from 'react';
import { Loader2, Play } from 'lucide-react';
import { useTemplateMatchingContext } from '@/src/app/(admin)/admin/domain-configuration/pnid/template-matching/_context/TemplateMatchingContext';
import Alerts from '@/src/app/(admin)/admin/domain-configuration/pnid/template-matching/_components/Alerts';
import TemplateSourceSection from '@/src/app/(admin)/admin/domain-configuration/pnid/template-matching/_components/TemplateSourceSection';
import TagConfigSection from '@/src/app/(admin)/admin/domain-configuration/pnid/template-matching/_components/TagConfigSection';
import SavedTemplatesLibrary from '@/src/app/(admin)/admin/domain-configuration/pnid/template-matching/_components/SavedTemplatesLibrary';

export default function TemplateSetupPanel() {
    const {
        selectedSavedTemplateCategory, templateSource, savedCropBox3x, uploadedFile, symbolCategory,
        isMatchingLoading, handleRunTemplateMatch,
    } = useTemplateMatchingContext();

    const hasTemplate = selectedSavedTemplateCategory || (templateSource === 'crop' ? !!savedCropBox3x : !!uploadedFile);
    const hasName = !!symbolCategory.trim();
    const allReady = hasTemplate && hasName;

    return (
        <div className="flex-1 overflow-y-auto">
            <Alerts />
            <TemplateSourceSection />
            <TagConfigSection />

            <div className="px-6 pb-6 space-y-5">
                <SavedTemplatesLibrary />

                {!allReady && (
                    <div className="rounded-xl border border-warning/30 bg-warning/10 p-3 space-y-1.5">
                        <p className="text-2xs font-black text-warning uppercase tracking-wider">Still needed before running:</p>
                        {!hasTemplate && (
                            <div className="flex items-center gap-2 text-2xs text-warning font-medium">
                                <span className="w-4 h-4 rounded-full border-2 border-warning flex items-center justify-center shrink-0 text-[7px] font-black">1</span>
                                {templateSource === 'crop' ? 'Draw a bounding box on the drawing (or select a saved template)' : 'Upload a template image (or select a saved template)'}
                            </div>
                        )}
                        {!hasName && (
                            <div className="flex items-center gap-2 text-2xs text-warning font-medium">
                                <span className="w-4 h-4 rounded-full border-2 border-warning flex items-center justify-center shrink-0 text-[7px] font-black">A</span>
                                Enter a Tag Name (e.g. "Pressure Tag")
                            </div>
                        )}
                    </div>
                )}

                <button
                    disabled={isMatchingLoading || !hasName || !hasTemplate}
                    onClick={handleRunTemplateMatch}
                    className="w-full py-4 bg-brand hover:bg-brand-hover disabled:bg-surface-2 disabled:text-text-subtle disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                    {isMatchingLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Matching...</> : <><Play size={13} fill="currentColor" /> Run Matching Search</>}
                </button>
            </div>
        </div>
    );
}
