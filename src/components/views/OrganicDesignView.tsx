'use client'

import React, { useRef } from 'react'
import {
  motion,
  useInView,
  useScroll,
  useTransform,
} from 'framer-motion'
import {
  Leaf,
  Droplets,
  Wind,
  Sun,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Palette,
  Heart,
  Sparkles,
} from 'lucide-react'

// =============================================================
// TYPES & DATA
// =============================================================

interface OrganicDesignViewProps {
  onSwitchView: (view: string) => void
  onNavigate: (view: string) => void
}

const COLORS = {
  warmWhite: '#FAFAF7',
  sage: '#8B9E7E',
  clay: '#C4A882',
  softCharcoal: '#3A3A3A',
  earthBrown: '#6B5B4E',
  mutedGold: '#BFA76A',
}

const PALETTE = [
  { name: 'warm white', hex: '#FAFAF7', textColor: '#3A3A3A' },
  { name: 'sage green', hex: '#8B9E7E', textColor: '#FFFFFF' },
  { name: 'clay', hex: '#C4A882', textColor: '#FFFFFF' },
  { name: 'soft charcoal', hex: '#3A3A3A', textColor: '#FFFFFF' },
  { name: 'earth brown', hex: '#6B5B4E', textColor: '#FFFFFF' },
  { name: 'muted gold', hex: '#BFA76A', textColor: '#FFFFFF' },
]

const PHILOSOPHY_ITEMS = [
  {
    icon: Wind,
    title: 'breathing space',
    description:
      'Design that respects emptiness as much as content. Every element earns its place through purpose, not decoration. The whitespace between elements is the silence between notes — essential, not optional.',
    accent: COLORS.sage,
  },
  {
    icon: Droplets,
    title: 'natural flow',
    description:
      'Interfaces that move like water — finding the path of least resistance, guiding the eye with organic curves and intuitive rhythm. No sharp edges, no jarring transitions, just graceful motion.',
    accent: COLORS.clay,
  },
  {
    icon: Leaf,
    title: 'tactile warmth',
    description:
      'Digital experiences that feel handmade, like linen on skin or ceramics in palm. Soft shadows, warm tones, and subtle textures that invite touch and reward attention.',
    accent: COLORS.earthBrown,
  },
  {
    icon: Sun,
    title: 'gentle light',
    description:
      'Illumination that feels like morning sun through linen curtains — diffused, warm, never harsh. Light reveals form softly, creating depth without drama.',
    accent: COLORS.mutedGold,
  },
]

const PROJECTS = [
  {
    title: 'terracotta studio',
    category: 'brand identity',
    description:
      'A ceramics studio website where organic shapes meet minimal navigation. Warm photography, breathing layouts, and a palette drawn from the workshop floor.',
    gradient: `linear-gradient(135deg, ${COLORS.clay}40, ${COLORS.earthBrown}30)`,
    tags: ['branding', 'web design', 'photography'],
  },
  {
    title: 'linen & thread',
    category: 'e-commerce',
    description:
      'Sustainable fashion retailer built on stillness. Product pages that feel like browsing a quiet atelier, with gentle parallax and fabric-inspired textures.',
    gradient: `linear-gradient(135deg, ${COLORS.sage}40, ${COLORS.mutedGold}30)`,
    tags: ['e-commerce', 'ux design', 'sustainability'],
  },
  {
    title: 'hearth journal',
    category: 'editorial',
    description:
      'A digital publication celebrating slow living. Generous typography, unhurried scroll, and editorial layouts that honor the reading experience.',
    gradient: `linear-gradient(135deg, ${COLORS.mutedGold}40, ${COLORS.clay}30)`,
    tags: ['editorial', 'typography', 'content design'],
  },
]

// =============================================================
// ANIMATION VARIANTS
// =============================================================

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.4, 0.25, 1] },
  },
}

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 20 },
  },
}

const fadeInVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] },
  },
}

// =============================================================
// ORGANIC SVG WAVE DIVIDER
// =============================================================

function WaveDivider({ flip = false, color = COLORS.warmWhite }: { flip?: boolean; color?: string }) {
  return (
    <div className={`w-full overflow-hidden leading-[0] ${flip ? 'rotate-180' : ''}`}>
      <svg
        viewBox="0 0 1440 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        preserveAspectRatio="none"
      >
        <path
          d="M0 40C240 80 480 0 720 40C960 80 1200 0 1440 40V80H0V40Z"
          fill={color}
        />
      </svg>
    </div>
  )
}

// =============================================================
// DECORATIVE BLOB
// =============================================================

function DecorativeBlob({
  color,
  size = 300,
  x = 'right',
  y = 'top',
  opacity = 0.15,
}: {
  color: string
  size?: number
  x?: 'left' | 'right'
  y?: 'top' | 'bottom'
  opacity?: number
}) {
  return (
    <div
      className={`absolute ${x === 'right' ? 'right-0' : 'left-0'} ${y === 'top' ? 'top-0' : 'bottom-0'} -z-10 pointer-events-none`}
      style={{ opacity }}
    >
      <svg width={size} height={size} viewBox="0 0 300 300" fill="none">
        <path
          d="M150 30C200 10 260 50 270 110C280 170 250 230 200 260C150 290 90 280 50 240C10 200 0 140 30 90C60 40 100 50 150 30Z"
          fill={color}
        />
      </svg>
    </div>
  )
}

// =============================================================
// HERO SECTION
// =============================================================

function HeroSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, 80])
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])

  return (
    <section
      ref={ref}
      className="relative min-h-[85vh] flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: COLORS.warmWhite }}
    >
      {/* Soft gradient overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `linear-gradient(160deg, ${COLORS.sage}50 0%, ${COLORS.clay}40 50%, ${COLORS.mutedGold}30 100%)`,
        }}
      />

      {/* Decorative blobs */}
      <DecorativeBlob color={COLORS.sage} size={400} x="right" y="top" opacity={0.1} />
      <DecorativeBlob color={COLORS.clay} size={350} x="left" y="bottom" opacity={0.08} />

      {/* Content */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 text-center px-6 md:px-12"
      >
        {/* Subtle label */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
          className="text-sm tracking-[0.2em] uppercase mb-6"
          style={{ color: COLORS.sage }}
        >
          design aesthetic
        </motion.p>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: 'spring',
            stiffness: 80,
            damping: 20,
            delay: 0.3,
          }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-tight leading-[1.1]"
          style={{ color: COLORS.softCharcoal }}
        >
          organic
          <span className="inline-block mx-3 md:mx-5 text-[#8B9E7E]">/</span>
          <span className="italic font-extralight" style={{ color: COLORS.earthBrown }}>
            minimalism
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: 'spring',
            stiffness: 80,
            damping: 20,
            delay: 0.5,
          }}
          className="mt-8 text-base md:text-lg font-light max-w-lg mx-auto leading-relaxed"
          style={{ color: COLORS.earthBrown }}
        >
          where calm meets craft — design that breathes, flows, and feels like home
        </motion.p>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-16"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-5 h-8 rounded-full border-2 mx-auto flex items-start justify-center pt-1.5"
            style={{ borderColor: `${COLORS.sage}60` }}
          >
            <div
              className="w-1 h-1.5 rounded-full"
              style={{ backgroundColor: COLORS.sage }}
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <WaveDivider color={COLORS.warmWhite} flip />
      </div>
    </section>
  )
}

// =============================================================
// PHILOSOPHY SECTION
// =============================================================

function PhilosophySection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section
      ref={ref}
      className="py-32 md:py-40 relative"
      style={{ backgroundColor: COLORS.warmWhite }}
    >
      <DecorativeBlob color={COLORS.mutedGold} size={250} x="right" y="top" opacity={0.06} />

      <div className="max-w-5xl mx-auto px-6 md:px-12">
        {/* Section label */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <motion.p
            variants={fadeUpVariant}
            className="text-sm tracking-[0.2em] uppercase mb-4"
            style={{ color: COLORS.sage }}
          >
            philosophy
          </motion.p>
          <motion.h2
            variants={fadeUpVariant}
            className="text-3xl md:text-4xl font-light tracking-tight mb-20"
            style={{ color: COLORS.softCharcoal }}
          >
            design rooted in <span className="italic" style={{ color: COLORS.earthBrown }}>nature</span>
          </motion.h2>
        </motion.div>

        {/* Alternating cards */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="space-y-16 md:space-y-24"
        >
          {PHILOSOPHY_ITEMS.map((item, index) => {
            const Icon = item.icon
            const isEven = index % 2 === 0

            return (
              <motion.div
                key={item.title}
                variants={fadeUpVariant}
                className={`flex flex-col md:flex-row items-center gap-8 md:gap-16 ${
                  isEven ? '' : 'md:flex-row-reverse'
                }`}
              >
                {/* Icon area */}
                <div className="flex-shrink-0">
                  <motion.div
                    whileHover={{
                      scale: 1.05,
                      transition: { type: 'spring', stiffness: 150, damping: 15 },
                    }}
                    className="w-28 h-28 md:w-36 md:h-36 rounded-3xl flex items-center justify-center"
                    style={{
                      backgroundColor: `${item.accent}15`,
                      border: `1px solid ${item.accent}20`,
                    }}
                  >
                    <Icon
                      className="w-10 h-10 md:w-12 md:h-12"
                      style={{ color: item.accent }}
                      strokeWidth={1.5}
                    />
                  </motion.div>
                </div>

                {/* Text content */}
                <div className={`text-center md:text-left ${isEven ? 'md:text-left' : 'md:text-right'}`}>
                  <h3
                    className="text-xl md:text-2xl font-light tracking-wide mb-3"
                    style={{ color: COLORS.softCharcoal }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-sm md:text-base font-light leading-relaxed max-w-md"
                    style={{ color: COLORS.earthBrown }}
                  >
                    {item.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

// =============================================================
// PALETTE SECTION
// =============================================================

function PaletteSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      ref={ref}
      className="py-32 md:py-40 relative"
      style={{ backgroundColor: `${COLORS.sage}12` }}
    >
      <WaveDivider color={COLORS.warmWhite} />

      <div className="max-w-5xl mx-auto px-6 md:px-12">
        {/* Section label */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <motion.p
            variants={fadeUpVariant}
            className="text-sm tracking-[0.2em] uppercase mb-4"
            style={{ color: COLORS.sage }}
          >
            palette
          </motion.p>
          <motion.h2
            variants={fadeUpVariant}
            className="text-3xl md:text-4xl font-light tracking-tight mb-16"
            style={{ color: COLORS.softCharcoal }}
          >
            colors from the <span className="italic" style={{ color: COLORS.clay }}>earth</span>
          </motion.h2>
        </motion.div>

        {/* Color blobs */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="flex flex-wrap justify-center gap-8 md:gap-12"
        >
          {PALETTE.map((color) => (
            <motion.div
              key={color.name}
              variants={fadeUpVariant}
              whileHover={{
                scale: 1.1,
                transition: { type: 'spring', stiffness: 150, damping: 12 },
              }}
              className="flex flex-col items-center gap-4 cursor-default"
            >
              {/* Organic blob shape */}
              <div className="relative">
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                  <path
                    d="M50 10C65 5 85 20 88 40C91 60 80 82 60 88C40 94 18 82 12 62C6 42 35 15 50 10Z"
                    fill={color.hex}
                    className="transition-shadow duration-300"
                  />
                </svg>
                {/* Soft glow on hover */}
                <div
                  className="absolute inset-0 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"
                  style={{ backgroundColor: color.hex, opacity: 0.3 }}
                />
              </div>

              {/* Color info */}
              <div className="text-center">
                <p
                  className="text-xs tracking-widest lowercase"
                  style={{ color: COLORS.softCharcoal }}
                >
                  {color.name}
                </p>
                <p
                  className="text-[10px] mt-1 font-mono tracking-wider"
                  style={{ color: COLORS.earthBrown }}
                >
                  {color.hex}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="mt-8">
        <WaveDivider flip color={COLORS.warmWhite} />
      </div>
    </section>
  )
}

// =============================================================
// WORK SECTION
// =============================================================

function WorkSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      ref={ref}
      className="py-32 md:py-40 relative"
      style={{ backgroundColor: COLORS.warmWhite }}
    >
      <DecorativeBlob color={COLORS.clay} size={300} x="left" y="bottom" opacity={0.06} />

      <div className="max-w-5xl mx-auto px-6 md:px-12">
        {/* Section label */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <motion.p
            variants={fadeUpVariant}
            className="text-sm tracking-[0.2em] uppercase mb-4"
            style={{ color: COLORS.sage }}
          >
            selected work
          </motion.p>
          <motion.h2
            variants={fadeUpVariant}
            className="text-3xl md:text-4xl font-light tracking-tight mb-16"
            style={{ color: COLORS.softCharcoal }}
          >
            crafted with <span className="italic" style={{ color: COLORS.mutedGold }}>intention</span>
          </motion.h2>
        </motion.div>

        {/* Project cards */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
        >
          {PROJECTS.map((project) => (
            <motion.div
              key={project.title}
              variants={fadeUpVariant}
              whileHover={{
                y: -8,
                transition: { type: 'spring', stiffness: 200, damping: 15 },
              }}
              className="group cursor-pointer rounded-3xl shadow-lg border overflow-hidden"
              style={{
                backgroundColor: COLORS.warmWhite,
                borderColor: `${COLORS.sage}15`,
              }}
            >
              {/* Card image area with gradient */}
              <div
                className="h-48 md:h-56 relative overflow-hidden"
                style={{ background: project.gradient }}
              >
                {/* Decorative circles in card */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 15 }}
                    transition={{ type: 'spring', stiffness: 150, damping: 12 }}
                    className="w-24 h-24 rounded-full opacity-20"
                    style={{ backgroundColor: COLORS.softCharcoal }}
                  />
                </div>
                <div className="absolute top-6 right-6">
                  <ExternalLink
                    className="w-4 h-4 opacity-40 group-hover:opacity-70 transition-opacity duration-300"
                    style={{ color: COLORS.softCharcoal }}
                  />
                </div>
                {/* Category badge */}
                <div className="absolute bottom-4 left-4">
                  <span
                    className="text-[10px] tracking-[0.15em] uppercase px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: `${COLORS.warmWhite}90`,
                      color: COLORS.earthBrown,
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    {project.category}
                  </span>
                </div>
              </div>

              {/* Card content */}
              <div className="p-6">
                <h3
                  className="text-lg font-light tracking-wide mb-2"
                  style={{ color: COLORS.softCharcoal }}
                >
                  {project.title}
                </h3>
                <p
                  className="text-xs font-light leading-relaxed mb-4"
                  style={{ color: COLORS.earthBrown }}
                >
                  {project.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] tracking-wider lowercase px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor: `${COLORS.sage}12`,
                        color: COLORS.sage,
                        border: `1px solid ${COLORS.sage}20`,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// =============================================================
// PRINCIPLES DETAIL SECTION
// =============================================================

function PrinciplesSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  const principles = [
    {
      title: 'soft geometry',
      body: 'Replace sharp corners with generous radii. Every rectangle breathes a little. Rounded-2xl becomes the default, not the exception.',
      accent: COLORS.sage,
    },
    {
      title: 'muted palette',
      body: 'Colors drawn from stone, moss, clay, and linen. Desaturated, warm, and harmonious. The eye rests instead of searching.',
      accent: COLORS.clay,
    },
    {
      title: 'living motion',
      body: 'Spring-based transitions that feel physical. Elements ease into place like objects settling on a table — not snapping into position.',
      accent: COLORS.mutedGold,
    },
    {
      title: 'honest materials',
      body: 'What you see is what it is. No false depth, no simulated textures. Shadows are soft and close, never dramatic or distant.',
      accent: COLORS.earthBrown,
    },
  ]

  return (
    <section
      ref={ref}
      className="py-32 md:py-40 relative"
      style={{ backgroundColor: `${COLORS.clay}10` }}
    >
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        {/* Section label */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <motion.p
            variants={fadeUpVariant}
            className="text-sm tracking-[0.2em] uppercase mb-4"
            style={{ color: COLORS.clay }}
          >
            principles
          </motion.p>
          <motion.h2
            variants={fadeUpVariant}
            className="text-3xl md:text-4xl font-light tracking-tight mb-16"
            style={{ color: COLORS.softCharcoal }}
          >
            the <span className="italic" style={{ color: COLORS.earthBrown }}>rules</span> of organic design
          </motion.h2>
        </motion.div>

        {/* Principle cards — 2x2 grid */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {principles.map((p) => (
            <motion.div
              key={p.title}
              variants={fadeUpVariant}
              whileHover={{
                y: -4,
                transition: { type: 'spring', stiffness: 200, damping: 15 },
              }}
              className="p-8 rounded-2xl shadow-lg border"
              style={{
                backgroundColor: COLORS.warmWhite,
                borderColor: `${p.accent}15`,
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: p.accent }}
                />
                <h3
                  className="text-base tracking-widest lowercase"
                  style={{ color: COLORS.softCharcoal }}
                >
                  {p.title}
                </h3>
              </div>
              <p
                className="text-sm font-light leading-relaxed"
                style={{ color: COLORS.earthBrown }}
              >
                {p.body}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// =============================================================
// TYPOGRAPHY SHOWCASE SECTION
// =============================================================

function TypographySection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      ref={ref}
      className="py-32 md:py-40 relative"
      style={{ backgroundColor: COLORS.warmWhite }}
    >
      <DecorativeBlob color={COLORS.sage} size={280} x="left" y="top" opacity={0.05} />

      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <motion.p
            variants={fadeUpVariant}
            className="text-sm tracking-[0.2em] uppercase mb-4"
            style={{ color: COLORS.sage }}
          >
            typography
          </motion.p>
          <motion.h2
            variants={fadeUpVariant}
            className="text-3xl md:text-4xl font-light tracking-tight mb-20"
            style={{ color: COLORS.softCharcoal }}
          >
            words that <span className="italic" style={{ color: COLORS.clay }}>breathe</span>
          </motion.h2>
        </motion.div>

        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="space-y-12"
        >
          {/* Display size */}
          <motion.div variants={fadeUpVariant}>
            <p className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: COLORS.sage }}>
              display — 72px / light
            </p>
            <p
              className="text-5xl md:text-7xl font-light tracking-tight leading-[1.1]"
              style={{ color: COLORS.softCharcoal }}
            >
              organic forms
            </p>
          </motion.div>

          {/* Heading size */}
          <motion.div variants={fadeUpVariant}>
            <p className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: COLORS.clay }}>
              heading — 36px / light
            </p>
            <p
              className="text-3xl md:text-4xl font-light tracking-tight"
              style={{ color: COLORS.softCharcoal }}
            >
              where calm meets craft
            </p>
          </motion.div>

          {/* Body size */}
          <motion.div variants={fadeUpVariant}>
            <p className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: COLORS.earthBrown }}>
              body — 16px / light
            </p>
            <p
              className="text-base font-light leading-relaxed max-w-2xl"
              style={{ color: COLORS.earthBrown }}
            >
              Design that respects the natural rhythm of reading. Generous line height,
              comfortable measure, and weights that feel light on the page — never shouting,
              always whispering. The typography disappears so the content can speak.
            </p>
          </motion.div>

          {/* Label size */}
          <motion.div variants={fadeUpVariant}>
            <p className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: COLORS.mutedGold }}>
              label — 12px / wide tracking
            </p>
            <p
              className="text-xs tracking-[0.2em] uppercase"
              style={{ color: COLORS.softCharcoal }}
            >
              section labels &middot; categories &middot; navigation markers
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// =============================================================
// QUOTE / INTERLUDE SECTION
// =============================================================

function InterludeSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <section
      ref={ref}
      className="py-32 md:py-40 relative overflow-hidden"
      style={{ backgroundColor: `${COLORS.sage}15` }}
    >
      <DecorativeBlob color={COLORS.mutedGold} size={350} x="right" y="bottom" opacity={0.06} />

      <div className="max-w-3xl mx-auto px-6 md:px-12 text-center">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <motion.div variants={fadeInVariant} className="mb-8">
            <Heart className="w-8 h-8 mx-auto" style={{ color: `${COLORS.sage}60` }} strokeWidth={1.5} />
          </motion.div>

          <motion.blockquote
            variants={fadeUpVariant}
            className="text-2xl md:text-3xl font-extralight italic leading-relaxed tracking-wide"
            style={{ color: COLORS.softCharcoal }}
          >
            &ldquo;the details are not the details.
            <br />
            they make the design.&rdquo;
          </motion.blockquote>

          <motion.p
            variants={fadeUpVariant}
            className="mt-8 text-xs tracking-[0.2em] uppercase"
            style={{ color: COLORS.sage }}
          >
            — charles eames
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}

// =============================================================
// FOOTER
// =============================================================

function OrganicFooter({ onSwitchView, onNavigate }: { onSwitchView: (view: string) => void; onNavigate: (view: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-30px' })

  return (
    <footer
      ref={ref}
      className="py-20 md:py-28 relative"
      style={{ backgroundColor: COLORS.warmWhite }}
    >
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center"
        >
          {/* Back navigation */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <motion.button
              variants={fadeUpVariant}
              onClick={() => onNavigate('home')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border transition-all duration-300 hover:shadow-md group"
              style={{
                borderColor: `${COLORS.softCharcoal}20`,
                color: COLORS.softCharcoal,
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${COLORS.softCharcoal}08`
                e.currentTarget.style.borderColor = `${COLORS.softCharcoal}40`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.borderColor = `${COLORS.softCharcoal}20`
              }}
            >
              <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
              <span className="text-xs tracking-[0.15em] uppercase">home</span>
            </motion.button>
            <motion.button
              variants={fadeUpVariant}
              onClick={() => onSwitchView('frontend-design')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border transition-all duration-300 hover:shadow-md group"
              style={{
                borderColor: `${COLORS.sage}30`,
                color: COLORS.sage,
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${COLORS.sage}10`
                e.currentTarget.style.borderColor = `${COLORS.sage}50`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.borderColor = `${COLORS.sage}30`
              }}
            >
              <span className="text-xs tracking-[0.15em] uppercase">frontend design</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </motion.button>
          </div>

          {/* Branding */}
          <motion.div variants={fadeUpVariant}>
            <p
              className="text-2xl md:text-3xl font-light tracking-tight mb-3"
              style={{ color: COLORS.softCharcoal }}
            >
              organic<span className="mx-2" style={{ color: COLORS.sage }}>/</span>minimalism
            </p>
            <p
              className="text-xs tracking-widest uppercase"
              style={{ color: COLORS.earthBrown }}
            >
              a design study by mark.tech
            </p>
          </motion.div>

          {/* Divider */}
          <motion.div
            variants={fadeInVariant}
            className="my-8 flex items-center justify-center gap-3"
          >
            <div className="w-12 h-px" style={{ backgroundColor: `${COLORS.sage}30` }} />
            <Sparkles className="w-3 h-3" style={{ color: `${COLORS.sage}40` }} />
            <div className="w-12 h-px" style={{ backgroundColor: `${COLORS.sage}30` }} />
          </motion.div>

          {/* Colophon */}
          <motion.div
            variants={fadeInVariant}
            className="flex flex-wrap items-center justify-center gap-4 text-[10px] tracking-wider"
            style={{ color: COLORS.earthBrown }}
          >
            <span className="flex items-center gap-1.5">
              <Palette className="w-3 h-3" style={{ color: COLORS.sage }} />
              framer-motion
            </span>
            <span style={{ color: `${COLORS.sage}40` }}>&middot;</span>
            <span className="flex items-center gap-1.5">
              <Leaf className="w-3 h-3" style={{ color: COLORS.sage }} />
              spring physics
            </span>
            <span style={{ color: `${COLORS.sage}40` }}>&middot;</span>
            <span className="flex items-center gap-1.5">
              <Wind className="w-3 h-3" style={{ color: COLORS.sage }} />
              organic curves
            </span>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  )
}

// =============================================================
// MAIN COMPONENT
// =============================================================

export default function OrganicDesignView({ onSwitchView, onNavigate }: OrganicDesignViewProps) {
  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
      style={{ backgroundColor: COLORS.warmWhite }}
    >
      <HeroSection />
      <PhilosophySection />
      <PaletteSection />
      <TypographySection />
      <PrinciplesSection />
      <InterludeSection />
      <WorkSection />
      <OrganicFooter onSwitchView={onSwitchView} onNavigate={onNavigate} />
    </motion.div>
  )
}
