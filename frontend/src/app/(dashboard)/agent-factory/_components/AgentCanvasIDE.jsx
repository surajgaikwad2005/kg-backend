'use client';
import React, { useCallback, useMemo, useRef } from 'react';
import {
  ReactFlow, Background, Controls, MiniMap,
  BackgroundVariant, ReactFlowProvider, useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Undo2, Redo2, LayoutGrid, Maximize2, ScanLine } from 'lucide-react';

import { useAgent } from '../_context/AgentContext';
import { useTheme } from '@/src/context/visuals/ThemeContext';
import { CanvasHeader } from './CanvasHeader';
import { SidebarCatalog } from './SidebarCatalog';
import { PropertiesInspector } from './PropertiesInspector';
import { ChatSandbox } from './ChatSandbox';
import { AiveeChatbot } from './AiveeChatbot';
import { LLMNode } from '../_nodes/LLMNode';
import { MemoryNode } from '../_nodes/MemoryNode';
import { PromptNode } from '../_nodes/PromptNode';
import { OutputNode } from '../_nodes/OutputNode';
import { ToolNode } from '../_nodes/ToolNode';

const DEFAULT_NODE_DATA = {
  llm:    { label: 'LLM MODEL CONFIGURATION',        model_registry: 'claude_3_5_sonnet', top_p: 0, max_tokens: 2048, precision: 'ARITHMETIC' },
  memory: { label: 'CONVERSATIONAL CONTEXT WINDOW',  strategy: 'WINDOW BUFFER', lookback: 12, storage_path: 'agents_memory.db' },
  prompt: { label: 'PROMPT SETTINGS OVERRIDE',       system_prompt: 'You are an intelligent industrial analytics agent.', user_input_template: 'User query: {input}', of_lines: 48 },
  output: { label: 'RESULT OUT MODE',                delivery_mode: 'TEXT', format: 'Deliver semantic text stream action.' },
  tool:   { label: 'STAT_TOOL_RUNTIME',              description: 'Calculate statistical summaries or retrieve values for specific telemetry points.', toggle_access: true, table_access: true },
};

const NODE_TYPES_MAP = { llm: LLMNode, memory: MemoryNode, prompt: PromptNode, output: OutputNode, tool: ToolNode };

const MINIMAP_COLORS = { llm: '#6366f1', memory: '#8b5cf6', prompt: '#f59e0b', output: '#64748b', tool: '#10b981' };

function FlowCanvas() {
  const wrapperRef = useRef(null);
  const { screenToFlowPosition, fitView } = useReactFlow();
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, selectNode, undo, redo, autoLayout, undoStack, redoStack } = useAgent();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const nodeTypes = useMemo(() => NODE_TYPES_MAP, []);

  const onDragOver = useCallback((e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const nodeType = e.dataTransfer.getData('application/reactflow');
    const nodeLabel = e.dataTransfer.getData('application/reactflow-label');
    if (!nodeType || !DEFAULT_NODE_DATA[nodeType]) return;
    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    const data = { ...DEFAULT_NODE_DATA[nodeType] };
    if (nodeLabel && nodeType === 'tool') data.label = nodeLabel;
    const nodeModel = e.dataTransfer.getData('application/reactflow-model');
    if (nodeModel && nodeType === 'llm') data.model_registry = nodeModel;
    addNode({ id: `${nodeType}_${Date.now()}`, type: nodeType, position, data });
  }, [screenToFlowPosition, addNode]);

  const onNodeClick     = useCallback((_, node) => selectNode(node), [selectNode]);
  const onPaneClick     = useCallback(() => selectNode(null), [selectNode]);
  const handleFitView   = useCallback(() => fitView({ padding: 0.18, duration: 420 }), [fitView]);
  const handleAutoLayout = useCallback(() => { autoLayout(); setTimeout(() => fitView({ padding: 0.18, duration: 420 }), 60); }, [autoLayout, fitView]);

  return (
    <div ref={wrapperRef} className="flex-1 relative overflow-hidden" onDrop={onDrop} onDragOver={onDragOver}>

      {/* ── Floating toolbar ── */}
      <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-0.5 py-1 px-2 rounded-xl bg-surface/95 backdrop-blur-md border border-border shadow-panel">
        <TBtn onClick={undo} disabled={undoStack.length === 0} tip="Undo"><Undo2 size={14} /></TBtn>
        <TBtn onClick={redo} disabled={redoStack.length === 0} tip="Redo"><Redo2 size={14} /></TBtn>
        <Divider />
        <button
          onClick={handleAutoLayout}
          className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-[11px] font-semibold text-text-muted hover:text-text-primary bg-transparent hover:bg-surface-2 border-none cursor-pointer transition-all"
        >
          <LayoutGrid size={13} />
          Auto Layout
        </button>
        <Divider />
        <TBtn onClick={handleFitView} tip="Fit View"><Maximize2 size={13} /></TBtn>
      </div>

      {/* ── Node / edge counter ── */}
      {nodes.length > 0 && (
        <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1.5 py-1 px-3 rounded-full bg-surface/95 backdrop-blur-md border border-border shadow-sm text-text-subtle">
          <ScanLine size={11} />
          <span className="text-[10px] font-semibold">
            {nodes.length} {nodes.length === 1 ? 'node' : 'nodes'}&nbsp;&nbsp;·&nbsp;&nbsp;{edges.length} {edges.length === 1 ? 'edge' : 'edges'}
          </span>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
        proOptions={{ hideAttribution: true }}
        className="bg-surface-2"
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#6366f1', strokeWidth: 2, opacity: 0.75 },
        }}
        connectionLineStyle={{ stroke: '#6366f1', strokeWidth: 2 }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={28}
          size={1.2}
          color={isDark ? '#1f1f28' : '#cbd5e1'}
        />

        <Controls
          showInteractive={false}
          className="bg-surface/95 backdrop-blur-md rounded-xl shadow-panel border-none [&>button]:border-border"
        />

        <MiniMap
          nodeColor={n => MINIMAP_COLORS[n.type] ?? (isDark ? '#3f3f46' : '#94a3b8')}
          maskColor={isDark ? 'rgba(9,9,13,0.75)' : 'rgba(241,245,249,0.75)'}
          className="bg-surface/95 backdrop-blur-md rounded-xl shadow-panel !bottom-4 !right-4 border border-border"
          nodeStrokeWidth={0}
          pannable
          zoomable
        />
      </ReactFlow>

      {/* ── Empty state ── */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-4">
          <div className="w-[72px] h-[72px] rounded-[22px] flex items-center justify-center bg-brand/5 border-[1.5px] border-dashed border-brand/30">
            <LayoutGrid size={30} className="text-brand/40" />
          </div>
          <div className="text-center">
            <p className="m-0 text-sm font-bold text-text-subtle">Drag nodes here to start</p>
            <p className="mt-1 mb-0 text-xs text-text-subtle/60">Pick from the Node Catalog on the left</p>
          </div>
        </div>
      )}
    </div>
  );
}

function TBtn({ onClick, disabled, tip, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={tip}
      className={`py-1 px-1.5 rounded-lg flex items-center justify-center transition-all border-none ${disabled ? 'opacity-40 cursor-not-allowed text-text-muted/60' : 'cursor-pointer text-text-muted hover:text-text-primary hover:bg-surface-2'}`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-[1px] h-[18px] bg-border mx-1" />;
}

export function AgentCanvasIDE() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface-2">
      <CanvasHeader />
      <div className="flex flex-1 overflow-hidden">
        <SidebarCatalog />
        <ReactFlowProvider>
          <div className="flex flex-col flex-1 overflow-hidden">
            <FlowCanvas />
            {/* <ChatSandbox /> */}
          </div>
        </ReactFlowProvider>
        <PropertiesInspector />
      </div>
      <AiveeChatbot />
    </div>
  );
}
