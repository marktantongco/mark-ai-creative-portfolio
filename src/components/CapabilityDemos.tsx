'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  X, ExternalLink, Github, ChevronRight, Play,
  Sparkles, Code2, Palette, Zap, BarChart3, Shield,
  Terminal, Layers, Eye, RefreshCw, CheckCircle2,
} from 'lucide-react'

// =============================================================
// TYPES
// =============================================================

interface CapabilityDemoProps {
  isOpen: boolean
  onClose: () => void
  service: {
    id: string
    label: string
    title: string
    subtitle: string
    color: string
    description: string
    tags: string[]
    image: string
    github: string
    repo: string
  }
}

// =============================================================
// CAPABILITY DEMO MODAL
// =============================================================

export function CapabilityDemoModal({ isOpen, onClose, service }: CapabilityDemoProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.25, 0.4, 0.25, 1] }}
            className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl border bg-[#0f0e0c] shadow-2xl"
            style={{ borderColor: `${service.color}25` }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center bg-black/60 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white/70" />
            </button>

            {/* Hero image */}
            <div className="relative h-48 md:h-64 overflow-hidden">
              <Image
                src={service.image}
                alt={`${service.title} preview`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 896px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f0e0c] via-[#0f0e0c]/40 to-transparent" />

              {/* Title overlay */}
              <div className="absolute bottom-4 left-6 right-16">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: `${service.color}20`, color: service.color }}
                  >
                    {service.id}
                  </div>
                  <span className="text-xs font-mono tracking-[0.2em] uppercase" style={{ color: `${service.color}CC` }}>
                    {service.label}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight">{service.title}</h2>
                <p className="text-sm font-mono" style={{ color: service.color }}>{service.subtitle}</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8">
              {/* Description + links */}
              <p className="text-muted-foreground leading-relaxed mb-4">{service.description}</p>

              <div className="flex flex-wrap gap-3 mb-6">
                {service.tags.map((tag) => (
                  <span key={tag} className="text-[10px] font-mono px-2.5 py-1 rounded border border-border/30 text-muted-foreground/60 bg-muted/10">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3 mb-8">
                <a
                  href={service.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all text-sm font-mono"
                  style={{ color: service.color }}
                >
                  <Github className="w-4 h-4" />
                  {service.repo}
                  <ExternalLink className="w-3 h-3 opacity-50" />
                </a>
              </div>

              {/* Interactive Demo Area */}
              <div className="mb-2">
                <div className="flex items-center gap-2 mb-4">
                  <Play className="w-4 h-4" style={{ color: service.color }} />
                  <h3 className="text-sm font-mono tracking-[0.15em] uppercase" style={{ color: `${service.color}CC` }}>
                    Interactive Demo
                  </h3>
                  <div className="flex-1 h-px" style={{ backgroundColor: `${service.color}15` }} />
                </div>

                {/* Render the specific demo based on service */}
                <div
                  className="rounded-lg border overflow-hidden"
                  style={{ borderColor: `${service.color}20`, backgroundColor: `${service.color}05` }}
                >
                  {service.id === '01' && <PromptEngineeringDemo color={service.color} />}
                  {service.id === '02' && <BrandSystemsDemo color={service.color} />}
                  {service.id === '03' && <ProductionCodeDemo color={service.color} />}
                  {service.id === '04' && <ComfyUIPipelinesDemo color={service.color} />}
                  {service.id === '05' && <GeoSeoDemo color={service.color} />}
                  {service.id === '06' && <InsuranceDemo color={service.color} />}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// =============================================================
// DEMO 01: Prompt Engineering — Live prompt builder
// =============================================================

function PromptEngineeringDemo({ color }: { color: string }) {
  const [step, setStep] = useState(0)
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)

  const promptParts = [
    { role: 'system', content: 'You are a senior prompt engineer. Analyze and optimize prompts for Claude API. Output structured JSON.' },
    { role: 'user', content: 'Build a critique loop that refines its own output iteratively.' },
    { role: 'assistant', content: '{"framework": "meta-critique-v2", "iterations": 3, "self_refine": true, "output_format": "structured"}' },
  ]

  const runDemo = useCallback(() => {
    setIsRunning(true)
    setStep(0)
    setOutput('')

    const outputs = [
      '→ Initializing Claude API connection...',
      '→ System prompt: Loaded meta-critique-v2 framework',
      '→ User prompt: Building self-refining critique loop...',
      '→ Iteration 1/3: Generating initial response...',
      '→ Critique: Response lacks specificity (score: 6/10)',
      '→ Iteration 2/3: Refining with critique feedback...',
      '→ Critique: Improved structure + specificity (score: 8/10)',
      '→ Iteration 3/3: Final self-correction pass...',
      '✓ Output quality: 9.4/10 — Structured JSON ready',
      '✓ Token usage: 847 tokens | Latency: 1.2s',
    ]

    outputs.forEach((line, i) => {
      setTimeout(() => {
        setOutput(prev => prev + (prev ? '\n' : '') + line)
        setStep(i + 1)
        if (i === outputs.length - 1) setIsRunning(false)
      }, (i + 1) * 500)
    })
  }, [])

  return (
    <div className="p-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Prompt builder */}
        <div>
          <div className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted-foreground/50 mb-2">Prompt Architecture</div>
          {promptParts.map((part, i) => (
            <div key={i} className="mb-2">
              <div className="text-[9px] font-mono uppercase tracking-wider mb-1" style={{ color: part.role === 'system' ? '#F59E0B' : part.role === 'user' ? '#22D3EE' : '#34D399' }}>
                {part.role}
              </div>
              <div className="text-xs font-mono p-2.5 rounded-md bg-black/40 border border-white/5 text-muted-foreground/80 leading-relaxed">
                {part.content}
              </div>
            </div>
          ))}
        </div>

        {/* Output */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted-foreground/50">Live Output</div>
            {isRunning && <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: color }} /><span className="text-[9px] font-mono" style={{ color }}>Processing...</span></div>}
          </div>
          <div className="text-xs font-mono p-3 rounded-md bg-black/60 border border-white/5 min-h-[200px] max-h-[240px] overflow-y-auto whitespace-pre-wrap">
            {output || <span className="text-muted-foreground/20">Click &quot;Run Demo&quot; to execute...</span>}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={runDemo}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-mono tracking-wider uppercase transition-all disabled:opacity-50"
          style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}30` }}
        >
          <Play className="w-3 h-3" />
          Run Demo
        </button>
        <button
          onClick={() => { setOutput(''); setStep(0) }}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-mono tracking-wider uppercase text-muted-foreground/50 border border-white/10 hover:border-white/20 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Reset
        </button>
        {step >= 10 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
      </div>
    </div>
  )
}

// =============================================================
// DEMO 02: Brand Systems — Live token editor
// =============================================================

function BrandSystemsDemo({ color }: { color: string }) {
  const [tokens, setTokens] = useState({
    primary: '#D4A017',
    accent: '#22D3EE',
    background: '#0f0e0c',
    radius: '8',
    font: 'mono',
  })

  return (
    <div className="p-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Token controls */}
        <div>
          <div className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted-foreground/50 mb-3">Design Tokens</div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-[10px] font-mono w-20 text-muted-foreground/60">Primary</label>
              <input
                type="color"
                value={tokens.primary}
                onChange={(e) => setTokens({ ...tokens, primary: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
              />
              <span className="text-xs font-mono text-muted-foreground">{tokens.primary}</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-[10px] font-mono w-20 text-muted-foreground/60">Accent</label>
              <input
                type="color"
                value={tokens.accent}
                onChange={(e) => setTokens({ ...tokens, accent: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
              />
              <span className="text-xs font-mono text-muted-foreground">{tokens.accent}</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-[10px] font-mono w-20 text-muted-foreground/60">Background</label>
              <input
                type="color"
                value={tokens.background}
                onChange={(e) => setTokens({ ...tokens, background: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
              />
              <span className="text-xs font-mono text-muted-foreground">{tokens.background}</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-[10px] font-mono w-20 text-muted-foreground/60">Radius</label>
              <input
                type="range"
                min="0"
                max="24"
                value={tokens.radius}
                onChange={(e) => setTokens({ ...tokens, radius: e.target.value })}
                className="flex-1"
              />
              <span className="text-xs font-mono text-muted-foreground w-8">{tokens.radius}px</span>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-[10px] font-mono w-20 text-muted-foreground/60">Font</label>
              <select
                value={tokens.font}
                onChange={(e) => setTokens({ ...tokens, font: e.target.value })}
                className="text-xs font-mono px-2 py-1 rounded bg-black/40 border border-white/10 text-muted-foreground"
              >
                <option value="mono">Monospace</option>
                <option value="sans">Sans-serif</option>
                <option value="serif">Serif</option>
              </select>
            </div>
          </div>

          {/* Generated CSS */}
          <div className="mt-4">
            <div className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted-foreground/50 mb-2">Generated CSS</div>
            <div className="text-[10px] font-mono p-3 rounded-md bg-black/40 border border-white/5 text-muted-foreground/70 leading-relaxed">
              :root {'{'}
              <br />
              &nbsp;&nbsp;--primary: {tokens.primary};<br />
              &nbsp;&nbsp;--accent: {tokens.accent};<br />
              &nbsp;&nbsp;--bg: {tokens.background};<br />
              &nbsp;&nbsp;--radius: {tokens.radius}px;<br />
              &nbsp;&nbsp;--font: {tokens.font};<br />
              {'}'}
            </div>
          </div>
        </div>

        {/* Live preview */}
        <div>
          <div className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted-foreground/50 mb-3">Live Preview</div>
          <div
            className="p-4 border border-white/10"
            style={{ backgroundColor: tokens.background, borderRadius: `${tokens.radius}px`, fontFamily: tokens.font }}
          >
            <div className="text-lg font-bold mb-2" style={{ color: tokens.primary }}>Brand Title</div>
            <div className="text-sm mb-3" style={{ color: `${tokens.primary}80` }}>Subtitle with accent color</div>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 text-xs font-mono tracking-wider uppercase"
                style={{ backgroundColor: tokens.primary, color: tokens.background, borderRadius: `${tokens.radius}px` }}
              >
                Primary CTA
              </button>
              <button
                className="px-4 py-2 text-xs font-mono tracking-wider uppercase border"
                style={{ borderColor: tokens.accent, color: tokens.accent, borderRadius: `${tokens.radius}px` }}
              >
                Secondary
              </button>
            </div>
            <div className="mt-3 flex gap-2">
              {['Tag 1', 'Tag 2', 'Tag 3'].map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] px-2 py-0.5 border"
                  style={{ borderColor: `${tokens.accent}40`, color: tokens.accent, borderRadius: `${Math.max(2, parseInt(tokens.radius) - 4)}px` }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// =============================================================
// DEMO 03: Production Code — Animation playground
// =============================================================

function ProductionCodeDemo({ color }: { color: string }) {
  const [animType, setAnimType] = useState<'gsap' | 'fm' | 'threejs'>('gsap')
  const [isAnimating, setIsAnimating] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  const triggerAnim = useCallback(() => {
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 1500)
  }, [])

  const animConfigs = {
    gsap: { name: 'GSAP ScrollTrigger', desc: 'Cinematic scroll-driven timeline choreography', icon: Terminal },
    fm: { name: 'Framer Motion', desc: 'Spring physics, layout transitions, AnimatePresence', icon: Layers },
    threejs: { name: 'Three.js / R3F', desc: '3D WebGL scenes, particle systems, shaders', icon: Eye },
  }

  return (
    <div className="p-5">
      {/* Animation selector */}
      <div className="flex gap-2 mb-4">
        {(['gsap', 'fm', 'threejs'] as const).map((type) => {
          const cfg = animConfigs[type]
          const Icon = cfg.icon
          return (
            <button
              key={type}
              onClick={() => setAnimType(type)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-xs font-mono tracking-wider transition-all"
              style={{
                backgroundColor: animType === type ? `${color}20` : 'transparent',
                color: animType === type ? color : 'rgba(255,255,255,0.4)',
                border: `1px solid ${animType === type ? `${color}40` : 'rgba(255,255,255,0.1)'}`,
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {cfg.name}
            </button>
          )
        })}
      </div>

      <div className="text-[10px] font-mono text-muted-foreground/50 mb-4">{animConfigs[animType].desc}</div>

      {/* Animation playground */}
      <div className="flex items-center justify-center h-40 rounded-md bg-black/40 border border-white/5 mb-4 overflow-hidden">
        {animType === 'gsap' && (
          <div className="flex gap-3">
            {['#D4A017', '#22D3EE', '#F59E0B', '#A78BFA', '#34D399'].map((c, i) => (
              <motion.div
                key={c}
                ref={i === 0 ? boxRef : undefined}
                animate={isAnimating ? {
                  y: [0, -30, 0],
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                } : {}}
                transition={{ duration: 1.2, delay: i * 0.15, ease: 'easeInOut' }}
                className="w-10 h-10 rounded-md"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        )}
        {animType === 'fm' && (
          <motion.div
            animate={isAnimating ? {
              x: [0, 100, -100, 0],
              y: [0, -50, 0],
              scale: [1, 1.3, 0.8, 1],
              borderRadius: ['8px', '50%', '8px'],
            } : { scale: 1 }}
            transition={{ duration: 1.4, ease: 'easeInOut' }}
            className="w-16 h-16"
            style={{ backgroundColor: color }}
          />
        )}
        {animType === 'threejs' && (
          <div className="relative">
            <motion.div
              animate={isAnimating ? { rotateY: 360, rotateX: 180 } : {}}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              className="w-20 h-20 border-2 rounded-md"
              style={{ borderColor: color, transformStyle: 'preserve-3d' }}
            >
              <div className="absolute inset-2 border rounded-sm" style={{ borderColor: `${color}50`, transform: 'translateZ(10px)' }} />
              <div className="absolute inset-4 border rounded-sm" style={{ borderColor: `${color}30`, transform: 'translateZ(20px)' }} />
            </motion.div>
          </div>
        )}
      </div>

      {/* Code output */}
      <div className="text-[10px] font-mono p-3 rounded-md bg-black/40 border border-white/5 text-muted-foreground/60 leading-relaxed mb-3">
        {animType === 'gsap' && `gsap.to('.elements', { y: -30, rotate: 360, stagger: 0.15, ease: 'power3.out' })`}
        {animType === 'fm' && `<motion.div animate={{ x: [0, 100, -100, 0], scale: [1, 1.3, 1] }} />`}
        {animType === 'threejs' && `<mesh rotation={[frame*0.01, frame*0.02, 0]}><icosahedronGeometry />`}
      </div>

      <button
        onClick={triggerAnim}
        className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-mono tracking-wider uppercase transition-all"
        style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}30` }}
      >
        <Play className="w-3 h-3" />
        Play Animation
      </button>
    </div>
  )
}

// =============================================================
// DEMO 04: ComfyUI Pipelines — Node workflow simulator
// =============================================================

function ComfyUIPipelinesDemo({ color }: { color: string }) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState('idle')

  const runPipeline = useCallback(() => {
    setIsProcessing(true)
    setProgress(0)
    const stages = [
      { name: 'Loading Flux Model...', pct: 15 },
      { name: 'Applying LoRA Weights...', pct: 30 },
      { name: 'Processing Prompt Nodes...', pct: 50 },
      { name: 'Running ACES Color Science...', pct: 70 },
      { name: 'Applying Photography AI...', pct: 85 },
      { name: 'Final Composition...', pct: 95 },
      { name: 'Complete!', pct: 100 },
    ]

    stages.forEach((s, i) => {
      setTimeout(() => {
        setStage(s.name)
        setProgress(s.pct)
        if (i === stages.length - 1) {
          setTimeout(() => setIsProcessing(false), 800)
        }
      }, (i + 1) * 700)
    })
  }, [])

  const nodes = [
    { label: 'Prompt Input', icon: Terminal, status: progress > 0 ? 'active' : 'idle' },
    { label: 'Flux Model', icon: Zap, status: progress > 15 ? 'active' : progress > 0 ? 'running' : 'idle' },
    { label: 'LoRA Weights', icon: Layers, status: progress > 30 ? 'active' : progress > 15 ? 'running' : 'idle' },
    { label: 'ACES Color', icon: Palette, status: progress > 70 ? 'active' : progress > 50 ? 'running' : 'idle' },
    { label: 'Photo AI', icon: Eye, status: progress > 85 ? 'active' : progress > 70 ? 'running' : 'idle' },
    { label: 'Output', icon: Sparkles, status: progress >= 100 ? 'active' : progress > 85 ? 'running' : 'idle' },
  ]

  return (
    <div className="p-5">
      {/* Node pipeline visualization */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-2">
        {nodes.map((node, i) => {
          const Icon = node.icon
          return (
            <React.Fragment key={node.label}>
              <div
                className="shrink-0 flex flex-col items-center gap-1.5 px-3 py-2 rounded-md border transition-all"
                style={{
                  backgroundColor: node.status === 'running' ? `${color}15` : node.status === 'active' ? `${color}25` : 'transparent',
                  borderColor: node.status === 'running' ? `${color}40` : node.status === 'active' ? color : 'rgba(255,255,255,0.1)',
                }}
              >
                <Icon className="w-4 h-4" style={{ color: node.status === 'idle' ? 'rgba(255,255,255,0.2)' : color }} />
                <span className="text-[8px] font-mono tracking-wider whitespace-nowrap" style={{ color: node.status === 'idle' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)' }}>
                  {node.label}
                </span>
                {node.status === 'running' && (
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: color }} />
                )}
                {node.status === 'active' && (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                )}
              </div>
              {i < nodes.length - 1 && (
                <ChevronRight className="w-3 h-3 shrink-0" style={{ color: node.status !== 'idle' ? color : 'rgba(255,255,255,0.1)' }} />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-mono text-muted-foreground/50">{stage === 'idle' ? 'Pipeline ready' : stage}</span>
          <span className="text-[10px] font-mono" style={{ color }}>{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-black/40 border border-white/5 overflow-hidden">
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={runPipeline}
          disabled={isProcessing}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-mono tracking-wider uppercase transition-all disabled:opacity-50"
          style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}30` }}
        >
          <Play className="w-3 h-3" />
          Run Pipeline
        </button>
        <button
          onClick={() => { setProgress(0); setStage('idle') }}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-mono tracking-wider uppercase text-muted-foreground/50 border border-white/10 hover:border-white/20 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Reset
        </button>
      </div>
    </div>
  )
}

// =============================================================
// DEMO 05: GEO & SEO — Citation tracker
// =============================================================

function GeoSeoDemo({ color }: { color: string }) {
  const [isScanning, setIsScanning] = useState(false)
  const [results, setResults] = useState<Array<{ engine: string; cited: boolean; position: number }>>([])

  const engines = [
    { name: 'Claude', icon: '🤖' },
    { name: 'ChatGPT', icon: '💬' },
    { name: 'Perplexity', icon: '🔍' },
    { name: 'Gemini', icon: '✨' },
    { name: 'Bing AI', icon: '🔷' },
  ]

  const runScan = useCallback(() => {
    setIsScanning(true)
    setResults([])

    engines.forEach((engine, i) => {
      setTimeout(() => {
        const cited = Math.random() > 0.3
        const position = cited ? Math.floor(Math.random() * 5) + 1 : 0
        setResults(prev => [...prev, { engine: engine.name, cited, position }])
        if (i === engines.length - 1) {
          setTimeout(() => setIsScanning(false), 500)
        }
      }, (i + 1) * 600)
    })
  }, [])

  const citedCount = results.filter(r => r.cited).length
  const score = results.length > 0 ? Math.round((citedCount / results.length) * 100) : 0

  return (
    <div className="p-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Engine results */}
        <div>
          <div className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted-foreground/50 mb-3">AI Engine Citation Scan</div>
          <div className="space-y-2">
            {engines.map((engine) => {
              const result = results.find(r => r.engine === engine.name)
              return (
                <div key={engine.name} className="flex items-center gap-3 p-2 rounded-md bg-black/20 border border-white/5">
                  <span className="text-sm">{engine.icon}</span>
                  <span className="text-xs font-mono flex-1 text-muted-foreground">{engine.name}</span>
                  {isScanning && !result && <div className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${color}40`, borderTopColor: 'transparent' }} />}
                  {result && result.cited && (
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                      Cited #{result.position}
                    </span>
                  )}
                  {result && !result.cited && (
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                      Not found
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Score */}
        <div>
          <div className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted-foreground/50 mb-3">GEO Authority Score</div>
          <div className="flex flex-col items-center justify-center p-6 rounded-md bg-black/20 border border-white/5">
            <div className="text-5xl font-black mb-1" style={{ color }}>
              {score > 0 ? `${score}%` : '—'}
            </div>
            <div className="text-[10px] font-mono text-muted-foreground/50 tracking-wider uppercase mb-4">
              {score >= 80 ? 'Excellent Authority' : score >= 60 ? 'Good Authority' : score >= 40 ? 'Moderate Authority' : score > 0 ? 'Needs Work' : 'Run Scan'}
            </div>
            <div className="w-full h-2 rounded-full bg-black/40 border border-white/5 overflow-hidden">
              <motion.div
                animate={{ width: `${score}%` }}
                transition={{ duration: 0.5 }}
                className="h-full rounded-full"
                style={{ backgroundColor: color }}
              />
            </div>

            {/* JSON-LD preview */}
            <div className="mt-4 w-full text-[9px] font-mono p-2 rounded bg-black/40 border border-white/5 text-muted-foreground/40 leading-relaxed">
              {'{'}"@type":"Organization","name":"powerUP",
              "citation":{citedCount} engines{'}'}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={runScan}
          disabled={isScanning}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-mono tracking-wider uppercase transition-all disabled:opacity-50"
          style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}30` }}
        >
          <BarChart3 className="w-3 h-3" />
          Run Citation Scan
        </button>
        <button
          onClick={() => { setResults([]) }}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-mono tracking-wider uppercase text-muted-foreground/50 border border-white/10 hover:border-white/20 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Reset
        </button>
      </div>
    </div>
  )
}

// =============================================================
// DEMO 06: Insurance — Plan comparison calculator
// =============================================================

function InsuranceDemo({ color }: { color: string }) {
  const [age, setAge] = useState(30)
  const [coverage, setCoverage] = useState<'basic' | 'premium' | 'lifetime'>('premium')
  const [showQuote, setShowQuote] = useState(false)

  const plans = {
    basic: { name: 'FlexiShield Basic', annual: 25000, coverage: '₱500K', enhancer: false },
    premium: { name: 'FlexiShield Premium', annual: 45000, coverage: '₱1.5M', enhancer: true },
    lifetime: { name: 'Blue Royale', annual: 75000, coverage: '₱5M Lifetime', enhancer: true },
  }

  const selectedPlan = plans[coverage]
  const ageMultiplier = age > 50 ? 1.4 : age > 40 ? 1.2 : age > 30 ? 1.0 : 0.9
  const calculatedPremium = Math.round(selectedPlan.annual * ageMultiplier)

  return (
    <div className="p-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Calculator inputs */}
        <div>
          <div className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted-foreground/50 mb-3">Coverage Calculator</div>

          {/* Age slider */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-mono text-muted-foreground/60">Age</label>
              <span className="text-xs font-mono" style={{ color }}>{age}</span>
            </div>
            <input
              type="range"
              min="18"
              max="70"
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Plan selector */}
          <div className="space-y-2 mb-4">
            {(['basic', 'premium', 'lifetime'] as const).map((plan) => (
              <button
                key={plan}
                onClick={() => setCoverage(plan)}
                className="w-full flex items-center gap-3 p-3 rounded-md border text-left transition-all"
                style={{
                  backgroundColor: coverage === plan ? `${color}15` : 'transparent',
                  borderColor: coverage === plan ? `${color}40` : 'rgba(255,255,255,0.1)',
                }}
              >
                <Shield className="w-4 h-4" style={{ color: coverage === plan ? color : 'rgba(255,255,255,0.3)' }} />
                <div className="flex-1">
                  <div className="text-xs font-mono font-medium" style={{ color: coverage === plan ? color : 'rgba(255,255,255,0.6)' }}>
                    {plans[plan].name}
                  </div>
                  <div className="text-[9px] font-mono text-muted-foreground/40">
                    Coverage: {plans[plan].coverage} {plans[plan].enhancer ? '· HEV Enhancer' : ''}
                  </div>
                </div>
                {coverage === plan && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* Quote output */}
        <div>
          <div className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted-foreground/50 mb-3">Estimated Quote</div>
          <div className="p-5 rounded-md bg-black/20 border border-white/5">
            <div className="text-sm font-mono mb-1" style={{ color }}>{selectedPlan.name}</div>
            <div className="text-3xl font-black mb-1" style={{ color }}>
              ₱{calculatedPremium.toLocaleString()}
            </div>
            <div className="text-[10px] font-mono text-muted-foreground/50 mb-4">per year (age {age}, {ageMultiplier}x multiplier)</div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Coverage up to {selectedPlan.coverage}
              </div>
              {selectedPlan.enhancer && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  HEV Enhancer included
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Pacific Cross network access
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Annual health check-up
              </div>
            </div>

            <button
              onClick={() => setShowQuote(true)}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-xs font-mono tracking-wider uppercase"
              style={{ backgroundColor: color, color: '#0f0e0c' }}
            >
              <Sparkles className="w-3 h-3" />
              Get Full Quote
            </button>
            {showQuote && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-emerald-400 text-center"
              >
                ✓ Quote request submitted — Mark will contact you within 24hrs
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
