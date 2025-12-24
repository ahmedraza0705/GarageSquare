// ============================================
// VEHICLES SCREEN (Manager)
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useRole } from '@/hooks/useRole';
import { VehicleService } from '@/services/vehicle.service';
import { Vehicle } from '@/types';

export default function VehiclesScreen() {
  const navigation = useNavigation();
  const { branchId } = useRole();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await VehicleService.getAll({ branch_id: branchId });
      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadVehicles} />
      }
    >
      <View className="px-6 py-4">
        <TouchableOpacity
          className="bg-primary-600 rounded-lg p-4 mb-4"
          onPress={() => navigation.navigate('CreateVehicle' as never)}
        >
          <Text className="text-white font-semibold text-center">
            + Add Vehicle
          </Text>
        </TouchableOpacity>

        {vehicles.map((vehicle) => (
          <TouchableOpacity
            key={vehicle.id}
            className="bg-white rounded-lg p-4 mb-4 shadow-sm"
            onPress={() => (navigation as any).navigate('VehicleDetail', { vehicleId: vehicle.id })}
          >
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              {vehicle.make} {vehicle.model}
            </Text>
            {vehicle.year && (
              <Text className="text-gray-600 text-sm mb-1">
                Year: {vehicle.year}
              </Text>
            )}
            {vehicle.license_plate && (
              <Text className="text-gray-600 text-sm mb-1">
                Plate: {vehicle.license_plate}
              </Text>
            )}
            {vehicle.customer && (
              <Text className="text-gray-600 text-sm">
                Owner: {vehicle.customer.full_name}
              </Text>
            )}
          </TouchableOpacity>
        ))}

        {vehicles.length === 0 && !loading && (
          <View className="items-center py-12">
            <Text className="text-gray-500">No vehicles found</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}


