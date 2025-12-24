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
        tasks:tasks(*, service:services(*))
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

    // DEBUG LOGGING
    if (data && data.length > 0) {
      console.log('[JobCardService] First job card raw services:', JSON.stringify(data[0].services, null, 2));
      console.log('[JobCardService] First job card raw tasks:', JSON.stringify(data[0].tasks, null, 2));
    } else {
      console.log('[JobCardService] No job cards found or empty data');
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
   * Get dashboard stats (counts by status and revenue)
   */
  static async getDashboardStats(branchId?: string) {
    if (!supabase) return { checkIn: 0, processing: 0, delivery: 0, revenue: 0 };

    try {
      // 1. Check-in (Pending Job Cards)
      let checkInQuery = supabase
        .from('job_cards')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (branchId) {
        checkInQuery = checkInQuery.eq('branch_id', branchId);
      }

      // 2. Delivery (Completed/Done Job Cards)
      let deliveryQuery = supabase
        .from('job_cards')
        .select('id', { count: 'exact', head: true })
        .in('status', ['done', 'completed', 'delivered']);

      if (branchId) {
        deliveryQuery = deliveryQuery.eq('branch_id', branchId);
      }

      // 3. Processing Job IDs (to count tasks/services)
      let processingIDsQuery = supabase
        .from('job_cards')
        .select('id')
        .in('status', ['active', 'urgent', 'progress', 'in_progress']);

      if (branchId) {
        processingIDsQuery = processingIDsQuery.eq('branch_id', branchId);
      }

      // 4. Revenue Calculation
      let revenueQuery = supabase
        .from('job_cards')
        .select('actual_cost, estimated_cost')
        .in('status', ['done', 'completed', 'delivered']);

      if (branchId) {
        revenueQuery = revenueQuery.eq('branch_id', branchId);
      }

      const [checkInRes, deliveryRes, processingIDsRes, revenueRes] = await Promise.all([
        checkInQuery,
        deliveryQuery,
        processingIDsQuery,
        revenueQuery
      ]);

      // Calculate total work items for processing jobs
      const jobIds = (processingIDsRes.data || []).map(j => j.id);
      let processingCount = 0;

      if (jobIds.length > 0) {
        const [servicesRes, tasksRes] = await Promise.all([
          supabase.from('job_card_services')
            .select('id', { count: 'exact', head: true })
            .in('job_card_id', jobIds)
            .neq('status', 'rejected'), // Exclude rejected services
          supabase.from('tasks')
            .select('id', { count: 'exact', head: true })
            .in('job_card_id', jobIds)
            .neq('status', 'rejected')  // Exclude rejected tasks
        ]);
        processingCount = (servicesRes.count || 0) + (tasksRes.count || 0);
      }

      const totalRevenue = (revenueRes.data || []).reduce((sum, job) =>
        sum + (job.actual_cost || job.estimated_cost || 0), 0);

      const stats = {
        checkIn: checkInRes.count || 0,
        processing: processingCount,
        delivery: deliveryRes.count || 0,
        revenue: totalRevenue
      };

      console.log(`[Dashboard Stats${branchId ? ` - ${branchId}` : ''}] Final stats:`, stats);
      return stats;
    } catch (error) {
      console.error('[Dashboard Stats] Error:', error);
      return { checkIn: 0, processing: 0, delivery: 0, revenue: 0 };
    }
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
  static async create(formData: CreateJobCardForm, userId: string, branchId?: string) {
    if (!supabase) throw new Error('Supabase client not initialized');

    // Generate job number
    const jobNumber = await this.generateJobNumber(branchId);

    // Create job card
    const { data: jobCard, error: jobCardError } = await supabase
      .from('job_cards')
      .insert({
        job_number: jobNumber,
        customer_id: formData.customer_id || null,
        vehicle_id: formData.vehicle_id || null,
        branch_id: branchId || null,
        description: formData.description,
        priority: formData.priority,
        estimated_cost: formData.estimated_cost,
        estimated_time: formData.estimated_time,
        created_by: userId,
        status: 'pending',

        // New fields
        odometer: formData.odometer,
        pickup_address: formData.pickup_address,
        dropoff_address: formData.dropoff_address,
        delivery_date: (formData as any).delivery_date,
        delivery_due: (formData as any).delivery_due,
        other_requirements: formData.other_requirements,
        task_statuses: formData.task_statuses || {},
        quality_statuses: formData.quality_statuses || {},
        assigned_tech_name: formData.assigned_tech_name,
        assigned_to: formData.assigned_to,
      })
      .select()
      .single();

    if (jobCardError) {
      console.error('Error creating job card:', jobCardError);
      throw jobCardError;
    }

    // Add manual services if provided
    if (formData.manual_services && formData.manual_services.length > 0) {
      const manualJobCardServices = formData.manual_services.map(s => ({
        job_card_id: jobCard.id,
        custom_service_name: s.name,
        unit_price: s.cost,
        total_price: s.cost,
        estimate: s.time,
        status: 'pending'
      }));

      const { error: manualError } = await supabase.from('job_card_services').insert(manualJobCardServices);
      if (manualError) {
        console.error('Error inserting manual services:', manualError);
      }
    }

    return this.getById(jobCard.id);
  }

  /**
   * Add services to an existing job card
   */
  static async addServices(jobCardId: string, services: { name: string, cost: number, estimate: string }[]) {
    if (!supabase) throw new Error('Supabase client not initialized');

    const jobCardServices = services.map(s => ({
      job_card_id: jobCardId,
      custom_service_name: s.name,
      unit_price: s.cost,
      total_price: s.cost,
      estimate: s.estimate,
      status: 'pending'
    }));

    const { error } = await supabase.from('job_card_services').insert(jobCardServices);
    if (error) {
      console.error('Error adding services:', error);
      throw error;
    }
  }

  /**
   * Update the status of a specific service or task
   */
  static async updateWorkItemStatus(type: 'service' | 'task', id: string, status: string) {
    if (!supabase) throw new Error('Supabase client not initialized');

    const table = type === 'service' ? 'job_card_services' : 'tasks';
    const { error } = await supabase
      .from(table)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error(`Error updating ${type} status:`, error);
      throw error;
    }
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
  static async generateJobNumber(branchId?: string): Promise<string> {
    if (!supabase) return `JC-TEMP-${Date.now()}`;

    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const prefix = `JC-${year}${month}${day}-`;

    // Get the latest job number for today to prevent collisions after deletions
    const { data } = await supabase
      .from('job_cards')
      .select('job_number')
      .like('job_number', `${prefix}%`)
      .order('job_number', { ascending: false })
      .limit(1);

    let nextSequence = 1;
    if (data && data.length > 0) {
      const lastJobNumber = data[0].job_number;
      const parts = lastJobNumber.split('-');
      const lastSequence = parseInt(parts[parts.length - 1] || '0');
      nextSequence = lastSequence + 1;
    }

    const sequence = String(nextSequence).padStart(4, '0');
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

