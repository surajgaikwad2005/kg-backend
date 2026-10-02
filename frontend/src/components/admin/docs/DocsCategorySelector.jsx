'use client';
import React from 'react';
import { motion } from 'framer-motion';

export function DocsCategorySelector({ displayCategories, onSelectCategory }) {
    return (
        <div className="space-y-6">
            <h3 className="text-label font-bold text-text-muted uppercase tracking-widest px-1">
                Select Document Type
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {displayCategories.map((cat, idx) => (
                    <motion.button
                        key={cat.id}
                        whileHover={{ y: -4 }}
                        onClick={() => onSelectCategory(cat.id, idx)}
                        className="bg-surface border border-border p-8 rounded-2xl flex flex-col items-center gap-4 transition-all hover:border-brand hover:bg-surface-2 hover:shadow-card group cursor-pointer"
                    >
                        <div className="w-16 h-16 rounded-xl bg-surface-2 flex items-center justify-center text-3xl group-hover:bg-brand/10 transition-all">
                            {cat.icon}
                        </div>
                        <span className="text-body-sm font-semibold text-text-secondary group-hover:text-text-primary transition-colors text-center">
                            {cat.label}
                        </span>
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
