'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import LandingView from './_components/landing/LandingView';
import CreateDashboardModal from './_components/landing/CreateGroupModal';
import { PageHeader } from '@/src/components/layout/PageHeader';
import { useDashboards } from './_hooks/useDashboardGroups';

export default function DashboardsPage() {
  const router = useRouter();

  // Dashboard lists and operations hook
  const {
    dashboards,
    starredDashboards,
    landingViewMode,
    setLandingViewMode,
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
    isLoading,
    fetchError,
    retryFetchDashboards,
  } = useDashboards();

  return (
    <div className="dashboards-style-scope w-full flex flex-col min-h-screen bg-app text-text-primary">
      {/* Main dashboard body viewport */}
      <main className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
        <LandingView
          dashboards={dashboards}
          starredDashboards={starredDashboards}
          toggleStarDashboard={toggleStarDashboard}
          setActiveDashboardId={(id) => router.push(`/dashboards/${id}`)}
          landingViewMode={landingViewMode}
          setLandingViewMode={setLandingViewMode}
          setIsCreateDashboardOpen={setIsCreateDashboardOpen}
          handleDeleteDashboard={handleDeleteDashboard}
          isLoading={isLoading}
          fetchError={fetchError}
          onRetry={retryFetchDashboards}
        />
      </main>

      {/* Create Dashboard Modal */}
      <CreateDashboardModal
        isOpen={isCreateDashboardOpen}
        onClose={() => setIsCreateDashboardOpen(false)}
        name={newDashboardName}
        setName={setNewDashboardName}
        desc={newDashboardDesc}
        setDesc={setNewDashboardDesc}
        theme={newDashboardTheme}
        setTheme={setNewDashboardTheme}
        onCreate={handleCreateDashboard}
      />
    </div>
  );
}
