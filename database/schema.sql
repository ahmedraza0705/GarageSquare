-- ============================================
-- GARAGE SQUARE DATABASE SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ROLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PERMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  display_name VARCHAR(200) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ROLE_PERMISSIONS (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- ============================================
-- BRANCHES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  address TEXT,
  phone VARCHAR(20),
  email VARCHAR(100),
  manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- USER_PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(200),
  phone VARCHAR(20),
  role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Auto-create profile for new auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  admin_role_id UUID;
  user_count BIGINT;
BEGIN
  -- Count existing profiles to detect first user
  SELECT COUNT(*) INTO user_count FROM user_profiles;
  
  -- Get company_admin role ID (may be null if roles not seeded)
  SELECT id INTO admin_role_id FROM roles WHERE name = 'company_admin' LIMIT 1;
  
  -- Insert into user_profiles
  INSERT INTO public.user_profiles (id, email, full_name, phone, role_id, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    CASE 
      WHEN user_count = 0 THEN admin_role_id  -- First user gets company_admin
      ELSE NULL  -- Other users get NULL (pending role assignment)
    END,
    true
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20) NOT NULL,
  address TEXT,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- VEHICLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER,
  vin VARCHAR(50) UNIQUE,
  license_plate VARCHAR(50),
  color VARCHAR(50),
  mileage INTEGER,
  notes TEXT,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- JOB_CARDS / WORK_ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS job_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  supervisor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(20) DEFAULT 'medium',
  description TEXT,
  estimated_cost DECIMAL(10, 2),
  actual_cost DECIMAL(10, 2),
  estimated_time INTEGER, -- in minutes
  actual_time INTEGER, -- in minutes
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SERVICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  base_price DECIMAL(10, 2),
  estimated_duration INTEGER, -- in minutes
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- JOB_CARD_SERVICES (Many-to-Many)
-- ============================================
CREATE TABLE IF NOT EXISTS job_card_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_card_id UUID REFERENCES job_cards(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10, 2),
  total_price DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_card_id UUID REFERENCES job_cards(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(20) DEFAULT 'medium',
  estimated_time INTEGER,
  actual_time INTEGER,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_card_id UUID REFERENCES job_cards(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  transaction_id VARCHAR(200),
  notes TEXT,
  processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT,
  type VARCHAR(50),
  related_type VARCHAR(50), -- 'job_card', 'payment', etc.
  related_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_role_id ON user_profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_branch_id ON user_profiles(branch_id);
CREATE INDEX IF NOT EXISTS idx_customers_branch_id ON customers(branch_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_customer_id ON vehicles(customer_id);
CREATE INDEX IF NOT EXISTS idx_job_cards_customer_id ON job_cards(customer_id);
CREATE INDEX IF NOT EXISTS idx_job_cards_vehicle_id ON job_cards(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_job_cards_branch_id ON job_cards(branch_id);
CREATE INDEX IF NOT EXISTS idx_job_cards_assigned_to ON job_cards(assigned_to);
CREATE INDEX IF NOT EXISTS idx_job_cards_status ON job_cards(status);
CREATE INDEX IF NOT EXISTS idx_tasks_job_card_id ON tasks(job_card_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(user_id, is_read);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_card_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ROLES POLICIES
-- ============================================
CREATE POLICY "Anyone can view roles"
  ON roles FOR SELECT
  USING (true);

-- ============================================
-- PERMISSIONS POLICIES
-- ============================================
CREATE POLICY "Anyone can view permissions"
  ON permissions FOR SELECT
  USING (true);

-- ============================================
-- ROLE_PERMISSIONS POLICIES
-- ============================================
CREATE POLICY "Anyone can view role_permissions"
  ON role_permissions FOR SELECT
  USING (true);

-- ============================================
-- BRANCHES POLICIES
-- ============================================
CREATE POLICY "Company admins can do everything"
  ON branches FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role_id = (SELECT id FROM roles WHERE name = 'company_admin')
    )
  );

CREATE POLICY "Managers can view their branch"
  ON branches FOR SELECT
  USING (
    id = (SELECT branch_id FROM user_profiles WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role_id = (SELECT id FROM roles WHERE name = 'company_admin')
    )
  );

-- ============================================
-- USER_PROFILES POLICIES
-- ============================================
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Company admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role_id = (SELECT id FROM roles WHERE name = 'company_admin')
    )
  );

CREATE POLICY "Managers can view profiles in their branch"
  ON user_profiles FOR SELECT
  USING (
    branch_id = (SELECT branch_id FROM user_profiles WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role_id = (SELECT id FROM roles WHERE name = 'company_admin')
    )
  );

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow insert of own profile (for manual creation if trigger not used)
CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- CUSTOMERS POLICIES
-- ============================================
CREATE POLICY "Company admins can do everything with customers"
  ON customers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role_id = (SELECT id FROM roles WHERE name = 'company_admin')
    )
  );

CREATE POLICY "Managers can manage customers in their branch"
  ON customers FOR ALL
  USING (
    branch_id = (SELECT branch_id FROM user_profiles WHERE id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role_id IN (
        SELECT id FROM roles WHERE name IN ('manager', 'supervisor', 'technician_group_manager')
      )
    )
  );

CREATE POLICY "Customers can view their own data"
  ON customers FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role_id IN (
        SELECT id FROM roles WHERE name IN ('company_admin', 'manager', 'supervisor', 'technician_group_manager')
      )
    )
  );

-- ============================================
-- VEHICLES POLICIES
-- ============================================
CREATE POLICY "Company admins can do everything with vehicles"
  ON vehicles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role_id = (SELECT id FROM roles WHERE name = 'company_admin')
    )
  );

CREATE POLICY "Managers can manage vehicles in their branch"
  ON vehicles FOR ALL
  USING (
    branch_id = (SELECT branch_id FROM user_profiles WHERE id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role_id IN (
        SELECT id FROM roles WHERE name IN ('manager', 'supervisor', 'technician_group_manager')
      )
    )
  );

CREATE POLICY "Customers can view their own vehicles"
  ON vehicles FOR SELECT
  USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role_id IN (
        SELECT id FROM roles WHERE name IN ('company_admin', 'manager', 'supervisor', 'technician_group_manager', 'technician')
      )
    )
  );

-- ============================================
-- JOB_CARDS POLICIES
-- ============================================
CREATE POLICY "Company admins can do everything with job cards"
  ON job_cards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role_id = (SELECT id FROM roles WHERE name = 'company_admin')
    )
  );

CREATE POLICY "Managers can manage job cards in their branch"
  ON job_cards FOR ALL
  USING (
    branch_id = (SELECT branch_id FROM user_profiles WHERE id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role_id IN (
        SELECT id FROM roles WHERE name IN ('manager', 'supervisor', 'technician_group_manager')
      )
    )
  );

CREATE POLICY "Supervisors can manage assigned job cards"
  ON job_cards FOR UPDATE
  USING (
    supervisor_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role_id IN (
        SELECT id FROM roles WHERE name IN ('company_admin', 'manager')
      )
    )
  );

CREATE POLICY "Technicians can view and update assigned job cards"
  ON job_cards FOR SELECT
  USING (
    assigned_to = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role_id IN (
        SELECT id FROM roles WHERE name IN ('company_admin', 'manager', 'supervisor', 'technician_group_manager')
      )
    )
  );

CREATE POLICY "Technicians can update assigned job cards"
  ON job_cards FOR UPDATE
  USING (
    assigned_to = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role_id IN (
        SELECT id FROM roles WHERE name IN ('company_admin', 'manager', 'supervisor', 'technician_group_manager')
      )
    )
  );

CREATE POLICY "Customers can view their own job cards"
  ON job_cards FOR SELECT
  USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role_id IN (
        SELECT id FROM roles WHERE name IN ('company_admin', 'manager', 'supervisor', 'technician_group_manager', 'technician')
      )
    )
  );

-- ============================================
-- TASKS POLICIES
-- ============================================
CREATE POLICY "Company admins can do everything with tasks"
  ON tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role_id = (SELECT id FROM roles WHERE name = 'company_admin')
    )
  );

CREATE POLICY "Technicians can update assigned tasks"
  ON tasks FOR UPDATE
  USING (
    assigned_to = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role_id IN (
        SELECT id FROM roles WHERE name IN ('company_admin', 'manager', 'supervisor', 'technician_group_manager')
      )
    )
  );

CREATE POLICY "Supervisors can manage tasks"
  ON tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN job_cards jc ON jc.supervisor_id = up.id
      WHERE up.id = auth.uid()
      AND jc.id = tasks.job_card_id
      AND up.role_id = (SELECT id FROM roles WHERE name = 'supervisor')
    )
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role_id IN (
        SELECT id FROM roles WHERE name IN ('company_admin', 'manager')
      )
    )
  );

-- ============================================
-- PAYMENTS POLICIES
-- ============================================
CREATE POLICY "Company admins can do everything with payments"
  ON payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role_id = (SELECT id FROM roles WHERE name = 'company_admin')
    )
  );

CREATE POLICY "Managers can manage payments in their branch"
  ON payments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM job_cards jc
      JOIN user_profiles up ON up.branch_id = jc.branch_id
      WHERE jc.id = payments.job_card_id
      AND up.id = auth.uid()
      AND up.role_id IN (
        SELECT id FROM roles WHERE name IN ('manager', 'supervisor')
      )
    )
  );

CREATE POLICY "Customers can view their own payments"
  ON payments FOR SELECT
  USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role_id IN (
        SELECT id FROM roles WHERE name IN ('company_admin', 'manager', 'supervisor')
      )
    )
  );

-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

-- ============================================
-- SEED DATA
-- ============================================

-- Insert Roles
INSERT INTO roles (name, display_name, description) VALUES
  ('company_admin', 'Company Admin', 'Full system access and control'),
  ('manager', 'Manager', 'Branch-level management and oversight'),
  ('supervisor', 'Supervisor', 'Job card and team control'),
  ('technician_group_manager', 'Technician Group Manager', 'Job assignment and team coordination'),
  ('technician', 'Technician', 'Task updates and job progress'),
  ('customer', 'Customer', 'View service history and bookings')
ON CONFLICT (name) DO NOTHING;

-- Insert Permissions
INSERT INTO permissions (name, display_name, resource, action, description) VALUES
  -- Company Admin permissions
  ('company_admin:all', 'Full Access', 'all', 'all', 'Complete system access'),
  
  -- Manager permissions
  ('manager:branches:view', 'View Branches', 'branches', 'view', 'View branch information'),
  ('manager:branches:manage', 'Manage Branches', 'branches', 'manage', 'Create and update branches'),
  ('manager:customers:view', 'View Customers', 'customers', 'view', 'View customer list'),
  ('manager:customers:manage', 'Manage Customers', 'customers', 'manage', 'Create and update customers'),
  ('manager:vehicles:view', 'View Vehicles', 'vehicles', 'view', 'View vehicle list'),
  ('manager:vehicles:manage', 'Manage Vehicles', 'vehicles', 'manage', 'Create and update vehicles'),
  ('manager:job_cards:view', 'View Job Cards', 'job_cards', 'view', 'View all job cards'),
  ('manager:job_cards:manage', 'Manage Job Cards', 'job_cards', 'manage', 'Create and update job cards'),
  ('manager:payments:view', 'View Payments', 'payments', 'view', 'View payment records'),
  ('manager:payments:manage', 'Manage Payments', 'payments', 'manage', 'Process payments'),
  ('manager:reports:view', 'View Reports', 'reports', 'view', 'View branch reports'),
  
  -- Supervisor permissions
  ('supervisor:job_cards:view', 'View Job Cards', 'job_cards', 'view', 'View assigned job cards'),
  ('supervisor:job_cards:manage', 'Manage Job Cards', 'job_cards', 'manage', 'Create and update job cards'),
  ('supervisor:tasks:view', 'View Tasks', 'tasks', 'view', 'View tasks'),
  ('supervisor:tasks:manage', 'Manage Tasks', 'tasks', 'manage', 'Assign and update tasks'),
  ('supervisor:team:view', 'View Team', 'team', 'view', 'View team members'),
  
  -- Technician Group Manager permissions
  ('technician_group_manager:job_cards:view', 'View Job Cards', 'job_cards', 'view', 'View job cards'),
  ('technician_group_manager:job_cards:assign', 'Assign Job Cards', 'job_cards', 'assign', 'Assign job cards to technicians'),
  ('technician_group_manager:tasks:view', 'View Tasks', 'tasks', 'view', 'View tasks'),
  ('technician_group_manager:tasks:assign', 'Assign Tasks', 'tasks', 'assign', 'Assign tasks to technicians'),
  
  -- Technician permissions
  ('technician:job_cards:view', 'View Job Cards', 'job_cards', 'view', 'View assigned job cards'),
  ('technician:tasks:view', 'View Tasks', 'tasks', 'view', 'View assigned tasks'),
  ('technician:tasks:update', 'Update Tasks', 'tasks', 'update', 'Update task progress'),
  ('technician:job_cards:update', 'Update Job Cards', 'job_cards', 'update', 'Update job card progress'),
  
  -- Customer permissions
  ('customer:profile:view', 'View Profile', 'profile', 'view', 'View own profile'),
  ('customer:vehicles:view', 'View Vehicles', 'vehicles', 'view', 'View own vehicles'),
  ('customer:job_cards:view', 'View Job Cards', 'job_cards', 'view', 'View own job cards'),
  ('customer:payments:view', 'View Payments', 'payments', 'view', 'View own payments')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles
-- Company Admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE name = 'company_admin'),
  id
FROM permissions
ON CONFLICT DO NOTHING;

-- Manager permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE name = 'manager'),
  id
FROM permissions
WHERE name LIKE 'manager:%'
ON CONFLICT DO NOTHING;

-- Supervisor permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE name = 'supervisor'),
  id
FROM permissions
WHERE name LIKE 'supervisor:%'
ON CONFLICT DO NOTHING;

-- Technician Group Manager permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE name = 'technician_group_manager'),
  id
FROM permissions
WHERE name LIKE 'technician_group_manager:%'
ON CONFLICT DO NOTHING;

-- Technician permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE name = 'technician'),
  id
FROM permissions
WHERE name LIKE 'technician:%'
ON CONFLICT DO NOTHING;

-- Customer permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE name = 'customer'),
  id
FROM permissions
WHERE name LIKE 'customer:%'
ON CONFLICT DO NOTHING;

-- Insert sample services
INSERT INTO services (name, description, category, base_price, estimated_duration) VALUES
  ('Oil Change', 'Standard engine oil change', 'Maintenance', 50.00, 30),
  ('Brake Inspection', 'Complete brake system inspection', 'Inspection', 75.00, 45),
  ('Tire Rotation', 'Rotate all four tires', 'Maintenance', 40.00, 30),
  ('Battery Replacement', 'Replace vehicle battery', 'Repair', 150.00, 60),
  ('AC Service', 'Air conditioning system service', 'Maintenance', 120.00, 90),
  ('Engine Diagnostic', 'Complete engine diagnostic scan', 'Diagnostic', 100.00, 60)
ON CONFLICT DO NOTHING;

