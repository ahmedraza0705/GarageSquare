-- ============================================
-- ESSENTIAL SETUP FOR USER CREATION
-- ============================================
-- Run this in Supabase SQL Editor to enable user creation
-- This is a minimal setup - run the full schema later

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. CREATE ROLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. CREATE COMPANIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  registry_number VARCHAR(255),
  description TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. CREATE BRANCHES TABLE (minimal)
-- ============================================
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

-- ============================================
-- 4. CREATE USER_PROFILES TABLE
-- ============================================
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

-- ============================================
-- 5. INSERT DEFAULT ROLES
-- ============================================
INSERT INTO roles (name, display_name, description) VALUES
  ('company_admin', 'Company Admin', 'Full system access, manages all branches and users'),
  ('manager', 'Manager', 'Manages a specific branch, handles customers and job cards'),
  ('supervisor', 'Supervisor', 'Oversees technicians and tasks in a branch'),
  ('technician_group_manager', 'Technician Group Manager', 'Manages a group of technicians'),
  ('technician', 'Technician', 'Performs vehicle repairs and maintenance tasks'),
  ('customer', 'Customer', 'Can view their own vehicles and job cards')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 6. CREATE TRIGGER FOR AUTO-PROFILE CREATION
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  admin_role_id UUID;
  user_count BIGINT;
BEGIN
  -- Count existing profiles to detect first user
  SELECT COUNT(*) INTO user_count FROM user_profiles;
  
  -- Get company_admin role ID
  SELECT id INTO admin_role_id FROM roles WHERE name = 'company_admin' LIMIT 1;
  
  -- Insert into user_profiles
  INSERT INTO public.user_profiles (id, email, full_name, phone, role_id, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    CASE 
      WHEN user_count = 0 THEN admin_role_id  -- First user gets company_admin
      ELSE NULL  -- Other users get NULL (pending role assignment)
    END,
    true
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 7. ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 8. CREATE PERMISSIVE RLS POLICIES
-- ============================================

-- Roles: Anyone can view
DROP POLICY IF EXISTS "Anyone can view roles" ON roles;
CREATE POLICY "Anyone can view roles"
  ON roles FOR SELECT
  USING (auth.role() = 'authenticated');

-- Companies: Authenticated users can manage
DROP POLICY IF EXISTS "Authenticated users can manage companies" ON companies;
CREATE POLICY "Authenticated users can manage companies"
  ON companies FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Branches: Authenticated users can manage
DROP POLICY IF EXISTS "Authenticated users can manage branches" ON branches;
CREATE POLICY "Authenticated users can manage branches"
  ON branches FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- User Profiles: Users can view their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- User Profiles: Users can update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- User Profiles: Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User Profiles: Admins can view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role_id = (SELECT id FROM roles WHERE name = 'company_admin')
    )
  );

-- User Profiles: Admins can update all profiles
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
CREATE POLICY "Admins can update all profiles"
  ON user_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role_id = (SELECT id FROM roles WHERE name = 'company_admin')
    )
  );

-- User Profiles: Admins can insert profiles
DROP POLICY IF EXISTS "Admins can insert profiles" ON user_profiles;
CREATE POLICY "Admins can insert profiles"
  ON user_profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role_id = (SELECT id FROM roles WHERE name = 'company_admin')
    )
    OR auth.uid() = id
  );

-- User Profiles: Admins can delete profiles
DROP POLICY IF EXISTS "Admins can delete profiles" ON user_profiles;
CREATE POLICY "Admins can delete profiles"
  ON user_profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role_id = (SELECT id FROM roles WHERE name = 'company_admin')
    )
  );

-- ============================================
-- SETUP COMPLETE
-- ============================================
-- You can now create users via AddUserScreen!
