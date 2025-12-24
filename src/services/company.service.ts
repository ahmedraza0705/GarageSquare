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
     * Create a new company
     */
    static async createCompany(name: string, id?: string): Promise<Company | null> {
        const client = ensureClient();
        const payload: any = {
            name,
            onboarding_completed: false,
        };
        if (id) payload.id = id;

        const { data, error } = await client
            .from('companies')
            .upsert(payload, { onConflict: 'id' })
            .select()
            .single();

        if (error) {
            console.error('Error creating company:', error);
            throw error;
        }

        return data as Company;
    }

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
        console.log(`[CompanyService] Updating company ${id} with:`, updates);

        try {
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
                console.error('[CompanyService] Error updating company:', error);
                throw error;
            }

            console.log('[CompanyService] Update successful:', data);
            return data as Company;
        } catch (err) {
            console.error('[CompanyService] Unexpected error in updateCompany:', err);
            throw err;
        }
    }
}
