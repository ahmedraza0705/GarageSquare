// ============================================
// VEHICLE SERVICE
// ============================================

// COMMENTED OUT - Supabase removed
// import { supabase } from '@/lib/supabase';
import { Vehicle, CreateVehicleForm } from '@/types';

export class VehicleService {
  /**
   * Get all vehicles
   */
  static async getAll(filters?: {
    customer_id?: string;
    branch_id?: string;
  }) {
    // COMMENTED OUT - Supabase removed
    // let query = supabase
    //   .from('vehicles')
    //   .select(`
    //     *,
    //     customer:customers(*)
    //   `)
    //   .order('created_at', { ascending: false });

    // if (filters?.customer_id) {
    //   query = query.eq('customer_id', filters.customer_id);
    // }
    // if (filters?.branch_id) {
    //   query = query.eq('branch_id', filters.branch_id);
    // }

    // const { data, error } = await query;
    // if (error) throw error;
    // return data as Vehicle[];
    throw new Error('Supabase is disabled - vehicle service not available');
  }

  /**
   * Get vehicle by ID
   */
  static async getById(id: string) {
    // COMMENTED OUT - Supabase removed
    // const { data, error } = await supabase
    //   .from('vehicles')
    //   .select(`
    //     *,
    //     customer:customers(*)
    //   `)
    //   .eq('id', id)
    //   .single();

    // if (error) throw error;
    // return data as Vehicle;
    throw new Error('Supabase is disabled - vehicle service not available');
  }

  /**
   * Create new vehicle
   */
  static async create(formData: CreateVehicleForm, branchId?: string) {
    // COMMENTED OUT - Supabase removed
    // const { data, error } = await supabase
    //   .from('vehicles')
    //   .insert({
    //     ...formData,
    //     branch_id: branchId,
    //   })
    //   .select()
    //   .single();

    // if (error) throw error;
    // return data as Vehicle;
    throw new Error('Supabase is disabled - vehicle service not available');
  }

  /**
   * Update vehicle
   */
  static async update(id: string, updates: Partial<Vehicle>) {
    // COMMENTED OUT - Supabase removed
    // const { data, error } = await supabase
    //   .from('vehicles')
    //   .update({
    //     ...updates,
    //     updated_at: new Date().toISOString(),
    //   })
    //   .eq('id', id)
    //   .select()
    //   .single();

    // if (error) throw error;
    // return data as Vehicle;
    throw new Error('Supabase is disabled - vehicle service not available');
  }

  /**
   * Delete vehicle
   */
  static async delete(id: string) {
    // COMMENTED OUT - Supabase removed
    // const { error } = await supabase
    //   .from('vehicles')
    //   .delete()
    //   .eq('id', id);

    // if (error) throw error;
    throw new Error('Supabase is disabled - vehicle service not available');
  }
}

