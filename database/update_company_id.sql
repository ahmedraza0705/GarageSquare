-- ============================================
-- UPDATE COMPANY_ID ACROSS TABLES
-- ============================================
-- This script helps you update company_id in vehicles, customers, and user_profiles tables
-- to link them to the correct company.

-- STEP 1: View all companies to identify the correct one
-- Run this first to see all companies and their IDs
SELECT 
    id as company_id,
    name as company_name,
    registry_number,
    created_at
FROM companies
ORDER BY created_at DESC;

-- STEP 2: View current company_id distribution
-- This shows how many records are linked to each company
SELECT 
    'user_profiles' as table_name,
    company_id,
    COUNT(*) as record_count
FROM user_profiles
GROUP BY company_id
UNION ALL
SELECT 
    'customers' as table_name,
    company_id,
    COUNT(*) as record_count
FROM customers
GROUP BY company_id
UNION ALL
SELECT 
    'vehicles' as table_name,
    company_id,
    COUNT(*) as record_count
FROM vehicles
GROUP BY company_id
ORDER BY table_name, company_id;

-- ============================================
-- STEP 3: UPDATE COMPANY_ID
-- ============================================
-- IMPORTANT: Replace 'YOUR_CORRECT_COMPANY_ID' with the actual company ID you want to use
-- You can get this ID from STEP 1 above

-- Option A: Update ALL records to a single company
-- Uncomment and modify the following lines:

/*
-- Set the correct company ID here
DO $$
DECLARE
    correct_company_id UUID := 'YOUR_CORRECT_COMPANY_ID'; -- REPLACE THIS
BEGIN
    -- Update user_profiles
    UPDATE user_profiles
    SET company_id = correct_company_id
    WHERE company_id IS NULL OR company_id != correct_company_id;
    
    RAISE NOTICE 'Updated % user_profiles', (SELECT COUNT(*) FROM user_profiles WHERE company_id = correct_company_id);
    
    -- Update customers
    UPDATE customers
    SET company_id = correct_company_id
    WHERE company_id IS NULL OR company_id != correct_company_id;
    
    RAISE NOTICE 'Updated % customers', (SELECT COUNT(*) FROM customers WHERE company_id = correct_company_id);
    
    -- Update vehicles
    UPDATE vehicles
    SET company_id = correct_company_id
    WHERE company_id IS NULL OR company_id != correct_company_id;
    
    RAISE NOTICE 'Updated % vehicles', (SELECT COUNT(*) FROM vehicles WHERE company_id = correct_company_id);
END $$;
*/

-- Option B: Update specific records by email/name
-- Uncomment and modify as needed:

/*
-- Update specific user by email
UPDATE user_profiles
SET company_id = 'YOUR_CORRECT_COMPANY_ID'
WHERE email = 'user@example.com';

-- Update specific customer by name
UPDATE customers
SET company_id = 'YOUR_CORRECT_COMPANY_ID'
WHERE full_name = 'Customer Name';

-- Update vehicles for a specific customer
UPDATE vehicles
SET company_id = 'YOUR_CORRECT_COMPANY_ID'
WHERE customer_id IN (
    SELECT id FROM customers WHERE company_id = 'YOUR_CORRECT_COMPANY_ID'
);
*/

-- ============================================
-- STEP 4: VERIFY THE UPDATES
-- ============================================
-- Run this to verify all records are now linked to the correct company

SELECT 
    'user_profiles' as table_name,
    up.email,
    up.full_name,
    up.company_id,
    c.name as company_name
FROM user_profiles up
LEFT JOIN companies c ON c.id = up.company_id
ORDER BY up.email;

SELECT 
    'customers' as table_name,
    cu.full_name,
    cu.email,
    cu.company_id,
    c.name as company_name
FROM customers cu
LEFT JOIN companies c ON c.id = cu.company_id
ORDER BY cu.full_name;

SELECT 
    'vehicles' as table_name,
    v.make,
    v.model,
    v.company_id,
    c.name as company_name,
    cu.full_name as customer_name
FROM vehicles v
LEFT JOIN companies c ON c.id = v.company_id
LEFT JOIN customers cu ON cu.id = v.customer_id
ORDER BY v.make, v.model;

-- ============================================
-- OPTIONAL: Delete unwanted companies
-- ============================================
-- If you want to delete the extra companies that were created by mistake
-- CAUTION: This will set company_id to NULL for all linked records

/*
-- First, check which companies you want to delete
SELECT id, name, created_at FROM companies;

-- Then delete the unwanted company (this will set company_id to NULL due to ON DELETE SET NULL)
DELETE FROM companies WHERE id = 'UNWANTED_COMPANY_ID';
*/
