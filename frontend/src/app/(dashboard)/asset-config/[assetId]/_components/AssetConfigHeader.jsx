'use client';
import React from 'react';
import Link from 'next/link';
import { MoveRight, Save } from 'lucide-react';

/**
 * Sticky action bar for the asset-configuration page. Mirrors the Template
 * Designer's DesignerHeader (back affordance on the left, single primary
 * action on the right) so the two builder-style screens feel like one product.
 */
export function AssetConfigHeader({ assetId, onSave, saving = false, canSave = false, backHref = '/home' }) {
    return (
        <div className="px-3 sm:px-4 lg:px-6 py-3 bg-surface border-b border-border flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <Link
                    href={backHref}
                    aria-label="Back to diagram"
                    title="Back"
                    className="text-text-secondary hover:text-text-primary p-1.5 bg-border/30 hover:bg-border/60 rounded-lg transition-colors duration-fast cursor-pointer shrink-0"
                >
                    <MoveRight className="w-4 h-4 rotate-180" />
                </Link>

                <div className="min-w-0">
                    <h1 className="text-sm font-bold text-text-primary truncate">
                        Decision Template Builder
                        <MoveRight className="inline w-3.5 h-3.5 mx-1.5 text-text-subtle align-[-1px]" aria-hidden="true" />
                        <span className="text-brand">{assetId}</span>
                    </h1>
                    <p className="text-label font-semibold text-text-muted truncate">
                        Configure KPIs, agent prompts, and ML model parameters
                    </p>
                </div>
            </div>

            <button
                type="button"
                onClick={onSave}
                disabled={!canSave || saving}
                aria-busy={saving}
                title={!canSave && !saving ? 'Nothing to save yet' : undefined}
                className="flex items-center gap-2 px-4 sm:px-5 py-2 bg-brand text-white rounded-lg text-sm font-bold hover:bg-brand-hover active:bg-brand-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-fast shadow-sm shadow-brand/20 cursor-pointer shrink-0 whitespace-nowrap"
            >
                <Save className="w-4 h-4" />
                {saving ? 'Saving…' : 'Save Configure'}
            </button>
        </div>
    );
}
