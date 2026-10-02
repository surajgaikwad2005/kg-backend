'use client';
import React from 'react';
import Link from 'next/link';
import { PanelLeft, MoveRight, Save } from 'lucide-react';

export function DesignerHeader({ templateName, onSave, saving = false, isDirty = false, sidebarOpen, onToggleSidebar }) {
    return (
        <div className="px-3 sm:px-4 lg:px-6 py-3 bg-surface border-b border-border flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <Link
                    href="/admin/decision-template"
                    aria-label="Back to template list"
                    title="Back to list"
                    className="text-text-secondary hover:text-text-primary p-1.5 bg-border/30 hover:bg-border/60 rounded-lg transition-colors duration-fast cursor-pointer shrink-0"
                >
                    <MoveRight className="w-4 h-4 rotate-180" />
                </Link>

                {/* Only meaningful while the category list is a drawer (below lg) */}
                <button
                    type="button"
                    onClick={onToggleSidebar}
                    aria-label={sidebarOpen ? 'Hide category list' : 'Show category list'}
                    aria-expanded={sidebarOpen}
                    title="Toggle categories"
                    className={`lg:hidden p-1.5 rounded-lg transition-colors duration-fast cursor-pointer shrink-0 ${
                        sidebarOpen ? 'bg-brand-muted text-brand' : 'bg-border/30 text-text-secondary hover:bg-border/60 hover:text-text-primary'
                    }`}
                >
                    <PanelLeft className="w-5 h-5" />
                </button>

                <p className="text-sm font-semibold text-text-secondary truncate min-w-0">
                    Designing layout for <span className="text-text-primary">{templateName}</span>
                </p>

                {isDirty && (
                    <span
                        className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-warning bg-warning/10 px-2 py-0.5 rounded-full shrink-0 animate-time-selector-in"
                        role="status"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" aria-hidden="true" />
                        Unsaved changes
                    </span>
                )}
            </div>

            <button
                type="button"
                onClick={onSave}
                disabled={saving || !isDirty}
                aria-busy={saving}
                title={!isDirty && !saving ? 'No changes to save' : undefined}
                className="flex items-center gap-2 px-4 sm:px-5 py-2 bg-brand text-white rounded-lg text-sm font-bold hover:bg-brand-hover active:bg-brand-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-fast shadow-sm shadow-brand/20 cursor-pointer shrink-0 whitespace-nowrap"
            >
                <Save className="w-4 h-4" />
                {saving ? 'Saving…' : 'Save Template'}
            </button>
        </div>
    );
}
