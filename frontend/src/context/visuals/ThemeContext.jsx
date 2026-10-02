'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { DARK_THEME_IDS, LIGHT_VARIANTS, DARK_VARIANTS } from '@/src/config/theme.registry';

export { LIGHT_VARIANTS, DARK_VARIANTS };

const DEFAULT_LIGHT_VARIANT = 'light';
const DEFAULT_DARK_VARIANT = 'slate-dark';

const ThemeContext = createContext({
    theme: 'system',
    lightVariant: DEFAULT_LIGHT_VARIANT,
    darkVariant: DEFAULT_DARK_VARIANT,
    themeVariant: DEFAULT_LIGHT_VARIANT,
    resolvedTheme: 'light',
    isDark: false,
    setTheme: () => {},
    setLightVariant: () => {},
    setDarkVariant: () => {},
});

function getSystemTheme() {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveVariant(mode, lightVariant, darkVariant) {
    const family = mode === 'system' ? getSystemTheme() : mode;
    return family === 'dark' ? darkVariant : lightVariant;
}

function applyResolved(variantId) {
    const isDark = DARK_THEME_IDS.has(variantId);
    document.documentElement.setAttribute('data-theme', variantId);
    document.documentElement.classList.toggle('dark', isDark);
    return isDark;
}

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState('system');
    const [lightVariant, setLightVariantState] = useState(DEFAULT_LIGHT_VARIANT);
    const [darkVariant, setDarkVariantState] = useState(DEFAULT_DARK_VARIANT);
    const [themeVariant, setThemeVariant] = useState(DEFAULT_LIGHT_VARIANT);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const savedMode = localStorage.getItem('theme') ?? 'system';
        const savedLight = localStorage.getItem('theme-light-variant') ?? DEFAULT_LIGHT_VARIANT;
        const savedDark = localStorage.getItem('theme-dark-variant') ?? DEFAULT_DARK_VARIANT;
        const variant = resolveVariant(savedMode, savedLight, savedDark);
        setThemeState(savedMode);
        setLightVariantState(savedLight);
        setDarkVariantState(savedDark);
        setThemeVariant(variant);
        setIsDark(applyResolved(variant));
    }, []);

    // Re-subscribe to OS changes whenever theme is 'system'
    useEffect(() => {
        if (theme !== 'system') return;
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => {
            const variant = resolveVariant('system', lightVariant, darkVariant);
            setThemeVariant(variant);
            setIsDark(applyResolved(variant));
        };
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, [theme, lightVariant, darkVariant]);

    const setTheme = (mode) => {
        const variant = resolveVariant(mode, lightVariant, darkVariant);
        setThemeState(mode);
        setThemeVariant(variant);
        setIsDark(applyResolved(variant));
        localStorage.setItem('theme', mode);
    };

    const setLightVariant = (id) => {
        setLightVariantState(id);
        localStorage.setItem('theme-light-variant', id);
        if (!isDark) {
            const variant = resolveVariant(theme, id, darkVariant);
            setThemeVariant(variant);
            setIsDark(applyResolved(variant));
        }
    };

    const setDarkVariant = (id) => {
        setDarkVariantState(id);
        localStorage.setItem('theme-dark-variant', id);
        if (isDark) {
            const variant = resolveVariant(theme, lightVariant, id);
            setThemeVariant(variant);
            setIsDark(applyResolved(variant));
        }
    };

    return (
        <ThemeContext.Provider
            value={{
                theme,
                lightVariant,
                darkVariant,
                themeVariant,
                resolvedTheme: isDark ? 'dark' : 'light',
                isDark,
                setTheme,
                setLightVariant,
                setDarkVariant,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
