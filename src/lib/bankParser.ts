export interface BankTransaction {
  amount: number
  currency: string
  date: string
  description: string
}

// ── ABO (Czech standard format) ────────────────────────────────────────────
function parseABO(text: string): BankTransaction[] {
  const txs: BankTransaction[] = []
  for (const line of text.split(/\r?\n/)) {
    if (!line.startsWith('1')) continue
    // Amount: chars 19–30 (12 digits, in haléře)
    // Sign:   char 31 ('1'=debit, '2'=credit)
    // Date:   chars 32–37 (DDMMYY)
    const raw = line.padEnd(80)
    const amountRaw = raw.slice(18, 30).trim()
    const sign = raw[30]
    const dateRaw = raw.slice(31, 37)
    const noteRaw = raw.slice(37, 97)?.trim() ?? ''
    const amount = parseInt(amountRaw, 10) / 100
    if (!amount || sign === '1') continue // skip debits
    const d = dateRaw.match(/(\d{2})(\d{2})(\d{2})/)
    const date = d ? `20${d[3]}-${d[2]}-${d[1]}` : ''
    txs.push({ amount, currency: 'CZK', date, description: noteRaw })
  }
  return txs
}

// ── CSV auto-detect ─────────────────────────────────────────────────────────
function detectSeparator(line: string): string {
  const counts = { ',': 0, ';': 0, '\t': 0 }
  for (const ch of line) {
    if (ch in counts) counts[ch as keyof typeof counts]++
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
}

function parseMoney(val: string): number | null {
  const cleaned = val.replace(/\s/g, '').replace(',', '.').replace(/[^0-9.-]/g, '')
  const n = parseFloat(cleaned)
  return isNaN(n) ? null : n
}

function parseDate(val: string): string {
  // try DD.MM.YYYY, YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY
  val = val.trim()
  let m = val.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/)
  if (m) return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`
  m = val.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (m) return val.slice(0,10)
  m = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (m) return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`
  return val
}

function parseCSV(text: string): BankTransaction[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) return []

  const sep = detectSeparator(lines[0])
  const headers = lines[0].split(sep).map(h => h.replace(/['"]/g, '').toLowerCase().trim())

  // Find column indices
  const amountIdx = headers.findIndex(h =>
    /částka|amount|objem|kredit|credit|příjem|příchozí|castka/i.test(h)
  )
  const creditIdx = headers.findIndex(h => /kredit|credit|příjem|in/i.test(h))

  const dateIdx = headers.findIndex(h => /datum|date|datu/i.test(h))
  const descIdx = headers.findIndex(h => /popis|zpráva|zprava|note|description|message|info/i.test(h))
  const currencyIdx = headers.findIndex(h => /měna|mena|currency/i.test(h))

  const txs: BankTransaction[] = []

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(sep).map(c => c.replace(/^["']|["']$/g, '').trim())
    if (cols.length < 2) continue

    let amount: number | null = null
    let currency = 'CZK'

    if (currencyIdx >= 0) currency = cols[currencyIdx]?.trim() || 'CZK'

    // Try explicit amount column first
    if (amountIdx >= 0) {
      amount = parseMoney(cols[amountIdx] ?? '')
    }
    // Try credit column (Fio exports credit/debit separately)
    if ((amount === null || amount <= 0) && creditIdx >= 0) {
      amount = parseMoney(cols[creditIdx] ?? '')
    }
    // Skip debits/negatives
    if (amount === null || amount <= 0) continue

    const date = dateIdx >= 0 ? parseDate(cols[dateIdx] ?? '') : ''
    const description = descIdx >= 0 ? (cols[descIdx] ?? '') : cols.slice(0, 3).join(' ')

    txs.push({ amount, currency, date, description })
  }

  return txs
}

// ── Main entry ──────────────────────────────────────────────────────────────
export function parseBankFile(content: string, filename: string): BankTransaction[] {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (ext === 'abo' || ext === 'gpc' || ext === 'txt') {
    const abo = parseABO(content)
    if (abo.length > 0) return abo
  }
  return parseCSV(content)
}
