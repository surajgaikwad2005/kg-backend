'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Download, RefreshCw, Settings, Zap } from 'lucide-react';
import { useDataActivity } from './_hooks/useDataActivity';
import { ActivitySummaryCards } from './_components/ActivitySummaryCards';
import { ActivityFilters } from './_components/ActivityFilters';
import { JobsTable } from './_components/JobsTable';
import { EditTriggersModal } from './_components/EditTriggersModal';

export default function DataActivityPage() {
    const [isMounted, setIsMounted] = React.useState(false);
    React.useEffect(() => { setIsMounted(true); }, []);

    const {
        expandedJobId, setExpandedJobId,
        showHistoryFor, setShowHistoryFor,
        showEditTriggers, setShowEditTriggers,
        filterStatus, setFilterStatus,
        filterSource, setFilterSource,
        searchQuery, setSearchQuery,
        triggerEdits, updateEdit,
        filteredJobs, stats, activeJobs,
        lastRefreshed, realJobs,
        fetchActivity, openTriggerEditor, resetFilters,
    } = useDataActivity();

    if (!isMounted) return null;

    return (
               <div className="flex-1 bg-canvas p-6 md:p-8 overflow-y-auto relative">
                   <div className="max-w-6xl mx-auto">
                       <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                           <div className="flex items-center justify-between">
                               <div className="flex items-center gap-4">
                                   <div className="w-12 h-12 bg-brand rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand/20">
                                       <Zap size={24} />
                                   </div>
                                   <div>
                                       <h2 className="text-2xl font-bold text-text-primary">Data Activity</h2>
                                       <p className="text-text-muted text-sm">Pipeline jobs, CDC batches & data delta monitoring</p>
                                   </div>
                               </div>
                               <div className="flex items-center gap-3">
                                   {/* <button onClick={openTriggerEditor}
                                       className="bg-surface-2 hover:bg-border/40 text-text-primary px-4 py-2 rounded-xl text-xs font-bold border border-border transition-all flex items-center gap-2 cursor-pointer">
                                       <Settings size={14} />Edit Triggers
                                   </button>
                                   <button className="bg-surface-2 hover:bg-border/40 text-text-primary px-4 py-2 rounded-xl text-xs font-bold border border-border transition-all flex items-center gap-2 cursor-pointer">
                                       <Download size={14} />Export CSV
                                   </button> */}
                                   <button onClick={fetchActivity}
                                       className="bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-brand/20 transition-all flex items-center gap-2 cursor-pointer">
                                       <RefreshCw size={14} />Refresh
                                   </button>
                               </div>
                           </div>

                           <ActivitySummaryCards stats={stats} />

                           <ActivityFilters
                               filterStatus={filterStatus} setFilterStatus={setFilterStatus}
                               filterSource={filterSource} setFilterSource={setFilterSource}
                               searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                               onReset={resetFilters}
                           />

                           <JobsTable
                               filteredJobs={filteredJobs}
                               lastRefreshed={lastRefreshed}
                               realJobs={realJobs}
                               expandedJobId={expandedJobId} setExpandedJobId={setExpandedJobId}
                               showHistoryFor={showHistoryFor} setShowHistoryFor={setShowHistoryFor}
                           />

                           <EditTriggersModal
                               showEditTriggers={showEditTriggers}
                               setShowEditTriggers={setShowEditTriggers}
                               activeJobs={activeJobs}
                               triggerEdits={triggerEdits}
                               updateEdit={updateEdit}
                           />
                       </motion.div>
                   </div>
               </div>
    );
}
