'use client';
import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import {
  getTemplate,
  buildTemplatePayload,
  parseTemplateGraph,
} from '@/src/services/agent-factory/agentFactoryService';
import {
  useListTemplates,
  useListModels,
  useListTools,
  useGetNodeCatalog,
  useSaveTemplate,
  useDeleteTemplate,
  useDeployTemplate,
} from '../_queries/useAgentFactoryQueries';

const AgentContext = createContext(null);

/** Map a backend /agent-templates list entry into the dashboard card shape. */
function templateToAgent(tpl) {
  const { nodes = [], edges = [] } = parseTemplateGraph(tpl);
  return {
    id: tpl.template_id || tpl.id,
    name: tpl.name || 'Untitled Agent',
    description: tpl.description || '',
    status: tpl.status || (tpl.agent_id ? 'deployed' : 'draft'),
    scope: (tpl.name || 'AGENT').toUpperCase(),
    createdAt: tpl.created_at || tpl.createdAt || '',
    updatedAt: tpl.updated_at || tpl.updatedAt || '',
    agent_id: tpl.agent_id || null,
    nodes,
    edges,
  };
}

const initialState = {
  view: 'dashboard',
  agents: [],
  activeAgent: null,
  deployedAgentId: null,
  nodes: [],
  edges: [],
  selectedNode: null,
  undoStack: [],
  redoStack: [],
  showAivee: false,
  models: [],
  tools: [],
  nodeCatalog: [],
  loading: false,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_AGENTS':
      return { ...state, agents: action.payload };
    case 'REMOVE_AGENT':
      return { ...state, agents: state.agents.filter(a => a.id !== action.payload) };
    case 'SET_CATALOG':
      return { ...state, models: action.payload.models ?? state.models, tools: action.payload.tools ?? state.tools, nodeCatalog: action.payload.nodeCatalog ?? state.nodeCatalog };
    case 'SET_DEPLOYED':
      return {
        ...state,
        deployedAgentId: action.payload.agentId,
        activeAgent: state.activeAgent ? { ...state.activeAgent, status: 'deployed', agent_id: action.payload.agentId } : null,
        agents: state.agents.map(a => a.id === action.payload.templateId ? { ...a, status: 'deployed', agent_id: action.payload.agentId } : a),
      };
    case 'OPEN_AGENT':
      return { ...state, view: 'canvas', activeAgent: action.payload.agent, deployedAgentId: action.payload.agent.agent_id || null, nodes: action.payload.nodes || [], edges: action.payload.edges || [], selectedNode: null, undoStack: [], redoStack: [] };
    case 'CREATE_AGENT':
      return { ...state, agents: [...state.agents, action.payload], view: 'canvas', activeAgent: action.payload, deployedAgentId: null, nodes: [], edges: [], selectedNode: null, undoStack: [], redoStack: [] };
    case 'BACK_TO_DASHBOARD':
      return { ...state, view: 'dashboard', activeAgent: null, selectedNode: null };
    case 'NODES_CHANGE':
      return { ...state, nodes: applyNodeChanges(action.payload, state.nodes) };
    case 'EDGES_CHANGE':
      return { ...state, edges: applyEdgeChanges(action.payload, state.edges) };
    case 'CONNECT': {
      const newEdge = { ...action.payload, animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } };
      return { ...state, edges: addEdge(newEdge, state.edges) };
    }
    case 'ADD_NODE': {
      const newNodes = [...state.nodes, action.payload];
      return { ...state, nodes: newNodes, undoStack: [...state.undoStack, { nodes: state.nodes, edges: state.edges }], redoStack: [] };
    }
    case 'DELETE_NODE': {
      const newNodes = state.nodes.filter(n => n.id !== action.payload);
      const newEdges = state.edges.filter(e => e.source !== action.payload && e.target !== action.payload);
      return { ...state, nodes: newNodes, edges: newEdges, selectedNode: state.selectedNode?.id === action.payload ? null : state.selectedNode, undoStack: [...state.undoStack, { nodes: state.nodes, edges: state.edges }], redoStack: [] };
    }
    case 'UPDATE_NODE_DATA':
      return { ...state, nodes: state.nodes.map(n => n.id === action.payload.id ? { ...n, data: { ...n.data, ...action.payload.data } } : n) };
    case 'SELECT_NODE':
      return { ...state, selectedNode: action.payload };
    case 'UNDO': {
      if (state.undoStack.length === 0) return state;
      const prev = state.undoStack[state.undoStack.length - 1];
      return { ...state, nodes: prev.nodes, edges: prev.edges, undoStack: state.undoStack.slice(0, -1), redoStack: [{ nodes: state.nodes, edges: state.edges }, ...state.redoStack] };
    }
    case 'REDO': {
      if (state.redoStack.length === 0) return state;
      const next = state.redoStack[0];
      return { ...state, nodes: next.nodes, edges: next.edges, undoStack: [...state.undoStack, { nodes: state.nodes, edges: state.edges }], redoStack: state.redoStack.slice(1) };
    }
    case 'OPEN_AIVEE': return { ...state, showAivee: true };
    case 'CLOSE_AIVEE': return { ...state, showAivee: false };
    case 'RENAME_AGENT':
      return {
        ...state,
        activeAgent: state.activeAgent ? { ...state.activeAgent, name: action.payload } : null,
        agents: state.agents.map(a => a.id === state.activeAgent?.id ? { ...a, name: action.payload } : a),
      };
    case 'SAVE_AGENT': {
      const updated = state.agents.map(a => a.id === state.activeAgent?.id ? { ...a, nodes: state.nodes, edges: state.edges, updatedAt: new Date().toISOString().split('T')[0] } : a);
      return { ...state, agents: updated };
    }
    case 'AUTO_LAYOUT': {
      const colMap = { memory: 0, tool: 0, prompt: 0, llm: 1, output: 2 };
      const colCounts = {};
      const newNodes = state.nodes.map(n => {
        const col = colMap[n.type] ?? 0;
        colCounts[col] = (colCounts[col] ?? 0);
        const row = colCounts[col];
        colCounts[col]++;
        return { ...n, position: { x: col * 300 + 60, y: row * 240 + 60 } };
      });
      return { ...state, nodes: newNodes };
    }
    default:
      return state;
  }
}

export function AgentProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // TanStack Query integration for catalog & templates
  const { data: templatesData, isLoading: templatesLoading, isError: templatesError } = useListTemplates();
  const { data: modelsData } = useListModels();
  const { data: toolsData } = useListTools();
  const { data: nodeCatalogData } = useGetNodeCatalog();

  const saveTemplateMutation = useSaveTemplate();
  const deleteTemplateMutation = useDeleteTemplate();
  const deployTemplateMutation = useDeployTemplate();

  // Sync templates query into context state
  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: templatesLoading });
    if (templatesError) {
      dispatch({ type: 'SET_ERROR', payload: 'Could not reach the Agent Factory backend. Check your connection.' });
    } else if (Array.isArray(templatesData)) {
      dispatch({ type: 'SET_AGENTS', payload: templatesData.map(templateToAgent) });
    }
  }, [templatesData, templatesLoading, templatesError]);

  // Sync catalog queries into context state
  useEffect(() => {
    dispatch({
      type: 'SET_CATALOG',
      payload: {
        models: Array.isArray(modelsData) ? modelsData : [],
        tools: Array.isArray(toolsData) ? toolsData : [],
        nodeCatalog: Array.isArray(nodeCatalogData) ? nodeCatalogData : [],
      },
    });
  }, [modelsData, toolsData, nodeCatalogData]);

  // Latest-state ref so async thunks read fresh nodes/edges without re-creating callbacks.
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; });

  const openAivee = useCallback(() => dispatch({ type: 'OPEN_AIVEE' }), []);
  const closeAivee = useCallback(() => dispatch({ type: 'CLOSE_AIVEE' }), []);
  const renameAgent = useCallback((name) => dispatch({ type: 'RENAME_AGENT', payload: name }), []);

  const openAgent = useCallback(async (agent) => {
    dispatch({ type: 'OPEN_AGENT', payload: { agent, nodes: agent.nodes || [], edges: agent.edges || [] } });
    try {
      const tpl = await getTemplate(agent.id);
      const { nodes, edges } = parseTemplateGraph(tpl);
      dispatch({ type: 'OPEN_AGENT', payload: { agent: { ...agent, agent_id: tpl.agent_id || agent.agent_id || null }, nodes, edges } });
    } catch {
      /* keep local graph if fetch fails */
    }
  }, []);

  const createAgent = useCallback((name, description) => {
    const templateId = `agent_${Date.now()}`;
    const today = new Date().toISOString().split('T')[0];
    const agent = { id: templateId, name, description, status: 'draft', scope: name.toUpperCase(), createdAt: today, updatedAt: today, nodes: [], edges: [] };
    dispatch({ type: 'CREATE_AGENT', payload: agent });
    saveTemplateMutation.mutate(buildTemplatePayload({ templateId, name, description, nodes: [], edges: [] }));
  }, [saveTemplateMutation]);

  const backToDashboard = useCallback(() => dispatch({ type: 'BACK_TO_DASHBOARD' }), []);

  const saveAgent = useCallback(async () => {
    const { activeAgent, nodes, edges } = stateRef.current;
    if (!activeAgent) return { ok: false };
    dispatch({ type: 'SAVE_AGENT' });
    try {
      await saveTemplateMutation.mutateAsync(buildTemplatePayload({ templateId: activeAgent.id, name: activeAgent.name, description: activeAgent.description, nodes, edges }));
      return { ok: true };
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: e.message || 'Failed to save template' });
      return { ok: false, error: e };
    }
  }, [saveTemplateMutation]);

  const deleteAgent = useCallback(async (id) => {
    dispatch({ type: 'REMOVE_AGENT', payload: id });
    deleteTemplateMutation.mutate({ id }, {
      onError: (e) => dispatch({ type: 'SET_ERROR', payload: e.message || 'Failed to delete template' }),
    });
  }, [deleteTemplateMutation]);

  const deployAgent = useCallback(async () => {
    const { activeAgent } = stateRef.current;
    if (!activeAgent) return { ok: false };
    await saveAgent();
    try {
      const res = await deployTemplateMutation.mutateAsync({ id: activeAgent.id });
      const agentId = res?.agent_id || res?.agentId || activeAgent.id;
      dispatch({ type: 'SET_DEPLOYED', payload: { agentId, templateId: activeAgent.id } });
      return { ok: true, agentId };
    } catch (e) {
      dispatch({ type: 'SET_ERROR', payload: e.message || 'Failed to deploy agent' });
      return { ok: false, error: e };
    }
  }, [saveAgent, deployTemplateMutation]);

  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), []);
  const autoLayout = useCallback(() => dispatch({ type: 'AUTO_LAYOUT' }), []);
  const selectNode = useCallback((node) => dispatch({ type: 'SELECT_NODE', payload: node }), []);
  const addNode = useCallback((node) => dispatch({ type: 'ADD_NODE', payload: node }), []);
  const deleteNode = useCallback((id) => dispatch({ type: 'DELETE_NODE', payload: id }), []);
  const updateNodeData = useCallback((id, data) => dispatch({ type: 'UPDATE_NODE_DATA', payload: { id, data } }), []);
  const onNodesChange = useCallback((changes) => dispatch({ type: 'NODES_CHANGE', payload: changes }), []);
  const onEdgesChange = useCallback((changes) => dispatch({ type: 'EDGES_CHANGE', payload: changes }), []);
  const onConnect = useCallback((conn) => dispatch({ type: 'CONNECT', payload: conn }), []);

  return (
    <AgentContext.Provider value={{ ...state, openAgent, createAgent, deleteAgent, deployAgent, backToDashboard, saveAgent, undo, redo, autoLayout, selectNode, addNode, deleteNode, updateNodeData, onNodesChange, onEdgesChange, onConnect, openAivee, closeAivee, renameAgent }}>
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  const ctx = useContext(AgentContext);
  if (!ctx) throw new Error('useAgent must be used within AgentProvider');
  return ctx;
}
