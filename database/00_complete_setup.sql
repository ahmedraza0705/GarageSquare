-- ============================================
-- GARAGE SQUARE - COMPLETE DATABASE SETUP
-- ============================================
-- This is a consolidated migration script that sets up the entire database
-- Run this in your Supabase SQL Editor to create all tables and functions
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STEP 1: CREATE TABLES
-- ============================================

-- ROLES TABLE
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USER_PROFILES TABLE
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
  branch_id UUID, -- Will reference branches table
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deactivated_at TIMESTAMP WITH TIME ZONE,
  deactivated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- USER ACTIVITY LOG TABLE
CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STEP 2: CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role_id ON user_profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_branch_id ON user_profiles(branch_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON user_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_login ON user_profiles(last_login_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log(created_at DESC);

-- ============================================
-- STEP 3: INSERT DEFAULT ROLES
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
-- STEP 4: CREATE FUNCTIONS
-- ============================================

-- Function: Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  admin_role_id UUID;
  user_count BIGINT;
  current_user_id UUID;
BEGIN
  -- Get current authenticated user (if any)
  current_user_id := auth.uid();
  
  -- Count existing profiles to detect first user
  SELECT COUNT(*) INTO user_count FROM user_profiles;
  
  -- Get company_admin role ID (may be null if roles not seeded)
  SELECT id INTO admin_role_id FROM roles WHERE name = 'company_admin' LIMIT 1;
  
  -- Insert into user_profiles
  INSERT INTO public.user_profiles (id, email, full_name, phone, role_id, is_active, created_by)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    CASE 
      WHEN user_count = 0 THEN admin_role_id  -- First user gets company_admin
      ELSE NULL  -- Other users get NULL (pending role assignment)
    END,
    true,
    current_user_id  -- Track who created this user
  );
  
  -- Log the activity
  IF current_user_id IS NOT NULL THEN
    PERFORM log_user_activity(
      NEW.id,
      'user_created',
      jsonb_build_object('created_by', current_user_id, 'email', NEW.email)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
  p_user_id UUID,
  p_action VARCHAR(100),
  p_details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO user_activity_log (user_id, action, performed_by, details)
  VALUES (p_user_id, p_action, auth.uid(), p_details)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Deactivate user (soft delete)
CREATE OR REPLACE FUNCTION deactivate_user(
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if caller is company admin
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role_id = (SELECT id FROM roles WHERE name = 'company_admin')
  ) THEN
    RAISE EXCEPTION 'Only company admins can deactivate users';
  END IF;

  -- Deactivate the user
  UPDATE user_profiles
  SET 
    is_active = false,
    deactivated_at = NOW(),
    deactivated_by = auth.uid(),
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Log the activity
  PERFORM log_user_activity(
    p_user_id,
    'user_deactivated',
    jsonb_build_object('deactivated_by', auth.uid())
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Reactivate user
CREATE OR REPLACE FUNCTION reactivate_user(
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if caller is company admin
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role_id = (SELECT id FROM roles WHERE name = 'company_admin')
  ) THEN
    RAISE EXCEPTION 'Only company admins can reactivate users';
  END IF;

  -- Reactivate the user
  UPDATE user_profiles
  SET 
    is_active = true,
    deactivated_at = NULL,
    deactivated_by = NULL,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Log the activity
  PERFORM log_user_activity(
    p_user_id,
    'user_reactivated',
    jsonb_build_object('reactivated_by', auth.uid())
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get user role
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

-- Function: Assign role by admin
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

-- ============================================
-- STEP 5: CREATE TRIGGERS
-- ============================================

-- Trigger: Auto-create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Update updated_at on roles
DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update updated_at on user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 6: ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 7: CREATE RLS POLICIES
-- ============================================

-- ROLES POLICIES
DROP POLICY IF EXISTS "Anyone can view roles" ON roles;
CREATE POLICY "Anyone can view roles"
  ON roles FOR SELECT
  USING (auth.role() = 'authenticated');

-- USER_PROFILES POLICIES

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

-- Users can insert their own profile
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

-- Company admins can update all profiles
DROP POLICY IF EXISTS "Company admins can update all profiles" ON user_profiles;
CREATE POLICY "Company admins can update all profiles"
  ON user_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role_id = (SELECT id FROM roles WHERE name = 'company_admin')
    )
  );

-- Company admins can insert profiles (for creating users)
DROP POLICY IF EXISTS "Company admins can insert profiles" ON user_profiles;
CREATE POLICY "Company admins can insert profiles"
  ON user_profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role_id = (SELECT id FROM roles WHERE name = 'company_admin')
    )
    OR auth.uid() = id  -- Allow users to create their own profile
  );

-- Company admins can delete user profiles
DROP POLICY IF EXISTS "Company admins can delete user profiles" ON user_profiles;
CREATE POLICY "Company admins can delete user profiles"
  ON user_profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role_id = (SELECT id FROM roles WHERE name = 'company_admin')
    )
  );

-- USER_ACTIVITY_LOG POLICIES

-- Company admins can view all activity
DROP POLICY IF EXISTS "Company admins can view all activity" ON user_activity_log;
CREATE POLICY "Company admins can view all activity"
  ON user_activity_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role_id = (SELECT id FROM roles WHERE name = 'company_admin')
    )
  );

-- Company admins can insert activity logs
DROP POLICY IF EXISTS "Company admins can insert activity logs" ON user_activity_log;
CREATE POLICY "Company admins can insert activity logs"
  ON user_activity_log FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role_id = (SELECT id FROM roles WHERE name = 'company_admin')
    )
  );

-- ============================================
-- STEP 8: ADD COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE user_profiles IS 'Extended user profile information linked to auth.users';
COMMENT ON TABLE user_activity_log IS 'Audit log for user management actions';
COMMENT ON FUNCTION handle_new_user IS 'Automatically creates user profile when new user signs up';
COMMENT ON FUNCTION log_user_activity IS 'Logs user management activities for audit trail';
COMMENT ON FUNCTION deactivate_user IS 'Soft deletes a user by setting is_active to false';
COMMENT ON FUNCTION reactivate_user IS 'Reactivates a previously deactivated user';

-- ============================================
-- SETUP COMPLETE
-- ============================================
-- Your database is now ready for user authentication and management!
