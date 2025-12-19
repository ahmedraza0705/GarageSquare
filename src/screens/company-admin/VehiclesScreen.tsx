// ============================================
// VEHICLES SCREEN (Company Admin)
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { VehicleService } from '@/services/vehicle.service';
import { Vehicle } from '@/types';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

export default function VehiclesScreen() {
  const { theme } = useTheme();
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
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={{ backgroundColor: theme.headerBg, borderBottomColor: theme.headerBorder }} className="px-4 py-4 border-b">
        {/* Search Bar Row */}
        <View className="flex-row items-center gap-2">
          <View style={{ backgroundColor: theme.surface }} className="flex-1 flex-row items-center rounded-lg px-3 py-2">
            <Ionicons name="search" size={20} color={theme.textMuted} />
            <TextInput
              style={{ color: theme.text }}
              className="flex-1 ml-2 text-base"
              placeholder="Search User"
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity>
              <Ionicons name="filter-outline" size={20} color={theme.textMuted} />
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
        style={{ flex: 1, backgroundColor: theme.background }}
        className="px-4 pt-2"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadVehicles} tintColor={theme.primary} />
        }
      >
        {vehicles.map((vehicle) => (
          <TouchableOpacity
            key={vehicle.id}
            style={{ backgroundColor: theme.surface }}
            className="rounded-xl p-4 mb-4 shadow-sm"
            onPress={() => (navigation.navigate as any)('VehicleDetail', { vehicleId: vehicle.id })}
          >
            <View className="flex-row justify-between mb-2">
              <View className="flex-row items-center gap-2">
                <Ionicons name="car-sport" size={20} color={theme.text} />
                <Text style={{ color: theme.text }} className="text-base font-bold">{vehicle.make} {vehicle.model}</Text>
              </View>
              <Text style={{ color: theme.text }} className="text-sm font-bold">{vehicle.license_plate}</Text>
            </View>

            <View className="flex-row justify-between mt-1">
              <View className="flex-row items-center gap-2">
                <Ionicons name="person" size={16} color={theme.textMuted} />
                <Text style={{ color: theme.textMuted }} className="text-xs font-bold w-16">Customer : </Text>
              </View>
              <Text style={{ color: theme.text }} className="text-xs font-bold">{vehicle.customer?.full_name}</Text>
            </View>

            <View className="flex-row justify-between mt-2">
              <View className="flex-row items-center gap-2">
                <MaterialCommunityIcons name="office-building" size={16} color={theme.textMuted} />
                <Text style={{ color: theme.textMuted }} className="text-xs font-bold w-16">Branch : </Text>
              </View>
              <Text style={{ color: theme.text }} className="text-xs font-bold">Surat , Gujarat</Text>
            </View>
          </TouchableOpacity>
        ))}

        {vehicles.length === 0 && !loading && (
          <View className="items-center py-12">
            <Text style={{ color: theme.textMuted }}>No vehicles found</Text>
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
          <View style={{ backgroundColor: theme.surface }} className="rounded-2xl w-full max-w-sm p-4">
            <Text style={{ color: theme.text }} className="text-sm font-bold mb-1">Customer Name</Text>
            <TextInput
              style={{ color: theme.text, borderColor: theme.border }}
              className="border rounded-lg px-3 py-2 text-sm mb-3"
              placeholder="Enter Customer Name"
              placeholderTextColor={theme.textMuted}
              value={newCustomerName}
              onChangeText={setNewCustomerName}
            />

            <Text style={{ color: theme.text }} className="text-sm font-bold mb-1">Customer ID</Text>
            <TextInput
              style={{ color: theme.text, borderColor: theme.border }}
              className="border rounded-lg px-3 py-2 text-sm mb-3"
              placeholder="Enter Customer ID"
              placeholderTextColor={theme.textMuted}
              value={newCustomerId}
              onChangeText={setNewCustomerId}
            />

            <Text style={{ color: theme.text }} className="text-sm font-bold mb-1">Customer Mail</Text>
            <TextInput
              style={{ color: theme.text, borderColor: theme.border }}
              className="border rounded-lg px-3 py-2 text-sm mb-4"
              placeholder="Enter Customer Mail"
              placeholderTextColor={theme.textMuted}
              value={newCustomerMail}
              onChangeText={setNewCustomerMail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={{ backgroundColor: theme.surface, borderColor: theme.border }}
              className="border rounded-lg py-2 items-center self-end px-6 shadow-sm"
              onPress={handleAddVehicle}
              disabled={submitting}
            >
              <Text style={{ color: theme.text }} className="font-medium text-xs">
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
            style={{ backgroundColor: theme.surface }}
            className="absolute top-10 right-4 p-2 rounded-full"
            onPress={() => setIsAddModalVisible(false)}
          >
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </Modal>
    </View >
  );
}

