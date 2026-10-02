import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/src/components/ui/Toast';
import { useConfirm } from '@/src/components/ui/ConfirmModal';
import { useWorkflowData } from '@/src/context/workflow-management/WorkflowContext';
import { useApp } from '@/src/context/AppContext';
import { queryKeys } from '@/src/lib/query';
import {
    generateEquipment,
    savePnidDiagram,
    getPnidComponent,
    generatePnidDetailedEquipmentSummaryRaw,
    getPnidDetailedEquipmentSummaryPreview,
} from '@/src/services/cpcp/diagram/diagramService';
import {
    usePnidDiagrams,
    useSummaryStatus,
} from '../_queries/useCpcpConfigQueries';
import {
    useDeleteDiagram,
    usePinDiagram,
    useGenerateFile,
} from '../_queries/useCpcpConfigMutations';
import { useGenerateJobPolling } from '../_queries/useGenerateJobPolling';

/** POST /generate and the batch job report per-component results under one of these keys. */
const readGeneratedList = (data) =>
  (Array.isArray(data?.results) && data.results)
  || (Array.isArray(data?.successes) && data.successes)
  || (Array.isArray(data?.items) && data.items)
  || [];

export function useSidebarState({ onLoad, isSaving }) {
  const {
    catalog, addAiComponent, clearAiComponents, pnidComponents, pnidLoading,
    refreshSidebarData,
  } = useWorkflowData();
  const { plantCode } = useApp();
  const queryClient = useQueryClient();

  // ── UI state (client-only, not server data) ─────────────────────────────
  const [aiInput, setAiInput] = useState("");
  const [aiDesc, setAiDesc] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("palette");
  const [provider, setProvider] = useState("claude");
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [jobProgress, setJobProgress] = useState(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [paletteSearch, setPaletteSearch] = useState("");

  // Batch job ID for the poller — null means no active poll.
  const [batchJobId, setBatchJobId] = useState(null);

  const { success: successToast, error: errorToast } = useToast();
  const { openConfirm } = useConfirm();

  // ── TanStack Query: diagram list (replaces fetchSidebarData) ────────────
  const diagramsQuery = usePnidDiagrams();
  const savedDiagrams = useMemo(() => {
    const raw = diagramsQuery.data;
    return Array.isArray(raw) ? raw : raw?.diagrams || [];
  }, [diagramsQuery.data]);
  const loadingDiagrams = diagramsQuery.isLoading;

  // Auto-load the dashboard-pinned diagram on first successful fetch.
  const hasAutoLoaded = useRef(false);
  useEffect(() => {
    if (!hasAutoLoaded.current && savedDiagrams.length > 0) {
      const live = savedDiagrams.find((d) => d.is_dashboard && d.id);
      if (live) {
        hasAutoLoaded.current = true;
        if (onLoad) onLoad(live.id);
      }
    }
  }, [savedDiagrams, onLoad]);

  // Refresh diagram list after a save finishes (true→false transition).
  const prevIsSaving = useRef(isSaving);
  useEffect(() => {
    if (prevIsSaving.current && !isSaving) {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.cpcpConfig.diagrams(plantCode),
      });
    }
    prevIsSaving.current = isSaving;
  }, [isSaving, plantCode, queryClient]);

  // ── TanStack Query: summary status (replaces fetchSummaryStatus) ────────
  const summaryStatusQuery = useSummaryStatus();
  const summaryStatus = summaryStatusQuery.data ?? null;
  const loadingSummaryStatus = summaryStatusQuery.isLoading;

  // ── TanStack Mutations: delete + pin ────────────────────────────────────
  const deleteDiagramMutation = useDeleteDiagram();
  const pinDiagramMutation = usePinDiagram();
  const generateFileMutation = useGenerateFile();

  // ── TanStack Query: batch job polling (replaces setInterval) ────────────
  const jobPolling = useGenerateJobPolling(batchJobId, {
    enabled: isBatchProcessing && !!batchJobId,
  });

  // React to polling data changes.
  useEffect(() => {
    const pollData = jobPolling.data;
    if (!pollData || !batchJobId) return;

    setJobProgress({
      status: pollData.status,
      total_rows: pollData.total_rows || 1,
      processed: pollData.processed || 0,
      success_count: pollData.success_count || 0,
      failure_count: pollData.failure_count || 0,
    });

    if (pollData.error) {
      errorToast("Error", `Error polling job: ${pollData.error}`);
      setIsBatchProcessing(false);
      setBatchJobId(null);
      return;
    }

    const status = pollData.status?.toLowerCase?.() ?? '';
    if (status === 'completed' || status === 'failed') {
      const results = readGeneratedList(pollData);
      results.forEach((item) => {
        if (item.equipment && item.code) addAiComponent(item.equipment, item.code, item.description || "");
      });
      refreshSidebarData();
      void queryClient.invalidateQueries({
        queryKey: queryKeys.cpcpConfig.components(plantCode),
      });
      successToast("Job Complete", `${pollData.success_count || 0} success, ${pollData.failure_count || 0} failed.`);
      setIsFileModalOpen(false);
      setIsBatchProcessing(false);
      setJobProgress(null);
      setActiveTab("palette");
      setBatchJobId(null);
    }
  }, [jobPolling.data, batchJobId, addAiComponent, refreshSidebarData, plantCode, queryClient, successToast, errorToast]);

  // ── Refresh helper ──────────────────────────────────────────────────────
  const refreshAll = useCallback(() => {
    refreshSidebarData();
    void queryClient.invalidateQueries({
      queryKey: queryKeys.cpcpConfig.diagrams(plantCode),
    });
  }, [refreshSidebarData, plantCode, queryClient]);

  // ── Handlers (logic preserved exactly) ──────────────────────────────────

  const handleGenerateSummary = async () => {
    if (!plantCode) return;
    setIsGeneratingSummary(true);
    try {
      const res = await generatePnidDetailedEquipmentSummaryRaw(plantCode, { items: [], provider });
      const text = await res.text();
      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
      const lastLine = lines[lines.length - 1];

      let result = { message: "Failed to process response" };
      try {
        if (lastLine) result = JSON.parse(lastLine);
      } catch {}

      // The stream's tail line is the standard {success, message, data} envelope
      // (unwrap() can't apply to a raw stream); `status` is tolerated in case an
      // older build streams the bare payload instead.
      if (res.ok && (result?.success === true || result?.status === "success")) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.cpcpConfig.summaryStatus(plantCode),
        });
        successToast("Success", "Detailed equipment summary generated!");
      } else {
        errorToast("Error", `Failed to generate summary: ${result.message || "Unknown error"}`);
      }
    } catch {
      errorToast("Error", "Failed to generate detailed equipment summary.");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleOpenPreview = async () => {
    if (!plantCode) return;
    setShowPreviewModal(true);
    setIsPreviewLoading(true);
    try {
      const data = await getPnidDetailedEquipmentSummaryPreview(plantCode, 1);
      setPreviewData(Array.isArray(data) ? data : []);
    } catch {
      errorToast("Error", "Failed to load preview data.");
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!aiInput.trim() || !plantCode) return;
    setIsGenerating(true);
    setGeneratedCode("");
    try {
      // model_name is optional in the EquipmentBatchRequest schema — the previous
      // literal "string" placeholder was sent verbatim to the backend.
      const data = await generateEquipment(plantCode, {
        items: [{ equipment: aiInput, equipment_desc: aiDesc || `A standard ${aiInput} used in refinery operations.` }],
        provider,
      });

      const first = readGeneratedList(data)[0] || {};
      let returnedCode = data?.code || first.code;
      let returnedDesc = data?.description || first.description;

      // POST /generate reports {equipment, status, file} per item and stores the
      // drawing server-side, so when no code comes back inline, read it from
      // GET /component/{name} instead of leaving the preview blank.
      const generatedName = first.equipment || data?.equipment || aiInput;
      if (!returnedCode && generatedName) {
        try {
          const component = await getPnidComponent(plantCode, generatedName);
          returnedCode = component?.code;
          returnedDesc = returnedDesc || component?.description;
        } catch {
          // falls through to the error branch below
        }
      }

      if (returnedCode) {
        setGeneratedCode(returnedCode);
        if (returnedDesc && !aiDesc) setAiDesc(returnedDesc);
        // The component now exists on the backend — pull it into the palette.
        refreshSidebarData();
      } else if (data?.error) {
        errorToast("Error", data.error);
      } else {
        errorToast("Error", "Component generated but no drawing was returned.");
      }
    } catch {
      errorToast("Error", "Failed to generate component. Make sure the Python backend is running.");
    } finally {
      setIsGenerating(false);
    }
  };

  const onSaveDiagramLocal = async (name, nodes, edges) => {
    try {
      return await savePnidDiagram(plantCode, { name, nodes, edges });
    } catch {
      return null;
    }
  };

  const handleBatchGenerate = async (file, col1, col2, col3, mode, connections, sheetName) => {
    if (!plantCode) {
      errorToast("Error", "Select a plant to continue.");
      return;
    }
    if (mode === "connections") {
      if (!connections || connections.length === 0) {
        errorToast("Error", "No connections to process.");
        return;
      }
      setIsBatchProcessing(true);
      try {
        const uniqueNodeNames = Array.from(new Set(connections.flatMap((c) => [c.from, c.to].filter(Boolean))));

        const outgoing = {};
        const incoming = {};
        uniqueNodeNames.forEach((name) => {
          outgoing[name] = [];
          incoming[name] = [];
        });
        connections.forEach((c) => {
          if (c.from && c.to) {
            outgoing[c.from].push(c.to);
            incoming[c.to].push(c.from);
          }
        });

        const sourceNodes = uniqueNodeNames.filter((name) => incoming[name].length === 0);
        if (sourceNodes.length === 0 && uniqueNodeNames.length > 0) sourceNodes.push(uniqueNodeNames[0]);

        const layerMap = {};
        const bfs = (startNodes, initialLayer = 0) => {
          const queue = [...startNodes];
          startNodes.forEach((node) => {
            if (layerMap[node] === undefined) layerMap[node] = initialLayer;
          });
          while (queue.length > 0) {
            const curr = queue.shift();
            const currLayer = layerMap[curr] || 0;
            (outgoing[curr] || []).forEach((neighbor) => {
              const nextLayer = currLayer + 1;
              if (layerMap[neighbor] === undefined) {
                layerMap[neighbor] = nextLayer;
                queue.push(neighbor);
              }
            });
          }
        };

        bfs(sourceNodes, 0);
        uniqueNodeNames.forEach((node) => {
          if (layerMap[node] === undefined) bfs([node], 0);
        });

        const layers = {};
        uniqueNodeNames.forEach((name) => {
          const layer = layerMap[name] || 0;
          if (!layers[layer]) layers[layer] = [];
          layers[layer].push(name);
        });

        const getComponentType = (name) => {
          const n = name.trim();
          const nNormalized = n.toLowerCase().replace(/^pnid_?|^ai_?/, "").replace(/[^a-z0-9]/g, "");
          const catalogKeys = Object.keys(catalog);
          for (const key of catalogKeys) {
            const catNorm = key.toLowerCase().replace(/^pnid_?|^ai_?/, "").replace(/[^a-z0-9]/g, "");
            const catLabel = (catalog[key].label || "").toLowerCase().replace(/[^a-z0-9]/g, "");
            if (catNorm === nNormalized || catLabel === nNormalized) return key;
          }
          const nLower = n.toLowerCase();
          if (nLower.includes("scrubber") || nLower.includes("drum")) return "suction_scrubber";
          if (nLower.includes("compressor") || nLower.includes("comp")) return "two_stage_compressor";
          if (nLower.includes("cooler") || nLower.includes("heatx") || nLower.includes("exchanger")) return "cooler";
          if (nLower.includes("valve") || nLower.includes("vlv")) return "check_valve";
          if (nLower.includes("wellhead")) return "wellhead";
          if (nLower.includes("manifold")) return "well_manifold";
          if (nLower.includes("separator")) return "lp_separator";
          if (nLower.includes("coalescer")) return "coalescer";
          if (nLower.includes("pipeline") || nLower.includes("pipe") || nLower.includes("line")) return "export_pipeline";
          if (/\d+(?:\/\d+)?\s*\"/.test(n) || n.includes('"-') || nLower.includes("cs-") || nLower.includes("ss-")) return "export_pipeline";
          if (/^(?:xv|lv|pv|tv|hv|fv|sdv|bdv|esv|hcv)\-?\d+/i.test(n)) return "check_valve";
          if (/^(?:v|d|t|tk|c)\-?\d+/i.test(n)) return "suction_scrubber";
          if (/^(?:k)\-?\d+/i.test(n)) return "two_stage_compressor";
          if (/^(?:e|he|ac)\-?\d+/i.test(n)) return "cooler";
          if (/^(?:p)\-?\d+/i.test(n)) return "coalescer";
          return "cooler";
        };

        const X_SPACING = 350;
        const Y_SPACING = 250;
        const rfNodes = uniqueNodeNames.map((name) => {
          const layer = layerMap[name] || 0;
          const layerNodes = layers[layer] || [];
          const idx = layerNodes.indexOf(name);
          const totalInLayer = layerNodes.length;
          const offset = -((totalInLayer - 1) * Y_SPACING) / 2;
          return {
            id: `node-${name.replace(/[^a-zA-Z0-9_\-]/g, "_")}-${Math.random().toString(36).substr(2, 5)}`,
            type: "industrial",
            position: { x: layer * X_SPACING + 100, y: idx * Y_SPACING + offset + 250 },
            data: { label: name, componentType: getComponentType(name), status: "normal", isConnecting: false },
          };
        });

        const nameToId = {};
        rfNodes.forEach((node) => { nameToId[node.data.label] = node.id; });

        const rfEdges = connections
          .map((c, i) => ({
            id: `pipe-gen-${i}-${Math.random().toString(36).substr(2, 5)}`,
            source: nameToId[c.from],
            target: nameToId[c.to],
            type: "pipe",
            data: { label: c.label || "flow", direction: "forward", animated: true, flowColor: "var(--color-text-subtle)" },
            markerEnd: { type: "arrowclosed", color: "var(--color-text-subtle)", width: 18, height: 18 },
          }))
          .filter((e) => e.source && e.target);

        const diagramName = `Connections - ${file.name.replace(/\.[^/.]+$/, "")}`;
        const result = await onSaveDiagramLocal(diagramName, rfNodes, rfEdges);
        if (result && result.id) {
          if (onLoad) onLoad(result.id);
          successToast("Diagram Generated", `Saved and loaded layout: ${diagramName}`);
          void queryClient.invalidateQueries({
            queryKey: queryKeys.cpcpConfig.diagrams(plantCode),
          });
          setIsFileModalOpen(false);
        } else {
          errorToast("Error", "Failed to save generated connections diagram.");
        }
      } catch {
        errorToast("Error", "Failed to process connections spreadsheet.");
      } finally {
        setIsBatchProcessing(false);
      }
      return;
    }

    // ── File-based batch generation ─────────────────────────────────────
    setIsBatchProcessing(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("equipment_col", col1);
    if (col2) formData.append("desc_col", col2);
    formData.append("provider", provider);
    formData.append("batch_size", "20");
    if (sheetName) formData.append("sheet_name", sheetName);

    try {
      const data = await generateFileMutation.mutateAsync(formData);
      if (data?.job_id) {
        setJobProgress({
          status: data.status || "queued",
          total_rows: data.total_rows || 1,
          processed: 0,
          success_count: 0,
          failure_count: 0,
        });
        // Enable the poller — useGenerateJobPolling takes over from here.
        setBatchJobId(data.job_id);
        return;
      }

      // Synchronous result — no polling needed.
      const results = readGeneratedList(data);
      if (results.length) {
        results.forEach((item) => {
          if (item.equipment && item.code) addAiComponent(item.equipment, item.code, item.description || "");
        });
        refreshSidebarData();
        void queryClient.invalidateQueries({
          queryKey: queryKeys.cpcpConfig.components(plantCode),
        });
        successToast("Job Complete", `${data?.success_count ?? results.length} success, ${data?.failure_count ?? 0} failed.`);
        setIsFileModalOpen(false);
        setIsBatchProcessing(false);
        setJobProgress(null);
        setActiveTab("palette");
      } else if (data?.error) {
        errorToast("Error", data.error);
        setIsBatchProcessing(false);
      } else {
        errorToast("Error", "Unexpected response from server.");
        setIsBatchProcessing(false);
      }
    } catch {
      errorToast("Error", "Failed to process file batch.");
      setIsBatchProcessing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onDragStart = (e, componentType, defaultLabel) => {
    e.dataTransfer.setData("application/reactflow/type", "industrial");
    e.dataTransfer.setData("application/reactflow/componentType", componentType);
    e.dataTransfer.setData("application/reactflow/label", defaultLabel);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragStartPnid = (e, component) => {
    const key = `pnid_${component.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
    e.dataTransfer.setData("application/reactflow/type", "industrial");
    e.dataTransfer.setData("application/reactflow/componentType", key);
    e.dataTransfer.setData("application/reactflow/label", component.name);
    e.dataTransfer.effectAllowed = "move";
  };

  const filteredPnidComponents = useMemo(() => {
    if (!paletteSearch.trim()) return pnidComponents;
    const term = paletteSearch.toLowerCase();
    return pnidComponents.filter(
      (c) => c.name.toLowerCase().includes(term) || (c.description || "").toLowerCase().includes(term),
    );
  }, [pnidComponents, paletteSearch]);

  const handleDeleteDiagram = async (e, id, diagramName) => {
    e.stopPropagation();
    openConfirm({
      title: "Delete diagram",
      message: `Are you sure you want to delete "${diagramName}"? This cannot be undone.`,
      confirmLabel: "Delete",
      confirmStyle: "danger",
      onConfirm: async () => {
        try {
          await deleteDiagramMutation.mutateAsync(id);
          successToast("Deleted", "Diagram deleted successfully.");
        } catch {
          errorToast("Error", "Failed to delete diagram.");
        }
      },
    });
  };

  const handleTogglePin = async (e, diagram) => {
    e.stopPropagation();
    try {
      await pinDiagramMutation.mutateAsync({
        diagramId: diagram.id,
        pin: !diagram.is_dashboard,
      });
    } catch {
      errorToast("Error", "Failed to update pin status.");
    }
  };

  return {
    catalog, addAiComponent, clearAiComponents, pnidComponents, pnidLoading,
    plantCode,
    aiInput, setAiInput, aiDesc, setAiDesc,
    isGenerating, setIsGenerating, generatedCode, setGeneratedCode,
    showPreview, setShowPreview, copied, setCopied,
    savedDiagrams, loadingDiagrams,
    activeTab, setActiveTab,
    provider, setProvider,
    isFileModalOpen, setIsFileModalOpen,
    isBatchProcessing, setIsBatchProcessing, jobProgress,
    summaryStatus, loadingSummaryStatus, isGeneratingSummary, handleGenerateSummary,
    showPreviewModal, setShowPreviewModal, previewData, isPreviewLoading, handleOpenPreview,
    searchTerm, setSearchTerm, paletteSearch, setPaletteSearch,
    // refreshAll (not fetchSidebarData) is exposed as the sidebar's refresh
    // action: it reloads the palette too, and takes no args, so PaletteTab's
    // `onClick={fetchSidebarData}` can't pass a MouseEvent in as the
    // autoLoadDashboard flag and re-trigger the pinned-diagram auto-open.
    filteredPnidComponents, fetchSidebarData: refreshAll,
    handleGenerate, handleBatchGenerate, copyToClipboard,
    onDragStart, onDragStartPnid, handleDeleteDiagram, handleTogglePin,
    openConfirm, successToast, errorToast
  };
}
