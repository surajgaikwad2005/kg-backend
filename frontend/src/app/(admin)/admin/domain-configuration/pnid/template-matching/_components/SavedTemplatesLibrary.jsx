'use client';

/**
 * SavedTemplatesLibrary — grid of previously saved symbol templates; selecting
 * one reuses it for the next match run.
 */
import React from 'react';
import { Layers } from 'lucide-react';
import { useTemplateMatchingContext } from '@/src/app/(admin)/admin/domain-configuration/pnid/template-matching/_context/TemplateMatchingContext';
import { pnidService } from '@/src/services/domain-configuration/pnid/pnidService';

export default function SavedTemplatesLibrary() {
    const { libraryMatches, selectedSavedTemplateCategory, selectSavedTemplate, plantCode } = useTemplateMatchingContext();
    const categories = Object.keys(libraryMatches);

    const templateUrl = (cat) => pnidService.fileUrl(plantCode, `${plantCode}/results/template_match/template_${cat.replace(/[^a-zA-Z0-9_\- ]/g, '')}.png`);
    const fallbackUrl = pnidService.fileUrl(plantCode, `${plantCode}/results/template_match/latest_template.png`);

    return (
        <div className="pt-5 border-t border-border space-y-3">
            <h3 className="text-xs font-black text-text-subtle uppercase tracking-widest flex items-center gap-2">
                <Layers size={13} className="text-brand" /> 3. Saved Templates Library
            </h3>
            {categories.length === 0 ? (
                <p className="text-label text-text-subtle font-medium italic">No templates saved yet.</p>
            ) : (
                <div className="grid grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {categories.map((cat) => {
                        const count = libraryMatches[cat]?.length || 0;
                        const isSelected = selectedSavedTemplateCategory === cat;
                        return (
                            <div
                                key={cat}
                                onClick={() => selectSavedTemplate(cat)}
                                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col gap-2 group bg-surface ${isSelected ? 'border-brand shadow-md ring-1 ring-brand/20' : 'border-border hover:border-brand/60'}`}
                            >
                                <div className="aspect-square w-full rounded-lg bg-surface-2 border border-border flex items-center justify-center p-1.5 overflow-hidden">
                                    <img src={templateUrl(cat)} alt={cat} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300" onError={(e) => { e.currentTarget.src = fallbackUrl; }} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-label font-black uppercase tracking-wider truncate text-text-secondary leading-tight">{cat}</p>
                                    <p className="text-2xs text-text-subtle font-bold uppercase mt-0.5">{count} {count === 1 ? 'match' : 'matches'}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
