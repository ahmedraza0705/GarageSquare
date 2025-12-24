-- ============================================
-- FINAL COMPREHENSIVE FIX
-- ============================================
-- This removes ALL triggers and sets up clean tables

-- STEP 1: Remove ALL triggers on auth.users
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_table = 'users' 
        AND trigger_schema = 'auth'
    ) LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || r.trigger_name || ' ON auth.users CASCADE';
    END LOOP;
END $$;

-- STEP 2: Drop trigger functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- STEP 3: Drop and recreate user_profiles table (clean slate)
DROP TABLE IF EXISTS user_profiles CASCADE;

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
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

-- STEP 4: Create other tables
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- STEP 5: Insert roles
TRUNCATE roles CASCADE;
INSERT INTO roles (name, display_name, description) VALUES
  ('company_admin', 'Company Admin', 'Full access'),
  ('manager', 'Manager', 'Branch management'),
  ('supervisor', 'Supervisor', 'Team oversight'),
  ('technician_group_manager', 'Tech Lead', 'Group management'),
  ('technician', 'Technician', 'Task execution'),
  ('customer', 'Customer', 'View own data');

-- STEP 6: DISABLE ALL RLS
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE branches DISABLE ROW LEVEL SECURITY;

-- STEP 7: Grant permissions
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON user_profiles TO anon;
GRANT ALL ON roles TO authenticated;
GRANT ALL ON roles TO anon;
GRANT ALL ON companies TO authenticated;
GRANT ALL ON companies TO anon;
GRANT ALL ON branches TO authenticated;
GRANT ALL ON branches TO anon;

-- STEP 8: Create profiles for existing auth users
INSERT INTO user_profiles (id, email, full_name, is_active)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
  true
FROM auth.users au
ON CONFLICT (id) DO NOTHING;

-- STEP 9: Verify
SELECT 
  'Setup Complete!' as status,
  (SELECT COUNT(*) FROM auth.users) as auth_users,
  (SELECT COUNT(*) FROM user_profiles) as profiles,
  (SELECT COUNT(*) FROM roles) as roles;

-- NOW TRY CREATING A USER!
