-- migration9: tón upomínek (Přátelský / Věcný / Formální) + oprava znaménka dnů upomínek
-- Spustit v Supabase SQL editoru (projekt "fakturo", xiiaunjuhcdtzygauooc)

alter table public.users
  add column if not exists reminder_tone text not null default 'vecny'
  check (reminder_tone in ('pratelsky', 'vecny', 'formalni'));

-- reminder_days: kladné číslo = dny před splatností, záporné = po splatnosti (tak je ukládá Nastavení).
-- Cron dřív znaménko ignoroval, takže výchozí {3,7,14} posílal upomínky před i po splatnosti.
-- Kdo nastavení nikdy neměnil, dostane přesně to samé chování i po opravě:
update public.users set reminder_days = '{3,7,14,-3,-7,-14}' where reminder_days = '{3,7,14}';

-- noví uživatelé: připomínka 3 dny před splatností + 1.–3. upomínka 3, 7 a 14 dní po ní
alter table public.users alter column reminder_days set default '{3,-3,-7,-14}';
