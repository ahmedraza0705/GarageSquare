-- ============================================
-- FIX: Create Missing User Profile
-- ============================================
-- This script creates a user profile if it's missing
-- ============================================

-- Step 1: Check if your user profile exists
SELECT 
  au.id,
  au.email,
  up.id as profile_id,
  CASE 
    WHEN up.id IS NULL THEN '❌ Profile missing - will create below'
    ELSE '✅ Profile exists'
  END as status
FROM auth.users au
LEFT JOIN user_profiles up ON up.id = au.id
WHERE au.id = '9c076a68-27e3-4640-95a7-95348f890f07'  -- Your user ID from the error
LIMIT 1;

-- Step 2: Create the missing profile
-- First, get the company_admin role ID
DO $$
DECLARE
  v_user_id UUID := '9c076a68-27e3-4640-95a7-95348f890f07';  -- Your user ID
  v_admin_role_id UUID;
  v_user_email TEXT;
  v_branch_id UUID;
BEGIN
  -- Get user email from auth.users
  SELECT email INTO v_user_email FROM auth.users WHERE id = v_user_id;
  
  -- Get company_admin role
  SELECT id INTO v_admin_role_id FROM roles WHERE name = 'company_admin';
  
  -- Get first branch (or NULL if none exists)
  SELECT id INTO v_branch_id FROM branches LIMIT 1;
  
  -- Create user profile if it doesn't exist
  INSERT INTO user_profiles (id, email, role_id, branch_id, is_active)
  VALUES (v_user_id, v_user_email, v_admin_role_id, v_branch_id, true)
  ON CONFLICT (id) DO UPDATE
  SET 
    role_id = v_admin_role_id,
    branch_id = COALESCE(user_profiles.branch_id, v_branch_id),
    is_active = true;
  
  RAISE NOTICE 'User profile created/updated for: %', v_user_email;
END $$;

-- Step 3: Verify the profile was created
SELECT 
  up.id,
  up.email,
  r.name as role,
  up.branch_id,
  b.name as branch_name,
  b.company_id
FROM user_profiles up
LEFT JOIN roles r ON r.id = up.role_id
LEFT JOIN branches b ON b.id = up.branch_id
WHERE up.id = '9c076a68-27e3-4640-95a7-95348f890f07';

-- Step 4: If no branch exists, create one
-- Uncomment and run if needed:
/*
DO $$
DECLARE
  v_company_id UUID;
  v_branch_id UUID;
BEGIN
  -- Get or create company
  SELECT id INTO v_company_id FROM companies LIMIT 1;
  
  IF v_company_id IS NULL THEN
    INSERT INTO companies (name) VALUES ('My Garage') RETURNING id INTO v_company_id;
  END IF;
  
  -- Create branch
  INSERT INTO branches (company_id, name, address)
  VALUES (v_company_id, 'Main Branch', '123 Main Street')
  RETURNING id INTO v_branch_id;
  
  -- Assign branch to user
  UPDATE user_profiles
  SET branch_id = v_branch_id
  WHERE id = '9c076a68-27e3-4640-95a7-95348f890f07';
  
  RAISE NOTICE 'Created branch and assigned to user';
END $$;
*/
