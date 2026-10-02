'use client';

import React from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  LayoutDashboard,
  Gauge,
  FileScan,
  FlaskConical,
  Waypoints,
  Microscope,
  GitBranch,
  BarChart3,
  UserCog,
  ScrollText,
  PanelLeft,
  TrendingUp,
  MessageSquareText,
  BotMessageSquare,
  Cog,
  BrainCircuit,
  UsersRound,
  Shield,
  Bell,
  Settings,
  Hash,
  Boxes,
  ShieldAlert,
  GitFork,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

/**
 * FEATURES — each entry defines a navigable feature section.
 * root     : the canonical home URL of that feature (breadcrumb is hidden when pathname === root)
 * label    : human-readable name shown as the first (home) crumb
 * icon     : lucide icon for the home crumb
 *
 * Order matters: more specific paths must come before shorter prefixes so the
 * longest-match wins (e.g. /admin/domain-configuration before /admin).
 */
const FEATURES = [
  { root: '/agent-factory',           label: 'Agent Factory',      icon: BotMessageSquare },
  { root: '/model-studio/ml-model',   label: 'Model Studio',       icon: FlaskConical },
  { root: '/model-studio/forecast',   label: 'Forecast',           icon: TrendingUp },
  { root: '/model-studio/optimizer',  label: 'Optimizer',          icon: Gauge },
  { root: '/model-studio/custom',     label: 'Custom Model',       icon: Settings },
  { root: '/workspace',               label: 'Workspace',          icon: PanelLeft },
  { root: '/workflow-management',     label: 'Workflow',           icon: GitBranch },
  { root: '/knowledge-graph',         label: 'Knowledge Graph',    icon: Waypoints },
  { root: '/symbolic-ai',             label: 'Symbolic AI',        icon: BrainCircuit },
  { root: '/admin/cpcp',              label: 'CPCP',               icon: Boxes },
  { root: '/admin/risk-template',     label: 'Risk Template',      icon: ShieldAlert },
  { root: '/admin/decision-template', label: 'Decision Template',  icon: GitFork },
  { root: '/dashboards',              label: 'Dashboards',         icon: Gauge },
  { root: '/rca',                     label: 'RCA',                icon: Microscope },
  { root: '/plant-gpt',               label: 'PlantGPT',           icon: MessageSquareText },
  { root: '/notifications',           label: 'Notifications',      icon: Bell },
  { root: '/work-orders',             label: 'Work Orders',        icon: ScrollText },
  { root: '/compressor-details',      label: 'Compressor Details', icon: Gauge },
  { root: '/admin/domain-configuration', label: 'Domain Config',      icon: Cog },
  { root: '/admin/data-activity',        label: 'Data Activity',      icon: BarChart3 },
  { root: '/admin/group-management',     label: 'Groups',             icon: UsersRound },
  { root: '/admin/user-registry',        label: 'User Registry',      icon: UserCog },
  { root: '/admin/log-management',       label: 'Log Management',     icon: ScrollText },
  { root: '/home',                    label: 'CPCP Config',        icon: Settings },
  { root: '/scenario-extractor',      label: 'Scenario Extractor', icon: FileScan },
  { root: '/visuals',                 label: 'Visuals',            icon: TrendingUp },
];

// Sub-segment labels + icons for known path slugs
const SEGMENT_META = {
  'notification':          { label: 'Notification',        icon: Bell },
  'notification-observation':{ label: 'Observation',       icon: Bell },
  'work-order':            { label: 'Work Order',          icon: ScrollText },
  'investigation':         { label: 'Investigation',       icon: Microscope },
  'tag-analysis':          { label: 'Tag Analysis',        icon: BarChart3 },
  'monitor':               { label: 'Monitor',             icon: Gauge },
  'create':                { label: 'Create',              icon: Settings },
  'overview':              { label: 'Overview',            icon: LayoutDashboard },
  'forecast':              { label: 'Forecast',            icon: TrendingUp },
  'optimizer':             { label: 'Optimizer',           icon: Gauge },
  'custom':                { label: 'Custom',              icon: Settings },
  'ml-model':              { label: 'ML Model',            icon: FlaskConical },
};

// Match UUIDs, long hex strings, or numeric IDs
const isDynamic = (seg) => /^[0-9a-f-]{8,}$|^\d+$/.test(seg);

function toTitleCase(slug) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// Find the best-matching feature for a given pathname (longest root wins)
function resolveFeature(pathname) {
  return FEATURES.slice()
    .sort((a, b) => b.root.length - a.root.length)
    .find((f) => pathname === f.root || pathname.startsWith(f.root + '/'));
}

// Build only the sub-crumbs relative to featureRoot
function buildSubCrumbs(featureRoot, pathname) {
  const rest = pathname.slice(featureRoot.length); // e.g. '/abc123/investigation'
  const segments = rest.split('/').filter(Boolean);
  const crumbs = [];
  let path = featureRoot;

  for (const seg of segments) {
    path += '/' + seg;
    if (isDynamic(seg)) {
      crumbs.push({ label: seg.slice(0, 8), href: path, icon: Hash, dynamic: true });
    } else {
      const m = SEGMENT_META[seg];
      crumbs.push({
        label: m?.label ?? toTitleCase(seg),
        href: path,
        icon: m?.icon ?? null,
        dynamic: false,
      });
    }
  }

  return crumbs;
}

/**
 * crumbs (optional) — explicit override for state-based navigation (no URL change).
 *   undefined → auto-derive from pathname (default)
 *   []        → hide breadcrumb
 *   [{label, icon?, href?}] → use these as the sub-crumbs; feature home is still auto-resolved
 */
export function Breadcrumb({ pathname, crumbs: explicitCrumbs }) {
  const feature = resolveFeature(pathname);

  if (!feature) return null;

  // Explicit mode: empty array = hide, non-empty = render those crumbs
  if (explicitCrumbs !== undefined) {
    if (explicitCrumbs.length === 0) return null;
    return <BreadcrumbBar feature={feature} subCrumbs={explicitCrumbs} />;
  }

  // Auto mode: hide when at feature home
  if (pathname === feature.root) return null;
  const subCrumbs = buildSubCrumbs(feature.root, pathname);
  if (!subCrumbs.length) return null;

  return <BreadcrumbBar feature={feature} subCrumbs={subCrumbs} />;
}

function BreadcrumbBar({ feature, subCrumbs }) {
  const FeatureIcon = feature.icon;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        'flex items-center gap-0.5 px-4 sm:px-6 py-1',
        'overflow-x-auto flex-nowrap',
        'border-t border-border/40',
        'bg-canvas/70',
      )}
    >
      {/* Feature home — always the first anchor */}
      <Link
        href={feature.root}
        aria-label={`${feature.label} home`}
        className={cn(
          'crumb-animate group flex items-center gap-1 px-2 py-0.5 rounded-md shrink-0',
          'text-text-muted',
          'hover:text-text-secondary',
          'hover:bg-surface-2',
          'transition-all duration-150',
          'text-label font-medium leading-none',
        )}
      >
        <FeatureIcon
          className="w-3 h-3 shrink-0 transition-transform duration-150 group-hover:scale-110"
          aria-hidden="true"
        />
        {feature.label}
      </Link>

      {/* Sub-page crumbs */}
      {subCrumbs.map((crumb, i) => {
        const isLast = i === subCrumbs.length - 1;
        const Icon = crumb.icon;
        const delay = `${(i + 1) * 45}ms`;

        return (
          <React.Fragment key={`${crumb.href ?? crumb.label ?? 'crumb'}-${i}`}>
            <ChevronRight
              className="w-3 h-3 text-border-strong shrink-0"
              aria-hidden="true"
            />

            {isLast ? (
              <span
                aria-current="page"
                style={{ animationDelay: delay }}
                className={cn(
                  'crumb-animate flex items-center gap-1 px-2 py-0.5 rounded-md shrink-0',
                  'bg-brand-muted',
                  'text-brand',
                  'text-label font-semibold leading-none select-none',
                )}
              >
                {Icon && <Icon className="w-3 h-3 shrink-0" aria-hidden="true" />}
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                style={{ animationDelay: delay }}
                className={cn(
                  'crumb-animate group flex items-center gap-1 px-2 py-0.5 rounded-md shrink-0',
                  'text-text-muted',
                  'hover:text-text-secondary',
                  'hover:bg-surface-2',
                  'transition-all duration-150',
                  'text-label font-medium leading-none',
                )}
              >
                {Icon && (
                  <Icon
                    className="w-3 h-3 shrink-0 transition-transform duration-150 group-hover:scale-110"
                    aria-hidden="true"
                  />
                )}
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
