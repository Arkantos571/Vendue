-- Vendue MVP schema v1.1.2 — venue setup RLS / grants fix
-- Run in Supabase SQL Editor if venue setup returns error 42501.
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE where possible.

-- ---------------------------------------------------------------------------
-- Table privileges (required for authenticated API access)
-- ---------------------------------------------------------------------------

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT ON TABLES TO anon;

-- ---------------------------------------------------------------------------
-- venue_members: allow users to read their own membership rows directly
-- (avoids edge cases loading the first venue before nested checks)
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'venue_members'
      AND policyname = 'venue_members_select_own'
  ) THEN
    CREATE POLICY "venue_members_select_own" ON public.venue_members
      FOR SELECT TO authenticated
      USING (profile_id = auth.uid());
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- venue_members: allow first owner row when creating a new venue
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'venue_members'
      AND policyname = 'venue_members_insert_own_owner'
  ) THEN
    CREATE POLICY "venue_members_insert_own_owner" ON public.venue_members
      FOR INSERT TO authenticated
      WITH CHECK (
        profile_id = auth.uid() AND role = 'owner'
      );
  END IF;
END $$;
