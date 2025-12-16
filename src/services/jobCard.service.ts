// ============================================
// JOB CARD SERVICE
// ============================================

// COMMENTED OUT - Supabase removed
// import { supabase } from '@/lib/supabase';
import { JobCard, CreateJobCardForm, JobCardStatus } from '@/types';

export class JobCardService {
  /**
   * Get all job cards
   */
  static async getAll(filters?: {
    branch_id?: string;
    status?: JobCardStatus;
    assigned_to?: string;
    customer_id?: string;
  }) {
    // COMMENTED OUT - Supabase removed
    // let query = supabase
    //   .from('job_cards')
    //   .select(`
    //     *,
    //     customer:customers(*),
    //     vehicle:vehicles(*),
    //     assigned_user:user_profiles!job_cards_assigned_to_fkey(*),
    //     supervisor:user_profiles!job_cards_supervisor_id_fkey(*),
    //     services:job_card_services(*, service:services(*)),
    //     tasks:tasks(*, assigned_user:user_profiles!tasks_assigned_to_fkey(*))
    //   `)
    //   .order('created_at', { ascending: false });

    // if (filters?.branch_id) {
    //   query = query.eq('branch_id', filters.branch_id);
    // }
    // if (filters?.status) {
    //   query = query.eq('status', filters.status);
    // }
    // if (filters?.assigned_to) {
    //   query = query.eq('assigned_to', filters.assigned_to);
    // }
    // if (filters?.customer_id) {
    //   query = query.eq('customer_id', filters.customer_id);
    // }

    // const { data, error } = await query;
    // if (error) throw error;
    // return data as JobCard[];
    throw new Error('Supabase is disabled - job card service not available');
  }

  /**
   * Get job card by ID
   */
  static async getById(id: string) {
    // COMMENTED OUT - Supabase removed
    // const { data, error } = await supabase
    //   .from('job_cards')
    //   .select(`
    //     *,
    //     customer:customers(*),
    //     vehicle:vehicles(*),
    //     assigned_user:user_profiles!job_cards_assigned_to_fkey(*),
    //     supervisor:user_profiles!job_cards_supervisor_id_fkey(*),
    //     services:job_card_services(*, service:services(*)),
    //     tasks:tasks(*, assigned_user:user_profiles!tasks_assigned_to_fkey(*), service:services(*))
    //   `)
    //   .eq('id', id)
    //   .single();

    // if (error) throw error;
    // return data as JobCard;
    throw new Error('Supabase is disabled - job card service not available');
  }

  /**
   * Create new job card
   */
  static async create(formData: CreateJobCardForm, userId: string, branchId: string) {
    // COMMENTED OUT - Supabase removed
    // // Generate job number
    // const jobNumber = await this.generateJobNumber(branchId);

    // // Create job card
    // const { data: jobCard, error: jobCardError } = await supabase
    //   .from('job_cards')
    //   .insert({
    //     job_number: jobNumber,
    //     customer_id: formData.customer_id,
    //     vehicle_id: formData.vehicle_id,
    //     branch_id: branchId,
    //     description: formData.description,
    //     priority: formData.priority,
    //     estimated_cost: formData.estimated_cost,
    //     estimated_time: formData.estimated_time,
    //     created_by: userId,
    //     status: 'pending',
    //   })
    //   .select()
    //   .single();

    // if (jobCardError) throw jobCardError;

    // // Add services if provided
    // if (formData.service_ids && formData.service_ids.length > 0) {
    //   const services = await supabase
    //     .from('services')
    //     .select('id, base_price')
    //     .in('id', formData.service_ids);

    //   if (services.data) {
    //     const jobCardServices = services.data.map(service => ({
    //       job_card_id: jobCard.id,
    //       service_id: service.id,
    //       quantity: 1,
    //       unit_price: service.base_price,
    //       total_price: service.base_price,
    //     }));

    //     await supabase.from('job_card_services').insert(jobCardServices);
    //   }
    // }

    // return this.getById(jobCard.id);
    throw new Error('Supabase is disabled - job card service not available');
  }

  /**
   * Update job card
   */
  static async update(id: string, updates: Partial<JobCard>) {
    // COMMENTED OUT - Supabase removed
    // const { data, error } = await supabase
    //   .from('job_cards')
    //   .update({
    //     ...updates,
    //     updated_at: new Date().toISOString(),
    //   })
    //   .eq('id', id)
    //   .select()
    //   .single();

    // if (error) throw error;
    // return data as JobCard;
    throw new Error('Supabase is disabled - job card service not available');
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
    // COMMENTED OUT - Supabase removed
    // const date = new Date();
    // const year = date.getFullYear();
    // const month = String(date.getMonth() + 1).padStart(2, '0');
    // const day = String(date.getDate()).padStart(2, '0');
    // const prefix = `JC-${year}${month}${day}-`;

    // // Get count of job cards today
    // const { count } = await supabase
    //   .from('job_cards')
    //   .select('*', { count: 'exact', head: true })
    //   .like('job_number', `${prefix}%`);

    // const sequence = String((count || 0) + 1).padStart(4, '0');
    // return `${prefix}${sequence}`;
    throw new Error('Supabase is disabled - job card service not available');
  }

  /**
   * Delete job card
   */
  static async delete(id: string) {
    // COMMENTED OUT - Supabase removed
    // const { error } = await supabase
    //   .from('job_cards')
    //   .delete()
    //   .eq('id', id);

    // if (error) throw error;
    throw new Error('Supabase is disabled - job card service not available');
  }
}

