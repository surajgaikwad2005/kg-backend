'use client';
import React from 'react';
import { Upload, Plus, Trash2, RotateCcw } from 'lucide-react';
import { Modal, ModalBody, ModalFooter } from '@/src/components/ui/Modal';
import { Button } from '@/src/components/ui/Button';
import { useAdminEntities, useSapForm } from '@/src/components/admin/AdminPanelContext';

export function AddSapTableModal() {
  const { isAddSapTableModalOpen, setIsAddSapTableModalOpen, addTableError, setAddTableError, addTableLoading, handleAddSapTable } = useAdminEntities();
  const { newSapTable, setNewSapTable, sapTables, setSapTables, setSapFiles } = useSapForm();
  const close = () => setIsAddSapTableModalOpen(false);

  return (
    <Modal open={isAddSapTableModalOpen} onClose={close} size="lg" title="Add New SAP Table">
      <ModalBody className="space-y-5 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-border-strong">
        <p className="text-xs text-text-muted -mt-2">Define table name and column mappings</p>
        <div>
          <label htmlFor="sap-table-name" className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">SAP Table Name</label>
          <input id="sap-table-name" type="text" value={newSapTable.name}
            onChange={(e) => setNewSapTable({ ...newSapTable, name: e.target.value.replace(/[^A-Za-z0-9_]/g, '') })}
            placeholder="e.g. ZPMORDER"
            className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand transition-colors uppercase" />
        </div>
        <div>
          <label htmlFor="sap-table-desc" className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Description</label>
          <input id="sap-table-desc" type="text" value={newSapTable.desc}
            onChange={(e) => setNewSapTable({ ...newSapTable, desc: e.target.value })}
            placeholder="e.g. Custom PM Order Data"
            className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand transition-colors" />
        </div>

        <div>
          <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Upload CSV (optional)</label>
          <p className="text-label text-text-subtle mb-2">Upload a CSV file to auto-detect columns and provide table data</p>
          <label className="w-full py-3 border border-dashed border-border-strong rounded-xl flex items-center justify-center gap-2 text-text-muted hover:text-brand hover:border-brand transition-all cursor-pointer">
            <Upload size={14} />
            <span className="text-label font-bold uppercase tracking-widest">Choose CSV File</span>
            <input type="file" accept=".csv" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (!newSapTable.name) {
                const base = file.name.replace(/\.csv$/i, '').toUpperCase().replace(/[^A-Z0-9_]/g, '_');
                setNewSapTable(prev => ({ ...prev, name: base }));
              }
              const reader = new FileReader();
              reader.onload = (ev) => {
                const text = ev.target?.result;
                const firstLine = text.split('\n')[0]?.trim();
                if (firstLine) {
                  const headers = firstLine.split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
                  const cols = headers.filter(h => h).map(h => ({ sap_field: h.toUpperCase().replace(/[^A-Z0-9_]/g, '_'), canonical_name: '' }));
                  if (cols.length > 0) setNewSapTable(prev => ({ ...prev, columns: cols }));
                }
              };
              reader.readAsText(file.slice(0, 4096));
              setSapFiles(prev => [...prev, file]);
              e.target.value = '';
            }} />
          </label>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">Columns (SAP Field → Display Name)</label>
          {newSapTable.columns.map((col, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <input type="text" value={col.sap_field}
                onChange={(e) => { const cols = [...newSapTable.columns]; cols[idx] = { ...cols[idx], sap_field: e.target.value.replace(/[^A-Za-z0-9_]/g, '') }; setNewSapTable({ ...newSapTable, columns: cols }); }}
                placeholder="SAP Field (e.g. AUFNR)"
                aria-label={`SAP field ${idx + 1}`}
                className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand uppercase" />
              <span className="text-text-secondary">→</span>
              <input type="text" value={col.canonical_name}
                onChange={(e) => { const cols = [...newSapTable.columns]; cols[idx] = { ...cols[idx], canonical_name: e.target.value }; setNewSapTable({ ...newSapTable, columns: cols }); }}
                placeholder="Display Name"
                aria-label={`Display name ${idx + 1}`}
                className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand" />
              {newSapTable.columns.length > 1 && (
                <button onClick={() => setNewSapTable({ ...newSapTable, columns: newSapTable.columns.filter((_, i) => i !== idx) })}
                  aria-label="Remove column" className="p-1.5 text-text-secondary hover:text-danger transition-colors cursor-pointer">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
          <button onClick={() => setNewSapTable({ ...newSapTable, columns: [...newSapTable.columns, { sap_field: '', canonical_name: '' }] })}
            className="text-brand hover:text-brand/70 text-xs font-bold flex items-center gap-1 cursor-pointer">
            <Plus size={14} /><span>Add Column</span>
          </button>
        </div>

        {addTableError && (
          <div className="bg-danger/10 border border-danger/20 rounded-lg p-3 text-sm text-danger">{addTableError}</div>
        )}
      </ModalBody>

      <ModalFooter>
        <Button variant="ghost" onClick={close}>Cancel</Button>
        <button
          disabled={addTableLoading}
          aria-busy={addTableLoading}
          onClick={handleAddSapTable}
          className="bg-brand hover:bg-brand-hover text-white font-bold py-2 px-8 rounded-lg shadow-lg shadow-brand/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
        >
          {addTableLoading && <RotateCcw size={14} className="animate-spin" />}
          {addTableLoading ? 'Saving...' : 'Add Table'}
        </button>
      </ModalFooter>
    </Modal>
  );
}
export default AddSapTableModal;
