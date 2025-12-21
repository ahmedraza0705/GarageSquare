-- ============================================
-- INVENTORY SEED DATA
-- ============================================
-- This script creates initial categories for your inventory system
-- It automatically detects your company_id
-- ============================================

-- Step 1: Create categories using the first company in the database
DO $$
DECLARE
  v_company_id UUID;
BEGIN
  -- Get the first company ID (or you can specify a specific company name)
  SELECT id INTO v_company_id FROM companies LIMIT 1;
  
  -- Check if company exists
  IF v_company_id IS NULL THEN
    RAISE EXCEPTION 'No company found in database. Please create a company first.';
  END IF;
  
  -- Insert default categories
  INSERT INTO inventory_categories (company_id, name, description) VALUES
    (v_company_id, 'Oil & Lubricants', 'Engine oils, transmission fluids, gear oils'),
    (v_company_id, 'Brake Parts', 'Brake pads, rotors, calipers, brake fluid'),
    (v_company_id, 'Filters', 'Air filters, oil filters, fuel filters, cabin filters'),
    (v_company_id, 'Electrical', 'Batteries, spark plugs, sensors, alternators'),
    (v_company_id, 'Tools & Equipment', 'Diagnostic tools, wrenches, jacks, scanners'),
    (v_company_id, 'Consumables', 'Cleaning supplies, washer fluid, grease, coolant'),
    (v_company_id, 'Engine Parts', 'Belts, hoses, gaskets, timing components'),
    (v_company_id, 'Suspension', 'Shocks, struts, bushings, control arms'),
    (v_company_id, 'Tires & Wheels', 'Tires, wheels, valve stems, wheel weights')
  ON CONFLICT (company_id, name) DO NOTHING;
  
  RAISE NOTICE 'Successfully created categories for company ID: %', v_company_id;
END $$;

-- Verify categories were created
SELECT 
  c.name as company_name,
  ic.name as category_name,
  ic.description
FROM inventory_categories ic
JOIN companies c ON c.id = ic.company_id
ORDER BY ic.name;
