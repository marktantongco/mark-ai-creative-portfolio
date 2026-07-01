'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Image as ImageIcon, Code2, Terminal, BookOpen,
  Download, Eye, ChevronDown, ExternalLink,
  FolderOpen, Search, Filter, X, Loader2, Copy, Check,
  Map, ChevronLeft, ChevronRight, Compass, AlertTriangle, Link2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import CodeBlock from '@/components/CodeBlock'
import {
  RESEARCH_FILES, GUIDED_TOUR, type ViewKey, type ProjectFile, type TourStop,
} from '@/lib/subpage-data'
import {
  trackArtifactOpened, trackArtifactLatency, trackArtifactFailure,
  trackTourProgress, trackTourVsBrowse, trackDownloadAfterPreview,
  trackCopyToClipboard, trackSearchEmpty, trackFilterApplied,
  trackModalDwell, trackAsset404,
  getABVariant, trackABOutcome,
} from '@/lib/analytics'

// =============================================================
// FILE TYPE CONFIG
// =============================================================

const FILE_TYPE_CONFIG: Record<string, { icon: typeof FileText; color: string; label: string }> = {
  image: { icon: ImageIcon, color: '#e040fb', label: 'Image' },
  pdf: { icon: FileText, color: '#E63946', label: 'PDF' },
  script: { icon: Code2, color: '#49d08c', label: 'Python' },
  document: { icon: BookOpen, color: '#D4A017', label: 'Document' },
  shell: { icon: Terminal, color: '#f59e0b', label: 'Shell' },
  other: { icon: FileText, color: '#8C8C8C', label: 'File' },
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function detectLanguage(file: ProjectFile): string {
  const name = file.name.toLowerCase()
  if (name.endsWith('.py')) return 'python'
  if (name.endsWith('.sh')) return 'bash'
  if (name.endsWith('.md')) return 'markdown'
  if (name.endsWith('.html') || name.endsWith('.htm')) return 'markup'
  if (name.endsWith('.json')) return 'json'
  if (name.endsWith('.yml') || name.endsWith('.yaml')) return 'yaml'
  if (name.endsWith('.ts') || name.endsWith('.tsx')) return 'typescript'
  if (name.endsWith('.js') || name.endsWith('.jsx')) return 'javascript'
  return 'text'
}

// =============================================================
// TEXT CONTENT CACHE — Eagle resilience: avoid refetching
// =============================================================
// Note: Using a plain object instead of `new Map()` because Next.js 16
// Turbopack's minifier mangles the Map constructor reference at module
// scope (renames it to an identifier that later gets reassigned to []).
// See: TypeError: gV is not a constructor during prerender.
const textCache: Record<string, { content: string; fetchedAt: number }> = {}
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// =============================================================
// UNIVERSAL PREVIEW MODAL — handles all file types
// Dolphin: progressive transparency, copy-to-clipboard micro-interaction
// Eagle: state resilience (fetch + retry + cached fallback)
// =============================================================

function UniversalPreviewModal({ file, onClose, onNavigateTour, tourIndex }: {
  file: ProjectFile
  onClose: () => void
  onNavigateTour?: (direction: 'prev' | 'next') => void
  tourIndex?: number
}) {
  const [textContent, setTextContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [showSafariFallback, setShowSafariFallback] = useState(false)
  const safariTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const modalOpenTimeRef = useRef<number>(Date.now())
  const fetchStartRef = useRef<number>(0)
  const pdfLoadedRef = useRef<boolean>(false)

  // A/B test assignment for Safari fallback timer (Task C)
  // Variants: 2s, 3s, 5s — sticky per visitor via localStorage.
  // Outcome tracked when visitor either: PDF loads (success),
  // fallback shown + download clicked (fallback helpful), or
  // fallback shown + modal closed without download (fallback wasted).
  const safariTimerVariant = typeof window !== 'undefined'
    ? getABVariant('safari_pdf_fallback_timer', ['2000', '3000', '5000'], [1, 1, 1])
    : '3000'

  const isImage = file.type === 'image'
  const isPdf = file.type === 'pdf'
  const isTextLike = file.type === 'script' || file.type === 'shell' || file.type === 'document' || file.name.endsWith('.md') || file.name.endsWith('.html')

  // Fetch text content for scripts/shell/docs — with cache + retry
  const fetchContent = useCallback(async (attempt: number) => {
    if (!isTextLike) return

    // Check cache first
    const cached = textCache[file.path]
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
      setTextContent(cached.content)
      setLoading(false)
      setError(null)
      // Emit latency for cache hit (from open time)
      trackArtifactLatency(file, Date.now() - fetchStartRef.current)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch(file.path)
      if (!res.ok) {
        // Track failure with status code
        trackArtifactFailure(file, `HTTP ${res.status}`, res.status)
        if (res.status === 404) trackAsset404(file.path, 'fetch')
        throw new Error(`HTTP ${res.status}`)
      }
      const text = await res.text()
      textCache[file.path] = { content: text, fetchedAt: Date.now() }
      setTextContent(text)
      // Emit latency for successful fetch
      trackArtifactLatency(file, Date.now() - fetchStartRef.current)
    } catch (err) {
      // Single retry on network failure (Eagle resilience)
      if (attempt < 1) {
        setTimeout(() => {
          setRetryCount(attempt + 1)
          fetchContent(attempt + 1)
        }, 800)
        return
      }
      const errMsg = err instanceof Error ? err.message : 'Failed to load file'
      setError(errMsg)
      trackArtifactFailure(file, errMsg)
    } finally {
      setLoading(false)
    }
  }, [file.path, file, isTextLike])

  useEffect(() => {
    if (!isTextLike) return
    fetchStartRef.current = Date.now()
    fetchContent(0)
  }, [fetchContent, isTextLike])

  // Safari PDF fallback timer — A/B tested (Task C)
  // The timer threshold is the variant assigned to this visitor.
  // We also detect successful PDF load via the iframe onLoad event
  // so we can mark the experiment outcome as "success" and skip
  // showing the fallback overlay.
  useEffect(() => {
    if (!isPdf) return
    pdfLoadedRef.current = false
    setShowSafariFallback(false)
    const ms = parseInt(safariTimerVariant, 10)
    safariTimerRef.current = setTimeout(() => {
      if (!pdfLoadedRef.current) {
        setShowSafariFallback(true)
        // Track outcome: fallback was shown
        trackABOutcome('safari_pdf_fallback_timer', safariTimerVariant, 'fallback_shown', {
          file_name: file.name,
        })
      }
    }, ms)
    return () => {
      if (safariTimerRef.current) clearTimeout(safariTimerRef.current)
    }
  }, [isPdf, file.path, safariTimerVariant, file.name])

  // ESC to close, Arrow keys for tour navigation
  // Also emits modal_dwell_time_ms when the modal closes.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && onNavigateTour) onNavigateTour('prev')
      if (e.key === 'ArrowRight' && onNavigateTour) onNavigateTour('next')
    }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    modalOpenTimeRef.current = Date.now()
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
      // Emit dwell time
      const dwellMs = Date.now() - modalOpenTimeRef.current
      trackModalDwell(file, dwellMs)
    }
  }, [onClose, onNavigateTour, file])

  const handleCopy = useCallback(async () => {
    if (!textContent) return
    try {
      await navigator.clipboard.writeText(textContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      trackCopyToClipboard(file, 'modal')
    } catch { /* clipboard blocked */ }
  }, [textContent, file])

  // Track download clicks (download_after_preview metric)
  const handleDownloadClick = useCallback(() => {
    trackDownloadAfterPreview(file, Date.now() - modalOpenTimeRef.current)
    // If this was triggered after fallback was shown, mark experiment outcome
    if (isPdf && showSafariFallback) {
      trackABOutcome('safari_pdf_fallback_timer', safariTimerVariant, 'fallback_then_download', {
        file_name: file.name,
      })
    }
  }, [file, isPdf, showSafariFallback, safariTimerVariant])

  // Track successful PDF iframe load (marks A/B outcome as "success")
  const handlePdfLoad = useCallback(() => {
    pdfLoadedRef.current = true
    setShowSafariFallback(false)
    trackABOutcome('safari_pdf_fallback_timer', safariTimerVariant, 'pdf_loaded', {
      file_name: file.name,
      load_ms: Date.now() - modalOpenTimeRef.current,
    })
  }, [safariTimerVariant, file.name])

  const config = FILE_TYPE_CONFIG[file.type] || FILE_TYPE_CONFIG.other
  const Icon = config.icon
  const language = detectLanguage(file)
  const tourStop = GUIDED_TOUR.find(s => s.fileName === file.name)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative bg-card border border-border/60 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-border/50 bg-muted/30">
          <div className="flex items-center gap-3 min-w-0">
            {/* Tour navigation (prev) */}
            {onNavigateTour && tourIndex !== undefined && tourIndex > 0 && (
              <button
                onClick={() => onNavigateTour('prev')}
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-muted transition-colors shrink-0"
                aria-label="Previous chapter"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${config.color}20` }}>
              <Icon className="w-4 h-4" style={{ color: config.color }} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">
                {tourStop ? tourStop.chapter : file.name}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {tourStop ? file.name : formatSize(file.size)} {tourStop && `· ${formatSize(file.size)}`} · {config.label}
              </div>
            </div>
            {/* Tour navigation (next) */}
            {onNavigateTour && tourIndex !== undefined && tourIndex < GUIDED_TOUR.length - 1 && (
              <button
                onClick={() => onNavigateTour('next')}
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-muted transition-colors shrink-0"
                aria-label="Next chapter"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isTextLike && textContent && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-muted/50 hover:bg-muted border border-border/50 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}
            <a
              href={file.path}
              target="_blank"
              rel="noopener noreferrer"
              download={file.name.split('/').pop()}
              onClick={handleDownloadClick}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-muted/50 hover:bg-muted border border-border/50 transition-colors"
            >
              <Download className="w-3 h-3" /> Download
            </a>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tour narrative banner (if in tour) */}
        {tourStop && (
          <div className="px-5 py-3 bg-amber-500/5 border-b border-amber-600/20">
            <div className="text-xs text-amber-300 font-medium mb-1">{tourStop.chapter}</div>
            <p className="text-sm text-foreground/90 leading-relaxed mb-1.5">{tourStop.narrative}</p>
            <p className="text-xs text-muted-foreground italic leading-relaxed">{tourStop.why}</p>
            {tourIndex !== undefined && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1 bg-muted/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500/60 rounded-full transition-all"
                    style={{ width: `${((tourIndex + 1) / GUIDED_TOUR.length) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {tourIndex + 1} / {GUIDED_TOUR.length}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Description bar (if not in tour) */}
        {!tourStop && (
          <div className="px-5 py-2 text-xs text-muted-foreground border-b border-border/40 bg-muted/10">
            {file.description}
          </div>
        )}

        {/* Content area */}
        <div className="flex-1 overflow-auto bg-black/20">
          {isImage && (
            <div className="min-h-full flex items-center justify-center p-4">
              <img
                src={file.path}
                alt={file.description}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
              />
            </div>
          )}

          {isPdf && (
            <div className="relative w-full h-[75vh]">
              <iframe
                src={file.path}
                title={file.name}
                className="w-full h-full border-0"
                onLoad={handlePdfLoad}
              />
              {/* Safari fallback overlay — shown after A/B-tested delay if PDF hasn't fired onLoad */}
              {showSafariFallback && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/85 backdrop-blur px-4 py-2.5 rounded-lg border border-amber-500/40 text-xs flex items-center gap-3 shadow-lg">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-muted-foreground">PDF not rendering? Use the download button above.</span>
                  <a
                    href={file.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={file.name.split('/').pop()}
                    onClick={handleDownloadClick}
                    className="ml-1 px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/30 transition-colors flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" /> Download
                  </a>
                </div>
              )}
            </div>
          )}

          {isTextLike && (
            <div className="relative">
              {loading && (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Loading source{retryCount > 0 ? ` (retry ${retryCount})` : '…'}
                  </span>
                </div>
              )}
              {error && (
                <div className="p-6 text-center">
                  <X className="w-8 h-8 mx-auto mb-2 text-red-400" />
                  <p className="text-sm text-red-400">Failed to load: {error}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This is likely a network or basePath configuration issue.
                  </p>
                  <a
                    href={file.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={file.name.split('/').pop()}
                    className="inline-flex items-center gap-1 mt-3 text-xs text-amber-400 hover:underline"
                  >
                    <Download className="w-3 h-3" /> Download instead
                  </a>
                </div>
              )}
              {textContent && !loading && !error && (
                <CodeBlock code={textContent} language={language} />
              )}
            </div>
          )}
        </div>

        {/* Tour footer with progress dots */}
        {tourStop && tourIndex !== undefined && (
          <div className="px-5 py-2 border-t border-border/50 bg-muted/30 flex items-center justify-between gap-2">
            <button
              onClick={() => onNavigateTour?.('prev')}
              disabled={tourIndex === 0}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
            >
              <ChevronLeft className="w-3 h-3" /> Prev
            </button>
            <div className="flex items-center gap-1 overflow-x-auto">
              {GUIDED_TOUR.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === tourIndex ? 'bg-amber-400 w-4' : i < tourIndex ? 'bg-amber-600/40' : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => onNavigateTour?.('next')}
              disabled={tourIndex === GUIDED_TOUR.length - 1}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
            >
              Next <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

// =============================================================
// FILE CARD COMPONENT — with hover-to-preview (Dolphin)
// =============================================================

function FileCard({ file, onPreview, tourStop }: {
  file: ProjectFile
  onPreview: (file: ProjectFile) => void
  tourStop?: TourStop
}) {
  const config = FILE_TYPE_CONFIG[file.type] || FILE_TYPE_CONFIG.other
  const Icon = config.icon
  const isImage = file.type === 'image'
  const isPdf = file.type === 'pdf'
  const isTextLike = file.type === 'script' || file.type === 'shell' || file.type === 'document'

  // Hover-to-preview state (Dolphin micro-interaction)
  const [hoverPeek, setHoverPeek] = useState<string | null>(null)
  const [hoverLoading, setHoverLoading] = useState(false)
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [cardCopied, setCardCopied] = useState(false)

  const handleHoverEnter = useCallback(() => {
    if (!isTextLike) return
    const cached = textCache[file.path]
    if (cached) {
      setHoverPeek(cached.content.split('\n').slice(0, 8).join('\n'))
      return
    }
    // Lazy-load preview after 400ms hover (avoid spamming on quick mouseovers)
    hoverTimerRef.current = setTimeout(async () => {
      setHoverLoading(true)
      try {
        const res = await fetch(file.path)
        if (!res.ok) return
        const text = await res.text()
        textCache[file.path] = { content: text, fetchedAt: Date.now() }
        setHoverPeek(text.split('\n').slice(0, 8).join('\n'))
      } catch {
        /* silent fail on hover */
      } finally {
        setHoverLoading(false)
      }
    }, 400)
  }, [file.path, isTextLike])

  const handleHoverLeave = useCallback(() => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
    setHoverPeek(null)
    setHoverLoading(false)
  }, [])

  // Card-level copy-to-clipboard (Dolphin micro-interaction)
  const handleCardCopy = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    const cached = textCache[file.path]
    if (!cached) return
    try {
      await navigator.clipboard.writeText(cached.content)
      setCardCopied(true)
      setTimeout(() => setCardCopied(false), 1500)
      trackCopyToClipboard(file, 'card')
    } catch { /* clipboard blocked */ }
  }, [file.path, file])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onMouseEnter={handleHoverEnter}
      onMouseLeave={handleHoverLeave}
    >
      <Card className="h-full bg-card/50 hover:shadow-lg hover:shadow-amber-500/5 hover:border-amber-600/25 transition-all duration-300 overflow-hidden">
        {/* Tour chapter badge */}
        {tourStop && (
          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-600/30 text-[10px] text-amber-300 font-medium backdrop-blur">
            {tourStop.chapter.split('—')[0].trim()}
          </div>
        )}

        {/* Image thumbnail */}
        {isImage && (
          <div
            className="relative h-40 bg-muted/30 cursor-pointer overflow-hidden group"
            onClick={() => onPreview(file)}
          >
            <img
              src={file.path}
              alt={file.description}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        )}

        {/* PDF header */}
        {isPdf && (
          <div
            className="relative h-32 bg-gradient-to-br from-amber-900/30 to-amber-800/10 flex items-center justify-center cursor-pointer group"
            onClick={() => onPreview(file)}
          >
            <FileText className="w-16 h-16 text-amber-400/40 group-hover:text-amber-400/60 transition-colors" />
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="text-xs bg-amber-500/20 text-amber-300 border-amber-500/30">
                PDF
              </Badge>
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="px-3 py-1.5 rounded-md bg-black/70 text-white text-xs flex items-center gap-1.5">
                <Eye className="w-3 h-3" /> Preview
              </div>
            </div>
          </div>
        )}

        {/* Script/code header with hover-to-preview */}
        {(file.type === 'script' || file.type === 'shell') && (
          <div
            className="relative h-24 bg-gradient-to-br from-green-900/30 to-emerald-800/10 cursor-pointer group overflow-hidden"
            onClick={() => onPreview(file)}
          >
            {/* Hover-to-preview overlay (Dolphin) */}
            {hoverPeek && (
              <div className="absolute inset-0 bg-[#0d0d0f]/95 p-2 overflow-hidden">
                <pre className="text-[9px] leading-tight font-mono text-green-300/80 whitespace-pre-wrap break-all">
                  {hoverPeek}
                </pre>
              </div>
            )}
            {hoverLoading && !hoverPeek && (
              <div className="absolute inset-0 bg-[#0d0d0f]/80 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-green-400" />
              </div>
            )}
            {!hoverPeek && !hoverLoading && (
              <>
                <Terminal className="w-12 h-12 text-green-400/40 group-hover:text-green-400/60 transition-colors absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-[10px] bg-green-500/15 text-green-300 border-green-500/30">
                    {file.type === 'shell' ? 'SH' : 'PY'}
                  </Badge>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="px-3 py-1.5 rounded-md bg-black/70 text-white text-xs flex items-center gap-1.5">
                    <Code2 className="w-3 h-3" /> View Source
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Document (html/md) header */}
        {file.type === 'document' && (
          <div
            className="relative h-24 bg-gradient-to-br from-amber-900/20 to-yellow-800/10 flex items-center justify-center cursor-pointer group"
            onClick={() => onPreview(file)}
          >
            <BookOpen className="w-12 h-12 text-amber-400/40 group-hover:text-amber-400/60 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="px-3 py-1.5 rounded-md bg-black/70 text-white text-xs flex items-center gap-1.5">
                <Eye className="w-3 h-3" /> Preview
              </div>
            </div>
          </div>
        )}

        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm font-medium leading-tight flex-1 min-w-0">
              <span className="truncate block">{file.name.split('/').pop()}</span>
            </CardTitle>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${config.color}20` }}
            >
              <Icon className="w-4 h-4" style={{ color: config.color }} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <CardDescription className="text-xs mb-3 line-clamp-2" style={{ minHeight: '2rem' }}>
            {file.description}
          </CardDescription>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0" style={{ borderColor: `${config.color}40`, color: config.color }}>
                {config.label}
              </Badge>
              <span className="text-[10px] text-muted-foreground">{formatSize(file.size)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Copy-on-card for text files (Dolphin micro-interaction) */}
              {isTextLike && (
                <button
                  onClick={handleCardCopy}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label="Copy source"
                  title="Copy source"
                >
                  {cardCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
              <button
                onClick={() => onPreview(file)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                aria-label="Preview file"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// =============================================================
// GUIDED TOUR MODE — narrative walkthrough (Reframe)
// =============================================================

function GuidedTourLauncher({ onStart, currentChapter, onJump, shareUrl, onCopyShare }: {
  onStart: () => void
  currentChapter: number
  onJump: (index: number) => void
  shareUrl: string
  onCopyShare: () => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      onCopyShare()
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard blocked */ }
  }

  return (
    <Card className="bg-gradient-to-br from-amber-500/8 via-amber-600/5 to-transparent border-amber-600/30 mb-8 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-amber-500/15">
            <Compass className="w-6 h-6 text-amber-300" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold flex items-center gap-2">
              Guided Tour Mode
              <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-300 border-amber-600/30">
                19 chapters
              </Badge>
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-300 border-emerald-600/30">
                Shareable
              </Badge>
            </h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Each artifact becomes a chapter in the Impeccable Error Handler story. Walk through the files
              in narrative order — architecture diagram → audit → recovery scripts → SOP — with context for why each matters.
              Your chapter is in the URL, so you can bookmark or share a specific stop.
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-4">
              <button
                onClick={onStart}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-600/40 text-amber-200 text-sm font-medium transition-all"
              >
                <Map className="w-4 h-4" />
                {currentChapter > 0 ? `Resume from Chapter ${currentChapter + 1}` : 'Start the Tour'}
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/40 hover:bg-muted/60 border border-border/50 text-muted-foreground text-sm transition-all"
              >
                <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                Chapter Index
              </button>
              {currentChapter > 0 && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-600/30 text-emerald-200 text-sm transition-all"
                  title={shareUrl}
                >
                  {copied ? <Check className="w-3 h-3" /> : <Link2 className="w-3 h-3" />}
                  {copied ? 'Copied!' : 'Share this chapter'}
                </button>
              )}
            </div>

            {/* Chapter index dropdown */}
            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 mt-4">
                    {GUIDED_TOUR.map((stop, i) => (
                      <button
                        key={stop.fileName}
                        onClick={() => { onJump(i); setIsExpanded(false) }}
                        className={`flex items-center gap-2 p-2 rounded-md text-left text-xs transition-all border ${
                          i === currentChapter
                            ? 'bg-amber-500/15 border-amber-600/40 text-amber-200'
                            : 'bg-muted/20 border-border/40 hover:bg-muted/40 text-muted-foreground'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">{stop.chapter.replace(/^Chapter \d+ — /, '')}</div>
                          <div className="text-[10px] opacity-70 truncate">{stop.fileName}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Card>
  )
}

// =============================================================
// RESEARCH REPORT VIEW
// =============================================================

// ---------------------------------------------------------------------------
// URL helpers for tour position (Task D)
// Tour position is stored in the URL as ?chapter=N (1-indexed) so visitors
// can bookmark, share, and use the browser back/forward buttons to navigate
// between chapters. We keep a localStorage mirror as a fallback so a visitor
// who closes the tab without bookmarking can still resume.
// ---------------------------------------------------------------------------

const TOUR_PARAM = 'chapter'
const TOUR_STORAGE_KEY = 'research-tour-position'

function readChapterFromUrl(): number | null {
  if (typeof window === 'undefined') return null
  const params = new URLSearchParams(window.location.search)
  const raw = params.get(TOUR_PARAM)
  if (!raw) return null
  const n = parseInt(raw, 10)
  if (isNaN(n) || n < 1 || n > GUIDED_TOUR.length) return null
  return n - 1 // 1-indexed in URL, 0-indexed in code
}

function writeChapterToUrl(index: number, replace = true): void {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  if (index > 0) {
    url.searchParams.set(TOUR_PARAM, String(index + 1))
  } else {
    url.searchParams.delete(TOUR_PARAM)
  }
  // replace=true → no back-button spam (programmatic navigation)
  // replace=false → pushState, so back button returns to previous chapter (user jump)
  if (replace) {
    window.history.replaceState({}, '', url.toString())
  } else {
    window.history.pushState({}, '', url.toString())
  }
}

function readChapterFromStorage(): number | null {
  if (typeof window === 'undefined') return null
  try {
    const saved = localStorage.getItem(TOUR_STORAGE_KEY)
    if (!saved) return null
    const idx = parseInt(saved, 10)
    if (isNaN(idx) || idx < 0 || idx >= GUIDED_TOUR.length) return null
    return idx
  } catch { return null }
}

function writeChapterToStorage(index: number): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(TOUR_STORAGE_KEY, String(index))
  } catch { /* ignore */ }
}

export default function ResearchReportView({ onSwitchView }: { onSwitchView: (v: ViewKey) => void }) {
  const [filterType, setFilterType] = useState<string>('all')
  const [previewFile, setPreviewFile] = useState<ProjectFile | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [tourActive, setTourActive] = useState(false)
  const [tourIndex, setTourIndex] = useState(0)

  // ---------------------------------------------------------------------------
  // Tour position sync — Task D
  // Priority: URL param (?chapter=N) > localStorage (resume from last visit) > 0.
  // On change: update URL (replaceState, no back-button spam) + mirror to localStorage.
  // Listen for popstate so browser back/forward updates the tour.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const fromUrl = readChapterFromUrl()
    const fromStorage = readChapterFromStorage()
    const initial = fromUrl ?? fromStorage ?? 0
    if (initial > 0) {
      // Initial sync from URL/localStorage — runs once on mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTourIndex(initial)
      // If they came in via URL param, auto-open the chapter (shared link)
      if (fromUrl !== null) {
        setTourActive(true)
        const stop = GUIDED_TOUR[initial]
        const file = RESEARCH_FILES.find(f => f.name === stop.fileName)
        if (file) {
          setPreviewFile(file)
        }
        trackTourVsBrowse('tour')
        trackTourProgress(initial + 1, GUIDED_TOUR.length, stop.fileName)
      }
    }
  }, [])

  // Mirror tour index to URL + storage
  useEffect(() => {
    writeChapterToUrl(tourIndex, true)
    writeChapterToStorage(tourIndex)
  }, [tourIndex])

  // Listen for browser back/forward to update tour position
  useEffect(() => {
    const onPopState = () => {
      const fromUrl = readChapterFromUrl()
      if (fromUrl !== null && fromUrl !== tourIndex) {
        setTourIndex(fromUrl)
        if (tourActive) {
          const stop = GUIDED_TOUR[fromUrl]
          const file = RESEARCH_FILES.find(f => f.name === stop.fileName)
          if (file) setPreviewFile(file)
        }
      }
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [tourIndex, tourActive])

  const filteredFiles = RESEARCH_FILES.filter((f) => {
    const matchesType = filterType === 'all' || f.type === filterType
    const matchesSearch = !searchQuery || f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  // Track search empty results (Task A — search_query_empty_results metric)
  useEffect(() => {
    if (searchQuery.trim().length > 0 && filteredFiles.length === 0) {
      trackSearchEmpty(searchQuery)
    }
  }, [searchQuery, filteredFiles])

  const typeCounts = RESEARCH_FILES.reduce((acc, f) => {
    acc[f.type] = (acc[f.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Tour navigation — track tour_vs_browse + tour_completion_rate
  const handleStartTour = useCallback(() => {
    setTourActive(true)
    trackTourVsBrowse('tour')
    const stop = GUIDED_TOUR[tourIndex]
    const file = RESEARCH_FILES.find(f => f.name === stop.fileName)
    if (file) setPreviewFile(file)
    trackTourProgress(tourIndex + 1, GUIDED_TOUR.length, stop.fileName)
  }, [tourIndex])

  const handleJumpTour = useCallback((index: number) => {
    setTourIndex(index)
    setTourActive(true)
    // Push state (not replace) so back button returns to previous chapter
    writeChapterToUrl(index, false)
    writeChapterToStorage(index)
    const stop = GUIDED_TOUR[index]
    const file = RESEARCH_FILES.find(f => f.name === stop.fileName)
    if (file) setPreviewFile(file)
    trackTourProgress(index + 1, GUIDED_TOUR.length, stop.fileName)
  }, [])

  const handleNavigateTour = useCallback((direction: 'prev' | 'next') => {
    setTourIndex(prev => {
      const next = direction === 'prev'
        ? Math.max(0, prev - 1)
        : Math.min(GUIDED_TOUR.length - 1, prev + 1)
      const stop = GUIDED_TOUR[next]
      const file = RESEARCH_FILES.find(f => f.name === stop.fileName)
      if (file) setPreviewFile(file)
      trackTourProgress(next + 1, GUIDED_TOUR.length, stop.fileName)
      return next
    })
  }, [])

  const handleClosePreview = useCallback(() => {
    setPreviewFile(null)
    setTourActive(false)
  }, [])

  // Track artifact open when previewFile changes (Task A — artifact_load_count)
  useEffect(() => {
    if (previewFile) {
      trackArtifactOpened(previewFile)
      // If tour wasn't active, this is a free browse
      if (!tourActive) {
        trackTourVsBrowse('browse')
      }
    }
  }, [previewFile, tourActive])

  // Track filter applied (Task A — filter_type_distribution metric)
  const handleFilterChange = useCallback((newFilter: string) => {
    setFilterType(newFilter)
    const matchCount = newFilter === 'all'
      ? RESEARCH_FILES.length
      : RESEARCH_FILES.filter(f => f.type === newFilter).length
    trackFilterApplied(newFilter, matchCount)
  }, [])

  // Share link helper (Task D)
  const buildShareUrl = useCallback((index: number) => {
    if (typeof window === 'undefined') return ''
    const url = new URL(window.location.href)
    url.search = ''
    url.hash = ''
    if (index > 0) url.searchParams.set(TOUR_PARAM, String(index + 1))
    return url.toString()
  }, [])

  // Map file name to tour stop for badge display
  const getTourStop = useCallback((fileName: string) => {
    return GUIDED_TOUR.find(s => s.fileName === fileName)
  }, [])

  return (
    <motion.div
      key="research"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#D4A01720' }}>
              <FolderOpen className="w-5 h-5" style={{ color: '#D4A017' }} />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Research <span style={{ color: '#D4A017' }}>Archive</span>
              </h2>
              <p className="text-muted-foreground text-sm">
                All documentation, visualizations, and artifacts — every file previewable inline with syntax highlighting
              </p>
            </div>
          </div>
        </div>

        {/* Guided Tour launcher */}
        <GuidedTourLauncher
          onStart={handleStartTour}
          currentChapter={tourIndex}
          onJump={handleJumpTour}
          shareUrl={buildShareUrl(tourIndex)}
          onCopyShare={() => {/* future: emit share event */}}
        />

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {Object.entries(FILE_TYPE_CONFIG).map(([type, config]) => {
            const count = typeCounts[type] || 0
            if (count === 0) return null
            const Icon = config.icon
            return (
              <button
                key={type}
                onClick={() => handleFilterChange(filterType === type ? 'all' : type)}
                className={`flex items-center gap-2 p-3 rounded-lg border transition-all text-left ${
                  filterType === type
                    ? 'border-amber-600/40 bg-amber-500/8 shadow-sm'
                    : 'border-border/50 bg-muted/20 hover:bg-muted/40'
                }`}
              >
                <Icon className="w-4 h-4" style={{ color: config.color }} />
                <div>
                  <div className="text-xs text-muted-foreground">{config.label}</div>
                  <div className="text-sm font-bold">{count}</div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search files by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-muted/30 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-amber-600/40 focus:ring-1 focus:ring-amber-500/20 transition-all"
          />
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filterType === 'all' ? 'bg-amber-500/12 text-amber-300 border border-amber-600/25' : 'bg-muted/30 text-muted-foreground border border-transparent hover:bg-muted/50'
            }`}
          >
            All ({RESEARCH_FILES.length})
          </button>
          {Object.entries(FILE_TYPE_CONFIG).map(([type, config]) => {
            const count = typeCounts[type] || 0
            if (count === 0) return null
            return (
              <button
                key={type}
                onClick={() => handleFilterChange(filterType === type ? 'all' : type)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filterType === type ? `border` : 'bg-muted/30 text-muted-foreground border border-transparent hover:bg-muted/50'
                }`}
                style={filterType === type ? { backgroundColor: `${config.color}20`, color: config.color, borderColor: `${config.color}40` } : {}}
              >
                {config.label} ({count})
              </button>
            )
          })}
        </div>

        {/* File grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => (
            <FileCard
              key={file.name}
              file={file}
              onPreview={setPreviewFile}
              tourStop={getTourStop(file.name)}
            />
          ))}
        </div>

        {filteredFiles.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg">No files match your search</p>
            <p className="text-sm mt-1">Try adjusting your filter or search query</p>
          </div>
        )}

        {/* Document access section */}
        <div className="mt-12 border-t border-border/50 pt-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" style={{ color: '#D4A017' }} />
            Quick Access — Key Documents
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setPreviewFile(RESEARCH_FILES.find(f => f.name === 'Impeccable_Error_Fix_Handler_Audit.pdf') || null)}
              className="group flex items-start gap-4 p-4 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-amber-600/25 transition-all text-left"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-amber-500/10">
                <FileText className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold group-hover:text-amber-300 transition-colors flex items-center gap-1">
                  Error Fix Handler Audit <Eye className="w-3 h-3" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  17-page audit with 5 animal-metaphor perspectives on error handling and resilience
                </p>
              </div>
            </button>
            <button
              onClick={() => setPreviewFile(RESEARCH_FILES.find(f => f.name === 'Portfolio_Website_Recreation_SOP_final.pdf') || null)}
              className="group flex items-start gap-4 p-4 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-amber-600/25 transition-all text-left"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-amber-500/10">
                <FileText className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold group-hover:text-amber-300 transition-colors flex items-center gap-1">
                  Portfolio Website Recreation SOP <Eye className="w-3 h-3" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  33-page SOP with 3 design approaches, confidence scoring, decision trees, YC reviews
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Impeccable Error Handler section */}
        <div className="mt-8 border-t border-border/50 pt-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Terminal className="w-5 h-5" style={{ color: '#f59e0b' }} />
            Impeccable Error Fix Handler — Three-Tier Defense System
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            The complete deployment script, recovery script, and documentation. Click any file to view source inline with syntax highlighting.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {RESEARCH_FILES.filter(f => f.name.startsWith('impeccable-error-handler/')).map(file => {
              const config = FILE_TYPE_CONFIG[file.type] || FILE_TYPE_CONFIG.other
              const Icon = config.icon
              return (
                <button
                  key={file.name}
                  onClick={() => setPreviewFile(file)}
                  className="group flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-amber-600/25 transition-all text-left"
                >
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${config.color}20` }}>
                    <Icon className="w-4 h-4" style={{ color: config.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold group-hover:text-amber-300 transition-colors flex items-center gap-1 truncate">
                      {file.name.split('/').pop()} <Eye className="w-3 h-3 shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{file.description}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Inline note about both deployments */}
        <div className="mt-8 p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-3">
          <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
          <div className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-emerald-300">Every artifact works on both Vercel and GitHub Pages.</strong>{' '}
            Files are mirrored from <code className="bg-muted/40 px-1 rounded">/download/</code> to{' '}
            <code className="bg-muted/40 px-1 rounded">/public/files/</code> via a prebuild sync script, eliminating
            the SSR <code className="bg-muted/40 px-1 rounded">/api/files</code> dependency. The <code className="bg-muted/40 px-1 rounded">assetPath()</code>{' '}
            utility prepends the Next.js basePath so image and fetch paths resolve correctly on GitHub Pages subpath hosting.
          </div>
        </div>
      </div>

      {/* Universal preview modal — handles all file types */}
      <AnimatePresence>
        {previewFile && (
          <UniversalPreviewModal
            file={previewFile}
            onClose={handleClosePreview}
            onNavigateTour={tourActive ? handleNavigateTour : undefined}
            tourIndex={tourActive ? tourIndex : undefined}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
