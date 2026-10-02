'use client';
import React, { useState } from 'react';
import {
  Plus, Bot, CheckCircle2, Clock, Zap,
  LayoutGrid, Activity, X, ArrowRight, Cpu, Trash2, Loader2,
} from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';
import { useAgent } from '../_context/AgentContext';
import { useTheme } from '@/src/context/visuals/ThemeContext';

const STATUS_CONFIG = {
  draft:    { label: 'Draft',    icon: Clock,        light: { bg: '#fefce8', text: '#a16207', border: '#fde047' }, dark: { bg: 'rgba(234,179,8,0.12)', text: '#fbbf24', border: 'rgba(234,179,8,0.3)' } },
  deployed: { label: 'Deployed', icon: CheckCircle2, light: { bg: '#f0fdf4', text: '#15803d', border: '#86efac' }, dark: { bg: 'rgba(16,185,129,0.12)', text: '#34d399', border: 'rgba(16,185,129,0.3)' } },
};

const CARD_ACCENTS = [
  { from: '#6366f1', to: '#8b5cf6' },
  { from: '#0ea5e9', to: '#6366f1' },
  { from: '#10b981', to: '#0ea5e9' },
  { from: '#f59e0b', to: '#ef4444' },
  { from: '#8b5cf6', to: '#ec4899' },
];

function AgentCard({ agent, index, onOpen, onDelete, isDark }) {
  const cfg = STATUS_CONFIG[agent.status] || STATUS_CONFIG.draft;
  const StatusIcon = cfg.icon;
  const statusColors = isDark ? cfg.dark : cfg.light;
  const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(agent);
  };

  return (
    <div
      onClick={() => onOpen(agent)}
      className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl bg-surface border border-border shadow-card"
    >
      {/* Delete (hover) */}
      <button
        onClick={handleDelete}
        aria-label="Delete agent"
        className="absolute top-2.5 right-2.5 z-20 w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer bg-surface/80 text-text-subtle hover:bg-danger/10 hover:text-danger"
      >
        <Trash2 size={13} />
      </button>

      <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${accent.from}, ${accent.to})` }} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${accent.from}20, ${accent.to}20)`, border: `1px solid ${accent.from}30` }}
            style={{ '--c': accent.from }}
          >
            <Bot size={20} className="[color:var(--c)]" />
          </div>
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: statusColors.bg, color: statusColors.text, border: `1px solid ${statusColors.border}` }}
          >
            <StatusIcon size={11} />
            {cfg.label}
          </div>
        </div>

        <h3 className="text-base font-bold mb-1 leading-tight text-text-primary">{agent.name}</h3>
        <p className="text-xs leading-relaxed line-clamp-2 mb-4 text-text-muted">{agent.description}</p>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <MetricChip icon={Cpu}      label="Nodes" value={agent.nodes?.length ?? 0} color={accent.from} />
          <MetricChip icon={Activity} label="Edges" value={agent.edges?.length ?? 0} color={accent.to} />
        </div>

        <div className="flex justify-between text-[11px] mb-4 text-text-subtle">
          <span>Created {agent.createdAt}</span>
          <span>Updated {agent.updatedAt}</span>
        </div>

        <button
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 group-hover:shadow-lg cursor-pointer"
          style={{ background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`, boxShadow: `0 4px 12px ${accent.from}30` }}
        >
          Open in Canvas
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}

function MetricChip({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-canvas border border-border">
      <Icon size={13} style={{ '--c': color }} className="[color:var(--c)]" />
      <div>
        <p className="text-[10px] leading-none text-text-subtle">{label}</p>
        <p className="text-sm font-bold leading-tight text-text-secondary">{value}</p>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-2xl p-4 flex items-center gap-4 bg-surface border border-border shadow-card">
      <div style={{ '--c': color }} className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 [background:color-mix(in_srgb,var(--c)_15%,transparent)] [border:1px_solid_color-mix(in_srgb,var(--c)_25%,transparent)]">
        <Icon size={18} className="[color:var(--c)]" />
      </div>
      <div>
        <p className="text-xs font-medium text-text-muted">{label}</p>
        <p className="text-2xl font-black leading-none mt-0.5 text-text-primary">{value}</p>
      </div>
    </div>
  );
}

function CreateAgentModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim(), desc.trim() || `${name} — an intelligent AI agent.`);
  };

  const inputCls = 'bg-canvas border-border text-text-secondary placeholder:text-text-subtle focus:ring-brand/30 focus:border-brand';

  return (
    <Modal open onClose={onClose} size="md" className="overflow-hidden border border-border">
        {/* Modal header */}
        <div className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-brand to-highlight">
                <Zap size={18} className="text-white" />
              </div>
              <div>
                <h3 id="create-agent-modal-title" className="text-base font-bold text-text-primary">Create New Agent</h3>
                <p className="text-xs text-text-muted">Configure and deploy your AI agent</p>
              </div>
            </div>
            <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-surface-2 text-text-subtle">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label htmlFor="agent-name" className="text-xs font-semibold uppercase tracking-wider text-text-muted">Agent Name *</label>
            <input
              id="agent-name"
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Anomaly Detection Agent"
              className={`mt-1.5 w-full px-3 py-2.5 rounded-xl text-sm outline-none border transition-all focus:ring-2 ${inputCls}`}
            />
          </div>
          <div>
            <label htmlFor="agent-desc" className="text-xs font-semibold uppercase tracking-wider text-text-muted">Description</label>
            <textarea
              id="agent-desc"
              rows={3}
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Describe what this agent does..."
              className={`mt-1.5 w-full px-3 py-2.5 rounded-xl text-sm outline-none border transition-all focus:ring-2 resize-none ${inputCls}`}
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer text-text-secondary border border-border hover:bg-canvas"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              aria-busy={false}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50 cursor-pointer bg-gradient-to-br from-brand to-highlight shadow-[0_4px_16px_rgba(99,102,241,0.35)]"
            >
              Create & Open Canvas
            </button>
          </div>
        </form>
    </Modal>
  );
}

export function AgentDashboard() {
  const { agents, openAgent, createAgent, deleteAgent, loading, error } = useAgent();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [showCreate, setShowCreate] = useState(false);

  const handleCreate = (name, description) => {
    createAgent(name, description);
    setShowCreate(false);
  };

  const stats = [
    { label: 'Total Agents', value: agents.length,                                           icon: Bot,          color: '#6366f1' },
    { label: 'Deployed',     value: agents.filter(a => a.status === 'deployed').length,      icon: CheckCircle2, color: '#10b981' },
    { label: 'In Draft',     value: agents.filter(a => a.status === 'draft').length,         icon: Clock,        color: '#f59e0b' },
    { label: 'Total Nodes',  value: agents.reduce((s, a) => s + (a.nodes?.length ?? 0), 0), icon: LayoutGrid,   color: '#8b5cf6' },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-canvas">
      <div className="flex-1 overflow-y-auto px-6 py-6">

        {/* Section header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Agent Factory</h2>
            <p className="text-sm mt-0.5 text-text-muted">
              Build, configure, and deploy intelligent AI agents with visual node pipelines
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95 cursor-pointer bg-gradient-to-br from-brand to-highlight shadow-[0_6px_20px_rgba(99,102,241,0.4)]"
          >
            <Plus size={16} />
            Create New Agent
          </button>
        </div>

        {/* Loading / error notice */}
        {loading && (
          <div className="flex items-center gap-2 mb-4 text-sm text-text-muted">
            <Loader2 size={14} className="animate-spin" /> Loading agents…
          </div>
        )}
        {error && !loading && (
          <div className="mb-4 px-4 py-2.5 rounded-xl text-xs bg-warning/10 text-warning border border-warning/20">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => <StatCard key={s.label} {...s} />)}
        </div>

        {/* Agent cards */}
        {agents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-brand-muted/20 border border-brand/20">
              <Bot size={28} className="text-brand" />
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-text-secondary">No agents yet</p>
              <p className="text-sm mt-1 text-text-muted">Click "Create New Agent" to build your first AI agent</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {agents.map((agent, i) => (
              <AgentCard key={agent.id} agent={agent} index={i} onOpen={openAgent} onDelete={(a) => deleteAgent(a.id)} isDark={isDark} />
            ))}

            {/* Add agent card */}
            <button
              onClick={() => setShowCreate(true)}
              className="group h-full min-h-70 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-200 cursor-pointer border-2 border-dashed border-border hover:border-brand hover:bg-brand-muted/10"
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors bg-surface-2 group-hover:bg-brand/10">
                <Plus size={22} className="text-text-subtle group-hover:text-brand transition-colors" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold transition-colors text-text-muted group-hover:text-brand">New Agent</p>
                <p className="text-xs mt-0.5 text-text-subtle">Click to create</p>
              </div>
            </button>
          </div>
        )}
      </div>

      {showCreate && <CreateAgentModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
    </div>
  );
}
