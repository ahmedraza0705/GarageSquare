// ============================================
// CUSTOMERS SCREEN (Company Admin)
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
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

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadCustomers} />
      }
    >
      <View className="px-6 py-4">
        <TouchableOpacity
          className="bg-primary-600 rounded-lg p-4 mb-4"
          onPress={() => navigation.navigate('CreateCustomer' as never)}
        >
          <Text className="text-white font-semibold text-center">
            + Add Customer
          </Text>
        </TouchableOpacity>

        {customers.map((customer) => (
          <TouchableOpacity
            key={customer.id}
            className="bg-white rounded-lg p-4 mb-4 shadow-sm"
            onPress={() => navigation.navigate('CustomerDetail' as never, { customerId: customer.id } as never)}
          >
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              {customer.full_name}
            </Text>
            {customer.email && (
              <Text className="text-gray-600 text-sm mb-1">
                {customer.email}
              </Text>
            )}
            <Text className="text-gray-600 text-sm">
              {customer.phone}
            </Text>
          </TouchableOpacity>
        ))}

        {customers.length === 0 && !loading && (
          <View className="items-center py-12">
            <Text className="text-gray-500">No customers found</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

