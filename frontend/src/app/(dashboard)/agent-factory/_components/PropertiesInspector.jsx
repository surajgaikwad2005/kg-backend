'use client';
import React from 'react';
import { Settings2, Cpu, Database, FileText, Radio, Wrench, MousePointerClick } from 'lucide-react';
import { Select } from '@/src/components/ui/Select';
import { useAgent } from '../_context/AgentContext';
import { useTheme } from '@/src/context/visuals/ThemeContext';

const NODE_META = {
  llm:    { label: 'LLM Model Configuration', icon: Cpu,      color: '#6366f1', bgHoverLight: 'bg-brand/10', bgHoverDark: '' },
  memory: { label: 'Memory Controller',        icon: Database, color: '#8b5cf6', bgHoverLight: 'bg-brand/10', bgHoverDark: '' },
  prompt: { label: 'Prompt Builder',           icon: FileText, color: '#f59e0b', bgHoverLight: 'bg-warning/10', bgHoverDark: '' },
  output: { label: 'Output Configurer',        icon: Radio,    color: '#64748b', bgHoverLight: 'bg-text-muted/10', bgHoverDark: '' },
  tool:   { label: 'Tool Grounding',           icon: Wrench,   color: '#10b981', bgHoverLight: 'bg-success/10', bgHoverDark: '' },
};

function SectionLabel({ children }) {
  return <p className="m-0 mb-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-text-subtle">{children}</p>;
}

function FieldGroup({ children }) {
  return <div className="mb-3.5">{children}</div>;
}

const inputClass = "w-full box-border py-1.5 px-2.5 text-xs text-text-primary bg-canvas border border-border rounded-lg outline-none transition-colors focus:border-brand/50";

function TextInput({ value, onChange }) {
  return (
    <input value={value ?? ''} onChange={e => onChange(e.target.value)} className={inputClass} />
  );
}

function TextareaInput({ value, onChange, rows = 3 }) {
  return (
    <textarea rows={rows} value={value ?? ''} onChange={e => onChange(e.target.value)} className={`${inputClass} resize-y leading-[1.6]`} />
  );
}

function SelectInput({ value, options, onChange }) {
  return (
    <Select
      value={value ?? ''}
      onChange={onChange}
      options={options.map((o) => ({ value: o, label: o }))}
    />
  );
}

function NumberInput({ value, onChange, min, max }) {
  return (
    <input type="number" value={value ?? 0} min={min} max={max} onChange={e => onChange(Number(e.target.value))} className={inputClass} />
  );
}

function ToggleInput({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between py-2 px-2.5 bg-canvas border border-border rounded-lg">
      <span className="text-xs text-text-secondary">{label}</span>
      <button onClick={() => onChange(!value)} className={`w-9 h-5 rounded-full border-none cursor-pointer p-[3px] flex items-center transition-colors shrink-0 ${value ? 'bg-success' : 'bg-surface-2'}`}>
        <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${value ? 'translate-x-4' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

const FALLBACK_MODEL_OPTIONS = ['claude_3_5_sonnet', 'claude_3_opus', 'claude_3_haiku', 'gpt-4o', 'gpt-4-turbo'];

function LLMFields({ data, update, modelOptions = FALLBACK_MODEL_OPTIONS }) {
  const options = modelOptions.includes(data.model_registry) || !data.model_registry
    ? modelOptions
    : [data.model_registry, ...modelOptions];
  return (
    <>
      <FieldGroup><SectionLabel>Model Registry</SectionLabel><SelectInput value={data.model_registry} options={options} onChange={v => update({ model_registry: v })} /></FieldGroup>
      <FieldGroup><SectionLabel>Precision Mode</SectionLabel><SelectInput value={data.precision} options={['ARITHMETIC', 'CREATIVE', 'BALANCED']} onChange={v => update({ precision: v })} /></FieldGroup>
      <div className="flex gap-2 mb-3.5">
        <div className="flex-1"><SectionLabel>Top P</SectionLabel><NumberInput value={data.top_p} min={0} max={1} onChange={v => update({ top_p: v })} /></div>
        <div className="flex-1"><SectionLabel>Max Tokens</SectionLabel><NumberInput value={data.max_tokens} min={256} max={8192} onChange={v => update({ max_tokens: v })} /></div>
      </div>
    </>
  );
}

function MemoryFields({ data, update }) {
  return (
    <>
      <FieldGroup><SectionLabel>Memory Strategy</SectionLabel><SelectInput value={data.strategy} options={['WINDOW BUFFER', 'PERSISTENT', 'HYBRID', 'SUMMARIZATION']} onChange={v => update({ strategy: v })} /></FieldGroup>
      <FieldGroup><SectionLabel>Lookback (pairs)</SectionLabel><NumberInput value={data.lookback} min={1} max={100} onChange={v => update({ lookback: v })} /></FieldGroup>
      <FieldGroup><SectionLabel>Storage Path</SectionLabel><TextInput value={data.storage_path} onChange={v => update({ storage_path: v })} /></FieldGroup>
    </>
  );
}

function PromptFields({ data, update }) {
  return (
    <>
      <FieldGroup><SectionLabel>System Prompt Directive</SectionLabel><TextareaInput rows={5} value={data.system_prompt} onChange={v => update({ system_prompt: v })} /></FieldGroup>
      <FieldGroup><SectionLabel>User Input Template</SectionLabel><TextareaInput rows={2} value={data.user_input_template} onChange={v => update({ user_input_template: v })} /></FieldGroup>
    </>
  );
}

function OutputFields({ data, update }) {
  return (
    <>
      <FieldGroup><SectionLabel>Delivery Mode</SectionLabel><SelectInput value={data.delivery_mode} options={['TEXT', 'JSON', 'MARKDOWN', 'STREAMING']} onChange={v => update({ delivery_mode: v })} /></FieldGroup>
      <FieldGroup><SectionLabel>Output Format Description</SectionLabel><TextareaInput rows={3} value={data.format} onChange={v => update({ format: v })} /></FieldGroup>
    </>
  );
}

function ToolFields({ data, update }) {
  return (
    <>
      <FieldGroup><SectionLabel>Tool Name</SectionLabel><TextInput value={data.label} onChange={v => update({ label: v })} /></FieldGroup>
      <FieldGroup><SectionLabel>Description</SectionLabel><TextareaInput rows={3} value={data.description} onChange={v => update({ description: v })} /></FieldGroup>
      <div className="flex flex-col gap-1.5">
        <ToggleInput label="Toggle Access" value={data.toggle_access} onChange={v => update({ toggle_access: v })} />
        <ToggleInput label="Table Access"  value={data.table_access}  onChange={v => update({ table_access: v })} />
      </div>
    </>
  );
}

const FIELDS_MAP = { llm: LLMFields, memory: MemoryFields, prompt: PromptFields, output: OutputFields, tool: ToolFields };

export function PropertiesInspector() {
  const { selectedNode, updateNodeData, models } = useAgent();
  const { theme } = useTheme();

  const modelOptions = models?.length ? models.map(m => m.id) : FALLBACK_MODEL_OPTIONS;

  const meta = selectedNode ? NODE_META[selectedNode.type] : null;
  const FieldsComponent = selectedNode ? FIELDS_MAP[selectedNode.type] : null;
  const update = (patch) => updateNodeData(selectedNode.id, patch);

  return (
    <aside className="w-[268px] bg-surface border-l border-border flex flex-col shrink-0 overflow-hidden">

      {selectedNode && meta ? (
        <>
          {/* Node banner */}
          <div className={`p-[14px_14px_12px] border-b border-border shrink-0 ${meta.bgHoverLight} ${meta.bgHoverDark}`}>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${meta.color}22`, border: `1px solid ${meta.color}44` }}>
                <meta.icon size={15} color={meta.color} />
              </div>
              <div>
                <p className="m-0 text-[9px] text-text-subtle uppercase tracking-[0.1em] leading-none">Node Config</p>
                <p className="mt-[3px] mb-0 text-[13px] font-bold text-text-primary leading-none">{meta.label}</p>
              </div>
            </div>
            <div className="inline-flex items-center gap-1 py-[3px] px-2 bg-surface-2 border border-border rounded-md">
              <span className="text-[9px] font-mono text-text-muted tracking-[0.04em]">{selectedNode.id}</span>
            </div>
          </div>

          {/* Scrollable fields */}
          <div className="flex-1 overflow-y-auto p-[14px_14px_20px]">
            {FieldsComponent && <FieldsComponent data={selectedNode.data} update={update} modelOptions={modelOptions} />}
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-3.5">
          <div className="w-[52px] h-[52px] rounded-2xl bg-surface-2 border border-border flex items-center justify-center">
            <MousePointerClick size={22} className="text-text-subtle" />
          </div>
          <div>
            <p className="m-0 text-[11px] font-bold text-text-subtle uppercase tracking-[0.1em]">Properties Inspector</p>
            <p className="mt-2 mb-0 text-[11px] text-text-muted leading-[1.6]">Click any node on the canvas to configure its parameters.</p>
          </div>
        </div>
      )}
    </aside>
  );
}
