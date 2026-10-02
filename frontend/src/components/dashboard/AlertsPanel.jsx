'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, RefreshCw, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useAlertsData } from '@/src/hooks/dashboard/useAlertsData';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';

/**
 * Grabs the appropriate visual status icon representing a alert severity.
 */
const getAlertIcon = (status = 'info') => {
    switch (status.toLowerCase()) {
        case 'critical':
            return AlertCircle;
        case 'warning':
            return AlertTriangle;
        default:
            return Info;
    }
};

/**
 * @param {{ onCountChange?: (count: number) => void }} props
 *   `onCountChange` lets a host panel (e.g. the home dashboard header badge)
 *   show the live alert count without triggering its own duplicate fetch.
 */
export default function AlertsPanel({ onCountChange }) {
    const router = useRouter();
    const { alertsData, loading, error, refetch } = useAlertsData();

    useEffect(() => {
        onCountChange?.(error ? 0 : alertsData.length);
    }, [alertsData.length, error, onCountChange]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-text-subtle">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-[16px] font-medium">Synchronizing with industrial stream...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center border border-danger/20">
                    <AlertCircle className="w-8 h-8 text-danger" />
                </div>
                <div>
                    <h3 className="text-text-primary font-bold mb-1">Live Feed Unavailable</h3>
                    <p className="text-text-muted text-[11px] leading-relaxed max-w-[200px] mx-auto">{error}</p>
                </div>
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={refetch}
                    className="gap-2 shadow-lg cursor-pointer"
                >
                    <RefreshCw className="w-3 h-3" /> Re-Sync
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col bg-surface">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 h-full scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent hover:scrollbar-thumb-text-subtle transition-colors">
                {alertsData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12 text-text-subtle">
                        <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center mb-4 border border-border">
                            <Info className="w-6 h-6 opacity-30" />
                        </div>
                        <p className="text-[14px] font-bold uppercase tracking-wider">No Incidents Detected</p>
                        <p className="text-[10px] mt-1">14-day history is clean</p>
                    </div>
                ) : (
                    alertsData.map((alert, idx) => {
                        const status = alert.data?.status || 'info';
                        const Icon = getAlertIcon(status);
                        const dateObj = new Date(alert.timestamp);
                        const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });

                        return (
                            <Card
                                key={idx}
                                variant="interactive"
                                status={status}
                                className="p-4"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <Badge
                                        variant={status}
                                        dot={true}
                                        pulse={true}
                                        className="p-0 border-none bg-transparent hover:bg-transparent"
                                    >
                                        {status}
                                    </Badge>
                                    <div className="flex flex-col items-end gap-0.5">
                                        <span className="text-text-primary text-[10px] font-black font-mono">
                                            {timeStr}
                                        </span>
                                        <span className="text-text-subtle text-[9px] font-bold uppercase tracking-wider">
                                            {dateStr}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-text-primary font-extrabold text-[16px] mb-1.5 tracking-tight group-hover:text-brand transition-colors">
                                    {alert.data?.parameter || 'System Parameter'}
                                </h3>

                                <p className="text-text-secondary text-[11px] leading-relaxed mb-4 font-medium opacity-80">
                                    Variance detected on <b>{alert.data?.parameter}</b>.
                                    {alert.data?.duration_sec > 0 ? ` For Duration ${Math.round(alert.data.duration_sec)}s.` : ' Monitoring active.'}
                                </p>

                                {status === 'critical' ? (
                                    <Button
                                        variant="dangerOutline"
                                        size="raw"
                                        onClick={() => router.push('/compressor-details/comp_2')}
                                        className="w-full py-2.5 text-[10px] cursor-pointer"
                                    >
                                        observe
                                    </Button>
                                ) : (
                                    <div className="flex items-center gap-2 text-text-subtle text-[10px] font-bold uppercase tracking-widest">
                                        <div className="w-1 h-1 rounded-full bg-border" />
                                        Logged in history
                                    </div>
                                )}
                            </Card>
                        );
                    })
                )}
            </div>

            <div className="p-4 border-t border-border bg-surface-2/50">
                <Button
                    variant="outline"
                    size="raw"
                    onClick={refetch}
                    className="group flex justify-center gap-3 w-full py-3 cursor-pointer"
                >
                    <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
                    SYSTEM RE-SYNC
                </Button>
            </div>
        </div>
    );
}
