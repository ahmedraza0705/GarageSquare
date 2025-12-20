import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput, SafeAreaView, Platform, StatusBar, Modal } from 'react-native';
import { useNavigation, DrawerActions, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/hooks/useAuth';
import { VehicleService } from '@/services/vehicle.service';
import { Vehicle } from '@/types';
import { Menu, Search, Plus, Moon, Car, User, Building2, X, SlidersHorizontal } from 'lucide-react-native';

import { supabase } from '@/lib/supabase';

export default function VehiclesScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  // Add Vehicle Form State
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerId, setNewCustomerId] = useState('');
  const [newCustomerMail, setNewCustomerMail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadVehicles(false);
    }, [searchQuery])
  );

  // Realtime subscription
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('vehicles-list-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vehicles' },
        () => {
          loadVehicles(false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [searchQuery]); // Re-subscribe if search query changes to keep refreshing with correct filter

  const loadVehicles = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const data = await VehicleService.getAll({ search: searchQuery });
      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleAddVehicle = async () => {
    if (!newCustomerName || !newCustomerId) {
      alert('Please fill in Customer Name and ID');
      return;
    }

    try {
      setSubmitting(true);
      await VehicleService.create({
        customer_id: newCustomerId,
        customer_name: newCustomerName,
        customer_email: newCustomerMail,
        make: 'New Car',
        model: 'Model',
        license_plate: 'NEW-PLATE',
        year: 2024
      });

      setIsAddModalVisible(false);
      setNewCustomerName('');
      setNewCustomerId('');
      setNewCustomerMail('');
      loadVehicles();
    } catch (error) {
      console.error('Error adding vehicle', error);
      alert('Failed to add vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  const initials = useMemo(() => {
    const name = user?.profile?.full_name || user?.email || 'A';
    return name.charAt(0).toUpperCase();
  }, [user]);

  return (
    <SafeAreaView className="flex-1 bg-white" style={{ paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      {/* Header Removed - Using Navigation Header */}

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
          onPress={() => setIsAddModalVisible(true)}
        >
          <Plus size={28} color="#059669" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 bg-[#F9FAFB]"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadVehicles} />
        }
      >
        {vehicles.map((vehicle) => (
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

        {vehicles.length === 0 && !loading && (
          <View className="items-center py-12">
            <Text className="text-gray-500 text-lg">No vehicles found</Text>
          </View>
        )}
      </ScrollView>

      {/* Add Vehicle Modal */}
      <Modal
        visible={isAddModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-900">Add New Vehicle</Text>
              <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text className="text-sm font-bold text-gray-900 mb-2">Customer Name</Text>
            <TextInput
              className="border border-gray-200 rounded-xl px-4 py-3 text-base mb-4 text-gray-900 bg-gray-50"
              placeholder="Enter Customer Name"
              value={newCustomerName}
              onChangeText={setNewCustomerName}
            />

            <Text className="text-sm font-bold text-gray-900 mb-2">Customer ID</Text>
            <TextInput
              className="border border-gray-200 rounded-xl px-4 py-3 text-base mb-4 text-gray-900 bg-gray-50"
              placeholder="Enter Customer ID"
              value={newCustomerId}
              onChangeText={setNewCustomerId}
            />

            <Text className="text-sm font-bold text-gray-900 mb-2">Customer Mail</Text>
            <TextInput
              className="border border-gray-200 rounded-xl px-4 py-3 text-base mb-6 text-gray-900 bg-gray-50"
              placeholder="Enter Customer Mail"
              value={newCustomerMail}
              onChangeText={setNewCustomerMail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity
              className="bg-blue-600 rounded-xl py-4 items-center shadow-md active:bg-blue-700"
              onPress={handleAddVehicle}
              disabled={submitting}
            >
              <Text className="text-white font-bold text-base">
                {submitting ? 'Adding...' : 'Add Vehicle'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

