-- migration6: uloziste pro prizpusobitelny (drag & drop, resize, barvy) Finance dashboard
-- Spustit v Supabase SQL editoru (projekt "fakturo", xiiaunjuhcdtzygauooc)

alter table public.users add column if not exists dashboard_layout jsonb;
