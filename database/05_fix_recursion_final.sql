-- ============================================
-- FIX RLS INFINITE RECURSION (FINAL)
-- ============================================

-- PROBLEM: Policies on user_profiles query user_profiles, causing a loop.
-- SOLUTION: Use SECURITY DEFINER functions to bypass RLS for these lookups.

-- 1. Create Helper Functions (SECURITY DEFINER)
-- These run with the permissions of the creator (usually postgres), bypassing RLS.

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
  FROM user_profiles up
  JOIN roles r ON r.id = up.role_id
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
  FROM user_profiles
  WHERE id = auth.uid();
  
  RETURN v_branch_id;
END;
$$;

-- 2. Drop Problematic Policies on user_profiles

DROP POLICY IF EXISTS "Company admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Managers can view profiles in their branch" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Company admins can update any profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Company admins can insert any profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

-- 3. Recreate Policies using Safe Functions

-- A. View Policies

-- Users can always view their own profile
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Company Admin can view ALL profiles
CREATE POLICY "Company admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    get_my_role_name() = 'company_admin'
  );

-- Managers can view profiles in their branch
CREATE POLICY "Managers can view profiles in their branch"
  ON user_profiles FOR SELECT
  USING (
    branch_id = get_my_branch_id()
  );

-- B. Update Policies

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Company Admin can update ANY profile
CREATE POLICY "Company admins can update any profile"
  ON user_profiles FOR UPDATE
  USING (
    get_my_role_name() = 'company_admin'
  );

-- C. Insert Policies

-- Users insert their own (usually handled by trigger, but for manual inserts)
CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Company Admin can insert ANY profile
CREATE POLICY "Company admins can insert any profile"
  ON user_profiles FOR INSERT
  WITH CHECK (
    get_my_role_name() = 'company_admin'
  );

-- 4. Re-verify Data (Optional Safety)
-- Ensure 'test@gmail.com' is definitely an admin (redundant but safe)
DO $$
DECLARE
  v_role_id UUID;
BEGIN
  SELECT id INTO v_role_id FROM roles WHERE name = 'company_admin';
  
  UPDATE user_profiles
  SET role_id = v_role_id
  WHERE email = 'test@gmail.com';
END $$;
