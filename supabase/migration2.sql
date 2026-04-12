-- Run this in Supabase SQL Editor after migrations.sql

-- Add invoice_type and client_email to invoices
alter table public.invoices
  add column if not exists invoice_type text not null default 'faktura'
    check (invoice_type in ('faktura', 'zalohova', 'opravny')),
  add column if not exists client_email text;

-- Expenses table
create table if not exists public.expenses (
  id            uuid primary key default uuid_generate_v4(),
  user_id       text not null references public.users(id) on delete cascade,
  date          date not null default current_date,
  vendor        text not null,
  description   text,
  amount        numeric(12,2) not null,
  currency      text not null default 'CZK',
  category      text not null default 'ostatni'
    check (category in ('kancelar', 'cestovne', 'software', 'hardware', 'marketing', 'ostatni')),
  vat_claimable boolean not null default false,
  receipt_url   text,
  created_at    timestamptz not null default now()
);
create index if not exists expenses_user_idx on public.expenses (user_id, date desc);
alter table public.expenses enable row level security;
create policy "expenses: own" on public.expenses
  using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
