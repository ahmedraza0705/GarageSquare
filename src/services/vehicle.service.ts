// ============================================
// VEHICLE SERVICE
// ============================================

import { supabase } from '@/lib/supabase';
import { Vehicle, CreateVehicleForm } from '@/types';

export class VehicleService {
  /**
   * Get all vehicles
   */
  static async getAll(filters?: {
    customer_id?: string;
    branch_id?: string;
    search?: string;
  }) {
    if (!supabase) throw new Error('Supabase client not initialized');

    let query = supabase
      .from('vehicles')
      .select(`
        *,
        customer:customers(*)
      `)
      .order('created_at', { ascending: false });

    if (filters?.customer_id) {
      query = query.eq('customer_id', filters.customer_id);
    }
    if (filters?.branch_id) {
      query = query.eq('branch_id', filters.branch_id);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching vehicles:', error);
      throw error;
    }
    return data as Vehicle[];
  }

  /**
   * Get total vehicle count
   */
  static async getCount() {
    if (!supabase) return 0;

    const { count, error } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error fetching vehicle count:', error);
      return 0;
    }

    return count || 0;
  }

  /**
   * Get vehicle by ID
   */
  static async getById(id: string) {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { data, error } = await supabase
      .from('vehicles')
      .select(`
        *,
        customer:customers(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching vehicle by ID:', error);
      throw error;
    }
    return data as Vehicle;
  }

  /**
   * Create new vehicle
   */
  static async create(formData: CreateVehicleForm, branchId?: string) {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { data, error } = await supabase
      .from('vehicles')
      .insert({
        ...formData,
        branch_id: branchId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating vehicle:', error);
      throw error;
    }
    return data as Vehicle;
  }

  /**
   * Update vehicle
   */
  static async update(id: string, updates: Partial<Vehicle>) {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { data, error } = await supabase
      .from('vehicles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating vehicle:', error);
      throw error;
    }
    return data as Vehicle;
  }

  /**
   * Delete vehicle
   */
  static async delete(id: string) {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting vehicle:', error);
      throw error;
    }
  }
}

