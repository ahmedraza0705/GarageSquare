-- ============================================
-- COMPLETE FIX FOR USER CREATION
-- ============================================
-- Run this ENTIRE script in Supabase SQL Editor
-- This will fix all issues in one go

-- Step 1: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 2: Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view roles" ON roles;
DROP POLICY IF EXISTS "Authenticated users can manage companies" ON companies;
DROP POLICY IF EXISTS "Authenticated users can manage branches" ON branches;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete profiles" ON user_profiles;

-- Step 3: Create tables
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
  registry_number VARCHAR(255),
  description TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(200),
  phone VARCHAR(20),
  username VARCHAR(100),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deactivated_at TIMESTAMP WITH TIME ZONE,
  deactivated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Insert roles
INSERT INTO roles (name, display_name, description) VALUES
  ('company_admin', 'Company Admin', 'Full system access'),
  ('manager', 'Manager', 'Branch management'),
  ('supervisor', 'Supervisor', 'Team oversight'),
  ('technician_group_manager', 'Tech Lead', 'Group management'),
  ('technician', 'Technician', 'Task execution'),
  ('customer', 'Customer', 'View own data')
ON CONFLICT (name) DO NOTHING;

-- Step 5: Create trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  admin_role_id UUID;
  user_count BIGINT;
BEGIN
  SELECT COUNT(*) INTO user_count FROM user_profiles;
  SELECT id INTO admin_role_id FROM roles WHERE name = 'company_admin' LIMIT 1;
  
  INSERT INTO public.user_profiles (id, email, full_name, phone, role_id, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    CASE WHEN user_count = 0 THEN admin_role_id ELSE NULL END,
    true
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 7: Create SIMPLE, NON-RECURSIVE policies
CREATE POLICY "roles_select" ON roles FOR SELECT USING (true);

CREATE POLICY "companies_all" ON companies FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "branches_all" ON branches FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "profiles_select" ON user_profiles FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "profiles_insert" ON user_profiles FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "profiles_update" ON user_profiles FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "profiles_delete" ON user_profiles FOR DELETE 
  USING (auth.role() = 'authenticated');

-- DONE! Try creating a user now.
