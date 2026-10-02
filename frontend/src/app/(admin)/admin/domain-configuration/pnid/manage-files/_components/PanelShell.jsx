'use client';

/**
 * PanelShell — pipeline panel chrome: status-tinted border + header (icon, title,
 * subtitle, status badge). Wraps OCR / Extract / Compare panel bodies.
 */
import React from 'react';
import { StatusBadge, panelBorder, panelHeader, panelIcon } from '@/src/app/(admin)/admin/domain-configuration/pnid/manage-files/_components/PipelineIndicators';

export default function PanelShell({ status, icon: Icon, title, subtitle, badge = true, children }) {
    return (
        <div className={`bg-surface rounded-[28px] border shadow-card overflow-hidden ${panelBorder(status)}`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${panelHeader(status)}`}>
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${panelIcon(status)}`}>
                        <Icon size={15} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-text-primary uppercase tracking-tight">{title}</h3>
                        {subtitle && <p className="text-2xs font-mono text-text-subtle mt-0.5">{subtitle}</p>}
                    </div>
                </div>
                {badge && status && <StatusBadge status={status} />}
            </div>
            {children}
        </div>
    );
}

/** Small labeled result card used inside panel bodies. */
export function ResultCard({ label, children, className = '', tone = 'default' }) {
    const toneCls = {
        default: 'border-border',
        emerald: 'border-success/30',
        amber: 'border-warning/30',
        rose: 'border-danger/30',
        blue: 'border-brand/30',
    }[tone];
    return (
        <div className={`bg-surface rounded-xl border p-3 ${toneCls} ${className}`}>
            <p className="font-black text-text-subtle uppercase tracking-wider text-2xs mb-1">{label}</p>
            {children}
        </div>
    );
}
