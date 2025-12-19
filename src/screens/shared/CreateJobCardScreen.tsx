// ============================================
// CREATE JOB CARD SCREEN
// ============================================

import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useJobs } from '@/context/JobContext';
import { Feather } from '@expo/vector-icons'; // Assuming expo vector icons are available, standard in expo
// If not, I'll use standard Text for icons or existing components.

export default function CreateJobCardScreen() {
  const navigation = useNavigation();
  const { addJob } = useJobs();

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    vin: '',
    brand: '',
    model: '',
    odometer: '',
    pickupAddress: '',
    dropoffAddress: '',
  });

  const [services, setServices] = useState({
    engineInspection: false,
    oilChange: false,
    tiresChange: false,
    bodyPaint: false,
    acRepair: false,
    alignment: false,
    replaceBattery: false,
    coolentChange: false,
  });

  const [otherRequirement, setOtherRequirement] = useState('');
  const [otherRequirementsList, setOtherRequirementsList] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleService = (key: keyof typeof services) => {
    setServices(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const addOtherRequirement = () => {
    if (otherRequirement.trim()) {
      setOtherRequirementsList(prev => [...prev, otherRequirement.trim()]);
      setOtherRequirement('');
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.customerName) newErrors.customerName = 'Required';
    if (!formData.phone) newErrors.phone = 'Required';
    if (!formData.email) newErrors.email = 'Required';
    if (!formData.vin) newErrors.vin = 'Required';
    if (!formData.brand) newErrors.brand = 'Required';
    if (!formData.model) newErrors.model = 'Required';
    if (!formData.odometer) newErrors.odometer = 'Required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    const selectedServices = Object.entries(services)
      .filter(([_, selected]) => selected)
      .map(([name]) => name.replace(/([A-Z])/g, ' $1').trim()); // CamelCase to space

    addJob({
      customer: formData.customerName,
      phone: formData.phone,
      email: formData.email,
      vin: formData.vin,
      brand: formData.brand,
      model: formData.model,
      odometer: formData.odometer,
      pickupAddress: formData.pickupAddress,
      dropoffAddress: formData.dropoffAddress,
      vehicle: `${formData.brand} ${formData.model}`,
      regNo: formData.vin, // Using VIN as RegNo for now as it's the unique ID available
      services: [...selectedServices, ...otherRequirementsList],
      amount: '₹0',
    });

    navigation.goBack();
  };

  const renderInput = (
    label: string,
    value: string,
    field: keyof typeof formData,
    placeholder: string,
    required = false
  ) => (
    <View className="mb-4">
      <Text className="text-sm font-semibold text-gray-800 mb-1.5">
        {label}{required && '*'}
      </Text>
      <TextInput
        className={`w-full bg-white border ${errors[field] ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2.5 text-gray-800`}
        placeholder={placeholder}
        value={value}
        onChangeText={(text) => setFormData({ ...formData, [field]: text })}
        placeholderTextColor="#9ca3af"
      />
    </View>
  );

  const renderCheckbox = (label: string, field: keyof typeof services) => (
    <TouchableOpacity
      onPress={() => toggleService(field)}
      className="flex-row items-center mb-3 w-[48%]"
    >
      <View className={`w-5 h-5 border rounded mr-2 items-center justify-center ${services[field] ? 'bg-blue-500 border-blue-500' : 'border-gray-400 bg-white'}`}>
        {services[field] && <Text className="text-white text-xs">✓</Text>}
      </View>
      <Text className="text-gray-700 text-sm">{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200 safe-top">
        {/* Hamburger menu would be here usually, handled by nav drawer but we can just show title */}
        {/* <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
             <Feather name="menu" size={24} color="#374151" />
         </TouchableOpacity> */}
        {/* Design shows simple header */}
        <Text className="text-lg font-bold text-gray-900">Active Jobs</Text>
        <View className="flex-row gap-2">
          <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center">
            <Text className="text-blue-600 font-bold">☾</Text>
          </View>
          <View className="w-8 h-8 rounded-full bg-red-200 items-center justify-center">
            <Text className="text-red-600 font-bold">A</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerClassName="p-4 pb-24">
        <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">

          {renderInput('Customer', formData.customerName, 'customerName', 'Enter Customer Name', true)}
          {renderInput('Phone', formData.phone, 'phone', 'Enter Phone', true)}
          {renderInput('Email', formData.email, 'email', 'Enter Your Email', true)}
          {renderInput('VIN', formData.vin, 'vin', 'Enter VIN', true)}
          {renderInput('Vehicle Brand', formData.brand, 'brand', 'Select Vehicle Brand', true)}
          {renderInput('Vehicle Model', formData.model, 'model', 'Select Vehicle Model', true)}
          {renderInput('Odometer Reading', formData.odometer, 'odometer', 'Select Vehicle Modal', true)}
          {renderInput('Pick-up Address', formData.pickupAddress, 'pickupAddress', 'Pick-up Address')}
          {renderInput('Drop-off Address', formData.dropoffAddress, 'dropoffAddress', 'Drop-off Address')}

          <View className="mt-2 flex-row flex-wrap justify-between">
            {renderCheckbox('Engine Inspection', 'engineInspection')}
            {renderCheckbox('AC repair', 'acRepair')}
            {renderCheckbox('Engine oil change', 'oilChange')}
            {renderCheckbox('Alignment', 'alignment')}
            {renderCheckbox('Tires Change', 'tiresChange')}
            {renderCheckbox('Replace Battery', 'replaceBattery')}
            {renderCheckbox('Body Paint', 'bodyPaint')}
            {renderCheckbox('Coolent Change', 'coolentChange')}
          </View>

          <View className="mt-4 flex-row items-center gap-2">
            <View className="px-3 py-2 bg-gray-100 rounded-lg border border-gray-200">
              <Text className="text-gray-600">Others</Text>
            </View>
            <TextInput
              className="flex-1 bg-white border border-gray-300 rounded-full px-4 py-2 text-sm"
              placeholder="Enter other requirement"
              value={otherRequirement}
              onChangeText={setOtherRequirement}
            />
            <TouchableOpacity
              onPress={handleSubmit}
              className="bg-white px-4 py-2 rounded-full border border-gray-800"
            >
              <Text className="text-gray-900 font-semibold text-sm">Add</Text>
            </TouchableOpacity>
          </View>

          {/* List of added other requirements */}
          {otherRequirementsList.length > 0 && (
            <View className="mt-2 flex-row flex-wrap gap-2">
              {otherRequirementsList.map((req, index) => (
                <View key={index} className="bg-gray-100 px-2 py-1 rounded border border-gray-200">
                  <Text className="text-xs text-gray-600">{req}</Text>
                </View>
              ))}
            </View>
          )}

        </View>
      </ScrollView>

    </View>
  );
}
