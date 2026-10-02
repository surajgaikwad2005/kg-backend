'use client';
import React from 'react';
import { Upload, Database, Server, FileSpreadsheet, Trash2, AlertTriangle, Info, ChevronRight } from 'lucide-react';
import { useTsForm, useAdminEntities } from '@/src/components/admin/AdminPanelContext';
import { Select } from '@/src/components/ui/Select';
import { FileLabelSelect } from '@/src/components/admin/FileLabelSelect';
import { useConnectorLabels } from '@/src/components/admin/_queries/useConnectorLabels';

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
            {inp('Bucket Name', 'text', 'my-bucket', 'bucket')}
            {inp('Prefix', 'text', 'raw/data', 'prefix')}
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
              {inp('Container', 'text', 'data-container', 'container')}
            </div>
            {inp('Account Key', 'password', 'Account key', 'account_key')}
            {inp('Folder / Prefix', 'text', 'raw/data', 'prefix')}
          </div>
        )}
        {cloudType === 'gcs' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inp('Bucket Name', 'text', 'my-gcs-bucket', 'bucket')}
              {inp('Project ID', 'text', 'my-gcp-project', 'project_id')}
            </div>
            {inp('Prefix', 'text', 'raw/data', 'prefix')}
            {inp('Service Account JSON Path', 'text', '/path/to/service-account.json', 'service_account_json')}
          </div>
        )}
      </div>
    </div>
  );
}

export function ConfigModalTimeseries({ tsMetadataInputRef, tsValuesInputRef }) {
    const {
        tsStep, setTsStep,
        tsTab, setTsTab,
        tsDeviceMode, setTsDeviceMode,
        tsMetadataFiles, setTsMetadataFiles,
        tsValuesFiles, setTsValuesFiles,
        tsValidationErrors, setTsValidationErrors,
        tsHistorianType, setTsHistorianType,
        tsHistorianConfig, setTsHistorianConfig,
        tsCloudType, setTsCloudType,
        tsCloudConfig, setTsCloudConfig,
        tsRetention, setTsRetention,
        validateTsMetadataFile, validateTsValuesFile,
        tsFileLabels, setTsFileLabels,
    } = useTsForm();
    const { selectedPlantId } = useAdminEntities();
    const labels = useConnectorLabels(selectedPlantId?.id);

    const inp = (label, type, ph, key, config, setConfig) => (
      <div key={key} className="relative group">
        <label className="absolute -top-2 left-3 bg-surface px-1 text-[10px] font-bold text-text-muted uppercase tracking-wider z-10 group-focus-within:text-brand transition-colors">{label}</label>
        <input type={type} placeholder={ph} value={config[key] || ''} onChange={e => setConfig({ ...config, [key]: e.target.value })}
          className="w-full bg-transparent border-2 border-border rounded-xl px-4 py-3 text-xs text-text-primary focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all placeholder-text-muted/30" />
      </div>
    );

    return (
      <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border pb-4">
      {tsStep === 'config' ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          <div className="relative flex p-1 bg-surface-2/60 backdrop-blur-md border border-border/50 rounded-xl shadow-inner mb-2">
            <div className={`absolute top-1 bottom-1 w-[calc(33.33%-2px)] bg-surface shadow-md rounded-lg transition-transform duration-500 ease-out 
              ${tsTab === 'device' ? 'translate-x-0' : tsTab === 'source' ? 'translate-x-[calc(100%+0px)]' : 'translate-x-[calc(200%+0px)]'}`} />
            
            {[['device', 'Local Files', Upload], ['source', 'Historian', Database], ['cloud', 'Cloud Storage', Server]].map(([key, label, Icon]) => (
              <button key={key} onClick={() => { setTsTab(key); setTsValidationErrors([]); }} 
                className={`flex-1 relative z-10 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors duration-300 cursor-pointer 
                ${tsTab === key ? 'text-brand' : 'text-text-muted hover:text-text-primary'}`}>
                <Icon size={16} /> <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {tsTab === 'device' && (
            <div className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="relative flex p-1 bg-surface-2/60 border border-border/50 rounded-lg shadow-inner w-full max-w-sm mx-auto">
                <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-brand shadow-sm rounded-md transition-transform duration-300 ease-out 
                  ${tsDeviceMode === 'values' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'}`} />
                {[['metadata', 'Metadata Upload'], ['values', 'Values Upload']].map(([key, label]) => (
                  <button key={key} onClick={() => { setTsDeviceMode(key); setTsValidationErrors([]); }} 
                    className={`flex-1 relative z-10 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-colors duration-300 cursor-pointer 
                    ${tsDeviceMode === key ? 'text-white' : 'text-text-muted hover:text-text-primary'}`}>
                    {label}
                  </button>
                ))}
              </div>

              {tsDeviceMode === 'metadata' && (
                <div className="space-y-4">
                  <div onClick={() => tsMetadataInputRef.current?.click()} onDragOver={e => { e.preventDefault(); e.stopPropagation(); }} 
                    onDrop={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const dropped = Array.from(e.dataTransfer.files);
                          if (!dropped.length) return;
                          setTsMetadataFiles(prev => [...prev, ...dropped]);
                          const errs = [];
                          for (const f of dropped) {
                              errs.push(...await validateTsMetadataFile(f));
                          }
                          if (errs.length) setTsValidationErrors(errs);
                      }} 
                      className="relative overflow-hidden border-2 border-dashed border-brand/30 rounded-[20px] p-8 flex flex-col items-center justify-center gap-3 hover:border-brand bg-gradient-to-br from-surface to-brand/5 hover:from-brand/5 hover:to-brand/10 transition-all duration-300 cursor-pointer group">
                    <div className="absolute inset-0 bg-brand/5 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                    <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center text-brand group-hover:scale-110 group-hover:bg-brand/20 transition-all duration-500 shadow-inner relative">
                      <Upload size={28} className="relative z-10" />
                      <div className="absolute inset-0 rounded-full border border-brand/30 animate-ping opacity-20 [animation-duration:3s]" />
                    </div>
                    <div className="text-center relative z-10">
                      <p className="text-sm font-bold text-text-primary mb-1">Click to upload or drag and drop Metadata</p>
                      <p className="text-xs text-text-muted">CSV, XLSX (must contain tag name, description, ranges/limits)</p>
                    </div>
                    <input type="file" ref={tsMetadataInputRef} multiple accept=".csv,.xlsx,.xls,.tsv" className="hidden" onChange={async (e) => {
                          const files = Array.from(e.target.files || []);
                          if (!files.length) { e.target.value = ''; return; }
                          setTsMetadataFiles(prev => [...prev, ...files]);
                          const errs = [];
                          for (const f of files) {
                              errs.push(...await validateTsMetadataFile(f));
                          }
                          if (errs.length) setTsValidationErrors(errs);
                          e.target.value = '';
                      }}/>
                  </div>

                  {tsMetadataFiles.length > 0 && (
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border">
                      {tsMetadataFiles.map((f, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-surface border border-border/60 hover:border-brand/40 rounded-xl group transition-all gap-3">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0 border border-brand/20">
                              <FileSpreadsheet size={14} className="text-brand shrink-0"/>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-text-primary truncate">{f.name}</p>
                              <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium">{(f.size / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="w-44 sm:w-52">
                              <FileLabelSelect
                                value={tsFileLabels[f.name]}
                                onChange={(val) => setTsFileLabels(prev => ({ ...prev, [f.name]: val }))}
                                options={labels.options}
                                isLoading={labels.isLoading}
                                isError={labels.isError}
                                onRetry={labels.refetch}
                                fileName={f.name}
                              />
                            </div>
                            <button aria-label={`Remove ${f.name}`} onClick={() => { setTsMetadataFiles(prev => prev.filter((_, j) => j !== i)); setTsFileLabels(prev => { const n = { ...prev }; delete n[f.name]; return n; }); }} className="opacity-0 group-hover:opacity-100 bg-surface border border-border text-text-muted hover:text-white hover:bg-danger hover:border-danger p-1.5 rounded-lg transition-all cursor-pointer shadow-sm"><Trash2 size={14}/></button>
                          </div>
                        </div>))}
                    </div>
                  )}

                  <div className="p-3 bg-brand/5 border border-brand/20 rounded-xl flex items-start gap-3 shadow-sm">
                    <Info size={16} className="text-brand shrink-0 mt-0.5"/>
                    <p className="text-xs text-text-primary/80 leading-relaxed">
                      Metadata file must contain columns for: <strong>Tag Name</strong>, <strong>Description</strong>, and <strong>Ranges/Limits</strong> (column names can vary, e.g. tag_name, upper_limit).
                    </p>
                  </div>
                </div>
              )}

              {tsDeviceMode === 'values' && (
                <div className="space-y-4">
                  <div onClick={() => tsValuesInputRef.current?.click()} onDragOver={e => { e.preventDefault(); e.stopPropagation(); }} 
                    onDrop={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const dropped = Array.from(e.dataTransfer.files);
                          if (!dropped.length) return;
                          setTsValuesFiles(prev => [...prev, ...dropped]);
                          const errs = [];
                          for (const f of dropped) {
                              errs.push(...await validateTsValuesFile(f));
                          }
                          if (errs.length) setTsValidationErrors(errs);
                      }} 
                      className="relative overflow-hidden border-2 border-dashed border-success/30 rounded-[20px] p-8 flex flex-col items-center justify-center gap-3 hover:border-success bg-gradient-to-br from-surface to-success/5 hover:from-success/5 hover:to-success/10 transition-all duration-300 cursor-pointer group">
                    <div className="absolute inset-0 bg-success/5 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                    <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center text-success group-hover:scale-110 group-hover:bg-success/20 transition-all duration-500 shadow-inner relative">
                      <Upload size={28} className="relative z-10" />
                      <div className="absolute inset-0 rounded-full border border-success/30 animate-ping opacity-20 [animation-duration:3s]" />
                    </div>
                    <div className="text-center relative z-10">
                      <p className="text-sm font-bold text-text-primary mb-1">Click to upload or drag and drop Values</p>
                      <p className="text-xs text-text-muted">CSV, XLSX (must contain timestamp and values columns)</p>
                    </div>
                    <input type="file" ref={tsValuesInputRef} multiple accept=".csv,.xlsx,.xls,.tsv" className="hidden" onChange={async (e) => {
                          const files = Array.from(e.target.files || []);
                          if (!files.length) { e.target.value = ''; return; }
                          setTsValuesFiles(prev => [...prev, ...files]);
                          const errs = [];
                          for (const f of files) {
                              errs.push(...await validateTsValuesFile(f));
                          }
                          if (errs.length) setTsValidationErrors(errs);
                          e.target.value = '';
                      }}/>
                  </div>

                  {tsValuesFiles.length > 0 && (
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border">
                      {tsValuesFiles.map((f, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-surface border border-border/60 hover:border-success/40 rounded-xl group transition-all gap-3">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center shrink-0 border border-success/20">
                              <FileSpreadsheet size={14} className="text-success shrink-0"/>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-text-primary truncate">{f.name}</p>
                              <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium">{(f.size / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="w-44 sm:w-52">
                              <FileLabelSelect
                                value={tsFileLabels[f.name]}
                                onChange={(val) => setTsFileLabels(prev => ({ ...prev, [f.name]: val }))}
                                options={labels.options}
                                isLoading={labels.isLoading}
                                isError={labels.isError}
                                onRetry={labels.refetch}
                                fileName={f.name}
                              />
                            </div>
                            <button aria-label={`Remove ${f.name}`} onClick={() => { setTsValuesFiles(prev => prev.filter((_, j) => j !== i)); setTsFileLabels(prev => { const n = { ...prev }; delete n[f.name]; return n; }); }} className="opacity-0 group-hover:opacity-100 bg-surface border border-border text-text-muted hover:text-white hover:bg-danger hover:border-danger p-1.5 rounded-lg transition-all cursor-pointer shadow-sm"><Trash2 size={14}/></button>
                          </div>
                        </div>))}
                    </div>
                  )}

                  <div className="p-3 bg-success/5 border border-success/20 rounded-xl flex items-start gap-3 shadow-sm">
                    <Info size={16} className="text-success shrink-0 mt-0.5"/>
                    <p className="text-xs text-text-primary/80 leading-relaxed">
                      Timeseries values file must contain columns for: <strong>Timestamp</strong> and <strong>Values</strong> (column names can vary, e.g. timestamp, value).
                    </p>
                  </div>
                </div>
              )}

              {tsValidationErrors.length > 0 && (
                <div className="p-4 bg-warning/5 border border-warning/30 rounded-xl space-y-2 shadow-sm">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className="text-warning"/>
                    <span className="text-xs font-bold text-warning uppercase tracking-wider">Validation Warnings</span>
                  </div>
                  {tsValidationErrors.map((err, i) => (<p key={i} className="text-xs text-warning/90 leading-tight pl-6">• {err}</p>))}
                </div>
              )}
            </div>
          )}

          {tsTab === 'source' && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="p-5 bg-surface-2/30 rounded-2xl border border-border/50 space-y-4">
                <div className="space-y-1">
                  <label className="text-2xs font-bold text-text-muted uppercase tracking-widest">Historian Type</label>
                  <Select
                    value={tsHistorianType}
                    onChange={setTsHistorianType}
                    placeholder="Select historian type..."
                    options={['OSIsoft PI', 'InfluxDB', 'TimescaleDB', 'Honeywell PHD', 'Wonderware', 'GE Proficy']}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {inp('Host / Endpoint', 'text', 'e.g. 10.0.0.1', 'host', tsHistorianConfig, setTsHistorianConfig)}
                  {inp('Port', 'text', '5450', 'port', tsHistorianConfig, setTsHistorianConfig)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {inp('Username', 'text', 'Username', 'username', tsHistorianConfig, setTsHistorianConfig)}
                  {inp('Password', 'password', '••••••••', 'password', tsHistorianConfig, setTsHistorianConfig)}
                </div>
                {inp('Database / Server Name', 'text', 'e.g. PIServer01 or mydb', 'database', tsHistorianConfig, setTsHistorianConfig)}
              </div>
            </div>
          )}

          {tsTab === 'cloud' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <CloudConfigForm cloudType={tsCloudType} setCloudType={setTsCloudType} config={tsCloudConfig} setConfig={setTsCloudConfig} />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex items-center gap-4 mb-2 bg-surface p-4 rounded-2xl border border-border/50 shadow-sm">
            <button onClick={() => setTsStep('config')} className="p-2 text-text-muted hover:text-brand bg-surface-2 hover:bg-brand/10 rounded-xl transition-all cursor-pointer border border-transparent hover:border-brand/30">
              <ChevronRight size={18} className="rotate-180"/>
            </button>
            <div>
              <h4 className="text-lg font-bold text-text-primary">Data Retention Policy</h4>
              <p className="text-xs text-text-muted">Configure how long timeseries data should be retained</p>
            </div>
          </div>
          
          <div className="p-6 bg-surface-2/30 backdrop-blur-md border border-border/50 rounded-2xl space-y-6 shadow-inner">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Retention Period</label>
              <div className="flex gap-4 items-center">
                <div className="flex-1 relative group">
                  <input type="number" min="1" placeholder="90" value={tsRetention.value} onChange={e => setTsRetention({ ...tsRetention, value: e.target.value })} 
                    className="w-full bg-transparent border-2 border-border rounded-xl px-4 py-3 text-lg font-bold text-text-primary focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all"/>
                </div>
                <div className="flex gap-2 p-1 bg-surface-2/50 border border-border/50 rounded-xl">
                  {['days', 'months', 'years'].map(u => (
                    <button key={u} onClick={() => setTsRetention({ ...tsRetention, unit: u })} 
                      className={`py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer 
                      ${tsRetention.unit === u ? 'bg-surface shadow-sm text-brand border border-brand/20' : 'text-text-muted hover:text-text-primary hover:bg-surface/50'}`}>
                      {u}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-4 bg-brand/5 border border-brand/20 rounded-xl flex items-start gap-3 shadow-sm">
              <Info size={16} className="text-brand shrink-0 mt-0.5"/>
              <p className="text-sm text-text-primary/80 leading-relaxed">
                Data older than the retention period will be automatically archived. Default is 90 days.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>);
}
