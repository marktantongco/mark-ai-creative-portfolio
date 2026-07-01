'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Target, Hammer, Sparkles, Lightbulb,
  ChevronDown, Shield, Eye, ArrowRight, BookOpen,
  AlertTriangle, TrendingUp, Database, Layers, Scissors, Users, Gauge,
  Activity, Trash2, CheckCircle2, FlaskConical, Link2,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AUDIT_PERSPECTIVES, FAILURE_MODES, CONTRARIAN_VIEWS, SECOND_ORDER_EFFECTS,
  DATA_ENGINEER_METRICS, BLIND_SPOTS, EIGHTY_TWENTY, SUB_AGENT_DECOMPOSITION,
  type ViewKey,
} from '@/lib/subpage-data'
import {
  getMetricStats, clearAnalytics, isAnalyticsEndpointConfigured,
  type MetricStats,
} from '@/lib/analytics'

// =============================================================
// ICON MAP
// =============================================================

const ICON_MAP: Record<string, typeof Search> = {
  owl: Search,
  eagle: Target,
  beaver: Hammer,
  dolphin: Sparkles,
  elephant: Lightbulb,
}

// =============================================================
// PERSPECTIVE CARD (expandable)
// =============================================================

function PerspectiveCard({ perspective, index }: { perspective: typeof AUDIT_PERSPECTIVES[number]; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const Icon = ICON_MAP[perspective.id] || Search

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="bg-card/50 hover:shadow-lg transition-shadow overflow-hidden">
        {/* Color strip */}
        <div className="h-1" style={{ backgroundColor: perspective.color }} />

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${perspective.color}15` }}
              >
                {perspective.icon}
              </div>
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {perspective.name}
                  <span className="text-muted-foreground font-normal text-sm">— {perspective.title}</span>
                </CardTitle>
                <Badge variant="outline" className="text-xs mt-1" style={{ borderColor: `${perspective.color}40`, color: perspective.color }}>
                  {perspective.domain}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Key insight */}
          <div
            className="p-4 rounded-lg border-l-4 mb-4"
            style={{
              borderColor: perspective.color,
              backgroundColor: `${perspective.color}08`,
            }}
          >
            <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: perspective.color }}>
              Key Insight
            </div>
            <p className="text-sm text-foreground leading-relaxed">{perspective.keyInsight}</p>
          </div>

          {/* Hidden factors */}
          <div className="mb-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
              <Eye className="w-3 h-3" /> Hidden Factors Most People Overlook
            </h4>
            <div className="space-y-2">
              {perspective.hiddenFactors.map((factor, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-sm"
                >
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold mt-0.5"
                    style={{ backgroundColor: `${perspective.color}20`, color: perspective.color }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground leading-relaxed">{factor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Expand toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-muted/30"
            style={{ color: perspective.color }}
          >
            {isExpanded ? 'Show Less' : 'Read Full Analysis'}
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </button>

          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <div className="pt-4 border-t border-border/50 mt-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Detailed Analysis
                  </h4>
                  {perspective.detailedAnalysis.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="text-sm text-muted-foreground leading-relaxed mb-3">{paragraph}</p>
                  ))}

                  {/* Recommendation */}
                  <div
                    className="p-4 rounded-lg mt-4"
                    style={{ backgroundColor: `${perspective.color}08`, borderLeft: `3px solid ${perspective.color}` }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4" style={{ color: perspective.color }} />
                      <span className="text-sm font-semibold" style={{ color: perspective.color }}>Recommendation</span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{perspective.recommendation}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// =============================================================
// AUDIT VIEW
// =============================================================

// ---------------------------------------------------------------------------
// LiveMetricsDashboard — surfaces what's actually been collected (Task A)
// ---------------------------------------------------------------------------
function LiveMetricsDashboard() {
  const [stats, setStats] = useState<MetricStats[]>([])
  const [endpointConfigured, setEndpointConfigured] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStats(getMetricStats())
    setEndpointConfigured(isAnalyticsEndpointConfigured())
  }, [refreshKey])

  const totalEvents = stats.reduce((sum, s) => sum + s.count, 0)
  const activeMetrics = stats.filter(s => s.count > 0).length

  const handleClear = useCallback(() => {
    if (typeof window === 'undefined') return
    if (window.confirm('Clear all locally-buffered analytics events? This cannot be undone.')) {
      clearAnalytics()
      setRefreshKey(k => k + 1)
    }
  }, [])

  return (
    <div className="rounded-lg border border-emerald-600/30 bg-emerald-500/5 p-4 mb-4">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-200">Local Telemetry Buffer</span>
            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-300 border-emerald-600/30">
              {totalEvents.toLocaleString()} events
            </Badge>
            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-300 border-emerald-600/30">
              {activeMetrics}/{stats.length} metrics active
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Events are buffered locally in <code className="text-[10px] bg-muted/40 px-1 rounded">localStorage</code> under{' '}
            <code className="text-[10px] bg-muted/40 px-1 rounded">mark-tech-analytics-queue</code>.
            {endpointConfigured
              ? ' An endpoint is configured — events drain via sendBeacon on idle.'
              : ' No endpoint configured (set NEXT_PUBLIC_ANALYTICS_ENDPOINT) — events stay in this browser for you to inspect.'}
            {' '}No cookies, no PII, no cross-site tracking. A random visitor ID is generated once per browser.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="text-xs px-2 py-1 rounded border border-border/50 bg-muted/30 hover:bg-muted/50 text-muted-foreground transition-colors"
            aria-label="Refresh stats"
            title="Refresh"
          >
            <Activity className="w-3 h-3" />
          </button>
          {totalEvents > 0 && (
            <button
              onClick={handleClear}
              className="text-xs px-2 py-1 rounded border border-rose-600/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors flex items-center gap-1"
              aria-label="Clear analytics buffer"
              title="Clear local buffer"
            >
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      </div>
      {totalEvents === 0 && (
        <p className="text-xs text-muted-foreground italic mt-1">
          No events yet. Visit the <span className="text-emerald-300">Research Archive</span>, open artifacts, start the Guided Tour — counts will appear here in real time.
        </p>
      )}
    </div>
  )
}

export default function AuditView({ onSwitchView }: { onSwitchView: (v: ViewKey) => void }) {
  // Live stats for the metrics dashboard (Task A)
  const [liveStats, setLiveStats] = useState<MetricStats[] | null>(null)
  // A/B test variant assignment for the experiments card (Task C)
  const [abVariant, setAbVariant] = useState<string>('?')

  useEffect(() => {
    // Reading from localStorage on mount is the canonical "sync with external system" use case.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLiveStats(getMetricStats())
    // Read A/B assignment directly from localStorage so AuditView
    // doesn't trigger an assignment for visitors who haven't seen a PDF yet.
    try {
      const raw = localStorage.getItem('mark-tech-ab-assignments')
      if (raw) {
        const all = JSON.parse(raw)
        const assign = all['safari_pdf_fallback_timer']
        if (assign?.variant) {
          setAbVariant(`${assign.variant}ms`)
        }
      }
    } catch { /* ignore */ }
    // Refresh every 5s so the dashboard feels live while user interacts
    const id = setInterval(() => {
      setLiveStats(getMetricStats())
    }, 5000)
    return () => clearInterval(id)
  }, [])

  return (
    <motion.div
      key="audit"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#D4A01720' }}>
              <Eye className="w-5 h-5" style={{ color: '#D4A017' }} />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Impeccable Error Fix Handler <span style={{ color: '#D4A017' }}>Audit</span>
              </h2>
              <p className="text-muted-foreground text-sm">
                Five perspectives examining error handling, resilience, and hidden factors
              </p>
            </div>
          </div>
        </div>

        {/* Perspective overview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-10">
          {AUDIT_PERSPECTIVES.map((p) => {
            const Icon = ICON_MAP[p.id] || Search
            return (
              <motion.div
                key={p.id}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border/50 bg-muted/20"
              >
                <div className="text-2xl">{p.icon}</div>
                <span className="text-xs font-semibold text-center" style={{ color: p.color }}>{p.name}</span>
                <span className="text-[10px] text-muted-foreground text-center leading-tight">{p.title}</span>
              </motion.div>
            )
          })}
        </div>

        {/* Core failure pattern */}
        <Card className="bg-card/50 mb-8 border-amber-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-400">
              <Shield className="w-5 h-5" />
              Core Failure Pattern Identified
            </CardTitle>
            <CardDescription>The root cause that all five perspectives converge on</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-4">
              <p className="text-sm text-foreground leading-relaxed">
                <strong>Git rebase lock</strong> creates <code className="text-amber-300 bg-amber-500/10 px-1 rounded">.git/rebase-apply/</code> directory → <strong>zsh prompt hook</strong> attempts to read git status → <strong>framework guard</strong> detects locked state and blocks operations → All three components deadlock simultaneously, creating a total session death that no single component can detect or recover from.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-500/10">
                  <span className="text-amber-400 text-lg">1</span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-amber-400">Prevention</div>
                  <div className="text-[10px] text-muted-foreground">Pre-flight checks detect lock files before operations</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500/10">
                  <span className="text-amber-400 text-lg">2</span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-amber-400">Detection</div>
                  <div className="text-[10px] text-muted-foreground">Real-time monitoring of git state and shell exit codes</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-green-500/10">
                  <span className="text-green-400 text-lg">3</span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-green-400">Recovery</div>
                  <div className="text-[10px] text-muted-foreground">Auto-clean, safe reset, and escalation protocols</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Five perspectives */}
        <div className="space-y-6">
          {AUDIT_PERSPECTIVES.map((perspective, index) => (
            <PerspectiveCard key={perspective.id} perspective={perspective} index={index} />
          ))}
        </div>

        {/* Synthesis section */}
        <div className="mt-10 border-t border-border/50 pt-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" style={{ color: '#D4A017' }} />
            Synthesis — What All Five Perspectives Agree On
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-amber-500/8 border border-amber-600/20">
              <h4 className="text-sm font-semibold text-amber-300 mb-2">The Meta-Monitoring Gap</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Every perspective independently identified that the monitoring system itself has no health check. The Owl saw it as observational bias, the Eagle as a strategic vulnerability, the Beaver as a practical oversight, the Dolphin as a creative opportunity, and the Elephant as a cross-domain pattern (aviation dual-redundancy).
              </p>
            </div>
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <h4 className="text-sm font-semibold text-emerald-300 mb-2">The Error Log Is Untapped Gold</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The rolling 50-entry error log is recognized by all perspectives as the system&apos;s most underutilized asset. The Eagle sees it as training data, the Beaver as a prioritization tool, the Elephant as kaizen fuel, and the Dolphin as creative storytelling material.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <h4 className="text-sm font-semibold text-cyan-300 mb-2">Resilience Must Be Visible</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Both the Dolphin and Eagle converge on making resilience visible to users. Hidden resilience builds no trust. Visible recovery — through status indicators, recovery timelines, and transparent failover — compounds user confidence over time.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <h4 className="text-sm font-semibold text-amber-300 mb-2">Start Simple, Iterate Toward Complexity</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The Beaver&apos;s practicality and the Eagle&apos;s strategic view align: the resilience proxy provides 90% of the value at 10% of the complexity. Start with lock detection and pre-flight checks. Add complexity only when proven necessary.
              </p>
            </div>
          </div>
        </div>

        {/* ============================================================= */}
        {/* ENHANCED ANALYSIS — Failure Modes & Handling */}
        {/* ============================================================= */}
        <div className="mt-10 border-t border-border/50 pt-8">
          <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" style={{ color: '#ef4444' }} />
            Failure Modes & Handling
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            The six failure modes the system is designed to handle, with detection/recovery times and severity.
            This is the operational contract — every other design decision flows from these.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border border-border/40 rounded-lg overflow-hidden">
              <thead className="bg-muted/40">
                <tr>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Mode</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Trigger</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Impact</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Mitigation</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Detect</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Recover</th>
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Severity</th>
                </tr>
              </thead>
              <tbody>
                {FAILURE_MODES.map((fm, i) => {
                  const sevColor = fm.severity === 'critical' ? '#ef4444' : fm.severity === 'high' ? '#f59e0b' : fm.severity === 'medium' ? '#D4A017' : '#49d08c'
                  return (
                    <tr key={i} className="border-t border-border/30 hover:bg-muted/10 transition-colors align-top">
                      <td className="py-2 px-3 font-medium">{fm.mode}</td>
                      <td className="py-2 px-3 text-muted-foreground">{fm.trigger}</td>
                      <td className="py-2 px-3 text-muted-foreground">{fm.impact}</td>
                      <td className="py-2 px-3 text-muted-foreground">{fm.mitigation}</td>
                      <td className="py-2 px-3 text-muted-foreground whitespace-nowrap">{fm.detectionTime}</td>
                      <td className="py-2 px-3 text-muted-foreground whitespace-nowrap">{fm.recoveryTime}</td>
                      <td className="py-2 px-3">
                        <span
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium uppercase"
                          style={{ backgroundColor: `${sevColor}20`, color: sevColor }}
                        >
                          {fm.severity}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ============================================================= */}
        {/* ENHANCED ANALYSIS — Contrarian View */}
        {/* ============================================================= */}
        <div className="mt-10 border-t border-border/50 pt-8">
          <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Scissors className="w-5 h-5" style={{ color: '#e040fb' }} />
            Contrarian View — Steelman the Opposition
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            The strongest arguments <em>against</em> this system, with confidence-rated responses. The point is not to win — it is to surface what the system is actually defending against.
          </p>
          <div className="space-y-3">
            {CONTRARIAN_VIEWS.map((cv, i) => (
              <div key={i} className="p-4 rounded-lg border border-border/40 bg-muted/15">
                <div className="flex items-start gap-3 mb-2">
                  <span className="w-6 h-6 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-rose-200">{cv.claim}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                    Confidence: {cv.confidence}/10
                  </Badge>
                </div>
                <div className="ml-9 space-y-2">
                  <div className="text-xs">
                    <span className="font-semibold text-muted-foreground">Steelman: </span>
                    <span className="text-muted-foreground">{cv.steelman}</span>
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold text-emerald-400">Response: </span>
                    <span className="text-foreground/90">{cv.response}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ============================================================= */}
        {/* ENHANCED ANALYSIS — Second-Order Effects */}
        {/* ============================================================= */}
        <div className="mt-10 border-t border-border/50 pt-8">
          <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" style={{ color: '#49d08c' }} />
            Second-Order Effects
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Every decision cascades. First-order effects are predictable; second-order effects shape the long-term trajectory; third-order effects reshape the conversation.
          </p>
          <div className="space-y-3">
            {SECOND_ORDER_EFFECTS.map((effect, i) => (
              <div key={i} className="p-4 rounded-lg border border-border/40 bg-muted/15">
                <div className="text-sm font-semibold text-amber-300 mb-3 flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Decision: <span className="text-foreground font-mono text-xs">{effect.decision}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-md bg-muted/30 border border-border/30">
                    <div className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">1st Order</div>
                    <p className="text-foreground/90 leading-relaxed">{effect.firstOrder}</p>
                  </div>
                  <div className="p-3 rounded-md bg-amber-500/5 border border-amber-600/20">
                    <div className="text-[10px] uppercase font-semibold text-amber-300 mb-1">2nd Order</div>
                    <p className="text-foreground/90 leading-relaxed">{effect.secondOrder}</p>
                  </div>
                  <div className="p-3 rounded-md bg-emerald-500/5 border border-emerald-600/20">
                    <div className="text-[10px] uppercase font-semibold text-emerald-300 mb-1">3rd Order</div>
                    <p className="text-foreground/90 leading-relaxed">{effect.thirdOrder}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ============================================================= */}
        {/* ENHANCED ANALYSIS — Metrics a Data Engineer Would Add */}
        {/* ============================================================= */}
        <div className="mt-10 border-t border-border/50 pt-8">
          <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Database className="w-5 h-5" style={{ color: '#2DD4BF' }} />
            Metrics a Data Engineer Would Add
            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-300 border-emerald-600/30">
              <Activity className="w-3 h-3 mr-1" /> Live
            </Badge>
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Page views tell you traffic. They do not tell you whether visitors understood the work. These are the metrics that would actually inform iteration. Every metric below is instrumented in this build — counts shown are live, pulled from your own browser's local event queue.
          </p>

          {/* Live metrics dashboard */}
          <LiveMetricsDashboard />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
            {DATA_ENGINEER_METRICS.map((m, i) => {
              const typeColor = m.type === 'counter' ? '#49d08c' : m.type === 'histogram' ? '#e040fb' : m.type === 'gauge' ? '#f59e0b' : '#2DD4BF'
              const liveCount = liveStats?.find(s => s.metric === m.metric)?.count ?? 0
              const lastEmitted = liveStats?.find(s => s.metric === m.metric)?.lastEmitted
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border/40 bg-muted/15 transition-colors hover:border-emerald-600/30"
                >
                  <div className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ backgroundColor: typeColor }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <code className="text-xs font-mono text-foreground">{m.metric}</code>
                      <span
                        className="text-[10px] px-1.5 py-0 rounded uppercase font-medium"
                        style={{ backgroundColor: `${typeColor}20`, color: typeColor }}
                      >
                        {m.type}
                      </span>
                      {liveCount > 0 && (
                        <span className="ml-auto text-[11px] font-mono font-semibold text-emerald-300">
                          {liveCount.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{m.description}</p>
                    {lastEmitted && (
                      <p className="text-[10px] text-muted-foreground/70 mt-1">
                        Last: {new Date(lastEmitted).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ============================================================= */}
        {/* EXPERIMENTS — A/B test status (Task C) */}
        {/* ============================================================= */}
        <div className="mt-10 border-t border-border/50 pt-8">
          <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
            <FlaskConical className="w-5 h-5" style={{ color: '#e040fb' }} />
            Active Experiments
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Active A/B tests running on this build. Each visitor is assigned a sticky variant on first visit; outcomes are tracked via the analytics pipeline above.
          </p>
          <div className="rounded-lg border border-border/40 bg-muted/15 p-4">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <code className="text-xs font-mono text-foreground">safari_pdf_fallback_timer</code>
                  <Badge variant="outline" className="text-[10px] bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-600/30">
                    Running
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Tests whether the Safari PDF fallback overlay should appear after 2s, 3s, or 5s. Hypothesis: 3s is too aggressive for slow connections — visitors see the fallback even when the PDF would have loaded half a second later. Success metric: <code className="text-[10px]">pdf_loaded</code> outcome without prior <code className="text-[10px]">fallback_shown</code>.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="rounded border border-border/40 p-2 bg-card/30">
                <div className="text-muted-foreground">Variant A</div>
                <div className="font-mono font-bold text-base">2000ms</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Aggressive</div>
              </div>
              <div className="rounded border border-border/40 p-2 bg-card/30">
                <div className="text-muted-foreground">Variant B</div>
                <div className="font-mono font-bold text-base">3000ms</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Original</div>
              </div>
              <div className="rounded border border-border/40 p-2 bg-card/30">
                <div className="text-muted-foreground">Variant C</div>
                <div className="font-mono font-bold text-base">5000ms</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Patient</div>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-3">
              Your variant: <code className="font-mono">{abVariant}</code>. Outcome events appear in the <code className="font-mono">modal_dwell_time_ms</code> metric above with <code className="font-mono">_experiment</code> payload.
            </p>
          </div>
        </div>

        {/* ============================================================= */}
        {/* ENHANCED ANALYSIS — Blind Spots */}
        {/* ============================================================= */}
        <div className="mt-10 border-t border-border/50 pt-8">
          <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Eye className="w-5 h-5" style={{ color: '#D4A017' }} />
            What Am I Missing? — Blind Spots
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            The things the author of this audit would not notice because they built the system. Each blind spot comes with a concrete fix.
          </p>
          <div className="space-y-2">
            {BLIND_SPOTS.map((bs, i) => (
              <details key={i} className="group rounded-lg border border-border/40 bg-muted/15 overflow-hidden">
                <summary className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/25 transition-colors list-none">
                  <span className="w-6 h-6 rounded-full bg-amber-500/15 text-amber-300 flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium flex-1">{bs.area}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-3 pb-3 pt-1 ml-9 space-y-2">
                  <div className="text-xs">
                    <span className="font-semibold text-rose-300">Issue: </span>
                    <span className="text-muted-foreground">{bs.issue}</span>
                  </div>
                  <div className="text-xs">
                    <span className="font-semibold text-emerald-300">Fix: </span>
                    <span className="text-foreground/90">{bs.fix}</span>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* ============================================================= */}
        {/* ENHANCED ANALYSIS — 80/20 Version */}
        {/* ============================================================= */}
        <div className="mt-10 border-t border-border/50 pt-8">
          <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Gauge className="w-5 h-5" style={{ color: '#49d08c' }} />
            80/20 Version — Ship, Defer, Kill
          </h3>
          <p className="text-sm text-muted-foreground mb-4">{EIGHTY_TWENTY.principle}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-emerald-500/8 border border-emerald-600/20">
              <h4 className="text-sm font-semibold text-emerald-300 mb-3 flex items-center gap-2">
                <span className="text-base">🚢</span> Ship Now
              </h4>
              <ul className="space-y-1.5">
                {EIGHTY_TWENTY.ship.map((item, i) => (
                  <li key={i} className="text-xs text-muted-foreground leading-relaxed flex items-start gap-1.5">
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-amber-500/8 border border-amber-600/20">
              <h4 className="text-sm font-semibold text-amber-300 mb-3 flex items-center gap-2">
                <span className="text-base">⏸️</span> Defer
              </h4>
              <ul className="space-y-1.5">
                {EIGHTY_TWENTY.defer.map((item, i) => (
                  <li key={i} className="text-xs text-muted-foreground leading-relaxed flex items-start gap-1.5">
                    <span className="text-amber-400 mt-0.5">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-rose-500/8 border border-rose-600/20">
              <h4 className="text-sm font-semibold text-rose-300 mb-3 flex items-center gap-2">
                <span className="text-base">✗</span> Kill
              </h4>
              <ul className="space-y-1.5">
                {EIGHTY_TWENTY.kill.map((item, i) => (
                  <li key={i} className="text-xs text-muted-foreground leading-relaxed flex items-start gap-1.5">
                    <span className="text-rose-400 mt-0.5">✗</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ============================================================= */}
        {/* ENHANCED ANALYSIS — Sub-Agent Decomposition */}
        {/* ============================================================= */}
        <div className="mt-10 border-t border-border/50 pt-8">
          <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
            <Users className="w-5 h-5" style={{ color: '#2DD4BF' }} />
            Sub-Agent Decomposition
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            If this system were built by a team of specialized agents, here is who would own what — and how success would be measured.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SUB_AGENT_DECOMPOSITION.map((agent, i) => (
              <div key={i} className="p-4 rounded-lg border border-border/40 bg-muted/15">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-7 h-7 rounded-md bg-cyan-500/15 text-cyan-300 flex items-center justify-center text-xs font-bold font-mono">
                    {i + 1}
                  </span>
                  <code className="text-sm font-mono text-cyan-300">{agent.agent}</code>
                </div>
                <p className="text-xs text-foreground/90 mb-2 leading-relaxed">{agent.role}</p>
                <div className="text-xs mb-2">
                  <span className="text-muted-foreground">Owns: </span>
                  <span className="text-muted-foreground font-mono text-[10px]">
                    {agent.owns.join(', ')}
                  </span>
                </div>
                <div className="text-xs p-2 rounded bg-emerald-500/5 border border-emerald-600/15">
                  <span className="font-semibold text-emerald-300">Success: </span>
                  <span className="text-muted-foreground">{agent.successCriteria}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
