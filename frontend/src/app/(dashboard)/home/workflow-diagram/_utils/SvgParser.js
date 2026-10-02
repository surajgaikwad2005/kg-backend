/**
 * SvgParser v8: Full JSX-to-SVG Runtime Compiler
 *
 * Renders React/JSX component code strings into pure SVG markup.
 * Handles: variable declarations, TSX interfaces/annotations, object/array scopes,
 * bracket notation lookups, .map() loops over array variables, template literals,
 * style={{ ... }} objects, camelCase→kebab-case.
 *
 * SECURITY: every parsed result is passed through DOMPurify (SVG profile)
 * before it is returned — the output of this parser is injected via
 * dangerouslySetInnerHTML (WorkflowContext, AiGeneratorTab), and the input is
 * AI-/backend-generated code, so script tags, event handlers (onload=…) and
 * javascript: URLs must never survive parsing.
 */
import DOMPurify from 'dompurify';

function stripTypeScript(code) {
    let clean = code
        .replace(/import\s+[\s\S]*?;/g, '')
        .replace(/interface\s+\w+\s*\{[\s\S]*?\}/g, '')
        .replace(/type\s+\w+\s*=[\s\S]*?;/g, '')
        .replace(/:\s*React\.FC<[^>]+>/g, '')
        .replace(/:\s*\w+(\[\])?/g, '')
        .replace(/\s+as\s+const/g, '');

    clean = clean.replace(/(?:const|let|var)\s+[A-Z][a-zA-Z0-9_]*\s*=\s*\([^)]*\)\s*=>\s*\{/g, '');
    return clean;
}

// ─── Expression Evaluator ─────────────────────────────────────────────────
function evaluateExpression(expr, scope) {
    if (!expr) return undefined;
    let e = expr.trim();

    e = e.replace(/\s+as\s+const$/i, '').trim();

    // String literals
    if ((e.startsWith('"') && e.endsWith('"')) || (e.startsWith("'") && e.endsWith("'"))) {
        return e.slice(1, -1);
    }

    // Numeric literals
    if (/^-?\d+(\.\d+)?$/.test(e)) return parseFloat(e);

    // Booleans / null / undefined
    if (e === 'true') return true;
    if (e === 'false') return false;
    if (e === 'null') return null;
    if (e === 'undefined') return undefined;

    // Logical NOT
    if (e.startsWith('!')) return !evaluateExpression(e.slice(1), scope);

    // Array literal: [1, 2, 3] or ["a", "b"]
    if (e.startsWith('[') && e.endsWith(']')) {
        try {
            const rawItems = e.slice(1, -1).split(',').map(s => s.trim()).filter(Boolean);
            return rawItems.map(item => evaluateExpression(item, scope));
        } catch {}
    }

    // Object literal: { key: val, ... }
    if (e.startsWith('{') && e.endsWith('}')) {
        try {
            const resultObj = {};
            const pairs = e.slice(1, -1).split(/,(?![^{]*\})/);
            for (const p of pairs) {
                if (!p.trim()) continue;
                const colonIdx = p.indexOf(':');
                if (colonIdx !== -1) {
                    const keyName = p.slice(0, colonIdx).trim().replace(/['"]/g, '');
                    const valExpr = p.slice(colonIdx + 1).trim();
                    resultObj[keyName] = evaluateExpression(valExpr, scope);
                }
            }
            return resultObj;
        } catch {}
    }

    // Bracket notation access: OBJ[key]
    const bracketMatch = e.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\[\s*(.+)\s*\]$/);
    if (bracketMatch) {
        const objName = bracketMatch[1];
        const keyExpr = bracketMatch[2];
        const obj = scope[objName];
        if (obj && typeof obj === 'object') {
            const keyVal = evaluateExpression(keyExpr, scope);
            if (keyVal !== undefined && keyVal !== null && keyVal in obj) {
                return obj[keyVal];
            }
        }
    }

    // Template literal — returns undefined if any slot is unresolvable
    if (e.startsWith('`') && e.endsWith('`')) {
        let valid = true;
        const resolved = e.slice(1, -1).replace(/\$\{([^}]+)\}/g, (_, inner) => {
            const val = evaluateExpression(inner.trim(), scope);
            if (val === undefined || val === null) { valid = false; return ''; }
            return String(val);
        });
        return valid ? resolved : undefined;
    }

    // Ternary
    const ternaryParts = splitTernary(e);
    if (ternaryParts) {
        const condition = evaluateExpression(ternaryParts.condition, scope);
        return condition
            ? evaluateExpression(ternaryParts.trueBranch, scope)
            : evaluateExpression(ternaryParts.falseBranch, scope);
    }

    // Strict equality
    if (e.includes('===')) {
        const [left, right] = e.split('===').map(s => s.trim());
        return evaluateExpression(left, scope) === evaluateExpression(right, scope);
    }

    // Dot-notation property access (no calls, no spaces)
    if (e.includes('.') && !e.includes('(') && !e.includes('{') && !/\s/.test(e)) {
        const parts = e.split('.');
        let val = scope;
        for (const p of parts) {
            if (val == null) return undefined;
            val = val[p.trim()];
        }
        if (val !== undefined) return val;
    }

    // Direct scope lookup
    if (Object.prototype.hasOwnProperty.call(scope, e)) return scope[e];

    // Arithmetic / Math / logical expressions — use Function() with scope binding
    if (/[-+*/%()]|Math\.|&&|\|\|/.test(e) && !/=>/.test(e)) {
        try {
            const argNames = Object.keys(scope).filter(k => /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k));
            const argVals = argNames.map(k => scope[k]);
            const fn = new Function(...argNames, `"use strict"; try { return (${e}); } catch(err) { return undefined; }`);
            const result = fn(...argVals);
            if (result !== undefined && result !== null && !Number.isNaN(result) &&
                (typeof result === 'number' || typeof result === 'string' || typeof result === 'boolean')) {
                return result;
            }
        } catch { /* fall through */ }
    }

    // String concatenation via +
    if (e.includes(' + ')) {
        const parts = e.split(' + ');
        return parts.map(p => evaluateExpression(p.trim(), scope)).join('');
    }

    return undefined;
}

function splitTernary(expr) {
    let depth = 0;
    let qIdx = -1;
    let cIdx = -1;
    for (let i = 0; i < expr.length; i++) {
        const ch = expr[i];
        if (ch === '(' || ch === '[' || ch === '{') depth++;
        else if (ch === ')' || ch === ']' || ch === '}') depth--;
        else if (ch === '?' && depth === 0 && qIdx === -1) qIdx = i;
        else if (ch === ':' && depth === 0 && qIdx !== -1 && cIdx === -1) cIdx = i;
    }
    if (qIdx === -1 || cIdx === -1) return null;
    return {
        condition: expr.slice(0, qIdx).trim(),
        trueBranch: expr.slice(qIdx + 1, cIdx).trim(),
        falseBranch: expr.slice(cIdx + 1).trim(),
    };
}

function buildScope(codeBody, context) {
    const clean = stripTypeScript(codeBody);
    const scope = { status: context.status, label: context.label, x: 0, y: 0, scale: 1 };
    const constRegex = /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?::[^=]+)?=\s*([\s\S]*?);/g;
    let match;
    while ((match = constRegex.exec(clean)) !== null) {
        const name = match[1];
        const rawValue = match[2].trim();
        try {
            const val = evaluateExpression(rawValue, scope);
            if (val !== undefined) scope[name] = val;
        } catch {}
    }
    return scope;
}

// ─── Attribute replacement helpers ───────────────────────────────────────────

function replaceTemplateAttr(markup, scope) {
    return markup.replace(/(\s+[\w:-]+)=\{\s*`([\s\S]*?)`\s*\}/g, (_, attrPart, template) => {
        let valid = true;
        const resolved = template.replace(/\$\{([^}]+)\}/g, (__, inner) => {
            const val = evaluateExpression(inner.trim(), scope);
            if (val === undefined || val === null) { valid = false; return ''; }
            return String(val);
        });
        if (!valid) return '';
        return `${attrPart}="${resolved}"`;
    });
}

function replaceExprAttr(markup, scope) {
    // Handle style={{ cursor: "move" }} -> style="cursor: move"
    let result = markup.replace(/(\s+)style=\{\{\s*([^}]+)\s*\}\}/g, (_, space, styleContent) => {
        const styleStr = styleContent
            .split(',')
            .map(pair => {
                const [k, v] = pair.split(':').map(s => s.trim());
                if (!k || !v) return null;
                const propName = k.replace(/([A-Z])/g, '-$1').toLowerCase();
                const propVal = v.replace(/['"]/g, '');
                return `${propName}: ${propVal}`;
            })
            .filter(Boolean)
            .join('; ');
        return `${space}style="${styleStr}"`;
    });

    result = result.replace(/(\s+[\w:-]+)=\{([^}]+)\}/g, (match, attrPart, expr) => {
        if (expr.includes('=>') || expr.includes('function')) return '';
        try {
            const val = evaluateExpression(expr.trim(), scope);
            if (val === undefined || val === null || typeof val === 'boolean') return '';
            return `${attrPart}="${val}"`;
        } catch { return ''; }
    });

    return result;
}

function processMapCalls(markup, scope) {
    let result = markup;
    let safety = 0;
    while (safety++ < 10) {
        const mapRegex = /\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*|\[[\s\S]*?\])\.map\(\s*\(([^)]+)\)\s*=>\s*\(/;
        const match = result.match(mapRegex);
        if (!match) break;

        const matchStart = result.indexOf(match[0]);
        const arrayExpr = match[1].trim();
        const params = match[2].split(',').map(p => p.trim());
        const itemParam = params[0];
        const indexParam = params.length > 1 ? params[1] : undefined;

        let parenDepth = 1;
        let searchStart = matchStart + match[0].length;
        let templateEnd = searchStart;
        for (let i = searchStart; i < result.length; i++) {
            if (result[i] === '(') parenDepth++;
            if (result[i] === ')') {
                parenDepth--;
                if (parenDepth === 0) { templateEnd = i; break; }
            }
        }

        let fullEnd = templateEnd + 1;
        while (fullEnd < result.length && /[\s)]/.test(result[fullEnd])) fullEnd++;
        if (fullEnd < result.length && result[fullEnd] === '}') fullEnd++;

        const template = result.slice(searchStart, templateEnd);

        try {
            const items = evaluateExpression(arrayExpr, scope);
            if (!Array.isArray(items)) {
                result = result.slice(0, matchStart) + result.slice(fullEnd);
                continue;
            }

            const rendered = items.map((item, idx) => {
                const itemScope = { ...scope, [itemParam]: item };
                if (indexParam) itemScope[indexParam] = idx;
                let instance = template;
                instance = replaceTemplateAttr(instance, itemScope);
                instance = replaceExprAttr(instance, itemScope);
                instance = instance.replace(/>\s*\{([^}<]+)\}\s*</g, (_, expr) => {
                    try {
                        const val = evaluateExpression(expr.trim(), itemScope);
                        return val !== undefined ? `>${val}<` : '><';
                    } catch { return '><'; }
                });
                return instance;
            }).join('\n');

            result = result.slice(0, matchStart) + rendered + result.slice(fullEnd);
        } catch {
            result = result.slice(0, matchStart) + result.slice(fullEnd);
        }
    }
    return result;
}

function processConditionals(markup, scope) {
    let result = markup;
    let safety = 0;
    while (safety++ < 20) {
        const condMatch = result.match(/\{(\s*!?\w+[\w.]*)\s*&&\s*\(/);
        if (!condMatch) break;
        const matchStart = result.indexOf(condMatch[0]);
        const condExpr = condMatch[1].trim();
        let depth = 0;
        let searchStart = matchStart + condMatch[0].length - 1;
        let endIdx = searchStart;
        for (let i = searchStart; i < result.length; i++) {
            if (result[i] === '(') depth++;
            if (result[i] === ')') { depth--; if (depth === 0) { endIdx = i; break; } }
        }
        let closingBrace = endIdx + 1;
        while (closingBrace < result.length && result[closingBrace] !== '}') closingBrace++;
        const body = result.slice(searchStart + 1, endIdx);
        const condVal = evaluateExpression(condExpr, scope);
        if (condVal) {
            result = result.slice(0, matchStart) + body + result.slice(closingBrace + 1);
        } else {
            result = result.slice(0, matchStart) + '' + result.slice(closingBrace + 1);
        }
    }
    return result;
}

function convertReactAttrsToSvg(markup) {
    const camelToKebab = {
        'className': 'class',
        'strokeWidth': 'stroke-width',
        'strokeLinecap': 'stroke-linecap',
        'strokeLinejoin': 'stroke-linejoin',
        'strokeDasharray': 'stroke-dasharray',
        'stopColor': 'stop-color',
        'stopOpacity': 'stop-opacity',
        'textAnchor': 'text-anchor',
        'fillOpacity': 'fill-opacity',
        'fillRule': 'fill-rule',
        'clipPath': 'clip-path',
        'clipRule': 'clip-rule',
        'fontFamily': 'font-family',
        'fontSize': 'font-size',
        'fontWeight': 'font-weight',
        'dominantBaseline': 'dominant-baseline',
        'pointerEvents': 'pointer-events',
        'stdDeviation': 'stdDeviation',
        'attributeName': 'attributeName',
        'repeatCount': 'repeatCount',
        'preserveAspectRatio': 'preserveAspectRatio',
    };
    let result = markup;
    result = result.replace(/\s+on\w+=\{[^}]*\}/g, '');
    result = result.replace(/\s+onPointerDown="[^"]*"/g, '');
    for (const [camel, kebab] of Object.entries(camelToKebab)) {
        if (camel !== kebab) {
            result = result.replace(new RegExp(`\\b${camel}=`, 'g'), `${kebab}=`);
        }
    }
    return result;
}

function purifySvgMarkup(markup) {
    if (typeof window === 'undefined' || !DOMPurify.isSupported) return markup;
    // The markup is a rootless fragment (components root at <g>, never <svg>), so
    // NAMESPACE is mandatory: without it DOMPurify parses the fragment as HTML and
    // its namespace check strips every SVG-only tag, returning an empty string.
    // <animate> is re-allowed (DOMPurify blocks SMIL by default) so status-LED
    // pulse animations in generated components survive sanitization.
    return DOMPurify.sanitize(markup, {
        USE_PROFILES: { svg: true, svgFilters: true },
        NAMESPACE: 'http://www.w3.org/2000/svg',
        ADD_TAGS: ['animate'],
        FORBID_TAGS: ['foreignObject'],
    });
}

function sanitizeSvgMarkup(markup) {
    return purifySvgMarkup(markup)
        .replace(/\s+[\w:-]+=""\s*/g, ' ')
        .replace(/\s+[\w:-]+="NaN"/g, '')
        .replace(/\s+[\w:-]+="\{`[^"]*`?\}?"/g, '')
        .replace(/\s+[\w:-]+="[^"]*\$\{[^"]*\}[^"]*"/g, '')
        .replace(/\s+transform="[^"]*(?:translate|rotate|scale)\([^")]*,\s*\)[^"]*"/g, '')
        .replace(/\s+transform="[^"]*(?:translate|rotate|scale)\(\s*,[^")]*\)[^"]*"/g, '')
        .replace(/\s+transform="[^"]*(?:translate|rotate|scale)\(\s*\)[^"]*"/g, '')
        .replace(/\s+d="(?![Mm\s])[^"]{0,3}"/, '')
        .replace(/\s+d="[^"]*(?:[MLHVCSQTAZ]\s*,|,\s*[MLHVCSQTAZ]|[MLHVCSQTAZ]\s+[MLHVCSQTAZ])[^"]*"/gi, '');
}

// ─── JSX Processor ───────────────────────────────────────────────────────────
function processJsx(markup, scope) {
    let result = markup;

    result = result.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
    result = replaceTemplateAttr(result, scope);
    result = processMapCalls(result, scope);
    result = processConditionals(result, scope);
    result = replaceExprAttr(result, scope);

    result = result.replace(/>\s*\{([^}<]+)\}\s*</g, (match, expr) => {
        try {
            const val = evaluateExpression(expr.trim(), scope);
            return val !== undefined ? `>${val}<` : '><';
        } catch { return '><'; }
    });

    result = convertReactAttrsToSvg(result);
    result = result
        .replace(/\s+key=\{[^}]*\}/g, '')
        .replace(/\s+key="[^"]*"/g, '');
    return result;
}

function calculateViewBox(svgMarkup) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const attrRegex = /\b(x[12]?|y[12]?|cx|cy|width|height)=["'](-?\d+(?:\.\d+)?)["']/g;
    let match;
    while ((match = attrRegex.exec(svgMarkup)) !== null) {
        const attr = match[1];
        const val = parseFloat(match[2]);
        if (isNaN(val)) continue;
        if (attr.startsWith('x') || attr === 'cx') {
            if (val < minX) minX = val;
            if (val > maxX) maxX = val;
        }
        if (attr.startsWith('y') || attr === 'cy') {
            if (val < minY) minY = val;
            if (val > maxY) maxY = val;
        }
    }
    if (minX === Infinity || maxX === -Infinity) { minX = 0; maxX = 160; }
    if (minY === Infinity || maxY === -Infinity) { minY = 0; maxY = 120; }
    let w = maxX - minX;
    let h = maxY - minY;
    if (w <= 0) w = 100;
    if (h <= 0) h = 100;
    const padding = 15;
    return `${minX - padding} ${minY - padding} ${w + padding * 2} ${h + padding * 2}`;
}

export const parseGeneratedSvg = (code, context = {}) => {
    try {
        const { status = 'normal', label = 'Equipment' } = context;
        let cleanCode = code
            .replace(/\\n/g, '\n')
            .replace(/\\"/g, '"')
            .replace(/<text[^>]*>\s*\{\s*label\s*\}\s*<\/text>/gi, '')
            .trim();
        const scope = buildScope(cleanCode, { status, label });
        const cleanForJsx = stripTypeScript(cleanCode);
        const returnMatch = cleanForJsx.match(/return\s*\(\s*([\s\S]*?)\s*\)\s*;?\s*(?:\}\s*;?\s*)?(?:export\s+default[\s\S]*)?$/);
        let jsx = returnMatch ? returnMatch[1] : cleanForJsx;
        const isFlat = !returnMatch;
        let svgMarkup;
        if (isFlat) {
            svgMarkup = convertReactAttrsToSvg(jsx);
            const statusColor = scope.statusColor || (status === 'hazard' ? '#ef4444' : status === 'warning' ? '#eab308' : '#10b981');
            const animDur = status === 'hazard' ? '0.6s' : status === 'warning' ? '1.2s' : '2.5s';
            svgMarkup = svgMarkup
                .replace(/\[\[STATUS_COLOR\]\]/g, statusColor)
                .replace(/\[\[LABEL\]\]/g, label)
                .replace(/\[\[LABEL_CLASS\]\]/g, status === 'hazard' ? 'fill-danger' : status === 'warning' ? 'fill-warning' : 'fill-text-primary')
                .replace(/\[\[ANIM_DUR\]\]/g, animDur);
        } else {
            svgMarkup = processJsx(jsx, scope);
        }
        svgMarkup = sanitizeSvgMarkup(svgMarkup);
        const viewBox = calculateViewBox(svgMarkup);
        return { svgMarkup, defaultViewBox: viewBox };
    } catch {
        return null;
    }
};
