-- ============================================
-- AUTHENTICATION TABLES FOR LOGIN & SIGNUP
-- ============================================
-- This file contains only the essential tables needed for authentication
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ROLES TABLE
-- ============================================
-- Stores all available roles in the system
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- USER_PROFILES TABLE
-- ============================================
-- Extends Supabase auth.users with additional profile information
-- Links to auth.users table (created automatically by Supabase)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(200),
  phone VARCHAR(20),
  role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
  branch_id UUID, -- Can reference branches table if needed
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role_id ON user_profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON user_profiles(is_active);

-- ============================================
-- INSERT DEFAULT ROLES
-- ============================================
-- Insert all the roles your app needs
INSERT INTO roles (name, display_name, description) VALUES
  ('company_admin', 'Company Admin', 'Full system access, manages all branches and users'),
  ('manager', 'Manager', 'Manages a specific branch, handles customers and job cards'),
  ('supervisor', 'Supervisor', 'Oversees technicians and tasks in a branch'),
  ('technician_group_manager', 'Technician Group Manager', 'Manages a group of technicians'),
  ('technician', 'Technician', 'Performs vehicle repairs and maintenance tasks'),
  ('customer', 'Customer', 'Can view their own vehicles and job cards')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- FUNCTION: Auto-create user profile on signup
-- ============================================
-- This function automatically creates a user_profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  admin_role_id UUID;
  user_count BIGINT;
BEGIN
  -- Count existing profiles to detect first user
  SELECT COUNT(*) INTO user_count FROM user_profiles;

  -- Get company_admin role ID (may be null if roles not seeded)
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

-- ============================================
-- TRIGGER: Auto-create profile on user signup
-- ============================================
-- This trigger fires when a new user is created in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FUNCTION: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for roles table
DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_profiles table
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ROLES POLICIES
-- ============================================
-- Anyone authenticated can view roles
DROP POLICY IF EXISTS "Anyone can view roles" ON roles;
CREATE POLICY "Anyone can view roles"
  ON roles FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================
-- USER_PROFILES POLICIES
-- ============================================

-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (for manual creation if needed)
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Company admins can view all profiles
DROP POLICY IF EXISTS "Company admins can view all profiles" ON user_profiles;
CREATE POLICY "Company admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role_id = (SELECT id FROM roles WHERE name = 'company_admin')
    )
  );

-- Company admins can update any profile (for role assignment)
DROP POLICY IF EXISTS "Company admins can update any profile" ON user_profiles;
CREATE POLICY "Company admins can update any profile"
  ON user_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role_id = (SELECT id FROM roles WHERE name = 'company_admin')
    )
  );

-- ============================================
-- HELPER FUNCTION: Get user role
-- ============================================
-- Useful function to get a user's role name
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS VARCHAR AS $$
DECLARE
  role_name VARCHAR;
BEGIN
  SELECT r.name INTO role_name
  FROM user_profiles up
  JOIN roles r ON up.role_id = r.id
  WHERE up.id = user_id;
  
  RETURN role_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RPC: assign role by admin (app-only helper)
-- ============================================
-- This function lets a company_admin (by RLS/policy) assign a role and update
-- basic profile fields WITHOUT causing policy recursion on user_profiles.
-- Call via supabase.rpc('assign_role_by_admin', { target_email, role_name, full_name, phone })
CREATE OR REPLACE FUNCTION assign_role_by_admin(
  target_email text,
  role_name text,
  full_name text DEFAULT NULL,
  phone text DEFAULT NULL
) RETURNS void AS $$
DECLARE
  target_user_id uuid;
  target_role_id uuid;
BEGIN
  -- Find the target user_profile by email
  SELECT id INTO target_user_id FROM user_profiles WHERE lower(email) = lower(target_email) LIMIT 1;
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found for email %', target_email;
  END IF;

  -- Find the role id
  SELECT id INTO target_role_id FROM roles WHERE name = role_name LIMIT 1;
  IF target_role_id IS NULL THEN
    RAISE EXCEPTION 'Role not found: %', role_name;
  END IF;

  -- Update profile with role (and optional fields)
  UPDATE user_profiles
  SET
    role_id = target_role_id,
    full_name = COALESCE(full_name, user_profiles.full_name),
    phone = COALESCE(phone, user_profiles.phone),
    updated_at = NOW()
  WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;