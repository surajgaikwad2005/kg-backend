/**
 * Pure markdown utility functions for Symbolic AI rule parsing and manipulation.
 * All functions are stateless — no React, no side-effects.
 */

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Extract a key-value pair from a markmap node line.
 * Supports **Key:** Value, Key: Value, and plain heading patterns.
 * Pass keepTrailingDot=true to preserve a trailing "." in the value (e.g. the
 * equipment id "CP-CC-0001." must match the backend value exactly).
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

  // The backend's own markdown sometimes leads with a top-level
  // "dashboard_name: {title}" heading that just duplicates the root node
  // added below — drop it so the table name isn't shown twice in a row.
  cleanContent = cleanContent
    .split('\n')
    .filter((line) => {
      if (!/^#\s/.test(line.trim())) return true;
      const kv = extractNodeKeyVal(line);
      return !(kv && kv.key.toLowerCase() === 'dashboard_name' && kv.value.toLowerCase() === title.toLowerCase());
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

  // Prefer exact matches — fuzzy includes() can match a sibling whose content
  // contains the end node's content as a substring, causing the wrong node to be deleted.
  const matches = exactMatches.length > 0 ? exactMatches : fuzzyMatches;

  if (matches.length === 0) return -1;
  if (matches.length === 1 || !ancestorPath || ancestorPath.length === 0) return matches[0];

  // Verify multiple matches using ancestor path
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

  return matches[0]; // Fallback
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
  // keepTrailingDot=true: filter VALUES must match the backend cell exactly, and backend
  // values carry their trailing "." (this markdown is generated from that same table). The
  // key is unaffected by the flag, so update_column stays correct.
  const targetData = extractNodeKeyVal(targetLine, true);
  const update_column = targetData ? targetData.key : null;
  const filters = {};
  let equipment_id = null;

  // Equipment heading = shallowest heading that is a real data column. Works for raw
  // markdown (equipment at L1, synthetic root from frontmatter title) and formatted
  // markdown (plain "# title" root at L1, equipment at L2) — the structure can flip
  // between the two mid-session, so we never hardcode the level.
  let equipmentLevel = Infinity;
  for (const raw of lines) {
    const hMatch = raw.trim().match(/^(#+)/);
    if (hMatch && isColumnHeading(raw.trim())) {
      equipmentLevel = Math.min(equipmentLevel, hMatch[1].length);
    }
  }
  if (equipmentLevel === Infinity) equipmentLevel = 1;

  // Walk every ancestor heading from the target up to (and including) the equipment level.
  for (let currentLevel = level - 1; currentLevel >= equipmentLevel; currentLevel--) {
    for (let i = targetIdx - 1; i >= 0; i--) {
      const line = lines[i].trim();
      const hMatch = line.match(/^(#+)/);
      if (hMatch && hMatch[1].length === currentLevel) {
        if (currentLevel === equipmentLevel) {
          // Equipment id must keep its trailing "." to match the backend value exactly.
          const eqData = extractNodeKeyVal(line, true);
          if (eqData) equipment_id = eqData.value;
        } else {
          // Ancestor filter values must also keep the trailing "." for an exact backend match.
          const pData = extractNodeKeyVal(line, true);
          if (pData) filters[pData.key] = pData.value;
        }
        break;
      }
    }
  }

  if (Object.keys(filters).length === 0 && targetData && level > equipmentLevel) filters[targetData.key] = targetData.value;

  // Pin the target column's OLD value in the filters so the backend targets
  // only this specific cell, not every row that shares the same ancestor context.
  if (update_column && targetData?.value && level !== equipmentLevel) {
    filters[update_column] = targetData.value;
  }

  // When the target IS the equipment-level heading, its own value is the equipment identifier
  // (re-extracted with the trailing "." preserved).
  if (equipment_id === null && level === equipmentLevel && targetData) {
    equipment_id = extractNodeKeyVal(targetLine, true).value;
  }

  return { filters, update_column, equipment_id };
}

/**
 * Delete a node and all its children from the markdown string (pure, no API calls).
 * Returns the new markdown string.
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
 * Returns { newMarkdown: string, updateValueForBackend: string }
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
