// ============================================
// INVENTORY SERVICE (SUPABASE)
// ============================================

import { supabase, supabaseConfig } from '@/lib/supabase';
import {
    InventoryCategory,
    InventoryItem,
    InventoryStock,
    InventoryTransaction,
    InventoryItemWithStock,
    CreateInventoryItemData,
    UpdateInventoryItemData,
    CreateTransactionData,
    InventoryValueBreakdown,
    StockStatus,
} from '@/types';

const ensureClient = () => {
    if (!supabase || !supabaseConfig.isConfigured) {
        throw new Error('Supabase is not configured.');
    }
    return supabase;
};

export class InventoryService {
    // ============================================
    // CATEGORY MANAGEMENT
    // ============================================

    /**
     * Get all categories for a company
     */
    static async getCategories(companyId: string): Promise<InventoryCategory[]> {
        const client = ensureClient();
        const { data, error } = await client
            .from('inventory_categories')
            .select('*')
            .eq('company_id', companyId)
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }

        return data || [];
    }

    /**
     * Create a new category
     */
    static async createCategory(
        companyId: string,
        name: string,
        description?: string
    ): Promise<InventoryCategory> {
        const client = ensureClient();
        const { data, error } = await client
            .from('inventory_categories')
            .insert({
                company_id: companyId,
                name,
                description,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating category:', error);
            throw error;
        }

        return data;
    }

    // ============================================
    // ITEM MANAGEMENT
    // ============================================

    /**
     * Get all inventory items with stock information
     */
    static async getInventoryItems(
        companyId: string,
        branchId?: string
    ): Promise<InventoryItemWithStock[]> {
        const client = ensureClient();

        // Build query to get items with their stock
        let query = client
            .from('inventory_items')
            .select(`
        *,
        category:inventory_categories(*),
        stock:inventory_stock(*)
      `)
            .eq('company_id', companyId)
            .eq('is_active', true);

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching inventory items:', error);
            throw error;
        }

        // Transform data to include stock quantity and status
        const items: InventoryItemWithStock[] = (data || []).map((item: any) => {
            // Filter stock by branch if specified
            const stockRecords = branchId
                ? item.stock?.filter((s: any) => s.branch_id === branchId) || []
                : item.stock || [];

            // Calculate total quantity across all branches or specific branch
            const totalQuantity = stockRecords.reduce(
                (sum: number, s: any) => sum + (s.quantity || 0),
                0
            );

            const stockStatus = this.calculateStockStatus(
                totalQuantity,
                item.low_stock_threshold
            );

            return {
                ...item,
                stock_quantity: totalQuantity,
                total_value: totalQuantity * item.unit_price,
                stock_status: stockStatus,
                branch_id: branchId,
            };
        });

        return items;
    }

    /**
     * Get a single inventory item with stock
     */
    static async getInventoryItem(
        itemId: string,
        branchId?: string
    ): Promise<InventoryItemWithStock> {
        const client = ensureClient();

        const { data, error } = await client
            .from('inventory_items')
            .select(`
        *,
        category:inventory_categories(*),
        stock:inventory_stock(*)
      `)
            .eq('id', itemId)
            .single();

        if (error) {
            console.error('Error fetching inventory item:', error);
            throw error;
        }

        // Calculate stock quantity
        const stockRecords = branchId
            ? data.stock?.filter((s: any) => s.branch_id === branchId) || []
            : data.stock || [];

        const totalQuantity = stockRecords.reduce(
            (sum: number, s: any) => sum + (s.quantity || 0),
            0
        );

        const stockStatus = this.calculateStockStatus(
            totalQuantity,
            data.low_stock_threshold
        );

        return {
            ...data,
            stock_quantity: totalQuantity,
            total_value: totalQuantity * data.unit_price,
            stock_status: stockStatus,
            branch_id: branchId,
        };
    }

    /**
     * Create a new inventory item
     */
    static async createInventoryItem(
        itemData: CreateInventoryItemData
    ): Promise<InventoryItem> {
        const client = ensureClient();

        const { data, error } = await client
            .from('inventory_items')
            .insert({
                company_id: itemData.company_id,
                category_id: itemData.category_id || null,
                name: itemData.name,
                sku: itemData.sku,
                unit_price: itemData.unit_price,
                low_stock_threshold: itemData.low_stock_threshold || 10,
                unit: itemData.unit,
                description: itemData.description,
                is_active: true,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating inventory item:', error);
            throw error;
        }

        // If initial quantity provided, create stock record
        if (itemData.initial_quantity && itemData.branch_id) {
            await this.updateStock(
                data.id,
                itemData.branch_id,
                itemData.initial_quantity
            );

            // Record initial transaction
            await this.recordTransaction({
                item_id: data.id,
                branch_id: itemData.branch_id,
                type: 'IN',
                quantity: itemData.initial_quantity,
                notes: 'Initial stock',
            });
        }

        return data;
    }

    /**
     * Update an inventory item
     */
    static async updateInventoryItem(
        itemId: string,
        updates: UpdateInventoryItemData
    ): Promise<InventoryItem> {
        const client = ensureClient();

        const { data, error } = await client
            .from('inventory_items')
            .update(updates)
            .eq('id', itemId)
            .select()
            .single();

        if (error) {
            console.error('Error updating inventory item:', error);
            throw error;
        }

        return data;
    }

    /**
     * Delete (deactivate) an inventory item
     */
    static async deleteInventoryItem(itemId: string): Promise<void> {
        const client = ensureClient();

        const { error } = await client
            .from('inventory_items')
            .update({ is_active: false })
            .eq('id', itemId);

        if (error) {
            console.error('Error deleting inventory item:', error);
            throw error;
        }
    }

    // ============================================
    // STOCK MANAGEMENT
    // ============================================

    /**
     * Get stock for a specific branch
     */
    static async getStockByBranch(branchId: string): Promise<InventoryStock[]> {
        const client = ensureClient();

        const { data, error } = await client
            .from('inventory_stock')
            .select(`
        *,
        item:inventory_items(*)
      `)
            .eq('branch_id', branchId);

        if (error) {
            console.error('Error fetching stock:', error);
            throw error;
        }

        return data || [];
    }

    /**
     * Update stock quantity for an item in a branch
     */
    static async updateStock(
        itemId: string,
        branchId: string,
        quantity: number
    ): Promise<InventoryStock> {
        const client = ensureClient();

        // Check if stock record exists
        const { data: existing } = await client
            .from('inventory_stock')
            .select('*')
            .eq('item_id', itemId)
            .eq('branch_id', branchId)
            .single();

        if (existing) {
            // Update existing record
            const { data, error } = await client
                .from('inventory_stock')
                .update({ quantity })
                .eq('item_id', itemId)
                .eq('branch_id', branchId)
                .select()
                .single();

            if (error) {
                console.error('Error updating stock:', error);
                throw error;
            }

            return data;
        } else {
            // Create new record
            const { data, error } = await client
                .from('inventory_stock')
                .insert({
                    item_id: itemId,
                    branch_id: branchId,
                    quantity,
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating stock:', error);
                throw error;
            }

            return data;
        }
    }

    /**
     * Get low stock items
     */
    static async getLowStockItems(
        companyId: string,
        branchId?: string
    ): Promise<InventoryItemWithStock[]> {
        const allItems = await this.getInventoryItems(companyId, branchId);

        return allItems.filter(
            (item) =>
                item.stock_status === 'low_stock' || item.stock_status === 'out_of_stock'
        );
    }

    // ============================================
    // TRANSACTIONS
    // ============================================

    /**
     * Record a stock transaction (IN/OUT/ADJUST)
     */
    static async recordTransaction(
        transactionData: CreateTransactionData
    ): Promise<InventoryTransaction> {
        const client = ensureClient();

        // Get current user
        const {
            data: { user },
        } = await client.auth.getUser();

        // Insert transaction
        const { data, error } = await client
            .from('inventory_transactions')
            .insert({
                item_id: transactionData.item_id,
                branch_id: transactionData.branch_id,
                type: transactionData.type,
                quantity: transactionData.quantity,
                reference: transactionData.reference,
                notes: transactionData.notes,
                created_by: user?.id,
            })
            .select()
            .single();

        if (error) {
            console.error('Error recording transaction:', error);
            throw error;
        }

        // Update stock quantity
        const { data: currentStock } = await client
            .from('inventory_stock')
            .select('quantity')
            .eq('item_id', transactionData.item_id)
            .eq('branch_id', transactionData.branch_id)
            .single();

        const currentQuantity = currentStock?.quantity || 0;
        let newQuantity = currentQuantity;

        switch (transactionData.type) {
            case 'IN':
                newQuantity = currentQuantity + transactionData.quantity;
                break;
            case 'OUT':
                newQuantity = Math.max(0, currentQuantity - transactionData.quantity);
                break;
            case 'ADJUST':
                newQuantity = transactionData.quantity;
                break;
        }

        await this.updateStock(
            transactionData.item_id,
            transactionData.branch_id,
            newQuantity
        );

        return data;
    }

    /**
     * Get transaction history
     */
    static async getTransactionHistory(
        itemId?: string,
        branchId?: string,
        limit: number = 50
    ): Promise<InventoryTransaction[]> {
        const client = ensureClient();

        let query = client
            .from('inventory_transactions')
            .select(`
        *,
        item:inventory_items(*),
        branch:branches(*)
      `)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (itemId) {
            query = query.eq('item_id', itemId);
        }

        if (branchId) {
            query = query.eq('branch_id', branchId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching transaction history:', error);
            throw error;
        }

        return data || [];
    }

    // ============================================
    // VALUE CALCULATIONS
    // ============================================

    /**
     * Calculate total inventory value
     */
    static async calculateTotalInventoryValue(
        companyId: string,
        branchId?: string
    ): Promise<number> {
        const items = await this.getInventoryItems(companyId, branchId);

        return items.reduce((total, item) => total + item.total_value, 0);
    }

    /**
     * Get inventory value breakdown
     */
    static async getInventoryValueBreakdown(
        companyId: string,
        branchId?: string
    ): Promise<InventoryValueBreakdown[]> {
        const items = await this.getInventoryItems(companyId, branchId);

        return items
            .map((item) => ({
                item_id: item.id,
                item_name: item.name,
                sku: item.sku,
                quantity: item.stock_quantity,
                unit_price: item.unit_price,
                total_value: item.total_value,
                unit: item.unit,
            }))
            .sort((a, b) => b.total_value - a.total_value); // Sort by value descending
    }

    // ============================================
    // HELPER FUNCTIONS
    // ============================================

    /**
     * Calculate stock status based on quantity and threshold
     */
    static calculateStockStatus(
        quantity: number,
        threshold: number
    ): StockStatus {
        if (quantity === 0) {
            return 'out_of_stock';
        } else if (quantity <= threshold) {
            return 'low_stock';
        } else {
            return 'in_stock';
        }
    }

    /**
     * Sort items by stock status priority
     */
    static sortByStockPriority(
        items: InventoryItemWithStock[]
    ): InventoryItemWithStock[] {
        return items.sort((a, b) => {
            const priorityMap: Record<StockStatus, number> = {
                out_of_stock: 1,
                low_stock: 2,
                in_stock: 3,
            };

            const priorityA = priorityMap[a.stock_status];
            const priorityB = priorityMap[b.stock_status];

            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }

            // If same priority, sort alphabetically by name
            return a.name.localeCompare(b.name);
        });
    }
}
