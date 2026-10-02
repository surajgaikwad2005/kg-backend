'use client';
import { useState, useCallback, useMemo } from 'react';
import { cronToInterval } from '../_components/activityUtils';
import { useApp } from '@/src/context/AppContext';
import { usePipelineJobs } from '../_queries/useDataActivityQueries';

export function useDataActivity() {
    const { plantId: selectedPlantId } = useApp();
    const [expandedJobId, setExpandedJobId] = useState(null);
    const [showHistoryFor, setShowHistoryFor] = useState(null);
    const [showEditTriggers, setShowEditTriggers] = useState(false);
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterSource, setFilterSource] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [triggerEdits, setTriggerEdits] = useState({});
    const plantCode = selectedPlantId?.id || selectedPlantId?.code || selectedPlantId?.plant_code_id;

    // 30s refresh, unmount-safe by construction — this replaces a setInterval
    // whose callback was rebuilt on every plantId change.
    const jobsQuery = usePipelineJobs(plantCode);
    const realJobs = jobsQuery.data ?? null;

    // `dataUpdatedAt` is the timestamp of the last successful fetch, which is
    // exactly what the old `lastRefreshed` state tracked by hand.
    const lastRefreshed = useMemo(
        () => (jobsQuery.dataUpdatedAt ? new Date(jobsQuery.dataUpdatedAt) : new Date()),
        [jobsQuery.dataUpdatedAt],
    );

    const fetchActivity = useCallback(() => { jobsQuery.refetch(); }, [jobsQuery]);

    const activeJobs = useMemo(() => realJobs ?? [], [realJobs]);

    const filteredJobs = useMemo(() =>
        activeJobs.filter(job => {
            const latestRun = job.runs[0];
            const matchesStatus = filterStatus === 'All' || (latestRun && latestRun.status === filterStatus);
            const matchesSource = filterSource === 'All' || job.source === filterSource;
            const matchesSearch = job.jobId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                job.namespace.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesStatus && matchesSource && matchesSearch;
        }),
        [activeJobs, filterStatus, filterSource, searchQuery]
    );

    const stats = useMemo(() => {
        const latestRuns = activeJobs.map(j => j.runs[0]).filter(Boolean);
        return {
            total: activeJobs.length,
            success: latestRuns.filter(r => r.status === 'Success').length,
            failed: latestRuns.filter(r => r.status === 'Failed').length,
            running: latestRuns.filter(r => r.status === 'Running').length,
            totalRecords: latestRuns.reduce((acc, r) => acc + r.totalRecords, 0),
            totalInserts: latestRuns.reduce((acc, r) => acc + r.inserts, 0),
        };
    }, [activeJobs]);

    const updateEdit = useCallback((jobId, patch) =>
        setTriggerEdits(prev => ({ ...prev, [jobId]: { ...prev[jobId], ...patch } })),
        []
    );

    const openTriggerEditor = useCallback(() => {
        const edits = {};
        activeJobs.forEach(j => { edits[j.jobId] = { trigger: j.trigger, interval: cronToInterval(j.schedule, j.trigger) }; });
        setTriggerEdits(edits);
        setShowEditTriggers(true);
    }, [activeJobs]);

    const resetFilters = useCallback(() => {
        setFilterStatus('All');
        setFilterSource('All');
        setSearchQuery('');
    }, []);

    return {
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
    };
}
