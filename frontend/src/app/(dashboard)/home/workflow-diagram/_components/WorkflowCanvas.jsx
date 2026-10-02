"use client";
import React, { useState, useRef } from "react";
import {
  ReactFlowProvider,
  ReactFlow,
  Background,
  BackgroundVariant,
  Panel,
  useNodes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { IndustrialNode } from "../_nodes/EquipmentNode";
import PipeEdge from "../_edges/EditableEdge";
import RightSidebar from "./RightSidebar";
import { useConfirm } from "@/src/components/ui/ConfirmModal";
import { useWorkflowData } from "@/src/context/workflow-management/WorkflowContext";
import { ZoomIn, ZoomOut, Maximize2, ChevronDown, Info, Undo2, Redo2 } from "lucide-react";
import { useWorkflowCanvas } from "../_hooks/useWorkflowCanvas";
import { SaveDialogModal } from "./canvas/SaveDialogModal";

const nodeTypes = { industrial: IndustrialNode };
const edgeTypes = { pipe: PipeEdge };
const initialNodes = [];
const initialEdges = [];

// ─── Navigator Panel ─────────────────────────────────────────────────────────
function NavigatorPanel({ onZoomIn, onZoomOut, onFitView }) {
  const [isOpen, setIsOpen] = useState(true);
  const nodes = useNodes();

  const mapData = React.useMemo(() => {
    if (!nodes.length) return null;
    const pad = 80;
    const xs = nodes.flatMap((n) => [n.position.x, n.position.x + (n.measured?.width || 100)]);
    const ys = nodes.flatMap((n) => [n.position.y, n.position.y + (n.measured?.height || 100)]);
    const minX = Math.min(...xs) - pad;
    const minY = Math.min(...ys) - pad;
    const vbW = Math.max(Math.max(...xs) + pad - minX, 400);
    const vbH = Math.max(Math.max(...ys) + pad - minY, 300);
    return { viewBox: `${minX} ${minY} ${vbW} ${vbH}` };
  }, [nodes]);

  return (
    <Panel position="bottom-right" style={{ margin: "10px", padding: 0 }}>
      <div className="rounded-2xl overflow-hidden shadow-2xl border border-border bg-surface" style={{ width: "212px" }}>
        <button
          onClick={() => setIsOpen((o) => !o)}
          aria-label={isOpen ? "Collapse navigator" : "Expand navigator"}
          className="w-full flex items-center justify-between px-3 py-2 bg-surface hover:bg-surface-2 transition-colors cursor-pointer border-b border-border"
        >
          <span className="text-[9px] font-black text-text-muted tracking-[0.15em] uppercase select-none">
            Navigator
          </span>
          <ChevronDown
            className="w-3.5 h-3.5 text-text-muted transition-transform duration-300"
            style={{ transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)" }}
          />
        </button>

        <div className="overflow-hidden transition-all duration-300 ease-in-out" style={{ maxHeight: isOpen ? "160px" : "0px" }}>
          <div className="relative bg-surface-2" style={{ height: "150px" }}>
            {!nodes.length ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-[9px] text-text-muted select-none">Empty canvas</p>
              </div>
            ) : mapData ? (
              <svg viewBox={mapData.viewBox} width="100%" height="100%" style={{ display: "block" }}>
                {nodes.map((n) => (
                  <rect
                    key={n.id}
                    x={n.position.x}
                    y={n.position.y}
                    width={n.measured?.width || 100}
                    height={n.measured?.height || 100}
                    rx="8"
                    fill={
                      n.data?.status === "hazard" ? "var(--color-danger)" :
                      n.data?.status === "warning" ? "var(--color-warning)" :
                      "var(--color-brand)"
                    }
                    opacity="0.65"
                  />
                ))}
              </svg>
            ) : null}
          </div>
        </div>

        <div className="flex items-center px-1.5 py-1.5 bg-surface border-t border-border gap-0.5">
          <button
            onClick={onZoomIn}
            aria-label="Zoom in"
            title="Zoom In"
            className="flex-1 h-8 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-2 rounded-lg transition-colors cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={onZoomOut}
            aria-label="Zoom out"
            title="Zoom Out"
            className="flex-1 h-8 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-2 rounded-lg transition-colors cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={onFitView}
            aria-label="Fit view"
            title="Fit View"
            className="flex-1 h-8 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-2 rounded-lg transition-colors cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-border mx-0.5" />
          <button
            onClick={() => setIsOpen((o) => !o)}
            aria-label={isOpen ? "Collapse navigator" : "Expand navigator"}
            title={isOpen ? "Collapse" : "Expand"}
            className={`flex-1 h-8 flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer ${
              isOpen
                ? "text-brand bg-brand/10 hover:bg-brand/20"
                : "text-text-muted hover:text-text-primary hover:bg-surface-2"
            }`}
          >
            <ChevronDown
              className="w-4 h-4 transition-transform duration-300"
              style={{ transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)" }}
            />
          </button>
        </div>
      </div>
    </Panel>
  );
}

// ─── History Toolbar (Undo/Redo) ────────────────────────────────────────────
function HistoryToolbar({ canUndo, canRedo, onUndo, onRedo }) {
  const btnClass =
    "w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-2 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-muted disabled:cursor-not-allowed transition-colors cursor-pointer";

  return (
    <Panel position="top-left" style={{ margin: "10px", padding: 0 }}>
      <div className="flex items-center gap-0.5 rounded-xl border border-border bg-surface shadow-lg p-1">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          aria-label="Undo last change"
          title="Undo (Ctrl+Z)"
          className={btnClass}
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          aria-label="Redo last undone change"
          title="Redo (Ctrl+Shift+Z)"
          className={btnClass}
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>
    </Panel>
  );
}

function CanvasInner() {
  const wrapper = useRef(null);
  const { openConfirm } = useConfirm();
  const { pnidLoading } = useWorkflowData();

  const {
    nodes,
    onNodesChange,
    setNodes,
    edges,
    onEdgesChange,
    setEdges,
    connectingNodeId,
    tooltip,
    isSaving,
    showSaveDialog,
    setShowSaveDialog,
    saveName,
    setSaveName,
    onConnect,
    onNodeClick,
    onNodeDoubleClick,
    onPaneClick,
    onDragOver,
    onDrop,
    loadDiagram,
    handleExport,
    handleSaveInit,
    confirmSave,
    zoomIn,
    zoomOut,
    fitView,
    diagramId,
    setDiagramId,
    canUndo,
    canRedo,
    handleUndo,
    handleRedo,
    resetHistory,
  } = useWorkflowCanvas(initialNodes, initialEdges);

  const handleClear = async () => {
    const ok = await openConfirm("Clear all nodes and pipes from the canvas?", {
      title: "Clear Canvas",
      confirmLabel: "Clear",
      variant: "danger",
    });
    if (!ok) return;
    setNodes([]);
    setEdges([]);
    setDiagramId(null);
    resetHistory([], []);
  };

  React.useEffect(() => {
    if (!pnidLoading && nodes.length > 0) {
      const timer = setTimeout(() => fitView({ duration: 400 }), 150);
      return () => clearTimeout(timer);
    }
  }, [pnidLoading, nodes.length, fitView]);

  // Ctrl/Cmd+Z undo, Ctrl/Cmd+Shift+Z (or Ctrl+Y) redo — ignored while typing
  // in an input/textarea so renaming a node or the AI-generator fields still
  // gets native browser undo.
  React.useEffect(() => {
    const onKeyDown = (e) => {
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (key === "z" && e.shiftKey) {
        e.preventDefault();
        handleRedo();
      } else if (key === "z") {
        e.preventDefault();
        handleUndo();
      } else if (key === "y") {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleUndo, handleRedo]);

  return (
    <div className="flex w-full h-full">
      <div className="flex-1 relative" ref={wrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          onPaneClick={onPaneClick}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          minZoom={0.05}
          maxZoom={4}
          snapToGrid
          snapGrid={[20, 20]}
          defaultEdgeOptions={{
            type: "pipe",
            data: { label: "flow", direction: "forward", animated: true, flowColor: "var(--color-text-subtle)" },
          }}
          className="bg-surface"
          elevateEdgesOnSelect
        >
          <Background variant={BackgroundVariant.Dots} gap={24} size={1.2} color="var(--color-border)" />
          <HistoryToolbar canUndo={canUndo} canRedo={canRedo} onUndo={handleUndo} onRedo={handleRedo} />
          <NavigatorPanel
            onZoomIn={() => zoomIn()}
            onZoomOut={() => zoomOut()}
            onFitView={() => fitView({ duration: 400 })}
          />
        </ReactFlow>

        {connectingNodeId && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
            <div className="flex items-center gap-2 bg-warning text-white font-black text-caption uppercase tracking-widest px-4 py-2 rounded-full shadow-2xl animate-pulse">
              <span className="w-2 h-2 bg-white rounded-full" />
              Connection Mode Active — Click Target Node
            </div>
          </div>
        )}

        {tooltip && !connectingNodeId && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
            <div className="flex items-center gap-2 bg-surface-2 text-text-primary font-medium text-caption px-4 py-2 rounded-full shadow-xl border border-border">
              <Info className="w-3.5 h-3.5 text-brand" />
              {tooltip}
            </div>
          </div>
        )}

        {nodes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-center space-y-2 opacity-30">
              <div className="text-6xl">⚙️</div>
              <p className="text-text-muted font-black text-lg uppercase tracking-wider">
                Drag components here
              </p>
              <p className="text-text-subtle text-sm">from the panel on the right</p>
            </div>
          </div>
        )}
      </div>

      <RightSidebar
        onExport={handleExport}
        onClear={handleClear}
        onSave={handleSaveInit}
        onLoad={loadDiagram}
        isSaving={isSaving}
      />

      <SaveDialogModal
        showSaveDialog={showSaveDialog}
        setShowSaveDialog={setShowSaveDialog}
        saveName={saveName}
        setSaveName={setSaveName}
        confirmSave={confirmSave}
        isSaving={isSaving}
      />
    </div>
  );
}

export default function WorkflowCanvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
