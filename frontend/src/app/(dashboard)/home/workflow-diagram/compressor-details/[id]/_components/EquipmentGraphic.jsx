'use client';
import React from 'react';
import { ImageOff } from 'lucide-react';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { cn } from '@/src/lib/utils';
import { PanelError, PanelEmpty } from '../../_components/PanelState';

/**
 * EquipmentGraphic — draws the resolved P&ID symbol for this equipment.
 *
 * The markup comes from `useEquipmentGraphic`, which compiles the plant's own
 * generated component source (already DOMPurify-sanitized inside
 * `parseGeneratedSvg` — see its header) or falls back to a built-in catalog
 * component. Two shapes are possible, so both are handled here rather than
 * pushing the branch onto every caller:
 *   • `markup`  — sanitized SVG string from the plant library
 *   • `render()`— a React element from the built-in catalog
 *
 * Colors inside the drawing are the component's own; the frame around it uses
 * semantic tokens, so the panel tracks every theme variant, the accent color,
 * density and `--do-radius` from Settings.
 */

/** Shimmer shaped like a schematic, so the swap-in is not a layout jump. */
function GraphicSkeleton() {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6" aria-busy="true">
            <Skeleton className="h-1/2 w-3/5 rounded-xl" />
            <Skeleton delay={0.12} className="h-2.5 w-2/5 rounded-full" />
            <Skeleton delay={0.2} className="h-2.5 w-1/4 rounded-full" />
            <span className="sr-only">Loading equipment drawing</span>
        </div>
    );
}

export function EquipmentGraphic({ graphic, loading, error, onRetry, name, className }) {
    if (loading) return <GraphicSkeleton />;
    if (error) return <PanelError message={error} onRetry={onRetry} />;

    if (!graphic) {
        return (
            <PanelEmpty
                icon={<ImageOff className="h-7 w-7" />}
                title="No drawing for this component"
                description="This equipment has no generated P&ID symbol in the plant's component library yet. Generate it from the Workflow Diagram palette to see it here."
            />
        );
    }

    return (
        <figure
            className={cn(
                'flex h-full w-full flex-col items-center justify-center gap-3 p-4',
                className
            )}
        >
            <div className="flex min-h-0 w-full flex-1 items-center justify-center">
                {graphic.markup ? (
                    <svg
                        role="img"
                        aria-label={`${name} equipment drawing`}
                        viewBox={graphic.viewBox}
                        preserveAspectRatio="xMidYMid meet"
                        className="h-full max-h-full w-full max-w-full overflow-visible"
                    >
                        <g dangerouslySetInnerHTML={{ __html: graphic.markup }} />
                    </svg>
                ) : (
                    <div
                        role="img"
                        aria-label={`${name} equipment drawing`}
                        className="flex h-full w-full items-center justify-center [&_svg]:h-full [&_svg]:w-full [&_svg]:overflow-visible"
                    >
                        {graphic.render()}
                    </div>
                )}
            </div>

            {graphic.description && (
                <figcaption className="shrink-0 text-center text-tiny font-semibold leading-relaxed text-text-muted">
                    {graphic.description}
                </figcaption>
            )}
        </figure>
    );
}
