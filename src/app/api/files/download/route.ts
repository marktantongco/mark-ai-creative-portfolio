import { NextRequest, NextResponse } from 'next/server'

// This API route is only available on Vercel (standalone) deployment.
// GitHub Pages static export will not include this route.

// API routes with dynamic features (searchParams, fs reads) are not compatible
// with static export. They are moved aside during build:static via the pre-build script.

export async function GET(request: NextRequest) {
  const fileParam = request.nextUrl.searchParams.get('file')
  if (!fileParam) {
    return NextResponse.json({ error: 'No file parameter provided' }, { status: 400 })
  }

  // Prevent directory traversal
  const sanitized = fileParam.replace(/\.\./g, '').replace(/\/\//g, '/')

  try {
    const { readFile } = await import('fs/promises')
    const { join } = await import('path')
    const DOWNLOAD_DIR = join(process.cwd(), 'download')
    const filePath = join(DOWNLOAD_DIR, sanitized)

    const MIME_TYPES: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
      '.py': 'text/plain',
      '.sh': 'text/plain',
      '.md': 'text/markdown',
      '.html': 'text/html',
      '.json': 'application/json',
    }

    const buffer = await readFile(filePath)
    const ext = '.' + sanitized.split('.').pop()
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${sanitized.split('/').pop()}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }
}
