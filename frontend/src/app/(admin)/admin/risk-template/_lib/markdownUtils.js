/**
 * Pure markdown utility functions for Risk Template parsing and manipulation.
 * All functions are stateless — no React, no side-effects.
 */

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Extract a key-value pair from a markmap node line.
 * Supports **Key:** Value, Key: Value, and plain heading patterns.
 */
export function extractNodeKeyVal(line, keepTrailingDot = false) {
  const cleanLine = line.replace(/<!--.*-->/, '').replace(/^[#\s-]*/, '').trim();

  const normalize = (raw) => {
    let val = keepTrailingDot ? raw.trim() : raw.trim().replace(/\.+$/, '');
    if (val.toLowerCase() === 'nan' || val === 'nan.') val = '';
    return val;
  };

  // Bold pattern: **Key:** Value
  const boldMatch = cleanLine.match(/^\*\*(.*?):\*\*\s*(.*)/);
  if (boldMatch) {
    return { key: boldMatch[1].trim(), value: normalize(boldMatch[2]) };
  }

  // Plain pattern: Key: Value
  const plainMatch = cleanLine.match(/^(.*?):\s*(.*)/);
  if (plainMatch) {
    return { key: plainMatch[1].trim(), value: normalize(plainMatch[2]) };
  }

  // Heading fallback: # Header Content
  if (line.trim().startsWith('#')) {
    return { key: 'Mechanism', value: normalize(line.replace(/^#+\s*/, '').replace(/<!--.*-->/, '').trim()) };
  }

  return null;
}

/**
 * Indent all top-level headings and wrap raw markdown in markmap frontmatter.
 */
export function formatMarkdownForMarkmap(rawMarkdown, title) {
  let cleanContent = rawMarkdown;
  if (cleanContent.startsWith('---')) {
    const parts = cleanContent.split('---');
    if (parts.length >= 3) cleanContent = parts.slice(2).join('---').trim();
  } else {
    cleanContent = cleanContent.trim();
  }

  cleanContent = cleanContent
    .split('\n')
    .filter((line) => {
      if (!/^#\s/.test(line.trim())) return true;
      const kv = extractNodeKeyVal(line);
      return !(
        kv &&
        (kv.key.toLowerCase() === 'template_name' || kv.key.toLowerCase() === 'dashboard_name') &&
        kv.value.toLowerCase() === title.toLowerCase()
      );
    })
    .join('\n');

  // Indent all headings by 1 level to make room for the root node
  cleanContent = cleanContent.replace(/^#/gm, '##');

  return `---
title: ${title}
markmap:
  initialExpandLevel: 0
---

# ${title}

${cleanContent}`;
}

/**
 * Find the exact line index of a node in the markdown by content + optional ancestor path.
 */
export function findExactNodeIndex(lines, nodeContent, ancestorPath) {
  const exactMatches = [];
  const fuzzyMatches = [];
  for (let i = 0; i < lines.length; i++) {
    const cleanLine = lines[i].trim()
      .replace(/^[#\s-]*/, '').replace(/\*\*/g, '').replace(/<!--.*-->/, '').trim();
    if (cleanLine === nodeContent) exactMatches.push(i);
    else if (cleanLine.includes(nodeContent)) fuzzyMatches.push(i);
  }

  const matches = exactMatches.length > 0 ? exactMatches : fuzzyMatches;

  if (matches.length === 0) return -1;
  if (matches.length === 1 || !ancestorPath || ancestorPath.length === 0) return matches[0];

  for (const targetIdx of matches) {
    const headingMatch = lines[targetIdx].trim().match(/^(#+)/);
    const targetLevel = headingMatch ? headingMatch[1].length : 10;
    let currentLevel = targetLevel - 1;
    let ancestorIdx = 0;
    let isMatch = true;

    for (let i = targetIdx - 1; i >= 0 && currentLevel >= 1 && ancestorIdx < ancestorPath.length; i--) {
      const line = lines[i].trim();
      const hMatch = line.match(/^(#+)/);
      if (hMatch && hMatch[1].length === currentLevel) {
        const cleanParent = line.replace(/^[#\s-]*/, '').replace(/\*\*/g, '').replace(/<!--.*-->/, '').trim();
        const expectedAncestor = ancestorPath[ancestorIdx].replace(/^[#\s-]*/, '').replace(/\*\*/g, '').replace(/<!--.*-->/, '').trim();
        if (cleanParent !== expectedAncestor && !cleanParent.includes(expectedAncestor) && !expectedAncestor.includes(cleanParent)) {
          isMatch = false;
          break;
        }
        ancestorIdx++;
        currentLevel--;
      }
    }
    if (isMatch) return targetIdx;
  }

  return matches[0];
}

/** True when a heading line is a data column ("**Key:** v" or "Key: v"), not a plain title. */
function isColumnHeading(line) {
  const clean = line.replace(/<!--.*?-->/g, '').replace(/^[#\s>-]*/, '').trim();
  return /^\*\*[^*]+:\*\*/.test(clean) || /^[^:]+:\s/.test(clean);
}

/**
 * Build the traceback context (filters + update_column) for backend sync.
 */
export function buildMarkdownTraceback(markdown, nodeContent, ancestorPath) {
  const lines = markdown.split('\n');
  const targetIdx = findExactNodeIndex(lines, nodeContent, ancestorPath);
  if (targetIdx === -1) return null;

  const targetLine = lines[targetIdx].trim();
  const headingMatch = targetLine.match(/^(#+)/);
  const level = headingMatch ? headingMatch[1].length : 10;
  const targetData = extractNodeKeyVal(targetLine, true);
  const update_column = targetData ? targetData.key : null;
  const filters = {};
  let equipment_id = null;

  let equipmentLevel = Infinity;
  for (const raw of lines) {
    const hMatch = raw.trim().match(/^(#+)/);
    if (hMatch && isColumnHeading(raw.trim())) {
      equipmentLevel = Math.min(equipmentLevel, hMatch[1].length);
    }
  }
  if (equipmentLevel === Infinity) equipmentLevel = 1;

  for (let currentLevel = level - 1; currentLevel >= equipmentLevel; currentLevel--) {
    for (let i = targetIdx - 1; i >= 0; i--) {
      const line = lines[i].trim();
      const hMatch = line.match(/^(#+)/);
      if (hMatch && hMatch[1].length === currentLevel) {
        if (currentLevel === equipmentLevel) {
          const eqData = extractNodeKeyVal(line, true);
          if (eqData) equipment_id = eqData.value;
        } else {
          const pData = extractNodeKeyVal(line, true);
          if (pData) filters[pData.key] = pData.value;
        }
        break;
      }
    }
  }

  if (Object.keys(filters).length === 0 && targetData && level > equipmentLevel) {
    filters[targetData.key] = targetData.value;
  }

  if (update_column && targetData?.value && level !== equipmentLevel) {
    filters[update_column] = targetData.value;
  }

  if (equipment_id === null && level === equipmentLevel && targetData) {
    equipment_id = extractNodeKeyVal(targetLine, true).value;
  }

  return { filters, update_column, equipment_id };
}

/**
 * Delete a node and all its children from the markdown string (pure, no API calls).
 */
export function deleteMarkdownNodeLocal(markdown, nodeContent, ancestorPath) {
  const lines = markdown.split('\n');
  const targetIdx = findExactNodeIndex(lines, nodeContent, ancestorPath);
  if (targetIdx === -1) return markdown;

  const result = lines.slice(0, targetIdx);
  const headingMatch = lines[targetIdx].match(/^(#+)/);
  const targetLevel = headingMatch ? headingMatch[1].length : 10;

  let i = targetIdx + 1;
  while (i < lines.length) {
    const nextLine = lines[i].trim();
    const nextHeadingMatch = nextLine.match(/^(#+)/);
    const nextLevel = nextHeadingMatch ? nextHeadingMatch[1].length : 10;
    if (nextLevel > targetLevel) { i++; } else { break; }
  }

  return [...result, ...lines.slice(i)].join('\n');
}

/**
 * Rename a node in the markdown string (pure, no API calls).
 */
export function renameMarkdownNodeLocal(markdown, oldContent, newContent, ancestorPath) {
  const lines = markdown.split('\n');
  const targetIdx = findExactNodeIndex(lines, oldContent, ancestorPath);
  if (targetIdx === -1) return { newMarkdown: markdown, updateValueForBackend: newContent };

  const line = lines[targetIdx];
  const prefixMatch = line.match(/^([#\s-]*)/);
  const prefix = prefixMatch ? prefixMatch[0] : '';
  let updateValueForBackend = newContent;

  const boldMatch = line.match(/\*\*(.*?):\*\*/);
  if (boldMatch) {
    const key = boldMatch[1].trim();
    let cleanValue = newContent;
    if (newContent.toLowerCase().startsWith(key.toLowerCase() + ':')) {
      cleanValue = newContent.substring(newContent.indexOf(':') + 1).trim();
    }
    updateValueForBackend = cleanValue;
    const foldTag = (line.match(/(<!--.*?-->)\s*$/) || [])[1] ? ' ' + (line.match(/(<!--.*?-->)\s*$/)[1]) : '';
    lines[targetIdx] = `${prefix}**${key}:** ${cleanValue}${foldTag}`;
  } else {
    const contentPart = line.replace(/^[#\s-]*/, '');
    const plainMatch = contentPart.match(/^(.*?):\s*(.*)/);
    if (plainMatch && !line.trim().startsWith('#')) {
      const key = plainMatch[1].trim();
      let cleanValue = newContent;
      if (newContent.toLowerCase().startsWith(key.toLowerCase() + ':')) {
        cleanValue = newContent.substring(newContent.indexOf(':') + 1).trim();
      }
      updateValueForBackend = cleanValue;
      const foldTag = (line.match(/(<!--.*?-->)\s*$/) || [])[1] ? ' ' + line.match(/(<!--.*?-->)\s*$/)[1] : '';
      lines[targetIdx] = `${prefix}${key}: ${cleanValue}${foldTag}`;
    } else {
      updateValueForBackend = newContent;
      const foldTag = (line.match(/(<!--.*?-->)\s*$/) || [])[1] ? ' ' + line.match(/(<!--.*?-->)\s*$/)[1] : '';
      lines[targetIdx] = `${prefix}${newContent}${foldTag}`;
    }
  }

  return { newMarkdown: lines.join('\n'), updateValueForBackend };
}
