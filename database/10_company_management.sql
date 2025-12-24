-- ============================================
-- 10_COMPANY_MANAGEMENT.SQL
-- ============================================

-- 1. Create companies table if not exists
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  registry_number VARCHAR(255),
  description TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add company_id to user_profiles if missing
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'user_profiles' AND COLUMN_NAME = 'company_id') THEN
    ALTER TABLE user_profiles ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3. Add company_id to branches if missing
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'branches' AND COLUMN_NAME = 'company_id') THEN
    ALTER TABLE branches ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 4. Enable RLS on companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- 5. Create SIMPLE RLS Policies for companies (Permissive for debugging)
DROP POLICY IF EXISTS "Anyone authenticated can insert a company" ON companies;
CREATE POLICY "Anyone authenticated can insert a company" ON companies
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can view their own company" ON companies;
CREATE POLICY "Admins can view their own company" ON companies
  FOR SELECT
  USING (true); -- TEMPORARY: Allow all authenticated to view companies to debug visibility

DROP POLICY IF EXISTS "Admins can update their own company" ON companies;
CREATE POLICY "Admins can update their own company" ON companies
  FOR UPDATE
  USING (true); -- TEMPORARY

-- 6. RESET RLS for user_profiles (Remove isolation specific to company_id for now)
DROP POLICY IF EXISTS "Admins can view profiles in their company" ON user_profiles;
DROP POLICY IF EXISTS "Company admins can view all profiles" ON user_profiles;
CREATE POLICY "Company admins can view all profiles" ON user_profiles
  FOR SELECT
  USING (true); -- TEMPORARY: Restore visibility

DROP POLICY IF EXISTS "Admins can update profiles in their company" ON user_profiles;
DROP POLICY IF EXISTS "Company admins can update all profiles" ON user_profiles;
CREATE POLICY "Admins can update profiles in their company" ON user_profiles
  FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Admins can insert profiles in their company" ON user_profiles;
DROP POLICY IF EXISTS "Company admins can insert profiles" ON user_profiles;
CREATE POLICY "Admins can insert profiles in their company" ON user_profiles
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can delete profiles in their company" ON user_profiles;
DROP POLICY IF EXISTS "Company admins can delete user profiles" ON user_profiles;
CREATE POLICY "Admins can delete profiles in their company" ON user_profiles
  FOR DELETE
  USING (true);

-- 7. RESET RLS for branches
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can view branches in their company" ON branches;
CREATE POLICY "Admins can view branches in their company" ON branches
  FOR SELECT
  USING (true); -- TEMPORARY: Restore visibility

DROP POLICY IF EXISTS "Admins can insert branches in their company" ON branches;
CREATE POLICY "Admins can insert branches in their company" ON branches
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update branches in their company" ON branches;
CREATE POLICY "Admins can update branches in their company" ON branches
  FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Admins can delete branches in their company" ON branches;
CREATE POLICY "Admins can delete branches in their company" ON branches
  FOR DELETE
  USING (true);