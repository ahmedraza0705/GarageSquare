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
  const { theme, themeName, toggleTheme } = useTheme();

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
      <View style={{ flex: 1, backgroundColor: theme.background }} className="items-center justify-center">
        <Text style={{ color: theme.textMuted }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Header */}
      <View style={{ backgroundColor: theme.headerBg, borderBottomColor: 'transparent' }} className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.headerText} />
          </TouchableOpacity>
          <Text style={{ color: theme.headerText }} className="text-lg font-bold">Vehicle Details</Text>
        </View>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={toggleTheme}>
            <View style={{ backgroundColor: theme.surfaceAlt }} className="p-1 rounded-full w-8 h-8 items-center justify-center">
              <Ionicons name={themeName === 'dark' ? 'sunny' : 'moon'} size={16} color={theme.headerText} />
            </View>
          </TouchableOpacity>
          <View className="bg-red-300 w-8 h-8 rounded-lg items-center justify-center">
            <Text className="text-red-800 font-bold">A</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: theme.background }}
        className="px-4"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadVehicle} tintColor={theme.primary} />
        }
      >
        {/* Car Image and Name */}
        <View className="flex-row items-center justify-center gap-4 py-6">
          <FontAwesome5 name="car-alt" size={48} color={theme.text} />
          <Text style={{ color: theme.text }} className="text-2xl font-bold">{vehicle.make} {vehicle.model}</Text>
        </View>

        {/* Customer Info Card */}
        <View style={{ backgroundColor: theme.surface }} className="rounded-md py-1.5 px-2 mb-4 flex-row items-center gap-2">
          <View className="w-8 items-center"><Ionicons name="mail" size={20} color={theme.textMuted} /></View>
          <View>
            <Text style={{ color: theme.textMuted }} className="text-xs font-medium mb-1">Customer Name</Text>
            <Text style={{ color: theme.text }} className="text-sm font-bold">{vehicle.customer?.full_name}</Text>
          </View>
        </View>

        <View style={{ backgroundColor: theme.surface }} className="rounded-md py-1.5 px-2 mb-4 flex-row items-center gap-2">
          <View className="w-8 items-center"><Ionicons name="call-outline" size={20} color={theme.textMuted} /></View>
          <View>
            <Text style={{ color: theme.textMuted }} className="text-xs font-medium mb-1">Phone Number</Text>
            <Text style={{ color: theme.text }} className="text-sm font-bold">91 9033786017</Text>
          </View>
        </View>

        <View style={{ backgroundColor: theme.surface }} className="rounded-md py-1.5 px-2 mb-4 flex-row items-center gap-2">
          <View className="w-8 items-center"><Ionicons name="location-outline" size={20} color={theme.textMuted} /></View>
          <View>
            <Text style={{ color: theme.textMuted }} className="text-xs font-medium mb-1">Address</Text>
            <Text style={{ color: theme.text }} className="text-sm font-bold">1234 Boulevard Street, Adajan, Surat</Text>
          </View>
        </View>

        <View className="flex-row gap-2 mb-4">
          <View style={{ backgroundColor: theme.surface }} className="flex-1 rounded-md py-1.5 px-2 flex-row items-center gap-2">
            <View className="w-8 items-center"><Ionicons name="car-sport-outline" size={20} color={theme.textMuted} /></View>
            <View>
              <Text style={{ color: theme.textMuted }} className="text-xs font-medium mb-1">Vehicle Id</Text>
              <Text style={{ color: theme.text }} className="text-sm font-bold">{vehicle.license_plate}</Text>
            </View>
          </View>
          <View style={{ backgroundColor: theme.surface }} className="flex-1 rounded-md py-1.5 px-2 flex-row items-center gap-2">
            <View className="w-8 items-center"><Ionicons name="calendar-outline" size={20} color={theme.textMuted} /></View>
            <View>
              <Text style={{ color: theme.textMuted }} className="text-xs font-medium mb-1">Last Visit</Text>
              <Text style={{ color: theme.text }} className="text-sm font-bold">13-8-2025</Text>
            </View>
          </View>
        </View>

        {/* Odometer */}
        <View style={{ backgroundColor: theme.surface }} className="rounded-md py-1.5 px-2 mb-4 flex-row items-center gap-2">
          <View className="w-8 items-center"><FontAwesome5 name="clipboard-list" size={20} color={theme.textMuted} /></View>
          <View>
            <Text style={{ color: theme.textMuted }} className="text-xs font-medium mb-1">Last odometer reading</Text>
            <Text style={{ color: theme.text }} className="text-sm font-bold">{vehicle.mileage?.toLocaleString() || '0'}</Text>
          </View>
        </View>

        {/* Services List */}
        {/* Services List */}
        <View className="mb-32">
          {vehicle.services?.map((service) => {
            const style = getStatusColor(service.status);
            return (
              <View key={service.id} style={{ backgroundColor: theme.surface }} className="rounded-md p-2 mb-2">
                <View className="flex-row justify-between items-start mb-0.5">
                  <Text style={{ color: theme.text }} className="text-sm font-bold">{service.name}</Text>
                  <View className={`${style.bg} px-1.5 py-0.5 rounded text-center`}>
                    <Text className={`text-[9px] font-bold ${style.text} uppercase`}>{style.label}</Text>
                  </View>
                </View>
                <Text style={{ color: theme.textMuted }} className="text-xs mb-0.5">Assigned: {service.assigned_to || 'Unassigned'}</Text>
                <View className="flex-row justify-between items-center mt-1">
                  <Text style={{ color: theme.textMuted }} className="text-xs">Estimate: {service.estimate}</Text>
                  <TouchableOpacity
                    onPress={() => updateServiceStatus(service.id, service.status)}
                    style={{ backgroundColor: service.status === 'completed' ? theme.surfaceAlt : 'transparent' }}
                    className="px-2 py-0.5 rounded"
                  >
                    <Text style={{ color: theme.textMuted }} className="text-[10px] font-medium">{style.btnLabel}</Text>
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
          style={{ backgroundColor: themeName === 'dark' ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7', borderColor: themeName === 'dark' ? 'rgba(34, 197, 94, 0.3)' : '#bbf7d0' }}
          className="w-12 h-12 rounded-lg items-center justify-center border shadow-sm"
          onPress={() => setIsAddServiceModalVisible(true)}
        >
          <Ionicons name="add" size={28} color="#15803d" />
        </TouchableOpacity>

        {/* Delivery Button */}
        <TouchableOpacity
          style={{ backgroundColor: isDelivered ? theme.primary : theme.surface, borderColor: isDelivered ? theme.primary : theme.border }}
          className="px-4 h-12 rounded-lg items-center justify-center border shadow-sm"
          onPress={() => setIsDelivered(!isDelivered)}
        >
          <Text style={{ color: isDelivered ? '#fff' : theme.text }} className="font-bold">delivery</Text>
        </TouchableOpacity>

        {/* Tech Manager Button */}
        <View style={{ backgroundColor: theme.surface, borderColor: theme.border }} className="flex-1 h-12 rounded-lg border flex-row items-center px-3 shadow-sm justify-between">
          <Text style={{ color: theme.text }} className="text-xs font-bold">Technician Manager :</Text>
          <View className="rounded px-2 py-0.5">
            <Text style={{ color: theme.textMuted }} className="text-[10px]">Not Done</Text>
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
          <View style={{ backgroundColor: theme.surface }} className="w-full rounded-2xl p-5">
            <Text style={{ color: theme.text }} className="text-lg font-bold mb-4">Add Service</Text>

            <View className="flex-row flex-wrap mb-4">
              {predefinedServices.map(service => (
                <TouchableOpacity
                  key={service}
                  className="flex-row items-center w-1/2 mb-3"
                  onPress={() => handleToggleService(service)}
                >
                  <View style={{ borderColor: theme.border, backgroundColor: selectedServices.includes(service) ? theme.primary : 'transparent' }} className="w-4 h-4 border rounded mr-2 items-center justify-center">
                    {selectedServices.includes(service) && <Ionicons name="checkmark" size={12} color="white" />}
                  </View>
                  <Text style={{ color: theme.text }} className="text-xs">{service}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="flex-row gap-2 mb-4">
              <View style={{ borderColor: theme.border }} className="border rounded px-2 py-1 items-center justify-center">
                <Text style={{ color: theme.textMuted }} className="text-xs">Others</Text>
              </View>
              <TextInput
                style={{ color: theme.text, borderColor: theme.border }}
                className="flex-1 border rounded px-3 py-1 text-xs"
                placeholder="Enter other requirement"
                placeholderTextColor={theme.textMuted}
                value={otherService}
                onChangeText={setOtherService}
              />
            </View>

            <TouchableOpacity
              style={{ borderColor: theme.border }}
              className="self-end border rounded px-6 py-2"
              onPress={handleAddServices}
            >
              <Text style={{ color: theme.text }} className="font-bold text-sm">Add</Text>
            </TouchableOpacity>
          </View>
          {/* Tap background to close */}
          <TouchableOpacity
            style={{ backgroundColor: theme.surfaceAlt }}
            className="absolute top-10 right-4 p-2 rounded-full"
            onPress={() => setIsAddServiceModalVisible(false)}
          >
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
      </Modal>

    </View>
  );
}

