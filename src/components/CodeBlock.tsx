'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// react-syntax-highlighter has SSR issues with Next.js 16 Turbopack
// (refractor's constructor fails during prerender). Solution: load the
// Prism component + style client-only via dynamic import.
const SyntaxHighlighter = dynamic(
  () => import('react-syntax-highlighter').then((mod) => mod.Prism),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
        <span className="ml-2 text-sm text-muted-foreground">Loading highlighter…</span>
      </div>
    ),
  }
)

// Cache the style module so we don't re-import on every render
let oneDarkStyle: { [key: string]: React.CSSProperties } | null = null

export default function CodeBlock({
  code,
  language,
}: {
  code: string
  language: string
}) {
  const [style, setStyle] = useState<{ [key: string]: React.CSSProperties } | null>(oneDarkStyle)

  useEffect(() => {
    if (oneDarkStyle) {
      setStyle(oneDarkStyle)
      return
    }
    import('react-syntax-highlighter/dist/esm/styles/prism/one-dark').then((mod) => {
      oneDarkStyle = (mod as any).default || mod
      setStyle(oneDarkStyle)
    })
  }, [])

  if (!style) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
        <span className="ml-2 text-sm text-muted-foreground">Loading highlighter…</span>
      </div>
    )
  }

  return (
    <SyntaxHighlighter
      language={language}
      style={style}
      showLineNumbers
      wrapLongLines={false}
      customStyle={{
        margin: 0,
        padding: '1.25rem',
        background: '#0d0d0f',
        fontSize: '0.75rem',
        lineHeight: '1.55',
        minHeight: '100%',
      }}
      lineNumberStyle={{ color: '#4a4a52', minWidth: '2.5em' }}
    >
      {code}
    </SyntaxHighlighter>
  )
}
