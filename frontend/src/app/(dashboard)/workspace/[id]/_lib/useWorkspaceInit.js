import { useEffect } from 'react';
import { getWorkspaceFeatures, loadWorkspaceFolder, listAvailableTags } from '@/src/services/workspace/workspaceService';
import { useApp } from '@/src/context/AppContext';

export function useWorkspaceInit({
  idStr,
  setWorkspaceName,
  setNodes,
  setEdges,
  setSupportedFeatures,
  setAssetsList,
  setIsLoadingAssets,
  hasRestored,
  hasFetchedFolder,
  centerCanvas,
  fetchTrendData,
  flowStorageKey,
  _uidRef,
}) {
  const { plantCode } = useApp();

  // ── Seeding, Restoration, & Folder Load ─────────────────────────────────
  useEffect(() => {
    setWorkspaceName(idStr && idStr !== 'new' ? idStr : 'Untitled Workspace');

    if (!idStr || idStr === 'new' || !plantCode) {
      hasRestored.current = true;
      return;
    }

    hasRestored.current = true;

    const getUser = () => {
      if (typeof window === 'undefined') return 'user';
      return (localStorage.getItem('username') || '').split('@')[0].split('.')[0] || 'user';
    };

    // fetchWorkspaceFeatures
    (async () => {
      try {
        const d = await getWorkspaceFeatures(plantCode, getUser(), idStr);
        const features = d.data?.features ?? d.features;
        if (Array.isArray(features)) setSupportedFeatures(features);
      } catch {}
    })();

    // fetchWorkspaceFolder — always load folder from backend to sync fresh data
    if (hasFetchedFolder.current === idStr) return;
    hasFetchedFolder.current = idStr;

    const TYPE_MAP = {
      timeseries:                  { nodeType: 'trendStats',        analysisType: 'timeseries',      label: 'Time Series Profiler'      },
      timeseries_analysis:         { nodeType: 'trendStats',        analysisType: 'timeseries',      label: 'Time Series Profiler'      },
      trend_analysis:              { nodeType: 'trendStats',        analysisType: 'trend_analysis',  label: 'Trend Analysis'            },
      correlation:                 { nodeType: 'correlationMatrix', analysisType: 'correlation',     label: 'Correlation Matrix'        },
      correlation_analysis:        { nodeType: 'correlationMatrix', analysisType: 'correlation',     label: 'Correlation Matrix'        },
      event_detection:             { nodeType: 'anomalyAlerts',     analysisType: 'event_detection', label: 'Event Detection Engine'    },
      event_detection_analysis:    { nodeType: 'anomalyAlerts',     analysisType: 'event_detection', label: 'Event Detection Engine'    },
      rca:                         { nodeType: 'rcaAnalysis',       analysisType: 'rca',             label: 'Root Cause Analysis'       },
      rca_analysis:                { nodeType: 'rcaAnalysis',       analysisType: 'rca',             label: 'Root Cause Analysis'       },
      kpi_monitoring:              { nodeType: 'kpiMonitoring',     analysisType: 'kpi_monitoring',  label: 'KPI Monitoring Dashboard'  },
      kpi_monitoring_analysis:     { nodeType: 'kpiMonitoring',     analysisType: 'kpi_monitoring',  label: 'KPI Monitoring Dashboard'  },
      multi_chart_visualization:   { nodeType: 'multiChart',        analysisType: 'multi_chart',     label: 'Multi Chart Visualization' },
      multi_chart:                 { nodeType: 'multiChart',        analysisType: 'multi_chart',     label: 'Multi Chart Visualization' },
    };

    (async () => {
      try {
        const responseData = await loadWorkspaceFolder(plantCode, getUser(), idStr);
        const results = responseData?.results ?? responseData?.data?.results ?? responseData?.data ?? {};
        const newNodes = [];
        let offsetX = 300, offsetY = 100;
        for (const [key, list] of Object.entries(results)) {
          if (!Array.isArray(list) || list.length === 0) continue;
          const config = TYPE_MAP[key];
          if (!config) continue;
          for (const item of list) {
            // analysisId is the backend numeric ID (used for update/delete API calls)
            const analysisId = String(item.analysisId ?? item.analysis_id ?? `${key}-${Date.now()}`);
            // nodeId MUST be unique across all analysis types — backend reuses numeric IDs across types!
            const nodeId = `${config.analysisType}-${analysisId}`;
            const tags = item.tags ?? [];
            const computedData = item.computedData ?? null;
            const nodeData = { label: config.label, analysisId, analysisType: config.analysisType, savedTags: tags };
            if (computedData) {
              nodeData.apiData = computedData;
              nodeData.computedData = computedData;
            }
            if (config.nodeType === 'trendStats') {
              nodeData.signals = tags.map(t => ({ label: t, tagId: t, trendData: [] }));
            }
            else if (config.nodeType === 'correlationMatrix' && computedData) {
              nodeData.savedHeatmap = computedData.heatmap || (computedData.x && (computedData.values || computedData.z) ? computedData : null);
            }
            else if (config.nodeType === 'anomalyAlerts' && computedData) {
              nodeData.savedEvents = computedData.events || (Array.isArray(computedData) ? computedData : (Array.isArray(computedData.data?.events) ? computedData.data.events : undefined));
            }
            else if (config.nodeType === 'rcaAnalysis' && computedData) {
              nodeData.savedEvents = computedData.events || (Array.isArray(computedData) ? computedData : (Array.isArray(computedData.data?.events) ? computedData.data.events : undefined));
            }
            else if (config.nodeType === 'kpiMonitoring' && computedData) {
              nodeData.savedKpis = computedData.kpis || (Array.isArray(computedData) ? computedData : (Array.isArray(computedData.data) ? computedData.data : undefined));
            }
            else if (config.nodeType === 'multiChart' && computedData) {
              nodeData.savedChartData = computedData;
              nodeData.chartType = computedData.chart_type ?? 'scatter';
            }
            newNodes.push({ id: nodeId, type: config.nodeType, position: { x: offsetX, y: offsetY }, data: nodeData });
            offsetY += 460;
            if (offsetY > 1800) { offsetY = 100; offsetX += 1100; }
          }
        }
        if (newNodes.length > 0) {
          setNodes(prev => {
            const existingMap = new Map(prev.map(n => [n.id, n]));
            const mergedNodes = [];
            newNodes.forEach(bNode => {
              const existing = existingMap.get(bNode.id);
              if (existing) {
                mergedNodes.push({
                  ...existing,
                  data: {
                    ...existing.data,
                    ...bNode.data
                  }
                });
                existingMap.delete(bNode.id);
              } else {
                mergedNodes.push(bNode);
              }
            });
            existingMap.forEach(node => {
              mergedNodes.push(node);
            });
            return mergedNodes;
          });
          setTimeout(centerCanvas, 400);
        }
      } catch (err) {
      }
    })();
  }, [idStr, plantCode, fetchTrendData]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch Available Tags (only from /list_available_tags) ─────────────
  useEffect(() => {
    if (!plantCode) return;
    const fetchAssets = async () => {
      setIsLoadingAssets(true);
      try {
        const username = (localStorage.getItem('username') || '').split('@')[0].split('.')[0] || 'user';
        if (idStr && idStr !== 'new') {
          const d = await listAvailableTags(plantCode, username, idStr);
          const tags = Array.isArray(d.data) ? d.data : (Array.isArray(d) ? d : []);
          setAssetsList(tags.map((tag, idx) => ({ id: `tag-${idx}`, name: tag, desc: 'Performance Parameter' })));
        }
      } catch (err) {
      } finally {
        setIsLoadingAssets(false);
      }
    };
    fetchAssets();
  }, [idStr, plantCode, setAssetsList, setIsLoadingAssets]);
}
