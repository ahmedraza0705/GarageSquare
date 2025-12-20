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

    /**
     * Get shop timing for a company
     */
    static async getShopTiming(companyId: string): Promise<{
        opening_time: string;
        closing_time: string;
    } | null> {
        const client = ensureClient();
        const { data, error } = await client
            .from('companies')
            .select('shop_opening_time, shop_closing_time')
            .eq('id', companyId)
            .single();

        if (error) {
            console.error('Error fetching shop timing:', error);
            throw error;
        }

        if (!data) return null;

        return {
            opening_time: data.shop_opening_time,
            closing_time: data.shop_closing_time,
        };
    }

    /**
     * Update shop timing for a company
     */
    static async updateShopTiming(
        companyId: string,
        openingTime: string,
        closingTime: string
    ): Promise<Company | null> {
        const client = ensureClient();

        const { data, error } = await client
            .from('companies')
            .update({
                shop_opening_time: openingTime,
                shop_closing_time: closingTime,
                updated_at: new Date().toISOString(),
            })
            .eq('id', companyId)
            .select()
            .single();

        if (error) {
            console.error('Error updating shop timing:', error);
            throw error;
        }

        return data as Company;
    }

    /**
     * Check if current time is within shop hours
     */
    static async isWithinShopHours(companyId: string): Promise<boolean> {
        const client = ensureClient();

        const { data, error } = await client
            .rpc('is_within_shop_hours', { p_company_id: companyId });

        if (error) {
            console.error('Error checking shop hours:', error);
            throw error;
        }

        return data === true;
    }

    /**
     * Get the default/first company
     */
    static async getDefaultCompany(): Promise<Company | null> {
        const client = ensureClient();
        const { data, error } = await client
            .from('companies')
            .select('*')
            .order('created_at', { ascending: true })
            .limit(1)
            .single();

        if (error) {
            console.error('Error fetching default company:', error);
            return null;
        }

        return data as Company;
    }
}
