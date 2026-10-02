'use client';

/**
 * TagConfigSection — instrument tag configuration: category name, example tag
 * (auto-generates a regex), editable pattern with match previews, threshold, and
 * search scope.
 */
import React from 'react';
import { Settings } from 'lucide-react';
import { useTemplateMatchingContext } from '@/src/app/(admin)/admin/domain-configuration/pnid/template-matching/_context/TemplateMatchingContext';
import { generateTagRegex, generateExampleMatches } from '@/src/app/(admin)/admin/domain-configuration/pnid/template-matching/_lib/utils';

const Step = ({ letter, label }) => (
    <div className="flex items-center gap-2">
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-brand text-white text-2xs font-black shrink-0">{letter}</span>
        <label className="text-label font-black text-text-subtle uppercase tracking-wider">{label}</label>
    </div>
);

const inputCls = 'w-full px-4 py-3 bg-surface-2 border border-border rounded-xl text-xs font-bold text-text-secondary focus:outline-none focus:border-brand focus:bg-surface transition-colors';

export default function TagConfigSection() {
    const {
        symbolCategory, setSymbolCategory, tagExample, setTagExample, tagRegex, setTagRegex,
        isRegexManuallyEdited, setIsRegexManuallyEdited, threshold, setThreshold, searchScope, setSearchScope,
    } = useTemplateMatchingContext();

    const onExampleChange = (val) => {
        setTagExample(val);
        if (!isRegexManuallyEdited) setTagRegex(val.trim() ? generateTagRegex(val.trim()) : '');
    };

    return (
        <div className="p-6 space-y-5">
            <h3 className="text-xs font-black text-text-subtle uppercase tracking-widest flex items-center gap-2">
                <Settings size={13} className="text-brand" /> 2. Instrument Tag Configuration
            </h3>

            <div className="space-y-1.5">
                <Step letter="A" label="Tag Name (Category)" />
                <input type="text" value={symbolCategory} onChange={(e) => setSymbolCategory(e.target.value)} placeholder="e.g. Pressure Tag, Flow Tag" className={inputCls} />
                <p className="text-2xs text-text-subtle font-medium leading-relaxed">Results are grouped under this label in the library.</p>
            </div>

            <div className="space-y-1.5">
                <Step letter="B" label="Example Tag Text" />
                <input type="text" value={tagExample} onChange={(e) => onExampleChange(e.target.value)} placeholder="e.g. PT 123, FT-301, TG 142" className={inputCls} />
                <p className="text-2xs text-text-subtle font-medium leading-relaxed">
                    A real tag from your drawing. The system auto-generates a pattern covering variants like <span className="font-mono text-text-muted">PT-123</span>, <span className="font-mono text-text-muted">PT 123</span>.
                </p>
            </div>

            {tagRegex && (
                <div className="space-y-2 rounded-xl border border-brand/20 bg-brand-muted/50 p-4">
                    <div className="flex items-center justify-between">
                        <Step letter="C" label="Auto-Generated Pattern" />
                        {isRegexManuallyEdited && (
                            <button onClick={() => { setIsRegexManuallyEdited(false); if (tagExample.trim()) setTagRegex(generateTagRegex(tagExample.trim())); }} className="text-[8px] font-black text-brand uppercase tracking-wider hover:text-brand-hover cursor-pointer">
                                ↺ Reset to Auto
                            </button>
                        )}
                    </div>
                    <input type="text" value={tagRegex} onChange={(e) => { setTagRegex(e.target.value); setIsRegexManuallyEdited(true); }} className="w-full px-4 py-2.5 bg-surface border border-brand/30 rounded-lg text-xs font-mono font-bold text-brand focus:outline-none focus:border-brand transition-colors" />
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="text-[8px] font-black text-text-subtle uppercase tracking-wider">Matches:</span>
                        {generateExampleMatches(tagExample).map((ex, i) => (
                            <span key={`${ex}-${i}`} className="px-2 py-0.5 bg-success/10 text-success border border-success/30 text-[8px] font-bold rounded-md font-mono">{ex}</span>
                        ))}
                        <span className="text-[8px] text-text-subtle font-medium">…and more</span>
                    </div>
                </div>
            )}

            <div className="space-y-2">
                <div className="flex justify-between items-center text-label font-black uppercase tracking-wider text-text-subtle">
                    <span>Matching Threshold</span>
                    <span className="text-brand font-extrabold text-xs">{Math.round(threshold * 100)}%</span>
                </div>
                <input type="range" min="0.5" max="1.0" step="0.05" value={threshold} onChange={(e) => setThreshold(parseFloat(e.target.value))} className="w-full h-1.5 bg-surface-2 rounded-lg appearance-none cursor-pointer accent-brand" />
                <p className="text-2xs text-text-subtle font-medium">Lower thresholds match more aggressively; higher values match strictly.</p>
            </div>

            <div className="space-y-2">
                <label className="text-label font-black text-text-subtle uppercase tracking-wider">Search Scope</label>
                <div className="grid grid-cols-2 gap-2">
                    {[['all', 'All Drawings'], ['current', 'Current PDF']].map(([val, label]) => (
                        <button key={val} onClick={() => setSearchScope(val)} className={`py-2.5 px-3 rounded-xl border text-label font-black uppercase tracking-wider transition-all cursor-pointer ${searchScope === val ? 'bg-text-primary border-text-primary text-surface shadow-sm' : 'bg-surface-2 border-border text-text-muted hover:bg-surface'}`}>
                            {label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
