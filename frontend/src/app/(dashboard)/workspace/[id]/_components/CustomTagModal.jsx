'use client';
import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Loader2, Check, Tag, Braces, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';
import { listAvailableTags, createCustomTag } from '@/src/services/workspace/workspaceService';
import { useApp } from '@/src/context/AppContext';

const ANALYSIS_TYPES = [
    { value: 'timeseries',      label: 'Time Series',       desc: 'Track signal values over time' },
    { value: 'correlation',     label: 'Correlation',        desc: 'Relationship between signals' },
    { value: 'event_detection', label: 'Event Detection',    desc: 'Detect anomalies and breaches' },
    { value: 'rca',             label: 'Root Cause Analysis',desc: 'Investigate causality chains' },
    { value: 'kpi_monitoring',  label: 'KPI Monitoring',     desc: 'Process health & stability' },
];

const DEFAULT_FORM = {
    tag_name: '',
    analysis_type: 'timeseries',
    formula_operations: '',
    start_time: '',
    end_time: '',
};

function getUsername() {
    if (typeof window === 'undefined') return 'user';
    return (localStorage.getItem('username') || '').split('@')[0].split('.')[0] || 'user';
}
function getWorkspaceName() {
    if (typeof window === 'undefined') return 'workspace';
    const parts = window.location.pathname.split('/');
    return parts[parts.length - 1] || 'workspace';
}

/**
 * CustomTagModal
 *
 * isOpen controls the backdrop/card enter/exit animation.
 * The modal self-manages form state and its own API calls.
 */
export function CustomTagModal({ isOpen, onClose, onSuccess }) {
    const { plantCode } = useApp();
    const [form, setForm] = useState(DEFAULT_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState(null); // null | 'success' | { error: string }
    const [availableTags, setAvailableTags] = useState([]);
    const [loadingTags, setLoadingTags] = useState(false);
    const [tagFilter, setTagFilter] = useState('');
    const firstInputRef = useRef(null);

    // Seed time range from global timeRange when opening
    useEffect(() => {
        if (!isOpen) return;
        setStatus(null);
        setTagFilter('');

        try {
            const saved = localStorage.getItem('timeRange');
            if (saved) {
                const { start, end } = JSON.parse(saved);
                const pad = n => n.toString().padStart(2, '0');
                const fmt = d => { const dt = new Date(d); return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}:${pad(dt.getSeconds())}`; };
                setForm(prev => ({ ...prev, start_time: fmt(start), end_time: fmt(end) }));
            }
        } catch {}

        // Focus first input after animation settles
        setTimeout(() => firstInputRef.current?.focus(), 180);

        // Fetch available tags to reference in formulas
        if (availableTags.length > 0 || !plantCode) return;
        setLoadingTags(true);
        listAvailableTags(plantCode, getUsername(), getWorkspaceName())
            .then(d => setAvailableTags(Array.isArray(d.data) ? d.data : (Array.isArray(d) ? d : [])))
            .catch(() => {})
            .finally(() => setLoadingTags(false));
    }, [isOpen, plantCode]);

    const patch = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

    const insertTag = (tag) => {
        setForm(prev => ({
            ...prev,
            formula_operations: prev.formula_operations
                ? `${prev.formula_operations} ${tag}`
                : tag
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.tag_name.trim()) return;
        setSubmitting(true);
        setStatus(null);
        try {
            await createCustomTag(plantCode, {
                ...form,
                username: getUsername(),
                workspace_name: getWorkspaceName(),
                dynamic_thresholds: {},
            });
            setStatus('success');
            setForm(DEFAULT_FORM);
            onSuccess?.();
            setTimeout(onClose, 1400);
        } catch (err) {
            setStatus({ error: err?.data?.details || err?.data?.error || 'Failed to create custom tag.' });
        } finally {
            setSubmitting(false);
        }
    };

    const filteredTags = availableTags.filter(t =>
        t.toLowerCase().includes(tagFilter.toLowerCase())
    );

    return (
        <Modal open={isOpen} onClose={onClose} size="2xl" className="border border-border/40 overflow-hidden">
                {/* Header */}
                <div className="bg-overlay px-7 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-surface/10 rounded-xl flex items-center justify-center border border-white/10">
                            <Tag className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <span id="custom-tag-modal-title" className="font-black text-[15px] text-white tracking-tight block">Create Custom Tag</span>
                            <span className="text-[11px] text-text-subtle font-medium">Derive new signals from existing tags using formulas</span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="p-2 text-text-subtle hover:text-white hover:bg-surface/10 rounded-xl transition-all cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Success state */}
                {status === 'success' ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-4">
                        <div className="w-16 h-16 bg-success/10 rounded-3xl flex items-center justify-center border border-success/20">
                            <CheckCircle2 className="w-8 h-8 text-success" />
                        </div>
                        <div className="text-center">
                            <div className="text-[16px] font-black text-text-primary">Tag Created!</div>
                            <div className="text-[13px] text-text-subtle font-medium mt-1">Your custom tag is ready to use.</div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="flex min-h-0 max-h-[75vh]">

                            {/* Left — form fields */}
                            <div className="flex-1 overflow-y-auto p-7 space-y-5">

                                {/* Tag Name */}
                                <div>
                                    <label className="text-[10px] font-black text-text-subtle uppercase tracking-widest block mb-2">Tag Name *</label>
                                    <input
                                        ref={firstInputRef}
                                        type="text"
                                        value={form.tag_name}
                                        onChange={e => patch('tag_name', e.target.value)}
                                        required
                                        placeholder="e.g. derived_pressure_ratio"
                                        className="w-full bg-canvas border-2 border-border rounded-2xl px-4 py-3 text-[13px] font-bold text-text-secondary outline-none focus:border-overlay focus:bg-surface transition-all"
                                    />
                                </div>

                                {/* Formula */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-[10px] font-black text-text-subtle uppercase tracking-widest flex items-center gap-1.5">
                                            <Braces className="w-3 h-3" />
                                            Formula / Operations
                                        </label>
                                        <span className="text-[10px] text-text-subtle font-medium">Click a tag on the right to insert</span>
                                    </div>
                                    <textarea
                                        value={form.formula_operations}
                                        onChange={e => patch('formula_operations', e.target.value)}
                                        placeholder="e.g. TAG_A / TAG_B * 100&#10;or: TAG_A + TAG_B - 50"
                                        rows={4}
                                        className="w-full bg-canvas border-2 border-border rounded-2xl px-4 py-3 text-[13px] font-mono font-medium text-text-secondary outline-none focus:border-overlay focus:bg-surface transition-all resize-none"
                                    />
                                </div>

                                {/* Analysis Type */}
                                <div>
                                    <label className="text-[10px] font-black text-text-subtle uppercase tracking-widest block mb-2">Analysis Type</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {ANALYSIS_TYPES.map(({ value, label, desc }) => (
                                            <label
                                                key={value}
                                                className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${form.analysis_type === value ? 'border-overlay bg-canvas' : 'border-border/40 bg-surface hover:border-border'}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="analysis_type"
                                                    value={value}
                                                    checked={form.analysis_type === value}
                                                    onChange={() => patch('analysis_type', value)}
                                                    className="sr-only"
                                                />
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${form.analysis_type === value ? 'border-overlay bg-overlay' : 'border-border-strong'}`}>
                                                    {form.analysis_type === value && <div className="w-1.5 h-1.5 rounded-full bg-surface" />}
                                                </div>
                                                <div>
                                                    <div className="text-[12px] font-black text-text-secondary">{label}</div>
                                                    <div className="text-[10px] text-text-subtle font-medium">{desc}</div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Time Window */}
                                <div>
                                    <label className="text-[10px] font-black text-text-subtle uppercase tracking-widest flex items-center gap-1 mb-2">
                                        <Clock className="w-3 h-3" /> Time Window
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="datetime-local"
                                            value={form.start_time}
                                            onChange={e => patch('start_time', e.target.value)}
                                            className="w-full bg-canvas border-2 border-border rounded-xl px-3 py-2 text-[11px] font-bold text-text-secondary outline-none focus:border-overlay cursor-pointer"
                                        />
                                        <input
                                            type="datetime-local"
                                            value={form.end_time}
                                            onChange={e => patch('end_time', e.target.value)}
                                            className="w-full bg-canvas border-2 border-border rounded-xl px-3 py-2 text-[11px] font-bold text-text-secondary outline-none focus:border-overlay cursor-pointer"
                                        />
                                    </div>
                                </div>

                                {/* Error state */}
                                {status?.error && (
                                    <div className="flex items-start gap-3 p-4 bg-danger/10 border border-danger/20 rounded-2xl">
                                        <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                                        <span className="text-[12px] font-bold text-danger">{status.error}</span>
                                    </div>
                                )}
                            </div>

                            {/* Right — available tags panel */}
                            <div className="w-56 border-l border-border/40 bg-canvas/50 flex flex-col shrink-0 overflow-hidden">
                                <div className="px-4 pt-5 pb-3 border-b border-border/40">
                                    <div className="text-[10px] font-black text-text-subtle uppercase tracking-widest mb-2">Available Tags</div>
                                    <input
                                        type="text"
                                        placeholder="Search…"
                                        value={tagFilter}
                                        onChange={e => setTagFilter(e.target.value)}
                                        className="w-full bg-surface border border-border rounded-xl px-3 py-1.5 text-[11px] font-medium outline-none focus:border-border-strong"
                                    />
                                </div>
                                <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
                                    {loadingTags ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="w-5 h-5 text-border-strong animate-spin" />
                                        </div>
                                    ) : filteredTags.length > 0 ? (
                                        filteredTags.map(tag => (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => insertTag(tag)}
                                                title={`Insert "${tag}" into formula`}
                                                className="w-full text-left px-3 py-2 rounded-xl text-[11px] font-bold text-text-secondary hover:bg-surface hover:text-text-primary hover:shadow-sm border border-transparent hover:border-border transition-all cursor-pointer truncate"
                                            >
                                                {tag}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="text-[11px] text-text-subtle text-center py-8 font-medium">
                                            {tagFilter ? 'No matches' : 'No tags found'}
                                        </div>
                                    )}
                                </div>
                                <div className="px-3 py-3 border-t border-border/40 text-[10px] text-text-subtle font-medium leading-snug">
                                    Click any tag to insert it into your formula.
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-7 py-4 bg-canvas border-t border-border/40 flex items-center justify-between gap-3">
                            <span className="text-[11px] text-text-subtle font-medium">
                                Tag will be available across all workspace nodes.
                            </span>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-5 py-2.5 border-2 border-border hover:bg-surface-2 text-text-secondary rounded-2xl text-[13px] font-bold transition-all cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || !form.tag_name.trim()}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-overlay hover:bg-overlay-hover disabled:bg-surface-2 disabled:text-text-subtle text-white rounded-2xl text-[13px] font-black transition-all cursor-pointer shadow-lg shadow-black/20 active:scale-95"
                                >
                                    {submitting
                                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</>
                                        : <><Plus className="w-4 h-4" /> Create Tag</>
                                    }
                                </button>
                            </div>
                        </div>
                    </form>
                )}
        </Modal>
    );
}
