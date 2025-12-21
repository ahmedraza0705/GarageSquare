-- ============================================
-- INVENTORY MANAGEMENT SYSTEM - DATABASE MIGRATION
-- ============================================
-- This migration creates 5 new tables for inventory management
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE 1: INVENTORY CATEGORIES
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, name)
);

-- ============================================
-- TABLE 2: INVENTORY ITEMS (Core Master Data)
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  category_id UUID REFERENCES inventory_categories(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  sku VARCHAR(100) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER NOT NULL DEFAULT 10,
  unit VARCHAR(50) NOT NULL DEFAULT 'piece',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, sku)
);

-- ============================================
-- TABLE 3: INVENTORY STOCK (Branch-Wise Quantities)
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_stock (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(item_id, branch_id)
);

-- ============================================
-- TABLE 4: INVENTORY TRANSACTIONS (Audit Trail)
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('IN', 'OUT', 'ADJUST')),
  quantity INTEGER NOT NULL,
  reference VARCHAR(200),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_inventory_categories_company_id ON inventory_categories(company_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_company_id ON inventory_items(company_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_category_id ON inventory_items(category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON inventory_items(company_id, sku);
CREATE INDEX IF NOT EXISTS idx_inventory_stock_item_id ON inventory_stock(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_stock_branch_id ON inventory_stock(branch_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_item_id ON inventory_transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_branch_id ON inventory_transactions(branch_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_created_at ON inventory_transactions(created_at DESC);

-- ============================================
-- TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- ============================================

-- Trigger for inventory_categories
DROP TRIGGER IF EXISTS update_inventory_categories_updated_at ON inventory_categories;
CREATE TRIGGER update_inventory_categories_updated_at
  BEFORE UPDATE ON inventory_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for inventory_items
DROP TRIGGER IF EXISTS update_inventory_items_updated_at ON inventory_items;
CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for inventory_stock
DROP TRIGGER IF EXISTS update_inventory_stock_updated_at ON inventory_stock;
CREATE TRIGGER update_inventory_stock_updated_at
  BEFORE UPDATE ON inventory_stock
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES: INVENTORY_CATEGORIES
-- ============================================

-- Company admins can do everything with categories
DROP POLICY IF EXISTS "Company admins can manage categories" ON inventory_categories;
CREATE POLICY "Company admins can manage categories"
  ON inventory_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role_id = (SELECT id FROM roles WHERE name = 'company_admin')
    )
  );

-- Managers can view categories in their company
DROP POLICY IF EXISTS "Managers can view categories" ON inventory_categories;
CREATE POLICY "Managers can view categories"
  ON inventory_categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN branches b ON b.id = up.branch_id
      WHERE up.id = auth.uid()
      AND b.company_id = inventory_categories.company_id
      AND up.role_id IN (SELECT id FROM roles WHERE name IN ('manager', 'supervisor', 'technician'))
    )
  );

-- ============================================
-- RLS POLICIES: INVENTORY_ITEMS
-- ============================================

-- Company admins can do everything with items
DROP POLICY IF EXISTS "Company admins can manage items" ON inventory_items;
CREATE POLICY "Company admins can manage items"
  ON inventory_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role_id = (SELECT id FROM roles WHERE name = 'company_admin')
    )
  );

-- Managers can manage items in their company
DROP POLICY IF EXISTS "Managers can manage items" ON inventory_items;
CREATE POLICY "Managers can manage items"
  ON inventory_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN branches b ON b.id = up.branch_id
      WHERE up.id = auth.uid()
      AND b.company_id = inventory_items.company_id
      AND up.role_id IN (SELECT id FROM roles WHERE name IN ('manager', 'supervisor'))
    )
  );

-- Technicians can view items in their company
DROP POLICY IF EXISTS "Technicians can view items" ON inventory_items;
CREATE POLICY "Technicians can view items"
  ON inventory_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN branches b ON b.id = up.branch_id
      WHERE up.id = auth.uid()
      AND b.company_id = inventory_items.company_id
      AND up.role_id = (SELECT id FROM roles WHERE name = 'technician')
    )
  );

-- ============================================
-- RLS POLICIES: INVENTORY_STOCK
-- ============================================

-- Company admins can do everything with stock
DROP POLICY IF EXISTS "Company admins can manage stock" ON inventory_stock;
CREATE POLICY "Company admins can manage stock"
  ON inventory_stock FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role_id = (SELECT id FROM roles WHERE name = 'company_admin')
    )
  );

-- Managers can manage stock in their branch
DROP POLICY IF EXISTS "Managers can manage stock in their branch" ON inventory_stock;
CREATE POLICY "Managers can manage stock in their branch"
  ON inventory_stock FOR ALL
  USING (
    branch_id = (SELECT branch_id FROM user_profiles WHERE id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role_id IN (SELECT id FROM roles WHERE name IN ('manager', 'supervisor'))
    )
  );

-- Technicians can view stock in their branch
DROP POLICY IF EXISTS "Technicians can view stock in their branch" ON inventory_stock;
CREATE POLICY "Technicians can view stock in their branch"
  ON inventory_stock FOR SELECT
  USING (
    branch_id = (SELECT branch_id FROM user_profiles WHERE id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role_id = (SELECT id FROM roles WHERE name = 'technician')
    )
  );

-- ============================================
-- RLS POLICIES: INVENTORY_TRANSACTIONS
-- ============================================

-- Company admins can view all transactions
DROP POLICY IF EXISTS "Company admins can view transactions" ON inventory_transactions;
CREATE POLICY "Company admins can view transactions"
  ON inventory_transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role_id = (SELECT id FROM roles WHERE name = 'company_admin')
    )
  );

-- Managers can view and create transactions in their branch
DROP POLICY IF EXISTS "Managers can manage transactions in their branch" ON inventory_transactions;
CREATE POLICY "Managers can manage transactions in their branch"
  ON inventory_transactions FOR ALL
  USING (
    branch_id = (SELECT branch_id FROM user_profiles WHERE id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role_id IN (SELECT id FROM roles WHERE name IN ('manager', 'supervisor'))
    )
  );

-- Technicians can view transactions in their branch
DROP POLICY IF EXISTS "Technicians can view transactions in their branch" ON inventory_transactions;
CREATE POLICY "Technicians can view transactions in their branch"
  ON inventory_transactions FOR SELECT
  USING (
    branch_id = (SELECT branch_id FROM user_profiles WHERE id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role_id = (SELECT id FROM roles WHERE name = 'technician')
    )
  );

-- ============================================
-- HELPER FUNCTION: Get User's Company ID
-- ============================================
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
DECLARE
  v_company_id UUID;
BEGIN
  SELECT b.company_id INTO v_company_id
  FROM user_profiles up
  JOIN branches b ON b.id = up.branch_id
  WHERE up.id = auth.uid()
  LIMIT 1;
  
  RETURN v_company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON TABLE inventory_categories IS 'Organizes inventory items into logical groups (Oil, Parts, Tools, etc.)';
COMMENT ON TABLE inventory_items IS 'Master data defining inventory items with pricing and thresholds';
COMMENT ON TABLE inventory_stock IS 'Tracks actual stock quantities per branch';
COMMENT ON TABLE inventory_transactions IS 'Audit trail of all stock movements (IN/OUT/ADJUST)';

COMMENT ON COLUMN inventory_items.sku IS 'Stock Keeping Unit - must be unique per company';
COMMENT ON COLUMN inventory_items.low_stock_threshold IS 'Alert when quantity falls below this value';
COMMENT ON COLUMN inventory_stock.quantity IS 'Current stock level - updated via transactions';
COMMENT ON COLUMN inventory_transactions.type IS 'Transaction type: IN (received), OUT (used), ADJUST (correction)';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Next steps:
-- 1. Verify tables created: SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'inventory%';
-- 2. Check RLS policies in Supabase Dashboard
-- 3. Insert test categories and items
-- ============================================
