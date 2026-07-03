-- service_role should have full, implicit access to every table in the
-- public schema (this is the standard Supabase default and the entire
-- point of the service role key). Discovered via E2E test failure:
-- "permission denied for table enquiries" when querying as service_role.
-- Re-assert the grants explicitly, and set default privileges so future
-- tables inherit them automatically without needing a follow-up migration.

GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;
