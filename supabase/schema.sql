-- ============================================================
-- Fakturo – Supabase schema
-- Run this in the Supabase SQL editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- USERS (mirrors Clerk user, stores subscription state)
-- ============================================================
create table public.users (
  id           text primary key,          -- Clerk userId
  email        text not null unique,
  full_name    text,
  plan         text not null default 'free' check (plan in ('free', 'pro')),
  stripe_customer_id      text unique,
  stripe_subscription_id  text unique,
  invoice_count_this_month integer not null default 0,
  invoice_count_reset_at   timestamptz not null default date_trunc('month', now()),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ============================================================
-- SENDER PROFILES (saved sender info per user)
-- ============================================================
create table public.sender_profiles (
  id         uuid primary key default uuid_generate_v4(),
  user_id    text not null references public.users(id) on delete cascade,
  name       text not null,
  address    text,
  city       text,
  zip        text,
  country    text not null default 'CZ',
  ico        text,               -- IČO
  dic        text,               -- DIČ
  bank_account text,
  iban       text,
  email      text,
  phone      text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- INVOICES
-- ============================================================
create table public.invoices (
  id             uuid primary key default uuid_generate_v4(),
  user_id        text not null references public.users(id) on delete cascade,
  invoice_number text not null,
  status         text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'cancelled')),

  -- Sender snapshot (copied at creation time)
  sender_name    text not null,
  sender_address text,
  sender_city    text,
  sender_zip     text,
  sender_country text not null default 'CZ',
  sender_ico     text,
  sender_dic     text,
  sender_bank    text,
  sender_iban    text,
  sender_email   text,
  sender_phone   text,

  -- Client info
  client_name    text not null,
  client_address text,
  client_city    text,
  client_zip     text,
  client_country text not null default 'CZ',
  client_ico     text,

  -- Dates
  issue_date     date not null default current_date,
  due_date       date not null,

  -- Financials
  currency       text not null default 'CZK',
  vat_rate       numeric(5,2) not null default 21 check (vat_rate in (0, 15, 21)),
  subtotal       numeric(12,2) not null default 0,
  vat_amount     numeric(12,2) not null default 0,
  total          numeric(12,2) not null default 0,

  notes          text,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  unique (user_id, invoice_number)
);

-- ============================================================
-- INVOICE ITEMS
-- ============================================================
create table public.invoice_items (
  id           uuid primary key default uuid_generate_v4(),
  invoice_id   uuid not null references public.invoices(id) on delete cascade,
  position     integer not null default 0,
  description  text not null,
  quantity     numeric(10,3) not null default 1,
  unit         text not null default 'ks',
  unit_price   numeric(12,2) not null,
  total        numeric(12,2) generated always as (quantity * unit_price) stored
);

-- ============================================================
-- INDEXES
-- ============================================================
create index on public.invoices (user_id, created_at desc);
create index on public.invoices (user_id, status);
create index on public.invoice_items (invoice_id, position);
create index on public.sender_profiles (user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.users           enable row level security;
alter table public.sender_profiles enable row level security;
alter table public.invoices        enable row level security;
alter table public.invoice_items   enable row level security;

-- Users: can only see/edit their own row
create policy "users: own row" on public.users
  using (id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Sender profiles
create policy "sender_profiles: own" on public.sender_profiles
  using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Invoices
create policy "invoices: own" on public.invoices
  using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Invoice items (via invoice ownership)
create policy "invoice_items: own" on public.invoice_items
  using (
    invoice_id in (
      select id from public.invoices
      where user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- ============================================================
-- AUTO-UPDATE updated_at
-- ============================================================
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_users_updated_at
  before update on public.users
  for each row execute function update_updated_at();

create trigger trg_invoices_updated_at
  before update on public.invoices
  for each row execute function update_updated_at();

-- ============================================================
-- MONTHLY INVOICE COUNT RESET (run via pg_cron or edge function)
-- ============================================================
create or replace function reset_monthly_invoice_counts()
returns void language plpgsql as $$
begin
  update public.users
  set invoice_count_this_month = 0,
      invoice_count_reset_at   = date_trunc('month', now())
  where invoice_count_reset_at < date_trunc('month', now());
end;
$$;
