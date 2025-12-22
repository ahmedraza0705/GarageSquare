// ============================================
// COMPANY SERVICE (SUPABASE)
// ============================================

import { supabase, supabaseConfig } from '@/lib/supabase';
import { Company } from '@/types';

const ensureClient = () => {
    if (!supabase || !supabaseConfig.isConfigured) {
        throw new Error('Supabase is not configured.');
    }
    return supabase;
};

export class CompanyService {
    /**
     * Get company by ID
     */
    static async getCompany(id: string): Promise<Company | null> {
        const client = ensureClient();
        const { data, error } = await client
            .from('companies')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching company:', error);
            throw error;
        }

        return data as Company;
    }

    /**
     * Update company details
     */
    static async updateCompany(id: string, updates: Partial<Company>): Promise<Company | null> {
        const client = ensureClient();
        const { data, error } = await client
            .from('companies')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating company:', error);
            throw error;
        }

        return data as Company;
    }
}
