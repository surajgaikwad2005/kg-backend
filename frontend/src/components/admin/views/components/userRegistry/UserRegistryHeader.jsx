'use client';

import React from 'react';
import { Users, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function UserRegistryHeader({ onSave, isSaving = false, hasChanges = false }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand/25">
                    <Users size={24} />
                </div>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                        User Management
                    </h1>
                    <p className="text-text-muted text-sm mt-0.5">
                        Manage user access and feature permissions
                    </p>
                </div>
            </div>

            <AnimatePresence>
                {hasChanges && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 5 }}
                        transition={{ duration: 0.18 }}
                        onClick={onSave}
                        disabled={isSaving}
                        className="bg-brand hover:bg-brand-hover active:scale-[0.98] text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-brand/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed self-start sm:self-auto"
                        aria-label="Save changes"
                    >
                        {isSaving ? (
                            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save size={18} />
                        )}
                        <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}

export default UserRegistryHeader;
