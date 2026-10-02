import { useEffect, useCallback } from 'react';
// industrial-data service removed from cpcp-configuration (out of the refactored
// contract) — disabled until this is rewired to a real backend.
// import { getVisualData } from '@/src/services/cpcp/industrial-data/industrialDataService';

export function useWorkspaceHandlers({
  activeItem,
  isAddDataOpen,
  fetchTrendData,
  setIsLoadingTrend,
  setActiveItemTrend,
  nodes,
  setNodes,
  reactFlowInstance,
  hasRestored,
  setActiveTargetNode,
  setIsAddDataOpen,
  updateUrlWithNode,
  activeTargetNode,
  getId,
  selectedItems,
  setSelectedItems,
  assetsList,
}) {
  // ── Auto-fetch trend for drawer detail view ──────────────────────────────
  useEffect(() => {
    if (!activeItem || !isAddDataOpen) {
      setActiveItemTrend([]);
      return;
    }
    let cancelled = false;
    setIsLoadingTrend(true);
    fetchTrendData(activeItem.name).then(data => {
      if (cancelled) return;
      setActiveItemTrend(data);
      setIsLoadingTrend(false);
    });
    return () => { cancelled = true; };
  }, [activeItem, isAddDataOpen, fetchTrendData, setIsLoadingTrend, setActiveItemTrend]);

  // ── Add node with async trend fetch ─────────────────────────────────────
  const addNodeWithTrend = useCallback(async (label, position = { x: 250, y: 250 }) => {
    const selectedEvidenceNode = nodes.find(n => n.type === 'rcaEvidence' && n.selected);
    if (selectedEvidenceNode) {
      const trendData = await fetchTrendData(label);
      setNodes(nds => nds.map(n => {
        if (n.id !== selectedEvidenceNode.id) return n;
        const existing = n.data.signals || [];
        if (existing.some(s => s.label === label)) return n;
        return { ...n, data: { ...n.data, signals: [...existing, { label, tagId: label, trendData }] } };
      }));
      return;
    }

    const nodeId = getId();
    setNodes(nds => [...nds, { id: nodeId, type: 'signalNode', position, data: { label, tagId: label, trendData: [] } }]);
    const trendData = await fetchTrendData(label);
    setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: { ...n.data, trendData } } : n));
  }, [nodes, fetchTrendData, setNodes, getId]);

  // ── Drag & Drop Event Handlers ──────────────────────────────────────────
  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    if (!reactFlowInstance) return;
    const label = e.dataTransfer.getData('application/label');
    if (!label) return;
    const position = reactFlowInstance.screenToFlowPosition({ x: e.clientX, y: e.clientY });
    addNodeWithTrend(label, position);
  }, [reactFlowInstance, addNodeWithTrend]);

  // ── Global time-range refresh event listener ────────────────────────────
  useEffect(() => {
    const handleTimeChange = async () => {
      const saved = localStorage.getItem('timeRange');
      if (!saved || nodes.length === 0) return;

      setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, trendData: [] } })));
      // industrial-data (getVisualData) is disabled — see import comment above.
      // const { start: startStr, end: endStr } = JSON.parse(saved);
      // const startTime = new Date(startStr);
      // const endTime = new Date(endStr);
      // const pad = n => n.toString().padStart(2, '0');
      // const fmt = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      // nodes.forEach(async node => {
      //   if (node.type !== 'signalNode') return;
      //   try {
      //     const body = await getVisualData({
      //       start: fmt(startTime), end: fmt(endTime),
      //       tags: [node.data.label], dashboard_name: 'workspace_refresh',
      //     });
      //     if (body.statusCode === 200) {
      //       const g = (body.data || []).find(i => i.tagGraph)?.tagGraph;
      //       if (g && Array.isArray(g.x) && Array.isArray(g.y)) {
      //         const trend = g.x.map((xVal, i) => [
      //           typeof xVal === 'string' ? new Date(xVal.replace(' ', 'T')).getTime() : xVal,
      //           g.y[i],
      //         ]);
      //         setNodes(nds => nds.map(n => n.id === node.id ? { ...n, data: { ...n.data, trendData: trend } } : n));
      //       }
      //     }
      //   } catch { /* silently skip */ }
      // });
    };
    window.addEventListener('timeRangeChanged', handleTimeChange);
    return () => window.removeEventListener('timeRangeChanged', handleTimeChange);
  }, [nodes.length, setNodes]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync URL query parameter selection on load ─────────────────────────
  useEffect(() => {
    if (!hasRestored.current || nodes.length === 0) return;
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const nodeId = searchParams.get('node');
      if (nodeId) {
        const targetNode = nodes.find(n => n.id === nodeId);
        if (targetNode && !nodes.some(n => n.id === nodeId && n.selected)) {
          setNodes(nds => nds.map(n => ({ ...n, selected: n.id === nodeId })));
          setActiveTargetNode(targetNode);
          setIsAddDataOpen(true);
        }
      }
    }
  }, [nodes, hasRestored.current]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Sync URL query parameter clean up when selected node is deleted ────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const searchParams = new URLSearchParams(window.location.search);
    const nodeId = searchParams.get('node');
    if (nodeId && nodes.length > 0 && !nodes.some(n => n.id === nodeId)) {
      updateUrlWithNode(null);
      if (activeTargetNode && activeTargetNode.id === nodeId) {
        setActiveTargetNode(null);
        setIsAddDataOpen(false);
      }
    }
  }, [nodes, activeTargetNode, updateUrlWithNode, setActiveTargetNode, setIsAddDataOpen]);

  // ── Listen to open tag drawer custom events from node cards ─────────────
  useEffect(() => {
    const handleOpenDrawer = (e) => {
      const { nodeId } = e.detail;
      const targetNode = nodes.find(n => n.id === nodeId);
      if (targetNode) {
        setNodes(nds => nds.map(n => ({ ...n, selected: n.id === nodeId })));
        setActiveTargetNode(targetNode);
        setIsAddDataOpen(true);
        updateUrlWithNode(nodeId);
      }
    };
    window.addEventListener('open-tag-drawer', handleOpenDrawer);
    return () => window.removeEventListener('open-tag-drawer', handleOpenDrawer);
  }, [nodes, setNodes, setActiveTargetNode, setIsAddDataOpen, updateUrlWithNode]);

  // ── Tag Selection Drawer Helpers ────────────────────────────────────────
  const toggleSelectItem = useCallback((id, e) => {
    if (e) e.stopPropagation();
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }, [setSelectedItems]);

  const handleAddSelectedToCanvas = useCallback(() => {
    const selected = assetsList.filter(item => selectedItems.includes(item.id));
    if (activeTargetNode) {
      if (activeTargetNode.type === 'trendStats') {
        const selectedNames = selected.map(i => i.name);
        setNodes(nds => nds.map(n => {
          if (n.id !== activeTargetNode.id) return n;
          const existing = (n.data.signals || []).map(s => s.label);
          const toAdd = selectedNames.filter(name => !existing.includes(name));
          return { ...n, data: { ...n.data, signals: [...(n.data.signals || []), ...toAdd.map(name => ({ label: name, tagId: name, trendData: [] }))], savedTags: [...(n.data.savedTags || []), ...toAdd] } };
        }));
      } else {
        const newTags = selected.map(i => i.name);
        setNodes(nds => nds.map(n => n.id === activeTargetNode.id ? { ...n, data: { ...n.data, savedTags: newTags } } : n));
      }
      setSelectedItems([]);
      setIsAddDataOpen(false);
    } else {
      setSelectedItems([]);
    }
  }, [assetsList, selectedItems, activeTargetNode, setNodes, setSelectedItems, setIsAddDataOpen]);

  const handleAddItemToCanvas = useCallback((item) => {
    if (!activeTargetNode) return;
    setNodes(nds => nds.map(n => {
      if (n.id !== activeTargetNode.id) return n;
      if (n.type === 'trendStats') {
        const existing = (n.data.signals || []).map(s => s.label);
        if (existing.includes(item.name)) return n;
        return { ...n, data: { ...n.data, signals: [...(n.data.signals || []), { label: item.name, tagId: item.name, trendData: [] }], savedTags: [...(n.data.savedTags || []), item.name] } };
      }
      const cur = n.data.savedTags || [];
      return cur.includes(item.name) ? n : { ...n, data: { ...n.data, savedTags: [...cur, item.name] } };
    }));
    setIsAddDataOpen(false);
  }, [activeTargetNode, setNodes, setIsAddDataOpen]);

  const handleRemoveTagFromNode = useCallback((tagName) => {
    if (!activeTargetNode) return;
    setNodes(nds => nds.map(n => {
      if (n.id !== activeTargetNode.id) return n;
      const cur = n.data.savedTags || [];
      const signals = n.data.signals || [];
      const newTags = cur.filter(t => t !== tagName);
      const newSignals = signals.filter(s => s.label !== tagName);
      const updatedNode = { ...n, data: { ...n.data, savedTags: newTags, signals: newSignals } };
      if (activeTargetNode.id === n.id) {
        setTimeout(() => setActiveTargetNode(updatedNode), 0);
      }
      return updatedNode;
    }));
  }, [activeTargetNode, setNodes, setActiveTargetNode]);

  return {
    onDragOver,
    onDrop,
    toggleSelectItem,
    handleAddSelectedToCanvas,
    handleAddItemToCanvas,
    handleRemoveTagFromNode,
  };
}
