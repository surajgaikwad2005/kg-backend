'use client';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useNodesState, useEdgesState, addEdge, useReactFlow, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { fetchTrendData } from './_lib/fetchTrendData';

import { TemplatesSidebar } from './_components/TemplatesSidebar';
import { DataDrawer } from './_components/DataDrawer';
import { RCAModal } from './_components/RCAModal';
import { CustomTagModal } from './_components/CustomTagModal';
import WorkspaceHeader from './_components/WorkspaceHeader';
import WorkspaceCanvas from './_components/WorkspaceCanvas';

import { useWorkspaceInit } from './_lib/useWorkspaceInit';
import { useWorkspaceHandlers } from './_lib/useWorkspaceHandlers';
import { useWorkspaceTemplates } from './_lib/useWorkspaceTemplates';

const INITIAL_NODES = [];
const INITIAL_EDGES = [];
const DEFAULT_RCA_FORM = { eventName: '', eventDate: '', equipment: '', description: '', severity: 'Medium' };
const DEFAULT_VIEWPORT = { x: 0, y: 0, zoom: 0.50 };
const flowStorageKey = (id) => `decisionops:workspace:flow:${id}`;

function CanvasApp() {
  const params = useParams();
  const idStr = Array.isArray(params.id) ? params.id[0] : params.id;
  const { fitView } = useReactFlow();

  const _uidRef = useRef(0);
  const getId = useCallback(() => `dndnode_${_uidRef.current++}`, []);
  const centerCanvas = useCallback(() => {
    try { fitView({ minZoom: DEFAULT_VIEWPORT.zoom, maxZoom: DEFAULT_VIEWPORT.zoom, duration: 300 }); } catch {}
  }, [fitView]);

  // Canvas state
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // Header and UI state
  const [workspaceName, setWorkspaceName] = useState('Untitled Workspace');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isTemplatePanelOpen, setIsTemplatePanelOpen] = useState(true);
  const [isAddDataOpen, setIsAddDataOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Time Series');
  const [activeTab, setActiveTab] = useState('Overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [assetsList, setAssetsList] = useState([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);
  const [activeItemTrend, setActiveItemTrend] = useState([]);
  const [isLoadingTrend, setIsLoadingTrend] = useState(false);

  // Modal State
  const [showRCAModal, setShowRCAModal] = useState(false);
  const [rcaForm, setRcaForm] = useState(DEFAULT_RCA_FORM);
  const [selectedRcaTemplate, setSelectedRcaTemplate] = useState('causal');
  const [supportedFeatures, setSupportedFeatures] = useState([]);
  const [activeTargetNode, setActiveTargetNode] = useState(null);
  const [isCustomTagModalOpen, setIsCustomTagModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const hasFetchedFolder = useRef(false);
  const hasRestored = useRef(false);

  const updateUrlWithNode = useCallback((nodeId) => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (nodeId) url.searchParams.set('node', nodeId);
    else url.searchParams.delete('node');
    window.history.replaceState(null, '', url.pathname + url.search);
  }, []);

  // Custom Hooks
  useWorkspaceInit({ idStr, setWorkspaceName, setNodes, setEdges, setSupportedFeatures, setAssetsList, setIsLoadingAssets, hasRestored, hasFetchedFolder, centerCanvas, fetchTrendData, flowStorageKey, _uidRef });
  
  const { onDragOver, onDrop, toggleSelectItem, handleAddSelectedToCanvas, handleAddItemToCanvas, handleRemoveTagFromNode } = useWorkspaceHandlers({
    activeItem, isAddDataOpen, fetchTrendData, setIsLoadingTrend, setActiveItemTrend, nodes, setNodes, reactFlowInstance, hasRestored,
    setActiveTargetNode, setIsAddDataOpen, updateUrlWithNode, activeTargetNode, getId, selectedItems, setSelectedItems, assetsList
  });
  
  const { handleTemplateClick, handleRCASubmit } = useWorkspaceTemplates({ nodes, setNodes, setEdges, setWorkspaceName, setIsAddDataOpen, setActiveTargetNode, updateUrlWithNode, rcaForm, selectedRcaTemplate, setShowRCAModal, setRcaForm, centerCanvas, getId, DEFAULT_RCA_FORM });



  // Canvas connects
  const onConnect = useCallback((params) => setEdges(eds => addEdge(params, eds)), [setEdges]);

  return (
    <>
        <WorkspaceHeader
          workspaceName={workspaceName}
          setWorkspaceName={setWorkspaceName}
          isEditingName={isEditingName}
          setIsEditingName={setIsEditingName}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          onOpenCustomTagModal={() => setIsCustomTagModalOpen(true)}
          onAddDataClick={() => { setIsAddDataOpen(true); setActiveItem(null); setActiveTargetNode(null); }}
        />

        <div className="flex-1 flex min-h-0">
          <TemplatesSidebar
            isOpen={isTemplatePanelOpen}
            onToggle={() => setIsTemplatePanelOpen(p => !p)}
            onTemplateClick={handleTemplateClick}
            supportedFeatures={supportedFeatures}
          />

          <WorkspaceCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            setReactFlowInstance={setReactFlowInstance}
            onNodeClick={(event, node) => {
              setNodes(nds => nds.map(n => ({ ...n, selected: n.id === node.id })));
              setActiveTargetNode(node);
              setIsAddDataOpen(true);
              updateUrlWithNode(node.id);
            }}
            onDrop={onDrop}
            onDragOver={onDragOver}
            defaultViewport={DEFAULT_VIEWPORT}
          />

          <DataDrawer
            isOpen={isAddDataOpen}
            workspaceName={workspaceName}
            assetsList={assetsList}
            isLoadingAssets={isLoadingAssets}
            selectedItems={selectedItems}
            searchQuery={searchQuery}
            activeCategory={activeCategory}
            activeItem={activeItem}
            activeTab={activeTab}
            activeItemTrend={activeItemTrend}
            isLoadingTrend={isLoadingTrend}
            activeTargetNode={activeTargetNode}
            onClose={() => { setIsAddDataOpen(false); setActiveTargetNode(null); updateUrlWithNode(null); }}
            onSearchChange={setSearchQuery}
            onCategoryChange={setActiveCategory}
            onItemClick={setActiveItem}
            onItemSelect={toggleSelectItem}
            onBack={() => setActiveItem(null)}
            onTabChange={setActiveTab}
            onAddToCanvas={handleAddItemToCanvas}
            onAddSelected={handleAddSelectedToCanvas}
            onRemoveTag={handleRemoveTagFromNode}
          />
        </div>

        <CustomTagModal
          isOpen={isCustomTagModalOpen}
          onClose={() => setIsCustomTagModalOpen(false)}
        />

        {showRCAModal && (
          <RCAModal
            form={rcaForm}
            selectedTemplate={selectedRcaTemplate}
            onFormChange={patch => setRcaForm(prev => ({ ...prev, ...patch }))}
            onTemplateChange={setSelectedRcaTemplate}
            onClose={() => setShowRCAModal(false)}
            onSubmit={handleRCASubmit}
          />
        )}
    </>
  );
}

export default function WorkspaceCanvasWrapper() {
  return (
    <ReactFlowProvider>
      <CanvasApp />
    </ReactFlowProvider>
  );
}
