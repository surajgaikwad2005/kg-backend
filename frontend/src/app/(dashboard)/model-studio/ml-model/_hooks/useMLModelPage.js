'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { streamCodeSuggestion } from '@/src/services/model-studio/shared/aiSuggestionService';
import {
    runPipeline, runWorkflow,
} from '@/src/services/model-studio/ml-model/pipelineService';
import { useApp } from '@/src/context/AppContext';
import { useToast } from '@/src/components/ui/Toast';
import { useConfirm } from '@/src/components/ui/ConfirmModal';
import {
    useMLModelOverviewQuery,
    useMLModelListQuery,
    useMLModelOptionsQuery,
    useMLAssetListQuery,
    useMLPipelineListQuery,
    useMLAvailableToolsQuery,
    useMLExperimentListQuery,
    useMLArtifactListQuery,
    useUploadMLPipelineMutation,
    useUpdateMLPipelineMutation,
    useDeleteMLPipelineMutation,
} from '../_queries/useMLModelQueries';

export const DEFAULT_CODE = `def preprocessing(data):
    # Your code here
    preprocess_data = data
    return preprocess_data`;

export function useMLModelPage() {
    const { error: toastError } = useToast();
    const { openConfirm } = useConfirm();
    const { plantCode } = useApp();

    /* ── Tab ── */
    const [activeTab, setActiveTab] = useState('Overview');
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => { setIsMounted(true); }, []);

    /* ── TanStack Queries ── */
    const overviewQuery = useMLModelOverviewQuery(plantCode);
    const modelsQuery = useMLModelListQuery(plantCode);
    const modelOptionsQuery = useMLModelOptionsQuery(plantCode);
    const assetListQuery = useMLAssetListQuery(plantCode);
    const pipelinesQuery = useMLPipelineListQuery(plantCode);
    const experimentsQuery = useMLExperimentListQuery(plantCode);
    const artifactsQuery = useMLArtifactListQuery(plantCode);
    const availableToolsQuery = useMLAvailableToolsQuery(plantCode);

    /* ── Derived data states ── */
    const overviewStats = overviewQuery.data ?? null;

    const rawModelsList = modelsQuery.data;
    const modelsList = Array.isArray(rawModelsList) ? rawModelsList : [];
    const modelsLoading = modelsQuery.isLoading;
    const modelsError = modelsQuery.error ? modelsQuery.error.message : null;

    const rawAssetList = assetListQuery.data;
    const assetList = Array.isArray(rawAssetList) ? rawAssetList : [];

    const rawModelOptions = modelOptionsQuery.data;
    const modelOptions = Array.isArray(rawModelOptions) ? rawModelOptions : [];
    const modelOptionsLoading = modelOptionsQuery.isLoading;

    const rawPipelinesList = pipelinesQuery.data;
    const pipelinesList = Array.isArray(rawPipelinesList) ? rawPipelinesList : [];
    const isPipelinesLoading = pipelinesQuery.isLoading;

    const rawExperimentsList = experimentsQuery.data;
    const experimentsList = Array.isArray(rawExperimentsList) ? rawExperimentsList : [];
    const isExperimentsLoading = experimentsQuery.isLoading;

    const rawArtifactsList = artifactsQuery.data;
    const artifactsList = Array.isArray(rawArtifactsList) ? rawArtifactsList : [];
    const artifactsLoading = artifactsQuery.isLoading;
    const artifactsError = artifactsQuery.error ? artifactsQuery.error.message : null;

    const rawAvailableTools = availableToolsQuery.data;
    const availableTools = Array.isArray(rawAvailableTools) ? rawAvailableTools : [];

    /* ── Mutations ── */
    const uploadPipelineMutation = useUploadMLPipelineMutation();
    const updatePipelineMutation = useUpdateMLPipelineMutation();
    const deletePipelineMutation = useDeleteMLPipelineMutation();

    /* ── Pipeline builder state ── */
    const [isPipelineBuilderOpen,          setIsPipelineBuilderOpen]          = useState(false);
    const [isCodeBuilderOpen,              setIsCodeBuilderOpen]              = useState(false);
    const [editingPipelineId,              setEditingPipelineId]              = useState(null);
    const [nodes,                          setNodes]                          = useState([]);
    const [edges,                          setEdges]                          = useState([]);
    const [selectedNodeId,                 setSelectedNodeId]                 = useState(null);
    const [history,                        setHistory]                        = useState([]);
    const [redoStack,                      setRedoStack]                      = useState([]);
    const [pipelineCode,                   setPipelineCode]                   = useState(DEFAULT_CODE);
    const [codeBuilderConfig,              setCodeBuilderConfig]              = useState({
        pipelineName: '', description: '', modelId: '', assetIds: [], tagIds: [], startDate: '', endDate: '',
    });
    const [isCodeBuilderTagDropdownOpen,   setIsCodeBuilderTagDropdownOpen]   = useState(false);
    const [isCodeBuilderAssetDropdownOpen, setIsCodeBuilderAssetDropdownOpen] = useState(false);
    const [isCodeBuilderTimeDropdownOpen,  setIsCodeBuilderTimeDropdownOpen]  = useState(false);
    const [tempTimeWindow,                 setTempTimeWindow]                 = useState({ start: '', end: '' });
    const [sidebarWidth,                   setSidebarWidth]                   = useState(320);
    const [isResizingSidebar,              setIsResizingSidebar]              = useState(false);
    const [consoleHeight,                  setConsoleHeight]                  = useState(250);
    const [isConsoleOpen,                  setIsConsoleOpen]                  = useState(false);
    const [isResizingConsole,              setIsResizingConsole]              = useState(false);
    const [testRunOutput,                  setTestRunOutput]                  = useState(null);
    const [isRunSuccessful,                setIsRunSuccessful]                = useState(false);
    const [isTestRunning,                  setIsTestRunning]                  = useState(false);
    const [isSaving,                       setIsSaving]                       = useState(false);

    /* ── Monaco AI suggestions ── */
    const editorRef             = useRef(null);
    const monacoRef             = useRef(null);
    const suggestionProviderRef = useRef(null);

    const handleEditorDidMount = useCallback((editor, monaco) => {
        editorRef.current  = editor;
        monacoRef.current  = monaco;
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
    }, []);

    useEffect(() => {
        return () => { if (suggestionProviderRef.current) suggestionProviderRef.current.dispose(); };
    }, []);

    useEffect(() => { setIsRunSuccessful(false); }, [pipelineCode, codeBuilderConfig.tagIds, codeBuilderConfig.startDate, codeBuilderConfig.endDate]);

    /* Sidebar / console resize listeners */
    useEffect(() => {
        const onMM = (e) => { if (!isResizingSidebar) return; const w = window.innerWidth - e.clientX; if (w > 250 && w < 800) setSidebarWidth(w); };
        const onMU = () => setIsResizingSidebar(false);
        if (isResizingSidebar) { document.addEventListener('mousemove', onMM); document.addEventListener('mouseup', onMU); }
        const onCMM = (e) => { if (!isResizingConsole) return; const h = window.innerHeight - e.clientY; if (h > 100 && h < window.innerHeight * 0.8) setConsoleHeight(h); };
        const onCMU = () => setIsResizingConsole(false);
        if (isResizingConsole) { document.addEventListener('mousemove', onCMM); document.addEventListener('mouseup', onCMU); }
        return () => {
            document.removeEventListener('mousemove', onMM); document.removeEventListener('mouseup', onMU);
            document.removeEventListener('mousemove', onCMM); document.removeEventListener('mouseup', onCMU);
        };
    }, [isResizingSidebar, isResizingConsole]);

    /* ─── Data fetchers ───────────────────────────────────────────── */
    const fetchModelList = useCallback(() => modelsQuery.refetch(), [modelsQuery]);
    const fetchPipelineList = useCallback(() => pipelinesQuery.refetch(), [pipelinesQuery]);
    const fetchExperimentList = useCallback(() => experimentsQuery.refetch(), [experimentsQuery]);
    const fetchArtifactList = useCallback(() => artifactsQuery.refetch(), [artifactsQuery]);

    /* ─── Pipeline builder helpers ───────────────────────────── */
    const pushToHistory = useCallback(() => {
        setHistory(prev => [...prev.slice(-19), { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }]);
        setRedoStack([]);
    }, [nodes, edges]);

    const handleUndo = useCallback(() => {
        if (!history.length) return;
        const prev = history[history.length - 1];
        setRedoStack(s => [...s.slice(-19), { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }]);
        setNodes(prev.nodes); setEdges(prev.edges);
        setHistory(h => h.slice(0, -1));
    }, [history, nodes, edges]);

    const handleRedo = useCallback(() => {
        if (!redoStack.length) return;
        const next = redoStack[redoStack.length - 1];
        setHistory(h => [...h.slice(-19), { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }]);
        setNodes(next.nodes); setEdges(next.edges);
        setRedoStack(s => s.slice(0, -1));
    }, [redoStack, nodes, edges]);

    const reconstructFlowchartFromSteps = useCallback((steps, pipelineName, tools) => {
        const generatedNodes = [];
        const generatedEdges = [];
        steps.forEach((step, index) => {
            const nodeId  = `node-${index + 1}`;
            const toolDef = tools.find(t => t.id === step.tool);
            const label   = toolDef ? toolDef.name : step.tool
                ? step.tool.split('_').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
                : `Step ${index + 1}`;
            generatedNodes.push({
                id: nodeId, type: index === 0 || toolDef?.type === 'source' ? 'source' : 'transform',
                x: 250, y: 50 + index * 200,
                data: { label, desc: toolDef?.desc || `Auto-generated step for ${step.tool}`, tool: step.tool, config: step.config || {}, config_schema: toolDef?.config_schema || {} },
            });
            if (index > 0) generatedEdges.push({ id: `edge-${index}`, fromId: `node-${index}`, toId: nodeId, fromPort: 'right', toPort: 'left' });
        });
        return { nodes: generatedNodes, edges: generatedEdges };
    }, []);

    const handleOpenVisualBuilder = useCallback((pipelineId, nodesArr, edgesArr) => {
        setEditingPipelineId(pipelineId); setNodes(nodesArr); setEdges(edgesArr); setIsPipelineBuilderOpen(true);
    }, []);

    const handleOpenCodeBuilder = useCallback((pipelineId, config, code) => {
        setEditingPipelineId(pipelineId); setCodeBuilderConfig(config); setPipelineCode(code || DEFAULT_CODE);
        setIsRunSuccessful(false); setIsCodeBuilderOpen(true);
    }, []);

    const handleDeletePipeline = useCallback(async (pipelineId) => {
        const ok = await openConfirm('This pipeline will be permanently deleted.', { title: 'Delete pipeline?', confirmLabel: 'Delete' });
        if (!ok) return;
        try {
            await deletePipelineMutation.mutateAsync({ plantCode, pipelineId });
        } catch (e) { toastError('Delete failed', e.message); }
    }, [plantCode, deletePipelineMutation, openConfirm, toastError]);

    const getOrderedSteps = useCallback(() => {
        const sources = nodes.filter(n => !edges.some(e => e.toId === n.id));
        const ordered = []; const visited = new Set();
        const queue   = [...sources];
        while (queue.length > 0) {
            const current = queue.shift();
            if (visited.has(current.id)) continue;
            if (current.data.tool) ordered.push({ tool: current.data.tool, config: current.data.config || {} });
            visited.add(current.id);
            edges.filter(e => e.fromId === current.id).forEach(e => { const t = nodes.find(n => n.id === e.toId); if (t) queue.push(t); });
        }
        return ordered;
    }, [nodes, edges]);

    const handleSaveVisualPipeline = useCallback(async () => {
        const steps = getOrderedSteps();
        if (!steps.length) { toastError('Missing tools', 'Please add at least one tool to the pipeline.'); return; }
        setIsSaving(true);
        try {
            const payload = { pipeline_name: nodes.find(n => n.type === 'source')?.data.label || 'New Pipeline', description: 'Custom ML Pipeline created via Builder', type: 'custom', nodes, edges, steps, data: { nodes, edges, steps } };
            if (editingPipelineId) await updatePipelineMutation.mutateAsync({ plantCode, pipelineId: editingPipelineId, body: payload });
            else await uploadPipelineMutation.mutateAsync({ plantCode, body: payload });
            setIsPipelineBuilderOpen(false); setEditingPipelineId(null);
        } catch (error) { toastError('Save failed', error.message); }
        finally { setIsSaving(false); }
    }, [plantCode, getOrderedSteps, nodes, edges, editingPipelineId, updatePipelineMutation, uploadPipelineMutation, toastError]);

    const handleSaveCodePipeline = useCallback(async () => {
        setIsSaving(true);
        try {
            const payload = { pipeline_name: codeBuilderConfig.pipelineName || 'Untitled Pipeline', description: codeBuilderConfig.description || '', code: pipelineCode || '', tags: codeBuilderConfig.tagIds, start: codeBuilderConfig.startDate, end: codeBuilderConfig.endDate };
            if (editingPipelineId) await updatePipelineMutation.mutateAsync({ plantCode, pipelineId: editingPipelineId, body: payload });
            else await uploadPipelineMutation.mutateAsync({ plantCode, body: payload });
            setIsCodeBuilderOpen(false); setEditingPipelineId(null); setPipelineCode(DEFAULT_CODE);
        } catch {}
        finally { setIsSaving(false); }
    }, [plantCode, codeBuilderConfig, pipelineCode, editingPipelineId, updatePipelineMutation, uploadPipelineMutation]);

    const handleVisualTestRun = useCallback(async () => {
        if (!nodes.length) { setTestRunOutput('No nodes in pipeline. Add nodes before running.'); setIsConsoleOpen(true); return; }
        setIsTestRunning(true); setIsConsoleOpen(true); setTestRunOutput('Building workflow from pipeline nodes...\n');
        try {
            const inDegree = {}; const adjList = {};
            nodes.forEach(n => { inDegree[n.id] = 0; adjList[n.id] = []; });
            edges.forEach(e => { adjList[e.fromId]?.push(e.toId); inDegree[e.toId] = (inDegree[e.toId] || 0) + 1; });
            const queue  = nodes.filter(n => inDegree[n.id] === 0);
            const sorted = [];
            while (queue.length > 0) {
                const cur = queue.shift(); sorted.push(cur);
                adjList[cur.id].forEach(nextId => { inDegree[nextId]--; if (inDegree[nextId] === 0) { const n = nodes.find(n => n.id === nextId); if (n) queue.push(n); } });
            }
            const orderedNodes = sorted.length === nodes.length ? sorted : [...nodes].sort((a, b) => a.y - b.y);
            const fetchNode   = orderedNodes.find(n => n.data.tool === 'iot_data_fetch' || n.data.label?.toLowerCase().includes('iot data fetch'));
            const fetchConfig = fetchNode?.data.config || {};
            const globalStart = fetchConfig.start_time ? fetchConfig.start_time.replace('T', ' ') + ':00' : '';
            const globalEnd   = fetchConfig.end_time   ? fetchConfig.end_time.replace('T', ' ')   + ':00' : '';
            if (!globalStart || !globalEnd) { setTestRunOutput(prev => prev + '⚠️ Please set the Time Window on the IoT Data Fetch node before running.\n'); setIsTestRunning(false); return; }
            const steps = orderedNodes.map(n => {
                const tool = n.data.tool || n.data.label?.toLowerCase().replace(/\s+/g, '_') || 'unknown';
                const cfg  = { ...(n.data.config || {}) };
                if (tool === 'iot_data_fetch') return { tool, config: { tags: cfg.tag_ids || [], start: globalStart, end: globalEnd } };
                const { model_id, asset_ids, tag_ids, start_time, end_time, asset, tags, ...rest } = cfg;
                return { tool, config: rest };
            });
            setTestRunOutput(prev => prev + `Sending ${steps.length} step(s) to backend...\n\n`);
            const data      = await runWorkflow(plantCode, { steps, tags: fetchConfig.tag_ids || [], start: globalStart, end: globalEnd });
            const result    = data?.data;
            const isSuccess = data?.success && (result?.status === 'success' || result?.steps);
            if (isSuccess && result) {
                setIsRunSuccessful(true);
                let out = `✅ Workflow executed successfully! (${result.total_duration_ms?.toFixed(2)}ms total)\n\n`;
                result.steps?.forEach((step, i) => {
                    out += `── Step ${i + 1}: ${step.tool} [${step.status}] (${step.duration_ms}ms)\n`;
                    if (step.metadata) { out += `   Rows: ${step.metadata.rows}  |  Nulls: ${step.metadata.total_nulls}\n`; Object.entries(step.metadata.column_stats || {}).forEach(([col, stats]) => { out += `   ${col}: min=${stats.min} max=${stats.max} mean=${stats.mean?.toFixed(4)}\n`; }); }
                    if (step.error) out += `   ❌ Error: ${step.error}\n`;
                    out += '\n';
                });
                if (result.output) out += `── Final Output: ${result.output.rows} rows × ${result.output.columns?.length} columns\n   Columns: ${result.output.columns?.join(', ')}\n`;
                setTestRunOutput(prev => prev + out);
            } else {
                setIsRunSuccessful(false);
                setTestRunOutput(prev => prev + `❌ Run failed:\n${data?.message || data?.error || JSON.stringify(data).slice(0, 400)}`);
            }
        } catch (e) { setIsRunSuccessful(false); setTestRunOutput(prev => prev + `❌ Error: ${e.message}`); }
        finally { setIsTestRunning(false); }
    }, [plantCode, nodes, edges]);

    const handleTestRun = useCallback(async () => {
        setIsTestRunning(true); setIsConsoleOpen(true); setTestRunOutput('Starting test run...\n');
        try {
            const payload = { code: pipelineCode || '', tags: codeBuilderConfig.tagIds, start: codeBuilderConfig.startDate, end: codeBuilderConfig.endDate };
            const data = await runPipeline(plantCode, payload);
            if (data.success) {
                const result = data.data || data;
                let out = `✅ Test run successful! (${result.total_duration_ms || ''}ms)\n\n`;
                if (result.input)  out += `── Input Data:\n   Rows: ${result.input.rows} | Columns: ${result.input.columns} | Nulls: ${result.input.total_nulls}\n\n`;
                if (result.diff)   out += `── Diff:\n   ${result.diff.rows_removed} rows removed, ${result.diff.nulls_removed} nulls removed\n\n`;
                if (result.output) { out += `── Final Output:\n   Rows: ${result.output.rows} | Columns: ${result.output.columns?.length || 0}\n`; if (result.output.columns) out += `   Schema: ${result.output.columns.join(', ')}\n`; }
                setTestRunOutput(prev => prev + out); setIsRunSuccessful(true);
            } else {
                setTestRunOutput(prev => prev + `❌ Test run failed: ${data.message || data.error || 'Unknown error'}`); setIsRunSuccessful(false);
            }
        } catch (e) { setTestRunOutput(prev => prev + `❌ Error during test run: ${e.message}`); setIsRunSuccessful(false); }
        finally { setIsTestRunning(false); }
    }, [plantCode, pipelineCode, codeBuilderConfig]);

    return {
        /* tab */
        activeTab, setActiveTab, isMounted,
        /* API data */
        modelsList, modelsLoading, modelsError,
        assetList, modelOptions, modelOptionsLoading,
        pipelinesList, isPipelinesLoading,
        experimentsList, isExperimentsLoading,
        artifactsList, artifactsLoading, artifactsError,
        overviewStats, availableTools,
        fetchModelList, fetchPipelineList, fetchExperimentList, fetchArtifactList,
        /* builder open state */
        isPipelineBuilderOpen, setIsPipelineBuilderOpen,
        isCodeBuilderOpen, setIsCodeBuilderOpen,
        editingPipelineId, setEditingPipelineId,
        /* visual builder */
        nodes, setNodes, edges, setEdges, selectedNodeId, setSelectedNodeId,
        history, redoStack, pushToHistory, handleUndo, handleRedo,
        reconstructFlowchartFromSteps,
        handleOpenVisualBuilder, handleOpenCodeBuilder, handleDeletePipeline,
        handleSaveVisualPipeline, handleVisualTestRun,
        /* code builder */
        pipelineCode, setPipelineCode,
        codeBuilderConfig, setCodeBuilderConfig,
        isCodeBuilderTagDropdownOpen,   setIsCodeBuilderTagDropdownOpen,
        isCodeBuilderAssetDropdownOpen, setIsCodeBuilderAssetDropdownOpen,
        isCodeBuilderTimeDropdownOpen,  setIsCodeBuilderTimeDropdownOpen,
        tempTimeWindow, setTempTimeWindow,
        handleEditorDidMount, handleSaveCodePipeline, handleTestRun,
        /* shared builder UI */
        sidebarWidth, setIsResizingSidebar, isResizingSidebar,
        consoleHeight, setIsResizingConsole, isResizingConsole,
        isConsoleOpen, setIsConsoleOpen,
        testRunOutput, setTestRunOutput,
        isRunSuccessful, isTestRunning, isSaving,
    };
}

