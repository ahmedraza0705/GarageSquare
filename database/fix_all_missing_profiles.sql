-- ============================================
-- FIX: Create Missing User Profiles (All Users)
-- ============================================
-- This script automatically creates profiles for ALL users that are missing them
-- ============================================

-- Step 1: Check which users are missing profiles
SELECT 
  au.id,
  au.email,
  au.created_at,
  up.id as profile_id,
  CASE 
    WHEN up.id IS NULL THEN '❌ Profile missing - will create below'
    ELSE '✅ Profile exists'
  END as status
FROM auth.users au
LEFT JOIN user_profiles up ON up.id = au.id
ORDER BY au.created_at DESC;

-- Step 2: Create missing profiles for ALL users
DO $$
DECLARE
  v_user RECORD;
  v_admin_role_id UUID;
  v_branch_id UUID;
  v_company_id UUID;
  v_created_count INT := 0;
BEGIN
  -- Get company_admin role
  SELECT id INTO v_admin_role_id FROM roles WHERE name = 'company_admin' LIMIT 1;
  
  -- Get first company (or create one if none exists)
  SELECT id INTO v_company_id FROM companies LIMIT 1;
  
  IF v_company_id IS NULL THEN
    INSERT INTO companies (name, created_at, updated_at)
    VALUES ('Default Company', NOW(), NOW())
    RETURNING id INTO v_company_id;
    RAISE NOTICE 'Created default company: %', v_company_id;
  END IF;
  
  -- Get first branch (or create one if none exists)
  SELECT id INTO v_branch_id FROM branches WHERE company_id = v_company_id LIMIT 1;
  
  IF v_branch_id IS NULL THEN
    INSERT INTO branches (company_id, name, address, created_at, updated_at)
    VALUES (v_company_id, 'Main Branch', 'Default Address', NOW(), NOW())
    RETURNING id INTO v_branch_id;
    RAISE NOTICE 'Created default branch: %', v_branch_id;
  END IF;
  
  -- Loop through all users without profiles
  FOR v_user IN 
    SELECT au.id, au.email
    FROM auth.users au
    LEFT JOIN user_profiles up ON up.id = au.id
    WHERE up.id IS NULL
  LOOP
    -- Create user profile
    INSERT INTO user_profiles (id, email, role_id, branch_id, is_active, created_at, updated_at)
    VALUES (v_user.id, v_user.email, v_admin_role_id, v_branch_id, true, NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
    
    v_created_count := v_created_count + 1;
    RAISE NOTICE 'Created profile for: % (ID: %)', v_user.email, v_user.id;
  END LOOP;
  
  RAISE NOTICE 'Total profiles created: %', v_created_count;
END $$;

-- Step 3: Verify all profiles now exist
SELECT 
  up.id,
  up.email,
  r.name as role,
  up.branch_id,
  b.name as branch_name,
  c.name as company_name,
  up.is_active
FROM user_profiles up
LEFT JOIN roles r ON r.id = up.role_id
LEFT JOIN branches b ON b.id = up.branch_id
LEFT JOIN companies c ON c.id = b.company_id
ORDER BY up.created_at DESC;

-- Step 4: Summary
SELECT 
  COUNT(*) as total_users,
  COUNT(up.id) as users_with_profiles,
  COUNT(*) - COUNT(up.id) as users_without_profiles
FROM auth.users au
LEFT JOIN user_profiles up ON up.id = au.id;
