// ============================================
// VEHICLE DETAIL SCREEN
// ============================================

import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Image, Modal, TextInput } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { VehicleService } from '@/services/vehicle.service';
import { Vehicle, VehicleServiceItem } from '@/types';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';

export default function VehicleDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { vehicleId } = route.params as { vehicleId: string };
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const { themeName, toggleTheme } = useTheme();

  // "Delivery" button state
  const [isDelivered, setIsDelivered] = useState(false);

  // Add Service Modal state
  const [isAddServiceModalVisible, setIsAddServiceModalVisible] = useState(false);
  const [otherService, setOtherService] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const predefinedServices = [
    'Engine Inspection', 'AC repair',
    'Engine oil change', 'Alignment',
    'Tires Change', 'Replace Battery',
    'Body Paint', 'Coolen Change'
  ];

  useEffect(() => {
    // Hide default header to use our custom one
    navigation.setOptions({ headerShown: false });
    loadVehicle();
  }, []);

  const loadVehicle = async () => {
    try {
      setLoading(true);
      const data = await VehicleService.getById(vehicleId);
      setVehicle(data);
    } catch (error) {
      console.error('Error loading vehicle:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleService = (service: string) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter(s => s !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const handleAddServices = async () => {
    if (selectedServices.length === 0 && !otherService) return;

    try {
      setLoading(true);
      // Add selected predefined services
      for (const service of selectedServices) {
        await VehicleService.addService(vehicleId, service, '30 min');
      }
      // Add other service
      if (otherService) {
        await VehicleService.addService(vehicleId, otherService, 'TBD');
      }

      setIsAddServiceModalVisible(false);
      setOtherService('');
      setSelectedServices([]);
      loadVehicle(); // Refresh data
    } catch (error) {
      console.error('Error adding services', error);
    } finally {
      setLoading(false);
    }
  };

  const updateServiceStatus = async (serviceId: string, currentStatus: string) => {
    // Simple toggle for demo: Pending -> Completed
    if (currentStatus === 'completed') return;
    try {
      await VehicleService.updateServiceStatus(vehicleId, serviceId, 'completed');
      loadVehicle();
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return { text: 'text-green-600', bg: 'bg-green-100', label: 'Complete', btnLabel: 'done' };
      case 'pending': return { text: 'text-slate-500', bg: 'bg-slate-200', label: 'PENDING', btnLabel: 'Mark done' };
      case 'need_approval': return { text: 'text-orange-500', bg: 'bg-orange-100', label: 'Need Approval', btnLabel: 'Need Approval' };
      case 'rejected': return { text: 'text-red-500', bg: 'bg-red-100', label: 'Rejected', btnLabel: 'Rejected' };
      default: return { text: 'text-slate-500', bg: 'bg-slate-200', label: 'Pending', btnLabel: 'Mark done' };
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
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-gray-50">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900">Vehicle Details</Text>
        </View>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={toggleTheme}>
            <View className="bg-blue-200 p-1 rounded-full w-8 h-8 items-center justify-center">
              <Ionicons name={themeName === 'dark' ? 'sunny' : 'moon'} size={16} color="#000" />
            </View>
          </TouchableOpacity>
          <View className="bg-red-300 w-8 h-8 rounded-lg items-center justify-center">
            <Text className="text-red-800 font-bold">A</Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 bg-gray-50 px-4"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadVehicle} />
        }
      >
        {/* Car Image and Name */}
        <View className="flex-row items-center justify-center gap-4 py-6">
          <FontAwesome5 name="car-alt" size={48} color="black" />
          <Text className="text-2xl font-bold text-gray-900">{vehicle.make} {vehicle.model}</Text>
        </View>

        {/* Customer Info Card */}
        <View className="bg-white rounded-md py-1.5 px-2 mb-4 border border-gray-400 flex-row items-center gap-2">
          <View className="w-8 items-center"><Ionicons name="mail" size={20} color="#374151" /></View>
          <View>
            <Text className="text-xs text-gray-500 font-medium mb-1">Customer Name</Text>
            <Text className="text-sm font-bold text-gray-900">{vehicle.customer?.full_name}</Text>
          </View>
        </View>

        <View className="bg-white rounded-md py-1.5 px-2 mb-4 border border-gray-400 flex-row items-center gap-2">
          <View className="w-8 items-center"><Ionicons name="call-outline" size={20} color="#374151" /></View>
          <View>
            <Text className="text-xs text-gray-500 font-medium mb-1">Phone Number</Text>
            <Text className="text-sm font-bold text-gray-900">91 9033786017</Text>
          </View>
        </View>

        <View className="bg-white rounded-md py-1.5 px-2 mb-4 border border-gray-400 flex-row items-center gap-2">
          <View className="w-8 items-center"><Ionicons name="location-outline" size={20} color="#374151" /></View>
          <View>
            <Text className="text-xs text-gray-500 font-medium mb-1">Address</Text>
            <Text className="text-sm font-bold text-gray-900">1234 Boulevard Street, Adajan, Surat</Text>
          </View>
        </View>

        {/* Vehicle Info Row */}
        <View className="flex-row gap-2 mb-4">
          <View className="flex-1 bg-white rounded-md py-1.5 px-2 border border-gray-400 flex-row items-center gap-2">
            <View className="w-8 items-center"><Ionicons name="car-sport-outline" size={20} color="#374151" /></View>
            <View>
              <Text className="text-xs text-gray-500 font-medium mb-1">Vehicle Id</Text>
              <Text className="text-sm font-bold text-gray-900">{vehicle.license_plate}</Text>
            </View>
          </View>
          <View className="flex-1 bg-white rounded-md py-1.5 px-2 border border-gray-400 flex-row items-center gap-2">
            <View className="w-8 items-center"><Ionicons name="calendar-outline" size={20} color="#374151" /></View>
            <View>
              <Text className="text-xs text-gray-500 font-medium mb-1">Last Visit</Text>
              <Text className="text-sm font-bold text-gray-900">13-8-2025</Text>
            </View>
          </View>
        </View>

        {/* Odometer */}
        <View className="bg-white rounded-md py-1.5 px-2 mb-4 border border-gray-400 flex-row items-center gap-2">
          <View className="w-8 items-center"><FontAwesome5 name="clipboard-list" size={20} color="#374151" /></View>
          <View>
            <Text className="text-xs text-gray-500 font-medium mb-1">Last odometer reading</Text>
            <Text className="text-sm font-bold text-gray-900">{vehicle.mileage?.toLocaleString() || '0'}</Text>
          </View>
        </View>

        {/* Services List */}
        {/* Services List */}
        <View className="mb-32">
          {vehicle.services?.map((service) => {
            const style = getStatusColor(service.status);
            return (
              <View key={service.id} className="bg-white rounded-md p-2 mb-2 border border-gray-400">
                <View className="flex-row justify-between items-start mb-0.5">
                  <Text className="text-sm font-bold text-gray-900">{service.name}</Text>
                  <View className={`${style.bg} px-1.5 py-0.5 rounded text-center`}>
                    <Text className={`text-[9px] font-bold ${style.text} uppercase`}>{style.label}</Text>
                  </View>
                </View>
                <Text className="text-xs text-gray-700 mb-0.5">Assigned: {service.assigned_to || 'Unassigned'}</Text>
                <View className="flex-row justify-between items-center mt-1">
                  <Text className="text-xs text-gray-700">Estimate: {service.estimate}</Text>
                  <TouchableOpacity
                    onPress={() => updateServiceStatus(service.id, service.status)}
                    className={`px-2 py-0.5 rounded border border-gray-400 ${service.status === 'completed' ? 'bg-gray-100' : 'bg-transparent'}`}
                  >
                    <Text className="text-[10px] text-gray-600 font-medium">{style.btnLabel}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View className="absolute bottom-4 left-4 right-4 flex-row items-center gap-2">
        {/* Add Service Button */}
        <TouchableOpacity
          className="bg-green-200 w-12 h-12 rounded-lg items-center justify-center border border-green-300 shadow-sm"
          onPress={() => setIsAddServiceModalVisible(true)}
        >
          <Ionicons name="add" size={28} color="#15803d" />
        </TouchableOpacity>

        {/* Delivery Button */}
        <TouchableOpacity
          className={`px-4 h-12 rounded-lg items-center justify-center border border-gray-300 shadow-sm ${isDelivered ? 'bg-blue-500' : 'bg-white'}`}
          onPress={() => setIsDelivered(!isDelivered)}
        >
          <Text className={`font-bold ${isDelivered ? 'text-white' : 'text-gray-900'}`}>delivery</Text>
        </TouchableOpacity>

        {/* Tech Manager Button */}
        <View className="flex-1 bg-white h-12 rounded-lg flex-row items-center px-3 border border-gray-300 shadow-sm justify-between">
          <Text className="text-xs font-bold text-gray-900">Technician Manager :</Text>
          <View className="border border-gray-400 rounded px-2 py-0.5">
            <Text className="text-[10px] text-gray-500">Not Done</Text>
          </View>
        </View>
      </View>


      {/* Add Services Modal */}
      <Modal
        visible={isAddServiceModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsAddServiceModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-8">
          <View className="bg-white w-full rounded-2xl p-5">
            <Text className="text-lg font-bold text-gray-900 mb-4">Add Service</Text>

            <View className="flex-row flex-wrap mb-4">
              {predefinedServices.map(service => (
                <TouchableOpacity
                  key={service}
                  className="flex-row items-center w-1/2 mb-3"
                  onPress={() => handleToggleService(service)}
                >
                  <View className={`w-4 h-4 border border-gray-400 rounded mr-2 items-center justify-center ${selectedServices.includes(service) ? 'bg-blue-500 border-blue-500' : 'bg-white'}`}>
                    {selectedServices.includes(service) && <Ionicons name="checkmark" size={12} color="white" />}
                  </View>
                  <Text className="text-xs text-gray-700">{service}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="flex-row gap-2 mb-4">
              <View className="border border-gray-300 rounded px-2 py-1 items-center justify-center">
                <Text className="text-xs text-gray-600">Others</Text>
              </View>
              <TextInput
                className="flex-1 border border-gray-300 rounded px-3 py-1 text-xs"
                placeholder="Enter other requirement"
                value={otherService}
                onChangeText={setOtherService}
              />
            </View>

            <TouchableOpacity
              className="self-end border border-gray-300 rounded px-6 py-2"
              onPress={handleAddServices}
            >
              <Text className="text-gray-900 font-bold text-sm">Add</Text>
            </TouchableOpacity>
          </View>
          {/* Tap background to close */}
          <TouchableOpacity
            className="absolute top-10 right-4 p-2 bg-white rounded-full"
            onPress={() => setIsAddServiceModalVisible(false)}
          >
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </Modal>

    </View>
  );
}

