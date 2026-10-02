'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useToast } from '@/src/components/ui/Toast';
import { useConfirm } from '@/src/components/ui/ConfirmModal';
import { useApp } from '@/src/context/AppContext';
import {
  useDashboardsList,
  useCreateDashboard,
  useDeleteDashboard,
} from '../_queries/useDashboardQueries';

const EMPTY_DASHBOARDS = [];

export function useDashboards() {
  const toast = useToast();
  const { openConfirm } = useConfirm();
  const { plantId } = useApp();
  const plantCode = plantId?.id || 'cdm_copy';

  const {
    data: dashboards = EMPTY_DASHBOARDS,
    isLoading,
    error: listError,
    refetch: refetchDashboards,
  } = useDashboardsList(plantCode);
  const fetchError = listError ? (listError.message || 'Failed to load dashboards') : null;

  const { mutateAsync: createDashboardAsync } = useCreateDashboard(plantCode);
  const { mutateAsync: deleteDashboardAsync } = useDeleteDashboard(plantCode);

  const [starredDashboards, setStarredDashboards] = useState(new Set());
  const [activeDashboardId, setActiveDashboardId] = useState(null);
  const [landingViewMode, setLandingViewMode] = useState('cards'); // 'cards' | 'list'

  // Create Dashboard Form state
  const [newDashboardName, setNewDashboardName] = useState('');
  const [newDashboardDesc, setNewDashboardDesc] = useState('');
  const [newDashboardTheme, setNewDashboardTheme] = useState('blue');
  const [isCreateDashboardOpen, setIsCreateDashboardOpen] = useState(false);

  // Load stars from localStorage once on mount.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stars = new Set();
    Object.keys(localStorage).forEach((k) => {
      if ((k.startsWith('star-dashboard-') || k.startsWith('star-group-')) && localStorage.getItem(k) === 'true') {
        const id = k.replace('star-dashboard-', '').replace('star-group-', '');
        stars.add(id);
      }
    });
    setStarredDashboards(stars);
  }, []);

  // Clean up starredDashboards whenever the server list changes (dashboard
  // deleted elsewhere, plant switched, …) — avoids state updates if no stars are removed.
  useEffect(() => {
    if (isLoading || !dashboards) return;
    setStarredDashboards((prevStars) => {
      if (prevStars.size === 0) return prevStars;
      const validIds = new Set(dashboards.map((d) => String(d.id || d.dashboard_id)));
      const removedIds = [...prevStars].filter((id) => !validIds.has(String(id)));
      if (removedIds.length === 0) return prevStars;

      if (typeof window !== 'undefined') {
        removedIds.forEach((id) => {
          localStorage.removeItem(`star-dashboard-${id}`);
          localStorage.removeItem(`star-group-${id}`);
        });
      }
      return new Set([...prevStars].filter((id) => validIds.has(String(id))));
    });
  }, [dashboards, isLoading]);

  // Dashboard Star Operations
  const toggleStarDashboard = useCallback((e, dashboardId) => {
    e.stopPropagation();
    setStarredDashboards((prev) => {
      const next = new Set(prev);
      if (next.has(dashboardId)) {
        next.delete(dashboardId);
        localStorage.setItem(`star-dashboard-${dashboardId}`, 'false');
        toast.success('Removed from Starred');
      } else {
        next.add(dashboardId);
        localStorage.setItem(`star-dashboard-${dashboardId}`, 'true');
        toast.success('Added to Starred');
      }
      return next;
    });
  }, [toast]);

  // Create Dashboard Trigger
  const handleCreateDashboard = useCallback(async () => {
    if (!newDashboardName.trim()) {
      toast.error('Dashboard name is required');
      return;
    }

    try {
      const res = await createDashboardAsync({
        name: newDashboardName.trim(),
        description: newDashboardDesc.trim() || 'Custom monitoring dashboard.',
        color: newDashboardTheme,
      });

      setIsCreateDashboardOpen(false);
      setNewDashboardName('');
      setNewDashboardDesc('');
      setNewDashboardTheme('blue');

      toast.success(`Dashboard "${res?.dashboard_name || newDashboardName.trim()}" created`);
    } catch (e) {
      toast.error(e.message || 'Failed to create dashboard');
    }
  }, [newDashboardName, newDashboardDesc, newDashboardTheme, createDashboardAsync, toast]);

  // Delete Dashboard Trigger
  const handleDeleteDashboard = useCallback((e, dashboard) => {
    e.stopPropagation();
    openConfirm({
      title: 'Delete Dashboard?',
      message: `Are you sure you want to delete "${dashboard.name}" and all of its configurations? This cannot be undone.`,
      onConfirm: async () => {
        try {
          await deleteDashboardAsync(dashboard.id);
          localStorage.removeItem(`star-dashboard-${dashboard.id}`);
          setStarredDashboards((prev) => {
            const next = new Set(prev);
            next.delete(dashboard.id);
            return next;
          });
          toast.success(`Deleted dashboard "${dashboard.name}"`);
        } catch (e) {
          toast.error(e.message || 'Failed to delete dashboard');
        }
      }
    });
  }, [deleteDashboardAsync, openConfirm, toast]);

  // Find currently active dashboard's LIST-ROW summary (name/description/theme
  // — no `visuals`; the [id] detail route layers useDashboardDetail on top of
  // this for the full record, see [id]/page.jsx).
  const activeDashboard = useMemo(() => {
    return dashboards.find((d) => d.id === activeDashboardId) || null;
  }, [activeDashboardId, dashboards]);

  return {
    dashboards,
    starredDashboards,
    activeDashboardId,
    setActiveDashboardId,
    landingViewMode,
    setLandingViewMode,
    activeDashboard,
    isLoading,
    fetchError,
    retryFetchDashboards: refetchDashboards,
    newDashboardName,
    setNewDashboardName,
    newDashboardDesc,
    setNewDashboardDesc,
    newDashboardTheme,
    setNewDashboardTheme,
    isCreateDashboardOpen,
    setIsCreateDashboardOpen,
    toggleStarDashboard,
    handleCreateDashboard,
    handleDeleteDashboard,

    // Backward Compatibility Aliases
    dashboardGroups: dashboards,
    starredGroups: starredDashboards,
    activeGroupId: activeDashboardId,
    setActiveGroupId: setActiveDashboardId,
    activeGroup: activeDashboard,
    newGroupName: newDashboardName,
    setNewGroupName: setNewDashboardName,
    newGroupDesc: newDashboardDesc,
    setNewGroupDesc: setNewDashboardDesc,
    newGroupTheme: newDashboardTheme,
    setNewGroupTheme: setNewDashboardTheme,
    isCreateGroupOpen: isCreateDashboardOpen,
    setIsCreateGroupOpen: setIsCreateDashboardOpen,
    toggleStarGroup: toggleStarDashboard,
    handleCreateGroup: handleCreateDashboard,
    handleDeleteGroup: handleDeleteDashboard,
  };
}

export const useDashboardGroups = useDashboards;
