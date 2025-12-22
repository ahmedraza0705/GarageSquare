-- ============================================
-- ULTIMATE AUTH & SCHEMA REPAIR SCRIPT
-- ============================================
-- Consolidates all critical fixes for Supabase Auth issues.
-- Safe to run multiple times.

-- 1. CLEANUP: Drop all existing potentially conflicting triggers & functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_last_login_trigger ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.get_my_role_name() CASCADE;
DROP FUNCTION IF EXISTS public.get_my_branch_id() CASCADE;
DROP FUNCTION IF EXISTS public.log_user_activity(uuid, varchar, jsonb) CASCADE;

-- 2. CORE HELPER FUNCTIONS (SECURITY DEFINER + SAFE SEARCH PATH)
-- Explicit search_path prevents schema resolution errors.

CREATE OR REPLACE FUNCTION public.get_my_role_name()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER 
SET search_path = public, auth 
AS $$
BEGIN
  RETURN (
    SELECT r.name 
    FROM public.user_profiles up 
    JOIN public.roles r ON r.id = up.role_id 
    WHERE up.id = auth.uid()
  );
END; $$;

CREATE OR REPLACE FUNCTION public.get_my_branch_id()
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER 
SET search_path = public, auth 
AS $$
BEGIN
  RETURN (
    SELECT branch_id 
    FROM public.user_profiles 
    WHERE id = auth.uid()
  );
END; $$;

CREATE OR REPLACE FUNCTION public.log_user_activity(
  p_user_id UUID,
  p_action VARCHAR(100),
  p_details JSONB DEFAULT NULL
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER 
SET search_path = public, auth 
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.user_activity_log (user_id, action, performed_by, details)
  VALUES (p_user_id, p_action, auth.uid(), p_details)
  RETURNING id INTO v_log_id;
  RETURN v_log_id;
END; $$;

-- 3. THE HANDLER: NEW USER TRIGGER
-- Highly resilient, will not block Auth if profile creation fails.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER 
SET search_path = public, auth 
AS $$
DECLARE
  v_admin_role_id UUID;
  v_user_count BIGINT;
  v_profile_exists BOOLEAN;
BEGIN
  -- A. Check if user profile already exists (avoid duplicates)
  SELECT EXISTS(SELECT 1 FROM public.user_profiles WHERE id = NEW.id) INTO v_profile_exists;
  IF v_profile_exists THEN
    RETURN NEW;
  END IF;

  -- B. Get initial role logic
  SELECT COUNT(*) INTO v_user_count FROM public.user_profiles;
  SELECT id INTO v_admin_role_id FROM public.roles WHERE name = 'company_admin' LIMIT 1;
  
  -- C. Insert the profile
  INSERT INTO public.user_profiles (id, email, full_name, role_id, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    CASE WHEN v_user_count = 0 THEN v_admin_role_id ELSE NULL END, -- First user is admin
    true
  );
  
  -- D. Optional activity logging
  BEGIN
    PERFORM public.log_user_activity(NEW.id, 'user_onboarded', jsonb_build_object('email', NEW.email));
  EXCEPTION WHEN OTHERS THEN NULL; -- Ignore log failure
  END;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- CRITICAL: Never block auth.users insertion
  RAISE WARNING 'handle_new_user CRITICAL FAILURE for %: %', NEW.email, SQLERRM;
  RETURN NEW;
END; $$;

-- 4. RE-ATTACH TRIGGER
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. RESOLVE RLS RECURSION
-- Use our safe helpers instead of direct table lookups.
DROP POLICY IF EXISTS "Company admins can view all profiles" ON user_profiles;
CREATE POLICY "Company admins can view all profiles"
  ON user_profiles FOR SELECT
  USING ( public.get_my_role_name() = 'company_admin' );

DROP POLICY IF EXISTS "Company admins can update all profiles" ON user_profiles;
CREATE POLICY "Company admins can update all profiles"
  ON user_profiles FOR UPDATE
  USING ( public.get_my_role_name() = 'company_admin' );

-- 6. FINAL ADMIN RECOVERY: test@gmail.com
DO $$
DECLARE
  v_role_id UUID;
  v_user_id UUID;
  v_email TEXT := 'test@gmail.com';
BEGIN
  SELECT id INTO v_role_id FROM public.roles WHERE name = 'company_admin';
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

  IF v_user_id IS NOT NULL THEN
    -- Force link and role
    INSERT INTO public.user_profiles (id, email, full_name, role_id, is_active)
    VALUES (v_user_id, v_email, 'Admin User', v_role_id, true)
    ON CONFLICT (id) DO UPDATE 
    SET role_id = v_role_id, is_active = true, email = v_email;
    
    RAISE NOTICE 'SUCCESS: User % is linked to Admin role.', v_email;
  ELSE
    RAISE NOTICE 'INFO: User % not found in Auth. Run login first to initiate creation or sign up manually.', v_email;
  END IF;
END $$;
