import { createServiceClient } from '@/lib/supabase'

// Jednoduchý DB-backed rate limit pro veřejné no-auth endpointy (Vercel serverless
// nemá sdílenou paměť mezi instancemi, takže in-memory počítadlo by nefungovalo
// spolehlivě). Používá se jen tam, kde přiznaný request/min objem je nízký.
export async function checkRateLimit(
  table: string,
  ip: string,
  max: number,
  windowMinutes: number
): Promise<boolean> {
  const db = createServiceClient()
  const since = new Date(Date.now() - windowMinutes * 60_000).toISOString()

  const { count } = await db
    .from(table)
    .select('*', { count: 'exact', head: true })
    .eq('ip', ip)
    .gte('created_at', since)

  if ((count ?? 0) >= max) return false

  await db.from(table).insert({ ip })
  return true
}

export function getClientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
}
