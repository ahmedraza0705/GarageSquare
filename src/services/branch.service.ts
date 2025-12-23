// ============================================
// BRANCH SERVICE
// ============================================

import { supabase, supabaseConfig } from '@/lib/supabase';
import { Branch } from '@/types';

export interface CreateBranchData {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    manager_id?: string;
    is_active?: boolean;
}

export interface UpdateBranchData {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    manager_id?: string;
    is_active?: boolean;
}

const ensureClient = () => {
    if (!supabase || !supabaseConfig.isConfigured) {
        throw new Error('Supabase is not configured.');
    }
    return supabase;
};

export class BranchService {
    /**
     * Get all branches (for company admin)
     */
    static async getAllBranches(): Promise<Branch[]> {
        const client = ensureClient();
        const { data, error } = await client
            .from('branches')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    /**
     * Get a single branch
     */
    static async getBranch(id: string): Promise<Branch | null> {
        const client = ensureClient();
        const { data, error } = await client
            .from('branches')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Create a new branch
     */
    static async createBranch(branchData: CreateBranchData): Promise<Branch> {
        const client = ensureClient();
        const { data, error } = await client
            .from('branches')
            .insert({
                name: branchData.name,
                location: branchData.address,
                // phone: branchData.phone, // Not in schema
                // email: branchData.email, // Not in schema
                // manager_id: branchData.manager_id || null, // Not in schema
                // is_active: branchData.is_active ?? true, // Not in schema
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Update a branch
     */
    static async updateBranch(id: string, updates: UpdateBranchData): Promise<Branch> {
        const client = ensureClient();

        // Map address to location for DB and exclude others
        const { address, phone, email, manager_id, is_active, ...others } = updates;
        const dbUpdates: any = { ...others };

        // Remove known non-schema fields if they slipped into "others"
        delete (dbUpdates as any).phone;
        delete (dbUpdates as any).email;
        delete (dbUpdates as any).manager_id;
        delete (dbUpdates as any).is_active;

        if (address !== undefined) {
            dbUpdates.location = address;
        }

        const { data, error } = await client
            .from('branches')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Delete (or deactivate) a branch
     */
    static async deleteBranch(id: string): Promise<void> {
        const client = ensureClient();
        const { error } = await client
            .from('branches')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
}
