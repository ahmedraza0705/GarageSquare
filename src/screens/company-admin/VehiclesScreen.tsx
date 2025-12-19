// ============================================
// VEHICLES SCREEN (Company Admin)
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { VehicleService } from '@/services/vehicle.service';
import { Vehicle } from '@/types';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function VehiclesScreen() {
  const navigation = useNavigation();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  // Add Vehicle Form State
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerId, setNewCustomerId] = useState('');
  const [newCustomerMail, setNewCustomerMail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, [searchQuery]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await VehicleService.getAll({ search: searchQuery });
      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async () => {
    if (!newCustomerName || !newCustomerId) {
      alert('Please fill in Customer Name and ID');
      return;
    }

    try {
      setSubmitting(true);
      // Creating a new vehicle with minimum required fields + customer info
      await VehicleService.create({
        customer_id: newCustomerId,
        customer_name: newCustomerName,
        customer_email: newCustomerMail,
        make: 'New Car', // Default for this quick add flow
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

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-4 py-4 bg-gray-50 border-b border-gray-200">
        {/* Search Bar Row */}
        <View className="flex-row items-center gap-2">
          <View className="flex-1 flex-row items-center bg-white rounded-lg px-3 py-2 border border-gray-200">
            <Ionicons name="search" size={20} color="#6b7280" />
            <TextInput
              className="flex-1 ml-2 text-base text-gray-900"
              placeholder="Search User"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity>
              <Ionicons name="filter-outline" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            className="bg-green-200 p-2 rounded-lg items-center justify-center w-10 h-10 border border-green-300"
            onPress={() => setIsAddModalVisible(true)}
          >
            <Ionicons name="add" size={24} color="#15803d" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1 bg-gray-50 px-4 pt-2"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadVehicles} />
        }
      >
        {vehicles.map((vehicle) => (
          <TouchableOpacity
            key={vehicle.id}
            className="bg-white rounded-xl p-4 mb-4 border border-gray-200 shadow-sm"
            onPress={() => navigation.navigate('VehicleDetail' as never, { vehicleId: vehicle.id } as never)}
          >
            <View className="flex-row justify-between mb-2">
              <View className="flex-row items-center gap-2">
                <Ionicons name="car-sport" size={20} color="#000" />
                <Text className="text-base font-bold text-gray-900">{vehicle.make} {vehicle.model}</Text>
              </View>
              <Text className="text-sm font-bold text-gray-900">{vehicle.license_plate}</Text>
            </View>

            <View className="flex-row justify-between mt-1">
              <View className="flex-row items-center gap-2">
                <Ionicons name="person" size={16} color="#000" />
                <Text className="text-xs font-bold text-gray-800 w-16">Customer : </Text>
              </View>
              <Text className="text-xs font-bold text-gray-900">{vehicle.customer?.full_name}</Text>
            </View>

            <View className="flex-row justify-between mt-2">
              <View className="flex-row items-center gap-2">
                <MaterialCommunityIcons name="office-building" size={16} color="#000" />
                <Text className="text-xs font-bold text-gray-800 w-16">Branch : </Text>
              </View>
              <Text className="text-xs font-bold text-gray-900">Surat , Gujarat</Text>
            </View>
          </TouchableOpacity>
        ))}

        {vehicles.length === 0 && !loading && (
          <View className="items-center py-12">
            <Text className="text-gray-500">No vehicles found</Text>
          </View>
        )}
        <View className="h-20" />
      </ScrollView>

      {/* Add Vehicle Modal */}
      <Modal
        visible={isAddModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View className="bg-white rounded-2xl w-full max-w-sm p-4">
            <Text className="text-sm font-bold text-gray-900 mb-1">Customer Name</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 text-gray-700"
              placeholder="Enter Customer Name"
              value={newCustomerName}
              onChangeText={setNewCustomerName}
            />

            <Text className="text-sm font-bold text-gray-900 mb-1">Customer ID</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 text-gray-700"
              placeholder="Enter Customer ID"
              value={newCustomerId}
              onChangeText={setNewCustomerId}
            />

            <Text className="text-sm font-bold text-gray-900 mb-1">Customer Mail</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4 text-gray-700"
              placeholder="Enter Customer Mail"
              value={newCustomerMail}
              onChangeText={setNewCustomerMail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity
              className="border border-gray-300 rounded-lg py-2 items-center self-end px-6 shadow-sm bg-white"
              onPress={handleAddVehicle}
              disabled={submitting}
            >
              <Text className="text-gray-900 font-medium text-xs">
                {submitting ? 'Adding...' : 'Add Vehicle'}
              </Text>
            </TouchableOpacity>
          </View>
          {/* Close modal by tapping outside? Or maybe add a close button? User design didn't show one but it's good UX. 
                I'll allow tapping background to close if needed, but for now rely on back button or restart if stuck? 
                Actually, standard Modal 'onRequestClose' handles back button on Android. 
                I'll add a tap listener on the background view if it wasn't overlapping the content. 
                The View covering full screen can handle touch end to close. 
            */}
          <TouchableOpacity
            className="absolute top-10 right-4 p-2 bg-white rounded-full"
            onPress={() => setIsAddModalVisible(false)}
          >
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

