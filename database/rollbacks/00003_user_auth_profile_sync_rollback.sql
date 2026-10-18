-- Rollback Script: 00003_user_auth_profile_sync_rollback.sql
-- Purpose: Removes the exact triggers, functions, and index created by Migration 00003.

BEGIN;

-- 1. Safely drop trigger on auth.users ONLY if it points to public.handle_auth_user_sync
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM pg_catalog.pg_trigger t
    JOIN pg_catalog.pg_class c ON t.tgrelid = c.oid
    JOIN pg_catalog.pg_namespace n ON c.relnamespace = n.oid
    JOIN pg_catalog.pg_proc p ON t.tgfoid = p.oid
    JOIN pg_catalog.pg_namespace pn ON p.pronamespace = pn.oid
    WHERE n.nspname = 'auth' 
      AND c.relname = 'users' 
      AND t.tgname = 'on_auth_user_sync'
      AND pn.nspname = 'public'
      AND p.proname = 'handle_auth_user_sync'
  ) THEN
    DROP TRIGGER on_auth_user_sync ON auth.users;
  END IF;
END $$;

-- 2. Safely drop trigger on public.admin_users ONLY if it points to public.check_admin_promotion_exclusivity
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM pg_catalog.pg_trigger t
    JOIN pg_catalog.pg_class c ON t.tgrelid = c.oid
    JOIN pg_catalog.pg_namespace n ON c.relnamespace = n.oid
    JOIN pg_catalog.pg_proc p ON t.tgfoid = p.oid
    JOIN pg_catalog.pg_namespace pn ON p.pronamespace = pn.oid
    WHERE n.nspname = 'public' 
      AND c.relname = 'admin_users' 
      AND t.tgname = 'trg_admin_promotion_exclusivity'
      AND pn.nspname = 'public'
      AND p.proname = 'check_admin_promotion_exclusivity'
  ) THEN
    DROP TRIGGER trg_admin_promotion_exclusivity ON public.admin_users;
  END IF;
END $$;

-- 3. Safely drop unique index on lower email ONLY if it exists in public schema
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' 
      AND c.relname = 'users_email_lower_uidx'
      AND c.relkind = 'i'
  ) THEN
    DROP INDEX public.users_email_lower_uidx;
  END IF;
END $$;

-- 4. Safely revoke and drop check_admin_promotion_exclusivity() using RESTRICT
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
      AND p.proname = 'check_admin_promotion_exclusivity' 
      AND p.pronargs = 0
  ) THEN
    REVOKE EXECUTE ON FUNCTION public.check_admin_promotion_exclusivity() FROM postgres, service_role;
    REVOKE ALL ON FUNCTION public.check_admin_promotion_exclusivity() FROM PUBLIC;
    DROP FUNCTION public.check_admin_promotion_exclusivity() RESTRICT;
  END IF;
END $$;

-- 5. Safely revoke and drop handle_auth_user_sync() using RESTRICT
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
      AND p.proname = 'handle_auth_user_sync' 
      AND p.pronargs = 0
  ) THEN
    REVOKE EXECUTE ON FUNCTION public.handle_auth_user_sync() FROM postgres, service_role;
    REVOKE ALL ON FUNCTION public.handle_auth_user_sync() FROM PUBLIC;
    DROP FUNCTION public.handle_auth_user_sync() RESTRICT;
  END IF;
END $$;

-- 6. Safely revoke and drop ensure_user_profile() using RESTRICT
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
      AND p.proname = 'ensure_user_profile' 
      AND p.pronargs = 0
  ) THEN
    REVOKE EXECUTE ON FUNCTION public.ensure_user_profile() FROM authenticated, service_role;
    REVOKE ALL ON FUNCTION public.ensure_user_profile() FROM PUBLIC;
    DROP FUNCTION public.ensure_user_profile() RESTRICT;
  END IF;
END $$;

COMMIT;
