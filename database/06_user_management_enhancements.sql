-- ============================================
-- USER MANAGEMENT ENHANCEMENTS
-- Migration: 06_user_management_enhancements.sql
-- ============================================

-- Add new columns to user_profiles for enhanced user management
ALTER TABLE user_profiles 
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS deactivated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create user activity log table for audit trail
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

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON user_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_login ON user_profiles(last_login_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON user_profiles(is_active);

-- Enable RLS on activity log
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_activity_log
CREATE POLICY "Company admins can view all activity"
  ON user_activity_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role_id = (SELECT id FROM roles WHERE name = 'company_admin')
    )
  );

CREATE POLICY "Company admins can insert activity logs"
  ON user_activity_log FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role_id = (SELECT id FROM roles WHERE name = 'company_admin')
    )
  );

-- Function to log user activity
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

-- Function to update last login timestamp
CREATE OR REPLACE FUNCTION update_last_login()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_profiles
  SET last_login_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deactivate user (soft delete)
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

-- Function to reactivate user
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

-- Update the handle_new_user function to track creator
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

-- Add RLS policy to allow company admins to delete users
CREATE POLICY "Company admins can delete user profiles"
  ON user_profiles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role_id = (SELECT id FROM roles WHERE name = 'company_admin')
    )
  );

-- Add RLS policy to allow company admins to update any user profile
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

-- Comment for documentation
COMMENT ON TABLE user_activity_log IS 'Audit log for user management actions';
COMMENT ON FUNCTION log_user_activity IS 'Logs user management activities for audit trail';
COMMENT ON FUNCTION deactivate_user IS 'Soft deletes a user by setting is_active to false';
COMMENT ON FUNCTION reactivate_user IS 'Reactivates a previously deactivated user';
