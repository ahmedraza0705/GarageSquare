// ============================================
// VEHICLES SCREEN (Company Admin)
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput, Modal, ActivityIndicator } from 'react-native';
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
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadVehicles} tintColor={theme.primary} />
        }
      >
        <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
          {/* Search Bar and Add Button */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <View style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.surface,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginRight: 12,
              borderWidth: 1,
              borderColor: theme.border
            }}>
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                placeholder="Search Vehicle"
                style={{ flex: 1, marginLeft: 8, color: theme.text, fontWeight: '500' }}
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
              />
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: 'rgba(53, 197, 106, 0.4)',
                padding: 12,
                borderRadius: 12,
                width: 48,
                height: 48,
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#35C56A'
              }}
              onPress={() => setIsAddModalVisible(true)}
            >
              <Ionicons name="add" size={24} color="#000000" />
            </TouchableOpacity>
          </View>

          {loading && (
            <View style={{ paddingVertical: 48, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={theme.primary} />
            </View>
          )}

          {!loading && vehicles.map((vehicle) => (
            <TouchableOpacity
              key={vehicle.id}
              style={{
                backgroundColor: theme.surface,
                borderRadius: 16,
                padding: 16,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: theme.border
              }}
              onPress={() => (navigation.navigate as any)('VehicleDetail', { vehicleId: vehicle.id })}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="car-sport" size={24} color={theme.primary} />
                  <Text style={{ color: theme.text, fontSize: 18, fontWeight: 'bold' }}>{vehicle.make} {vehicle.model}</Text>
                </View>
                <View style={{ backgroundColor: theme.primary + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                  <Text style={{ color: theme.text, fontSize: 13, fontWeight: 'bold' }}>{vehicle.license_plate}</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="person" size={16} color={theme.textMuted} />
                  <Text style={{ color: theme.textMuted, fontSize: 13 }}>Customer : </Text>
                </View>
                <Text style={{ color: theme.text, fontSize: 13, fontWeight: 'bold' }}>{vehicle.customer?.full_name}</Text>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <MaterialCommunityIcons name="office-building" size={16} color={theme.textMuted} />
                  <Text style={{ color: theme.textMuted, fontSize: 13 }}>Branch : </Text>
                </View>
                <Text style={{ color: theme.text, fontSize: 13, fontWeight: 'bold' }}>Surat , Gujarat</Text>
              </View>
            </TouchableOpacity>
          ))}

          {vehicles.length === 0 && !loading && (
            <View style={{ alignItems: 'center', paddingVertical: 48 }}>
              <Text style={{ color: theme.textMuted }}>No vehicles found</Text>
            </View>
          )}
        </View>
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

