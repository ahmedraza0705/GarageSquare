// ============================================
// BRANCHES SCREEN (Company Admin)
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Branch } from '@/types';
import { BranchService } from '@/services/branch.service';

export default function BranchesScreen() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  // Use focus effect to reload when screen comes into focus
  // Note: Simple useEffect for now, but ideally useFocusEffect from @react-navigation/native
  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      setLoading(true);
      const data = await BranchService.getCompanyBranches();
      setBranches(data || []);
    } catch (error) {
      console.error('Error loading branches:', error);
      // In a real app, show a toast/alert here
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBranch = () => {
    // Navigate to create branch screen (to be implemented)
    console.log('Navigate to Create Branch');
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header Action */}
      <View className="px-6 py-4 bg-white border-b border-gray-200 flex-row justify-between items-center">
        <Text className="text-xl font-bold text-gray-900">All Branches</Text>
        <TouchableOpacity
          onPress={handleCreateBranch}
          className="bg-blue-600 px-4 py-2 rounded-lg active:opacity-80"
        >
          <Text className="text-white font-semibold">+ New Branch</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadBranches} />
        }
      >
        {branches.map((branch) => (
          <TouchableOpacity
            key={branch.id}
            className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-gray-100"
          >
            <View className="flex-row justify-between items-start mb-2">
              <Text className="text-lg font-bold text-gray-900 flex-1 mr-2">
                {branch.name}
              </Text>
              <View className={`px-2.5 py-0.5 rounded-full ${branch.is_active ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                <Text className={`text-xs font-semibold ${branch.is_active ? 'text-green-700' : 'text-gray-700'
                  }`}>
                  {branch.is_active ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>

            <View className="space-y-1">
              {branch.address && (
                <Text className="text-gray-600 text-sm" numberOfLines={1}>
                  📍 {branch.address}
                </Text>
              )}
              {branch.phone && (
                <Text className="text-gray-600 text-sm">
                  📞 {branch.phone}
                </Text>
              )}
              {branch.email && (
                <Text className="text-gray-600 text-sm">
                  ✉️ {branch.email}
                </Text>
              )}
            </View>

            {/* Footer action hint */}
            <View className="mt-4 pt-3 border-t border-gray-50 flex-row justify-end">
              <Text className="text-blue-600 text-sm font-medium">View Details →</Text>
            </View>
          </TouchableOpacity>
        ))}

        {branches.length === 0 && !loading && (
          <View className="items-center py-12">
            <Text className="text-gray-400 text-lg mb-2">No branches yet</Text>
            <Text className="text-gray-500 text-center px-8">
              Create your first branch to start managing operations.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

