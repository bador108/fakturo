-- migration4: dedicated clients table + invoice flags

-- Clients table (separate from invoice data)
create table if not exists public.clients (
  id          uuid primary key default uuid_generate_v4(),
  user_id     text not null references public.users(id) on delete cascade,
  name        text not null,
  address     text,
  city        text,
  zip         text,
  country     text not null default 'CZ',
  ico         text,
  dic         text,
  email       text,
  phone       text,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Reverse charge + VAT payer flags on invoices
alter table public.invoices
  add column if not exists vat_payer       boolean not null default true,
  add column if not exists reverse_charge  boolean not null default false;

-- plan column: allow 'start'
alter table public.users
  drop constraint if exists users_plan_check;
alter table public.users
  add constraint users_plan_check check (plan in ('free', 'start', 'pro'));
