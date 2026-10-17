-- Migration: 00003_user_auth_profile_sync.sql
-- Description: Conflict-safe, concurrency-hardened profile synchronization for verified student emails.
-- Strict Scope: Normal students only. Excludes admin_users. Requires confirmed email.

BEGIN;

-- 1. DEFENSIVE PRE-MIGRATION COLLISION CHECKS
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'handle_auth_user_sync'
  ) THEN
    RAISE EXCEPTION 'MIGRATION ABORTED: Object public.handle_auth_user_sync() already exists.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'ensure_user_profile'
  ) THEN
    RAISE EXCEPTION 'MIGRATION ABORTED: Object public.ensure_user_profile() already exists.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'check_admin_promotion_exclusivity'
  ) THEN
    RAISE EXCEPTION 'MIGRATION ABORTED: Object public.check_admin_promotion_exclusivity() already exists.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_trigger t
    JOIN pg_catalog.pg_class c ON t.tgrelid = c.oid
    JOIN pg_catalog.pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'auth' AND c.relname = 'users' AND t.tgname = 'on_auth_user_sync'
  ) THEN
    RAISE EXCEPTION 'MIGRATION ABORTED: Trigger on_auth_user_sync already exists on auth.users.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_trigger t
    JOIN pg_catalog.pg_class c ON t.tgrelid = c.oid
    JOIN pg_catalog.pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' AND c.relname = 'admin_users' AND t.tgname = 'trg_admin_promotion_exclusivity'
  ) THEN
    RAISE EXCEPTION 'MIGRATION ABORTED: Trigger trg_admin_promotion_exclusivity already exists on public.admin_users.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' AND c.relname = 'users_email_lower_uidx'
  ) THEN
    RAISE EXCEPTION 'MIGRATION ABORTED: Index users_email_lower_uidx already exists on public.users.';
  END IF;
END $$;

-- 2. CREATE ROLE EXCLUSIVITY TRIGGER ON public.admin_users
-- Prevents a user who already has a student profile from being concurrently promoted to admin without archiving/removing student row.
-- Handles both INSERT and UPDATE (OF id).
CREATE FUNCTION public.check_admin_promotion_exclusivity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Strict row-level lock on the shared canonical parent row in auth.users
  PERFORM 1 FROM auth.users WHERE id = NEW.id FOR NO KEY UPDATE;

  -- Verify no student profile exists for this ID
  IF EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
    RAISE EXCEPTION 'Admin promotion blocked: User ID % already exists in public.users. Archive or remove student profile before granting administrator privileges.', NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

ALTER FUNCTION public.check_admin_promotion_exclusivity() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.check_admin_promotion_exclusivity() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_admin_promotion_exclusivity() TO postgres, service_role;

CREATE TRIGGER trg_admin_promotion_exclusivity
  BEFORE INSERT OR UPDATE OF id ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.check_admin_promotion_exclusivity();

-- 3. ENSURE CASE-INSENSITIVE UNIQUE INDEX ON public.users(email)
-- Protects against concurrent mixed-case email insertion collisions
CREATE UNIQUE INDEX users_email_lower_uidx 
ON public.users (lower(trim(both from email)));

-- 4. CREATE SECURITY DEFINER TRIGGER FUNCTION ON auth.users
CREATE FUNCTION public.handle_auth_user_sync()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_name pg_catalog.text;
  v_clean_email pg_catalog.text;
  v_raw_meta pg_catalog.text;
BEGIN
  -- Strict row-level lock on the shared canonical parent row in auth.users
  PERFORM 1 FROM auth.users WHERE id = NEW.id FOR NO KEY UPDATE;

  -- Guard 1: Exclude admin users immediately
  IF EXISTS (SELECT 1 FROM public.admin_users WHERE id = NEW.id) THEN
    RETURN NEW;
  END IF;

  -- Guard 2: Defer profile creation until email confirmation is stamped
  IF NEW.email_confirmed_at IS NULL THEN
    RETURN NEW;
  END IF;

  -- Guard 3: Require valid non-empty email
  IF NEW.email IS NULL OR trim(both from NEW.email) = '' THEN
    RAISE EXCEPTION 'Cannot synchronize student profile: auth.users.email is missing or empty.';
  END IF;

  v_clean_email := lower(trim(both from NEW.email));

  -- Guard 4: Protect against cross-account email collisions without rolling back auth confirmation
  -- If email is already held by a different student, skip insert so auth confirmation succeeds.
  IF EXISTS (
    SELECT 1 FROM public.users 
    WHERE lower(trim(both from email)) = v_clean_email AND id <> NEW.id
  ) THEN
    -- Application will detect missing profile and surface collision via ensure_user_profile()
    RETURN NEW;
  END IF;

  -- Extract name safely, fallback to 'Student'
  v_raw_meta := trim(both from coalesce(NEW.raw_user_meta_data->>'name', ''));
  IF v_raw_meta = '' THEN
    v_name := 'Student';
  ELSE
    v_name := v_raw_meta;
  END IF;

  -- Insert profile; on conflict on id, strictly preserve student-edited name
  BEGIN
    INSERT INTO public.users (id, name, email, phone, created_at)
    VALUES (
      NEW.id,
      v_name,
      v_clean_email,
      NULL,
      coalesce(NEW.created_at, pg_catalog.now())
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = public.users.name;
  EXCEPTION
    WHEN unique_violation THEN
      -- Catches any concurrent race condition on email uniqueness
      RETURN NEW;
  END;

  RETURN NEW;
END;
$$;

ALTER FUNCTION public.handle_auth_user_sync() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.handle_auth_user_sync() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_auth_user_sync() TO postgres, service_role;

-- 5. ATTACH TRIGGER TO auth.users
CREATE TRIGGER on_auth_user_sync
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_user_sync();

-- 6. CREATE SERVER-SIDE SECURE RECOVERY RPC
CREATE FUNCTION public.ensure_user_profile()
RETURNS pg_catalog.jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_uid pg_catalog.uuid;
  v_auth_record RECORD;
  v_name pg_catalog.text;
  v_clean_email pg_catalog.text;
  v_raw_meta pg_catalog.text;
  v_profile RECORD;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RETURN pg_catalog.jsonb_build_object(
      'success', false,
      'error', 'UNAUTHENTICATED',
      'message', 'Not authenticated.'
    );
  END IF;

  -- Strict row-level lock on the shared canonical parent row in auth.users
  PERFORM 1 FROM auth.users WHERE id = v_uid FOR NO KEY UPDATE;

  -- Guard 1: Exclude admin users
  IF EXISTS (SELECT 1 FROM public.admin_users WHERE id = v_uid) THEN
    RETURN pg_catalog.jsonb_build_object(
      'success', false,
      'error', 'ADMIN_ACCOUNT',
      'message', 'Access denied: User is an administrator.'
    );
  END IF;

  SELECT id, email, email_confirmed_at, raw_user_meta_data, created_at
  INTO v_auth_record
  FROM auth.users
  WHERE id = v_uid;

  IF NOT FOUND THEN
    RETURN pg_catalog.jsonb_build_object(
      'success', false,
      'error', 'AUTH_RECORD_NOT_FOUND',
      'message', 'Authentication record could not be found.'
    );
  END IF;

  -- Guard 2: Require confirmed email
  IF v_auth_record.email_confirmed_at IS NULL THEN
    RETURN pg_catalog.jsonb_build_object(
      'success', false,
      'error', 'EMAIL_UNCONFIRMED',
      'message', 'Cannot initialize profile: Email address has not been confirmed.'
    );
  END IF;

  -- Guard 3: Require valid non-empty email
  IF v_auth_record.email IS NULL OR trim(both from v_auth_record.email) = '' THEN
    RETURN pg_catalog.jsonb_build_object(
      'success', false,
      'error', 'EMAIL_MISSING',
      'message', 'User authentication record is missing an email address.'
    );
  END IF;

  v_clean_email := lower(trim(both from v_auth_record.email));

  -- Guard 4: Protect against email collisions
  IF EXISTS (
    SELECT 1 FROM public.users 
    WHERE lower(trim(both from email)) = v_clean_email AND id <> v_uid
  ) THEN
    RETURN pg_catalog.jsonb_build_object(
      'success', false,
      'error', 'EMAIL_CONFLICT',
      'message', 'A student profile with this email address already belongs to another account.'
    );
  END IF;

  v_raw_meta := trim(both from coalesce(v_auth_record.raw_user_meta_data->>'name', ''));
  IF v_raw_meta = '' THEN
    v_name := 'Student';
  ELSE
    v_name := v_raw_meta;
  END IF;

  BEGIN
    INSERT INTO public.users (id, name, email, phone, created_at)
    VALUES (
      v_uid,
      v_name,
      v_clean_email,
      NULL,
      coalesce(v_auth_record.created_at, pg_catalog.now())
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      name = public.users.name
    RETURNING id, name, email, phone, college, avatar_url INTO v_profile;
  EXCEPTION
    WHEN unique_violation THEN
      RETURN pg_catalog.jsonb_build_object(
        'success', false,
        'error', 'EMAIL_CONFLICT',
        'message', 'A student profile with this email address already belongs to another account.'
      );
  END;

  RETURN pg_catalog.jsonb_build_object(
    'success', true,
    'profile', pg_catalog.jsonb_build_object(
      'id', v_profile.id,
      'name', v_profile.name,
      'email', v_profile.email,
      'phone', v_profile.phone,
      'college', v_profile.college,
      'avatar_url', v_profile.avatar_url
    )
  );
END;
$$;

ALTER FUNCTION public.ensure_user_profile() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.ensure_user_profile() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_user_profile() TO authenticated, service_role;

COMMIT;
