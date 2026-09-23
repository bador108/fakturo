import type { Metadata, Viewport } from 'next'
import { Inter, DM_Sans } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { ToastProvider } from '@/components/Toast'
import { CursorPreferenceLoader } from '@/components/CursorPreferenceLoader'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'latin-ext'] })
const dmSans = DM_Sans({ subsets: ['latin', 'latin-ext'], variable: '--font-dm-sans', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL('https://fakturo.online'),
  title: 'Fakturo – Online fakturace',
  description: 'Profesionální fakturace pro freelancery a malé firmy.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Fakturo',
    statusBarStyle: 'default',
  },
  icons: {
    icon: '/icon.png',
    apple: '/icons/apple-touch-icon.png',
  },
  openGraph: {
    siteName: 'Fakturo',
    locale: 'cs_CZ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  interactiveWidget: 'resizes-content',
  themeColor: '#16a34a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#16a34a',
          colorText: '#0f172a',
          colorTextSecondary: '#64748b',
          colorBackground: '#ffffff',
          colorInputBackground: '#ffffff',
          colorInputText: '#0f172a',
          fontFamily: 'var(--font-dm-sans), sans-serif',
          borderRadius: '0.75rem',
        },
      }}
    >
      <html lang="cs">
        <body className={`${inter.className} ${dmSans.variable} bg-slate-50 text-slate-900 antialiased`}>
          <CursorPreferenceLoader />
          <ToastProvider>{children}</ToastProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
