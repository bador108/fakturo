import Perplexity from '@perplexity-ai/perplexity_ai'

/** Vyhozeno, když PERPLEXITY_API_KEY není nastaven — volající to má odchytit a vrátit čistou chybu. */
export class PerplexityNotConfiguredError extends Error {
  constructor() {
    super('PERPLEXITY_API_KEY není nastaven')
    this.name = 'PerplexityNotConfiguredError'
  }
}

let client: Perplexity | null = null

export function getPerplexityClient(): Perplexity {
  const apiKey = process.env.PERPLEXITY_API_KEY
  if (!apiKey) throw new PerplexityNotConfiguredError()
  if (!client) client = new Perplexity({ apiKey })
  return client
}

export interface Citation {
  title: string
  url: string
}

export interface AskResult {
  answer: string
  citations: Citation[]
  responseId: string
  model: string
}

/** Zeptá se Perplexity Agent API s web_search nástrojem a vrátí odpověď + citace. */
export async function askWithWebSearch(query: string, previousResponseId?: string): Promise<AskResult> {
  const perplexity = getPerplexityClient()

  const response = await perplexity.responses.create({
    input: query,
    tools: [{ type: 'web_search' }],
    ...(previousResponseId ? { previous_response_id: previousResponseId } : {}),
  })

  const citations: Citation[] = []
  const seen = new Set<string>()
  for (const item of response.output) {
    if (item.type !== 'message') continue
    for (const part of item.content) {
      for (const annotation of part.annotations ?? []) {
        if (annotation.url && !seen.has(annotation.url)) {
          seen.add(annotation.url)
          citations.push({ title: annotation.title ?? annotation.url, url: annotation.url })
        }
      }
    }
  }

  return {
    answer: response.output_text,
    citations,
    responseId: response.id,
    model: response.model,
  }
}
