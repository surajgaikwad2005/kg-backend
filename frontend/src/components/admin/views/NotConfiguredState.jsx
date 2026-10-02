'use client';
import React from 'react';
import { AlertTriangle } from 'lucide-react';
export function NotConfiguredState({ title, message, onAction }) {
    return (<div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-6 bg-surface border border-border border-dashed rounded-3xl">
      <div className="w-20 h-20 bg-warning/10 rounded-full flex items-center justify-center text-warning">
        <AlertTriangle size={40}/>
      </div>
      <div className="max-w-md space-y-2">
        <h3 className="text-2xl font-bold text-text-primary">{title}</h3>
        <p className="text-text-muted">{message}</p>
      </div>
      <button onClick={onAction} className="bg-brand hover:bg-brand-hover text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-brand/20 transition-all">
        Configure Data Sources
      </button>
    </div>);
}
