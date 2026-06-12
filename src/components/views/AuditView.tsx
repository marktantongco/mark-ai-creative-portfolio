'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Target, Hammer, Sparkles, Lightbulb,
  ChevronDown, Shield, Eye, ArrowRight, BookOpen,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AUDIT_PERSPECTIVES, type ViewKey } from '@/lib/subpage-data'

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

export default function AuditView({ onSwitchView }: { onSwitchView: (v: ViewKey) => void }) {
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
      </div>
    </motion.div>
  )
}
