import type { BankTransaction } from '@/lib/bankParser'

// GoCardless Bank Account Data (dřív Nordigen) — otevřené bankovnictví přes PSD2.
// Jeden pár secret_id/secret_key na celou appku (ne per-uživatel) — z něj se vždy
// vymění krátkodobý access token. Propojení konkrétního uživatele s jeho bankou drží
// "requisition" (viz bank_connections.requisition_id), ne OAuth token na naší straně —
// samotné oprávnění zůstává u GoCardless/banky.
const API_BASE = 'https://bankaccountdata.gocardless.com/api/v2'

let cachedToken: { access: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.access
  }
  const secretId = process.env.GOCARDLESS_SECRET_ID
  const secretKey = process.env.GOCARDLESS_SECRET_KEY
  if (!secretId || !secretKey) {
    throw new Error('GOCARDLESS_SECRET_ID / GOCARDLESS_SECRET_KEY nejsou nastavené')
  }
  const res = await fetch(`${API_BASE}/token/new/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret_id: secretId, secret_key: secretKey }),
  })
  if (!res.ok) throw new Error(`GoCardless token error: ${res.status} ${await res.text()}`)
  const data = await res.json() as { access: string; access_expires: number }
  cachedToken = { access: data.access, expiresAt: Date.now() + data.access_expires * 1000 }
  return cachedToken.access
}

async function gcFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken()
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { ...init?.headers, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  })
  if (!res.ok) throw new Error(`GoCardless API error (${path}): ${res.status} ${await res.text()}`)
  return res.json() as Promise<T>
}

export interface Institution {
  id: string
  name: string
  bic: string
  logo: string
  transaction_total_days: string
}

export function listInstitutions(country = 'cz'): Promise<Institution[]> {
  return gcFetch<Institution[]>(`/institutions/?country=${country}`)
}

export interface Requisition {
  id: string
  status: string
  institution_id: string
  link: string
  accounts: string[]
  reference: string
}

export function createRequisition(institutionId: string, redirectUrl: string, reference: string): Promise<Requisition> {
  return gcFetch<Requisition>('/requisitions/', {
    method: 'POST',
    body: JSON.stringify({ institution_id: institutionId, redirect: redirectUrl, reference, user_language: 'CS' }),
  })
}

export function getRequisition(requisitionId: string): Promise<Requisition> {
  return gcFetch<Requisition>(`/requisitions/${requisitionId}/`)
}

interface AccountDetailsResponse {
  account: { iban?: string; currency?: string; ownerName?: string; product?: string }
}

export async function getAccountDetails(accountId: string) {
  const data = await gcFetch<AccountDetailsResponse>(`/accounts/${accountId}/details/`)
  return data.account
}

interface BalancesResponse {
  balances: { balanceAmount: { amount: string; currency: string }; balanceType: string }[]
}

export async function getAccountBalance(accountId: string): Promise<{ amount: number; currency: string } | null> {
  const data = await gcFetch<BalancesResponse>(`/accounts/${accountId}/balances/`)
  // "interimAvailable" je nejbližší ekvivalent "kolik teď reálně mám k dispozici" —
  // pokud chybí, sáhneme po "closingBooked" (poslední zaúčtovaný zůstatek).
  const balance =
    data.balances.find(b => b.balanceType === 'interimAvailable') ??
    data.balances.find(b => b.balanceType === 'closingBooked') ??
    data.balances[0]
  if (!balance) return null
  return { amount: parseFloat(balance.balanceAmount.amount), currency: balance.balanceAmount.currency }
}

interface RawTransaction {
  transactionId?: string
  internalTransactionId?: string
  bookingDate?: string
  valueDate?: string
  transactionAmount: { amount: string; currency: string }
  remittanceInformationUnstructured?: string
  remittanceInformationUnstructuredArray?: string[]
  debtorName?: string
  creditorName?: string
}

interface TransactionsResponse {
  transactions: { booked: RawTransaction[]; pending: RawTransaction[] }
}

export interface GoCardlessTransaction extends BankTransaction {
  externalId: string
}

export async function getAccountTransactions(accountId: string): Promise<GoCardlessTransaction[]> {
  const data = await gcFetch<TransactionsResponse>(`/accounts/${accountId}/transactions/`)
  return data.transactions.booked
    .map(tx => {
      const amount = parseFloat(tx.transactionAmount.amount)
      const description =
        tx.remittanceInformationUnstructured ??
        tx.remittanceInformationUnstructuredArray?.join(' ') ??
        tx.debtorName ?? tx.creditorName ?? ''
      return {
        externalId: tx.transactionId ?? tx.internalTransactionId ?? `${tx.bookingDate}-${tx.transactionAmount.amount}-${description}`,
        amount,
        currency: tx.transactionAmount.currency,
        date: tx.bookingDate ?? tx.valueDate ?? '',
        description,
      }
    })
    // Jen příchozí platby — stejná konvence jako ruční CSV/ABO import v bankParser.ts.
    .filter(tx => tx.amount > 0)
}
