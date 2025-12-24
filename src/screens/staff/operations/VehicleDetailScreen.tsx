// ============================================
// VEHICLE DETAIL SCREEN
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { VehicleService } from '@/services/vehicle.service';
import { Vehicle } from '@/types';

export default function VehicleDetailScreen() {
  const route = useRoute();
  const { vehicleId } = route.params as { vehicleId: string };
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVehicle();
  }, []);

  const loadVehicle = async () => {
    try {
      setLoading(true);
      const data = await VehicleService.getById(vehicleId);
      setVehicle(data);
    } catch (error) {
      console.error('Error loading vehicle:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !vehicle) {
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
        <RefreshControl refreshing={loading} onRefresh={loadVehicle} />
      }
    >
      <View className="px-6 py-4">
        <View className="bg-white rounded-lg p-6 mb-4 shadow-sm">
          <Text className="text-2xl font-bold text-gray-900 mb-4">
            {vehicle.make} {vehicle.model}
          </Text>

          {vehicle.year && (
            <View className="mb-4">
              <Text className="text-sm text-gray-500 mb-1">Year</Text>
              <Text className="text-base text-gray-900">
                {vehicle.year}
              </Text>
            </View>
          )}

          {vehicle.vin && (
            <View className="mb-4">
              <Text className="text-sm text-gray-500 mb-1">VIN</Text>
              <Text className="text-base text-gray-900">
                {vehicle.vin}
              </Text>
            </View>
          )}

          {vehicle.license_plate && (
            <View className="mb-4">
              <Text className="text-sm text-gray-500 mb-1">License Plate</Text>
              <Text className="text-base text-gray-900">
                {vehicle.license_plate}
              </Text>
            </View>
          )}

          {vehicle.color && (
            <View className="mb-4">
              <Text className="text-sm text-gray-500 mb-1">Color</Text>
              <Text className="text-base text-gray-900">
                {vehicle.color}
              </Text>
            </View>
          )}

          {vehicle.mileage && (
            <View className="mb-4">
              <Text className="text-sm text-gray-500 mb-1">Mileage</Text>
              <Text className="text-base text-gray-900">
                {vehicle.mileage.toLocaleString()} miles
              </Text>
            </View>
          )}

          {vehicle.notes && (
            <View className="mb-4">
              <Text className="text-sm text-gray-500 mb-1">Notes</Text>
              <Text className="text-base text-gray-900">
                {vehicle.notes}
              </Text>
            </View>
          )}

          {vehicle.customer && (
            <View>
              <Text className="text-sm text-gray-500 mb-1">Owner</Text>
              <Text className="text-base text-gray-900">
                {vehicle.customer.full_name}
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

