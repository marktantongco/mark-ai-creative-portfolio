'use client'

import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe, Server, Eye, Layers, Network, Shield,
  ChevronDown, Mail, CheckCircle2, XCircle, Loader2,
  Brain, BookOpen, Search, Target, Hammer,
  Sparkles, Lightbulb, ArrowRight, Zap, Terminal,
  Play, AlertTriangle, Activity, Code2, ArrowUpRight,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from '@/components/ui/accordion'

// =============================================================
// DATA
// =============================================================

const PROXY_DATA = [
  {
    id: 'forward', name: 'Forward Proxy', icon: Globe,
    tagline: 'Client-side intermediary that forwards requests to the target',
    mechanism: 'Sits between the client and the internet. The client explicitly connects to the proxy, which then forwards the request to the target server.',
    strengths: ['Privacy & anonymity', 'Access control & content filtering', 'Response caching', 'Bypass geo-restrictions'],
    weaknesses: ['Single point of failure', 'Added latency', 'No server-side load balancing', 'Complex auth handoffs'],
    fitScore: 25,
    crossDomainInsight: 'Psychology: Like a social mask — protects identity but adds distance. The overhead of maintaining the proxy mirrors the cognitive load of maintaining a persona.',
    historicalParallel: 'Medieval court secretaries — rewrote messages, sometimes altering tone, adding delay but preserving identity.',
    keyProtocols: ['HTTP CONNECT', 'SOCKS5', 'HTTPS tunneling'],
    latencyImpact: '+20-80ms per request',
    useCase: 'Corporate filtering, geo-bypass, anonymity',
  },
  {
    id: 'reverse', name: 'Reverse Proxy', icon: Server,
    tagline: 'Server-side intermediary that distributes requests to backends',
    mechanism: 'Sits in front of backend servers. Clients connect thinking it IS the server. Routes to backends, handling SSL, compression, and caching.',
    strengths: ['Load balancing', 'SSL termination', 'Static caching', 'DDoS mitigation'],
    weaknesses: ['Config complexity grows', 'Can become bottleneck', 'SPOF without redundancy', 'Harder debugging'],
    fitScore: 90,
    crossDomainInsight: 'Economics: Like a market maker — sits between buyers and sellers, providing liquidity. The reverse proxy provides "request liquidity" by routing demand to supply.',
    historicalParallel: 'Hotel concierge — guests never interact with kitchen or maintenance directly. The concierge routes, translates, and quality-controls.',
    keyProtocols: ['HTTP/2', 'HTTP/3 (QUIC)', 'WebSocket', 'gRPC'],
    latencyImpact: '+2-10ms (often offset by caching)',
    useCase: 'CDN, load balancing, SSL termination (Vercel, Cloudflare, Nginx)',
  },
  {
    id: 'transparent', name: 'Transparent Proxy', icon: Eye,
    tagline: 'Intercepts traffic without client configuration or awareness',
    mechanism: 'Intercepts at router/switch level. Client has no idea a proxy exists. Used in corporate/ISP environments for policy enforcement.',
    strengths: ['Zero client config', 'Network-level policy', 'Cannot be bypassed', 'Compliance monitoring'],
    weaknesses: ['No user privacy', 'Extremely hard to debug', 'Limited flexibility', 'Can break E2E encryption'],
    fitScore: 10,
    crossDomainInsight: 'Science: Like a transparent deep-ocean fish — exists but invisible. Ecological role is real (filtering nutrients), but imperceptible to most organisms.',
    historicalParallel: "Bentham's Panopticon — inmates never know when observed, so they self-regulate. The transparent proxy creates an \"always watched\" dynamic.",
    keyProtocols: ['WCCP', 'Policy routing', 'iptables REDIRECT'],
    latencyImpact: '+5-30ms (unpredictable)',
    useCase: 'ISP filtering, corporate compliance, captive portals',
  },
  {
    id: 'api-gateway', name: 'API Gateway', icon: Layers,
    tagline: 'Manages, routes, and transforms API requests with intelligence',
    mechanism: 'Unified entry point for all API calls. Handles auth, rate limiting, request transformation, caching, analytics, and can compose responses from multiple backends.',
    strengths: ['Centralized auth & rate limiting', 'Request/response transformation', 'Analytics & observability', 'API composition'],
    weaknesses: ['Added latency per call', 'Vendor lock-in risk', 'Complex configuration', 'SPOF for ALL APIs'],
    fitScore: 65,
    crossDomainInsight: 'Biology: Like the blood-brain barrier — highly selective, actively transports nutrients while blocking pathogens. Not just a filter but an intelligent routing layer.',
    historicalParallel: 'Roman cursus publicus — not just roads, but way stations, auth seals, rate limits on messages, and message transformation at each station.',
    keyProtocols: ['REST', 'GraphQL', 'gRPC', 'WebSocket', 'SSE'],
    latencyImpact: '+10-50ms (depends on middleware)',
    useCase: 'Microservices API management, rate limiting, auth',
  },
  {
    id: 'service-mesh', name: 'Service Mesh Proxy', icon: Network,
    tagline: 'Sidecar proxy for every microservice with centralized control',
    mechanism: 'Deploys a sidecar alongside every service. All inter-service traffic flows through it. Handles mTLS, retries, circuit breaking, observability, traffic splitting.',
    strengths: ['Zero-trust security (mTLS)', 'Auto retries & circuit breaking', 'Deep observability', 'Traffic management (canary, blue-green)'],
    weaknesses: ['High infra complexity', 'Resource overhead per pod', 'Steep learning curve', 'Debugging the mesh itself is hard'],
    fitScore: 15,
    crossDomainInsight: 'Systems theory: Like mycelial networks in forests — invisible underground web connecting trees, sharing nutrients and warning signals. Collective intelligence no single tree achieves alone.',
    historicalParallel: '19th century diplomatic corps — every nation had ambassadors (sidecars) everywhere, with a central foreign ministry (control plane) coordinating. Ambassadors handled local comms, protocol, security.',
    keyProtocols: ['xDS API', 'mTLS (SPIFFE)', 'gRPC', 'HTTP/2'],
    latencyImpact: '+5-15ms per hop',
    useCase: 'Large-scale microservices (100+), zero-trust environments',
  },
  {
    id: 'resilience', name: 'Resilience Proxy', icon: Shield,
    tagline: 'Custom middleware for failover, monitoring, and self-healing',
    mechanism: 'Purpose-built middleware between app and deployment targets. Actively monitors health, auto-fails over, triggers self-healing when errors detected.',
    strengths: ['Automatic failover', 'Deployment health monitoring', 'Error recovery with backoff', 'Deployment analytics'],
    weaknesses: ['Custom implementation needed', 'Must be maintained alongside app', 'Can become SPOF itself', 'Limited ecosystem'],
    fitScore: 85,
    crossDomainInsight: "Psychology: The stress-inoculation model — deliberately exposes system to controlled stressors (health checks, simulated failures) to build antifragility. Like exposure therapy, each recovery makes the system stronger.",
    historicalParallel: "Roman legion's castra — built every night on the march, self-healing defensive perimeter. If one wall section fell, internal grid contained the breach. Rebuilt daily with lessons from yesterday.",
    keyProtocols: ['HTTP health checks', 'WebSocket status', 'Retry with backoff', 'Circuit breaker'],
    latencyImpact: '+1-5ms (monitoring overhead)',
    useCase: 'Portfolio sites, multi-target deployments, self-healing infra',
  },
]

const PERSPECTIVES = [
  {
    id: 'owl', name: 'Owl', title: 'The Analytical Eye', icon: Search, color: '#5632c3',
    insight: 'Error handling is a system\'s immune response — each catch block is an antibody, each retry policy a white blood cell.',
    analysis: 'From a purely analytical standpoint, the pattern of proxy-based error handling mirrors biological immune systems. Forward proxies act as skin — the first barrier, selective about what enters. Reverse proxies are the lymphatic system — routing and filtering internal traffic. The resilience proxy is adaptive immunity, learning from each failure to respond faster next time. The key metric isn\'t error rate but recovery velocity — how quickly the system returns to homeostasis after perturbation.',
  },
  {
    id: 'eagle', name: 'Eagle', title: 'The Strategic View', icon: Target, color: '#49d08c',
    insight: 'Strategic redundancy isn\'t waste — it\'s insurance with a positive ROI when failure cost exceeds redundancy cost.',
    analysis: 'The strategic view reveals that most systems over-invest in prevention and under-invest in recovery. The optimal strategy isn\'t to prevent all failures — it\'s to make failures cheap and recovery automatic. This is why the resilience proxy scores highest for portfolio deployment: it optimizes the cost-benefit curve. Each additional deployment target reduces expected downtime exponentially while only adding linear complexity. The diminishing returns kick in at 3 targets — beyond that, the complexity cost exceeds the reliability gain.',
  },
  {
    id: 'beaver', name: 'Beaver', title: 'The Practical Builder', icon: Hammer, color: '#f59e0b',
    insight: 'Ship the simplest thing that handles 80% of failures. The rest is over-engineering until proven otherwise.',
    analysis: 'In practice, most deployment failures fall into 3 categories: build errors (catch in CI), DNS/SSL issues (catch in preflight), and target outages (catch with failover). A simple health-check + failover proxy handles all three. Service meshes and API gateways are powerful but premature for most projects. Start with a reverse proxy (Nginx/Vercel) and add a thin resilience layer. You can always iterate toward complexity, but you can\'t iterate back from it. The best error handler is the one your team actually understands.',
  },
  {
    id: 'dolphin', name: 'Dolphin', title: 'The Creative Swimmer', icon: Sparkles, color: '#00E5FF',
    insight: 'Errors are features in disguise. Every 500 error is a chance to show personality, build trust, and create memorable experiences.',
    analysis: 'The most memorable user experiences come not from perfection but from graceful failure. GitHub\'s unicorn error page, Slack\'s loading messages, Cloudflare\'s detective — these moments of personality during failure build more brand loyalty than a thousand successful requests. The creative approach to error handling treats each failure as a design opportunity. Custom error pages that acknowledge the problem, provide alternatives, and maybe even entertain, transform a negative moment into a positive impression.',
  },
  {
    id: 'elephant', name: 'Elephant', title: 'The Cross-Domain Memory', icon: Lightbulb, color: '#e040fb',
    insight: 'Every domain has solved the resilience problem. We just need to translate their solutions into code.',
    analysis: 'Aviation has checklists that reduced pilot error by 30%. Medicine has triage systems that optimize survival under resource constraints. Construction has inspection milestones that catch defects early. Each of these maps directly to a software pattern: pre-flight checks (aviation), error priority queues (triage), and CI/CD gates (inspections). The cross-domain insight is that resilience isn\'t a technical problem — it\'s an organizational one. The best error handling systems borrow patterns from fields that have been solving these problems for centuries.',
  },
]

const PREFLIGHT_CHECKS = [
  { id: 'env', label: 'Environment variables loaded', icon: Terminal },
  { id: 'build', label: 'Build artifacts verified', icon: Hammer },
  { id: 'dns', label: 'DNS resolution check', icon: Globe },
  { id: 'ssl', label: 'SSL certificate valid', icon: Shield },
  { id: 'deps', label: 'Dependencies audit passed', icon: CheckCircle2 },
  { id: 'deploy', label: 'Deployment target reachable', icon: Server },
]

const PROJECTS = [
  { name: 'Resilience Proxy', desc: 'Self-healing middleware with automatic failover and circuit breaking for multi-target deployments', tech: ['TypeScript', 'WebSocket', 'Circuit Breaker'], color: '#5632c3' },
  { name: 'Deploy Sentinel', desc: 'Pre-flight deployment checker with real-time health monitoring and rollback capabilities', tech: ['Next.js', 'Node.js', 'Health Checks'], color: '#49d08c' },
  { name: 'Mesh Visualizer', desc: 'Interactive service mesh topology and real-time traffic flow viewer for microservices', tech: ['React', 'D3.js', 'gRPC'], color: '#e040fb' },
  { name: 'API Forge', desc: 'Gateway composition layer for microservices with intelligent request routing', tech: ['GraphQL', 'REST', 'Rate Limiting'], color: '#ff6d00' },
]

const TIMELINE = [
  { year: '2015', title: 'The Terminal Years', desc: 'Started coding in Vim, deploying via FTP. Every script was an adventure and every server a mystery waiting to be solved.', style: 'terminal' as const },
  { year: '2020', title: 'The Cloud Shift', desc: 'Containers, orchestration, infrastructure as code. Kubernetes changed everything — including our sleep schedules and on-call rotations.', style: 'cyberpunk' as const },
  { year: '2023', title: 'The Design Renaissance', desc: 'When developers started caring about typography and whitespace. Craft met engineering at the intersection of beauty and reliability.', style: 'editorial' as const },
  { year: '2026', title: 'The Resilient Future', desc: 'Self-healing systems, AI-assisted debugging, and the era of antifragile infrastructure. Failures became features, not fears.', style: 'bento' as const },
]

const DEPLOYMENT_TARGETS = [
  { name: 'Vercel', status: 'healthy' as const },
  { name: 'GitHub Pages', status: 'healthy' as const },
  { name: 'Cloudflare', status: 'degraded' as const },
]

// =============================================================
// SUB-COMPONENTS
// =============================================================

function FitScoreRing({ score }: { score: number }) {
  const radius = 22
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 80 ? '#49d08c' : score >= 50 ? '#fbbf24' : '#ef4444'

  return (
    <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={radius} fill="none" stroke="currentColor" strokeWidth="3" className="text-muted-foreground/20" />
        <motion.circle
          cx="28" cy="28" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <span className="absolute text-xs font-bold" style={{ color }}>{score}</span>
    </div>
  )
}

// =============================================================
// TIMELINE ERA CARDS
// =============================================================

function TerminalCard({ year, title, desc }: { year: string; title: string; desc: string }) {
  return (
    <div className="font-mono border border-green-500/30 bg-black/60 rounded-lg p-4 md:p-6 relative overflow-hidden">
      <div className="text-green-400/60 text-xs mb-2">&gt; cat {year}_log.txt</div>
      <div className="text-green-400 text-lg md:text-xl font-bold mb-2">{'{'}</div>
      <div className="text-green-300 text-sm ml-4 mb-1">{'// '}{title}</div>
      <div className="text-green-400/70 text-xs md:text-sm ml-4 mb-2">{desc}</div>
      <div className="text-green-400 text-lg font-bold">{'}'}</div>
      <div className="text-green-400/40 text-xs mt-2 flex items-center gap-1">
        <span className="animate-pulse">█</span> <span>connection terminated</span>
      </div>
    </div>
  )
}

function CyberpunkCard({ year, title, desc }: { year: string; title: string; desc: string }) {
  return (
    <div
      className="relative bg-gradient-to-br from-purple-900/30 to-cyan-900/20 rounded-lg p-4 md:p-6 border border-purple-500/30 overflow-hidden"
      style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(86, 50, 195, 0.03) 2px, rgba(86, 50, 195, 0.03) 4px)',
      }}
    >
      <div className="absolute top-1.5 left-1.5 w-4 h-4 border-t-2 border-l-2 border-cyan-400/60" />
      <div className="absolute top-1.5 right-1.5 w-4 h-4 border-t-2 border-r-2 border-cyan-400/60" />
      <div className="absolute bottom-1.5 left-1.5 w-4 h-4 border-b-2 border-l-2 border-cyan-400/60" />
      <div className="absolute bottom-1.5 right-1.5 w-4 h-4 border-b-2 border-r-2 border-cyan-400/60" />
      <div className="text-cyan-400/80 text-xs font-mono mb-2">[SYS::HUD::{year}]</div>
      <div className="text-xl md:text-2xl font-bold text-white mb-2 tracking-wide">{title}</div>
      <div className="text-cyan-200/60 text-sm">{desc}</div>
      <div className="mt-3 flex gap-2">
        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse [animation-delay:0.5s]" />
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse [animation-delay:1s]" />
      </div>
    </div>
  )
}

function EditorialCard({ year, title, desc }: { year: string; title: string; desc: string }) {
  return (
    <div className="bg-gradient-to-br from-stone-900/60 to-stone-800/30 rounded-lg p-6 md:p-8 border border-stone-700/30">
      <div className="text-stone-400 text-sm tracking-widest uppercase mb-3 font-serif">{year} — Vol. III</div>
      <div className="text-3xl md:text-4xl font-bold mb-4 font-serif italic text-white leading-tight">{title}</div>
      <div className="w-16 h-0.5 bg-amber-400/60 mb-4" />
      <div className="text-stone-300/80 text-sm md:text-base leading-relaxed font-serif">{desc}</div>
    </div>
  )
}

function BentoCard({ year, title, desc }: { year: string; title: string; desc: string }) {
  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-2">
      <div className="col-span-2 bg-gradient-to-br from-purple-600/20 to-purple-900/30 rounded-lg p-4 md:p-5 border border-purple-500/20">
        <div className="text-purple-300 text-xs font-mono mb-1">{year}</div>
        <div className="text-xl md:text-2xl font-bold text-white">{title}</div>
      </div>
      <div className="bg-emerald-900/20 rounded-lg p-3 md:p-4 border border-emerald-500/20">
        <div className="text-emerald-300 text-xs mb-1">Status</div>
        <div className="text-emerald-400 font-bold text-sm flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live
        </div>
      </div>
      <div className="bg-stone-900/40 rounded-lg p-3 md:p-4 border border-stone-700/30">
        <div className="text-stone-400 text-xs mb-1">About</div>
        <div className="text-stone-300 text-xs leading-relaxed">{desc.slice(0, 80)}...</div>
      </div>
    </div>
  )
}

function TimelineEraCard({ era, index }: { era: typeof TIMELINE[number]; index: number }) {
  const isLeft = index % 2 === 0
  const CardComponent =
    era.style === 'terminal' ? TerminalCard :
    era.style === 'cyberpunk' ? CyberpunkCard :
    era.style === 'editorial' ? EditorialCard :
    BentoCard

  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className={`relative flex items-start gap-4 md:gap-8 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} flex-row`}
    >
      {/* Connector dot */}
      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 z-10">
        <div className="w-4 h-4 rounded-full border-2 border-purple-500 bg-background" />
      </div>
      {/* Spacer for desktop alternating */}
      <div className="hidden md:block w-1/2" />
      {/* Card */}
      <div className="w-full md:w-1/2">
        <CardComponent year={era.year} title={era.title} desc={era.desc} />
      </div>
    </motion.div>
  )
}

// =============================================================
// PROXY EXPANDED DETAIL
// =============================================================

function ProxyDetail({ proxy }: { proxy: typeof PROXY_DATA[number] }) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="overflow-hidden"
    >
      <div className="border-l-2 pl-4 md:pl-6 py-4 mt-2 ml-3 space-y-4" style={{ borderColor: '#5632c3' }}>
        {/* Mechanism */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-1">Mechanism</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{proxy.mechanism}</p>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold mb-2" style={{ color: '#49d08c' }}>Strengths</h4>
            <ul className="space-y-1">
              {proxy.strengths.map((s) => (
                <li key={s} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#49d08c' }} />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2 text-red-400">Weaknesses</h4>
            <ul className="space-y-1">
              {proxy.weaknesses.map((w) => (
                <li key={w} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Cross-domain insight */}
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 md:p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Brain className="w-4 h-4" style={{ color: '#5632c3' }} />
            <span className="text-sm font-semibold" style={{ color: '#5632c3' }}>Cross-Domain Insight</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{proxy.crossDomainInsight}</p>
        </div>

        {/* Historical parallel */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 md:p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-amber-400">Historical Parallel</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{proxy.historicalParallel}</p>
        </div>

        {/* Key Protocols */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-2">Key Protocols</h4>
          <div className="flex flex-wrap gap-2">
            {proxy.keyProtocols.map((p) => (
              <Badge key={p} variant="outline" className="text-xs border-purple-500/40 text-purple-300">
                {p}
              </Badge>
            ))}
          </div>
        </div>

        {/* Use Case */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-1">Use Case</h4>
          <p className="text-sm text-muted-foreground">{proxy.useCase}</p>
        </div>
      </div>
    </motion.div>
  )
}

// =============================================================
// MAIN PAGE COMPONENT
// =============================================================

export default function PortfolioPage() {
  const [currentView, setCurrentView] = useState<'home' | 'error-handler'>('home')
  const [expandedProxy, setExpandedProxy] = useState<string | null>(null)
  const [preflightRunning, setPreflightRunning] = useState(false)
  const [preflightResults, setPreflightResults] = useState<Record<string, 'idle' | 'running' | 'pass' | 'fail'>>({})
  const [activeErrorTab, setActiveErrorTab] = useState('proxy')
  const timelineRef = useRef<HTMLDivElement>(null)

  const scrollToTimeline = useCallback(() => {
    timelineRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const switchToErrorHandler = useCallback(() => {
    setCurrentView('error-handler')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const switchToHome = useCallback(() => {
    setCurrentView('home')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const toggleProxy = useCallback((id: string) => {
    setExpandedProxy((prev) => (prev === id ? null : id))
  }, [])

  const runPreflight = useCallback(() => {
    if (preflightRunning) return
    setPreflightRunning(true)
    setPreflightResults({})

    const checkIds = PREFLIGHT_CHECKS.map((c) => c.id)
    let completed = 0

    checkIds.forEach((id, index) => {
      setTimeout(() => {
        setPreflightResults((prev) => ({ ...prev, [id]: 'running' }))
        setTimeout(() => {
          const result = Math.random() > 0.15 ? 'pass' : 'fail'
          completed++
          setPreflightResults((prev) => ({ ...prev, [id]: result }))
          if (completed === checkIds.length) {
            setPreflightRunning(false)
          }
        }, 800 + Math.random() * 600)
      }, index * 600)
    })
  }, [preflightRunning])

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* ===== NAVIGATION ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <button onClick={switchToHome} className="text-lg font-bold tracking-tight">
            <span style={{ color: '#5632c3' }}>A</span>lex<span className="text-muted-foreground">.dev</span>
          </button>
          <div className="flex items-center gap-6">
            <button
              onClick={switchToHome}
              className={`text-sm font-medium transition-colors relative pb-1 ${currentView === 'home' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Home
              {currentView === 'home' && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ backgroundColor: '#5632c3' }}
                />
              )}
            </button>
            <button
              onClick={switchToErrorHandler}
              className={`text-sm font-medium transition-colors relative pb-1 ${currentView === 'error-handler' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Error Handler
              {currentView === 'error-handler' && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ backgroundColor: '#5632c3' }}
                />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 pt-14">
        <AnimatePresence mode="wait">
          {currentView === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {/* ===== HERO SECTION ===== */}
              <section className="relative overflow-hidden">
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-background to-emerald-900/10" />
                {/* Grid pattern */}
                <div
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                  }}
                />
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />

                <div className="relative max-w-6xl mx-auto px-4 md:px-6 py-24 md:py-36 text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                  >
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
                      Alex <span style={{ color: '#5632c3' }}>Chen</span>
                    </h1>
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
                  >
                    Building resilient systems from frontend to deployment
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.5 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                  >
                    <Button
                      onClick={scrollToTimeline}
                      size="lg"
                      className="gap-2 text-base px-6"
                      style={{ backgroundColor: '#5632c3' }}
                    >
                      View My Work <ArrowRight className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={switchToErrorHandler}
                      variant="outline"
                      size="lg"
                      className="gap-2 text-base px-6"
                    >
                      <Zap className="w-4 h-4" /> Technical Case Study
                    </Button>
                  </motion.div>
                </div>

                {/* Animated accent border */}
                <div className="h-0.5 w-full overflow-hidden">
                  <motion.div
                    className="h-full w-[200%]"
                    style={{
                      background: 'linear-gradient(90deg, #5632c3, #49d08c, #5632c3, #49d08c)',
                    }}
                    animate={{ x: ['-50%', '0%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
              </section>

              {/* ===== TIMELINE SECTION ===== */}
              <section ref={timelineRef} className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-3xl md:text-4xl font-bold text-center mb-4"
                >
                  The <span style={{ color: '#5632c3' }}>Journey</span>
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="text-muted-foreground text-center mb-12 md:mb-16"
                >
                  A decade of building, breaking, and rebuilding
                </motion.p>

                {/* Central vertical line (desktop) */}
                <div className="relative">
                  <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500/40 via-emerald-500/40 to-purple-500/40" />
                  {/* Mobile left line */}
                  <div className="md:hidden absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-purple-500/40 via-emerald-500/40 to-purple-500/40" />

                  <div className="space-y-8 md:space-y-12">
                    {TIMELINE.map((era, index) => (
                      <div key={era.year} className="relative">
                        {/* Mobile dot */}
                        <div className="md:hidden absolute left-3 top-4 -translate-x-1/2 z-10">
                          <div className="w-3 h-3 rounded-full border-2 border-purple-500 bg-background" />
                        </div>
                        {/* Mobile card with left padding */}
                        <div className="md:hidden pl-8">
                          <TimelineEraCard era={era} index={0} />
                        </div>
                        {/* Desktop card */}
                        <div className="hidden md:block">
                          <TimelineEraCard era={era} index={index} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* ===== PROJECT CARDS SECTION ===== */}
              <section className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-3xl md:text-4xl font-bold text-center mb-4"
                >
                  Featured <span style={{ color: '#49d08c' }}>Projects</span>
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="text-muted-foreground text-center mb-12"
                >
                  Things I&apos;ve built, broken, and shipped
                </motion.p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {PROJECTS.map((project, i) => (
                    <motion.div
                      key={project.name}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                    >
                      <a href="#" className="block group">
                        <Card className="h-full transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5 hover:border-purple-500/30 bg-card/50">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-lg group-hover:transition-colors" style={{ color: project.color }}>
                                {project.name}
                              </CardTitle>
                              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                            </div>
                            <CardDescription className="text-sm">{project.desc}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {project.tech.map((t) => (
                                <Badge key={t} variant="secondary" className="text-xs">
                                  {t}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </a>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* ===== MANIFESTO SECTION ===== */}
              <section className="relative overflow-hidden py-20 md:py-32">
                {/* Subtle gradient background */}
                <div className="absolute inset-0 bg-gradient-to-b from-background via-purple-900/10 to-background" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl" />

                <div className="relative max-w-4xl mx-auto px-4 md:px-6 text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                  >
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                      The best error is the one
                      <br />
                      <span style={{ color: '#5632c3' }}>your system handles before</span>
                      <br />
                      anyone notices.
                    </h2>
                    <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
                      Resilience isn&apos;t about never failing — it&apos;s about failing gracefully, recovering instantly,
                      and making it look effortless.
                    </p>
                    <motion.button
                      onClick={switchToErrorHandler}
                      className="inline-flex items-center gap-2 px-8 py-4 text-lg font-bold rounded-lg transition-all"
                      style={{
                        backgroundColor: '#00E5FF',
                        color: '#000',
                        border: '3px solid #000',
                        boxShadow: '4px 4px 0px #000',
                      }}
                      whileHover={{ scale: 1.05, boxShadow: '6px 6px 0px #000' }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Zap className="w-5 h-5" />
                      See How I Build for Failure
                    </motion.button>
                  </motion.div>
                </div>
              </section>
            </motion.div>
          ) : (
            /* ===== ERROR HANDLER VIEW ===== */
            <motion.div
              key="error-handler"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
                <div className="mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold mb-2">
                    Error <span style={{ color: '#5632c3' }}>Handler</span>
                  </h2>
                  <p className="text-muted-foreground">
                    A deep dive into proxy architectures, deployment resilience, and multi-perspective analysis
                  </p>
                </div>

                <Tabs value={activeErrorTab} onValueChange={setActiveErrorTab}>
                  <TabsList className="mb-6 w-full md:w-auto">
                    <TabsTrigger value="proxy">Proxy Comparison</TabsTrigger>
                    <TabsTrigger value="error-handler">Error Handler</TabsTrigger>
                    <TabsTrigger value="perspectives">Perspectives</TabsTrigger>
                  </TabsList>

                  {/* ===== PROXY COMPARISON TAB ===== */}
                  <TabsContent value="proxy">
                    <div className="space-y-3">
                      {PROXY_DATA.map((proxy) => {
                        const Icon = proxy.icon
                        const isExpanded = expandedProxy === proxy.id
                        return (
                          <div key={proxy.id}>
                            <motion.div
                              className="cursor-pointer"
                              onClick={() => toggleProxy(proxy.id)}
                            >
                              <Card className={`transition-all duration-200 hover:border-purple-500/40 bg-card/50 ${isExpanded ? 'border-purple-500/50 shadow-md shadow-purple-500/5' : ''}`}>
                                <CardContent className="p-4 md:p-5">
                                  <div className="flex items-center gap-3 md:gap-4">
                                    <div
                                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                                      style={{ backgroundColor: '#5632c320' }}
                                    >
                                      <Icon className="w-5 h-5" style={{ color: '#5632c3' }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-0.5">
                                        <h3 className="font-semibold text-foreground">{proxy.name}</h3>
                                        <span className="text-xs text-muted-foreground hidden sm:inline">• {proxy.latencyImpact}</span>
                                      </div>
                                      <p className="text-sm text-muted-foreground truncate">{proxy.tagline}</p>
                                    </div>
                                    <div className="hidden md:flex items-center gap-2 shrink-0">
                                      {proxy.keyProtocols.slice(0, 3).map((p) => (
                                        <Badge key={p} variant="outline" className="text-[10px] px-1.5 py-0">
                                          {p}
                                        </Badge>
                                      ))}
                                    </div>
                                    <FitScoreRing score={proxy.fitScore} />
                                    <motion.div
                                      animate={{ rotate: isExpanded ? 180 : 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="shrink-0"
                                    >
                                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                    </motion.div>
                                  </div>
                                </CardContent>
                              </Card>
                            </motion.div>

                            <AnimatePresence initial={false}>
                              {isExpanded && (
                                <ProxyDetail proxy={proxy} />
                              )}
                            </AnimatePresence>
                          </div>
                        )
                      })}
                    </div>
                  </TabsContent>

                  {/* ===== ERROR HANDLER TAB ===== */}
                  <TabsContent value="error-handler">
                    <div className="space-y-6">
                      {/* Pre-flight checker */}
                      <Card className="bg-card/50">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5" style={{ color: '#5632c3' }} />
                            Pre-flight Deployment Checker
                          </CardTitle>
                          <CardDescription>
                            Simulated deployment validation before pushing to production
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3 mb-6">
                            {PREFLIGHT_CHECKS.map((check) => {
                              const Icon = check.icon
                              const status = preflightResults[check.id] || 'idle'
                              return (
                                <div
                                  key={check.id}
                                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
                                >
                                  <div className="flex items-center gap-3">
                                    <Icon className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">{check.label}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {status === 'idle' && (
                                      <span className="text-xs text-muted-foreground">Pending</span>
                                    )}
                                    {status === 'running' && (
                                      <div className="flex items-center gap-1.5">
                                        <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                                        <span className="text-xs text-purple-400">Running</span>
                                      </div>
                                    )}
                                    {status === 'pass' && (
                                      <div className="flex items-center gap-1.5">
                                        <CheckCircle2 className="w-4 h-4" style={{ color: '#49d08c' }} />
                                        <span className="text-xs" style={{ color: '#49d08c' }}>Pass</span>
                                      </div>
                                    )}
                                    {status === 'fail' && (
                                      <div className="flex items-center gap-1.5">
                                        <XCircle className="w-4 h-4 text-red-400" />
                                        <span className="text-xs text-red-400">Fail</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                          <Button
                            onClick={runPreflight}
                            disabled={preflightRunning}
                            size="lg"
                            className="w-full gap-2"
                            style={{ backgroundColor: '#5632c3' }}
                          >
                            {preflightRunning ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" /> Running Checks...
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4" /> Run Pre-flight Check
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Deployment targets */}
                      <Card className="bg-card/50">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Server className="w-5 h-5" style={{ color: '#49d08c' }} />
                            Deployment Targets
                          </CardTitle>
                          <CardDescription>
                            Current status of deployment destinations
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {DEPLOYMENT_TARGETS.map((target) => (
                              <div
                                key={target.name}
                                className="flex items-center gap-3 p-4 rounded-lg border border-border/50 bg-muted/20"
                              >
                                <div
                                  className={`w-3 h-3 rounded-full ${
                                    target.status === 'healthy'
                                      ? 'bg-emerald-400 animate-pulse'
                                      : 'bg-amber-400 animate-pulse'
                                  }`}
                                />
                                <div>
                                  <div className="font-medium text-sm">{target.name}</div>
                                  <div
                                    className={`text-xs ${
                                      target.status === 'healthy' ? 'text-emerald-400' : 'text-amber-400'
                                    }`}
                                  >
                                    {target.status === 'healthy' ? 'Healthy' : 'Degraded'}
                                  </div>
                                </div>
                                {target.status === 'degraded' && (
                                  <AlertTriangle className="w-4 h-4 text-amber-400 ml-auto" />
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* ===== PERSPECTIVES TAB ===== */}
                  <TabsContent value="perspectives">
                    <Card className="bg-card/50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="w-5 h-5" style={{ color: '#5632c3' }} />
                          Five Perspectives on Error Handling
                        </CardTitle>
                        <CardDescription>
                          Every problem has multiple angles — here are five distinct lenses
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                          {PERSPECTIVES.map((perspective) => {
                            const Icon = perspective.icon
                            return (
                              <AccordionItem key={perspective.id} value={perspective.id}>
                                <AccordionTrigger className="hover:no-underline">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                      style={{ backgroundColor: `${perspective.color}20` }}
                                    >
                                      <Icon className="w-4 h-4" style={{ color: perspective.color }} />
                                    </div>
                                    <div className="text-left">
                                      <div className="font-semibold text-sm">
                                        {perspective.name}{' '}
                                        <span className="text-muted-foreground font-normal">— {perspective.title}</span>
                                      </div>
                                    </div>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="pl-11 space-y-4">
                                    <div
                                      className="p-3 rounded-lg border-l-2"
                                      style={{
                                        borderColor: perspective.color,
                                        backgroundColor: `${perspective.color}08`,
                                      }}
                                    >
                                      <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: perspective.color }}>
                                        Key Insight
                                      </div>
                                      <p className="text-sm text-foreground">{perspective.insight}</p>
                                    </div>
                                    <div>
                                      <div className="text-xs font-semibold uppercase tracking-wider mb-2 text-muted-foreground">
                                        Detailed Analysis
                                      </div>
                                      <p className="text-sm text-muted-foreground leading-relaxed">{perspective.analysis}</p>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            )
                          })}
                        </Accordion>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-border py-6 px-4 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Last deployed: Live</span>
          </div>
          <span>Built with Next.js + GSAP spirit</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Code2 className="w-4 h-4" /> GitHub
            </a>
            <a href="#" className="hover:text-foreground transition-colors flex items-center gap-1">
              <Mail className="w-4 h-4" /> Email
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
