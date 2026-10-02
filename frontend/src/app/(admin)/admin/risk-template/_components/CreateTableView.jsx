'use client';
import React, { useRef, useState, useCallback } from 'react';
import { Database, Plus, Save, Loader2, Trash2, PlusCircle, X } from 'lucide-react';
import { removeColumns, setColumns as apiSetColumns, deleteData, addData } from '@/src/services/risk-template/riskTemplateService';
import { useToast } from '@/src/components/ui/Toast';
import { useApp } from '@/src/context/AppContext';

/**
 * Manual risk template table builder — shown when viewMode === 'create'.
 */
export function CreateTableView({ ruleName, templateName = ruleName, onStoreKnowledge }) {
  const name = templateName || ruleName;
  const toast = useToast();
  const { plantCode } = useApp();
  const [columns, setColumns] = useState(() =>
    Array.from({ length: 5 }, () => ({ id: Math.random().toString(36).substr(2, 9), name: '' }))
  );
  const [rows, setRows] = useState([]);
  const [isColumnsSaved, setIsColumnsSaved] = useState(false);
  const [isSavingColumns, setIsSavingColumns] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef(null);

  const addColumn = useCallback(() => {
    const newColId = Math.random().toString(36).substr(2, 9);
    setColumns(prev => [...prev, { id: newColId, name: '' }]);
    setIsColumnsSaved(false);
    setTimeout(() => { if (scrollRef.current) scrollRef.current.scrollLeft = scrollRef.current.scrollWidth; }, 50);
  }, []);

  const removeColumn = useCallback(async (idx) => {
    const col = columns[idx];
    if (col.name.trim() && isColumnsSaved) {
      try {
        await removeColumns({ template_name: name, columns: [col.name] }, plantCode);
      } catch (err) {
        toast.error('Remove failed', err.message);
      }
    }
    setColumns(cols => cols.filter((_, i) => i !== idx));
  }, [columns, isColumnsSaved, name, plantCode, toast]);

  const updateColumnName = useCallback((idx, value) => {
    setColumns(prev => prev.map((c, i) => i === idx ? { ...c, name: value } : c));
    setIsColumnsSaved(false);
  }, []);

  const saveColumns = useCallback(async () => {
    const validCols = columns.filter(c => c.name.trim() !== '');
    if (validCols.length === 0) { toast.warning('Add a column', 'Please add at least one column with a name.'); return; }

    const names = validCols.map(c => c.name.trim().toLowerCase());
    if (new Set(names).size !== names.length) {
      toast.warning('Duplicate columns', 'Each column needs a unique name.');
      return;
    }

    setIsSavingColumns(true);
    let res;
    try {
      res = await apiSetColumns({ template_name: name, columns: validCols.map(c => c.name.trim()) }, plantCode);
    } catch (err) {
      toast.error('Save failed', err.message);
      setIsSavingColumns(false);
      return;
    }

    setColumns(validCols);
    setRows(prev => (prev.length ? prev : Array.from({ length: 5 }, () => ({ __rowId: Math.random().toString(36).substr(2, 9) }))));
    setIsColumnsSaved(true);
    setIsSavingColumns(false);
    toast.success('Columns saved', res.message);
  }, [columns, name, toast, plantCode]);

  const updateCell = useCallback((rowIdx, colId, value) => {
    setRows(prev => prev.map((r, i) => i === rowIdx ? { ...r, [colId]: value } : r));
  }, []);

  const deleteRow = useCallback(async (rowIdx) => {
    if (rows.length === 1) return;
    const rowToDelete = rows[rowIdx];
    if (isColumnsSaved) {
      const filters = {};
      columns.forEach(col => { if (rowToDelete[col.id]?.trim()) filters[col.name] = rowToDelete[col.id].trim(); });
      if (Object.keys(filters).length > 0) {
        try {
          await deleteData({ template_name: name, filters }, plantCode);
        } catch (err) {
          toast.error('Delete failed', err.message);
        }
      }
    }
    setRows(rows.filter((_, i) => i !== rowIdx));
  }, [rows, columns, isColumnsSaved, name, plantCode, toast]);

  const storeKnowledge = useCallback(async () => {
    if (!isColumnsSaved) { toast.warning('Save columns first', 'Click "Save Column" before storing knowledge.'); return; }
    const filledRows = rows.filter(row => columns.some(col => row[col.id]?.trim()));
    if (filledRows.length === 0) { toast.warning('No data', 'Please fill at least one row of data.'); return; }

    setIsGenerating(true);
    const backendRows = filledRows.map(row => {
      const r = {};
      columns.forEach(col => { r[col.name.trim()] = (row[col.id] || '').trim(); });
      return r;
    });

    let res;
    try {
      res = await addData({ template_name: name, rows: backendRows }, plantCode);
    } catch (err) {
      toast.error('Store failed', err.message);
      setIsGenerating(false);
      return;
    }

    setIsGenerating(false);
    toast.success('Knowledge stored', res.message);
    onStoreKnowledge(columns, filledRows);
  }, [isColumnsSaved, rows, columns, name, toast, onStoreKnowledge, plantCode]);

  return (
    <div className="max-w-[1800px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 py-6 px-2">
      <div className="bg-surface rounded-2xl shadow-card border border-border overflow-hidden">

        {/* Top bar */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-surface-2 rounded-xl"><Database className="w-6 h-6 text-text-muted" /></div>
            <h3 className="text-[18px] font-black text-text-primary uppercase tracking-tight">{name}</h3>
          </div>
          <div className="flex items-center gap-3">
            <button aria-label="Add Column" onClick={addColumn} className="flex items-center gap-2 px-5 py-2.5 bg-text-primary text-surface rounded-xl text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> Add Column
            </button>
            <button aria-label="Save Columns" onClick={saveColumns} disabled={isSavingColumns} className="flex items-center gap-2 px-5 py-2.5 bg-success text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-success/90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
              {isSavingColumns ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save Column
            </button>
          </div>
        </div>

        {/* Table */}
        <div ref={scrollRef} className="overflow-auto max-h-130">
          <table className="w-full border-collapse border border-border">
            <thead className="sticky top-0 z-20">
              <tr className="bg-surface-2 h-11">
                {columns.map((col, idx) => (
                  <th key={col.id} className={`relative group min-w-45 border-r border-border bg-surface-2 pb-0.5 text-left ${idx !== 0 ? 'border-l border-border' : ''}`}>
                    <div className="flex items-center gap-2 px-4.5 h-10.5">
                      <input
                        type="text"
                        value={col.name}
                        onClick={e => e.target.select()}
                        onChange={e => updateColumnName(idx, e.target.value)}
                        placeholder="Enter column name"
                        className="flex-1 bg-transparent border-none outline-none text-[10px] font-black text-text-primary uppercase tracking-[0.18em] placeholder:text-text-muted placeholder:font-bold focus:text-brand transition-colors w-full"
                      />
                      <button aria-label="Remove Column" onClick={() => removeColumn(idx)} className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-danger transition-all shrink-0 cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-border" />
                  </th>
                ))}
                {columns.length > 0 && (
                  <th className="w-15 min-w-15 border-l border-r border-border bg-surface-2 pb-0.5 text-center relative">
                    <div className="flex items-center justify-center h-10.5">
                      <span className="text-[10px] font-black text-text-primary uppercase tracking-[0.18em]">Del</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-border" />
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {rows.map((row, rowIdx) => (
                <tr key={rowIdx} className="group border-b border-border bg-surface hover:bg-surface-2 transition-colors duration-150">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`border-r border-border px-4.5 py-2.75 align-top ${colIdx === 0 ? 'border-l border-border' : ''}`}>
                      <textarea
                        value={row[col.id] || ''}
                        onChange={e => { updateCell(rowIdx, col.id, e.target.value); e.target.style.height = 'inherit'; e.target.style.height = `${e.target.scrollHeight}px`; }}
                        onFocus={e => { e.target.style.height = 'inherit'; e.target.style.height = `${e.target.scrollHeight}px`; }}
                        placeholder="—"
                        rows={1}
                        className="w-full bg-transparent border-none outline-none text-[13px] font-medium text-text-secondary placeholder:text-text-subtle focus:text-brand transition-colors resize-none overflow-hidden leading-relaxed"
                      />
                    </td>
                  ))}
                  {columns.length > 0 && (
                    <td className="w-15 px-3 py-2.75 text-center border-l border-r border-border">
                      <button aria-label="Delete row" onClick={() => deleteRow(rowIdx)} disabled={rows.length === 1} className="p-1.5 text-text-primary hover:text-danger disabled:opacity-0 disabled:cursor-not-allowed transition-all flex items-center justify-center mx-auto cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}

              {columns.length === 0 && (
                <tr>
                  <td colSpan={1} className="py-20 text-center">
                    <p className="text-[11px] font-black text-text-muted uppercase tracking-[0.3em]">Click &quot;Add Column&quot; to define your table structure, then click Save</p>
                  </td>
                </tr>
              )}
              {columns.length > 0 && rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1} className="py-12 text-center">
                    <p className="text-[11px] font-black text-text-muted uppercase tracking-[0.3em]">Name your columns, then click Save to populate rows</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-7 py-4 border-t border-border bg-surface">
          <button
            aria-label="Store Knowledge"
            onClick={storeKnowledge}
            disabled={!isColumnsSaved || columns.length === 0 || rows.length === 0 || isGenerating}
            className="flex items-center gap-2 px-10 py-3 bg-text-primary text-surface rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            Store Knowledge
          </button>
          <button
            aria-label="Add Row"
            onClick={() => { if (columns.length > 0) setRows([...rows, {}]); }}
            disabled={!isColumnsSaved || columns.length === 0}
            className="flex items-center gap-2 px-5 py-3 bg-surface border border-dashed border-border rounded-xl text-[11px] font-black text-text-muted uppercase tracking-widest hover:border-brand hover:text-brand transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Add Row
          </button>
        </div>
      </div>
    </div>
  );
}
