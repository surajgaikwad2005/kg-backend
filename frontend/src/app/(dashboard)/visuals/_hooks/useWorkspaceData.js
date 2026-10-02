'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTimeRange } from '@/src/hooks/dashboard/useTimeRange';
import {
  TAG_COLORS, toDatetimeLocalInTz, fmtLocalStr, getCleanUsername, normName,
  getComponentTags, computeCustomTagSeries,
} from '@/src/lib/dashboards.utils';
import {
  getSavedVisuals,
  getVisualsData,
  fetchCustomTag,
} from '@/src/services/visuals/visualsService';
import { useDeleteTag, useDeleteCustomTag } from '../_queries/useVisualsQueries';

export function useWorkspaceData({ workspace, allTags, onSave }) {
  const deleteTagMutation = useDeleteTag();
  const deleteCustomTagMutation = useDeleteCustomTag();
  const range = useTimeRange();
  const timezone = range.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const chartAreaRef = useRef(null);

  // ── Date range — seeded from and synced with global time range context ──
  const [localStart, setLocalStart] = useState(
    range.start ? toDatetimeLocalInTz(range.start, timezone) : '',
  );
  const [localEnd, setLocalEnd] = useState(
    range.end ? toDatetimeLocalInTz(range.end, timezone) : '',
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (range.start) setLocalStart(toDatetimeLocalInTz(range.start, timezone));
    if (range.end) setLocalEnd(toDatetimeLocalInTz(range.end, timezone));
  }, [range.start, range.end, timezone]);

  // ── Add-Tags panel ──
  const [addTagsOpen, setAddTagsOpen] = useState(false);
  const [addTagSearch, setAddTagSearch] = useState('');
  const [pendingTags, setPendingTags] = useState(workspace.tags);
  const togglePending = (tag) => setPendingTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  
  const applyTags = async () => {
    const currentTags = workspace.tags;
    const removedTags = currentTags.filter(t => !pendingTags.includes(t));
    const customTagNames = new Set((workspace.customTags || []).map(ct => ct.name));
    const username = getCleanUsername();
    const dashboardName = workspace.isBackend ? (workspace.backendName || workspace.name) : workspace.name;
    for (const tag of removedTags) {
      try {
        if (customTagNames.has(tag)) {
          await deleteCustomTagMutation.mutateAsync({ username, dashboard_name: dashboardName, tag_name: tag });
        } else {
          await deleteTagMutation.mutateAsync({ username, dashboard_name: dashboardName, tag_name: tag });
        }
      } catch (e) { }
    }
    onSave({ ...workspace, tags: pendingTags, updatedAt: new Date().toISOString() });
    setAddTagsOpen(false);
  };

  // ── Data ──
  const [tagData, setTagData] = useState([]);
  const [tagMetadata, setTagMetadata] = useState({});
  const [apiThresholds, setApiThresholds] = useState({});
  const [loading, setLoading] = useState(false);
  const lastFetchParamsRef = useRef(null);
  const injectedCustomTagsRef = useRef(new Set());

  // ── Custom Tag modal ──
  const [isCustomTagModalOpen, setIsCustomTagModalOpen] = useState(false);
  const [customTagName, setCustomTagName] = useState('');
  const [customTagFormula, setCustomTagFormula] = useState('');
  const [customTagSearchQuery, setCustomTagSearchQuery] = useState('');
  const [customTagComputeResult, setCustomTagComputeResult] = useState(null);
  const [customTagComputeError, setCustomTagComputeError] = useState(null);
  const formulaInputRef = useRef(null);

  const handleAppendToFormula = (str) => {
    const textarea = formulaInputRef.current;
    let newFormula = '';
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      newFormula = textarea.value.substring(0, start) + str + textarea.value.substring(end);
      setTimeout(() => {
        if (formulaInputRef.current) {
          formulaInputRef.current.focus();
          formulaInputRef.current.selectionStart = start + str.length;
          formulaInputRef.current.selectionEnd = start + str.length;
        }
      }, 0);
    } else {
      newFormula = customTagFormula + (customTagFormula.length > 0 && !customTagFormula.endsWith(' ') ? ' ' : '') + str + ' ';
    }
    setCustomTagFormula(newFormula);
  };

  // ── View state ──
  const [viewMode, setViewMode] = useState('lanes');
  const [focusedTag, setFocusedTag] = useState(null);
  const [selectedTags, setSelectedTags] = useState(new Set());
  const [showGrid, setShowGrid] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  const handleDeleteTag = useCallback(async (tagName) => {
    const username = getCleanUsername();
    const dashboardName = workspace.isBackend ? (workspace.backendName || workspace.name) : workspace.name;
    const customTagNames = new Set((workspace.customTags || []).map(ct => ct.name));
    try {
      if (customTagNames.has(tagName)) {
        await deleteCustomTagMutation.mutateAsync({ username, dashboard_name: dashboardName, tag_name: tagName });
      } else {
        await deleteTagMutation.mutateAsync({ username, dashboard_name: dashboardName, tag_name: tagName });
      }
    } catch (e) {
    }
    const updatedTags = (workspace.tags || []).filter(t => t !== tagName);
    const updatedCustomTags = (workspace.customTags || []).filter(ct => ct.name !== tagName);
    onSave({ ...workspace, tags: updatedTags, customTags: updatedCustomTags, updatedAt: new Date().toISOString() });
    setPendingTags(prev => prev.filter(t => t !== tagName));
    setTagData(prev => prev.filter(t => t.name !== tagName));
    setSelectedTags(prev => { const next = new Set(prev); next.delete(tagName); return next; });
    if (focusedTag === tagName) setFocusedTag(null);
  }, [workspace, onSave, focusedTag, deleteCustomTagMutation, deleteTagMutation]);

  // ── Window / resize ──
  const [windowHours, setWindowHours] = useState(6);
  const [windowEnd, setWindowEnd] = useState(0);
  const [tableHeight, setTableHeight] = useState(240);
  const [isTableMinimized, setIsTableMinimized] = useState(false);
  const [areaH, setAreaH] = useState(0);

  const isResizingRef = useRef(false);
  const startResize = useCallback((e) => {
    isResizingRef.current = true;
    document.body.style.cursor = 'ns-resize';
    const startY = e.clientY;
    const startH = tableHeight;
    const onMouseMove = (ev) => {
      if (!isResizingRef.current) return;
      setTableHeight(Math.min(600, Math.max(120, startH + (startY - ev.clientY))));
    };
    const onMouseUp = () => {
      isResizingRef.current = false;
      document.body.style.cursor = '';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [tableHeight]);

  // Resize observer for chart area height
  useEffect(() => {
    if (!chartAreaRef.current) return;
    const ro = new ResizeObserver(entries => setAreaH(entries[0]?.contentRect.height ?? 0));
    ro.observe(chartAreaRef.current);
    return () => ro.disconnect();
  }, []);

  // ── Derived window math ──
  const allTimes = tagData.flatMap(t => t.data.map(([ts]) => ts));
  // eslint-disable-next-line react-hooks/purity
  const dataStart = allTimes.length > 0 ? Math.min(...allTimes) : Date.now() - 6 * 3600000;
  // eslint-disable-next-line react-hooks/purity
  const dataEnd = allTimes.length > 0 ? Math.max(...allTimes) : Date.now();
  const totalDur = dataEnd - dataStart;
  const clampedEnd = windowEnd > 0 ? Math.min(Math.max(windowEnd, dataStart + windowHours * 3600000), dataEnd) : dataEnd;
  const windowStart = clampedEnd - windowHours * 3600000;
  const navLeft = totalDur > 0 ? ((windowStart - dataStart) / totalDur) * 100 : 0;
  const navWidth = totalDur > 0 ? (windowHours * 3600000 / totalDur) * 100 : 100;
  const step = windowHours * 3600000 * 0.5;

  const goFirst = () => setWindowEnd(dataStart + windowHours * 3600000);
  const goBack = () => setWindowEnd(e => Math.max(dataStart + windowHours * 3600000, (e || dataEnd) - step));
  const goFwd = () => setWindowEnd(e => Math.min(dataEnd, (e || dataEnd) + step));
  const goLast = () => setWindowEnd(dataEnd);

  const handleZoom = useCallback((min, max) => {
    setWindowEnd(max);
    setWindowHours((max - min) / 3600000);
  }, []);

  const resetZoom = useCallback(() => {
    setWindowEnd(dataEnd);
    setWindowHours(Math.max(1, Math.round((new Date(localEnd).getTime() - new Date(localStart).getTime()) / 3600000)));
  }, [dataEnd, localEnd, localStart]);

  // ── Navigator drag ──
  const dragRef = useRef({ type: null, startX: 0, startWindowStart: 0, startClampedEnd: 0, startWindowHours: 0 });
  const handleNavigatorMouseDown = useCallback((e, type) => {
    e.stopPropagation();
    e.preventDefault();
    dragRef.current = { type, startX: e.clientX, startWindowStart: windowStart, startClampedEnd: clampedEnd, startWindowHours: windowHours };
    document.body.style.cursor = type === 'center' ? 'grabbing' : 'col-resize';
    const onMouseMove = (ev) => {
      const drag = dragRef.current;
      if (!drag.type) return;
      const el = document.getElementById('timeline-navigator-bar');
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const deltaPct = (ev.clientX - drag.startX) / rect.width;
      const deltaMs = deltaPct * totalDur;
      if (drag.type === 'left') {
        const newStart = Math.max(dataStart, Math.min(drag.startWindowStart + deltaMs, clampedEnd - 5 * 60 * 1000));
        setWindowHours((clampedEnd - newStart) / 3600000);
      } else if (drag.type === 'right') {
        const newEnd = Math.max(windowStart + 5 * 60 * 1000, Math.min(drag.startClampedEnd + deltaMs, dataEnd));
        setWindowEnd(newEnd);
        setWindowHours((newEnd - windowStart) / 3600000);
      } else if (drag.type === 'center') {
        const dur = drag.startWindowHours * 3600000;
        let newStart = drag.startWindowStart + deltaMs;
        let newEnd = drag.startClampedEnd + deltaMs;
        if (newStart < dataStart) { newStart = dataStart; newEnd = dataStart + dur; }
        else if (newEnd > dataEnd) { newEnd = dataEnd; newStart = dataEnd - dur; }
        setWindowEnd(newEnd);
      }
    };
    const onMouseUp = () => {
      dragRef.current.type = null;
      document.body.style.cursor = '';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [windowStart, clampedEnd, windowHours, totalDur, dataStart, dataEnd]);

  const handleNavigatorClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    setWindowEnd(Math.min(dataEnd, Math.max(dataStart + windowHours * 3600000, dataStart + pct * totalDur + windowHours * 3600000 / 2)));
  }, [dataEnd, dataStart, windowHours, totalDur]);

  const extractApiThresholds = useCallback((obj) => {
    if (!obj) return;
    const findTagTable = (target) => {
      if (!target) return null;
      if (Array.isArray(target.tagTable)) return target.tagTable;
      if (Array.isArray(target)) { for (const x of target) { const r = findTagTable(x); if (r) return r; } }
      else if (typeof target === 'object') {
        for (const k of Object.keys(target)) {
          if (k === 'tagTable' && Array.isArray(target[k])) return target[k];
          if (target[k] && typeof target[k] === 'object') { const r = findTagTable(target[k]); if (r) return r; }
        }
      }
      return null;
    };
    const tagTable = findTagTable(obj);
    if (!Array.isArray(tagTable)) return;
    const thresholds = {};
    tagTable.forEach((item) => {
      const fullTag = item.Tag || item.tag;
      if (!fullTag) return;
      const shortTag = fullTag.split('.').pop() || fullTag;
      const minVal = item.Min !== undefined ? Number(item.Min) : item.min !== undefined ? Number(item.min) : null;
      const maxVal = item.Max !== undefined ? Number(item.Max) : item.max !== undefined ? Number(item.max) : null;
      const rawStd = item['Std.deviation'] !== undefined ? item['Std.deviation'] : item.std_deviation;
      const stdDevVal = rawStd !== undefined && rawStd !== null && rawStd !== '' ? Number(rawStd) : null;
      if (minVal !== null && maxVal !== null && !isNaN(minVal) && !isNaN(maxVal)) {
        thresholds[shortTag] = { min: minVal, max: maxVal, ...(stdDevVal !== null && !isNaN(stdDevVal) ? { stdDev: stdDevVal } : {}) };
      }
    });
    setApiThresholds(prev => ({ ...prev, ...thresholds }));
  }, []);

  // ── Fetch data ──
  const fetchData = useCallback(async (force) => {
    const tags = pendingTags.length > 0 ? pendingTags : workspace.tags;
    if (tags.length === 0) return;
    setApiThresholds({});
    if (!force && lastFetchParamsRef.current &&
      JSON.stringify(lastFetchParamsRef.current.tags) === JSON.stringify(tags) &&
      lastFetchParamsRef.current.start === localStart &&
      lastFetchParamsRef.current.end === localEnd) return;
    const tagsChanged = lastFetchParamsRef.current && JSON.stringify(lastFetchParamsRef.current.tags) !== JSON.stringify(tags);
    lastFetchParamsRef.current = { tags, start: localStart, end: localEnd };
    if (tagData.length === 0 || force || tagsChanged) setLoading(true);

    const start = new Date(localStart);
    const end = new Date(localEnd);
    const username = getCleanUsername();
    const workspaceCustomTags = workspace.customTags || [];
    const activeCustomTags = workspaceCustomTags.filter(ct => tags.includes(ct.name));
    const allCustomComponentTags = activeCustomTags.flatMap(ct => getComponentTags(ct.formula, allTags));
    const customTagNames = new Set(workspaceCustomTags.map(ct => ct.name));
    const physicalTagsToFetch = Array.from(new Set([...tags.filter(t => !customTagNames.has(t)), ...allCustomComponentTags]));

    const appendBackendCustomTags = async (validPhysicalTags) => {
      const startTimeStr = localStart ? fmtLocalStr(localStart) : (workspace.start || "2025-01-01 00:00:00");
      const endTimeStr = localEnd ? fmtLocalStr(localEnd) : (workspace.end || "2025-01-01 23:59:59");
      const dashboardName = workspace.isBackend ? (workspace.backendName || workspace.name) : workspace.name;
      const startMs = new Date(localStart || workspace.start || "2025-01-01T00:00:00").getTime();
      const endMs = new Date(localEnd || workspace.end || "2025-01-01T23:59:59").getTime();

      let customDataMap = {};

      try {
        // Fetch custom tags evaluation for the dashboard
        const res = await fetchCustomTag({
          username,
          dashboard_name: dashboardName,
          start_time: startTimeStr,
          end_time: endTimeStr,
        });

        if (res && (res.success || res.status === 200 || res.statusCode === 200)) {
          let payload = res.data ?? res;
          if (payload?.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
            payload = payload.data;
          }
          if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
            for (const [k, v] of Object.entries(payload)) {
              if (Array.isArray(v)) {
                customDataMap[k] = v;
              }
            }
          }
        }
      } catch (err) {
        console.error("Error fetching custom tags for dashboard:", err);
      }

      // If workspace has customTags list and single call returned nothing, try fallback per-tag calls
      const customTagsList = workspace.customTags || [];
      if (Object.keys(customDataMap).length === 0 && customTagsList.length > 0) {
        await Promise.all(
          customTagsList.map(async (ct) => {
            try {
              const res = await fetchCustomTag({
                username,
                dashboard_name: dashboardName,
                tag_name: ct.name,
                formula: ct.formula,
                start_time: startTimeStr,
                end_time: endTimeStr,
              });
              let payload = res?.data ?? res;
              if (payload?.data && typeof payload.data === 'object') payload = payload.data;
              if (payload && typeof payload === 'object') {
                for (const [k, v] of Object.entries(payload)) {
                  if (Array.isArray(v)) customDataMap[k] = v;
                }
              }
            } catch (e) {}
          })
        );
      }

      const fetchedCustomTagNames = Object.keys(customDataMap);
      if (fetchedCustomTagNames.length > 0) {
        const activeTags = [...tags];
        const missingTagsInWorkspace = fetchedCustomTagNames.filter(
          name => !activeTags.includes(name) && !injectedCustomTagsRef.current.has(name)
        );
        if (missingTagsInWorkspace.length > 0) {
          const updatedTags = [...activeTags, ...missingTagsInWorkspace];
          missingTagsInWorkspace.forEach(t => injectedCustomTagsRef.current.add(t));
          setTimeout(() => { onSave({ ...workspace, tags: updatedTags, updatedAt: new Date().toISOString() }); }, 0);
        }

        const getTimestamps = (count) => {
          if (validPhysicalTags && validPhysicalTags.length > 0 && validPhysicalTags[0].data?.length > 0) {
            const physTimes = validPhysicalTags[0].data.map(d => d[0]);
            if (physTimes.length === count) return physTimes;
            if (physTimes.length > 0) {
              const pStart = physTimes[0];
              const pEnd = physTimes[physTimes.length - 1];
              const step = (pEnd - pStart) / Math.max(1, count - 1);
              return Array.from({ length: count }, (_, i) => Math.round(pStart + i * step));
            }
          }
          const duration = (endMs && endMs > startMs) ? (endMs - startMs) : (24 * 3600 * 1000);
          const step = duration / Math.max(1, count - 1);
          return Array.from({ length: count }, (_, i) => Math.round((startMs || Date.now()) + i * step));
        };

        const backendCustomTagsSeries = fetchedCustomTagNames.map((name, idx) => {
          const values = customDataMap[name];
          const timestamps = getTimestamps(values.length);
          const seriesData = values.map((val, i) => [timestamps[i], typeof val === 'number' ? val : Number(val) || 0]);
          return {
            name,
            color: TAG_COLORS[(validPhysicalTags.length + idx) % TAG_COLORS.length],
            data: seriesData,
            isCustom: true,
          };
        });

        const combined = [...validPhysicalTags, ...backendCustomTagsSeries];
        return combined.filter(t => [...tags, ...fetchedCustomTagNames].includes(t.name));
      }

      const computedCustomTagDataList = activeCustomTags.map((ct, idx) => ({
        name: ct.name,
        color: TAG_COLORS[(validPhysicalTags.length + idx) % TAG_COLORS.length],
        data: computeCustomTagSeries(ct.formula, validPhysicalTags, allTags),
        isCustom: true,
      }));
      return [...validPhysicalTags, ...computedCustomTagDataList].filter(t => tags.includes(t.name));
    };

    const buildTagData = async (gList, existingValid = null) => {
      const valid = (existingValid ?? gList.map((item, ti) => ({
        name: item.name.split('.').pop() || item.name,
        color: TAG_COLORS[ti % TAG_COLORS.length],
        data: (item.x || []).map((x, i) => [new Date(x.replace(' ', 'T')).getTime(), item.y[i]]),
      })));
      return appendBackendCustomTags(valid);
    };

    const applyTagData = (allTagData) => {
      setTagData(allTagData);
      if (allTagData.length > 0) {
        setSelectedTags(new Set(allTagData.map(t => t.name)));
        const times = allTagData.flatMap(t => t.data.map(([ts]) => ts));
        if (times.length > 0) { setWindowEnd(Math.max(...times)); setWindowHours(Math.max(1, Math.round((Math.max(...times) - Math.min(...times)) / 3600000))); }
      }
    };

    try {
      const savedBody = await getSavedVisuals({
        username,
        dashboard_name: workspace.isBackend ? (workspace.backendName || workspace.name) : workspace.name,
      });
      if ((savedBody.success || savedBody.statusCode === 200) && savedBody.data) {
        extractApiThresholds(savedBody);
        extractApiThresholds(savedBody.data);
        const findMatch = (d) => workspace.isBackend
          ? normName(d.dashboardName) === normName(workspace.backendName)
          : (d.visualName?.toLowerCase().includes(workspace.name.toLowerCase()) ||
            normName(d.dashboardName) === normName(workspace.name) ||
            (d.tagId && d.tagId.some(tid => physicalTagsToFetch.includes(tid.split('.').pop() || ''))));
        const matched = Array.isArray(savedBody.data)
          ? savedBody.data.find(findMatch)
          : (findMatch(savedBody.data) ? savedBody.data : null);
        if (matched) extractApiThresholds(matched);

        let graphs = [];
        if (Array.isArray(matched?.tagGraph)) {
          graphs = matched.tagGraph;
        } else if (Array.isArray(matched?.data?.tagGraph)) {
          graphs = matched.data.tagGraph;
        } else if (Array.isArray(matched?.data)) {
          graphs = matched.data.filter(i => i.tagGraph).flatMap(i => i.tagGraph);
        }

        if (graphs.length > 0) {
          const savedTagNames = new Set(graphs.map(item => item.name.split('.').pop() || item.name));
          const missingPhysicalTags = physicalTagsToFetch.filter(t => !savedTagNames.has(t));
          let valid = graphs.map((item, ti) => ({
            name: item.name.split('.').pop() || item.name,
            color: TAG_COLORS[ti % TAG_COLORS.length],
            data: (item.x || []).map((x, i) => [new Date(x.replace(' ', 'T')).getTime(), item.y[i]]),
          }));
          if (missingPhysicalTags.length > 0) {
            try {
              const body = await getVisualsData({ start: fmtLocalStr(localStart), end: fmtLocalStr(localEnd), tags: physicalTagsToFetch, dashboard_name: workspace.isBackend ? (workspace.backendName || workspace.name) : workspace.name, username });
              if (body.success || body.statusCode === 200) {
                extractApiThresholds(body);
                extractApiThresholds(body.data);
                const gList = Array.isArray(body.data?.tagGraph)
                  ? body.data.tagGraph
                  : (Array.isArray(body.tagGraph) ? body.tagGraph : ((body.data || []).filter(i => i.tagGraph).flatMap(i => i.tagGraph)));
                if (gList.length > 0) valid = gList.map((item, ti) => ({ name: item.name.split('.').pop() || item.name, color: TAG_COLORS[ti % TAG_COLORS.length], data: (item.x || []).map((x, i) => [new Date(x.replace(' ', 'T')).getTime(), item.y[i]]) }));
              }
            } catch (err) { }
          }
          applyTagData(await buildTagData([], valid));
          setLoading(false);
          return;
        }
      }
    } catch (err) { }

    try {
      const body = await getVisualsData({ start: fmtLocalStr(localStart), end: fmtLocalStr(localEnd), tags: physicalTagsToFetch, dashboard_name: workspace.isBackend ? (workspace.backendName || workspace.name) : workspace.name, username });
      if (body.success || body.statusCode === 200) {
        extractApiThresholds(body);
        extractApiThresholds(body.data);
        const gList = Array.isArray(body.data?.tagGraph)
          ? body.data.tagGraph
          : (Array.isArray(body.tagGraph) ? body.tagGraph : ((body.data || []).filter(i => i.tagGraph).flatMap(i => i.tagGraph)));
        applyTagData(await buildTagData(gList));
        if (tagData.length > 0) setWindowHours(Math.max(1, Math.round((end.getTime() - start.getTime()) / 3600000)));
      }
    } catch (err) { }
    finally { setLoading(false); }
  }, [pendingTags, workspace.tags, localStart, localEnd, workspace.name, allTags, onSave, workspace.isBackend, workspace.backendName, workspace.customTags, workspace.start, workspace.end, tagData.length]);

  useEffect(() => {
    const hasTags = workspace.isBackend ? (pendingTags.length > 0) : (workspace.tags.length > 0);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (hasTags && localStart && localEnd) fetchData();
  }, [fetchData, workspace.isBackend, workspace.tags.length, pendingTags.length, localStart, localEnd]);

  // ── Deviation logic ──
  const deviationInfo = useMemo(() => tagData.map(tag => {
    const vals = tag.data.map(([, v]) => v);
    if (!vals.length) return { isDeviated: false, minTh: 0, maxTh: 0, stdDev: 0 };
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const computedStd = Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length) || 0;
    const apiTh = apiThresholds[tag.name];
    if (apiTh) {
      const win = tag.data.filter(([t]) => t >= windowStart && t <= clampedEnd);
      return { isDeviated: win.some(([, v]) => v < apiTh.min || v > apiTh.max), minTh: apiTh.min, maxTh: apiTh.max, stdDev: apiTh.stdDev ?? computedStd };
    }
    const minTh = mean - 1.5 * computedStd;
    const maxTh = mean + 1.5 * computedStd;
    const win = tag.data.filter(([t]) => t >= windowStart && t <= clampedEnd);
    return { isDeviated: win.some(([, v]) => v < minTh || v > maxTh), minTh, maxTh, stdDev: computedStd };
  }), [tagData, windowStart, clampedEnd, apiThresholds]);

  const deviatedCount = deviationInfo.filter(d => d.isDeviated).length;

  const toggleTagVisibility = (tagName) => setSelectedTags(prev => { const next = new Set(prev); if (next.has(tagName)) next.delete(tagName); else next.add(tagName); return next; });

  // ── Computed display ──
  const visibleTags = tagData.filter(t => selectedTags.has(t.name));
  const displayTags = focusedTag ? visibleTags.filter(t => t.name === focusedTag) : visibleTags;
  const n = displayTags.length;
  const totalGaps = n > 1 ? (n - 1) * 5 : 0;
  const LANE_H = n > 0 && areaH > 0 ? Math.max(100, Math.floor((areaH - totalGaps) / n)) : 150;

  return {
    timezone,
    localStart,
    setLocalStart,
    localEnd,
    setLocalEnd,
    addTagsOpen,
    setAddTagsOpen,
    addTagSearch,
    setAddTagSearch,
    pendingTags,
    setPendingTags,
    tagData,
    tagMetadata,
    apiThresholds,
    loading,
    isCustomTagModalOpen,
    setIsCustomTagModalOpen,
    customTagName,
    setCustomTagName,
    customTagFormula,
    setCustomTagFormula,
    customTagSearchQuery,
    setCustomTagSearchQuery,
    customTagComputeResult,
    setCustomTagComputeResult,
    customTagComputeError,
    setCustomTagComputeError,
    formulaInputRef,
    viewMode,
    setViewMode,
    focusedTag,
    setFocusedTag,
    selectedTags,
    setSelectedTags,
    showGrid,
    setShowGrid,
    showLabels,
    setShowLabels,
    windowHours,
    setWindowHours,
    windowEnd,
    setWindowEnd,
    tableHeight,
    setTableHeight,
    isTableMinimized,
    setIsTableMinimized,
    areaH,
    setAreaH,
    chartAreaRef,
    togglePending,
    applyTags,
    handleAppendToFormula,
    handleDeleteTag,
    startResize,
    dataStart,
    dataEnd,
    totalDur,
    clampedEnd,
    windowStart,
    navLeft,
    navWidth,
    goFirst,
    goBack,
    goFwd,
    goLast,
    handleZoom,
    resetZoom,
    handleNavigatorMouseDown,
    handleNavigatorClick,
    fetchData,
    deviationInfo,
    deviatedCount,
    toggleTagVisibility,
    displayTags,
    LANE_H,
  };
}
