// ============================================
// VEHICLE SERVICE
// ============================================

import { supabase } from '@/lib/supabase';
import { Vehicle, CreateVehicleForm, VehicleServiceItem, VehicleServiceStatus } from '@/types';

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
      // Filter by branch via the customer relation if needed, 
      // but if vehicles has branch_id, use that directly.
      // Assuming vehicles table has branch_id as per typical schema here.
      query = query.eq('branch_id', filters.branch_id);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching vehicles:', error);
      throw error;
    }

    let vehicles = data as Vehicle[];

    if (filters?.search) {
      const lowerSearch = filters.search.toLowerCase();
      vehicles = vehicles.filter((v: any) =>
        v.brand?.toLowerCase().includes(lowerSearch) ||
        v.model?.toLowerCase().includes(lowerSearch) ||
        v.license_plate?.toLowerCase().includes(lowerSearch) ||
        v.customer?.full_name?.toLowerCase().includes(lowerSearch)
      );
    }

    return vehicles;
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
      console.warn('Error fetching vehicle count:', JSON.stringify(error));
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
    // 1. Get current user profile for company_id
    const { data: { user } } = await supabase.auth.getUser();
    let companyId = null;

    if (user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .maybeSingle();
      companyId = profile?.company_id;
    }

    // 2. Handle Schema Mapping: make -> brand and remove vin
    const { vin, make, ...cleanFields } = formData as any;
    const finalBrand = cleanFields.brand || make;

    const { data, error } = await supabase
      .from('vehicles')
      .insert({
        ...cleanFields,
        brand: finalBrand,
        company_id: companyId,
        branch_id: branchId || null,
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
    // Remove relations/read-only fields AND fields that don't exist in schema
    const {
      customer,
      services,
      branch,
      id: _,
      created_at,
      updated_at,
      vin,          // Not in DB schema
      make,         // Rename to brand if coming from old types
      mileage,      // Rename to odometer if coming from old types
      year,         // Rename to year_manufacture if coming from old types
      ...cleanUpdates
    } = updates as any;

    const finalUpdates = { ...cleanUpdates };
    if (make) finalUpdates.brand = make;
    if (mileage) finalUpdates.odometer = mileage;
    if (year) finalUpdates.year_manufacture = year;

    const { data, error } = await supabase
      .from('vehicles')
      .update({
        ...finalUpdates,
        branch_id: finalUpdates.branch_id || undefined,
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
