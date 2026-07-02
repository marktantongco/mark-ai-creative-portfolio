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
  // Track assignment via trackABOutcome so it counts toward sample size.
  // (Previously this used the asset_path_404 metric which polluted 404 counts.)
  trackABOutcome(experiment, variant, '_assigned', { _assignment: true })
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
  // Increment per-visitor sample count — used by auto-winner-declaration.
  // (Counts are persisted separately from the event queue so they survive
  // queue drains to the analytics endpoint.)
  incrementSampleCount(experiment, variant, outcome)
}

// ---------------------------------------------------------------------------
// Experiment registry — declarative metadata + hard-coded winners
// ---------------------------------------------------------------------------
//
// To declare a winner after analyzing aggregate stats:
//   1. Set `winner`, `winnerDeclaredAt`, and `winnerReason` on the experiment.
//   2. Ship. All visitors will now receive the winning variant.
//   3. Optionally: remove the losing variants from the `variants` array
//      (keeps the config tidy, but not required — shouldServeVariant only
//      returns the winner once declared).
//
// Per-visitor auto-declaration (last-resort, when developer never acts):
//   Each visitor accumulates a local sample count. When it crosses
//   `threshold`, the visitor declares a winner for THEMSELVES based on
//   their own observed success rates. This is biased (single-visitor data)
//   but ensures the experiment converges even without developer action.

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
  /** HARD-CODED WINNER — set this after analyzing aggregate stats. Once set, all visitors get this variant. */
  winner?: string
  /** ISO timestamp of when the winner was declared (for Audit dashboard display) */
  winnerDeclaredAt?: string
  /** Why the winner was declared (for Audit dashboard display) */
  winnerReason?: string
}

export const EXPERIMENTS: Record<string, ExperimentConfig> = {
  safari_pdf_fallback_timer: {
    name: 'safari_pdf_fallback_timer',
    variants: ['2000', '3000', '5000'],
    successOutcome: 'pdf_loaded',
    threshold: 100,
    // On tie, prefer shorter timer (faster UX)
    tieBreaker: (vs) => vs.slice().sort((a, b) => parseInt(a, 10) - parseInt(b, 10))[0],
  },
}

// ---------------------------------------------------------------------------
// A/B decisions — persisted per-visitor in localStorage (survives drain)
// ---------------------------------------------------------------------------

export interface ABDecision {
  experiment: string
  winner: string
  declaredAt: number
  reason: string
  sampleSize: number
  /** 'manual' = developer called declareWinner; 'auto' = per-visitor threshold reached */
  source: 'manual' | 'auto'
}

const DECISIONS_KEY = 'mark-tech-ab-decisions'
const SAMPLE_COUNTS_KEY = 'mark-tech-ab-sample-counts'

interface VariantCount { success: number; total: number }
interface SampleCount { byVariant: Record<string, VariantCount> }

function readDecisions(): Record<string, ABDecision> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(DECISIONS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function writeDecisions(d: Record<string, ABDecision>): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(DECISIONS_KEY, JSON.stringify(d)) } catch { /* ignore */ }
}

function readSampleCounts(): Record<string, SampleCount> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(SAMPLE_COUNTS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function writeSampleCounts(s: Record<string, SampleCount>): void {
  if (typeof window === 'undefined') return
  try { localStorage.setItem(SAMPLE_COUNTS_KEY, JSON.stringify(s)) } catch { /* ignore */ }
}

/**
 * Increment the per-visitor sample count for an experiment+variant+outcome.
 * Called automatically from trackABOutcome. Persisted separately from the
 * event queue so it survives drains to the analytics endpoint.
 */
function incrementSampleCount(experiment: string, variant: string, outcome: string): void {
  if (typeof window === 'undefined') return
  const config = EXPERIMENTS[experiment]
  if (!config) return // unknown experiment — don't track counts
  const all = readSampleCounts()
  if (!all[experiment]) all[experiment] = { byVariant: {} }
  if (!all[experiment].byVariant[variant]) all[experiment].byVariant[variant] = { success: 0, total: 0 }
  all[experiment].byVariant[variant].total += 1
  if (outcome === config.successOutcome) {
    all[experiment].byVariant[variant].success += 1
  }
  writeSampleCounts(all)
}

/**
 * Compute the winning variant from accumulated LOCAL sample counts.
 * Returns null if total success outcomes haven't crossed the threshold.
 * Requires at least 10 samples per variant to be considered (avoids
 * declaring a winner based on a variant with 1/1 = 100% success).
 */
function computeWinner(experiment: string): { variant: string; sampleSize: number } | null {
  const config = EXPERIMENTS[experiment]
  if (!config) return null
  const all = readSampleCounts()
  const data = all[experiment]?.byVariant
  if (!data) return null

  let totalSuccess = 0
  for (const v of Object.values(data)) totalSuccess += v.success
  if (totalSuccess < config.threshold) return null

  let best: { variant: string; rate: number; samples: number } | null = null
  for (const [variant, counts] of Object.entries(data)) {
    if (counts.total < 10) continue
    const rate = counts.success / counts.total
    if (!best || rate > best.rate) {
      best = { variant, rate, samples: counts.total }
    } else if (rate === best.rate && config.tieBreaker) {
      const tieWinner = config.tieBreaker([best.variant, variant])
      if (tieWinner === variant) {
        best = { variant, rate, samples: counts.total }
      }
    }
  }
  if (!best) return null
  return { variant: best.variant, sampleSize: totalSuccess }
}

/**
 * Persist a winner decision. Once declared, all future shouldServeVariant
 * calls for this experiment return the winner. Can be called from the
 * Audit dashboard UI or from developer tools.
 */
export function declareWinner(
  experiment: string,
  winningVariant: string,
  reason = 'manually declared',
  source: 'manual' | 'auto' = 'manual',
): void {
  if (typeof window === 'undefined') return
  const config = EXPERIMENTS[experiment]
  if (!config) {
    console.warn(`[analytics] declareWinner: unknown experiment "${experiment}"`)
    return
  }
  if (!config.variants.includes(winningVariant)) {
    console.warn(`[analytics] declareWinner: variant "${winningVariant}" not in experiment "${experiment}" variants`)
    return
  }
  const all = readDecisions()
  const sampleSize = computeWinner(experiment)?.sampleSize ?? 0
  all[experiment] = {
    experiment,
    winner: winningVariant,
    declaredAt: Date.now(),
    reason,
    sampleSize,
    source,
  }
  writeDecisions(all)
  // Track the declaration as an event so the server-side aggregate sees it
  track('cross_view_navigation', {
    _ab_decision: true,
    experiment,
    winner: winningVariant,
    reason,
    source,
  })
}

export interface ExperimentStatus {
  experiment: string
  status: 'won' | 'running'
  winner?: string
  declaredAt?: number
  reason?: string
  source?: 'manual' | 'auto'
  sampleSize: number
  /** Per-variant breakdown of success/total (local to this visitor) */
  variantCounts?: Record<string, VariantCount>
  threshold: number
}

export function getExperimentStatus(experiment: string): ExperimentStatus {
  const config = EXPERIMENTS[experiment]
  if (!config) {
    return { experiment, status: 'running', sampleSize: 0, threshold: 0 }
  }
  // 1. Hard-coded winner in EXPERIMENTS registry (highest precedence)
  if (config.winner) {
    return {
      experiment,
      status: 'won',
      winner: config.winner,
      declaredAt: config.winnerDeclaredAt ? Date.parse(config.winnerDeclaredAt) : undefined,
      reason: config.winnerReason || 'hard-coded in EXPERIMENTS registry',
      source: 'manual',
      sampleSize: -1, // unknown — server-side aggregate
      threshold: config.threshold,
    }
  }
  // 2. Local decision (from declareWinner or auto-declaration)
  const decisions = readDecisions()
  const decision = decisions[experiment]
  if (decision) {
    return {
      experiment,
      status: 'won',
      winner: decision.winner,
      declaredAt: decision.declaredAt,
      reason: decision.reason,
      source: decision.source,
      sampleSize: decision.sampleSize,
      threshold: config.threshold,
    }
  }
  // 3. Still running — return sample counts
  const all = readSampleCounts()
  const data = all[experiment]?.byVariant || {}
  let totalSuccess = 0
  for (const v of Object.values(data)) totalSuccess += v.success
  return {
    experiment,
    status: 'running',
    sampleSize: totalSuccess,
    variantCounts: data,
    threshold: config.threshold,
  }
}

export function getAllExperimentStatuses(): ExperimentStatus[] {
  return Object.keys(EXPERIMENTS).map(getExperimentStatus)
}

/**
 * Winner-aware variant assignment. Use this instead of getABVariant for
 * experiments that should converge to a single variant after enough data.
 *
 * Precedence:
 *   1. Hard-coded winner in EXPERIMENTS registry
 *   2. Persisted local decision (from declareWinner or auto-declaration)
 *   3. Auto-declaration if per-visitor sample count has crossed threshold
 *   4. Normal random assignment via getABVariant
 */
export function shouldServeVariant(
  experiment: string,
  variants?: string[],
  weights?: number[],
): string {
  const config = EXPERIMENTS[experiment]
  if (typeof window === 'undefined') {
    return (variants || config?.variants || [''])[0]
  }
  const effectiveVariants = variants || config?.variants || ['']

  // 1. Hard-coded winner
  if (config?.winner && effectiveVariants.includes(config.winner)) {
    return config.winner
  }

  // 2. Local decision
  const decisions = readDecisions()
  const decision = decisions[experiment]
  if (decision && effectiveVariants.includes(decision.winner)) {
    return decision.winner
  }

  // 3. Auto-declaration (per-visitor threshold reached)
  const winner = computeWinner(experiment)
  if (winner && effectiveVariants.includes(winner.variant)) {
    declareWinner(
      experiment,
      winner.variant,
      `auto-declared at ${winner.sampleSize} local samples (threshold ${config?.threshold})`,
      'auto',
    )
    return winner.variant
  }

  // 4. Normal assignment
  return getABVariant(experiment, effectiveVariants, weights)
}

/** Clear all A/B decisions + sample counts (for Audit dashboard "reset" button) */
export function resetExperiments(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(DECISIONS_KEY)
    localStorage.removeItem(SAMPLE_COUNTS_KEY)
    localStorage.removeItem(AB_KEY)
  } catch { /* ignore */ }
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
