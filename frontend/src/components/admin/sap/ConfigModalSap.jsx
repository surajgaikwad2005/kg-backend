'use client';
import React from 'react';
import { Upload, Database, Server, FileSpreadsheet, Trash2, CheckCircle2, AlertTriangle, Info, Plus, ChevronRight } from 'lucide-react';
import { useAdminEntities, useSapForm } from '@/src/components/admin/AdminPanelContext';
import { Select } from '@/src/components/ui/Select';
import { FileLabelSelect } from '@/src/components/admin/FileLabelSelect';
import { useConnectorLabels } from '@/src/components/admin/_queries/useConnectorLabels';
import { MANDATORY_SAP_TABLES, SAP_TABLE_COLUMNS } from '@/src/components/admin/admin.constants';

function CloudConfigForm({ cloudType, setCloudType, config, setConfig }) {
  const inp = (label, type, ph, key) => (
    <div key={key} className="relative group">
      <label className="absolute -top-2 left-3 bg-surface px-1 text-[10px] font-bold text-text-muted uppercase tracking-wider z-10 group-focus-within:text-brand transition-colors">{label}</label>
      <input type={type} placeholder={ph} value={config[key] || ''} onChange={e => setConfig({ ...config, [key]: e.target.value })}
        className="w-full bg-transparent border-2 border-border rounded-xl px-4 py-3 text-xs text-text-primary focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all placeholder-text-muted/30" />
    </div>
  );
  return (
    <div className="space-y-5">
      <div className="flex gap-2 p-1 bg-surface-2/50 rounded-xl border border-border/50 shadow-inner">
        {['s3', 'adls', 'gcs'].map(ct => (
          <button key={ct} onClick={() => { setCloudType(ct); setConfig({}); }}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer 
              ${cloudType === ct ? 'bg-surface shadow-sm text-brand border border-brand/20' : 'text-text-muted hover:text-text-primary hover:bg-surface/50'}`}>
            {ct === 's3' ? 'Amazon S3' : ct === 'adls' ? 'Azure Data Lake' : 'Google Cloud'}
          </button>
        ))}
      </div>
      
      <div className="p-5 bg-surface-2/30 rounded-2xl border border-border/50 space-y-4">
        {cloudType === 's3' && (
          <div className="space-y-4">
            {inp('Bucket Name', 'text', 'my-sap-export-bucket', 'bucket')}
            {inp('Prefix', 'text', 'raw/sap', 'prefix')}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {inp('Region', 'text', 'us-east-1', 'region')}
              {inp('Access Key', 'password', 'AKIA...', 'access_key')}
              {inp('Secret Key', 'password', '••••', 'secret_key')}
            </div>
          </div>
        )}
        {cloudType === 'adls' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inp('Account Name', 'text', 'mystorageaccount', 'account_name')}
              {inp('Container', 'text', 'sap-data', 'container')}
            </div>
            {inp('Account Key', 'password', 'Account key', 'account_key')}
            {inp('Folder / Prefix', 'text', 'raw/sap', 'prefix')}
          </div>
        )}
        {cloudType === 'gcs' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inp('Bucket Name', 'text', 'my-gcs-bucket', 'bucket')}
              {inp('Project ID', 'text', 'my-gcp-project', 'project_id')}
            </div>
            {inp('Prefix', 'text', 'raw/sap', 'prefix')}
            {inp('Service Account JSON Path', 'text', '/path/to/service-account.json', 'service_account_json')}
          </div>
        )}
      </div>
    </div>
  );
}

export function ConfigModalSap({ sapInputRef }) {
    const { MANDATORY_TABLE_NAMES, setIsAddSapTableModalOpen, setAddTableError, setNewSapTable, selectedPlantId } = useAdminEntities();
    const labels = useConnectorLabels(selectedPlantId?.id);
    const {
        sapStep, setSapStep, sapTab, setSapTab,
        sapTables, sapFiles, setSapFiles,
        sapDetectedTables, setSapDetectedTables,
        sapSourceType, setSapSourceType,
        sapSourceConfig, setSapSourceConfig,
        sapCloudType, setSapCloudType,
        sapCloudConfig, setSapCloudConfig,
        sapFileLabels, setSapFileLabels,
    } = useSapForm();

    const inp = (label, type, ph, key, config, setConfig) => (
      <div key={key} className="relative group">
        <label className="absolute -top-2 left-3 bg-surface px-1 text-[10px] font-bold text-text-muted uppercase tracking-wider z-10 group-focus-within:text-brand transition-colors">{label}</label>
        <input type={type} placeholder={ph} value={config[key] || ''} onChange={e => setConfig({ ...config, [key]: e.target.value })}
          className="w-full bg-transparent border-2 border-border rounded-xl px-4 py-3 text-xs text-text-primary focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all placeholder-text-muted/30" />
      </div>
    );

    return (
      <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border pb-4">
      {sapStep === 'config' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          <div className="relative flex p-1 bg-surface-2/60 backdrop-blur-md border border-border/50 rounded-xl shadow-inner mb-2">
            <div className={`absolute top-1 bottom-1 w-[calc(33.33%-2px)] bg-surface shadow-md rounded-lg transition-transform duration-500 ease-out 
              ${sapTab === 'device' ? 'translate-x-0' : sapTab === 'source' ? 'translate-x-[calc(100%+0px)]' : 'translate-x-[calc(200%+0px)]'}`} />
            
            {[['device', 'Local Files', Upload], ['source', 'SAP Direct', Database], ['cloud', 'Cloud Storage', Server]].map(([key, label, Icon]) => (
              <button key={key} onClick={() => setSapTab(key)} 
                className={`flex-1 relative z-10 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors duration-300 cursor-pointer 
                ${sapTab === key ? 'text-brand' : 'text-text-muted hover:text-text-primary'}`}>
                <Icon size={16} /> <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {sapTab === 'device' && (
            <div className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-500">
              <div onClick={() => sapInputRef.current?.click()} onDragOver={e => { e.preventDefault(); e.stopPropagation(); }} 
                onDrop={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        const newFiles = Array.from(e.dataTransfer.files);
                        if (!newFiles.length) return;
                        const detectTablesFromFiles = (files) => {
                            const detected = [];
                            for (const f of files) {
                                const base = f.name.replace(/\.(csv|xlsx|xls|json|xml|parquet)$/i, '').toUpperCase().replace(/[_\-\s]+\d*$/, '');
                                const match = MANDATORY_TABLE_NAMES.find(t => base === t || base.startsWith(t));
                                detected.push({ name: match || base, fileName: f.name, columns: SAP_TABLE_COLUMNS[match || base] || [] });
                            }
                            return detected;
                        };
                        setSapFiles(prev => [...prev, ...newFiles]);
                        setSapDetectedTables(prev => [...prev, ...detectTablesFromFiles(newFiles)]);
                    }} 
                    className="relative overflow-hidden border-2 border-dashed border-brand/30 rounded-[20px] p-8 flex flex-col items-center justify-center gap-3 hover:border-brand bg-gradient-to-br from-surface to-brand/5 hover:from-brand/5 hover:to-brand/10 transition-all duration-300 cursor-pointer group">
                <div className="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center text-brand group-hover:scale-110 group-hover:bg-brand/20 transition-all duration-500 shadow-inner relative">
                  <Upload size={28} className="relative z-10" />
                  <div className="absolute inset-0 rounded-full border border-brand/30 animate-ping opacity-20 [animation-duration:3s]" />
                </div>
                <div className="text-center relative z-10">
                  <p className="text-sm font-bold text-text-primary mb-1">Click to upload or drag and drop SAP files</p>
                  <p className="text-xs text-text-muted mb-0.5">One file per table — CSV, XLSX, JSON, XML, Parquet</p>
                  <p className="text-[10px] text-brand/70 font-bold uppercase tracking-widest">Name files exactly as table name (e.g. AUFK.csv)</p>
                </div>
                <input type="file" ref={sapInputRef} multiple accept=".csv,.xlsx,.xls,.json,.xml,.parquet" className="hidden" onChange={e => {
                        const newFiles = Array.from(e.target.files || []);
                        e.target.value = '';
                        if (!newFiles.length) return;
                        const detectTablesFromFiles2 = (files) => {
                            const detected = [];
                            for (const f of files) {
                                const base = f.name.replace(/\.(csv|xlsx|xls|json|xml|parquet)$/i, '').toUpperCase().replace(/[_\-\s]+\d*$/, '');
                                const match = MANDATORY_TABLE_NAMES.find(t => base === t || base.startsWith(t));
                                detected.push({ name: match || base, fileName: f.name, columns: SAP_TABLE_COLUMNS[match || base] || [] });
                            }
                            return detected;
                        };
                        setSapFiles(prev => [...prev, ...newFiles]);
                        setSapDetectedTables(prev => [...prev, ...detectTablesFromFiles2(newFiles)]);
                    }}/>
              </div>

              {sapFiles.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border">
                  {sapFiles.map((f, i) => {
                            const det = sapDetectedTables.find(d => d.fileName === f.name);
                            const isMandatory = det && MANDATORY_TABLE_NAMES.includes(det.name);
                            return (
                        <div key={i} className={`flex items-center justify-between p-3 rounded-xl group transition-all border gap-3 ${isMandatory ? 'bg-success/5 border-success/30 hover:border-success/50' : 'bg-surface border-border/60 hover:border-brand/40'}`}>
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${isMandatory ? 'bg-success/10 border-success/20 text-success' : 'bg-brand/10 border-brand/20 text-brand'}`}>
                              <FileSpreadsheet size={14} className="shrink-0"/>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-text-primary truncate flex items-center gap-2">
                                {f.name}
                                {det && <span className="text-[10px] text-text-muted uppercase tracking-widest font-normal bg-surface-2 px-1.5 py-0.5 rounded">→ {det.name}</span>}
                              </p>
                              <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium">{(f.size / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="w-44 sm:w-52">
                              <FileLabelSelect
                                value={sapFileLabels[f.name]}
                                onChange={(val) => setSapFileLabels(prev => ({ ...prev, [f.name]: val }))}
                                options={labels.options}
                                isLoading={labels.isLoading}
                                isError={labels.isError}
                                onRetry={labels.refetch}
                                fileName={f.name}
                              />
                            </div>
                            <button onClick={() => { setSapFiles(prev => prev.filter((_, j) => j !== i)); setSapDetectedTables(prev => prev.filter(d => d.fileName !== f.name)); setSapFileLabels(prev => { const n = { ...prev }; delete n[f.name]; return n; }); }} 
                              className="opacity-0 group-hover:opacity-100 bg-surface border border-border text-text-muted hover:text-white hover:bg-danger hover:border-danger p-1.5 rounded-lg transition-all cursor-pointer shadow-sm"><Trash2 size={14}/></button>
                          </div>
                        </div>);
                        })}
                </div>
              )}
            </div>
          )}

          {sapTab === 'source' && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="p-5 bg-surface-2/30 rounded-2xl border border-border/50 space-y-4">
                <div className="space-y-1">
                  <label className="text-2xs font-bold text-text-muted uppercase tracking-widest">SAP Type</label>
                  <Select
                    value={sapSourceType}
                    onChange={setSapSourceType}
                    placeholder="Select SAP type..."
                    options={['SAP HANA', 'SAP S/4HANA', 'SAP ECC', 'SAP BW', 'SAP BW/4HANA']}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {inp('Host / Endpoint', 'text', 'e.g. 10.0.0.1', 'host', sapSourceConfig, setSapSourceConfig)}
                  {inp('Port', 'text', '3600', 'port', sapSourceConfig, setSapSourceConfig)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {inp('Username', 'text', 'Username', 'username', sapSourceConfig, setSapSourceConfig)}
                  {inp('Password', 'password', '••••••••', 'password', sapSourceConfig, setSapSourceConfig)}
                </div>
                {inp('System ID / Client', 'text', 'e.g. PRD / 100', 'system_id', sapSourceConfig, setSapSourceConfig)}
              </div>
            </div>
          )}

          {sapTab === 'cloud' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <CloudConfigForm cloudType={sapCloudType} setCloudType={setSapCloudType} config={sapCloudConfig} setConfig={setSapCloudConfig} />
            </div>
          )}

        </div>
      ) : sapStep === 'file-review' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex items-center gap-4 mb-2 bg-surface p-4 rounded-2xl border border-border/50 shadow-sm">
            <button onClick={() => setSapStep('config')} className="p-2 text-text-muted hover:text-brand bg-surface-2 hover:bg-brand/10 rounded-xl transition-all cursor-pointer border border-transparent hover:border-brand/30">
              <ChevronRight size={18} className="rotate-180"/>
            </button>
            <div>
              <h4 className="text-lg font-bold text-text-primary">SAP Table Review</h4>
              <p className="text-xs text-text-muted">
                {sapDetectedTables.filter(d => MANDATORY_TABLE_NAMES.includes(d.name)).length} of {MANDATORY_SAP_TABLES.length} mandatory tables detected
                {MANDATORY_SAP_TABLES.filter(t => !sapDetectedTables.some(d => d.name === t.name)).length > 0 && (
                  <span className="text-warning ml-1">• {MANDATORY_SAP_TABLES.filter(t => !sapDetectedTables.some(d => d.name === t.name)).length} missing</span>
                )}
              </p>
            </div>
          </div>

          <div className="p-5 bg-surface-2/30 backdrop-blur-md border border-border/50 rounded-2xl space-y-6 shadow-inner">
            {(() => {
                      const present = MANDATORY_SAP_TABLES.filter(t => sapDetectedTables.some(d => d.name === t.name));
                      return present.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-success uppercase tracking-widest pl-1">Detected Mandatory Tables</p>
                  {present.map(t => {
                              const det = sapDetectedTables.find(d => d.name === t.name);
                              return (
                        <div key={t.name} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-success/5 border border-success/20 rounded-xl shadow-sm gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                              <CheckCircle2 size={16} className="text-success"/>
                            </div>
                            <div>
                              <span className="text-sm font-bold text-text-primary">{t.name}</span>
                              <span className="text-xs text-text-muted ml-2">{t.desc}</span>
                            </div>
                          </div>
                          <span className="text-[10px] bg-surface px-2 py-1 border border-border rounded text-text-muted font-mono">{det?.fileName}</span>
                        </div>);
                          })}
                </div>) : null;
                  })()}

            {(() => {
                      const missing = MANDATORY_SAP_TABLES.filter(t => !sapDetectedTables.some(d => d.name === t.name));
                      return missing.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-warning uppercase tracking-widest pl-1">Missing Mandatory Tables</p>
                  {missing.map(t => (
                    <div key={t.name} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-warning/5 border border-warning/20 rounded-xl shadow-sm gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
                          <AlertTriangle size={16} className="text-warning"/>
                        </div>
                        <div>
                          <span className="text-sm font-bold text-text-primary">{t.name}</span>
                          <span className="text-xs text-text-muted ml-2">{t.desc}</span>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-1 bg-warning/10 border border-warning/20 text-warning rounded font-bold uppercase w-fit">{t.pipeline}</span>
                    </div>))}
                  <div className="p-4 bg-warning/5 border border-warning/20 rounded-xl flex items-start gap-3 mt-4">
                    <Info size={16} className="text-warning shrink-0 mt-0.5"/>
                    <p className="text-xs text-warning/90 leading-relaxed">
                      Missing tables may cause incomplete merge pipelines. Upload the missing files or proceed — the system will skip unavailable tables during processing.
                    </p>
                  </div>
                  <button onClick={() => setSapStep('config')} className="w-full py-3 mt-2 border-2 border-dashed border-warning/30 rounded-xl flex items-center justify-center gap-2 text-warning hover:bg-warning/10 transition-all cursor-pointer">
                    <Upload size={16}/>
                    <span className="text-xs font-bold uppercase tracking-widest">Upload Missing Tables</span>
                  </button>
                </div>) : null;
                  })()}

            {(() => {
                      const extra = sapDetectedTables.filter(t => !MANDATORY_TABLE_NAMES.includes(t.name));
                      return extra.length > 0 ? (
                <div className="space-y-3 pt-4 border-t border-border/50">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest pl-1">Additional Tables</p>
                  {extra.map((t, i) => (
                    <div key={`${t.name}-${i}`} className="flex items-center justify-between p-4 bg-surface border border-border/50 rounded-xl shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center shrink-0 border border-border">
                          <FileSpreadsheet size={14} className="text-text-muted"/>
                        </div>
                        <div>
                          <span className="text-sm font-bold text-text-primary">{t.name}</span>
                          <span className="text-xs text-text-muted ml-2">{t.fileName}</span>
                        </div>
                      </div>
                    </div>))}
                </div>) : null;
                  })()}

            <div className="pt-4 border-t border-border/50">
              <button onClick={() => {
                        setIsAddSapTableModalOpen(true);
                        setAddTableError('');
                        setNewSapTable({ name: '', desc: '', columns: [{ sap_field: '', canonical_name: '' }] });
                    }} className="w-full py-3 border-2 border-dashed border-border rounded-xl flex items-center justify-center gap-2 text-text-muted hover:text-brand hover:border-brand hover:bg-brand/5 transition-all cursor-pointer">
                <Plus size={16}/>
                <span className="text-xs font-bold uppercase tracking-widest">Add Custom Table</span>
              </button>
            </div>
          </div>
        </div>) : null}
    </div>);
}
