-- ============================================
-- CREATE ADMIN USER
-- ============================================
-- Run this AFTER auth_tables.sql to create your first admin user

DO $$
DECLARE
  v_role_id UUID;
  v_user_id UUID;
BEGIN
  -- Get company_admin role
  SELECT id INTO v_role_id FROM roles WHERE name = 'company_admin';

  -- Check if user already exists in auth.users
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'test@gmail.com') THEN
    RAISE NOTICE 'User already exists in auth.users!';

    -- Check if profile exists, if not, update the existing user
    IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE email = 'test@gmail.com') THEN
      -- Update the existing profile to set role
      UPDATE user_profiles
      SET role_id = v_role_id, full_name = 'System Admin', is_active = true
      WHERE email = 'test@gmail.com';
      RAISE NOTICE 'Updated existing profile with admin role';
    ELSE
      RAISE NOTICE 'Profile already exists with admin role';
    END IF;
    RETURN;
  END IF;

  -- Create user in auth.users (this will trigger profile creation)
  v_user_id := gen_random_uuid();

  INSERT INTO auth.users (
    id, instance_id, role, aud, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  ) VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'test@gmail.com',
    crypt('test123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    json_build_object('full_name', 'System Admin'),
    now(), now()
  );

  -- The trigger will automatically create the profile, so we don't need to insert manually
  -- Just wait a moment for the trigger to complete
  PERFORM pg_sleep(0.1);

  -- Update the profile with the correct role (trigger might not set role for first user properly)
  UPDATE user_profiles
  SET role_id = v_role_id, is_active = true
  WHERE id = v_user_id;

  RAISE NOTICE 'SUCCESS: Admin user created: test@gmail.com / test123';
END $$;
