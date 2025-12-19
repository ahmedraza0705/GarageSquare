// ============================================
// CREATE JOB CARD SCREEN
// ============================================

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { JobCardService } from '@/services/jobCard.service';
import { CustomerService } from '@/services/customer.service';
import { VehicleService } from '@/services/vehicle.service';
import { Customer, Vehicle, Priority } from '@/types';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';

export default function CreateJobCardScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { branchId } = useRole();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [formData, setFormData] = useState({
    description: '',
    priority: 'medium' as Priority,
    estimated_cost: '',
    estimated_time: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      loadVehicles();
    }
  }, [selectedCustomerId]);

  const loadCustomers = async () => {
    try {
      const data = await CustomerService.getAll({ branch_id: branchId });
      setCustomers(data);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadVehicles = async () => {
    try {
      const data = await VehicleService.getAll({ customer_id: selectedCustomerId });
      setVehicles(data);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedCustomerId) {
      newErrors.customer = 'Customer is required';
    }

    if (!selectedVehicleId) {
      newErrors.vehicle = 'Vehicle is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      await JobCardService.create({
        customer_id: selectedCustomerId,
        vehicle_id: selectedVehicleId,
        description: formData.description || undefined,
        priority: formData.priority,
        estimated_cost: formData.estimated_cost ? Number(formData.estimated_cost) : undefined,
        estimated_time: formData.estimated_time ? Number(formData.estimated_time) : undefined,
      }, user?.id || '', branchId || '');

      Alert.alert('Success', 'Job card created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create job card');
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
        <View className="mb-4">
          <Text style={{ color: theme.text }} className="text-sm font-medium mb-2">
            Customer *
          </Text>
          <Text style={{ color: theme.textMuted }} className="text-sm mb-2">
            Select customer (feature to be implemented)
          </Text>
          <Text className="text-red-500 text-sm">{errors.customer}</Text>
        </View>

        <View className="mb-4">
          <Text style={{ color: theme.text }} className="text-sm font-medium mb-2">
            Vehicle *
          </Text>
          <Text style={{ color: theme.textMuted }} className="text-sm mb-2">
            Select vehicle (feature to be implemented)
          </Text>
          <Text className="text-red-500 text-sm">{errors.vehicle}</Text>
        </View>

        <Input
          label="Description"
          placeholder="Job description"
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          multiline
          numberOfLines={4}
          error={errors.description}
        />

        <Input
          label="Estimated Cost"
          placeholder="Estimated cost in dollars"
          value={formData.estimated_cost}
          onChangeText={(text) => setFormData({ ...formData, estimated_cost: text })}
          keyboardType="decimal-pad"
          error={errors.estimated_cost}
        />

        <Input
          label="Estimated Time (minutes)"
          placeholder="Estimated time in minutes"
          value={formData.estimated_time}
          onChangeText={(text) => setFormData({ ...formData, estimated_time: text })}
          keyboardType="numeric"
          error={errors.estimated_time}
        />

        <Button
          title="Create Job Card"
          onPress={handleSubmit}
          loading={loading}
          className="mt-4"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

