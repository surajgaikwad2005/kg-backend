'use client';
/**
 * VisualPipelineCanvas  —  Generic drag-and-drop pipeline canvas
 * ────────────────────────────────────────────────────────────────
 *
 * Fully decoupled from any specific domain (IoT, ML, ETL, CI/CD …).
 * Everything domain-specific is injected via props.
 *
 * ── Props ────────────────────────────────────────────────────────
 *
 * Data (controlled from parent)
 *   nodes              {Array}          Array of node objects.
 *   setNodes           {Function}       React state setter (or any updater fn).
 *   edges              {Array}          Array of edge objects.
 *   setEdges           {Function}       React state setter.
 *   selectedNodeId     {string|null}    Currently selected node id.
 *   setSelectedNodeId  {Function}       Setter for selected node id.
 *
 * Tools sidebar
 *   tools              {Array}          Items shown in the left drag-sidebar.
 *                                       Shape: { id, label, type, description, defaultConfig, configSchema }
 *   sidebarTitle       {string}         Left-panel heading. Default: "Available Nodes"
 *
 * Node type customisation
 *   nodeTypeConfig     {Object}         Optional. Keys are type strings ('source', 'transform', …).
 *                                       Each value overrides/extends DEFAULT_NODE_TYPE_CONFIG for that type.
 *                                       Shape per type:
 *                                         icon       – Lucide icon component
 *                                         label      – Human label shown in badges
 *                                         border     – Tailwind border class  e.g. 'border-brand/30'
 *                                         text       – Tailwind text class    e.g. 'text-brand'
 *                                         dot        – Tailwind bg class      e.g. 'bg-brand'
 *                                         badge      – Combined badge class
 *                                         toolBg     – Sidebar item bg
 *                                         toolBorder – Sidebar item border
 *                                         toolText   – Sidebar item text
 *                                         toolIcon   – Sidebar item icon colour
 *
 * Properties panel
 *   renderNodeProperties  {Function}    Optional render prop.
 *                                       Signature: (node, { onConfigChange, pushToHistory }) => ReactNode | null
 *                                       Return a ReactNode to fully replace the default schema form.
 *                                       Return null/undefined to fall through to the built-in schema form.
 *
 * Undo support
 *   pushToHistory      {Function}       Optional. Called before any mutation to snapshot state.
 *
 * Canvas settings
 *   gridSize           {number}         Snap grid in px. Default: 24
 *   nodeWidth          {number}         Node card width in px. Default: 240
 *   nodeHeight         {number}         Estimated node height for port positioning. Default: 80
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Database, Activity, Box, Rocket, Trash2, X } from 'lucide-react';
import { Select } from '@/src/components/ui/Select';

// ── Built-in node-type visual config ────────────────────────────────────────
export const DEFAULT_NODE_TYPE_CONFIG = {
  source: {
    label:      'Source',
    icon:       Database,
    border:     'border-brand/30',
    text:       'text-brand',
    dot:        'bg-brand',
    badge:      'text-brand bg-brand/10',
    toolBg:     'bg-brand/10',
    toolBorder: 'border-brand/30',
    toolText:   'text-brand-hover',
    toolIcon:   'text-brand',
  },
  transform: {
    label:      'Transform',
    icon:       Activity,
    border:     'border-success/30',
    text:       'text-success',
    dot:        'bg-success',
    badge:      'text-success bg-success/10',
    toolBg:     'bg-success/10',
    toolBorder: 'border-success/30',
    toolText:   'text-success',
    toolIcon:   'text-success',
  },
  model: {
    label:      'Model',
    icon:       Box,
    border:     'border-highlight/30',
    text:       'text-highlight',
    dot:        'bg-highlight',
    badge:      'text-highlight bg-highlight/10',
    toolBg:     'bg-highlight/10',
    toolBorder: 'border-highlight/30',
    toolText:   'text-highlight-hover',
    toolIcon:   'text-highlight',
  },
  sink: {
    label:      'Deployment',
    icon:       Rocket,
    border:     'border-warning/30',
    text:       'text-warning',
    dot:        'bg-warning',
    badge:      'text-warning bg-warning/10',
    toolBg:     'bg-warning/10',
    toolBorder: 'border-warning/30',
    toolText:   'text-warning',
    toolIcon:   'text-warning',
  },
};

// ── Built-in schema-driven properties form ───────────────────────────────────
function DefaultPropertiesForm({ node, onConfigChange, pushToHistory }) {
  const schema = node.data.configSchema ?? node.data.config_schema ?? {};
  const config = node.data.config ?? {};

  if (Object.keys(schema).length === 0) {
    return (
      <div className="text-[13px] text-text-subtle italic py-4 text-center bg-surface-2/50 rounded-lg border border-dashed border-border">
        No parameters to configure
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(schema).map(([key, info]) => {
        const value = config[key] ?? '';
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

        // Array → <Select>
        if (Array.isArray(info)) {
          return (
            <div key={key} className="space-y-1.5 text-[14px]">
              <label className="font-bold text-text-secondary">{label}</label>
              <Select
                value={value}
                onChange={(val) => {
                  pushToHistory?.();
                  onConfigChange({ ...config, [key]: val });
                }}
                options={info.map((opt) => ({ value: opt, label: opt }))}
              />
            </div>
          );
        }

        // 'int' | 'float' → number input, else text
        const isNum = info === 'int' || info === 'float';
        return (
          <div key={key} className="space-y-1.5 text-[14px]">
            <label className="font-bold text-text-secondary">{label}</label>
            <input
              type={isNum ? 'number' : 'text'}
              step={info === 'float' ? '0.1' : '1'}
              value={value}
              placeholder={`Enter ${label.toLowerCase()}…`}
              onChange={(e) => {
                const val = isNum
                  ? (info === 'float' ? parseFloat(e.target.value) : parseInt(e.target.value))
                  : e.target.value;
                onConfigChange({ ...config, [key]: val });
              }}
              onFocus={() => pushToHistory?.()}
              className="w-full p-2.5 bg-white border border-border rounded-lg focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all shadow-sm"
            />
          </div>
        );
      })}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function VisualPipelineCanvas({
  // Controlled data
  nodes = [],
  setNodes,
  edges = [],
  setEdges,
  selectedNodeId = null,
  setSelectedNodeId,

  // Sidebar
  tools = [],
  sidebarTitle = 'Available Nodes',

  // Customisation
  nodeTypeConfig = {},
  renderNodeProperties,  // (node, { onConfigChange, pushToHistory }) => ReactNode | null

  // Undo
  pushToHistory,

  // Canvas tuning
  gridSize   = 24,
  nodeWidth  = 240,
  nodeHeight = 80,
}) {
  // Merge caller's config over defaults (per type, shallow merge)
  const typeConfig = Object.fromEntries(
    Object.entries({ ...DEFAULT_NODE_TYPE_CONFIG, ...nodeTypeConfig }).map(([type, cfg]) => [
      type,
      { ...(DEFAULT_NODE_TYPE_CONFIG[type] ?? {}), ...(nodeTypeConfig[type] ?? {}), ...cfg },
    ])
  );

  /** Resolve visual config for a node type, with a safe fallback. */
  const getTypeConfig = (type) =>
    typeConfig[type] ?? {
      label:      type,
      icon:       Box,
      border:     'border-border',
      text:       'text-text-secondary',
      dot:        'bg-text-subtle',
      badge:      'text-text-secondary bg-surface-2',
      toolBg:     'bg-surface-2',
      toolBorder: 'border-border',
      toolText:   'text-text-primary',
      toolIcon:   'text-text-muted',
    };

  // ── Internal canvas state ────────────────────────────────────────────────
  const canvasRef           = useRef(null);
  const [dragging, setDragging]         = useState(null);  // { id, offsetX, offsetY }
  const [connecting, setConnecting]     = useState(null);  // { nodeId, port, x, y }
  const [mousePos, setMousePos]         = useState({ x: 0, y: 0 });
  const [panelWidth, setPanelWidth]     = useState(320);
  const [resizingPanel, setResizingPanel] = useState(false);

  // Properties-panel resize
  useEffect(() => {
    const onMove = (e) => {
      if (!resizingPanel) return;
      const w = window.innerWidth - e.clientX;
      if (w > 220 && w < 800) setPanelWidth(w);
    };
    const onUp = () => setResizingPanel(false);
    if (resizingPanel) {
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    }
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [resizingPanel]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const snap = (v) => Math.round(v / gridSize) * gridSize;

  const getPortXY = useCallback((node, port) => {
    switch (port) {
      case 'top':    return { x: node.x + nodeWidth / 2, y: node.y };
      case 'bottom': return { x: node.x + nodeWidth / 2, y: node.y + nodeHeight };
      case 'left':   return { x: node.x,                  y: node.y + nodeHeight / 2 };
      case 'right':  return { x: node.x + nodeWidth,       y: node.y + nodeHeight / 2 };
      default:       return { x: node.x + nodeWidth,       y: node.y + nodeHeight / 2 };
    }
  }, [nodeWidth, nodeHeight]);

  const portOrigin = (node, port) => ({
    top:    { x: node.x + nodeWidth / 2,  y: node.y },
    bottom: { x: node.x + nodeWidth / 2,  y: node.y + nodeHeight },
    left:   { x: node.x,                   y: node.y + nodeHeight / 2 },
    right:  { x: node.x + nodeWidth,        y: node.y + nodeHeight / 2 },
  }[port] ?? { x: node.x + nodeWidth, y: node.y + nodeHeight / 2 });

  const deleteNode = useCallback((nodeId) => {
    pushToHistory?.();
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setEdges(prev => prev.filter(e => e.fromId !== nodeId && e.toId !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  }, [pushToHistory, selectedNodeId, setNodes, setEdges, setSelectedNodeId]);

  const deleteEdge = useCallback((edgeId) => {
    pushToHistory?.();
    setEdges(prev => prev.filter(e => e.id !== edgeId));
  }, [pushToHistory, setEdges]);

  /** Update only the config of the selected node. */
  const handleConfigChange = useCallback((nodeId, newConfig) => {
    setNodes(ns => ns.map(n => n.id === nodeId
      ? { ...n, data: { ...n.data, config: newConfig } }
      : n
    ));
  }, [setNodes]);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex overflow-hidden">

      {/* ─── Left: Tools Sidebar ──────────────────────────────────────────── */}
      <div className="w-64 bg-white border-r border-border p-5 flex flex-col gap-4 shadow-sm z-10 overflow-y-auto">
        <h3 className="text-[14px] font-bold text-text-subtle uppercase tracking-widest mb-1">
          {sidebarTitle}
        </h3>

        {tools.map((tool, idx) => {
          const tc = getTypeConfig(tool.type);
          const Icon = tc.icon;
          return (
            <div
              key={idx}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('toolId',      tool.id);
                e.dataTransfer.setData('toolType',    tool.type);
                e.dataTransfer.setData('toolLabel',   tool.label);
                e.dataTransfer.setData('toolDesc',    tool.description ?? '');
                e.dataTransfer.setData('toolConfig',  JSON.stringify(tool.defaultConfig ?? {}));
                e.dataTransfer.setData('toolSchema',  JSON.stringify(tool.configSchema   ?? {}));
              }}
              className={`p-3 ${tc.toolBg} border ${tc.toolBorder} rounded-lg cursor-grab border-dashed flex items-center gap-3 hover:opacity-80 transition-all`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${tc.toolIcon}`} />
              <span className={`text-[15px] font-medium ${tc.toolText} truncate`}>
                {tool.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* ─── Centre: Canvas ───────────────────────────────────────────────── */}
      <div
        ref={canvasRef}
        className="flex-1 bg-surface-2 relative overflow-hidden"
        style={{
          backgroundImage: 'radial-gradient(#94a3b8 1.5px, transparent 1.5px)',
          backgroundSize: `${gridSize}px ${gridSize}px`,
          opacity: 0.9,
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const toolId = e.dataTransfer.getData('toolId');
          if (!toolId) return;
          pushToHistory?.();
          const rect = canvasRef.current?.getBoundingClientRect();
          if (!rect) return;
          const x = snap(e.clientX - rect.left  - nodeWidth  / 2);
          const y = snap(e.clientY - rect.top   - nodeHeight / 2);
          setNodes(prev => [
            ...prev,
            {
              id:   `node-${Date.now()}`,
              type: e.dataTransfer.getData('toolType'),
              x, y,
              data: {
                label:        e.dataTransfer.getData('toolLabel'),
                desc:         e.dataTransfer.getData('toolDesc'),
                tool:         toolId,                                        // kept for parent compat
                config:       JSON.parse(e.dataTransfer.getData('toolConfig')),
                config_schema: JSON.parse(e.dataTransfer.getData('toolSchema')), // kept for parent compat
                configSchema: JSON.parse(e.dataTransfer.getData('toolSchema')),  // normalised name
              },
            },
          ]);
        }}
        onMouseMove={(e) => {
          const rect = canvasRef.current?.getBoundingClientRect();
          if (!rect) return;
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          setMousePos({ x, y });
          if (dragging) {
            setNodes(ns => ns.map(n =>
              n.id === dragging.id
                ? { ...n, x: snap(x - dragging.ox), y: snap(y - dragging.oy) }
                : n
            ));
          }
        }}
        onMouseUp={() => {
          if (dragging || connecting) pushToHistory?.();
          setDragging(null);
          setConnecting(null);
        }}
        onMouseLeave={() => {
          setDragging(null);
          setConnecting(null);
        }}
      >
        {/* ── SVG: edges ────────────────────────────────────────────────── */}
        <svg className="absolute inset-0 pointer-events-none w-full h-full z-0">
          <defs>
            <marker id="vpc-arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
            </marker>
          </defs>

          {edges.map(edge => {
            const from = nodes.find(n => n.id === edge.fromId);
            const to   = nodes.find(n => n.id === edge.toId);
            if (!from || !to) return null;

            const { x: x1, y: y1 } = getPortXY(from, edge.fromPort ?? 'right');
            const { x: x2, y: y2 } = getPortXY(to,   edge.toPort   ?? 'left');
            const dx = Math.abs(x1 - x2);
            const dy = Math.abs(y1 - y2);

            const cx1 = x1 + (edge.fromPort === 'left' ? -dx / 2 : edge.fromPort === 'right'  ?  dx / 2 : 0);
            const cy1 = y1 + (edge.fromPort === 'top'  ? -dy / 2 : edge.fromPort === 'bottom' ?  dy / 2 : 0);
            const cx2 = x2 + (edge.toPort   === 'left' ? -dx / 2 : edge.toPort   === 'right'  ?  dx / 2 : 0);
            const cy2 = y2 + (edge.toPort   === 'top'  ? -dy / 2 : edge.toPort   === 'bottom' ?  dy / 2 : 0);
            const d = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;

            return (
              <g key={edge.id} className="group">
                {/* Wide invisible hit area */}
                <path d={d} fill="none" stroke="#cbd5e1" strokeWidth="8"
                  className="opacity-0 group-hover:opacity-20 transition-opacity cursor-pointer" />
                {/* Visible stroke */}
                <path d={d} fill="none" stroke="#64748b" strokeWidth="2.5"
                  markerEnd="url(#vpc-arrow)"
                  className={selectedNodeId === edge.id ? 'stroke-brand' : ''} />
                {/* Animated flow dash */}
                <path d={d} fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="4 8"
                  className="animate-[dash_2s_linear_infinite] opacity-50" />
                {/* Delete button (shown on hover) */}
                <foreignObject
                  x={(x1 + x2) / 2 - 12} y={(y1 + y2) / 2 - 12}
                  width="24" height="24"
                  className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto"
                >
                  <button
                    onClick={() => deleteEdge(edge.id)}
                    className="w-6 h-6 bg-white border border-border rounded-full shadow-sm flex items-center justify-center text-text-subtle hover:text-danger hover:border-danger/20 transition-all"
                    title="Delete connection"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </foreignObject>
              </g>
            );
          })}

          {/* Live preview while drawing a connection */}
          {connecting && (() => {
            const offX = connecting.port === 'right' ? 100 : connecting.port === 'left' ? -100 : 0;
            const offY = connecting.port === 'bottom' ? 100 : connecting.port === 'top' ? -100 : 0;
            return (
              <path
                d={`M ${connecting.x} ${connecting.y} C ${connecting.x + offX} ${connecting.y + offY}, ${mousePos.x - offX} ${mousePos.y}, ${mousePos.x} ${mousePos.y}`}
                fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="5 5"
                className="animate-pulse"
              />
            );
          })()}
        </svg>

        {/* ── Node cards ────────────────────────────────────────────────── */}
        {nodes.map(node => {
          const tc   = getTypeConfig(node.type);
          const Icon = tc.icon;
          const isSelected = selectedNodeId === node.id;

          /** Renders one port dot on a given side. */
          const Port = ({ side }) => {
            const po = portOrigin(node, side);
            const posClass = {
              top:    'absolute top-0    left-1/2 -translate-x-1/2 -translate-y-1/2',
              bottom: 'absolute bottom-0 left-1/2 -translate-x-1/2  translate-y-1/2',
              left:   'absolute left-0   top-1/2 -translate-x-1/2 -translate-y-1/2',
              right:  'absolute right-0  top-1/2  translate-x-1/2 -translate-y-1/2',
            }[side];

            return (
              <div
                className={`port ${posClass} w-3 h-3 rounded-full border-2 border-white shadow-sm cursor-crosshair z-20 hover:scale-125 transition-transform ${tc.dot}`}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  pushToHistory?.();
                  setConnecting({ nodeId: node.id, port: side, x: po.x, y: po.y });
                }}
                onMouseUp={(e) => {
                  e.stopPropagation();
                  if (connecting && connecting.nodeId !== node.id) {
                    pushToHistory?.();
                    setEdges(prev => [
                      ...prev,
                      {
                        id:       `edge-${Date.now()}`,
                        fromId:   connecting.nodeId,
                        toId:     node.id,
                        fromPort: connecting.port,
                        toPort:   side,
                      },
                    ]);
                    setConnecting(null);
                  }
                }}
              />
            );
          };

          return (
            <div
              key={node.id}
              className={`absolute p-4 bg-white border-2 rounded-xl shadow-lg z-10 cursor-move transition-shadow
                ${isSelected ? 'border-brand ring-4 ring-brand-muted shadow-xl' : tc.border}`}
              style={{ left: node.x, top: node.y, width: nodeWidth }}
              onMouseDown={(e) => {
                if (e.target.classList.contains('port')) return;
                pushToHistory?.();
                setSelectedNodeId(node.id);
                const rect = canvasRef.current?.getBoundingClientRect();
                if (!rect) return;
                setDragging({
                  id: node.id,
                  ox: e.clientX - rect.left - node.x,
                  oy: e.clientY - rect.top  - node.y,
                });
              }}
            >
              {/* Card header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-2 pt-0.5 min-w-0">
                  <Icon className={`w-4 h-4 mt-1 shrink-0 ${tc.text}`} />
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-[15px] font-bold text-text-secondary leading-tight truncate">
                      {node.data.label}
                    </span>
                    <span className="text-[10px] text-text-subtle font-semibold uppercase tracking-wider">
                      {tc.label}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {node.type === 'source' && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tc.badge}`}>
                      READY
                    </span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                    className="p-1 text-text-subtle hover:text-danger hover:bg-danger/10 rounded-md transition-all"
                    title="Delete node"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {node.data.desc && (
                <p className="text-[13px] text-text-muted leading-snug">{node.data.desc}</p>
              )}

              {/* Ports */}
              <Port side="top" />
              <Port side="bottom" />
              <Port side="left" />
              <Port side="right" />
            </div>
          );
        })}
      </div>

      {/* ─── Right: Properties Panel ──────────────────────────────────────── */}
      {selectedNodeId && (() => {
        const node = nodes.find(n => n.id === selectedNodeId);
        if (!node) return null;

        const onConfigChange = (newConfig) => handleConfigChange(node.id, newConfig);

        // Try custom renderer first; fall back to built-in schema form
        const customContent = renderNodeProperties
          ? renderNodeProperties(node, { onConfigChange, pushToHistory })
          : null;

        return (
          <div
            style={{ width: panelWidth }}
            className="bg-white border-l border-border shadow-xl z-20 flex flex-col h-full animate-in slide-in-from-right duration-200 relative shrink-0"
          >
            {/* Drag-to-resize handle */}
            <div
              className="absolute top-0 left-0 bottom-0 w-1 cursor-col-resize hover:bg-brand transition-colors z-30"
              onMouseDown={(e) => { e.preventDefault(); setResizingPanel(true); }}
            />

            {/* Panel header */}
            <header className="px-5 py-4 border-b border-border flex justify-between items-center bg-surface-2/50 shrink-0">
              <div>
                <h3 className="text-[14px] font-bold text-text-primary uppercase tracking-wider">
                  Properties
                </h3>
                <p className="text-[12px] text-text-muted font-medium">
                  Configure node parameters
                </p>
              </div>
              <button
                onClick={() => setSelectedNodeId(null)}
                className="p-1.5 hover:bg-surface-2 text-text-subtle hover:text-text-secondary rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </header>

            {/* Panel body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-border">
              {/* Node info card */}
              <div>
                <label className="text-[11px] font-bold text-text-subtle uppercase tracking-widest block mb-2">
                  Node Info
                </label>
                <div className="p-3 bg-surface-2 border border-border rounded-lg">
                  <div className="text-[14px] font-bold text-text-secondary">{node.data.label}</div>
                  <div className="text-[12px] text-text-muted mt-0.5 capitalize">
                    {getTypeConfig(node.type).label} Node
                  </div>
                </div>
              </div>

              {/* Parameters section */}
              <div className="space-y-4">
                <label className="text-[11px] font-bold text-text-subtle uppercase tracking-widest block">
                  Parameters
                </label>

                {customContent ?? (
                  <DefaultPropertiesForm
                    node={node}
                    onConfigChange={onConfigChange}
                    pushToHistory={pushToHistory}
                  />
                )}
              </div>
            </div>

            {/* Panel footer */}
            <footer className="p-5 border-t border-border bg-canvas/30 shrink-0">
              <button
                onClick={() => setSelectedNodeId(null)}
                className="w-full py-2.5 bg-surface-2 text-white rounded-lg text-[14px] font-bold hover:bg-overlay transition-colors shadow-md active:scale-[0.98]"
              >
                Done
              </button>
            </footer>
          </div>
        );
      })()}
    </div>
  );
}
