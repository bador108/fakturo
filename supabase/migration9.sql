-- migration9: tón upomínek (3 varianty) + oprava výchozích dnů upomínek
-- Spustit v Supabase SQL editoru (projekt "fakturo", xiiaunjuhcdtzygauooc) PŘED nasazením kódu,
-- nastavení i cron čtou sloupec reminder_tone.

-- Tón e-mailu s upomínkou: přátelský / věcný / důrazný
alter table public.users
  add column if not exists reminder_tone text not null default 'neutral'
  check (reminder_tone in ('friendly', 'neutral', 'firm'));

-- reminder_days: kladné = dní PŘED splatností, záporné = dní PO splatnosti.
-- Původní výchozí '{3,7,14}' cron chybně posílal před i po splatnosti; nový výchozí
-- rozvrh "Běžně" = 3 dny před + 1, 7 a 14 dní po splatnosti.
alter table public.users alter column reminder_days set default '{3,-1,-7,-14}';
update public.users set reminder_days = '{3,-1,-7,-14}' where reminder_days = '{3,7,14}';
