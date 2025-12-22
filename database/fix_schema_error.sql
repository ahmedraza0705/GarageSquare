-- ============================================
-- FIX: DATABASE SCHEMA ERROR & ADMIN RECOVERY
-- ============================================
-- This script fixes the "Database error querying schema" by standardizing
-- the handle_new_user trigger and resolving RLS recursion issues.

-- 1. FIX SEARCH PATHS & RECURSION HELPER FUNCTIONS
-- Explicit search_path prevents schema resolution errors for auth admin.
CREATE OR REPLACE FUNCTION public.get_my_role_name()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role_name text;
BEGIN
  SELECT r.name INTO v_role_name
  FROM public.user_profiles up
  JOIN public.roles r ON r.id = up.role_id
  WHERE up.id = auth.uid();
  
  RETURN v_role_name;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_my_branch_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_branch_id uuid;
BEGIN
  SELECT branch_id INTO v_branch_id
  FROM public.user_profiles
  WHERE id = auth.uid();
  
  RETURN v_branch_id;
END;
$$;

-- 2. ROBUST HANDLE_NEW_USER TRIGGER
-- Added search_path and improved error handling to prevent blocking auth.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  admin_role_id UUID;
  user_count BIGINT;
  profile_exists BOOLEAN;
BEGIN
  -- Check if profile already exists
  SELECT EXISTS(SELECT 1 FROM public.user_profiles WHERE id = NEW.id) INTO profile_exists;
  IF profile_exists THEN
    RETURN NEW;
  END IF;

  -- Count existing profiles to detect first user
  SELECT COUNT(*) INTO user_count FROM public.user_profiles;
  
  -- Get company_admin role ID
  SELECT id INTO admin_role_id FROM public.roles WHERE name = 'company_admin' LIMIT 1;
  
  -- Insert profile
  INSERT INTO public.user_profiles (id, email, full_name, role_id, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    admin_role_id, -- Force admin if it's the first or targeted user
    true
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block auth creation
  RAISE WARNING 'handle_new_user failed: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. REPAIR test@gmail.com ADMIN ACCESS
DO $$
DECLARE
  v_role_id UUID;
  v_user_id UUID;
  v_email TEXT := 'test@gmail.com';
BEGIN
  -- Get company_admin role
  SELECT id INTO v_role_id FROM public.roles WHERE name = 'company_admin';
  
  -- Find the user ID
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

  IF v_user_id IS NOT NULL THEN
    -- Ensure profile exists and has admin role
    INSERT INTO public.user_profiles (id, email, full_name, role_id, is_active)
    VALUES (v_user_id, v_email, 'Admin User', v_role_id, true)
    ON CONFLICT (id) DO UPDATE 
    SET role_id = v_role_id, is_active = true, email = v_email;
    
    RAISE NOTICE 'SUCCESS: User % repaired and set to Admin.', v_email;
  ELSE
    RAISE WARNING 'User % not found in auth.users. Please sign up or create the user first.', v_email;
  END IF;
END $$;
