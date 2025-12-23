import { Category, InventoryItem } from '@/types';
import { supabase, supabaseConfig } from '@/lib/supabase';

// Helper to ensure Supabase is configured
const ensureClient = () => {
    if (!supabase || !supabaseConfig.isConfigured) {
        throw new Error('Supabase is not configured. Check your .env file.');
    }
    return supabase;
};

export const InventoryService = {
    /**
     * Fetch all active categories for a company
     */
    async getCategories(companyId: string): Promise<Category[]> {
        const client = ensureClient();

        const { data, error } = await client
            .from('inventory_categories')
            .select('*')
            .eq('company_id', companyId)
            .eq('is_active', true)
            .order('name', { ascending: true });

        if (error) throw error;
        return data || [];
    },

    /**
     * Fetch inventory items with filters
     * Connects to 'inventory_items' table in Supabase
     */
    async getItems(
        companyId: string,
        filters?: {
            categoryId?: string | null;
            unit?: string | null;
            searchQuery?: string;
            status?: 'all' | 'low_stock' | 'out_of_stock' | null;
            branchId?: string | null;
        }
    ): Promise<InventoryItem[]> {
        const client = ensureClient();

        // 1. Build Base Query
        // "select *, category:..." means fetch all item columns PLUS the connected category details
        let query = client
            .from('inventory_items')
            .select(`
                *,
                category:inventory_categories(*)
            `)
            .eq('company_id', companyId) // ALWAYS filter by company security
            .eq('is_active', true);

        // 2. Apply Dynamic Filters
        if (filters?.categoryId) {
            query = query.eq('category_id', filters.categoryId);
        }

        if (filters?.branchId) {
            query = query.eq('branch_id', filters.branchId);
        }

        if (filters?.unit) {
            query = query.eq('unit', filters.unit);
        }

        if (filters?.searchQuery) {
            const search = filters.searchQuery.toLowerCase();
            // Note: This simple OR search might need an RPC for complex cases or text search index
            query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
        }

        // Fetch data first, then client-side filter for complicated logic (like dynamic low stock)
        // or apply simple filters where possible.
        // For 'low_stock' we need to compare quantity vs threshold, which is hard in standard postgrest filters 
        // without a computed column or RPC. We'll filter in JS for now for flexibility.

        const { data, error } = await query;
        if (error) throw error;

        let items = (data || []) as InventoryItem[];

        // Client-side filtering for status (comparing columns)
        if (filters?.status === 'low_stock') {
            items = items.filter(item =>
                (item.quantity || 0) <= (item.low_stock_threshold || 10) && (item.quantity || 0) > 0
            );
        } else if (filters?.status === 'out_of_stock') {
            items = items.filter(item => (item.quantity || 0) <= 0);
        }

        // Priority Sorting: Out of Stock -> Low Stock -> In Stock
        return items.sort((a, b) => {
            const getPriority = (item: InventoryItem) => {
                const qty = item.quantity || 0;
                const threshold = item.low_stock_threshold || 10;

                if (qty <= 0) return 3; // Highest priority (Out of Stock)
                if (qty <= threshold) return 2; // Medium priority (Low Stock)
                return 1; // Lowest priority (In Stock)
            };

            const priorityA = getPriority(a);
            const priorityB = getPriority(b);

            if (priorityA !== priorityB) {
                return priorityB - priorityA; // Descending order of priority
            }

            // Secondary sort: Alphabetical by Name
            return a.name.localeCompare(b.name);
        });
    },

    /**
     * Create a new category
     */
    async createCategory(
        companyId: string,
        categoryData: { name: string; description?: string }
    ): Promise<Category> {
        const client = ensureClient();

        const { data, error } = await client
            .from('inventory_categories')
            .insert({
                company_id: companyId,
                name: categoryData.name,
                description: categoryData.description,
                is_active: true
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Update a category
     */
    async updateCategory(
        companyId: string,
        categoryId: string,
        updates: { name?: string; description?: string; is_active?: boolean }
    ): Promise<Category> {
        const client = ensureClient();
        const { data, error } = await client
            .from('inventory_categories')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', categoryId)
            .eq('company_id', companyId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Delete a category
     */
    async deleteCategory(companyId: string, categoryId: string): Promise<void> {
        const client = ensureClient();
        const { error } = await client
            .from('inventory_categories')
            .delete()
            .eq('id', categoryId)
            .eq('company_id', companyId);

        if (error) throw error;
    },

    /**
     * Create a new inventory item
     */
    async createItem(
        companyId: string,
        itemData: {
            name: string;
            sku?: string;
            category_id?: string;
            quantity: number;
            unit_price: number;
            unit: string;
            low_stock_threshold?: number;
            description?: string;
            branch_id?: string;
        }
    ): Promise<InventoryItem> {
        const client = ensureClient();

        const { data, error } = await client
            .from('inventory_items')
            .insert({
                company_id: companyId,
                ...itemData,
                low_stock_threshold: itemData.low_stock_threshold ?? 10,
                is_active: true
            })
            .select(`
                *,
                category:inventory_categories(*)
            `)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Update an inventory item
     */
    async updateItem(
        companyId: string,
        itemId: string,
        updates: Partial<InventoryItem>
    ): Promise<InventoryItem> {
        const client = ensureClient();

        // Remove joined interactions if passed by accident
        const { category, ...cleanUpdates } = updates;

        const { data, error } = await client
            .from('inventory_items')
            .update({
                ...cleanUpdates,
                updated_at: new Date().toISOString()
            })
            .eq('id', itemId)
            .eq('company_id', companyId)
            .select(`
                *,
                category:inventory_categories(*)
            `)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Delete an inventory item
     */
    async deleteItem(companyId: string, itemId: string): Promise<void> {
        const client = ensureClient();

        const { error } = await client
            .from('inventory_items')
            .delete()
            .eq('id', itemId)
            .eq('company_id', companyId);

        if (error) throw error;
    },

    /**
     * Get Inventory Stats
     * Calculates stats by fetching lightweight data or using counts
     */
    async getStats(companyId: string, branchId?: string) {
        const client = ensureClient();

        // For simplest implementation without custom RPCs:
        // Fetch specific columns needed for verification
        let query = client
            .from('inventory_items')
            .select('quantity, unit_price, low_stock_threshold')
            .eq('company_id', companyId)
            .eq('is_active', true);

        if (branchId) {
            query = query.eq('branch_id', branchId);
        }

        const { data, error } = await query;
        if (error) throw error;

        let totalItems = 0;
        let lowStock = 0;
        let outOfStock = 0;
        let totalValue = 0;

        data.forEach((item: any) => {
            totalItems += 1;
            const qty = item.quantity || 0;
            const price = item.unit_price || 0;
            const threshold = item.low_stock_threshold || 10;

            totalValue += qty * price;

            if (qty <= 0) {
                outOfStock += 1;
            } else if (qty <= threshold) {
                lowStock += 1;
            }
        });

        return { totalItems, lowStock, outOfStock, totalValue };
    },
};
