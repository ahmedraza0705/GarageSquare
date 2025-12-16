-- ============================================
-- RLS UPDATE FOR EDITING USERS
-- ============================================

-- Allow Company Admins to UPDATE any profile
-- This is required to change Role, Branch, or Email of other users.

DROP POLICY IF EXISTS "Company admins can update any profile" ON user_profiles;

CREATE POLICY "Company admins can update any profile"
  ON user_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role_id = (SELECT id FROM roles WHERE name = 'company_admin')
    )
  );

-- Ensure we can verify the update
COMMENT ON POLICY "Company admins can update any profile" ON user_profiles IS 'Allows Company Admins to update any user profile';
