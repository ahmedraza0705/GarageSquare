// ============================================
// BRANCH MANAGEMENT HOOKS
// ============================================
// Custom hooks for managing branches with Supabase

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Branch } from '@/types';

// ============================================
// FETCH ALL BRANCHES
// ============================================
export function useBranches() {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBranches = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!supabase) {
                throw new Error('Supabase client not initialized');
            }

            const { data, error: fetchError } = await supabase
                .from('branches')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;

            setBranches(data || []);
        } catch (err: any) {
            console.error('Error fetching branches:', err);
            setError(err.message || 'Failed to fetch branches');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBranches();

        // Subscribe to real-time changes
        if (!supabase) return;

        const subscription = supabase
            .channel('branches_changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'branches' },
                (payload) => {
                    console.log('Branch change detected:', payload);
                    fetchBranches(); // Refetch on any change
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return { branches, loading, error, refetch: fetchBranches };
}

// ============================================
// FETCH SINGLE BRANCH
// ============================================
export function useBranch(branchId: string) {
    const [branch, setBranch] = useState<Branch | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBranch = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!supabase) {
                throw new Error('Supabase client not initialized');
            }

            const { data, error: fetchError } = await supabase
                .from('branches')
                .select('*')
                .eq('id', branchId)
                .single();

            if (fetchError) throw fetchError;

            setBranch(data);
        } catch (err: any) {
            console.error('Error fetching branch:', err);
            setError(err.message || 'Failed to fetch branch');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (branchId) {
            fetchBranch();
        }
    }, [branchId]);

    return { branch, loading, error, refetch: fetchBranch };
}

// ============================================
// CREATE BRANCH
// ============================================
export function useCreateBranch() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createBranch = async (branchData: Omit<Branch, 'id' | 'created_at' | 'updated_at'>) => {
        try {
            setLoading(true);
            setError(null);

            if (!supabase) {
                throw new Error('Supabase client not initialized');
            }

            const { data, error: insertError } = await supabase
                .from('branches')
                .insert([branchData])
                .select()
                .single();

            if (insertError) throw insertError;

            return { data, error: null };
        } catch (err: any) {
            console.error('Error creating branch:', err);
            const errorMessage = err.message || 'Failed to create branch';
            setError(errorMessage);
            return { data: null, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    return { createBranch, loading, error };
}

// ============================================
// UPDATE BRANCH
// ============================================
export function useUpdateBranch() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateBranch = async (branchId: string, updates: Partial<Branch>) => {
        try {
            setLoading(true);
            setError(null);

            if (!supabase) {
                throw new Error('Supabase client not initialized');
            }

            const { data, error: updateError } = await supabase
                .from('branches')
                .update(updates)
                .eq('id', branchId)
                .select()
                .single();

            if (updateError) throw updateError;

            return { data, error: null };
        } catch (err: any) {
            console.error('Error updating branch:', err);
            const errorMessage = err.message || 'Failed to update branch';
            setError(errorMessage);
            return { data: null, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    return { updateBranch, loading, error };
}

// ============================================
// DELETE BRANCH (Soft delete - set is_active to false)
// ============================================
export function useDeleteBranch() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteBranch = async (branchId: string, hardDelete: boolean = false) => {
        try {
            setLoading(true);
            setError(null);

            if (!supabase) {
                throw new Error('Supabase client not initialized');
            }

            if (hardDelete) {
                // Hard delete - permanently remove from database
                const { error: deleteError } = await supabase
                    .from('branches')
                    .delete()
                    .eq('id', branchId);

                if (deleteError) throw deleteError;
            } else {
                // Soft delete - just mark as inactive
                const { error: updateError } = await supabase
                    .from('branches')
                    .update({ is_active: false })
                    .eq('id', branchId);

                if (updateError) throw updateError;
            }

            return { error: null };
        } catch (err: any) {
            console.error('Error deleting branch:', err);
            const errorMessage = err.message || 'Failed to delete branch';
            setError(errorMessage);
            return { error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    return { deleteBranch, loading, error };
}

// ============================================
// SEARCH BRANCHES
// ============================================
export function useSearchBranches(searchQuery: string) {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const searchBranches = async () => {
            if (!searchQuery.trim()) {
                setBranches([]);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                if (!supabase) {
                    throw new Error('Supabase client not initialized');
                }

                const { data, error: searchError } = await supabase
                    .from('branches')
                    .select('*')
                    .eq('is_active', true)
                    .or(`name.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%`)
                    .order('created_at', { ascending: false });

                if (searchError) throw searchError;

                setBranches(data || []);
            } catch (err: any) {
                console.error('Error searching branches:', err);
                setError(err.message || 'Failed to search branches');
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(searchBranches, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    return { branches, loading, error };
}
