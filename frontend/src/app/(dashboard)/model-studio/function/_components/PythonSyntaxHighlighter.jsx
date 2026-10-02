'use client';
import React from 'react';

/**
 * High-performance Python Syntax Highlighter using regex tokenization.
 * Renders lines matching textarea block layout for 100% cursor and line alignment.
 */
export function highlightPythonCode(codeStr) {
    if (!codeStr) return null;

    const lines = codeStr.split('\n');

    return lines.map((line, lineIdx) => {
        const tokens = tokenizeLine(line);
        return (
            <div key={lineIdx} className="leading-relaxed">
                {tokens.length === 0 ? (
                    <span>&nbsp;</span>
                ) : (
                    tokens.map((token, tokIdx) => (
                        <span key={tokIdx} className={token.className}>
                            {token.text}
                        </span>
                    ))
                )}
            </div>
        );
    });
}

function tokenizeLine(line) {
    const tokens = [];
    let remaining = line;

    const rules = [
        { type: 'comment', regex: /^(#.*)/, className: 'text-emerald-600 dark:text-emerald-400 italic' },
        { type: 'string', regex: /^("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/, className: 'text-amber-600 dark:text-amber-400 font-medium' },
        { type: 'keyword', regex: /^\b(def|return|import|from|as|if|else|elif|for|while|try|except|finally|with|in|is|not|and|or|True|False|None|class|raise|pass|break|continue|lambda)\b/, className: 'text-blue-600 dark:text-blue-400 font-bold' },
        { type: 'builtin', regex: /^\b(print|len|range|str|int|float|list|dict|set|tuple|pd|np|DataFrame|Series|data|multiplier)\b/, className: 'text-purple-600 dark:text-purple-400 font-medium' },
        { type: 'number', regex: /^\b\d+(\.\d+)?\b/, className: 'text-teal-600 dark:text-teal-400 font-medium' },
        { type: 'operator', regex: /^(=|\+|\-|\*|\/|==|!=|<|>|<=|>=|:|\(|\)|\[|\]|\{|\}|,)/, className: 'text-slate-600 dark:text-slate-300 font-semibold' },
        { type: 'identifier', regex: /^[a-zA-Z_]\w*/, className: 'text-slate-900 dark:text-slate-100' },
        { type: 'whitespace', regex: /^\s+/, className: '' },
        { type: 'other', regex: /^./, className: 'text-slate-700 dark:text-slate-200' },
    ];

    while (remaining.length > 0) {
        let matched = false;
        for (const rule of rules) {
            const match = remaining.match(rule.regex);
            if (match) {
                tokens.push({ text: match[0], className: rule.className });
                remaining = remaining.slice(match[0].length);
                matched = true;
                break;
            }
        }
        if (!matched) {
            tokens.push({ text: remaining[0], className: '' });
            remaining = remaining.slice(1);
        }
    }

    return tokens;
}
