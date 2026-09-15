# Fakturo — mapa projektu

Referenční mapa codebase pro rychlejší orientaci při hledání bugů a implementaci nových věcí.
Generováno z reálného stavu repa + živé Supabase schéma (ne z paměti/dohadů).

---

## Stack

- **Next.js 14 App Router** + TypeScript + Tailwind CSS
- **Auth:** Clerk v7 (`@clerk/nextjs/server` pro server, `@clerk/nextjs` pro client — nikdy neplést)
- **DB:** Supabase Postgres + RLS, service-role klient (`createServiceClient()`) pro API routy
- **Platby:** Stripe v22 (subscription checkout) + Stripe Checkout (payment link per faktura)
- **Email:** Resend, sender `onboarding@resend.dev` (žádná vlastní ověřená doména)
- **PDF:** Puppeteer (`puppeteer-core` + `@sparticuz/chromium` na Vercelu) renderuje HTML → PDF. NE `@react-pdf/renderer` (mělo font-subsetting bug na české diakritice, odstraněno)
- **Deploy:** Vercel, auto-deploy z `master`

---

## Route mapa

### Veřejné (`src/app/(public)/`) — marketing/info stránky
`funkce`, `cenik`, `o-nas`, `kontakt`, `blog`, `reference`, `napoveda/[category]/[article]`, `gdpr`, `bezpecnost`, `stav-sluzby`, `pravidelne-fakturace`, `api-developers`

**Chybí:** `/obchodni-podminky` (VOP) — appka má živé Stripe platby, právně by měla mít.

### Landing + demo
- `src/app/page.tsx` — hlavní landing page (root `/`)
- `src/app/generator/page.tsx` — **veřejný generátor faktury bez registrace**, používá `/api/pdf/generate` (no-auth endpoint)

### Auth (`src/app/(auth)/`)
`sign-in`, `sign-up` — Clerk prebuilt komponenty

### Dashboard (`src/app/(dashboard)/`) — za přihlášením
`dashboard`, `invoices`, `invoices/new`, `invoices/[id]`, `clients`, `clients/[name]`, `expenses`, `finance`, `recurring`, `settings`

### API routy (`src/app/api/`)
| Route | Účel | Auth |
|---|---|---|
| `invoices/`, `invoices/[id]`, `invoices/[id]/copy` | CRUD faktur | ✓ |
| `invoices/[id]/send` | odeslat fakturu mailem (Resend) | ✓ |
| `invoices/[id]/payment-link` | **Stripe Checkout platební odkaz** (existuje!) | ✓ |
| `pdf/[id]` | PDF vygenerování pro existující fakturu | ✓ |
| `pdf/generate` | **veřejný** PDF generátor (žádný auth, validace vstupu) | ✗ no-auth |
| `clients/`, `clients/[id]` | CRUD klientů | ✓ |
| `sender-profiles/`, `sender-profiles/[id]` | CRUD profilů dodavatele (branding barva tu) | ✓ |
| `expenses/`, `expenses/[id]` | CRUD výdajů | ✓ |
| `expenses/parse` | regex quick-entry parser pro výdaje | ✓ |
| `recurring/`, `recurring/[id]` | opakující se faktury | ✓ |
| `item-templates/`, `item-templates/[id]` | šablony položek | ✓ |
| `export/pohoda` | Pohoda XML export | ✓ |
| `export/json/[id]` | JSON export jedné faktury | ✓ |
| `ares` | ARES IČO lookup/autocomplete | ✓ |
| `vat-suggest` | navrhne sazbu DPH podle popisu položky | ✓ |
| `cnb-rates` | live kurzy ČNB (cache 4h) | ✗ (interní fetch) |
| `bank/upload`, `bank/confirm` | výpis z banky → automatické párování plateb | ✓ |
| `dashboard-layout` | GET/PUT `users.dashboard_layout` (drag/resize widgety) | ✓ |
| `notifications` | notifikace | ✓ |
| `settings/reminders` | dny upomínek | ✓ |
| `support` | kontaktní formulář → Resend → `fakturosupport@gmail.com` | ✓ |
| `stripe/create-checkout`, `stripe/portal`, `stripe/webhook` | subscription platby | ✓ / webhook |
| `cron/reminders` | Vercel cron (`vercel.json`), denní upomínky na splatnost | cron |
| `clerk` | — | — |

**Chybí:** ISDOC export route, rate-limit na `pdf/generate`.

---

## Databázové schéma (Supabase, `xiiaunjuhcdtzygauooc`)

Živé tabulky (ověřeno přes `list_tables`, ne ze `schema.sql` který může zaostávat):

- **`users`** — `id` (Clerk userId), `email`, `plan` (free/start/pro), Stripe ids, `invoice_count_this_month`, `reminder_days[]`, `dashboard_layout` jsonb
- **`sender_profiles`** — dodavatelské profily, `accent_color` (branding, Start/Pro)
- **`invoices`** — hlavní tabulka. `sender_*`/`client_*` jsou **snapshot** (kopie při vytvoření, ne live join na sender_profiles/clients). `accent_color` snapshot taky. ⚠️ `vat_rate` sloupec má CHECK `[0,15,21]` — **legacy, nepoužívaný** (skutečné DPH je per-položka v `invoice_items.vat_rate`, viz `calcTotals()`). Nerozbíjet, jen ignorovat.
- **`invoice_items`** — položky, `total` je generated column (`quantity * unit_price`)
- **`recurring_invoices`** — šablony pro opakované fakturace, `items` jako jsonb (ne FK na invoice_items)
- **`expenses`** — `category` CHECK omezený na pevný seznam (kancelar/cestovne/software/hardware/marketing/ostatni) — `ExpenseCategory` typ v TS má navíc `| string` fallback, ale DB to nepustí
- **`item_templates`**, **`notifications`**, **`invoice_reminders`**, **`clients`**

Migrace: `supabase/migration2.sql` … `migration7.sql` (accent_color, poslední). `schema.sql` = baseline, může být pozadu za migracemi — **věřit `list_tables`, ne schema.sql**.

---

## Klíčové `lib/` moduly

| Soubor | Účel |
|---|---|
| `invoiceHtml.ts` | HTML template pro PDF (`renderInvoiceHtml`) — QR SPAYD, accent_color, DUZP/VS/DPH texty tu jsou |
| `pdfBrowser.ts` | `renderPdfFromHtml()` — Puppeteer/Chromium render, čeká na `document.fonts.ready` |
| `utils.ts` | `calcTotals()` (per-item DPH rozpad), `buildMonthData()` (12měsíční cashflow agregace), `formatCurrency`, `generateInvoiceNumber` |
| `supabase.ts` | `createClient()` (RLS) vs `createServiceClient()` (bypass, pro API routy) |
| `stripe.ts` | `OWNER_EMAIL` (vlastník = auto-pro plán bez Stripe), `getEffectivePlan()`, `FREE_TIER_LIMIT=15` |
| `ensureUser.ts` | auto-vytvoří Supabase user řádek při prvním přístupu (žádný Clerk webhook není nakonfigurovaný) |
| `bankParser.ts` | parsuje nahraný bankovní výpis pro auto-párování plateb |
| `pricing.ts` | cenové konstanty |

---

## Klíčové komponenty (podle domény)

**Faktury:** `invoice/InvoiceForm.tsx` (velký, sender profil switch, VAT suggest, IBAN/QR), `PohodaExportButton.tsx`

**Dashboard/Finance:** `FinanceDashboardGrid.tsx` (drag/resize widget grid, 22 widgetů v katalogu, `dashboard_layout` persist), `FinanceCharts.tsx`, `CashflowChart.tsx`

**Klienti:** `ClientsManager.tsx`, `ClientPicker.tsx`

**Landing:** `FeatureShowcase.tsx` (reálné screenshoty + lightbox, `public/screenshots/*.png`), `Reveal.tsx` (framer-motion scroll fade-up), `PhoneMockup.tsx`, `PricingSection.tsx`

**Widgety (floating):** `SupportButton.tsx` (bottom-left, "?" kontakt), `BotcraftWidget.tsx` (bottom-right, AI chat, externí Botcraft projekt)

**Nastavení:** `SenderProfilesManager.tsx` (branding barva tu, gated `canBrand`), `ItemTemplatesManager.tsx`, `ReminderSettings.tsx`, `BankStatementUpload.tsx`

**UI primitives:** `ui/button.tsx`, `ui/input.tsx`, `ui/select.tsx`, `ui/badge.tsx` — `forwardRef`, `cn()` pattern

---

## Externí integrace

| Služba | Kde | Poznámka |
|---|---|---|
| Clerk | auth v7 | žádný webhook, `ensureUser()` dělá lazy-create |
| Supabase | `xiiaunjuhcdtzygauooc` (eu-west-2) | service-role klient v API routách |
| Stripe | subscriptions + payment-link | `OWNER_EMAIL` override na pro plán |
| Resend | `onboarding@resend.dev` | žádná vlastní ověřená doména — blokuje branding "from" adresy |
| ARES | `api/ares` | IČO/DIČ autocomplete |
| ČNB | `api/cnb-rates` | live kurzy, cache 4h |
| Botcraft | `BotcraftWidget.tsx` | externí AI chat projekt (`botcraft.vercel.app`) |
| Perplexity MCP | `~/.claude.json`, user scope | pro Claude Code session, NE appka |

---

## Známé mezery / tech debt (k tomuto datu)

- [ ] `/obchodni-podminky` stránka neexistuje (Stripe platby bez VOP)
- [ ] `api/pdf/generate` veřejný bez rate-limitu (zneužitelný pro fake faktury/DoS)
- [ ] Branding: jen `accent_color`, žádné logo upload, žádné šablony PDF
- [ ] ISDOC export neexistuje (jen Pohoda XML + PDF)
- [ ] Žádná vlastní doména pro Resend → PDF/email "od" ukazuje `onboarding@resend.dev`
- [ ] `invoices.vat_rate` legacy sloupec s DPH check `[0,15,21]` (skutečné sazby jsou `0,12,21` per-item) — matoucí, ale neškodí
- [ ] Client portal (sledování stavu faktury klientem) neexistuje
- [ ] Proforma/dobropis/nabídka typy v DB/TS existují (`invoice_type`), ale nejsou tier-gatovaný ani zvlášť promovaný jako feature
- [x] Test user (username `test`, pro plán) — hotovo přes `scripts/create-test-user.mjs` (heslo se nezapisuje do repa, jen do Clerk databáze)

---

_Aktualizovat při větších strukturálních změnách (nová tabulka, nový route grouping, nová externí integrace)._
