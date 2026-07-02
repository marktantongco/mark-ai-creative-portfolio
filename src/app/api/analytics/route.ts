// =============================================================
// ANALYTICS DRAIN ENDPOINT — Vercel (SSR) deployment
// =============================================================
//
// POST /api/analytics
//   Body: { events: AnalyticsEvent[] }
//   Effect: appends events as JSONL to /tmp/mark-tech-analytics.jsonl
//   Response: { ok: true, count: N }
//
// GET /api/analytics
//   Response: {
//     total: number,
//     byMetric: Record<MetricName, number>,
//     byExperiment: Record<"exp|variant|outcome", number>,
//     lastEvent: number | null,
//   }
//
// Notes:
//   - Runtime: nodejs (we need fs). Not Edge — Edge can't write to disk.
//   - Persistence is EPHEMERAL on Vercel — /tmp is per-instance. For real
//     persistence, wire ANALYTICS_DATA_DIR to Vercel Blob / KV in a future
//     iteration. For a personal portfolio this is acceptable: events
//     accumulate during a deployment's lifetime and reset on redeploy.
//   - Excluded from build:static (GitHub Pages) by moving this directory
//     aside in package.json's build:static script. On GitHub Pages, the
//     Cloudflare Worker at workers/analytics-worker.js is the drain target
//     instead (configured via NEXT_PUBLIC_ANALYTICS_ENDPOINT env var).

import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const DATA_DIR = process.env.ANALYTICS_DATA_DIR || '/tmp'
const EVENTS_FILE = path.join(DATA_DIR, 'mark-tech-analytics.jsonl')

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-store',
}

export async function OPTIONS() {
  return new Response(null, { headers: CORS, status: 204 })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const events = Array.isArray(body?.events) ? body.events : null
    if (!events) {
      return NextResponse.json(
        { error: 'body must be { events: AnalyticsEvent[] }' },
        { status: 400, headers: CORS },
      )
    }

    // Append as JSONL (one event per line). This is append-only and atomic
    // per-line — concurrent writes from different instances are safe (each
    // appends its own line).
    const lines = events
      .map((e: unknown) => {
        try {
          return JSON.stringify(e)
        } catch {
          return null
        }
      })
      .filter(Boolean)
      .join('\n') + '\n'

    // Ensure DATA_DIR exists (it should — /tmp always does on Vercel —
    // but be defensive in case ANALYTICS_DATA_DIR points elsewhere).
    try {
      await fs.mkdir(DATA_DIR, { recursive: true })
    } catch { /* ignore */ }

    await fs.appendFile(EVENTS_FILE, lines, 'utf8')

    return NextResponse.json(
      { ok: true, count: events.length, receivedAt: Date.now() },
      { headers: CORS },
    )
  } catch (err) {
    return NextResponse.json(
      { error: String(err), ok: false },
      { status: 500, headers: CORS },
    )
  }
}

export async function GET() {
  try {
    let content = ''
    try {
      content = await fs.readFile(EVENTS_FILE, 'utf8')
    } catch {
      // File doesn't exist yet — no events collected
    }

    const events = content
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line)
        } catch {
          return null
        }
      })
      .filter(Boolean)

    const byMetric: Record<string, number> = {}
    const byExperiment: Record<string, number> = {}
    for (const e of events) {
      byMetric[e.metric] = (byMetric[e.metric] || 0) + 1
      if (e.payload?._experiment) {
        const key = `${e.payload._experiment}|${e.payload._variant}|${e.payload._outcome}`
        byExperiment[key] = (byExperiment[key] || 0) + 1
      }
    }

    return NextResponse.json(
      {
        total: events.length,
        byMetric,
        byExperiment,
        lastEvent: events.length > 0 ? events[events.length - 1].ts : null,
        source: EVENTS_FILE,
      },
      { headers: CORS },
    )
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 500, headers: CORS },
    )
  }
}
