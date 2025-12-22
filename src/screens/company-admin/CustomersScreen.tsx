// ============================================
// CUSTOMERS SCREEN (Company Admin)
// ============================================

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput, ActivityIndicator } from 'react-native';
import { DrawerActions, useNavigation, useFocusEffect } from '@react-navigation/native';
import { CustomerService } from '@/services/customer.service';
import { Customer } from '@/types';
import { getInitials } from '@/utils/string';

export default function CustomersScreen() {
  const navigation = useNavigation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadCustomers = async (isManualRefresh = false) => {
    try {
      setError(null);
      if (isManualRefresh) {
        setRefreshing(true);
      } else if (customers.length === 0) {
        setLoading(true);
      }

      console.log('Fetching customers...');
      const data = await CustomerService.getAll();
      console.log('Fetched customers count:', data?.length || 0);
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (err: any) {
      console.error('Error loading customers:', err);
      setError(err.message || 'Failed to load customers. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Reload data whenever the screen comes into focus - Silent reload
  useFocusEffect(
    useCallback(() => {
      loadCustomers(false);
    }, [])
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredCustomers(customers);
      return;
    }

    const filtered = customers.filter((customer) =>
      customer.full_name.toLowerCase().includes(query.toLowerCase()) ||
      customer.phone.toLowerCase().includes(query.toLowerCase()) ||
      (customer.address && customer.address.toLowerCase().includes(query.toLowerCase()))
    );
    setFilteredCustomers(filtered);
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Search Header */}
      <View className="bg-white px-6 pt-2 pb-1 border-b border-gray-100">
        <View className="flex-row items-center gap-3">
          <View className="flex-1 flex-row items-center bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100">
            <Text className="text-gray-400 mr-2 text-lg">🔍</Text>
            <TextInput
              className="flex-1 text-gray-900 text-base"
              placeholder="Search Customer"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={handleSearch}
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('CreateCustomer' as never)}
            className="w-12 h-12 bg-green-100 rounded-2xl items-center justify-center"
          >
            <Text className="text-green-600 text-2xl font-bold">+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadCustomers(true)}
            tintColor="#2563EB"
          />
        }
      >
        <View className="pt-0 pb-4">
          {loading && !refreshing && (
            <View className="py-20 items-center justify-center">
              <ActivityIndicator size="large" color="#2563EB" />
              <Text className="text-gray-400 mt-4 text-lg">Loading customers...</Text>
            </View>
          )}

          {error && !loading && (
            <View className="py-20 items-center justify-center px-6">
              <Text className="text-red-500 text-center text-lg mb-6">{error}</Text>
              <TouchableOpacity
                onPress={() => loadCustomers(false)}
                className="bg-blue-600 px-8 py-3 rounded-2xl shadow-sm"
              >
                <Text className="text-white font-bold text-lg">Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {!loading && !error && filteredCustomers.length === 0 ? (
            <View className="py-20 items-center justify-center">
              <Text className="text-gray-400 text-lg">No customers found</Text>
            </View>
          ) : (
            filteredCustomers.map((customer) => (
              <TouchableOpacity
                key={customer.id}
                className="bg-white rounded-3xl p-5 mt-4 shadow-sm flex-row items-center border border-gray-50"
                onPress={() => (navigation.navigate as any)('CustomerDetail', { customerId: customer.id })}
              >
                <View className="w-14 h-14 rounded-full bg-[#4682B4] items-center justify-center mr-4 shadow-sm">
                  <Text className="text-white font-bold text-lg">
                    {getInitials(customer.full_name)}
                  </Text>
                </View>

                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900 mb-1">
                    {customer.full_name}
                  </Text>
                  <Text className="text-gray-400 text-sm" numberOfLines={1}>
                    {customer.address || 'No address provided'}
                  </Text>
                </View>

                <Text className="text-gray-300 text-xl font-light ml-2">›</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
