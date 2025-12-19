-- ============================================
-- RLS UPDATE FOR CLIENT-SIDE USER CREATION
-- ============================================

-- Allow Company Admins to INSERT new profiles
-- This is required because we are creating the user on the client side
-- and then inserting their profile immediately after.

DROP POLICY IF EXISTS "Company admins can insert any profile" ON user_profiles;

CREATE POLICY "Company admins can insert any profile"
  ON user_profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role_id = (SELECT id FROM roles WHERE name = 'company_admin')
    )
  );

-- Ensure authenticated users can read roles (already exists but good to double check)
-- This is needed for the dropdowns
DROP POLICY IF EXISTS "Anyone can view roles" ON roles;
CREATE POLICY "Anyone can view roles"
  ON roles FOR SELECT
  USING (auth.role() = 'authenticated');

-- Ensure authenticated users can read branches (for dropdown)
DROP POLICY IF EXISTS "Anyone can view branches" ON branches;
CREATE POLICY "Anyone can view branches"
  ON branches FOR SELECT
  USING (auth.role() = 'authenticated');
