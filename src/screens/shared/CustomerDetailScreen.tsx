// ============================================
// CUSTOMER DETAIL SCREEN
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { CustomerService } from '@/services/customer.service';
import { Customer } from '@/types';

export default function CustomerDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { customerId } = route.params as { customerId: string };
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomer();
  }, []);

  const loadCustomer = async () => {
    try {
      setLoading(true);
      const data = await CustomerService.getById(customerId);
      setCustomer(data);
    } catch (error) {
      console.error('Error loading customer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await CustomerService.delete(customerId);
      navigation.goBack();
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  if (loading || !customer) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Loading...</Text>
      </View>
    );
  }

  // Helper for Stats
  const StatsCard = ({ icon, label, count }: { icon: string, label: string, count: string }) => (
    <View className="bg-white p-3 rounded-xl shadow-sm flex-1 mr-2 mb-2 items-start justify-center min-w-[45%]">
      <Text className="text-xl mb-1">{icon}</Text>
      <Text className="text-gray-900 font-bold">{label}</Text>
      <Text className="text-gray-400 text-xs">{count}</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadCustomer} />
        }
      >
        {/* Header Profile Section */}
        <View className="items-center py-6">
          <View className="w-24 h-24 bg-blue-800 rounded-full items-center justify-center mb-4 border-4 border-white shadow-sm">
            {/* Replace with Image if available, using initial for now */}
            <Text className="text-4xl text-white font-bold">{customer.full_name?.substring(0, 1).toUpperCase()}</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900">{customer.full_name}</Text>
        </View>

        <View className="px-6 pb-6">
          {/* Contact Info Cards */}
          <View className="bg-white p-4 rounded-xl shadow-sm mb-3 flex-row items-center">
            <View className="w-10 h-10 bg-gray-100 rounded-lg items-center justify-center mr-3">
              <Text>✉️</Text>
            </View>
            <View>
              <Text className="text-gray-400 text-xs text-left mb-0.5">Email Address</Text>
              <Text className="text-gray-900 font-semibold">{customer.email || 'N/A'}</Text>
            </View>
          </View>

          <View className="bg-white p-4 rounded-xl shadow-sm mb-3 flex-row items-center">
            <View className="w-10 h-10 bg-gray-100 rounded-lg items-center justify-center mr-3">
              <Text>📞</Text>
            </View>
            <View>
              <Text className="text-gray-400 text-xs text-left mb-0.5">Phone Number</Text>
              <Text className="text-gray-900 font-semibold">{customer.phone}</Text>
            </View>
          </View>

          <View className="bg-white p-4 rounded-xl shadow-sm mb-6 flex-row items-center">
            <View className="w-10 h-10 bg-gray-100 rounded-lg items-center justify-center mr-3">
              <Text>📍</Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-400 text-xs text-left mb-0.5">Address</Text>
              <Text className="text-gray-900 font-semibold">{customer.address || 'N/A'}</Text>
            </View>
          </View>

          {/* Stats Grid */}
          <View className="flex-row flex-wrap mb-4">
            <StatsCard icon="🚗" label="Vehicles" count={`(${customer.vehicles?.length || 0})`} />
            <StatsCard icon="📋" label="Invoices" count="(9)" />
            <StatsCard icon="📝" label="Job Cards" count="(7)" />
            <StatsCard icon="📅" label="Last Visit" count="5 Days Ago" />
          </View>

        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View className="px-6 py-4 bg-white border-t border-gray-100 flex-row gap-4 mb-4">
        <TouchableOpacity
          className="flex-1 border border-red-200 py-3 rounded-full items-center justify-center bg-white"
          onPress={handleDelete}
        >
          <Text className="text-red-500 font-semibold">Delete</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 border border-green-200 py-3 rounded-full items-center justify-center bg-white"
        // onPress={() => navigation.navigate('EditCustomer', { customerId })}
        >
          <Text className="text-green-600 font-semibold">Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

