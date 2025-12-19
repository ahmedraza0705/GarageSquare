// ============================================
// CUSTOMER DETAIL SCREEN
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useTheme } from '@/context/ThemeContext';
import { CustomerService } from '@/services/customer.service';
import { Customer } from '@/types';

export default function CustomerDetailScreen() {
  const { theme } = useTheme();
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
      <View style={{ flex: 1, backgroundColor: theme.background }} className="items-center justify-center">
        <Text style={{ color: theme.textMuted }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadCustomer} tintColor={theme.primary} />
      }
    >
      <View className="px-6 py-4">
        <View style={{ backgroundColor: theme.surface }} className="rounded-lg p-6 mb-4 shadow-sm">
          <Text style={{ color: theme.text }} className="text-2xl font-bold mb-4">
            {customer.full_name}
          </Text>

          <View className="mb-4">
            <Text style={{ color: theme.textMuted }} className="text-sm mb-1">Email</Text>
            <Text style={{ color: theme.text }} className="text-base">
              {customer.email || 'N/A'}
            </Text>
          </View>

          <View className="mb-4">
            <Text style={{ color: theme.textMuted }} className="text-sm mb-1">Phone</Text>
            <Text style={{ color: theme.text }} className="text-base">
              {customer.phone}
            </Text>
          </View>

          {customer.address && (
            <View className="mb-4">
              <Text style={{ color: theme.textMuted }} className="text-sm mb-1">Address</Text>
              <Text style={{ color: theme.text }} className="text-base">
                {customer.address}
              </Text>
            </View>
          )}
        </View>

        {customer.vehicles && customer.vehicles.length > 0 && (
          <View style={{ backgroundColor: theme.surface }} className="rounded-lg p-6 shadow-sm">
            <Text style={{ color: theme.text }} className="text-lg font-semibold mb-4">
              Vehicles ({customer.vehicles.length})
            </Text>
            {customer.vehicles.map((vehicle) => (
              <View key={vehicle.id} style={{ borderBottomColor: theme.border }} className="mb-4 pb-4 border-b last:border-0">
                <Text style={{ color: theme.text }} className="text-base font-medium">
                  {vehicle.make} {vehicle.model}
                </Text>
                {vehicle.year && (
                  <Text style={{ color: theme.textMuted }} className="text-sm">
                    Year: {vehicle.year}
                  </Text>
                )}
                {vehicle.license_plate && (
                  <Text style={{ color: theme.textMuted }} className="text-sm">
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

