-- ============================================
-- SIMPLIFIED USER CREATION FIX
-- ============================================
-- This removes the trigger to avoid conflicts
-- The app will handle profile creation directly

-- Step 1: Drop the problematic trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 2: Ensure tables exist
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(200),
  phone VARCHAR(20),
  username VARCHAR(100),
  role_id UUID REFERENCES roles(id),
  branch_id UUID REFERENCES branches(id),
  company_id UUID REFERENCES companies(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Insert roles
INSERT INTO roles (name, display_name, description) VALUES
  ('company_admin', 'Company Admin', 'Full access'),
  ('manager', 'Manager', 'Branch management'),
  ('supervisor', 'Supervisor', 'Team oversight'),
  ('technician_group_manager', 'Tech Lead', 'Group management'),
  ('technician', 'Technician', 'Task execution'),
  ('customer', 'Customer', 'View own data')
ON CONFLICT (name) DO NOTHING;

-- Step 4: Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop ALL existing policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'user_profiles') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON user_profiles';
    END LOOP;
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'roles') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON roles';
    END LOOP;
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'companies') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON companies';
    END LOOP;
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'branches') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON branches';
    END LOOP;
END $$;

-- Step 6: Create simple policies (NO RECURSION)
CREATE POLICY "allow_all_roles" ON roles FOR ALL USING (true);
CREATE POLICY "allow_all_companies" ON companies FOR ALL USING (true);
CREATE POLICY "allow_all_branches" ON branches FOR ALL USING (true);
CREATE POLICY "allow_all_profiles" ON user_profiles FOR ALL USING (true);

-- DONE! Now the app handles everything.
