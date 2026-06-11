'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Shield, Activity, Zap, Eye, HardHat, Brain, ArrowRight,
  CheckCircle2, XCircle, AlertTriangle, RefreshCw, Server,
  Globe, Lock, Wifi, Radio, GitBranch, Terminal, Heart,
  ChevronDown, ExternalLink, Layers, Network, Cpu,
} from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────
type ProxyType = 'forward' | 'reverse' | 'transparent' | 'api-gateway' | 'service-mesh' | 'resilience'
type HealthStatus = 'healthy' | 'degraded' | 'down' | 'recovering'
type CheckStatus = 'pass' | 'fail' | 'warn' | 'running'

interface ProxyData {
  id: ProxyType
  name: string
  icon: React.ReactNode
  tagline: string
  mechanism: string
  strengths: string[]
  weaknesses: string[]
  fitScore: number
  crossDomainInsight: string
  historicalParallel: string
  keyProtocols: string[]
  latencyImpact: string
  useCase: string
}

interface PreflightCheck {
  id: string
  label: string
  status: CheckStatus
  autoFix?: string
}

interface DeploymentTarget {
  name: string
  status: HealthStatus
  lastDeploy: string
  uptime: string
}

// ── Data ─────────────────────────────────────────────────────────────
const PROXY_DATA: ProxyData[] = [
  {
    id: 'forward',
    name: 'Forward Proxy',
    icon: <Globe className="w-5 h-5" />,
    tagline: 'Client-side intermediary that forwards requests to the target',
    mechanism: 'Sits between the client and the internet. The client explicitly connects to the proxy, which then forwards the request to the target server. The target server sees the proxy\'s IP, not the client\'s.',
    strengths: ['Privacy & anonymity', 'Access control & content filtering', 'Response caching for performance', 'Bypass geo-restrictions'],
    weaknesses: ['Single point of failure', 'Added latency per request', 'No server-side load balancing', 'Complex authentication handoffs'],
    fitScore: 25,
    crossDomainInsight: 'Psychology: Like a social mask — protects identity but adds distance from authentic interaction. The overhead of maintaining the proxy relationship mirrors the cognitive load of maintaining a persona.',
    historicalParallel: 'Letter-writing through secretaries in medieval courts — the secretary (proxy) rewrote the message, sometimes altering tone or meaning, adding delay but preserving the noble\'s identity.',
    keyProtocols: ['HTTP CONNECT', 'SOCKS5', 'HTTPS tunneling'],
    latencyImpact: '+20-80ms per request',
    useCase: 'Corporate network filtering, geo-bypass, anonymity',
  },
  {
    id: 'reverse',
    name: 'Reverse Proxy',
    icon: <Server className="w-5 h-5" />,
    tagline: 'Server-side intermediary that distributes requests to backends',
    mechanism: 'Sits in front of backend servers. Clients connect to the proxy thinking it IS the server. The proxy routes requests to one of many backends, handling SSL, compression, and caching transparently.',
    strengths: ['Load balancing across backends', 'SSL termination (offload crypto)', 'Static content caching', 'DDoS mitigation & rate limiting'],
    weaknesses: ['Configuration complexity grows with scale', 'Can become a bottleneck itself', 'Single point of failure without redundancy', 'Debugging becomes harder (extra hop)'],
    fitScore: 90,
    crossDomainInsight: 'Economics: Like a market maker in finance — sits between buyers and sellers, providing liquidity and price discovery. The reverse proxy provides "request liquidity" by efficiently routing demand to supply (backend capacity).',
    historicalParallel: 'Hotel concierge — guests don\'t interact directly with kitchen, housekeeping, or maintenance. The concierge routes requests to the right department, handles translations, and adds a layer of quality control.',
    keyProtocols: ['HTTP/2', 'HTTP/3 (QUIC)', 'WebSocket', 'gRPC'],
    latencyImpact: '+2-10ms per request (often offset by caching)',
    useCase: 'CDN, load balancing, SSL termination (Vercel, Cloudflare, Nginx)',
  },
  {
    id: 'transparent',
    name: 'Transparent Proxy',
    icon: <Eye className="w-5 h-5" />,
    tagline: 'Intercepts traffic without client configuration or awareness',
    mechanism: 'Intercepts network traffic at the router or switch level. The client has no idea a proxy exists — it thinks it\'s talking directly to the server. Often used in corporate/ISP environments for policy enforcement.',
    strengths: ['Zero client configuration', 'Policy enforcement at network level', 'Can\'t be bypassed by end users', 'Useful for compliance monitoring'],
    weaknesses: ['No privacy for users', 'Extremely hard to debug', 'Limited flexibility and customization', 'Can break end-to-end encryption attempts'],
    fitScore: 10,
    crossDomainInsight: 'Science: Like a transparent fish in the deep ocean — it exists but is invisible to those around it. The ecological role is real (filtering nutrients from water), but the organism is imperceptible to most predators and prey.',
    historicalParallel: 'The Panopticon prison design by Jeremy Bentham — inmates never know when they\'re being observed, so they self-regulate. The transparent proxy creates a similar "always watched" dynamic for network traffic.',
    keyProtocols: ['WCCP', 'Policy routing', 'iptables REDIRECT'],
    latencyImpact: '+5-30ms per request (unpredictable)',
    useCase: 'ISP content filtering, corporate compliance, captive portals',
  },
  {
    id: 'api-gateway',
    name: 'API Gateway',
    icon: <Layers className="w-5 h-5" />,
    tagline: 'Manages, routes, and transforms API requests with intelligence',
    mechanism: 'Sits at the API boundary and provides a unified entry point for all API calls. Handles authentication, rate limiting, request transformation, response caching, analytics, and can compose responses from multiple backend services.',
    strengths: ['Centralized auth & rate limiting', 'Request/response transformation', 'Analytics & observability', 'API composition from microservices'],
    weaknesses: ['Added latency for every API call', 'Vendor lock-in risk (proprietary configs)', 'Complex to configure correctly', 'Single point of failure for ALL APIs'],
    fitScore: 65,
    crossDomainInsight: 'Biology: Like the blood-brain barrier — a highly selective gateway that controls what enters the brain. It\'s not just a wall; it actively transports needed nutrients while blocking pathogens. The API gateway similarly isn\'t just a filter but an intelligent routing and transformation layer.',
    historicalParallel: 'The Roman cursus publicus (imperial postal system) — not just a road network, but a system with way stations, authentication seals, rate limits on message frequency, and message transformation (translation, ciphering) at each station.',
    keyProtocols: ['REST', 'GraphQL', 'gRPC', 'WebSocket', 'SSE'],
    latencyImpact: '+10-50ms per request (depends on middleware chain)',
    useCase: 'Microservices API management, rate limiting, auth, analytics',
  },
  {
    id: 'service-mesh',
    name: 'Service Mesh Proxy',
    icon: <Network className="w-5 h-5" />,
    tagline: 'Sidecar proxy for every microservice with centralized control',
    mechanism: 'Deploys a proxy (sidecar) alongside every service instance. All inter-service traffic flows through the sidecar, which handles mTLS, retries, circuit breaking, observability, and traffic splitting. A control plane manages all sidecars centrally.',
    strengths: ['Zero-trust security (mTLS everywhere)', 'Automatic retries & circuit breaking', 'Deep observability (traces, metrics)', 'Traffic management (canary, blue-green)'],
    weaknesses: ['High infrastructure complexity', 'Resource overhead (sidecar per pod)', 'Steep learning curve', 'Debugging the mesh itself is hard'],
    fitScore: 15,
    crossDomainInsight: 'Systems theory: Like the mycelial network in forests — an invisible underground web connecting all trees, sharing nutrients and warning signals. Each tree is autonomous, but the mesh provides collective intelligence and resilience that no single tree could achieve alone.',
    historicalParallel: 'The diplomatic corps system of the 19th century — every nation had ambassadors (sidecars) in every other nation, with a central foreign ministry (control plane) coordinating strategy. The ambassadors handled local communication, protocol translation, and security, while the ministry set global policy.',
    keyProtocols: ['xDS API', 'mTLS (SPIFFE)', 'gRPC', 'HTTP/2'],
    latencyImpact: '+5-15ms per hop (sidecar chain)',
    useCase: 'Large-scale microservices (100+ services), zero-trust environments',
  },
  {
    id: 'resilience',
    name: 'Resilience Proxy',
    icon: <Shield className="w-5 h-5" />,
    tagline: 'Custom middleware layer that provides failover, monitoring, and self-healing',
    mechanism: 'A purpose-built middleware that sits between the application and deployment targets. Unlike traditional proxies that forward traffic, the Resilience Proxy actively monitors deployment health, automatically fails over between targets, and triggers self-healing protocols when errors are detected.',
    strengths: ['Automatic failover between targets', 'Deployment health monitoring', 'Error recovery with exponential backoff', 'Deployment analytics & pattern detection'],
    weaknesses: ['Custom implementation required', 'Must be maintained alongside the application', 'Potential for the proxy itself to become a SPOF', 'Limited ecosystem compared to established proxies'],
    fitScore: 85,
    crossDomainInsight: 'Psychology: The stress-inoculation model — this proxy doesn\'t just protect; it deliberately exposes the system to controlled stressors (health checks, simulated failures) to build antifragility. Like exposure therapy, each recovered-from failure makes the system stronger.',
    historicalParallel: 'The Roman legion\'s fortified camp (castra) — built every single night on the march, providing a self-healing defensive perimeter. Even if one wall section fell, the internal grid layout contained the breach. The camp was rebuilt fresh each day, incorporating lessons from the previous day\'s encounters.',
    keyProtocols: ['HTTP health checks', 'WebSocket status', 'Retry with backoff', 'Circuit breaker'],
    latencyImpact: '+1-5ms per request (monitoring overhead)',
    useCase: 'Portfolio sites, multi-target deployments, self-healing infrastructure',
  },
]

const INITIAL_CHECKS: PreflightCheck[] = [
  { id: 'worktree', label: 'Working tree clean', status: 'running' },
  { id: 'branch', label: 'Branch up to date', status: 'running' },
  { id: 'gitops', label: 'No git operation in progress', status: 'running' },
  { id: 'lockfile', label: 'No index.lock file', status: 'running' },
  { id: 'envvars', label: 'Required environment variables', status: 'running' },
  { id: 'build', label: 'Build verification', status: 'running' },
]

const DEPLOYMENT_TARGETS: DeploymentTarget[] = [
  { name: 'Vercel', status: 'healthy', lastDeploy: '2 min ago', uptime: '99.97%' },
  { name: 'GitHub Pages', status: 'healthy', lastDeploy: '2 min ago', uptime: '99.91%' },
  { name: 'Cloudflare CDN', status: 'degraded', lastDeploy: '15 min ago', uptime: '99.85%' },
]

// ── Components ───────────────────────────────────────────────────────

function StatusDot({ status }: { status: HealthStatus }) {
  const colors = {
    healthy: 'bg-emerald-400',
    degraded: 'bg-amber-400',
    down: 'bg-red-500',
    recovering: 'bg-sky-400',
  }
  return (
    <span className={`inline-block w-2.5 h-2.5 rounded-full ${colors[status]} animate-pulse`} />
  )
}

function FitScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 28
  const offset = circumference - (score / 100) * circumference
  const color = score >= 80 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-red-400'
  const strokeColor = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative w-16 h-16">
      <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/30" />
        <motion.circle
          cx="32" cy="32" r="28" fill="none" stroke={strokeColor} strokeWidth="4"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-sm font-bold ${color}`}>{score}</span>
      </div>
    </div>
  )
}

function ProxyCard({ proxy, isSelected, onClick }: { proxy: ProxyData; isSelected: boolean; onClick: () => void }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className={`cursor-pointer transition-all duration-200 h-full ${
          isSelected
            ? 'ring-2 ring-primary shadow-lg bg-primary/5'
            : 'hover:shadow-md hover:bg-muted/50'
        }`}
        onClick={onClick}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {proxy.icon}
              </div>
              <div>
                <CardTitle className="text-base">{proxy.name}</CardTitle>
                <CardDescription className="text-xs line-clamp-1">{proxy.tagline}</CardDescription>
              </div>
            </div>
            <FitScoreRing score={proxy.fitScore} />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Activity className="w-3 h-3" />
            <span>Latency: {proxy.latencyImpact}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {proxy.keyProtocols.slice(0, 3).map((p) => (
              <Badge key={p} variant="secondary" className="text-[10px] px-1.5 py-0">{p}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function ProxyDetail({ proxy }: { proxy: ProxyData }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary text-primary-foreground">
              {proxy.icon}
            </div>
            <div>
              <CardTitle className="text-xl">{proxy.name}</CardTitle>
              <CardDescription>{proxy.tagline}</CardDescription>
            </div>
            <div className="ml-auto">
              <FitScoreRing score={proxy.fitScore} />
              <p className="text-xs text-center text-muted-foreground mt-1">Fit Score</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mechanism */}
          <div>
            <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
              <Cpu className="w-4 h-4 text-primary" /> Mechanism
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{proxy.mechanism}</p>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Strengths
              </h4>
              <ul className="space-y-1.5">
                {proxy.strengths.map((s) => (
                  <li key={s} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-emerald-500 mt-1">+</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-400" /> Weaknesses
              </h4>
              <ul className="space-y-1.5">
                {proxy.weaknesses.map((w) => (
                  <li key={w} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-red-400 mt-1">-</span> {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Cross-Domain Insight */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
            <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-primary" /> Cross-Domain Insight
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{proxy.crossDomainInsight}</p>
          </div>

          {/* Historical Parallel */}
          <div className="p-4 rounded-lg bg-muted/50 border">
            <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
              <HardHat className="w-4 h-4 text-amber-600" /> Historical Parallel
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{proxy.historicalParallel}</p>
          </div>

          {/* Technical Details */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground mb-1">Protocols</p>
              <div className="flex flex-wrap gap-1">
                {proxy.keyProtocols.map((p) => (
                  <Badge key={p} variant="outline" className="text-[10px]">{p}</Badge>
                ))}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground mb-1">Latency Impact</p>
              <p className="text-sm font-medium">{proxy.latencyImpact}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-xs text-muted-foreground mb-1">Primary Use Case</p>
              <p className="text-sm font-medium">{proxy.useCase}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function ProxyComparisonTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3 font-semibold">Feature</th>
            {PROXY_DATA.map((p) => (
              <th key={p.id} className="text-center p-3 font-semibold min-w-[120px]">
                <div className="flex flex-col items-center gap-1">
                  {p.icon}
                  <span className="text-xs">{p.name}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            { label: 'Load Balancing', values: [false, true, false, true, true, true] },
            { label: 'SSL Termination', values: [false, true, false, true, true, true] },
            { label: 'Auto Failover', values: [false, false, false, true, true, true] },
            { label: 'Self-Healing', values: [false, false, false, false, true, true] },
            { label: 'Zero-Config', values: [false, false, true, false, false, false] },
            { label: 'Observability', values: [false, true, false, true, true, true] },
            { label: 'Circuit Breaking', values: [false, false, false, true, true, true] },
            { label: 'mTLS Support', values: [false, false, false, true, true, true] },
            { label: 'Low Latency', values: [false, true, false, false, false, true] },
            { label: 'Privacy/Anonymity', values: [true, false, false, false, false, false] },
          ].map((row, i) => (
            <tr key={row.label} className={i % 2 === 0 ? 'bg-muted/30' : ''}>
              <td className="p-3 font-medium">{row.label}</td>
              {row.values.map((v, j) => (
                <td key={j} className="text-center p-3">
                  {v ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                  ) : (
                    <XCircle className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                  )}
                </td>
              ))}
            </tr>
          ))}
          <tr className="border-t-2 font-bold">
            <td className="p-3">Fit Score</td>
            {PROXY_DATA.map((p) => (
              <td key={p.id} className="text-center p-3">
                <Badge variant={p.fitScore >= 80 ? 'default' : p.fitScore >= 50 ? 'secondary' : 'outline'}>
                  {p.fitScore}%
                </Badge>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function DeploymentHeartbeat() {
  const [targets, setTargets] = useState(DEPLOYMENT_TARGETS)
  const [expanded, setExpanded] = useState(false)

  const overallStatus = targets.every(t => t.status === 'healthy')
    ? 'healthy'
    : targets.some(t => t.status === 'down')
    ? 'down'
    : 'degraded'

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-3 w-72"
          >
            <Card className="shadow-xl border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Deployment Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {targets.map((t) => (
                  <div key={t.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusDot status={t.status} />
                      <span className="text-sm font-medium">{t.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{t.lastDeploy}</p>
                      <p className="text-xs font-mono">{t.uptime}</p>
                    </div>
                  </div>
                ))}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Auto-failover</span>
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                      Active
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      <Button
        variant="outline"
        size="icon"
        className={`rounded-full shadow-lg w-12 h-12 transition-all ${
          overallStatus === 'healthy'
            ? 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20'
            : overallStatus === 'degraded'
            ? 'border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20'
            : 'border-red-500/30 bg-red-500/10 hover:bg-red-500/20'
        }`}
        onClick={() => setExpanded(!expanded)}
      >
        <Heart className={`w-5 h-5 ${
          overallStatus === 'healthy' ? 'text-emerald-500' : overallStatus === 'degraded' ? 'text-amber-500' : 'text-red-500'
        } ${overallStatus === 'healthy' ? 'animate-pulse' : ''}`} />
      </Button>
    </div>
  )
}

function PreflightChecker() {
  const [checks, setChecks] = useState<PreflightCheck[]>(INITIAL_CHECKS)
  const [running, setRunning] = useState(false)
  const [allPassed, setAllPassed] = useState(false)

  const runChecks = useCallback(() => {
    setChecks(INITIAL_CHECKS.map(c => ({ ...c, status: 'running' as CheckStatus })))
    setRunning(true)
    setAllPassed(false)

    const results: CheckStatus[] = ['pass', 'pass', 'pass', 'pass', 'warn', 'pass']

    INITIAL_CHECKS.forEach((_, i) => {
      setTimeout(() => {
        setChecks(prev => {
          const next = [...prev]
          next[i] = { ...next[i], status: results[i] }
          return next
        })
        if (i === INITIAL_CHECKS.length - 1) {
          setRunning(false)
          setAllPassed(results.every(r => r === 'pass'))
        }
      }, 400 + i * 350)
    })
  }, [])

  const statusIcon = (s: CheckStatus) => {
    switch (s) {
      case 'pass': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
      case 'fail': return <XCircle className="w-4 h-4 text-red-500" />
      case 'warn': return <AlertTriangle className="w-4 h-4 text-amber-500" />
      case 'running': return <RefreshCw className="w-4 h-4 text-sky-500 animate-spin" />
    }
  }

  const passCount = checks.filter(c => c.status === 'pass').length
  const progress = (passCount / checks.length) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Terminal className="w-5 h-5 text-primary" />
          Three-Tier Defense: Pre-Flight Checks
        </CardTitle>
        <CardDescription>Simulated pre-flight verification before deployment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} className="h-2" />
        <div className="space-y-2">
          {checks.map((check) => (
            <div key={check.id} className="flex items-center justify-between py-1.5 px-3 rounded-md bg-muted/30">
              <div className="flex items-center gap-2">
                {statusIcon(check.status)}
                <span className="text-sm">{check.label}</span>
              </div>
              {check.status === 'warn' && (
                <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20">
                  Auto-fix available
                </Badge>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={runChecks} disabled={running} size="sm">
            {running ? (
              <><RefreshCw className="w-4 h-4 mr-1.5 animate-spin" /> Running...</>
            ) : (
              <><Zap className="w-4 h-4 mr-1.5" /> Run Pre-Flight Checks</>
            )}
          </Button>
          {allPassed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1.5 text-emerald-600 text-sm"
            >
              <CheckCircle2 className="w-4 h-4" /> All checks passed
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ErrorRecoveryTimeline() {
  const steps = [
    { icon: <Shield className="w-4 h-4" />, title: 'Error Detected', desc: 'Git rebase conflict detected via .git/rebase-merge watcher', time: '0ms' },
    { icon: <RefreshCw className="w-4 h-4" />, title: 'Auto-Clean', desc: 'Abort rebase, remove index.lock, clear MERGE_HEAD', time: '150ms' },
    { icon: <GitBranch className="w-4 h-4" />, title: 'Safe Reset', desc: 'Restore HEAD from checkpoint (.session-checkpoint.json)', time: '300ms' },
    { icon: <CheckCircle2 className="w-4 h-4" />, title: 'Verification', desc: 'Re-run pre-flight checks to confirm clean state', time: '500ms' },
    { icon: <ArrowRight className="w-4 h-4" />, title: 'Continue Deployment', desc: 'Resume deployment pipeline from last checkpoint', time: '600ms' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-primary" />
          Self-Healing Recovery Protocol
        </CardTitle>
        <CardDescription>Automated recovery sequence when an error is detected</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[18px] top-4 bottom-4 w-0.5 bg-primary/20" />

          <div className="space-y-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                className="flex items-start gap-4 relative"
              >
                <div className="relative z-10 flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground shrink-0">
                  {step.icon}
                </div>
                <div className="flex-1 pb-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{step.title}</h4>
                    <Badge variant="outline" className="text-[10px] font-mono">{step.time}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Main Page ────────────────────────────────────────────────────────
export default function Home() {
  const [selectedProxy, setSelectedProxy] = useState<ProxyType>('reverse')

  const selected = PROXY_DATA.find(p => p.id === selectedProxy)!

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                Impeccable Error Fix Handler
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Multi-perspective audit: error handling, proxy architecture & frontend resilience
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Activity className="w-3 h-3 mr-1" /> 5 Perspectives
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Server className="w-3 h-3 mr-1" /> 6 Proxy Types
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Tabs defaultValue="proxy" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="proxy" className="text-xs sm:text-sm">
              <Globe className="w-4 h-4 mr-1.5 hidden sm:inline" />
              Proxy Comparison
            </TabsTrigger>
            <TabsTrigger value="error" className="text-xs sm:text-sm">
              <Shield className="w-4 h-4 mr-1.5 hidden sm:inline" />
              Error Handler
            </TabsTrigger>
            <TabsTrigger value="perspectives" className="text-xs sm:text-sm">
              <Brain className="w-4 h-4 mr-1.5 hidden sm:inline" />
              Five Perspectives
            </TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Proxy Comparison ── */}
          <TabsContent value="proxy" className="space-y-6">
            {/* How This Stands Out */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-sm">How This Project Stands Out</h3>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      Most portfolio sites treat the proxy as invisible infrastructure. This project makes the proxy a
                      <strong> visible differentiator</strong> through the Resilience Proxy pattern — a custom middleware that provides
                      automatic failover, deployment health monitoring, and self-healing protocols. The Deployment Heartbeat widget
                      (bottom-right) exposes real-time infrastructure status, demonstrating engineering maturity that goes beyond
                      "I built a website" to "I build resilient systems."
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Proxy Cards Grid */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Network className="w-5 h-5 text-primary" /> Proxy Types — Select to Explore
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {PROXY_DATA.map((proxy) => (
                  <ProxyCard
                    key={proxy.id}
                    proxy={proxy}
                    isSelected={selectedProxy === proxy.id}
                    onClick={() => setSelectedProxy(proxy.id)}
                  />
                ))}
              </div>
            </div>

            {/* Selected Detail */}
            <ProxyDetail proxy={selected} />

            {/* Comparison Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" /> Feature Comparison Matrix
                </CardTitle>
                <CardDescription>Side-by-side comparison across all proxy types</CardDescription>
              </CardHeader>
              <CardContent>
                <ProxyComparisonTable />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab 2: Error Handler ── */}
          <TabsContent value="error" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <PreflightChecker />
              <ErrorRecoveryTimeline />
            </div>

            {/* Three-Tier Architecture */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Three-Tier Defense Architecture
                </CardTitle>
                <CardDescription>Each tier catches errors that slip past the tiers below</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    {
                      tier: 1, icon: <Eye className="w-5 h-5" />, title: 'Prevention',
                      desc: 'Pre-flight checks detect potential errors before they occur. Six automated checks verify git state, environment variables, and build integrity before any deployment.',
                      color: 'emerald',
                    },
                    {
                      tier: 2, icon: <Radio className="w-5 h-5" />, title: 'Detection',
                      desc: 'Real-time monitoring of git state, shell exit codes, and build output. Rolling error log tracks the last 50 events with timestamps and classifications for pattern detection.',
                      color: 'amber',
                    },
                    {
                      tier: 3, icon: <RefreshCw className="w-5 h-5" />, title: 'Recovery',
                      desc: 'Escalating interventions: Auto-Clean (remove error conditions) → Safe Reset (restore from checkpoint) → Escalate (provide manual recovery commands). Never requires session restart.',
                      color: 'sky',
                    },
                  ].map((t) => (
                    <div key={t.tier} className={`p-4 rounded-lg border-2 border-${t.color}-500/20 bg-${t.color}-500/5`}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1.5 rounded-md bg-${t.color}-500/10 text-${t.color}-600`}>
                          {t.icon}
                        </div>
                        <h4 className="font-semibold">Tier {t.tier}: {t.title}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Failure Mode Catalogue */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Failure Mode Catalogue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full">
                  {[
                    {
                      id: 'rebase', title: 'Git Rebase Conflict (Critical)',
                      desc: 'A git pull --rebase on divergent branches creates a conflict that locks the persistent shell session. The zsh git prompt hook triggers a framework-level guard that blocks all tool execution.',
                      fix: 'Pre-flight check detects branch divergence → ff-only pull fallback. If conflict occurs, auto-abort rebase + remove .git/rebase-merge + reset to checkpoint.',
                    },
                    {
                      id: 'indexlock', title: 'Index Lock File (Critical)',
                      desc: 'Concurrent git processes or killed git operations leave .git/index.lock, blocking all git operations. The lock creates a circular dependency: you need git to remove it, but git refuses while it exists.',
                      fix: 'Auto-detect .git/index.lock in pre-flight + pre-rebase checkpoint. On detection, verify no other git process is running, then force-remove the lock file.',
                    },
                    {
                      id: 'guardlock', title: 'Framework Guard Lockout (Critical)',
                      desc: 'The framework-level guard detects git conflict state and blocks all tool calls. It has no override switch, no timeout, and no fallback — absolute prevention that becomes the very data loss risk it was designed to prevent.',
                      fix: 'Override flag (--force) + timeout-based guard release (30s) + ability to spawn a new clean shell from within the locked session.',
                    },
                    {
                      id: 'sessionloss', title: 'Session State Loss (High)',
                      desc: 'When a session restarts, all environment variables, working directory, and command history are lost. Sensitive credentials (API tokens, GitHub PATs) must be re-entered from scratch.',
                      fix: 'Checkpoint before every risky operation: serialize HEAD commit, working tree diff, and env var snapshot to .session-checkpoint.json. On session init, auto-detect and offer restore.',
                    },
                  ].map((item) => (
                    <AccordionItem key={item.id} value={item.id}>
                      <AccordionTrigger className="text-sm font-medium">
                        {item.title}
                      </AccordionTrigger>
                      <AccordionContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                        <div className="p-3 rounded-md bg-emerald-500/5 border border-emerald-500/10">
                          <p className="text-xs font-semibold text-emerald-600 mb-1">Recovery Strategy</p>
                          <p className="text-sm text-muted-foreground">{item.fix}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab 3: Five Perspectives ── */}
          <TabsContent value="perspectives" className="space-y-6">
            {[
              {
                icon: <Eye className="w-6 h-6" />, name: 'The Owl', subtitle: 'Slow, Observant, Analytical',
                color: 'violet',
                findings: [
                  'Shell prompt hook trap: zsh git hook + framework guard = guardian-becomes-jailer deadlock',
                  'Index lock persistence: .git/index.lock survives rebase abort, creating circular dependency',
                  'Session state entanglement: credentials and env vars lost on restart, never checkpointed',
                  'Framework guard absolutism: no override, no timeout, no fallback — the guard IS the vulnerability',
                ],
                insight: 'Hidden factors cause cascading failures. The cracks in the dam only reveal themselves under pressure — but they were there all along.',
              },
              {
                icon: <Zap className="w-6 h-6" />, name: 'The Eagle', subtitle: 'Long-Term Strategic Vision',
                color: 'sky',
                findings: [
                  'Four-layer architecture (Code → State → Execution → Deployment) with cascading failure — a break in any layer kills all layers above',
                  'Development and deployment are entangled in the same shell session — violating separation of concerns',
                  'Strategic goal: antifragility — the system should improve with each failure, not just survive',
                  'Deployment must be a first-class citizen, not an afterthought tacked onto the development session',
                ],
                insight: 'Errors are architectural, not incidental. The git conflict was a symptom; the root cause is a system that treats errors as exceptional rather than expected.',
              },
              {
                icon: <HardHat className="w-6 h-6" />, name: 'The Beaver', subtitle: 'Practical System Builder',
                color: 'amber',
                findings: [
                  'Tier 1 Prevention: 6 pre-flight checks that would have prevented the entire incident',
                  'Tier 2 Detection: Real-time git state monitoring + rolling error log for pattern recognition',
                  'Tier 3 Recovery: Auto-Clean → Safe Reset → Escalate — never require session restart',
                  'Session checkpointing: serialize state before risky operations for instant restoration',
                ],
                insight: 'Every error has a recovery path. If the recovery path is not defined before the error occurs, the system is not ready for production.',
              },
              {
                icon: <Brain className="w-6 h-6" />, name: 'The Dolphin', subtitle: 'Creative, Playful, Inventive',
                color: 'rose',
                findings: [
                  'Deployment Heartbeat widget: make resilience visible through a real-time status indicator',
                  'Living tier badges: badges that evolve based on real repository activity — stale projects dim, active ones glow',
                  'GSAP Error Recovery Animation: error states appear as fractured UI that reassembles as the system heals',
                  'Manifesto as living document: CTA text dynamically reflects current deployment and activity state',
                ],
                insight: 'Error states are moments of heightened user attention — they are opportunities to build trust through transparency and delight through recovery.',
              },
              {
                icon: <Heart className="w-6 h-6" />, name: 'The Elephant', subtitle: 'Powerful Cross-Domain Memory',
                color: 'emerald',
                findings: [
                  'Psychology (Stress Inoculation): Chaos engineering — deliberately trigger failures to build resilience',
                  'Economics (Option Value): Multiple deployment targets create option value; automatic failover makes it exercisable',
                  'Biology (Redundancy Principle): Two independent paths reduce total failure from 1% to 0.01% — hundredfold improvement',
                  'History (Titanic Fallacy): Partial redundancy creates false security; the compartments didn\'t extend to the top deck',
                ],
                insight: 'Cross-domain wisdom validates the approach. Every field that deals with reliability has independently converged on the same principles: prevention + detection + recovery + learning.',
              },
            ].map((perspective) => (
              <Card key={perspective.name}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-${perspective.color}-500/10 text-${perspective.color}-600`}>
                      {perspective.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{perspective.name}</CardTitle>
                      <CardDescription>{perspective.subtitle}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {perspective.findings.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <ChevronDown className="w-4 h-4 mt-0.5 text-primary rotate-[-90deg] shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-sm italic text-muted-foreground">"{perspective.insight}"</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Impeccable Error Fix Handler Audit</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <StatusDot status="healthy" /> All systems operational
              </span>
              <span>June 2026</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Deployment Heartbeat Widget */}
      <DeploymentHeartbeat />
    </div>
  )
}
