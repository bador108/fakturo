import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublic = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/generator(.*)',
  '/api/clerk(.*)',
  '/api/stripe/webhook(.*)',
  '/api/ares(.*)',
  '/api/pdf/generate(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()

  // Logged-in user visiting sign-in/sign-up → redirect to dashboard
  if (userId && (req.nextUrl.pathname.startsWith('/sign-in') || req.nextUrl.pathname.startsWith('/sign-up'))) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  if (!isPublic(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
