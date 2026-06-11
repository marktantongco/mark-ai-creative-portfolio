'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe, Server, Eye, Layers, Network, Shield,
  ChevronDown, Lightbulb, Sparkles, Target,
  ArrowRight, BookOpen, Brain,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PROXY_DISCUSSION, PROXY_DATA, type ViewKey } from '@/lib/subpage-data'

// =============================================================
// ICON MAP
// =============================================================

const PROXY_ICON_MAP: Record<string, typeof Globe> = {
  forward: Globe,
  reverse: Server,
  transparent: Eye,
  'api-gateway': Layers,
  'service-mesh': Network,
  resilience: Shield,
}

// =============================================================
// PROXY DISCUSSION CARD (expandable)
// =============================================================

function ProxyDiscussionCard({ proxy, index }: { proxy: typeof PROXY_DISCUSSION[number]; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const proxyData = PROXY_DATA.find((p) => p.id === proxy.proxyId)
  const Icon = PROXY_ICON_MAP[proxy.proxyId] || Globe

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <Card className="bg-card/50 hover:shadow-md transition-shadow overflow-hidden">
        <div
          className="h-1"
          style={{ backgroundColor: proxyData ? (proxyData.fitScore >= 80 ? '#49d08c' : proxyData.fitScore >= 50 ? '#fbbf24' : '#ef4444') : '#8C8C8C' }}
        />

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: '#5632c320' }}
              >
                <Icon className="w-5 h-5" style={{ color: '#5632c3' }} />
              </div>
              <div>
                <CardTitle className="text-lg">{proxy.name}</CardTitle>
                {proxyData && (
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      Fit Score: {proxyData.fitScore}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">{proxyData.latencyImpact}</span>
                  </div>
                )}
              </div>
            </div>
            {proxyData && (
              <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                <svg className="w-12 h-12 -rotate-90" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="22" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted-foreground/20" />
                  <circle
                    cx="28" cy="28" r="22"
                    fill="none"
                    stroke={proxyData.fitScore >= 80 ? '#49d08c' : proxyData.fitScore >= 50 ? '#fbbf24' : '#ef4444'}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 22}`}
                    strokeDashoffset={`${2 * Math.PI * 22 - (proxyData.fitScore / 100) * 2 * Math.PI * 22}`}
                  />
                </svg>
                <span className="absolute text-xs font-bold" style={{ color: proxyData.fitScore >= 80 ? '#49d08c' : proxyData.fitScore >= 50 ? '#fbbf24' : '#ef4444' }}>
                  {proxyData.fitScore}
                </span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {proxyData && (
            <p className="text-sm text-muted-foreground mb-4">{proxyData.tagline}</p>
          )}

          {/* Three perspectives summary */}
          <div className="grid grid-cols-1 gap-3 mb-4">
            <div className="p-3 rounded-lg border-l-3 border-[#e040fb]" style={{ borderLeft: '3px solid #e040fb', backgroundColor: '#e040fb08' }}>
              <div className="flex items-center gap-2 mb-1">
                <Lightbulb className="w-3 h-3 text-[#e040fb]" />
                <span className="text-xs font-semibold text-[#e040fb]">Elephant — Cross-Domain</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{proxy.elephantInsight}</p>
            </div>
            <div className="p-3 rounded-lg border-l-3 border-[#00E5FF]" style={{ borderLeft: '3px solid #00E5FF', backgroundColor: '#00E5FF08' }}>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-3 h-3 text-[#00E5FF]" />
                <span className="text-xs font-semibold text-[#00E5FF]">Dolphin — Creative</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{proxy.dolphinCreative}</p>
            </div>
            <div className="p-3 rounded-lg border-l-3 border-[#49d08c]" style={{ borderLeft: '3px solid #49d08c', backgroundColor: '#49d08c08' }}>
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-3 h-3 text-[#49d08c]" />
                <span className="text-xs font-semibold text-[#49d08c]">Eagle — Strategic</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{proxy.eagleStrategy}</p>
            </div>
          </div>

          {/* Expand for full text */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-purple-300 transition-colors rounded-lg hover:bg-muted/30"
          >
            {isExpanded ? 'Show Less' : 'Expand Full Discussion'}
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
                <div className="pt-4 mt-2 border-t border-border/50 space-y-4">
                  {/* Elephant full */}
                  <div className="p-4 rounded-lg" style={{ borderLeft: '3px solid #e040fb', backgroundColor: '#e040fb08' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-[#e040fb]" />
                      <span className="text-sm font-semibold text-[#e040fb]">Elephant — Cross-Domain Memory</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{proxy.elephantInsight}</p>
                  </div>

                  {/* Dolphin full */}
                  <div className="p-4 rounded-lg" style={{ borderLeft: '3px solid #00E5FF', backgroundColor: '#00E5FF08' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-[#00E5FF]" />
                      <span className="text-sm font-semibold text-[#00E5FF]">Dolphin — Creative Innovation</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{proxy.dolphinCreative}</p>
                  </div>

                  {/* Eagle full */}
                  <div className="p-4 rounded-lg" style={{ borderLeft: '3px solid #49d08c', backgroundColor: '#49d08c08' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-[#49d08c]" />
                      <span className="text-sm font-semibold text-[#49d08c]">Eagle — Strategic Long-term</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{proxy.eagleStrategy}</p>
                  </div>

                  {/* Cross-domain and historical */}
                  {proxyData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <div className="flex items-center gap-2 mb-1">
                          <Brain className="w-3 h-3" style={{ color: '#5632c3' }} />
                          <span className="text-xs font-semibold" style={{ color: '#5632c3' }}>Cross-Domain Insight</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{proxyData.crossDomainInsight}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <div className="flex items-center gap-2 mb-1">
                          <BookOpen className="w-3 h-3 text-amber-400" />
                          <span className="text-xs font-semibold text-amber-400">Historical Parallel</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{proxyData.historicalParallel}</p>
                      </div>
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
}

// =============================================================
// PROXY DISCUSSION VIEW
// =============================================================

export default function ProxyDiscussionView({ onSwitchView }: { onSwitchView: (v: ViewKey) => void }) {
  return (
    <motion.div
      key="proxy-discussion"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#e040fb20' }}>
              <Network className="w-5 h-5" style={{ color: '#e040fb' }} />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Proxy <span style={{ color: '#e040fb' }}>Discussion</span>
              </h2>
              <p className="text-muted-foreground text-sm">
                Cross-domain insights, creative innovations, and strategic analysis for each proxy type
              </p>
            </div>
          </div>
        </div>

        {/* Perspective legend */}
        <div className="flex flex-wrap items-center gap-3 mb-8 p-4 rounded-lg bg-muted/20 border border-border/50">
          <span className="text-xs font-semibold text-muted-foreground">Examining through:</span>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs" style={{ backgroundColor: '#e040fb15', color: '#e040fb' }}>
            <Lightbulb className="w-3 h-3" /> Elephant — Cross-Domain Memory
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs" style={{ backgroundColor: '#00E5FF15', color: '#00E5FF' }}>
            <Sparkles className="w-3 h-3" /> Dolphin — Creative & Inventive
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs" style={{ backgroundColor: '#49d08c15', color: '#49d08c' }}>
            <Target className="w-3 h-3" /> Eagle — Strategic & Long-term
          </div>
        </div>

        {/* Fit Score overview bar */}
        <Card className="bg-card/50 mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5" style={{ color: '#49d08c' }} />
              Proxy Fit Score Overview
            </CardTitle>
            <CardDescription>How well each proxy type fits the portfolio deployment use case</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {PROXY_DATA.map((proxy) => {
                const Icon = PROXY_ICON_MAP[proxy.id] || Globe
                const color = proxy.fitScore >= 80 ? '#49d08c' : proxy.fitScore >= 50 ? '#fbbf24' : '#ef4444'
                return (
                  <div key={proxy.id} className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0 text-muted-foreground" />
                    <span className="text-sm w-36 shrink-0 font-medium">{proxy.name}</span>
                    <div className="flex-1 h-6 bg-muted/30 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${proxy.fitScore}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                        className="h-full rounded-full flex items-center justify-end pr-2"
                        style={{ backgroundColor: `${color}30` }}
                      >
                        <span className="text-[10px] font-bold" style={{ color }}>{proxy.fitScore}%</span>
                      </motion.div>
                    </div>
                    <span className="text-xs text-muted-foreground w-28 shrink-0 text-right">{proxy.latencyImpact}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Key takeaway */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 via-cyan-500/10 to-emerald-500/10 border border-purple-500/20 mb-8">
          <div className="flex items-start gap-3">
            <ArrowRight className="w-5 h-5 mt-0.5 shrink-0" style={{ color: '#5632c3' }} />
            <div>
              <h4 className="text-sm font-semibold mb-1">Key Takeaway</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The <strong>Resilience Proxy (85%)</strong> and <strong>Reverse Proxy (90%)</strong> are the clear winners for portfolio deployment. The Resilience Proxy&apos;s custom self-healing middleware provides the highest ROI for small-team projects, while the Reverse Proxy (via Vercel/Cloudflare) handles load balancing and SSL with minimal configuration. The Service Mesh (15%) and Transparent Proxy (10%) are architectural overkill for this use case — their complexity far exceeds the reliability gains they provide.
              </p>
            </div>
          </div>
        </div>

        {/* Proxy discussion cards */}
        <div className="space-y-4">
          {PROXY_DISCUSSION.map((proxy, index) => (
            <ProxyDiscussionCard key={proxy.proxyId} proxy={proxy} index={index} />
          ))}
        </div>

        {/* How proxies stand out */}
        <div className="mt-10 border-t border-border/50 pt-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" style={{ color: '#5632c3' }} />
            How These Proxies Stand Out — Comparative Advantages
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <h4 className="text-sm font-semibold text-emerald-300 mb-2">High-Fit Proxies (80%+)</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Reverse Proxy and Resilience Proxy dominate because they align with the portfolio&apos;s key constraints: low complexity, high reliability, and self-healing capability. They stand out by providing maximum resilience with minimum operational overhead — the rare combination that makes them the default choice for small-team and solo-developer deployments.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <h4 className="text-sm font-semibold text-amber-300 mb-2">Mid-Fit Proxies (50-79%)</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The API Gateway (65%) offers intelligent routing and centralized auth — valuable for microservices but overkill for a single-site portfolio. It stands out in scenarios where the portfolio evolves into a platform with multiple API endpoints. The strategic play is to keep it as an upgrade path, not a starting point.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <h4 className="text-sm font-semibold text-red-300 mb-2">Low-Fit Proxies (&lt;50%)</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Forward Proxy (25%), Service Mesh (15%), and Transparent Proxy (10%) add complexity without proportional reliability gains for a portfolio site. They stand out in enterprise environments with hundreds of microservices or strict compliance requirements, but for a deployment with 2-3 targets, their overhead is unjustified.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
