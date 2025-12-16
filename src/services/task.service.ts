// ============================================
// TASK SERVICE
// ============================================

// COMMENTED OUT - Supabase removed
// import { supabase } from '@/lib/supabase';
import { Task, UpdateTaskForm, TaskStatus } from '@/types';

export class TaskService {
  /**
   * Get all tasks
   */
  static async getAll(filters?: {
    job_card_id?: string;
    assigned_to?: string;
    status?: TaskStatus;
  }) {
    // COMMENTED OUT - Supabase removed
    // let query = supabase
    //   .from('tasks')
    //   .select(`
    //     *,
    //     assigned_user:user_profiles!tasks_assigned_to_fkey(*),
    //     service:services(*)
    //   `)
    //   .order('created_at', { ascending: false });

    // if (filters?.job_card_id) {
    //   query = query.eq('job_card_id', filters.job_card_id);
    // }
    // if (filters?.assigned_to) {
    //   query = query.eq('assigned_to', filters.assigned_to);
    // }
    // if (filters?.status) {
    //   query = query.eq('status', filters.status);
    // }

    // const { data, error } = await query;
    // if (error) throw error;
    // return data as Task[];
    throw new Error('Supabase is disabled - task service not available');
  }

  /**
   * Get task by ID
   */
  static async getById(id: string) {
    // COMMENTED OUT - Supabase removed
    // const { data, error } = await supabase
    //   .from('tasks')
    //   .select(`
    //     *,
    //     assigned_user:user_profiles!tasks_assigned_to_fkey(*),
    //     service:services(*)
    //   `)
    //   .eq('id', id)
    //   .single();

    // if (error) throw error;
    // return data as Task;
    throw new Error('Supabase is disabled - task service not available');
  }

  /**
   * Create new task
   */
  static async create(taskData: Partial<Task>) {
    // COMMENTED OUT - Supabase removed
    // const { data, error } = await supabase
    //   .from('tasks')
    //   .insert(taskData)
    //   .select()
    //   .single();

    // if (error) throw error;
    // return data as Task;
    throw new Error('Supabase is disabled - task service not available');
  }

  /**
   * Update task
   */
  static async update(id: string, updates: UpdateTaskForm) {
    // COMMENTED OUT - Supabase removed
    // const updateData: Partial<Task> = {
    //   ...updates,
    //   updated_at: new Date().toISOString(),
    // };

    // if (updates.status === 'in_progress' && !updates.actual_time) {
    //   updateData.started_at = new Date().toISOString();
    // } else if (updates.status === 'completed') {
    //   updateData.completed_at = new Date().toISOString();
    // }

    // const { data, error } = await supabase
    //   .from('tasks')
    //   .update(updateData)
    //   .eq('id', id)
    //   .select()
    //   .single();

    // if (error) throw error;
    // return data as Task;
    throw new Error('Supabase is disabled - task service not available');
  }

  /**
   * Assign task to technician
   */
  static async assign(id: string, technicianId: string) {
    // COMMENTED OUT - Supabase removed
    // return this.update(id, { status: 'pending' as TaskStatus });
    throw new Error('Supabase is disabled - task service not available');
  }

  /**
   * Delete task
   */
  static async delete(id: string) {
    // COMMENTED OUT - Supabase removed
    // const { error } = await supabase
    //   .from('tasks')
    //   .delete()
    //   .eq('id', id);

    // if (error) throw error;
    throw new Error('Supabase is disabled - task service not available');
  }
}

