#!/usr/bin/env node
/**
 * sync-files.js — Prebuild asset synchronizer
 *
 * Mirrors /download/* → /public/files/ so every artifact (PDF, PNG, PY, SH,
 * HTML, MD) is statically served on both Vercel and GitHub Pages without
 * depending on the SSR /api/files route.
 *
 * Why this exists:
 *   Next.js basePath does NOT apply to raw string paths in <img src> or
 *   fetch() URLs. We use the assetPath() helper for that. But the bigger
 *   issue was that /api/files/download depends on Node fs reads, which
 *   breaks static export entirely. By copying files into /public/files/,
 *   we eliminate the SSR coupling and get free static hosting on Pages.
 *
 * Idempotent: re-running produces identical output. Safe for CI.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'download');
const DEST = path.join(ROOT, 'public', 'files');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    ensureDir(dest);
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

function walk(dir, base = dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full, base, acc);
    } else {
      acc.push(path.relative(base, full));
    }
  }
  return acc;
}

function main() {
  if (!fs.existsSync(SRC)) {
    console.error(`[sync-files] Source directory not found: ${SRC}`);
    process.exit(1);
  }

  console.log(`[sync-files] Mirroring ${SRC} → ${DEST}`);

  // Wipe destination to remove stale files (idempotent sync)
  if (fs.existsSync(DEST)) {
    fs.rmSync(DEST, { recursive: true, force: true });
  }
  ensureDir(DEST);

  // Mirror everything
  copyRecursive(SRC, DEST);

  // Report
  const before = walk(SRC);
  const after = walk(DEST);
  const totalBytes = after.reduce((sum, rel) => {
    return sum + fs.statSync(path.join(DEST, rel)).size;
  }, 0);

  console.log(`[sync-files] ✅ Synced ${after.length} files (${(totalBytes / 1024).toFixed(1)} KB)`);
  console.log(`[sync-files] Files:`);
  for (const rel of after) {
    console.log(`           - ${rel}`);
  }

  if (before.length !== after.length) {
    console.warn(`[sync-files] ⚠️  Count mismatch: source=${before.length} dest=${after.length}`);
    process.exit(2);
  }
}

main();
