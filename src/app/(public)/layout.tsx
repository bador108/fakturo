import { PublicNav } from '@/components/layout/PublicNav'
import { PublicFooter } from '@/components/layout/PublicFooter'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', fontFamily: "'Inter', -apple-system, system-ui, sans-serif", WebkitFontSmoothing: 'antialiased' as const, color: '#0c0c0e' }}>
      <PublicNav />
      <main>{children}</main>
      <PublicFooter />
    </div>
  )
}
