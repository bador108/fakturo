import { SiteNav } from '@/components/layout/SiteNav'
import { PublicFooter } from '@/components/layout/PublicFooter'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#ffffff', minHeight: '100vh', fontFamily: 'var(--font-dm-sans), -apple-system, system-ui, sans-serif', WebkitFontSmoothing: 'antialiased' as const, color: '#0c0c0e' }}>
      <SiteNav />
      <main>{children}</main>
      <PublicFooter />
    </div>
  )
}
