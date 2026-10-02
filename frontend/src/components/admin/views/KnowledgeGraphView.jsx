'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useAdminNav } from '@/src/components/admin/AdminPanelContext';
import { useApp } from '@/src/context/AppContext';
import KnowledgeGraph from '@/src/components/ui/knowledge-graph/KnowledgeGraph';
import { useDocsKnowledgeGraph } from '@/src/components/admin/_queries/useDsiQueries';

export function KnowledgeGraphView() {
    const { setView } = useAdminNav();
    // This view previously called the service with NO argument, and the service
    // dropped the plant code anyway — so every plant rendered the same graph.
    // Both halves are fixed: the service now sends plant_code_id, and the plant
    // is supplied here and keyed on.
    const { plantCode } = useApp();
    const { data, isLoading: loading } = useDocsKnowledgeGraph(plantCode);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[100] bg-canvas flex flex-col"
        >
            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex items-center gap-3 text-text-subtle font-bold tracking-widest uppercase">
                        <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin"/>
                        Rendering Knowledge Graph…
                    </div>
                </div>
            ) : (
                <KnowledgeGraph 
                    data={data} 
                    onClose={() => setView('welcome')} 
                />
            )}
        </motion.div>
    );
}
