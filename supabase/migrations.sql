-- ============================================================
-- Fakturo – migrations (run after schema.sql)
-- ============================================================

-- Notifications
create table if not exists public.notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    text not null references public.users(id) on delete cascade,
  type       text not null check (type in ('overdue', 'reminder', 'paid', 'system')),
  title      text not null,
  message    text not null,
  invoice_id uuid references public.invoices(id) on delete cascade,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists on public.notifications (user_id, read, created_at desc);
alter table public.notifications enable row level security;
create policy "notifications: own" on public.notifications
  using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Recurring invoices
create table if not exists public.recurring_invoices (
  id               uuid primary key default uuid_generate_v4(),
  user_id          text not null references public.users(id) on delete cascade,
  name             text not null,
  recurrence       text not null check (recurrence in ('weekly', 'monthly', 'quarterly', 'yearly')),
  next_date        date not null,
  is_active        boolean not null default true,
  -- Snapshot of invoice template
  sender_name      text not null,
  sender_address   text,
  sender_city      text,
  sender_zip       text,
  sender_country   text not null default 'CZ',
  sender_ico       text,
  sender_dic       text,
  sender_bank      text,
  sender_iban      text,
  sender_email     text,
  sender_phone     text,
  client_name      text not null,
  client_address   text,
  client_city      text,
  client_zip       text,
  client_country   text not null default 'CZ',
  client_ico       text,
  currency         text not null default 'CZK',
  vat_rate         numeric(5,2) not null default 21,
  notes            text,
  due_days         integer not null default 14,
  items            jsonb not null default '[]',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists on public.recurring_invoices (user_id);
alter table public.recurring_invoices enable row level security;
create policy "recurring: own" on public.recurring_invoices
  using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
create trigger trg_recurring_updated_at
  before update on public.recurring_invoices
  for each row execute function update_updated_at();
