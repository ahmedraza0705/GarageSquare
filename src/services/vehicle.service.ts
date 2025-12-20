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
    try {
      if (!supabase) throw new Error('Supabase client not initialized');

      let query = supabase
        .from('vehicles')
        .select(`
          *,
          customer:customers (
            id,
            full_name,
            phone,
            email,
            branch_id
          )
        `);

      if (filters?.customer_id) {
        query = query.eq('customer_id', filters.customer_id);
      }

      // Filter by branch via the customer relation
      if (filters?.branch_id) {
        query = query.eq('customer.branch_id', filters.branch_id);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      let vehicles = data as unknown as Vehicle[];

      // Client-side search if needed (Supabase search on joined tables can be complex)
      if (filters?.search) {
        const lowerSearch = filters.search.toLowerCase();
        vehicles = vehicles.filter((v: any) =>
          v.make?.toLowerCase().includes(lowerSearch) ||
          v.model?.toLowerCase().includes(lowerSearch) ||
          v.license_plate?.toLowerCase().includes(lowerSearch) ||
          v.customer?.full_name?.toLowerCase().includes(lowerSearch)
        );
      }

      return vehicles;
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      throw error;
    }
  }

  /**
   * Get vehicle by ID
   */
  static async getById(id: string) {
    try {
      if (!supabase) throw new Error('Supabase client not initialized');
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          customer:customers (
            *
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Vehicle;
    } catch (error) {
      console.error('Error fetching vehicle:', error);
      throw error;
    }
  }

  /**
   * Create new vehicle
   */
  static async create(formData: CreateVehicleForm & { customer_name?: string, customer_email?: string }, branchId?: string) {
    try {
      // We only insert fields that exist in the vehicles table
      const vehicleData = {
        customer_id: formData.customer_id,
        make: formData.make,
        model: formData.model,
        year: formData.year,
        vin: formData.vin,
        license_plate: formData.license_plate,
        color: formData.color,
        mileage: formData.mileage,
        // notes: formData.notes // Notes field is not in the pic 1 schema, omitting to be safe or assuming schema matches type.
        // If 'notes' is in type but not in DB, it will fail.
        // Looking at pic 1, there is NO 'notes' column visible in the screenshot. 
        // I will omit it to prevent errors, or check if 'notes' was in the type.
        // Types/index.ts has 'notes', but image 1 doesn't show it. Safe to omit or strictly map.
      };

      const { data, error } = await supabase
        .from('vehicles')
        .insert(vehicleData)
        .select()
        .single();

      if (error) throw error;
      return data as Vehicle;
    } catch (error) {
      console.error('Error creating vehicle:', error);
      throw error;
    }
  }

  /**
   * Update vehicle
   */
  static async update(id: string, updates: Partial<Vehicle>) {
    try {
      // Filter out fields that shouldn't be updated or don't exist in DB
      const {
        branch_id, branch_name, customer, services, created_at, updated_at,
        ...validUpdates
      } = updates as any;

      const { data, error } = await supabase
        .from('vehicles')
        .update(validUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Vehicle;
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw error;
    }
  }

  /**
   * Delete vehicle
   */
  static async delete(id: string) {
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw error;
    }
  }
}

