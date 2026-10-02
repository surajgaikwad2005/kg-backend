'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTimeRange } from './useTimeRange';
// ALERTS_CONFIG/processAlertPriority are only used inside the disabled fetch below.
// import { ALERTS_CONFIG, processAlertPriority } from '@/src/config/dashboard/alerts.config';
// industrial-data service removed from cpcp-configuration (out of the refactored
// contract) — disabled until this widget is rewired to a real backend.
// import { getRecentAlerts } from '@/src/services/cpcp/industrial-data/industrialDataService';

/**
 * Custom hook to abstract data fetching and processing logic from Alerts Panel.
 */
export function useAlertsData() {
    const range = useTimeRange();
    const [alertsData, setAlertsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAlerts = useCallback(async () => {
        setLoading(true);
        setError(null);
        // industrial-data (getRecentAlerts) is disabled — see import comment above.
        // try {
        //     const start = range.start;
        //     const end = range.end;
        //
        //     // Format for API: "YYYY-MM-DD HH:MM:SS"
        //     const formatDate = (date) => {
        //         const pad = (n) => n.toString().padStart(2, '0');
        //         if (isNaN(date.getTime()))
        //             return '';
        //         return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
        //             `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
        //     };
        //
        //     const json = await getRecentAlerts({
        //         start_time: formatDate(start),
        //         end_time: formatDate(end),
        //         limit: String(ALERTS_CONFIG.fetchLimit),
        //     });
        //     if (json.statusCode === 200) {
        //         const rawAlerts = json.data || [];
        //         const prioritizedAlerts = rawAlerts.map(processAlertPriority);
        //         const sortedAlerts = [...prioritizedAlerts].sort((a, b) => {
        //             const statusA = (a.data?.status || 'info').toLowerCase();
        //             const statusB = (b.data?.status || 'info').toLowerCase();
        //             const indexA = ALERTS_CONFIG.statusOrder.indexOf(statusA);
        //             const indexB = ALERTS_CONFIG.statusOrder.indexOf(statusB);
        //             return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
        //         });
        //         setAlertsData(sortedAlerts);
        //     } else {
        //         setError(json.message || 'Failed to fetch alerts');
        //     }
        // } catch (err) {
        //     setError(err?.status === 503
        //         ? 'Industrial Backend Offline (System Stability Check)'
        //         : 'Industrial Gateway Connection Error');
        // } finally {
        //     setLoading(false);
        // }
        setAlertsData([]);
        setLoading(false);
    }, [range.start, range.end]);

    useEffect(() => {
        fetchAlerts();
    }, [fetchAlerts]);

    return {
        alertsData,
        loading,
        error,
        refetch: fetchAlerts
    };
}
