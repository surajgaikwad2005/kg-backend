'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Download, Database, Share2 } from 'lucide-react';
export function DataModelView() {
    const tables = [
        { name: 'Assets', columns: ['id', 'tag', 'type', 'location', 'status'], color: 'bg-chart-1' },
        { name: 'Maintenance', columns: ['id', 'asset_id', 'date', 'technician', 'notes'], color: 'bg-chart-3' },
        { name: 'Sensors', columns: ['id', 'asset_id', 'type', 'unit', 'reading'], color: 'bg-chart-5' },
        { name: 'WorkOrders', columns: ['id', 'asset_id', 'priority', 'status', 'due_date'], color: 'bg-chart-4' },
    ];
    return (<div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Data Model Schema</h2>
          <p className="text-text-muted text-sm">Visual representation of the unified data schema across all sources.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-surface-2 hover:bg-surface text-text-primary px-4 py-2 rounded-xl text-xs font-bold border border-white/10 transition-all flex items-center gap-2">
            <Plus size={14}/>
            Add Entity
          </button>
          <button className="bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-brand/20 transition-all flex items-center gap-2">
            <Download size={14}/>
            Export Schema
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tables.map((table) => (<motion.div key={table.name} whileHover={{ y: -5 }} className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xl">
            <div className={`h-1.5 ${table.color}`}></div>
            <div className="p-4 border-b border-border bg-surface-2 flex items-center justify-between">
              <h3 className="font-bold text-text-primary text-sm">{table.name}</h3>
              <Database size={14} className="text-text-subtle"/>
            </div>
            <div className="p-4 space-y-2">
              {table.columns.map((col) => (<div key={col} className="flex items-center justify-between group">
                  <span className="text-xs text-text-muted group-hover:text-text-primary transition-colors">{col}</span>
                  <span className="text-[10px] text-text-secondary font-mono">string</span>
                </div>))}
            </div>
            <div className="p-3 bg-surface-2/40 border-t border-border flex items-center justify-between">
              <span className="text-[10px] font-bold text-text-subtle uppercase">Relationships</span>
              <span className="text-[10px] text-brand">2 Links</span>
            </div>
          </motion.div>))}
      </div>

      {/* Visual Connections Placeholder */}
      <div className="bg-surface border border-border rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-4 border-dashed">
        <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center text-brand">
          <Share2 size={32}/>
        </div>
        <div>
          <h3 className="text-lg font-bold text-text-primary">Relationship Mapper</h3>
          <p className="text-sm text-text-muted max-w-md mx-auto">
            Drag and drop entities to define foreign key relationships and unified data joins across your enterprise sources.
          </p>
        </div>
        <button className="text-brand hover:underline text-sm font-bold">
          Open Visual Editor
        </button>
      </div>
    </div>);
}
