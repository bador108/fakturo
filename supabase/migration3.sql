-- ============================================================
-- Fakturo – migration 3 (run in Supabase SQL editor)
-- ============================================================

-- Item templates (saved frequently-used line items)
create table if not exists public.item_templates (
  id          uuid primary key default uuid_generate_v4(),
  user_id     text not null references public.users(id) on delete cascade,
  name        text not null,
  description text not null default '',
  unit        text not null default 'ks',
  unit_price  numeric(12,2) not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists item_templates_user_id_idx on public.item_templates (user_id);
alter table public.item_templates enable row level security;
create policy "item_templates: own" on public.item_templates
  using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Extend invoice_type to support quotes ('nabidka')
alter table public.invoices drop constraint if exists invoices_invoice_type_check;
alter table public.invoices
  add constraint invoices_invoice_type_check
  check (invoice_type in ('faktura', 'zalohova', 'opravny', 'nabidka'));

-- Reminder settings per user
alter table public.users add column if not exists reminder_days integer[] not null default '{3,7,14}';

-- Track which reminders have been sent (prevents duplicates)
create table if not exists public.invoice_reminders (
  id          uuid primary key default uuid_generate_v4(),
  invoice_id  uuid not null references public.invoices(id) on delete cascade,
  days_offset integer not null,
  sent_at     timestamptz not null default now(),
  unique (invoice_id, days_offset)
);
alter table public.invoice_reminders enable row level security;
create policy "invoice_reminders: service_role_only" on public.invoice_reminders
  using (false); -- only accessible via service role (cron)
