'use client';
import React from 'react';
import { Plus, MessageSquare, Trash2, ChevronLeft, ChevronRight, Search, FileText, Pencil, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip } from '@/src/components/ui/Tooltip';
import { DRAFT_SESSION_ID, INITIAL_GREETING } from '../plant-gpt.types';

export function SessionSidebar({
  sessions, currentSessionId, isSidebarCollapsed, isMobileMenuOpen,
  searchQuery, renamingId, tempRenameValue, menuOpenId, isDark,
  onSelectSession, onNewChat, onDeleteSession, onStartRename,
  onRenameConfirm, onRenameCancel, onTempRenameChange,
  onToggleCollapse, onToggleMobileMenu, onMenuToggle, onSearchChange,
}) {
  const activeSession = sessions.find(s => s.id === currentSessionId) || {
    id: DRAFT_SESSION_ID,
    title: 'New Discussion',
    messages: [INITIAL_GREETING('Operator')],
    lastUpdated: new Date().toISOString(),
  };

  const groupedSessions = (() => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const groups = [
      { title: 'TODAY', items: [] },
      { title: 'YESTERDAY', items: [] },
      { title: 'PREVIOUS', items: [] },
    ];
    if (currentSessionId === DRAFT_SESSION_ID && ('new discussion'.includes(searchQuery.toLowerCase()) || !searchQuery)) {
      groups[0].items.push(activeSession);
    }
    sessions
      .filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter(s => s.messages.some(m => m.sender === 'user'))
      .forEach(s => {
        const date = new Date(s.lastUpdated);
        if (date.toDateString() === today.toDateString()) groups[0].items.push(s);
        else if (date.toDateString() === yesterday.toDateString()) groups[1].items.push(s);
        else groups[2].items.push(s);
      });
    return groups.filter(g => g.items.length > 0);
  })();

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? 68 : 280 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="fixed lg:relative flex flex-col shrink-0 h-full z-30 overflow-hidden bg-surface border-r border-border"
      >
        {/* Header */}
        <div className={`pt-3.5 pb-3 border-b border-border bg-surface shrink-0 ${isSidebarCollapsed ? 'px-2' : 'px-3'}`}>
          <Tooltip label="New Discussion" side="right" disabled={!isSidebarCollapsed}>
            <button
              onClick={onNewChat}
              aria-label="New Discussion"
              className={`flex items-center justify-center gap-2 rounded-xl border border-transparent bg-brand text-white text-[13px] font-bold cursor-pointer transition-all whitespace-nowrap shadow-brand hover:opacity-85 ${
                isSidebarCollapsed ? 'w-11 h-11 mx-auto' : 'w-full px-4 py-2.5'
              }`}
            >
              <Plus className="w-[15px] h-[15px] shrink-0" />
              {!isSidebarCollapsed && 'New Discussion'}
            </button>
          </Tooltip>

          {isSidebarCollapsed ? (
            <Tooltip label="Search history" side="right">
              <button
                onClick={onToggleCollapse}
                aria-label="Search history"
                className="mt-2.5 w-11 h-11 mx-auto flex items-center justify-center rounded-[10px] bg-canvas border border-border text-text-subtle cursor-pointer transition-colors hover:text-brand"
              >
                <Search className="w-[14px] h-[14px]" />
              </button>
            </Tooltip>
          ) : (
            <div className="mt-2.5 relative">
              <Search className="w-[13px] h-[13px] absolute left-2.5 top-1/2 -translate-y-1/2 text-text-subtle" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                className="w-full box-border bg-canvas border border-border rounded-[10px] py-2 pr-2.5 pl-[30px] text-xs font-semibold text-text-secondary outline-none transition-colors focus:border-highlight/40"
              />
            </div>
          )}
        </div>

        {/* Session list */}
        <div className={`flex-1 overflow-y-auto py-2.5 plant-scrollbar-sm ${isSidebarCollapsed ? 'px-2' : 'px-2'}`}>
          {groupedSessions.length === 0 ? (
            isSidebarCollapsed ? (
              <Tooltip label="No discussions found" side="right">
                <div className="mx-auto my-4 w-11 h-11 flex items-center justify-center bg-canvas border border-dashed border-border rounded-[14px]">
                  <MessageSquare className="w-4 h-4 text-text-subtle" />
                </div>
              </Tooltip>
            ) : (
              <div className="mx-2 my-4 px-4 py-6 text-center bg-canvas border border-dashed border-border rounded-[14px]">
                <MessageSquare className="w-7 h-7 text-text-subtle mx-auto mb-2" />
                <p className="m-0 text-[10px] font-bold uppercase tracking-[0.08em] text-text-subtle">
                  No discussions found
                </p>
              </div>
            )
          ) : (
            groupedSessions.map(group => (
              <div key={group.title} className="mb-4">
                {!isSidebarCollapsed && (
                  <div className="flex items-center gap-2 px-2 pt-1 pb-2 mb-0.5">
                    <div className="flex-1 h-px bg-surface-2" />
                    <span className="text-[9px] font-black uppercase tracking-[0.1em] text-text-subtle whitespace-nowrap">
                      {group.title}
                    </span>
                    <div className="flex-1 h-px bg-surface-2" />
                  </div>
                )}

                <div className="flex flex-col gap-0.5">
                  {group.items.map(s => {
                    const isActive = currentSessionId === s.id;
                    const isMenuOpen = menuOpenId === s.id;

                    if (isSidebarCollapsed) {
                      return (
                        <Tooltip key={s.id} label={s.title} side="right">
                          <button
                            onClick={() => onSelectSession(s.id)}
                            aria-label={s.title}
                            className={`w-11 h-11 mx-auto flex items-center justify-center rounded-[10px] cursor-pointer transition-all border ${
                              isActive
                                ? 'bg-brand-muted border-brand/20'
                                : 'border-transparent hover:bg-canvas'
                            }`}
                          >
                            <FileText className={`w-[15px] h-[15px] shrink-0 ${isActive ? 'text-brand' : 'text-text-subtle'}`} />
                          </button>
                        </Tooltip>
                      );
                    }

                    return (
                      <div
                        key={s.id}
                        className={`group relative flex items-center px-2 py-[7px] rounded-[10px] h-10 overflow-visible cursor-pointer transition-all ${
                          isActive
                            ? 'bg-brand-muted border border-brand/20'
                            : 'border border-transparent hover:bg-canvas'
                        }`}
                      >
                        <button onClick={() => onSelectSession(s.id)} className="flex-1 flex items-center gap-2 overflow-hidden bg-transparent border-none cursor-pointer text-left p-0 min-w-0">
                          <FileText className={`w-[13px] h-[13px] shrink-0 ${isActive ? 'text-brand' : 'text-text-subtle'}`} />
                          {renamingId === s.id ? (
                            <input
                              autoFocus
                              value={tempRenameValue}
                              onChange={e => onTempRenameChange(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') onRenameConfirm(s.id); if (e.key === 'Escape') onRenameCancel(); }}
                              onBlur={() => onRenameConfirm(s.id)}
                              onClick={e => e.stopPropagation()}
                              className="flex-1 bg-surface border border-highlight/40 rounded-md px-[7px] py-0.5 text-xs font-semibold text-text-secondary outline-none"
                            />
                          ) : (
                            <span className={`flex-1 text-[12.5px] font-semibold overflow-hidden text-ellipsis whitespace-nowrap ${isActive ? 'text-brand' : 'text-text-subtle'}`}>
                              {s.title}
                            </span>
                          )}
                        </button>

                        {/* More menu trigger (active / menu-open) */}
                        {(isActive || isMenuOpen) && (
                          <div className="relative shrink-0 session-menu-container">
                            <button
                              onClick={e => { e.stopPropagation(); onMenuToggle(isMenuOpen ? null : s.id); }}
                              aria-label="Session options"
                              className={`w-6 h-6 rounded-[7px] flex items-center justify-center border-none cursor-pointer text-text-subtle transition-all ${isMenuOpen ? 'bg-surface-2' : 'bg-transparent'}`}
                            >
                              <MoreHorizontal className="w-[14px] h-[14px]" />
                            </button>

                            <AnimatePresence>
                              {isMenuOpen && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.94, x: 8 }}
                                  animate={{ opacity: 1, scale: 1, x: 0 }}
                                  exit={{ opacity: 0, scale: 0.94, x: 8 }}
                                  className="absolute right-0 top-full mt-1 w-[120px] bg-surface border border-border rounded-xl shadow-panel z-60 overflow-hidden p-1"
                                >
                                  <button
                                    onClick={e => { e.stopPropagation(); onStartRename(s.id, s.title); }}
                                    className="w-full flex items-center gap-[7px] px-2.5 py-[7px] rounded-lg bg-transparent border-none cursor-pointer text-xs font-bold text-text-secondary transition-colors text-left hover:bg-canvas"
                                  >
                                    <Pencil className="w-3 h-3" /> Rename
                                  </button>

                                  {isActive && (
                                    <button
                                      onClick={e => { e.stopPropagation(); onDeleteSession(s.id); }}
                                      className="w-full flex items-center gap-[7px] px-2.5 py-[7px] rounded-lg bg-transparent border-none border-t border-surface-2 cursor-pointer text-xs font-bold text-danger transition-colors text-left mt-0.5 hover:bg-danger/10"
                                    >
                                      <Trash2 className="w-3 h-3" /> Delete
                                    </button>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}

                        {/* Hover-only more button for non-active sessions */}
                        {!isActive && !isMenuOpen && (
                          <button
                            onClick={e => { e.stopPropagation(); onMenuToggle(s.id); }}
                            className="hidden group-hover:flex w-6 h-6 rounded-[7px] items-center justify-center bg-transparent border-none cursor-pointer text-text-subtle hover:text-text-secondary"
                          >
                            <MoreHorizontal className="w-[14px] h-[14px]" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>


      </motion.aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggleMobileMenu}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20"
          />
        )}
      </AnimatePresence>

      <button
        onClick={onToggleCollapse}
        aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className={`hidden lg:flex absolute top-1/2 -translate-y-1/2 w-7 h-7 bg-surface border border-border rounded-full items-center justify-center z-40 cursor-pointer shadow-card transition-[left] duration-[var(--duration-slow,250ms)] ease-in-out text-text-subtle hover:text-brand ${isSidebarCollapsed ? 'left-13.5' : 'left-[268px]'}`}
      >
        {isSidebarCollapsed ? <ChevronRight className="w-[14px] h-[14px]" /> : <ChevronLeft className="w-[14px] h-[14px]" />}
      </button>
    </>
  );
}
