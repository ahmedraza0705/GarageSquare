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

// ============================================
// DATABASE MODELS
// ============================================

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
  manager_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role_id: string | null;
  branch_id?: string;
  avatar_url?: string;
  username?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  role?: Role;
  branch?: Branch;
}

export interface Customer {
  id: string;
  user_id?: string;
  full_name: string;
  email?: string;
  phone: string;
  address?: string;
  branch_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  vehicles?: Vehicle[];
}

export interface Vehicle {
  id: string;
  customer_id: string;
  make: string;
  model: string;
  year?: number;
  vin?: string;
  license_plate?: string;
  color?: string;
  mileage?: number;
  notes?: string;
  branch_id?: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
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
  services?: JobCardService[];
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

export interface JobCardService {
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
  make: string;
  model: string;
  year?: number;
  vin?: string;
  license_plate?: string;
  color?: string;
  mileage?: number;
  notes?: string;
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

