import { ThemeProvider } from '@/src/context/visuals/ThemeContext';
import { DomainConfigProvider } from '@/src/context/domain-config/DomainConfigContext';

/**
 * Layout for /admin/domain-configuration/pnid/* — real Next.js URL routes.
 * The global chrome (Sidebar + PageHeader) lives one level up in
 * src/app/(admin)/admin/layout.jsx, which shares it across the whole /admin
 * tree instead of remounting it per feature (see CLAUDE.md #45) — that shared
 * layout special-cases this route's header title/subtitle. This layout only
 * owns the feature-level providers (Theme, DomainConfig) and the
 * overflow-hidden wrapper the canvas-heavy pnid workspace needs. Toasts are
 * handled by the single root ToastProvider in src/app/layout.jsx — its
 * module-global store covers this subtree too, so no nested ToastProvider is
 * needed here.
 */
export default function PnidLayout({ children }) {
  return (
    <ThemeProvider>
      <DomainConfigProvider>
        <div className="flex-1 min-h-0 overflow-hidden">
          {children}
        </div>
      </DomainConfigProvider>
    </ThemeProvider>
  );
}
