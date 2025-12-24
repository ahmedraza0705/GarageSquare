// ============================================
// VEHICLE DETAIL SCREEN
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Image, Modal, TextInput, SafeAreaView, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { VehicleService } from '@/services/vehicle.service';
import { Vehicle, VehicleServiceItem } from '@/types';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

export default function VehicleDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { vehicleId, onUpdate } = route.params as { vehicleId: string; onUpdate?: (v: any) => void };
  // No need to extend Vehicle type locally anymore as it's updated in types
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const { themeName, toggleTheme } = useTheme();

  // Edit Modal State
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editBranch, setEditBranch] = useState('');
  const [editLastVisit, setEditLastVisit] = useState('');

  useEffect(() => {
    if (vehicle) {
      setEditBranch(vehicle.branch_name || 'Surat');
      setEditLastVisit(vehicle.last_visit || '20-08-2025');
    }
  }, [vehicle]);

  const handleOpenEdit = () => {
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (vehicle) {
      // Only update local state - don't save to database since columns don't exist
      const updatedVehicle = { ...vehicle, branch_name: editBranch, last_visit: editLastVisit };
      setVehicle(updatedVehicle);

      if (onUpdate) {
        onUpdate(updatedVehicle);
      }
    }
    setIsEditModalVisible(false);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Vehicle",
      "Are you sure you want to delete this vehicle?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (vehicle) {
              try {
                await VehicleService.delete(vehicle.id);
                navigation.goBack();
              } catch (error) {
                console.error("Error deleting vehicle:", error);
                Alert.alert("Error", "Failed to delete vehicle");
              }
            }
          }
        }
      ]
    );
  };



  useEffect(() => {
    // Hide default header to use our custom one
    navigation.setOptions({ headerShown: false });
    loadVehicle();
  }, []);

  const loadVehicle = async () => {
    try {
      setLoading(true);
      // Fetch from service (which returns our initialized mock data)
      const data = await VehicleService.getById(vehicleId || 'v1');
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
    <SafeAreaView className="flex-1 bg-[#EEF2F3]">
      <View className="flex-1 bg-[#EEF2F3]">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 bg-[#EEF2F3]">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900">Vehicle Details</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={handleDelete}
              className="bg-[#FCA5A5] w-10 h-10 items-center justify-center rounded-xl shadow-sm"
            >
              <Ionicons name="trash-outline" size={20} color="#991B1B" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleOpenEdit}
              className="bg-[#A7F3D0] w-10 h-10 items-center justify-center rounded-xl shadow-sm"
            >
              <Ionicons name="add" size={24} color="#065F46" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          className="flex-1 bg-[#EEF2F3] px-5"
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadVehicle} />
          }
        >
          {/* Car Image and Name Header */}
          <View className="flex-row items-center gap-1 py-5 px-1 mt-1 mb-4">
            <View>
              <FontAwesome5 name="car-alt" size={100} color="black" style={{ marginLeft: 30, marginRight: 10 }} />
            </View>
            <View>
              <View>
                <Text className="text-2xl font-bold text-gray-900 leading-tight">
                  {vehicle.brand} {vehicle.model}
                </Text>
                <View className="h-[2px] bg-[#979797] w-full mt-0.5" />
              </View>
              <Text className="text-base text-gray-500 font-bold mt-1">
                {vehicle.license_plate}
              </Text>
            </View>
          </View>

          {/* Information Cards */}
          <View className="bg-white rounded-full py-2.5 px-6 mb-3 shadow-sm flex-row items-center gap-1">
            <View className="w-8 items-center justify-center">
              <MaterialCommunityIcons name="account-outline" size={28} color="black" />
            </View>
            <View className="ml-2">
              <Text className="text-xs text-gray-400 font-bold tracking-widest mb-1">Customer Name</Text>
              <Text className="text-xl font-bold text-gray-900">{vehicle.customer?.full_name}</Text>
            </View>
          </View>

          <View className="bg-white rounded-full py-2.5 px-6 mb-3 shadow-sm flex-row items-center gap-1">
            <View className="w-8 items-center justify-center">
              <Ionicons name="call" size={24} color="black" />
            </View>
            <View className="ml-2">
              <Text className="text-xs text-gray-400 font-bold tracking-widest mb-1">Phone Number</Text>
              <Text className="text-xl font-bold text-gray-900">91 9033786017</Text>
            </View>
          </View>

          <View className="bg-white rounded-full py-2.5 px-6 mb-3 shadow-sm flex-row items-center gap-1">
            <View className="w-8 items-center justify-center">
              <Ionicons name="location" size={26} color="black" />
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-xs text-gray-400 font-bold tracking-widest mb-1">Address</Text>
              <Text className="text-lg font-bold text-gray-900 leading-tight">1234 Boulevard Street, Adajan, Surat</Text>
            </View>
          </View>

          {/* Vehicle Info Row */}
          {/* Vehicle Info Row */}
          <View className="flex-row gap-2 mb-4">
            <View className="flex-1 bg-white rounded-[40px] py-2.5 px-5 shadow-sm flex-row items-center gap-1">
              <View className="w-8 items-center"><MaterialCommunityIcons name="office-building" size={24} color="black" /></View>
              <View>
                <Text className="text-[10px] text-gray-400 font-bold tracking-widest mb-0.5">Branch</Text>
                <Text className="text-base font-bold text-gray-900">{vehicle.branch_name || 'Surat'}</Text>
              </View>
            </View>
            <View className="flex-1 bg-white rounded-[40px] py-2.5 px-5 shadow-sm flex-row items-center gap-1">
              <View className="w-8 items-center"><Ionicons name="calendar" size={24} color="black" /></View>
              <View>
                <Text className="text-[10px] text-gray-400 font-bold tracking-widest mb-0.5">Last Visit</Text>
                <Text className="text-base font-bold text-gray-900">{vehicle.last_visit || '20-08-2025'}</Text>
              </View>
            </View>
          </View>

          {/* Odometer */}
          <View className="bg-white rounded-full py-2.5 px-6 mb-8 shadow-sm flex-row items-center gap-1">
            <View className="w-8 items-center justify-center">
              <MaterialCommunityIcons name="clipboard-text-outline" size={26} color="black" />
            </View>
            <View className="ml-2">
              <Text className="text-xs text-gray-400 font-bold tracking-widest mb-1">Last Odometer Reading</Text>
              <Text className="text-xl font-bold text-gray-900">{vehicle.odometer?.toLocaleString() || '0'} KM</Text>
            </View>
          </View>
        </ScrollView>

        {/* Edit Modal */}
        <Modal
          visible={isEditModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsEditModalVisible(false)}
        >
          <View className="flex-1 bg-black/50 items-center justify-center px-4">
            <View className="bg-white p-6 rounded-2xl w-full shadow-lg">
              <Text className="text-xl font-bold text-gray-900 mb-4">Edit Details</Text>

              <View className="mb-4">
                <Text className="text-sm font-bold text-gray-700 mb-2">Branch</Text>
                <TextInput
                  value={editBranch}
                  onChangeText={setEditBranch}
                  className="bg-gray-100 p-3 rounded-lg text-gray-900"
                  placeholder="Enter Branch Name"
                />
              </View>

              <View className="mb-6">
                <Text className="text-sm font-bold text-gray-700 mb-2">Last Visit</Text>
                <TextInput
                  value={editLastVisit}
                  onChangeText={setEditLastVisit}
                  className="bg-gray-100 p-3 rounded-lg text-gray-900"
                  placeholder="DD-MM-YYYY"
                />
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setIsEditModalVisible(false)}
                  className="flex-1 bg-gray-200 p-3 rounded-xl items-center"
                >
                  <Text className="text-gray-700 font-bold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveEdit}
                  className="flex-1 bg-[#A7F3D0] p-3 rounded-xl items-center"
                >
                  <Text className="text-[#065F46] font-bold">Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

