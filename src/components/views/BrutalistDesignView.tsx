'use client'

import React, { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap, ScrollTrigger } from '@/lib/gsap-setup'
import { useGSAP } from '@gsap/react'
import {
  ArrowLeft, ArrowRight, CornerDownLeft, Grid3X3, Type,
  Paintbrush, Ruler, Box, Hammer, Eye,
  ChevronRight, ExternalLink,
} from 'lucide-react'
import { assetPath } from '@/lib/utils'

// =============================================================
// BRUTALIST INDUSTRIAL — COLOR SYSTEM
// Raw, honest, utilitarian
// =============================================================

const BRUTAL = {
  black: '#0A0A0A',
  offWhite: '#F0F0F0',
  yellow: '#FFD600',
  concrete: '#888888',
  red: '#FF3333',
  darkGray: '#1A1A1A',
  midGray: '#444444',
  lightGray: '#CCCCCC',
}

// =============================================================
// DATA
// =============================================================

const PHILOSOPHY_ITEMS = [
  {
    id: '01',
    title: 'MATERIAL HONESTY',
    subtitle: 'TRUTH TO MATERIALS',
    description:
      'No decoration. No pretense. Every element declares its function. Concrete looks like concrete. Steel looks like steel. The surface IS the substance.',
    icon: Box,
    accent: BRUTAL.yellow,
  },
  {
    id: '02',
    title: 'STRUCTURAL EXPRESSION',
    subtitle: 'EXPOSE THE SKELETON',
    description:
      'Hide nothing. Show the bolts, the seams, the joins. The structure is the ornament. Load-bearing elements become visual features. Engineering IS design.',
    icon: Grid3X3,
    accent: BRUTAL.red,
  },
  {
    id: '03',
    title: 'FUNCTIONAL BEAUTY',
    subtitle: 'FORM FOLLOWS FORCE',
    description:
      'Beauty emerges from purpose, not polish. If it works, it works. The grid is the aesthetic. Repetition is rhythm. Utility is the only ornament worth having.',
    icon: Hammer,
    accent: BRUTAL.offWhite,
  },
]

const COLOR_SWATCHES = [
  { name: 'BLACK', hex: '#0A0A0A', textColor: '#F0F0F0' },
  { name: 'OFF-WHITE', hex: '#F0F0F0', textColor: '#0A0A0A' },
  { name: 'RAW YELLOW', hex: '#FFD600', textColor: '#0A0A0A' },
  { name: 'CONCRETE', hex: '#888888', textColor: '#0A0A0A' },
  { name: 'RED ACCENT', hex: '#FF3333', textColor: '#F0F0F0' },
]

const TYPOGRAPHY_SPECS = [
  { label: 'FONT', value: 'GEIST MONO', specimen: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' },
  { label: 'WEIGHT', value: '700 / BOLD', specimen: 'BRUTALIST INDUSTRIAL' },
  { label: 'TRANSFORM', value: 'UPPERCASE', specimen: 'always. no exceptions.' },
  { label: 'TRACKING', value: '0.2EM', specimen: 'SPACED OUT' },
  { label: 'LINE HEIGHT', value: '1.1 / TIGHT', specimen: 'Stack it high' },
]

const SPACING_RULES = [
  { rule: 'UNIT', value: '8px', usage: 'Base grid unit' },
  { rule: 'SM', value: '16px', usage: 'Internal padding' },
  { rule: 'MD', value: '24px', usage: 'Section gaps' },
  { rule: 'LG', value: '48px', usage: 'Major separations' },
  { rule: 'XL', value: '96px', usage: 'Section breaks' },
  { rule: 'BORDER', value: '2px SOLID', usage: 'All borders, no radius' },
]

const PROJECTS = [
  {
    id: '01',
    title: 'CONCRETE.CSS',
    category: 'DESIGN SYSTEM',
    year: '2024',
    description:
      'A brutalist CSS framework. No abstractions, no magic. Every class does exactly one thing. Zero runtime. Pure declarations. 4KB gzipped.',
    tags: ['CSS', 'DESIGN TOKENS', 'FRAMEWORK'],
    color: BRUTAL.yellow,
    image: assetPath('/images/brutalist/project-1.png'),
  },
  {
    id: '02',
    title: 'EXPOSED.BUILD',
    category: 'CONSTRUCTION TECH',
    year: '2024',
    description:
      'Real-time construction site dashboard. Steel beam stress visualization. Live sensor data. No pretty charts — raw numbers on raw grids.',
    tags: ['REACT', 'WEBSOCKETS', 'DATA VIZ'],
    color: BRUTAL.red,
    image: assetPath('/images/brutalist/project-2.png'),
  },
  {
    id: '03',
    title: 'GRID.LANGUAGE',
    category: 'TYPE FOUNDRY',
    year: '2025',
    description:
      'Monospace typeface designed for industrial interfaces. Every character fits the grid. No kerning pairs. No optical adjustments. Pure geometry.',
    tags: ['TYPOGRAPHY', 'OPENTYPE', 'GRID'],
    color: BRUTAL.concrete,
    image: assetPath('/images/brutalist/project-3.png'),
  },
]

// =============================================================
// SECTION LABEL COMPONENT
// =============================================================

function SectionLabel({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <span
        className="font-mono text-sm tracking-[0.3em] uppercase"
        style={{ color: BRUTAL.yellow }}
      >
        {number}{'//'}&nbsp;
      </span>
      <span
        className="font-mono text-sm tracking-[0.3em] uppercase"
        style={{ color: BRUTAL.concrete }}
      >
        {title}
      </span>
      <div
        className="flex-1 h-px"
        style={{ backgroundColor: BRUTAL.midGray }}
      />
    </div>
  )
}

// =============================================================
// HERO SECTION
// =============================================================

function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!headlineRef.current) return

      // Character-by-character reveal
      const chars = headlineRef.current.querySelectorAll('.hero-char')
      gsap.set(chars, { y: 40, opacity: 0 })

      gsap.to(chars, {
        y: 0,
        opacity: 1,
        stagger: 0.04,
        duration: 0.8,
        ease: 'power4.out',
        delay: 0.3,
      })

      // Yellow bar slide-in
      const bar = heroRef.current?.querySelector('.yellow-bar')
      if (bar) {
        gsap.fromTo(
          bar,
          { scaleX: 0, transformOrigin: 'left center' },
          { scaleX: 1, duration: 1.2, ease: 'expo.out', delay: 0.8 }
        )
      }

      // Subtitle fade
      const subtitle = heroRef.current?.querySelector('.hero-subtitle')
      if (subtitle) {
        gsap.fromTo(
          subtitle,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power4.out', delay: 1.2 }
        )
      }

      // Grid lines draw
      const gridLines = heroRef.current?.querySelectorAll('.grid-line')
      if (gridLines) {
        gsap.fromTo(
          gridLines,
          { scaleY: 0, transformOrigin: 'top center' },
          {
            scaleY: 1,
            stagger: 0.1,
            duration: 0.6,
            ease: 'expo.out',
            delay: 1.0,
          }
        )
      }
    },
    { scope: heroRef }
  )

  const heroText = 'BRUTALIST / INDUSTRIAL'

  return (
    <section
      ref={heroRef}
      className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden"
      style={{ backgroundColor: BRUTAL.black }}
    >
      {/* Decorative grid lines */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={`vline-${i}`}
            className="grid-line absolute top-0 bottom-0 w-px"
            style={{
              left: `${(i + 1) * 16.66}%`,
              backgroundColor: `${BRUTAL.midGray}33`,
            }}
          />
        ))}
        {[...Array(4)].map((_, i) => (
          <div
            key={`hline-${i}`}
            className="grid-line absolute left-0 right-0 h-px"
            style={{
              top: `${(i + 1) * 25}%`,
              backgroundColor: `${BRUTAL.midGray}22`,
            }}
          />
        ))}
      </div>

      {/* Top edge marker */}
      <div className="absolute top-0 left-0 right-0 flex items-center">
        <div className="h-2 flex-1" style={{ backgroundColor: BRUTAL.yellow }} />
      </div>

      <div className="relative z-10 px-6 md:px-12 lg:px-20 pt-20">
        {/* Headline */}
        <div ref={headlineRef} className="mb-6">
          <h1 className="font-mono font-bold uppercase tracking-[0.2em] text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-none">
            {heroText.split('').map((char, i) => (
              <span
                key={i}
                className="hero-char inline-block"
                style={{
                  color: char === '/' ? BRUTAL.yellow : BRUTAL.offWhite,
                  marginRight: char === ' ' ? '0.3em' : undefined,
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
          </h1>
        </div>

        {/* Yellow accent bar */}
        <div
          className="yellow-bar h-2 w-full max-w-2xl mb-8 rounded-none"
          style={{ backgroundColor: BRUTAL.yellow }}
        />

        {/* Subtitle */}
        <div className="hero-subtitle max-w-xl">
          <p
            className="font-mono text-sm md:text-base tracking-[0.15em] uppercase leading-relaxed"
            style={{ color: BRUTAL.concrete }}
          >
            Raw. Honest. Utilitarian. Anti-design design.
            <br />
            Like a construction site blueprint — every mark has purpose.
          </p>
        </div>

        {/* Bottom markers */}
        <div className="mt-16 flex items-center gap-6">
          <span
            className="font-mono text-xs tracking-[0.3em] uppercase"
            style={{ color: BRUTAL.concrete }}
          >
            DESIGN SYSTEM V1.0
          </span>
          <div className="h-px flex-1" style={{ backgroundColor: BRUTAL.midGray }} />
          <span
            className="font-mono text-xs tracking-[0.3em] uppercase"
            style={{ color: BRUTAL.yellow }}
          >
            2024—2025
          </span>
        </div>
      </div>
    </section>
  )
}

// =============================================================
// PHILOSOPHY SECTION
// =============================================================

function PhilosophySection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!sectionRef.current) return

      const cards = sectionRef.current.querySelectorAll('.philosophy-card')
      gsap.set(cards, { y: 60, opacity: 0 })

      ScrollTrigger.batch(cards, {
        onEnter: (batch) => {
          gsap.to(batch, {
            y: 0,
            opacity: 1,
            stagger: 0.15,
            duration: 0.8,
            ease: 'power4.out',
          })
        },
        start: 'top 80%',
        once: true,
      })
    },
    { scope: sectionRef }
  )

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ backgroundColor: BRUTAL.offWhite }}
    >
      {/* Top border */}
      <div className="h-2" style={{ backgroundColor: BRUTAL.black }} />

      <div className="px-6 md:px-12 lg:px-20 py-20">
        <SectionLabel number="01" title="PRINCIPLES" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {PHILOSOPHY_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.id}
                className="philosophy-card border-2 rounded-none p-6 md:p-8 transition-transform duration-150 hover:-translate-y-1"
                style={{
                  borderColor: BRUTAL.black,
                  backgroundColor: BRUTAL.offWhite,
                }}
              >
                {/* Top accent strip */}
                <div
                  className="h-2 w-full mb-6 rounded-none"
                  style={{ backgroundColor: item.accent }}
                />

                {/* Number */}
                <span
                  className="font-mono text-xs tracking-[0.3em] block mb-4"
                  style={{ color: BRUTAL.concrete }}
                >
                  {item.id}{'//'}
                </span>

                {/* Icon */}
                <div className="mb-4">
                  <Icon
                    className="w-8 h-8"
                    style={{ color: item.accent === BRUTAL.offWhite ? BRUTAL.black : item.accent }}
                  />
                </div>

                {/* Title */}
                <h3
                  className="font-mono font-bold uppercase tracking-[0.2em] text-lg md:text-xl mb-2"
                  style={{ color: BRUTAL.black }}
                >
                  {item.title}
                </h3>

                {/* Subtitle */}
                <span
                  className="font-mono text-xs tracking-[0.2em] uppercase block mb-4"
                  style={{ color: item.accent === BRUTAL.offWhite ? BRUTAL.concrete : item.accent }}
                >
                  {item.subtitle}
                </span>

                {/* Description */}
                <p
                  className="font-mono text-sm leading-relaxed"
                  style={{ color: BRUTAL.midGray }}
                >
                  {item.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// =============================================================
// SPECS SECTION
// =============================================================

function SpecsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!sectionRef.current) return

      // Color swatches stagger
      const swatches = sectionRef.current.querySelectorAll('.color-swatch')
      gsap.set(swatches, { y: 30, opacity: 0 })
      ScrollTrigger.batch(swatches, {
        onEnter: (batch) => {
          gsap.to(batch, {
            y: 0,
            opacity: 1,
            stagger: 0.08,
            duration: 0.6,
            ease: 'power4.out',
          })
        },
        start: 'top 80%',
        once: true,
      })

      // Type specs
      const typeRows = sectionRef.current.querySelectorAll('.type-row')
      gsap.set(typeRows, { x: -30, opacity: 0 })
      ScrollTrigger.batch(typeRows, {
        onEnter: (batch) => {
          gsap.to(batch, {
            x: 0,
            opacity: 1,
            stagger: 0.06,
            duration: 0.5,
            ease: 'power4.out',
          })
        },
        start: 'top 80%',
        once: true,
      })

      // Spacing rules
      const spacingRows = sectionRef.current.querySelectorAll('.spacing-row')
      gsap.set(spacingRows, { y: 20, opacity: 0 })
      ScrollTrigger.batch(spacingRows, {
        onEnter: (batch) => {
          gsap.to(batch, {
            y: 0,
            opacity: 1,
            stagger: 0.06,
            duration: 0.5,
            ease: 'power4.out',
          })
        },
        start: 'top 80%',
        once: true,
      })
    },
    { scope: sectionRef }
  )

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ backgroundColor: BRUTAL.black }}
    >
      {/* Top border */}
      <div className="h-2" style={{ backgroundColor: BRUTAL.yellow }} />

      <div className="px-6 md:px-12 lg:px-20 py-20">
        <SectionLabel number="02" title="SPECIFICATIONS" />

        {/* COLOR PALETTE */}
        <div className="mb-16">
          <h3
            className="font-mono font-bold uppercase tracking-[0.2em] text-lg mb-6"
            style={{ color: BRUTAL.offWhite }}
          >
            <Paintbrush className="w-5 h-5 inline-block mr-3" style={{ color: BRUTAL.yellow }} />
            COLOR PALETTE
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-0">
            {COLOR_SWATCHES.map((swatch) => (
              <div
                key={swatch.name}
                className="color-swatch border-2 rounded-none"
                style={{ borderColor: BRUTAL.midGray }}
              >
                {/* Swatch block */}
                <div
                  className="h-20 md:h-28 w-full rounded-none"
                  style={{ backgroundColor: swatch.hex }}
                />
                {/* Label */}
                <div
                  className="p-3 border-t-2"
                  style={{ borderColor: BRUTAL.midGray }}
                >
                  <span
                    className="font-mono text-xs tracking-[0.2em] uppercase block"
                    style={{ color: BRUTAL.offWhite }}
                  >
                    {swatch.name}
                  </span>
                  <span
                    className="font-mono text-xs tracking-wider block mt-1"
                    style={{ color: BRUTAL.concrete }}
                  >
                    {swatch.hex}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TYPOGRAPHY SPECS */}
        <div className="mb-16">
          <h3
            className="font-mono font-bold uppercase tracking-[0.2em] text-lg mb-6"
            style={{ color: BRUTAL.offWhite }}
          >
            <Type className="w-5 h-5 inline-block mr-3" style={{ color: BRUTAL.yellow }} />
            TYPOGRAPHY
          </h3>
          <div className="border-2 rounded-none overflow-hidden" style={{ borderColor: BRUTAL.midGray }}>
            {/* Table header */}
            <div
              className="grid grid-cols-3 gap-0 border-b-2"
              style={{ borderColor: BRUTAL.midGray, backgroundColor: BRUTAL.darkGray }}
            >
              <div className="p-3 border-r-2" style={{ borderColor: BRUTAL.midGray }}>
                <span className="font-mono text-xs tracking-[0.2em] uppercase" style={{ color: BRUTAL.yellow }}>
                  PROPERTY
                </span>
              </div>
              <div className="p-3 border-r-2" style={{ borderColor: BRUTAL.midGray }}>
                <span className="font-mono text-xs tracking-[0.2em] uppercase" style={{ color: BRUTAL.yellow }}>
                  VALUE
                </span>
              </div>
              <div className="p-3">
                <span className="font-mono text-xs tracking-[0.2em] uppercase" style={{ color: BRUTAL.yellow }}>
                  SPECIMEN
                </span>
              </div>
            </div>
            {/* Table rows */}
            {TYPOGRAPHY_SPECS.map((spec, i) => (
              <div
                key={spec.label}
                className={`type-row grid grid-cols-3 gap-0 ${
                  i < TYPOGRAPHY_SPECS.length - 1 ? 'border-b-2' : ''
                }`}
                style={{ borderColor: BRUTAL.midGray }}
              >
                <div className="p-3 border-r-2" style={{ borderColor: BRUTAL.midGray }}>
                  <span className="font-mono text-xs tracking-[0.2em] uppercase" style={{ color: BRUTAL.concrete }}>
                    {spec.label}
                  </span>
                </div>
                <div className="p-3 border-r-2" style={{ borderColor: BRUTAL.midGray }}>
                  <span className="font-mono text-xs tracking-wider" style={{ color: BRUTAL.offWhite }}>
                    {spec.value}
                  </span>
                </div>
                <div className="p-3">
                  <span
                    className="font-mono font-bold uppercase tracking-[0.2em] text-sm"
                    style={{ color: BRUTAL.lightGray }}
                  >
                    {spec.specimen}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SPACING RULES */}
        <div>
          <h3
            className="font-mono font-bold uppercase tracking-[0.2em] text-lg mb-6"
            style={{ color: BRUTAL.offWhite }}
          >
            <Ruler className="w-5 h-5 inline-block mr-3" style={{ color: BRUTAL.yellow }} />
            SPACING SYSTEM
          </h3>
          <div className="border-2 rounded-none overflow-hidden" style={{ borderColor: BRUTAL.midGray }}>
            {/* Table header */}
            <div
              className="grid grid-cols-3 gap-0 border-b-2"
              style={{ borderColor: BRUTAL.midGray, backgroundColor: BRUTAL.darkGray }}
            >
              <div className="p-3 border-r-2" style={{ borderColor: BRUTAL.midGray }}>
                <span className="font-mono text-xs tracking-[0.2em] uppercase" style={{ color: BRUTAL.yellow }}>
                  TOKEN
                </span>
              </div>
              <div className="p-3 border-r-2" style={{ borderColor: BRUTAL.midGray }}>
                <span className="font-mono text-xs tracking-[0.2em] uppercase" style={{ color: BRUTAL.yellow }}>
                  VALUE
                </span>
              </div>
              <div className="p-3">
                <span className="font-mono text-xs tracking-[0.2em] uppercase" style={{ color: BRUTAL.yellow }}>
                  USAGE
                </span>
              </div>
            </div>
            {/* Table rows */}
            {SPACING_RULES.map((rule, i) => (
              <div
                key={rule.rule}
                className={`spacing-row grid grid-cols-3 gap-0 ${
                  i < SPACING_RULES.length - 1 ? 'border-b-2' : ''
                }`}
                style={{ borderColor: BRUTAL.midGray }}
              >
                <div className="p-3 border-r-2" style={{ borderColor: BRUTAL.midGray }}>
                  <span className="font-mono text-xs tracking-[0.2em] uppercase" style={{ color: BRUTAL.concrete }}>
                    {rule.rule}
                  </span>
                </div>
                <div className="p-3 border-r-2" style={{ borderColor: BRUTAL.midGray }}>
                  <span className="font-mono text-xs tracking-wider" style={{ color: BRUTAL.offWhite }}>
                    {rule.value}
                  </span>
                </div>
                <div className="p-3">
                  <span className="font-mono text-xs tracking-wider" style={{ color: BRUTAL.lightGray }}>
                    {rule.usage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// =============================================================
// WORK SECTION
// =============================================================

function WorkSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!sectionRef.current) return

      const cards = sectionRef.current.querySelectorAll('.work-card')
      gsap.set(cards, { y: 80, opacity: 0 })

      ScrollTrigger.batch(cards, {
        onEnter: (batch) => {
          gsap.to(batch, {
            y: 0,
            opacity: 1,
            stagger: 0.2,
            duration: 1,
            ease: 'expo.out',
          })
        },
        start: 'top 80%',
        once: true,
      })
    },
    { scope: sectionRef }
  )

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ backgroundColor: BRUTAL.offWhite }}
    >
      {/* Top border */}
      <div className="h-2" style={{ backgroundColor: BRUTAL.red }} />

      <div className="px-6 md:px-12 lg:px-20 py-20">
        <SectionLabel number="03" title="SELECTED WORK" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {PROJECTS.map((project) => (
            <div
              key={project.id}
              className="work-card border-2 rounded-none transition-all duration-150 hover:-translate-y-1 group"
              style={{
                borderColor: BRUTAL.black,
                backgroundColor: BRUTAL.offWhite,
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget
                el.style.boxShadow = `6px 6px 0 ${project.color}`
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget
                el.style.boxShadow = 'none'
              }}
            >
              {/* Color strip header */}
              <div
                className="h-3 w-full rounded-none"
                style={{ backgroundColor: project.color }}
              />

              {/* Image */}
              <div
                className="relative overflow-hidden border-b-2"
                style={{ borderColor: BRUTAL.black }}
              >
                <div className="aspect-[4/3] bg-[#1A1A1A] relative">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                    loading="lazy"
                  />
                  {/* Overlay label */}
                  <div
                    className="absolute top-0 left-0 px-3 py-1.5 font-mono text-xs tracking-[0.2em] uppercase"
                    style={{
                      backgroundColor: project.color,
                      color: project.color === BRUTAL.concrete ? BRUTAL.offWhite : BRUTAL.black,
                    }}
                  >
                    {project.category}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 md:p-6">
                {/* Number + Year */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="font-mono text-xs tracking-[0.3em] uppercase"
                    style={{ color: BRUTAL.concrete }}
                  >
                    {project.id}{'//'}
                  </span>
                  <span
                    className="font-mono text-xs tracking-[0.2em]"
                    style={{ color: BRUTAL.concrete }}
                  >
                    {project.year}
                  </span>
                </div>

                {/* Title */}
                <h3
                  className="font-mono font-bold uppercase tracking-[0.2em] text-xl md:text-2xl mb-3"
                  style={{ color: BRUTAL.black }}
                >
                  {project.title}
                </h3>

                {/* Description */}
                <p
                  className="font-mono text-sm leading-relaxed mb-4"
                  style={{ color: BRUTAL.midGray }}
                >
                  {project.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-0">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-xs tracking-[0.15em] uppercase px-3 py-1.5 border-2 border-t-0 first:border-t-2 last:border-r-2 rounded-none"
                      style={{
                        borderColor: BRUTAL.black,
                        color: BRUTAL.black,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Link indicator */}
                <div className="mt-5 flex items-center gap-2 group-hover:gap-3 transition-all duration-150">
                  <span
                    className="font-mono text-xs tracking-[0.2em] uppercase"
                    style={{ color: project.color === BRUTAL.concrete ? BRUTAL.midGray : project.color }}
                  >
                    VIEW PROJECT
                  </span>
                  <ChevronRight
                    className="w-4 h-4"
                    style={{ color: project.color === BRUTAL.concrete ? BRUTAL.midGray : project.color }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// =============================================================
// MANIFESTO SECTION (bonus — bridges work and footer)
// =============================================================

function ManifestoSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!sectionRef.current) return

      const lines = sectionRef.current.querySelectorAll('.manifesto-line')
      gsap.set(lines, { y: 30, opacity: 0 })

      ScrollTrigger.batch(lines, {
        onEnter: (batch) => {
          gsap.to(batch, {
            y: 0,
            opacity: 1,
            stagger: 0.1,
            duration: 0.7,
            ease: 'power4.out',
          })
        },
        start: 'top 80%',
        once: true,
      })
    },
    { scope: sectionRef }
  )

  const manifestoLines = [
    'NO ROUNDED CORNERS.',
    'NO SOFT GRADIENTS.',
    'NO DECORATIVE WHITESPACE.',
    'EVERY BORDER IS STRUCTURAL.',
    'EVERY COLOR IS INTENTIONAL.',
    'THE GRID IS NOT A SUGGESTION.',
  ]

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ backgroundColor: BRUTAL.black }}
    >
      <div className="h-2" style={{ backgroundColor: BRUTAL.yellow }} />

      <div className="px-6 md:px-12 lg:px-20 py-24 md:py-32">
        <SectionLabel number="04" title="MANIFESTO" />

        <div className="max-w-3xl">
          {manifestoLines.map((line, i) => (
            <div
              key={i}
              className="manifesto-line flex items-center gap-4 py-3 border-b"
              style={{ borderColor: `${BRUTAL.midGray}44` }}
            >
              <span
                className="font-mono text-xs tracking-[0.3em] shrink-0"
                style={{ color: BRUTAL.yellow }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span
                className="font-mono font-bold uppercase tracking-[0.25em] text-xl md:text-3xl lg:text-4xl"
                style={{ color: BRUTAL.offWhite }}
              >
                {line}
              </span>
            </div>
          ))}
        </div>

        {/* Yellow accent endmark */}
        <div className="mt-12 flex items-center gap-4">
          <div className="w-16 h-2 rounded-none" style={{ backgroundColor: BRUTAL.yellow }} />
          <span
            className="font-mono text-xs tracking-[0.3em] uppercase"
            style={{ color: BRUTAL.concrete }}
          >
            END MANIFESTO
          </span>
        </div>
      </div>
    </section>
  )
}

// =============================================================
// FOOTER
// =============================================================

function BrutalFooter({ onSwitchView, onNavigate }: { onSwitchView: (view: string) => void; onNavigate: (view: string) => void }) {
  return (
    <footer
      className="relative"
      style={{ backgroundColor: BRUTAL.darkGray }}
    >
      <div className="h-1" style={{ backgroundColor: BRUTAL.yellow }} />

      <div className="px-6 md:px-12 lg:px-20 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Left — identity */}
          <div>
            <span
              className="font-mono font-bold uppercase tracking-[0.3em] text-sm block"
              style={{ color: BRUTAL.offWhite }}
            >
              BRUTALIST / INDUSTRIAL
            </span>
            <span
              className="font-mono text-xs tracking-[0.2em] uppercase block mt-1"
              style={{ color: BRUTAL.concrete }}
            >
              DESIGN SYSTEM — V1.0 — 2024/2025
            </span>
          </div>

          {/* Right — backlinks */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('home')}
              className="group flex items-center gap-3 border-2 rounded-none px-5 py-3 transition-all duration-150 hover:-translate-y-0.5"
              style={{
                borderColor: BRUTAL.offWhite,
                backgroundColor: 'transparent',
                color: BRUTAL.offWhite,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = BRUTAL.offWhite
                e.currentTarget.style.color = BRUTAL.black
                e.currentTarget.style.boxShadow = `4px 4px 0 ${BRUTAL.yellow}`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = BRUTAL.offWhite
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <ArrowLeft className="w-4 h-4 transition-transform duration-150 group-hover:-translate-x-1" />
              <span className="font-mono text-xs tracking-[0.2em] uppercase font-bold">
                HOME
              </span>
            </button>
            <button
              onClick={() => onSwitchView('frontend-design')}
              className="group flex items-center gap-3 border-2 rounded-none px-5 py-3 transition-all duration-150 hover:-translate-y-0.5"
              style={{
                borderColor: BRUTAL.yellow,
                backgroundColor: 'transparent',
                color: BRUTAL.yellow,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = BRUTAL.yellow
                e.currentTarget.style.color = BRUTAL.black
                e.currentTarget.style.boxShadow = `4px 4px 0 ${BRUTAL.offWhite}`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = BRUTAL.yellow
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <span className="font-mono text-xs tracking-[0.2em] uppercase font-bold">
                DESIGN LAB
              </span>
              <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Bottom raw line */}
        <div className="mt-8 pt-4 border-t flex items-center gap-4" style={{ borderColor: `${BRUTAL.midGray}44` }}>
          <CornerDownLeft className="w-3 h-3" style={{ color: BRUTAL.concrete }} />
          <span
            className="font-mono text-xs tracking-[0.2em] uppercase"
            style={{ color: BRUTAL.concrete }}
          >
            BUILT WITH RAW MATERIALS — NEXT.JS — GSAP — FRAMER MOTION — TYPESCRIPT
          </span>
        </div>
      </div>
    </footer>
  )
}

// =============================================================
// MAIN COMPONENT
// =============================================================

interface BrutalistDesignViewProps {
  onSwitchView: (view: string) => void
  onNavigate: (view: string) => void
}

export default function BrutalistDesignView({
  onSwitchView,
  onNavigate,
}: BrutalistDesignViewProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="brutalist-view"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="min-h-screen"
        style={{ backgroundColor: BRUTAL.black }}
      >
        {/* Scroll container */}
        <div className="w-full">
          <HeroSection />
          <PhilosophySection />
          <SpecsSection />
          <WorkSection />
          <ManifestoSection />
          <BrutalFooter onSwitchView={onSwitchView} onNavigate={onNavigate} />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
