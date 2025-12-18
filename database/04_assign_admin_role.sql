-- ============================================
-- ASSIGN COMPANY ADMIN ROLE
-- ============================================

-- This script forces the user 'test@gmail.com' to have the 'company_admin' role.
-- Run this in your Supabase SQL Editor.

DO $$
DECLARE
  v_user_email TEXT := 'test@gmail.com';
  v_role_name TEXT := 'company_admin';
  v_role_id UUID;
  v_user_id UUID;
BEGIN
  -- 1. Get the Role ID for 'company_admin'
  SELECT id INTO v_role_id FROM public.roles WHERE name = v_role_name;
  
  IF v_role_id IS NULL THEN
    RAISE EXCEPTION 'Role % not found', v_role_name;
  END IF;

  -- 2. Get the User ID from user_profiles (or auth.users if needed, but profiles should exist)
  SELECT id INTO v_user_id FROM public.user_profiles WHERE email = v_user_email;

  IF v_user_id IS NULL THEN
    -- Try to find in auth.users just in case profile is missing (should be handled by trigger, but safe to check)
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_user_email;
    
    IF v_user_id IS NULL THEN
      RAISE EXCEPTION 'User % not found', v_user_email;
    END IF;
    
    -- If profile missing, let's insert it
    INSERT INTO public.user_profiles (id, email, role_id, is_active)
    VALUES (v_user_id, v_user_email, v_role_id, true)
    ON CONFLICT (id) DO UPDATE
    SET role_id = v_role_id;
    
  ELSE
    -- 3. Update the existing profile
    UPDATE public.user_profiles
    SET role_id = v_role_id,
        is_active = true
    WHERE id = v_user_id;
  END IF;

  RAISE NOTICE 'Successfully assigned role % to user %', v_role_name, v_user_email;
END $$;
