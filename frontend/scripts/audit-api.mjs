#!/usr/bin/env node
/**
 * audit-api.mjs — static sanity check for the API/proxy layer.
 *
 * Enforces the invariants in CLAUDE.md "API & Proxy Architecture" that are
 * mechanically checkable, so route/service drift fails CI instead of silently
 * accumulating into 404s and 405s nobody notices:
 *
 *   1. DEAD PATH    — a service/client references /api/<x> with no route handler.
 *   2. EMPTY ROUTE  — a route.js exporting no HTTP method (Next.js answers 405).
 *   3. DIRECT FETCH — client code calling fetch('/api/...') instead of a service
 *                     (rule 8: components → services → apiClient → /api/*).
 *   4. LEAKED HOST  — a hardcoded backend host/IP outside src/app/api
 *                     (rule 17: backend URLs live only in backends.js + .env).
 *
 * Paths built from a BASE constant (`${BASE}/list`) can't be resolved statically;
 * those are reported as INFO, never failures — verify them live (Chrome DevTools
 * MCP) rather than guessing here.
 *
 * Usage: npm run audit:api
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const API_DIR = 'src/app/api';

// Hosts that are legitimately client-side: CDNs, Microsoft login, docs links.
const ALLOWED_HOST_RE = /w3\.org|schema\.org|github\.com|cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|images\.unsplash\.com|login\.microsoftonline\.com|example\.com|localhost:3000|\/swagger/;

// Mock/fixture/test data describes other systems' URLs, not ours — never a finding.
const NON_PRODUCTION_RE = /__fixtures__|__mocks__|__tests__|\.test\.|\.spec\./;

function walk(dir, out = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (e.name === 'node_modules' || e.name === '.next') continue;
        const p = path.join(dir, e.name).split(path.sep).join('/');
        if (e.isDirectory()) walk(p, out);
        else out.push(p);
    }
    return out;
}

/** Blank out comments and import lines so they never register as real call sites. */
function stripNoise(src) {
    return src
        .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
        .split('\n')
        .map((l) => (/^\s*(\/\/|\*|import\s)/.test(l) ? '' : l.replace(/\/\/.*$/, '')))
        .join('\n');
}

const all = walk('src');
const routeFiles = all.filter((f) => f.startsWith(`${API_DIR}/`) && f.endsWith('/route.js'));
const clientFiles = all.filter(
    (f) => !f.startsWith(`${API_DIR}/`) && /\.(js|jsx)$/.test(f) && !NON_PRODUCTION_RE.test(f)
);

const routes = routeFiles.map((f) => ({
    file: f,
    pattern: f.slice(API_DIR.length).replace('/route.js', ''),
}));

/** Does a concrete /api path match a Next.js route pattern (dynamic + catch-all aware)? */
function matches(p, pattern) {
    const ps = pattern.split('/').filter(Boolean);
    const xs = p.split('/').filter(Boolean);
    let i = 0;
    for (const seg of ps) {
        if (seg.startsWith('[...')) return true;
        if (i >= xs.length) return false;
        if (seg.startsWith('[')) { i++; continue; }
        if (seg !== xs[i]) return false;
        i++;
    }
    return i === xs.length;
}

const deadPaths = new Map();
const dynamicPaths = new Map();
const directFetches = [];
const leakedHosts = [];

for (const f of clientFiles) {
    const raw = fs.readFileSync(f, 'utf8');
    const src = stripNoise(raw);

    // Pass 1: collect `const BASE = '/api/...'` so that `${BASE}/leaf` call sites —
    // by far the most common shape in src/services — can be resolved to a real path.
    // Without this the audit silently ignores them and reports false confidence.
    const bases = new Map();
    for (const bm of src.matchAll(/(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*[`'"](\/api\/[^`'"\s]*)[`'"]/g)) {
        bases.set(bm[1], bm[2].replace(/\/+$/, ''));
    }

    src.split('\n').forEach((line, idx) => {
        const loc = `${f}:${idx + 1}`;

        if (/fetch\(\s*[`'"]\/api\//.test(line)) directFetches.push(loc);

        const hostRe = /[`'"](https?:\/\/[^`'"\s]+)/g;
        let h;
        while ((h = hostRe.exec(line))) {
            if (!ALLOWED_HOST_RE.test(h[1])) leakedHosts.push(`${loc}  ${h[1]}`);
        }

        // Literal `/api/...` occurrences, plus `${BASE}/leaf` expanded via the map.
        const hits = [];
        for (const m of line.matchAll(/[`'"](\/api\/[^`'"\s]*)/g)) hits.push(m[1]);
        for (const m of line.matchAll(/[`'"]\$\{(\w+)\}([^`'"\s]*)/g)) {
            if (bases.has(m[1])) hits.push(bases.get(m[1]) + m[2]);
        }

        for (const hit of hits) {
            const m = [null, hit];
            const hadTemplate = /\$\{/.test(m[1]);
            let p = m[1].replace(/\$\{[^}]*\}/g, 'X').split('?')[0].replace(/\/+$/, '');
            p = p.replace(/^\/api/, '');
            if (!p) continue;
            if (routes.some((r) => matches(p, r.pattern))) continue;
            // `const BASE = '/api/x'` feeding `${BASE}/leaf` calls is a prefix, not an
            // endpoint — legitimate as long as real routes live underneath it. Only
            // skip when that holds; a base with nothing under it is still dead.
            const isConstDecl = /^\s*(?:export\s+)?(?:const|let|var)\s+\w+\s*=\s*[`'"]/.test(line);
            if (isConstDecl && routes.some((r) => r.pattern.startsWith(`${p}/`))) continue;
            const bucket = hadTemplate ? dynamicPaths : deadPaths;
            if (!bucket.has(p)) bucket.set(p, new Set());
            bucket.get(p).add(loc);
        }
    });
}

const emptyRoutes = routeFiles.filter(
    (f) => !/export\s+(async\s+function|const)\s*\{?\s*(GET|POST|PUT|PATCH|DELETE)/.test(
        fs.readFileSync(f, 'utf8').replace(/\s+/g, ' ')
    ) && !/createProxy|createCatchAllProxy|runProxy|proxyToCDM/.test(fs.readFileSync(f, 'utf8'))
);

// ── Report ───────────────────────────────────────────────────────────────────
const section = (title, items, render) => {
    if (!items.length) return 0;
    console.log(`\n✖ ${title} (${items.length})`);
    items.forEach(render);
    return items.length;
};

console.log(`API audit — ${routes.length} route handlers, ${clientFiles.length} client files scanned`);

let failures = 0;
failures += section('DEAD PATHS (no matching route handler)', [...deadPaths].sort(), ([p, locs]) => {
    console.log(`   /api${p}`);
    [...locs].forEach((l) => console.log(`      ${l}`));
});
failures += section('EMPTY ROUTES (export no HTTP method → 405)', emptyRoutes, (f) => console.log(`   ${f}`));
failures += section('DIRECT fetch(\'/api/...\') in client code (use a service)', directFetches, (l) => console.log(`   ${l}`));
failures += section('HARDCODED backend host outside src/app/api', leakedHosts, (l) => console.log(`   ${l}`));

if (dynamicPaths.size) {
    console.log(`\nℹ  Dynamic paths — built from a BASE constant, verify live (${dynamicPaths.size})`);
    [...dynamicPaths].sort().forEach(([p, locs]) => console.log(`   /api${p}  ← ${[...locs][0]}`));
}

if (failures === 0) {
    console.log('\n✔ API layer clean — no dead paths, empty routes, direct fetches, or leaked hosts.');
    process.exit(0);
}
console.log(`\n${failures} issue group(s) found.`);
process.exit(1);
