export type Plan = 'free' | 'start' | 'pro'

export function isPro(plan: string | null | undefined): boolean {
  return plan === 'pro'
}

export function isPaid(plan: string | null | undefined): boolean {
  return plan === 'start' || plan === 'pro'
}
