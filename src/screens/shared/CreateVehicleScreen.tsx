// ============================================
// CREATE VEHICLE SCREEN
// ============================================

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '@/context/ThemeContext';
import { useRole } from '@/hooks/useRole';
import { VehicleService } from '@/services/vehicle.service';
import { CustomerService } from '@/services/customer.service';
import { Customer } from '@/types';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';

export default function CreateVehicleScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { branchId } = useRole();
  const customerId = (route.params as { customerId?: string })?.customerId;

  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(customerId || '');
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    vin: '',
    license_plate: '',
    color: '',
    mileage: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!customerId) {
      loadCustomers();
    }
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await CustomerService.getAll({ branch_id: branchId });
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedCustomerId) {
      newErrors.customer = 'Customer is required';
    }

    if (!formData.make.trim()) {
      newErrors.make = 'Make is required';
    }

    if (!formData.model.trim()) {
      newErrors.model = 'Model is required';
    }

    if (formData.year && (isNaN(Number(formData.year)) || Number(formData.year) < 1900 || Number(formData.year) > new Date().getFullYear() + 1)) {
      newErrors.year = 'Invalid year';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      await VehicleService.create({
        customer_id: selectedCustomerId,
        make: formData.make,
        model: formData.model,
        year: formData.year ? Number(formData.year) : undefined,
        vin: formData.vin || undefined,
        license_plate: formData.license_plate || undefined,
        color: formData.color || undefined,
        mileage: formData.mileage ? Number(formData.mileage) : undefined,
        notes: formData.notes || undefined,
      }, branchId);

      Alert.alert('Success', 'Vehicle created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <ScrollView
        contentContainerClassName="px-6 py-4"
        style={{ flex: 1, backgroundColor: theme.background }}
        keyboardShouldPersistTaps="handled"
      >
        {!customerId && (
          <View className="mb-4">
            <Text style={{ color: theme.text }} className="text-sm font-medium mb-2">
              Customer *
            </Text>
            <Text style={{ color: theme.textMuted }} className="text-sm mb-2">
              Select customer (feature to be implemented)
            </Text>
            <Text className="text-red-500 text-sm">{errors.customer}</Text>
          </View>
        )}

        <Input
          label="Make *"
          placeholder="e.g., Toyota"
          value={formData.make}
          onChangeText={(text) => setFormData({ ...formData, make: text })}
          error={errors.make}
        />

        <Input
          label="Model *"
          placeholder="e.g., Camry"
          value={formData.model}
          onChangeText={(text) => setFormData({ ...formData, model: text })}
          error={errors.model}
        />

        <Input
          label="Year"
          placeholder="e.g., 2020"
          value={formData.year}
          onChangeText={(text) => setFormData({ ...formData, year: text })}
          keyboardType="numeric"
          error={errors.year}
        />

        <Input
          label="VIN"
          placeholder="Vehicle Identification Number"
          value={formData.vin}
          onChangeText={(text) => setFormData({ ...formData, vin: text })}
          error={errors.vin}
        />

        <Input
          label="License Plate"
          placeholder="License plate number"
          value={formData.license_plate}
          onChangeText={(text) => setFormData({ ...formData, license_plate: text })}
          error={errors.license_plate}
        />

        <Input
          label="Color"
          placeholder="Vehicle color"
          value={formData.color}
          onChangeText={(text) => setFormData({ ...formData, color: text })}
          error={errors.color}
        />

        <Input
          label="Mileage"
          placeholder="Current mileage"
          value={formData.mileage}
          onChangeText={(text) => setFormData({ ...formData, mileage: text })}
          keyboardType="numeric"
          error={errors.mileage}
        />

        <Input
          label="Notes"
          placeholder="Additional notes"
          value={formData.notes}
          onChangeText={(text) => setFormData({ ...formData, notes: text })}
          multiline
          numberOfLines={3}
          error={errors.notes}
        />

        <Button
          title="Create Vehicle"
          onPress={handleSubmit}
          loading={loading}
          className="mt-4"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

