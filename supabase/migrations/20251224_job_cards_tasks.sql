-- ==========================================
-- JOB CARDS & TASKS SCHEMA MIGRATION
-- ==========================================

-- 1. Create job_cards table
CREATE TABLE IF NOT EXISTS public.job_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    
    -- Status and Priority
    status TEXT NOT NULL DEFAULT 'pending', -- pending, active, urgent, progress, done, completed, delivered
    priority TEXT NOT NULL DEFAULT 'Normal', -- Normal, Urgent
    
    -- Estimation & Details
    estimated_cost NUMERIC DEFAULT 0,
    estimated_time TEXT,
    description TEXT,
    odometer INT,
    
    -- Address Details for Delivery/Pick-up
    pickup_address TEXT,
    dropoff_address TEXT,
    delivery_date TEXT,
    delivery_due TEXT,
    other_requirements TEXT,
    
    -- Progress Tracking Flags
    work_completed BOOLEAN DEFAULT FALSE,
    quality_check_completed BOOLEAN DEFAULT FALSE,
    delivery_completed BOOLEAN DEFAULT FALSE,
    
    -- Technician Assignment
    assigned_tech_name TEXT, -- Keeping as text as per user requirement to keep simple technician manager/staff labels
    assigned_to UUID REFERENCES public.staff(id), 
    
    -- Persisted JSON for Task & Quality Statuses (Mirroring current context logic)
    task_statuses JSONB DEFAULT '{}'::jsonb,
    quality_statuses JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 2. Create tasks table (for granular service/task management)
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_card_id UUID REFERENCES public.job_cards(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, complete, rejected
    cost NUMERIC DEFAULT 0,
    estimate TEXT,
    assigned_tech_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS
ALTER TABLE public.job_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies (Basic access for authenticated users)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable all for authenticated users' AND tablename = 'job_cards') THEN
        CREATE POLICY "Enable all for authenticated users" ON public.job_cards FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable all for authenticated users' AND tablename = 'tasks') THEN
        CREATE POLICY "Enable all for authenticated users" ON public.tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 5. Helper Function to generate Job Numbers (SA0001 format)
CREATE OR REPLACE FUNCTION generate_job_number()
RETURNS TEXT AS $$
DECLARE
    next_val INT;
    result TEXT;
BEGIN
    SELECT COALESCE(COUNT(*), 0) + 1 INTO next_val FROM public.job_cards;
    result := 'SA' || LPAD(next_val::TEXT, 4, '0');
    RETURN result;
END;
$$ LANGUAGE plpgsql;
