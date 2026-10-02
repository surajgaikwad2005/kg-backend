'use client';

import React from 'react';
import { Badge } from '@/src/components/ui/Badge';
import { AzureLoginButton } from '@/src/components/auth/AzureLoginButton';

export function AuthenticateCard({ onAzureSuccess, onAzureError }) {
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-left-6 duration-700">
            {/* Header */}
            <div className="space-y-4 text-center">
                <Badge variant="primary">
                    System Gateway Active
                </Badge>
                <h2 className="text-4xl font-bold text-text-primary tracking-tight">Authenticate</h2>
                <p className="text-text-muted text-sm leading-relaxed max-w-[280px] mx-auto font-medium">
                    Sign in with your organization&apos;s Microsoft account to begin the sequence.
                </p>
            </div>

            {/* Azure Entra ID is the only supported login method */}
            <AzureLoginButton onSuccess={onAzureSuccess} onError={onAzureError} />

            {/* Footer */}
            <div className="pt-2 flex flex-col items-center gap-5">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-[1px] bg-border" />
                    <span className="text-[10px] uppercase tracking-[0.3em] text-text-subtle font-bold">Security Context</span>
                    <div className="w-8 h-[1px] bg-border" />
                </div>
            </div>
        </div>
    );
}
