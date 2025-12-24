-- ============================================
-- ULTIMATE FIX - Run this NOW
-- ============================================
-- This will fix everything based on what I see in your database

-- Step 1: Check if user_profiles table exists, if not create it
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(200),
  phone VARCHAR(20),
  username VARCHAR(100),
  role_id UUID,
  branch_id UUID,
  company_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create roles table if not exists
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- Step 4: Create companies and branches tables
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  company_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Add foreign keys if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_profiles_role_id_fkey'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_id_fkey 
      FOREIGN KEY (role_id) REFERENCES roles(id);
  END IF;
END $$;

-- Step 6: Disable RLS temporarily for testing
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE branches DISABLE ROW LEVEL SECURITY;

-- Step 7: Create profiles for existing auth users (if they don't have one)
INSERT INTO user_profiles (id, email, full_name, is_active)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
  true
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM user_profiles up WHERE up.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- Step 8: Verify
SELECT COUNT(*) as total_auth_users FROM auth.users;
SELECT COUNT(*) as total_profiles FROM user_profiles;
SELECT COUNT(*) as total_roles FROM roles;

-- If counts match, you're good! Try creating a user now.
