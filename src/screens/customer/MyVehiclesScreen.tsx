// ============================================
// MY VEHICLES SCREEN (Customer)
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { VehicleService } from '@/services/vehicle.service';
import { Vehicle } from '@/types';
import { supabase } from '@/lib/supabase';

export default function CustomerMyVehiclesScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      
      // Check if Supabase is disabled
      if (!supabase) {
        console.warn('Supabase is disabled - using local storage');
        setVehicles([]);
        setLoading(false);
        return;
      }
      
      // Get customer ID
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', user?.id)
        .single();

      if (customer) {
        const data = await VehicleService.getAll({ customer_id: customer.id });
        setVehicles(data);
      }
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
            {vehicle.mileage && (
              <Text className="text-gray-600 text-sm">
                Mileage: {vehicle.mileage.toLocaleString()} miles
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


