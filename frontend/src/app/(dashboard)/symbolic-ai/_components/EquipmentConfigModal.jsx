'use client';
import React, { useState, useMemo, useCallback } from 'react';
import { X, Grid3x3, ShieldCheck, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Modal } from '@/src/components/ui/Modal';
import { generateMarkdown } from '@/src/services/symbolic-ai/symbolicAiService';
import { useToast } from '@/src/components/ui/Toast';
import { useApp } from '@/src/context/AppContext';
import { EquipmentDropdown } from './EquipmentDropdown';

function toColumnLabel(key) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function normalizeTableData(tableData) {
  if (!tableData) return { rows: [], columns: [], equipmentKey: null, availableIds: [] };

  const rows = tableData.rows ?? [];
  const columns = tableData.columns ?? (rows.length > 0 ? Object.keys(rows[0]) : []);
  const dropdownKeys = tableData.dropdowns ? Object.keys(tableData.dropdowns) : [];
  const equipmentKey = tableData.equipment_column ?? dropdownKeys[0] ?? columns[0] ?? null;
  const availableIds =
    tableData.equipment_ids ??
    tableData.dropdowns?.[equipmentKey] ??
    [...new Set(rows.map(r => r[equipmentKey]).filter(Boolean))];

  return { rows, columns, equipmentKey, availableIds };
}

export function EquipmentConfigModal({ tableName, tableData, file, onClose, onSuccess }) {
  const { error: toastError } = useToast();
  const { plantCode } = useApp();
  const { rows, columns, equipmentKey, availableIds } = useMemo(
    () => normalizeTableData(tableData),
    [tableData],
  );

  const [equipmentIds, setEquipmentIds] = useState(() =>
    rows.map(r => (equipmentKey ? (r[equipmentKey] ?? '') : '')),
  );
  const [validated, setValidated] = useState(false);
  const [isInjecting, setIsInjecting] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);

  const allSelected = equipmentIds.every(id => id.trim() !== '');
  const otherColumns = columns.filter(c => c !== equipmentKey);

  const handleIdChange = useCallback((idx, value) => {
    setEquipmentIds(prev => prev.map((id, i) => (i === idx ? value : id)));
  }, []);

  const handleInject = async () => {
    setValidated(true);
    if (!allSelected) return;

    setIsInjecting(true);
    try {
      // Merge user-selected equipment IDs back into rows
      const updatedRows = rows.map((row, idx) => ({
        ...row,
        ...(equipmentKey ? { [equipmentKey]: equipmentIds[idx] } : {}),
      }));

      // Build CSV from updated rows so the backend sees the Equipment Id column
      const escapeCsv = (val) => {
        const s = val == null ? '' : String(val);
        return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const csvLines = [
        columns.map(escapeCsv).join(','),
        ...updatedRows.map(row => columns.map(c => escapeCsv(row[c])).join(',')),
      ];
      const csvBlob = new Blob([csvLines.join('\n')], { type: 'text/csv' });
      const csvFile = new File([csvBlob], `${tableName}.csv`, { type: 'text/csv' });

      const formData = new FormData();
      formData.append('file', csvFile);
      formData.append('dashboard_name', tableName);
      const res = await generateMarkdown(formData, plantCode);
      onSuccess(tableName, res.data?.markdown ?? '', csvFile.name);
    } catch (err) {
      toastError('Generation failed', err.message);
    } finally {
      setIsInjecting(false);
    }
  };

  const invalidCount = validated ? equipmentIds.filter(id => !id.trim()).length : 0;

  return (
    <Modal open onClose={onClose} size="full" closeOnBackdrop={false} className="max-w-6xl max-h-[90vh] flex flex-col border border-border overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0 bg-surface">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-muted rounded-xl shrink-0">
              <Grid3x3 className="w-6 h-6 text-brand" />
            </div>
            <div>
              <h2 id="equipment-config-modal-title" className="text-title font-black text-text-primary tracking-tight leading-none">
                Equipment Configuration
              </h2>
              <p className="text-2xs font-bold text-text-muted uppercase tracking-widest mt-1.5 leading-none">
                Configure Equipment IDs for {tableName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {validated && invalidCount > 0 && (
              <span className="px-3 py-1.5 bg-danger/10 text-danger border border-danger/30 rounded-lg text-2xs font-black uppercase tracking-widest animate-in fade-in duration-200">
                {invalidCount} unset
              </span>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 border border-border rounded-lg">
              <span className="text-2xs font-black text-text-muted uppercase tracking-widest">Rows</span>
              <span className="text-2xs font-black text-text-primary">{rows.length}</span>
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="p-2 hover:bg-surface-2 rounded-xl transition-colors text-text-muted hover:text-text-primary cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="flex-1 overflow-auto thin-scrollbar min-h-0">
          {rows.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-text-muted text-body-sm italic">
              No data returned from the server.
            </div>
          ) : (
            <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-surface-2">
                  <th className="w-12 px-3 py-3.5 text-left text-label font-black text-text-muted uppercase tracking-widest border-r border-border">
                    #
                  </th>
                  {equipmentKey && (
                    <th
                      className="w-52 px-4 py-3.5 text-left text-label font-black text-success uppercase tracking-widest border-r border-border cursor-pointer select-none"
                      onClick={() => setSortAsc(p => !p)}
                    >
                      <div className="flex items-center gap-1.5">
                        {toColumnLabel(equipmentKey)}
                        {sortAsc
                          ? <ChevronUp className="w-3 h-3 text-success" />
                          : <ChevronDown className="w-3 h-3 text-success" />
                        }
                      </div>
                    </th>
                  )}
                  {otherColumns.map(col => (
                    <th
                      key={col}
                      className="px-4 py-3.5 text-left text-label font-black text-text-muted uppercase tracking-widest border-r border-border last:border-r-0"
                    >
                      {toColumnLabel(col)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row, idx) => {
                  const isInvalid = validated && !equipmentIds[idx]?.trim();
                  return (
                    <tr
                      key={idx}
                      className={cn(
                        'hover:bg-surface-2/40 transition-colors',
                        isInvalid && 'bg-danger/10',
                      )}
                    >
                      <td className="w-12 px-3 py-3 text-caption font-medium text-text-subtle border-r border-border align-middle">
                        {idx + 1}
                      </td>
                      {equipmentKey && (
                        <td className="w-52 px-4 py-3 border-r border-border align-middle">
                          <EquipmentDropdown
                            value={equipmentIds[idx]}
                            options={availableIds}
                            onChange={v => handleIdChange(idx, v)}
                            invalid={isInvalid}
                          />
                        </td>
                      )}
                      {otherColumns.map(col => (
                        <td
                          key={col}
                          className="px-4 py-3 text-xs text-text-primary border-r border-border last:border-r-0 align-top max-w-xs"
                        >
                          <span className="line-clamp-3 leading-relaxed">{row[col] ?? '—'}</span>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-6 py-4 bg-surface-2 border-t border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success shadow-sm shadow-success/50" />
              <span className="text-2xs font-black text-text-muted uppercase tracking-widest">
                Dropdowns are editable
              </span>
            </div>
            <span className="text-border-strong text-sm">|</span>
            <span className="text-2xs text-text-muted">
              Table: <span className="font-bold text-text-primary">{tableName}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleInject}
            disabled={isInjecting}
            className={cn(
              'flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-caption font-black uppercase tracking-widest transition-all cursor-pointer',
              'bg-overlay text-white hover:bg-overlay-hover shadow-card active:scale-[0.98]',
              isInjecting && 'opacity-70 cursor-not-allowed',
            )}
          >
            {isInjecting
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <ShieldCheck className="w-4 h-4" />
            }
            {isInjecting ? 'Injecting…' : 'Inject Knowledge'}
          </button>
        </div>
    </Modal>
  );
}
