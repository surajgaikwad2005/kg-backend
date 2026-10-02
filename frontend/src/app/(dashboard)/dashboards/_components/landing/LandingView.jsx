'use client';

import React, { useMemo } from 'react';
import { Search, LayoutGrid, List, Plus, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StatsStrip from './StatsStrip';
import GroupCard from './GroupCard';
import GroupCardAdd from './GroupCardAdd';
import GroupListView from './GroupListView';
import { SkeletonDashboardGrid, SkeletonStatsStrip } from './DashboardSkeleton';

export default function LandingView({
  dashboards: propDashboards,
  dashboardGroups,
  starredDashboards: propStarred,
  starredGroups,
  toggleStarDashboard: propToggleStar,
  toggleStarGroup,
  setActiveDashboardId: propSetActiveId,
  setActiveGroupId,
  landingViewMode,
  setLandingViewMode,
  setIsCreateDashboardOpen: propSetIsCreateOpen,
  setIsCreateGroupOpen,
  handleDeleteDashboard: propHandleDelete,
  handleDeleteGroup,
  isLoading = false,
  fetchError = null,
  onRetry,
}) {
  const dashboards = propDashboards || dashboardGroups || [];
  const starredDashboards = propStarred || starredGroups || new Set();
  const toggleStarDashboard = propToggleStar || toggleStarGroup;
  const setActiveDashboardId = propSetActiveId || setActiveGroupId;
  const setIsCreateDashboardOpen = propSetIsCreateOpen || setIsCreateGroupOpen;
  const handleDeleteDashboard = propHandleDelete || handleDeleteGroup;

  const [searchQuery, setSearchQuery] = React.useState('');

  // Memoize total stats
  const totalVisuals = useMemo(() => {
    return dashboards.reduce((acc, d) => acc + (d.total_visuals ?? d.visuals?.length ?? 0), 0);
  }, [dashboards]);

  // Memoize filtered and sorted dashboards (starred items come first)
  const sortedDashboards = useMemo(() => {
    let list = dashboards;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = dashboards.filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          (d.description || '').toLowerCase().includes(query)
      );
    }
    return [...list].sort((a, b) => {
      const aStarred = starredDashboards.has(a.id) ? 1 : 0;
      const bStarred = starredDashboards.has(b.id) ? 1 : 0;
      return bStarred - aStarred;
    });
  }, [dashboards, searchQuery, starredDashboards]);

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar row: search, view mode, create button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search bar */}
        <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-1.5 w-full sm:w-64 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/10 transition-all shrink-0">
          <Search size={14} className="text-text-light flex-shrink-0" />
          <input
            type="text"
            placeholder="Search dashboards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-text-primary outline-none w-full placeholder-text-light font-medium"
          />
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 flex-nowrap justify-end">
          {/* View Mode Toggle Switcher */}
          <div className="flex items-center bg-surface-2 border border-border rounded-lg p-1 shrink-0">
            <button
              onClick={() => setLandingViewMode('cards')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
                landingViewMode === 'cards'
                  ? 'bg-surface text-brand shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              aria-label="Cards View"
            >
              <LayoutGrid size={13} />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setLandingViewMode('list')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
                landingViewMode === 'list'
                  ? 'bg-surface text-brand shadow-sm'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              aria-label="List View"
            >
              <List size={13} />
              <span>List</span>
            </button>
          </div>

          {/* Create Button */}
          <button
            onClick={() => setIsCreateDashboardOpen(true)}
            className="flex items-center gap-1.5 bg-brand hover:bg-brand-hover text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-md shadow-brand/10 hover:shadow-brand/20 active:scale-95 transition-all cursor-pointer shrink-0 whitespace-nowrap"
          >
            <Plus size={14} />
            <span>New Dashboard</span>
          </button>
        </div>
      </div>

      {/* Stats Strip — hidden on error too: showing "0 Total Dashboards" during
          a failed fetch would read as a confirmed count, not an unknown one. */}
      {isLoading ? (
        <SkeletonStatsStrip />
      ) : fetchError ? null : (
        <StatsStrip
          totalDashboards={dashboards.length}
          totalVisuals={totalVisuals}
          totalStarred={starredDashboards.size}
        />
      )}

      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-border pb-1.5">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
          {isLoading
            ? 'Loading dashboards...'
            : fetchError
            ? 'Failed to load dashboards'
            : landingViewMode === 'cards'
            ? `${sortedDashboards.length} Dashboard${sortedDashboards.length !== 1 ? 's' : ''}`
            : 'All Dashboards'}
        </span>
      </div>

      {/* Conditional Views */}
      {isLoading ? (
        <SkeletonDashboardGrid count={4} />
      ) : fetchError ? (
        <div className="flex flex-col items-center justify-center py-16 text-danger" role="alert">
          <AlertTriangle size={32} className="mb-3" />
          <p className="font-semibold">Failed to load dashboards</p>
          <p className="text-body mt-1 text-text-muted">{fetchError}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 px-4 py-2 bg-brand text-white rounded-lg text-body hover:bg-brand-hover cursor-pointer transition-colors"
          >
            Retry
          </button>
        </div>
      ) : landingViewMode === 'cards' ? (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {sortedDashboards.map((dashboard) => (
              <motion.div
                key={dashboard.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  layout: { type: 'spring', stiffness: 350, damping: 25 },
                  opacity: { duration: 0.2 },
                }}
              >
                <GroupCard
                  dashboard={dashboard}
                  group={dashboard}
                  isStarred={starredDashboards.has(dashboard.id)}
                  onStar={(e) => toggleStarDashboard(e, dashboard.id)}
                  onClick={() => {
                    setActiveDashboardId(dashboard.id);
                    setSearchQuery('');
                  }}
                  onDelete={(e) => handleDeleteDashboard(e, dashboard)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          <motion.div layout>
            <GroupCardAdd onClick={() => setIsCreateDashboardOpen(true)} />
          </motion.div>
        </motion.div>
      ) : (
        <GroupListView
          dashboards={sortedDashboards}
          groups={sortedDashboards}
          starredDashboards={starredDashboards}
          starredGroups={starredDashboards}
          toggleStarDashboard={toggleStarDashboard}
          toggleStarGroup={toggleStarDashboard}
          setActiveDashboardId={(id) => {
            setActiveDashboardId(id);
            setSearchQuery('');
          }}
          setActiveGroupId={(id) => {
            setActiveDashboardId(id);
            setSearchQuery('');
          }}
        />
      )}
    </div>
  );
}
