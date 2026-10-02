'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

export function LockedState() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex flex-col items-center justify-center py-16 px-6"
        >
            <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mb-4">
                <Lock size={22} className="text-text-subtle" />
            </div>
            <h3 className="text-body font-bold text-text-muted text-center">Select a Plant ID to get started</h3>
            <p className="text-caption text-text-subtle text-center mt-1.5 max-w-xs leading-relaxed">
                Associate your data sources with a specific plant to track and manage configurations per facility.
            </p>
            <div className="grid grid-cols-4 gap-3 mt-8 w-full max-w-md opacity-25 pointer-events-none select-none">
                {['P&ID', 'Documents', 'Historian', 'SAP'].map(label => (
                    <div key={label} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border bg-surface">
                        <div className="w-8 h-8 rounded-lg bg-surface-2" />
                        <span className="text-caption font-semibold text-text-muted">{label}</span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
