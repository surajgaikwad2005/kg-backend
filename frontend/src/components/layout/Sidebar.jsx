"use client";

import React, { useState, useEffect } from "react";
import { Waypoints, ChevronLeft, PanelLeftOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { BrandLogo } from "@/src/components/ui/BrandLogo";

// Demo build: the app has one feature, so the sidebar is a single entry.
// The collapse animation + shell styling are kept from the original.
const NAV = [{ href: "/knowledge-graph", icon: Waypoints, label: "Knowledge Graph" }];

const SIDEBAR_COLLAPSED_KEY = "sidebar:collapsed";

function readCollapsed() {
  try { return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true"; } catch { return false; }
}

export default function Sidebar({ initialCollapsed = false }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsedState] = useState(initialCollapsed);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => { setIsCollapsedState(readCollapsed()); }, []);

  const setIsCollapsed = (val) => {
    setIsCollapsedState(val);
    try { localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(val)); } catch {}
  };

  const showTooltip = (e, label) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ label, y: rect.top + rect.height / 2 });
  };
  const hideTooltip = () => setTooltip(null);

  return (
    <aside
      className={cn(
        "bg-surface border-r border-border flex flex-col shrink-0 sticky top-0 h-screen z-30",
        "transition-[width] duration-[var(--duration-slow,500ms)] ease-[cubic-bezier(0.32,0.72,0,1)]",
        isCollapsed ? "w-18" : "w-64",
      )}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-brand via-brand-hover to-brand" />

      {/* Header */}
      <div className="relative h-17 shrink-0 border-b border-border overflow-hidden">
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          aria-label="Expand sidebar"
          title="Expand sidebar"
          className={cn(
            "group/logobtn absolute inset-0 flex items-center justify-center cursor-pointer transition-opacity",
            isCollapsed ? "opacity-100 duration-[var(--duration-base,300ms)] delay-150" : "opacity-0 pointer-events-none duration-[var(--duration-fast,150ms)]",
          )}
        >
          <Image
            src="/images/TAI_logo.png"
            alt="TAI"
            width={34}
            height={34}
            className="object-contain transition-all duration-[var(--duration-base,300ms)] group-hover/logobtn:opacity-0 group-hover/logobtn:scale-75 dark:brightness-0 dark:invert"
            priority
          />
          <span className="absolute inset-0 flex items-center justify-center opacity-0 scale-75 group-hover/logobtn:opacity-100 group-hover/logobtn:scale-100 transition-all duration-[var(--duration-base,300ms)]">
            <span className="flex items-center justify-center w-8 h-8 rounded-xl border border-brand/30 bg-brand-muted shadow-sm">
              <PanelLeftOpen className="w-4 h-4 text-brand" />
            </span>
          </span>
        </button>

        <div
          className={cn(
            "absolute inset-0 flex items-center justify-between px-4 transition-opacity",
            isCollapsed ? "opacity-0 pointer-events-none duration-[var(--duration-fast,150ms)]" : "opacity-100 duration-[var(--duration-base,300ms)] delay-150",
          )}
        >
          <div className="flex items-center overflow-hidden max-w-[160px]">
            <BrandLogo width={160} height={44} priority />
          </div>

          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            aria-label="Collapse sidebar"
            className={cn(
              "flex items-center justify-center rounded-xl transition-all duration-[var(--duration-fast,150ms)] shrink-0",
              "w-8 h-8 border border-border bg-surface shadow-sm",
              "hover:bg-surface-2 hover:border-border-strong hover:shadow-md",
              "active:scale-95 cursor-pointer",
            )}
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4 text-text-muted" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav
        aria-label="Main navigation"
        className="sidebar-nav flex flex-col gap-0.5 flex-1 overflow-y-auto overflow-x-hidden py-3 px-3"
      >
        {NAV.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              aria-label={label}
              onMouseEnter={(e) => isCollapsed && showTooltip(e, label)}
              onMouseLeave={hideTooltip}
              className={cn(
                "group/item relative flex items-center h-10 rounded-xl overflow-hidden cursor-pointer",
                "transition-colors duration-[var(--duration-fast,150ms)]",
                isActive
                  ? "bg-brand text-white shadow-md shadow-brand/25"
                  : "text-text-muted hover:text-text-primary hover:bg-surface-2",
              )}
            >
              {isActive && (
                <span className="absolute inset-0 rounded-xl bg-brand opacity-10 blur-sm pointer-events-none" />
              )}
              <span className="grid place-items-center w-12 shrink-0">
                <Icon
                  className={cn(
                    "w-4.5 h-4.5 transition-transform duration-[var(--duration-fast,150ms)]",
                    isActive
                      ? "text-white"
                      : "text-text-muted group-hover/item:text-text-primary group-hover/item:scale-110",
                  )}
                />
              </span>
              <span
                className={cn(
                  "truncate text-body-sm font-semibold leading-tight whitespace-nowrap transition-opacity",
                  isCollapsed ? "opacity-0 duration-[var(--duration-fast,150ms)]" : "opacity-100 duration-[var(--duration-base,300ms)] delay-150",
                  isActive ? "text-white" : "",
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {isCollapsed && tooltip && (
        <div
          className="fixed z-200 pointer-events-none"
          style={{ top: tooltip.y, left: 78, transform: "translateY(-50%)" }}
        >
          <div
            key={tooltip.label}
            className="flex items-center gap-0 animate-in fade-in slide-in-from-left-1 duration-[var(--duration-fast,150ms)] ease-out"
          >
            <div className="w-0 h-0 border-y-[5px] border-y-transparent border-r-[6px] border-r-overlay" />
            <div className="bg-overlay text-white text-body-sm font-semibold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap tracking-wide">
              {tooltip.label}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
