#!/usr/bin/env node
/**
 * generate-research-files.js — Build-time generator for RESEARCH_FILES
 *
 * Blind spot #3 fix: instead of hardcoding the file list in
 * src/lib/subpage-data.ts, walk /public/files/ and /public/images/
 * at build time and emit src/lib/research-files.generated.ts.
 *
 * The hardcoded RESEARCH_FILES array in subpage-data.ts is kept as a
 * fallback (used if the generated file is missing — e.g. on a fresh
 * checkout before the first prebuild runs). When the generated file
 * is present, it takes precedence.
 *
 * Descriptions come from scripts/file-descriptions.json (a sidecar).
 * Files not listed in the sidecar get an auto-generated description
 * based on their path and type, so they still appear in the archive
 * even if a developer forgets to update the sidecar.
 *
 * Output: src/lib/research-files.generated.ts
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const FILES_DIR = path.join(PUBLIC_DIR, 'files');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');
const SIDECAR = path.join(__dirname, 'file-descriptions.json');
const OUTPUT = path.join(ROOT, 'src', 'lib', 'research-files.generated.ts');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadSidecar() {
  if (!fs.existsSync(SIDECAR)) {
    console.warn(`[gen-research] Sidecar not found: ${SIDECAR} — using empty descriptions`);
    return {};
  }
  try {
    const raw = JSON.parse(fs.readFileSync(SIDECAR, 'utf8'));
    // Strip _meta key
    const { _meta, ...rest } = raw;
    return rest;
  } catch (err) {
    console.error(`[gen-research] Sidecar JSON invalid: ${err.message}`);
    process.exit(1);
  }
}

function classifyFile(relPath) {
  const ext = path.extname(relPath).toLowerCase();
  if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif'].includes(ext)) return 'image';
  if (ext === '.pdf') return 'pdf';
  if (ext === '.py') return 'script';
  if (ext === '.sh' || ext === '.bash' || ext === '.zsh') return 'shell';
  if (['.md', '.html', '.htm', '.txt', '.rst', '.adoc'].includes(ext)) return 'document';
  return 'other';
}

function autoDescription(relPath, type) {
  const base = path.basename(relPath);
  switch (type) {
    case 'image': return `Image artifact: ${base}`;
    case 'pdf': return `PDF document: ${base}`;
    case 'script': return `Python script: ${base} (auto-discovered — add a description in scripts/file-descriptions.json)`;
    case 'shell': return `Shell script: ${base} (auto-discovered — add a description in scripts/file-descriptions.json)`;
    case 'document': return `Document: ${base} (auto-discovered — add a description in scripts/file-descriptions.json)`;
    default: return `File: ${base}`;
  }
}

function walk(dir, base = dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir)) {
    // Skip dotfiles and the impeccable-error-handler subdirectory's
    // internal structure is preserved as relative paths.
    if (entry.startsWith('.')) continue;
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full, base, acc);
    } else {
      acc.push({ full, rel: path.relative(base, full) });
    }
  }
  return acc;
}

function escapeForTs(s) {
  // Escape backticks and ${...} for TS template literals
  return String(s).replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const sidecar = loadSidecar();
  const entries = [];

  // Walk /public/images/ first — research-relevant images live here.
  // We track basenames so the /files/ walker can skip duplicates.
  const RESEARCH_IMAGE_PREFIXES = [
    'architecture_diagram', 'decision_tree', 'design_approaches',
    'perspectives-tab', 'error-handler-tab', 'proxy-topics-page',
  ];
  const seenBasenames = new Set();

  for (const { full, rel } of walk(IMAGES_DIR)) {
    const base = path.basename(rel);
    if (!RESEARCH_IMAGE_PREFIXES.some(p => base.startsWith(p))) continue;
    const relFromPublic = `images/${rel.split(path.sep).join('/')}`;
    const type = classifyFile(rel);
    const size = fs.statSync(full).size;
    const description = sidecar[relFromPublic] || autoDescription(rel, type);
    entries.push({
      name: base,
      type,
      size,
      pathFromPublic: `/${relFromPublic}`,
      description,
    });
    seenBasenames.add(base);
  }

  // Walk /public/files/ — skip image duplicates already covered above.
  for (const { full, rel } of walk(FILES_DIR)) {
    const base = path.basename(rel);
    if (seenBasenames.has(base)) continue; // dedupe — prefer /images/ version
    const relFromPublic = `files/${rel.split(path.sep).join('/')}`;
    const type = classifyFile(rel);
    const size = fs.statSync(full).size;
    const description = sidecar[relFromPublic] || autoDescription(rel, type);
    const name = rel.split(path.sep).join('/');
    entries.push({
      name,
      type,
      size,
      pathFromPublic: `/${relFromPublic}`,
      description,
    });
  }

  // Sort: images first, then PDFs, then scripts, then shells, then docs, then other
  const TYPE_ORDER = { image: 0, pdf: 1, script: 2, shell: 3, document: 4, other: 5 };
  entries.sort((a, b) => {
    const ti = TYPE_ORDER[a.type] ?? 99;
    const tj = TYPE_ORDER[b.type] ?? 99;
    if (ti !== tj) return ti - tj;
    return a.name.localeCompare(b.name);
  });

  // Emit TS
  const ts = `// AUTO-GENERATED by scripts/generate-research-files.js — DO NOT EDIT BY HAND.
// Regenerated on every prebuild (sync-files.js runs first, then this script).
// Source: /public/files/* and /public/images/* (filtered).
// Descriptions: scripts/file-descriptions.json (sidecar).
//
// To add a new artifact:
//   1. Drop the file in /download/
//   2. Run \`bun run sync-files\` (or rely on prebuild)
//   3. Add a description entry to scripts/file-descriptions.json
//   4. Re-run \`bun run prebuild\` — this file regenerates.

import { assetPath } from './utils'
import type { ProjectFile } from './subpage-data'

export const RESEARCH_FILES_GENERATED: ProjectFile[] = [
${entries.map(e => `  {
    name: ${JSON.stringify(e.name)},
    type: ${JSON.stringify(e.type)},
    size: ${e.size},
    path: assetPath(${JSON.stringify(e.pathFromPublic)}),
    description: ${JSON.stringify(e.description)},
  },`).join('\n')}
]

// Stats for build log visibility
export const RESEARCH_FILES_STATS = {
  total: ${entries.length},
  byType: ${JSON.stringify(entries.reduce((acc, e) => { acc[e.type] = (acc[e.type] || 0) + 1; return acc }, {}), null, 2)},
  generatedAt: ${Date.now()},
}
`;

  fs.writeFileSync(OUTPUT, ts, 'utf8');

  // Build log summary
  const byType = entries.reduce((acc, e) => { acc[e.type] = (acc[e.type] || 0) + 1; return acc }, {});
  const summary = Object.entries(byType).map(([t, n]) => `${t}=${n}`).join(' ');
  console.log(`[gen-research] ✅ Generated ${OUTPUT}`);
  console.log(`[gen-research]    ${entries.length} files (${summary})`);
  // List any files that fell back to auto-description
  const auto = entries.filter(e => sidecar[e.pathFromPublic.slice(1)] === undefined);
  if (auto.length > 0) {
    console.warn(`[gen-research] ⚠️  ${auto.length} file(s) using auto-generated descriptions (add to scripts/file-descriptions.json):`);
    for (const e of auto) {
      console.warn(`[gen-research]      - ${e.pathFromPublic}`);
    }
  }
}

main();
