-- ============================================
-- FIX RLS INFINITE RECURSION
-- ============================================

-- Create a security definer function to check user roles
-- This avoids RLS recursion by running with elevated privileges
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

CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID DEFAULT auth.uid())
RETURNS TEXT AS $$
DECLARE
  role_name TEXT;
BEGIN
  SELECT r.name INTO role_name
  FROM user_profiles up
  JOIN roles r ON up.role_id = r.id
  WHERE up.id = user_id;
  
  RETURN role_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies to use the security definer functions
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Company admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Company admins can update any profile" ON user_profiles;
DROP POLICY IF EXISTS "Company admins can insert any profile" ON user_profiles;

-- Recreate policies using the security definer functions
CREATE POLICY "Company admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (public.is_company_admin());

CREATE POLICY "Company admins can update any profile"
  ON user_profiles FOR UPDATE
  USING (public.is_company_admin());

CREATE POLICY "Company admins can insert any profile"
  ON user_profiles FOR INSERT
  WITH CHECK (public.is_company_admin());

-- Note: Branches table policies will be fixed when you run the full schema.sql
-- For now, this fixes the user_profiles infinite recursion issue
