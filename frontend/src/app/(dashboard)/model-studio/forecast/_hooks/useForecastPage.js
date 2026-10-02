'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { streamCodeSuggestion } from '@/src/services/model-studio/shared/aiSuggestionService';
import { useToast } from '@/src/components/ui/Toast';
import { useConfirm } from '@/src/components/ui/ConfirmModal';
import { useApp } from '@/src/context/AppContext';
import {
    useForecastOverviewQuery,
    useForecastModelListQuery,
    useForecastAssetListQuery,
    useForecastModelOptionsQuery,
    useForecastPipelineListQuery,
    useForecastExperimentListQuery,
    useForecastAvailableToolsQuery,
    useUploadForecastPipelineMutation,
    useUpdateForecastPipelineMutation,
    useDeleteForecastPipelineMutation,
    useUploadForecastWorkflowMutation,
    useUpdateForecastWorkflowMutation,
    useRunForecastWorkflowMutation,
    useRunForecastPipelineMutation,
} from '../_queries/useForecastQueries';

export const DEFAULT_CODE = `def preprocessing(data):
    # Your code here
    preprocess_data = data
    return preprocess_data`;

export function useForecastPage() {
    const { plantCode } = useApp();
    const { error: toastError } = useToast();
    const { openConfirm } = useConfirm();
    const [activeTab, setActiveTab] = useState('Overview');
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => { setIsMounted(true); }, []);

    // Queries
    const overviewQuery = useForecastOverviewQuery(plantCode);
    const modelListQuery = useForecastModelListQuery(plantCode);
    const assetListQuery = useForecastAssetListQuery(plantCode);
    const modelOptionsQuery = useForecastModelOptionsQuery(plantCode);
    const pipelineListQuery = useForecastPipelineListQuery(plantCode);
    const experimentListQuery = useForecastExperimentListQuery(plantCode);
    const availableToolsQuery = useForecastAvailableToolsQuery(plantCode);

    // Derived states from queries
    const overviewStats = overviewQuery.data?.success && Array.isArray(overviewQuery.data?.data?.kpis) ? overviewQuery.data.data.kpis : null;
    
    const rawModelList = modelListQuery.data;
    const modelsList = rawModelList?.statusCode === 200 && Array.isArray(rawModelList.data) ? rawModelList.data : [];
    const modelsLoading = modelListQuery.isLoading;
    const modelsError = modelListQuery.error ? modelListQuery.error.message : (rawModelList?.error || null);

    const rawAssetList = assetListQuery.data;
    const assetList = rawAssetList?.statusCode === 200 && Array.isArray(rawAssetList.data) ? rawAssetList.data : [];

    const rawModelOptions = modelOptionsQuery.data;
    const modelOptions = rawModelOptions?.statusCode === 200 && Array.isArray(rawModelOptions.data) ? rawModelOptions.data : [];
    const modelOptionsLoading = modelOptionsQuery.isLoading;

    const rawPipelineList = pipelineListQuery.data;
    const pipelinesList = rawPipelineList?.statusCode === 200 && Array.isArray(rawPipelineList.data) ? rawPipelineList.data : [];
    const isPipelinesLoading = pipelineListQuery.isLoading;

    const experimentsList = Array.isArray(experimentListQuery.data) ? experimentListQuery.data : [];
    const isExperimentsLoading = experimentListQuery.isLoading;

    const rawAvailableTools = availableToolsQuery.data;
    const availableTools = rawAvailableTools?.statusCode === 200 && Array.isArray(rawAvailableTools.data) ? rawAvailableTools.data : [];

    // Mutations
    const uploadPipelineMutation = useUploadForecastPipelineMutation();
    const updatePipelineMutation = useUpdateForecastPipelineMutation();
    const deletePipelineMutation = useDeleteForecastPipelineMutation();
    const uploadWorkflowMutation = useUploadForecastWorkflowMutation();
    const updateWorkflowMutation = useUpdateForecastWorkflowMutation();
    const runWorkflowMutation = useRunForecastWorkflowMutation();
    const runPipelineMutation = useRunForecastPipelineMutation();

    const [isPipelineBuilderOpen, setIsPipelineBuilderOpen] = useState(false);
    const [isCodeBuilderOpen, setIsCodeBuilderOpen] = useState(false);
    const [editingPipelineId, setEditingPipelineId] = useState(null);
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [history, setHistory] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    const [pipelineCode, setPipelineCode] = useState(DEFAULT_CODE);
    const [codeBuilderConfig, setCodeBuilderConfig] = useState({ pipelineName: '', description: '', modelId: '', assetIds: [], tagIds: [], startDate: '', endDate: '' });
    const [isCodeBuilderTagDropdownOpen, setIsCodeBuilderTagDropdownOpen] = useState(false);
    const [isCodeBuilderAssetDropdownOpen, setIsCodeBuilderAssetDropdownOpen] = useState(false);
    const [isCodeBuilderTimeDropdownOpen, setIsCodeBuilderTimeDropdownOpen] = useState(false);
    const [tempTimeWindow, setTempTimeWindow] = useState({ start: '', end: '' });
    const [sidebarWidth, setSidebarWidth] = useState(320);
    const [isResizingSidebar, setIsResizingSidebar] = useState(false);
    const [consoleHeight, setConsoleHeight] = useState(250);
    const [isConsoleOpen, setIsConsoleOpen] = useState(false);
    const [isResizingConsole, setIsResizingConsole] = useState(false);
    const [testRunOutput, setTestRunOutput] = useState(null);
    const [isRunSuccessful, setIsRunSuccessful] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const isTestRunning = runWorkflowMutation.isPending || runPipelineMutation.isPending;

    const editorRef = useRef(null);
    const monacoRef = useRef(null);
    const suggestionProviderRef = useRef(null);

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
        if (suggestionProviderRef.current) suggestionProviderRef.current.dispose();
        suggestionProviderRef.current = monaco.languages.registerInlineCompletionsProvider('python', {
            provideInlineCompletions: async (model, position, context, token) => {
                const textUntilPosition = model.getValueInRange({ startLineNumber: 1, startColumn: 1, endLineNumber: position.lineNumber, endColumn: position.column });
                const textAfterPosition = model.getValueInRange({ startLineNumber: position.lineNumber, startColumn: position.column, endLineNumber: model.getLineCount(), endColumn: model.getLineMaxColumn(model.getLineCount()) });
                await new Promise(resolve => setTimeout(resolve, 1000));
                if (token.isCancellationRequested) return { items: [] };
                try {
                    const fullCompletion = await streamCodeSuggestion({ code: textUntilPosition, suffix: textAfterPosition, language: 'python', instruction: '' });
                    if (!fullCompletion) return { items: [] };
                    const word = model.getWordUntilPosition(position);
                    const currentLinePrefix = model.getValueInRange({ startLineNumber: position.lineNumber, startColumn: 1, endLineNumber: position.lineNumber, endColumn: position.column });
                    let insertText = fullCompletion;
                    if (insertText.toLowerCase().startsWith(currentLinePrefix.toLowerCase())) insertText = insertText.slice(currentLinePrefix.length);
                    else if (insertText.toLowerCase().startsWith(word.word.toLowerCase())) insertText = insertText.slice(word.word.length);
                    if (!insertText) return { items: [] };
                    return { items: [{ insertText, range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column) }] };
                } catch { return { items: [] }; }
            },
            freeInlineCompletions: () => {},
        });
    };

    useEffect(() => { return () => { if (suggestionProviderRef.current) suggestionProviderRef.current.dispose(); }; }, []);
    useEffect(() => { setIsRunSuccessful(false); }, [pipelineCode, codeBuilderConfig.tagIds, codeBuilderConfig.startDate, codeBuilderConfig.endDate]);

    useEffect(() => {
        const onMM = (e) => { if (!isResizingSidebar) return; const w = window.innerWidth - e.clientX; if (w > 250 && w < 800) setSidebarWidth(w); };
        const onMU = () => setIsResizingSidebar(false);
        if (isResizingSidebar) { document.addEventListener('mousemove', onMM); document.addEventListener('mouseup', onMU); }
        const onCMM = (e) => { if (!isResizingConsole) return; const h = window.innerHeight - e.clientY; if (h > 100 && h < window.innerHeight * 0.8) setConsoleHeight(h); };
        const onCMU = () => setIsResizingConsole(false);
        if (isResizingConsole) { document.addEventListener('mousemove', onCMM); document.addEventListener('mouseup', onCMU); }
        return () => { document.removeEventListener('mousemove', onMM); document.removeEventListener('mouseup', onMU); document.removeEventListener('mousemove', onCMM); document.removeEventListener('mouseup', onCMU); };
    }, [isResizingSidebar, isResizingConsole]);

    const fetchModelList = useCallback(() => modelListQuery.refetch(), [modelListQuery]);
    const fetchPipelineList = useCallback(() => pipelineListQuery.refetch(), [pipelineListQuery]);
    const fetchExperimentList = useCallback(() => experimentListQuery.refetch(), [experimentListQuery]);

    const pushToHistory = useCallback(() => {
        setHistory(prev => [...prev.slice(-19), { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }]);
        setRedoStack([]);
    }, [nodes, edges]);

    const handleUndo = useCallback(() => {
        if (!history.length) return;
        const prev = history[history.length - 1];
        setRedoStack(s => [...s.slice(-19), { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }]);
        setNodes(prev.nodes); setEdges(prev.edges); setHistory(h => h.slice(0, -1));
    }, [history, nodes, edges]);

    const handleRedo = useCallback(() => {
        if (!redoStack.length) return;
        const next = redoStack[redoStack.length - 1];
        setHistory(h => [...h.slice(-19), { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }]);
        setNodes(next.nodes); setEdges(next.edges); setRedoStack(s => s.slice(0, -1));
    }, [redoStack, nodes, edges]);

    const reconstructFlowchartFromSteps = useCallback((steps, pipelineName, tools) => {
        const generatedNodes = []; const generatedEdges = [];
        steps.forEach((step, index) => {
            const nodeId = `node-${index + 1}`;
            const toolDef = tools.find(t => t.tool === step.tool);
            const label = toolDef ? (toolDef.name || step.tool.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')) : (step.tool ? step.tool.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') : `Step ${index + 1}`);
            generatedNodes.push({ id: nodeId, type: index === 0 || toolDef?.node_type === 'data' || toolDef?.node_type === 'source' ? 'source' : 'transform', x: 80, y: 50 + index * 200, data: { label, desc: toolDef?.desc || '', tool: step.tool, config: step.config || {}, config_schema: toolDef?.config_schema || {} } });
            if (index > 0) generatedEdges.push({ id: `edge-${index}`, fromId: `node-${index}`, toId: nodeId, fromPort: 'right', toPort: 'left' });
        });
        return { nodes: generatedNodes, edges: generatedEdges };
    }, []);

    const handleOpenVisualBuilder = useCallback((pipelineId, nodesArr, edgesArr) => {
        setEditingPipelineId(pipelineId); setNodes(nodesArr); setEdges(edgesArr); setIsPipelineBuilderOpen(true);
    }, []);

    const handleOpenCodeBuilder = useCallback((pipelineId, config, code) => {
        setEditingPipelineId(pipelineId); setCodeBuilderConfig(config || {}); setPipelineCode(code || DEFAULT_CODE); setIsRunSuccessful(false); setIsCodeBuilderOpen(true);
    }, []);

    const handleDeletePipeline = useCallback(async (pipelineId) => {
        const ok = await openConfirm('This pipeline will be permanently deleted.', { title: 'Delete pipeline?', confirmLabel: 'Delete' });
        if (!ok) return;
        try {
            await deletePipelineMutation.mutateAsync({ plantCode, pipelineId });
        } catch (e) { toastError('Delete failed', e.message); }
    }, [deletePipelineMutation, openConfirm, toastError, plantCode]);

    const getOrderedSteps = useCallback(() => {
        const sources = nodes.filter(n => !edges.some(e => e.toId === n.id));
        const ordered = []; const visited = new Set(); const queue = [...sources];
        while (queue.length > 0) {
            const cur = queue.shift(); if (visited.has(cur.id)) continue;
            if (cur.data.tool) ordered.push({ tool: cur.data.tool, config: cur.data.config || {} });
            visited.add(cur.id);
            edges.filter(e => e.fromId === cur.id).forEach(e => { const t = nodes.find(n => n.id === e.toId); if (t) queue.push(t); });
        }
        return ordered;
    }, [nodes, edges]);

    const handleSaveVisualPipeline = async () => {
        const steps = getOrderedSteps();
        if (!steps.length) { toastError('Missing tools', 'Please add at least one tool to the pipeline.'); return; }
        setIsSaving(true);
        try {
            const payload = { pipeline_name: nodes.find(n => n.type === 'source')?.data.label || 'New Forecast Pipeline', description: 'Forecast Pipeline via Visual Builder', type: 'custom', nodes, edges, steps, data: { nodes, edges, steps } };
            const result = editingPipelineId
                ? await updateWorkflowMutation.mutateAsync({ plantCode, pipelineId: editingPipelineId, body: payload })
                : await uploadWorkflowMutation.mutateAsync({ plantCode, body: payload });
            if (result.status === 'success' || result.statusCode === 200) { setIsPipelineBuilderOpen(false); setEditingPipelineId(null); }
            else toastError('Save failed', result.message || 'Unknown error');
        } catch (e) { toastError('Error', e.message); }
        finally { setIsSaving(false); }
    };

    const handleSaveCodePipeline = async () => {
        setIsSaving(true);
        try {
            const payload = { pipeline_name: codeBuilderConfig.pipelineName || 'Untitled Pipeline', description: codeBuilderConfig.description || '', code: pipelineCode || '', tags: codeBuilderConfig.tagIds, start: codeBuilderConfig.startDate, end: codeBuilderConfig.endDate };
            const data = editingPipelineId
                ? await updatePipelineMutation.mutateAsync({ plantCode, pipelineId: editingPipelineId, body: payload })
                : await uploadPipelineMutation.mutateAsync({ plantCode, body: payload });
            if (data.status === 'success' || data.statusCode === 200) { setIsCodeBuilderOpen(false); setEditingPipelineId(null); setPipelineCode(DEFAULT_CODE); }
        } catch {}
        finally { setIsSaving(false); }
    };

    const handleVisualTestRun = async () => {
        if (!nodes.length) { setTestRunOutput('No nodes in pipeline. Add nodes before running.'); setIsConsoleOpen(true); return; }
        setIsConsoleOpen(true); setTestRunOutput('Building workflow from pipeline nodes...\n');
        try {
            const inDegree = {}; const adjList = {};
            nodes.forEach(n => { inDegree[n.id] = 0; adjList[n.id] = []; });
            edges.forEach(e => { adjList[e.fromId]?.push(e.toId); inDegree[e.toId] = (inDegree[e.toId] || 0) + 1; });
            const queue = nodes.filter(n => inDegree[n.id] === 0); const sorted = [];
            while (queue.length > 0) { const cur = queue.shift(); sorted.push(cur); adjList[cur.id].forEach(nextId => { inDegree[nextId]--; if (inDegree[nextId] === 0) { const n = nodes.find(n => n.id === nextId); if (n) queue.push(n); } }); }
            const orderedNodes = sorted.length === nodes.length ? sorted : [...nodes].sort((a, b) => a.y - b.y);
            const fetchNode = orderedNodes.find(n => n.data.tool === 'iot_data_fetch' || n.data.label?.toLowerCase().includes('iot data fetch'));
            const fetchConfig = fetchNode?.data.config || {};
            const globalStart = fetchConfig.start_time ? fetchConfig.start_time.replace('T', ' ') + ':00' : '';
            const globalEnd = fetchConfig.end_time ? fetchConfig.end_time.replace('T', ' ') + ':00' : '';
            if (!globalStart || !globalEnd) { setTestRunOutput(prev => prev + '⚠️ Please set the Time Window on the IoT Data Fetch node before running.\n'); return; }
            const steps = orderedNodes.map(n => { const tool = n.data.tool || 'unknown'; const cfg = { ...(n.data.config || {}) }; if (tool === 'iot_data_fetch') return { tool, config: { tags: cfg.tag_ids || [], start: globalStart, end: globalEnd } }; const { model_id, asset_ids, tag_ids, start_time, end_time, ...rest } = cfg; return { tool, config: rest }; });
            setTestRunOutput(prev => prev + `Sending ${steps.length} step(s) to backend...\n\n`);
            const res = await runWorkflowMutation.mutateAsync({ plantCode, body: { steps, tags: fetchConfig.tag_ids || [], start: globalStart, end: globalEnd } });
            const rawText = await res.text();
            if (!rawText?.trim()) { setTestRunOutput(prev => prev + `❌ Empty response (HTTP ${res.status}).`); setIsRunSuccessful(false); return; }
            let data; try { data = JSON.parse(rawText); } catch { setTestRunOutput(prev => prev + `❌ Non-JSON response:\n${rawText.slice(0, 300)}`); setIsRunSuccessful(false); return; }
            const result = data?.data; const isSuccess = data?.statusCode === 200 && (result?.status === 'success' || result?.steps);
            if (isSuccess && result) {
                let out = `✅ Workflow executed! (${result.total_duration_ms?.toFixed(2)}ms)\n\n`;
                result.steps?.forEach((s, i) => { out += `── Step ${i + 1}: ${s.tool} [${s.status}] (${s.duration_ms}ms)\n`; if (s.after) { out += `   Rows: ${s.after.rows} | Nulls: ${s.after.total_nulls}\n`; } if (s.error) out += `   ❌ Error: ${s.error}\n`; out += '\n'; });
                if (result.output) out += `── Final Output: ${result.output.rows} rows × ${result.output.columns?.length} columns\n`;
                setTestRunOutput(prev => prev + out); setIsRunSuccessful(true);
            } else { setIsRunSuccessful(false); setTestRunOutput(prev => prev + `❌ Run failed (HTTP ${res.status}):\n${data?.message || JSON.stringify(data).slice(0, 300)}`); }
        } catch (e) { setIsRunSuccessful(false); setTestRunOutput(prev => prev + `❌ Error: ${e.message}`); }
    };

    const handleTestRun = async () => {
        setIsConsoleOpen(true); setTestRunOutput('Starting test run...\n');
        try {
            const payload = { code: pipelineCode || '', tags: codeBuilderConfig.tagIds, start: codeBuilderConfig.startDate, end: codeBuilderConfig.endDate };
            const res = await runPipelineMutation.mutateAsync({ plantCode, body: payload });
            const text = await res.text();
            let data; try { data = JSON.parse(text); } catch { throw new Error('Invalid response from server.'); }
            if (res.ok && (data.statusCode === 200 || data.status === 'success')) {
                const result = data.data || data;
                let out = `✅ Test run successful!\n\n`;
                if (result.output) out += `── Output: ${result.output.rows} rows × ${result.output.columns?.length || 0} columns\n   Columns: ${result.output.columns?.join(', ')}\n`;
                setTestRunOutput(prev => prev + out); setIsRunSuccessful(true);
            } else { setTestRunOutput(prev => prev + `❌ Test run failed: ${data.message || 'Unknown error'}`); setIsRunSuccessful(false); }
        } catch (e) { setTestRunOutput(prev => prev + `❌ Error: ${e.message}`); setIsRunSuccessful(false); }
    };

    return {
        activeTab, setActiveTab, isMounted, plantCode,
        modelsList, modelsLoading, modelsError, assetList, modelOptions, modelOptionsLoading,
        pipelinesList, isPipelinesLoading, experimentsList, isExperimentsLoading, overviewStats, availableTools,
        isPipelineBuilderOpen, setIsPipelineBuilderOpen, isCodeBuilderOpen, setIsCodeBuilderOpen,
        editingPipelineId, setEditingPipelineId, nodes, setNodes, edges, setEdges,
        selectedNodeId, setSelectedNodeId, history, redoStack, pipelineCode, setPipelineCode,
        codeBuilderConfig, setCodeBuilderConfig, isCodeBuilderTagDropdownOpen, setIsCodeBuilderTagDropdownOpen,
        isCodeBuilderAssetDropdownOpen, setIsCodeBuilderAssetDropdownOpen, isCodeBuilderTimeDropdownOpen, setIsCodeBuilderTimeDropdownOpen,
        tempTimeWindow, setTempTimeWindow, sidebarWidth, setIsResizingSidebar, consoleHeight,
        isConsoleOpen, setIsConsoleOpen, setIsResizingConsole, testRunOutput, isRunSuccessful, isTestRunning, isSaving,
        fetchModelList, fetchPipelineList, fetchExperimentList,
        pushToHistory, handleUndo, handleRedo, reconstructFlowchartFromSteps,
        handleOpenVisualBuilder, handleOpenCodeBuilder, handleDeletePipeline,
        handleSaveVisualPipeline, handleSaveCodePipeline, handleVisualTestRun, handleTestRun,
        handleEditorDidMount,
    };
}

