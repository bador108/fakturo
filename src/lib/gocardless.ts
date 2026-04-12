// GoCardless Open Banking (Nordigen) API wrapper
const BASE = 'https://bankaccountdata.gocardless.com/api/v2'

let cachedToken: { access: string; expiresAt: number } | null = null

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.access
  }
  const res = await fetch(`${BASE}/token/new/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret_id: process.env.GOCARDLESS_SECRET_ID,
      secret_key: process.env.GOCARDLESS_SECRET_KEY,
    }),
  })
  if (!res.ok) throw new Error('GoCardless auth failed')
  const data = await res.json()
  cachedToken = { access: data.access, expiresAt: Date.now() + data.access_expires * 1000 }
  return cachedToken.access
}

async function gocardless(path: string, options: RequestInit = {}) {
  const token = await getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`GoCardless ${path} failed: ${err}`)
  }
  return res.json()
}

export async function getInstitutions(country = 'CZ') {
  return gocardless(`/institutions/?country=${country}`)
}

export async function createRequisition(institutionId: string, redirectUrl: string, reference: string) {
  return gocardless('/requisitions/', {
    method: 'POST',
    body: JSON.stringify({
      institution_id: institutionId,
      redirect: redirectUrl,
      reference,
      user_language: 'CS',
    }),
  })
}

export async function getRequisition(requisitionId: string) {
  return gocardless(`/requisitions/${requisitionId}/`)
}

export async function getAccountTransactions(accountId: string, dateFrom?: string) {
  const params = dateFrom ? `?date_from=${dateFrom}` : ''
  return gocardless(`/accounts/${accountId}/transactions/${params}`)
}

export async function getAccountDetails(accountId: string) {
  return gocardless(`/accounts/${accountId}/details/`)
}
