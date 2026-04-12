# Fakturo — CLAUDE.md

## Project Overview
**Fakturo** is a Czech SaaS invoice generator for freelancers and small businesses.
- Next.js 14 App Router + TypeScript + Tailwind CSS
- Auth: Clerk v7
- Payments: Stripe v22
- Database: Supabase (Postgres + RLS)
- PDF generation: `@react-pdf/renderer`
- Deployed on Vercel

Free tier: 15 invoices/month. Start tier: 99 Kč/month (unlimited invoices, expenses, cashflow). Pro tier: 249 Kč/month (everything + recurring invoices, reminders, Pohoda export, item templates, multiple sender profiles).

---

## Commands
```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint
```

---

## Project Structure
```
src/
  app/
    (auth)/           # sign-in, sign-up pages (Clerk)
    (dashboard)/      # protected: dashboard, invoices, settings, billing
    api/
      invoices/       # GET list, POST create, [id]/ PUT/DELETE
      pdf/[id]/       # PDF generation
      stripe/         # checkout session + webhook
    page.tsx          # Landing page (public)
  components/
    invoice/          # InvoiceForm, InvoiceStatusBadge
    ui/               # Button, Input, Select (shared primitives)
  lib/
    supabase.ts       # createClient() + createServiceClient()
    utils.ts          # cn(), calcTotals(), formatCurrency()
  types/              # TypeScript types (Invoice, InvoiceFormData, etc.)
supabase/
  schema.sql          # Full DB schema with RLS policies
```

---

## Architecture Patterns

### Server vs Client Components
- Route pages (`page.tsx`) are **Server Components** by default
- Components with state/events have `'use client'` at top
- Fetch data in Server Components, pass as props to Client Components

### Clerk Imports (v7)
```ts
// Server-side ONLY:
import { auth, currentUser } from '@clerk/nextjs/server'
const { userId } = await auth()   // auth() is ASYNC in v7

// Client-side:
import { useUser } from '@clerk/nextjs'
import { UserButton } from '@clerk/nextjs'
```

**Never** import `auth` or `currentUser` from `@clerk/nextjs` (without `/server`) — it will crash.

### Supabase Clients
```ts
// Regular client (respects RLS, uses anon key):
import { createClient } from '@/lib/supabase'
const db = createClient()

// Service client (bypasses RLS, uses service_role key):
import { createServiceClient } from '@/lib/supabase'
const db = createServiceClient()
```

Use service client in API routes and server actions where you need to bypass RLS.

### API Route Pattern
```ts
export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  await ensureUser(userId)   // auto-creates Supabase user if missing
  // ... query Supabase
}
```

### ensureUser() — Auto User Creation
There is no Clerk webhook configured. Instead, `ensureUser(userId)` is called at the start of every API route and in the dashboard layout. It checks if the user exists in Supabase and creates them if not.

```ts
async function ensureUser(userId: string) {
  const db = createServiceClient()
  const { data } = await db.from('users').select('id').eq('id', userId).single()
  if (!data) {
    const clerkUser = await currentUser()
    await db.from('users').insert({
      id: userId,
      email: clerkUser?.emailAddresses[0]?.emailAddress ?? '',
      full_name: `${clerkUser?.firstName ?? ''} ${clerkUser?.lastName ?? ''}`.trim(),
    })
  }
}
```

---

## Code Style

### Naming Conventions
- Components: `PascalCase` (e.g., `InvoiceForm`, `StatusBadge`)
- Hooks: `camelCase` with `use` prefix
- Utilities: `camelCase`
- DB columns: `snake_case` (matching Supabase)
- TypeScript types: `PascalCase`

### Exports
- Use **named exports** for components: `export function InvoiceForm()`
- Use **default exports** for Next.js pages: `export default function Page()`

### TypeScript
- Avoid `any` except for Stripe webhook events (type safety issue with v22)
- Use types from `@/types` for Invoice, InvoiceFormData, etc.
- Form state uses `InvoiceFormData` interface

---

## Frontend Guidelines

### Color Palette
- **Primary:** `indigo-600` (buttons, links, accents)
- **Background:** `slate-50` (page), `white` (cards/forms)
- **Text:** `slate-900` (headings), `slate-600` (body), `slate-400` (muted)
- **Borders:** `slate-100` (subtle), `slate-200` (inputs)
- **Success:** `emerald-500`
- **Error:** `red-400`

### No Dark Mode
This project does NOT use dark mode. Do not add `dark:` Tailwind classes.

### cn() utility
```ts
import { cn } from '@/lib/utils'
<div className={cn('base-class', condition && 'conditional-class', className)} />
```

### Form Fields
All form inputs must have white backgrounds:
```ts
className="bg-white border-slate-200 text-slate-900"
```

### Layouts
- Max content width: `max-w-5xl` (forms), `max-w-6xl` (landing page)
- Card style: `bg-white rounded-xl border border-slate-100 shadow-sm p-5`

---

## Component Conventions
- Use `forwardRef` for primitive UI components (`Input`, `Select`, `Button`)
- Keep components under ~150 lines; split if larger
- Co-locate related components (e.g., `InvoiceForm` + `InvoiceStatusBadge` in `components/invoice/`)

---

## Czech Localization
- All UI text is in **Czech**
- Currency: CZK primary, also EUR and USD
- VAT (DPH) rates: 0%, 15%, 21%
- Czech business fields: IČO (company ID), DIČ (VAT number)
- Date format: ISO `YYYY-MM-DD` in forms, display as Czech locale
- Terminology:
  - Faktura = Invoice
  - Dodavatel = Supplier/Sender
  - Odběratel = Client/Recipient
  - Základ DPH = VAT base
  - Celkem = Total

---

## What NOT To Do

1. **Don't import Clerk server utilities from `@clerk/nextjs`** — always use `@clerk/nextjs/server`
2. **Don't use `authMiddleware`** — it's Clerk v4. Use `clerkMiddleware` + `createRouteMatcher`
3. **Don't use `auth()` synchronously** — it's async in Clerk v7: `const { userId } = await auth()`
4. **Don't use `SignedIn`/`SignedOut` components in Server Components** — use `auth()` check instead
5. **Don't pass `apiVersion` to Stripe constructor** — not needed in v22 and causes type errors
6. **Don't use the anon Supabase client in API routes** — use `createServiceClient()` to bypass RLS
7. **Don't add dark mode classes** — design is light-only
8. **Don't use `sed -i` for multi-line replacements** — use the Edit tool instead to avoid file corruption
9. **Don't hardcode user IDs** — always get `userId` from `auth()`
10. **Don't forget `ensureUser()`** in new API routes — Supabase user may not exist yet

---

## Environment Variables
```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_PRICE_ID=
```

---

## Git Workflow
- Branch: `main`
- Remote: `github.com/bador108/fakturo`
- Deployed via Vercel (auto-deploy on push to main)
- Commit messages in English, imperative mood
