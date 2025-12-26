-- Ensure tasks table has cost and estimate columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'cost') THEN
        ALTER TABLE public.tasks ADD COLUMN cost NUMERIC DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tasks' AND column_name = 'estimate') THEN
        ALTER TABLE public.tasks ADD COLUMN estimate TEXT;
    END IF;
END $$;
