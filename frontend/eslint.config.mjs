import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import pluginQuery from "@tanstack/eslint-plugin-query";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // TanStack Query lint rules. `exhaustive-deps` is the load-bearing one: a query
  // key that omits a value its queryFn closes over (most dangerously `plantCode`)
  // does not throw, does not warn, and does not fail the build — it silently
  // serves one plant's data under another plant's key. That defect is nearly
  // invisible in review and trivially caught here.
  // Also included by flat/recommended: stable-query-client (QueryClient must not
  // be created at module scope), no-unstable-deps (a useQuery/useMutation result
  // is a fresh object every render, so putting one in a dependency array
  // silently defeats the useMemo/useCallback around it), no-rest-destructuring,
  // no-void-query-fn, and the property-order rules.
  ...pluginQuery.configs["flat/recommended"],
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
