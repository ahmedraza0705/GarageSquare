-- ============================================
-- DIRECT TEST - Run this to test if database works
-- ============================================

-- Test 1: Can we insert into user_profiles directly?
-- First, let's see what we have:
SELECT 'Auth Users Count:' as info, COUNT(*)::text as value FROM auth.users
UNION ALL
SELECT 'User Profiles Count:', COUNT(*)::text FROM user_profiles
UNION ALL
SELECT 'Roles Count:', COUNT(*)::text FROM roles;

-- Test 2: Check if user_profiles table structure is correct
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Test 3: Try to manually create a test user profile
-- Get the first auth user ID
DO $$
DECLARE
  test_user_id UUID;
  test_role_id UUID;
BEGIN
  -- Get first user from auth.users
  SELECT id INTO test_user_id FROM auth.users LIMIT 1;
  
  -- Get company_admin role
  SELECT id INTO test_role_id FROM roles WHERE name = 'company_admin' LIMIT 1;
  
  -- Try to insert/update profile
  INSERT INTO user_profiles (id, email, full_name, role_id, is_active)
  VALUES (
    test_user_id,
    'test@example.com',
    'Test User',
    test_role_id,
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = 'Test User Updated',
    role_id = test_role_id;
    
  RAISE NOTICE 'Success! Profile created/updated for user: %', test_user_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error: % %', SQLERRM, SQLSTATE;
END $$;

-- Test 4: Verify the insert worked
SELECT id, email, full_name, role_id, is_active 
FROM user_profiles 
ORDER BY created_at DESC 
LIMIT 5;
