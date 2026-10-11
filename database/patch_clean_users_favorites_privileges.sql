-- ============================================================================
-- Patch: Strip inherited TRUNCATE/TRIGGER/REFERENCES from users & favorites
-- Safe for live database; leaves all student profile & favorites grants intact
-- ============================================================================

-- 1. Strip inherited TRUNCATE, TRIGGER, REFERENCES from PUBLIC
REVOKE TRUNCATE, TRIGGER, REFERENCES ON public.users, public.favorites FROM PUBLIC;

-- 2. Strip explicit TRUNCATE, TRIGGER, REFERENCES from API roles
REVOKE TRUNCATE, TRIGGER, REFERENCES ON public.users, public.favorites FROM anon, authenticated;

-- 3. Confirm expected student grants remain explicitly intact
GRANT SELECT ON public.users TO authenticated;
GRANT UPDATE (name, phone, college, avatar_url) ON public.users TO authenticated;

GRANT SELECT, INSERT, DELETE ON public.favorites TO authenticated;
