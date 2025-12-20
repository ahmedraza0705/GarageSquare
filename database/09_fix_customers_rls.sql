-- ============================================
-- FIX RLS INFINITE RECURSION FOR CUSTOMERS
-- ============================================

-- 1. Ensure helper functions exist and are SECURITY DEFINER
-- These bypass RLS for lookups within policies.

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

-- 2. Fix CUSTOMERS policies to avoid querying user_profiles directly
DROP POLICY IF EXISTS "Company admins can do everything with customers" ON customers;
DROP POLICY IF EXISTS "Managers can manage customers in their branch" ON customers;
DROP POLICY IF EXISTS "Customers can view their own data" ON customers;

CREATE POLICY "Company admins can do everything with customers"
  ON customers FOR ALL
  USING (
    get_my_role_name() = 'company_admin'
  );

CREATE POLICY "Managers can manage customers in their branch"
  ON customers FOR ALL
  USING (
    branch_id = (SELECT branch_id FROM user_profiles WHERE id = auth.uid())
    AND get_my_role_name() IN ('manager', 'supervisor', 'technician_group_manager')
  );

CREATE POLICY "Customers can view their own data"
  ON customers FOR SELECT
  USING (
    user_id = auth.uid()
    OR get_my_role_name() IN ('company_admin', 'manager', 'supervisor', 'technician_group_manager')
  );

-- 3. Fix USER_PROFILES policies if still recursive
DROP POLICY IF EXISTS "Company admins can view all profiles" ON user_profiles;
CREATE POLICY "Company admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    get_my_role_name() = 'company_admin'
  );
