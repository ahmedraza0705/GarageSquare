// ============================================
// MY VEHICLES SCREEN (Customer)
// ============================================

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '@/types/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/context/ThemeContext';
import { VehicleService } from '@/services/vehicle.service';
import { Vehicle } from '@/types';
import { supabase } from '@/lib/supabase';
import { Car, ChevronRight } from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<CustomerStackParamList>;

export default function CustomerMyVehiclesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { theme, themeName } = useTheme();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVehicles();
  }, [user]);

  const loadVehicles = async () => {
    try {
      setLoading(true);

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
      className="flex-1"
      style={{ backgroundColor: theme.background }}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadVehicles} tintColor={theme.primary} />
      }
    >
      <View className="px-5 py-6">
        {vehicles.length > 0 ? vehicles.map((vehicle) => (
          <TouchableOpacity
            key={vehicle.id}
            className="rounded-2xl p-5 mb-5 border flex-row items-center justify-between"
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.border,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 10,
              elevation: 2,
            }}
            onPress={() => navigation.navigate('VehicleDetail', { vehicleId: vehicle.id })}
          >
            <View className="flex-1">
              <View className="flex-row items-center gap-3 mb-2">
                <View className="p-2 rounded-xl" style={{ backgroundColor: theme.surfaceAlt }}>
                  <Car size={20} color={theme.primary} />
                </View>
                <Text className="text-lg font-bold" style={{ color: theme.text }}>
                  {vehicle.brand} {vehicle.model}
                </Text>
              </View>

              <View className="flex-row items-center gap-4 pl-1">
                <View>
                  <Text className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.textMuted }}>License Plate</Text>
                  <Text className="text-sm font-semibold" style={{ color: theme.text }}>{vehicle.license_plate || 'N/A'}</Text>
                </View>
                {vehicle.year_manufacture && (
                  <View>
                    <Text className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.textMuted }}>Year</Text>
                    <Text className="text-sm font-semibold" style={{ color: theme.text }}>{vehicle.year_manufacture}</Text>
                  </View>
                )}
                {vehicle.odometer && (
                  <View>
                    <Text className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.textMuted }}>Odometer</Text>
                    <Text className="text-sm font-semibold" style={{ color: theme.text }}>{vehicle.odometer.toLocaleString()} KM</Text>
                  </View>
                )}
              </View>
            </View>
            <ChevronRight size={20} color={theme.border} />
          </TouchableOpacity>
        )) : !loading && (
          <View className="items-center py-20 justify-center">
            <View className="w-20 h-20 rounded-full items-center justify-center mb-4" style={{ backgroundColor: theme.surfaceAlt }}>
              <Car size={32} color={theme.textMuted} />
            </View>
            <Text className="text-lg font-bold" style={{ color: theme.text }}>No Vehicles Found</Text>
            <Text className="text-sm mt-1" style={{ color: theme.textMuted }}>Your registered vehicles will appear here</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
