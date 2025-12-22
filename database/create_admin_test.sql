-- ============================================
-- MANUALLY CREATE OR UPGRADE ADMIN USER
-- ============================================
-- Run this in the Supabase SQL Editor to link test@gmail.com with admin role.

DO $$
DECLARE
  v_role_id UUID;
  v_user_id UUID;
  v_email TEXT := 'test@gmail.com';
  v_password TEXT := '123456';
BEGIN
  -- 1. Get company_admin role ID
  SELECT id INTO v_role_id FROM public.roles WHERE name = 'company_admin';
  
  IF v_role_id IS NULL THEN
    RAISE EXCEPTION 'Role company_admin not found. Please run the schema.sql first.';
  END IF;

  -- 2. Check if user already exists in auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

  IF v_user_id IS NOT NULL THEN
    RAISE NOTICE 'User % already exists in auth.users (ID: %). Updating profile to Admin...', v_email, v_user_id;
    
    -- Ensure profile exists and has admin role
    INSERT INTO public.user_profiles (id, email, full_name, role_id, is_active)
    VALUES (v_user_id, v_email, 'Admin User', v_role_id, true)
    ON CONFLICT (id) DO UPDATE 
    SET role_id = v_role_id, is_active = true;
    
    RAISE NOTICE 'SUCCESS: User % is now a Company Admin.', v_email;
  ELSE
    RAISE NOTICE 'User % not found. Creating new auth user...', v_email;
    
    v_user_id := gen_random_uuid();

    -- Create user in auth.users
    -- Password hashed using crypt(password, gen_salt('bf'))
    INSERT INTO auth.users (
      id, instance_id, role, aud, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, recovery_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated', v_email,
      extensions.crypt(v_password, extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      json_build_object('full_name', 'Admin User'),
      now(), now(), '', ''
    );

    -- Manual creation of profile (in case trigger falls through)
    INSERT INTO public.user_profiles (id, email, full_name, role_id, is_active)
    VALUES (v_user_id, v_email, 'Admin User', v_role_id, true)
    ON CONFLICT (id) DO UPDATE 
    SET role_id = v_role_id, is_active = true;

    RAISE NOTICE 'SUCCESS: Admin user created: % / %', v_email, v_password;
  END IF;
END $$;
