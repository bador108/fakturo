-- migration5: DPH sazba 0/12/21 (aktualni cesky zakon, ne stare 0/15/21) + konstantni symbol
-- Spustit v Supabase SQL editoru (projekt "fakturo", xiiaunjuhcdtzygauooc)

alter table public.invoices drop constraint if exists invoices_vat_rate_check;
alter table public.invoices add constraint invoices_vat_rate_check
  check (vat_rate is null or vat_rate = any (array[0, 12, 21]::numeric[]));

alter table public.invoices add column if not exists constant_symbol text;
