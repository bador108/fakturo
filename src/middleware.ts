import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublic = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/generator(.*)',
  '/funkce(.*)',
  '/cenik(.*)',
  '/pravidelne-fakturace(.*)',
  '/o-nas(.*)',
  '/kontakt(.*)',
  '/blog(.*)',
  '/f/(.*)',
  '/api/pdf/public/(.*)',
  '/gdpr(.*)',
  '/obchodni-podminky(.*)',
  '/api/contact(.*)',
  '/api/clerk(.*)',
  '/api/stripe/webhook(.*)',
  '/api/ares(.*)',
  '/api/pdf/generate(.*)',
])

const isProtected = createRouteMatcher([
  '/dashboard(.*)',
  '/invoices(.*)',
  '/clients(.*)',
  '/expenses(.*)',
  '/finance(.*)',
  '/recurring(.*)',
  '/settings(.*)',
  '/zpravy(.*)',
  '/checkout(.*)',
  '/api(.*)',
  '/trpc(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()

  // Logged-in user visiting sign-in/sign-up → redirect to dashboard
  if (userId && (req.nextUrl.pathname.startsWith('/sign-in') || req.nextUrl.pathname.startsWith('/sign-up'))) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Neznámé adresy se nechrání — ať se ukáže skutečná 404 stránka, ne přesměrování na přihlášení.
  if (!isPublic(req) && isProtected(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
