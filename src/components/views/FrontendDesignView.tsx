'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Target, Eye, Palette, Layers,
  ChevronDown, Monitor, Smartphone, MousePointer,
  Zap, Layout, Type,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FRONTEND_PERSPECTIVES, type ViewKey } from '@/lib/subpage-data'

// =============================================================
// DESIGN PRINCIPLE CARD
// =============================================================

function DesignPrincipleCard({ icon: Icon, title, description, color }: {
  icon: typeof Sparkles; title: string; description: string; color: string
}) {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="flex items-start gap-4 p-4 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/30 transition-colors"
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <h4 className="text-sm font-semibold mb-1">{title}</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </motion.div>
  )
}

// =============================================================
// DESIGN COMPARISON TABLE
// =============================================================

const DESIGN_COMPARISON = [
  {
    aspect: 'Error States',
    dolphin: 'Personality-driven messages with narrative and micro-joy',
    eagle: 'Component-level error boundaries with consistent visual language',
  },
  {
    aspect: 'Loading States',
    dolphin: 'Skeleton screens with playful animations and witty copy',
    eagle: 'Predictive loading with cached fallback data and optimistic updates',
  },
  {
    aspect: 'Failover UX',
    dolphin: '"Currently serving from backup" with subtle celebration animation',
    eagle: 'Graceful degradation with progressive transparency indicators',
  },
  {
    aspect: 'Recovery Feedback',
    dolphin: 'Micro-animation celebrating successful recovery (pulse, haptic)',
    eagle: 'Real-time recovery timeline showing detection → diagnosis → resolution',
  },
  {
    aspect: 'Pre-flight UI',
    dolphin: 'Friendly concierge checking your bags — thorough but unobtrusive',
    eagle: 'Automated gate system with challenge-response for critical checks',
  },
  {
    aspect: 'Empty States',
    dolphin: 'Illustrated scenes with personality and helpful suggestions',
    eagle: 'Cached content with "last updated" timestamps and retry actions',
  },
]

// =============================================================
// WCAG CHECKLIST
// =============================================================

const WCAG_ITEMS = [
  { category: 'Contrast', items: ['4.5:1 minimum for normal text', '3:1 minimum for large text', 'Non-text contrast 3:1 for UI components'] },
  { category: 'Keyboard', items: ['All interactive elements reachable via Tab', 'Focus indicators visible and prominent', 'No keyboard traps in interactive flows'] },
  { category: 'Motion', items: ['Respect prefers-reduced-motion', 'No auto-playing animations without controls', 'Pause/stop mechanisms for persistent motion'] },
  { category: 'Screen Reader', items: ['ARIA labels on all interactive elements', 'Live regions for dynamic content updates', 'Skip links for repetitive navigation'] },
]

// =============================================================
// FRONTEND DESIGN VIEW
// =============================================================

export default function FrontendDesignView({ onSwitchView }: { onSwitchView: (v: ViewKey) => void }) {
  const [expandedPerspective, setExpandedPerspective] = useState<string | null>(null)

  return (
    <motion.div
      key="frontend-design"
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
              <Palette className="w-5 h-5" style={{ color: '#D4A017' }} />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Frontend <span style={{ color: '#D4A017' }}>Design</span> Perspectives
              </h2>
              <p className="text-muted-foreground text-sm">
                Creative (Dolphin) and Strategic (Eagle) lenses on resilient frontend design
              </p>
            </div>
          </div>
        </div>

        {/* Two perspective overview cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {FRONTEND_PERSPECTIVES.map((p, index) => {
            const Icon = p.id === 'dolphin-design' ? Sparkles : Target
            const isExpanded = expandedPerspective === p.id

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-card/50 h-full" style={{ borderTop: `3px solid ${p.color}` }}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                        style={{ backgroundColor: `${p.color}15` }}
                      >
                        {p.icon}
                      </div>
                      <div>
                        <CardTitle className="text-base">{p.name}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="p-3 rounded-lg border-l-3 mb-4"
                      style={{
                        borderLeft: `3px solid ${p.color}`,
                        backgroundColor: `${p.color}08`,
                      }}
                    >
                      <p className="text-sm text-foreground leading-relaxed">{p.insight}</p>
                    </div>

                    <button
                      onClick={() => setExpandedPerspective(isExpanded ? null : p.id)}
                      className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-muted/30"
                      style={{ color: p.color }}
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
                          transition={{ duration: 0.4 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 mt-2 border-t border-border/50">
                            {p.analysis.split('\n\n').map((paragraph, i) => (
                              <p key={i} className="text-sm text-muted-foreground leading-relaxed mb-3">{paragraph}</p>
                            ))}

                            {/* Creative examples or strategic layers */}
                            {'creativeExamples' in p && p.creativeExamples && (
                              <div className="mt-4 space-y-2">
                                <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: p.color }}>
                                  Creative Examples
                                </h4>
                                {p.creativeExamples.map((ex: string, i: number) => (
                                  <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <Sparkles className="w-3 h-3 mt-1 shrink-0" style={{ color: p.color }} />
                                    <span>{ex}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {'strategicLayers' in p && p.strategicLayers && (
                              <div className="mt-4 space-y-2">
                                <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: p.color }}>
                                  Strategic Layers
                                </h4>
                                {p.strategicLayers.map((layer: string, i: number) => (
                                  <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <Target className="w-3 h-3 mt-1 shrink-0" style={{ color: p.color }} />
                                    <span>{layer}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Design comparison table */}
        <Card className="bg-card/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Layers className="w-5 h-5" style={{ color: '#D4A017' }} />
              Dolphin vs. Eagle — Design Aspect Comparison
            </CardTitle>
            <CardDescription>How each perspective approaches the same frontend challenges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-2 text-muted-foreground font-medium">Aspect</th>
                    <th className="text-left py-3 px-2 font-medium" style={{ color: '#00E5FF' }}>
                      <div className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Dolphin</div>
                    </th>
                    <th className="text-left py-3 px-2 font-medium" style={{ color: '#49d08c' }}>
                      <div className="flex items-center gap-1"><Target className="w-3 h-3" /> Eagle</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {DESIGN_COMPARISON.map((row, i) => (
                    <tr key={i} className="border-b border-border/30 hover:bg-muted/10 transition-colors">
                      <td className="py-3 px-2 font-medium text-xs">{row.aspect}</td>
                      <td className="py-3 px-2 text-xs text-muted-foreground">{row.dolphin}</td>
                      <td className="py-3 px-2 text-xs text-muted-foreground">{row.eagle}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* 2026 Design Standards */}
        <Card className="bg-card/50 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Monitor className="w-5 h-5" style={{ color: '#D4A017' }} />
              Modern 2026 Design Standards
            </CardTitle>
            <CardDescription>WCAG 2.2, variable fonts, 8pt grid, micro-interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <DesignPrincipleCard icon={Eye} title="WCAG 4.5:1 Contrast" color="#49d08c" description="Minimum contrast ratio for normal text. Large text requires 3:1. Non-text UI components need 3:1 against adjacent colors." />
              <DesignPrincipleCard icon={Type} title="Variable Fonts" color="#5632c3" description="Single font file with weight, width, and slant axes. Reduces payload by 60% while enabling fluid typography transitions." />
              <DesignPrincipleCard icon={Layout} title="8pt Grid System" color="#f59e0b" description="All spacing, sizing, and positioning aligned to an 8-pixel base grid. Ensures visual rhythm and consistent proportions across breakpoints." />
              <DesignPrincipleCard icon={Zap} title="Micro-interactions" color="#00E5FF" description="Subtle motion feedback on every interaction: hover lifts, press scales, success pulses. Each under 300ms for perceived responsiveness." />
              <DesignPrincipleCard icon={Smartphone} title="Responsive-First" color="#D4A017" description="Mobile-first breakpoints at sm:640, md:768, lg:1024, xl:1280. Touch targets minimum 44px. Safe area insets for iOS." />
              <DesignPrincipleCard icon={MousePointer} title="Performance Budget" color="#E63946" description="LCP under 2.5s, FID under 100ms, CLS under 0.1. WebP/AVIF images, code splitting, lazy hydration for below-fold content." />
            </div>
          </CardContent>
        </Card>

        {/* WCAG Checklist */}
        <Card className="bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="w-5 h-5" style={{ color: '#49d08c' }} />
              WCAG 2.2 Compliance Checklist
            </CardTitle>
            <CardDescription>Essential accessibility requirements for the interactive web app</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {WCAG_ITEMS.map((category) => (
                <div key={category.category} className="space-y-2">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{category.category}</Badge>
                  </h4>
                  {category.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-4 h-4 rounded border border-emerald-500/40 flex items-center justify-center shrink-0">
                        <div className="w-2 h-2 rounded-sm bg-emerald-400" />
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
