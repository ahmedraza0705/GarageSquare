// ============================================
// CUSTOMER SERVICE (SUPABASE)
// ============================================

import { supabase } from '@/lib/supabase';
import { Customer, CreateCustomerForm } from '@/types';

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
      .select('*') // Simplified for debugging
      .order('created_at', { ascending: false });

    if (filters?.branch_id) {
      query = query.eq('branch_id', filters.branch_id);
    }

    if (filters?.search) {
      query = query.or(`full_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }

    return data as Customer[];
  }

  /**
   * Get total customer count
   */
  static async getCount() {
    if (!supabase) return 0;

    const { count, error } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.warn('Error fetching customer count:', JSON.stringify(error));
      return 0;
    }

    return count || 0;
  }

  /**
   * Get new customers count for current month
   */
  static async getNewCustomersCount(branchId?: string) {
    if (!supabase) return 0;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    let query = supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString());

    if (branchId) {
      query = query.eq('branch_id', branchId);
    }

    const { count, error } = await query;

    if (error) {
      console.error('Error fetching new customers count:', error);
      return 0;
    }

    return count || 0;
  }

  /**
   * Get customer by ID
   */
  static async getById(id: string) {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { data, error } = await supabase
      .from('customers')
      .select('*, vehicles(*)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching customer by ID:', error);
      throw error;
    }

    return data as Customer;
  }

  /**
   * Create new customer
   */
  static async create(formData: CreateCustomerForm, userId: string, branchId?: string) {
    if (!supabase) throw new Error('Supabase client not initialized');

    // Check if the user profile exists before setting it as created_by
    // to avoid foreign key constraint violations if the user was manually created in Auth
    // but not yet in user_profiles.
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    const insertData: any = {
      ...formData,
      user_id: userId, // Link to the user who created it
      branch_id: branchId || null,
    };

    console.log('Final Customer Insert Data:', insertData);

    if (profile) {
      insertData.created_by = userId;
    }

    const { data, error } = await supabase
      .from('customers')
      .insert([insertData])
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

    // Remove relations/read-only fields before update
    const { vehicles, id: _, created_at, updated_at, ...cleanUpdates } = updates as any;

    const { data, error } = await supabase
      .from('customers')
      .update({
        ...cleanUpdates,
        updated_at: new Date().toISOString(),
      })
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
