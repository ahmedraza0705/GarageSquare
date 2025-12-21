-- ============================================
-- INVOICES & ESTIMATES SCHEMA EXTENSION
-- For GarageSquare Invoice Management
-- ============================================

-- ============================================
-- INVOICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  invoice_type VARCHAR(20) NOT NULL CHECK (invoice_type IN ('estimate', 'invoice')),
  job_card_id UUID, -- Optional reference to job_cards (no FK constraint)
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  
  -- Financial Details
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5, 2) DEFAULT 10.00, -- Tax percentage (e.g., 10%)
  cgst DECIMAL(12, 2) DEFAULT 0, -- Central GST
  sgst DECIMAL(12, 2) DEFAULT 0, -- State GST
  igst DECIMAL(12, 2) DEFAULT 0, -- Integrated GST
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  discount_percentage DECIMAL(5, 2) DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  
  -- Status & Tracking
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'approved', 'rejected', 'converted', 'paid', 'cancelled')),
  payment_status VARCHAR(50) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'refunded')),
  
  -- Dates
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  converted_to_invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL, -- For estimates converted to invoices
  converted_at TIMESTAMP WITH TIME ZONE,
  
  -- Notes & Additional Info
  notes TEXT,
  terms_and_conditions TEXT,
  
  -- Audit Fields
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INVOICE_ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  service_id UUID, -- Optional reference to services (no FK constraint)
  
  -- Item Details
  item_name VARCHAR(200) NOT NULL,
  description TEXT,
  item_type VARCHAR(50) DEFAULT 'service' CHECK (item_type IN ('service', 'part', 'labour', 'other')),
  
  -- Pricing
  quantity DECIMAL(10, 2) DEFAULT 1,
  unit_price DECIMAL(12, 2) NOT NULL,
  discount_percentage DECIMAL(5, 2) DEFAULT 0,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  tax_percentage DECIMAL(5, 2) DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  total_price DECIMAL(12, 2) NOT NULL,
  
  -- Audit Fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR INVOICES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_vehicle_id ON invoices(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_invoices_branch_id ON invoices(branch_id);
CREATE INDEX IF NOT EXISTS idx_invoices_job_card_id ON invoices(job_card_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_type ON invoices(invoice_type);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_status ON invoices(payment_status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- ============================================
-- SECURITY DEFINER HELPER FUNCTIONS
-- ============================================
-- These functions bypass RLS to prevent infinite recursion

-- Function to check if user is a company admin
CREATE OR REPLACE FUNCTION public.is_company_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = user_id
    AND role_id = (SELECT id FROM roles WHERE name = 'company_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's branch ID
CREATE OR REPLACE FUNCTION public.get_user_branch_id(user_id UUID DEFAULT auth.uid())
RETURNS UUID AS $$
DECLARE
  branch_id_val UUID;
BEGIN
  SELECT branch_id INTO branch_id_val
  FROM user_profiles
  WHERE id = user_id;
  
  RETURN branch_id_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has specific role(s)
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, role_names TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN roles r ON up.role_id = r.id
    WHERE up.id = user_id
    AND r.name = ANY(role_names)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is a customer with specific customer_id
CREATE OR REPLACE FUNCTION public.is_customer_owner(user_id UUID, customer_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM customers
    WHERE id = customer_id_param
    AND user_id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_company_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_branch_id(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_customer_owner(UUID, UUID) TO authenticated;

-- ============================================
-- ROW LEVEL SECURITY FOR INVOICES
-- ============================================
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Company admins can do everything with invoices
CREATE POLICY "Company admins can do everything with invoices"
  ON invoices FOR ALL
  USING (public.is_company_admin(auth.uid()));

-- Managers can manage invoices in their branch
CREATE POLICY "Managers can manage invoices in their branch"
  ON invoices FOR ALL
  USING (
    branch_id = public.get_user_branch_id(auth.uid())
    AND public.has_role(auth.uid(), ARRAY['manager', 'supervisor'])
  );

-- Customers can view their own invoices
CREATE POLICY "Customers can view their own invoices"
  ON invoices FOR SELECT
  USING (
    public.is_customer_owner(auth.uid(), customer_id)
    OR public.has_role(auth.uid(), ARRAY['company_admin', 'manager', 'supervisor'])
  );

-- Invoice Items Policies
CREATE POLICY "Company admins can do everything with invoice items"
  ON invoice_items FOR ALL
  USING (public.is_company_admin(auth.uid()));

CREATE POLICY "Managers can manage invoice items in their branch"
  ON invoice_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM invoices i
      WHERE i.id = invoice_items.invoice_id
      AND i.branch_id = public.get_user_branch_id(auth.uid())
    )
    AND public.has_role(auth.uid(), ARRAY['manager', 'supervisor'])
  );

CREATE POLICY "Customers can view their own invoice items"
  ON invoice_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM invoices i
      WHERE i.id = invoice_items.invoice_id
      AND public.is_customer_owner(auth.uid(), i.customer_id)
    )
    OR public.has_role(auth.uid(), ARRAY['company_admin', 'manager', 'supervisor'])
  );

-- ============================================
-- FUNCTIONS FOR INVOICE MANAGEMENT
-- ============================================

-- Function to auto-generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number(invoice_type_param VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
  prefix VARCHAR(10);
  next_number INTEGER;
  new_invoice_number VARCHAR(50);
BEGIN
  -- Set prefix based on type
  IF invoice_type_param = 'estimate' THEN
    prefix := 'EST';
  ELSE
    prefix := 'INV';
  END IF;
  
  -- Get the next number
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO next_number
  FROM invoices
  WHERE invoice_number LIKE prefix || '-%';
  
  -- Generate new invoice number
  new_invoice_number := prefix || '-' || LPAD(next_number::TEXT, 4, '0');
  
  RETURN new_invoice_number;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate invoice totals
CREATE OR REPLACE FUNCTION calculate_invoice_totals()
RETURNS TRIGGER AS $$
DECLARE
  invoice_subtotal DECIMAL(12, 2);
  invoice_tax_amount DECIMAL(12, 2);
  invoice_total DECIMAL(12, 2);
BEGIN
  -- Calculate subtotal from invoice items
  SELECT COALESCE(SUM(total_price), 0)
  INTO invoice_subtotal
  FROM invoice_items
  WHERE invoice_id = NEW.id;
  
  -- Calculate tax (split equally between CGST and SGST)
  invoice_tax_amount := (invoice_subtotal * NEW.tax_rate / 100);
  
  -- Update invoice totals
  UPDATE invoices
  SET 
    subtotal = invoice_subtotal,
    cgst = invoice_tax_amount / 2,
    sgst = invoice_tax_amount / 2,
    total_amount = invoice_subtotal + invoice_tax_amount - COALESCE(discount_amount, 0),
    updated_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to recalculate invoice totals when items change
CREATE OR REPLACE TRIGGER recalculate_invoice_totals
AFTER INSERT OR UPDATE OR DELETE ON invoice_items
FOR EACH ROW
EXECUTE FUNCTION calculate_invoice_totals();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_items_updated_at
BEFORE UPDATE ON invoice_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA FOR TESTING
-- ============================================

-- Note: This will be populated with real data through the app
-- The static data in the Invoice screen will be replaced with queries to this table
