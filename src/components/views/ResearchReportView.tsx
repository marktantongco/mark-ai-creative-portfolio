'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Image, Code2, Terminal, BookOpen,
  Download, Eye, ChevronDown, ExternalLink,
  FolderOpen, Search, Filter,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { RESEARCH_FILES, type ViewKey, type ProjectFile } from '@/lib/subpage-data'

// =============================================================
// FILE TYPE CONFIG
// =============================================================

const FILE_TYPE_CONFIG: Record<string, { icon: typeof FileText; color: string; label: string }> = {
  image: { icon: Image, color: '#e040fb', label: 'Image' },
  pdf: { icon: FileText, color: '#E63946', label: 'PDF' },
  script: { icon: Code2, color: '#49d08c', label: 'Script' },
  document: { icon: BookOpen, color: '#D4A017', label: 'Document' },
  shell: { icon: Terminal, color: '#f59e0b', label: 'Shell Script' },
  other: { icon: FileText, color: '#8C8C8C', label: 'File' },
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// =============================================================
// IMAGE PREVIEW MODAL
// =============================================================

function ImagePreviewModal({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative max-w-4xl max-h-[85vh] w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/60 hover:text-white text-sm"
        >
          Press ESC or click outside to close
        </button>
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain rounded-lg shadow-2xl"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
          <p className="text-white text-sm font-medium">{alt}</p>
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className="h-full bg-card/50 hover:shadow-lg hover:shadow-amber-500/5 hover:border-amber-600/25 transition-all duration-300 overflow-hidden">
        {/* Image thumbnail for image files */}
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

        {/* PDF header for PDF files */}
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
          </div>
        )}

        {/* Script/code header for code files */}
        {(file.type === 'script' || file.type === 'shell') && (
          <div className="relative h-24 bg-gradient-to-br from-green-900/30 to-emerald-800/10 flex items-center justify-center font-mono text-xs text-green-400/40 p-3 overflow-hidden">
            <Terminal className="w-12 h-12 text-green-400/30" />
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
            <a
              href={file.path}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => {
                if (isImage) {
                  e.preventDefault()
                  onPreview(file)
                }
              }}
            >
              {isImage ? <Eye className="w-4 h-4" /> : <Download className="w-4 h-4" />}
            </a>
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
                All documentation, visualizations, and artifacts from the project
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
            <a
              href="/api/files/download?file=Impeccable_Error_Fix_Handler_Audit.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-4 p-4 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-amber-600/25 transition-all"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-amber-500/10">
                <FileText className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold group-hover:text-amber-300 transition-colors flex items-center gap-1">
                  Error Fix Handler Audit <ExternalLink className="w-3 h-3" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  17-page audit with 5 animal-metaphor perspectives on error handling and resilience
                </p>
              </div>
            </a>
            <a
              href="/api/files/download?file=Portfolio_Website_Recreation_SOP_final.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-4 p-4 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-amber-600/25 transition-all"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-amber-500/10">
                <FileText className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold group-hover:text-amber-300 transition-colors flex items-center gap-1">
                  Portfolio Website Recreation SOP <ExternalLink className="w-3 h-3" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  33-page SOP with 3 design approaches, confidence scoring, decision trees, YC reviews
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Image preview modal */}
      <AnimatePresence>
        {previewFile && previewFile.type === 'image' && (
          <ImagePreviewModal
            src={previewFile.path}
            alt={previewFile.description}
            onClose={() => setPreviewFile(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
