import { supabase } from '@/lib/supabase';
import { Branch } from '@/types';

export const branchService = {
    // Fetch all branches
    async getAllBranches(): Promise<Branch[]> {
        try {
            if (!supabase) throw new Error('Supabase client not initialized');

            const { data, error } = await supabase
                .from('branches')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching branches:', error);
            throw error;
        }
    },

    // Fetch single branch by ID
    async getBranchById(id: string): Promise<Branch | null> {
        try {
            if (!supabase) throw new Error('Supabase client not initialized');

            const { data, error } = await supabase
                .from('branches')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching branch:', error);
            throw error;
        }
    },

    // Create new branch
    async createBranch(branchData: Omit<Branch, 'id' | 'created_at' | 'updated_at'>): Promise<Branch> {
        try {
            if (!supabase) throw new Error('Supabase client not initialized');

            const { data, error } = await supabase
                .from('branches')
                .insert([branchData])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating branch:', error);
            throw error;
        }
    },

    // Update existing branch
    async updateBranch(id: string, updates: Partial<Branch>): Promise<Branch> {
        try {
            if (!supabase) throw new Error('Supabase client not initialized');

            const { data, error } = await supabase
                .from('branches')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error updating branch:', error);
            throw error;
        }
    },

    // Delete branch
    async deleteBranch(id: string): Promise<void> {
        try {
            if (!supabase) throw new Error('Supabase client not initialized');

            const { error } = await supabase
                .from('branches')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting branch:', error);
            throw error;
        }
    },

    // Search branches
    async searchBranches(query: string): Promise<Branch[]> {
        try {
            if (!supabase) throw new Error('Supabase client not initialized');

            const { data, error } = await supabase
                .from('branches')
                .select('*')
                .or(`name.ilike.%${query}%,address.ilike.%${query}%`)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error searching branches:', error);
            throw error;
        }
    }
};
