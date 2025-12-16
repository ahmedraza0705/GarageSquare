// ============================================
// CUSTOMERS SCREEN (Company Admin)
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { CustomerService } from '@/services/customer.service';
import { Customer } from '@/types';

export default function CustomersScreen() {
  const navigation = useNavigation();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await CustomerService.getAll();
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Header Component with Search
  const Header = () => (
    <View className="bg-gray-50 px-6 pt-4 pb-2">
      <View className="flex-row gap-3 mb-2">
        <View className="flex-1 flex-row items-center bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-100">
          <Text className="text-gray-400 mr-2">🔍</Text>
          <Text className="flex-1 text-gray-400">Search User</Text>
          <Text className="text-gray-400">T</Text>
        </View>
        <TouchableOpacity
          className="w-12 h-12 bg-green-100 rounded-lg items-center justify-center"
          onPress={() => navigation.navigate('CreateCustomer' as never)}
        >
          <Text className="text-green-600 text-xl font-bold">+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <Header />
      <ScrollView
        className="flex-1 px-6"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadCustomers} />
        }
      >
        <View className="py-2">
          {customers.map((customer) => (
            <TouchableOpacity
              key={customer.id}
              className="bg-white rounded-2xl p-4 mb-3 shadow-sm flex-row items-center"
              onPress={() => navigation.navigate('CustomerDetail' as never, { customerId: customer.id } as never)}
            >
              <View className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center mr-4">
                <Text className="text-white font-bold text-sm">
                  {customer.full_name.substring(0, 2).toUpperCase()}
                </Text>
              </View>

              <View className="flex-1">
                <Text className="text-base font-bold text-gray-900">
                  {customer.full_name}
                </Text>
                <Text className="text-gray-500 text-xs">
                  {customer.address || customer.phone}
                </Text>
              </View>

              <Text className="text-gray-400 text-xl">›</Text>
            </TouchableOpacity>
          ))}

          {customers.length === 0 && !loading && (
            <View className="items-center py-12">
              <Text className="text-gray-500">No customers found</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

