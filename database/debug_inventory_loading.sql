-- ============================================
-- DEBUG: Check User Setup for Inventory
-- ============================================
-- Run this to diagnose why inventory screen is stuck loading
-- ============================================

-- Step 1: Check if companies exist
SELECT 
  'Companies' as table_name,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 0 THEN '❌ No companies found - create one first!'
    ELSE '✅ Companies exist'
  END as status
FROM companies;

-- Step 2: Check if branches exist
SELECT 
  'Branches' as table_name,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 0 THEN '❌ No branches found - create one first!'
    ELSE '✅ Branches exist'
  END as status
FROM branches;

-- Step 3: Check current user's profile
-- Replace 'your@email.com' with your actual email
SELECT 
  up.id,
  up.email,
  up.full_name,
  r.name as role,
  up.branch_id,
  b.name as branch_name,
  b.company_id,
  c.name as company_name,
  CASE 
    WHEN up.branch_id IS NULL THEN '⚠️ No branch assigned - this causes loading issue!'
    WHEN b.company_id IS NULL THEN '❌ Branch has no company!'
    ELSE '✅ User setup is correct'
  END as status
FROM user_profiles up
LEFT JOIN roles r ON r.id = up.role_id
LEFT JOIN branches b ON b.id = up.branch_id
LEFT JOIN companies c ON c.id = b.company_id
WHERE up.email = 'test@gmail.com'  -- CHANGE THIS TO YOUR EMAIL
LIMIT 1;

-- Step 4: Check inventory tables
SELECT 
  'inventory_categories' as table_name,
  COUNT(*) as count
FROM inventory_categories
UNION ALL
SELECT 
  'inventory_items' as table_name,
  COUNT(*) as count
FROM inventory_items
UNION ALL
SELECT 
  'inventory_stock' as table_name,
  COUNT(*) as count
FROM inventory_stock;

-- ============================================
-- FIXES
-- ============================================

-- If no company exists, create one:
-- INSERT INTO companies (name) VALUES ('My Garage Company') RETURNING id, name;

-- If no branch exists, create one (replace COMPANY_ID):
-- INSERT INTO branches (company_id, name, address) 
-- VALUES ('COMPANY_ID_HERE', 'Main Branch', '123 Main St') 
-- RETURNING id, name;

-- If user has no branch, assign one (replace EMAIL and BRANCH_ID):
-- UPDATE user_profiles 
-- SET branch_id = 'BRANCH_ID_HERE'
-- WHERE email = 'your@email.com';

-- Quick fix: Assign first branch to user
-- UPDATE user_profiles 
-- SET branch_id = (SELECT id FROM branches LIMIT 1)
-- WHERE email = 'test@gmail.com';  -- CHANGE THIS TO YOUR EMAIL
