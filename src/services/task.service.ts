// ============================================
// TASK SERVICE
// ============================================

import { Task, UpdateTaskForm, TaskStatus } from '@/types';

export class TaskService {
  /**
   * Get all tasks
   */
  static async getAll(filters?: {
    job_card_id?: string;
    assigned_to?: string;
    status?: TaskStatus;
  }): Promise<Task[]> {
    const { supabase } = await import('@/lib/supabase');
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    let query = supabase
      .from('tasks')
      .select(`
        *,
        assigned_user:user_profiles!tasks_assigned_to_fkey(*),
        service:services(*)
      `)
      .order('created_at', { ascending: false });

    if (filters?.job_card_id) {
      query = query.eq('job_card_id', filters.job_card_id);
    }
    if (filters?.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Task[];
  }

  /**
   * Get task by ID
   */
  static async getById(id: string): Promise<Task> {
    const { supabase } = await import('@/lib/supabase');
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assigned_user:user_profiles!tasks_assigned_to_fkey(*),
        service:services(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Task;
  }

  /**
   * Create new task
   */
  static async create(taskData: Partial<Task>): Promise<Task> {
    const { supabase } = await import('@/lib/supabase');
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select()
      .single();

    if (error) throw error;
    return data as Task;
  }

  /**
   * Update task
   */
  static async update(id: string, updates: UpdateTaskForm): Promise<Task> {
    const { supabase } = await import('@/lib/supabase');
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const updateData: Partial<Task> = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (updates.status === 'in_progress' && !updates.actual_time) {
      updateData.started_at = new Date().toISOString();
    } else if (updates.status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Task;
  }

  /**
   * Assign task to technician
   */
  static async assign(id: string, technicianId: string): Promise<Task> {
    return this.update(id, { assigned_to: technicianId, status: 'pending' } as UpdateTaskForm);
  }

  /**
   * Delete task
   */
  static async delete(id: string): Promise<void> {
    const { supabase } = await import('@/lib/supabase');
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

