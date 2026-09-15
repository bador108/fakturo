import { redirect } from 'next/navigation'

// Finance je teď součástí Přehledu (/dashboard) — starý odkaz jen přesměrovat.
export default function FinancePage() {
  redirect('/dashboard')
}
