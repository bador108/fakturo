import type { BankTransaction } from '@/lib/bankParser'

// Salt Edge Account Information API v6. GoCardless (dřív používané) zavřelo nové
// registrace, tak přešlo na tohle — self-serve signup, dobré pokrytí českých bank.
// Autentizace je prosté App-id/Secret v hlavičkách (žádná výměna access tokenu jako
// u GoCardless). Výběr konkrétní banky řeší Salt Edge sám ve svém hostovaném
// "Connect" widgetu — appka jen vytvoří session a přesměruje tam.
const API_BASE = 'https://www.saltedge.com/api/v6'

function headers() {
  const appId = process.env.SALTEDGE_APP_ID
  const secret = process.env.SALTEDGE_SECRET
  if (!appId || !secret) throw new Error('SALTEDGE_APP_ID / SALTEDGE_SECRET nejsou nastavené')
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'App-id': appId,
    Secret: secret,
  }
}

async function seFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers: { ...headers(), ...init?.headers } })
  if (!res.ok) throw new Error(`Salt Edge API error (${path}): ${res.status} ${await res.text()}`)
  return res.json() as Promise<T>
}

export async function getOrCreateCustomer(internalUserId: string, existingCustomerId?: string | null): Promise<string> {
  if (existingCustomerId) return existingCustomerId
  const res = await seFetch<{ data: { id: string } }>('/customers', {
    method: 'POST',
    body: JSON.stringify({ data: { identifier: internalUserId } }),
  })
  return res.data.id
}

export async function createConnectSession(customerId: string, returnTo: string): Promise<string> {
  const res = await seFetch<{ data: { connect_url: string } }>('/connections/connect', {
    method: 'POST',
    body: JSON.stringify({
      data: {
        customer_id: customerId,
        consent: { scopes: ['account_details', 'transactions_details'] },
        attempt: {
          return_to: returnTo,
          return_connection_id: true,
          return_error_class: true,
          fetch_scopes: ['accounts', 'transactions'],
        },
      },
    }),
  })
  return res.data.connect_url
}

export interface SaltEdgeConnection {
  id: string
  customer_id: string
  provider_name: string
  status: string
}

export function getConnection(connectionId: string): Promise<SaltEdgeConnection> {
  return seFetch<{ data: SaltEdgeConnection }>(`/connections/${connectionId}`).then(r => r.data)
}

export interface SaltEdgeAccount {
  id: string
  connection_id: string
  name: string
  balance: number
  currency_code: string
  extra?: { iban?: string }
}

export async function listAccounts(connectionId: string): Promise<SaltEdgeAccount[]> {
  const res = await seFetch<{ data: SaltEdgeAccount[] }>(`/accounts?connection_id=${connectionId}`)
  return res.data
}

interface RawTransaction {
  id: string
  amount: number
  currency_code: string
  description: string
  made_on: string
  status: string
}

interface TransactionsResponse {
  data: RawTransaction[]
  meta?: { next_id?: string | null }
}

export interface SaltEdgeTransaction extends BankTransaction {
  externalId: string
}

export async function listTransactions(connectionId: string, accountId: string): Promise<SaltEdgeTransaction[]> {
  const all: SaltEdgeTransaction[] = []
  let nextId: string | null | undefined
  do {
    const qs = new URLSearchParams({ connection_id: connectionId, account_id: accountId })
    if (nextId) qs.set('from_id', nextId)
    const res = await seFetch<TransactionsResponse>(`/transactions?${qs.toString()}`)
    for (const tx of res.data) {
      if (tx.status !== 'posted') continue
      if (tx.amount <= 0) continue // jen příchozí platby, stejně jako ruční CSV/ABO import
      all.push({
        externalId: tx.id,
        amount: tx.amount,
        currency: tx.currency_code,
        date: tx.made_on,
        description: tx.description,
      })
    }
    nextId = res.meta?.next_id
  } while (nextId)
  return all
}
