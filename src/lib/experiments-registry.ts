// =============================================================
// EXPERIMENTS REGISTRY — pure module, importable from any runtime
// =============================================================
//
// WHY THIS EXISTS (AGENTS.md §2.9 lesson 7 — now RESOLVED):
//   Previously `EXPERIMENTS` lived in src/lib/analytics.ts and was
//   DUPLICATED as `EXPERIMENTS_SERVER` in
//   src/app/api/analytics/aggregate/route.ts. The duplication existed
//   because analytics.ts touches `localStorage` at module top-level
//   (via getVisitorId), which throws on the server.
//
//   This file is the refactor that eliminates the hazard: a PURE
//   module with zero side effects, no localStorage, no window, no
//   process.env reads. Both the client (analytics.ts) and the server
//   (aggregate/route.ts) import the SAME `EXPERIMENTS` object. There
//   is exactly one registry to update when declaring a winner.
//
// CONTRACT:
//   - This module MUST NOT import from analytics.ts (would create a
//     cycle and would pull localStorage into the server bundle).
//   - This module MUST NOT touch `window`, `localStorage`, `process`,
//     `fs`, or any environment-specific API at module top-level.
//   - The `tieBreaker` field is a function — it serializes as
//     `undefined` if anyone tries to JSON.stringify(EXPERIMENTS). That
//     is fine; tieBreaker is client-only behavior.
//
// TO DECLARE A WINNER (after analyzing aggregate stats):
//   1. Set `winner`, `winnerDeclaredAt`, `winnerReason` on the entry.
//   2. Ship. Both client and server pick up the change automatically.
//   3. Optionally remove losing variants from `variants` — tidy but
//      not required (shouldServeVariant only returns the winner once
//      declared).
//   4. Update AGENTS.md §2.5 if the winner affects the documented
//      A/B workflow.
//
// To add a new experiment:
//   1. Add an entry here with the same shape.
//   2. Instrument the success outcome via `trackABOutcome` in
//      analytics.ts.
//   3. Use `shouldServeVariant` in the component that needs the A/B
//      decision.
// =============================================================

/**
 * Configuration for a single A/B experiment.
 *
 * NOTE: the `tieBreaker` field is intentionally a function (not a
 * serializable value). This is fine for our use case — tieBreaker
 * only runs client-side in shouldServeVariant. If you need to
 * serialize the registry (e.g. for the Cloudflare Worker), strip
 * tieBreaker first or use a custom replacer.
 */
export interface ExperimentConfig {
  /** Experiment name (matches the value passed to trackABOutcome) */
  name: string
  /** All possible variants */
  variants: string[]
  /** The outcome that counts as "success" (e.g., 'pdf_loaded') */
  successOutcome: string
  /** Sample size at which per-visitor auto-declaration triggers */
  threshold: number
  /** Tie-breaker: when multiple variants have equal success rate, pick the one this returns */
  tieBreaker?: (variants: string[]) => string
  /**
   * HARD-CODED WINNER — set this after analyzing aggregate stats.
   * Once set, all visitors get this variant.
   */
  winner?: string
  /** ISO timestamp of when the winner was declared (for Audit dashboard display) */
  winnerDeclaredAt?: string
  /** Why the winner was declared (for Audit dashboard display) */
  winnerReason?: string
}

/**
 * The single source of truth for all A/B experiments.
 *
 * Imported by:
 *   - src/lib/analytics.ts (client: variant assignment, sample counts,
 *     per-visitor auto-declaration)
 *   - src/app/api/analytics/aggregate/route.ts (server: cross-visitor
 *     aggregate, suggested-winner computation, declared-winner surfacing)
 *
 * Adding an experiment here automatically makes it visible to both
 * the client and the server — no second file to keep in sync.
 */
export const EXPERIMENTS: Record<string, ExperimentConfig> = {
  safari_pdf_fallback_timer: {
    name: 'safari_pdf_fallback_timer',
    variants: ['2000', '3000', '5000'],
    successOutcome: 'pdf_loaded',
    threshold: 100,
    // On tie, prefer shorter timer (faster UX)
    tieBreaker: (vs) => vs.slice().sort((a, b) => parseInt(a, 10) - parseInt(b, 10))[0],
    // WINNER — uncomment and fill in after analyzing aggregate stats
    // at the Worker URL's GET / endpoint (or GET /api/analytics/aggregate
    // on Vercel). Per AGENTS.md §2.5, threshold for declaration is
    // ~100 PDF opens across all visitors.
    //
    // Example:
    //   winner: '3000',
    //   winnerDeclaredAt: '2026-07-15T00:00:00Z',
    //   winnerReason:
    //     '78% success rate vs 62% (2000) and 81% (5000) — ' +
    //     '3000ms wins on UX/quality tradeoff',
  },
}
