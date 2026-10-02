'use client';
import React from 'react';
import { Library, Sparkles, Layers, Wand2 } from 'lucide-react';

export function LibraryComingSoon() {
    return (
        <div className="relative overflow-hidden flex flex-col items-center justify-center text-center p-8 sm:p-12 md:p-16 bg-surface border border-border rounded-2xl shadow-sm transition-all duration-300">
            {/* Ambient Purple Highlight Glow */}
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-highlight/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-highlight/10 blur-3xl pointer-events-none" />

            {/* Glowing Icon Container */}
            <div className="relative group mb-6">
                {/* Outer Glow Halo */}
                <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-highlight via-purple-500 to-indigo-500 opacity-40 blur-md group-hover:opacity-75 transition duration-500 animate-pulse" />

                {/* Main Purple Gradient Icon Box */}
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-highlight via-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-highlight/25 transform transition-all duration-300 group-hover:scale-105 group-hover:rotate-1">
                    <Library className="w-10 h-10 drop-shadow-sm" />

                    {/* Sparkle Badge Accent */}
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center shadow-md">
                        <Sparkles className="w-4 h-4 text-highlight animate-spin" style={{ animationDuration: '8s' }} />
                    </div>
                </div>
            </div>

            {/* Typography */}
            <div className="space-y-2 max-w-md mb-6">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
                    Template Library
                </h2>
                <p className="text-sm text-text-secondary leading-relaxed">
                    A curated set of ready-made decision workflow templates is on its way. Stay tuned for instant 1-click deployments and industry standards!
                </p>
            </div>

            {/* Redesigned Coming Soon Pill Button */}
            <div className="flex flex-col items-center gap-4">
                <div
                    tabIndex={0}
                    role="status"
                    aria-label="Coming Soon status"
                    className="group/btn relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-highlight via-purple-600 to-indigo-600 text-white font-bold text-xs uppercase tracking-widest shadow-md shadow-highlight/30 hover:shadow-lg hover:shadow-highlight/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer overflow-hidden border border-white/20 select-none focus:outline-none focus:ring-2 focus:ring-highlight/50"
                >
                    <Sparkles className="w-4 h-4 text-white/90 group-hover/btn:rotate-12 transition-transform duration-300" />
                    <span>Coming Soon</span>

                    {/* Shimmer sweep effect */}
                    <span className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none" />
                </div>

                {/* Feature Pill Tags */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-2 text-[11px] font-medium text-text-muted">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-2 border border-border text-text-secondary">
                        <Layers className="w-3.5 h-3.5 text-highlight" />
                        Pre-built Workflows
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-2 border border-border text-text-secondary">
                        <Wand2 className="w-3.5 h-3.5 text-highlight" />
                        1-Click Setup
                    </span>
                </div>
            </div>
        </div>
    );
}

