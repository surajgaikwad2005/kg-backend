'use client';
import React from 'react';
import { Upload, Server, FileCode, Trash2, CheckCircle2, RefreshCw, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import { usePnidForm } from '@/src/components/admin/AdminPanelContext';

export function ConfigModalPnid({ pnidInputRef }) {
    const {
        pnidTab, setPnidTab,
        pnidFiles, setPnidFiles,
        pnidUploadProgress,
        pnidUploading,
        pnidJobStatus,
        pnidMinimized, setPnidMinimized,
        pnidCloudType, setPnidCloudType,
        pnidCloudConfig, setPnidCloudConfig,
    } = usePnidForm();

    return (
      <div className="space-y-5">
        <div className="flex gap-1 p-1 bg-surface-2/60 border border-border rounded-xl">
          {[['device', 'Device', Upload], ['cloud', 'Cloud', Server]].map(([key, label, Icon]) => (
            <button key={key} onClick={() => setPnidTab(key)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${pnidTab === key
                      ? 'bg-brand text-text-primary shadow-lg shadow-brand/20'
                      : 'text-text-muted hover:text-text-primary hover:bg-surface-2'}`}>
              <Icon size={14}/>
              {label}
            </button>
          ))}
        </div>

        {pnidTab === 'device' && (
          <div className="space-y-4">
            <div onClick={() => pnidInputRef.current?.click()} onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }} onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const droppedFiles = Array.from(e.dataTransfer.files);
                    setPnidFiles(prev => [...prev, ...droppedFiles]);
                }} className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-brand hover:bg-surface-2 transition-all cursor-pointer group">
              <div className="w-14 h-14 rounded-full bg-brand/10 flex items-center justify-center text-brand group-hover:scale-110 transition-transform">
                <Upload size={28}/>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-text-primary">Click to upload or drag and drop</p>
                <p className="text-xs text-text-muted mt-1">PDF, PNG, JPG, TIFF, SVG or any image (max. 50MB)</p>
              </div>
              <input type="file" ref={pnidInputRef} multiple accept=".pdf,.png,.jpg,.jpeg,.gif,.bmp,.tif,.tiff,.svg,.webp" className="hidden" onChange={(e) => {
                    const selected = Array.from(e.target.files || []);
                    setPnidFiles(prev => [...prev, ...selected]);
                    e.target.value = '';
                }}/>
            </div>

            {pnidFiles.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border">
                {pnidFiles.map((f, i) => {
                  const prog = pnidUploadProgress.find(p => p.name === f.name);
                  return (
                    <div key={i} className="flex items-center justify-between p-3 bg-surface-2/40 border border-border rounded-lg">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileCode size={16} className="text-brand shrink-0"/>
                        <div className="min-w-0">
                          <p className="text-xs text-text-primary truncate">{f.name}</p>
                          <p className="text-[10px] text-text-muted">{(f.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {prog?.status === 'uploaded' && <CheckCircle2 size={14} className="text-success"/>}
                        {prog?.status === 'uploading' && <RefreshCw size={14} className="text-brand animate-spin"/>}
                        {prog?.status === 'failed' && <AlertTriangle size={14} className="text-danger"/>}
                        {!pnidUploading && (
                          <button aria-label="Remove file" onClick={(e) => { e.stopPropagation(); setPnidFiles(prev => prev.filter((_, j) => j !== i)); }} className="text-text-muted hover:text-danger p-1">
                            <Trash2 size={12}/>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {pnidUploading && (
              <div className="p-3 bg-brand/5 border border-brand/20 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-brand">
                    {pnidJobStatus === 'completed' ? 'Upload Complete' :
                        pnidJobStatus === 'failed' ? 'Upload Failed' :
                            `Uploading ${pnidUploadProgress.filter(p => p.status === 'uploaded').length}/${pnidFiles.length} files...`}
                  </span>
                  <button aria-label="Toggle details" onClick={() => setPnidMinimized(!pnidMinimized)} className="text-text-muted hover:text-text-primary p-1">
                    {pnidMinimized ? <ChevronRight size={14}/> : <ChevronDown size={14}/>}
                  </button>
                </div>
                {!pnidMinimized && (
                  <div className="w-full bg-surface-2 rounded-full h-1.5">
                    <div style={{ '--progress': `${pnidUploadProgress.length ? (pnidUploadProgress.filter(p => p.status === 'uploaded').length / pnidUploadProgress.length) * 100 : 0}%` }} className={`h-1.5 rounded-full transition-all duration-500 w-[var(--progress)] ${pnidJobStatus === 'failed' ? 'bg-danger' : 'bg-brand'}`}/>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {pnidTab === 'cloud' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Cloud Provider</label>
              <div className="flex gap-2">
                {['s3', 'adls', 'gcs'].map(ct => (
                  <button key={ct} onClick={() => { setPnidCloudType(ct); setPnidCloudConfig({}); }} className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${pnidCloudType === ct
                          ? 'bg-brand/10 border-brand text-brand'
                          : 'bg-surface-2/40 border-border text-text-muted hover:border-white/20'}`}>
                    {ct === 's3' ? 'Amazon S3' : ct === 'adls' ? 'Azure Data Lake' : 'Google Cloud'}
                  </button>
                ))}
              </div>
            </div>

            {pnidCloudType === 's3' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Bucket Name</label>
                  <input type="text" placeholder="my-pnid-bucket" value={pnidCloudConfig.bucket || ''} onChange={e => setPnidCloudConfig({ ...pnidCloudConfig, bucket: e.target.value })} className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand transition-colors"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Prefix / Folder Path</label>
                  <input type="text" placeholder="raw/pnid" value={pnidCloudConfig.prefix || ''} onChange={e => setPnidCloudConfig({ ...pnidCloudConfig, prefix: e.target.value })} className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand transition-colors"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Region</label>
                  <input type="text" placeholder="us-east-1" value={pnidCloudConfig.region || ''} onChange={e => setPnidCloudConfig({ ...pnidCloudConfig, region: e.target.value })} className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand transition-colors"/>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Access Key</label>
                    <input type="password" placeholder="AKIA..." value={pnidCloudConfig.access_key || ''} onChange={e => setPnidCloudConfig({ ...pnidCloudConfig, access_key: e.target.value })} className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand transition-colors"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Secret Key</label>
                    <input type="password" placeholder="••••••••" value={pnidCloudConfig.secret_key || ''} onChange={e => setPnidCloudConfig({ ...pnidCloudConfig, secret_key: e.target.value })} className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand transition-colors"/>
                  </div>
                </div>
              </div>
            )}
            {pnidCloudType === 'adls' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Account Name</label>
                    <input type="text" placeholder="mystorageaccount" value={pnidCloudConfig.account_name || ''} onChange={e => setPnidCloudConfig({ ...pnidCloudConfig, account_name: e.target.value })} className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand transition-colors"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Container</label>
                    <input type="text" placeholder="pnid-data" value={pnidCloudConfig.container || ''} onChange={e => setPnidCloudConfig({ ...pnidCloudConfig, container: e.target.value })} className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand transition-colors"/>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Prefix / Folder Path</label>
                  <input type="text" placeholder="raw/pnid" value={pnidCloudConfig.prefix || ''} onChange={e => setPnidCloudConfig({ ...pnidCloudConfig, prefix: e.target.value })} className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand transition-colors"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Account Key</label>
                  <input type="password" placeholder="Account key or leave blank for SAS Token" value={pnidCloudConfig.account_key || ''} onChange={e => setPnidCloudConfig({ ...pnidCloudConfig, account_key: e.target.value })} className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand transition-colors"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">SAS Token <span className="text-text-secondary normal-case">(if no account key)</span></label>
                  <input type="password" placeholder="sv=2023-01-03&ss=..." value={pnidCloudConfig.sas_token || ''} onChange={e => setPnidCloudConfig({ ...pnidCloudConfig, sas_token: e.target.value })} className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand transition-colors"/>
                </div>
                <div className="p-3 bg-surface-2 border border-border rounded-lg">
                  <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold mb-2">Service Principal (optional)</p>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="text" placeholder="Tenant ID" value={pnidCloudConfig.tenant_id || ''} onChange={e => setPnidCloudConfig({ ...pnidCloudConfig, tenant_id: e.target.value })} className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-brand transition-colors"/>
                    <input type="text" placeholder="Client ID" value={pnidCloudConfig.client_id || ''} onChange={e => setPnidCloudConfig({ ...pnidCloudConfig, client_id: e.target.value })} className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-brand transition-colors"/>
                    <input type="password" placeholder="Client Secret" value={pnidCloudConfig.client_secret || ''} onChange={e => setPnidCloudConfig({ ...pnidCloudConfig, client_secret: e.target.value })} className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-xs text-text-primary focus:outline-none focus:border-brand transition-colors"/>
                  </div>
                </div>
              </div>
            )}
            {pnidCloudType === 'gcs' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Bucket Name</label>
                    <input type="text" placeholder="my-gcs-bucket" value={pnidCloudConfig.bucket || ''} onChange={e => setPnidCloudConfig({ ...pnidCloudConfig, bucket: e.target.value })} className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand transition-colors"/>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Project ID</label>
                    <input type="text" placeholder="my-gcp-project" value={pnidCloudConfig.project_id || ''} onChange={e => setPnidCloudConfig({ ...pnidCloudConfig, project_id: e.target.value })} className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand transition-colors"/>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Prefix / Folder Path</label>
                  <input type="text" placeholder="raw/pnid" value={pnidCloudConfig.prefix || ''} onChange={e => setPnidCloudConfig({ ...pnidCloudConfig, prefix: e.target.value })} className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand transition-colors"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">Service Account JSON Path</label>
                  <input type="text" placeholder="/path/to/service-account.json" value={pnidCloudConfig.service_account_json || ''} onChange={e => setPnidCloudConfig({ ...pnidCloudConfig, service_account_json: e.target.value })} className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand transition-colors"/>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
}
