// ============================================
// TYPE DEFINITIONS
// ============================================

export type RoleName =
  | 'company_admin'
  | 'manager'
  | 'supervisor'
  | 'technician_group_manager'
  | 'technician'
  | 'customer';

export type JobCardStatus =
  | 'pending'
  | 'in_progress'
  | 'on_hold'
  | 'completed'
  | 'cancelled';

export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'blocked';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'mobile_payment';

// = : ===========================================
// DATABASE MODELS
// ============================================

export interface Company {
  id: string;
  name: string;
  registry_number?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  is_active: boolean;
  onboarding_completed?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: RoleName;
  display_name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  name: string;
  display_name: string;
  resource: string;
  action: string;
  description?: string;
  created_at: string;
}



export interface Branch {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  location?: string;
  manager_id?: string;
  company_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  company_id?: string;
  branch_id?: string;
  role_id: string | null;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  username?: string;
  created_by?: string;
  deactivated_at?: string;
  deactivated_by?: string;
  country?: string;
  registry_number?: string;
  zip_code?: string;
  role?: Role;
  branch?: Branch;
  company?: Company;
}

export interface Staff {
  id: string;
  email: string;
  name: string;
  username?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Staff {
  id: string;
  email: string;
  name: string;
  username?: string;
  phone?: string;
}

export interface Customer {
  id: string;
  email?: string;
  address?: string;
  full_name: string;
  username?: string;
  phone: string;
  alt_phone?: string;
  vehicles?: Vehicle[];
}

export interface Vehicle {
  id: string;
  customer_id: string;
  brand: string;
  model: string;
  year_manufacture?: number;
  vin?: string;
  license_plate?: string;
  color?: string;
  odometer?: number;
  fuel_type?: string;
  year_purchase?: number;
  delivery_type?: string;
  branch_id?: string;
  branch_name?: string;
  last_visit?: string;
  created_at: string;
  updated_at: string;
  branch?: { name: string };
  customer?: Customer;
  services?: VehicleServiceItem[];
}

export type VehicleServiceStatus = 'pending' | 'completed' | 'need_approval' | 'rejected';

export interface VehicleServiceItem {
  id: string;
  name: string;
  status: VehicleServiceStatus;
  assigned_to?: string;
  estimate?: string; // e.g., "20 min", "1 hour"
  created_at: string;
}

export interface JobCard {
  id: string;
  job_number: string;
  customer_id: string;
  vehicle_id: string;
  branch_id: string;
  assigned_to?: string;
  supervisor_id?: string;
  status: JobCardStatus;
  priority: Priority;
  description?: string;
  estimated_cost?: number;
  actual_cost?: number;
  estimated_time?: number;
  actual_time?: number;
  started_at?: string;
  completed_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  vehicle?: Vehicle;
  assigned_user?: UserProfile;
  supervisor?: UserProfile;
  services?: JobCardServiceItem[];
  tasks?: Task[];
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  category?: string;
  base_price: number;
  estimated_duration?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface JobCardServiceItem {
  id: string;
  job_card_id: string;
  service_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: TaskStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  service?: Service;
}

export interface Task {
  id: string;
  job_card_id: string;
  service_id?: string;
  title: string;
  description?: string;
  assigned_to?: string;
  status: TaskStatus;
  priority: Priority;
  estimated_time?: number;
  actual_time?: number;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  assigned_user?: UserProfile;
  service?: Service;
}

export interface Payment {
  id: string;
  job_card_id: string;
  customer_id: string;
  amount: number;
  payment_method?: PaymentMethod;
  status: PaymentStatus;
  transaction_id?: string;
  notes?: string;
  processed_by?: string;
  created_at: string;
  updated_at: string;
  job_card?: JobCard;
  customer?: Customer;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message?: string;
  type?: string;
  related_type?: string;
  related_id?: string;
  is_read: boolean;
  created_at: string;
}

// ============================================
// AUTH TYPES
// ============================================

export interface AuthUser {
  id: string;
  email: string;
  profile?: UserProfile;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role_id?: string;
  branch_id?: string;
  company_id?: string;
}

// ============================================
// FORM TYPES
// ============================================

export interface CreateCustomerForm {
  full_name: string;
  email?: string;
  phone: string;
  address?: string;
}

export interface CreateVehicleForm {
  customer_id: string;
  brand: string;
  model: string;
  year_manufacture?: number;
  license_plate?: string;
  color?: string;
  odometer?: number;
  fuel_type?: string;
  year_purchase?: number;
  delivery_type?: string;
}

export interface CreateJobCardForm {
  customer_id: string;
  vehicle_id: string;
  description?: string;
  priority: Priority;
  estimated_cost?: number;
  estimated_time?: number;
  service_ids?: string[];
}

export interface UpdateTaskForm {
  status: TaskStatus;
  actual_time?: number;
  notes?: string;
}

// ============================================
// INVENTORY MANAGEMENT TYPES
// ============================================

export interface InventoryCategory {
  id: string;
  company_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  company_id: string;
  category_id?: string;
  name: string;
  sku: string;
  unit_price: number;
  low_stock_threshold: number;
  unit: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: InventoryCategory;
}

export interface InventoryStock {
  id: string;
  item_id: string;
  branch_id: string;
  quantity: number;
  updated_at: string;
  item?: InventoryItem;
  branch?: Branch;
}

export type TransactionType = 'IN' | 'OUT' | 'ADJUST';

export interface InventoryTransaction {
  id: string;
  item_id: string;
  branch_id: string;
  type: TransactionType;
  quantity: number;
  reference?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  item?: InventoryItem;
  branch?: Branch;
}

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface InventoryItemWithStock extends InventoryItem {
  stock_quantity: number;
  total_value: number;
  stock_status: StockStatus;
  branch_id?: string;
}

export interface CreateInventoryItemData {
  company_id: string;
  category_id?: string;
  name: string;
  sku: string;
  unit_price: number;
  low_stock_threshold?: number;
  unit: string;
  description?: string;
  initial_quantity?: number;
  branch_id?: string;
}

export interface UpdateInventoryItemData {
  category_id?: string;
  name?: string;
  sku?: string;
  unit_price?: number;
  low_stock_threshold?: number;
  unit?: string;
  description?: string;
  is_active?: boolean;
}

export interface CreateTransactionData {
  item_id: string;
  branch_id: string;
  type: TransactionType;
  quantity: number;
  reference?: string;
  notes?: string;
}

export interface InventoryValueBreakdown {
  item_id: string;
  item_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  total_value: number;
  unit: string;
}
