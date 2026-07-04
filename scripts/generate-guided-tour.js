#!/usr/bin/env node
/**
 * generate-guided-tour.js — Build-time generator for GUIDED_TOUR
 *
 * Blind spot fix: instead of hardcoding the tour chapters in subpage-data.ts,
 * read scripts/tour-chapters.json (sidecar) at build time and emit
 * src/lib/guided-tour.generated.ts.
 *
 * Validation: every entry in the sidecar MUST reference a file that exists
 * in /public/files/ or /public/images/. Entries pointing to missing files
 * are skipped with a warning (the artifact was removed; the sidecar is stale).
 *
 * Auto-discovery: NEW artifacts (added to /public/files/ but not in the
 * sidecar) do NOT become tour chapters automatically — that would produce
 * chapters with no narrative. Instead, the script logs a notice listing
 * artifacts that have no tour entry, so the developer can decide whether
 * to add them.
 *
 * Output: src/lib/guided-tour.generated.ts
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const FILES_DIR = path.join(PUBLIC_DIR, 'files');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');
const SIDECAR = path.join(__dirname, 'tour-chapters.json');
const OUTPUT = path.join(ROOT, 'src', 'lib', 'guided-tour.generated.ts');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadSidecar() {
  if (!fs.existsSync(SIDECAR)) {
    console.warn(`[gen-tour] Sidecar not found: ${SIDECAR}`);
    return {};
  }
  try {
    const raw = JSON.parse(fs.readFileSync(SIDECAR, 'utf8'));
    // Strip _meta key
    const { _meta, ...rest } = raw;
    return rest;
  } catch (err) {
    console.error(`[gen-tour] Sidecar JSON invalid: ${err.message}`);
    process.exit(1);
  }
}

function walk(dir, base = dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir)) {
    if (entry.startsWith('.')) continue;
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full, base, acc);
    } else {
      acc.push(path.relative(base, full).split(path.sep).join('/'));
    }
  }
  return acc;
}

function fileExistsInPublic(relPath) {
  // relPath is like 'files/foo.pdf' or 'images/foo.png'
  const full = path.join(PUBLIC_DIR, relPath);
  return fs.existsSync(full);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const sidecar = loadSidecar();
  const stops = [];

  // Validate each sidecar entry against the filesystem
  const missing = [];
  for (const [relPath, entry] of Object.entries(sidecar)) {
    if (!fileExistsInPublic(relPath)) {
      missing.push(relPath);
      continue;
    }
    if (!entry || typeof entry !== 'object') {
      console.warn(`[gen-tour] Skipping ${relPath}: entry is not an object`);
      continue;
    }
    if (!entry.chapter || !entry.narrative || !entry.why) {
      console.warn(`[gen-tour] Skipping ${relPath}: missing required field (chapter/narrative/why)`);
      continue;
    }
    const order = typeof entry.order === 'number' ? entry.order : 999;
    // The fileName matches the convention used by GUIDED_TOUR — for files in
    // subdirectories, we keep the slash (e.g. 'impeccable-error-handler/README.md').
    // For images in /images/, we use just the basename for back-compat with
    // the existing GUIDED_TOUR (which used 'architecture_diagram.png', not
    // 'images/architecture_diagram.png').
    let fileName;
    if (relPath.startsWith('images/')) {
      fileName = relPath.split('/').slice(1).join('/');
    } else {
      fileName = relPath.split('/').slice(1).join('/');
    }
    stops.push({
      fileName,
      chapter: entry.chapter,
      narrative: entry.narrative,
      why: entry.why,
      order,
      _relPath: relPath,
    });
  }

  if (missing.length > 0) {
    console.warn(`[gen-tour] ⚠️  ${missing.length} sidecar entr${missing.length === 1 ? 'y' : 'ies'} reference missing files (skipped):`);
    for (const m of missing) console.warn(`[gen-tour]    - ${m}`);
  }

  // Sort by order, then by chapter name (stable for equal order)
  stops.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.chapter.localeCompare(b.chapter);
  });

  // Auto-discovery notice: list files in /public/files/ and /public/images/
  // that are not in the sidecar. These are candidates for new chapters.
  const sidecarPaths = new Set(Object.keys(sidecar));
  const allFilesPublic = [
    ...walk(FILES_DIR).map(p => `files/${p}`),
    ...walk(IMAGES_DIR).map(p => `images/${p}`),
  ];
  const orphaned = allFilesPublic.filter(p => !sidecarPaths.has(p));
  if (orphaned.length > 0) {
    console.log(`[gen-tour] ℹ️  ${orphaned.length} file(s) in /public/ have no tour entry (not in tour — add to scripts/tour-chapters.json if they should be chapters):`);
    for (const o of orphaned.slice(0, 20)) console.log(`[gen-tour]    - ${o}`);
    if (orphaned.length > 20) console.log(`[gen-tour]    ... and ${orphaned.length - 20} more`);
  }

  // Emit TS
  const ts = `// AUTO-GENERATED by scripts/generate-guided-tour.js — DO NOT EDIT BY HAND.
// Regenerated on every prebuild (after sync-files.js + generate-research-files.js).
// Source: scripts/tour-chapters.json (sidecar).
// Validation: every entry references a file in /public/files/ or /public/images/.
//
// To add a new tour chapter:
//   1. Drop the artifact in /download/
//   2. Run \`bun run sync-files\` (or rely on prebuild)
//   3. Add an entry to scripts/tour-chapters.json with {chapter, narrative, why, order}
//   4. Re-run \`bun run prebuild\` — this file regenerates.

import type { TourStop } from './subpage-data'

export const GUIDED_TOUR_GENERATED: TourStop[] = [
${stops.map(s => `  {
    fileName: ${JSON.stringify(s.fileName)},
    chapter: ${JSON.stringify(s.chapter)},
    narrative: ${JSON.stringify(s.narrative)},
    why: ${JSON.stringify(s.why)},
  },`).join('\n')}
]

// Stats for build log visibility
export const GUIDED_TOUR_STATS = {
  total: ${stops.length},
  missingFiles: ${missing.length},
  orphanedFiles: ${orphaned.length},
  generatedAt: ${Date.now()},
}
`;

  fs.writeFileSync(OUTPUT, ts, 'utf8');

  // Build log summary
  console.log(`[gen-tour] ✅ Generated ${OUTPUT}`);
  console.log(`[gen-tour]    ${stops.length} tour chapters (sorted by order)`);
  if (missing.length > 0) {
    console.warn(`[gen-tour]    ⚠️  ${missing.length} sidecar entries referenced missing files (skipped)`);
  }
  if (orphaned.length > 0) {
    console.log(`[gen-tour]    ℹ️  ${orphaned.length} public files have no tour entry (not in tour)`);
  }
}

main();
