-- Quote requests: a patient asks for a (demo) quote from a listed hospital.
-- INSERT is open to anon + authenticated with basic validation; SELECT only own rows.
-- In this demo nothing is forwarded to any hospital.

CREATE TABLE IF NOT EXISTS public.quote_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email TEXT NOT NULL CHECK (char_length(email) BETWEEN 5 AND 254 AND email LIKE '%_@_%._%'),
    hospital_id TEXT NOT NULL CHECK (char_length(hospital_id) BETWEEN 1 AND 64),
    procedure TEXT NOT NULL CHECK (char_length(procedure) BETWEEN 1 AND 64),
    preferred_month TEXT CHECK (preferred_month IS NULL OR char_length(preferred_month) <= 32),
    message TEXT CHECK (message IS NULL OR char_length(message) <= 2000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS quote_requests_user_idx ON public.quote_requests (user_id, created_at DESC);

ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit a quote request" ON public.quote_requests;
CREATE POLICY "Anyone can submit a quote request" ON public.quote_requests
    FOR INSERT TO anon, authenticated
    WITH CHECK (user_id IS NULL OR user_id = auth.uid());

DROP POLICY IF EXISTS "Users can read their own quote requests" ON public.quote_requests;
CREATE POLICY "Users can read their own quote requests" ON public.quote_requests
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());
