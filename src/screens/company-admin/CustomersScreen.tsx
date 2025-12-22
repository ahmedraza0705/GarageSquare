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

import { Ionicons } from '@expo/vector-icons';

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
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadCustomers(true)}
            tintColor={theme.primary}
          />
        }
      >
        <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
          {/* Search Bar and Add Button */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <View style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.surface,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginRight: 12,
              borderWidth: 1,
              borderColor: theme.border
            }}>
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                placeholder="Search Customer"
                style={{ flex: 1, marginLeft: 8, color: theme.text, fontWeight: '500' }}
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={handleSearch}
                autoCorrect={false}
              />
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: theme.tabIconBg,
                padding: 12,
                borderRadius: 12,
                width: 48,
                height: 48,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: theme.primary
              }}
              onPress={() => navigation.navigate('CreateCustomer' as never)}
            >
              <Ionicons name="add" size={24} color={theme.primary} />
            </TouchableOpacity>
          </View>

          {loading && !refreshing && (
            <View style={{ paddingVertical: 48, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={{ color: theme.textMuted, marginTop: 16, fontSize: 16 }}>Loading customers...</Text>
            </View>
          )}

          {error && !loading && (
            <View style={{ paddingVertical: 48, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
              <Text style={{ textAlign: 'center', fontSize: 16, marginBottom: 24, color: theme.notification }}>{error}</Text>
              <TouchableOpacity
                onPress={() => loadCustomers(false)}
                style={{ backgroundColor: theme.primary, paddingHorizontal: 32, paddingVertical: 12, borderRadius: 12 }}
              >
                <Text style={{ color: theme.onPrimary, fontWeight: 'bold', fontSize: 16 }}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {!loading && !error && filteredCustomers.length === 0 ? (
            <View style={{ paddingVertical: 48, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: theme.textMuted, fontSize: 16 }}>No customers found</Text>
            </View>
          ) : (
            <View>
              {filteredCustomers.map((customer) => (
                <TouchableOpacity
                  key={customer.id}
                  style={{
                    backgroundColor: theme.surface,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: theme.border
                  }}
                  onPress={() => (navigation.navigate as any)('CustomerDetail', { customerId: customer.id })}
                >
                  <View style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: '#3B82F6',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 16
                  }}>
                    <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 }}>
                      {getInitials(customer.full_name)}
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.text, marginBottom: 2 }}>
                      {customer.full_name}
                    </Text>
                    <Text style={{ color: '#9CA3AF', fontSize: 12, fontWeight: '500' }} numberOfLines={1}>
                      {customer.address || 'No address provided'}
                    </Text>
                  </View>

                  <Text style={{ fontSize: 20, fontWeight: '300', color: theme.border, marginLeft: 8 }}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
