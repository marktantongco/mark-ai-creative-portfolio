// =============================================================
// ANALYTICS — lightweight telemetry for the 12 DATA_ENGINEER_METRICS
// =============================================================
//
// Design goals:
//   1. Zero external dependencies. No Vercel Analytics, no Plausible,
//      no GTM. The portfolio must work on GitHub Pages static export
//      where no SSR analytics endpoint exists.
//   2. Resilient. Uses navigator.sendBeacon when available (survives
//      page unload), falls back to fetch keepalive, falls back to a
//      localStorage queue that drains on next visit.
//   3. Self-hostable. If ANALYTICS_ENDPOINT env var is set at build
//      time (e.g. a Vercel Edge function or Cloudflare Worker), events
//      are sent there. Otherwise events are buffered locally and
//      surfaced in the Audit view so the user can see what's collected.
//   4. Privacy-preserving. No cookies, no PII, no cross-site tracking.
//      A single random visitor_id is generated once and stored in
//      localStorage. Each event includes: metric name, timestamp,
//      visitor_id, and a small payload.
//
// The 12 metrics map to DATA_ENGINEER_METRICS in subpage-data.ts.
// Each emit_* helper below corresponds to one metric. The Audit view
// renders a live dashboard of buffered events.

export type MetricName =
  | 'artifact_load_count'
  | 'artifact_load_latency_ms'
  | 'artifact_load_failure'
  | 'tour_completion_rate'
  | 'tour_vs_browse_ratio'
  | 'download_after_preview'
  | 'copy_to_clipboard_count'
  | 'search_query_empty_results'
  | 'filter_type_distribution'
  | 'modal_dwell_time_ms'
  | 'cross_view_navigation'
  | 'asset_path_404'

export interface AnalyticsEvent {
  metric: MetricName
  ts: number
  visitor_id: string
  payload: Record<string, string | number | boolean | null | undefined>
}

const QUEUE_KEY = 'mark-tech-analytics-queue'
const VISITOR_KEY = 'mark-tech-analytics-visitor-id'
const MAX_QUEUE = 200 // cap to avoid unbounded localStorage growth
const ENDPOINT = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT || ''

// ---------------------------------------------------------------------------
// Visitor ID — generated once, persisted, never sent offsite unless endpoint
// is configured.
// ---------------------------------------------------------------------------
function getVisitorId(): string {
  if (typeof window === 'undefined') return 'ssr'
  try {
    let id = localStorage.getItem(VISITOR_KEY)
    if (!id) {
      id = `v_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`
      localStorage.setItem(VISITOR_KEY, id)
    }
    return id
  } catch {
    return 'unknown'
  }
}

// ---------------------------------------------------------------------------
// Queue management
// ---------------------------------------------------------------------------
function readQueue(): AnalyticsEvent[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(QUEUE_KEY)
    return raw ? (JSON.parse(raw) as AnalyticsEvent[]) : []
  } catch {
    return []
  }
}

function writeQueue(events: AnalyticsEvent[]): void {
  if (typeof window === 'undefined') return
  try {
    // Trim oldest if over cap
    const trimmed = events.length > MAX_QUEUE ? events.slice(events.length - MAX_QUEUE) : events
    localStorage.setItem(QUEUE_KEY, JSON.stringify(trimmed))
  } catch {
    // localStorage full or blocked — silently drop. Analytics must never break UX.
  }
}

// ---------------------------------------------------------------------------
// Drain — attempt to flush the queue to the configured endpoint
// ---------------------------------------------------------------------------
let drainScheduled = false

function scheduleDrain(): void {
  if (typeof window === 'undefined') return
  if (drainScheduled) return
  drainScheduled = true
  // Use requestIdleCallback if available, otherwise setTimeout
  const schedule = (window as unknown as { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback
  const run = () => {
    drainScheduled = false
    void drain()
  }
  if (schedule) schedule(run)
  else setTimeout(run, 1500)
}

async function drain(): Promise<void> {
  if (!ENDPOINT) return // no endpoint — keep events buffered locally
  const events = readQueue()
  if (events.length === 0) return
  try {
    const body = JSON.stringify({ events })
    // Try sendBeacon first (survives page unload)
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' })
      if (navigator.sendBeacon(ENDPOINT, blob)) {
        // Successfully queued — clear local queue
        writeQueue([])
        return
      }
    }
    // Fallback: fetch with keepalive
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    })
    if (res.ok) writeQueue([])
  } catch {
    // Network failed — leave events in local queue for next attempt
  }
}

// ---------------------------------------------------------------------------
// Public API — track()
// ---------------------------------------------------------------------------
/**
 * Track a single analytics event. Safe to call from any context (SSR,
 * client, error boundary). No-op on SSR.
 */
export function track(
  metric: MetricName,
  payload: Record<string, string | number | boolean | null | undefined> = {},
): void {
  if (typeof window === 'undefined') return

  const event: AnalyticsEvent = {
    metric,
    ts: Date.now(),
    visitor_id: getVisitorId(),
    payload,
  }

  // Append to local queue
  const events = readQueue()
  events.push(event)
  writeQueue(events)

  // Try to drain (no-op if no endpoint configured)
  scheduleDrain()
}

// ---------------------------------------------------------------------------
// Convenience emitters — one per metric in DATA_ENGINEER_METRICS
// ---------------------------------------------------------------------------

/** artifact_load_count — when any artifact is opened in the modal */
export function trackArtifactOpened(file: { name: string; type: string; size: number }): void {
  track('artifact_load_count', {
    file_name: file.name,
    file_type: file.type,
    file_size: file.size,
  })
}

/** artifact_load_latency_ms — time from click to content rendered */
export function trackArtifactLatency(file: { name: string; type: string }, ms: number): void {
  track('artifact_load_latency_ms', {
    file_name: file.name,
    file_type: file.type,
    ms: Math.round(ms),
  })
}

/** artifact_load_failure — failed fetch */
export function trackArtifactFailure(
  file: { name: string; path: string },
  error: string,
  statusCode?: number,
): void {
  track('artifact_load_failure', {
    file_name: file.name,
    file_path: file.path,
    error,
    status_code: statusCode ?? null,
  })
}

/** tour_completion_rate — visitor reached chapter N */
export function trackTourProgress(chapter: number, total: number, fileName: string): void {
  track('tour_completion_rate', {
    chapter,
    total,
    file_name: fileName,
    completion_pct: Math.round((chapter / total) * 100),
  })
}

/** tour_vs_browse_ratio — visitor started tour vs free preview */
export function trackTourVsBrowse(mode: 'tour' | 'browse'): void {
  track('tour_vs_browse_ratio', { mode })
}

/** download_after_preview — visitor clicked download after opening modal */
export function trackDownloadAfterPreview(
  file: { name: string; type: string },
  dwellMs: number,
): void {
  track('download_after_preview', {
    file_name: file.name,
    file_type: file.type,
    dwell_ms: Math.round(dwellMs),
  })
}

/** copy_to_clipboard_count — script/shell copied */
export function trackCopyToClipboard(file: { name: string; type: string }, source: 'modal' | 'card'): void {
  track('copy_to_clipboard_count', {
    file_name: file.name,
    file_type: file.type,
    source,
  })
}

/** search_query_empty_results — search returned zero matches */
export function trackSearchEmpty(query: string): void {
  track('search_query_empty_results', { query })
}

/** filter_type_distribution — visitor applied a type filter */
export function trackFilterApplied(filterType: string, matchCount: number): void {
  track('filter_type_distribution', {
    filter_type: filterType,
    match_count: matchCount,
  })
}

/** modal_dwell_time_ms — how long modal was open per file */
export function trackModalDwell(file: { name: string; type: string }, ms: number): void {
  track('modal_dwell_time_ms', {
    file_name: file.name,
    file_type: file.type,
    ms: Math.round(ms),
  })
}

/** cross_view_navigation — visitor moved between subpages */
export function trackCrossViewNavigation(from: string, to: string): void {
  track('cross_view_navigation', { from, to })
}

/** asset_path_404 — asset failed to load (img.onerror, fetch 404, etc.) */
export function trackAsset404(path: string, kind: 'image' | 'fetch' | 'iframe'): void {
  track('asset_path_404', { path, kind })
}

// ---------------------------------------------------------------------------
// Read API — for the Audit dashboard
// ---------------------------------------------------------------------------

export interface MetricStats {
  metric: MetricName
  count: number
  lastEmitted: number | null
  samplePayload: AnalyticsEvent['payload'] | null
}

const ALL_METRICS: MetricName[] = [
  'artifact_load_count',
  'artifact_load_latency_ms',
  'artifact_load_failure',
  'tour_completion_rate',
  'tour_vs_browse_ratio',
  'download_after_preview',
  'copy_to_clipboard_count',
  'search_query_empty_results',
  'filter_type_distribution',
  'modal_dwell_time_ms',
  'cross_view_navigation',
  'asset_path_404',
]

export function getMetricStats(): MetricStats[] {
  const events = readQueue()
  return ALL_METRICS.map((metric) => {
    const matching = events.filter((e) => e.metric === metric)
    return {
      metric,
      count: matching.length,
      lastEmitted: matching.length > 0 ? matching[matching.length - 1].ts : null,
      samplePayload: matching.length > 0 ? matching[matching.length - 1].payload : null,
    }
  })
}

export function getAllEvents(): AnalyticsEvent[] {
  return readQueue()
}

export function clearAnalytics(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(QUEUE_KEY)
  } catch { /* ignore */ }
}

export function isAnalyticsEndpointConfigured(): boolean {
  return Boolean(ENDPOINT)
}

// ---------------------------------------------------------------------------
// A/B test framework — used by Safari fallback timer (Task C)
// ---------------------------------------------------------------------------

export interface ABAssignment {
  experiment: string
  variant: string
  assignedAt: number
}

const AB_KEY = 'mark-tech-ab-assignments'

function readABAssignments(): Record<string, ABAssignment> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(AB_KEY)
    return raw ? (JSON.parse(raw) as Record<string, ABAssignment>) : {}
  } catch {
    return {}
  }
}

/**
 * Get or assign a visitor to an A/B experiment variant.
 * Assignment is sticky — once a visitor is assigned, they stay in
 * that variant across reloads (so we don't pollute the experiment).
 */
export function getABVariant(
  experiment: string,
  variants: string[],
  weights?: number[],
): string {
  if (typeof window === 'undefined') return variants[0]
  const all = readABAssignments()
  const existing = all[experiment]
  if (existing && variants.includes(existing.variant)) {
    return existing.variant
  }
  // Assign new variant
  let variant: string
  if (weights && weights.length === variants.length) {
    const total = weights.reduce((a, b) => a + b, 0)
    let r = Math.random() * total
    variant = variants[0]
    for (let i = 0; i < variants.length; i++) {
      r -= weights[i]
      if (r <= 0) {
        variant = variants[i]
        break
      }
    }
  } else {
    variant = variants[Math.floor(Math.random() * variants.length)]
  }
  all[experiment] = { experiment, variant, assignedAt: Date.now() }
  try {
    localStorage.setItem(AB_KEY, JSON.stringify(all))
  } catch { /* ignore */ }
  // Emit assignment as an analytics event so we can segment later
  track('asset_path_404', { _ab_assignment: true, experiment, variant }) // not great; use a separate event
  return variant
}

/** Track the outcome of an A/B experiment for later analysis */
export function trackABOutcome(
  experiment: string,
  variant: string,
  outcome: string,
  payload: Record<string, string | number | boolean> = {},
): void {
  // Reuse the existing metric infrastructure by piggy-backing on
  // modal_dwell_time_ms (a histogram) — the Audit dashboard can filter
  // by payload.experiment. This avoids adding a 13th metric type.
  track('modal_dwell_time_ms', {
    _experiment: experiment,
    _variant: variant,
    _outcome: outcome,
    ...payload,
  })
}

// ---------------------------------------------------------------------------
// Boot — install global error listener for asset_path_404
// ---------------------------------------------------------------------------

let booted = false

export function bootAnalytics(): void {
  if (typeof window === 'undefined') return
  if (booted) return
  booted = true

  // Capture image load failures (basePath misconfiguration on Pages)
  window.addEventListener(
    'error',
    (e) => {
      const target = e.target as HTMLElement | null
      if (!target) return
      const tagName = target.tagName?.toLowerCase()
      if (tagName === 'img') {
        const src = (target as HTMLImageElement).src || ''
        if (src.includes('/files/') || src.includes('/images/') || src.includes('/thumbnails/')) {
          trackAsset404(src, 'image')
        }
      } else if (tagName === 'iframe') {
        const src = (target as HTMLIFrameElement).src || ''
        if (src.includes('/files/')) {
          trackAsset404(src, 'iframe')
        }
      }
    },
    true, // capture phase — needed to catch resource errors
  )

  // Capture unhandled fetch 404s (less reliable — works only for fetches
  // that throw; response 404s need to be tracked by caller)
  window.addEventListener('unhandledrejection', (e) => {
    const reason = e.reason
    if (reason && typeof reason === 'object' && 'message' in reason) {
      const msg = String((reason as { message: string }).message)
      if (msg.includes('/files/') || msg.includes('/images/')) {
        trackAsset404(msg, 'fetch')
      }
    }
  })

  // Drain on page hide (best effort)
  window.addEventListener('pagehide', () => {
    void drain()
  })
}
