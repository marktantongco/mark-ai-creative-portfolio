import { NextResponse } from 'next/server'

// This API route is only available on Vercel (standalone) deployment.
// GitHub Pages static export will not include this route.

// API routes with dynamic features (fs reads) are not compatible
// with static export. They are moved aside during build:static via the pre-build script.

export async function GET() {
  try {
    const { readdir, stat } = await import('fs/promises')
    const { join } = await import('path')
    const DOWNLOAD_DIR = join(process.cwd(), 'download')

    interface FileEntry {
      name: string
      type: 'image' | 'pdf' | 'script' | 'document' | 'shell' | 'other'
      size: number
      path: string
      description: string
    }

    const DESCRIPTIONS: Record<string, string> = {
      'design_approaches.png': 'Three wildly different design approaches: Brutalist Industrial, Organic Minimalism, Cyberpunk Dashboard',
      'decision_tree.png': 'Decision tree for choosing the right proxy architecture and design approach',
      'architecture_diagram.png': 'System architecture diagram showing the three-tier error defense system',
      'perspectives-tab.png': 'Five animal-metaphor perspectives on error handling and resilience',
      'error-handler-tab.png': 'Pre-flight deployment checker and error handler interface design',
      'proxy-topics-page.png': 'Proxy types comparison and discussion page visualization',
      'Impeccable_Error_Fix_Handler_Audit.pdf': 'Comprehensive audit report with 5 animal-metaphor perspectives (Owl, Eagle, Beaver, Dolphin, Elephant)',
      'Portfolio_Website_Recreation_SOP_final.pdf': '33-page SOP for recreating the portfolio with 3 design approaches, confidence scoring, decision trees',
      'Portfolio_Website_Recreation_SOP.pdf': 'Standard Operating Procedure for portfolio website recreation',
      'cover_portfolio_sop.pdf': 'Cover page for the Portfolio Website Recreation SOP document',
      'generate_portfolio_sop.py': 'Python script generating the SOP PDF with custom styles and flowables',
      'generate_audit.py': 'Python script generating the Error Fix Handler Audit PDF',
      'generate_decision_tree.py': 'Python script generating the decision tree visualization',
      'gen_architecture.py': 'Python script generating the architecture diagram visualization',
      'cover_portfolio_sop.html': 'HTML cover page for the SOP document',
    }

    function getFileType(name: string): FileEntry['type'] {
      if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.svg')) return 'image'
      if (name.endsWith('.pdf')) return 'pdf'
      if (name.endsWith('.py')) return 'script'
      if (name.endsWith('.md')) return 'document'
      if (name.endsWith('.sh')) return 'shell'
      return 'other'
    }

    const entries = await readdir(DOWNLOAD_DIR)
    const files: FileEntry[] = []

    for (const name of entries) {
      const filePath = join(DOWNLOAD_DIR, name)
      const fileStat = await stat(filePath)
      if (fileStat.isFile()) {
        files.push({
          name,
          type: getFileType(name),
          size: fileStat.size,
          path: `/images/${name}`,
          description: DESCRIPTIONS[name] || `${name} — project artifact`,
        })
      }
    }

    // Also check subdirectories
    const subdirs = ['impeccable-error-handler']
    for (const subdir of subdirs) {
      try {
        const subdirPath = join(DOWNLOAD_DIR, subdir)
        const subEntries = await readdir(subdirPath)
        for (const name of subEntries) {
          const filePath = join(subdirPath, name)
          const fileStat = await stat(filePath)
          if (fileStat.isFile()) {
            files.push({
              name: `${subdir}/${name}`,
              type: getFileType(name),
              size: fileStat.size,
              path: `/api/files/download?file=${subdir}/${name}`,
              description: DESCRIPTIONS[name] || `${name} — ${subdir} artifact`,
            })
          }
        }
      } catch {
        // subdir doesn't exist, skip
      }
    }

    return NextResponse.json({ files, total: files.length })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read files', details: String(error) }, { status: 500 })
  }
}
