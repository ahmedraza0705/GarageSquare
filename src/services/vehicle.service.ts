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

  /**
   * Add service to vehicle
   */
  static async addService(vehicleId: string, serviceName: string, estimatedTime: string) {
    if (!supabase) throw new Error('Supabase client not initialized');

    // This is a simplified version - in a real app, you might have a services table
    // For now, we'll fetch the vehicle, update its services array, and save it back
    // Or if the services are stored as a JSONB column, we can update it directly
    const { data: vehicle, error: fetchError } = await supabase
      .from('vehicles')
      .select('services')
      .eq('id', vehicleId)
      .single();

    if (fetchError) throw fetchError;

    const currentServices = (vehicle.services as any[]) || [];
    const newService = {
      id: Math.random().toString(36).substr(2, 9),
      name: serviceName,
      status: 'pending',
      estimate: estimatedTime,
      created_at: new Date().toISOString()
    };

    const { error: updateError } = await supabase
      .from('vehicles')
      .update({
        services: [...currentServices, newService],
        updated_at: new Date().toISOString()
      })
      .eq('id', vehicleId);

    if (updateError) throw updateError;
  }

  /**
   * Update service status
   */
  static async updateServiceStatus(vehicleId: string, serviceId: string, status: string) {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { data: vehicle, error: fetchError } = await supabase
      .from('vehicles')
      .select('services')
      .eq('id', vehicleId)
      .single();

    if (fetchError) throw fetchError;

    const currentServices = (vehicle.services as any[]) || [];
    const updatedServices = currentServices.map((s: any) =>
      s.id === serviceId ? { ...s, status } : s
    );

    const { error: updateError } = await supabase
      .from('vehicles')
      .update({
        services: updatedServices,
        updated_at: new Date().toISOString()
      })
      .eq('id', vehicleId);

    if (updateError) throw updateError;
  }
}

