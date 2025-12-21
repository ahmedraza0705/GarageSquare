-- ============================================
-- FIX INVOICES RLS INFINITE RECURSION
-- ============================================
-- This script fixes the infinite recursion error in invoice RLS policies
-- by using security definer functions that bypass RLS checks

-- ============================================
-- SECURITY DEFINER HELPER FUNCTIONS
-- ============================================

-- Function to check if user is a company admin
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

-- Function to get user's branch ID
CREATE OR REPLACE FUNCTION public.get_user_branch_id(user_id UUID DEFAULT auth.uid())
RETURNS UUID AS $$
DECLARE
  branch_id_val UUID;
BEGIN
  SELECT branch_id INTO branch_id_val
  FROM user_profiles
  WHERE id = user_id;
  
  RETURN branch_id_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has specific role(s)
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, role_names TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN roles r ON up.role_id = r.id
    WHERE up.id = user_id
    AND r.name = ANY(role_names)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is a customer with specific customer_id
CREATE OR REPLACE FUNCTION public.is_customer_owner(user_id UUID, customer_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM customers
    WHERE id = customer_id_param
    AND user_id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- DROP EXISTING INVOICE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Company admins can do everything with invoices" ON invoices;
DROP POLICY IF EXISTS "Managers can manage invoices in their branch" ON invoices;
DROP POLICY IF EXISTS "Customers can view their own invoices" ON invoices;

DROP POLICY IF EXISTS "Company admins can do everything with invoice items" ON invoice_items;
DROP POLICY IF EXISTS "Managers can manage invoice items in their branch" ON invoice_items;
DROP POLICY IF EXISTS "Customers can view their own invoice items" ON invoice_items;

-- ============================================
-- CREATE NEW INVOICE POLICIES USING SECURITY DEFINER FUNCTIONS
-- ============================================

-- Company admins can do everything with invoices
CREATE POLICY "Company admins can do everything with invoices"
  ON invoices FOR ALL
  USING (public.is_company_admin(auth.uid()));

-- Managers can manage invoices in their branch
CREATE POLICY "Managers can manage invoices in their branch"
  ON invoices FOR ALL
  USING (
    branch_id = public.get_user_branch_id(auth.uid())
    AND public.has_role(auth.uid(), ARRAY['manager', 'supervisor'])
  );

-- Customers can view their own invoices
CREATE POLICY "Customers can view their own invoices"
  ON invoices FOR SELECT
  USING (
    public.is_customer_owner(auth.uid(), customer_id)
    OR public.has_role(auth.uid(), ARRAY['company_admin', 'manager', 'supervisor'])
  );

-- ============================================
-- CREATE NEW INVOICE ITEMS POLICIES
-- ============================================

-- Company admins can do everything with invoice items
CREATE POLICY "Company admins can do everything with invoice items"
  ON invoice_items FOR ALL
  USING (public.is_company_admin(auth.uid()));

-- Managers can manage invoice items in their branch
CREATE POLICY "Managers can manage invoice items in their branch"
  ON invoice_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM invoices i
      WHERE i.id = invoice_items.invoice_id
      AND i.branch_id = public.get_user_branch_id(auth.uid())
    )
    AND public.has_role(auth.uid(), ARRAY['manager', 'supervisor'])
  );

-- Customers can view their own invoice items
CREATE POLICY "Customers can view their own invoice items"
  ON invoice_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM invoices i
      WHERE i.id = invoice_items.invoice_id
      AND public.is_customer_owner(auth.uid(), i.customer_id)
    )
    OR public.has_role(auth.uid(), ARRAY['company_admin', 'manager', 'supervisor'])
  );

-- ============================================
-- GRANT EXECUTE PERMISSIONS
-- ============================================

GRANT EXECUTE ON FUNCTION public.is_company_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_branch_id(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_customer_owner(UUID, UUID) TO authenticated;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the fix works:

-- 1. Check if functions are created
-- SELECT proname FROM pg_proc WHERE proname IN ('is_company_admin', 'get_user_branch_id', 'has_role', 'is_customer_owner');

-- 2. Test the functions
-- SELECT public.is_company_admin(auth.uid());
-- SELECT public.get_user_branch_id(auth.uid());

-- 3. Try querying invoices
-- SELECT * FROM invoices LIMIT 5;
