-- Accent barva pro branding faktur (Start/Pro tarif) — jen barva, žádné logo/šablony zatím.
alter table public.sender_profiles add column if not exists accent_color text;
alter table public.invoices add column if not exists accent_color text;
