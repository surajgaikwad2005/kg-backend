"use client";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Activity, AlertTriangle, ArrowRight, ArrowUpRight, ClipboardList, Clock } from "lucide-react";
import { PageHeader } from "@/src/components/layout/PageHeader";
import { MetricCard } from "./_components/MetricCard";
import { HistoricalInvestigationTable } from "./_components/HistoricalInvestigationTable";

/**
 * TODO(backend): every value below is placeholder content — there is no
 * "list investigations" / notification-count / work-order-count API wired
 * up yet (tracked as a known gap, not silently dropped). Replace with real
 * service calls once the backend contract for this page is confirmed.
 */
const HISTORICAL_REPORTS = [
    { id: "REP-9821", asset: "BNCP.COMP.37", owner: "Senior Analyst", date: "2026-03-20", priority: "P1", status: "VERIFIED" },
    { id: "REP-9754", asset: "BNCP.PUMP.12", owner: "Operation Lead", date: "2026-03-18", priority: "P2", status: "CLOSED" },
    { id: "REP-9632", asset: "BNCP.TURB.05", owner: "Technical Lead", date: "2026-03-15", priority: "P1", status: "CLOSED" },
    { id: "REP-9521", asset: "BNCP.GEN.02", owner: "Field Eng.", date: "2026-03-10", priority: "P3", status: "ARCHIVED" },
    { id: "REP-9411", asset: "BNCP.VALV.10", owner: "Maintenance Mgr.", date: "2026-03-05", priority: "P4", status: "CLOSED" },
];
const METRICS = {
    notification: { total: 1284, overdue: 156, trend: "+12%" },
    workorder: { total: 4512, overdue: 18, trend: "+5.4%" },
};

export default function WorkflowManagementPage() {
    const router = useRouter();

    const goToNotifications = useCallback(() => router.push("/extra/notifications"), [router]);
    const goToWorkOrders = useCallback(() => router.push("/extra/work-orders"), [router]);

    return (
        <>
            <PageHeader showDateRange />

            <div className="flex-1 p-4 sm:p-8 overflow-y-auto min-h-0 thin-scrollbar space-y-6 sm:space-y-8">
                {/* Top Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    <MetricCard
                        icon={Activity}
                        iconWrapperClassName="bg-overlay"
                        accentClassName="bg-brand/5"
                        eyebrow="Live Feed"
                        statusDotClassName="bg-success"
                        statusLabel="Active"
                        statusColorClassName="text-success"
                        title="Notifications"
                        value={METRICS.notification.total}
                        badgeIcon={AlertTriangle}
                        badgeLabel={`${METRICS.notification.overdue} Overdue`}
                        badgeColorClassName="text-danger"
                        trendLabel={`${METRICS.notification.trend} this week`}
                        actionIcon={ArrowRight}
                        actionColorClassName="bg-brand-muted text-brand group-hover:bg-brand group-hover:text-white"
                        onClick={goToNotifications}
                    />

                    <MetricCard
                        icon={ClipboardList}
                        iconWrapperClassName="bg-brand"
                        accentClassName="bg-warning/5"
                        eyebrow="Resource Load"
                        statusDotClassName="bg-brand"
                        statusLabel="Monitoring"
                        statusColorClassName="text-brand"
                        title="Work Orders"
                        value={METRICS.workorder.total}
                        badgeIcon={Clock}
                        badgeLabel={`${METRICS.workorder.overdue} Pending`}
                        badgeColorClassName="text-warning"
                        trendLabel={`${METRICS.workorder.trend} Ingestion`}
                        actionIcon={ArrowUpRight}
                        actionColorClassName="bg-warning/10 text-warning group-hover:bg-warning group-hover:text-white"
                        onClick={goToWorkOrders}
                    />
                </div>

                <HistoricalInvestigationTable reports={HISTORICAL_REPORTS} />
            </div>
        </>
    );
}
