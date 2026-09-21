import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Generátor faktur zdarma bez registrace – Fakturo',
  description: 'Vystav fakturu online během pár minut a stáhni ji jako PDF. Bez registrace, s QR platbou a správným DPH. Pro OSVČ i firmy.',
  alternates: { canonical: '/generator' },
}

export default function GeneratorLayout({ children }: { children: React.ReactNode }) {
  return children
}
