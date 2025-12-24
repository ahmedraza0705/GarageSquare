-- ============================================
-- FIX INFINITE RECURSION IN RLS POLICIES
-- ============================================
-- This fixes the "infinite recursion detected in policy" error

-- ============================================
-- DROP ALL EXISTING POLICIES
-- ============================================
DROP POLICY IF EXISTS "Anyone can view roles" ON roles;
DROP POLICY IF EXISTS "Authenticated users can manage companies" ON companies;
DROP POLICY IF EXISTS "Authenticated users can manage branches" ON branches;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON user_profiles;

-- ============================================
-- CREATE NON-RECURSIVE POLICIES
-- ============================================

-- Roles: Anyone authenticated can view
CREATE POLICY "Anyone can view roles"
  ON roles FOR SELECT
  USING (auth.role() = 'authenticated');

-- Companies: Authenticated users can do everything (permissive for now)
CREATE POLICY "Authenticated users can manage companies"
  ON companies FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Branches: Authenticated users can do everything (permissive for now)
CREATE POLICY "Authenticated users can manage branches"
  ON branches FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- USER_PROFILES POLICIES (NO RECURSION)
-- ============================================

-- SELECT: Users can view their own profile OR any authenticated user can view all
CREATE POLICY "Users can view profiles"
  ON user_profiles FOR SELECT
  USING (
    auth.uid() = id 
    OR auth.role() = 'authenticated'
  );

-- INSERT: Users can insert their own profile OR any authenticated user can insert
CREATE POLICY "Users can insert profiles"
  ON user_profiles FOR INSERT
  WITH CHECK (
    auth.uid() = id 
    OR auth.role() = 'authenticated'
  );

-- UPDATE: Users can update their own profile OR any authenticated user can update
CREATE POLICY "Users can update profiles"
  ON user_profiles FOR UPDATE
  USING (
    auth.uid() = id 
    OR auth.role() = 'authenticated'
  );

-- DELETE: Any authenticated user can delete (we'll add proper role checks later)
CREATE POLICY "Users can delete profiles"
  ON user_profiles FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- DONE - NO MORE INFINITE RECURSION!
-- ============================================
