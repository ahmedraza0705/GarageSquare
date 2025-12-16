// ============================================
// CUSTOMER DETAIL SCREEN
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { CustomerService } from '@/services/customer.service';
import { Customer } from '@/types';

export default function CustomerDetailScreen() {
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

  if (loading || !customer) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Text className="text-gray-500">Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadCustomer} />
      }
    >
      <View className="px-6 py-4">
        <View className="bg-white rounded-lg p-6 mb-4 shadow-sm">
          <Text className="text-2xl font-bold text-gray-900 mb-4">
            {customer.full_name}
          </Text>

          <View className="mb-4">
            <Text className="text-sm text-gray-500 mb-1">Email</Text>
            <Text className="text-base text-gray-900">
              {customer.email || 'N/A'}
            </Text>
          </View>

          <View className="mb-4">
            <Text className="text-sm text-gray-500 mb-1">Phone</Text>
            <Text className="text-base text-gray-900">
              {customer.phone}
            </Text>
          </View>

          {customer.address && (
            <View className="mb-4">
              <Text className="text-sm text-gray-500 mb-1">Address</Text>
              <Text className="text-base text-gray-900">
                {customer.address}
              </Text>
            </View>
          )}
        </View>

        {customer.vehicles && customer.vehicles.length > 0 && (
          <View className="bg-white rounded-lg p-6 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Vehicles ({customer.vehicles.length})
            </Text>
            {customer.vehicles.map((vehicle) => (
              <View key={vehicle.id} className="mb-4 pb-4 border-b border-gray-200 last:border-0">
                <Text className="text-base font-medium text-gray-900">
                  {vehicle.make} {vehicle.model}
                </Text>
                {vehicle.year && (
                  <Text className="text-sm text-gray-600">
                    Year: {vehicle.year}
                  </Text>
                )}
                {vehicle.license_plate && (
                  <Text className="text-sm text-gray-600">
                    Plate: {vehicle.license_plate}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

