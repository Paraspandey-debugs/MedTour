-- =========================================================================
-- Migration: Fix RLS Write Policies on Provider Directory & Clinical Knowledge
-- Removes insecure write policies granting standard authenticated users write access.
-- Writes are strictly restricted to the Supabase service role (scripts & migrations).
-- =========================================================================

-- Drop unsafe write policies
DROP POLICY IF EXISTS "Allow authenticated insert/update to hospitals" ON public.hospitals;
DROP POLICY IF EXISTS "Allow authenticated insert/update to doctors" ON public.doctors;
DROP POLICY IF EXISTS "Allow authenticated insert clinical knowledge" ON public.clinical_knowledge;
DROP POLICY IF EXISTS "Allow authenticated insert/update to treatments" ON public.treatments;

-- Ensure RLS is enabled
ALTER TABLE IF EXISTS public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.clinical_knowledge ENABLE ROW LEVEL SECURITY;

-- Ensure read-only public access policies exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'hospitals' AND policyname = 'Allow public read access to hospitals'
    ) THEN
        CREATE POLICY "Allow public read access to hospitals" ON public.hospitals FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'doctors' AND policyname = 'Allow public read access to doctors'
    ) THEN
        CREATE POLICY "Allow public read access to doctors" ON public.doctors FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'treatments' AND policyname = 'Allow public read access to treatments'
    ) THEN
        CREATE POLICY "Allow public read access to treatments" ON public.treatments FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'clinical_knowledge' AND policyname = 'Allow public read clinical knowledge'
    ) THEN
        CREATE POLICY "Allow public read clinical knowledge" ON public.clinical_knowledge FOR SELECT USING (true);
    END IF;
END $$;
