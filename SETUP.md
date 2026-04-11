# Fakturo – Setup Guide

## 1. Clone & install

```bash
cd fakturo
npm install
```

## 2. Environment variables

Copy `.env.local` and fill in real values:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | clerk.com → API Keys |
| `CLERK_SECRET_KEY` | clerk.com → API Keys |
| `NEXT_PUBLIC_SUPABASE_URL` | supabase.com → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | supabase.com → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | supabase.com → Project Settings → API |
| `STRIPE_SECRET_KEY` | dashboard.stripe.com → API Keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | dashboard.stripe.com → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe CLI `stripe listen` output |
| `STRIPE_PRO_PRICE_ID` | Stripe → Products → create a $5/month price |
| `CLERK_WEBHOOK_SECRET` | Clerk → Webhooks → endpoint secret |

## 3. Supabase schema

Run `supabase/schema.sql` in the Supabase SQL editor.

## 4. Clerk configuration

- Set redirect URLs in Clerk dashboard:
  - Sign-in: `/dashboard`
  - Sign-up: `/dashboard`
- Add Webhook endpoint: `https://your-domain.com/api/clerk`
  - Event: `user.created`
  - Copy the signing secret → `CLERK_WEBHOOK_SECRET`

## 5. Stripe setup

```bash
# Install Stripe CLI and forward webhooks locally
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Create a product:
- Name: Fakturo Pro
- Price: $5.00 / month (recurring)
- Copy Price ID → `STRIPE_PRO_PRICE_ID`

## 6. Run locally

```bash
npm run dev
```

Open http://localhost:3000
