"use client";
import React, { memo, useState, useEffect, useRef } from "react";
import { Handle, Position, useReactFlow } from "@xyflow/react";
import { useWorkflowData } from "@/src/context/workflow-management/WorkflowContext";
import { Trash2, Table } from "lucide-react";

import { useEquipmentNodeState } from "../_hooks/useEquipmentNodeState";
import { NodePorts } from "./components/NodePorts";
import { ConnectionTable } from "./components/ConnectionTable";

import { parseGeneratedSvg } from "../_utils/SvgParser";

// Strips a catalog-key prefix (pnid_/ai_/api_) so saved componentTypes like
// "api_centrifugalpump" match backend names like "CentrifugalPump". The
// underscore is required, not optional: with `_?` a real equipment NAME that
// merely starts with "ai"/"api" (e.g. "AirCooler" → "rcooler") gets mangled
// and never matches its own catalog key.
const normalizeKey = (str) =>
  String(str || "")
    .toLowerCase()
    .replace(/^(pnid|ai|api)_/, "")
    .replace(/[^a-z0-9]/g, "");

export const IndustrialNode = memo(({ id, data, selected }) => {
  const { setNodes } = useReactFlow();
  const { catalog, nodeSizes, pnidComponents } = useWorkflowData();
  const componentType = data.componentType;
  const normalizedType = componentType
    ? componentType.toLowerCase().replace(/[^a-z0-9]/g, "")
    : "";

  const state = useEquipmentNodeState({
    id,
    data,
    componentType,
    normalizedType,
    setNodes,
  });

  const componentDef = React.useMemo(() => {
    if (!componentType) return null;
    const norm = normalizeKey(componentType);
    const foundKey = Object.keys(catalog).find(
      (key) => normalizeKey(key) === norm
    );
    if (foundKey && catalog[foundKey]) return catalog[foundKey];

    if (Array.isArray(pnidComponents)) {
      const match = pnidComponents.find(
        (c) => c?.name && normalizeKey(c.name) === norm
      );
      if (match?.code) {
        const parsed = parseGeneratedSvg(match.code);
        if (parsed) {
          return {
            viewBox: parsed.defaultViewBox,
            label: match.name,
            desc: match.description || "Industrial Component",
            render: (status, label) => {
              const res = parseGeneratedSvg(match.code, { status, label });
              if (!res?.svgMarkup) return null;
              return (
                <svg viewBox={res.defaultViewBox} width="100%" height="100%">
                  <g dangerouslySetInnerHTML={{ __html: res.svgMarkup }} />
                </svg>
              );
            },
          };
        }
      }
    }

    if (data?.code) {
      const parsed = parseGeneratedSvg(data.code);
      if (parsed) {
        return {
          viewBox: parsed.defaultViewBox,
          label: data.label || componentType,
          render: (status, label) => {
            const res = parseGeneratedSvg(data.code, { status, label });
            if (!res?.svgMarkup) return null;
            return (
              <svg viewBox={res.defaultViewBox} width="100%" height="100%">
                <g dangerouslySetInnerHTML={{ __html: res.svgMarkup }} />
              </svg>
            );
          },
        };
      }
    }

    return null;
  }, [catalog, componentType, pnidComponents, data]);

  const size = React.useMemo(() => {
    if (!componentType) return { w: 100, h: 100 };
    const norm = normalizeKey(componentType);
    const foundKey = Object.keys(nodeSizes).find(
      (key) => normalizeKey(key) === norm
    );
    return foundKey ? nodeSizes[foundKey] : { w: 100, h: 100 };
  }, [nodeSizes, componentType]);

  const renderedSvg = React.useMemo(() => {
    if (!componentDef) return null;
    return componentDef.render(data.status, data.label);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [componentDef, data.status, data.label]);

  const [aspectRatio, setAspectRatio] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!containerRef.current) return;
      const svgEl = containerRef.current.querySelector("svg");
      if (!svgEl) return;
      const parentG = svgEl.querySelector("g");
      const childG = svgEl.querySelector("g > g");
      const targetG = childG || parentG;
      if (childG && parentG) parentG.removeAttribute("transform");
      if (targetG) {
        try {
          const box = targetG.getBBox();
          if (box.width > 0 && box.height > 0) {
            setAspectRatio(box.width / box.height);
            svgEl.setAttribute("viewBox", `${box.x} ${box.y} ${box.width} ${box.height}`);
            svgEl.style.overflow = "visible";
          }
        } catch {
          // getBBox not supported in this context
        }
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [componentType, data.status, data.label]);

  if (!componentDef) {
    return (
      <div
        className={`relative group transition-all duration-300 flex flex-col items-center justify-center bg-surface-2 border-2 border-dashed border-border rounded-xl ${
          selected ? "ring-2 ring-brand ring-offset-4" : "hover:scale-[1.02]"
        }`}
        style={{ width: 120, height: 80 }}
      >
        <span className="text-[9px] text-text-muted font-mono uppercase text-center px-2 leading-snug line-clamp-3">
          {data.label}
        </span>
        {selected && (
          <button
            aria-label="Delete node"
            onClick={state.onDelete}
            className="absolute -top-3 -right-3 w-7 h-7 bg-danger hover:bg-danger-hover text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-all cursor-pointer z-50 pointer-events-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
        <NodePorts normalizedType={normalizedType} />
      </div>
    );
  }

  return (
    <div
      onDoubleClick={(e) => {
        e.stopPropagation();
        state.setIsEditing(true);
        state.setEditValue(data.label);
      }}
      className={`relative group transition-all duration-300 ${
        selected ? "ring-2 ring-brand ring-offset-4 rounded-xl" : "hover:scale-[1.02]"
      }`}
      style={{
        width: size.w,
        height: aspectRatio ? size.w / aspectRatio : size.h,
      }}
    >
      <div
        ref={containerRef}
        className="w-full h-full pointer-events-none flex items-center justify-center"
      >
        {renderedSvg}
      </div>

      <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 min-w-[60%] flex flex-col items-center">
        <div className="bg-surface-2 border border-border px-2 py-0.5 rounded shadow-lg">
          <p className="text-label font-mono font-black text-brand whitespace-nowrap tracking-wider uppercase">
            {data.label}
          </p>
        </div>
      </div>

      {state.isEditing && (
        <div className="absolute -bottom-8 left-0 w-full flex justify-center z-50">
          <input
            autoFocus
            className="w-[120px] bg-surface-2 border-2 border-brand rounded px-2 py-1 text-center font-black text-text-primary text-caption outline-none"
            value={state.editValue}
            onChange={(e) => state.setEditValue(e.target.value)}
            onBlur={state.saveLabel}
            onKeyDown={(e) => {
              if (e.key === "Enter") state.saveLabel();
              if (e.key === "Escape") state.setIsEditing(false);
            }}
            aria-label="Rename equipment node"
          />
        </div>
      )}

      {state.hasTrainConnections && (
        <button
          onClick={state.toggleTable}
          aria-label="Toggle connection table"
          className="absolute -top-3 -left-3 w-8 h-8 bg-brand hover:bg-brand-hover text-white rounded-lg flex items-center justify-center shadow-lg border-2 border-white transition-all hover:scale-110 active:scale-95 z-50 pointer-events-auto cursor-pointer"
        >
          <Table className="w-4 h-4" />
        </button>
      )}

      <ConnectionTable
        showTable={state.showTable}
        setShowTable={state.setShowTable}
        localConnections={state.localConnections}
        setLocalConnections={state.setLocalConnections}
        showCPCPColumn={state.showCPCPColumn}
        setShowCPCPColumn={state.setShowCPCPColumn}
        editingCell={state.editingCell}
        setEditingCell={state.setEditingCell}
        cellValue={state.cellValue}
        setCellValue={state.setCellValue}
        showCPCPDropdown={state.showCPCPDropdown}
        setShowCPCPDropdown={state.setShowCPCPDropdown}
        isNamingCustom={state.isNamingCustom}
        setIsNamingCustom={state.setIsNamingCustom}
        customCPCPName={state.customCPCPName}
        setCustomCPCPName={state.setCustomCPCPName}
        saveCellEdit={state.saveCellEdit}
        handleCellKeyDown={state.handleCellKeyDown}
        applyCPCPValue={state.applyCPCPValue}
        componentType={componentType}
        normalizedType={normalizedType}
      />

      {selected && !state.isEditing && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-brand/90 text-white text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md whitespace-nowrap animate-in fade-in zoom-in duration-300">
          SELECTED
        </div>
      )}

      <NodePorts normalizedType={normalizedType} />

      {selected && !state.isEditing && (
        <button
          aria-label="Delete node"
          onClick={state.onDelete}
          className="absolute -top-3 -right-3 w-7 h-7 bg-danger hover:bg-danger-hover text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-all hover:scale-110 active:scale-95 z-50 pointer-events-auto cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
});

IndustrialNode.displayName = "IndustrialNode";
