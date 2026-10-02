'use client';
import { useRef, useEffect, useState, useCallback } from 'react';
import { Transformer } from 'markmap-lib';
import { Markmap } from 'markmap-view';

const transformer = new Transformer();

if (typeof document !== 'undefined') {
  const styleId = 'markmap-rename-flash';
  if (!document.getElementById(styleId)) {
    const s = document.createElement('style');
    s.id = styleId;
    s.textContent = [
      '@keyframes mm-rename-flash {',
      '  0%   { filter: drop-shadow(0 0 6px #6366f1) brightness(1.15); }',
      '  60%  { filter: drop-shadow(0 0 10px #6366f1) brightness(1.2); }',
      '  100% { filter: none; }',
      '}',
      '.mm-renamed { animation: mm-rename-flash 900ms ease-out forwards; }',
    ].join('\n');
    document.head.appendChild(s);
  }
}

function snapshotFoldState(root) {
  const map = new Map();
  const walk = (node) => {
    if (!node) return;
    const key = node.content ?? '';
    if (key) map.set(key, node.payload?.fold ?? 0);
    (node.children ?? []).forEach(walk);
  };
  walk(root);
  return map;
}

function restoreFoldState(root, snap) {
  const walk = (node) => {
    if (!node) return;
    const key = node.content ?? '';
    if (snap.has(key)) node.payload = { ...(node.payload ?? {}), fold: snap.get(key) };
    (node.children ?? []).forEach(walk);
  };
  walk(root);
}

function flashRenamedNode(svgEl, newContent) {
  if (!svgEl) return;
  const nodes = svgEl.querySelectorAll('.markmap-node');
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const text = node.querySelector('text, foreignObject')?.textContent ?? '';
    if (text.replace(/<!--.*?-->/g, '').trim().includes(newContent)) {
      node.classList.remove('mm-renamed');
      void node.offsetWidth;
      node.classList.add('mm-renamed');
      setTimeout(() => node.classList.remove('mm-renamed'), 950);
      break;
    }
  }
}

export function useMarkmap({ markdown, ruleKey, fitKey, onDeleteNode, onRenameNode }) {
  const svgRef = useRef(null);
  const mmRef = useRef(null);
  const containerRef = useRef(null);
  const renameInputRef = useRef(null);
  const pendingRenameRef = useRef(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  const updateDimensions = () => {
    if (!containerRef.current || !svgRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    if (width > 0 && height > 0) {
      svgRef.current.setAttribute('width', `${width}`);
      svgRef.current.setAttribute('height', `${height}`);
      svgRef.current.setAttribute('viewBox', `0 0 ${width} ${height}`);
      return true;
    }
    return false;
  };

  const safeFit = (mm) => {
    if (!mm || !svgRef.current) return;
    const { width, height } = svgRef.current.getBoundingClientRect();
    if (width > 0 && height > 0) mm.fit();
  };

  const openMenu = useCallback((e, nodeContent, rawContent, type, ancestorPath = []) => {
    e.preventDefault();
    e.stopPropagation();
    if (!nodeContent) return;
    const containerRect = containerRef.current?.getBoundingClientRect();
    const x = e.clientX - (containerRect?.left ?? 0);
    const y = e.clientY - (containerRect?.top ?? 0);
    setContextMenu({ x, y, nodeContent, rawContent, type, ancestorPath });
    if (type === 'rename') {
      const colonIndex = nodeContent.indexOf(':');
      setRenameValue(colonIndex !== -1 ? nodeContent.substring(colonIndex + 1).trim() : nodeContent);
    }
  }, []);

  const handleGlobalContextMenu = useCallback((e) => {
    if (!svgRef.current) return;
    e.preventDefault();
    const target = e.target;
    let node = target.closest('.markmap-node');
    if (!node) {
      const linkEl = target.classList?.contains('markmap-link') ? target : null;
      if (!linkEl) return;
      const linkData = linkEl.__data__;
      const targetINode = linkData?.target;
      if (!targetINode) return;
      const allNodes = svgRef.current.querySelectorAll('g.markmap-node');
      for (const n of allNodes) { if (n.__data__ === targetINode) { node = n; break; } }
      if (!node) return;
    }
    const textEl = node.querySelector('text, foreignObject');
    const rawTextContent = textEl?.textContent?.trim() || '';
    const content = rawTextContent.replace(/<!--.*?-->/g, '').trim();
    if (!content) return;
    const d3Data = node.__data__;
    const iNodeRawContent = d3Data?.content ?? content;
    const ancestorPath = [];
    try {
      const rootData = mmRef.current?.state?.data;
      if (d3Data && rootData) {
        const stripHtml = (html) => (html ?? '').replace(/<[^>]*>/g, '').trim();
        const findAncestors = (inode, acc) => {
          if (inode === d3Data) return acc;
          for (const child of inode.children ?? []) {
            const found = findAncestors(child, [...acc, stripHtml(inode.content)]);
            if (found) return found;
          }
          return null;
        };
        const found = findAncestors(rootData, []);
        if (found) ancestorPath.push(...found.reverse());
      }
    } catch { }
    openMenu(e, content, iNodeRawContent, 'rename', ancestorPath);
  }, [openMenu]);

  // Effect 1: Initialize markmap on mount (not on markdown changes)
  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;
    const cleanup = () => {
      if (svgRef.current) { svgRef.current.innerHTML = ''; svgRef.current.oncontextmenu = null; }
      mmRef.current = null;
    };
    const init = () => {
      if (!containerRef.current || !svgRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;
      cleanup();
      svgRef.current.setAttribute('width', `${width}`);
      svgRef.current.setAttribute('height', `${height}`);
      svgRef.current.setAttribute('viewBox', `0 0 ${width} ${height}`);
      svgRef.current.oncontextmenu = handleGlobalContextMenu;
      const { root } = transformer.transform(markdown);
      // Start fully collapsed (root node only) — large rule bases render as an
      // unreadable wall of nodes if expanded by default. User expands manually.
      const mm = Markmap.create(svgRef.current, { autoFit: false, duration: 500, paddingX: 24, initialExpandLevel: 0 }, root);
      mmRef.current = mm;
      setTimeout(() => safeFit(mm), 600);
    };
    const observer = new ResizeObserver(() => {
      if (mmRef.current) { updateDimensions(); safeFit(mmRef.current); } else { init(); }
    });
    observer.observe(containerRef.current);
    init();
    return () => { observer.disconnect(); cleanup(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleGlobalContextMenu]);

  // Effect 2: Push data changes without resetting zoom/pan/fold
  useEffect(() => {
    if (!mmRef.current) return;
    const liveRoot = mmRef.current.state?.data;
    const snap = liveRoot ? snapshotFoldState(liveRoot) : new Map();
    const { root } = transformer.transform(markdown);
    const pending = pendingRenameRef.current;
    if (pending) {
      const oldFold = snap.get(pending.oldRawContent) ?? 0;
      const walkForNewKey = (node) => {
        if (!node) return null;
        const rawKey = node.content ?? '';
        if (rawKey.includes(pending.newContent)) return rawKey;
        for (const child of node.children ?? []) {
          const found = walkForNewKey(child);
          if (found) return found;
        }
        return null;
      };
      snap.set(walkForNewKey(root) ?? pending.newContent, oldFold);
      pendingRenameRef.current = null;
    }
    const mmAny = mmRef.current;
    const prevExpandLevel = mmAny.options?.initialExpandLevel ?? 0;
    const prevDuration = mmAny.options?.duration ?? 500;
    if (snap.size > 0) restoreFoldState(root, snap);
    // 0, not -1: existing nodes keep their restored fold state regardless (they
    // already have an explicit payload.fold), but any brand-new node introduced
    // by this edit should also start collapsed, not fully expanded.
    if (mmAny.options) mmAny.options.initialExpandLevel = 0;
    const done = mmRef.current.setData(root);
    if (mmAny.options) mmAny.options.duration = 0;
    done?.finally?.(() => {
      if (mmAny.options) { mmAny.options.duration = prevDuration; mmAny.options.initialExpandLevel = prevExpandLevel; }
      if (pending?.newContent) flashRenamedNode(svgRef.current, pending.newContent);
    });
  }, [markdown]);

  useEffect(() => {
    if (!mmRef.current || !ruleKey) return;
    const t = setTimeout(() => safeFit(mmRef.current), 300);
    return () => clearTimeout(t);
  }, [ruleKey]);

  useEffect(() => {
    if (!mmRef.current || fitKey === undefined) return;
    const t = setTimeout(() => safeFit(mmRef.current), 350);
    return () => clearTimeout(t);
  }, [fitKey]);

  useEffect(() => {
    if (contextMenu?.type === 'rename') setTimeout(() => renameInputRef.current?.focus(), 50);
  }, [contextMenu]);

  useEffect(() => {
    if (!contextMenu || isRenaming) return;
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [contextMenu, isRenaming]);

  const handleDelete = () => {
    if (!contextMenu || !onDeleteNode) return;
    onDeleteNode(contextMenu.nodeContent, contextMenu.ancestorPath);
    setContextMenu(null);
  };

  const handleRename = async () => {
    if (!contextMenu || !onRenameNode || !renameValue.trim()) return;
    if (renameValue.trim() !== contextMenu.nodeContent) {
      pendingRenameRef.current = { oldRawContent: contextMenu.rawContent, newContent: renameValue.trim() };
      setIsRenaming(true);
      try {
        await onRenameNode(contextMenu.nodeContent, renameValue.trim(), contextMenu.ancestorPath);
      } finally {
        setIsRenaming(false);
      }
    }
    setContextMenu(null);
  };

  return { svgRef, containerRef, renameInputRef, contextMenu, setContextMenu, renameValue, setRenameValue, isRenaming, handleDelete, handleRename };
}
