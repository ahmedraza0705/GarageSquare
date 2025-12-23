// ============================================
// JOB CARD SERVICE
// ============================================

import { supabase } from '@/lib/supabase';
import { JobCard, CreateJobCardForm, JobCardStatus } from '@/types';

export class JobCardService {
  /**
   * Get all job cards
   */
  static async getAll(filters?: {
    branch_id?: string;
    status?: JobCardStatus | JobCardStatus[];
    assigned_to?: string;
    customer_id?: string;
  }) {
    if (!supabase) throw new Error('Supabase client not initialized');

    let query = supabase
      .from('job_cards')
      .select(`
        *,
        customer:customers(*),
        vehicle:vehicles(*),
        services:job_card_services(*, service:services(*)),
        tasks:tasks(*)
      `)
      .order('created_at', { ascending: false });

    if (filters?.branch_id) {
      query = query.eq('branch_id', filters.branch_id);
    }
    if (filters?.status) {
      if (Array.isArray(filters.status)) {
        query = query.in('status', filters.status);
      } else {
        query = query.eq('status', filters.status);
      }
    }
    if (filters?.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to);
    }
    if (filters?.customer_id) {
      query = query.eq('customer_id', filters.customer_id);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching job cards:', error);
      throw error;
    }
    return data as JobCard[];
  }

  /**
   * Get active job cards count
   */
  static async getActiveCount() {
    if (!supabase) return 0;

    const { count, error } = await supabase
      .from('job_cards')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'in_progress', 'on_hold']);

    if (error) {
      console.error('Error fetching active job count:', error);
      return 0;
    }

    return count || 0;
  }

  /**
   * Get job card by ID
   */
  static async getById(id: string) {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { data, error } = await supabase
      .from('job_cards')
      .select(`
        *,
        customer:customers(*),
        vehicle:vehicles(*),
        services:job_card_services(*, service:services(*)),
        tasks:tasks(*, service:services(*))
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching job card by ID:', error);
      throw error;
    }
    return data as JobCard;
  }

  /**
   * Create new job card
   */
  static async create(formData: CreateJobCardForm, userId: string, branchId: string) {
    if (!supabase) throw new Error('Supabase client not initialized');

    // Generate job number
    const jobNumber = await this.generateJobNumber(branchId);

    // Create job card
    const { data: jobCard, error: jobCardError } = await supabase
      .from('job_cards')
      .insert({
        job_number: jobNumber,
        customer_id: formData.customer_id,
        vehicle_id: formData.vehicle_id,
        branch_id: branchId,
        description: formData.description,
        priority: formData.priority,
        estimated_cost: formData.estimated_cost,
        estimated_time: formData.estimated_time,
        created_by: userId,
        status: 'pending',
      })
      .select()
      .single();

    if (jobCardError) {
      console.error('Error creating job card:', jobCardError);
      throw jobCardError;
    }

    // Add services if provided
    if (formData.service_ids && formData.service_ids.length > 0) {
      const services = await supabase
        .from('services')
        .select('id, base_price')
        .in('id', formData.service_ids);

      if (services.data) {
        const jobCardServices = services.data.map(service => ({
          job_card_id: jobCard.id,
          service_id: service.id,
          quantity: 1,
          unit_price: service.base_price,
          total_price: service.base_price,
        }));

        await supabase.from('job_card_services').insert(jobCardServices);
      }
    }

    return this.getById(jobCard.id);
  }

  /**
   * Update job card
   */
  static async update(id: string, updates: Partial<JobCard>) {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { data, error } = await supabase
      .from('job_cards')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating job card:', error);
      throw error;
    }
    return data as JobCard;
  }

  /**
   * Update job card status
   */
  static async updateStatus(id: string, status: JobCardStatus) {
    const updates: Partial<JobCard> = { status };

    if (status === 'in_progress') {
      updates.started_at = new Date().toISOString();
    } else if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    return this.update(id, updates);
  }

  /**
   * Assign job card to technician
   */
  static async assign(id: string, technicianId: string) {
    return this.update(id, { assigned_to: technicianId });
  }

  /**
   * Generate unique job number
   */
  static async generateJobNumber(branchId: string): Promise<string> {
    if (!supabase) return `JC-TEMP-${Date.now()}`;

    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const prefix = `JC-${year}${month}${day}-`;

    // Get count of job cards today
    const { count } = await supabase
      .from('job_cards')
      .select('*', { count: 'exact', head: true })
      .like('job_number', `${prefix}%`);

    const sequence = String((count || 0) + 1).padStart(4, '0');
    return `${prefix}${sequence}`;
  }

  /**
   * Delete job card
   */
  static async delete(id: string) {
    if (!supabase) throw new Error('Supabase client not initialized');

    const { error } = await supabase
      .from('job_cards')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting job card:', error);
      throw error;
    }
  }
}

