-- ============================================
-- FIX: Inventory Transactions RLS Policy
-- ============================================
-- Problem: Company admins can only VIEW transactions, not CREATE them
-- This prevents adding new inventory items because initial stock transactions fail
-- ============================================

-- Drop ALL existing policies on inventory_transactions for company admins
DROP POLICY IF EXISTS "Company admins can view transactions" ON inventory_transactions;
DROP POLICY IF EXISTS "Company admins can manage all transactions" ON inventory_transactions;

-- Create a new policy that allows company admins to do EVERYTHING with transactions
CREATE POLICY "Company admins can manage all transactions"
  ON inventory_transactions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role_id = (SELECT id FROM roles WHERE name = 'company_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role_id = (SELECT id FROM roles WHERE name = 'company_admin')
    )
  );

-- Verify the policy was created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'inventory_transactions'
ORDER BY policyname;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ RLS policy updated successfully! Company admins can now create inventory transactions.';
END $$;
