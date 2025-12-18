// ============================================
// BRANCH SERVICE
// ============================================

import { supabase, supabaseConfig } from '@/lib/supabase';
import { Branch } from '@/types';

const ensureClient = () => {
    if (!supabase || !supabaseConfig.isConfigured) {
        throw new Error('Supabase is not configured.');
    }
    return supabase;
};

export class BranchService {
    /**
     * Get all branches for the current user's company
     * (RLS will automatically filter, but we can also filter explicitly if needed)
     */
    static async getCompanyBranches(): Promise<Branch[]> {
        const client = ensureClient();

        const { data, error } = await client
            .from('branches')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching branches:', error);
            throw error;
        }

        return data as Branch[];
    }

    /**
     * Get a single branch by ID
     */
    static async getBranch(id: string): Promise<Branch | null> {
        const client = ensureClient();

        const { data, error } = await client
            .from('branches')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching branch:', error);
            throw error;
        }

        return data as Branch;
    }

    /**
     * Create a new branch
     * Note: company_id will be required. 
     * In a real app, you might grab it from the current user session context if not provided,
     * but passing it explicitly allows for more flexibility.
     */
    static async createBranch(branchData: Partial<Branch>): Promise<Branch> {
        const client = ensureClient();

        // Ensure we aren't sending any undefined/null IDs for things that should be handled by DB defaults if empty
        const payload = { ...branchData };

        const { data, error } = await client
            .from('branches')
            .insert([payload])
            .select()
            .single();

        if (error) {
            console.error('Error creating branch:', error);
            throw error;
        }

        return data as Branch;
    }

    /**
     * Update an existing branch
     */
    static async updateBranch(id: string, updates: Partial<Branch>): Promise<Branch> {
        const client = ensureClient();

        const { data, error } = await client
            .from('branches')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating branch:', error);
            throw error;
        }

        return data as Branch;
    }

    /**
     * Delete a branch
     */
    static async deleteBranch(id: string): Promise<void> {
        const client = ensureClient();

        const { error } = await client
            .from('branches')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting branch:', error);
            throw error;
        }
    }
}
