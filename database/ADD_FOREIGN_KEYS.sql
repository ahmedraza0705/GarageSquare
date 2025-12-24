-- ============================================
-- ADD FOREIGN KEY CONSTRAINTS
-- ============================================
-- Run this to fix the relationship error

-- Add foreign key from user_profiles to roles
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_role_id_fkey 
FOREIGN KEY (role_id) REFERENCES roles(id);

-- Add foreign key from user_profiles to branches
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_branch_id_fkey 
FOREIGN KEY (branch_id) REFERENCES branches(id);

-- Add foreign key from user_profiles to companies
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_company_id_fkey 
FOREIGN KEY (company_id) REFERENCES companies(id);

-- Add foreign key from user_profiles to auth.users
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add foreign key from branches to companies
ALTER TABLE branches 
ADD CONSTRAINT branches_company_id_fkey 
FOREIGN KEY (company_id) REFERENCES companies(id);

-- Verify the constraints were added
SELECT 
  conname as constraint_name,
  conrelid::regclass as table_name,
  confrelid::regclass as referenced_table
FROM pg_constraint
WHERE conrelid = 'user_profiles'::regclass
AND contype = 'f';

-- Done! Try creating a user now.
