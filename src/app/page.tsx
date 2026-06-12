'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence, useInView, useScroll, useTransform } from 'framer-motion'
import {
  Globe, Server, Eye, Layers, Network, Shield,
  ChevronDown, Mail, CheckCircle2, XCircle, Loader2,
  Brain, BookOpen, Search, Target, Hammer,
  Sparkles, Lightbulb, ArrowRight, Zap, Terminal,
  Play, AlertTriangle, Activity, Code2, ArrowUpRight,
  ChevronRight, Home, FolderTree, Link2, Menu, X,
  Briefcase, Calendar, MapPin, Phone, ExternalLink,
  Award, Users, BarChart3, Camera, Palette,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from '@/components/ui/accordion'
import ResearchReportView from '@/components/views/ResearchReportView'
import AuditView from '@/components/views/AuditView'
import FrontendDesignView from '@/components/views/FrontendDesignView'
import ProxyDiscussionView from '@/components/views/ProxyDiscussionView'

// =============================================================
// TYPES
// =============================================================

type ViewKey = 'home' | 'error-handler' | 'brutalist' | 'organic' | 'cyberpunk' | 'research' | 'audit' | 'frontend-design' | 'proxy-discussion'
type PreflightStatus = 'idle' | 'running' | 'pass' | 'fail'

// =============================================================
// MIDNIGHT EMBER COLOR SYSTEM
// Premium dark + warm amber/gold accent
// Palette DNA: craftsmanship, faith, technology, warmth
// =============================================================

const COLORS = {
  // Primary — Warm amber/gold (the signature)
  primary: '#D4A017',       // Rich gold — premium, faith-driven
  primaryLight: '#F5D060',  // Bright gold — highlights, active states
  primaryDark: '#A17B12',   // Deep gold — borders, subtle accents

  // Accent — Warm teal (intelligence + technology)
  accent: '#2DD4BF',

  // Supporting — each with purpose
  cyan: '#22D3EE',          // Innovation, fresh ideas
  emerald: '#34D399',       // Success, growth, faith
  amber: '#F59E0B',         // Warmth, energy, urgency
  violet: '#A78BFA',        // Creativity, AI, imagination
  rose: '#FB7185',          // Care, compassion, insurance
}

// =============================================================
// PORTFOLIO DATA — Mark Anthony Tantongco
// =============================================================

const SERVICES = [
  {
    id: '01',
    label: 'INTELLIGENCE',
    title: 'Prompt Engineering',
    subtitle: 'Systems & Frameworks',
    color: COLORS.primary,
    description: 'Build advanced prompt architectures. Claude API integration. Meta-frameworks for self-improving systems. Structured outputs. Critique loops that refine themselves.',
    tags: ['Claude API', 'Prompt Design', 'Structured Output'],
  },
  {
    id: '02',
    label: 'IDENTITY',
    title: 'Brand Systems',
    subtitle: 'Design Tokens & Runtime',
    color: COLORS.cyan,
    description: 'Living design systems. Token-driven architecture. Neo-brutalist aesthetics. Brand runtimes that survive AI generation. Design as code.',
    tags: ['Design Tokens', 'CSS Variables', 'Type System'],
  },
  {
    id: '03',
    label: 'FRONTEND',
    title: 'Production Code',
    subtitle: 'React · Next.js · Vite',
    color: COLORS.amber,
    description: 'React/Next.js/Vite applications. GSAP cinematic animations. Three.js WebGL. WebGPU shaders. Single-file deployments. Performance-first.',
    tags: ['React/Next.js', 'GSAP', 'WebGL/WebGPU'],
  },
  {
    id: '04',
    label: 'AUTOMATION',
    title: 'ComfyUI Pipelines',
    subtitle: 'AI Image Workflows',
    color: COLORS.violet,
    description: 'ComfyUI node architecture. ACES color science. Flux & Gemini Imagen prompts. Photography AI. Lightroom automation. Systems that run 24/7.',
    tags: ['ComfyUI', 'ACES Color', 'Photography AI'],
  },
  {
    id: '05',
    label: 'DISCOVERY',
    title: 'GEO & SEO Strategy',
    subtitle: 'AI Citation Architecture',
    color: COLORS.emerald,
    description: 'AI citation architecture (GEO). Structured data for AI engines. JSON-LD strategies. Content designed to be cited by Claude, ChatGPT, Perplexity.',
    tags: ['GEO Strategy', 'JSON-LD', 'SEO Architecture'],
  },
  {
    id: '06',
    label: 'INSURANCE',
    title: 'Brand Mastery',
    subtitle: 'Licensed Agent · Pacific Cross',
    color: COLORS.rose,
    description: 'Licensed insurance agent (Pacific Cross). Blue Royale (lifetime coverage). FlexiShield (HEV enhancer). Combining technical expertise with financial literacy.',
    tags: ['Pacific Cross', 'Blue Royale', 'FlexiShield'],
  },
]

const PROJECTS = [
  {
    id: 'insurehub',
    badge: '2024 PROJECT',
    title: 'InsureHUB',
    subtitle: 'Pacific Cross Health Platform',
    color: COLORS.primary,
    description: 'Cinematic insurance platform with GSAP animations, interactive HEV calculator, Chart.js radar visualization, and brutalist design. Single-file HTML deployment. Live on production.',
    tags: ['GSAP', 'Chart.js', 'HTML5', 'Cloudflare Worker'],
    metrics: [
      { value: '300KB', label: 'File Size' },
      { value: '98', label: 'Lighthouse' },
      { value: '40%↑', label: 'Inquiries' },
      { value: '3x', label: 'Time on Site' },
    ],
  },
  {
    id: 'habitclass',
    badge: '2024 PROJECT',
    title: 'Habits Class PWA',
    subtitle: 'Faith-Based 4-Week Discipleship Tracker',
    color: COLORS.cyan,
    description: 'S.O.A.P. journaling. Gamification system. Teacher dashboard. Leaderboard. Real-time sync. Built with React/Vite. Deployed to Vercel. 200+ active users.',
    tags: ['REACT', 'PWA', 'GSAP', 'Vercel'],
    metrics: [
      { value: '200+', label: 'Active Users' },
      { value: '92%', label: 'Completion Rate' },
      { value: '500ms', label: 'Load Time' },
      { value: '4', label: 'Weeks Duration' },
    ],
  },
  {
    id: 'breakthrough',
    badge: '2023–2024 SERIES',
    title: 'BREAKTHROUGH Composite',
    subtitle: 'Cinematic AI Visual Series',
    color: COLORS.violet,
    description: 'Faith + empowerment visual pillar. ComfyUI pipelines. Flux AI generation. Advanced prompting. Photography AI scaffold method. 50+ unique compositions.',
    tags: ['COMFYUI', 'FLUX AI', 'Photography', 'Prompt Engineering'],
    metrics: [
      { value: '50+', label: 'Unique Pieces' },
      { value: '30%', label: 'Pass Rate' },
      { value: '8', label: 'LoRA Models' },
      { value: '2024', label: 'Year Released' },
    ],
  },
]

const JOURNEY = [
  {
    year: '2020',
    title: 'The Beginning',
    role: 'Photographer → Creative Director',
    description: 'Started as a photographer. Built creative direction frameworks. Realized: the leverage wasn\'t in individual pieces—it was in systems. Started teaching others.',
    color: COLORS.primary,
  },
  {
    year: '2021–2022',
    title: 'The Engineering',
    role: 'Code as a Medium',
    description: 'Closed the gap between imagination and execution. Learned React, shipped WebGL projects, built GSAP animations. Code became a creative medium, not a limitation.',
    color: COLORS.amber,
  },
  {
    year: '2023–2024',
    title: 'The Mastery',
    role: 'AI Systems Architecture',
    description: 'Built ComfyUI pipelines. Claude API integrations. Prompt engineering frameworks. Realized: highest leverage is building tools, not using them. Systems over execution.',
    color: COLORS.cyan,
  },
  {
    year: '2025–2026',
    title: 'Now',
    role: 'Living Digital Organisms',
    description: 'Everything converged. Building systems that think, adapt, grow. Faith-driven. Impact-focused. Quality over speed. Always. powerUP brand is the vehicle.',
    color: COLORS.emerald,
  },
]

const PROXY_DATA = [
  {
    id: 'forward', name: 'Forward Proxy', icon: Globe,
    tagline: 'Client-side intermediary that forwards requests to the target',
    fitScore: 25, latencyImpact: '+15-30ms',
    crossDomainInsight: 'Like a travel agent who books flights on your behalf — the airline never sees you directly.',
    historicalParallel: 'Greek messenger (herald) — speaks for the king but has no authority of their own.',
  },
  {
    id: 'reverse', name: 'Reverse Proxy', icon: Server,
    tagline: 'Server-side gateway that distributes and protects origin servers',
    fitScore: 90, latencyImpact: '+2-5ms',
    crossDomainInsight: 'Like a hotel concierge — guests never see the kitchen, staff, or logistics behind their experience.',
    historicalParallel: 'Japanese nakōdō (matchmaker) — intermediates between families, creating harmony without exposure.',
  },
  {
    id: 'transparent', name: 'Transparent Proxy', icon: Eye,
    tagline: 'Intercepts traffic without client configuration or awareness',
    fitScore: 10, latencyImpact: '+1-3ms',
    crossDomainInsight: 'Like a security camera in a hallway — you don\'t opt in, it simply watches all passage.',
    historicalParallel: 'Roman censor — observed public behavior without explicit consent, cataloging for the state.',
  },
  {
    id: 'api-gateway', name: 'API Gateway', icon: Layers,
    tagline: 'Centralized entry point with rate limiting, auth, and routing',
    fitScore: 65, latencyImpact: '+5-12ms',
    crossDomainInsight: 'Like a hospital triage desk — every patient enters through one door but gets routed by urgency.',
    historicalParallel: 'Silk Road caravanserai — all trade routes converge at one checkpoint before continuing.',
  },
  {
    id: 'service-mesh', name: 'Service Mesh', icon: Network,
    tagline: 'Dedicated infrastructure layer for service-to-service communication',
    fitScore: 15, latencyImpact: '+8-20ms',
    crossDomainInsight: 'Like a city\'s underground utility network — invisible, complex, and essential but overkill for a single building.',
    historicalParallel: 'Roman road network — built for an empire\'s scale, wasteful for a village.',
  },
  {
    id: 'resilience', name: 'Resilience Proxy', icon: Shield,
    tagline: 'Self-healing middleware with circuit breakers and retry logic',
    fitScore: 85, latencyImpact: '+3-8ms',
    crossDomainInsight: 'Like an immune system — detects anomalies, isolates failures, learns patterns, and self-repairs without conscious input.',
    historicalParallel: 'Byzantine fault tolerance — systems designed to function even when components betray expectations.',
  },
]

// =============================================================
// NAVIGATION STRUCTURE
// =============================================================

const NAV_LINKS = [
  { key: 'home' as ViewKey, label: 'Home', icon: Home },
  { key: 'error-handler' as ViewKey, label: 'Error Handler', icon: Shield },
  { key: 'research' as ViewKey, label: 'Research', icon: BookOpen },
  { key: 'audit' as ViewKey, label: 'Audit', icon: Eye },
  { key: 'frontend-design' as ViewKey, label: 'Frontend', icon: Palette },
  { key: 'proxy-discussion' as ViewKey, label: 'Proxies', icon: Network },
]

const WORKTREE_PATHS: Record<ViewKey, string[]> = {
  home: ['mark.tech', 'portfolio'],
  'error-handler': ['mark.tech', 'systems', 'error-handler'],
  brutalist: ['mark.tech', 'design', 'brutalist'],
  organic: ['mark.tech', 'design', 'organic'],
  cyberpunk: ['mark.tech', 'design', 'cyberpunk'],
  research: ['mark.tech', 'archive', 'research'],
  audit: ['mark.tech', 'systems', 'audit'],
  'frontend-design': ['mark.tech', 'design', 'frontend'],
  'proxy-discussion': ['mark.tech', 'systems', 'proxy-discussion'],
}

const BACKLINKS: Record<ViewKey, { label: string; target: ViewKey }[]> = {
  home: [],
  'error-handler': [{ label: 'Audit', target: 'audit' }, { label: 'Proxies', target: 'proxy-discussion' }],
  brutalist: [{ label: 'Frontend', target: 'frontend-design' }],
  organic: [{ label: 'Frontend', target: 'frontend-design' }],
  cyberpunk: [{ label: 'Frontend', target: 'frontend-design' }],
  research: [{ label: 'Home', target: 'home' }],
  audit: [{ label: 'Error Handler', target: 'error-handler' }],
  'frontend-design': [{ label: 'Home', target: 'home' }],
  'proxy-discussion': [{ label: 'Error Handler', target: 'error-handler' }, { label: 'Audit', target: 'audit' }],
}

// =============================================================
// ANIMATION VARIANTS — distinct per section
// =============================================================

const heroVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}
const heroItem = {
  hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] } },
}

const cardStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}
const cardReveal = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] } },
}

const timelineSlide = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const clipReveal = {
  hidden: { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
  visible: { clipPath: 'inset(0 0% 0 0)', opacity: 1, transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] } },
}

// =============================================================
// HORIZONTALLY SCROLLABLE NAVIGATION
// =============================================================

function ScrollableNav({ currentView, onNavigate }: { currentView: ViewKey; onNavigate: (v: ViewKey) => void }) {
  const navRef = useRef<HTMLDivElement>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const worktree = WORKTREE_PATHS[currentView]
  const backlinks = BACKLINKS[currentView]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-amber-600/20 bg-[#0f0e0c]/95 backdrop-blur-xl">
      {/* Main nav row */}
      <div className="flex items-center gap-4 px-4 md:px-6 h-14">
        {/* Logo */}
        <button onClick={() => onNavigate('home')} className="shrink-0 flex flex-col items-start">
          <span className="font-bold text-amber-500 text-lg tracking-widest leading-none">MARK.TECH</span>
          <span className="text-[9px] tracking-[0.25em] text-muted-foreground/50 uppercase leading-none mt-0.5">powerUP</span>
        </button>

        <div className="w-px h-6 bg-amber-600/20 shrink-0" />

        {/* Scrollable nav links */}
        <div ref={navRef} className="nav-scroll flex-1 flex items-center gap-1 overflow-x-auto" style={{ scrollbarWidth: 'thin' }}>
          {NAV_LINKS.map((link) => {
            const Icon = link.icon
            const isActive = currentView === link.key
            return (
              <button
                key={link.key}
                onClick={() => { onNavigate(link.key); setMobileMenuOpen(false) }}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium tracking-wide transition-all duration-200 ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-600/25'
                    : 'text-muted-foreground/70 hover:text-foreground hover:bg-muted/30 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {link.label}
              </button>
            )
          })}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden shrink-0 p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Placeholder / Status badge */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-medium text-emerald-400 tracking-wider">ONLINE</span>
          </div>
        </div>
      </div>

      {/* Worktree + Backlinks row */}
      <div className="flex items-center gap-3 px-4 md:px-6 h-8 border-t border-border/30 bg-[#0f0e0c]/60">
        {/* Worktree path */}
        <div className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground/50 overflow-x-auto shrink-0">
          <FolderTree className="w-3 h-3 shrink-0" />
          {worktree.map((segment, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight className="w-2.5 h-2.5 shrink-0 text-amber-600/30" />}
              <span className={i === worktree.length - 1 ? 'text-amber-400 font-medium' : ''}>{segment}</span>
            </React.Fragment>
          ))}
        </div>

        {/* Backlinks */}
        {backlinks.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-px h-3 bg-border/30" />
            <Link2 className="w-3 h-3 text-muted-foreground/40" />
            {backlinks.map((bl, i) => (
              <button
                key={i}
                onClick={() => onNavigate(bl.target)}
                className="text-[10px] font-mono text-muted-foreground/50 hover:text-amber-400 transition-colors underline decoration-dotted underline-offset-2"
              >
                {bl.label}
              </button>
            ))}
          </div>
        )}

        {/* Current section badge */}
        <div className="ml-auto shrink-0">
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-amber-600/25 text-amber-400 bg-amber-500/5 font-mono tracking-wider">
            {currentView.replace('-', '/').toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-border/30 bg-[#0f0e0c]/98"
          >
            <div className="p-3 flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon
                const isActive = currentView === link.key
                return (
                  <button
                    key={link.key}
                    onClick={() => { onNavigate(link.key); setMobileMenuOpen(false) }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

// =============================================================
// SECTION LABEL / BADGE COMPONENT
// =============================================================

function SectionLabel({ number, label, color = COLORS.primary }: { number: string; label: string; color?: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div
        className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {number}
      </div>
      <span className="text-xs font-mono tracking-[0.2em] uppercase" style={{ color: `${color}CC` }}>
        {label}
      </span>
      <div className="flex-1 h-px" style={{ backgroundColor: `${color}15` }} />
    </div>
  )
}

function CreationMethodology({ steps, color = COLORS.primary }: { steps: string[]; color?: string }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[9px] font-mono tracking-[0.15em] uppercase text-muted-foreground/40">Methodology:</span>
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          {i > 0 && <ChevronRight className="w-2.5 h-2.5 text-muted-foreground/20" />}
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ backgroundColor: `${color}08`, color: `${color}AA` }}>
            {step}
          </span>
        </React.Fragment>
      ))}
    </div>
  )
}

// =============================================================
// HERO SECTION — Mark Anthony Tantongco
// =============================================================

function HeroSection({ onNavigate }: { onNavigate: (v: ViewKey) => void }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center px-4 md:px-6 border-b border-amber-600/10">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-950/20 via-transparent to-amber-950/10 pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        variants={heroVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="relative z-10 text-center max-w-4xl mx-auto py-20"
      >
        {/* Tag */}
        <motion.div variants={heroItem} className="mb-6">
          <Badge variant="outline" className="px-3 py-1 text-xs font-mono tracking-[0.2em] border-amber-600/25 text-amber-400 bg-amber-500/5">
            AI CREATIVE TECHNOLOGIST
          </Badge>
        </motion.div>

        {/* Title */}
        <motion.h1
          variants={heroItem}
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] mb-6"
        >
          BUILD{' '}
          <span className="text-amber-500">INTELLIGENT</span>
          <br />
          EXPERIENCES
        </motion.h1>

        {/* Subtitle */}
        <motion.p variants={heroItem} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
          Prompt engineering. Digital brand systems. Faith-driven code.
          I build systems that think, remember, and grow.
          Based in <span className="text-amber-400">Taguig, Philippines</span>.
          Operating under <span className="text-amber-400 font-medium">powerUP</span>.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div variants={heroItem} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={() => onNavigate('error-handler')}
            className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-6 text-sm font-mono tracking-widest uppercase rounded-none border-2 border-amber-600 hover:border-amber-500 transition-all"
          >
            Explore Systems
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="px-8 py-6 text-sm font-mono tracking-widest uppercase rounded-none border-2 border-amber-600/25 text-amber-400 hover:bg-amber-500/8 hover:border-amber-600/40 transition-all"
          >
            View Work
          </Button>
        </motion.div>

        {/* Stats bar */}
        <motion.div variants={heroItem} className="mt-16 flex items-center justify-center gap-8 md:gap-12 flex-wrap">
          {[
            { value: '3+', label: 'Live Products' },
            { value: '200+', label: 'Active Users' },
            { value: '50+', label: 'AI Compositions' },
            { value: '98', label: 'Lighthouse Score' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl md:text-3xl font-black text-amber-400">{stat.value}</div>
              <div className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted-foreground/50 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <ChevronDown className="w-6 h-6 text-amber-600/30" />
      </motion.div>
    </section>
  )
}

// =============================================================
// SERVICES SECTION
// =============================================================

function ServicesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} id="services" className="px-4 md:px-6 py-20 md:py-28 border-b border-amber-600/10">
      <div className="max-w-6xl mx-auto">
        <SectionLabel number="01" label="What I Do" />
        <motion.div variants={clipReveal} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
            Six Core <span className="text-amber-500">Capabilities</span>
          </h2>
          <p className="text-muted-foreground mb-4 max-w-xl">
            That drive modern AI-first brands and products.
          </p>
          <CreationMethodology steps={['Identify', 'Architect', 'Build', 'Validate', 'Deploy']} />
        </motion.div>

        <motion.div
          variants={cardStagger}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-10"
        >
          {SERVICES.map((service) => (
            <motion.div key={service.id} variants={cardReveal}>
              <motion.div
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="h-full p-6 rounded-lg border border-border/50 bg-card/50 hover:border-amber-600/25 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 group"
              >
                {/* Number badge */}
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-mono tracking-wider"
                    style={{ borderColor: `${service.color}30`, color: service.color, backgroundColor: `${service.color}08` }}>
                    {service.label}
                  </Badge>
                  <span className="text-[10px] font-mono text-muted-foreground/30">{service.id}/06</span>
                </div>

                <h3 className="text-xl font-bold mb-1 group-hover:text-amber-400 transition-colors">{service.title}</h3>
                <p className="text-xs font-mono mb-3" style={{ color: service.color }}>{service.subtitle}</p>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{service.description}</p>

                <div className="flex flex-wrap gap-1.5">
                  {service.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded border border-border/30 text-muted-foreground/60 bg-muted/10">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// =============================================================
// WORK / CASE STUDIES SECTION
// =============================================================

function WorkSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const [expandedProject, setExpandedProject] = useState<string | null>(null)

  return (
    <section ref={ref} id="work" className="px-4 md:px-6 py-20 md:py-28 border-b border-amber-600/10">
      <div className="max-w-6xl mx-auto">
        <SectionLabel number="02" label="Case Studies" />
        <motion.div variants={clipReveal} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
            Projects That <span className="text-amber-500">Define</span>
          </h2>
          <p className="text-muted-foreground mb-4 max-w-xl">
            The intersection of strategy, design, and code.
          </p>
          <CreationMethodology steps={['Research', 'Strategy', 'Design', 'Develop', 'Measure']} />
        </motion.div>

        <motion.div
          variants={cardStagger}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10"
        >
          {PROJECTS.map((project) => (
            <motion.div key={project.id} variants={cardReveal}>
              <motion.div
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className="h-full rounded-lg border border-border/50 bg-card/50 overflow-hidden hover:border-amber-600/25 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 group cursor-pointer"
                onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
              >
                {/* Color strip */}
                <div className="h-1" style={{ backgroundColor: project.color }} />

                <div className="p-6">
                  {/* Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-mono tracking-wider"
                      style={{ borderColor: `${project.color}30`, color: project.color }}>
                      {project.badge}
                    </Badge>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-amber-400 transition-colors" />
                  </div>

                  <h3 className="text-2xl font-black mb-1 group-hover:text-amber-400 transition-colors">{project.title}</h3>
                  <p className="text-xs font-mono mb-3" style={{ color: project.color }}>{project.subtitle}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{project.description}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.tags.map((tag) => (
                      <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded border border-border/30 text-muted-foreground/60 bg-muted/10">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Expand toggle */}
                  <div className="flex items-center justify-center gap-2 py-2 text-xs font-mono tracking-wider" style={{ color: project.color }}>
                    {expandedProject === project.id ? 'CLOSE' : 'VIEW METRICS'}
                    <motion.div animate={{ rotate: expandedProject === project.id ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown className="w-3 h-3" />
                    </motion.div>
                  </div>

                  {/* Expanded metrics */}
                  <AnimatePresence initial={false}>
                    {expandedProject === project.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/30">
                          {project.metrics.map((metric) => (
                            <div key={metric.label} className="p-3 rounded-md border border-border/20 bg-muted/10 text-center">
                              <div className="text-xl font-black" style={{ color: project.color }}>{metric.value}</div>
                              <div className="text-[9px] font-mono tracking-[0.15em] uppercase text-muted-foreground/50 mt-1">{metric.label}</div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// =============================================================
// JOURNEY / TIMELINE SECTION
// =============================================================

function JourneySection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} id="journey" className="px-4 md:px-6 py-20 md:py-28 border-b border-amber-600/10">
      <div className="max-w-3xl mx-auto">
        <SectionLabel number="03" label="The Journey" />
        <motion.div variants={clipReveal} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
            From <span className="text-amber-500">Photographer</span> to Architect
          </h2>
          <p className="text-muted-foreground mb-4">
            Systems over execution. Always.
          </p>
          <CreationMethodology steps={['Observe', 'Learn', 'Build', 'Teach', 'Evolve']} />
        </motion.div>

        <div className="mt-10 space-y-0">
          {JOURNEY.map((item, index) => (
            <motion.div
              key={item.year}
              variants={timelineSlide}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              transition={{ delay: index * 0.15 }}
              className="relative pl-8 pb-8 last:pb-0"
            >
              {/* Timeline line */}
              <div
                className="absolute left-0 top-2 w-0.5 h-full"
                style={{ background: `linear-gradient(180deg, ${item.color}60, ${item.color}10)` }}
              />
              {/* Timeline dot */}
              <div
                className="absolute left-0 top-2 w-2 h-2 rounded-full -translate-x-[7px]"
                style={{ backgroundColor: item.color, boxShadow: `0 0 8px ${item.color}40` }}
              />

              <div className="mb-1">
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 font-mono tracking-wider"
                  style={{ borderColor: `${item.color}30`, color: item.color }}>
                  {item.year}
                </Badge>
              </div>
              <h3 className="text-xl font-bold mb-0.5">{item.title}</h3>
              <p className="text-xs font-mono mb-2" style={{ color: item.color }}>{item.role}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// =============================================================
// CONTACT SECTION
// =============================================================

function ContactSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const socials = [
    { label: 'Instagram', href: 'https://instagram.com/markytanky', icon: Camera },
    { label: 'GitHub', href: 'https://github.com/marktantongco', icon: Code2 },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/marktantongco1', icon: Users },
  ]

  return (
    <section ref={ref} id="contact" className="px-4 md:px-6 py-20 md:py-28 border-b border-amber-600/10">
      <div className="max-w-3xl mx-auto text-center">
        <SectionLabel number="04" label="Connect" color={COLORS.amber} />
        <motion.div variants={fadeUp} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Let&apos;s Build <span className="text-amber-500">Together</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed">
            Whether you need a prompt engineering system, brand redesign, or full-stack build — let&apos;s talk.
            Based in <span className="text-amber-400 font-medium">Taguig, Philippines</span>. Open to local & remote projects.
          </p>
        </motion.div>

        <motion.div
          variants={cardStagger}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="flex items-center justify-center gap-4 flex-wrap mb-10"
        >
          {socials.map((social) => {
            const Icon = social.icon
            return (
              <motion.a
                key={social.label}
                variants={cardReveal}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="flex items-center gap-3 px-6 py-4 rounded-lg border border-amber-600/20 bg-card/50 hover:border-amber-600/30 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 group"
              >
                <Icon className="w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-colors" />
                <span className="text-sm font-mono tracking-wider uppercase text-muted-foreground group-hover:text-foreground transition-colors">
                  {social.label}
                </span>
                <ExternalLink className="w-3 h-3 text-muted-foreground/30 group-hover:text-amber-400 transition-colors" />
              </motion.a>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

// =============================================================
// FOOTER
// =============================================================

function Footer() {
  return (
    <footer className="border-t border-amber-600/10 bg-[#0f0e0c]/80">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="text-amber-500 font-bold text-lg tracking-widest mb-1">MARK.TECH</div>
            <div className="text-[9px] tracking-[0.25em] text-muted-foreground/40 uppercase">powerUP</div>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              AI Creative Technologist<br />
              Taguig, Philippines
            </p>
          </div>
          <div>
            <h4 className="text-xs font-mono tracking-[0.15em] uppercase text-amber-400/60 mb-3">Services</h4>
            {['Prompt Engineering', 'Brand Systems', 'Full-Stack Development', 'AI Automation', '1:1 Mentorship'].map((s) => (
              <p key={s} className="text-sm text-muted-foreground mb-1.5">{s}</p>
            ))}
          </div>
          <div>
            <h4 className="text-xs font-mono tracking-[0.15em] uppercase text-amber-400/60 mb-3">Tech Stack</h4>
            {['React · Next.js · Vite', 'GSAP · Three.js · WebGPU', 'Claude API · ComfyUI', 'TypeScript · Node.js'].map((s) => (
              <p key={s} className="text-sm text-muted-foreground mb-1.5">{s}</p>
            ))}
          </div>
        </div>
        <div className="border-t border-amber-600/10 pt-6 text-center">
          <p className="text-[10px] font-mono tracking-[0.12em] text-muted-foreground/30">
            &copy; 2024–2026 powerUP. Built with faith, code, and purpose. Quality over speed. Always.
          </p>
        </div>
      </div>
    </footer>
  )
}

// =============================================================
// ERROR HANDLER DEMO (resilience system demo)
// =============================================================

function ErrorHandlerDemo() {
  const [status, setStatus] = useState<PreflightStatus>('idle')
  const [logs, setLogs] = useState<string[]>([])
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const runPreflight = useCallback(() => {
    setStatus('running')
    setLogs(['[preflight] Initiating system check...'])
    const steps = [
      '[preflight] Checking lock files...',
      '[preflight] Git rebase status: clean',
      '[preflight] Shell hook status: operational',
      '[preflight] Framework guard: nominal',
      '[preflight] All checks passed ✓',
    ]
    steps.forEach((step, i) => {
      setTimeout(() => {
        setLogs(prev => [...prev, step])
        if (i === steps.length - 1) {
          setStatus('pass')
        }
      }, (i + 1) * 600)
    })
  }, [])

  const simulateFail = useCallback(() => {
    setStatus('running')
    setLogs(['[preflight] Initiating system check...'])
    const steps = [
      '[preflight] Checking lock files...',
      '[preflight] ERROR: .git/rebase-apply/ detected!',
      '[preflight] Git rebase status: LOCKED',
      '[preflight] Shell hook: blocked by lock',
      '[preflight] Framework guard: BLOCKED',
      '[preflight] System deadlock detected ✗',
    ]
    steps.forEach((step, i) => {
      setTimeout(() => {
        setLogs(prev => [...prev, step])
        if (i === steps.length - 1) {
          setStatus('fail')
        }
      }, (i + 1) * 500)
    })
  }, [])

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <SectionLabel number="SYS" label="Error Handler" color={COLORS.primary} />
      <div className="mb-6">
        <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
          Impeccable Error Fix <span className="text-amber-500">Handler</span>
        </h2>
        <p className="text-muted-foreground text-sm">
          Three-tier resilience system: Prevention, Detection, Recovery
        </p>
        <CreationMethodology steps={['Detect', 'Diagnose', 'Isolate', 'Recover', 'Validate']} color={COLORS.primary} />
      </div>

      {/* Preflight controls */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button
          onClick={runPreflight}
          disabled={status === 'running'}
          className="bg-amber-600 hover:bg-amber-700 text-white font-mono text-xs tracking-wider rounded-none"
        >
          {status === 'running' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
          RUN PREFLIGHT
        </Button>
        <Button
          onClick={simulateFail}
          disabled={status === 'running'}
          variant="outline"
          className="font-mono text-xs tracking-wider rounded-none border-amber-600/25 text-amber-400 hover:bg-amber-500/8"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          SIMULATE FAILURE
        </Button>
        {status !== 'idle' && (
          <Button
            onClick={() => { setStatus('idle'); setLogs([]) }}
            variant="ghost"
            className="font-mono text-xs tracking-wider text-muted-foreground"
          >
            RESET
          </Button>
        )}
      </div>

      {/* Status indicator */}
      {status !== 'idle' && (
        <div className="mb-4 flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${
            status === 'running' ? 'bg-amber-400 animate-pulse' :
            status === 'pass' ? 'bg-emerald-400' :
            'bg-rose-500 animate-pulse'
          }`} />
          <span className="text-sm font-mono" style={{
            color: status === 'running' ? '#FBBF24' : status === 'pass' ? '#34D399' : '#EF4444'
          }}>
            {status === 'running' ? 'Running preflight checks...' :
             status === 'pass' ? 'All systems nominal' :
             'Deadlock detected — intervention required'}
          </span>
        </div>
      )}

      {/* Terminal output */}
      <div className="bg-[#080706] border border-amber-600/20 rounded-lg p-4 font-mono text-xs min-h-[200px] max-h-[300px] overflow-y-auto">
        {logs.length === 0 ? (
          <p className="text-muted-foreground/30">$ awaiting command...</p>
        ) : (
          logs.map((log, i) => (
            <div key={i} className={`mb-1 ${log.includes('ERROR') || log.includes('BLOCKED') || log.includes('✗') ? 'text-amber-400' : log.includes('✓') ? 'text-emerald-400' : 'text-amber-300/60'}`}>
              {log}
            </div>
          ))
        )}
      </div>

      {/* Proxy comparison */}
      <div className="mt-10">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-400" />
          Proxy Fit Score Overview
        </h3>
        <div className="space-y-3">
          {PROXY_DATA.map((proxy) => {
            const Icon = proxy.icon
            const color = proxy.fitScore >= 80 ? COLORS.emerald : proxy.fitScore >= 50 ? COLORS.amber : COLORS.primary
            return (
              <div key={proxy.id} className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0 text-muted-foreground/50" />
                <span className="text-sm w-36 shrink-0 font-medium">{proxy.name}</span>
                <div className="flex-1 h-6 bg-muted/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${proxy.fitScore}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                    className="h-full rounded-full flex items-center justify-end pr-2"
                    style={{ backgroundColor: `${color}25` }}
                  >
                    <span className="text-[10px] font-bold" style={{ color }}>{proxy.fitScore}%</span>
                  </motion.div>
                </div>
                <span className="text-xs text-muted-foreground/50 w-28 shrink-0 text-right">{proxy.latencyImpact}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// =============================================================
// HOME VIEW (assembles all portfolio sections)
// =============================================================

function HomeView({ onNavigate }: { onNavigate: (v: ViewKey) => void }) {
  return (
    <motion.div
      key="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <HeroSection onNavigate={onNavigate} />
      <ServicesSection />
      <WorkSection />
      <JourneySection />
      <ContactSection />
      <Footer />
    </motion.div>
  )
}

// =============================================================
// MAIN PAGE
// =============================================================

export default function PortfolioPage() {
  const [currentView, setCurrentView] = useState<ViewKey>('home')

  const handleNavigate = useCallback((view: ViewKey) => {
    setCurrentView(view)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground noise-overlay">
      <ScrollableNav currentView={currentView} onNavigate={handleNavigate} />

      {/* Spacer for fixed nav height (14 + 8 = 22 -> ~5.5rem) */}
      <div className="h-[88px]" />

      <main>
        <AnimatePresence mode="wait">
          {currentView === 'home' && <HomeView key="home" onNavigate={handleNavigate} />}
          {currentView === 'error-handler' && (
            <motion.div key="error-handler" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <ErrorHandlerDemo />
            </motion.div>
          )}
          {currentView === 'research' && <ResearchReportView key="research" onSwitchView={handleNavigate} />}
          {currentView === 'audit' && <AuditView key="audit" onSwitchView={handleNavigate} />}
          {currentView === 'frontend-design' && <FrontendDesignView key="frontend-design" onSwitchView={handleNavigate} />}
          {currentView === 'proxy-discussion' && <ProxyDiscussionView key="proxy-discussion" onSwitchView={handleNavigate} />}
          {currentView === 'brutalist' && <HomeView key="brutalist" onNavigate={handleNavigate} />}
          {currentView === 'organic' && <HomeView key="organic" onNavigate={handleNavigate} />}
          {currentView === 'cyberpunk' && <HomeView key="cyberpunk" onNavigate={handleNavigate} />}
        </AnimatePresence>
      </main>
    </div>
  )
}
