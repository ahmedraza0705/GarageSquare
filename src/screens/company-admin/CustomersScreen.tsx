// ============================================
// CUSTOMERS SCREEN (Company Admin)
// ============================================

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@/context/ThemeContext';
import { CustomerService } from '@/services/customer.service';
import { Customer } from '@/types';
import { getInitials } from '@/utils/string';

export default function CustomersScreen() {
  const { theme } = useTheme();
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
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      {/* Search Header */}
      <View
        className="px-6 pt-2 pb-1 border-b"
        style={{ backgroundColor: theme.surface, borderBottomColor: theme.border }}
      >
        <View className="flex-row items-center gap-3">
          <View
            className="flex-1 flex-row items-center rounded-2xl px-4 py-3 border"
            style={{ backgroundColor: theme.background, borderColor: theme.border }}
          >
            <Text style={{ color: theme.textMuted }} className="mr-2 text-lg">🔍</Text>
            <TextInput
              className="flex-1 text-base"
              style={{ color: theme.text }}
              placeholder="Search User"
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={handleSearch}
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('CreateCustomer' as never)}
            className="w-12 h-12 rounded-2xl items-center justify-center"
            style={{ backgroundColor: theme.primary + '20' }} // 20% opacity primary
          >
            <Text style={{ color: theme.primary }} className="text-2xl font-bold">+</Text>
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
            tintColor={theme.primary}
          />
        }
      >
        <View className="pt-0 pb-4">
          {loading && !refreshing && (
            <View className="py-20 items-center justify-center">
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={{ color: theme.textMuted }} className="mt-4 text-lg">Loading customers...</Text>
            </View>
          )}

          {error && !loading && (
            <View className="py-20 items-center justify-center px-6">
              <Text className="text-center text-lg mb-6" style={{ color: theme.notification }}>{error}</Text>
              <TouchableOpacity
                onPress={() => loadCustomers(false)}
                className="px-8 py-3 rounded-2xl shadow-sm"
                style={{ backgroundColor: theme.primary }}
              >
                <Text style={{ color: theme.onPrimary }} className="font-bold text-lg">Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {!loading && !error && filteredCustomers.length === 0 ? (
            <View className="py-20 items-center justify-center">
              <Text style={{ color: theme.textMuted }} className="text-lg">No customers found</Text>
            </View>
          ) : (
            filteredCustomers.map((customer) => (
              <TouchableOpacity
                key={customer.id}
                className="rounded-3xl p-5 mt-4 shadow-sm flex-row items-center border"
                style={{ backgroundColor: theme.surface, borderColor: theme.border }}
                onPress={() => (navigation.navigate as any)('CustomerDetail', { customerId: customer.id })}
              >
                <View className="w-14 h-14 rounded-full items-center justify-center mr-4 shadow-sm" style={{ backgroundColor: theme.avatarBg }}>
                  <Text style={{ color: theme.avatarText }} className="font-bold text-lg">
                    {getInitials(customer.full_name)}
                  </Text>
                </View>

                <View className="flex-1">
                  <Text className="text-lg font-bold mb-1" style={{ color: theme.text }}>
                    {customer.full_name}
                  </Text>
                  <Text className="text-sm" style={{ color: theme.textMuted }} numberOfLines={1}>
                    {customer.address || 'No address provided'}
                  </Text>
                </View>

                <Text className="text-xl font-light ml-2" style={{ color: theme.border }}>›</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
