'use client';
import React, { useState, useCallback } from 'react';
import { useApp } from '@/src/context/AppContext';
import { useConnectorActivityLogs } from '@/src/components/admin/_queries/useLogManagementQueries';
import { useToast } from '@/src/components/ui/Toast';
import { LogStatsGrid } from './LogStatsGrid';
import { ConnectorActivityFilters } from './ConnectorActivityFilters';
import { LogsTable } from './LogsTable';
import { LogDetailDrawer } from './LogDetailDrawer';

export function ConnectorActivityTab() {
    const { plantCode } = useApp();
    const { entries: realLogEntries, logStats, refetch: fetchConnectorActivity } = useConnectorActivityLogs(plantCode);
    const { success, error } = useToast();
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLog, setSelectedLog] = useState(null);
    const [isRetrying, setIsRetrying] = useState(null);

    const activeLogEntries = realLogEntries ?? [];
    const filteredLogs = activeLogEntries.filter(log => {
        const matchesStatus = filterStatus === 'All' || log.status === filterStatus;
        const matchesSearch =
            log.connector.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.runId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.destination.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const handleRetry = useCallback(async (id) => {
        setIsRetrying(id);
        try {
            await fetchConnectorActivity();
            success('Retry Initiated', `Run ${id} has been re-queued.`);
        } catch {
            error('Retry Failed', `Could not retry run ${id}. Please try again.`);
        } finally {
            setIsRetrying(null);
        }
    }, [fetchConnectorActivity, success, error]);

    return (
        <div className="space-y-8">
            <LogStatsGrid realLogEntries={realLogEntries} logStats={logStats} activeLogEntries={activeLogEntries} />
            <ConnectorActivityFilters filterStatus={filterStatus} setFilterStatus={setFilterStatus} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            <LogsTable filteredLogs={filteredLogs} isRetrying={isRetrying} onRowClick={setSelectedLog} onRetry={handleRetry} onRefresh={fetchConnectorActivity} />
            <LogDetailDrawer selectedLog={selectedLog} onClose={() => setSelectedLog(null)} isRetrying={isRetrying} onRetry={handleRetry} />
        </div>
    );
}
