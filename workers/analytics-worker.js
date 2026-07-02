// =============================================================
// Cloudflare Worker — Analytics drain for GitHub Pages deployment
// =============================================================
//
// Why this exists:
//   GitHub Pages serves only static files — no API routes, no server.
//   The portfolio's analytics buffer (in localStorage) needs somewhere
//   to drain. On Vercel we use /api/analytics. On GitHub Pages we point
//   NEXT_PUBLIC_ANALYTICS_ENDPOINT at this Worker instead.
//
// Deploy:
//   1. npm install -g wrangler
//   2. wrangler login
//   3. cd workers && wrangler deploy
//   4. Copy the Worker URL (e.g. https://mark-tech-analytics.YOUR-SUB.workers.dev)
//   5. Set NEXT_PUBLIC_ANALYTICS_ENDPOINT=<that URL> in your GitHub Actions
//      secrets (or .env.production.local) before running build:static.
//
// Storage:
//   Cloudflare Workers KV (free tier: 100k reads/day, 1k writes/day — plenty
//   for a personal portfolio). All events are appended to a single KV key
//   capped at MAX_EVENTS (10k). Older events are evicted FIFO.
//
// Endpoints:
//   POST /       — body: { events: AnalyticsEvent[] } → appends to KV
//   GET  /       — returns { total, byMetric, byExperiment, lastEvent }
//   OPTIONS /    — CORS preflight

const KV_KEY = 'analytics-events'
const MAX_EVENTS = 10000

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS, status: 204 })
    }

    if (request.method === 'POST') {
      try {
        const body = await request.json()
        const events = Array.isArray(body?.events) ? body.events : null
        if (!events) {
          return new Response(
            JSON.stringify({ error: 'body must be { events: [] }' }),
            { status: 400, headers: CORS },
          )
        }

        // Read-modify-write on KV. KV is eventually consistent globally
        // (writes propagate within ~60s). For analytics this is fine.
        let existing = []
        try {
          const raw = await env.ANALYTICS_KV.get(KV_KEY)
          if (raw) existing = JSON.parse(raw)
          if (!Array.isArray(existing)) existing = []
        } catch { /* treat as empty */ }

        existing.push(...events)

        // Cap: drop oldest if over MAX_EVENTS
        const trimmed = existing.length > MAX_EVENTS
          ? existing.slice(existing.length - MAX_EVENTS)
          : existing

        await env.ANALYTICS_KV.put(KV_KEY, JSON.stringify(trimmed))

        return new Response(
          JSON.stringify({ ok: true, count: events.length, total: trimmed.length }),
          { headers: CORS },
        )
      } catch (err) {
        return new Response(
          JSON.stringify({ error: String(err), ok: false }),
          { status: 500, headers: CORS },
        )
      }
    }

    if (request.method === 'GET') {
      let events = []
      try {
        const raw = await env.ANALYTICS_KV.get(KV_KEY)
        if (raw) events = JSON.parse(raw)
        if (!Array.isArray(events)) events = []
      } catch { /* empty */ }

      const byMetric = {}
      const byExperiment = {}
      for (const e of events) {
        if (!e || typeof e !== 'object') continue
        byMetric[e.metric] = (byMetric[e.metric] || 0) + 1
        if (e.payload?._experiment) {
          const key = `${e.payload._experiment}|${e.payload._variant}|${e.payload._outcome}`
          byExperiment[key] = (byExperiment[key] || 0) + 1
        }
      }

      return new Response(
        JSON.stringify({
          total: events.length,
          byMetric,
          byExperiment,
          lastEvent: events.length > 0 ? events[events.length - 1].ts : null,
          source: 'cloudflare-workers-kv',
        }),
        { headers: CORS },
      )
    }

    return new Response(
      JSON.stringify({ error: 'method not allowed' }),
      { status: 405, headers: CORS },
    )
  },
}
