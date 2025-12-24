-- ============================================
-- FIX USER CREATION RLS POLICIES
-- ============================================
-- This script fixes RLS policies that are blocking user creation

-- STEP 1: Check current RLS policies on user_profiles
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- STEP 2: Disable RLS temporarily to test (CAUTION: Only for testing!)
-- Uncomment to test if RLS is the issue
/*
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
*/

-- STEP 3: Fix the INSERT policy to allow the trigger to work
-- The trigger uses SECURITY DEFINER so it should bypass RLS,
-- but we need to ensure the policy allows inserts

DROP POLICY IF EXISTS "Allow trigger to insert profiles" ON user_profiles;
CREATE POLICY "Allow trigger to insert profiles" 
  ON user_profiles 
  FOR INSERT 
  WITH CHECK (true);

-- STEP 4: Ensure authenticated users can insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- STEP 5: Allow company admins to insert any profile
DROP POLICY IF EXISTS "Company admins can insert profiles" ON user_profiles;
CREATE POLICY "Company admins can insert profiles"
  ON user_profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role_id = (SELECT id FROM roles WHERE name = 'company_admin')
    )
  );

-- STEP 6: Verify the policies
SELECT 
    policyname,
    cmd,
    with_check
FROM pg_policies
WHERE tablename = 'user_profiles'
  AND cmd = 'INSERT'
ORDER BY policyname;

-- STEP 7: Test user creation
-- Try creating a test user in Supabase dashboard
-- Auth > Users > Invite User
-- Email: testuser@example.com
-- Then check if the profile was created:
SELECT id, email, full_name, role_id FROM user_profiles WHERE email = 'testuser@example.com';
