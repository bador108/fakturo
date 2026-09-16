-- migration8: interni inbox pro kontaktni formular a in-app support/feedback
-- nahrazuje posilani emailu na support@fakturo.online (bouncelo kvuli spam skore)
-- Spustit v Supabase SQL editoru (projekt "fakturo", xiiaunjuhcdtzygauooc)

create table if not exists public.inbox_messages (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('contact', 'support')),
  category text not null,
  name text,
  email text,
  user_id text references public.users(id) on delete set null,
  subject text not null,
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'resolved')),
  created_at timestamptz not null default now()
);

create index if not exists inbox_messages_created_at_idx on public.inbox_messages (created_at desc);

alter table public.inbox_messages enable row level security;
-- Zadne RLS policy pro anon/authenticated roli — pristup jen pres service-role
-- klient v API routach (stejny vzor jako zbytek appky), gatovano na owner e-maily.
