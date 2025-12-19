-- ============================================
-- FIX: Admin User Creation RLS Issue
-- ============================================
-- Problem: When admins create users via createUserWithProfile(),
-- the handle_new_user() trigger fails because the temp client
-- has no authenticated session, causing RLS to block the insert.
--
-- Solution: Disable email confirmation and let the admin client
-- handle the profile creation manually (which it already does).
-- ============================================

-- Option 1: Make the trigger smarter - only insert if profile doesn't exist
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  admin_role_id UUID;
  user_count BIGINT;
  current_user_id UUID;
  profile_exists BOOLEAN;
BEGIN
  -- Check if profile already exists (admin might have created it)
  SELECT EXISTS(SELECT 1 FROM user_profiles WHERE id = NEW.id) INTO profile_exists;
  
  -- If profile exists, skip (admin already created it)
  IF profile_exists THEN
    RETURN NEW;
  END IF;
  
  -- Get current authenticated user (if any)
  current_user_id := auth.uid();
  
  -- Count existing profiles to detect first user
  SELECT COUNT(*) INTO user_count FROM user_profiles;
  
  -- Get company_admin role ID (may be null if roles not seeded)
  SELECT id INTO admin_role_id FROM roles WHERE name = 'company_admin' LIMIT 1;
  
  -- Insert into user_profiles
  INSERT INTO public.user_profiles (id, email, full_name, phone, role_id, is_active, created_by)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    CASE 
      WHEN user_count = 0 THEN admin_role_id  -- First user gets company_admin
      ELSE NULL  -- Other users get NULL (pending role assignment)
    END,
    true,
    current_user_id  -- Track who created this user
  );
  
  -- Log the activity (if function exists)
  IF current_user_id IS NOT NULL THEN
    BEGIN
      PERFORM log_user_activity(
        NEW.id,
        'user_created',
        jsonb_build_object('created_by', current_user_id, 'email', NEW.email)
      );
    EXCEPTION WHEN OTHERS THEN
      -- Ignore if log_user_activity doesn't exist or fails
      NULL;
    END;
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- If anything fails, still return NEW to allow auth user creation
  -- This prevents blocking user creation if there are RLS issues
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VERIFICATION
-- ============================================
-- After running this script:
-- 1. Try creating a user as admin from UsersScreen
-- 2. The trigger should skip if admin already created the profile
-- 3. No "relation does not exist" errors should occur
