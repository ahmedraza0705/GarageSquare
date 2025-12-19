-- ============================================
-- BRANCH MANAGEMENT TABLES
-- ============================================
-- Run this SQL in your Supabase SQL Editor

-- 1. Create branches table (if not exists)
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  manager_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Add trigger to branches table
DROP TRIGGER IF EXISTS update_branches_updated_at ON branches;
CREATE TRIGGER update_branches_updated_at
  BEFORE UPDATE ON branches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 4. Enable Row Level Security
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if any
DROP POLICY IF EXISTS "Company admins can view all branches" ON branches;
DROP POLICY IF EXISTS "Company admins can insert branches" ON branches;
DROP POLICY IF EXISTS "Company admins can update branches" ON branches;
DROP POLICY IF EXISTS "Company admins can delete branches" ON branches;
DROP POLICY IF EXISTS "Managers can view their branch" ON branches;
DROP POLICY IF EXISTS "Users can view their branch" ON branches;

-- 6. Create RLS Policies

-- Company admins can do everything
CREATE POLICY "Company admins can view all branches"
  ON branches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name = 'company_admin'
    )
  );

CREATE POLICY "Company admins can insert branches"
  ON branches FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name = 'company_admin'
    )
  );

CREATE POLICY "Company admins can update branches"
  ON branches FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name = 'company_admin'
    )
  );

CREATE POLICY "Company admins can delete branches"
  ON branches FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name = 'company_admin'
    )
  );

-- Managers and other users can view their own branch
CREATE POLICY "Users can view their branch"
  ON branches FOR SELECT
  USING (
    id IN (
      SELECT branch_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_branches_manager_id ON branches(manager_id);
CREATE INDEX IF NOT EXISTS idx_branches_is_active ON branches(is_active);
CREATE INDEX IF NOT EXISTS idx_branches_created_at ON branches(created_at DESC);

-- 8. Insert sample data (optional - remove if you don't want sample data)
INSERT INTO branches (name, address, phone, email, is_active)
VALUES 
  ('Surat Branch', '1234, Main St. Vesu, Surat, Gujarat', '+91 96622 80843', 'surat@garagesquare.com', true),
  ('Mumbai Branch', '456, Marine Drive, Mumbai, Maharashtra', '+91 98765 43210', 'mumbai@garagesquare.com', true)
ON CONFLICT (id) DO NOTHING;

-- 9. Grant permissions (if needed)
GRANT ALL ON branches TO authenticated;
GRANT ALL ON branches TO service_role;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify everything is set up correctly

-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'branches'
);

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'branches';

-- Check policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'branches';

-- View all branches
SELECT * FROM branches ORDER BY created_at DESC;
