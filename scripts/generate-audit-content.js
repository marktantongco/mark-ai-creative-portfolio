#!/usr/bin/env node
/**
 * generate-audit-content.js — Build-time generator for AUDIT_PERSPECTIVES,
 * FAILURE_MODES, CONTRARIAN_VIEWS, SECOND_ORDER_EFFECTS, and BLIND_SPOTS.
 *
 * Reframe (this round): the build-time generation pattern is now applied to
 * ALL five analysis arrays. They were previously hardcoded in
 * src/lib/subpage-data.ts. Now they are sidecar-driven — adding a 6th
 * animal-metaphor perspective (or a new failure mode, or a new blind spot,
 * or a new second-order effect) requires ZERO source code changes. Just edit
 * the sidecar JSON and run prebuild.
 *
 * Sidecars:
 *   scripts/audit-perspectives.json   → AUDIT_PERSPECTIVES_GENERATED
 *   scripts/failure-modes.json        → FAILURE_MODES_GENERATED
 *   scripts/contrarian-views.json     → CONTRARIAN_VIEWS_GENERATED
 *   scripts/second-order-effects.json → SECOND_ORDER_EFFECTS_GENERATED
 *   scripts/blind-spots.json          → BLIND_SPOTS_GENERATED
 *
 * Output:
 *   src/lib/audit-content.generated.ts
 *
 * Validation:
 *   - Each perspective MUST have: id, name, title, icon, color, domain,
 *     keyInsight, detailedAnalysis, hiddenFactors[], recommendation.
 *   - Each perspective `id` MUST be present in AuditView.tsx ICON_MAP for
 *     the icon to render. The script does NOT verify this (it would require
 *     parsing TSX) — it just warns if a perspective id is not in the known
 *     set {owl, eagle, beaver, dolphin, elephant}. New ids require adding
 *     an entry to AuditView.tsx ICON_MAP.
 *   - Each failure mode MUST have: mode, trigger, impact, mitigation,
 *     detectionTime, recoveryTime, severity.
 *   - Each contrarian view MUST have: claim, steelman, response, confidence
 *     (1-10).
 *   - Each second-order effect MUST have: decision, firstOrder, secondOrder,
 *     thirdOrder.
 *   - Each blind spot MUST have: area, issue, fix.
 *
 * Auto-discovery notice: this script does not auto-discover anything — the
 * sidecars are the source of truth. If a sidecar is empty, the generated
 * arrays are empty (the fallback in subpage-data.ts kicks in for the very
 * first build on a fresh checkout).
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SCRIPTS_DIR = __dirname;
const OUTPUT = path.join(ROOT, 'src', 'lib', 'audit-content.generated.ts');

// Known perspective ids (must match ICON_MAP keys in AuditView.tsx)
const KNOWN_PERSPECTIVE_IDS = new Set(['owl', 'eagle', 'beaver', 'dolphin', 'elephant']);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadSidecar(name) {
  const file = path.join(SCRIPTS_DIR, name);
  if (!fs.existsSync(file)) {
    console.warn(`[gen-audit] Sidecar not found: ${file}`);
    return null;
  }
  try {
    const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
    // Strip _meta key
    const { _meta, ...rest } = raw;
    return rest;
  } catch (err) {
    console.error(`[gen-audit] Sidecar ${name} JSON invalid: ${err.message}`);
    process.exit(1);
  }
}

function asSortedArray(obj, defaultOrder = 999) {
  // Returns entries sorted by their `order` field (stable for equal order).
  const entries = Object.values(obj || {});
  entries.sort((a, b) => {
    const oa = typeof a.order === 'number' ? a.order : defaultOrder;
    const ob = typeof b.order === 'number' ? b.order : defaultOrder;
    if (oa !== ob) return oa - ob;
    return 0;
  });
  return entries;
}

function validatePerspective(p) {
  const required = ['id', 'name', 'title', 'icon', 'color', 'domain', 'keyInsight', 'detailedAnalysis', 'recommendation'];
  for (const k of required) {
    if (!p[k] || typeof p[k] !== 'string') {
      console.warn(`[gen-audit] Perspective "${p.id || '?'}" missing/invalid field: ${k}`);
      return false;
    }
  }
  if (!Array.isArray(p.hiddenFactors)) {
    console.warn(`[gen-audit] Perspective "${p.id}" hiddenFactors must be an array`);
    return false;
  }
  if (!KNOWN_PERSPECTIVE_IDS.has(p.id)) {
    console.warn(`[gen-audit] ⚠️  Perspective id "${p.id}" is NOT in AuditView.tsx ICON_MAP (known: ${[...KNOWN_PERSPECTIVE_IDS].join(', ')}). Add it to ICON_MAP or the icon will not render.`);
  }
  return true;
}

function validateFailureMode(fm) {
  const required = ['mode', 'trigger', 'impact', 'mitigation', 'detectionTime', 'recoveryTime', 'severity'];
  for (const k of required) {
    if (!fm[k] || typeof fm[k] !== 'string') {
      console.warn(`[gen-audit] Failure mode "${fm.mode || '?'}" missing/invalid field: ${k}`);
      return false;
    }
  }
  return true;
}

function validateContrarian(cv) {
  const required = ['claim', 'steelman', 'response'];
  for (const k of required) {
    if (!cv[k] || typeof cv[k] !== 'string') {
      console.warn(`[gen-audit] Contrarian view missing/invalid field: ${k}`);
      return false;
    }
  }
  if (typeof cv.confidence !== 'number' || cv.confidence < 1 || cv.confidence > 10) {
    console.warn(`[gen-audit] Contrarian view confidence must be 1-10, got: ${cv.confidence}`);
    return false;
  }
  return true;
}

function validateSecondOrderEffect(soe) {
  const required = ['decision', 'firstOrder', 'secondOrder', 'thirdOrder'];
  for (const k of required) {
    if (!soe[k] || typeof soe[k] !== 'string') {
      console.warn(`[gen-audit] Second-order effect missing/invalid field: ${k}`);
      return false;
    }
  }
  return true;
}

function validateBlindSpot(bs) {
  const required = ['area', 'issue', 'fix'];
  for (const k of required) {
    if (!bs[k] || typeof bs[k] !== 'string') {
      console.warn(`[gen-audit] Blind spot missing/invalid field: ${k}`);
      return false;
    }
  }
  // status is optional — default to 'open' downstream if absent.
  if (bs.status && !['open', 'fixed', 'experiment-running'].includes(bs.status)) {
    console.warn(`[gen-audit] Blind spot status must be 'open' | 'fixed' | 'experiment-running', got: ${bs.status}`);
    return false;
  }
  return true;
}

function jsonString(s) {
  // Emit a TS string literal using JSON.stringify (handles escapes).
  return JSON.stringify(s);
}

function jsonStringArray(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return '[]';
  return '[\n' + arr.map(s => `      ${jsonString(String(s))},`).join('\n') + '\n    ]';
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const perspectivesRaw = loadSidecar('audit-perspectives.json') || {};
  const failureModesRaw = loadSidecar('failure-modes.json') || {};
  const contrarianRaw = loadSidecar('contrarian-views.json') || {};
  const secondOrderRaw = loadSidecar('second-order-effects.json') || {};
  const blindSpotsRaw = loadSidecar('blind-spots.json') || {};

  const perspectives = asSortedArray(perspectivesRaw).filter(validatePerspective);
  const failureModes = asSortedArray(failureModesRaw).filter(validateFailureMode);
  const contrarianViews = asSortedArray(contrarianRaw).filter(validateContrarian);
  const secondOrderEffects = asSortedArray(secondOrderRaw).filter(validateSecondOrderEffect);
  const blindSpots = asSortedArray(blindSpotsRaw).filter(validateBlindSpot);

  // Emit TS
  const ts = `// AUTO-GENERATED by scripts/generate-audit-content.js — DO NOT EDIT BY HAND.
// Regenerated on every prebuild (after sync-files.js + generate-research-files.js
// + generate-guided-tour.js).
//
// Sources:
//   scripts/audit-perspectives.json   → AUDIT_PERSPECTIVES_GENERATED
//   scripts/failure-modes.json        → FAILURE_MODES_GENERATED
//   scripts/contrarian-views.json     → CONTRARIAN_VIEWS_GENERATED
//   scripts/second-order-effects.json → SECOND_ORDER_EFFECTS_GENERATED
//   scripts/blind-spots.json          → BLIND_SPOTS_GENERATED
//
// To add a new audit perspective (e.g. a 6th animal metaphor):
//   1. Add an entry to scripts/audit-perspectives.json with {id, name, title, ...}.
//   2. If the id is not in AuditView.tsx ICON_MAP, add it there too.
//   3. Run \`bun run prebuild\` — this file regenerates.
//
// To add a new failure mode, contrarian view, second-order effect, or blind
// spot: just edit the corresponding sidecar JSON. No source code changes
// needed.

import type { AuditPerspective, FailureMode, ContrarianView, SecondOrderEffect, BlindSpot } from './subpage-data'

export const AUDIT_PERSPECTIVES_GENERATED: AuditPerspective[] = [
${perspectives.map(p => `  {
    id: ${jsonString(p.id)},
    name: ${jsonString(p.name)},
    title: ${jsonString(p.title)},
    icon: ${jsonString(p.icon)},
    color: ${jsonString(p.color)},
    domain: ${jsonString(p.domain)},
    keyInsight: ${jsonString(p.keyInsight)},
    detailedAnalysis: ${jsonString(p.detailedAnalysis)},
    hiddenFactors: ${jsonStringArray(p.hiddenFactors)},
    recommendation: ${jsonString(p.recommendation)},
  },`).join('\n')}
]

export const FAILURE_MODES_GENERATED: FailureMode[] = [
${failureModes.map(fm => `  {
    mode: ${jsonString(fm.mode)},
    trigger: ${jsonString(fm.trigger)},
    impact: ${jsonString(fm.impact)},
    mitigation: ${jsonString(fm.mitigation)},
    detectionTime: ${jsonString(fm.detectionTime)},
    recoveryTime: ${jsonString(fm.recoveryTime)},
    severity: ${jsonString(fm.severity)},
  },`).join('\n')}
]

export const CONTRARIAN_VIEWS_GENERATED: ContrarianView[] = [
${contrarianViews.map(cv => `  {
    claim: ${jsonString(cv.claim)},
    steelman: ${jsonString(cv.steelman)},
    response: ${jsonString(cv.response)},
    confidence: ${cv.confidence},
  },`).join('\n')}
]

export const SECOND_ORDER_EFFECTS_GENERATED: SecondOrderEffect[] = [
${secondOrderEffects.map(soe => `  {
    decision: ${jsonString(soe.decision)},
    firstOrder: ${jsonString(soe.firstOrder)},
    secondOrder: ${jsonString(soe.secondOrder)},
    thirdOrder: ${jsonString(soe.thirdOrder)},
  },`).join('\n')}
]

export const BLIND_SPOTS_GENERATED: BlindSpot[] = [
${blindSpots.map(bs => `  {
    area: ${jsonString(bs.area)},
    issue: ${jsonString(bs.issue)},
    fix: ${jsonString(bs.fix)},
  },`).join('\n')}
]

// Stats for build log visibility
export const AUDIT_CONTENT_STATS = {
  perspectives: ${perspectives.length},
  failureModes: ${failureModes.length},
  contrarianViews: ${contrarianViews.length},
  secondOrderEffects: ${secondOrderEffects.length},
  blindSpots: ${blindSpots.length},
  generatedAt: ${Date.now()},
}
`;

  fs.writeFileSync(OUTPUT, ts, 'utf8');

  console.log(`[gen-audit] ✅ Generated ${OUTPUT}`);
  console.log(`[gen-audit]    ${perspectives.length} audit perspectives`);
  console.log(`[gen-audit]    ${failureModes.length} failure modes`);
  console.log(`[gen-audit]    ${contrarianViews.length} contrarian views`);
  console.log(`[gen-audit]    ${secondOrderEffects.length} second-order effects`);
  console.log(`[gen-audit]    ${blindSpots.length} blind spots`);
}

main();
