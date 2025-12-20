import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useNavigation, DrawerActions, useFocusEffect } from '@react-navigation/native';
import { useRole } from '@/hooks/useRole';
import { VehicleService } from '@/services/vehicle.service';
import { Vehicle } from '@/types';
import { Menu, Search, Plus, Moon, Car, User, Building2, SlidersHorizontal } from 'lucide-react-native';

export default function VehiclesScreen() {
  const navigation = useNavigation();
  const { branchId, userProfile } = useRole();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      loadVehicles(false);
    }, [])
  );

  const loadVehicles = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await VehicleService.getAll({ branch_id: branchId });
      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const filteredVehicles = useMemo(() => {
    if (!searchQuery.trim()) return vehicles;
    const lowerQuery = searchQuery.toLowerCase();
    return vehicles.filter(v =>
      v.make.toLowerCase().includes(lowerQuery) ||
      v.model.toLowerCase().includes(lowerQuery) ||
      v.license_plate?.toLowerCase().includes(lowerQuery) ||
      (v.customer?.full_name && v.customer.full_name.toLowerCase().includes(lowerQuery))
    );
  }, [vehicles, searchQuery]);

  const initials = useMemo(() => {
    if (!userProfile?.full_name) return 'A';
    return userProfile.full_name.charAt(0).toUpperCase();
  }, [userProfile]);

  return (
    <SafeAreaView className="flex-1 bg-white" style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      {/* Header */}
      <View className="px-5 py-4 flex-row items-center justify-between bg-white border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            className="mr-4"
          >
            <Menu size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Vehicles Management</Text>
        </View>
        <View className="flex-row items-center">
          <TouchableOpacity className="mr-4">
            <Moon size={24} color="#FBBF24" fill="#FBBF24" />
          </TouchableOpacity>
          <TouchableOpacity className="bg-[#FCA5A5] w-10 h-10 items-center justify-center rounded-xl shadow-sm">
            <Text className="text-white font-bold text-lg">{initials}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search and Add Bar */}
      <View className="px-5 py-4 flex-row items-center bg-gray-50 border-b border-gray-100">
        <View className="flex-1 flex-row items-center bg-white rounded-lg px-3 py-2 border border-gray-200 shadow-sm mr-3">
          <Search size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Search User"
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-2 text-base text-gray-900"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

        </View>
        <TouchableOpacity
          className="bg-[#A7F3D0] p-2 rounded-lg items-center justify-center w-11 h-11 border border-[#6EE7B7]"
          onPress={() => navigation.navigate('CreateVehicle' as never)}
        >
          <Plus size={28} color="#059669" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 bg-[#F9FAFB]"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadVehicles} />
        }
      >
        {filteredVehicles.map((vehicle) => (
          <TouchableOpacity
            key={vehicle.id}
            className="bg-white rounded-xl p-5 mb-4 border border-gray-100"
            onPress={() => (navigation.navigate as any)('VehicleDetail', {
              vehicleId: vehicle.id,
              onUpdate: (updatedVehicle: Vehicle) => {
                setVehicles(currentVehicles =>
                  currentVehicles.map(v => v.id === updatedVehicle.id ? { ...v, ...updatedVehicle } : v)
                );
              }
            })}
            style={{
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
            }}
          >
            <View className="flex-row justify-between items-start">
              <View>
                <Text className="text-lg font-bold text-gray-900">
                  {vehicle.make} {vehicle.model}
                </Text>
                <Text className="text-gray-600 text-sm mt-1">
                  {vehicle.license_plate}
                </Text>
              </View>
              <Text className="text-gray-600 text-sm mt-1">
                {vehicle.branch_name}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {filteredVehicles.length === 0 && !loading && (
          <View className="items-center py-12">
            <Text className="text-gray-500 text-lg">No vehicles found</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

