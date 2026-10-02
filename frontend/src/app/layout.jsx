import { Plus_Jakarta_Sans, Inter, DM_Sans, Manrope, IBM_Plex_Sans, Sora } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/src/components/ui/Toast';
import { ConfirmProvider } from '@/src/components/ui/ConfirmModal';
import { AppProvider } from '@/src/context/AppContext';
// PlantsProvider + PlantCodeBanner deliberately live in the (dashboard) and
// (admin) layouts, NOT here. This root layout also wraps the login page ("/"),
// and PlantsProvider fetches the plant registry on mount — mounting it here
// fired GET /api/plant-id before any auth cookie existed, guaranteeing a 401 on
// every login-screen load. Keeping it in the authenticated shells makes that
// call structurally impossible before sign-in. The banner moves with it because
// it renders PlantIdSelector, which calls usePlants().
// QueryProvider sits INSIDE ConfirmProvider (so query/mutation error handlers can
// reach the toast + confirm APIs) and OUTSIDE AppProvider (so nothing that reads
// plantCode — the key dimension of every plant-scoped query — lives outside the
// cache). It is also above AuthInterceptor, which calls useQueryClient() to wipe
// the cache on forced logout.
//
// Unlike PlantsProvider (see the note above), QueryClientProvider is safe in the
// root layout even though this layout also wraps the unauthenticated login page:
// it fetches nothing on mount. The 401-before-login trap applies to individual
// QUERIES, which is why every plant-scoped query must set `enabled: !!plantCode`.
// Imported from the module directly, not the barrel: the barrel also re-exports
// useJobPolling/useUploadMutation, and pulling it into the ROOT layout would put
// both 'use client' hook modules into the client bundle of every single route,
// including routes that never upload or poll anything.
import { QueryProvider } from '@/src/lib/query/QueryProvider';
import { ThemeProvider } from '@/src/context/visuals/ThemeContext';
import { CustomizationProvider } from '@/src/context/visuals/CustomizationContext';
// Disabled during local dev — multiple backends are unreachable while testing
// against local/partial setups, so this modal fires too often to be useful.
// Re-enable by uncommenting this import + the <BackendOfflineModal /> below.
// import BackendOfflineModal from '@/src/components/ui/BackendOfflineModal';

const jakarta = Plus_Jakarta_Sans({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800'],
    variable: '--font-jakarta',
    display: 'swap',
});

const inter = Inter({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800'],
    variable: '--font-inter',
    display: 'swap',
});

const dmSans = DM_Sans({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800'],
    variable: '--font-dm-sans',
    display: 'swap',
});

const manrope = Manrope({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800'],
    variable: '--font-manrope',
    display: 'swap',
});

const ibmPlexSans = IBM_Plex_Sans({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-ibm-plex-sans',
    display: 'swap',
});

const sora = Sora({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800'],
    variable: '--font-sora',
    display: 'swap',
});

export const metadata = {
    title: 'DECISION INTELLIGENCE',
    description: 'AI PLANTOPS Decision Intelligence',
};

// Runs before hydration to set data-theme/.dark/--do-radius/--do-font-scale/
// --font-sans/--do-line-height/--do-letter-spacing/data-tabular-nums from
// localStorage, so first paint already matches the saved theme + typography
// (no flash of the default light variant or default font). Keep the DARK_IDS
// list and every option map below in sync with theme.registry.js and
// CustomizationContext.jsx — this is a plain inline script, so it can't import them.
const THEME_BOOTSTRAP_SCRIPT = `(function(){try{
var DARK_IDS=['slate-dark','midnight','github','soft-dark','hc-dark','glass-dark'];
var mode=localStorage.getItem('theme')||'system';
var lightVariant=localStorage.getItem('theme-light-variant')||'light';
var darkVariant=localStorage.getItem('theme-dark-variant')||'slate-dark';
var family=mode==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):mode;
var variant=family==='dark'?darkVariant:lightVariant;
var root=document.documentElement;
root.setAttribute('data-theme',variant);
if(DARK_IDS.indexOf(variant)!==-1)root.classList.add('dark');
var prefs={};
try{prefs=JSON.parse(localStorage.getItem('do-customization-v1')||'{}');}catch(e){}
var GEOMETRY={sharp:'0.25rem',standard:'0.5rem',soft:'1rem'};
var FONT_SCALE={xs:0.786,sm:0.857,md:1,lg:1.143,xl:1.286};
var FONT_STACK={helvetica:'var(--font-helvetica)',jakarta:'var(--font-jakarta)',inter:'var(--font-inter)','dm-sans':'var(--font-dm-sans)',manrope:'var(--font-manrope)','ibm-plex-sans':'var(--font-ibm-plex-sans)',sora:'var(--font-sora)'};
var LINE_HEIGHT={compact:1.35,normal:1.55,relaxed:1.75};
var LETTER_SPACING={tight:'-0.01em',normal:'0em',wide:'0.02em'};
root.style.setProperty('--do-radius',GEOMETRY[prefs.geometry]||GEOMETRY.standard);
root.style.setProperty('--do-font-scale',String(FONT_SCALE[prefs.fontScale]||FONT_SCALE.md));
root.style.setProperty('--font-sans',FONT_STACK[prefs.fontId]||FONT_STACK.helvetica);
root.style.setProperty('--do-line-height',String(LINE_HEIGHT[prefs.lineHeight]||LINE_HEIGHT.normal));
root.style.setProperty('--do-letter-spacing',LETTER_SPACING[prefs.letterSpacing]||LETTER_SPACING.normal);
root.setAttribute('data-tabular-nums',prefs.tabularNumbers?'1':'0');
root.setAttribute('data-industrial-bg',prefs.industrialBackground===false?'0':'1');
}catch(e){}})();`;

export default function RootLayout({ children }) {
    return (
        // The .variable classes (--font-jakarta etc.) must live on <html>, not just
        // <body>: --font-sans is set on <html> (see bootstrap script + applyPrefs)
        // as `var(--font-jakarta)`, and CSS resolves that var() using values visible
        // at the SAME element where --font-sans itself is declared. If --font-jakarta
        // were only defined on <body> (a descendant), --font-sans would compute to
        // invalid on <html> and inherit down as empty everywhere — which is exactly
        // why the font-family picker previously had no visible effect anywhere.
        <html
            lang="en"
            className={`${jakarta.variable} ${inter.variable} ${dmSans.variable} ${manrope.variable} ${ibmPlexSans.variable} ${sora.variable}`}
            suppressHydrationWarning
        >
            <head>
                <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }} suppressHydrationWarning />
            </head>
            <body
                className={jakarta.className}
                suppressHydrationWarning
            >
                <ThemeProvider>
                    <CustomizationProvider>
                        <ToastProvider>
                            <ConfirmProvider>
                                <QueryProvider>
                                    <AppProvider>
                                        {children}
                                    </AppProvider>
                                </QueryProvider>
                            </ConfirmProvider>
                        </ToastProvider>
                    </CustomizationProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
