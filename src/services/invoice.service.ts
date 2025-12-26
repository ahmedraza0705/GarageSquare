// ============================================
// INVOICE SERVICE
// Handles all invoice and estimate operations
// ============================================

import { supabase } from '@/lib/supabase';
import { Invoice, InvoiceItem } from '@/types';


export interface CreateInvoiceData {
    invoice_type: 'estimate' | 'invoice';
    customer_id: string;
    vehicle_id?: string;
    branch_id: string;
    job_card_id?: string;
    invoice_date?: string;
    due_date?: string;
    tax_rate?: number;
    notes?: string;
    terms_and_conditions?: string;
    items: Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at' | 'updated_at'>[];
}

export class InvoiceService {
    /**
     * Get all invoices with filters
     */
    static async getAll(filters?: {
        branch_id?: string;
        invoice_type?: 'estimate' | 'invoice';
        status?: string;
        payment_status?: string;
        start_date?: string;
        end_date?: string;
        search?: string;
    }) {
        if (!supabase) throw new Error('Supabase client not initialized');

        let query = supabase
            .from('invoices')
            .select(`
        *,
        customer:customers(id, full_name, email, phone),
        vehicle:vehicles(id, brand, model, license_plate),
        invoice_items(*)
      `)
            .order('invoice_date', { ascending: false });

        if (filters?.branch_id) {
            query = query.eq('branch_id', filters.branch_id);
        }
        if (filters?.invoice_type) {
            query = query.eq('invoice_type', filters.invoice_type);
        }
        if (filters?.status) {
            query = query.eq('status', filters.status);
        }
        if (filters?.payment_status) {
            query = query.eq('payment_status', filters.payment_status);
        }
        if (filters?.start_date) {
            query = query.gte('invoice_date', filters.start_date);
        }
        if (filters?.end_date) {
            query = query.lte('invoice_date', filters.end_date);
        }
        if (filters?.search) {
            query = query.or(`invoice_number.ilike.%${filters.search}%`);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as Invoice[];
    }

    /**
     * Get invoices by time period
     */
    static async getByTimePeriod(
        period: 'Today' | 'Week' | 'Month' | 'Quarter' | 'Year',
        branchId?: string,
        invoiceType?: 'estimate' | 'invoice'
    ) {
        const now = new Date();
        let startDate: Date;

        switch (period) {
            case 'Today':
                startDate = new Date(now.setHours(0, 0, 0, 0));
                break;
            case 'Week':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case 'Month':
                startDate = new Date(now.setMonth(now.getMonth() - 1));
                break;
            case 'Quarter':
                startDate = new Date(now.setMonth(now.getMonth() - 3));
                break;
            case 'Year':
                startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                break;
        }

        return this.getAll({
            branch_id: branchId,
            invoice_type: invoiceType,
            start_date: startDate.toISOString().split('T')[0],
        });
    }

    /**
     * Get invoice by ID
     */
    static async getById(id: string) {
        if (!supabase) throw new Error('Supabase client not initialized');

        const { data, error } = await supabase
            .from('invoices')
            .select(`
        *,
        customer:customers(id, full_name, email, phone),
        vehicle:vehicles(id, brand, model, license_plate, year, color),
        invoice_items(*)
      `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Invoice;
    }

    /**
     * Create new invoice/estimate
     */
    static async create(invoiceData: CreateInvoiceData, userId: string) {
        if (!supabase) throw new Error('Supabase client not initialized');

        // Generate invoice number
        const { data: invoiceNumber } = await supabase
            .rpc('generate_invoice_number', { invoice_type_param: invoiceData.invoice_type });

        // Create invoice
        const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .insert({
                invoice_number: invoiceNumber,
                invoice_type: invoiceData.invoice_type,
                customer_id: invoiceData.customer_id,
                vehicle_id: invoiceData.vehicle_id,
                branch_id: invoiceData.branch_id,
                job_card_id: invoiceData.job_card_id,
                invoice_date: invoiceData.invoice_date || new Date().toISOString().split('T')[0],
                due_date: invoiceData.due_date,
                tax_rate: invoiceData.tax_rate || 10,
                notes: invoiceData.notes,
                terms_and_conditions: invoiceData.terms_and_conditions,
                status: 'draft',
                payment_status: 'unpaid',
                created_by: userId,
            })
            .select()
            .single();

        if (invoiceError) throw invoiceError;

        // Create invoice items
        if (invoiceData.items && invoiceData.items.length > 0) {
            const items = invoiceData.items.map(item => ({
                ...item,
                invoice_id: invoice.id,
            }));

            const { error: itemsError } = await supabase
                .from('invoice_items')
                .insert(items);

            if (itemsError) throw itemsError;
        }

        // Fetch complete invoice with items
        return this.getById(invoice.id);
    }

    /**
     * Update invoice
     */
    static async update(id: string, updates: Partial<Invoice>, userId: string) {
        if (!supabase) throw new Error('Supabase client not initialized');

        const { data, error } = await supabase
            .from('invoices')
            .update({
                ...updates,
                updated_by: userId,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Invoice;
    }

    /**
     * Convert estimate to invoice
     */
    static async convertToInvoice(estimateId: string, userId: string) {
        if (!supabase) throw new Error('Supabase client not initialized');

        // Get the estimate
        const estimate = await this.getById(estimateId);

        if (estimate.invoice_type !== 'estimate') {
            throw new Error('Only estimates can be converted to invoices');
        }

        // Create new invoice from estimate
        const newInvoice = await this.create(
            {
                invoice_type: 'invoice',
                customer_id: estimate.customer_id,
                vehicle_id: estimate.vehicle_id,
                branch_id: estimate.branch_id,
                job_card_id: estimate.job_card_id,
                tax_rate: estimate.tax_rate,
                notes: estimate.notes,
                terms_and_conditions: estimate.terms_and_conditions,
                items: estimate.invoice_items?.map(item => ({
                    service_id: item.service_id,
                    item_name: item.item_name,
                    description: item.description,
                    item_type: item.item_type,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                    discount_percentage: item.discount_percentage,
                    discount_amount: item.discount_amount,
                    tax_percentage: item.tax_percentage,
                    tax_amount: item.tax_amount,
                    total_price: item.total_price,
                })) || [],
            },
            userId
        );

        // Update estimate status
        await this.update(
            estimateId,
            {
                status: 'converted',
                converted_to_invoice_id: newInvoice.id,
                converted_at: new Date().toISOString(),
            },
            userId
        );

        return newInvoice;
    }

    /**
     * Delete invoice
     */
    static async delete(id: string) {
        if (!supabase) throw new Error('Supabase client not initialized');

        const { error } = await supabase
            .from('invoices')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    /**
     * Get invoice statistics
     */
    static async getStatistics(branchId?: string, startDate?: string, endDate?: string) {
        if (!supabase) throw new Error('Supabase client not initialized');

        let query = supabase
            .from('invoices')
            .select('invoice_type, status, payment_status, total_amount');

        if (branchId) {
            query = query.eq('branch_id', branchId);
        }
        if (startDate) {
            query = query.gte('invoice_date', startDate);
        }
        if (endDate) {
            query = query.lte('invoice_date', endDate);
        }

        const { data, error } = await query;
        if (error) throw error;

        // Calculate statistics
        const stats = {
            totalInvoices: data?.filter(i => i.invoice_type === 'invoice').length || 0,
            totalEstimates: data?.filter(i => i.invoice_type === 'estimate').length || 0,
            totalRevenue: data?.reduce((sum, i) => sum + (i.total_amount || 0), 0) || 0,
            paidInvoices: data?.filter(i => i.payment_status === 'paid').length || 0,
            unpaidInvoices: data?.filter(i => i.payment_status === 'unpaid').length || 0,
        };

        return stats;
    }
}
