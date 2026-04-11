import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'latin-ext'] })

export const metadata: Metadata = {
  title: 'Fakturo – Online fakturace',
  description: 'Profesionální fakturace pro freelancery a malé firmy.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="cs">
        <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
