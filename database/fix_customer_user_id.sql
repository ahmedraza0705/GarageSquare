-- ============================================
-- FIX CUSTOMER user_id VALUES
-- ============================================
-- This script fixes the issue where all customers have the same user_id

-- STEP 1: View current situation
-- See which customers have user_id set
SELECT 
    id,
    full_name,
    email,
    phone,
    user_id,
    created_at
FROM customers
ORDER BY created_at DESC;

-- STEP 2: Check if any of these customers actually have matching auth accounts
-- This will show if any customer emails match user_profile emails
SELECT 
    c.id as customer_id,
    c.full_name as customer_name,
    c.email as customer_email,
    c.user_id as current_user_id,
    up.id as matching_user_id,
    up.email as user_email
FROM customers c
LEFT JOIN user_profiles up ON LOWER(c.email) = LOWER(up.email)
WHERE c.email IS NOT NULL AND c.email != ''
ORDER BY c.full_name;

-- ============================================
-- STEP 3: FIX THE user_id VALUES
-- ============================================

-- Option A: Set all user_id to NULL (recommended for walk-in customers)
-- This is the safest option - customers don't need user_id unless they have login accounts

UPDATE customers
SET user_id = NULL
WHERE user_id IS NOT NULL;

-- Verify the update
SELECT COUNT(*) as customers_with_null_user_id
FROM customers
WHERE user_id IS NULL;

-- Option B: Link customers to their auth accounts based on email match
-- Only use this if you want to link customers who have matching email addresses

/*
UPDATE customers c
SET user_id = up.id
FROM user_profiles up
WHERE LOWER(c.email) = LOWER(up.email)
  AND c.email IS NOT NULL
  AND c.email != '';

-- Set user_id to NULL for customers without matching auth accounts
UPDATE customers
SET user_id = NULL
WHERE user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM user_profiles up
    WHERE LOWER(customers.email) = LOWER(up.email)
  );
*/

-- ============================================
-- STEP 4: VERIFY THE FIX
-- ============================================

-- Check the distribution of user_id values
SELECT 
    CASE 
        WHEN user_id IS NULL THEN 'NULL (No auth account)'
        ELSE 'Has auth account'
    END as user_id_status,
    COUNT(*) as count
FROM customers
GROUP BY user_id_status;

-- View all customers with their user_id status
SELECT 
    c.full_name,
    c.email,
    c.phone,
    CASE 
        WHEN c.user_id IS NULL THEN 'No auth account'
        ELSE 'Linked to: ' || up.email
    END as account_status
FROM customers c
LEFT JOIN user_profiles up ON c.user_id = up.id
ORDER BY c.full_name;
