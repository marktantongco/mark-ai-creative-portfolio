'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Image as ImageIcon, Code2, Terminal, BookOpen,
  Download, Eye, ChevronDown, ExternalLink,
  FolderOpen, Search, Filter, X, Loader2, Copy, Check,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { RESEARCH_FILES, type ViewKey, type ProjectFile } from '@/lib/subpage-data'

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

// =============================================================
// UNIVERSAL PREVIEW MODAL — handles all file types
// =============================================================

function UniversalPreviewModal({ file, onClose }: { file: ProjectFile; onClose: () => void }) {
  const [textContent, setTextContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const isImage = file.type === 'image'
  const isPdf = file.type === 'pdf'
  const isTextLike = file.type === 'script' || file.type === 'shell' || file.type === 'document' || file.name.endsWith('.md') || file.name.endsWith('.html')

  // Fetch text content for scripts/shell/docs
  useEffect(() => {
    if (!isTextLike) return
    setLoading(true)
    setError(null)
    fetch(file.path)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const text = await res.text()
        setTextContent(text)
      })
      .catch((err) => setError(err.message || 'Failed to load file'))
      .finally(() => setLoading(false))
  }, [file.path, isTextLike])

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const handleCopy = useCallback(async () => {
    if (!textContent) return
    try {
      await navigator.clipboard.writeText(textContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard blocked */ }
  }, [textContent])

  const config = FILE_TYPE_CONFIG[file.type] || FILE_TYPE_CONFIG.other
  const Icon = config.icon

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
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${config.color}20` }}>
              <Icon className="w-4 h-4" style={{ color: config.color }} />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{file.name}</div>
              <div className="text-xs text-muted-foreground truncate">{formatSize(file.size)} · {config.label}</div>
            </div>
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

        {/* Description bar */}
        <div className="px-5 py-2 text-xs text-muted-foreground border-b border-border/40 bg-muted/10">
          {file.description}
        </div>

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
            <iframe
              src={file.path}
              title={file.name}
              className="w-full h-[75vh] border-0"
            />
          )}

          {isTextLike && (
            <div className="relative">
              {loading && (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading source…</span>
                </div>
              )}
              {error && (
                <div className="p-6 text-center">
                  <X className="w-8 h-8 mx-auto mb-2 text-red-400" />
                  <p className="text-sm text-red-400">Failed to load: {error}</p>
                  <a href={file.path} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-3 text-xs text-amber-400 hover:underline">
                    <Download className="w-3 h-3" /> Download instead
                  </a>
                </div>
              )}
              {textContent && !loading && !error && (
                <pre className="text-xs leading-relaxed p-5 font-mono text-foreground/90 whitespace-pre-wrap break-words bg-[#0d0d0f]">
                  <code>{textContent}</code>
                </pre>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// =============================================================
// FILE CARD COMPONENT
// =============================================================

function FileCard({ file, onPreview }: { file: ProjectFile; onPreview: (file: ProjectFile) => void }) {
  const config = FILE_TYPE_CONFIG[file.type] || FILE_TYPE_CONFIG.other
  const Icon = config.icon
  const isImage = file.type === 'image'
  const isPdf = file.type === 'pdf'
  const isTextLike = file.type === 'script' || file.type === 'shell' || file.type === 'document'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className="h-full bg-card/50 hover:shadow-lg hover:shadow-amber-500/5 hover:border-amber-600/25 transition-all duration-300 overflow-hidden">
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

        {/* Script/code header */}
        {(file.type === 'script' || file.type === 'shell') && (
          <div
            className="relative h-24 bg-gradient-to-br from-green-900/30 to-emerald-800/10 flex items-center justify-center cursor-pointer group overflow-hidden"
            onClick={() => onPreview(file)}
          >
            <Terminal className="w-12 h-12 text-green-400/40 group-hover:text-green-400/60 transition-colors" />
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
              <span className="truncate block">{file.name}</span>
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
            <button
              onClick={() => onPreview(file)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Preview file"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// =============================================================
// RESEARCH REPORT VIEW
// =============================================================

export default function ResearchReportView({ onSwitchView }: { onSwitchView: (v: ViewKey) => void }) {
  const [filterType, setFilterType] = useState<string>('all')
  const [previewFile, setPreviewFile] = useState<ProjectFile | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredFiles = RESEARCH_FILES.filter((f) => {
    const matchesType = filterType === 'all' || f.type === filterType
    const matchesSearch = !searchQuery || f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  const typeCounts = RESEARCH_FILES.reduce((acc, f) => {
    acc[f.type] = (acc[f.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

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
                All documentation, visualizations, and artifacts — every file previewable inline
              </p>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {Object.entries(FILE_TYPE_CONFIG).map(([type, config]) => {
            const count = typeCounts[type] || 0
            if (count === 0) return null
            const Icon = config.icon
            return (
              <button
                key={type}
                onClick={() => setFilterType(filterType === type ? 'all' : type)}
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
            onClick={() => setFilterType('all')}
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
                onClick={() => setFilterType(filterType === type ? 'all' : type)}
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
            <FileCard key={file.name} file={file} onPreview={setPreviewFile} />
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
            The complete deployment script, recovery script, and documentation. Click any file to view source inline.
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
      </div>

      {/* Universal preview modal — handles all file types */}
      <AnimatePresence>
        {previewFile && (
          <UniversalPreviewModal
            file={previewFile}
            onClose={() => setPreviewFile(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
