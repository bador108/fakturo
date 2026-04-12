-- Bank connections table
CREATE TABLE IF NOT EXISTS public.bank_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  institution_id TEXT NOT NULL,
  institution_name TEXT NOT NULL,
  institution_logo TEXT,
  requisition_id TEXT NOT NULL UNIQUE,
  account_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'error')),
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bank_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own bank connections" ON public.bank_connections FOR ALL USING (auth.uid()::text = user_id);
