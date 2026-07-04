// =============================================================
// ANALYTICS AGGREGATE — Vercel (SSR) deployment
// =============================================================
//
// GET /api/analytics/aggregate
//   Returns server-side aggregate joined with the EXPERIMENTS registry
//   so the Audit dashboard can render "X% of all visitors saw variant Y"
//   not just raw per-visitor counts from this browser's localStorage.
//
//   Response shape:
//   {
//     source: '/tmp/mark-tech-analytics.jsonl' | 'empty',
//     totalEvents: number,
//     uniqueVisitors: number,
//     byMetric: Record<string, number>,
//     experiments: Array<{
//       experiment: string
//       status: 'won' | 'running'
//       declaredWinner?: string
//       threshold: number
//       totalSamples: number
//       successSamples: number
//       variants: Array<{
//         variant: string
//         samples: number
//         successes: number
//         successRate: number          // 0..1
//         trafficPct: number           // 0..1 — share of total samples
//         isWinner: boolean
//         isHardCodedWinner: boolean
//       }>
//       suggestedWinner?: string       // variant with highest successRate (≥ minSamples)
//       summaryText: string            // "65% of visitors saw variant 3000; success rate 78%"
//     }>
//   }
//
// Why this exists separately from GET /api/analytics:
//   The base GET returns raw counts: byMetric + byExperiment buckets.
//   This route is opinionated — it joins with the EXPERIMENTS registry
//   (which lives in src/lib/analytics.ts and is bundled into the client),
//   duplicates the registry shape server-side, and computes derived
//   fields (successRate, trafficPct, suggestedWinner, summaryText) so
//   the Audit dashboard can render without doing the math client-side.
//
// Notes:
//   - Runtime: nodejs (we need fs). Not Edge — Edge can't read disk.
//   - Persistence is EPHEMERAL on Vercel — /tmp is per-instance. For real
//     persistence on GitHub Pages, the Cloudflare Worker
//     (workers/analytics-worker.js) is the drain target instead. This
//     route is Vercel-only; on GitHub Pages the AuditView falls back to
//     per-visitor counts from localStorage.
//   - Excluded from build:static (GitHub Pages) by the same `mv` aside
//     pattern used for the rest of /api/analytics.
//
// Failure modes:
//   - JSONL file missing → return zero-state (no events yet).
//   - JSONL file partially corrupted → skip malformed lines, count rest.
//   - Unknown experiment in payload → ignored (not in registry).
//   - Read failure → 500 with error string.

import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0 // always fresh — analytics is real-time

const DATA_DIR = process.env.ANALYTICS_DATA_DIR || '/tmp'
const EVENTS_FILE = path.join(DATA_DIR, 'mark-tech-analytics.jsonl')

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-store',
}

// ---------------------------------------------------------------------------
// EXPERIMENTS registry — duplicated server-side.
// This MUST stay in sync with src/lib/analytics.ts EXPERIMENTS.
// Why duplicate instead of import? Because analytics.ts uses localStorage
// at module top-level (via getVisitorId etc.) which throws on the server.
// A future refactor would extract a pure registry module both can import.
// For now, the contract is documented in AGENTS.md §2.5.
// ---------------------------------------------------------------------------

interface ExperimentConfigServer {
  name: string
  variants: string[]
  successOutcome: string
  threshold: number
  winner?: string
  winnerDeclaredAt?: string
  winnerReason?: string
}

const EXPERIMENTS_SERVER: Record<string, ExperimentConfigServer> = {
  safari_pdf_fallback_timer: {
    name: 'safari_pdf_fallback_timer',
    variants: ['2000', '3000', '5000'],
    successOutcome: 'pdf_loaded',
    threshold: 100,
    // To declare a winner after analyzing aggregate stats:
    //   winner: '3000',
    //   winnerDeclaredAt: '2026-07-15T00:00:00Z',
    //   winnerReason: '78% success rate vs 62% (2000) and 81% (5000) — 3000ms wins on UX/quality tradeoff',
  },
}

const MIN_SAMPLES_PER_VARIANT = 10 // below this, successRate is not trustworthy

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface ParsedEvent {
  metric?: string
  ts?: number
  visitor_id?: string
  payload?: {
    _experiment?: string
    _variant?: string
    _outcome?: string
    [k: string]: unknown
  }
  [k: string]: unknown
}

async function readEvents(): Promise<ParsedEvent[]> {
  let content = ''
  try {
    content = await fs.readFile(EVENTS_FILE, 'utf8')
  } catch {
    return []
  }
  return content
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line) as ParsedEvent
      } catch {
        return null
      }
    })
    .filter((e): e is ParsedEvent => e !== null && typeof e === 'object')
}

interface VariantAgg {
  variant: string
  samples: number
  successes: number
}

function computeExperimentAggregate(events: ParsedEvent[], expName: string, config: ExperimentConfigServer) {
  const byVariant: Record<string, VariantAgg> = {}
  for (const v of config.variants) {
    byVariant[v] = { variant: v, samples: 0, successes: 0 }
  }
  for (const e of events) {
    const p = e.payload
    if (!p || p._experiment !== expName) continue
    const variant = typeof p._variant === 'string' ? p._variant : null
    const outcome = typeof p._outcome === 'string' ? p._outcome : null
    if (!variant || !byVariant[variant]) continue
    byVariant[variant].samples += 1
    if (outcome === config.successOutcome) {
      byVariant[variant].successes += 1
    }
  }

  const totalSamples = Object.values(byVariant).reduce((s, v) => s + v.samples, 0)
  const totalSuccesses = Object.values(byVariant).reduce((s, v) => s + v.successes, 0)

  // Suggested winner: variant with highest successRate among those ≥ MIN_SAMPLES_PER_VARIANT
  let suggestedWinner: string | undefined
  let bestRate = -1
  for (const v of Object.values(byVariant)) {
    if (v.samples < MIN_SAMPLES_PER_VARIANT) continue
    const rate = v.samples > 0 ? v.successes / v.samples : 0
    if (rate > bestRate) {
      bestRate = rate
      suggestedWinner = v.variant
    }
  }
  // Only suggest if totalSamples crosses threshold AND we have a winner
  if (totalSamples < config.threshold) {
    suggestedWinner = undefined
  }

  const variants = config.variants.map((v) => {
    const agg = byVariant[v]
    const successRate = agg.samples > 0 ? agg.successes / agg.samples : 0
    const trafficPct = totalSamples > 0 ? agg.samples / totalSamples : 0
    const isHardCodedWinner = config.winner === v
    const isWinner = isHardCodedWinner || (suggestedWinner === v && !config.winner)
    return {
      variant: v,
      samples: agg.samples,
      successes: agg.successes,
      successRate: Number(successRate.toFixed(4)),
      trafficPct: Number(trafficPct.toFixed(4)),
      isWinner,
      isHardCodedWinner,
    }
  })

  // Build a human-readable summary
  let summaryText: string
  if (config.winner) {
    const w = byVariant[config.winner]
    const rate = w && w.samples > 0 ? Math.round((w.successes / w.samples) * 100) : null
    summaryText = `Winner declared: ${config.winner}ms${rate !== null ? ` (${rate}% success rate, ${w!.samples} samples)` : ''}. ${totalSamples} total samples across all variants.`
  } else if (totalSamples === 0) {
    summaryText = `No samples yet. Threshold: ${config.threshold}. Variants: ${config.variants.join(', ')}ms.`
  } else if (totalSamples < config.threshold) {
    summaryText = `Collecting: ${totalSamples}/${config.threshold} samples. ${config.variants.length} variants running. Winner declared at threshold.`
  } else if (suggestedWinner) {
    const w = byVariant[suggestedWinner]
    const rate = w.samples > 0 ? Math.round((w.successes / w.samples) * 100) : 0
    const trafficPct = totalSamples > 0 ? Math.round((w.samples / totalSamples) * 100) : 0
    summaryText = `${trafficPct}% of visitors saw variant ${suggestedWinner}ms; success rate ${rate}%. Suggested winner — confirm and ship.`
  } else {
    summaryText = `${totalSamples} samples collected but no variant has ≥ ${MIN_SAMPLES_PER_VARIANT} samples yet.`
  }

  return {
    experiment: expName,
    status: config.winner ? ('won' as const) : ('running' as const),
    declaredWinner: config.winner,
    declaredAt: config.winnerDeclaredAt ? Date.parse(config.winnerDeclaredAt) : undefined,
    declaredReason: config.winnerReason,
    threshold: config.threshold,
    totalSamples,
    totalSuccesses,
    variants,
    suggestedWinner,
    summaryText,
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function OPTIONS() {
  return new Response(null, { headers: CORS, status: 204 })
}

export async function GET() {
  try {
    const events = await readEvents()

    // byMetric — same shape as base GET /api/analytics, for convenience
    const byMetric: Record<string, number> = {}
    const visitorIds = new Set<string>()
    for (const e of events) {
      if (typeof e.metric === 'string') {
        byMetric[e.metric] = (byMetric[e.metric] || 0) + 1
      }
      if (typeof e.visitor_id === 'string') {
        visitorIds.add(e.visitor_id)
      }
    }

    // experiments — joined with registry
    const experiments = Object.entries(EXPERIMENTS_SERVER).map(([name, config]) =>
      computeExperimentAggregate(events, name, config),
    )

    // Overall summary text — picks the most relevant experiment
    const overallSummary = experiments.length > 0
      ? experiments.map((e) => `[${e.experiment}] ${e.summaryText}`).join(' | ')
      : 'No experiments configured.'

    return NextResponse.json(
      {
        source: events.length > 0 ? EVENTS_FILE : 'empty',
        totalEvents: events.length,
        uniqueVisitors: visitorIds.size,
        byMetric,
        experiments,
        overallSummary,
        generatedAt: Date.now(),
        minSamplesPerVariant: MIN_SAMPLES_PER_VARIANT,
      },
      { headers: CORS },
    )
  } catch (err) {
    return NextResponse.json(
      {
        error: String(err),
        ok: false,
        experiments: [],
        overallSummary: 'Error computing aggregate.',
      },
      { status: 500, headers: CORS },
    )
  }
}
