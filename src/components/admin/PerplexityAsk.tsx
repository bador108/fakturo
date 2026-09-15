'use client'

import { useState } from 'react'
import { Search, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Citation {
  title: string
  url: string
}

interface AskResponse {
  answer: string
  citations: Citation[]
  responseId: string
  model: string
}

export function PerplexityAsk() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AskResponse | null>(null)

  async function ask() {
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Chyba při dotazu')
        setResult(null)
        return
      }
      setResult(data)
    } catch {
      setError('Nepodařilo se spojit se serverem')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && ask()}
          placeholder="Zeptejte se na cokoliv s aktuálními informacemi z webu..."
          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <Button onClick={ask} loading={loading} disabled={!query.trim()}>
          <Search className="h-4 w-4" />
          Zeptat se
        </Button>
      </div>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      {result && (
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 space-y-3">
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{result.answer}</p>
          {result.citations.length > 0 && (
            <div className="space-y-1 border-t border-slate-200 pt-2">
              <p className="text-xs font-medium text-slate-400">Zdroje</p>
              {result.citations.map(c => (
                <a
                  key={c.url}
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-brand hover:underline truncate"
                >
                  <ExternalLink className="h-3 w-3 shrink-0" />
                  <span className="truncate">{c.title}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
