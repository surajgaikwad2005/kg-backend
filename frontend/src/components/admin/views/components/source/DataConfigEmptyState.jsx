'use client';
import React from 'react';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Plus, FileCode, FileText,
    History, Server, ClipboardList, Wrench,
    FileCheck, Activity, Flame, ShieldAlert,
    Cpu, Layers, CheckCircle2,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

const QUICK_SOURCES = [
    {
        type: 'P&ID',
        isDoc: false,
        label: 'P&ID Diagrams',
        desc: 'Piping & instrumentation drawings',
        icon: FileCode,
    },
    {
        type: 'equipment_datasheets',
        isDoc: true,
        label: 'Equipment Datasheets',
        desc: 'Technical specs & design limits',
        icon: FileText,
    },
    {
        type: 'Historian/Timeseries',
        isDoc: false,
        label: 'Historian / Telemetry',
        desc: 'Sensor streams & live tag values',
        icon: History,
    },
    {
        type: 'SAP',
        isDoc: false,
        label: 'SAP / ERP Systems',
        desc: 'Asset master data & hierarchies',
        icon: Server,
    },
    {
        type: 'sop',
        isDoc: true,
        label: 'Operating Procedures (SOP)',
        desc: 'Step-by-step operating guidelines',
        icon: ClipboardList,
    },
    {
        type: 'operating_manuals',
        isDoc: true,
        label: 'Operating Manuals',
        desc: 'Normal ranges & alarm setpoints',
        icon: FileText,
    },
    {
        type: 'maintenance_manuals',
        isDoc: true,
        label: 'Maintenance Manuals',
        desc: 'PM intervals, tasks & spare parts',
        icon: Wrench,
    },
    {
        type: 'inspection_reports',
        isDoc: true,
        label: 'Inspection Reports',
        desc: 'NDT (UT/RT) findings & wall thickness',
        icon: FileCheck,
    },
    {
        type: 'cause_effect_matrix',
        isDoc: true,
        label: 'Cause & Effect Matrix',
        desc: 'Safety interlocks & trip logic',
        icon: Activity,
    },
    {
        type: 'startup_shutdown',
        isDoc: true,
        label: 'Start-up & Shutdown',
        desc: 'Unit startup/shutdown sequences',
        icon: Flame,
    },
    {
        type: 'hazop',
        isDoc: true,
        label: 'HAZOP Studies',
        desc: 'Process nodes & risk matrices',
        icon: ShieldAlert,
    },
    {
        type: 'log_sheets',
        isDoc: true,
        label: 'Log Sheets / Reports',
        desc: 'Shift readings & handover logs',
        icon: ClipboardList,
    },
];

const SIMPLE_STEPS = [
    { num: '1', title: 'Upload Sources', desc: 'Add drawings, manuals, or DBs', icon: Plus },
    { num: '2', title: 'Process Data', desc: 'Automated entity & tag extraction', icon: Cpu },
    { num: '3', title: 'Review & Validate', desc: 'Verify extracted nodes & joins', icon: Layers },
    { num: '4', title: 'Commit to Graph', desc: 'Publish to plant Knowledge Graph', icon: CheckCircle2 },
];

export function DataConfigEmptyState({ onSelectSource, onSelectDocType, plantCode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6 w-full py-2"
        >
            {/* Simple Top Banner with Sidebar Guidance */}
            <div className="rounded-2xl border border-border bg-surface p-6 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-5">
                <div className="space-y-1.5 max-w-xl">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-brand/10 text-brand text-caption font-bold">
                        <ArrowLeft className="w-3.5 h-3.5 animate-pulse" />
                        <span>Select from Left Sidebar or Quick-Start Below</span>
                    </div>
                    <h2 className="text-heading-sm font-bold text-text-primary">
                        No Data Sources Configured Yet {plantCode ? `for ${plantCode}` : ''}
                    </h2>
                    <p className="text-body-sm text-text-muted">
                        Select any source from the left panel or click an item below to upload your engineering assets and begin data orchestration.
                    </p>
                </div>

                <div className="hidden md:flex items-center gap-2 p-2 rounded-xl bg-surface-2 border border-border text-caption font-bold text-text-subtle shrink-0">
                    <span>👈 Pick any source to start</span>
                </div>
            </div>

            {/* Quick-Start Grid */}
            <div className="rounded-2xl border border-border bg-surface p-5 space-y-3">
                <h3 className="text-label font-bold uppercase tracking-widest text-text-muted px-1">
                    Choose a Data Source to Upload
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {QUICK_SOURCES.map((item) => {
                        const Icon = item.icon;
                        const handleClick = () => {
                            if (item.isDoc) {
                                onSelectDocType?.(item.type);
                            } else {
                                onSelectSource?.(item.type);
                            }
                        };

                        return (
                            <button
                                key={item.type}
                                type="button"
                                onClick={handleClick}
                                className={cn(
                                    'group flex items-start gap-3 p-3 rounded-xl border border-border bg-surface-2/40 text-left cursor-pointer',
                                    'hover:border-brand/40 hover:bg-brand-muted/20 hover:shadow-xs transition-all duration-150',
                                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40',
                                )}
                            >
                                <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-text-secondary group-hover:text-brand group-hover:bg-brand/10 transition-colors shrink-0 mt-0.5">
                                    <Icon className="w-4 h-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-body-sm font-bold text-text-primary group-hover:text-brand transition-colors truncate">
                                        {item.label}
                                    </h4>
                                    <p className="text-caption text-text-subtle truncate mt-0.5">
                                        {item.desc}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Simple 4-Step Process Guide */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SIMPLE_STEPS.map((step) => {
                    const Icon = step.icon;
                    return (
                        <div
                            key={step.num}
                            className="p-3 rounded-xl border border-border bg-surface flex items-center gap-2.5"
                        >
                            <div className="w-7 h-7 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
                                <Icon className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-label font-bold text-text-primary truncate">
                                    {step.num}. {step.title}
                                </p>
                                <p className="text-tiny text-text-subtle truncate">
                                    {step.desc}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}
