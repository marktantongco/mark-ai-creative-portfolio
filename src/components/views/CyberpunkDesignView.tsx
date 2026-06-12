'use client'

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap, ScrollTrigger } from '@/lib/gsap-setup'
import { useGSAP } from '@gsap/react'
import {
  Cpu,
  Shield,
  Zap,
  Activity,
  Terminal,
  Eye,
  ChevronRight,
  ArrowLeft,
  Home,
  Radio,
} from 'lucide-react'

// =============================================================
// CONSTANTS
// =============================================================

const COLORS = {
  bg: '#050505',
  cyan: '#00FFD4',
  magenta: '#FF00AA',
  blue: '#3366FF',
  red: '#FF3344',
  darkGray: '#1A1A1A',
  midGray: '#2A2A2A',
  textDim: '#666666',
  textBright: '#EEEEEE',
} as const

const SCANLINE_OVERLAY =
  'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,212,0.03) 2px, rgba(0,255,212,0.03) 4px)'

const GRID_OVERLAY =
  'linear-gradient(rgba(0,255,212,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,212,0.05) 1px, transparent 1px)'

const HEX_CHARS = '0123456789ABCDEF'

function randomHex(length: number): string {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)]
  }
  return result
}

// =============================================================
// THREE.JS CYBER SCENE
// =============================================================

function CyberScene() {
  const meshRef = useRef<THREE.Mesh>(null)
  const wireRef = useRef<THREE.LineSegments>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5
    }
    if (wireRef.current) {
      wireRef.current.rotation.x = state.clock.elapsedTime * 0.15
      wireRef.current.rotation.z = state.clock.elapsedTime * 0.2
    }
  })

  return (
    <>
      <Stars
        radius={100}
        depth={50}
        count={3000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[1.5, 1]} />
          <meshBasicMaterial color="#00FFD4" wireframe />
        </mesh>
      </Float>
      <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
        <lineSegments ref={wireRef}>
          <edgesGeometry
            args={[new THREE.OctahedronGeometry(2.5, 0)]}
          />
          <lineBasicMaterial color="#FF00AA" transparent opacity={0.4} />
        </lineSegments>
      </Float>
      <ambientLight intensity={0.1} />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#00FFD4" />
      <pointLight position={[-10, -5, -10]} intensity={0.3} color="#FF00AA" />
    </>
  )
}

// =============================================================
// GLITCH TEXT COMPONENT
// =============================================================

function GlitchText({
  children,
  className = '',
  intensity = 'normal',
}: {
  children: React.ReactNode
  className?: string
  intensity?: 'normal' | 'intense'
}) {
  const shadow =
    intensity === 'intense'
      ? `3px 0 #FF00AA, -3px 0 #3366FF, 0 0 20px rgba(0,255,212,0.5)`
      : `2px 0 #FF00AA, -2px 0 #3366FF`

  return (
    <span
      className={className}
      style={{
        textShadow: shadow,
        animation: intensity === 'intense' ? 'glitchFlicker 3s infinite' : 'none',
      }}
    >
      {children}
    </span>
  )
}

// =============================================================
// SCRAMBLE TEXT COMPONENT
// =============================================================

function ScrambleText({ text, className = '' }: { text: string; className?: string }) {
  const containerRef = useRef<HTMLSpanElement>(null)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!containerRef.current || hasAnimated.current) return
    hasAnimated.current = true

    const el = containerRef.current
    const original = text
    let iteration = 0

    const interval = setInterval(() => {
      el.innerText = original
        .split('')
        .map((char, index) => {
          if (char === ' ') return ' '
          if (index < iteration) return original[index]
          return chars[Math.floor(Math.random() * chars.length)]
        })
        .join('')

      iteration += 1 / 2

      if (iteration >= original.length) {
        el.innerText = original
        clearInterval(interval)
      }
    }, 30)

    return () => clearInterval(interval)
  }, [text])

  return (
    <span ref={containerRef} className={className}>
      {text}
    </span>
  )
}

// =============================================================
// NEON BORDER COMPONENT
// =============================================================

function NeonBorder({
  color = COLORS.cyan,
  children,
  className = '',
}: {
  color?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={className}
      style={{
        boxShadow: `0 0 10px ${color}, 0 0 30px ${color}33, inset 0 0 10px ${color}11`,
        border: `1px solid ${color}66`,
      }}
    >
      {children}
    </div>
  )
}

// =============================================================
// HUD CORNER DECORATIONS
// =============================================================

function HudCorners({ color = COLORS.cyan }: { color?: string }) {
  return (
    <>
      {/* Top-left */}
      <div
        className="absolute top-0 left-0 w-4 h-4 pointer-events-none"
        style={{
          borderTop: `2px solid ${color}`,
          borderLeft: `2px solid ${color}`,
        }}
      />
      {/* Top-right */}
      <div
        className="absolute top-0 right-0 w-4 h-4 pointer-events-none"
        style={{
          borderTop: `2px solid ${color}`,
          borderRight: `2px solid ${color}`,
        }}
      />
      {/* Bottom-left */}
      <div
        className="absolute bottom-0 left-0 w-4 h-4 pointer-events-none"
        style={{
          borderBottom: `2px solid ${color}`,
          borderLeft: `2px solid ${color}`,
        }}
      />
      {/* Bottom-right */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 pointer-events-none"
        style={{
          borderBottom: `2px solid ${color}`,
          borderRight: `2px solid ${color}`,
        }}
      />
    </>
  )
}

// =============================================================
// DATA STREAM COLUMN
// =============================================================

function DataColumn({ height = 300, width = 40 }: { height?: number; width?: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const lines = 60
    let html = ''
    for (let i = 0; i < lines; i++) {
      html += `<div style="font-family: monospace; font-size: 10px; color: rgba(0,255,212,${0.1 + Math.random() * 0.3}); line-height: 1.4;">${randomHex(8)}</div>`
    }
    el.innerHTML = html

    const anim = gsap.to(el, {
      y: `-50%`,
      duration: 10 + Math.random() * 15,
      ease: 'none',
      repeat: -1,
    })

    return () => {
      anim.kill()
    }
  }, [height])

  return (
    <div className="overflow-hidden" style={{ height, width }}>
      <div ref={ref} style={{ willChange: 'transform' }} />
    </div>
  )
}

// =============================================================
// HERO SECTION
// =============================================================

function HeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.fromTo(
        headlineRef.current,
        { opacity: 0, y: 40, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 1.2 }
      )
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.5'
        )
        .fromTo(
          badgeRef.current,
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 0.5 },
          '-=0.3'
        )
    },
    { scope: sectionRef }
  )

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ height: '60vh', minHeight: 420, backgroundColor: COLORS.bg }}
    >
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <React.Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: COLORS.bg }}>
              <div className="text-xs font-mono tracking-widest" style={{ color: COLORS.cyan }}>
                INITIALIZING RENDER PIPELINE...
              </div>
            </div>
          }
        >
          <Canvas
            camera={{ position: [0, 0, 6], fov: 60 }}
            style={{ background: 'transparent' }}
            gl={{ alpha: true, antialias: true }}
          >
            <CyberScene />
          </Canvas>
        </React.Suspense>
      </div>

      {/* Scan-line overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{ background: SCANLINE_OVERLAY }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          backgroundImage: GRID_OVERLAY,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Content overlay */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
        {/* Status badge */}
        <div ref={badgeRef} className="mb-6">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-mono text-[10px] tracking-[0.25em] uppercase"
            style={{
              border: `1px solid ${COLORS.cyan}44`,
              backgroundColor: `${COLORS.cyan}0A`,
              color: COLORS.cyan,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full inline-block"
              style={{
                backgroundColor: COLORS.cyan,
                boxShadow: `0 0 6px ${COLORS.cyan}`,
              }}
            />
            SYSTEM ONLINE — PORTFOLIO v4.2.1
          </div>
        </div>

        {/* Headline */}
        <h1
          ref={headlineRef}
          className="font-mono font-black tracking-tight leading-none mb-4"
          style={{
            fontSize: 'clamp(2.5rem, 8vw, 5rem)',
            color: COLORS.textBright,
            textShadow: `0 0 40px ${COLORS.cyan}33, 2px 0 #FF00AA, -2px 0 #3366FF`,
          }}
        >
          <GlitchText intensity="intense">CYBERPUNK</GlitchText>
          <span style={{ color: COLORS.cyan, margin: '0 0.3em' }}>/</span>
          <GlitchText intensity="intense">NEON</GlitchText>
        </h1>

        {/* Subtitle with scramble */}
        <div ref={subtitleRef} className="max-w-xl">
          <p
            className="font-mono text-sm sm:text-base tracking-wider"
            style={{ color: COLORS.cyan, opacity: 0.8 }}
          >
            <ScrambleText text="DESIGN SYSTEM // HIGH-FREQUENCY VISUAL INTERFACE // NEON-AUGMENTED REALITY" />
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-1"
          >
            <span className="font-mono text-[9px] tracking-[0.3em]" style={{ color: COLORS.textDim }}>
              SCROLL
            </span>
            <ChevronRight
              className="w-4 h-4 rotate-90"
              style={{ color: COLORS.cyan }}
            />
          </motion.div>
        </div>
      </div>

      {/* HUD decorations */}
      <div
        className="absolute top-4 left-4 z-30 font-mono text-[9px] tracking-wider"
        style={{ color: COLORS.textDim }}
      >
        <div>COORD: 35.6762° N, 139.6503° E</div>
        <div>FRAME: <span style={{ color: COLORS.cyan }}>60 FPS</span></div>
      </div>
      <div
        className="absolute top-4 right-4 z-30 font-mono text-[9px] tracking-wider text-right"
        style={{ color: COLORS.textDim }}
      >
        <div>UPLINK: <span style={{ color: COLORS.cyan }}>ACTIVE</span></div>
        <div>LATENCY: <span style={{ color: COLORS.cyan }}>12ms</span></div>
      </div>
    </section>
  )
}

// =============================================================
// SPECS SECTION — "SYSTEM SPECS"
// =============================================================

const COLOR_SWATCHES = [
  { name: 'DEEP BLACK', hex: '#050505', color: COLORS.bg },
  { name: 'NEON CYAN', hex: '#00FFD4', color: COLORS.cyan },
  { name: 'MAGENTA', hex: '#FF00AA', color: COLORS.magenta },
  { name: 'ELECTRIC BLUE', hex: '#3366FF', color: COLORS.blue },
  { name: 'WARNING RED', hex: '#FF3344', color: COLORS.red },
  { name: 'DARK GRAY', hex: '#1A1A1A', color: COLORS.darkGray },
]

const TYPO_SPECIMENS = [
  { label: 'DISPLAY', text: 'CYBERPUNK', style: 'font-black text-2xl tracking-tight' },
  { label: 'HEADING', text: 'SYSTEM OVERRIDE', style: 'font-bold text-lg tracking-wide' },
  { label: 'BODY', text: 'Neural interface connection established.', style: 'font-normal text-sm tracking-normal' },
  { label: 'DATA LABEL', text: 'STATUS: ONLINE', style: 'font-mono text-xs tracking-[0.2em] uppercase' },
]

function SpecsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<HTMLDivElement[]>([])
  const streamRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      // Staggered reveal of spec items
      gsap.fromTo(
        itemsRef.current.filter(Boolean),
        { opacity: 0, y: 30, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.12,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse',
          },
        }
      )

      // Data stream animation
      if (streamRef.current) {
        const el = streamRef.current
        let html = ''
        for (let i = 0; i < 80; i++) {
          html += `<div style="font-family: monospace; font-size: 10px; line-height: 1.6; color: rgba(0,255,212,${0.05 + Math.random() * 0.15});">${randomHex(32)}</div>`
        }
        el.innerHTML = html

        gsap.to(el, {
          y: '-50%',
          duration: 25,
          ease: 'none',
          repeat: -1,
        })
      }
    },
    { scope: sectionRef }
  )

  return (
    <section
      ref={sectionRef}
      className="relative py-20 px-4 sm:px-8 overflow-hidden"
      style={{ backgroundColor: COLORS.bg }}
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: GRID_OVERLAY,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-12">
          <Terminal className="w-5 h-5" style={{ color: COLORS.cyan }} />
          <h2
            className="font-mono font-bold text-sm tracking-[0.3em] uppercase"
            style={{ color: COLORS.cyan }}
          >
            SYSTEM SPECS
          </h2>
          <div
            className="flex-1 h-px"
            style={{ backgroundColor: `${COLORS.cyan}33` }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Color swatches */}
          <div
            ref={(el) => { if (el) itemsRef.current[0] = el }}
            className="relative p-6 rounded"
            style={{
              backgroundColor: COLORS.darkGray,
              border: `1px solid ${COLORS.cyan}22`,
              boxShadow: `0 0 15px ${COLORS.cyan}11`,
            }}
          >
            <HudCorners />
            <h3
              className="font-mono text-[10px] tracking-[0.25em] uppercase mb-6"
              style={{ color: COLORS.textDim }}
            >
              COLOR PALETTE
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {COLOR_SWATCHES.map((swatch) => (
                <div key={swatch.hex} className="flex flex-col items-center gap-2 group">
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded transition-all duration-300 group-hover:scale-110"
                    style={{
                      backgroundColor: swatch.color,
                      boxShadow: `0 0 10px ${swatch.color}66`,
                      border:
                        swatch.hex === '#050505'
                          ? `1px solid ${COLORS.cyan}33`
                          : 'none',
                    }}
                  />
                  <span
                    className="font-mono text-[9px] tracking-wider"
                    style={{ color: COLORS.textDim }}
                  >
                    {swatch.hex}
                  </span>
                  <span
                    className="font-mono text-[8px] tracking-wider uppercase text-center"
                    style={{ color: COLORS.cyan, opacity: 0.6 }}
                  >
                    {swatch.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Typography specimens */}
          <div
            ref={(el) => { if (el) itemsRef.current[1] = el }}
            className="relative p-6 rounded"
            style={{
              backgroundColor: COLORS.darkGray,
              border: `1px solid ${COLORS.magenta}22`,
              boxShadow: `0 0 15px ${COLORS.magenta}11`,
            }}
          >
            <HudCorners color={COLORS.magenta} />
            <h3
              className="font-mono text-[10px] tracking-[0.25em] uppercase mb-6"
              style={{ color: COLORS.textDim }}
            >
              TYPOGRAPHY
            </h3>
            <div className="space-y-5">
              {TYPO_SPECIMENS.map((spec) => (
                <div key={spec.label} className="group cursor-default">
                  <div
                    className="font-mono text-[8px] tracking-[0.2em] uppercase mb-1.5"
                    style={{ color: COLORS.cyan, opacity: 0.5 }}
                  >
                    {spec.label}
                  </div>
                  <div
                    className={`transition-all duration-300 ${spec.style}`}
                    style={{
                      color: COLORS.textBright,
                    }}
                    onMouseEnter={(e) => {
                      ;(e.target as HTMLElement).style.textShadow =
                        '2px 0 #FF00AA, -2px 0 #3366FF'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.target as HTMLElement).style.textShadow = 'none'
                    }}
                  >
                    {spec.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data stream decoration */}
          <div
            ref={(el) => { if (el) itemsRef.current[2] = el }}
            className="relative p-6 rounded overflow-hidden"
            style={{
              backgroundColor: COLORS.darkGray,
              border: `1px solid ${COLORS.blue}22`,
              boxShadow: `0 0 15px ${COLORS.blue}11`,
            }}
          >
            <HudCorners color={COLORS.blue} />
            <h3
              className="font-mono text-[10px] tracking-[0.25em] uppercase mb-6"
              style={{ color: COLORS.textDim }}
            >
              DATA STREAM
            </h3>
            <div className="overflow-hidden h-64 rounded" style={{ backgroundColor: '#0A0A0A' }}>
              <div ref={streamRef} className="pt-0 px-2" />
            </div>
            <div className="flex items-center gap-2 mt-4">
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: COLORS.cyan, boxShadow: `0 0 6px ${COLORS.cyan}` }}
              />
              <span
                className="font-mono text-[9px] tracking-[0.2em] uppercase"
                style={{ color: COLORS.cyan }}
              >
                STREAM ACTIVE
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// =============================================================
// MODULES SECTION — HUD PANELS
// =============================================================

const MODULES = [
  {
    id: '01',
    label: 'NEURAL INTERFACE',
    description: 'Direct brain-computer linkage with quantum encryption. Zero-latency neural feedback loop.',
    progress: 87,
    metric: '87',
    metricLabel: 'UPTIME %',
    color: COLORS.cyan,
    icon: Cpu,
  },
  {
    id: '02',
    label: 'FIREWALL MATRIX',
    description: 'Adaptive threat detection with holographic barrier systems. 256-qubit security layer.',
    progress: 94,
    metric: '94',
    metricLabel: 'THREATS BLOCKED',
    color: COLORS.magenta,
    icon: Shield,
  },
  {
    id: '03',
    label: 'OVERCLOCK ENGINE',
    description: 'Dynamic frequency scaling with plasma-cooled processors. Peak throughput exceeded.',
    progress: 72,
    metric: '72',
    metricLabel: 'CORE TEMP °C',
    color: COLORS.blue,
    icon: Zap,
  },
]

function ModuleCard({
  module,
  index,
}: {
  module: (typeof MODULES)[number]
  index: number
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const numberRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const Icon = module.icon

  useGSAP(
    () => {
      // Count-up animation
      if (numberRef.current) {
        const target = parseInt(module.metric, 10)
        const obj = { val: 0 }
        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          snap: { val: 1 },
          scrollTrigger: {
            trigger: cardRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
          onUpdate: () => {
            if (numberRef.current) {
              numberRef.current.textContent = String(Math.floor(obj.val))
            }
          },
        })
      }

      // Progress bar animation
      if (progressRef.current) {
        gsap.fromTo(
          progressRef.current,
          { width: '0%' },
          {
            width: `${module.progress}%`,
            duration: 1.5,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cardRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }
    },
    { scope: cardRef, dependencies: [module.metric, module.progress] }
  )

  return (
    <motion.div
      ref={cardRef}
      whileHover={{
        scale: 1.03,
        transition: { type: 'spring', stiffness: 300 },
      }}
      className="relative p-6 rounded cursor-default"
      style={{
        backgroundColor: COLORS.darkGray,
        border: `1px solid ${module.color}33`,
        boxShadow: `0 0 15px ${module.color}22`,
      }}
    >
      <HudCorners color={module.color} />

      {/* Module label */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" style={{ color: module.color }} />
          <span
            className="font-mono text-[10px] tracking-[0.3em] uppercase"
            style={{ color: module.color }}
          >
            MODULE {module.id}
          </span>
        </div>
        <Activity
          className="w-3.5 h-3.5"
          style={{ color: module.color, opacity: 0.5 }}
        />
      </div>

      {/* Title */}
      <h3
        className="font-mono font-bold text-base sm:text-lg tracking-wide mb-2"
        style={{ color: COLORS.textBright }}
      >
        {module.label}
      </h3>

      {/* Description */}
      <p
        className="font-mono text-[11px] leading-relaxed mb-5"
        style={{ color: COLORS.textDim }}
      >
        {module.description}
      </p>

      {/* Metric */}
      <div className="flex items-end gap-1 mb-3">
        <div
          ref={numberRef}
          className="font-mono font-black text-3xl sm:text-4xl leading-none"
          style={{ color: module.color, textShadow: `0 0 20px ${module.color}44` }}
        >
          0
        </div>
        <span
          className="font-mono text-[9px] tracking-[0.2em] uppercase pb-1"
          style={{ color: COLORS.textDim }}
        >
          {module.metricLabel}
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="w-full h-1.5 rounded-full overflow-hidden"
        style={{ backgroundColor: '#0A0A0A' }}
      >
        <div
          ref={progressRef}
          className="h-full rounded-full"
          style={{
            width: '0%',
            backgroundColor: module.color,
            boxShadow: `0 0 10px ${module.color}`,
          }}
        />
      </div>
    </motion.div>
  )
}

function ModulesSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  return (
    <section
      ref={sectionRef}
      className="relative py-20 px-4 sm:px-8 overflow-hidden"
      style={{ backgroundColor: COLORS.bg }}
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: GRID_OVERLAY,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-12">
          <Cpu className="w-5 h-5" style={{ color: COLORS.magenta }} />
          <h2
            className="font-mono font-bold text-sm tracking-[0.3em] uppercase"
            style={{ color: COLORS.magenta }}
          >
            ACTIVE MODULES
          </h2>
          <div
            className="flex-1 h-px"
            style={{ backgroundColor: `${COLORS.magenta}33` }}
          />
        </div>

        {/* Module cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MODULES.map((module, i) => (
            <ModuleCard key={module.id} module={module} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

// =============================================================
// DATA STREAM SECTION
// =============================================================

function DataStreamSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const columnsRef = useRef<(HTMLDivElement | null)[]>([])

  useGSAP(
    () => {
      columnsRef.current.forEach((col, i) => {
        if (!col) return
        const lines = 50
        let html = ''
        for (let j = 0; j < lines; j++) {
          const opacity = 0.05 + Math.random() * 0.25
          const isMagenta = Math.random() > 0.85
          html += `<div style="font-family: monospace; font-size: ${9 + Math.random() * 3}px; line-height: 1.5; color: ${isMagenta ? `rgba(255,0,170,${opacity})` : `rgba(0,255,212,${opacity})`}; white-space: nowrap;">${randomHex(4 + Math.floor(Math.random() * 12))}</div>`
        }
        col.innerHTML = html

        gsap.to(col, {
          y: '-50%',
          duration: 12 + i * 4,
          ease: 'none',
          repeat: -1,
        })
      })
    },
    { scope: sectionRef }
  )

  return (
    <section
      ref={sectionRef}
      className="relative py-16 px-4 sm:px-8 overflow-hidden"
      style={{ backgroundColor: '#030303' }}
    >
      {/* Scan-line overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: SCANLINE_OVERLAY }}
      />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Badge */}
        <div className="flex items-center justify-center mb-10">
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full font-mono text-[11px] tracking-[0.25em] uppercase"
            style={{
              border: `1px solid ${COLORS.cyan}55`,
              backgroundColor: `${COLORS.cyan}0A`,
              color: COLORS.cyan,
              boxShadow: `0 0 20px ${COLORS.cyan}22`,
            }}
          >
            <Radio className="w-3.5 h-3.5" />
            DATA FLOW ACTIVE
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{
                backgroundColor: COLORS.cyan,
                boxShadow: `0 0 8px ${COLORS.cyan}`,
              }}
            />
          </motion.div>
        </div>

        {/* Data columns */}
        <div className="flex justify-center gap-2 sm:gap-4 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded"
              style={{
                height: 200,
                width: i % 3 === 0 ? 60 : i % 2 === 0 ? 50 : 40,
                backgroundColor: '#080808',
                border: `1px solid ${COLORS.cyan}0A`,
              }}
            >
              <div
                ref={(el) => {
                  columnsRef.current[i] = el
                }}
                className="p-2"
              />
            </div>
          ))}
        </div>

        {/* Glitch transition line */}
        <div className="mt-8 relative h-px">
          <motion.div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(90deg, transparent, ${COLORS.cyan}, ${COLORS.magenta}, ${COLORS.cyan}, transparent)`,
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scaleX: [0.8, 1.05, 0.8],
            }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          />
        </div>

        {/* Status text */}
        <div className="flex justify-center mt-6">
          <div className="font-mono text-[9px] tracking-[0.3em] uppercase" style={{ color: COLORS.textDim }}>
            BANDWIDTH: <span style={{ color: COLORS.cyan }}>1.21 GW</span>
            {' // '}
            PACKETS: <span style={{ color: COLORS.cyan }}>∞</span>
            {' // '}
            ENCRYPTION: <span style={{ color: COLORS.magenta }}>AES-512</span>
          </div>
        </div>
      </div>
    </section>
  )
}

// =============================================================
// FOOTER
// =============================================================

function CyberFooter({ onSwitchView, onNavigate }: { onSwitchView: (view: string) => void; onNavigate: (view: string) => void }) {
  return (
    <footer
      className="relative py-10 px-4 sm:px-8"
      style={{
        backgroundColor: '#020202',
        borderTop: `1px solid ${COLORS.cyan}11`,
      }}
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Back links */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onNavigate('home')}
            className="group flex items-center gap-2 font-mono text-[11px] tracking-[0.15em] uppercase transition-colors duration-300"
            style={{ color: COLORS.textDim }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLElement).style.color = '#00FF88'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLElement).style.color = COLORS.textDim
            }}
          >
            <Home className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
            <span className="relative">
              HOME
              <span
                className="absolute bottom-0 left-0 w-0 h-px transition-all duration-300 group-hover:w-full"
                style={{ backgroundColor: '#00FF88', boxShadow: '0 0 6px #00FF88' }}
              />
            </span>
          </button>
          <button
            onClick={() => onSwitchView('frontend-design')}
            className="group flex items-center gap-2 font-mono text-[11px] tracking-[0.15em] uppercase transition-colors duration-300"
            style={{ color: COLORS.textDim }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLElement).style.color = COLORS.cyan
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLElement).style.color = COLORS.textDim
            }}
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span className="relative">
              DESIGN CENTER
              <span
                className="absolute bottom-0 left-0 w-0 h-px transition-all duration-300 group-hover:w-full"
                style={{ backgroundColor: COLORS.cyan, boxShadow: `0 0 6px ${COLORS.cyan}` }}
              />
            </span>
          </button>
        </div>

        {/* System status */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-2 h-2 rounded-full inline-block"
              style={{
                backgroundColor: '#00FF88',
                boxShadow: '0 0 8px #00FF88',
              }}
            />
            <span
              className="font-mono text-[10px] tracking-[0.2em] uppercase"
              style={{ color: '#00FF88' }}
            >
              ONLINE
            </span>
          </div>
          <span
            className="font-mono text-[9px] tracking-wider"
            style={{ color: COLORS.textDim }}
          >
            CYBERPUNK DESIGN SYSTEM v4.2.1
          </span>
        </div>
      </div>

      {/* Scan-line overlay on footer */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: SCANLINE_OVERLAY }}
      />
    </footer>
  )
}

// =============================================================
// MAIN COMPONENT
// =============================================================

interface CyberpunkDesignViewProps {
  onSwitchView: (view: string) => void
  onNavigate: (view: string) => void
}

export default function CyberpunkDesignView({ onSwitchView, onNavigate }: CyberpunkDesignViewProps) {
  const pageRef = useRef<HTMLDivElement>(null)

  // Global CSS keyframes injection
  useEffect(() => {
    const styleId = 'cyberpunk-glitch-keyframes'
    if (document.getElementById(styleId)) return

    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      @keyframes glitchFlicker {
        0%, 95% { text-shadow: 2px 0 #FF00AA, -2px 0 #3366FF, 0 0 20px rgba(0,255,212,0.3); }
        96% { text-shadow: -3px 0 #3366FF, 3px 0 #FF00AA, 0 0 40px rgba(255,0,170,0.5); }
        97% { text-shadow: 3px 0 #FF00AA, -3px 0 #3366FF, 0 0 10px rgba(0,255,212,0.1); }
        98% { text-shadow: -2px 0 #3366FF, 2px 0 #FF00AA, 0 0 30px rgba(51,102,255,0.5); }
        99% { text-shadow: 4px 0 #FF00AA, -4px 0 #3366FF, 0 0 50px rgba(0,255,212,0.6); }
        100% { text-shadow: 2px 0 #FF00AA, -2px 0 #3366FF, 0 0 20px rgba(0,255,212,0.3); }
      }

      @keyframes scanMove {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(100vh); }
      }

      /* Custom scrollbar */
      .cyber-scroll::-webkit-scrollbar {
        width: 4px;
      }
      .cyber-scroll::-webkit-scrollbar-track {
        background: #050505;
      }
      .cyber-scroll::-webkit-scrollbar-thumb {
        background: #00FFD444;
        border-radius: 2px;
      }
      .cyber-scroll::-webkit-scrollbar-thumb:hover {
        background: #00FFD488;
      }
    `
    document.head.appendChild(style)

    return () => {
      const el = document.getElementById(styleId)
      if (el) el.remove()
    }
  }, [])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="cyberpunk-view"
        ref={pageRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="min-h-screen flex flex-col cyber-scroll"
        style={{ backgroundColor: COLORS.bg, color: COLORS.textBright }}
      >
        {/* Moving scan-line effect */}
        <div
          className="fixed inset-0 pointer-events-none z-50"
          style={{ overflow: 'hidden' }}
        >
          <div
            className="w-full h-20 absolute"
            style={{
              background: `linear-gradient(180deg, transparent, ${COLORS.cyan}06, transparent)`,
              animation: 'scanMove 8s linear infinite',
            }}
          />
        </div>

        <HeroSection />
        <SpecsSection />
        <ModulesSection />
        <DataStreamSection />

        {/* Footer */}
        <div className="mt-auto">
          <CyberFooter onSwitchView={onSwitchView} onNavigate={onNavigate} />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
