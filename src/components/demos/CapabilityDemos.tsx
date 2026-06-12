'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Github, Star } from 'lucide-react'

// =============================================================
// TYPES
// =============================================================

export interface CapabilityDemoData {
  id: string
  title: string
  subtitle: string
  color: string
  thumbnail: string
  repos: { name: string; url: string; stars: string; description: string }[]
}

// =============================================================
// MODAL CONTAINER
// =============================================================

export function CapabilityDemoModal({
  isOpen,
  onClose,
  demo,
  children,
}: {
  isOpen: boolean
  onClose: () => void
  demo: CapabilityDemoData
  children: React.ReactNode
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl border border-border/30 bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between p-4 md:p-6 border-b border-border/20 bg-card/95 backdrop-blur-md">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="inline-block w-2 h-2 rounded-full"
                    style={{ backgroundColor: demo.color, boxShadow: `0 0 8px ${demo.color}60` }}
                  />
                  <span className="text-xs font-mono tracking-wider uppercase" style={{ color: demo.color }}>
                    Interactive Demo
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-black">{demo.title}</h2>
                <p className="text-xs font-mono" style={{ color: demo.color }}>{demo.subtitle}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg border border-border/30 hover:bg-muted/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Demo content area */}
            <div className="p-4 md:p-6">
              {children}
            </div>

            {/* GitHub repos footer */}
            {demo.repos.length > 0 && (
              <div className="border-t border-border/20 p-4 md:p-6">
                <h4 className="text-xs font-mono tracking-wider uppercase text-muted-foreground/60 mb-3">
                  Reference Repositories
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {demo.repos.map((repo) => (
                    <a
                      key={repo.name}
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-3 p-3 rounded-lg border border-border/20 hover:border-amber-600/25 hover:bg-amber-500/5 transition-all duration-200"
                    >
                      <Github className="w-4 h-4 mt-0.5 text-muted-foreground/40 group-hover:text-amber-400 transition-colors shrink-0" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium group-hover:text-amber-400 transition-colors truncate">
                            {repo.name}
                          </span>
                          {repo.stars && (
                            <span className="flex items-center gap-0.5 text-[10px] font-mono text-amber-500/70 shrink-0">
                              <Star className="w-3 h-3" />
                              {repo.stars}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground/60 mt-0.5 line-clamp-2">{repo.description}</p>
                      </div>
                      <ExternalLink className="w-3 h-3 mt-0.5 text-muted-foreground/20 group-hover:text-amber-400 transition-colors shrink-0 ml-auto" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// =============================================================
// DEMO 1: PROMPT ENGINEERING — Interactive Prompt Builder
// =============================================================

export function PromptEngineeringDemo({ color }: { color: string }) {
  const [selectedRole, setSelectedRole] = useState(0)
  const [selectedStructure, setSelectedStructure] = useState(0)
  const [temperature, setTemperature] = useState(0.7)
  const [isGenerating, setIsGenerating] = useState(false)
  const [output, setOutput] = useState('')

  const roles = [
    { name: 'System Architect', icon: '🏗️', desc: 'Designs system-level prompt architectures' },
    { name: 'Code Reviewer', icon: '🔍', desc: 'Analyzes code with structured critique loops' },
    { name: 'Content Strategist', icon: '📝', desc: 'Generates brand-aligned content frameworks' },
    { name: 'Data Analyst', icon: '📊', desc: 'Extracts insights with structured outputs' },
  ]

  const structures = [
    { name: 'Chain-of-Thought', template: 'Step-by-step reasoning with intermediate conclusions' },
    { name: 'Few-Shot', template: 'Example-driven with 3+ demonstration pairs' },
    { name: 'Structured Output', template: 'JSON schema with type constraints and validation' },
    { name: 'Meta-Prompt', template: 'Self-improving prompt that refines its own instructions' },
  ]

  const generateOutput = useCallback(() => {
    setIsGenerating(true)
    setOutput('')
    const lines = [
      `// Prompt Architecture: ${roles[selectedRole].name}`,
      `// Strategy: ${structures[selectedStructure].name}`,
      `// Temperature: ${temperature.toFixed(1)}`,
      '',
      '{',
      `  "role": "${roles[selectedRole].name.toLowerCase().replace(/ /g, '_')}",`,
      `  "strategy": "${structures[selectedStructure].name.toLowerCase().replace(/-/g, '_')}",`,
      `  "temperature": ${temperature.toFixed(1)},`,
      '  "instructions": [',
      `    "Apply ${structures[selectedStructure].template.toLowerCase()}",`,
      '    "Maintain consistency with system constraints",',
      '    "Validate output against schema",',
      '    "Iterate through critique loop",',
      '  ],',
      '  "constraints": {',
      '    "max_tokens": 4096,',
      `    "response_format": "${structures[selectedStructure].name === 'Structured Output' ? 'json_object' : 'text'}",`,
      '    "safety": "enabled"',
      '  }',
      '}',
    ]
    let i = 0
    const interval = setInterval(() => {
      if (i < lines.length) {
        setOutput((prev) => prev + lines[i] + '\n')
        i++
      } else {
        clearInterval(interval)
        setIsGenerating(false)
      }
    }, 80)
  }, [selectedRole, selectedStructure, temperature, roles, structures])

  return (
    <div className="space-y-6">
      {/* Prompt Configuration Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Role Selection */}
        <div className="space-y-2">
          <label className="text-xs font-mono tracking-wider uppercase text-muted-foreground/60">
            Agent Role
          </label>
          <div className="grid grid-cols-2 gap-2">
            {roles.map((role, i) => (
              <button
                key={role.name}
                onClick={() => setSelectedRole(i)}
                className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                  selectedRole === i
                    ? 'border-amber-500/50 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                    : 'border-border/30 hover:border-border/50 bg-card/50'
                }`}
              >
                <div className="text-lg mb-1">{role.icon}</div>
                <div className="text-xs font-medium">{role.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Structure Selection */}
        <div className="space-y-2">
          <label className="text-xs font-mono tracking-wider uppercase text-muted-foreground/60">
            Prompt Strategy
          </label>
          <div className="space-y-2">
            {structures.map((struct, i) => (
              <button
                key={struct.name}
                onClick={() => setSelectedStructure(i)}
                className={`w-full p-2.5 rounded-lg border text-left transition-all duration-200 ${
                  selectedStructure === i
                    ? 'border-amber-500/50 bg-amber-500/10'
                    : 'border-border/30 hover:border-border/50 bg-card/50'
                }`}
              >
                <div className="text-xs font-medium">{struct.name}</div>
                <div className="text-[10px] text-muted-foreground/50 mt-0.5">{struct.template}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Temperature Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono tracking-wider uppercase text-muted-foreground/60">
            Temperature
          </label>
          <span className="text-sm font-mono" style={{ color }}>{temperature.toFixed(1)}</span>
        </div>
        <input
          type="range"
          min="0"
          max="1.5"
          step="0.1"
          value={temperature}
          onChange={(e) => setTemperature(parseFloat(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${color} ${((temperature) / 1.5) * 100}%, hsl(var(--border)) ${((temperature) / 1.5) * 100}%)`,
          }}
        />
        <div className="flex justify-between text-[9px] font-mono text-muted-foreground/30">
          <span>Precise</span>
          <span>Balanced</span>
          <span>Creative</span>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={generateOutput}
        disabled={isGenerating}
        className="w-full py-3 rounded-lg font-mono text-sm tracking-wider uppercase transition-all duration-200"
        style={{
          backgroundColor: isGenerating ? `${color}20` : `${color}15`,
          border: `1px solid ${color}40`,
          color: color,
        }}
      >
        {isGenerating ? 'Generating...' : 'Generate Prompt Architecture'}
      </button>

      {/* Output */}
      {output && (
        <div
          className="rounded-lg border border-border/30 bg-black/30 p-4 font-mono text-xs leading-relaxed overflow-x-auto"
          style={{ color: `${color}CC` }}
        >
          <pre className="whitespace-pre-wrap">{output}</pre>
          {isGenerating && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              style={{ color }}
            >
              |
            </motion.span>
          )}
        </div>
      )}
    </div>
  )
}

// =============================================================
// DEMO 2: BRAND SYSTEMS — Live Design Token Editor
// =============================================================

export function BrandSystemsDemo({ color }: { color: string }) {
  const [tokens, setTokens] = useState({
    primary: '#D4A017',
    surface: '#1a1a1a',
    text: '#f5f5f5',
    radius: '8',
    spacing: '16',
    fontWeight: '700',
  })

  const [activeTab, setActiveTab] = useState<'colors' | 'spacing' | 'preview'>('colors')

  const updateToken = (key: string, value: string) => {
    setTokens((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 rounded-lg bg-black/20">
        {(['colors', 'spacing', 'preview'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-mono tracking-wider uppercase rounded-md transition-all ${
              activeTab === tab
                ? 'bg-amber-500/20 text-amber-400'
                : 'text-muted-foreground/50 hover:text-muted-foreground/80'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Colors Tab */}
      {activeTab === 'colors' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: 'primary', label: 'Primary' },
            { key: 'surface', label: 'Surface' },
            { key: 'text', label: 'Text' },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-2">
              <label className="text-xs font-mono tracking-wider uppercase text-muted-foreground/60">
                {label}
              </label>
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 rounded-lg border border-border/30 shrink-0"
                  style={{ backgroundColor: tokens[key as keyof typeof tokens] }}
                />
                <input
                  type="text"
                  value={tokens[key as keyof typeof tokens]}
                  onChange={(e) => updateToken(key, e.target.value)}
                  className="w-full px-2 py-1.5 text-xs font-mono rounded border border-border/30 bg-black/20"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Spacing Tab */}
      {activeTab === 'spacing' && (
        <div className="space-y-4">
          {[
            { key: 'radius', label: 'Border Radius', min: 0, max: 24, unit: 'px' },
            { key: 'spacing', label: 'Base Spacing', min: 4, max: 32, unit: 'px' },
            { key: 'fontWeight', label: 'Heading Weight', min: 400, max: 900, unit: '' },
          ].map(({ key, label, min, max, unit }) => (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono tracking-wider uppercase text-muted-foreground/60">
                  {label}
                </label>
                <span className="text-xs font-mono" style={{ color }}>
                  {tokens[key as keyof typeof tokens]}{unit}
                </span>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                value={tokens[key as keyof typeof tokens]}
                onChange={(e) => updateToken(key, e.target.value)}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${color} ${((parseInt(tokens[key as keyof typeof tokens]) - min) / (max - min)) * 100}%, hsl(var(--border)) ${((parseInt(tokens[key as keyof typeof tokens]) - min) / (max - min)) * 100}%)`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Preview Tab */}
      {activeTab === 'preview' && (
        <div
          className="rounded-xl border border-border/30 overflow-hidden"
          style={{ backgroundColor: tokens.surface }}
        >
          {/* Mini UI Preview */}
          <div className="p-4 space-y-3">
            <div
              className="h-2 rounded-full w-1/3"
              style={{ backgroundColor: tokens.primary, borderRadius: `${tokens.radius}px` }}
            />
            <div
              className="text-lg font-bold"
              style={{ color: tokens.text, fontWeight: parseInt(tokens.fontWeight), borderRadius: `${tokens.radius}px` }}
            >
              Brand System Preview
            </div>
            <div className="text-sm opacity-70" style={{ color: tokens.text }}>
              Live token-driven component rendering
            </div>
            <div className="flex gap-2">
              <button
                className="px-3 py-1.5 text-xs font-medium"
                style={{
                  backgroundColor: tokens.primary,
                  color: tokens.surface,
                  borderRadius: `${tokens.radius}px`,
                }}
              >
                Primary CTA
              </button>
              <button
                className="px-3 py-1.5 text-xs font-medium border"
                style={{
                  borderColor: tokens.primary,
                  color: tokens.primary,
                  borderRadius: `${tokens.radius}px`,
                }}
              >
                Secondary
              </button>
            </div>
            <div
              className="p-3 mt-2 border"
              style={{
                borderColor: `${tokens.primary}30`,
                borderRadius: `${tokens.radius * 2}px`,
                padding: `${tokens.spacing}px`,
              }}
            >
              <div className="text-xs font-medium mb-1" style={{ color: tokens.text }}>Card Component</div>
              <div className="text-[10px] opacity-50" style={{ color: tokens.text }}>
                Tokens cascade through every element
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS Output */}
      <div className="rounded-lg border border-border/30 bg-black/30 p-3 font-mono text-[10px] leading-relaxed text-muted-foreground/70">
        <div style={{ color: `${color}99` }}>/* Generated Design Tokens */</div>
        <div>:root {'{'}</div>
        <div>  --color-primary: {tokens.primary};</div>
        <div>  --color-surface: {tokens.surface};</div>
        <div>  --color-text: {tokens.text};</div>
        <div>  --radius-base: {tokens.radius}px;</div>
        <div>  --spacing-base: {tokens.spacing}px;</div>
        <div>  --font-weight-heading: {tokens.fontWeight};</div>
        <div>{'}'}</div>
      </div>
    </div>
  )
}

// =============================================================
// DEMO 3: PRODUCTION CODE — GSAP + Three.js Animation Timeline
// =============================================================

export function ProductionCodeDemo({ color }: { color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeAnim, setActiveAnim] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [timelineProgress, setTimelineProgress] = useState(0)
  const animFrameRef = useRef<number>(0)
  const timeRef = useRef(0)

  const animations = [
    {
      name: 'Particle Field',
      code: `gsap.to(particles, {
  opacity: 1,
  stagger: 0.02,
  duration: 1.2,
  ease: "power3.out"
})`,
    },
    {
      name: 'Scroll Reveal',
      code: `ScrollTrigger.create({
  trigger: element,
  start: "top 80%",
  onEnter: () => gsap.from(element, {
    y: 60, opacity: 0,
    duration: 0.8
  })
})`,
    },
    {
      name: '3D Rotation',
      code: `useFrame((state, delta) => {
  mesh.rotation.x += delta * 0.3
  mesh.rotation.y += delta * 0.5
  shader.uniforms.uTime.value =
    state.clock.elapsedTime
})`,
    },
  ]

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const w = rect.width
    const h = rect.height
    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number }[] = []

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        size: Math.random() * 3 + 1,
        alpha: Math.random() * 0.5 + 0.1,
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, w, h)

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 80) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            const alpha = Math.floor((1 - dist / 80) * 30)
            ctx.strokeStyle = `${color}${alpha.toString(16).padStart(2, '0')}`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      // Draw and update particles
      particles.forEach((p) => {
        if (isPlaying) {
          p.x += p.vx
          p.y += p.vy
          if (p.x < 0 || p.x > w) p.vx *= -1
          if (p.y < 0 || p.y > h) p.vy *= -1
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        const alphaHex = Math.floor(p.alpha * 255).toString(16).padStart(2, '0')
        ctx.fillStyle = `${color}${alphaHex}`
        ctx.fill()
      })

      // Draw 3D wireframe cube in center if activeAnim === 2
      if (activeAnim === 2 && isPlaying) {
        timeRef.current += 0.016
        const cx = w / 2
        const cy = h / 2
        const size = 40
        const time = timeRef.current
        const cos = Math.cos(time)
        const sin = Math.sin(time)

        const cubePoints = [
          [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
          [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
        ]

        const projected = cubePoints.map(([x, y, z]) => {
          const rx = x * cos - z * sin
          const rz = x * sin + z * cos
          const ry = y * Math.cos(time * 0.7) - rz * Math.sin(time * 0.7)
          const scale = 80 / (80 + ry)
          return [cx + rx * size * scale, cy + y * size * scale * Math.cos(time * 0.3)]
        })

        const edges = [
          [0, 1], [1, 2], [2, 3], [3, 0],
          [4, 5], [5, 6], [6, 7], [7, 4],
          [0, 4], [1, 5], [2, 6], [3, 7],
        ]

        edges.forEach(([a, b]) => {
          ctx.beginPath()
          ctx.moveTo(projected[a][0], projected[a][1])
          ctx.lineTo(projected[b][0], projected[b][1])
          ctx.strokeStyle = `${color}80`
          ctx.lineWidth = 1
          ctx.stroke()
        })
      }

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [color, isPlaying, activeAnim])

  // Timeline progress animation
  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      setTimelineProgress((prev) => {
        if (prev >= 100) {
          setIsPlaying(false)
          return 100
        }
        return prev + 1
      })
    }, 30)
    return () => clearInterval(interval)
  }, [isPlaying])

  const handlePlay = () => {
    if (timelineProgress >= 100) setTimelineProgress(0)
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="space-y-4">
      {/* Animation Canvas */}
      <div className="relative rounded-lg border border-border/30 overflow-hidden bg-black/30 aspect-video">
        <canvas ref={canvasRef} className="w-full h-full" />
        {/* Overlay info */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: isPlaying ? '#34D399' : '#FB7185' }}
          />
          <span className="text-[9px] font-mono text-muted-foreground/50">
            {isPlaying ? 'RENDERING' : 'PAUSED'}
          </span>
        </div>
      </div>

      {/* Animation Selector */}
      <div className="grid grid-cols-3 gap-2">
        {animations.map((anim, i) => (
          <button
            key={anim.name}
            onClick={() => { setActiveAnim(i); setTimelineProgress(0) }}
            className={`p-2 rounded-lg border text-center transition-all duration-200 ${
              activeAnim === i
                ? 'border-amber-500/50 bg-amber-500/10'
                : 'border-border/30 hover:border-border/50 bg-card/50'
            }`}
          >
            <div className="text-xs font-medium">{anim.name}</div>
          </button>
        ))}
      </div>

      {/* GSAP Timeline Control */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePlay}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40`, color }}
          >
            {isPlaying ? '||' : '>'}
          </button>
          <div className="flex-1 h-1.5 rounded-full bg-black/30 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: color, width: `${timelineProgress}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-muted-foreground/50 w-8 text-right">
            {Math.floor(timelineProgress)}%
          </span>
        </div>
      </div>

      {/* Code Preview */}
      <div className="rounded-lg border border-border/30 bg-black/30 p-3 font-mono text-[10px] leading-relaxed overflow-x-auto">
        <pre style={{ color: `${color}CC` }}>{animations[activeAnim].code}</pre>
      </div>
    </div>
  )
}

// =============================================================
// DEMO 4: COMFYUI PIPELINES — Node Workflow Builder
// =============================================================

export function ComfyUIPipelinesDemo({ color }: { color: string }) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [pipelineResult, setPipelineResult] = useState<'idle' | 'processing' | 'complete'>('idle')

  const nodes = [
    { id: 'input', type: 'INPUT', label: 'Text Prompt', x: 10, y: 30, color: '#8b5cf6' },
    { id: 'model', type: 'MODEL', label: 'Flux.1 Dev', x: 35, y: 15, color: '#ec4899' },
    { id: 'lora', type: 'LORA', label: 'Photo Realism', x: 35, y: 55, color: '#f59e0b' },
    { id: 'sampler', type: 'SAMPLER', label: 'DPM++ 2M Karras', x: 60, y: 30, color: '#22d3ee' },
    { id: 'decode', type: 'VAE', label: 'VAE Decode', x: 80, y: 30, color: '#34d399' },
    { id: 'output', type: 'OUTPUT', label: 'Save Image', x: 95, y: 30, color: '#fb7185' },
  ]

  const connections = [
    ['input', 'model'],
    ['input', 'lora'],
    ['model', 'sampler'],
    ['lora', 'sampler'],
    ['sampler', 'decode'],
    ['decode', 'output'],
  ]

  const handleRun = () => {
    setPipelineResult('processing')
    setTimeout(() => setPipelineResult('complete'), 2000)
  }

  const nodeDetails: Record<string, { params: { label: string; value: string }[] }> = {
    input: {
      params: [
        { label: 'prompt', value: 'Professional portrait, dramatic lighting, 8k' },
        { label: 'negative', value: 'blurry, low quality, deformed' },
      ],
    },
    model: {
      params: [
        { label: 'model', value: 'flux1-dev-fp8.safetensors' },
        { label: 'dtype', value: 'float8_e4m3fn' },
      ],
    },
    lora: {
      params: [
        { label: 'lora_name', value: 'photo_realism_v2.safetensors' },
        { label: 'strength', value: '0.85' },
      ],
    },
    sampler: {
      params: [
        { label: 'steps', value: '28' },
        { label: 'cfg', value: '3.5' },
        { label: 'scheduler', value: 'karras' },
      ],
    },
    decode: {
      params: [
        { label: 'vae', value: 'ae.safetensors' },
      ],
    },
    output: {
      params: [
        { label: 'filename', value: 'output_001.png' },
        { label: 'format', value: 'PNG' },
      ],
    },
  }

  return (
    <div className="space-y-4">
      {/* Node Graph Visualization */}
      <div className="relative rounded-lg border border-border/30 bg-black/40 aspect-[2/1] overflow-hidden">
        <svg className="absolute inset-0 w-full h-full">
          {/* Connections */}
          {connections.map(([from, to]) => {
            const fromNode = nodes.find((n) => n.id === from)!
            const toNode = nodes.find((n) => n.id === to)!
            return (
              <line
                key={`${from}-${to}`}
                x1={`${fromNode.x + 5}%`}
                y1={`${fromNode.y + 5}%`}
                x2={`${toNode.x + 5}%`}
                y2={`${toNode.y + 5}%`}
                stroke={`${color}40`}
                strokeWidth="1.5"
                strokeDasharray={pipelineResult === 'processing' ? '4 4' : 'none'}
              >
                {pipelineResult === 'processing' && (
                  <animate attributeName="stroke-dashoffset" values="0;8" dur="0.5s" repeatCount="indefinite" />
                )}
              </line>
            )
          })}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => (
          <button
            key={node.id}
            onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 px-2 py-1 rounded border text-[9px] font-mono transition-all duration-200 ${
              selectedNode === node.id
                ? 'border-amber-500/50 bg-amber-500/15 shadow-lg shadow-amber-500/10 z-10'
                : 'border-border/40 bg-card/80 hover:border-border/60'
            } ${pipelineResult === 'processing' ? 'animate-pulse' : ''}`}
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              borderColor: selectedNode === node.id ? `${node.color}60` : undefined,
            }}
          >
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: node.color }} />
              <span className="font-medium">{node.label}</span>
            </div>
            <div className="text-[7px] text-muted-foreground/40 uppercase tracking-wider">{node.type}</div>
          </button>
        ))}

        {/* Processing indicator */}
        {pipelineResult === 'processing' && (
          <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2 py-1 rounded bg-black/60 border border-border/20">
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: color }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-[9px] font-mono" style={{ color }}>Processing pipeline...</span>
          </div>
        )}

        {pipelineResult === 'complete' && (
          <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[9px] font-mono text-emerald-400">Pipeline complete - 2.3s</span>
          </div>
        )}
      </div>

      {/* Node Details Panel */}
      {selectedNode && nodeDetails[selectedNode] && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-border/30 bg-black/20 p-3"
        >
          <div className="text-xs font-mono tracking-wider uppercase mb-2" style={{ color }}>
            {nodes.find((n) => n.id === selectedNode)?.label} - Parameters
          </div>
          <div className="space-y-1">
            {nodeDetails[selectedNode].params.map((param) => (
              <div key={param.label} className="flex items-center gap-2 text-[10px] font-mono">
                <span className="text-muted-foreground/50 w-20">{param.label}:</span>
                <span className="text-muted-foreground/80">{param.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Run Pipeline Button */}
      <button
        onClick={handleRun}
        disabled={pipelineResult === 'processing'}
        className="w-full py-2.5 rounded-lg font-mono text-xs tracking-wider uppercase transition-all"
        style={{
          backgroundColor: pipelineResult === 'processing' ? `${color}10` : `${color}15`,
          border: `1px solid ${color}40`,
          color: color,
        }}
      >
        {pipelineResult === 'processing' ? 'Processing...' : pipelineResult === 'complete' ? 'Re-run Pipeline' : 'Run Pipeline'}
      </button>
    </div>
  )
}

// =============================================================
// DEMO 5: GEO & SEO STRATEGY — Structured Data Builder
// =============================================================

export function GeoSeoDemo({ color }: { color: string }) {
  const [schemaType, setSchemaType] = useState(0)
  const [generatedJson, setGeneratedJson] = useState('')
  const [isOptimizing, setIsOptimizing] = useState(false)

  const schemas = [
    {
      name: 'Organization',
      icon: 'Office',
      json: `{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "powerUP",
  "url": "https://mark.tech",
  "logo": "https://mark.tech/logo.png",
  "sameAs": [
    "https://github.com/marktantongco",
    "https://linkedin.com/in/marktantongco1"
  ],
  "founder": {
    "@type": "Person",
    "name": "Mark Anthony Tantongco"
  },
  "description": "AI-first brand architecture & production code studio"
}`,
    },
    {
      name: 'Person',
      icon: 'Person',
      json: `{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Mark Anthony Tantongco",
  "jobTitle": "AI Systems Architect",
  "url": "https://mark.tech",
  "sameAs": [
    "https://github.com/marktantongco",
    "https://linkedin.com/in/marktantongco1",
    "https://instagram.com/markytanky"
  ],
  "knowsAbout": [
    "Prompt Engineering",
    "Brand Systems",
    "Production Code",
    "ComfyUI Pipelines",
    "GEO Strategy"
  ]
}`,
    },
    {
      name: 'WebSite',
      icon: 'Globe',
      json: `{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "MARK.TECH",
  "url": "https://mark.tech",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://mark.tech/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  },
  "publisher": {
    "@type": "Organization",
    "name": "powerUP"
  }
}`,
    },
    {
      name: 'Service',
      icon: 'Zap',
      json: `{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "AI-First Brand Architecture",
  "provider": {
    "@type": "Organization",
    "name": "powerUP"
  },
  "areaServed": "Philippines",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "itemListElement": [
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Prompt Engineering" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Brand Systems" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Production Code" } }
    ]
  }
}`,
    },
  ]

  const handleGenerate = () => {
    setIsOptimizing(true)
    setGeneratedJson('')
    const lines = schemas[schemaType].json.split('\n')
    let i = 0
    const interval = setInterval(() => {
      if (i < lines.length) {
        setGeneratedJson((prev) => prev + lines[i] + '\n')
        i++
      } else {
        clearInterval(interval)
        setIsOptimizing(false)
      }
    }, 50)
  }

  return (
    <div className="space-y-4">
      {/* Schema Type Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {schemas.map((schema, i) => (
          <button
            key={schema.name}
            onClick={() => { setSchemaType(i); setGeneratedJson('') }}
            className={`p-3 rounded-lg border text-center transition-all duration-200 ${
              schemaType === i
                ? 'border-emerald-500/50 bg-emerald-500/10'
                : 'border-border/30 hover:border-border/50 bg-card/50'
            }`}
          >
            <div className="text-lg mb-1">{schema.icon}</div>
            <div className="text-xs font-medium">{schema.name}</div>
          </button>
        ))}
      </div>

      {/* GEO Optimization Status */}
      <div className="flex items-center gap-3 p-3 rounded-lg border border-border/20 bg-emerald-500/5">
        <div className="flex-1">
          <div className="text-xs font-medium text-emerald-400 mb-1">GEO Citation Readiness</div>
          <div className="flex gap-1">
            {['Claude', 'ChatGPT', 'Perplexity', 'Gemini'].map((engine) => (
              <span key={engine} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400/80">
                {engine}
              </span>
            ))}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-emerald-400">92</div>
          <div className="text-[9px] font-mono text-emerald-400/60 uppercase">Score</div>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isOptimizing}
        className="w-full py-2.5 rounded-lg font-mono text-xs tracking-wider uppercase transition-all"
        style={{
          backgroundColor: isOptimizing ? `${color}10` : `${color}15`,
          border: `1px solid ${color}40`,
          color: color,
        }}
      >
        {isOptimizing ? 'Generating JSON-LD...' : 'Generate JSON-LD Schema'}
      </button>

      {/* JSON Output */}
      {(generatedJson || isOptimizing) && (
        <div className="rounded-lg border border-border/30 bg-black/30 p-3 font-mono text-[10px] leading-relaxed overflow-x-auto">
          <pre className="text-emerald-400/80 whitespace-pre-wrap">{generatedJson}</pre>
          {isOptimizing && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="text-emerald-400"
            >
              |
            </motion.span>
          )}
        </div>
      )}

      {/* SEO Tips */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Rich Snippets', value: '4/5', status: 'good' },
          { label: 'AI Citable', value: 'Yes', status: 'good' },
          { label: 'Coverage', value: '87%', status: 'warn' },
        ].map((metric) => (
          <div key={metric.label} className="p-2 rounded border border-border/20 bg-card/50 text-center">
            <div className={`text-sm font-bold ${metric.status === 'good' ? 'text-emerald-400' : 'text-amber-400'}`}>
              {metric.value}
            </div>
            <div className="text-[9px] font-mono text-muted-foreground/50 uppercase">{metric.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// =============================================================
// DEMO 6: BRAND MASTERY / INSURANCE — Policy Comparison Tool
// =============================================================

export function BrandMasteryDemo({ color }: { color: string }) {
  const [selectedPlan, setSelectedPlan] = useState<'blue-royale' | 'flexishield' | 'compare'>('compare')
  const [age, setAge] = useState(30)
  const [coverageAmount, setCoverageAmount] = useState(500000)

  const plans = {
    'blue-royale': {
      name: 'Blue Royale',
      tagline: 'Lifetime Coverage',
      color: '#3b82f6',
      features: ['Whole life protection', 'Cash value accumulation', 'Dividend potential', 'Fixed premiums', 'No medical exam (up to age 55)'],
      basePremium: 1500,
      coverageMultiplier: 1.5,
    },
    flexishield: {
      name: 'FlexiShield',
      tagline: 'HEV Enhancer',
      color: '#f43f5e',
      features: ['Hospital expense coverage', 'Flexible deductible options', 'Annual benefit limit', 'Outpatient coverage', 'Emergency coverage worldwide'],
      basePremium: 800,
      coverageMultiplier: 1.0,
    },
  }

  const calculatePremium = (planKey: 'blue-royale' | 'flexishield') => {
    const plan = plans[planKey]
    const ageFactor = 1 + (age - 25) * 0.02
    const coverageFactor = coverageAmount / 500000
    return Math.round(plan.basePremium * ageFactor * coverageFactor * plan.coverageMultiplier)
  }

  return (
    <div className="space-y-4">
      {/* Plan Selector */}
      <div className="flex gap-2 p-1 rounded-lg bg-black/20">
        {(['blue-royale', 'flexishield', 'compare'] as const).map((key) => (
          <button
            key={key}
            onClick={() => setSelectedPlan(key)}
            className={`flex-1 py-2 text-xs font-mono tracking-wider uppercase rounded-md transition-all ${
              selectedPlan === key
                ? 'bg-rose-500/20 text-rose-400'
                : 'text-muted-foreground/50 hover:text-muted-foreground/80'
            }`}
          >
            {key === 'compare' ? 'Compare' : plans[key].name}
          </button>
        ))}
      </div>

      {/* Calculator Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono tracking-wider uppercase text-muted-foreground/60">Age</label>
            <span className="text-xs font-mono" style={{ color }}>{age}</span>
          </div>
          <input
            type="range"
            min="18"
            max="65"
            value={age}
            onChange={(e) => setAge(parseInt(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${color} ${((age - 18) / 47) * 100}%, hsl(var(--border)) ${((age - 18) / 47) * 100}%)`,
            }}
          />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono tracking-wider uppercase text-muted-foreground/60">Coverage</label>
            <span className="text-xs font-mono" style={{ color }}>
              P{(coverageAmount / 1000).toFixed(0)}K
            </span>
          </div>
          <input
            type="range"
            min="100000"
            max="2000000"
            step="100000"
            value={coverageAmount}
            onChange={(e) => setCoverageAmount(parseInt(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${color} ${((coverageAmount - 100000) / 1900000) * 100}%, hsl(var(--border)) ${((coverageAmount - 100000) / 1900000) * 100}%)`,
            }}
          />
        </div>
      </div>

      {/* Plan Cards */}
      <div className={`grid gap-3 ${selectedPlan === 'compare' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
        {(
          selectedPlan === 'compare'
            ? (['blue-royale', 'flexishield'] as const)
            : [selectedPlan]
        ).map((planKey) => {
          const plan = plans[planKey]
          const premium = calculatePremium(planKey)
          return (
            <div
              key={planKey}
              className="p-4 rounded-lg border transition-all duration-200"
              style={{
                borderColor: `${plan.color}30`,
                backgroundColor: `${plan.color}08`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: plan.color }} />
                <span className="text-sm font-bold">{plan.name}</span>
                <span className="text-[9px] font-mono text-muted-foreground/50">{plan.tagline}</span>
              </div>

              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-2xl font-black" style={{ color: plan.color }}>
                  P{premium.toLocaleString()}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground/50">/month</span>
              </div>

              <div className="space-y-1.5">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-xs">
                    <span className="w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ backgroundColor: `${plan.color}20` }}>
                      <span className="text-[8px]" style={{ color: plan.color }}>Y</span>
                    </span>
                    <span className="text-muted-foreground/70">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Pacific Cross branding */}
      <div className="flex items-center justify-center gap-2 py-2 text-[9px] font-mono text-muted-foreground/30">
        <span>Powered by</span>
        <span className="font-medium text-muted-foreground/50">Pacific Cross</span>
        <span>|</span>
        <span>Licensed Agent</span>
      </div>
    </div>
  )
}
