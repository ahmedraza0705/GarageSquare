// ============================================
// BRANCHES SCREEN (Company Admin)
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { supabase } from '@/lib/supabase';
import { Branch } from '@/types';

export default function BranchesScreen() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      setLoading(true);
      
      // Check if Supabase is disabled
      if (!supabase) {
        console.warn('Supabase is disabled - using local storage');
        setBranches([]);
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBranches(data || []);
    } catch (error) {
      console.error('Error loading branches:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadBranches} />
      }
    >
      <View className="px-6 py-4">
        {branches.map((branch) => (
          <TouchableOpacity
            key={branch.id}
            className="bg-white rounded-lg p-4 mb-4 shadow-sm"
          >
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              {branch.name}
            </Text>
            {branch.address && (
              <Text className="text-gray-600 text-sm mb-1">
                {branch.address}
              </Text>
            )}
            {branch.phone && (
              <Text className="text-gray-600 text-sm mb-1">
                {branch.phone}
              </Text>
            )}
            <View className="mt-2">
              <View className={`px-3 py-1 rounded-full self-start ${
                branch.is_active ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <Text className={`text-xs font-medium ${
                  branch.is_active ? 'text-green-800' : 'text-gray-800'
                }`}>
                  {branch.is_active ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {branches.length === 0 && !loading && (
          <View className="items-center py-12">
            <Text className="text-gray-500">No branches found</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

