'use client';

/** Validation status → icon + theme-aware classes (badge + panel). */
import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export function getValidationIconAndCls(valid) {
    if (valid === true) {
        return {
            icon: <CheckCircle2 size={16} />,
            label: 'Connection Validated',
            badge: 'bg-success/10 border-success/30 text-success',
            panel: 'bg-success/5 border-success/30',
        };
    }
    if (valid === false) {
        return {
            icon: <AlertTriangle size={16} />,
            label: 'Connection Mismatch / Reverse',
            badge: 'bg-warning/10 border-warning/30 text-warning',
            panel: 'bg-warning/5 border-warning/30',
        };
    }
    return {
        icon: <XCircle size={16} />,
        label: 'Invalid / Baseline Missing',
        badge: 'bg-danger/10 border-danger/30 text-danger',
        panel: 'bg-danger/5 border-danger/30',
    };
}
