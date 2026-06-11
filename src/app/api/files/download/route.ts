import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

const DOWNLOAD_DIR = join(process.cwd(), 'download')

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

export async function GET(request: NextRequest) {
  const fileParam = request.nextUrl.searchParams.get('file')
  if (!fileParam) {
    return NextResponse.json({ error: 'No file parameter provided' }, { status: 400 })
  }

  // Prevent directory traversal
  const sanitized = fileParam.replace(/\.\./g, '').replace(/\/\//g, '/')
  const filePath = join(DOWNLOAD_DIR, sanitized)

  try {
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
