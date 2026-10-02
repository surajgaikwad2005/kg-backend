import { useCallback } from 'react';
import {
  buildRCALayout,
  buildCorrelationLayout,
  buildAnomalyLayout,
  buildTrendLayout,
  buildComparisonLayout,
  buildProcessFlowLayout,
  buildThresholdLayout,
  buildReportLayout,
} from './templateGenerators';

const getNonOverlappingOffset = (newNodes, existingNodes) => {
  let dx = 0;
  let dy = 0;
  let hasOverlap = true;
  const overlapThresholdX = 250;
  const overlapThresholdY = 200;
  let iterations = 0;

  while (hasOverlap && iterations < 100) {
    iterations++;
    hasOverlap = false;
    for (const newNode of newNodes) {
      const newX = newNode.position.x + dx;
      const newY = newNode.position.y + dy;
      for (const existNode of existingNodes) {
        const distX = Math.abs(existNode.position.x - newX);
        const distY = Math.abs(existNode.position.y - newY);
        if (distX < overlapThresholdX && distY < overlapThresholdY) {
          hasOverlap = true;
          dy += 150; // Shift down
          dx += 50;  // Shift right slightly
          break;
        }
      }
      if (hasOverlap) break;
    }
  }
  return { x: dx, y: dy };
};

export function useWorkspaceTemplates({
  nodes,
  setNodes,
  setEdges,
  setWorkspaceName,
  setIsAddDataOpen,
  setActiveTargetNode,
  updateUrlWithNode,
  rcaForm,
  selectedRcaTemplate,
  setShowRCAModal,
  setRcaForm,
  centerCanvas,
  getId,
  DEFAULT_RCA_FORM,
}) {
  // ── Template click handler dispatcher ───────────────────────────────────
  const handleTemplateClick = useCallback((templateId) => {
    const nodeId = getId();
    const pos = { x: 200, y: 200 };

    if (templateId === 'timeseries') {
      const offset = getNonOverlappingOffset([{ position: pos }], nodes);
      const newPos = { x: pos.x + offset.x, y: pos.y + offset.y };
      const newNode = { id: nodeId, type: 'trendStats', position: newPos, data: { label: 'Time Series Profiler', analysisType: 'timeseries', savedTags: [], signals: [] }, selected: true };
      setNodes(prev => [...prev.map(n => ({ ...n, selected: false })), newNode]);
      setActiveTargetNode(newNode);
      setIsAddDataOpen(true);
      updateUrlWithNode(nodeId);
      return;
    }
    if (templateId === 'trend_analysis') {
      const offset = getNonOverlappingOffset([{ position: pos }], nodes);
      const newPos = { x: pos.x + offset.x, y: pos.y + offset.y };
      const newNode = { id: nodeId, type: 'trendStats', position: newPos, data: { label: 'Trend Analysis', analysisType: 'trend_analysis', savedTags: [], signals: [] }, selected: true };
      setNodes(prev => [...prev.map(n => ({ ...n, selected: false })), newNode]);
      setActiveTargetNode(newNode);
      setIsAddDataOpen(true);
      updateUrlWithNode(nodeId);
      return;
    }
    if (templateId === 'event_detection') {
      const offset = getNonOverlappingOffset([{ position: pos }], nodes);
      const newPos = { x: pos.x + offset.x, y: pos.y + offset.y };
      const newNode = { id: nodeId, type: 'anomalyAlerts', position: newPos, data: { label: 'Event Detection Engine', analysisType: 'event_detection', savedTags: [] }, selected: true };
      setNodes(prev => [...prev.map(n => ({ ...n, selected: false })), newNode]);
      setActiveTargetNode(newNode);
      setIsAddDataOpen(true);
      updateUrlWithNode(nodeId);
      return;
    }
    if (templateId === 'kpi_monitoring') {
      const offset = getNonOverlappingOffset([{ position: pos }], nodes);
      const newPos = { x: pos.x + offset.x, y: pos.y + offset.y };
      const newNode = { id: nodeId, type: 'kpiMonitoring', position: newPos, data: { label: 'KPI Monitoring Dashboard', analysisType: 'kpi_monitoring', savedTags: [] }, selected: true };
      setNodes(prev => [...prev.map(n => ({ ...n, selected: false })), newNode]);
      setActiveTargetNode(newNode);
      setIsAddDataOpen(true);
      updateUrlWithNode(nodeId);
      return;
    }
    if (templateId === 'multi_chart') {
      const offset = getNonOverlappingOffset([{ position: pos }], nodes);
      const newPos = { x: pos.x + offset.x, y: pos.y + offset.y };
      const newNode = { id: nodeId, type: 'multiChart', position: newPos, data: { label: 'Multi Chart Visualization' }, selected: true };
      setNodes(prev => [...prev.map(n => ({ ...n, selected: false })), newNode]);
      setActiveTargetNode(newNode);
      setIsAddDataOpen(true);
      updateUrlWithNode(nodeId);
      return;
    }
    if (templateId === 'rca') {
      const offset = getNonOverlappingOffset([{ position: pos }], nodes);
      const newPos = { x: pos.x + offset.x, y: pos.y + offset.y };
      const newNode = { id: nodeId, type: 'rcaAnalysis', position: newPos, data: { label: 'Root Cause Analysis', analysisType: 'rca', savedTags: [] }, selected: true };
      setNodes(prev => [...prev.map(n => ({ ...n, selected: false })), newNode]);
      setActiveTargetNode(newNode);
      setIsAddDataOpen(true);
      updateUrlWithNode(nodeId);
      return;
    }
    if (templateId === 'correlation') {
      const { nodes: newNodes } = buildCorrelationLayout({ getId });
      const offset = getNonOverlappingOffset(newNodes, nodes);
      const shiftedNodes = newNodes.map(n => ({
        ...n,
        position: { x: n.position.x + offset.x, y: n.position.y + offset.y }
      }));
      const matrixNode = shiftedNodes.find(n => n.type === 'correlationMatrix');
      if (matrixNode) {
        matrixNode.selected = true;
        setActiveTargetNode(matrixNode);
        updateUrlWithNode(matrixNode.id);
      }
      setNodes(prev => [...prev, ...shiftedNodes]);
      setWorkspaceName(prev => prev === 'Untitled Workspace' ? 'Correlation Analysis' : prev);
      setIsAddDataOpen(true);
      return;
    }

    const builders = {
      anomaly:  buildAnomalyLayout,
      trend:    buildTrendLayout,
      comparison: buildComparisonLayout,
      workflow: buildProcessFlowLayout,
      threshold: buildThresholdLayout,
      report:   buildReportLayout,
    };
    const builder = builders[templateId];
    if (!builder) return;

    const { nodes: newNodes, edges: newEdges } = builder({ getId });
    
    const APPEND = ['anomaly', 'trend', 'comparison'];
    if (APPEND.includes(templateId)) {
      const offset = getNonOverlappingOffset(newNodes, nodes);
      const shiftedNodes = newNodes.map(n => ({
        ...n,
        position: { x: n.position.x + offset.x, y: n.position.y + offset.y }
      }));
      const mainNode = shiftedNodes.find(n => n.type === 'anomalyAlerts' || n.type === 'trendStats' || n.type === 'comparisonChart');
      if (mainNode) {
        mainNode.selected = true;
        setActiveTargetNode(mainNode);
        updateUrlWithNode(mainNode.id);
      }
      setNodes(prev => [...prev, ...shiftedNodes]);
      const NAMES = { anomaly: 'Anomaly Detection', trend: 'Trend Analysis', comparison: 'Data Comparison' };
      setWorkspaceName(prev => prev === 'Untitled Workspace' ? NAMES[templateId] : prev);
      setIsAddDataOpen(true);
    } else {
      const mainNode = newNodes.find(n => n.type === 'anomalyAlerts' || n.type === 'trendStats' || n.type === 'comparisonChart');
      if (mainNode) {
        mainNode.selected = true;
        setActiveTargetNode(mainNode);
        updateUrlWithNode(mainNode.id);
      }
      setNodes(newNodes);
      setEdges(newEdges);
      const NAMES = { workflow: 'Process Flow', threshold: 'Threshold Analysis', report: 'Investigation Report' };
      setWorkspaceName(NAMES[templateId] || 'Untitled Workspace');
      setIsAddDataOpen(templateId === 'threshold');
    }
  }, [getId, nodes, setNodes, setEdges, setWorkspaceName, setIsAddDataOpen, setActiveTargetNode, updateUrlWithNode]);

  // ── RCA submit handler ──────────────────────────────────────────────────
  const handleRCASubmit = useCallback(() => {
    const { nodes: newNodes, edges: newEdges } = buildRCALayout({ rcaForm, selectedTemplate: selectedRcaTemplate, getId });
    setNodes(newNodes);
    setEdges(newEdges);
    setWorkspaceName(rcaForm.eventName || (selectedRcaTemplate === '5whys' ? '5 Whys Analysis' : 'RCA Investigation'));
    setShowRCAModal(false);
    setRcaForm(DEFAULT_RCA_FORM);
    setTimeout(centerCanvas, 200);
  }, [rcaForm, selectedRcaTemplate, getId, setNodes, setEdges, setWorkspaceName, setShowRCAModal, setRcaForm, centerCanvas, DEFAULT_RCA_FORM]);

  return { handleTemplateClick, handleRCASubmit };
}
