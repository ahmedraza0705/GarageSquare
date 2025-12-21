-- ============================================
-- FIX USER_PROFILES RLS FOR USER MANAGEMENT
-- ============================================
-- This fixes the issue where users can't see the user list in User Management

-- The problem: RLS policies on user_profiles are too restrictive
-- Company admins need to be able to read ALL user profiles to manage them

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Company admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Company admins can update any profile" ON user_profiles;
DROP POLICY IF EXISTS "Company admins can insert any profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Create security definer function if it doesn't exist
CREATE OR REPLACE FUNCTION public.is_company_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = user_id
    AND role_id = (SELECT id FROM roles WHERE name = 'company_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.is_company_admin(UUID) TO authenticated;

-- NEW POLICIES: Allow company admins to manage all profiles

-- 1. SELECT: Company admins can view all profiles, users can view their own
CREATE POLICY "user_profiles_select_policy"
  ON user_profiles FOR SELECT
  USING (
    -- Company admins can see all profiles
    public.is_company_admin(auth.uid())
    OR
    -- Users can see their own profile
    id = auth.uid()
  );

-- 2. INSERT: Only company admins can create new profiles
CREATE POLICY "user_profiles_insert_policy"
  ON user_profiles FOR INSERT
  WITH CHECK (public.is_company_admin(auth.uid()));

-- 3. UPDATE: Company admins can update any profile, users can update their own
CREATE POLICY "user_profiles_update_policy"
  ON user_profiles FOR UPDATE
  USING (
    public.is_company_admin(auth.uid())
    OR
    id = auth.uid()
  );

-- 4. DELETE: Only company admins can delete profiles
CREATE POLICY "user_profiles_delete_policy"
  ON user_profiles FOR DELETE
  USING (public.is_company_admin(auth.uid()));

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Test if you can see user profiles
-- SELECT * FROM user_profiles;

-- Check if security definer function works
-- SELECT public.is_company_admin(auth.uid());
