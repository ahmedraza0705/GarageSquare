-- Add missing columns to job_card_services for manual entry support
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'job_card_services' AND column_name = 'custom_service_name') THEN
        ALTER TABLE public.job_card_services ADD COLUMN custom_service_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'job_card_services' AND column_name = 'estimate') THEN
        ALTER TABLE public.job_card_services ADD COLUMN estimate TEXT;
    END IF;
END $$;
