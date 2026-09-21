import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Registrace zdarma – Fakturo',
  robots: { index: false, follow: true },
}

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return children
}
