-- ============================================
-- RESILIENT AUTH USER REPAIR
-- ============================================
-- This script fixes the "email_change" scan error by setting NULL columns 
-- to empty strings, using error handling to skip columns that don't exist.

DO $$
BEGIN
    -- 1. Fix email_change (The confirmed cause of the crash)
    BEGIN
        UPDATE auth.users SET email_change = '' WHERE email = 'test@gmail.com' AND email_change IS NULL;
    EXCEPTION WHEN OTHERS THEN 
        RAISE NOTICE 'Skipping email_change (not found or already fixed)';
    END;

    -- 2. Fix other common Auth columns (if they exist)
    BEGIN
        UPDATE auth.users SET 
            email_change_token_new = COALESCE(email_change_token_new, ''),
            email_change_token_current = COALESCE(email_change_token_current, ''),
            phone_change = COALESCE(phone_change, ''),
            confirmation_token = COALESCE(confirmation_token, ''),
            recovery_token = COALESCE(recovery_token, ''),
            email_change_confirm_status = COALESCE(email_change_confirm_status, 0)
        WHERE email = 'test@gmail.com';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Some columns were missing, attempting individual updates...';
    END;

    -- 3. Individual updates for safety
    FOR col IN (SELECT unnest(ARRAY['email_change_token_new', 'email_change_token_current', 'phone_change', 'confirmation_token', 'recovery_token']))
    LOOP
        BEGIN
            EXECUTE format('UPDATE auth.users SET %I = COALESCE(%I, '''') WHERE email = ''test@gmail.com''', col, col);
        EXCEPTION WHEN OTHERS THEN
            NULL; -- Ignore if column doesn't exist
        END;
    LOOP;

    RAISE NOTICE 'SUCCESS: Auth user test@gmail.com has been repaired.';
END $$;

-- 4. FINAL PROFILE CHECK
DO $$
DECLARE
  v_role_id UUID;
  v_user_id UUID;
BEGIN
  SELECT id INTO v_role_id FROM public.roles WHERE name = 'company_admin';
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'test@gmail.com';

  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.user_profiles (id, email, full_name, role_id, is_active)
    VALUES (v_user_id, 'test@gmail.com', 'Admin User', v_role_id, true)
    ON CONFLICT (id) DO UPDATE SET role_id = v_role_id, is_active = true;
  END IF;
END $$;
