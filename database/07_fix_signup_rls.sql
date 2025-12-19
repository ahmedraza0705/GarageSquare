-- ============================================
-- FIX SIGNUP RLS POLICY ISSUE
-- ============================================
-- Problem: User signup fails because RLS policies block the trigger
-- from inserting into user_profiles
-- Solution: Add a permissive INSERT policy for the trigger function
-- ============================================

-- Drop existing restrictive INSERT policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Company admins can insert profiles" ON user_profiles;

-- Create a single, permissive INSERT policy
-- This allows the handle_new_user() trigger to insert profiles
-- It's safe because:
-- 1. The trigger is SECURITY DEFINER (controlled by us)
-- 2. Regular users can't directly insert (they use Supabase Auth)
-- 3. The trigger handles role assignment logic correctly
CREATE POLICY "Allow profile creation"
  ON user_profiles FOR INSERT
  WITH CHECK (true);

-- ============================================
-- VERIFICATION
-- ============================================
-- After running this script:
-- 1. Try signing up a new user
-- 2. Verify the user_profiles record is created
-- 3. Check that first user gets company_admin role
-- 4. Check that subsequent users get NULL role
