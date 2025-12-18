-- ============================================
-- MIGRATION: 01_multi_tenant_branches
-- PURPOSE: Introduce Company multi-tenancy and link Branches/Users
-- ============================================

-- 1. Create Companies Table
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(100),
    website VARCHAR(200),
    logo_url TEXT,
    subscription_plan VARCHAR(50) DEFAULT 'basic', -- 'basic', 'pro', 'enterprise'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- 2. Modify User Profiles (Add company_id)
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_company_id ON user_profiles(company_id);

-- 3. Ensure Branches Table Exists
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(100),
  manager_id UUID, -- We'll add FK later if needed, avoiding circular dep for now
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Modify Branches (Add company_id)
ALTER TABLE branches 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_branches_company_id ON branches(company_id);

-- ============================================
-- RLS POLICIES UPDATE
-- ============================================

-- COMPANIES POLICIES
-- Company Admins can view and update their own company
CREATE POLICY "Company admins can view own company"
    ON companies FOR SELECT
    USING (
        id IN (
            SELECT company_id FROM user_profiles
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Company admins can update own company"
    ON companies FOR UPDATE
    USING (
        id IN (
            SELECT company_id FROM user_profiles
            WHERE id = auth.uid()
            AND role_id = (SELECT id FROM roles WHERE name = 'company_admin')
        )
    );

-- BRANCHES POLICIES REVISION
-- Drop old policy that was too permissive or lacked company check
DROP POLICY IF EXISTS "Company admins can do everything" ON branches;

-- New strict policy: Company Admins can only manage branches for their COMPANY
CREATE POLICY "Company admins can manage company branches"
    ON branches FOR ALL
    USING (
        company_id IN (
            SELECT company_id FROM user_profiles
            WHERE id = auth.uid()
            AND role_id = (SELECT id FROM roles WHERE name = 'company_admin')
        )
    );

-- USER PROFILES POLICIES REVISION
-- Drop old global view policy
DROP POLICY IF EXISTS "Company admins can view all profiles" ON user_profiles;

-- New strict policy: Company Admins can only view profiles in their COMPANY
CREATE POLICY "Company admins can view company profiles"
    ON user_profiles FOR SELECT
    USING (
        company_id IN (
            SELECT company_id FROM user_profiles
            WHERE id = auth.uid()
            AND role_id = (SELECT id FROM roles WHERE name = 'company_admin')
        )
    );

-- Company Admins can update/manage profiles in their COMPANY
DROP POLICY IF EXISTS "Company admins can update any profile" ON user_profiles;

CREATE POLICY "Company admins can update company profiles"
    ON user_profiles FOR UPDATE
    USING (
        company_id IN (
            SELECT company_id FROM user_profiles
            WHERE id = auth.uid()
            AND role_id = (SELECT id FROM roles WHERE name = 'company_admin')
        )
    );
