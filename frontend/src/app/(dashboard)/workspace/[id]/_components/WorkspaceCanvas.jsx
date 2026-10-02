'use client';
import React from 'react';
import { ReactFlow, Background } from '@xyflow/react';
import { LayoutTemplate } from 'lucide-react';
import { ZoomControls } from './ZoomControls';
import { nodeTypes } from '../_nodes';

export default function WorkspaceCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  setReactFlowInstance,
  onNodeClick,
  onDrop,
  onDragOver,
  defaultViewport,
}) {
  return (
    <div className="flex-1 relative min-w-0 h-full">
      {/* Zoom controls */}
      <ZoomControls />

      {/* React Flow canvas */}
      <div className="w-full h-full" onDrop={onDrop} onDragOver={onDragOver}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          defaultViewport={defaultViewport}
          minZoom={0.1}
        >
          <Background color="#ccc" gap={20} size={1.5} />
        </ReactFlow>

        {/* Empty-canvas hint */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-text-subtle animate-fadeIn">
            <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center mb-4 shadow-sm border border-border">
              <LayoutTemplate className="w-8 h-8 text-text-subtle" />
            </div>
            <h3 className="text-xl font-bold text-text-secondary mb-2">Start Your Analysis</h3>
            <p className="text-sm text-text-subtle max-w-[320px] text-center leading-relaxed">
              Choose a template from the left panel or click <strong className="text-text-secondary font-bold">+ Add data</strong> to bring in time series signals.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
