'use client'

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'

// Sdílený návratový bod pro Google OAuth — používá ho jak /sign-in, tak /sign-up.
export default function SSOCallbackPage() {
  return (
    <AuthenticateWithRedirectCallback
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    />
  )
}
