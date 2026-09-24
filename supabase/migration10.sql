-- migration10: tóny upomínek Přátelský / Věcný / Formální (místo friendly/neutral/firm z migration9)
-- a výchozí rozvrh 3 dny před splatností + 1., 2. a 3. upomínka 3, 7 a 14 dní po ní.
-- Spustit v Supabase SQL editoru (projekt "fakturo", xiiaunjuhcdtzygauooc)

alter table public.users drop constraint if exists users_reminder_tone_check;
update public.users set reminder_tone = case reminder_tone
  when 'friendly' then 'pratelsky'
  when 'neutral' then 'vecny'
  when 'firm' then 'formalni'
  else reminder_tone end;
alter table public.users alter column reminder_tone set default 'vecny';
alter table public.users add constraint users_reminder_tone_check
  check (reminder_tone in ('pratelsky', 'vecny', 'formalni'));

-- uživatelé na výchozím rozvrhu z migration9 dostanou nový výchozí
alter table public.users alter column reminder_days set default '{3,-3,-7,-14}';
update public.users set reminder_days = '{3,-3,-7,-14}' where reminder_days = '{3,-1,-7,-14}';
