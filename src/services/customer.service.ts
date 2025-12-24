// ============================================
// CUSTOMER SERVICE
// ============================================

import { Customer, CreateCustomerForm } from '@/types';

export class CustomerService {
  /**
   * Get all customers
   */
  static async getAll(filters?: {
    branch_id?: string;
    search?: string;
  }): Promise<Customer[]> {
    const { supabase } = await import('@/lib/supabase');
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    let query = supabase
      .from('customers')
      .select(`
        *,
        vehicles:vehicles(*)
      `)
      .order('created_at', { ascending: false });

    if (filters?.branch_id) {
      query = query.eq('branch_id', filters.branch_id);
    }
    if (filters?.search) {
      query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Customer[];
  }

  /**
   * Get customer by ID
   */
  static async getById(id: string): Promise<Customer> {
    const { supabase } = await import('@/lib/supabase');
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      .from('customers')
      .select(`
        *,
        vehicles:vehicles(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Customer;
  }

  /**
   * Create new customer
   */
  static async create(formData: CreateCustomerForm, userId: string, branchId?: string): Promise<Customer> {
    const { supabase } = await import('@/lib/supabase');
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      .from('customers')
      .insert({
        ...formData,
        branch_id: branchId,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data as Customer;
  }

  /**
   * Update customer
   */
  static async update(id: string, updates: Partial<Customer>): Promise<Customer> {
    const { supabase } = await import('@/lib/supabase');
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      .from('customers')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Customer;
  }

  /**
   * Delete customer
   */
  static async delete(id: string): Promise<void> {
    const { supabase } = await import('@/lib/supabase');
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

