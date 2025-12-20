// ============================================
// CUSTOMERS SCREEN (Manager)
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRole } from '@/hooks/useRole';
import { CustomerService } from '@/services/customer.service';
import { Customer } from '@/types';
import { getInitials } from '@/utils/string';
import { ChevronRight } from 'lucide-react-native';

export default function CustomersScreen() {
  const navigation = useNavigation();
  const { branchId } = useRole();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await CustomerService.getAll({ branch_id: branchId });
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
                {customer.email || customer.phone}
              </Text>
            </View>

            <ChevronRight color="#D1D5DB" size={24} />
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

