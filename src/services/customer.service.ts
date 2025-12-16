// ============================================
// CUSTOMER SERVICE (MOCK)
// ============================================



import { supabase } from '@/lib/supabase';
import { Customer, CreateCustomerForm, Vehicle } from '@/types';

export class CustomerService {
  /**
   * Get all customers
   */
  static async getAll(filters?: {
    branch_id?: string;
    search?: string;
  }) {
    if (!supabase) throw new Error('Supabase client not initialized');

    let query = supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.search) {
      query = query.or(`full_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    if (filters?.branch_id) {
      query = query.eq('branch_id', filters.branch_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }

    return data as Customer[];
  }

  /**
   * Get customer by ID with vehicles
   */
  static async getById(id: string) {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { data, error } = await supabase
      .from('customers')
      .select('*, vehicles(*)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching customer:', error);
      throw error;
    }

    return data as Customer;
  }

  /**
   * Create new customer
   */
  static async create(formData: CreateCustomerForm, userId: string, branchId?: string) {
    if (!supabase) throw new Error('Supabase client not initialized');

    const newCustomer = {
      ...formData,
      created_by: userId,
      branch_id: branchId,
    };

    const { data, error } = await supabase
      .from('customers')
      .insert(newCustomer)
      .select()
      .single();

    if (error) {
      console.error('Error creating customer:', error);
      throw error;
    }

    return data as Customer;
  }

  /**
   * Update customer
   */
  static async update(id: string, updates: Partial<Customer>) {
    if (!supabase) throw new Error('Supabase client not initialized');

    // Remove fields that shouldn't be updated directly or are read-only
    const { vehicles, ...updateData } = updates;

    const { data, error } = await supabase
      .from('customers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating customer:', error);
      throw error;
    }

    return data as Customer;
  }

  /**
   * Delete customer
   */
  static async delete(id: string) {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }
}

