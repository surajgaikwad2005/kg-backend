'use client';

import React from 'react';
import { cn } from '@/src/lib/utils';
import { Skeleton } from '@/src/components/ui/Skeleton';

export function CpcpOntologySkeleton({ columns = [], clientName, rowsCount = 6 }) {
    const colCount = 4 + columns.length + (clientName ? 1 : 0);

    return (
        <React.Fragment>
            {Array.from({ length: rowsCount }).map((_, r) => {
                const rowDelay = +(r * 0.09).toFixed(2);
                let colIndex = 0;
                
                const d = () => +(rowDelay + (colIndex++) * 0.015).toFixed(3);

                return (
                    <tr key={r} className="border-b border-border/40 last:border-0" aria-busy="true">
                        <td className="px-5 py-4 text-center">
                            <Skeleton delay={d()} className="h-4 w-5 mx-auto rounded" />
                        </td>
                        <td className="px-4 py-4">
                            <Skeleton delay={d()} className="h-5 w-24 rounded-md" />
                        </td>
                        {clientName && (
                            <td className="px-4 py-4">
                                <Skeleton delay={d()} className="h-5 w-8 rounded-md" />
                            </td>
                        )}
                        <td className="px-4 py-4">
                            <Skeleton delay={d()} className="h-5 w-48 rounded" />
                        </td>
                        {columns.map((col) => (
                            <td key={col.key} className="px-3 py-4 text-center">
                                <Skeleton delay={d()} className="h-5 w-20 mx-auto rounded" />
                            </td>
                        ))}
                        <td className="px-5 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                                <Skeleton delay={+(rowDelay + 0.14).toFixed(2)} className="h-8 w-8 rounded-lg" />
                                <Skeleton delay={+(rowDelay + 0.16).toFixed(2)} className="h-8 w-8 rounded-lg" />
                            </div>
                        </td>
                    </tr>
                );
            })}
        </React.Fragment>
    );
}
