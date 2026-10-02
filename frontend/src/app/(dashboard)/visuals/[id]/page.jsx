'use client';
import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCleanUsername, normName } from '@/src/lib/dashboards.utils';
import { WorkspaceViewer } from '../_components/WorkspaceViewer';
import { useListTags, useSavedVisuals } from '../_queries/useVisualsQueries';

const FALLBACK_TAGS = [];

function Shell({ children }) {
  return <>{children}</>;
}

function LoadingSkeleton() {
  return (
    <Shell>
      {/* Toolbar skeleton */}
      <div className="shrink-0 border-b border-border bg-surface px-4 py-2 flex items-center gap-3">
        <div className="h-7 w-16 rounded-lg bg-surface-2 animate-pulse" />
        <div className="w-px h-5 bg-border" />
        <div className="h-4 w-36 rounded-lg bg-surface-2 animate-pulse" />
        <div className="ml-auto flex items-center gap-2">
          <div className="h-7 w-32 rounded-lg bg-surface-2 animate-pulse" />
          <div className="h-7 w-20 rounded-lg bg-surface-2 animate-pulse" />
        </div>
      </div>
      {/* Sub-toolbar skeleton */}
      <div className="shrink-0 border-b border-border bg-surface px-4 py-1.5 flex items-center gap-2">
        <div className="h-6 w-20 rounded-full bg-surface-2 animate-pulse" />
        <div className="h-6 w-16 rounded-full bg-surface-2 animate-pulse" />
      </div>
      {/* Chart area skeleton */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[skeleton-shimmer_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-border to-transparent pointer-events-none" />
        <div className="flex flex-col gap-px h-full p-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-1 rounded-xl bg-surface-2 animate-pulse" />
          ))}
        </div>
      </div>
    </Shell>
  );
}

export default function VisualDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const idStr = Array.isArray(id) ? id[0] : (id ?? '');
  const backendName = idStr.startsWith('backend_') ? idStr.slice(8) : idStr;
  const username = getCleanUsername();

  const { data: tagsRes } = useListTags({ username });
  const { data: savedRes, isLoading } = useSavedVisuals(
    { username, dashboard_name: backendName },
    { enabled: Boolean(backendName) }
  );

  const allTags = useMemo(() => {
    return Array.isArray(tagsRes) ? tagsRes : (tagsRes?.data || FALLBACK_TAGS);
  }, [tagsRes]);

  const workspace = useMemo(() => {
    if (!backendName) return null;
    let tags = [];
    if ((savedRes?.success || savedRes?.statusCode === 200) && savedRes.data) {
      const matched = Array.isArray(savedRes.data)
        ? savedRes.data.find(v => normName(v.dashboardName) === normName(backendName))
        : (normName(savedRes.data.dashboardName) === normName(backendName) ? savedRes.data : null);
      if (matched?.tagId && Array.isArray(matched.tagId)) {
        tags = matched.tagId.map(tid => tid.split('.').pop() || tid);
      }
    }
    return {
      id: `backend_${backendName}`,
      name: backendName.charAt(0).toUpperCase() + backendName.slice(1),
      backendName,
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isBackend: true,
    };
  }, [backendName, savedRes]);

  const [localWorkspaceOverride, setLocalWorkspaceOverride] = useState(null);

  if (isLoading && !savedRes) return <LoadingSkeleton />;

  return (
    <Shell>
      <WorkspaceViewer
        workspace={localWorkspaceOverride || workspace}
        allTags={allTags}
        onBack={() => router.push('/visuals')}
        onSave={updated => setLocalWorkspaceOverride(updated)}
      />
    </Shell>
  );
}
