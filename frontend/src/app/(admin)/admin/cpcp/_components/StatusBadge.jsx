'use client';

import { Badge } from '@/src/components/ui/Badge';

const VARIANT_BY_STATUS = {
    active: 'success',
    draft: 'warning',
};

export function StatusBadge({ status }) {
    const variant = VARIANT_BY_STATUS[String(status).toLowerCase()] || 'info';
    return (
        <Badge variant={variant} pulse={false} className="normal-case tracking-normal font-bold text-[11px]">
            {status}
        </Badge>
    );
}
