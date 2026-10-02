'use client';
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, Rocket, ChevronDown, Layers, Check, Pencil, Bot, Loader2 } from 'lucide-react';
import { useAgent } from '../_context/AgentContext';
import { useTheme } from '@/src/context/visuals/ThemeContext';

export function CanvasHeader() {
  const { activeAgent, agents, backToDashboard, saveAgent, deployAgent, openAgent, openAivee, renameAgent } = useAgent();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [saved, setSaved] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { setEditName(activeAgent?.name ?? 'Untitled Agent'); }, [activeAgent?.name]);
  useEffect(() => { if (isEditing) inputRef.current?.select(); }, [isEditing]);
  // Auto-open Aivee when an already-deployed agent is opened on the canvas.
  useEffect(() => { if (activeAgent?.status === 'deployed') openAivee(); }, [activeAgent?.id]);

  const handleSave = async () => { await saveAgent(); setSaved(true); setTimeout(() => setSaved(false), 2200); };

  const handleDeploy = async () => {
    if (deploying) return;
    setDeploying(true);
    const res = await deployAgent();
    setDeploying(false);
    if (res?.ok) {
      setDeployed(true);
      setTimeout(() => setDeployed(false), 2200);
      openAivee();
    }
  };

  const commitName = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== activeAgent?.name) renameAgent(trimmed);
    else setEditName(activeAgent?.name ?? 'Untitled Agent');
    setIsEditing(false);
  };

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') commitName();
    if (e.key === 'Escape') { setEditName(activeAgent?.name ?? 'Untitled Agent'); setIsEditing(false); }
  };

  return (
    <header className="h-[54px] flex items-center justify-between px-4 shrink-0 relative z-20 bg-gradient-to-b from-surface to-canvas border-b border-border">

      {/* ── LEFT ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={backToDashboard}
          className="flex items-center gap-1.5 py-1 px-2 rounded-lg text-xs font-semibold border-none cursor-pointer transition-all bg-surface-2 dark:bg-white/5 text-text-muted hover:bg-border dark:hover:bg-white/10 hover:text-text-primary"
        >
          <ArrowLeft size={15} />
        </button>

        <div className="w-[1px] h-[22px] bg-border" />

        <div className="flex items-center gap-2">
          <div className="w-[30px] h-[30px] rounded-[9px] bg-gradient-to-br from-brand to-highlight flex items-center justify-center shadow-[0_4px_14px_rgba(99,102,241,0.4)]">
            <span className="text-xs font-black text-white tracking-[-0.03em]">AF</span>
          </div>
          <div>
            <p className="m-0 text-[11px] font-extrabold text-text-muted tracking-[0.08em] uppercase leading-none">Aether Agent</p>
            <p className="m-0 text-[9px] text-text-subtle leading-[1.3]">Best-in-Plan Architect</p>
          </div>
        </div>

        <div className="w-[1px] h-[22px] bg-border" />

        {/* Editable agent name */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <input
              ref={inputRef}
              value={editName}
              onChange={e => setEditName(e.target.value)}
              onBlur={commitName}
              onKeyDown={handleNameKeyDown}
              className="text-[13px] font-bold text-text-primary bg-canvas border border-brand rounded-md py-0.5 px-2 outline-none min-w-[160px] max-w-[280px]"
            />
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              title="Click to rename"
              className="flex items-center gap-1.5 bg-transparent hover:bg-surface-2 dark:hover:bg-white/5 border-none cursor-text py-0.5 px-1.5 rounded-md transition-colors"
            >
              <span className="text-body-sm font-bold text-text-primary">{activeAgent?.name ?? 'Untitled Agent'}</span>
              <Pencil size={11} className="text-text-muted" />
            </button>
          )}
          <span className={`text-[9px] font-extrabold tracking-[0.1em] uppercase py-0.5 px-2 rounded-full border ${activeAgent?.status === 'deployed' ? 'bg-success/15 text-success border-success/30' : 'bg-warning/15 text-warning border-warning/25'}`}>
            {activeAgent?.status === 'deployed' ? 'Live' : 'Draft'}
          </span>
        </div>
      </div>

      {/* ── CENTER scope ── */}
      <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <p className="m-0 text-[11px] text-text-subtle tracking-[0.12em] uppercase font-bold">{activeAgent?.scope ?? ''}</p>
      </div>

      {/* ── RIGHT ── */}
      <div className="flex items-center gap-2">

        {/* Templates dropdown */}
        <div className="relative">
          <button
            onClick={() => setTemplateOpen(o => !o)}
            className="flex items-center gap-1.5 py-1 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all bg-surface-2 text-text-muted border border-border hover:bg-border hover:text-text-primary"
          >
            <Layers size={13} />
            <span>Saved Templates</span>
            <ChevronDown size={11} />
          </button>
          {templateOpen && (
            <div className="absolute right-0 top-[calc(100%+6px)] w-[220px] max-h-[280px] overflow-y-auto rounded-xl z-50 bg-surface border border-border shadow-panel">
              {agents.length === 0 ? (
                <p className="m-0 py-3 px-3.5 text-[11px] text-text-secondary">No saved templates yet</p>
              ) : agents.map(a => (
                <button
                  key={a.id}
                  onClick={() => { openAgent(a); setTemplateOpen(false); }}
                  className={`w-full text-left py-2 px-3.5 text-xs border-none cursor-pointer transition-all flex items-center justify-between gap-2 ${a.id === activeAgent?.id ? 'bg-surface-2 text-text-primary' : 'bg-transparent text-text-secondary hover:bg-surface-2 hover:text-text-primary'}`}
                >
                  <span className="overflow-hidden text-ellipsis whitespace-nowrap">{a.name}</span>
                  {a.status === 'deployed' && <span className="text-[8px] font-extrabold tracking-[0.08em] text-success shrink-0">LIVE</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ask Aivee */}
        <button
          onClick={openAivee}
          title="Ask Aivee, your flow assistant"
          className="flex items-center gap-1.5 py-1 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all bg-surface-2 text-text-muted border border-border hover:bg-border hover:text-text-primary"
        >
          <Bot size={13} />
          <span>Ask Aivee</span>
        </button>

        {/* Save */}
        <button
          onClick={handleSave}
          className={`flex items-center gap-1.5 py-1 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all border ${saved ? 'bg-success/15 text-success border-success/30' : 'bg-surface-2 text-text-muted border-border hover:bg-border hover:text-text-primary'}`}
        >
          {saved ? <Check size={13} /> : <Save size={13} />}
          <span>{saved ? 'Saved' : 'Save'}</span>
        </button>

        {/* Deploy */}
        <button
          onClick={handleDeploy}
          disabled={deploying}
          className={`flex items-center gap-1.5 py-1.5 px-4 rounded-lg text-xs font-semibold text-white border-none transition-all shadow-[0_4px_18px_rgba(99,102,241,0.45)] hover:-translate-y-[1px] hover:shadow-[0_8px_28px_rgba(99,102,241,0.55)] ${deploying ? 'cursor-wait opacity-80' : 'cursor-pointer'} ${deployed ? 'bg-success' : 'bg-gradient-to-br from-brand to-highlight'}`}
        >
          {deploying ? <Loader2 size={13} className="animate-spin" /> : deployed ? <Check size={13} /> : <Rocket size={13} />}
          <span>{deploying ? 'Deploying…' : deployed ? 'Deployed' : 'Deploy Agent'}</span>
        </button>

        <div className="w-[1px] h-[22px] bg-border" />

        <div className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-brand to-brand-hover flex items-center justify-center text-[11px] font-extrabold text-white shrink-0">
          KU
        </div>
      </div>
    </header>
  );
}
