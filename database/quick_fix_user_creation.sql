-- ============================================
-- SIMPLE FIX FOR USER CREATION
-- ============================================
-- Run this in Supabase SQL Editor to fix user creation

-- OPTION 1: Temporarily disable RLS on user_profiles (Quick Fix)
-- This will allow user creation to work immediately
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- OPTION 2: Keep RLS enabled but allow all inserts (Recommended)
-- Comment out OPTION 1 above and use this instead:
/*
-- Drop all existing INSERT policies
DROP POLICY IF EXISTS "Allow trigger to insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles in their company" ON user_profiles;
DROP POLICY IF EXISTS "Company admins can insert profiles" ON user_profiles;

-- Create a single permissive INSERT policy
CREATE POLICY "Allow all authenticated inserts"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
*/

-- After running this, try creating a user again in the app
