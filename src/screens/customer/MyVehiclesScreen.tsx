// ============================================
// MY VEHICLES SCREEN (Customer)
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '@/types/navigation';
import { useAuth } from '@/hooks/useAuth';
import { VehicleService } from '@/services/vehicle.service';
import { Vehicle } from '@/types';
import { supabase } from '@/lib/supabase';

type NavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

export default function CustomerMyVehiclesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVehicles();
  }, [user]);

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

      if (!user?.id) {
        setVehicles([]);
        setLoading(false);
        return;
      }

      // Get customer ID
      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

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
            onPress={() => navigation.navigate('VehicleDetail', { vehicleId: vehicle.id })}
          >
            <Text className="text-lg font-semibold text-gray-900 mb-2">
              {vehicle.brand} {vehicle.model}
            </Text>
            {vehicle.year_manufacture && (
              <Text className="text-gray-600 text-sm mb-1">
                Year: {vehicle.year_manufacture}
              </Text>
            )}
            {vehicle.license_plate && (
              <Text className="text-gray-600 text-sm mb-1">
                Plate: {vehicle.license_plate}
              </Text>
            )}
            {vehicle.odometer && (
              <Text className="text-gray-600 text-sm">
                Odometer: {vehicle.odometer.toLocaleString()} KM
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

