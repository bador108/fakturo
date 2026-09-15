-- Živá bankovní synchronizace přes Salt Edge Account Information API.
-- (GoCardless Bank Account Data zavřelo nové registrace, viz commit historie —
-- proto provider-neutrální sloupce, ať další výpadek poskytovatele nevyžaduje
-- další migraci schématu, jen výměnu src/lib/<provider>.ts.)

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bank_provider_customer_id TEXT;

-- bank_connections = jedno propojení s bankou u daného poskytovatele.
CREATE TABLE IF NOT EXISTS public.bank_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'saltedge',
  provider_connection_id TEXT NOT NULL UNIQUE,
  institution_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'error')),
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- bank_accounts = jeden bankovní účet v rámci propojení.
CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES public.bank_connections(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider_account_id TEXT NOT NULL UNIQUE,
  iban TEXT,
  currency TEXT NOT NULL DEFAULT 'CZK',
  display_name TEXT,
  balance NUMERIC,
  balance_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- bank_transactions = cache stažených transakcí (šetří rate limit, drží vazbu na spárovanou fakturu).
CREATE TABLE IF NOT EXISTS public.bank_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider_transaction_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'CZK',
  booking_date DATE,
  description TEXT,
  matched_invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (account_id, provider_transaction_id)
);

ALTER TABLE public.bank_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own bank connections" ON public.bank_connections FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "Users own bank accounts" ON public.bank_accounts FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "Users own bank transactions" ON public.bank_transactions FOR ALL USING (auth.uid()::text = user_id);

CREATE INDEX IF NOT EXISTS idx_bank_connections_user ON public.bank_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_user ON public.bank_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_connection ON public.bank_accounts(connection_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_user ON public.bank_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_account ON public.bank_transactions(account_id);
