-- ============================================
-- DIAGNOSTIC QUERIES
-- ============================================
-- Run these one by one to diagnose the issue

-- 1. Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('roles', 'user_profiles', 'companies', 'branches')
ORDER BY table_name;

-- 2. Check if roles exist
SELECT * FROM roles;

-- 3. Check RLS policies on user_profiles
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';

-- 4. Check if any user_profiles exist
SELECT id, email, full_name, role_id FROM user_profiles;

-- 5. Try to manually insert a test profile (replace YOUR_USER_ID with actual ID)
-- First, get a user ID from auth.users:
SELECT id, email FROM auth.users LIMIT 1;

-- Then try to insert (replace the UUID below):
-- INSERT INTO user_profiles (id, email, full_name, role_id, is_active)
-- VALUES (
--   'YOUR_USER_ID_HERE',
--   'test@example.com',
--   'Test User',
--   (SELECT id FROM roles WHERE name = 'company_admin'),
--   true
-- );
