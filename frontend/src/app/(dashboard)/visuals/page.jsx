'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/src/components/layout/PageHeader';
import { getSavedVisuals, getVisualsData } from '@/src/services/visuals/visualsService';
import { useTimeRange } from '@/src/hooks/dashboard/useTimeRange';
import { STORAGE_KEY, getCleanUsername, normName, fmtInTz } from '@/src/lib/dashboards.utils';
import { Landing } from './_components/Landing';
import { NewVisualModal } from './_components/NewVisualModal';
import { useToast } from '@/src/components/ui/Toast';
import { useListDashboards, useDeleteDashboard } from './_queries/useVisualsQueries';

const FALLBACK_TAGS = [];

export default function VisualsPage() {
  const router = useRouter();
  const range = useTimeRange();
  const timezone = range.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const username = getCleanUsername();

  const { error: toastError } = useToast();

  const [workspaces, setWorkspaces] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [allTags, setAllTags] = useState([]);

  const { data: res, isLoading: isLoadingBackend, isError, error: queryError, refetch } = useListDashboards(username, {
    enabled: Boolean(username && username.toLowerCase() !== 'operator'),
  });

  const deleteDashboardMutation = useDeleteDashboard();

  // Clear legacy localStorage data once on mount
  useEffect(() => { localStorage.removeItem(STORAGE_KEY); }, []);

  // Process dashboard list when query data changes
  useEffect(() => {
    if (!res) return;
    let dashboardsArr = null;
    if (res?.success && res?.data && Array.isArray(res.data.dashboards)) {
      dashboardsArr = res.data.dashboards;
    } else if (res?.statusCode === 200 && Array.isArray(res.dashboards)) {
      dashboardsArr = res.dashboards;
    } else if (Array.isArray(res)) {
      dashboardsArr = res;
    }

    if (dashboardsArr !== null) {
      Promise.all(dashboardsArr.map(async name => {
        let tags = [];
        try {
          const savedRes = await getSavedVisuals({ username, dashboard_name: name });
          if ((savedRes?.success || savedRes?.statusCode === 200) && savedRes.data) {
            const matched = Array.isArray(savedRes.data)
              ? savedRes.data.find(v => normName(v.dashboardName) === normName(name))
              : (normName(savedRes.data.dashboardName) === normName(name) ? savedRes.data : null);
            if (matched?.tagId && Array.isArray(matched.tagId)) {
              tags = matched.tagId.map(tid => tid.split('.').pop() || tid);
            }
          }
        } catch (err) {}
        return {
          id: `backend_${name}`,
          name: name.charAt(0).toUpperCase() + name.slice(1),
          backendName: name,
          tags,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isBackend: true,
        };
      })).then(setWorkspaces).catch(() => {});
    }
  }, [res, username]);

  const fetchError = isError ? (queryError?.message || 'Failed to load visual workspaces') : null;

  const createWorkspace = async (rawName, tags) => {
    const name = rawName.trim().replace(/-/g, '_');

    let startTimeStr = '';
    let endTimeStr = '';
    try {
      const saved = localStorage.getItem('timeRange');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.start) startTimeStr = parsed.start.replace('T', ' ');
        if (parsed.end) endTimeStr = parsed.end.replace('T', ' ');
      }
    } catch (err) {}

    if (!startTimeStr || !endTimeStr) {
      const start = range.start ?? new Date(Date.now() - 6 * 3600000);
      const end = range.end ?? new Date();
      startTimeStr = fmtInTz(start, timezone);
      endTimeStr = fmtInTz(end, timezone);
    }

    const ws = {
      id: `backend_${name}`,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      backendName: name,
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isBackend: true,
    };
    try {
      await getVisualsData({
        start: startTimeStr,
        end: endTimeStr,
        tags,
        dashboard_name: name,
        username,
      });
      setWorkspaces(prev => [ws, ...prev.filter(w => w.backendName !== name)]);
      setShowNew(false);
      router.push(`/visuals/${ws.id}`);
    } catch (err) {
      toastError('Failed to Create Visual', err.message || 'The server returned an error.');
    }
  };

  const deleteWorkspace = async (id) => {
    const target = workspaces.find(w => w.id === id);
    if (!target) return;
    if (target.isBackend && target.backendName) {
      deleteDashboardMutation.mutate({ username, dashboard_name: target.backendName });
    }
    setWorkspaces(prev => prev.filter(w => w.id !== id));
  };

  return (<>
    <PageHeader showDateRange title="Visuals" subtitle="Data Visualization Studio" />
    <Landing
      workspaces={workspaces}
      onOpen={id => router.push(`/visuals/${id}`)}
      onNew={() => setShowNew(true)}
      onDelete={deleteWorkspace}
      isLoadingBackend={isLoadingBackend}
      fetchError={fetchError}
      onRetry={refetch}
    />
    <NewVisualModal
      isOpen={showNew}
      allTags={allTags}
      onClose={() => setShowNew(false)}
      onCreate={createWorkspace}
    />
  </>
  );
}
