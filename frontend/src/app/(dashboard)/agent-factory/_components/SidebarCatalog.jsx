'use client';
import React, { useState } from 'react';
import {
  X, BrainCircuit, Wrench, FileText, Clock, Layers,
  Settings, Radio, Database, Plus, Activity, Network,
  BarChart2, Bell, Waves, GitBranch,
} from 'lucide-react';
import { useAgent } from '../_context/AgentContext';
import { useTheme } from '@/src/context/visuals/ThemeContext';

const TABS = [
  { id: 'models',        icon: BrainCircuit, label: 'Models',       color: '#818cf8', tabHoverDark: 'dark:hover:bg-[#818cf8]/10' },
  { id: 'tools',         icon: Wrench,        label: 'Tools',        color: '#34d399', tabHoverDark: 'dark:hover:bg-[#34d399]/10' },
  { id: 'system-prompt', icon: FileText,      label: 'Sys Prompt',   color: '#fbbf24', shortLabel: 'SYS', tabHoverDark: 'dark:hover:bg-[#fbbf24]/10' },
  { id: 'scheduler',     icon: Clock,         label: 'Scheduler',    color: '#f87171', tabHoverDark: 'dark:hover:bg-[#f87171]/10' },
  { id: 'templates',     icon: Layers,        label: 'Templates',    color: '#a78bfa', shortLabel: 'T', tabHoverDark: 'dark:hover:bg-[#a78bfa]/10' },
  { id: 'settings',      icon: Settings,      label: 'Settings',     color: '#94a3b8', shortLabel: 'S', tabHoverDark: 'dark:hover:bg-[#94a3b8]/10' },
  { id: 'output',        icon: Radio,         label: 'Output',       color: '#fb923c', shortLabel: 'O', tabHoverDark: 'dark:hover:bg-[#fb923c]/10' },
  { id: 'memory',        icon: Database,      label: 'Memory',       color: '#38bdf8', shortLabel: 'M', tabHoverDark: 'dark:hover:bg-[#38bdf8]/10' },
];

const MODELS = [
  { id: 'claude_3_5_sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', providerColor: '#f59e0b', description: "Anthropic's most intelligent model. Exceptional reasoning, coding, and analysis with a massive context window.", contextWindow: '200K tokens', capabilities: ['Advanced reasoning', 'Code generation', 'Data analysis', 'Long context'] },
  { id: 'claude_3_opus',     name: 'Claude 3 Opus',     provider: 'Anthropic', providerColor: '#f59e0b', description: 'Near-human performance on complex analysis, research synthesis, and creative writing tasks.',            contextWindow: '200K tokens', capabilities: ['Complex analysis', 'Research synthesis', 'Creative writing', 'Expert reasoning'] },
  { id: 'claude_3_haiku',    name: 'Claude 3 Haiku',    provider: 'Anthropic', providerColor: '#f59e0b', description: 'Fastest and most compact Anthropic model. Ideal for high-throughput, near-instant pipeline steps.',     contextWindow: '200K tokens', capabilities: ['Fast inference', 'Low latency', 'High throughput', 'Lightweight tasks'] },
  { id: 'gpt-4o',            name: 'GPT-4o',            provider: 'OpenAI',    providerColor: '#10b981', description: "OpenAI's omni model. Accepts text, audio and image inputs with text and audio outputs.",               contextWindow: '128K tokens', capabilities: ['Multimodal inputs', 'Function calling', 'JSON mode', 'Vision'] },
  { id: 'gpt-4-turbo',      name: 'GPT-4 Turbo',      provider: 'OpenAI',    providerColor: '#10b981', description: 'High-capability model with a 128K context window, knowledge updated to April 2024.',                   contextWindow: '128K tokens', capabilities: ['Large context', 'JSON mode', 'Function calling', 'Vision support'] },
];

const TOOL_NODES = [
  { icon: Activity,  label: 'stats_tool_runtime',         desc: 'Calculate statistical summaries or retrieve values for specific telemetry points.' },
  { icon: Network,   label: 'relationship_analysis_tool', desc: 'Analyze correlations and relationships between multiple telemetry signals.' },
  { icon: BarChart2, label: 'plot_tool_runtime',          desc: 'Generate plotting data arrays for visualization.' },
  { icon: Bell,      label: 'event_analysis_tool',        desc: 'Detect deviations or incidents outside bounds.' },
  { icon: Waves,     label: 'frequency_analysis_tool',    desc: 'FFT-based frequency and pattern analysis.' },
  { icon: GitBranch, label: 'event_based_rca_tool',       desc: 'Identify signals co-deviating with a target.' },
];

function ModelsPanel({ addNode, models }) {
  const [selectedModel, setSelectedModel] = useState(null);
  const [hoveredModel, setHoveredModel] = useState(null);
  const preview = hoveredModel || selectedModel;

  const handleAddToCanvas = (model) => {
    addNode({ id: `llm_${Date.now()}`, type: 'llm', position: { x: 280 + Math.random() * 120, y: 160 + Math.random() * 120 }, data: { label: 'LLM MODEL CONFIGURATION', model_registry: model.id, top_p: 0, max_tokens: 2048, precision: 'ARITHMETIC' } });
    setSelectedModel(model);
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Model list */}
      <div className="w-[130px] border-r border-border dark:border-white/[0.06] overflow-y-auto p-[8px_6px] flex flex-col gap-[3px] shrink-0">
        {models.map(m => {
          const isSelected = selectedModel?.id === m.id;
          return (
            <button
              key={m.id}
              draggable
              onDragStart={e => { e.dataTransfer.setData('application/reactflow', 'llm'); e.dataTransfer.setData('application/reactflow-model', m.id); e.dataTransfer.effectAllowed = 'move'; }}
              onClick={() => setSelectedModel(m)}
              onMouseEnter={() => setHoveredModel(m)}
              onMouseLeave={() => setHoveredModel(null)}
              className={`flex flex-col gap-1 p-2 rounded-lg text-left cursor-grab transition-colors border ${isSelected ? '' : 'border-transparent hover:bg-surface-2'}`}
              style={{
                background: isSelected ? `${m.providerColor}14` : undefined,
                borderColor: isSelected ? `${m.providerColor}35` : undefined,
              }}>
              <span className="text-[11px] font-semibold text-text-primary leading-[1.3]">{m.name}</span>
              <span
                style={{ '--c': m.providerColor }}
                className="text-[9px] font-bold tracking-[0.05em] py-[1px] px-1.5 rounded-full self-start [background:color-mix(in_srgb,var(--c)_12%,transparent)] [color:var(--c)] [border:1px_solid_color-mix(in_srgb,var(--c)_30%,transparent)]"
              >{m.provider}</span>
            </button>
          )
        })}
      </div>

      {/* Preview pane */}
      <div className="flex-1 flex flex-col p-[12px_10px] overflow-y-auto">
        {preview ? (
          <>
            <div className="mb-2.5">
              <p className="m-0 mb-1 text-xs font-bold text-text-primary leading-[1.3]">{preview.name}</p>
              <span
                style={{ '--c': preview.providerColor }}
                className="text-[9px] font-bold py-0.5 px-1.5 rounded-full [background:color-mix(in_srgb,var(--c)_12%,transparent)] [color:var(--c)] [border:1px_solid_color-mix(in_srgb,var(--c)_30%,transparent)]"
              >{preview.provider}</span>
            </div>
            <p className="m-0 mb-3 text-[10px] text-text-muted leading-[1.65]">{preview.description}</p>
            <div className="mb-2.5">
              <p className="m-0 mb-[3px] text-[9px] uppercase tracking-[0.08em] text-text-subtle font-bold">Context</p>
              <p className="m-0 text-[11px] text-text-secondary font-semibold">{preview.contextWindow}</p>
            </div>
            <div className="mb-3.5">
              <p className="m-0 mb-1.5 text-[9px] uppercase tracking-[0.08em] text-text-subtle font-bold">Capabilities</p>
              <div className="flex flex-col gap-1.5">
                {preview.capabilities.map(cap => (
                  <div key={cap} className="flex items-center gap-1.5">
                    <div className="w-[3.5px] h-[3.5px] rounded-full bg-brand shrink-0" />
                    <span className="text-[10px] text-text-secondary">{cap}</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => handleAddToCanvas(preview)}
              className="mt-auto flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-gradient-to-br from-brand to-highlight text-white text-[10px] font-bold border-none cursor-pointer shadow-[0_4px_14px_rgba(99,102,241,0.35)] transition-all hover:opacity-90 hover:-translate-y-[1px]"
            >
              <Plus size={11} />Add to Canvas
            </button>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 p-2">
            <BrainCircuit size={22} className="text-text-subtle" />
            <p className="m-0 text-[10px] text-text-subtle leading-[1.6]">Hover a model to preview, or drag it to the canvas</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ToolCard({ node }) {
  const Icon = node.icon || Wrench;
  const onDragStart = (e) => { e.dataTransfer.setData('application/reactflow', 'tool'); e.dataTransfer.setData('application/reactflow-label', node.label); e.dataTransfer.effectAllowed = 'move'; };
  return (
    <div
      draggable onDragStart={onDragStart}
      className="group flex items-start gap-2 p-[8px_9px] rounded-[9px] cursor-grab select-none transition-all bg-canvas border-y border-r border-border border-l-[3px] border-l-border hover:bg-success/10 hover:border-success/20 hover:border-l-success"
    >
      <div className="w-[26px] h-[26px] rounded-md shrink-0 flex items-center justify-center mt-px transition-colors bg-surface-2 group-hover:bg-success/20">
        <Icon size={13} className="text-text-subtle group-hover:text-success transition-colors" />
      </div>
      <div className="min-w-0">
        <p className="m-0 text-[10px] font-semibold overflow-hidden text-ellipsis whitespace-nowrap transition-colors text-text-secondary group-hover:text-success">{node.label}</p>
        <p className="m-0 mt-[3px] text-[9px] leading-[1.4] line-clamp-2 text-text-subtle">{node.desc}</p>
      </div>
    </div>
  );
}

function ComingSoonPanel({ tab }) {
  const Icon = tab.icon;
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-3.5 p-6">
      <div
        style={{ '--c': tab.color }}
        className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center [background:color-mix(in_srgb,var(--c)_12%,transparent)] [border:1px_solid_color-mix(in_srgb,var(--c)_25%,transparent)]"
      >
        <Icon size={22} color={tab.color} />
      </div>
      <div>
        <p className="m-0 text-xs font-bold text-text-secondary">{tab.label}</p>
        <p className="m-0 mt-2 text-[10px] leading-[1.65] text-text-muted">Available when APIs are integrated.<br />Stay tuned!</p>
      </div>
      <span className="text-[9px] font-bold uppercase tracking-[0.1em] py-[3px] px-2.5 rounded-full bg-canvas border border-border text-text-subtle">Coming Soon</span>
    </div>
  );
}

export function SidebarCatalog() {
  const [activeTab, setActiveTab] = useState(null);
  const { addNode, models: ctxModels, tools: ctxTools } = useAgent();

  // Prefer live catalog from the backend; fall back to the built-in samples.
  const models = ctxModels?.length ? ctxModels : MODELS;
  const tools = ctxTools?.length ? ctxTools : TOOL_NODES;

  const handleTabClick = (tabId) => setActiveTab(prev => prev === tabId ? null : tabId);
  const currentTab = TABS.find(tab => tab.id === activeTab);

  return (
    <aside className="flex h-full shrink-0">

      {/* ── Icon Rail ── */}
      <nav className="w-[60px] bg-canvas border-r border-border flex flex-col items-center py-3 gap-[3px] shrink-0">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              title={tab.label}
              className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all relative ${isActive ? '' : `bg-transparent border border-transparent hover:bg-surface-2 ${tab.tabHoverDark}`}`}
              style={{
                '--tab-color': tab.color,
                background: isActive ? `${tab.color}18` : undefined,
                border: isActive ? `1px solid ${tab.color}35` : undefined,
                color: isActive ? tab.color : undefined
              }}
            >
              <Icon size={16} className={isActive ? '' : 'text-text-muted'} />
              {tab.shortLabel && <span className={`text-[7.5px] font-extrabold tracking-[0.06em] leading-none ${isActive ? '' : 'text-text-muted'}`}>{tab.shortLabel}</span>}
              {isActive && <div style={{ '--c': tab.color }} className="absolute left-0 top-1/2 -translate-y-1/2 w-[2.5px] h-[22px] rounded-r-[2px] [background:var(--c)]" />}
            </button>
          );
        })}
      </nav>

      {/* ── Content Panel ── */}
      {activeTab && currentTab && (
        <div className={`bg-surface border-r border-border flex flex-col overflow-hidden shrink-0 animate-in slide-in-from-left-2 duration-200 ${activeTab === 'models' ? 'w-[300px]' : 'w-[260px]'}`}>
          {/* Header */}
          <div className="flex items-center justify-between py-[11px] px-3 border-b border-border shrink-0">
            <div className="flex items-center gap-[7px]">
              <currentTab.icon size={13} color={currentTab.color} />
              <span className="text-[11px] font-bold text-text-primary tracking-[0.03em]">{currentTab.label}</span>
            </div>
            <button
              onClick={() => setActiveTab(null)}
              className="w-5 h-5 rounded-md flex items-center justify-center bg-transparent border-none cursor-pointer text-text-subtle transition-colors hover:bg-surface-2 hover:text-text-primary"
            >
              <X size={11} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {activeTab === 'models' && <ModelsPanel addNode={addNode} models={models} />}
            {activeTab === 'tools' && (
              <div className="flex-1 overflow-y-auto p-[8px_10px] flex flex-col gap-1.25">
                <p className="m-0 mt-1 mb-2 text-[9px] font-bold uppercase tracking-[0.1em] text-text-subtle pl-0.5">Drag to canvas</p>
                {tools.map((n, i) => <ToolCard key={n.name || n.label || i} node={n} />)}
              </div>
            )}
            {!['models', 'tools'].includes(activeTab) && <ComingSoonPanel tab={currentTab} />}
          </div>
        </div>
      )}

    </aside>
  );
}
