"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/src/lib/utils";

/**
 * Theme-aware Tridiagonal wordmark.
 *
 * Renders BOTH artwork files and lets CSS pick one, instead of branching on a
 * JS theme value — a JS branch would flash the wrong logo on first paint (the
 * theme is applied by the inline script in layout.jsx before hydration). Every
 * dark theme variant puts `.dark` on <html>, so the `dark:` variant covers all
 * 12 Appearance themes, not just the default dark one.
 */
const LOGO_DARK = "/tridiagonal_ai_logo_dark_theme.png";
const LOGO_LIGHT = "/tridiagonal_ai_logo_light_theme.png";

export function BrandLogo({
    className,
    width = 200,
    height = 55,
    alt = "Tridiagonal AI",
    priority = false,
}) {
    return (
        <>
            <Image
                src={LOGO_DARK}
                alt={alt}
                width={width}
                height={height}
                priority={priority}
                className={cn("hidden object-contain dark:block", className)}
            />
            <Image
                src={LOGO_LIGHT}
                alt={alt}
                width={width}
                height={height}
                priority={priority}
                className={cn("block object-contain dark:hidden", className)}
            />
        </>
    );
}

export default BrandLogo;
